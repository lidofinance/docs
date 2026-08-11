#!/usr/bin/env node
// Walks markdown files, finds every Safe multisig with a recorded `Quorum`
// (either as a `Quorum` table column or an inline `**Quorum:** M/N` line next
// to a Safe address), reads the multisig's threshold and owner count directly
// from the contract via JSON-RPC, and rewrites cells where the doc value
// drifted from the on-chain value.
//
//   node scripts/fetch-msig-quorums.js

const fs = require('node:fs')
const path = require('node:path')

const { createLimiter } = require('./lib/async')
const { fetchJson } = require('./lib/http')
const { rebuildTableRow, scanMarkdownTables, splitTableRow } = require('./lib/markdown')
const { runTask } = require('./lib/tasks')

const ROOT = path.resolve(__dirname, '..')
const DOC_DIRS = ['docs', 'earn', 'run-on-lido']

// Safe URL chain prefix → ordered list of public JSON-RPC endpoints. Each is
// tried in turn on transient failures (5xx/4xx/network).
const CHAIN_RPCS = {
  eth: ['https://eth.drpc.org', 'https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com'],
  base: ['https://base.drpc.org', 'https://base-rpc.publicnode.com', 'https://base.llamarpc.com'],
  arb1: ['https://arbitrum.drpc.org', 'https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc'],
  oeth: ['https://optimism.drpc.org', 'https://optimism-rpc.publicnode.com', 'https://mainnet.optimism.io'],
  matic: ['https://polygon.drpc.org', 'https://polygon-bor-rpc.publicnode.com', 'https://polygon-rpc.com'],
  bnb: ['https://bsc.drpc.org', 'https://bsc-rpc.publicnode.com', 'https://binance.llamarpc.com'],
  zksync: ['https://zksync.drpc.org', 'https://mainnet.era.zksync.io'],
  gno: ['https://gnosis.drpc.org', 'https://gnosis-rpc.publicnode.com', 'https://rpc.gnosischain.com'],
  avax: ['https://avalanche.drpc.org', 'https://avalanche-c-chain-rpc.publicnode.com'],
  celo: ['https://celo.drpc.org', 'https://forno.celo.org'],
  scr: ['https://scroll.drpc.org', 'https://rpc.scroll.io'],
  linea: ['https://linea.drpc.org', 'https://rpc.linea.build'],
  mnt: ['https://mantle.drpc.org', 'https://rpc.mantle.xyz'],
  mantle: ['https://mantle.drpc.org', 'https://rpc.mantle.xyz'],
  unichain: ['https://unichain.drpc.org', 'https://mainnet.unichain.org'],
  ink: ['https://ink.drpc.org', 'https://rpc-gel.inkonchain.com'],
  lisk: ['https://lisk.drpc.org', 'https://rpc.api.lisk.com'],
  mode: ['https://mode.drpc.org', 'https://mainnet.mode.network'],
  soneium: ['https://soneium.drpc.org', 'https://rpc.soneium.org'],
  plasma: ['https://plasma.drpc.org', 'https://rpc.plasma.to'],
  sep: ['https://sepolia.drpc.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
  holesky: ['https://holesky.drpc.org', 'https://ethereum-holesky-rpc.publicnode.com'],
  hoe: ['https://hoodi.drpc.org', 'https://ethereum-hoodi-rpc.publicnode.com'],
}

const CONCURRENCY = 4
// Match any URL/text containing a Safe `safe=<chain>:<address>` query param,
// independent of the host/path (e.g. app.safe.global, safe.scroll.xyz,
// multisig.mantle.xyz, …). Unsupported chain prefixes will surface as
// `unsupported chain: <chain>` errors so coverage stays visible.
const SAFE_LINK_RE = /[?&]safe=([a-z0-9]+):(0x[0-9a-fA-F]{40})/i
const QUORUM_HEADER_RE = /^quorum$/i
const INLINE_QUORUM_RE = /^\s*\*\*Quorum(?:\*\*:|:\*\*)\s*(\d+\s*\/\s*\d+)\s*$/
const INLINE_QUORUM_REPLACE_RE = /(\*\*Quorum(?:\*\*:|:\*\*)\s*)\d+\s*\/\s*\d+/
const HEADING_RE = /^#{1,6}\s/

// Multisig threshold/owners read via JSON-RPC `eth_call`
//
// Safe (Gnosis Safe) ABI:
//   getThreshold()                 selector 0xe75235b8 → uint256
//   getOwners()                    selector 0xa0e67e2b → address[]
const SELECTOR_GET_THRESHOLD = '0xe75235b8'
const SELECTOR_GET_OWNERS = '0xa0e67e2b'

async function resolveQuorum(chain, address) {
  const rpcs = CHAIN_RPCS[chain]
  if (!rpcs) throw new Error(`unsupported chain: ${chain}`)
  const [threshold, owners] = await Promise.all([
    rpcCallWithFallback(rpcs, address, SELECTOR_GET_THRESHOLD).then(decodeUint),
    rpcCallWithFallback(rpcs, address, SELECTOR_GET_OWNERS).then(decodeArrayLength),
  ])
  if (!(threshold > 0 && threshold <= owners)) {
    throw new Error(`invalid quorum: ${threshold}/${owners}`)
  }
  return `${threshold}/${owners}`
}

function createQuorumFetcher(resolve, maxConcurrency) {
  const limit = createLimiter(maxConcurrency)
  const cache = new Map()

  return function fetchQuorum(chain, address) {
    const key = `${chain}:${address.toLowerCase()}`
    if (cache.has(key)) return cache.get(key)

    const request = limit(() => resolve(chain, address)).catch((error) => {
      if (cache.get(key) === request) cache.delete(key)
      throw error
    })
    cache.set(key, request)
    return request
  }
}

const fetchQuorum = createQuorumFetcher(resolveQuorum, CONCURRENCY)

async function rpcCallWithFallback(rpcUrls, address, data) {
  let lastError
  for (const rpcUrl of rpcUrls) {
    try {
      return await rpcCall(rpcUrl, address, data)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('no rpcs configured')
}

async function rpcCall(rpcUrl, address, data) {
  const payload = await fetchJson(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: address, data }, 'latest'],
      id: 1,
    }),
  })
  if (payload.error) {
    throw new Error(payload.error.message ?? JSON.stringify(payload.error))
  }
  return payload.result
}

function decodeUint(hex) {
  // Some RPCs (notably zkSync) return `0x` for calls to nonexistent contracts
  // instead of erroring; guard explicitly so we never write `NaN/N` into docs.
  if (!hex || hex.length < 2 + 64) throw new Error(`empty rpc result: ${hex}`)
  return Number.parseInt(hex.slice(2), 16)
}

function decodeArrayLength(hex) {
  // ABI-encoded address[]: offset(32) + length(32) + entries...
  // For a single-arg dynamic return, the offset word is always 0x20.
  if (!hex || hex.length < 2 + 128) throw new Error('not an address[] response')
  const offset = Number.parseInt(hex.slice(2, 2 + 64), 16)
  if (offset !== 0x20) throw new Error(`unexpected address[] offset: 0x${offset.toString(16)}`)
  return Number.parseInt(hex.slice(2 + 64, 2 + 128), 16)
}

// Markdown scanners — yield `{ lineNo, chain, address, current, write(value) }`
function findSafeLink(text) {
  const match = text.match(SAFE_LINK_RE)
  return match && { chain: match[1].toLowerCase(), address: match[2] }
}

function* scanTables(lines) {
  for (const { headers, rows } of scanMarkdownTables(lines)) {
    const quorumColumn = headers.findIndex((header) => QUORUM_HEADER_RE.test(header))
    if (quorumColumn === -1) continue

    for (const { cells: row, lineIndex } of rows) {
      const link = row.map(findSafeLink).find(Boolean)
      if (link) {
        const lineNo = lineIndex
        yield {
          lineNo,
          ...link,
          current: row[quorumColumn],
          write: (value) => {
            const updatedRow = [...row]
            while (updatedRow.length <= quorumColumn) updatedRow.push('')
            updatedRow[quorumColumn] = value
            lines[lineNo] = rebuildTableRow(lines[lineNo], updatedRow)
          },
        }
      }
    }
  }
}

function* scanInline(lines) {
  let pending = null
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]
    if (HEADING_RE.test(line)) {
      pending = null
      continue
    }

    const link = findSafeLink(line)
    if (link) pending = link

    const quorum = line.match(INLINE_QUORUM_RE)
    if (quorum && pending) {
      const lineNo = lineIndex
      const safe = pending
      // Consume the pairing — a later orphan `**Quorum:**` must require its own
      // Safe link rather than re-pairing with this one.
      pending = null
      yield {
        lineNo,
        ...safe,
        current: quorum[1].replace(/\s+/g, ''),
        // Tie the replacement to the `**Quorum:**` label so an unrelated `M/N`
        // elsewhere on the line cannot be clobbered.
        write: (value) => {
          lines[lineNo] = lines[lineNo].replace(INLINE_QUORUM_REPLACE_RE, `$1${value}`)
        },
      }
    }
  }
}

function* scanQuorumSites(lines) {
  yield* scanTables(lines)
  yield* scanInline(lines)
}

async function updateQuorums(markdown, getQuorum) {
  const lines = markdown.split('\n')
  const checks = await Promise.all(
    [...scanQuorumSites(lines)].map(async (site) => {
      const { write, ...check } = site
      try {
        const onchain = await getQuorum(site.chain, site.address)
        if (site.current === onchain) return { ...check, status: 'ok', onchain }
        write(onchain)
        return { ...check, status: 'drift', onchain }
      } catch (error) {
        return { ...check, status: 'error', message: error.message }
      }
    }),
  )

  // Preserve source order — `Promise.all` already returns results in input
  // order, but sites came from two scanners (table + inline) which may not be
  // sorted by lineNo overall.
  checks.sort((a, b) => a.lineNo - b.lineNo)

  return { checks, content: lines.join('\n') }
}

async function processFile(file, onFileChecked) {
  const original = fs.readFileSync(file, 'utf8')
  const relativePath = path.relative(ROOT, file)
  const { checks, content } = await updateQuorums(original, fetchQuorum)

  onFileChecked({ relativePath, checks })
  return { relativePath, content, original }
}

function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walkMarkdown(entryPath)
    else if (entry.name.endsWith('.md')) yield entryPath
  }
}

function discoverDocFiles() {
  return DOC_DIRS.map((directory) => path.join(ROOT, directory))
    .filter((directory) => fs.existsSync(directory))
    .flatMap((directory) => [...walkMarkdown(directory)])
}

const SYMBOL = { ok: '✓', drift: '✗', error: '!' }

function formatCheckDetails(check) {
  if (check.status === 'drift') return `${check.current} → ${check.onchain}`
  if (check.status === 'error') {
    return `${check.current ?? '?'}  (${check.message})`
  }
  return check.current
}

function formatCheck(check, referenceWidth) {
  const line = `L${String(check.lineNo + 1).padStart(5)}`
  const reference = `${check.chain}:${check.address}`.padEnd(referenceWidth)
  return `  ${SYMBOL[check.status]} ${line}  ${reference}  ${formatCheckDetails(check)}`
}

async function run() {
  const totals = { ok: 0, drift: 0, error: 0 }
  // Reserve enough width for the longest configured `chain:0x…` reference so
  // columns align even when short and long prefixes mix on a single page.
  const longestChain = Object.keys(CHAIN_RPCS).reduce((a, b) => (b.length > a.length ? b : a), '')
  const referenceWidth = `${longestChain}:0x${'0'.repeat(40)}`.length

  const onFileChecked = ({ relativePath, checks }) => {
    if (checks.length === 0) return
    console.log(`\n${relativePath}`)
    for (const check of checks) {
      totals[check.status] += 1
      console.log(formatCheck(check, referenceWidth))
    }
  }

  const files = discoverDocFiles()
  const results = await Promise.all(files.map((file) => processFile(file, onFileChecked)))

  for (const { relativePath, content, original } of results) {
    if (content !== original) fs.writeFileSync(path.join(ROOT, relativePath), content)
  }

  const total = totals.ok + totals.drift + totals.error
  console.log(`\n${total} checked: ${totals.ok} ok, ${totals.drift} drift, ${totals.error} error`)
}

if (require.main === module) runTask(run)

module.exports = {
  createQuorumFetcher,
  decodeArrayLength,
  decodeUint,
  findSafeLink,
  formatCheck,
  rebuildTableRow,
  resolveQuorum,
  rpcCall,
  rpcCallWithFallback,
  run,
  scanQuorumSites,
  splitTableRow,
  updateQuorums,
}
