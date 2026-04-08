/**
 * DocSearch modal behavior: query persistence, Enter → search page,
 * and no-initial-selection management.
 *
 * Query is only restored when reopening the modal on the page the user
 * navigated to from a search result, or on the page where they originally
 * opened the modal. Any other navigation clears the stored query.
 */
const PERSIST_KEY = 'docsearch-persist-query'
const CONTEXT_KEY = 'docsearch-persist-context'
const norm = (p) => p.replace(/\/$/, '')

// Track whether user explicitly selected a result via arrows/tab
let userNavigated = false
let firstArrowHandled = false

if (typeof window !== 'undefined') {
  // ── Save query as user types + reset selection state ─────────────
  document.addEventListener(
    'input',
    (e) => {
      if (!e.target.classList?.contains('DocSearch-Input')) return
      const val = e.target.value.trim()
      if (val) sessionStorage.setItem(PERSIST_KEY, val)
      else sessionStorage.removeItem(PERSIST_KEY)

      userNavigated = false
      firstArrowHandled = false
      document.querySelector('.DocSearch-Modal')?.classList.add('no-initial-selection')
    },
    true,
  )

  // ── Fix #1: Clear button clears sessionStorage ────────────────────
  document.addEventListener(
    'click',
    (e) => {
      if (e.target.closest('.DocSearch-Clear')) {
        sessionStorage.removeItem(PERSIST_KEY)
        sessionStorage.removeItem(CONTEXT_KEY)
      }
    },
    true,
  )

  // ── Fix #2: Save navigation context on result click ───────────────
  document.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest('.DocSearch-Hit a')
      if (!link) return
      const input = document.querySelector('.DocSearch-Input')
      const query = input?.value?.trim()
      if (!query) return
      sessionStorage.setItem(PERSIST_KEY, query)
      sessionStorage.setItem(
        CONTEXT_KEY,
        JSON.stringify({
          resultUrl: norm(new URL(link.href, location.origin).pathname),
          originUrl: norm(location.pathname),
        }),
      )
    },
    true,
  )

  // ── Fix #4: Enter → search page / active state management ────────
  document.addEventListener(
    'keydown',
    (e) => {
      const modal = document.querySelector('.DocSearch-Modal')
      if (!modal) return

      if (['ArrowDown', 'ArrowUp', 'Tab'].includes(e.key)) {
        userNavigated = true
        modal.classList.remove('no-initial-selection')
        if (!firstArrowHandled) {
          firstArrowHandled = true
          e.preventDefault()
          e.stopPropagation()
        }
        return
      }

      if (e.key === 'Enter' && !userNavigated) {
        const input = document.querySelector('.DocSearch-Input')
        const query = input?.value?.trim()
        if (!query) return

        e.preventDefault()
        e.stopPropagation()
        window.location.href = `/search/?q=${encodeURIComponent(query)}`
      }

      if (e.key === 'Enter' && userNavigated) {
        const input = document.querySelector('.DocSearch-Input')
        const query = input?.value?.trim()
        if (!query) return
        sessionStorage.setItem('search-highlight-query', query)
        const hit = modal.querySelector('.DocSearch-Hit[aria-selected="true"] a')
        if (!hit) return
        sessionStorage.setItem(PERSIST_KEY, query)
        sessionStorage.setItem(
          CONTEXT_KEY,
          JSON.stringify({
            resultUrl: norm(new URL(hit.href, location.origin).pathname),
            originUrl: norm(location.pathname),
          }),
        )
      }
    },
    true,
  )

  // Mouse hover on a hit reveals active state
  document.addEventListener(
    'mousemove',
    (e) => {
      if (e.target.closest?.('.DocSearch-Hit')) {
        userNavigated = true
        firstArrowHandled = true
        document.querySelector('.DocSearch-Modal')?.classList.remove('no-initial-selection')
      }
    },
    true,
  )

  // ── Modal open: restore query + set no-initial-selection ──────────
  new MutationObserver(() => {
    if (!document.body.classList.contains('DocSearch--active')) return

    userNavigated = false
    firstArrowHandled = false

    const fill = () => {
      const input = document.querySelector('.DocSearch-Input')
      if (!input) return requestAnimationFrame(fill)
      if (input.value) return // DocSearch already has initialQuery

      // Fix #3: On /search page, sync from URL ?q= param
      let query
      if (norm(location.pathname).endsWith('/search')) {
        query = new URLSearchParams(location.search).get('q')?.trim()
      }
      // Otherwise use persisted query
      if (!query) {
        query = sessionStorage.getItem(PERSIST_KEY)
      }
      if (!query) return

      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      set?.call(input, query)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    requestAnimationFrame(fill)

    // Add no-initial-selection class to suppress first-result highlight
    const addCls = () => {
      const modal = document.querySelector('.DocSearch-Modal')
      if (!modal) return requestAnimationFrame(addCls)
      modal.classList.add('no-initial-selection')
    }
    requestAnimationFrame(addCls)
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] })
}

// ── Fix #2: Clear stored query on navigation away from allowed pages ──
export function onRouteDidUpdate({ location, previousLocation }) {
  // When leaving /search page, save query so modal works on the target page
  if (previousLocation) {
    const prev = norm(previousLocation.pathname)
    const curr = norm(location.pathname)
    if (prev.endsWith('/search') && !curr.endsWith('/search')) {
      const q = new URLSearchParams(previousLocation.search).get('q')?.trim()
      if (q) {
        sessionStorage.setItem(PERSIST_KEY, q)
        sessionStorage.setItem(CONTEXT_KEY, JSON.stringify({ resultUrl: curr, originUrl: prev }))
        return
      }
    }
  }

  const raw = sessionStorage.getItem(CONTEXT_KEY)
  if (!raw) {
    sessionStorage.removeItem(PERSIST_KEY)
    return
  }

  try {
    const { resultUrl, originUrl } = JSON.parse(raw)
    const current = norm(location.pathname)
    if (current === resultUrl || current === originUrl) return
  } catch {
    // malformed — clear
  }

  sessionStorage.removeItem(PERSIST_KEY)
  sessionStorage.removeItem(CONTEXT_KEY)
}
