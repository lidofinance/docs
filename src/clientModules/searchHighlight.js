const STORAGE_KEY = 'search-highlight-query'

// DocSearch modal: capture query on result click (for highlighting on target page)
if (typeof window !== 'undefined') {
  document.addEventListener(
    'click',
    (e) => {
      if (e.target.closest('.DocSearch-Hit a')) {
        const input = document.querySelector('.DocSearch-Input')
        if (input?.value) {
          sessionStorage.setItem(STORAGE_KEY, input.value.trim())
        }
      }
    },
    true,
  )
}

export function onRouteDidUpdate({ location, previousLocation }) {
  if (location.pathname.replace(/\/$/, '').endsWith('/search')) return

  // Source 1: DocSearch modal → sessionStorage (consumed immediately)
  let query = sessionStorage.getItem(STORAGE_KEY)
  if (query) {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  // Source 2: /search page → previousLocation has ?q=
  if (!query && previousLocation?.pathname?.replace(/\/$/, '').endsWith('/search')) {
    query = new URLSearchParams(previousLocation.search).get('q')?.trim()
  }

  if (!query) return
  requestAnimationFrame(() => setTimeout(() => highlightDocPage(query), 100))
}

function highlightDocPage(query) {
  const root = document.querySelector('article')
  if (!root) return

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return

  const marks = []
  const nodes = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement
      if (!p || p.closest('pre, code, .search-highlight, nav'))
        return NodeFilter.FILTER_REJECT
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode)

  for (const node of nodes) {
    const text = node.textContent
    const lower = text.toLowerCase()
    const ranges = []
    for (const term of terms) {
      let i = 0
      while ((i = lower.indexOf(term, i)) !== -1) {
        ranges.push([i, i + term.length])
        i += term.length
      }
    }
    if (!ranges.length) continue

    ranges.sort((a, b) => a[0] - b[0])
    const merged = [ranges[0]]
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1]
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1])
      else merged.push(ranges[i])
    }

    const frag = document.createDocumentFragment()
    let pos = 0
    for (const [start, end] of merged) {
      if (start > pos)
        frag.appendChild(document.createTextNode(text.slice(pos, start)))
      const mark = document.createElement('mark')
      mark.className = 'search-highlight'
      mark.textContent = text.slice(start, end)
      frag.appendChild(mark)
      marks.push(mark)
      pos = end
    }
    if (pos < text.length)
      frag.appendChild(document.createTextNode(text.slice(pos)))
    node.parentNode.replaceChild(frag, node)
  }

  if (!marks.length) return

  if (!window.location.hash) {
    marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  setTimeout(() => {
    marks.forEach((m) => m.classList.add('search-highlight--fade'))
    setTimeout(() => {
      marks.forEach((m) => {
        const t = document.createTextNode(m.textContent)
        m.parentNode?.replaceChild(t, m)
      })
    }, 1000)
  }, 5000)
}
