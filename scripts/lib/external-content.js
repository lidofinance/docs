const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '../..')
const LOCK_PATH = path.join(ROOT, 'dynamic-content.lock.json')
const AUDITS_PATH = path.join(ROOT, 'docs/security/audits.md')
const LIPS_PATH = path.join(ROOT, 'docs/lips.md')

const AUDITS_REPO = 'lidofinance/audits'
const AUDITS_REF = 'main'
const LIPS_REPO = 'lidofinance/lido-improvement-proposals'
const LIPS_REF = 'develop'

const STATUSES = [
  'WIP',
  'Proposed',
  'Approved',
  'Implemented',
  'Rejected',
  'Withdrawn',
  'Deferred',
  'Moribund',
]

const STATUS_MAP = {
  draft: 'WIP',
  wip: 'WIP',
  proposed: 'Proposed',
  discussion: 'Proposed',
  review: 'Proposed',
  approved: 'Approved',
  voted: 'Approved',
  implemented: 'Implemented',
  accepted: 'Implemented',
  final: 'Implemented',
  rejected: 'Rejected',
  declined: 'Rejected',
  withdrawn: 'Withdrawn',
  deferred: 'Deferred',
  moribund: 'Moribund',
  deprecated: 'Moribund',
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'lido-docs-dynamic-content/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return headers
}

async function fetchWithRetry(url, options = {}) {
  let lastError
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...githubHeaders(), ...(options.headers || {}) },
        signal: AbortSignal.timeout(30_000),
      })
      if (response.ok) return response
      if (response.status !== 429 && response.status < 500) {
        throw new Error(`HTTP ${response.status} from ${url}`)
      }
      const retryAfter = Number(response.headers.get('retry-after') || 0)
      const requestedDelay = retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt
      const delay = Math.min(requestedDelay, 5_000)
      await new Promise((resolve) => setTimeout(resolve, delay))
      lastError = new Error(`HTTP ${response.status} from ${url}`)
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
    }
  }
  throw lastError
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url)
  return response.json()
}

async function fetchText(url) {
  const response = await fetchWithRetry(url, { headers: { Accept: 'text/plain' } })
  return response.text()
}

async function resolveCommit(repository, ref) {
  const url = `https://api.github.com/repos/${repository}/commits/${encodeURIComponent(ref)}`
  const value = await fetchJson(url)
  if (!/^[0-9a-f]{40}$/.test(value.sha || '')) {
    throw new Error(`GitHub returned no commit SHA for ${repository}@${ref}`)
  }
  return value.sha
}

function generatedComment(repository, sha) {
  return `<!-- Generated from https://github.com/${repository}/commit/${sha}; run npm run fetch-external. -->`
}

function preprocessAudits(markdown, sha) {
  const urlPrefix = `https://github.com/${AUDITS_REPO}/blob/${sha}/`
  const pdfRe = /(\[.*?\]\()(?!http|https|#|\/|mailto:)([^)]+\.pdf)(\))/g
  return markdown.replace(pdfRe, (_, p1, relative, p3) => p1 + urlPrefix + relative + p3)
}

function stripAuditCount(heading) {
  return heading.replace(/\s*\(\d+\s+reports?\)$/i, '').trim()
}

function sortAuditsAndCount(markdown) {
  const lines = markdown.split('\n')
  const output = []
  const counts = {}
  let currentHeading = null
  let buffer = []

  function flush() {
    if (!currentHeading) return
    const blocks = []
    const preamble = []
    let current = null
    for (const line of buffer) {
      if (line.startsWith('### ')) {
        if (current) blocks.push(current)
        current = { header: line, lines: [] }
      } else {
        ;(current ? current.lines : preamble).push(line)
      }
    }
    if (current) blocks.push(current)
    blocks.sort((left, right) => {
      const pattern = /^###\s+(\d{1,2})-(\d{4})/
      const a = left.header.match(pattern)
      const b = right.header.match(pattern)
      const av = a ? Number(a[2]) * 12 + Number(a[1]) : 0
      const bv = b ? Number(b[2]) * 12 + Number(b[1]) : 0
      return bv - av
    })
    const cleanHeading = stripAuditCount(currentHeading)
    counts[cleanHeading.replace(/^##\s+/, '')] = blocks.length
    output.push(`${cleanHeading} (${blocks.length} reports)`, ...preamble)
    for (const block of blocks) output.push(block.header, ...block.lines)
    buffer = []
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush()
      currentHeading = line
    } else if (currentHeading) {
      buffer.push(line)
    } else {
      output.push(line)
    }
  }
  flush()
  return { content: output.join('\n'), counts }
}

function renderAudits(markdown, sha) {
  const sorted = sortAuditsAndCount(preprocessAudits(markdown, sha))
  return {
    content: `${generatedComment(AUDITS_REPO, sha)}\n\n${sorted.content.trim()}\n`,
    counts: sorted.counts,
  }
}

function unquote(value) {
  const text = String(value || '').trim()
  if (text.length >= 2 && text[0] === text[text.length - 1] && ['"', "'"].includes(text[0])) {
    return text.slice(1, -1)
  }
  return text
}

function parseYamlFrontMatter(markdown) {
  const match = markdown.match(/^---[\r\n]+([\s\S]*?)^---/m)
  if (!match) return null
  const metadata = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const pair = line.match(/^([^:]+):\s*(.*)$/)
    if (pair) metadata[pair[1].trim().toLowerCase()] = unquote(pair[2])
  }
  return metadata
}

function parseMarkdownTableHeader(markdown) {
  const block = markdown.match(/^(?:\s*\|.*\n){3}/m)
  if (!block) return null
  const [header, , values] = block[0].trim().split(/\r?\n/)
  const keys = header.split('|').map((value) => value.trim().replace(/:$/, '').toLowerCase()).filter(Boolean)
  const fields = values.split('|').map((value) => value.trim()).filter(Boolean)
  if (!keys.includes('lip')) return null
  return Object.fromEntries(keys.map((key, index) => [key, unquote(fields[index] || '')]))
}

function parseLipMetadata(markdown) {
  return parseYamlFrontMatter(markdown) || parseMarkdownTableHeader(markdown) || {}
}

function normalizeLip(raw) {
  const match = String(raw || '').match(/(\d+)/)
  return match ? Number(match[1]) : Number.NaN
}

function canonicalStatus(raw = '') {
  const normalized = String(raw).toLowerCase()
  if (!normalized) return 'WIP'
  const status = STATUS_MAP[normalized]
  if (!status) throw new Error(`unknown LIP status ${JSON.stringify(raw)}`)
  return status
}

function escapeCell(value = '') {
  return String(value).replace(/\|/g, '&#124;').replace(/\n/g, ' ')
}

function renderDiscussion(value) {
  if (!value || /^(none|null)$/i.test(value)) return 'None'
  const urls = value.split(/[,\s]+/).filter(Boolean)
  return urls.map((url, index) => `[Link${urls.length > 1 ? ` ${index + 1}` : ''}](${url})`).join(', ')
}

function renderLipTable(rows) {
  const header = '| LIP&nbsp;# | Title | Author | Discussions&#8209;to |\n|------------|-------|--------|----------------|'
  const body = rows.map((row) => (
    `| [${row.number}](${row.link}) | ${escapeCell(row.title)} | ${escapeCell(row.author)} | ${renderDiscussion(row.discussion)} |`
  )).join('\n')
  return `${header}\n${body}`
}

function renderLips(files, sha) {
  const buckets = Object.fromEntries(STATUSES.map((status) => [status, []]))
  for (const file of files) {
    const metadata = parseLipMetadata(file.content)
    const number = normalizeLip(metadata.lip)
    if (Number.isNaN(number)) throw new Error(`malformed LIP metadata in ${file.name}`)
    const status = canonicalStatus(metadata.status)
    buckets[status].push({
      number,
      title: metadata.title || '',
      author: metadata.author || '',
      discussion: metadata['discussions-to'] || metadata.discussion || '',
      link: `https://github.com/${LIPS_REPO}/blob/${sha}/LIPS/lip-${number}.md`,
    })
  }
  for (const rows of Object.values(buckets)) rows.sort((left, right) => right.number - left.number)

  const output = [
    generatedComment(LIPS_REPO, sha),
    '',
    '# Lido Improvement Proposals',
    '',
    'Lido Improvement Proposals (LIPs) describe standards for the Lido platform, including core protocol specifications, client APIs, and contract standards.',
    '',
    `More details on the contribution process and LIPs statuses can be found [here](https://github.com/${LIPS_REPO}).`,
    '',
  ]
  const counts = {}
  for (const status of STATUSES) {
    if (!buckets[status].length) continue
    counts[status] = buckets[status].length
    output.push(`## ${status}`, '', renderLipTable(buckets[status]), '')
  }
  return { content: `${output.join('\n').trim()}\n`, counts }
}

async function fetchAudits() {
  const sha = await resolveCommit(AUDITS_REPO, AUDITS_REF)
  const url = `https://raw.githubusercontent.com/${AUDITS_REPO}/${sha}/README.md`
  return { sha, ...renderAudits(await fetchText(url), sha) }
}

async function fetchLips() {
  const sha = await resolveCommit(LIPS_REPO, LIPS_REF)
  const tree = await fetchJson(`https://api.github.com/repos/${LIPS_REPO}/git/trees/${sha}?recursive=1`)
  if (tree.truncated) throw new Error(`GitHub returned a truncated tree for ${LIPS_REPO}@${sha}`)
  const paths = (tree.tree || [])
    .filter((entry) => entry.type === 'blob' && /^LIPS\/[^/]+\.md$/.test(entry.path))
    .map((entry) => entry.path)
    .sort()
  if (!paths.length) throw new Error(`no LIP files found at ${LIPS_REPO}@${sha}`)
  const files = await Promise.all(paths.map(async (filePath) => ({
    name: path.basename(filePath),
    content: await fetchText(`https://raw.githubusercontent.com/${LIPS_REPO}/${sha}/${filePath}`),
  })))
  return { sha, ...renderLips(files, sha) }
}

function readLock() {
  try {
    return JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return { schema_version: 1, external: {}, quorums: {} }
    throw error
  }
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function writeAtomic(destination, content) {
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  const temporary = `${destination}.tmp-${process.pid}`
  fs.writeFileSync(temporary, content, 'utf8')
  fs.renameSync(temporary, destination)
}

function reconcileFile(destination, expected, mode) {
  let current = null
  try {
    current = fs.readFileSync(destination, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (current === expected) return { changed: false, action: 'clean' }
  if (mode === 'write') {
    writeAtomic(destination, expected)
    return { changed: true, action: 'written' }
  }
  return { changed: true, action: 'drift' }
}

function parseMode(argv) {
  const modes = argv.filter((value) => value === '--check' || value === '--write')
  if (modes.length !== 1) throw new Error('pass exactly one of --check or --write')
  return modes[0].slice(2)
}

async function runExternal({ mode, targets = ['audits', 'lips'] }) {
  const lock = readLock()
  lock.schema_version = 1
  lock.external ||= {}
  lock.quorums ||= {}
  const results = []

  if (targets.includes('audits')) {
    const audits = await fetchAudits()
    results.push({ id: 'audits', destination: AUDITS_PATH, ...audits })
    lock.external.audits = {
      repository: AUDITS_REPO,
      ref: AUDITS_REF,
      commit: audits.sha,
      output: path.relative(ROOT, AUDITS_PATH),
      output_sha256: sha256(audits.content),
    }
  }
  if (targets.includes('lips')) {
    const lips = await fetchLips()
    results.push({ id: 'lips', destination: LIPS_PATH, ...lips })
    lock.external.lips = {
      repository: LIPS_REPO,
      ref: LIPS_REF,
      commit: lips.sha,
      output: path.relative(ROOT, LIPS_PATH),
      output_sha256: sha256(lips.content),
    }
  }

  let drift = false
  for (const result of results) {
    const outcome = reconcileFile(result.destination, result.content, mode)
    drift ||= outcome.changed
    console.log(`${result.id}: ${outcome.action} source=${result.sha} counts=${JSON.stringify(result.counts)}`)
  }
  const lockOutcome = reconcileFile(LOCK_PATH, stableJson(lock), mode)
  drift ||= lockOutcome.changed
  console.log(`dynamic-content.lock.json: ${lockOutcome.action}`)
  return { drift, results }
}

module.exports = {
  AUDITS_REPO,
  LIPS_REPO,
  LOCK_PATH,
  ROOT,
  canonicalStatus,
  parseLipMetadata,
  parseMode,
  readLock,
  reconcileFile,
  renderAudits,
  renderLips,
  runExternal,
  sha256,
  stableJson,
  writeAtomic,
}
