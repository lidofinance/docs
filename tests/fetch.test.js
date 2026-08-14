const { afterEach, test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { TASKS, runTasks } = require('../scripts/fetch')

const temporaryDirectories = []
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalTestLog = process.env.FETCH_TASK_TEST_LOG

afterEach(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  if (originalTestLog === undefined) delete process.env.FETCH_TASK_TEST_LOG
  else process.env.FETCH_TASK_TEST_LOG = originalTestLog
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function createTaskDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lido-docs-fetch-'))
  temporaryDirectories.push(directory)
  return directory
}

function writeTask(directory, name, source) {
  const file = path.join(directory, name)
  fs.writeFileSync(file, source)
  return file
}

function silenceOutput() {
  console.log = () => {}
  console.error = () => {}
}

test('runs fetch tasks in order', () => {
  const directory = createTaskDirectory()
  const logFile = path.join(directory, 'order.log')
  process.env.FETCH_TASK_TEST_LOG = logFile
  const first = writeTask(
    directory,
    'first.js',
    "require('node:fs').appendFileSync(process.env.FETCH_TASK_TEST_LOG, 'first\\n')",
  )
  const second = writeTask(
    directory,
    'second.js',
    "require('node:fs').appendFileSync(process.env.FETCH_TASK_TEST_LOG, 'second\\n')",
  )
  silenceOutput()

  assert.equal(runTasks([first, second]), 0)
  assert.equal(fs.readFileSync(logFile, 'utf8'), 'first\nsecond\n')
})

test('registers every fetch script by default', () => {
  assert.deepEqual(TASKS, ['fetch-audits.js', 'fetch-lips.js', 'fetch-msig-quorums.js'])
})

test('stops after the first failed task', () => {
  const directory = createTaskDirectory()
  const skippedMarker = path.join(directory, 'skipped')
  process.env.FETCH_TASK_TEST_LOG = skippedMarker
  const failed = writeTask(directory, 'failed.js', 'process.exitCode = 7')
  const skipped = writeTask(
    directory,
    'skipped.js',
    "require('node:fs').writeFileSync(process.env.FETCH_TASK_TEST_LOG, 'ran')",
  )
  silenceOutput()

  assert.equal(runTasks([failed, skipped]), 7)
  assert.equal(fs.existsSync(skippedMarker), false)
})

test('uses exit code 1 when a task terminates without a status', () => {
  const directory = createTaskDirectory()
  const terminated = writeTask(directory, 'terminated.js', "process.kill(process.pid, 'SIGTERM')")
  silenceOutput()

  assert.equal(runTasks([terminated]), 1)
})

test('documents the aggregate fetch command', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8')

  assert.match(readme, /npm run fetch\b/)
  assert.match(readme, /public chain RPC endpoints/)
  assert.match(readme, /npm run fetch-msig-quorums/)
  assert.doesNotMatch(readme, /npm run fetch-external\b/)
})
