const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const MD_EXTENSIONS = ['.md', '.mdx']

function walkMarkdownFiles(rootDir) {
  const results = []
  if (!fs.existsSync(rootDir)) return results

  const stack = [rootDir]
  while (stack.length) {
    const dir = stack.pop()
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      if (entry.name.startsWith('_')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (!MD_EXTENSIONS.includes(path.extname(entry.name))) continue
      results.push(full)
    }
  }
  return results.sort()
}

function loadDoc(absPath, collectionPath, routeBasePath) {
  const raw = fs.readFileSync(absPath, 'utf8')
  const parsed = matter(raw)
  const fm = parsed.data || {}
  const body = parsed.content || ''

  const permalink = buildPermalink(absPath, collectionPath, routeBasePath, fm)
  const title = extractTitle(fm, body) || path.basename(absPath, path.extname(absPath))
  const description = extractDescription(fm, body)

  return {
    absPath,
    relPath: path.relative(collectionPath, absPath),
    permalink,
    frontmatter: fm,
    body,
    title,
    description,
  }
}

function buildPermalink(absPath, collectionPath, routeBasePath, frontmatter) {
  const base = normalizeBase(routeBasePath)

  if (frontmatter && frontmatter.slug) {
    const slug = frontmatter.slug.startsWith('/') ? frontmatter.slug : `/${frontmatter.slug}`
    return joinUrl(base, slug)
  }

  const rel = path.relative(collectionPath, absPath)
  const noExt = rel.replace(/\.(md|mdx)$/i, '')
  const parts = noExt.split(path.sep).filter(Boolean)

  if (parts.length && parts[parts.length - 1].toLowerCase() === 'index') {
    parts.pop()
  }

  const route = parts.length ? `/${parts.join('/')}` : '/'
  return joinUrl(base, route)
}

function normalizeBase(routeBasePath) {
  if (!routeBasePath || routeBasePath === '/') return ''
  return routeBasePath.startsWith('/') ? routeBasePath : `/${routeBasePath}`
}

function joinUrl(base, route) {
  if (!base) return route
  if (route === '/') return base
  return `${base}${route}`
}

function extractTitle(fm, body) {
  const raw =
    fm && typeof fm.title === 'string' && fm.title.trim() ? fm.title.trim() : (body.match(/^#\s+(.+?)\s*$/m) || [])[1]
  if (!raw) return null
  return raw
    .replace(/\{#[^}]+\}/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDescription(fm, body) {
  if (fm && typeof fm.description === 'string' && fm.description.trim()) {
    return fm.description.trim()
  }
  const cleaned = stripCodeFences(body)
  const paragraph = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .find((p) => {
      if (!p) return false
      if (p.startsWith('#')) return false
      if (p.startsWith(':::')) return false
      if (p.startsWith('import')) return false
      if (p.startsWith('export')) return false
      if (p.startsWith('>')) return false
      if (p.startsWith('<')) return false
      if (/^[-*+]\s/.test(p)) return false
      if (/^\d+\.\s/.test(p)) return false
      if (/^---+$/.test(p)) return false
      return true
    })
  if (!paragraph) return ''
  const text = sanitizeMdx(paragraph)
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 200 ? `${text.slice(0, 197)}...` : text
}

function stripCodeFences(body) {
  return body.replace(/```[\s\S]*?```/g, '')
}

function sanitizeMdx(content) {
  let out = content

  out = out.replace(/^\s*import\s+[^\n]+from\s+['"][^'"]+['"];?\s*$/gm, '')
  out = out.replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '')
  out = out.replace(/^\s*export\s+[^\n]+$/gm, '')

  out = out.replace(/<PdfViewer\s+[^/>]*pdfUrl=["']([^"']+)["'][^/>]*\/?>/g, (_, src) => {
    return `[PDF](${src})`
  })

  out = out.replace(/<Link\s+[^>]*to=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g, (_, href, text) => {
    const clean = text.replace(/<[^>]+>/g, '').trim()
    return `[${clean || href}](${href})`
  })

  out = stripJsxAttributes(out)

  out = stripUppercaseJsxComponents(out)

  out = out.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
    const hashes = '#'.repeat(Number(level))
    return `\n\n${hashes} ${text.replace(/\s+/g, ' ').trim()}\n\n`
  })

  out = out.replace(/<br\s*\/?>/gi, '\n')
  out = out.replace(/<(div|span|section|article|aside|header|footer)\b[^>]*>/gi, '')
  out = out.replace(/<\/(div|span|section|article|aside|header|footer)>/gi, '')

  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  out = out
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : line))
    .join('\n')
  out = out.replace(/\n{3,}/g, '\n\n').trim()

  return out
}

function stripJsxAttributes(content) {
  return content.replace(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, tag, attrs) => {
    if (!attrs) return `<${tag}>`
    let cleaned = attrs
    cleaned = cleaned.replace(/\s+className=(?:"[^"]*"|'[^']*'|\{[^}]*\})/g, '')
    cleaned = cleaned.replace(/\s+style=(?:"[^"]*"|'[^']*'|\{\{[^}]*\}\}|\{[^}]*\})/g, '')
    cleaned = cleaned.replace(/\s+on[A-Z][a-zA-Z]*=\{[^}]*\}/g, '')
    cleaned = cleaned.replace(/\s+[a-zA-Z][a-zA-Z0-9-]*=\{[^}]*\}/g, '')
    return `<${tag}${cleaned}>`
  })
}

function stripUppercaseJsxComponents(content) {
  let previous
  let out = content

  do {
    previous = out
    out = out.replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*\/>/g, '')
    out = out.replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/g, '$2')
  } while (out !== previous)

  return out
}

function escapeMarkdown(text) {
  if (!text) return ''
  return text.replace(/\r/g, '').replace(/\n+/g, ' ').trim()
}

module.exports = {
  walkMarkdownFiles,
  loadDoc,
  buildPermalink,
  sanitizeMdx,
  extractTitle,
  extractDescription,
  escapeMarkdown,
}
