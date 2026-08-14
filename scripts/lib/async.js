function createLimiter(maxConcurrency) {
  let active = 0
  const queue = []

  const runNext = () => {
    if (active >= maxConcurrency || queue.length === 0) return

    active += 1
    const { task, resolve, reject } = queue.shift()
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        active -= 1
        runNext()
      })
  }

  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject })
      runNext()
    })
}

module.exports = { createLimiter }
