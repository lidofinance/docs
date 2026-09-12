#!/usr/bin/env node

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const { fetchJson } = require('./lib/http')
const { scanMarkdownTables } = require('./lib/markdown')
const { runTask } = require('./lib/tasks')

const FORUM_URL = 'https://research.lido.fi'
const LEDGER_PATH = path.join(__dirname, '../docs/security/disclosures.md')
const REPORT_DIRECTORY = path.join(__dirname, '../.security-triage')
const NODE_OPERATOR_CATEGORY = 12
const POST_BATCH_SIZE = 20

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function validateDate(value) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`invalid date: ${value}; expected YYYY-MM-DD`)
  }
  return value
}

function readLedger(markdown) {
  const dates = []
  const topicIds = new Set()
  for (const table of scanMarkdownTables(markdown.split('\n'))) {
    const dateColumn = table.headers.indexOf('Date')
    const linksColumn = table.headers.indexOf('Links')
    if (dateColumn === -1 || linksColumn === -1) continue
    for (const { cells } of table.rows) {
      dates.push(validateDate(cells[dateColumn]))
      for (const match of (cells[linksColumn] || '').matchAll(/https:\/\/research\.lido\.fi\/t\/[^\s)]+/g)) {
        const segments = new URL(match[0]).pathname.split('/').filter(Boolean)
        const id = /^\d+$/.test(segments[1]) ? segments[1] : segments[2]
        if (/^\d+$/.test(id || '')) topicIds.add(Number(id))
      }
    }
  }
  if (!dates.length) throw new Error('no dated disclosure ledger rows found')
  return { latestDate: dates.sort().at(-1), topicIds }
}

function parseOptions(argv, latestDate) {
  const options = { since: latestDate, until: new Date().toISOString().slice(0, 10), maxPages: 50 }
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!['--since', '--until', '--max-pages'].includes(flag) || value === undefined) {
      throw new Error('usage: npm run fetch-disclosures -- [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--max-pages N]')
    }
    if (flag === '--max-pages') {
      if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
        throw new Error('max-pages must be a positive integer')
      options.maxPages = Number(value)
    } else options[flag.slice(2)] = validateDate(value)
  }
  if (options.since > options.until) throw new Error('since must not be after until')
  return options
}

function classifyTopic(title, categoryId, openingText = '') {
  const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  if (
    !/\b(security disclosure|security bulletin|incident|post mortem|postmortem|vulnerabilit(?:y|ies))\b/.test(
      normalized,
    )
  )
    return null
  if (categoryId === NODE_OPERATOR_CATEGORY) return 'node_operator'
  const context = `${normalized} ${openingText.toLowerCase().replace(/<[^>]*>/g, ' ')}`
  if (/\b(lido earn|earneth|earnusd)\b/.test(context)) return 'product'
  return /\bsecurity (disclosure|bulletin)\b/.test(normalized) ? 'explicit_disclosure' : 'review_required'
}

async function fetchTopic(topicId, getJson) {
  const topic = await getJson(`${FORUM_URL}/t/${topicId}.json`)
  const stream = topic.post_stream?.stream
  const initial = topic.post_stream?.posts
  if (
    topic.id !== topicId ||
    !Array.isArray(stream) ||
    !stream.length ||
    !stream.every(Number.isSafeInteger) ||
    new Set(stream).size !== stream.length ||
    !Array.isArray(initial)
  ) {
    throw new Error(`invalid post stream for topic ${topicId}`)
  }
  const posts = new Map(initial.map((post) => [post.id, post]))
  const missing = stream.filter((id) => !posts.has(id))
  for (let offset = 0; offset < missing.length; offset += POST_BATCH_SIZE) {
    const query = new URLSearchParams(
      missing.slice(offset, offset + POST_BATCH_SIZE).map((id) => ['post_ids[]', String(id)]),
    )
    const batch = await getJson(`${FORUM_URL}/t/${topicId}/posts.json?${query}`)
    if (!Array.isArray(batch.post_stream?.posts)) throw new Error(`invalid post batch for topic ${topicId}`)
    for (const post of batch.post_stream.posts) posts.set(post.id, post)
  }
  const pins = stream.map((id) => {
    const post = posts.get(id)
    if (!post || !Number.isSafeInteger(post.post_number) || typeof post.cooked !== 'string') {
      throw new Error(`missing or invalid post ${id} in topic ${topicId}`)
    }
    return { id, number: post.post_number, updated_at: post.updated_at, content_sha256: hash(post.cooked) }
  })
  const firstPost = [...posts.values()].find((post) => post.post_number === 1)
  if (!firstPost || typeof topic.title !== 'string')
    throw new Error(`missing opening post or title for topic ${topicId}`)
  return {
    topic_id: topicId,
    source: `${FORUM_URL}/t/${topicId}`,
    category_id: topic.category_id,
    classification: classifyTopic(topic.title, topic.category_id, firstPost.cooked),
    created_at: topic.created_at,
    last_posted_at: topic.last_posted_at,
    complete_post_stream: true,
    post_count: pins.length,
    post_set_sha256: hash(JSON.stringify(pins)),
    posts: pins,
  }
}

async function collectDisclosures(options, ledgerMarkdown, getJson = fetchJson) {
  const ledger = readLedger(ledgerMarkdown)
  const report = {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    since: options.since,
    until: options.until,
    selection: 'Title keywords on topics bumped within the inclusive UTC date window; manual review required.',
    ledger_sha256: hash(ledgerMarkdown),
    pages_fetched: 0,
    page_payload_sha256: [],
    discovery_complete: false,
    stop_reason: 'max_pages',
    candidates: [],
    already_listed: [],
    exclusions: [],
    errors: [],
  }
  const selected = new Set()
  const seen = new Set()
  for (let page = 0; page < options.maxPages; page += 1) {
    try {
      const listing = await getJson(`${FORUM_URL}/latest.json?page=${page}&order=activity`)
      const topics = listing.topic_list?.topics
      if (!Array.isArray(topics)) throw new Error('invalid latest-topic listing')
      report.pages_fetched += 1
      report.page_payload_sha256.push(hash(JSON.stringify(listing)))
      if (!topics.length) {
        report.discovery_complete = true
        report.stop_reason = 'empty_page'
        break
      }
      const activityDates = []
      let newTopics = 0
      for (const topic of topics) {
        if (!Number.isSafeInteger(topic.id) || typeof topic.title !== 'string')
          throw new Error('invalid topic metadata')
        const activity = validateDate((topic.bumped_at || topic.last_posted_at || topic.created_at || '').slice(0, 10))
        if (!topic.pinned) activityDates.push(activity)
        if (!seen.has(topic.id)) newTopics += 1
        seen.add(topic.id)
        if (options.since <= activity && activity <= options.until && classifyTopic(topic.title, topic.category_id)) {
          selected.add(topic.id)
        }
      }
      // An old pinned topic must not make the scan stop before later pages.
      if (activityDates.length && activityDates.every((date) => date < options.since)) {
        report.discovery_complete = true
        report.stop_reason = 'window_exhausted'
        break
      }
      if (!newTopics) throw new Error('pagination repeated without progress')
    } catch (error) {
      report.errors.push({ page, message: error.message })
      report.stop_reason = 'fetch_error'
      break
    }
  }
  for (const topicId of [...selected].sort((a, b) => a - b)) {
    try {
      const topic = await fetchTopic(topicId, getJson)
      if (['product', 'node_operator'].includes(topic.classification)) report.exclusions.push(topic)
      else if (ledger.topicIds.has(topicId)) report.already_listed.push(topic)
      else if (topic.classification) report.candidates.push(topic)
      else report.exclusions.push({ ...topic, classification: 'title_changed' })
    } catch (error) {
      report.errors.push({ topic_id: topicId, message: error.message })
    }
  }
  report.collection_complete = report.discovery_complete && report.errors.length === 0
  return report
}

async function run() {
  const ledgerMarkdown = fs.readFileSync(LEDGER_PATH, 'utf8')
  const options = parseOptions(process.argv.slice(2), readLedger(ledgerMarkdown).latestDate)
  const report = await collectDisclosures(options, ledgerMarkdown)
  fs.mkdirSync(REPORT_DIRECTORY, { recursive: true })
  const output = path.join(REPORT_DIRECTORY, `disclosures-${report.fetched_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
  console.log(`Disclosure candidates written → ${output}`)
  console.log(
    `candidates=${report.candidates.length} already_listed=${report.already_listed.length} excluded=${report.exclusions.length} complete=${report.collection_complete} errors=${report.errors.length}`,
  )
  for (const error of report.errors) console.error(JSON.stringify(error))
  return report.collection_complete ? 0 : 1
}

if (require.main === module) runTask(run)

module.exports = { classifyTopic, collectDisclosures, fetchTopic, parseOptions, readLedger, run }
