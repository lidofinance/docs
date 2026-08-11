const test = require('node:test')
const assert = require('node:assert/strict')

const { createLimiter } = require('../scripts/lib/async')

test('limits concurrent tasks and continues after a rejection', async () => {
  const releases = []
  let active = 0
  let highestActive = 0

  const limit = createLimiter(2)
  const tasks = ['first', 'failed', 'last'].map((name) =>
    limit(
      () =>
        new Promise((resolve, reject) => {
          active += 1
          highestActive = Math.max(highestActive, active)
          releases.push(() => {
            active -= 1
            if (name === 'failed') reject(new Error(name))
            else resolve(name)
          })
        }),
    ),
  )

  await new Promise(setImmediate)
  assert.equal(releases.length, 2)
  releases.shift()()
  await new Promise(setImmediate)
  assert.equal(releases.length, 2)
  for (const release of releases) release()

  assert.deepEqual(await Promise.allSettled(tasks), [
    { status: 'fulfilled', value: 'first' },
    { status: 'rejected', reason: new Error('failed') },
    { status: 'fulfilled', value: 'last' },
  ])
  assert.equal(highestActive, 2)
})
