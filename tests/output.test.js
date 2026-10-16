const test = require('node:test')
const assert = require('node:assert/strict')

const { printCounts } = require('../scripts/lib/output')

test('prints category counts in insertion order', (context) => {
  const lines = []
  context.mock.method(console, 'log', (...parts) => lines.push(parts.join(' ')))

  printCounts({ WIP: 2, Approved: 1 })

  assert.deepEqual(lines, ['\nCategory counts:', '  • WIP: 2', '  • Approved: 1'])
})
