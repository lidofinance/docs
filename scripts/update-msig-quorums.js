#!/usr/bin/env node
// Walks markdown files, finds every Safe multisig with a recorded `Quorum`
// (either as a `Quorum` table column or an inline `**Quorum:** M/N` line next
// to a Safe address), reads the multisig's threshold and owner count directly
// from the contract via JSON-RPC, and compares it with the doc value.
// Reports drift; writes the on-chain value back with `--write`.
//
//   node scripts/update-msig-quorums.js          # check, exit 1 on drift
//   node scripts/update-msig-quorums.js --write  # apply changes

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const DOC_DIRS = ['docs', 'earn', 'run-on-lido'];

// Safe URL chain prefix → ordered list of public JSON-RPC endpoints. Each is
// tried in turn on transient failures (5xx/4xx/network).
const CHAIN_RPCS = {
  eth:    ['https://eth.drpc.org', 'https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com'],
  base:   ['https://base.drpc.org', 'https://base-rpc.publicnode.com', 'https://base.llamarpc.com'],
  arb1:   ['https://arbitrum.drpc.org', 'https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc'],
  oeth:   ['https://optimism.drpc.org', 'https://optimism-rpc.publicnode.com', 'https://mainnet.optimism.io'],
  matic:  ['https://polygon.drpc.org', 'https://polygon-bor-rpc.publicnode.com', 'https://polygon-rpc.com'],
  bnb:    ['https://bsc.drpc.org', 'https://bsc-rpc.publicnode.com', 'https://binance.llamarpc.com'],
  zksync: ['https://zksync.drpc.org', 'https://mainnet.era.zksync.io'],
  gno:    ['https://gnosis.drpc.org', 'https://gnosis-rpc.publicnode.com', 'https://rpc.gnosischain.com'],
  avax:   ['https://avalanche.drpc.org', 'https://avalanche-c-chain-rpc.publicnode.com'],
  celo:   ['https://celo.drpc.org', 'https://forno.celo.org'],
  sep:    ['https://sepolia.drpc.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
};

const CONCURRENCY = 4;
const SAFE_LINK_RE = /app\.safe\.global\/[^)]*[?&]safe=([a-z0-9]+):(0x[0-9a-fA-F]{40})/;
const TABLE_SEP_CELL_RE = /^:?-{3,}:?$/;
const QUORUM_HEADER_RE = /^quorum$/i;
const INLINE_QUORUM_RE = /^\s*\*\*Quorum(?:\*\*:|:\*\*)\s*(\d+\s*\/\s*\d+)\s*$/;
const HEADING_RE = /^#{1,6}\s/;

const WRITE = process.argv.includes('--write');

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

function fetchQuorum(chain, address) {
  const key = `${chain}:${address.toLowerCase()}`;
  if (!quorumCache.has(key)) quorumCache.set(key, limit(() => resolveQuorum(chain, address)));
  return quorumCache.get(key);
}

async function resolveQuorum(chain, address) {
  const rpcs = CHAIN_RPCS[chain];
  if (!rpcs) throw new Error(`unsupported chain: ${chain}`);
  const [threshold, owners] = await Promise.all([
    rpcCallWithFallback(rpcs, address, SELECTOR_GET_THRESHOLD).then(decodeUint),
    rpcCallWithFallback(rpcs, address, SELECTOR_GET_OWNERS).then(decodeArrayLength),
  ]);
  return `${threshold}/${owners}`;
}

async function rpcCallWithFallback(rpcs, to, data) {
  let lastErr;
  for (const url of rpcs) {
    try {
      return await rpcCall(url, to, data);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('no rpcs configured');
}

async function rpcCall(rpcUrl, to, data) {
  const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to, data }, 'latest'], id: 1 });
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  if (!res.ok) throw new Error(`rpc HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function decodeUint(hex) {
  if (!hex || hex.length < 2) throw new Error('empty rpc result');
  return parseInt(hex.slice(2), 16);
}

function decodeArrayLength(hex) {
  // ABI-encoded address[]: offset(32) + length(32) + entries...
  if (!hex || hex.length < 2 + 128) throw new Error('not an address[] response');
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
      const matched = m[1];
      yield {
        lineNo,
        ...pending,
        current: matched.replace(/\s+/g, ''),
        write: (value) => { lines[lineNo] = lines[lineNo].replace(matched, value); },
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
async function processFile(file, onFileDone) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  const rel = path.relative(ROOT, file);

  const checks = await Promise.all(
    [...scanQuorumSites(lines)].map(async (site) => {
      try {
        const onchain = await fetchQuorum(site.chain, site.address);
        if (site.current === onchain) return { ...site, status: 'ok', onchain };
        site.write(onchain);
        return { ...site, status: 'drift', onchain };
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
  return `  ${SYMBOL[c.status]} ${line}  ${ref}  ${tail}`;
}

async function main() {
  const totals = { ok: 0, drift: 0, error: 0 };
  // Reserve enough width for the longest possible `chain:0x…` reference so
  // columns align even when a short matic vs longer zksync prefix mix on a
  // single page.
  const REF_WIDTH = 'zksync:0x0000000000000000000000000000000000000000'.length;

  const onFileDone = ({ rel, checks }) => {
    if (checks.length === 0) return;
    console.log(`\n${rel}`);
    for (const c of checks) {
      totals[c.status]++;
      console.log(formatCheck(c, REF_WIDTH));
    }
  };

  const files = discoverDocFiles();
  const results = await Promise.all(files.map((f) => processFile(f, onFileDone)));

  for (const { rel, content, original } of results) {
    if (WRITE && content !== original) fs.writeFileSync(path.join(ROOT, rel), content);
  }

  const total = totals.ok + totals.drift + totals.error;
  console.log(`\n${total} checked: ${totals.ok} ok, ${totals.drift} drift, ${totals.error} error`);

  if (totals.drift === 0) return 0;
  if (WRITE) { console.log('Updated files written.'); return 0; }
  console.log('Run with --write to apply changes.');
  return 1;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(err);
  process.exit(2);
});
