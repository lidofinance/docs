#!/usr/bin/env node
// Walks markdown files, finds every Safe multisig with a recorded `Quorum`
// (either as a `Quorum` table column or an inline `**Quorum:** M/N` line next
// to a Safe address), reads the multisig's threshold and owner count directly
// from the contract via JSON-RPC, and rewrites cells where the doc value
// drifted from the on-chain value.
//
//   node scripts/fetch-msig-quorums.js

const fs = require('fs');
const path = require('path');
const {
  parseMode,
  readLock,
  reconcileFile,
  stableJson,
  writeAtomic,
} = require('./lib/external-content');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const DOC_DIRS = ['docs', 'earn', 'run-on-lido'];

// Safe URL chain prefix → ordered list of public JSON-RPC endpoints. Each is
// tried in turn on transient failures (5xx/4xx/network).
const CHAIN_RPCS = {
  eth:      ['https://eth.drpc.org', 'https://public.1rpc.io/eth', 'https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com'],
  base:     ['https://base.drpc.org', 'https://base-rpc.publicnode.com', 'https://base.llamarpc.com', 'https://mainnet.base.org'],
  arb1:     ['https://arbitrum.drpc.org', 'https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc'],
  oeth:     ['https://optimism.drpc.org', 'https://optimism-rpc.publicnode.com', 'https://mainnet.optimism.io'],
  matic:    ['https://polygon.drpc.org', 'https://polygon-bor-rpc.publicnode.com', 'https://polygon-rpc.com'],
  bnb:      ['https://bsc.drpc.org', 'https://bsc-rpc.publicnode.com', 'https://binance.llamarpc.com', 'https://bsc-dataseed-public.bnbchain.org'],
  zksync:   ['https://zksync.drpc.org', 'https://mainnet.era.zksync.io'],
  gno:      ['https://gnosis.drpc.org', 'https://gnosis-rpc.publicnode.com', 'https://rpc.gnosischain.com'],
  avax:     ['https://avalanche.drpc.org', 'https://avalanche-c-chain-rpc.publicnode.com'],
  celo:     ['https://celo.drpc.org', 'https://forno.celo.org'],
  scr:      ['https://scroll.drpc.org', 'https://scroll-rpc.publicnode.com', 'https://rpc.scroll.io', 'https://public.1rpc.io/scroll'],
  linea:    ['https://linea.drpc.org', 'https://rpc.linea.build'],
  mnt:      ['https://mantle.drpc.org', 'https://rpc.mantle.xyz'],
  mantle:   ['https://mantle.drpc.org', 'https://rpc.mantle.xyz'],
  unichain: ['https://unichain.drpc.org', 'https://mainnet.unichain.org'],
  ink:      ['https://ink.drpc.org', 'https://rpc-gel.inkonchain.com'],
  lisk:     ['https://lisk.drpc.org', 'https://rpc.api.lisk.com'],
  mode:     ['https://mainnet.mode.network', 'https://34443.rpc.thirdweb.com', 'https://mode.drpc.org', 'https://1rpc.io/mode'],
  soneium:  ['https://soneium.drpc.org', 'https://rpc.soneium.org'],
  plasma:   ['https://plasma.drpc.org', 'https://rpc.plasma.to'],
  sep:      ['https://sepolia.drpc.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
  holesky:  ['https://holesky.drpc.org', 'https://ethereum-holesky-rpc.publicnode.com'],
  hoe:      ['https://hoodi.drpc.org', 'https://ethereum-hoodi-rpc.publicnode.com'],
};

const CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 10_000;
const RPC_RETRIES = 2;
const PIN_DEPTH = 12;
const REQUIRED_PROVIDER_AGREEMENT = 2;
// Match any URL/text containing a Safe `safe=<chain>:<address>` query param,
// independent of the host/path (e.g. app.safe.global, safe.scroll.xyz,
// multisig.mantle.xyz, …). Unsupported chain prefixes will surface as
// `unsupported chain: <chain>` errors so coverage stays visible.
const SAFE_LINK_RE = /[?&]safe=([a-z0-9]+):(0x[0-9a-fA-F]{40})/i;
const TABLE_SEP_CELL_RE = /^:?-{3,}:?$/;
const QUORUM_HEADER_RE = /^quorum$/i;
const INLINE_QUORUM_RE = /^\s*\*\*Quorum(?:\*\*:|:\*\*)\s*(\d+\s*\/\s*\d+)\s*$/;
const INLINE_QUORUM_REPLACE_RE = /(\*\*Quorum(?:\*\*:|:\*\*)\s*)\d+\s*\/\s*\d+/;
const HEADING_RE = /^#{1,6}\s/;

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------
function createLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => { active--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
}

const limit = createLimiter(CONCURRENCY);
const providerLimiters = new Map();

function limitProvider(url, fn) {
  if (!providerLimiters.has(url)) providerLimiters.set(url, createLimiter(1));
  return providerLimiters.get(url)(fn);
}

// ---------------------------------------------------------------------------
// Multisig threshold/owners read via JSON-RPC `eth_call`
//
// Safe (Gnosis Safe) ABI:
//   getThreshold()                 selector 0xe75235b8 → uint256
//   getOwners()                    selector 0xa0e67e2b → address[]
// ---------------------------------------------------------------------------
const SELECTOR_GET_THRESHOLD = '0xe75235b8';
const SELECTOR_GET_OWNERS = '0xa0e67e2b';

const quorumCache = new Map();
const chainPinCache = new Map();

function fetchQuorum(chain, address) {
  const key = `${chain}:${address.toLowerCase()}`;
  if (!quorumCache.has(key)) {
    // Evict on rejection so a later reference to the same Safe within this
    // run gets a fresh attempt against the fallback RPCs instead of inheriting
    // a cached failure.
    const promise = limit(() => resolveQuorum(chain, address)).catch((err) => {
      if (quorumCache.get(key) === promise) quorumCache.delete(key);
      throw err;
    });
    quorumCache.set(key, promise);
  }
  return quorumCache.get(key);
}

async function resolveQuorum(chain, address) {
  const rpcs = CHAIN_RPCS[chain];
  if (!rpcs) throw new Error(`unsupported chain: ${chain}`);
  if (!chainPinCache.has(chain)) {
    const promise = pinCommonBlock(rpcs).catch((error) => {
      if (chainPinCache.get(chain) === promise) chainPinCache.delete(chain);
      throw error;
    });
    chainPinCache.set(chain, promise);
  }
  const pin = await chainPinCache.get(chain);
  const reads = await Promise.allSettled(
    pin.providers.map(async (provider) => {
      try {
        return await limitProvider(provider.url, () => readQuorum(provider.url, address, pin.blockTag));
      } catch (error) {
        throw new Error(`${provider.url}: ${error.message}`)
      }
    }),
  );
  const confirmed = reads
    .map((result, index) => ({ result, provider: pin.providers[index] }))
    .filter(({ result }) => result.status === 'fulfilled')
    .map(({ result, provider }) => ({ ...result.value, provider: provider.url }));
  if (confirmed.length < REQUIRED_PROVIDER_AGREEMENT) {
    const failures = reads
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.message)
      .join('; ');
    throw new Error(`only ${confirmed.length} provider quorum reads succeeded at ${pin.blockTag}: ${failures}`);
  }
  const expected = confirmed[0].value;
  const agreeing = confirmed.filter((result) => result.value === expected);
  if (agreeing.length < REQUIRED_PROVIDER_AGREEMENT) {
    throw new Error(`provider quorum disagreement at ${pin.blockTag}: ${confirmed.map((item) => `${item.provider}=${item.value}`).join(', ')}`);
  }
  return {
    value: expected,
    block_number: pin.blockNumber,
    block_hash: pin.blockHash,
    chain_id: pin.chainId,
    providers: agreeing.slice(0, REQUIRED_PROVIDER_AGREEMENT).map((item) => item.provider),
  };
}

async function pinCommonBlock(rpcs) {
  const probes = await Promise.allSettled(rpcs.map(async (url) => {
    const [chainIdHex, blockNumberHex] = await Promise.all([
      rpcRequest(url, 'eth_chainId', []),
      rpcRequest(url, 'eth_blockNumber', []),
    ]);
    return { url, chainId: Number.parseInt(chainIdHex, 16), latest: Number.parseInt(blockNumberHex, 16) };
  }));
  const available = probes.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  if (available.length < REQUIRED_PROVIDER_AGREEMENT) {
    throw new Error(`only ${available.length} RPC providers available; need ${REQUIRED_PROVIDER_AGREEMENT}`);
  }
  const chainIds = new Set(available.map((provider) => provider.chainId));
  if (chainIds.size !== 1) throw new Error(`RPC chain id disagreement: ${[...chainIds].join(', ')}`);
  const blockNumber = Math.max(0, Math.min(...available.map((provider) => provider.latest)) - PIN_DEPTH);
  const blockTag = `0x${blockNumber.toString(16)}`;
  const blocks = await Promise.allSettled(available.map(async (provider) => {
    const block = await rpcRequest(provider.url, 'eth_getBlockByNumber', [blockTag, false]);
    if (!block || !/^0x[0-9a-fA-F]{64}$/.test(block.hash || '')) {
      throw new Error(`invalid block response from ${provider.url}`);
    }
    return { ...provider, blockHash: block.hash.toLowerCase() };
  }));
  const byHash = new Map();
  for (const result of blocks) {
    if (result.status !== 'fulfilled') continue;
    const values = byHash.get(result.value.blockHash) || [];
    values.push(result.value);
    byHash.set(result.value.blockHash, values);
  }
  const agreement = [...byHash.entries()]
    .map(([blockHash, providers]) => ({ blockHash, providers }))
    .sort((left, right) => right.providers.length - left.providers.length)[0];
  if (!agreement || agreement.providers.length < REQUIRED_PROVIDER_AGREEMENT) {
    throw new Error(`no ${REQUIRED_PROVIDER_AGREEMENT}-provider block-hash agreement at ${blockTag}`);
  }
  return {
    blockNumber,
    blockTag,
    blockHash: agreement.blockHash,
    chainId: agreement.providers[0].chainId,
    providers: agreement.providers,
  };
}

async function readQuorum(rpcUrl, address, blockTag) {
  const [threshold, owners] = await Promise.all([
    rpcCall(rpcUrl, address, SELECTOR_GET_THRESHOLD, blockTag).then(decodeUint),
    rpcCall(rpcUrl, address, SELECTOR_GET_OWNERS, blockTag).then(decodeArrayLength),
  ]);
  if (!(threshold > 0 && threshold <= owners)) throw new Error(`invalid quorum: ${threshold}/${owners}`);
  return { value: `${threshold}/${owners}` };
}

async function rpcCall(rpcUrl, to, data, blockTag) {
  return rpcRequest(rpcUrl, 'eth_call', [{ to, data }, blockTag]);
}

async function rpcRequest(rpcUrl, method, params) {
  const body = JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 });
  let lastError;
  for (let attempt = 0; attempt <= RPC_RETRIES; attempt++) {
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        const retryable = res.status === 429 || res.status >= 500;
        const error = new Error(`rpc HTTP ${res.status}`);
        if (!retryable || attempt === RPC_RETRIES) throw error;
        const retryAfter = Number.parseFloat(res.headers.get('retry-after'));
        const requestedDelayMs = Number.isFinite(retryAfter) ? retryAfter * 1_000 : 250 * (2 ** attempt);
        const delayMs = Math.min(requestedDelayMs, 5_000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
      if (json.result === undefined) throw new Error(`rpc returned no result for ${method}`);
      return json.result;
    } catch (error) {
      lastError = error;
      if (attempt === RPC_RETRIES || !['AbortError', 'TimeoutError', 'TypeError'].includes(error.name)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
    }
  }
  throw lastError;
}

function decodeUint(hex) {
  // Some RPCs (notably zkSync) return `0x` for calls to nonexistent contracts
  // instead of erroring; guard explicitly so we never write `NaN/N` into docs.
  if (!hex || hex.length < 2 + 64) throw new Error(`empty rpc result: ${hex}`);
  return parseInt(hex.slice(2), 16);
}

function decodeArrayLength(hex) {
  // ABI-encoded address[]: offset(32) + length(32) + entries...
  // For a single-arg dynamic return, the offset word is always 0x20.
  if (!hex || hex.length < 2 + 128) throw new Error('not an address[] response');
  const offset = parseInt(hex.slice(2, 2 + 64), 16);
  if (offset !== 0x20) throw new Error(`unexpected address[] offset: 0x${offset.toString(16)}`);
  return parseInt(hex.slice(2 + 64, 2 + 128), 16);
}

// ---------------------------------------------------------------------------
// Markdown scanners — yield `{ lineNo, chain, address, current, write(value) }`
// ---------------------------------------------------------------------------
function splitTableRow(line) {
  const t = line.trim();
  if (!t.startsWith('|') || !t.endsWith('|')) return null;
  return t.slice(1, -1).split('|').map((c) => c.trim());
}

function rebuildTableRow(line, cells) {
  // Preserve the original line's pipe positions and whitespace padding.
  const m = line.match(/^(\s*\|)(.*)(\|\s*)$/);
  if (!m) return line;
  const segments = m[2].split('|');
  if (segments.length !== cells.length) return line;
  const inner = segments
    .map((seg, idx) => seg.replace(/^(\s*).*?(\s*)$/, `$1${cells[idx]}$2`))
    .join('|');
  return `${m[1]}${inner}${m[3]}`;
}

function findSafeLink(text) {
  const m = text.match(SAFE_LINK_RE);
  return m && { chain: m[1], address: m[2] };
}

function* scanTables(lines) {
  for (let i = 0; i < lines.length - 1; i++) {
    const head = splitTableRow(lines[i]);
    const sep = splitTableRow(lines[i + 1]);
    if (!head || !sep || !sep.every((c) => TABLE_SEP_CELL_RE.test(c))) continue;
    const qIdx = head.findIndex((h) => QUORUM_HEADER_RE.test(h));
    if (qIdx === -1) continue;

    let j = i + 2;
    while (j < lines.length) {
      const row = splitTableRow(lines[j]);
      if (!row || row.length !== head.length) break;
      const link = row.map(findSafeLink).find(Boolean);
      if (link) {
        const lineNo = j;
        yield {
          lineNo,
          ...link,
          current: row[qIdx],
          write: (value) => {
            const next = [...row];
            next[qIdx] = value;
            lines[lineNo] = rebuildTableRow(lines[lineNo], next);
          },
        };
      }
      j++;
    }
    i = j - 1;
  }
}

function* scanInline(lines) {
  let pending = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (HEADING_RE.test(line)) { pending = null; continue; }

    const link = findSafeLink(line);
    if (link) pending = link;

    const m = line.match(INLINE_QUORUM_RE);
    if (m && pending) {
      const lineNo = i;
      const safe = pending;
      // Consume the pairing — a later orphan `**Quorum:**` must require its own
      // Safe link rather than re-pairing with this one.
      pending = null;
      yield {
        lineNo,
        ...safe,
        current: m[1].replace(/\s+/g, ''),
        // Tie the replacement to the `**Quorum:**` label so an unrelated `M/N`
        // elsewhere on the line cannot be clobbered.
        write: (value) => {
          lines[lineNo] = lines[lineNo].replace(INLINE_QUORUM_REPLACE_RE, `$1${value}`);
        },
      };
    }
  }
}

function* scanQuorumSites(lines) {
  yield* scanTables(lines);
  yield* scanInline(lines);
}

// ---------------------------------------------------------------------------
// Per-file processing
// ---------------------------------------------------------------------------
async function processFile(file, mode, onFileDone) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  const rel = path.relative(ROOT, file);

  const checks = await Promise.all(
    [...scanQuorumSites(lines)].map(async (site) => {
      try {
        const pin = await fetchQuorum(site.chain, site.address);
        if (site.current === pin.value) return { ...site, status: 'ok', onchain: pin.value, pin };
        if (mode === 'write') site.write(pin.value);
        return { ...site, status: 'drift', onchain: pin.value, pin };
      } catch (err) {
        return { ...site, status: 'error', message: err.message };
      }
    }),
  );

  // Preserve source order — `Promise.all` already returns results in input
  // order, but sites came from two scanners (table + inline) which may not be
  // sorted by lineNo overall.
  checks.sort((a, b) => a.lineNo - b.lineNo);

  onFileDone({ rel, checks });
  return { rel, checks, content: lines.join('\n'), original };
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------
function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(p);
    else if (entry.name.endsWith('.md')) yield p;
  }
}

function discoverDocFiles() {
  return DOC_DIRS
    .map((d) => path.join(ROOT, d))
    .filter((p) => fs.existsSync(p))
    .flatMap((p) => [...walkMarkdown(p)]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const SYMBOL = { ok: '✓', drift: '✗', error: '!' };

function formatCheck(c, refWidth) {
  const line = `L${String(c.lineNo + 1).padStart(5)}`;
  const ref = `${c.chain}:${c.address}`.padEnd(refWidth);
  const tail =
    c.status === 'drift' ? `${c.current} → ${c.onchain}` :
    c.status === 'error' ? `${c.current ?? '?'}  (${c.message})` :
    c.current;
  const pin = c.pin ? `  block=${c.pin.block_number} hash=${c.pin.block_hash}` : '';
  return `  ${SYMBOL[c.status]} ${line}  ${ref}  ${tail}${pin}`;
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const totals = { ok: 0, drift: 0, error: 0 };
  // Reserve enough width for the longest configured `chain:0x…` reference so
  // columns align even when short and long prefixes mix on a single page.
  const longestChain = Object.keys(CHAIN_RPCS).reduce((a, b) => (b.length > a.length ? b : a), '');
  const REF_WIDTH = `${longestChain}:0x${'0'.repeat(40)}`.length;

  const onFileDone = ({ rel, checks }) => {
    if (checks.length === 0) return;
    console.log(`\n${rel}`);
    for (const c of checks) {
      totals[c.status]++;
      console.log(formatCheck(c, REF_WIDTH));
    }
  };

  const files = discoverDocFiles();
  const results = await Promise.all(files.map((f) => processFile(f, mode, onFileDone)));

  // A write run is transactional at repository level: incomplete RPC
  // coverage must not leave a partially refreshed set of quorum values.
  const canWrite = mode === 'write' && totals.error === 0;
  if (canWrite) {
    for (const { rel, content, original } of results) {
      if (content !== original) writeAtomic(path.join(ROOT, rel), content);
    }
  }

  const lock = readLock();
  lock.schema_version = 1;
  lock.external ||= {};
  lock.quorums ||= {};
  for (const { checks } of results) {
    for (const check of checks.filter((item) => item.status === 'drift' && item.pin)) {
      const key = `${check.chain}:${check.address.toLowerCase()}`;
      lock.quorums[key] = {
        chain: check.chain,
        address: check.address,
        value: check.onchain,
        block_number: check.pin.block_number,
        block_hash: check.pin.block_hash,
        chain_id: check.pin.chain_id,
        providers: check.pin.providers,
      };
    }
  }
  const lockMode = mode === 'write' && !canWrite ? 'check' : mode;
  const lockResult = reconcileFile(path.join(ROOT, 'dynamic-content.lock.json'), stableJson(lock), lockMode);
  if (lockResult.changed) console.log(`dynamic-content.lock.json: ${lockResult.action}`);

  const total = totals.ok + totals.drift + totals.error;
  console.log(`\n${total} checked: ${totals.ok} ok, ${totals.drift} drift, ${totals.error} error`);
  if (mode === 'write' && !canWrite) console.error('write aborted: RPC coverage was incomplete; no quorum files or lock evidence were changed');
  if (totals.error > 0) process.exitCode = 2;
  else if (mode === 'check' && (totals.drift > 0 || lockResult.changed)) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 2;
  });
}

module.exports = {
  decodeArrayLength,
  decodeUint,
  pinCommonBlock,
  resolveQuorum,
};
