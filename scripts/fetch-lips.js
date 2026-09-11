#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')

const { createLimiter } = require('./lib/async')
const { fetchJson, fetchText } = require('./lib/http')
const { parseMarkdownTable } = require('./lib/markdown')
const { printCounts } = require('./lib/output')
const { runTask } = require('./lib/tasks')

const API_URL = 'https://api.github.com/repos/lidofinance/lido-improvement-proposals/contents/LIPS?ref=develop'
const RAW_BASE_URL = 'https://raw.githubusercontent.com/lidofinance/lido-improvement-proposals/develop/LIPS/'
const REPOSITORY_BASE_URL = 'https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/'
const OUTPUT_PATH = path.join(__dirname, '../docs/lips.md')
const LIP_FETCH_CONCURRENCY = 4

const GITHUB_HEADERS = {
  'User-Agent': 'node/fetch-lips',
  Accept: 'application/vnd.github+json',
}

const STATUSES = ['WIP', 'Proposed', 'Approved', 'Implemented', 'Rejected', 'Withdrawn', 'Deferred', 'Moribund']

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

function parseYamlFrontMatter(markdown) {
  if (!/^---(?:\r?\n)/.test(markdown)) return null

  return Object.fromEntries(Object.entries(matter(markdown).data).map(([key, value]) => [key.toLowerCase(), value]))
}

function parseMarkdownTableHeader(markdown) {
  const lines = markdown.split(/\r?\n/)
  const headerIndex = lines.findIndex((line) => line.trim() !== '')
  if (headerIndex === -1) return null

  const table = parseMarkdownTable(lines, headerIndex)
  if (!table || table.rows.length === 0) return null

  const keys = table.headers.map((header) => header.replace(/:$/, '').toLowerCase())
  if (!keys.includes('lip')) return null

  const values = table.rows[0].cells
  return Object.fromEntries(keys.map((key, keyIndex) => [key, values[keyIndex] || '']))
}

function parseMetadata(markdown) {
  return parseYamlFrontMatter(markdown) || parseMarkdownTableHeader(markdown) || {}
}

function parseLipNumber(rawValue) {
  const match = String(rawValue ?? '').match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : null
}

function normalizeStatus(rawStatus = '') {
  return STATUS_MAP[String(rawStatus).trim().toLowerCase()] || 'WIP'
}

function escapeTableCell(value = '') {
  return String(value).replace(/\|/g, '&#124;').replace(/\r?\n/g, ' ')
}

function renderDiscussionLinks(value) {
  if (!value || /^(none|null)$/i.test(value)) return 'None'

  const urls = value.split(/[,\s]+/).filter(Boolean)
  return urls
    .map((url, index) => {
      const suffix = urls.length > 1 ? ` ${index + 1}` : ''
      return `[Link${suffix}](${url})`
    })
    .join(', ')
}

function renderTable(rows) {
  const header =
    '| LIP&nbsp;# | Title | Author | Discussions&#8209;to |\n' + '|------------|-------|--------|----------------|'
  const body = rows
    .map(
      (row) =>
        `| [${row.number}](${row.link}) | ${escapeTableCell(row.title)} | ` +
        `${escapeTableCell(row.author)} | ${renderDiscussionLinks(row.discussion)} |`,
    )
    .join('\n')
  return `${header}\n${body}`
}

function parseLip(fileName, markdown) {
  let metadata
  try {
    metadata = parseMetadata(markdown)
  } catch {
    return null
  }

  const number = parseLipNumber(metadata.lip)
  if (number === null) return null

  return {
    number,
    status: normalizeStatus(metadata.status),
    title: metadata.title || '',
    author: metadata.author || '',
    discussion: metadata['discussions-to'] || metadata.discussion || '',
    link: `${REPOSITORY_BASE_URL}${fileName}`,
  }
}

function buildLipDocument(lips) {
  const buckets = Object.fromEntries(STATUSES.map((status) => [status, []]))
  for (const lip of lips) buckets[lip.status].push(lip)
  for (const bucket of Object.values(buckets)) {
    bucket.sort((left, right) => right.number - left.number)
  }

  const lines = [
    '# Lido Improvement Proposals',
    '',
    'Lido Improvement Proposals (LIPs) describe standards for the Lido platform, including core protocol specifications, client APIs, and contract standards.',
    '',
    'More details on the contribution process and LIPs statuses can be found [here](https://github.com/lidofinance/lido-improvement-proposals).',
    '',
  ]
  const counts = {}

  for (const status of STATUSES) {
    const rows = buckets[status]
    if (rows.length === 0) continue

    counts[status] = rows.length
    lines.push(`## ${status}`, '', renderTable(rows), '')
  }

  return { content: lines.join('\n'), counts }
}

async function fetchLip(file) {
  const markdown = await fetchText(`${RAW_BASE_URL}${file.name}`, { headers: GITHUB_HEADERS })
  const lip = parseLip(file.name, markdown)
  if (!lip) console.warn('⚠️  skipping malformed:', file.name)
  return lip
}

async function run() {
  const listing = await fetchJson(API_URL, { headers: GITHUB_HEADERS })
  const markdownFiles = listing.filter((file) => file.name.endsWith('.md'))
  const limit = createLimiter(LIP_FETCH_CONCURRENCY)
  const lips = (await Promise.all(markdownFiles.map((file) => limit(() => fetchLip(file))))).filter(Boolean)

  const { content, counts } = buildLipDocument(lips)
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, content, 'utf8')

  printCounts(counts)
  console.log('\n👌 Lido improvement proposals fetched and summary written →', OUTPUT_PATH)
}

if (require.main === module) runTask(run)

module.exports = {
  buildLipDocument,
  escapeTableCell,
  fetchLip,
  normalizeStatus,
  parseLip,
  parseLipNumber,
  parseMarkdownTableHeader,
  parseMetadata,
  parseYamlFrontMatter,
  renderDiscussionLinks,
  renderTable,
  run,
}
