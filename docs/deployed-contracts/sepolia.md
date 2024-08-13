# Sepolia

:::warning
Sepolia testnet has only a limited set of working parts of the protocol.

For instance, the in-protocol [withdrawals](/docs/contracts/withdrawal-queue-erc721.md) aren't available
(paused indefinitely), please use the [Holešky testnet](./holesky.md) deployment if possible.

The goals for this testnet deployment are:

- Have end-to-end testnet for Lido on L2
- The running-in of new zk-based oracles (based on [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) availability)

There will be no comprehensive Lido testnet environment available for Sepolia due to the network's restricted
and permission-based [validator set](https://github.com/eth-clients/sepolia/issues/12) configuration.
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
- SepoliaDepositAdapter: [`0x5c5C4556F0017FF57c331185E1C61d91acEf966e`](https://sepolia.etherscan.io/address/0x5c5C4556F0017FF57c331185E1C61d91acEf966e) (impl)

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
- Emergency breaks (EOA replacement): [`0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1`](https://sepolia.etherscan.io/address/0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1)

## Lido on L2

### Optimism

##### Ethereum part

- TokenRateNotifier: [`0x10cA9008D7dcea1Bed4d5394F8c58F3113A2814D`](https://sepolia.etherscan.io/address/0x10cA9008D7dcea1Bed4d5394F8c58F3113A2814D)
- OpStackTokenRatePusher: [`0x4067B05a6B2f6801Bfb8d4fF417eD32e71c216d9`](https://sepolia.etherscan.io/address/0x4067B05a6B2f6801Bfb8d4fF417eD32e71c216d9)
- L1LidoTokensBridge: [`0x4Abf633d9c0F4aEebB4C2E3213c7aa1b8505D332`](https://sepolia.etherscan.io/address/0x4Abf633d9c0F4aEebB4C2E3213c7aa1b8505D332) (proxy)
- L1LidoTokensBridge: [`0x8375029773953d91CaCfa452b7D24556b9F318AA`](https://sepolia.etherscan.io/address/0x8375029773953d91CaCfa452b7D24556b9F318AA) (impl)

##### Optimism part

- WstETH ERC20BridgedPermit: [`0x24B47cd3A74f1799b32B2de11073764Cb1bb318B`](https://sepolia-optimism.etherscan.io/address/0x24B47cd3A74f1799b32B2de11073764Cb1bb318B) (proxy) 
- WstETH ERC20BridgedPermit: [`0x298953B9426eba4F35a137a4754278a16d97A063`](https://sepolia-optimism.etherscan.io/address/0x298953B9426eba4F35a137a4754278a16d97A063) (impl)
- StETH ERC20RebasableBridgedPermit: [`0xf49D208B5C7b10415C7BeAFe9e656F2DF9eDfe3B`](https://sepolia-optimism.etherscan.io/address/0xf49D208B5C7b10415C7BeAFe9e656F2DF9eDfe3B) (proxy)
- StETH ERC20RebasableBridgedPermit: [`0xFd21C82c99ddFa56EB0B9B2D1d0709b7E26D1B2C`](https://sepolia-optimism.etherscan.io/address/0xFd21C82c99ddFa56EB0B9B2D1d0709b7E26D1B2C) (impl)
- TokenRateOracle: [`0xB34F2747BCd9BCC4107A0ccEb43D5dcdd7Fabf89`](https://sepolia-optimism.etherscan.io/address/0xB34F2747BCd9BCC4107A0ccEb43D5dcdd7Fabf89) (proxy)
- TokenRateOracle: [`0xa989A4B3A26e28DC9d106F163B2B1f35153E0517`](https://sepolia-optimism.etherscan.io/address/0xa989A4B3A26e28DC9d106F163B2B1f35153E0517) (impl)
- L2ERC20ExtendedTokensBridge: [`0xdBA2760246f315203F8B716b3a7590F0FFdc704a`](https://sepolia-optimism.etherscan.io/address/0xdBA2760246f315203F8B716b3a7590F0FFdc704a) (proxy)
- L2ERC20ExtendedTokensBridge: [`0xD48c69358193a34aC035ea7dfB70daDea1600112`](https://sepolia-optimism.etherscan.io/address/0xD48c69358193a34aC035ea7dfB70daDea1600112) (impl)
- Optimism Governance Bridge Executor: [`0xf695357C66bA514150Da95b189acb37b46DDe602`](https://sepolia-optimism.etherscan.io/address/0xf695357C66bA514150Da95b189acb37b46DDe602)

### Scroll

##### Ethereum part

- L1LidoGateway: [`0xF22B24fa7c3168f30b17fd97b71bdd3162DDe029`](https://sepolia.etherscan.io/address/0xF22B24fa7c3168f30b17fd97b71bdd3162DDe029) (proxy)
- L1LidoGateway: [`0x99845934FC8Ed44F3E6e66b3BAecf24d9e457F7f`](https://sepolia.etherscan.io/address/0x99845934FC8Ed44F3E6e66b3BAecf24d9e457F7f) (impl)
- ProxyAdmin: [`0x0dB416f4387ED89c1C99955fe0Ecad458f07c467`](https://sepolia.etherscan.io/address/0x0dB416f4387ED89c1C99955fe0Ecad458f07c467) for L1LidoGateway

##### Scroll part

- ScrollBridgeExecutor: [`0x6b314986E3737Ce23c2a13036e77b3f5A846F8AF`](https://sepolia.scrollscan.com/address/0x6b314986E3737Ce23c2a13036e77b3f5A846F8AF)
- L2LidoGateway: [`0x635B054A092F6aE61Ce0Fddc397A704F6626510D`](https://sepolia.scrollscan.com/address/0x635B054A092F6aE61Ce0Fddc397A704F6626510D) (proxy)
- L2LidoGateway: [`0x906CD1Bfa5C3f7B2FF9BFBB5950ada841ED99E72`](https://sepolia.scrollscan.com/address/0x906CD1Bfa5C3f7B2FF9BFBB5950ada841ED99E72) (impl)
- L2WstETHToken: [`0x2DAf22Caf40404ad8ff0Ab1E77F9C08Fef3953e2`](https://sepolia.scrollscan.com/address/0x2DAf22Caf40404ad8ff0Ab1E77F9C08Fef3953e2) (proxy)
- L2WstETHToken: [`0xaed405fc13d66e2f1055f6efe9a5ce736652fa55`](https://sepolia.scrollscan.com/address/0xaed405fc13d66e2f1055f6efe9a5ce736652fa55) (impl)
- ProxyAdmin: [`0xc6cdc2839378d50e03c9737723d96d117b09bda5`](https://sepolia.scrollscan.com/address/0xc6cdc2839378d50e03c9737723d96d117b09bda5) for:
  - L2LidoGateway
  - L2WstETHToken

### Mode

##### Ethereum part

- L1ERC20TokenBridge: [`0x16B929D35B200EA0ae0B93EABc3Bf9Ad611BF18F`](https://sepolia.etherscan.io/address/0x16B929D35B200EA0ae0B93EABc3Bf9Ad611BF18F) (proxy)
- L1ERC20TokenBridge: [`0x8c1E68A74E71594925c7D7a78Ef43657aec4d599`](https://sepolia.etherscan.io/address/0x8c1E68A74E71594925c7D7a78Ef43657aec4d599) (impl)

##### Mode part

- WstETH ERC20Bridged: [`0x2C937931B5d544E3dff1d9D78c80d9772B55837A`](https://sepolia.explorer.mode.network/address/0x2C937931B5d544E3dff1d9D78c80d9772B55837A) (proxy)
- WstETH ERC20Bridged: [`0xC9C796E4CefdD38Eb462E84246bE41d500149162`](https://sepolia.explorer.mode.network/address/0xC9C796E4CefdD38Eb462E84246bE41d500149162) (impl)
- L2ERC20TokenBridge: [`0xd41a90e55bcfC1CbF96D78aE80BbCB56A6BA0008`](https://sepolia.explorer.mode.network/address/0xd41a90e55bcfC1CbF96D78aE80BbCB56A6BA0008) (proxy)
- L2ERC20TokenBridge: [`0x8Cc0183D53c8fB160BFB01fe49ff3E8A9Aa0B1F6`](https://sepolia.explorer.mode.network/address/0x8Cc0183D53c8fB160BFB01fe49ff3E8A9Aa0B1F6) (impl)
- Optimism Governance Bridge Executor: [`0x442a6Bea15718588391C5d1dE261AB2c617eA703`](https://sepolia.explorer.mode.network/address/0x442a6Bea15718588391C5d1dE261AB2c617eA703)

## Lido on outer chains

### Binance Smart Chain (BSC)

##### Ethereum part

###### a.DI governance forwarding

- CrossChainController: [`0x9d8548963Fa0a9BE7C434cA482dd5b79E8062d3A`](https://sepolia.etherscan.io/address/0x9d8548963Fa0a9BE7C434cA482dd5b79E8062d3A) (proxy)
- CrossChainController: [`0x57B3C8DC50d1C881fCB384Da4d66f3d610671177`](https://sepolia.etherscan.io/address/0x57B3C8DC50d1C881fCB384Da4d66f3d610671177) (impl)
- ProxyAdmin [`0x7BE89331452883D335C2556d1863CD2925E76afc`](https://sepolia.etherscan.io/address/0x7BE89331452883D335C2556d1863CD2925E76afc) for CrossChainController
- CCIPAdapterTestnet: [`0xA0362E6D6f399A3dca79a20cf6041807F7Bfd89e`](https://sepolia.etherscan.io/address/0xA0362E6D6f399A3dca79a20cf6041807F7Bfd89e)
- HyperLaneAdapter: [`0x9aa88aD35da12C89F5514d04e3BBd8CD95fDf428`](https://sepolia.etherscan.io/address/0x9aa88aD35da12C89F5514d04e3BBd8CD95fDf428)
- LayerZeroAdapterTestnet: [`0xFA3199330C9F33e5bA2D559574033D9cf3FCb609`](https://sepolia.etherscan.io/address/0xFA3199330C9F33e5bA2D559574033D9cf3FCb609)
- WormholeAdapterTestnet: [`0x82C16B1e054fa94bf60b54A1Aa9FA74c5872899d`](https://sepolia.etherscan.io/address/0x82C16B1e054fa94bf60b54A1Aa9FA74c5872899d)

###### wstETH on BSC endpoints

- NTT Manager: [`0x8B715EAf61A7DdF61C67d5D46687c796D1f47146`](https://sepolia.etherscan.io/address/0x8B715EAf61A7DdF61C67d5D46687c796D1f47146) (proxy)
- NTT Manager: [`0x607b139bfee21b2676ee664a237a70d737b9466e`](https://sepolia.etherscan.io/address/0x607b139bfee21b2676ee664a237a70d737b9466e) (impl)
- Wormhole Transceiver: [`0xF2bc73502283fcaC4b047dfE45366d8744daaC5B`](https://sepolia.etherscan.io/address/0xF2bc73502283fcaC4b047dfE45366d8744daaC5B)
- Axelar Transceiver: [`0xaa8267908e8d2BEfeB601f88A7Cf3ec148039423`](https://sepolia.etherscan.io/address/0xaa8267908e8d2BEfeB601f88A7Cf3ec148039423)
- Transceiver Structs: [`0xf0396a8077eda579f657B5E6F3c3F5e8EE81972b`](https://sepolia.etherscan.io/address/0xf0396a8077eda579f657B5E6F3c3F5e8EE81972b)

##### BSC part

###### a.DI governance forwarding

- CrossChainController: [`0x1FAa7AFD7851e7Cf931053e49CE26D4E262698b6`](https://testnet.bscscan.com/address/0x1FAa7AFD7851e7Cf931053e49CE26D4E262698b6) (proxy)
- CrossChainController: [`0x5EC23B39E6E8eb5BA0c7064a0c08b5e678b02F37`](https://testnet.bscscan.com/address/0x5EC23B39E6E8eb5BA0c7064a0c08b5e678b02F37) (impl)
- ProxyAdmin [`0x490E441352635aacA64224c8205636FD9d2e3362`](https://testnet.bscscan.com/address/0x490E441352635aacA64224c8205636FD9d2e3362) for CrossChainController
- CrossChainExecutor: [`0x69EE990d0AADEfcbbA0F2de94E0F26521ae680ff`](https://testnet.bscscan.com/address/0x69EE990d0AADEfcbbA0F2de94E0F26521ae680ff)
- CCIPAdapterTestnet: [`0x39B321FC78B96fB184191788dD87e8B7c498bcEa`](https://testnet.bscscan.com/address/0x39B321FC78B96fB184191788dD87e8B7c498bcEa)
- HyperLaneAdapter: [`0xa75A4F7E70a983b7388CcAA1F6C88BebC4AFc0Ef`](https://testnet.bscscan.com/address/0xa75A4F7E70a983b7388CcAA1F6C88BebC4AFc0Ef)
- LayerZeroAdapterTestnet: [`0xa950B68BDA44419683c788C5E5845abC8F1863C1`](https://testnet.bscscan.com/address/0xa950B68BDA44419683c788C5E5845abC8F1863C1)
- WormholeAdapterTestnet: [`0x30dF46cF148Df5eB53eb8B81b0BD5Bc785001E12`](https://testnet.bscscan.com/address/0x30dF46cF148Df5eB53eb8B81b0BD5Bc785001E12)

###### wstETH on BSC endpoints

- WstEthL2Token: [`0x0B15635FCF5316EdFD2a9A0b0dC3700aeA4D09E6`](https://testnet.bscscan.com/address/0x0B15635FCF5316EdFD2a9A0b0dC3700aeA4D09E6) (proxy)
- WstEthL2Token: [`0x83bc41aae95b447134e72892ba659d6ea664d496`](https://testnet.bscscan.com/address/0x83bc41aae95b447134e72892ba659d6ea664d496) (impl)
- NTT Manager: [`0x66Cb5a992570EF01b522Bc59A056a64A84Bd0aAa`](https://testnet.bscscan.com/address/0x66Cb5a992570EF01b522Bc59A056a64A84Bd0aAa) (proxy)
- NTT Manager: [`0xa0310f52f4ac9c394a82b2e19267a78d3390a16f`](https://testnet.bscscan.com/address/0xa0310f52f4ac9c394a82b2e19267a78d3390a16f) (impl)
- Wormhole Transceiver: [`0x3a84364d27Ed3D16022Da0f603f3E0F74826c707`](https://testnet.bscscan.com/address/0x3a84364d27Ed3D16022Da0f603f3E0F74826c707)
- Axelar Transceiver: [`0xaa8267908e8d2BEfeB601f88A7Cf3ec148039423`](https://testnet.bscscan.com/address/0xaa8267908e8d2BEfeB601f88A7Cf3ec148039423)
- Transceiver Structs: [`0xf0396a8077eda579f657B5E6F3c3F5e8EE81972b`](https://testnet.bscscan.com/address/0xf0396a8077eda579f657B5E6F3c3F5e8EE81972b)
