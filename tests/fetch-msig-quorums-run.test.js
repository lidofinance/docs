const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

for (const scenario of ['all errors', 'partial errors', 'complete coverage']) {
  test(`quorum CLI handles ${scenario}`, (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lido-docs-quorums-'))
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
    fs.cpSync(path.join(__dirname, '../scripts'), path.join(directory, 'scripts'), { recursive: true })
    fs.mkdirSync(path.join(directory, 'docs'))

    const originals = ['a', 'b'].map(
      (character) => `Safe: https://app.safe.global/home?safe=eth:0x${character.repeat(40)}\n**Quorum:** 1/2\n`,
    )
    const files = originals.map((content, index) => {
      const file = path.join(directory, 'docs', `${index}.md`)
      fs.writeFileSync(file, content)
      return file
    })

    const mock = path.join(directory, 'rpc.cjs')
    fs.writeFileSync(
      mock,
      `
      global.fetch = async (_url, options) => {
        const { to, data } = JSON.parse(options.body).params[0]
        const fail = ${JSON.stringify(scenario)} === 'all errors' ||
          (${JSON.stringify(scenario)} === 'partial errors' && to === '0x${'b'.repeat(40)}')
        const word = (value) => value.toString(16).padStart(64, '0')
        const result = data === '0xe75235b8' ? '0x' + word(2) : '0x' + word(32) + word(3)
        return { ok: true, json: async () => fail ? { error: { message: 'RPC unavailable' } } : { result } }
      }
    `,
    )

    const result = spawnSync(process.execPath, ['--require', mock, 'scripts/fetch-msig-quorums.js'], {
      cwd: directory,
      encoding: 'utf8',
    })
    assert.ifError(result.error)
    if (scenario === 'complete coverage') {
      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /2 checked: 0 ok, 2 drift, 0 error/)
      files.forEach((file, index) => {
        assert.equal(fs.readFileSync(file, 'utf8'), originals[index].replace('1/2', '2/3'))
      })
    } else {
      assert.equal(result.status, 1, result.stdout + result.stderr)
      assert.match(result.stderr, /quorum refresh incomplete/)
      assert.match(
        result.stdout,
        scenario === 'all errors' ? /2 checked: 0 ok, 0 drift, 2 error/ : /2 checked: 0 ok, 1 drift, 1 error/,
      )
      files.forEach((file, index) => assert.equal(fs.readFileSync(file, 'utf8'), originals[index]))

      const aggregate = spawnSync(
        process.execPath,
        [
          '--require',
          mock,
          '-e',
          `
        const { runTasks } = require('./scripts/fetch')
        process.exitCode = runTasks(['fetch-msig-quorums.js'])
      `,
        ],
        {
          cwd: directory,
          encoding: 'utf8',
          env: { ...process.env, NODE_OPTIONS: `--require=${mock}` },
        },
      )
      assert.ifError(aggregate.error)
      assert.equal(aggregate.status, 1, aggregate.stdout + aggregate.stderr)
      assert.doesNotMatch(aggregate.stdout, /All fetch tasks completed successfully/)
      files.forEach((file, index) => assert.equal(fs.readFileSync(file, 'utf8'), originals[index]))
    }
  })
}
