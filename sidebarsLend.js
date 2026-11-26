module.exports = {
  lendSidebar: [
    'introduction',
    'architecture/index',
    'governance',
    'committees',
    'risks',
    {
      type: 'category',
      label: 'Markets',
      link: { type: 'doc', id: 'markets/index' },
      items: ['markets/weth-wsteth'],
    },
    {
      type: 'category',
      label: 'Deployed contracts',
      link: { type: 'doc', id: 'deployed-contracts/index' },
      items: [{ type: 'doc', id: 'deployed-contracts/index', label: 'Mainnet' }, 'deployed-contracts/hoodi'],
    },
    'audits',
    'security',
    'glossary',
  ],
}
