const REQUEST_TIMEOUT_MS = 15_000

function addRequestTimeout(options = {}) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal
  return { ...options, signal }
}

async function fetchResponse(url, options) {
  const response = await fetch(url, addRequestTimeout(options))
  if (!response.ok) {
    if (response.body) await Promise.resolve(response.body.cancel()).catch(() => undefined)
    throw new Error(`HTTP ${response.status} → ${url}`)
  }
  return response
}

async function fetchText(url, options) {
  return (await fetchResponse(url, options)).text()
}

async function fetchJson(url, options) {
  return (await fetchResponse(url, options)).json()
}

module.exports = { fetchJson, fetchText }
