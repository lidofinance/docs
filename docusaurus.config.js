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
          redirects: [
            {
              to: '/integrations/aave',
              from: [
                '/integrations/aave/aip',
                '/integrations/aave/specification',
                '/token-guides/steth-on-aave-caveats',
              ],
            },
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
              to: '/staking-modules/contracts/Accounting',
              from: '/staking-modules/csm/contracts/CSAccounting',
            },
            {
              to: '/staking-modules/contracts/Ejector',
              from: '/staking-modules/csm/contracts/CSEjector',
            },
            {
              to: '/staking-modules/contracts/FeeOracle',
              from: '/staking-modules/csm/contracts/CSFeeOracle',
            },
            {
              to: '/staking-modules/contracts/ParametersRegistry',
              from: '/staking-modules/csm/contracts/CSParametersRegistry',
            },
            {
              to: '/staking-modules/contracts/Verifier',
              from: '/staking-modules/csm/contracts/CSVerifier',
            },
            {
              to: '/staking-modules/contracts/ExitPenalties',
              from: '/staking-modules/csm/contracts/CSExitPenalties',
            },
            {
              to: '/staking-modules/contracts/FeeDistributor',
              from: '/staking-modules/csm/contracts/CSFeeDistributor',
            },
            {
              to: '/staking-modules/contracts/ValidatorStrikes',
              from: '/staking-modules/csm/contracts/CSStrikes',
            },
            {
              to: '/staking-modules/contracts/MerkleGateFactory',
              from: '/staking-modules/csm/contracts/VettedGateFactory',
            },
            {
              to: '/staking-modules/',
              from: '/staking-modules/csm/intro',
            },
            {
              to: '/staking-modules/node-operators',
              from: '/staking-modules/csm/join-csm',
            },
            {
              to: '/staking-modules/rewards',
              from: '/staking-modules/csm/rewards',
            },
            {
              to: '/staking-modules/validator-exits',
              from: '/staking-modules/csm/validator-exits',
            },
            {
              to: '/staking-modules/permissions',
              from: '/staking-modules/csm/permissions',
            },
            {
              to: '/staking-modules/further-reading',
              from: '/staking-modules/csm/further-reading',
            },
            {
              to: '/staking-modules/',
              from: '/staking-modules/cm-v2/intro',
            },
            {
              to: '/staking-modules/permissions',
              from: '/staking-modules/cm-v2/permissions',
            },
            {
              to: '/staking-modules/contracts/Accounting',
              from: '/staking-modules/csm/contracts/Accounting',
            },
            {
              to: '/staking-modules/contracts/Accounting',
              from: '/staking-modules/cm-v2/contracts/Accounting',
            },
            {
              to: '/staking-modules/contracts/Ejector',
              from: '/staking-modules/csm/contracts/Ejector',
            },
            {
              to: '/staking-modules/contracts/Ejector',
              from: '/staking-modules/cm-v2/contracts/Ejector',
            },
            {
              to: '/staking-modules/contracts/ExitPenalties',
              from: '/staking-modules/csm/contracts/ExitPenalties',
            },
            {
              to: '/staking-modules/contracts/ExitPenalties',
              from: '/staking-modules/cm-v2/contracts/ExitPenalties',
            },
            {
              to: '/staking-modules/contracts/FeeDistributor',
              from: '/staking-modules/csm/contracts/FeeDistributor',
            },
            {
              to: '/staking-modules/contracts/FeeDistributor',
              from: '/staking-modules/cm-v2/contracts/FeeDistributor',
            },
            {
              to: '/staking-modules/contracts/FeeOracle',
              from: '/staking-modules/csm/contracts/FeeOracle',
            },
            {
              to: '/staking-modules/contracts/FeeOracle',
              from: '/staking-modules/cm-v2/contracts/FeeOracle',
            },
            {
              to: '/staking-modules/contracts/MerkleGateFactory',
              from: '/staking-modules/csm/contracts/MerkleGateFactory',
            },
            {
              to: '/staking-modules/contracts/MerkleGateFactory',
              from: '/staking-modules/cm-v2/contracts/MerkleGateFactory',
            },
            {
              to: '/staking-modules/contracts/ParametersRegistry',
              from: '/staking-modules/csm/contracts/ParametersRegistry',
            },
            {
              to: '/staking-modules/contracts/ParametersRegistry',
              from: '/staking-modules/cm-v2/contracts/ParametersRegistry',
            },
            {
              to: '/staking-modules/contracts/ValidatorStrikes',
              from: '/staking-modules/csm/contracts/ValidatorStrikes',
            },
            {
              to: '/staking-modules/contracts/ValidatorStrikes',
              from: '/staking-modules/cm-v2/contracts/ValidatorStrikes',
            },
            {
              to: '/staking-modules/contracts/Verifier',
              from: '/staking-modules/csm/contracts/Verifier',
            },
            {
              to: '/staking-modules/contracts/Verifier',
              from: '/staking-modules/cm-v2/contracts/Verifier',
            },
            {
              to: '/staking-modules/contracts/CSModule',
              from: '/staking-modules/csm/contracts/CSModule',
            },
            {
              to: '/staking-modules/contracts/PermissionlessGate',
              from: '/staking-modules/csm/contracts/PermissionlessGate',
            },
            {
              to: '/staking-modules/contracts/VettedGate',
              from: '/staking-modules/csm/contracts/VettedGate',
            },
            {
              to: '/staking-modules/contracts/CuratedModule',
              from: '/staking-modules/cm-v2/contracts/CuratedModule',
            },
            {
              to: '/staking-modules/contracts/CuratedGate',
              from: '/staking-modules/cm-v2/contracts/CuratedGate',
            },
            {
              to: '/staking-modules/contracts/MetaRegistry',
              from: '/staking-modules/cm-v2/contracts/MetaRegistry',
            },
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
