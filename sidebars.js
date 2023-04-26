module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    'guides/steth-integration-guide',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/node-operator-manual',
        'guides/oracle-operator-manual',
        'guides/deposit-security-manual',
        'guides/multisig-deployment',
        'guides/protocol-levers',
        'guides/etherscan-voting',
        'guides/easy-track-guide',
        'guides/address-ownership-guide',
        'guides/multisig-signer-manual',
        'guides/checking-aragon-vote',
        'guides/checking-gnosis-safe',
        'guides/1inch-pool-rewards',
        'guides/early-staker-airdrop',
        'guides/jumpgates',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/wallets',
        'integrations/sdk',
        'integrations/subgraph',
        {
          type: 'category',
          label: 'AAVE',
          items: ['integrations/aave/specification', 'integrations/aave/aip'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Token guides',
      items: [
        'token-guides/steth-superuser-functions',
        'token-guides/steth-on-aave-caveats',
      ],
    },
    {
      type: 'category',
      label: 'Contracts',
      items: [
        'contracts/lido',
        'contracts/lido-oracle',
        'contracts/node-operators-registry',
        'contracts/withdrawals-manager-stub',
        'contracts/wsteth',
        'contracts/deposit-security-module',
        'contracts/self-owned-steth-burner',
        'contracts/composite-post-rebase-beacon-receiver',
        'contracts/lido-execution-layer-rewards-vault',
        'contracts/mev-boost-relays-allowed-list',
        'contracts/trp-vesting-escrow',
        'contracts/gate-seal'
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: ['security/bugbounty'],
    },
    {
      type: 'category',
      label: 'Deployed contracts',
      link: { type: 'doc', id: 'deployed-contracts/index' },
      items: [
        { type: 'doc', id: 'deployed-contracts/index', label: 'Mainnet' },
        'deployed-contracts/goerli',
        'deployed-contracts/rinkeby',
        'deployed-contracts/ropsten',
        'deployed-contracts/kovan',
      ],
    },
  ],
}
