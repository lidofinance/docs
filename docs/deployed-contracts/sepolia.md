# Sepolia

:::info
Sepolia Testnet: The deployment is in progress :fire:

There will be no comprehensive Lido testnet environment available for Sepolia due to the network's restricted and permission-based validator set configuration.

The goals for this deployment are:

- Have end-to-end testnet for Lido on L2
- The initial running-in of new zk-based oracles (based on [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) availability)

:::

## Core protocol

- Lido Locator: [`0x8f6254332f69557A72b0DA2D5F0Bc07d4CA991E7`](https://sepolia.etherscan.io/address/0x8f6254332f69557A72b0DA2D5F0Bc07d4CA991E7) (proxy)
- Lido and stETH token: [`0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af`](https://sepolia.etherscan.io/address/0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af) (proxy)
- wstETH token: [`0xB82381A3fBD3FaFA77B3a7bE693342618240067b`](https://sepolia.etherscan.io/address/0xB82381A3fBD3FaFA77B3a7bE693342618240067b)
- EIP-712 helper for stETH: [`0x9726CA9AEFF4BC8FB8C084BdAbdB71608248E3f8`](https://sepolia.etherscan.io/address/0x9726CA9AEFF4BC8FB8C084BdAbdB71608248E3f8)
- StakingRouter: [`0x4F36aAEb18Ab56A4e380241bea6ebF215b9cb12c`](https://sepolia.etherscan.io/address/0x4F36aAEb18Ab56A4e380241bea6ebF215b9cb12c) (proxy)
- Node Operators registry: [`0x33d6E15047E8644F8DDf5CD05d202dfE587DA6E3`](https://sepolia.etherscan.io/address/0x33d6E15047E8644F8DDf5CD05d202dfE587DA6E3) (proxy)
- Deposit Security Module (EOA replacement): [`0x6885E36BFcb68CB383DfE90023a462C03BCB2AE5`](https://sepolia.etherscan.io/address/0x6885E36BFcb68CB383DfE90023a462C03BCB2AE5)
- Execution Layer Rewards Vault: [`0x94B1B8e2680882f8652882e7F196169dE3d9a3B2`](https://sepolia.etherscan.io/address/0x94B1B8e2680882f8652882e7F196169dE3d9a3B2)
- Withdrawal Queue ERC721: [`0x1583C7b3f4C3B008720E6BcE5726336b0aB25fdd`](https://sepolia.etherscan.io/address/0x1583C7b3f4C3B008720E6BcE5726336b0aB25fdd) (proxy)
- Withdrawal Vault: [`0xDe7318Afa67eaD6d6bbC8224dfCe5ed6e4b86d76`](https://sepolia.etherscan.io/address/0xDe7318Afa67eaD6d6bbC8224dfCe5ed6e4b86d76) (proxy)
- Burner: [`0x61Bb0Ef69262d5EF1cc2873cf61766751D99B699`](https://sepolia.etherscan.io/address/0x61Bb0Ef69262d5EF1cc2873cf61766751D99B699)

## Sepolia deposit contract ad-hoc adapter

- SepoliaDepositAdapter: [`0x80b5DC88C98E528bF9cb4B7F0f076aC41da24651`](https://sepolia.etherscan.io/address/0x80b5DC88C98E528bF9cb4B7F0f076aC41da24651) (proxy)
- SepoliaDepositAdapter: [`0x899e45316FaA439200b36c7d7733192530e3DfC0`](https://sepolia.etherscan.io/address/0x899e45316FaA439200b36c7d7733192530e3DfC0) (impl)

## Oracle Contracts

- Accounting Oracle:
  - AccountingOracle: [`0xd497Be005638efCf09F6BFC8DAFBBB0BB72cD991`](https://sepolia.etherscan.io/address/0xd497Be005638efCf09F6BFC8DAFBBB0BB72cD991) (proxy)
  - HashConsensus: [`0x758D8c3CE794b3Dfe3b3A3482B7eD33de2109D95`](https://sepolia.etherscan.io/address/0x758D8c3CE794b3Dfe3b3A3482B7eD33de2109D95)
- Validators Exit Bus Oracle:
  - ValidatorsExitBusOracle: [`0x7637d44c9f2e9cA584a8B5D2EA493012A5cdaEB6`](https://sepolia.etherscan.io/address/0x7637d44c9f2e9cA584a8B5D2EA493012A5cdaEB6) (proxy)
  - HashConsensus: [`0x098a952BD200005382aEb3229e38ae39A7616F56`](https://sepolia.etherscan.io/address/0x098a952BD200005382aEb3229e38ae39A7616F56)
- OracleReportSanityChecker: [`0xbac2A471443F18aC5C31078b96C5797A78fCc680`](https://sepolia.etherscan.io/address/0xbac2A471443F18aC5C31078b96C5797A78fCc680)
- OracleDaemonConfig: [`0x7bC76076b0f3879b4A750450C0Ccf02c6Ca11220`](https://sepolia.etherscan.io/address/0x7bC76076b0f3879b4A750450C0Ccf02c6Ca11220)
- Legacy Oracle (Lido Oracle before V2, obsolete): [`0x3483c140EF7F2716460198Ff831a8e53F05F1606`](https://sepolia.etherscan.io/address/0x3483c140EF7F2716460198Ff831a8e53F05F1606) (proxy)

## DAO contracts

- Lido DAO (Kernel): [`0x6155bD199ECcc79Ff4e8B392f6cBD9c9874E8916`](https://sepolia.etherscan.io/address/0x6155bD199ECcc79Ff4e8B392f6cBD9c9874E8916) (proxy)
- LDO token: [`0xd06dF83b8ad6D89C86a187fba4Eae918d497BdCB`](https://sepolia.etherscan.io/address/0xd06dF83b8ad6D89C86a187fba4Eae918d497BdCB)
- Aragon Voting: [`0x39A0EbdEE54cB319f4F42141daaBDb6ba25D341A`](https://sepolia.etherscan.io/address/0x39A0EbdEE54cB319f4F42141daaBDb6ba25D341A) (proxy)
- Aragon Token Manager: [`0xC73cd4B2A7c1CBC5BF046eB4A7019365558ABF66`](https://sepolia.etherscan.io/address/0xC73cd4B2A7c1CBC5BF046eB4A7019365558ABF66) (proxy)
- Aragon Finance: [`0x52AD3004Bc993d63931142Dd4f3DD647414048a1`](https://sepolia.etherscan.io/address/0x52AD3004Bc993d63931142Dd4f3DD647414048a1) (proxy)
- Aragon Agent: [`0x32A0E5828B62AAb932362a4816ae03b860b65e83`](https://sepolia.etherscan.io/address/0x32A0E5828B62AAb932362a4816ae03b860b65e83) (proxy)
- Aragon ACL: [`0x8A1AA86d35b2EE8C9369618E7D7b40000cCD3295`](https://sepolia.etherscan.io/address/0x8A1AA86d35b2EE8C9369618E7D7b40000cCD3295) (proxy)
- Lido APMRegistry: [`0x63C2b6310911a234A6A2c4E7dCd9218Ce79b9A9c`](https://sepolia.etherscan.io/address/0x63C2b6310911a234A6A2c4E7dCd9218Ce79b9A9c) (proxy)
- Aragon APMRegistry: [`0xDC7F3C08AA574d39Fc97fDCE20f8fA68EA2A0f22`](https://sepolia.etherscan.io/address/0xDC7F3C08AA574d39Fc97fDCE20f8fA68EA2A0f22) (proxy)

## Testnet ad-hoc addresses

- Deployer: [`0x6885E36BFcb68CB383DfE90023a462C03BCB2AE5`](https://sepolia.etherscan.io/address/0x6885E36BFcb68CB383DfE90023a462C03BCB2AE5)
