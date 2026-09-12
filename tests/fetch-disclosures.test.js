const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const {
  classifyTopic,
  collectDisclosures,
  fetchTopic,
  parseOptions,
  readLedger,
  run,
} = require('../scripts/fetch-disclosures')

const LEDGER = `# Security Disclosures
| Date | Type | Severity | Title | Links |
| --- | --- | --- | --- | --- |
| 2026-03-23 | Bug Bounty | Low | Bulletin | [Forum](https://research.lido.fi/t/bulletin/42/3) |
`
const OPTIONS = { since: '2026-03-23', until: '2026-09-11', maxPages: 5 }

function listingTopic(id, overrides = {}) {
  return { id, title: 'Security Disclosure', category_id: 1, bumped_at: '2026-08-06T00:00:00Z', ...overrides }
}

function topic(id, overrides = {}) {
  return {
    ...listingTopic(id),
    title: 'Security Disclosure',
    post_stream: {
      stream: [id * 10],
      posts: [{ id: id * 10, post_number: 1, username: 'not-retained', cooked: '<p>Protocol report.</p>' }],
    },
    ...overrides,
  }
}

function api(pages, topics) {
  return async (url) => {
    const parsed = new URL(url)
    if (parsed.pathname === '/latest.json')
      return { topic_list: { topics: pages[Number(parsed.searchParams.get('page'))] || [] } }
    const id = Number(parsed.pathname.match(/\/t\/(\d+)/)[1])
    if (!topics[id]) throw new Error('HTTP 503')
    return topics[id]
  }
}

test('reads ledger dates and deduplicates slugged, numeric, and reply topic links', () => {
  const markdown =
    LEDGER +
    '| 2026-08-06 | Incident | Low | Report | [Forum](https://research.lido.fi/t/43/3) [Duplicate](https://research.lido.fi/t/name/43) |\n'
  const ledger = readLedger(markdown)
  assert.equal(ledger.latestDate, '2026-08-06')
  assert.deepEqual([...ledger.topicIds], [42, 43])
  assert.throws(() => readLedger('# Empty ledger'), /no dated/)
})

test('validates manual date windows and pagination limits', () => {
  assert.equal(parseOptions([], '2026-03-23').since, '2026-03-23')
  assert.deepEqual(parseOptions(['--until', '2026-09-11', '--max-pages', '7'], '2026-03-23'), {
    ...OPTIONS,
    maxPages: 7,
  })
  for (const argv of [
    ['--since', '2026-02-30'],
    ['--max-pages', '0'],
    ['--until', '2025-01-01'],
    ['--write'],
    ['--unknown', '1'],
  ]) {
    assert.throws(() => parseOptions(argv, '2026-03-23'))
  }
})

test('classifies candidates with product and node-operator routing precedence', () => {
  assert.equal(classifyTopic('Security disclosure', 12), 'node_operator')
  assert.equal(classifyTopic('Lido Earn security bulletin', 1), 'product')
  assert.equal(classifyTopic('Loss coverage for an incident', 9, '<p>Lido Earn contributors report...</p>'), 'product')
  assert.equal(classifyTopic('Security bulletin', 1), 'explicit_disclosure')
  assert.equal(classifyTopic('Post-mortem', 1), 'review_required')
  assert.equal(classifyTopic('New vulnerabilities', 1), 'review_required')
  assert.equal(classifyTopic('Routine update', 1), null)
})

test('discovers weakness-only titles while retaining product and operator routing', async () => {
  const titles = ['Recovery-lever weakness', 'Accounting weaknesses', 'Lido Earn weakness', 'Validator weakness']
  const listings = titles.map((title, index) => listingTopic(43 + index, { title, category_id: index === 3 ? 12 : 1 }))
  const topics = Object.fromEntries(listings.map((item) => [item.id, topic(item.id, item)]))
  const report = await collectDisclosures(OPTIONS, LEDGER, api([listings], topics))

  assert.equal(report.collection_complete, true)
  assert.deepEqual(
    report.candidates.map((row) => [row.topic_id, row.classification]),
    [
      [43, 'review_required'],
      [44, 'review_required'],
    ],
  )
  assert.deepEqual(
    report.exclusions.map((row) => [row.topic_id, row.classification]),
    [
      [45, 'product'],
      [46, 'node_operator'],
    ],
  )
})

test('fetches all missing post batches and retains hashes without text or identities', async () => {
  const posts = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    post_number: index + 1,
    cooked: 'private-body',
    username: 'private-identity',
  }))
  const requests = []
  const result = await fetchTopic(42, async (url) => {
    requests.push(url)
    if (url.endsWith('/42.json'))
      return topic(42, {
        title: 'Security Disclosure private-title',
        post_stream: { stream: posts.map((post) => post.id), posts: [posts[0]] },
      })
    const ids = new URL(url).searchParams.getAll('post_ids[]').map(Number)
    return { post_stream: { posts: posts.filter((post) => ids.includes(post.id)) } }
  })
  assert.equal(requests.length, 3)
  assert.equal(result.post_count, 23)
  assert.equal(result.complete_post_stream, true)
  assert.match(result.post_set_sha256, /^[a-f0-9]{64}$/)
  assert.doesNotMatch(JSON.stringify(result), /private-body|private-title|private-identity|username|cooked/)
})

test('rejects missing posts, empty streams, and mismatched topic ids', async () => {
  await assert.rejects(
    fetchTopic(42, async () => topic(43)),
    /invalid post stream/,
  )
  await assert.rejects(
    fetchTopic(42, async () => topic(42, { post_stream: { stream: [], posts: [] } })),
    /invalid post stream/,
  )
  await assert.rejects(
    fetchTopic(42, async (url) =>
      url.endsWith('/42.json')
        ? topic(42, { post_stream: { stream: [1, 2], posts: [{ id: 1, post_number: 1, cooked: 'Report' }] } })
        : { post_stream: { posts: [] } },
    ),
    /missing or invalid post 2/,
  )
})

test('old pinned topics do not truncate discovery; repeated ids produce one candidate', async () => {
  const pages = [
    [listingTopic(1, { pinned: true, bumped_at: '2020-01-01T00:00:00Z' }), listingTopic(42)],
    [listingTopic(43), listingTopic(43)],
    [],
  ]
  const report = await collectDisclosures(OPTIONS, LEDGER, api(pages, { 42: topic(42), 43: topic(43) }))
  assert.equal(report.collection_complete, true)
  assert.equal(report.pages_fetched, 3)
  assert.deepEqual(
    report.candidates.map((row) => row.topic_id),
    [43],
  )
  assert.deepEqual(
    report.already_listed.map((row) => row.topic_id),
    [42],
  )
})

test('routes product incidents discovered from opening posts and excludes node-operator incidents', async () => {
  const report = await collectDisclosures(
    OPTIONS,
    LEDGER,
    api([[listingTopic(43), listingTopic(44)]], {
      43: topic(43, {
        post_stream: {
          stream: [430],
          posts: [{ id: 430, post_number: 1, cooked: 'Lido Earn contributors report an incident.' }],
        },
      }),
      44: topic(44, { category_id: 12 }),
    }),
  )
  assert.equal(report.candidates.length, 0)
  assert.deepEqual(
    report.exclusions.map((row) => row.classification),
    ['product', 'node_operator'],
  )
  assert.equal(report.collection_complete, true)
})

test('bounds discovery by inclusive activity dates', async () => {
  const pages = [
    [listingTopic(43, { bumped_at: '2026-03-23T23:59:59Z' }), listingTopic(44, { bumped_at: '2026-09-12T00:00:00Z' })],
    [listingTopic(45, { bumped_at: '2026-03-22T00:00:00Z' })],
  ]
  const report = await collectDisclosures(OPTIONS, LEDGER, api(pages, { 43: topic(43) }))
  assert.equal(report.stop_reason, 'window_exhausted')
  assert.deepEqual(
    report.candidates.map((row) => row.topic_id),
    [43],
  )
})

test('page limits and HTTP errors produce incomplete reports with discovered candidates retained', async () => {
  const limited = await collectDisclosures(
    { ...OPTIONS, maxPages: 1 },
    LEDGER,
    api([[listingTopic(43)]], { 43: topic(43) }),
  )
  assert.equal(limited.collection_complete, false)
  assert.equal(limited.stop_reason, 'max_pages')
  assert.equal(limited.candidates.length, 1)
  const failed = await collectDisclosures(OPTIONS, LEDGER, async () => {
    throw new Error('HTTP 429')
  })
  assert.equal(failed.collection_complete, false)
  assert.match(failed.errors[0].message, /HTTP 429/)
  const missingTopic = await collectDisclosures(OPTIONS, LEDGER, api([[listingTopic(43)]], {}))
  assert.equal(missingTopic.discovery_complete, true)
  assert.equal(missingTopic.collection_complete, false)
  assert.equal(missingTopic.errors[0].topic_id, 43)
})

test('repeated pagination is an error rather than complete coverage', async () => {
  const report = await collectDisclosures(
    OPTIONS,
    LEDGER,
    api([[listingTopic(43)], [listingTopic(43)]], { 43: topic(43) }),
  )
  assert.equal(report.collection_complete, false)
  assert.match(report.errors[0].message, /without progress/)
})

test('run returns nonzero for an incomplete collection and only writes a triage report', async () => {
  const original = {
    read: fs.readFileSync,
    write: fs.writeFileSync,
    mkdir: fs.mkdirSync,
    fetch: global.fetch,
    argv: process.argv,
    log: console.log,
    error: console.error,
  }
  const writes = []
  try {
    fs.readFileSync = () => LEDGER
    fs.mkdirSync = () => {}
    fs.writeFileSync = (destination, content) => writes.push({ destination, content })
    global.fetch = async () => ({ ok: false, status: 503 })
    process.argv = ['node', 'fetch-disclosures.js', '--until', '2026-09-11']
    console.log = () => {}
    console.error = () => {}
    assert.equal(await run(), 1)
    assert.equal(writes.length, 1)
    assert.match(writes[0].destination, /\.security-triage\/disclosures-.*\.json$/)
    assert.equal(JSON.parse(writes[0].content).collection_complete, false)
  } finally {
    fs.readFileSync = original.read
    fs.writeFileSync = original.write
    fs.mkdirSync = original.mkdir
    global.fetch = original.fetch
    process.argv = original.argv
    console.log = original.log
    console.error = original.error
  }
})
