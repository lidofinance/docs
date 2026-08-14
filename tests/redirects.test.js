const test = require('node:test')
const assert = require('node:assert/strict')

const { redirects, resolveRedirect } = require('../config/redirects')

test('shares Docusaurus redirects with imported documentation', () => {
  assert.ok(
    redirects.some(
      ({ from, to }) =>
        from === '/token-guides/wsteth-bridging-guide' && to === '/token-guides/cross-chain-tokens-guide',
    ),
  )
  assert.equal(
    resolveRedirect('/token-guides/wsteth-bridging-guide#the-proposed-configuration'),
    '/token-guides/cross-chain-tokens-guide#mainnet-proposed-configuration',
  )
  assert.equal(resolveRedirect('/guides/current'), '/guides/current')
})
