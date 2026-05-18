const fs = require('fs')
const path = require('path')
const { walkMarkdownFiles, loadDoc, sanitizeMdx, escapeMarkdown } = require('../_shared/markdown-utils')

module.exports = function llmsTxtPlugin(_context, options) {
  const {
    collections = [],
    siteTitle = 'Documentation',
    siteDescription = '',
    indexFilename = 'llms.txt',
    fullFilename = 'llms-full.txt',
  } = options || {}

  return {
    name: 'lido-llms-txt',
    async postBuild({ siteConfig, outDir, siteDir }) {
      const siteUrl = (siteConfig.url || '').replace(/\/$/, '')

      const sections = collections.map((collection) => {
        const collectionPath = path.resolve(siteDir, collection.path)
        const files = walkMarkdownFiles(collectionPath)
        const docs = files
          .map((file) => loadDoc(file, collectionPath, collection.routeBasePath))
          .filter((doc) => !doc.frontmatter.draft && doc.frontmatter.unlisted !== true)
          .sort((a, b) => a.permalink.localeCompare(b.permalink))
        return { ...collection, docs }
      })

      const indexBody = renderIndex(sections, siteUrl, siteTitle, siteDescription)
      const fullBody = renderFull(sections, siteUrl, siteTitle, siteDescription)

      fs.writeFileSync(path.join(outDir, indexFilename), indexBody, 'utf8')
      fs.writeFileSync(path.join(outDir, fullFilename), fullBody, 'utf8')

      const total = sections.reduce((acc, s) => acc + s.docs.length, 0)
      console.log(
        `[llms-txt] generated ${indexFilename} and ${fullFilename} (${total} docs across ${sections.length} collections)`,
      )
    },
  }
}

function renderIndex(sections, siteUrl, siteTitle, siteDescription) {
  const lines = []
  lines.push(`# ${siteTitle}`)
  lines.push('')
  if (siteDescription) {
    for (const line of siteDescription.split('\n')) {
      lines.push(`> ${line}`)
    }
    lines.push('')
  }

  for (const section of sections) {
    if (!section.docs.length) continue
    lines.push(`## ${section.label || section.routeBasePath}`)
    lines.push('')
    for (const doc of section.docs) {
      const url = `${siteUrl}${doc.permalink}`
      const desc = escapeMarkdown(doc.description)
      lines.push(desc ? `- [${doc.title}](${url}): ${desc}` : `- [${doc.title}](${url})`)
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

function renderFull(sections, siteUrl, siteTitle, siteDescription) {
  const parts = [`# ${siteTitle} - Full Content`, '']
  if (siteDescription) {
    parts.push(`> ${siteDescription.replace(/\n/g, ' ')}`)
    parts.push('')
  }

  for (const section of sections) {
    if (!section.docs.length) continue
    parts.push(`---`)
    parts.push(`## Section: ${section.label || section.routeBasePath}`)
    parts.push('')
    for (const doc of section.docs) {
      const url = `${siteUrl}${doc.permalink}`
      const body = sanitizeMdx(doc.body)
      parts.push(`---`)
      parts.push(`<!-- source: ${url} -->`)
      parts.push('')
      const head = body.split('\n').slice(0, 20).join('\n')
      const hasTitleAlready = /^#\s+/m.test(head) || (doc.title && head.includes(`# ${doc.title}`))
      if (!hasTitleAlready) {
        parts.push(`# ${doc.title}`)
        parts.push('')
      }
      parts.push(body)
      parts.push('')
    }
  }

  return parts.join('\n').trim() + '\n'
}
