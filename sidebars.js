module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/steth-integration-guide',
        'guides/node-operator-manual',
        'guides/oracle-operator-manual',
        'guides/deposit-security-manual',
        'guides/multisig-deployment',
        'guides/protocol-levers',
        'guides/etherscan-voting',
        'guides/easy-track-guide',
        'guides/checking-aragon-vote',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
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
        'contracts/stable-swap-state-oracle',
        'contracts/steth-price-feed',
        'contracts/node-operators-registry',
        'contracts/withdrawals-manager-stub',
        'contracts/wsteth',
        'contracts/deposit-security-module',
        'contracts/lido-execution-layer-rewards-vault'
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: ['security/bugbounty'],
    },
    'deployed-contracts',
  ],
}
