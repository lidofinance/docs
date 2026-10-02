function printCounts(counts) {
  console.log('\nCategory counts:')
  for (const [label, count] of Object.entries(counts)) {
    console.log(`  • ${label}: ${count}`)
  }
}

module.exports = { printCounts }
