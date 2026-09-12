const assert = require('node:assert/strict')
const test = require('node:test')

const {
  canonicalStatus,
  parseLipMetadata,
  renderAudits,
  renderLips,
} = require('../lib/external-content')

const SHA = 'a'.repeat(40)

test('audit rendering pins PDF links, sorts months, and counts reports', () => {
  const source = `# Lido Protocol Audits

## Core

### 01-2025 Earlier

[Report](earlier.pdf)

### 03-2026 Later

[Report](later.pdf)
`
  const result = renderAudits(source, SHA)
  assert.deepEqual(result.counts, { Core: 2 })
  assert.ok(result.content.indexOf('03-2026 Later') < result.content.indexOf('01-2025 Earlier'))
  assert.match(result.content, new RegExp(`audits/blob/${SHA}/later\\.pdf`))
  assert.match(result.content, new RegExp(`audits/commit/${SHA}`))
})

test('LIP metadata removes matching scalar quotes', () => {
  const metadata = parseLipMetadata(`---
lip: 37
title: "Execution framework"
status: proposed
author: Protocol contributor
---
`)
  assert.equal(metadata.title, 'Execution framework')
  assert.equal(canonicalStatus(metadata.status), 'Proposed')
})

test('LIP rendering groups pinned proposal snapshots by canonical status', () => {
  const result = renderLips([
    {
      name: 'lip-1.md',
      content: `---
lip: 1
title: Implemented proposal
status: final
author: Protocol contributor
---
`,
    },
    {
      name: 'lip-2.md',
      content: `---
lip: 2
title: Proposed change
status: review
author: Protocol contributor
---
`,
    },
  ], SHA)
  assert.deepEqual(result.counts, { Proposed: 1, Implemented: 1 })
  assert.match(result.content, new RegExp(`blob/${SHA}/LIPS/lip-2\\.md`))
  assert.ok(result.content.indexOf('## Proposed') < result.content.indexOf('## Implemented'))
})

test('unknown non-empty LIP statuses fail closed', () => {
  assert.throws(() => canonicalStatus('mystery'), /unknown LIP status/)
})
