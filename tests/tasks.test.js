const { afterEach, test } = require('node:test')
const assert = require('node:assert/strict')

const { runTask } = require('../scripts/lib/tasks')

const TASK_MODULES = [
  '../scripts/fetch-audits',
  '../scripts/fetch',
  '../scripts/fetch-lips',
  '../scripts/fetch-msig-quorums',
]

for (const taskModule of TASK_MODULES) {
  test(`${taskModule} exposes a run task`, () => {
    assert.equal(typeof require(taskModule).run, 'function')
  })
}

const originalExitCode = process.exitCode
const originalConsoleError = console.error

afterEach(() => {
  process.exitCode = originalExitCode
  console.error = originalConsoleError
})

test('uses a task return value as the process exit code', async () => {
  await runTask(() => 7)

  assert.equal(process.exitCode, 7)
})

test('reports rejected tasks and sets exit code 1', async () => {
  const errors = []
  console.error = (error) => errors.push(error)

  await runTask(async () => {
    throw new Error('failed')
  })

  assert.equal(process.exitCode, 1)
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /failed/)
})
