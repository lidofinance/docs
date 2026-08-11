const redirects = [
  {
    to: '/guides/lido-tokens-integration-guide',
    from: '/guides/steth-integration-guide',
  },
  {
    to: '/token-guides/cross-chain-tokens-guide',
    from: '/token-guides/wsteth-bridging-guide',
  },
  {
    to: '/run-on-lido/stvaults/',
    from: '/guides/stvaults/',
  },
  {
    to: '/run-on-lido/stvaults/tech-documentation/pdg',
    from: ['/guides/stvaults/pdg', '/run-on-lido/stvaults/pdg'],
  },
  {
    to: '/run-on-lido/stvaults/operational-and-management-guides/health-monitoring-guide',
    from: '/run-on-lido/stvaults/health-monitoring-guide',
  },
  {
    to: '/run-on-lido/stvaults/operational-and-management-guides/health-emergency-guide',
    from: '/run-on-lido/stvaults/health-emergency-guide',
  },
  {
    to: '/run-on-lido/stvaults/operational-and-management-guides/node-operators-identification',
    from: '/run-on-lido/stvaults/node-operators-identification',
  },
  {
    to: '/run-on-lido/stvaults/features-and-mechanics/roles-and-permissions',
    from: '/run-on-lido/stvaults/roles-and-permissions',
  },
  {
    to: '/run-on-lido/stvaults/features-and-mechanics/parameters-and-metrics',
    from: '/run-on-lido/stvaults/parameters-and-metrics',
  },
  {
    to: '/run-on-lido/stvaults/tech-documentation/integration-overview',
    from: '/run-on-lido/stvaults/integration-overview',
  },
  {
    to: '/run-on-lido/stvaults/tech-documentation/tech-design',
    from: '/run-on-lido/stvaults/tech-design',
  },
  {
    to: '/run-on-lido/stvaults/tech-documentation/consolidation',
    from: '/run-on-lido/stvaults/consolidation',
  },
  {
    to: '/multisigs/emergency-brakes',
    from: '/multisigs/emergency-breaks',
  },
  {
    to: '/earn',
    from: '/earn/introduction',
  },
  {
    to: '/contracts/circuit-breaker',
    from: '/contracts/gate-seal',
  },
  {
    to: '/staking-modules/csm/contracts/Accounting',
    from: '/staking-modules/csm/contracts/CSAccounting',
  },
  {
    to: '/staking-modules/csm/contracts/Ejector',
    from: '/staking-modules/csm/contracts/CSEjector',
  },
  {
    to: '/staking-modules/csm/contracts/FeeOracle',
    from: '/staking-modules/csm/contracts/CSFeeOracle',
  },
  {
    to: '/staking-modules/csm/contracts/ParametersRegistry',
    from: '/staking-modules/csm/contracts/CSParametersRegistry',
  },
  {
    to: '/staking-modules/csm/contracts/Verifier',
    from: '/staking-modules/csm/contracts/CSVerifier',
  },
  {
    to: '/staking-modules/csm/contracts/ExitPenalties',
    from: '/staking-modules/csm/contracts/CSExitPenalties',
  },
  {
    to: '/staking-modules/csm/contracts/FeeDistributor',
    from: '/staking-modules/csm/contracts/CSFeeDistributor',
  },
  {
    to: '/staking-modules/csm/contracts/ValidatorStrikes',
    from: '/staking-modules/csm/contracts/CSStrikes',
  },
  {
    to: '/staking-modules/csm/contracts/MerkleGateFactory',
    from: '/staking-modules/csm/contracts/VettedGateFactory',
  },
]

const REDIRECTED_FRAGMENTS = {
  '/token-guides/wsteth-bridging-guide#the-proposed-configuration': '#mainnet-proposed-configuration',
}

function resolveRedirect(source) {
  const fragmentIndex = source.indexOf('#')
  const sourcePath = fragmentIndex === -1 ? source : source.slice(0, fragmentIndex)
  const sourceFragment = fragmentIndex === -1 ? '' : source.slice(fragmentIndex)
  const redirect = redirects.find(({ from }) => (Array.isArray(from) ? from.includes(sourcePath) : from === sourcePath))

  if (!redirect) return source
  return redirect.to + (REDIRECTED_FRAGMENTS[source] || sourceFragment)
}

module.exports = { redirects, resolveRedirect }
