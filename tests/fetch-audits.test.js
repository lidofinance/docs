const test = require('node:test')
const assert = require('node:assert/strict')

const { preprocessMarkdown, sortAuditsAndCount } = require('../scripts/fetch-audits')

const alertTypes = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
}

for (const [githubType, docusaurusType] of Object.entries(alertTypes)) {
  test(`converts GitHub ${githubType} to Docusaurus ${docusaurusType}`, () => {
    const input = `> [!${githubType}]\n> Message.\n`
    const expected = `:::${docusaurusType}\nMessage.\n:::\n`

    assert.equal(preprocessMarkdown(input), expected)
  })
}

test('preserves content around a multiline alert', () => {
  const input = `Before

> [!WARNING]
> First line.
>
> Second line with a [link](https://example.com).

After`

  const expected = `Before

:::warning
First line.

Second line with a [link](https://example.com).
:::

After`

  assert.equal(preprocessMarkdown(input), expected)
})

test('converts an alert at the end of the file', () => {
  const input = '> [!WARNING]  \n> Take care.'
  const expected = ':::warning\nTake care.\n:::'

  assert.equal(preprocessMarkdown(input), expected)
})

test('preserves Markdown and nested quotes inside an alert', () => {
  const input = `> [!WARNING]
> **Before continuing:**
>
> - Check the first item.
> - Check the second item.
>
> > Keep this as a nested quote.
`
  const expected = `:::warning
**Before continuing:**

- Check the first item.
- Check the second item.

> Keep this as a nested quote.
:::
`

  assert.equal(preprocessMarkdown(input), expected)
})

test('converts multiple alert types independently', () => {
  const input = `> [!NOTE]
> First.

Between.

> [!CAUTION]
> Second.
`
  const expected = `:::note
First.
:::

Between.

:::caution
Second.
:::
`

  assert.equal(preprocessMarkdown(input), expected)
})

test('preserves CRLF line endings in a converted alert', () => {
  const input = '> [!TIP]\r\n> First.\r\n>\r\n> Second.\r\n\r\nAfter\r\n'
  const expected = ':::tip\r\nFirst.\r\n\r\nSecond.\r\n:::\r\n\r\nAfter\r\n'

  assert.equal(preprocessMarkdown(input), expected)
})

test('accepts valid blockquote whitespace and lowercase alert types', () => {
  const input = `  >[!warning]
  >First line.
  >\tSecond line.
`
  const expected = `:::warning
First line.
Second line.
:::
`

  assert.equal(preprocessMarkdown(input), expected)
})

test('does not change ordinary blockquotes or unknown GitHub alerts', () => {
  const input = `> Ordinary quote.

> [!QUESTION]
> A question.
`

  assert.equal(preprocessMarkdown(input), input)
})

test('does not change alert syntax inside fenced code blocks', () => {
  const backticks = `\`\`\`md
> [!IMPORTANT]
> Example only.
\`\`\`
`
  const tildes = `~~~md
> [!CAUTION]
> Example only.
~~~
`

  assert.equal(preprocessMarkdown(backticks), backticks)
  assert.equal(preprocessMarkdown(tildes), tildes)
})

test('does not convert an alert marker without a quoted body', () => {
  const input = '> [!IMPORTANT]\nUnquoted text.\n'

  assert.equal(preprocessMarkdown(input), input)
})

test('rewrites relative PDF and docs.lido.fi links', () => {
  const input = [
    '[Report](reports/audit.pdf)',
    '[Guide](https://docs.lido.fi/guides/example)',
    '[Renamed](https://docs.lido.fi/token-guides/wsteth-bridging-guide#the-proposed-configuration)',
    '[External](https://example.com/report.pdf)',
  ].join('\n')

  const expected = [
    '[Report](https://github.com/lidofinance/audits/blob/main/reports/audit.pdf)',
    '[Guide](/guides/example)',
    '[Renamed](/token-guides/cross-chain-tokens-guide#mainnet-proposed-configuration)',
    '[External](https://example.com/report.pdf)',
  ].join('\n')

  assert.equal(preprocessMarkdown(input), expected)
})

test('sorts reports by date and refreshes section counts', () => {
  const input = `Introduction.

## Reports (99 reports)

Section preamble.

### 01-2024 Older

Older report.

### 12-2025 Newer

Newer report.

## Lido Earn

### 01-2025 Separate report
`

  const { content, counts } = sortAuditsAndCount(input)

  assert.deepEqual(counts, { '## Reports': 2 })
  assert.match(content, /## Reports \(2 reports\)/)
  assert.ok(content.indexOf('### 12-2025 Newer') < content.indexOf('### 01-2024 Older'))
  assert.match(content, /Section preamble\./)
})

test('omits audit sections maintained on separate pages', () => {
  const input = `# Audits

## Lido Earn

### 03-2025 Earn report

Hidden here.

## Protocol

### 04-2025 Protocol report

Visible here.
`

  const { content, counts } = sortAuditsAndCount(input)

  assert.doesNotMatch(content, /Lido Earn|Earn report|Hidden here/)
  assert.match(content, /## Protocol \(1 reports\)/)
  assert.deepEqual(counts, { '## Protocol': 1 })
})

test('fails when the separately maintained audit section is missing', () => {
  const input = `# Audits

## Protocol

### 04-2025 Protocol report
`

  assert.throws(() => sortAuditsAndCount(input), /required audit section not found: ## Lido Earn/)
})
