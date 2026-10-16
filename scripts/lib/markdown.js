const GITHUB_ALERT_TYPES = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
}

const GITHUB_ALERT_PATTERN = /^ {0,3}>[ \t]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i
const BLOCKQUOTE_LINE_PATTERN = /^ {0,3}>[ \t]?(.*)$/
const OPENING_FENCE_PATTERN = /^ {0,3}(`{3,}|~{3,})/
const CLOSING_FENCE_PATTERN = /^ {0,3}(`+|~+)[ \t]*$/
const TABLE_DELIMITER_CELL_PATTERN = /^:?-+:?$/

function splitMarkdownLines(markdown) {
  return markdown.match(/[^\r\n]*(?:\r\n|\n|$)/g)?.filter(Boolean) || []
}

function parseMarkdownLine(rawLine) {
  const newline = rawLine.match(/\r?\n$/)?.[0] || ''
  const content = rawLine.slice(0, rawLine.length - newline.length)
  return { content, newline }
}

function findOpeningFence(content) {
  return content.match(OPENING_FENCE_PATTERN)?.[1] || null
}

function closesFence(content, openingFence) {
  const closingFence = content.match(CLOSING_FENCE_PATTERN)?.[1]
  return closingFence?.[0] === openingFence[0] && closingFence.length >= openingFence.length
}

function findAlertType(content) {
  const githubType = content.match(GITHUB_ALERT_PATTERN)?.[1]
  return GITHUB_ALERT_TYPES[githubType?.toUpperCase()] || null
}

function convertAlertBlock(rawLines, markerIndex, alertType) {
  const markerLine = parseMarkdownLine(rawLines[markerIndex])
  const bodyLines = []
  let lastNewline = ''
  let nextIndex = markerIndex + 1

  while (nextIndex < rawLines.length) {
    const line = parseMarkdownLine(rawLines[nextIndex])
    const blockquoteLine = line.content.match(BLOCKQUOTE_LINE_PATTERN)
    if (!blockquoteLine) break

    bodyLines.push(blockquoteLine[1] + line.newline)
    lastNewline = line.newline
    nextIndex += 1
  }

  if (bodyLines.length === 0) return null

  const newlineBeforeClosingFence = lastNewline ? '' : markerLine.newline
  const markdown =
    `:::${alertType}${markerLine.newline}` + bodyLines.join('') + `${newlineBeforeClosingFence}:::${lastNewline}`

  return { markdown, nextIndex }
}

function convertGithubAlerts(markdown) {
  const lines = splitMarkdownLines(markdown)
  const output = []
  let openFence = null
  let index = 0

  while (index < lines.length) {
    const line = parseMarkdownLine(lines[index])

    if (openFence) {
      output.push(lines[index])
      if (closesFence(line.content, openFence)) openFence = null
      index += 1
      continue
    }

    openFence = findOpeningFence(line.content)
    if (openFence) {
      output.push(lines[index])
      index += 1
      continue
    }

    const alertType = findAlertType(line.content)
    const convertedAlert = alertType ? convertAlertBlock(lines, index, alertType) : null
    if (convertedAlert) {
      output.push(convertedAlert.markdown)
      index = convertedAlert.nextIndex
      continue
    }

    output.push(lines[index])
    index += 1
  }

  return output.join('')
}

function isEscaped(value, index) {
  let backslashes = 0
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) backslashes += 1
  return backslashes % 2 === 1
}

function splitUnescapedPipes(value) {
  const cells = ['']
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '|' && !isEscaped(value, index)) cells.push('')
    else cells[cells.length - 1] += value[index]
  }
  return cells
}

function splitTableRow(line) {
  const trimmed = line.trim()
  const cells = splitUnescapedPipes(trimmed)
  if (cells.length === 1) return null

  if (trimmed.startsWith('|')) cells.shift()
  if (trimmed.endsWith('|') && !isEscaped(trimmed, trimmed.length - 1)) cells.pop()
  if (cells.length === 0) return null

  return cells.map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

function rebuildTableRow(line, cells) {
  const leadingWhitespace = line.match(/^\s*/)[0]
  const trailingWhitespace = line.match(/\s*$/)[0]
  let content = line.slice(leadingWhitespace.length, line.length - trailingWhitespace.length)
  const leadingPipe = content.startsWith('|')
  const trailingPipe = content.endsWith('|') && !isEscaped(content, content.length - 1)

  if (leadingPipe) content = content.slice(1)
  if (trailingPipe) content = content.slice(0, -1)

  const segments = splitUnescapedPipes(content)
  if (segments.length > cells.length) return line
  while (segments.length < cells.length) segments.push(' ')

  const rebuilt = segments
    .map((segment, index) => {
      const cell = String(cells[index]).replace(/\|/g, '\\|')
      if (segment.trim() === '') return ` ${cell} `
      return segment.replace(/^(\s*).*?(\s*)$/, (_match, leading, trailing) => leading + cell + trailing)
    })
    .join('|')

  return leadingWhitespace + (leadingPipe ? '|' : '') + rebuilt + (trailingPipe ? '|' : '') + trailingWhitespace
}

function parseTableHeader(lines, headerIndex) {
  const headers = splitTableRow(lines[headerIndex])
  const delimiters = splitTableRow(lines[headerIndex + 1] || '')
  if (!headers || !delimiters || headers.length !== delimiters.length) return null
  if (!delimiters.every((cell) => TABLE_DELIMITER_CELL_PATTERN.test(cell))) return null
  return headers
}

function parseMarkdownTable(lines, headerIndex) {
  const headers = parseTableHeader(lines, headerIndex)
  if (!headers) return null

  const rows = []
  let lineIndex = headerIndex + 2
  while (lineIndex < lines.length) {
    if (parseTableHeader(lines, lineIndex)) break
    const cells = splitTableRow(lines[lineIndex])
    if (!cells) break
    rows.push({ cells, lineIndex })
    lineIndex += 1
  }

  return { headers, rows, nextLineIndex: lineIndex }
}

function* scanMarkdownTables(lines) {
  for (let lineIndex = 0; lineIndex < lines.length - 1; lineIndex += 1) {
    const table = parseMarkdownTable(lines, lineIndex)
    if (!table) continue

    yield table
    lineIndex = table.nextLineIndex - 1
  }
}

module.exports = { convertGithubAlerts, parseMarkdownTable, rebuildTableRow, scanMarkdownTables, splitTableRow }
