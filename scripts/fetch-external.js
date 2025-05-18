#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const tasks = ['fetch-audits.js', 'fetch-lips.js'];

for (const t of tasks) {
  const abs = path.join(__dirname, t);
  console.log(`\n▶ running ${t} …`);
  const { status } = spawnSync(process.execPath, [abs], { stdio: 'inherit' });
  if (status !== 0) {
    console.error(`✖ ${t} failed (exit ${status}) — aborting`);
    process.exit(status);
  }
}

console.log('\n✅ All external docs fetched & generated successfully');
