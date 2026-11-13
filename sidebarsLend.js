module.exports = {
  lendSidebar: [
    'introduction',
    'risks',
    {
      type: 'category',
      label: 'Architecture',
      link: { type: 'doc', id: 'architecture/index' },
      items: [
        'architecture/core',
        'architecture/market-controller',
        'architecture/guardian-signals',
        'architecture/settlement',
        'architecture/interest-rate-model',
      ],
    },
    {
      type: 'category',
      label: 'Governance',
      items: [
        'governance/roles-and-permissions',
        'governance/committees',
        'governance/market-onboarding',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/bundler-integration',
        'guides/liquidations',
        'guides/guardian-operator',
      ],
    },
    'deployed-contracts',
    'audits',
    'security',
    'glossary',
  ],
}
