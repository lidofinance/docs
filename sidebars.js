module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    'guides/steth-integration-guide',
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
        'guides/deposit-security-manual',
        {
          type: 'category',
          label: 'Tooling',
          items: [
            'guides/tooling',
            'guides/validator-ejector-guide',
            'guides/kapi-guide',
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
        'guides/verify-lido-v2-upgrade-manual'
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
        'token-guides/steth-on-aave-caveats',
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
        'contracts/burner',
        'contracts/lido-execution-layer-rewards-vault',
        'contracts/mev-boost-relays-allowed-list',
        'contracts/trp-vesting-escrow',
        'contracts/gate-seal',
        'contracts/ossifiable-proxy'
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/bugbounty',
        'security/roles-roster'
      ],
    },
    {
      type: 'category',
      label: 'Deployed contracts',
      link: { type: 'doc', id: 'deployed-contracts/index' },
      items: [
        { type: 'doc', id: 'deployed-contracts/index', label: 'Mainnet' },
        'deployed-contracts/goerli',
      ],
    },
  ],
}
