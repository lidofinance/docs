/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = async function createConfigAsync() {
  return {
    title: 'Lido Docs',
    tagline: 'Documentation for the Lido staking protocol',
    url: 'https://docs.lido.fi',
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
    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
        type: 'text/css',
        integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
        crossorigin: 'anonymous',
      },
    ],
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
          {
            type: 'doc',
            docId: 'lido-v3-whitepaper',
            label: '📘 V3 Technical Paper',
            position: 'left',
            className: 'navbar__item--v3',
          },
          { to: '/deployed-contracts/', label: 'Mainnet contracts', position: 'left' },
          { to: '/lips', label: 'LIPs', position: 'left' },
          { to: '/security/audits', label: 'Audits', position: 'left' },
          {
            type: 'doc',
            docsPluginId: 'runOnLido',
            docId: 'intro',
            label: 'Run on Lido',
            position: 'left',
          },
          {
            href: 'https://github.com/lidofinance',
            label: 'GitHub',
            position: 'right',
          }
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
            remarkPlugins: [(await import('remark-math')).default],
            rehypePlugins: [(await import('rehype-katex')).default],
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
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
              from: [
                '/guides/stvaults/pdg',
                '/run-on-lido/stvaults/pdg',
              ],
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
            }
          ],
        },
      ],
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'runOnLido',
          path: 'run-on-lido',
          routeBasePath: 'run-on-lido',
          sidebarPath: require.resolve('./sidebarsRunOnLido.js'),
          remarkPlugins: [(await import('remark-math')).default],
          rehypePlugins: [(await import('rehype-katex')).default],
        },
      ],
    ],
  };
};
