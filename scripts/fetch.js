#!/usr/bin/env node

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const { runTask } = require('./lib/tasks')

const TASKS = ['fetch-audits.js', 'fetch-lips.js', 'fetch-msig-quorums.js']

function runTasks(tasks = TASKS) {
  for (const task of tasks) {
    const scriptPath = path.resolve(__dirname, task)
    console.log(`\n▶ running ${task} …`)
    const { status } = spawnSync(process.execPath, [scriptPath], {
      stdio: 'inherit',
    })
    if (status !== 0) {
      const exitCode = status ?? 1
      console.error(`✖ ${task} failed (exit ${exitCode}) — aborting`)
      return exitCode
    }
  }

  console.log('\n✅ All fetch tasks completed successfully')
  return 0
}

function run() {
  return runTasks()
}

if (require.main === module) runTask(run)

module.exports = { TASKS, run, runTasks }
