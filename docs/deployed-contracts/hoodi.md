# Hoodi

:::warning
Currently, the main operational and maintained protocol testnet is being migrated from [Holešky](/deployed-contracts/holesky.md) to [Hoodi](/deployed-contracts/hoodi.md).
:::

## Core protocol

- Lido Locator: [`0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8`](https://hoodi.etherscan.io/address/0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8) (proxy)
- Lido and stETH token: [`0x3508A952176b3c15387C97BE809eaffB1982176a`](https://hoodi.etherscan.io/address/0x3508A952176b3c15387C97BE809eaffB1982176a) (proxy)
- wstETH token: [`0x7E99eE3C66636DE415D2d7C880938F2f40f94De4`](https://hoodi.etherscan.io/address/0x7E99eE3C66636DE415D2d7C880938F2f40f94De4)
- EIP-712 helper for stETH: [`0x2A1d51BF3aAA7A7D027C8f561e5f579876a17B0a`](https://hoodi.etherscan.io/address/0x2A1d51BF3aAA7A7D027C8f561e5f579876a17B0a)
- Staking Router: [`0xCc820558B39ee15C7C45B59390B503b83fb499A8`](https://hoodi.etherscan.io/address/0xCc820558B39ee15C7C45B59390B503b83fb499A8) (proxy)
- Deposit Security Module: [`0x2F0303F20E0795E6CCd17BD5efE791A586f28E03`](https://hoodi.etherscan.io/address/0x2F0303F20E0795E6CCd17BD5efE791A586f28E03)
- Execution Layer Rewards Vault: [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)
- Withdrawal Queue ERC721: [`0xfe56573178f1bcdf53F01A6E9977670dcBBD9186`](https://hoodi.etherscan.io/address/0xfe56573178f1bcdf53F01A6E9977670dcBBD9186) (proxy)
- Withdrawal Vault: [`0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2`](https://hoodi.etherscan.io/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2) (proxy)
- Burner: [`0x4e9A9ea2F154bA34BE919CD16a4A953DCd888165`](https://hoodi.etherscan.io/address/0x4e9A9ea2F154bA34BE919CD16a4A953DCd888165)
- Min First Allocation Strategy: [`0x6d1a9bBFF97f7565e9532FEB7b499982848E5e07`](https://hoodi.etherscan.io/address/0x6d1a9bBFF97f7565e9532FEB7b499982848E5e07) (external lib)
- MEV Boost Relay Allowed List: [`0x279d3A456212a1294DaEd0faEE98675a52E8A4Bf`](https://hoodi.etherscan.io/address/0x279d3A456212a1294DaEd0faEE98675a52E8A4Bf)

## Oracle Contracts

- Accounting Oracle:
  - AccountingOracle: [`0xcb883B1bD0a41512b42D2dB267F2A2cd919FB216`](https://hoodi.etherscan.io/address/0xcb883B1bD0a41512b42D2dB267F2A2cd919FB216) (proxy)
  - HashConsensus: [`0x32EC59a78abaca3f91527aeB2008925D5AaC1eFC`](https://hoodi.etherscan.io/address/0x32EC59a78abaca3f91527aeB2008925D5AaC1eFC)
- Validators Exit Bus Oracle:
  - ValidatorsExitBusOracle: [`0x8664d394C2B3278F26A1B44B967aEf99707eeAB2`](https://hoodi.etherscan.io/address/0x8664d394C2B3278F26A1B44B967aEf99707eeAB2) (proxy)
  - HashConsensus: [`0x30308CD8844fb2DB3ec4D056F1d475a802DCA07c`](https://hoodi.etherscan.io/address/0x30308CD8844fb2DB3ec4D056F1d475a802DCA07c)
- OracleReportSanityChecker: [`0x26AED10459e1096d242ABf251Ff55f8DEaf52348`](https://hoodi.etherscan.io/address/0x26AED10459e1096d242ABf251Ff55f8DEaf52348)
- OracleDaemonConfig: [`0x2a833402e3F46fFC1ecAb3598c599147a78731a9`](https://hoodi.etherscan.io/address/0x2a833402e3F46fFC1ecAb3598c599147a78731a9)
- Legacy Oracle (Lido Oracle before V2, obsolete): [`0x5B70b650B7E14136eb141b5Bf46a52f962885752`](https://hoodi.etherscan.io/address/0x5B70b650B7E14136eb141b5Bf46a52f962885752) (proxy)

## DAO contracts

- Lido DAO (Kernel): [`0xA48DF029Fd2e5FCECB3886c5c2F60e3625A1E87d`](https://hoodi.etherscan.io/address/0xA48DF029Fd2e5FCECB3886c5c2F60e3625A1E87d) (proxy)
- LDO token: [`0xEf2573966D009CcEA0Fc74451dee2193564198dc`](https://hoodi.etherscan.io/address/0xEf2573966D009CcEA0Fc74451dee2193564198dc)
- Aragon Voting: [`0x49B3512c44891bef83F8967d075121Bd1b07a01B`](https://hoodi.etherscan.io/address/0x49B3512c44891bef83F8967d075121Bd1b07a01B) (proxy)
- Aragon Token Manager: [`0x8ab4a56721Ad8e68c6Ad86F9D9929782A78E39E5`](https://hoodi.etherscan.io/address/0x8ab4a56721Ad8e68c6Ad86F9D9929782A78E39E5) (proxy)
- Aragon Finance: [`0x254Ae22bEEba64127F0e59fe8593082F3cd13f6b`](https://hoodi.etherscan.io/address/0x254Ae22bEEba64127F0e59fe8593082F3cd13f6b) (proxy)
- Aragon Agent: [`0x0534aA41907c9631fae990960bCC72d75fA7cfeD`](https://hoodi.etherscan.io/address/0x0534aA41907c9631fae990960bCC72d75fA7cfeD) (proxy)
- Aragon ACL: [`0x78780e70Eae33e2935814a327f7dB6c01136cc62`](https://hoodi.etherscan.io/address/0x78780e70Eae33e2935814a327f7dB6c01136cc62) (proxy)
- Voting Repo: [`0xc972Cdea5956482Ef35BF5852601dD458353cEbD`](https://hoodi.etherscan.io/address/0xc972Cdea5956482Ef35BF5852601dD458353cEbD) (proxy)
- Token Manager Repo: [`0xCdE5696e83B1Fb6B8321e35361bB6e9A8bCbfb3f`](https://hoodi.etherscan.io/address/0xCdE5696e83B1Fb6B8321e35361bB6e9A8bCbfb3f) (proxy)
- Finance Repo: [`0xa91aA04E0D6a06063d2E878309B60b723D75584d`](https://hoodi.etherscan.io/address/0xa91aA04E0D6a06063d2E878309B60b723D75584d) (proxy)
- Agent Repo: [`0x7AA5670B2b4f6f0F7369F4F701C03ebFCe97d130`](https://hoodi.etherscan.io/address/0x7AA5670B2b4f6f0F7369F4F701C03ebFCe97d130) (proxy)
- Lido App Repo: [`0xd3545AC0286A94970BacC41D3AF676b89606204F`](https://hoodi.etherscan.io/address/0xd3545AC0286A94970BacC41D3AF676b89606204F) (proxy)
- Lido Oracle (Legacy Oracle) Repo: [`0x6E0997D68C1930a76413DE7da666D8A531eF1f9b`](https://hoodi.etherscan.io/address/0x6E0997D68C1930a76413DE7da666D8A531eF1f9b) (proxy)
- Node Operators Registry Repo: [`0x52eff83071275341ef0A5A2cE48ee818Cef44c39`](https://hoodi.etherscan.io/address/0x52eff83071275341ef0A5A2cE48ee818Cef44c39) (proxy)
- Simple DVT Repo: [`0x2b8B52A5e3485853aDccED669B1d0bbF31D40222`](https://hoodi.etherscan.io/address/0x2b8B52A5e3485853aDccED669B1d0bbF31D40222) (proxy)
- Sandbox Repo: [`0x89D37eC788988e98BEceB32a8774394F1338B09C`](https://hoodi.etherscan.io/address/0x89D37eC788988e98BEceB32a8774394F1338B09C) (proxy)
- EVMScriptRegistry: [`0xe4D32427b1F9b12ab89B142eD3714dCAABB3f38c`](https://hoodi.etherscan.io/address/0xe4D32427b1F9b12ab89B142eD3714dCAABB3f38c) (proxy)
- CallsScript: [`0xfB3cB48d81eC8c7f2013a8dc9fA46D2D48112c3A`](https://hoodi.etherscan.io/address/0xfB3cB48d81eC8c7f2013a8dc9fA46D2D48112c3A)
- Lido APMRegistry: [`0x15EBf349e1ee9Cd949049fD9352D0c94De046d7b`](https://hoodi.etherscan.io/address/0x15EBf349e1ee9Cd949049fD9352D0c94De046d7b) (proxy)
- Aragon APMRegistry: [`0x948ffB5fDA2961C60ED3Eb84c7a31aae42EbEdCC`](https://hoodi.etherscan.io/address/0x948ffB5fDA2961C60ED3Eb84c7a31aae42EbEdCC) (proxy)
- Gate Seal Blueprint: [`0x8685Ca0311E4aBd846ee1b5b8B09299E990523F7`](https://hoodi.etherscan.io/address/0x8685Ca0311E4aBd846ee1b5b8B09299E990523F7)
- Gate Seal Factory: [`0xA402349F560D45310D301E92B1AA4DeCABe147B3`](https://hoodi.etherscan.io/address/0xA402349F560D45310D301E92B1AA4DeCABe147B3)
- Gate Seal: [`0x2168Ea6D948Ab49c3D34c667A7e02F92369F3A9C`](https://hoodi.etherscan.io/address/0x2168Ea6D948Ab49c3D34c667A7e02F92369F3A9C)

## Data Bus

- DataBus on Chiado (Testnet): [`0x37De961D6bb5865867aDd416be07189D2Dd960e6`](https://gnosis-chiado.blockscout.com/address/0x37De961D6bb5865867aDd416be07189D2Dd960e6)

## Staking modules

### Curated Module

- Node Operators Registry: [`0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5`](https://hoodi.etherscan.io/address/0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5)

### Simple DVT Module

- Node Operators Registry: [`0x0B5236BECA68004DB89434462DfC3BB074d2c830`](https://hoodi.etherscan.io/address/0x0B5236BECA68004DB89434462DfC3BB074d2c830)

### Sandbox Module

- Node Operators Registry: [`0x682E94d2630846a503BDeE8b6810DF71C9806891`](https://hoodi.etherscan.io/address/0x682E94d2630846a503BDeE8b6810DF71C9806891)

### Community Staking Module

- CSModule: [`0x79CEf36D84743222f37765204Bec41E92a93E59d`](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d) (proxy)
- CSAccounting: [`0xA54b90BA34C5f326BC1485054080994e38FB4C60`](https://hoodi.etherscan.io/address/0xA54b90BA34C5f326BC1485054080994e38FB4C60) (proxy)
- CSFeeDistributor: [`0xaCd9820b0A2229a82dc1A0770307ce5522FF3582`](https://hoodi.etherscan.io/address/0xaCd9820b0A2229a82dc1A0770307ce5522FF3582) (proxy)
- CSVerifier: [`0xB6bafBD970a4537077dE59cebE33081d794513d6`](https://hoodi.etherscan.io/address/0xB6bafBD970a4537077dE59cebE33081d794513d6)
- CSEarlyAdoption: [`0x3281b9E45518F462E594697f8fba1896a8B43939`](https://hoodi.etherscan.io/address/0x3281b9E45518F462E594697f8fba1896a8B43939)
- GateSeal: [`0xEe1f7f0ebB5900F348f2CfbcC641FB1681359B8a`](https://hoodi.etherscan.io/address/0xEe1f7f0ebB5900F348f2CfbcC641FB1681359B8a)
- CSFeeOracle:
  - CSFeeOracle: [`0xe7314f561B2e72f9543F1004e741bab6Fc51028B`](https://hoodi.etherscan.io/address/0xe7314f561B2e72f9543F1004e741bab6Fc51028B) (proxy)
  - HashConsensus: [`0x54f74a10e4397dDeF85C4854d9dfcA129D72C637`](https://hoodi.etherscan.io/address/0x54f74a10e4397dDeF85C4854d9dfcA129D72C637)
- External libraries:
  - AssetRecovererLib: [`0xa0513a7e28dac4c31b5ccbf9a5f474b759257985`](https://hoodi.etherscan.io/address/0xa0513a7e28dac4c31b5ccbf9a5f474b759257985)
  - NOAddresses: [`0x479244bac2ae1d64841753307a0552183642c121`](https://hoodi.etherscan.io/address/0x479244bac2ae1d64841753307a0552183642c121)
  - QueueLib: [`0x6fb7af5addb044182caa27db35e394ed3451a4da`](https://hoodi.etherscan.io/address/0x6fb7af5addb044182caa27db35e394ed3451a4da)

<!--
## DAO-ops contracts & addresses

==TODO==
-->

## Easy Track

- EasyTrack: [`0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a`](https://hoodi.etherscan.io/address/0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a)
- EVMScriptExecutor: [`0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E`](https://hoodi.etherscan.io/address/0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E)

### Easy Track factories for staking modules

- **Curated Node Operators staking module** (registry: [`0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5`](https://hoodi.etherscan.io/address/0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5))
  - IncreaseNodeOperatorStakingLimit: [`0x0f121e4069e17a2Dc5bAbF39d769313a1e20f323`](https://hoodi.etherscan.io/address/0x0f121e4069e17a2Dc5bAbF39d769313a1e20f323)
- **Community Staking Module** (module: [`0x79CEf36D84743222f37765204Bec41E92a93E59d`](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d))
  - CSMSettleElStealingPenalty: [`0x5c0af5b9f96921d3F61503e1006CF0ab9867279E`](https://hoodi.etherscan.io/address/0x5c0af5b9f96921d3F61503e1006CF0ab9867279E)
- **Simple DVT staking module** (registry: [`0x0B5236BECA68004DB89434462DfC3BB074d2c830`](https://hoodi.etherscan.io/address/0x0B5236BECA68004DB89434462DfC3BB074d2c830), committee ms [`0xbB958292042c604855d23F8db458855d20e16996`](https://app.safe.protofire.io/home?safe=hoe:0xbB958292042c604855d23F8db458855d20e16996))
  - AddNodeOperators: [`0x42f2532ab3d41dfD6030db1EC2fF3DBC8DCdf89a`](https://hoodi.etherscan.io/address/0x42f2532ab3d41dfD6030db1EC2fF3DBC8DCdf89a)
  - ActivateNodeOperators: [`0xfA3B3EE204E1f0f165379326768667300992530e`](https://hoodi.etherscan.io/address/0xfA3B3EE204E1f0f165379326768667300992530e)
  - DeactivateNodeOperators: [`0x3114bEbC222Faec27DF8AB7f9bD8dF2063d7fc77`](https://hoodi.etherscan.io/address/0x3114bEbC222Faec27DF8AB7f9bD8dF2063d7fc77)
  - SetVettedValidatorsLimits: [`0x956c5dC6cfc8603b2293bF8399B718cbf61a9dda`](https://hoodi.etherscan.io/address/0x956c5dC6cfc8603b2293bF8399B718cbf61a9dda)
  - SetNodeOperatorNames: [`0x2F98760650922cf65f1b596635bC5835b6E561d4`](https://hoodi.etherscan.io/address/0x2F98760650922cf65f1b596635bC5835b6E561d4)
  - SetNodeOperatorRewardAddresses: [`0x3d267e4f8d9dCcc83c2DE66729e6A5B2B0856e31`](https://hoodi.etherscan.io/address/0x3d267e4f8d9dCcc83c2DE66729e6A5B2B0856e31)
  - UpdateTargetValidatorLimits: [`0xc3975Bc4091B585c57357990155B071111d7f4f8`](https://hoodi.etherscan.io/address/0xc3975Bc4091B585c57357990155B071111d7f4f8)
  - ChangeNodeOperatorManager: [`0x8a437cd5685e270cDDb347eeEfEbD22109Fa42a9`](https://hoodi.etherscan.io/address/0x8a437cd5685e270cDDb347eeEfEbD22109Fa42a9)

<!--
### Easy Track factories for token transfers

==TODO==

## Testnet DAO Multisigs

==TODO==

## Testnet Stablecoins

==TODO==
-->
