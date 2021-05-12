module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/node-operator-manual',
        'guides/oracle-operator-manual',
        'guides/multisig-deployment',
        'guides/protocol-levers',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: ['integrations/sdk', 'integrations/subgraph'],
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
        'contracts/wsteth',
      ],
    },
    'deployed-contracts',
  ],
}
