const fs = require('fs')
const path = require('path')
const { walkMarkdownFiles, loadDoc, sanitizeMdx } = require('../_shared/markdown-utils')

module.exports = function markdownSourcePlugin(_context, options) {
  const { collections = [] } = options || {}

  return {
    name: 'lido-markdown-source',
    async postBuild({ siteConfig, outDir, siteDir }) {
      const siteUrl = (siteConfig.url || '').replace(/\/$/, '')
      let written = 0
      const seen = new Map()

      for (const collection of collections) {
        const collectionPath = path.resolve(siteDir, collection.path)
        const files = walkMarkdownFiles(collectionPath)

        for (const file of files) {
          const doc = loadDoc(file, collectionPath, collection.routeBasePath)
          if (doc.frontmatter.draft) continue

          const targetPath = resolveTargetPath(outDir, doc.permalink)
          if (seen.has(targetPath)) {
            console.warn(
              `[markdown-source] permalink collision at ${doc.permalink}: ${seen.get(targetPath)} vs ${doc.relPath} (overwriting)`,
            )
          }
          seen.set(targetPath, doc.relPath)

          const body = sanitizeMdx(doc.body)
          const canonical = `${siteUrl}${doc.permalink}`
          const content = renderMarkdownSource(doc, canonical, body)

          fs.mkdirSync(path.dirname(targetPath), { recursive: true })
          fs.writeFileSync(targetPath, content, 'utf8')
          written += 1
        }
      }

      console.log(`[markdown-source] generated ${written} raw .md files`)
    },
  }
}

function resolveTargetPath(outDir, permalink) {
  const trimmed = permalink.replace(/^\/+/, '').replace(/\/+$/, '')
  const relative = trimmed === '' ? 'index.md' : `${trimmed}.md`
  return path.join(outDir, relative)
}

function renderMarkdownSource(doc, canonical, body) {
  const parts = [`<!-- canonical: ${canonical} -->`, '']
  if (!hasHeading(body, doc.title)) {
    parts.push(`# ${doc.title}`)
    parts.push('')
  }
  parts.push(body)
  return parts.join('\n').trim() + '\n'
}

function hasHeading(body, title) {
  const head = body.split('\n').slice(0, 20).join('\n')
  if (/^#\s+/m.test(head)) return true
  if (title && head.includes(`# ${title}`)) return true
  return false
}
