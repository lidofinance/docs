const { redirects } = require('./config/redirects')

const aiArtifactsCollections = [
  { path: 'docs', routeBasePath: '/', label: 'Main Docs' },
  { path: 'run-on-lido', routeBasePath: 'run-on-lido', label: 'Run on Lido' },
  { path: 'earn', routeBasePath: 'earn', label: 'Earn' },
]

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = async function createConfigAsync() {
  return {
    title: 'Lido Docs',
    tagline: 'Documentation for the Lido staking protocol',
    url: 'https://docs.lido.fi',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    favicon: 'img/favicon-32x32.png',
    organizationName: 'lidofinance',
    projectName: 'docs',
    markdown: {
      mermaid: true,
      hooks: {
        onBrokenMarkdownLinks: 'throw',
      },
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
            type: 'doc',
            docsPluginId: 'earn',
            docId: 'introduction',
            label: 'Earn',
            position: 'left',
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
        require.resolve('./src/plugins/llms-txt'),
        {
          siteTitle: 'Lido Documentation',
          siteDescription:
            'Documentation for the Lido liquid staking protocol on Ethereum and L2s. Covers protocol contracts, integrations, node operator guides, CSM, stVaults, and the Earn product.',
          collections: aiArtifactsCollections,
        },
      ],
      [
        require.resolve('./src/plugins/markdown-source'),
        {
          collections: aiArtifactsCollections,
        },
      ],
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects,
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
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'earn',
          path: 'earn',
          routeBasePath: 'earn',
          sidebarPath: require.resolve('./sidebarsEarn.js'),
          remarkPlugins: [(await import('remark-math')).default],
          rehypePlugins: [(await import('rehype-katex')).default],
        },
      ],
    ],
  }
}
