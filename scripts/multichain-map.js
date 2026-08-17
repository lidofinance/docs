// Docs-side configuration for scripts/fetch-multichain.js.
//
// This file holds only what the multichain ledger has no field for. Everything else —
// which section publishes a row, which network it is on, which contract role it fills —
// comes from ledger.json itself, so it cannot drift out of sync here.

module.exports = {
  // docs.lido.fi route → repo file. `publicRefs` name routes; we read files.
  // A route appearing upstream that is missing here aborts the run rather than
  // silently dropping the rows that point at it.
  routes: {
    '/deployed-contracts/': 'docs/deployed-contracts/index.md',
    '/deployed-contracts/hoodi': 'docs/deployed-contracts/hoodi.md',
    '/multisigs/emergency-brakes/': 'docs/multisigs/emergency-brakes.md',
  },

  // Block-explorer host and Safe short name per network.
  //
  // `explorer` is the host these docs already link addresses to on that network —
  // observed, one host per network, with one exception: eip155:1923 has no linked
  // example because all three Swellchain addresses are published unlinked, so its
  // value is a proposal to confirm against the deployment, not an observation.
  //
  // `safeShortName` is the Safe chain prefix used in `?safe=<shortName>:0x…` links.
  // Safe front-ends differ per chain (app.safe.global, safe.optimism.io,
  // multisig.mantle.xyz, safe.scroll.xyz, safe.zircuit.com), so Safe rows are matched
  // by the short name in the query, never by host.
  networks: {
    'eip155:1':      { label: 'Ethereum',   explorer: 'etherscan.io',             safeShortName: 'eth' },
    'eip155:10':     { label: 'Optimism',   explorer: 'optimistic.etherscan.io',  safeShortName: 'oeth' },
    'eip155:56':     { label: 'BSC',        explorer: 'bscscan.com',              safeShortName: 'bnb' },
    'eip155:130':    { label: 'Unichain',   explorer: 'uniscan.xyz',              safeShortName: 'unichain' },
    'eip155:137':    { label: 'Polygon',    explorer: 'polygonscan.com',          safeShortName: 'matic' },
    'eip155:324':    { label: 'zkSync Era', explorer: 'explorer.zksync.io',       safeShortName: 'zksync' },
    'eip155:1135':   { label: 'Lisk',       explorer: 'blockscout.lisk.com',      safeShortName: 'lisk' },
    'eip155:1868':   { label: 'Soneium',    explorer: 'soneium.blockscout.com',   safeShortName: 'soneium' },
    'eip155:1923':   { label: 'Swellchain', explorer: 'explorer.swellnetwork.io', safeShortName: 'swell-l2' },
    'eip155:5000':   { label: 'Mantle',     explorer: 'explorer.mantle.xyz',      safeShortName: 'mantle' },
    'eip155:8453':   { label: 'Base',       explorer: 'basescan.org',             safeShortName: 'base' },
    'eip155:34443':  { label: 'Mode',       explorer: 'explorer.mode.network',    safeShortName: 'mode' },
    'eip155:42161':  { label: 'Arbitrum',   explorer: 'arbiscan.io',              safeShortName: 'arb1' },
    'eip155:48900':  { label: 'Zircuit',    explorer: 'explorer.zircuit.com',     safeShortName: 'zircuit-mainnet' },
    'eip155:59144':  { label: 'Linea',      explorer: 'lineascan.build',          safeShortName: 'linea' },
    'eip155:534352': { label: 'Scroll',     explorer: 'scrollscan.com',           safeShortName: 'scr' },
    'eip155:560048': { label: 'Hoodi',      explorer: 'hoodi.etherscan.io',       safeShortName: 'hoe' },
  },

  // Rows published as Safe multisigs: checked for a `safe=<shortName>:<address>` link
  // instead of an explorer link. The ledger has no field marking a row as a Safe, and
  // guessing from `deploymentKind: standalone` would catch unrelated contracts.
  safeRows: ['emergency-brakes-*', 'circuit-breaker-committee-*'],

  // Sections scanned for addresses no ledger row claims (the docs → ledger direction).
  //
  // Chain sections are listed at chain level: the span runs to the next same-or-higher
  // heading, so `#arbitrum` already covers `#ethereum-part-arbitrum` and `#arbitrum-part`.
  //
  // `#legacy-contracts` needs `bulletTrees`: that one section mixes the nine sunset
  // chains with legacy DAO contracts (Finance Ops, AnchorVault, Easy Track factories)
  // that are out of this ledger's remit, and those DAO bullets are not gaps. Scanning
  // the chain sub-trees keeps the scope explainable — no thresholds, no sampling.
  //
  // Deliberately absent: `#core-protocol` (same mixing problem, no chain sub-trees to
  // isolate) and the testnet pages. Both are V2 candidates.
  gapScan: [
    { ref: '/deployed-contracts/#ethereum-common-ccip-ds' },
    { ref: '/deployed-contracts/#arbitrum' },
    { ref: '/deployed-contracts/#optimism' },
    { ref: '/deployed-contracts/#base' },
    { ref: '/deployed-contracts/#linea' },
    { ref: '/deployed-contracts/#binance-smart-chain-bsc' },
    { ref: '/deployed-contracts/#unichain' },
    { ref: '/deployed-contracts/#price-feeds' },
    { ref: '/deployed-contracts/#lido-multichain-liquidity-pools' },
    {
      ref: '/deployed-contracts/#legacy-contracts',
      bulletTrees: [
        'zkSync Era',
        'Mode',
        'Scroll',
        'Mantle',
        'Swellchain',
        'Zircuit',
        'Soneium',
        'Polygon PoS',
        'Lisk',
      ],
    },
  ],

  // Addresses inside scanned sections that are not Lido deployments, so their absence
  // from the ledger is not a gap. Every entry is counted in the report footer: an
  // allowlist that hides its own size can hide a real gap.
  thirdParty: [
    // Chainlink feeds, § Price Feeds
    ['0x8b6851156023f4f5a66f68bea80851c3d905ac93', 'Chainlink wstETH/USD feed (Ethereum)'],
    ['0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061', 'Chainlink wstETH/stETH rate (Base)'],
    ['0xB1552C5e96B312d0Bf8b554186F846C40614a540', 'Chainlink wstETH/stETH rate (Arbitrum)'],
    ['0xe59EBa0D492cA53C6f46015EEa00517F2707dc77', 'Chainlink wstETH/stETH rate (Optimism)'],
    ['0xE61Da4C909F7d86797a0D06Db63c34f76c9bCBDC', 'Chainlink wstETH/stETH rate (Scroll)'],
    ['0x24a0C9404101A8d7497676BE12F10aEa356bAC28', 'Chainlink wstETH/stETH rate (zkSync)'],
    ['0x3C8A95F2264bB3b52156c766b738357008d87cB7', 'Chainlink wstETH/stETH rate (Linea)'],
    ['0x4c75d01cfa4D998770b399246400a6dc40FB9645', 'Chainlink wstETH/stETH rate (BNB)'],
    // Third-party pools, § Lido Multichain Liquidity pools
    ['0xFB5e6d0c1DfeD2BA000fBC040Ab8DF3615AC329c', 'Balancer wstETH/WETH pool (Arbitrum)'],
    ['0x178E029173417b1F9C8bC16DCeC6f697bC323746', 'Balancer wstETH/USDC pool (Arbitrum)'],
    ['0x2149a5f5d7ca96eb98a2ee6e5b0ba1a5593a1a0a', 'KyberSwap wstETH/ETH pool (Arbitrum)'],
    ['0x7acbea3b8ab7cdf4a595c6ed81e7d3e26038d494', 'KyberSwap wstETH/USDC pool (Arbitrum)'],
    ['0xda74db17023750d02b83be2559a4eaa013b65c54', 'KyberSwap wstETH/ETH pool (Optimism)'],
    ['0x5fc53f707c7aacd460a1cd564c06e0f07610fcb7', 'KyberSwap wstETH/USDC pool (Optimism)'],
  ],
};
