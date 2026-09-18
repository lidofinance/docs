#!/usr/bin/env node

const { parseMode, runExternal } = require('./lib/external-content')

runExternal({ mode: parseMode(process.argv.slice(2)), targets: ['lips'] })
  .then(({ drift }) => {
    if (drift && process.argv.includes('--check')) process.exitCode = 1
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 2
  })
