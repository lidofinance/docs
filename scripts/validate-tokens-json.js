// Validates static/tokens.json against the deployed-contracts pages,
// which are the source of truth for addresses. Fails the build when the
// manifest drifts from the pages or contains malformed entries.
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const manifestPath = path.join(root, 'static', 'tokens.json')
const sourcePages = ['docs/deployed-contracts/index.md', 'earn/deployment-contracts.md']

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const sources = sourcePages.map((p) => ({
  page: p,
  text: fs.readFileSync(path.join(root, p), 'utf8').toLowerCase(),
}))

const addressRe = /^0x[0-9a-fA-F]{40}$/
let failures = 0

const fail = (msg) => {
  console.error(`[tokens.json] ${msg}`)
  failures += 1
}

if (!Array.isArray(manifest.tokens) || manifest.tokens.length === 0) {
  fail('manifest has no tokens')
}

for (const token of manifest.tokens || []) {
  const label = `${token.symbol} (chainId ${token.chainId})`
  if (!token.symbol || !token.chainId) {
    fail(`entry missing symbol or chainId: ${JSON.stringify(token).slice(0, 80)}`)
    continue
  }
  for (const addr of [token.address, token.vaultAddress].filter(Boolean)) {
    if (!addressRe.test(addr)) {
      fail(`${label}: malformed address ${addr}`)
      continue
    }
    if (!sources.some((s) => s.text.includes(addr.toLowerCase()))) {
      fail(`${label}: address ${addr} not found on any source page (${sourcePages.join(', ')})`)
    }
  }
}

if (failures > 0) {
  console.error(`[tokens.json] ${failures} problem(s); the deployed-contracts pages are the source of truth`)
  process.exit(1)
}
console.log(`[tokens.json] ${manifest.tokens.length} entries match the deployed-contracts pages`)
