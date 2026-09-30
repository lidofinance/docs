#!/usr/bin/env node

const { parseMode, runExternal } = require('./lib/external-content')

const mode = parseMode(process.argv.slice(2))
runExternal({ mode })
  .then(({ drift }) => {
    if (drift && mode === 'check') process.exitCode = 1
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 2
  })
