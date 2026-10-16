function runTask(task) {
  return Promise.resolve()
    .then(task)
    .then((exitCode) => {
      if (Number.isInteger(exitCode) && exitCode !== 0) {
        process.exitCode = exitCode
      }
    })
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
}

module.exports = { runTask }
