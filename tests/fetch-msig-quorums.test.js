const { afterEach, test } = require('node:test')
const assert = require('node:assert/strict')

const {
  createQuorumFetcher,
  decodeArrayLength,
  decodeUint,
  findSafeLink,
  formatCheck,
  rebuildTableRow,
  resolveQuorum,
  rpcCall,
  rpcCallWithFallback,
  scanQuorumSites,
  splitTableRow,
  updateQuorums,
} = require('../scripts/fetch-msig-quorums')

const ADDRESS = `0x${'a'.repeat(40)}`
const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

function abiWord(value) {
  return BigInt(value).toString(16).padStart(64, '0')
}

test('decodes Safe ABI results', () => {
  assert.equal(decodeUint(`0x${abiWord(3)}`), 3)
  assert.equal(decodeArrayLength(`0x${abiWord(32)}${abiWord(5)}`), 5)
})

test('rejects malformed Safe ABI results', () => {
  assert.throws(() => decodeUint('0x'), /empty rpc result/)
  assert.throws(() => decodeArrayLength('0x'), /not an address\[\] response/)
  assert.throws(() => decodeArrayLength(`0x${abiWord(64)}${abiWord(2)}`), /unexpected address\[\] offset/)
})

test('sends JSON-RPC eth_call requests', async () => {
  const requests = []
  global.fetch = async (url, options) => {
    requests.push({ url, options })
    return { ok: true, json: async () => ({ result: '0xresult' }) }
  }

  assert.equal(await rpcCall('https://rpc.example', ADDRESS, '0xselector'), '0xresult')
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://rpc.example')
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{ to: ADDRESS, data: '0xselector' }, 'latest'],
    id: 1,
  })
})

test('reports JSON-RPC errors', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ error: { message: 'execution reverted' } }),
  })

  await assert.rejects(rpcCall('https://rpc.example', ADDRESS, '0xselector'), /execution reverted/)
})

test('falls back to the next RPC endpoint', async () => {
  const calls = []
  global.fetch = async (url) => {
    calls.push(url)
    if (url === 'https://first.example') return { ok: false, status: 503 }
    return { ok: true, json: async () => ({ result: '0xresult' }) }
  }

  const result = await rpcCallWithFallback(['https://first.example', 'https://second.example'], ADDRESS, '0xselector')

  assert.equal(result, '0xresult')
  assert.deepEqual(calls, ['https://first.example', 'https://second.example'])
})

test('reports exhaustion of RPC fallbacks', async () => {
  global.fetch = async () => ({ ok: false, status: 503 })

  await assert.rejects(rpcCallWithFallback(['https://first.example'], ADDRESS, '0xselector'), /HTTP 503/)
  await assert.rejects(rpcCallWithFallback([], ADDRESS, '0xselector'), /no rpcs configured/)
})

test('resolves and validates an on-chain quorum', async () => {
  global.fetch = async (url, options) => {
    const { data } = JSON.parse(options.body).params[0]
    const result = data === '0xe75235b8' ? `0x${abiWord(2)}` : `0x${abiWord(32)}${abiWord(3)}`
    return { ok: true, json: async () => ({ result }) }
  }

  assert.equal(await resolveQuorum('eth', ADDRESS), '2/3')
  await assert.rejects(resolveQuorum('unknown', ADDRESS), /unsupported chain/)

  global.fetch = async (url, options) => {
    const { data } = JSON.parse(options.body).params[0]
    const result = data === '0xe75235b8' ? `0x${abiWord(4)}` : `0x${abiWord(32)}${abiWord(3)}`
    return { ok: true, json: async () => ({ result }) }
  }
  await assert.rejects(resolveQuorum('eth', ADDRESS), /invalid quorum: 4\/3/)
})

test('finds Safe references in arbitrary URLs', () => {
  assert.deepEqual(findSafeLink(`https://safe.example/app?tab=home&safe=ETH:${ADDRESS}`), {
    chain: 'eth',
    address: ADDRESS,
  })
  assert.equal(findSafeLink('https://example.com'), null)
})

test('splits and rebuilds Markdown table rows', () => {
  const source = '| Council |  2/3  | Active |'

  assert.deepEqual(splitTableRow(source), ['Council', '2/3', 'Active'])
  assert.deepEqual(splitTableRow('Council | 2/3'), ['Council', '2/3'])
  assert.deepEqual(splitTableRow('| Council \\| backup | 2/3 |'), ['Council | backup', '2/3'])
  assert.equal(rebuildTableRow(source, ['Council', '3/5', 'Active']), '| Council |  3/5  | Active |')
  assert.equal(rebuildTableRow('| $1 | $& | 2/3 |', ['$1', '$&', '3/5']), '| $1 | $& | 3/5 |')
})

test('finds and updates quorum cells in Markdown tables', () => {
  const lines = [
    '| Safe | Quorum | Notes |',
    '| --- | :---: | --- |',
    `| [Council](https://app.safe.global/home?safe=eth:${ADDRESS}) | 2/3 | Active |`,
    '',
  ]

  const sites = [...scanQuorumSites(lines)]

  assert.equal(sites.length, 1)
  assert.deepEqual(
    {
      lineNo: sites[0].lineNo,
      chain: sites[0].chain,
      address: sites[0].address,
      current: sites[0].current,
    },
    { lineNo: 2, chain: 'eth', address: ADDRESS, current: '2/3' },
  )

  sites[0].write('3/5')
  assert.match(lines[2], /\| 3\/5 \|/)
})

test('does not consume an adjacent Markdown table', async () => {
  const secondAddress = `0x${'b'.repeat(40)}`
  const secondSafe = `https://app.safe.global/home?safe=eth:${secondAddress}`
  const markdown = [
    '| Safe | Quorum |',
    '| --- | --- |',
    `| [Council](https://app.safe.global/home?safe=eth:${ADDRESS}) | 1/2 |`,
    '| Name | Safe |',
    '| --- | --- |',
    `| Treasury | [Safe](${secondSafe}) |`,
  ].join('\n')

  const requestedAddresses = []
  const { checks, content } = await updateQuorums(markdown, async (_chain, address) => {
    requestedAddresses.push(address)
    return '2/3'
  })

  assert.deepEqual(requestedAddresses, [ADDRESS])
  assert.equal(checks.length, 1)
  assert.match(content, /\| \[Council\].*\| 2\/3 \|/)
  assert.equal(content.split('\n').at(-1), `| Treasury | [Safe](${secondSafe}) |`)
})

test('repairs a short table row without recurring drift', async () => {
  const markdown = [
    '| Safe | Notes | Quorum |',
    '| --- | --- | --- |',
    `| [Council](https://app.safe.global/home?safe=eth:${ADDRESS}) | Active |`,
  ].join('\n')

  const first = await updateQuorums(markdown, async () => '2/3')
  const second = await updateQuorums(first.content, async () => '2/3')

  assert.equal(first.checks[0].status, 'drift')
  assert.match(first.content, /\| Active \| 2\/3 \|$/)
  assert.equal(second.checks[0].status, 'ok')
  assert.equal(second.content, first.content)
})

test('pairs an inline quorum with the preceding Safe link once', () => {
  const lines = [`Safe: https://app.safe.global/home?safe=eth:${ADDRESS}`, '**Quorum:** 2 / 4', '**Quorum:** 1/2']

  const sites = [...scanQuorumSites(lines)]

  assert.equal(sites.length, 1)
  assert.equal(sites[0].current, '2/4')
  sites[0].write('3/4')
  assert.equal(lines[1], '**Quorum:** 3/4')
  assert.equal(lines[2], '**Quorum:** 1/2')
})

test('does not pair inline quorums across headings', () => {
  const lines = [`Safe: https://app.safe.global/home?safe=eth:${ADDRESS}`, '## Another multisig', '**Quorum:** 2/4']

  assert.deepEqual([...scanQuorumSites(lines)], [])
})

test('formats quorum check results', () => {
  const base = { lineNo: 4, chain: 'eth', address: ADDRESS, current: '2/3' }

  assert.match(formatCheck({ ...base, status: 'ok' }, 50), /✓ L\s+5.*2\/3$/)
  assert.match(formatCheck({ ...base, status: 'drift', onchain: '3/5' }, 50), /✗ L\s+5.*2\/3 → 3\/5$/)
  assert.match(formatCheck({ ...base, status: 'error', message: 'offline' }, 50), /! L\s+5.*2\/3  \(offline\)$/)
})

test('caches successful quorum requests by normalized Safe address', async () => {
  let calls = 0
  const fetchQuorum = createQuorumFetcher(async () => {
    calls += 1
    return '2/3'
  }, 2)

  const [first, second] = await Promise.all([
    fetchQuorum('eth', ADDRESS.toUpperCase()),
    fetchQuorum('eth', ADDRESS.toLowerCase()),
  ])

  assert.equal(first, '2/3')
  assert.equal(second, '2/3')
  assert.equal(calls, 1)
})

test('evicts failed quorum requests from the cache', async () => {
  let attempts = 0
  const fetchQuorum = createQuorumFetcher(async () => {
    attempts += 1
    if (attempts === 1) throw new Error('temporary failure')
    return '2/3'
  }, 1)

  await assert.rejects(fetchQuorum('eth', ADDRESS), /temporary failure/)
  assert.equal(await fetchQuorum('eth', ADDRESS), '2/3')
  assert.equal(attempts, 2)
})

test('limits concurrent quorum requests', async () => {
  const addresses = ['a', 'b', 'c'].map((character) => `0x${character.repeat(40)}`)
  const releases = []
  let active = 0
  let highestActive = 0
  let started = 0
  const fetchQuorum = createQuorumFetcher(() => {
    active += 1
    started += 1
    highestActive = Math.max(highestActive, active)
    return new Promise((resolve) => {
      releases.push(() => {
        active -= 1
        resolve('1/1')
      })
    })
  }, 2)

  const requests = addresses.map((address) => fetchQuorum('eth', address))
  await new Promise(setImmediate)
  assert.equal(started, 2)
  assert.equal(highestActive, 2)

  releases.shift()()
  await new Promise(setImmediate)
  assert.equal(started, 3)
  assert.equal(highestActive, 2)

  for (const release of releases) release()
  assert.deepEqual(await Promise.all(requests), ['1/1', '1/1', '1/1'])
})

test('updates quorum drift and reports checks in source order', async () => {
  const secondAddress = `0x${'b'.repeat(40)}`
  const thirdAddress = `0x${'c'.repeat(40)}`
  const markdown = [
    `Safe: https://app.safe.global/home?safe=eth:${ADDRESS}`,
    '**Quorum:** 2/3',
    '',
    '| Safe | Quorum |',
    '| --- | --- |',
    `| [Council](https://app.safe.global/home?safe=eth:${secondAddress}) | 1/2 |`,
    '',
    `Safe: https://app.safe.global/home?safe=eth:${thirdAddress}`,
    '**Quorum:** 1/2',
  ].join('\n')

  const getQuorum = async (chain, address) => {
    assert.equal(chain, 'eth')
    if (address === ADDRESS) return '2/3'
    if (address === secondAddress) return '3/5'
    throw new Error('RPC unavailable')
  }

  const { checks, content } = await updateQuorums(markdown, getQuorum)

  assert.deepEqual(
    checks.map(({ lineNo, status }) => ({ lineNo, status })),
    [
      { lineNo: 1, status: 'ok' },
      { lineNo: 5, status: 'drift' },
      { lineNo: 8, status: 'error' },
    ],
  )
  assert.ok(checks.every((check) => !('write' in check)))
  assert.match(content, /\| 3\/5 \|/)
  assert.match(content, /\*\*Quorum:\*\* 2\/3/)
  assert.match(content, /\*\*Quorum:\*\* 1\/2$/)
})

test('leaves Markdown without quorum references unchanged', async () => {
  const markdown = '# No multisigs\n'
  const result = await updateQuorums(markdown, async () => '1/1')

  assert.deepEqual(result, { checks: [], content: markdown })
})
