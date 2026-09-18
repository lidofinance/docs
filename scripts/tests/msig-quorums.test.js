const assert = require('node:assert/strict')
const test = require('node:test')

const {
  decodeArrayLength,
  decodeUint,
  pinCommonBlock,
} = require('../fetch-msig-quorums')

function word(value) {
  return value.toString(16).padStart(64, '0')
}

test('Safe ABI values decode deterministically', () => {
  assert.equal(decodeUint(`0x${word(4)}`), 4)
  assert.equal(decodeArrayLength(`0x${word(32)}${word(7)}${word(0)}${word(0)}`), 7)
})

test('block pin requires two providers on one shared block hash', async () => {
  const originalFetch = global.fetch
  const blockHash = `0x${'ab'.repeat(32)}`
  global.fetch = async (url, options) => {
    const request = JSON.parse(options.body)
    const latest = url.endsWith('/one') ? '0x64' : '0x62'
    const result = request.method === 'eth_chainId' ? '0x1'
      : request.method === 'eth_blockNumber' ? latest
        : { hash: blockHash }
    return { ok: true, json: async () => ({ jsonrpc: '2.0', id: 1, result }) }
  }
  try {
    const pin = await pinCommonBlock(['https://rpc.test/one', 'https://rpc.test/two'])
    assert.equal(pin.blockNumber, 86)
    assert.equal(pin.blockTag, '0x56')
    assert.equal(pin.blockHash, blockHash)
    assert.equal(pin.providers.length, 2)
  } finally {
    global.fetch = originalFetch
  }
})
