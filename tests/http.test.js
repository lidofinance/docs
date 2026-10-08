const { afterEach, test } = require('node:test')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const http = require('node:http')
const path = require('node:path')

const { fetchJson, fetchText } = require('../scripts/lib/http')

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

test('fetches text with the provided request options', async () => {
  const calls = []
  global.fetch = async (...args) => {
    calls.push(args)
    return { ok: true, text: async () => 'content' }
  }

  const options = { headers: { Accept: 'text/plain' } }

  assert.equal(await fetchText('https://example.com/file', options), 'content')
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'https://example.com/file')
  assert.deepEqual(calls[0][1].headers, options.headers)
  assert.equal(calls[0][1].signal instanceof AbortSignal, true)
})

test('fetches JSON', async () => {
  const payload = [{ name: 'proposal.md' }]
  global.fetch = async () => ({ ok: true, json: async () => payload })

  assert.deepEqual(await fetchJson('https://example.com/api'), payload)
})

test('rejects unsuccessful responses', async () => {
  let bodyCancelled = false
  let requestSignal
  global.fetch = async (url, options) => {
    requestSignal = options.signal
    return {
      ok: false,
      status: 503,
      body: {
        cancel: async () => {
          bodyCancelled = true
        },
      },
    }
  }

  await assert.rejects(fetchText('https://example.com/file'), /HTTP 503 → https:\/\/example\.com\/file/)
  assert.equal(bodyCancelled, true)
  assert.equal(requestSignal instanceof AbortSignal, true)
})

test('an HTTP error releases the response socket and exits with code 1', { timeout: 3_000 }, async (context) => {
  const sockets = new Set()
  const server = http.createServer((request, response) => {
    response.writeHead(503, { 'Content-Type': 'text/plain' })
    response.write('unfinished error response')
  })
  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')

  const httpModule = path.join(__dirname, '../scripts/lib/http')
  const tasksModule = path.join(__dirname, '../scripts/lib/tasks')
  const source =
    `const { fetchText } = require(${JSON.stringify(httpModule)});` +
    `const { runTask } = require(${JSON.stringify(tasksModule)});` +
    'runTask(() => fetchText(process.env.FETCH_TEST_URL));'
  const child = spawn(process.execPath, ['-e', source], {
    env: {
      ...process.env,
      FETCH_TEST_URL: `http://127.0.0.1:${server.address().port}`,
    },
    stdio: 'ignore',
  })

  context.after(() => {
    child.kill('SIGKILL')
    for (const socket of sockets) socket.destroy()
    server.close()
  })

  const [exitCode, signal] = await once(child, 'exit')
  assert.equal(exitCode, 1)
  assert.equal(signal, null)
})
