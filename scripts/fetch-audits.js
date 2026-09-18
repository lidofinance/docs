#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const { fetchText } = require('./lib/http')
const { convertGithubAlerts } = require('./lib/markdown')
const { printCounts } = require('./lib/output')
const { runTask } = require('./lib/tasks')
const { resolveRedirect } = require('../config/redirects')

const AUDITS_URL = 'https://raw.githubusercontent.com/lidofinance/audits/refs/heads/main/README.md'
const OUTPUT_PATH = path.join(__dirname, '../docs/security/audits.md')
const AUDITS_REPOSITORY_URL = 'https://github.com/lidofinance/audits/blob/main/'
const RELATIVE_PDF_LINK = /(\[.*?\]\()(?!http|https|#|\/|mailto:)([^)]+\.pdf)(\))/g
const DOCS_LINK = /(\]\()https:\/\/docs\.lido\.fi(\/[^)]*)?(\))/g
const SKIPPED_SECTION = '## Lido Earn'

function preprocessMarkdown(markdown) {
  return convertGithubAlerts(markdown)
    .replace(RELATIVE_PDF_LINK, (_, opening, relativePath, closing) => {
      return opening + AUDITS_REPOSITORY_URL + relativePath + closing
    })
    .replace(DOCS_LINK, (_, opening, pathWithFragment, closing) => {
      const localPath = pathWithFragment || '/'
      return opening + resolveRedirect(localPath) + closing
    })
}

function splitByHeading(lines, prefix) {
  const preamble = []
  const sections = []
  let currentSection = null

  for (const line of lines) {
    if (line.startsWith(prefix)) {
      currentSection = { heading: line, lines: [] }
      sections.push(currentSection)
    } else if (currentSection) {
      currentSection.lines.push(line)
    } else {
      preamble.push(line)
    }
  }

  return { preamble, sections }
}

function stripReportCount(heading) {
  return heading.replace(/\s*\(\d+\s+reports?\)$/i, '').trim()
}

function reportDateValue(heading) {
  const match = heading.match(/^###\s+(\d{1,2})-(\d{4})/)
  return match ? Number(match[2]) * 12 + Number(match[1]) : 0
}

function sortAuditsAndCount(markdown) {
  const document = splitByHeading(markdown.split('\n'), '## ')
  const output = [...document.preamble]
  const counts = {}
  let skippedSectionFound = false

  for (const section of document.sections) {
    const heading = stripReportCount(section.heading)
    if (heading === SKIPPED_SECTION) {
      skippedSectionFound = true
      continue
    }

    const { preamble, sections: reports } = splitByHeading(section.lines, '### ')
    reports.sort((left, right) => reportDateValue(right.heading) - reportDateValue(left.heading))

    counts[heading] = reports.length
    output.push(`${heading} (${reports.length} reports)`, ...preamble)
    for (const report of reports) {
      output.push(report.heading, ...report.lines)
    }
  }

  if (!skippedSectionFound) {
    throw new Error(`required audit section not found: ${SKIPPED_SECTION}`)
  }

  return { content: output.join('\n'), counts }
}

async function run() {
  const markdown = await fetchText(AUDITS_URL)
  const preprocessed = preprocessMarkdown(markdown)
  const { content, counts } = sortAuditsAndCount(preprocessed)

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, content, 'utf8')

  printCounts(counts)
  console.log('\n👌 Audits list written →', OUTPUT_PATH)
}

if (require.main === module) runTask(run)

module.exports = { preprocessMarkdown, run, sortAuditsAndCount }
