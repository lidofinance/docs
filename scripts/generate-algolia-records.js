/**
 * Generate DocSearch-compatible JSON records from Docusaurus build output.
 * Reads HTML files from ./build/ and outputs algolia-records.json.
 *
 * Usage: node scripts/generate-algolia-records.js
 */

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const BUILD_DIR = path.join(__dirname, '..', 'build')
const OUTPUT_FILE = path.join(__dirname, '..', 'algolia-records.json')
const BASE_URL = 'https://docs.lido.fi'

// Pages to skip (not real doc content)
const SKIP_PATHS = ['/404', '/search', '/assets/', '/img/']

/**
 * Load sidebar page ordering from Docusaurus build metadata.
 * Walks the prev/next linked list to assign sequential positions.
 */
function loadSidebarOrders() {
  const orders = new Map()
  const metaDir = path.join(__dirname, '..', '.docusaurus', 'docusaurus-plugin-content-docs')
  if (!fs.existsSync(metaDir)) return orders

  for (const pluginDir of fs.readdirSync(metaDir, { withFileTypes: true })) {
    if (!pluginDir.isDirectory()) continue
    const dir = path.join(metaDir, pluginDir.name)
    const pages = new Map()
    for (const file of fs.readdirSync(dir)) {
      if (!file.startsWith('site-') || !file.endsWith('.json')) continue
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))
        if (data.permalink && data.sidebar)
          pages.set(data.permalink.replace(/\/$/, '') || '/', data)
      } catch {}
    }
    let head = null
    for (const data of pages.values()) {
      if (!data.previous) { head = data; break }
    }
    if (!head) continue
    let pos = 0, current = head
    while (current) {
      const key = current.permalink.replace(/\/$/, '') || '/'
      if (orders.has(key)) break // cycle guard
      orders.set(key, pos++)
      const np = current.next?.permalink
      current = np ? pages.get(np.replace(/\/$/, '') || '/') : null
    }
  }
  console.log(`Loaded sidebar positions for ${orders.size} pages`)
  return orders
}

/**
 * Determine lvl0 category from URL path.
 */
function getLvl0(urlPath) {
  if (urlPath.startsWith('/run-on-lido/stvaults')) return 'stVaults'
  if (urlPath.startsWith('/run-on-lido/csm')) return 'Community Staking Module'
  if (urlPath.startsWith('/run-on-lido/node-operators'))
    return 'Node Operators'
  if (urlPath.startsWith('/run-on-lido')) return 'Run on Lido'
  if (urlPath.startsWith('/contracts')) return 'Contracts'
  if (urlPath.startsWith('/guides')) return 'Guides'
  if (urlPath.startsWith('/integrations')) return 'Integrations'
  if (urlPath.startsWith('/token-guides')) return 'Token Guides'
  if (urlPath.startsWith('/security')) return 'Security'
  if (urlPath.startsWith('/deployed-contracts')) return 'Deployed Contracts'
  if (urlPath.startsWith('/staking-modules')) return 'Staking Modules'
  if (urlPath.startsWith('/multisigs')) return 'Multisigs'
  if (urlPath.startsWith('/ipfs')) return 'IPFS'
  if (urlPath.startsWith('/lips')) return 'Lido Improvement Proposals'
  return 'Documentation'
}

/**
 * Recursively find all HTML files in a directory.
 */
function findHtmlFiles(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath))
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath)
    }
  }
  return results
}

// DocSearch weight.level values (higher = more important in ranking)
const LEVEL_WEIGHTS = { lvl1: 100, lvl2: 90, lvl3: 80, content: 70 }

/**
 * Compute pageRank from URL depth.
 * Shorter paths (parent pages) get higher rank → appear above children.
 *   /                        → depth 0 → pageRank 10
 *   /contracts               → depth 1 → pageRank 8
 *   /run-on-lido/stvaults    → depth 2 → pageRank 6
 *   .../building-guides      → depth 3 → pageRank 4
 *   .../pooled-staking-product → depth 4 → pageRank 2
 *   .../roles-and-permissions → depth 5 → pageRank 0
 */
function getPageRank(urlPath) {
  if (urlPath === '/') return 10
  const depth = urlPath.split('/').filter(Boolean).length
  return Math.max(0, 10 - depth * 2)
}

/**
 * Content-type score: guides rank above contract API references.
 * Higher value = shown first when standard ranking criteria tie.
 */
function getContentType(urlPath) {
  if (urlPath.startsWith('/run-on-lido/')) return 200
  const segments = urlPath.split('/').filter(Boolean)
  if (segments.includes('contracts')) return 50
  if (segments.some((s) => s.includes('guide'))) return 180
  return 100
}

/**
 * Clean text: collapse whitespace, trim.
 */
function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Extract the text from a heading element, excluding the hash-link anchor.
 */
function getHeadingText($, el) {
  const $el = $(el).clone()
  $el.find('.hash-link').remove()
  return cleanText($el.text())
}

/**
 * Process a single HTML file and return DocSearch records.
 */
function processHtmlFile(filePath) {
  const records = []
  const relativePath = path.relative(BUILD_DIR, filePath)
  // Convert file path to URL path: "contracts/lido/index.html" -> "/contracts/lido"
  let urlPath =
    '/' + relativePath.replace(/\\/g, '/').replace(/\/index\.html$/, '')
  if (urlPath === '/index') urlPath = '/'
  // remove trailing .html for non-index files
  urlPath = urlPath.replace(/\.html$/, '')

  // Check if we should skip this page
  if (SKIP_PATHS.some((skip) => urlPath.startsWith(skip))) return records

  const html = fs.readFileSync(filePath, 'utf-8')
  const $ = cheerio.load(html)

  const article = $('article')
  if (article.length === 0) return records

  const fullUrl = BASE_URL + urlPath
  const lvl0 = getLvl0(urlPath)

  // Get page title from h1
  const h1 = article.find('h1').first()
  const pageTitle = h1.length ? getHeadingText($, h1) : ''
  if (!pageTitle) return records

  let position = 0

  function makeRecord(type, anchor, url, content, hierarchy) {
    return {
      objectID: `${urlPath}${anchor ? `-${anchor}` : ''}-${position}`,
      url,
      url_without_anchor: fullUrl,
      content,
      type,
      anchor,
      hierarchy,
      customRank_contentType: getContentType(urlPath),
      customRank_pageRank: getPageRank(urlPath),
      customRank_level: LEVEL_WEIGHTS[type] || 70,
      customRank_position: position++,
      customRank_sidebarPosition: sidebarOrders.get(urlPath) ?? 999,
    }
  }

  // Record for the page title itself (lvl1)
  records.push(
    makeRecord('lvl1', null, fullUrl, null, {
      lvl0,
      lvl1: pageTitle,
      lvl2: null,
      lvl3: null,
      lvl4: null,
      lvl5: null,
      lvl6: null,
    })
  )

  // Walk through the article content after h1
  const contentArea = article.find('.theme-doc-markdown')
  if (contentArea.length === 0) return records

  let currentH2 = null
  let currentH3 = null
  let currentH2Anchor = null
  let currentH3Anchor = null

  contentArea.children().each((_, el) => {
    const $el = $(el)
    const tag = el.tagName?.toLowerCase()

    if (tag === 'header') return // skip h1 header wrapper

    if (tag === 'h2') {
      currentH2 = getHeadingText($, el)
      currentH2Anchor = $el.attr('id') || null
      currentH3 = null
      currentH3Anchor = null

      records.push(
        makeRecord(
          'lvl2',
          currentH2Anchor,
          currentH2Anchor ? `${fullUrl}#${currentH2Anchor}` : fullUrl,
          null,
          { lvl0, lvl1: pageTitle, lvl2: currentH2, lvl3: null, lvl4: null, lvl5: null, lvl6: null }
        )
      )
      return
    }

    if (tag === 'h3') {
      currentH3 = getHeadingText($, el)
      currentH3Anchor = $el.attr('id') || null

      records.push(
        makeRecord(
          'lvl3',
          currentH3Anchor,
          currentH3Anchor ? `${fullUrl}#${currentH3Anchor}` : fullUrl,
          null,
          { lvl0, lvl1: pageTitle, lvl2: currentH2, lvl3: currentH3, lvl4: null, lvl5: null, lvl6: null }
        )
      )
      return
    }

    // For content elements: p, ul, ol, table, div (admonitions)
    if (['p', 'ul', 'ol', 'table', 'div'].includes(tag)) {
      const text = cleanText($el.text())
      if (!text || text.length < 3) return

      const anchor = currentH3Anchor || currentH2Anchor || null
      const url = anchor ? `${fullUrl}#${anchor}` : fullUrl

      records.push(
        makeRecord('content', anchor, url, text.slice(0, 2000), {
          lvl0, lvl1: pageTitle, lvl2: currentH2, lvl3: currentH3, lvl4: null, lvl5: null, lvl6: null,
        })
      )
    }
  })

  return records
}

// Main
const sidebarOrders = loadSidebarOrders()
const htmlFiles = findHtmlFiles(BUILD_DIR)
console.log(`Found ${htmlFiles.length} HTML files in build/`)

let allRecords = []
let skipped = 0

for (const file of htmlFiles) {
  const records = processHtmlFile(file)
  if (records.length === 0) skipped++
  allRecords = allRecords.concat(records)
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRecords, null, 2))
console.log(`Generated ${allRecords.length} records (skipped ${skipped} files)`)
console.log(`Output: ${OUTPUT_FILE}`)
