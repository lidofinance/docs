const test = require('node:test')
const assert = require('node:assert/strict')

const {
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
} = require('../scripts/fetch-lips')

test('parses YAML front matter', () => {
  const markdown = `---
LIP: 42
Title: "Upgrade: phase two"
Status: Review
---

# Proposal
`

  assert.deepEqual(parseYamlFrontMatter(markdown), {
    lip: 42,
    title: 'Upgrade: phase two',
    status: 'Review',
  })
  assert.equal(parseYamlFrontMatter('# No metadata\n'), null)
})

test('parses the legacy metadata table', () => {
  const markdown = `| LIP | Title | Status | Discussions-to |
| --- | --- | --- | --- |
| 7 | Staking router | Final | https://example.com/topic |

# Proposal
`

  assert.deepEqual(parseMarkdownTableHeader(markdown), {
    lip: '7',
    title: 'Staking router',
    status: 'Final',
    'discussions-to': 'https://example.com/topic',
  })
})

test('only treats a leading table as legacy metadata', () => {
  const markdown = `# Proposal

This table belongs to the proposal body.

| LIP | Title | Status | Author |
| --- | --- | --- | --- |
| 999 | Fabricated metadata | Final | Nobody |
`

  assert.equal(parseMarkdownTableHeader(markdown), null)
  assert.deepEqual(parseMetadata(markdown), {})
  assert.equal(parseLip('invalid.md', markdown), null)
})

test('validates legacy table separators and preserves empty cells', () => {
  const malformed = `| LIP | Title |
| --- | title |
| 7 | Invalid |
`
  const withEmptyCell = `| LIP | Title | Status |
| --- | --- | --- |
| 7 | | Final |
`

  assert.equal(parseMarkdownTableHeader(malformed), null)
  assert.deepEqual(parseMarkdownTableHeader(withEmptyCell), {
    lip: '7',
    title: '',
    status: 'Final',
  })
})

test('accepts GFM tables without outer pipes and with short delimiters', () => {
  const markdown = `LIP | Title | Status
- | - | -:
7 | Legacy proposal | Final
`

  assert.deepEqual(parseMarkdownTableHeader(markdown), {
    lip: '7',
    title: 'Legacy proposal',
    status: 'Final',
  })
})

test('prefers YAML metadata over the legacy table', () => {
  const markdown = `---
lip: 2
title: YAML title
---

| LIP | Title |
| --- | --- |
| 3 | Table title |
`

  assert.deepEqual(parseMetadata(markdown), {
    lip: 2,
    title: 'YAML title',
  })
  assert.deepEqual(parseMetadata('# No metadata\n'), {})
})

test('normalizes LIP numbers', () => {
  assert.equal(parseLipNumber(0), 0)
  assert.equal(parseLipNumber('LIP-0042'), 42)
  assert.equal(parseLipNumber('proposal 7 draft'), 7)
  assert.equal(parseLipNumber('missing'), null)
})

test('maps status aliases to canonical sections', () => {
  const cases = {
    draft: 'WIP',
    discussion: 'Proposed',
    voted: 'Approved',
    final: 'Implemented',
    declined: 'Rejected',
    withdrawn: 'Withdrawn',
    deferred: 'Deferred',
    deprecated: 'Moribund',
    unknown: 'WIP',
  }

  for (const [raw, expected] of Object.entries(cases)) {
    assert.equal(normalizeStatus(raw), expected)
  }
})

test('escapes table content', () => {
  assert.equal(escapeTableCell('first | second\nthird'), 'first &#124; second third')
})

test('renders discussion links', () => {
  assert.equal(renderDiscussionLinks(''), 'None')
  assert.equal(renderDiscussionLinks('null'), 'None')
  assert.equal(renderDiscussionLinks('https://one.example'), '[Link](https://one.example)')
  assert.equal(
    renderDiscussionLinks('https://one.example, https://two.example'),
    '[Link 1](https://one.example), [Link 2](https://two.example)',
  )
})

test('renders a LIP table row', () => {
  const table = renderTable([
    {
      number: 42,
      link: 'https://example.com/lip-42',
      title: 'A | B',
      author: 'Alice\nBob',
      discussion: 'https://example.com/discussion',
    },
  ])

  assert.match(table, /\| LIP&nbsp;# \| Title \| Author \| Discussions&#8209;to \|/)
  assert.match(
    table,
    /\| \[42\]\(https:\/\/example\.com\/lip-42\) \| A &#124; B \| Alice Bob \| \[Link\]\(https:\/\/example\.com\/discussion\) \|/,
  )
})

test('parses a LIP entry using its source file name', () => {
  const markdown = `---
lip: LIP-42
title: Test proposal
author: Alice
status: final
discussions-to: https://example.com/topic
---
`

  assert.deepEqual(parseLip('custom-name.md', markdown), {
    number: 42,
    status: 'Implemented',
    title: 'Test proposal',
    author: 'Alice',
    discussion: 'https://example.com/topic',
    link: 'https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/custom-name.md',
  })
  assert.equal(parseLip('invalid.md', '# Missing metadata\n'), null)
  assert.equal(parseLip('malformed.md', '---\nlip: [\n---\n'), null)
})

test('warns and skips a malformed LIP file', async (context) => {
  const warnings = []
  context.mock.method(global, 'fetch', async () => ({
    ok: true,
    text: async () => '# Missing metadata\n',
  }))
  context.mock.method(console, 'warn', (...parts) => warnings.push(parts.join(' ')))

  assert.equal(await fetchLip({ name: 'broken.md' }), null)
  assert.deepEqual(warnings, ['⚠️  skipping malformed: broken.md'])
})

test('groups LIPs by status and sorts them newest first', () => {
  const lips = [
    {
      number: 1,
      status: 'WIP',
      title: 'First',
      author: 'Alice',
      discussion: '',
      link: 'https://example.com/1',
    },
    {
      number: 3,
      status: 'WIP',
      title: 'Third',
      author: 'Bob',
      discussion: '',
      link: 'https://example.com/3',
    },
    {
      number: 2,
      status: 'Approved',
      title: 'Second',
      author: 'Carol',
      discussion: '',
      link: 'https://example.com/2',
    },
  ]

  const { content, counts } = buildLipDocument(lips)

  assert.deepEqual(counts, { WIP: 2, Approved: 1 })
  assert.ok(content.indexOf('[3]') < content.indexOf('[1]'))
  assert.ok(content.indexOf('## WIP') < content.indexOf('## Approved'))
  assert.doesNotMatch(content, /## Proposed/)
})
