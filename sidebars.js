module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    'lips',
    'guides/lido-tokens-integration-guide',
    {
      type: 'category',
      label: 'Guides',
      items: [
        {
          type: 'category',
          label: 'Node Operators',
          items: [
            'guides/node-operators/general-overview',
            'guides/node-operators/validator-keys',
            'guides/node-operators/el-rewards-configuration',
            {
              type: 'category',
              label: 'Validator Exits Automation',
              items: [
                'guides/node-operators/exits/introduction',
                'guides/node-operators/exits/general-information',
                'guides/node-operators/exits/exit-message-generation-signing',
                'guides/node-operators/exits/flow-examples',
                'guides/node-operators/exits/tooling-setup',
              ],
            },
          ],
        },
        'guides/oracle-operator-manual',
        {
          type: 'category',
          label: 'Oracle specification',
          items: [
            'guides/oracle-spec/accounting-oracle',
            'guides/oracle-spec/validator-exit-bus',
            'guides/oracle-spec/penalties',
          ],
        },
        'guides/deposit-security-manual',
        {
          type: 'category',
          label: 'Tooling',
          items: [
            'guides/tooling',
            'guides/validator-ejector-guide',
            'guides/kapi-guide',
            'guides/reward-distributor-bot',
            'guides/depositor-bot',
          ],
        },
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
        'guides/verify-lido-v2-upgrade-manual',
        'guides/verify-steth-on-optimism-upgrade-manual'
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/api',
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
        'token-guides/wsteth-bridging-guide',
      ],
    },
    {
      type: 'category',
      label: 'Contracts',
      items: [
        'contracts/lido-locator',
        'contracts/lido',
        'contracts/eip712-steth',
        'contracts/accounting-oracle',
        'contracts/validators-exit-bus-oracle',
        'contracts/hash-consensus',
        'contracts/legacy-oracle',
        'contracts/oracle-report-sanity-checker',
        'contracts/oracle-daemon-config',
        'contracts/staking-router',
        'contracts/node-operators-registry',
        'contracts/withdrawal-queue-erc721',
        'contracts/withdrawal-vault',
        'contracts/wsteth',
        'contracts/deposit-security-module',
        'contracts/data-bus',
        'contracts/burner',
        'contracts/lido-execution-layer-rewards-vault',
        'contracts/mev-boost-relays-allowed-list',
        'contracts/trp-vesting-escrow',
        'contracts/gate-seal',
        'contracts/insurance',
        'contracts/ossifiable-proxy'
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/bugbounty',
        'security/audits'
      ],
    },
    {
      type: 'category',
      label: 'Deployed contracts',
      link: { type: 'doc', id: 'deployed-contracts/index' },
      items: [
        { type: 'doc', id: 'deployed-contracts/index', label: 'Mainnet' },
        'deployed-contracts/holesky',
        'deployed-contracts/sepolia'
      ],
    },
    {
      type: 'category',
      label: 'Multisigs',
      items: [
        'multisigs/emergency-brakes',
        'multisigs/committees',
        'multisigs/lido-on-x',
        'multisigs/lido-contributors-group',
        'multisigs/other',
      ],
    },
    {
      type: 'category',
      label: 'IPFS',
      items: [
        'ipfs/about',
        'ipfs/release-flow',
        'ipfs/security',
        'ipfs/hash-verification',
        'ipfs/apps-list'
      ],
    },
    {
      type: 'category',
      label: 'Staking Modules',
      items: [
        {
          type: 'category',
          label: 'CSM',
          link: { type: 'doc', id: 'staking-modules/csm/intro' },
          items: [
            'staking-modules/csm/intro',
            'staking-modules/csm/join-csm',
            'staking-modules/csm/rewards',
            'staking-modules/csm/penalties',
            'staking-modules/csm/validator-exits',
            { type: 'doc', id: 'staking-modules/csm/permissions', label: 'Permissions' },
            {
              type: 'category',
              label: 'Guides',
              link: { type: 'doc', id: 'staking-modules/csm/guides/index' },
              items: [
                'staking-modules/csm/guides/events',
                'staking-modules/csm/guides/slashing',
                'staking-modules/csm/guides/mev-stealing',
                'staking-modules/csm/guides/unbonded-validators',
                'staking-modules/csm/guides/addresses',
              ]
            },
            {
              type: 'category',
              label: 'Contracts',
              items: [
                'staking-modules/csm/contracts/CSModule',
                'staking-modules/csm/contracts/CSAccounting',
                'staking-modules/csm/contracts/CSFeeDistributor',
                'staking-modules/csm/contracts/CSFeeOracle',
                'staking-modules/csm/contracts/CSVerifier',
                'staking-modules/csm/contracts/CSEarlyAdoption',
              ],
            },
            'staking-modules/csm/further-reading',
          ],
        },
      ],
    },
  ],
}
