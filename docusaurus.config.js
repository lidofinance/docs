/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Lido Docs',
  tagline: 'Documentation for the Lido staking protocol',
  url: 'https://lidofinance.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'throw',
  favicon: 'img/favicon-32x32.png',
  organizationName: 'lidofinance',
  projectName: 'docs',
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    prism: {
      additionalLanguages: ['solidity'],
    },
    navbar: {
      title: 'Lido Docs',
      logo: {
        alt: 'Lido Logo',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/deployed-contracts/', label: 'Mainnet contracts', position: 'left' },
        { to: '/lips', label: 'LIPs', position: 'left' },
        { to: '/security/audits', label: 'Audits', position: 'left' },
        {
          type: 'custom-ask-docs',
          position: 'right',
        },
        {
          href: 'https://github.com/lidofinance',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/lidofinance/docs/blob/main/',
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      { indexBlog: false, docsRouteBasePath: '/', indexPages: true },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // /guides/steth-integration-guide -> /guides/lido-tokens-integration-guide
          {
            to: '/guides/lido-tokens-integration-guide',
            from: '/guides/steth-integration-guide',
          },
        ],
      },
    ],
  ],
}
