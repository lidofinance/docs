# Hoodi

:::tip 📘 **Lido V3 Technical Paper**

Learn about the next evolution of Lido staking with **stVaults** — user-defined validator setups with optional stETH liquidity. Read the complete [**Lido V3 Technical Paper**](/lido-v3-whitepaper) for architecture details, mechanisms, and implementation specifics.

:::

:::info **Primary Lido Protocol Testnet**

Hoodi is the primary operational and actively maintained Lido protocol testnet. This page lists the contract addresses for the testnet, including all deployed protocol components and extensions used for testing.

**Deployment Information:**

- ⚓ Lido protocol version: [**`v3.0.2`**](https://github.com/lidofinance/core/releases/tag/v3.0.2)
- 🌐 Network: Ethereum Hoodi (Chain ID: `560048`)
- ✅ Status: Active and maintained

**Key Resources on Lido V3:**

- 🔌 [stVaults Documentation Center](/run-on-lido/stvaults/)

:::

## 🏛️ Core Protocol {#core-protocol}

- Lido Locator: [`0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8`](https://hoodi.etherscan.io/address/0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8) (proxy)
- Lido Locator: [`0x751a4aa1a29bc0c0e587aa04c3eabf0797f9b1a4`](https://hoodi.etherscan.io/address/0x751a4aa1a29bc0c0e587aa04c3eabf0797f9b1a4) (impl)
- Lido and stETH token: [`0x3508A952176b3c15387C97BE809eaffB1982176a`](https://hoodi.etherscan.io/address/0x3508A952176b3c15387C97BE809eaffB1982176a) (proxy)
- wstETH token: [`0x7E99eE3C66636DE415D2d7C880938F2f40f94De4`](https://hoodi.etherscan.io/address/0x7E99eE3C66636DE415D2d7C880938F2f40f94De4)
- wstETH referral staker: [`0xf886BcC68b240316103fE8A12453Ce7831c2e835`](https://hoodi.etherscan.io/address/0xf886BcC68b240316103fE8A12453Ce7831c2e835)
- EIP-712 helper for stETH: [`0x2A1d51BF3aAA7A7D027C8f561e5f579876a17B0a`](https://hoodi.etherscan.io/address/0x2A1d51BF3aAA7A7D027C8f561e5f579876a17B0a)
- Staking Router: [`0xCc820558B39ee15C7C45B59390B503b83fb499A8`](https://hoodi.etherscan.io/address/0xCc820558B39ee15C7C45B59390B503b83fb499A8) (proxy)
- Staking Router: [`0xd5F04A81ac472B2cB32073CE9dDABa6FaF022827`](https://hoodi.etherscan.io/address/0xd5F04A81ac472B2cB32073CE9dDABa6FaF022827) (impl)
- Deposit Security Module: [`0x2F0303F20E0795E6CCd17BD5efE791A586f28E03`](https://hoodi.etherscan.io/address/0x2F0303F20E0795E6CCd17BD5efE791A586f28E03)
- Execution Layer Rewards Vault: [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)
- Withdrawal Queue ERC721: [`0xfe56573178f1bcdf53F01A6E9977670dcBBD9186`](https://hoodi.etherscan.io/address/0xfe56573178f1bcdf53F01A6E9977670dcBBD9186) (proxy)
- Withdrawal Vault: [`0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2`](https://hoodi.etherscan.io/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2) (proxy)
- Withdrawal Vault: [`0xfe7A58960Af333eAdeAeC39149F9d6A71dc3E668`](https://hoodi.etherscan.io/address/0xfe7A58960Af333eAdeAeC39149F9d6A71dc3E668) (impl)
- Accounting: [`0x9b5b78D1C9A3238bF24662067e34c57c83E8c354`](https://hoodi.etherscan.io/address/0x9b5b78D1C9A3238bF24662067e34c57c83E8c354) (proxy)
- Burner: [`0xb2c99cd38a2636a6281a849C8de938B3eF4A7C3D`](https://hoodi.etherscan.io/address/0xb2c99cd38a2636a6281a849C8de938B3eF4A7C3D) (proxy)
- Min First Allocation Strategy: [`0x6d1a9bBFF97f7565e9532FEB7b499982848E5e07`](https://hoodi.etherscan.io/address/0x6d1a9bBFF97f7565e9532FEB7b499982848E5e07) (external lib)
- MEV Boost Relay Allowed List: [`0x279d3A456212a1294DaEd0faEE98675a52E8A4Bf`](https://hoodi.etherscan.io/address/0x279d3A456212a1294DaEd0faEE98675a52E8A4Bf)
- Triggerable Withdrawals Gateway: [`0x6679090D92b08a2a686eF8614feECD8cDFE209db`](https://hoodi.etherscan.io/address/0x6679090D92b08a2a686eF8614feECD8cDFE209db)
- Validator Exit Delay Verifier: [`0xa5F5A9360275390fF9728262a29384399f38d2f0`](https://hoodi.etherscan.io/address/0xa5F5A9360275390fF9728262a29384399f38d2f0)
- Vault Hub: [`0x4C9fFC325392090F789255b9948Ab1659b797964`](https://hoodi.etherscan.io/address/0x4C9fFC325392090F789255b9948Ab1659b797964) (proxy)
- Vault Hub: [`0xAd2C869FE66Ff4c0E347A0824Af92D2B7C91288A`](https://hoodi.etherscan.io/address/0xAd2C869FE66Ff4c0E347A0824Af92D2B7C91288A) (impl)
- Predeposit Guarantee: [`0xa5F55f3402beA2B14AE15Dae1b6811457D43581d`](https://hoodi.etherscan.io/address/0xa5F55f3402beA2B14AE15Dae1b6811457D43581d) (proxy)
- Operator Grid: [`0x501e678182bB5dF3f733281521D3f3D1aDe69917`](https://hoodi.etherscan.io/address/0x501e678182bB5dF3f733281521D3f3D1aDe69917) (proxy)

### 🔨 stVaults Factory Stack {#stvaults-factory-stack}

- Staking Vault Factory: [`0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E`](https://hoodi.etherscan.io/address/0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E)
- Staking Vault Beacon: [`0xb3e6a8B6A752d3bb905A1B3Ef12bbdeE77E8160e`](https://hoodi.etherscan.io/address/0xb3e6a8B6A752d3bb905A1B3Ef12bbdeE77E8160e)
- Staking Vault Implementation: [`0xE96BE4FB723e68e7b96244b7399C64a58bcD0062`](https://hoodi.etherscan.io/address/0xE96BE4FB723e68e7b96244b7399C64a58bcD0062)
- Staking Vault Pinned Beacon Proxy: [`0x3e144aEd003b5AE6953A99B78dD34154CF3F8c76`](https://hoodi.etherscan.io/address/0x3e144aEd003b5AE6953A99B78dD34154CF3F8c76)
- Dashboard Implementation: [`0x38131D5548Be57A34937521fe427a23f49e1e2d4`](https://hoodi.etherscan.io/address/0x38131D5548Be57A34937521fe427a23f49e1e2d4)
- Validator Consolidation Requests: [`0xbf95Cd394cC03cD03fEA62A435ac347314877f1d`](https://hoodi.etherscan.io/address/0xbf95Cd394cC03cD03fEA62A435ac347314877f1d)

## 🔮 Oracle Contracts {#oracle-contracts}

- Accounting Oracle:
  - AccountingOracle: [`0xcb883B1bD0a41512b42D2dB267F2A2cd919FB216`](https://hoodi.etherscan.io/address/0xcb883B1bD0a41512b42D2dB267F2A2cd919FB216) (proxy)
  - AccountingOracle: [`0x6D799F4C92e8eE9CC0E33367Dd47990ed49a21AC`](https://hoodi.etherscan.io/address/0x6D799F4C92e8eE9CC0E33367Dd47990ed49a21AC) (impl)
  - HashConsensus: [`0x32EC59a78abaca3f91527aeB2008925D5AaC1eFC`](https://hoodi.etherscan.io/address/0x32EC59a78abaca3f91527aeB2008925D5AaC1eFC)
- Validators Exit Bus Oracle (Validator Exit Bus):
  - ValidatorsExitBusOracle: [`0x8664d394C2B3278F26A1B44B967aEf99707eeAB2`](https://hoodi.etherscan.io/address/0x8664d394C2B3278F26A1B44B967aEf99707eeAB2) (proxy)
  - ValidatorsExitBusOracle: [`0x7E6d9C9C44417bf2EaF69685981646e9752D623A`](https://hoodi.etherscan.io/address/0x7E6d9C9C44417bf2EaF69685981646e9752D623A) (impl)
  - HashConsensus: [`0x30308CD8844fb2DB3ec4D056F1d475a802DCA07c`](https://hoodi.etherscan.io/address/0x30308CD8844fb2DB3ec4D056F1d475a802DCA07c)
- OracleReportSanityChecker: [`0x53417BA942bC86492bAF46FAbA8769f246422388`](https://hoodi.etherscan.io/address/0x53417BA942bC86492bAF46FAbA8769f246422388)
- OracleDaemonConfig: [`0x2a833402e3F46fFC1ecAb3598c599147a78731a9`](https://hoodi.etherscan.io/address/0x2a833402e3F46fFC1ecAb3598c599147a78731a9)
- Lazy Oracle: [`0xf41491C79C30e8f4862d3F4A5b790171adB8e04A`](https://hoodi.etherscan.io/address/0xf41491C79C30e8f4862d3F4A5b790171adB8e04A) (proxy)
- Lazy Oracle: [`0xC372aBC601C4eE5aA82CA2bcb54Da5a1Ef492E82`](https://hoodi.etherscan.io/address/0xC372aBC601C4eE5aA82CA2bcb54Da5a1Ef492E82) (impl)

## 🗳️ DAO & Aragon Apps {#dao-contracts}

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
- Node Operators Registry Repo: [`0x52eff83071275341ef0A5A2cE48ee818Cef44c39`](https://hoodi.etherscan.io/address/0x52eff83071275341ef0A5A2cE48ee818Cef44c39) (proxy)
- Simple DVT Repo: [`0x2b8B52A5e3485853aDccED669B1d0bbF31D40222`](https://hoodi.etherscan.io/address/0x2b8B52A5e3485853aDccED669B1d0bbF31D40222) (proxy)
- Sandbox Repo: [`0x89D37eC788988e98BEceB32a8774394F1338B09C`](https://hoodi.etherscan.io/address/0x89D37eC788988e98BEceB32a8774394F1338B09C) (proxy)
- EVMScriptRegistry: [`0xe4D32427b1F9b12ab89B142eD3714dCAABB3f38c`](https://hoodi.etherscan.io/address/0xe4D32427b1F9b12ab89B142eD3714dCAABB3f38c) (proxy)
- CallsScript: [`0xfB3cB48d81eC8c7f2013a8dc9fA46D2D48112c3A`](https://hoodi.etherscan.io/address/0xfB3cB48d81eC8c7f2013a8dc9fA46D2D48112c3A)
- Lido APMRegistry: [`0x15EBf349e1ee9Cd949049fD9352D0c94De046d7b`](https://hoodi.etherscan.io/address/0x15EBf349e1ee9Cd949049fD9352D0c94De046d7b) (proxy)
- Aragon APMRegistry: [`0x948ffB5fDA2961C60ED3Eb84c7a31aae42EbEdCC`](https://hoodi.etherscan.io/address/0x948ffB5fDA2961C60ED3Eb84c7a31aae42EbEdCC) (proxy)

### 🧬 Dual Governance {#dual-governance}

- Emergency Protected Timelock: [`0x0A5E22782C0Bd4AddF10D771f0bF0406B038282d`](https://hoodi.etherscan.io/address/0x0A5E22782C0Bd4AddF10D771f0bF0406B038282d)
  - Emergency activation committee: [`0xA678c29cbFde2C74aF15C7724EE4b1527A50D45B`](https://hoodi.etherscan.io/address/0xA678c29cbFde2C74aF15C7724EE4b1527A50D45B)
  - Emergency execution committee: [`0x8E1Ce8995E370222CbD825fFD7Dce2A5BfE1E631`](https://hoodi.etherscan.io/address/0x8E1Ce8995E370222CbD825fFD7Dce2A5BfE1E631)
- Admin Executor: [`0x0eCc17597D292271836691358B22340b78F3035B`](https://hoodi.etherscan.io/address/0x0eCc17597D292271836691358B22340b78F3035B)
- Dual Governance: [`0x9CAaCCc62c66d817CC59c44780D1b722359795bF`](https://hoodi.etherscan.io/address/0x9CAaCCc62c66d817CC59c44780D1b722359795bF)
- Dual Governance Config Provider: [`0x2b685e6fB288bBb7A82533BAfb679FfDF6E5bb33`](https://hoodi.etherscan.io/address/0x2b685e6fB288bBb7A82533BAfb679FfDF6E5bb33)
- Emergency Governance: [`0x69E8e916c4A19F42C13C802abDF2767E1fB4F059`](https://hoodi.etherscan.io/address/0x69E8e916c4A19F42C13C802abDF2767E1fB4F059)
- Escrow: [`0x781afe6C8D768CEaA9a97f2A75714e80AE0e83B9`](https://hoodi.etherscan.io/address/0x781afe6C8D768CEaA9a97f2A75714e80AE0e83B9) (proxy)
- Escrow: [`0x61b7C2351F63b7f9840736D020eE65D2803A00fb`](https://hoodi.etherscan.io/address/0x61b7C2351F63b7f9840736D020eE65D2803A00fb) (impl)
- Reseal Manager: [`0x05172CbCDb7307228F781436b327679e4DAE166B`](https://hoodi.etherscan.io/address/0x05172CbCDb7307228F781436b327679e4DAE166B)
  - Reseal committee: [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102)
- Tiebreaker Core Committee: [`0x9Ce4bA766C87cC87e507307163eA54C5003A3563`](https://hoodi.etherscan.io/address/0x9Ce4bA766C87cC87e507307163eA54C5003A3563)
- Tiebreaker Sub Committees:
  - Developers Sub Committee 1: [`0xEd27F0d08630685A0cEFb1040596Cb264cf79f14`](https://hoodi.etherscan.io/address/0xEd27F0d08630685A0cEFb1040596Cb264cf79f14)
  - Developers Sub Committee 2: [`0xE3e3c67997A4Db7d47ac7fa8ef81B677daBe5794`](https://hoodi.etherscan.io/address/0xE3e3c67997A4Db7d47ac7fa8ef81B677daBe5794)
  - Developers Sub Committee 3: [`0xF4F16CB3B9E7a076E55c508035f25E606913Cc9d`](https://hoodi.etherscan.io/address/0xF4F16CB3B9E7a076E55c508035f25E606913Cc9d)

## 🔌 CircuitBreaker {#circuit-breaker}

- CircuitBreaker: [`0x44a5789dFeDa59cD176Ab5709ec2F4829dE4d555`](https://hoodi.etherscan.io/address/0x44a5789dFeDa59cD176Ab5709ec2F4829dE4d555)

### Covered pausables and their pausers

Each pausable contract below is covered by the CircuitBreaker and has a designated pauser authorized to trigger a pause.

| Pausable | Pauser |
| --- | --- |
| [Withdrawal Queue ERC721](https://hoodi.etherscan.io/address/0xfe56573178f1bcdf53F01A6E9977670dcBBD9186) | [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102) |
| [Validators Exit Bus Oracle](https://hoodi.etherscan.io/address/0x8664d394C2B3278F26A1B44B967aEf99707eeAB2) | [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102) |
| [Triggerable Withdrawals Gateway](https://hoodi.etherscan.io/address/0x6679090D92b08a2a686eF8614feECD8cDFE209db) | [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102) |
| [Vault Hub](https://hoodi.etherscan.io/address/0x4C9fFC325392090F789255b9948Ab1659b797964) | [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102) |
| [Predeposit Guarantee](https://hoodi.etherscan.io/address/0xa5F55f3402beA2B14AE15Dae1b6811457D43581d) | [`0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102`](https://hoodi.etherscan.io/address/0x83BCE68B4e8b7071b2a664a26e6D3Bc17eEe3102) |
| [CSM Module](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [CSM Accounting](https://hoodi.etherscan.io/address/0xA54b90BA34C5f326BC1485054080994e38FB4C60) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [CSM FeeOracle](https://hoodi.etherscan.io/address/0xe7314f561B2e72f9543F1004e741bab6Fc51028B) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [CSM Verifier](https://hoodi.etherscan.io/address/0xC96406b0eADdAC5708aFCa04DcCA67BAdC9642Fd) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [CSM Ejector](https://hoodi.etherscan.io/address/0xCAe028378d69D54dc8bF809e6C44CF751F997b80) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [VettedGate (IdentifiedCommunityStakersGate)](https://hoodi.etherscan.io/address/0x10a254E724fe2b7f305F76f3F116a3969c53845f) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [VettedGate (IdentifiedDVTClusterGate)](https://hoodi.etherscan.io/address/0x887F8512F9998045f4b5993e6eaa6BCfE5F02A94) | [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53) |
| [CM v2 Module](https://hoodi.etherscan.io/address/0x87EB69Ae51317405FD285efD2326a4a11f6173b9) | [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://hoodi.etherscan.io/address/0x84DffcfB232594975C608DE92544Ff239a24c9E9) |
| [CM v2 Accounting](https://hoodi.etherscan.io/address/0x7f7356D29aCd915F1934220956c3305808ceB235) | [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://hoodi.etherscan.io/address/0x84DffcfB232594975C608DE92544Ff239a24c9E9) |
| [CM v2 FeeOracle](https://hoodi.etherscan.io/address/0x5D2F27000C80f6f7A03015Fd49dB7FEba3fBfa83) | [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://hoodi.etherscan.io/address/0x84DffcfB232594975C608DE92544Ff239a24c9E9) |
| [CM v2 Verifier](https://hoodi.etherscan.io/address/0x209190Ebc2Be80367a15d05e626784Eb94d6A880) | [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://hoodi.etherscan.io/address/0x84DffcfB232594975C608DE92544Ff239a24c9E9) |
| [CM v2 Ejector](https://hoodi.etherscan.io/address/0xfDbde2B3554B69C84e0f8d7daB68D390Ff0f4394) | [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://hoodi.etherscan.io/address/0x84DffcfB232594975C608DE92544Ff239a24c9E9) |

## 📊 Data Bus {#data-bus}

- DataBus on Chiado (Testnet): [`0x37De961D6bb5865867aDd416be07189D2Dd960e6`](https://gnosis-chiado.blockscout.com/address/0x37De961D6bb5865867aDd416be07189D2Dd960e6)

## 🤖 Bots {#bots}

- Depositor bot: [`0x9b186cE78Ddd6fF098b4a533Dd17a139e1FFeD76`](https://hoodi.etherscan.io/address/0x9b186cE78Ddd6fF098b4a533Dd17a139e1FFeD76)

## 🔄 Post Token Rebase Receiver {#post-token-rebase-receiver}

- Token Rate Notifier: [`0x9c53d0075eA00ad77dDAd1b71E67bb97AaBC1e3D`](https://hoodi.etherscan.io/address/0x9c53d0075eA00ad77dDAd1b71E67bb97AaBC1e3D)

## 🧩 Staking Modules {#staking-modules}

### 🛡️ Curated Module

- Node Operators Registry: [`0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5`](https://hoodi.etherscan.io/address/0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5) (proxy)
- Node Operators Registry: [`0x95F00b016bB31b7182D96D25074684518246E42a`](https://hoodi.etherscan.io/address/0x95F00b016bB31b7182D96D25074684518246E42a) (impl)

### 🧩 Simple DVT Module

- Node Operators Registry: [`0x0B5236BECA68004DB89434462DfC3BB074d2c830`](https://hoodi.etherscan.io/address/0x0B5236BECA68004DB89434462DfC3BB074d2c830) (proxy)
- Node Operators Registry: [`0x95F00b016bB31b7182D96D25074684518246E42a`](https://hoodi.etherscan.io/address/0x95F00b016bB31b7182D96D25074684518246E42a) (impl)

### 🧪 Sandbox Module

- Node Operators Registry: [`0x682E94d2630846a503BDeE8b6810DF71C9806891`](https://hoodi.etherscan.io/address/0x682E94d2630846a503BDeE8b6810DF71C9806891) (proxy)
- Node Operators Registry: [`0x95F00b016bB31b7182D96D25074684518246E42a`](https://hoodi.etherscan.io/address/0x95F00b016bB31b7182D96D25074684518246E42a) (impl)

### 🤝 Community Staking Module

- Entry Gates:
  - PermissionlessGate: [`0xd7bD8D2A9888D1414c770B35ACF55890B15de26a`](https://hoodi.etherscan.io/address/0xd7bD8D2A9888D1414c770B35ACF55890B15de26a)
  - VettedGate (IdentifiedCommunityStakersGate): [`0x10a254E724fe2b7f305F76f3F116a3969c53845f`](https://hoodi.etherscan.io/address/0x10a254E724fe2b7f305F76f3F116a3969c53845f) (proxy)
  - VettedGate (IdentifiedDVTClusterGate): [`0x887F8512F9998045f4b5993e6eaa6BCfE5F02A94`](https://hoodi.etherscan.io/address/0x887F8512F9998045f4b5993e6eaa6BCfE5F02A94) (proxy)
  - VettedGate: [`0x3b834c6d043F4CE5C61d84723bA737D405B2e276`](https://hoodi.etherscan.io/address/0x3b834c6d043F4CE5C61d84723bA737D405B2e276) (impl, shared)
- CSModule: [`0x79CEf36D84743222f37765204Bec41E92a93E59d`](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d) (proxy)
- CSModule: [`0x161b1DAa658fD0D78a4603860edd8Ed06f98F4cA`](https://hoodi.etherscan.io/address/0x161b1DAa658fD0D78a4603860edd8Ed06f98F4cA) (impl)
- Accounting: [`0xA54b90BA34C5f326BC1485054080994e38FB4C60`](https://hoodi.etherscan.io/address/0xA54b90BA34C5f326BC1485054080994e38FB4C60) (proxy)
- Accounting: [`0x3a18675fFB2C37A4296dD794A7Ed94644225F881`](https://hoodi.etherscan.io/address/0x3a18675fFB2C37A4296dD794A7Ed94644225F881) (impl)
- ParametersRegistry: [`0xA4aD5236963f9Fe4229864712269D8d79B65C5Ad`](https://hoodi.etherscan.io/address/0xA4aD5236963f9Fe4229864712269D8d79B65C5Ad) (proxy)
- ParametersRegistry: [`0x58376D8B192813E85532b25685D948EB49c2A8B5`](https://hoodi.etherscan.io/address/0x58376D8B192813E85532b25685D948EB49c2A8B5) (impl)
- FeeDistributor: [`0xaCd9820b0A2229a82dc1A0770307ce5522FF3582`](https://hoodi.etherscan.io/address/0xaCd9820b0A2229a82dc1A0770307ce5522FF3582) (proxy)
- FeeDistributor: [`0x74c5be19CcD1a264899FbCf8dB1a64C1e3fb73Ac`](https://hoodi.etherscan.io/address/0x74c5be19CcD1a264899FbCf8dB1a64C1e3fb73Ac) (impl)
- Verifier: [`0xC96406b0eADdAC5708aFCa04DcCA67BAdC9642Fd`](https://hoodi.etherscan.io/address/0xC96406b0eADdAC5708aFCa04DcCA67BAdC9642Fd)
- FeeOracle:
  - FeeOracle: [`0xe7314f561B2e72f9543F1004e741bab6Fc51028B`](https://hoodi.etherscan.io/address/0xe7314f561B2e72f9543F1004e741bab6Fc51028B) (proxy)
  - FeeOracle: [`0x27d1Ff0353AF6b7480CBc902169d0F89b49334B5`](https://hoodi.etherscan.io/address/0x27d1Ff0353AF6b7480CBc902169d0F89b49334B5) (impl)
  - HashConsensus: [`0x54f74a10e4397dDeF85C4854d9dfcA129D72C637`](https://hoodi.etherscan.io/address/0x54f74a10e4397dDeF85C4854d9dfcA129D72C637)
- ValidatorStrikes: [`0x8fBA385C3c334D251eE413e79d4D3890db98693c`](https://hoodi.etherscan.io/address/0x8fBA385C3c334D251eE413e79d4D3890db98693c) (proxy)
- ValidatorStrikes: [`0x47F96DCD5cf3e94492CD050c00C9F6e33b3ca677`](https://hoodi.etherscan.io/address/0x47F96DCD5cf3e94492CD050c00C9F6e33b3ca677) (impl)
- Ejector: [`0xCAe028378d69D54dc8bF809e6C44CF751F997b80`](https://hoodi.etherscan.io/address/0xCAe028378d69D54dc8bF809e6C44CF751F997b80)
- ExitPenalties: [`0xD259b31083Be841E5C85b2D481Cfc17C14276800`](https://hoodi.etherscan.io/address/0xD259b31083Be841E5C85b2D481Cfc17C14276800) (proxy)
- ExitPenalties: [`0xf38A3DA25B417D83182EEDD30d00557d78c35C96`](https://hoodi.etherscan.io/address/0xf38A3DA25B417D83182EEDD30d00557d78c35C96) (impl)
- Factories:
  - VettedGateFactory: [`0x276C1dc9Cf1f793Fe703a5C4674A27076aE45335`](https://hoodi.etherscan.io/address/0x276C1dc9Cf1f793Fe703a5C4674A27076aE45335)

### 🛡️ Curated Module v2

- Entry Gates:
  - Professional Operator Gate: [`0xF1862d120831eBE31f7202378Ff3Ae63A5658ae3`](https://hoodi.etherscan.io/address/0xF1862d120831eBE31f7202378Ff3Ae63A5658ae3) (proxy)
  - Professional Trusted Operator Gate: [`0x410A309dF81B782190188CDB3d215729cc6bC1f3`](https://hoodi.etherscan.io/address/0x410A309dF81B782190188CDB3d215729cc6bC1f3) (proxy)
  - Public Good Operator Gate: [`0xa5A604b172787e017b1b118F02fE54fC1D696519`](https://hoodi.etherscan.io/address/0xa5A604b172787e017b1b118F02fE54fC1D696519) (proxy)
  - Decentralization Operator Gate: [`0xE966874cDB6A4282ED75Cd10439e3799e5531a2D`](https://hoodi.etherscan.io/address/0xE966874cDB6A4282ED75Cd10439e3799e5531a2D) (proxy)
  - Extra Effort Operator Gate: [`0x5c063da03e3f21443716D75a2205EE16706e1153`](https://hoodi.etherscan.io/address/0x5c063da03e3f21443716D75a2205EE16706e1153) (proxy)
  - Intra-Operator DVT Cluster Gate: [`0x1cD655Ac53CfE8269DE0DBfc0140B074623C4A6B`](https://hoodi.etherscan.io/address/0x1cD655Ac53CfE8269DE0DBfc0140B074623C4A6B) (proxy)
  - Intra-Operator DVT Cluster Plus Gate: [`0x28518be9894C20135F280a9539617783b08a04c7`](https://hoodi.etherscan.io/address/0x28518be9894C20135F280a9539617783b08a04c7) (proxy)
  - Gate: [`0x7531741520127Ae5D483875b4747D2A2e76Ac759`](https://hoodi.etherscan.io/address/0x7531741520127Ae5D483875b4747D2A2e76Ac759) (impl, shared)
- CuratedModule: [`0x87EB69Ae51317405FD285efD2326a4a11f6173b9`](https://hoodi.etherscan.io/address/0x87EB69Ae51317405FD285efD2326a4a11f6173b9) (proxy)
- CuratedModule: [`0x22C16D0511D919d5Ed756b8F8d1a35c32A7370C5`](https://hoodi.etherscan.io/address/0x22C16D0511D919d5Ed756b8F8d1a35c32A7370C5) (impl)
- Accounting: [`0x7f7356D29aCd915F1934220956c3305808ceB235`](https://hoodi.etherscan.io/address/0x7f7356D29aCd915F1934220956c3305808ceB235) (proxy)
- Accounting: [`0x687D3C4E8fcc8aDF83e4C33337c00A5b71F53f2c`](https://hoodi.etherscan.io/address/0x687D3C4E8fcc8aDF83e4C33337c00A5b71F53f2c) (impl)
- ParametersRegistry: [`0xefb8e4091A75C4828826bf64595F392f87A07b37`](https://hoodi.etherscan.io/address/0xefb8e4091A75C4828826bf64595F392f87A07b37) (proxy)
- ParametersRegistry: [`0x4F5C45d88Fa9fFd409b5a6D933BC41256a893cfb`](https://hoodi.etherscan.io/address/0x4F5C45d88Fa9fFd409b5a6D933BC41256a893cfb) (impl)
- MetaRegistry: [`0x857289cCBFBc4C134Cc312022a104CD9b38d8AAE`](https://hoodi.etherscan.io/address/0x857289cCBFBc4C134Cc312022a104CD9b38d8AAE) (proxy)
- MetaRegistry: [`0x6fAbAf8b179e1914F8D61Cd6911acA8F7eA0d90d`](https://hoodi.etherscan.io/address/0x6fAbAf8b179e1914F8D61Cd6911acA8F7eA0d90d) (impl)
- FeeDistributor: [`0x0ced6de191E2A15f7BBAf9E32307626C9f6BD0Cd`](https://hoodi.etherscan.io/address/0x0ced6de191E2A15f7BBAf9E32307626C9f6BD0Cd) (proxy)
- FeeDistributor: [`0x505113E2842726FF721634970EFE3f46dD239019`](https://hoodi.etherscan.io/address/0x505113E2842726FF721634970EFE3f46dD239019) (impl)
- Verifier: [`0x209190Ebc2Be80367a15d05e626784Eb94d6A880`](https://hoodi.etherscan.io/address/0x209190Ebc2Be80367a15d05e626784Eb94d6A880)
- FeeOracle:
  - FeeOracle: [`0x5D2F27000C80f6f7A03015Fd49dB7FEba3fBfa83`](https://hoodi.etherscan.io/address/0x5D2F27000C80f6f7A03015Fd49dB7FEba3fBfa83) (proxy)
  - FeeOracle: [`0x5AE7D76050f57D3c42931B3c845ec09b42c3370d`](https://hoodi.etherscan.io/address/0x5AE7D76050f57D3c42931B3c845ec09b42c3370d) (impl)
  - HashConsensus: [`0x920883908A78c1554f682006a8aB32E62Be09F33`](https://hoodi.etherscan.io/address/0x920883908A78c1554f682006a8aB32E62Be09F33)
- ValidatorStrikes: [`0x4c427Ec826F403339719C0FABfb3209e80939eA6`](https://hoodi.etherscan.io/address/0x4c427Ec826F403339719C0FABfb3209e80939eA6) (proxy)
- ValidatorStrikes: [`0xd0AbD2957e406007dE5D901B1ddfB880274D9752`](https://hoodi.etherscan.io/address/0xd0AbD2957e406007dE5D901B1ddfB880274D9752) (impl)
- Ejector: [`0xfDbde2B3554B69C84e0f8d7daB68D390Ff0f4394`](https://hoodi.etherscan.io/address/0xfDbde2B3554B69C84e0f8d7daB68D390Ff0f4394)
- ExitPenalties: [`0xad79e1d3B380cEb1a0e188fBAB91f85A446E9E54`](https://hoodi.etherscan.io/address/0xad79e1d3B380cEb1a0e188fBAB91f85A446E9E54) (proxy)
- ExitPenalties: [`0xBed0DC3db54ff9cc0B5C1B17292d85681783b029`](https://hoodi.etherscan.io/address/0xBed0DC3db54ff9cc0B5C1B17292d85681783b029) (impl)
- Factories:
  - GateFactory: [`0x1EE26Ac6c9942196b55F91EEF63f390f51c48293`](https://hoodi.etherscan.io/address/0x1EE26Ac6c9942196b55F91EEF63f390f51c48293)

<!--
## DAO-ops contracts & addresses

==TODO==
-->

## ⚡ Easy Track {#easy-track}

- EasyTrack: [`0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a`](https://hoodi.etherscan.io/address/0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a)
- EVMScriptExecutor: [`0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E`](https://hoodi.etherscan.io/address/0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E)

### 🧩 Easy Track factories for staking modules {#easy-track-factories-for-staking-modules}

- **Curated Node Operators staking module** (registry: [`0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5`](https://hoodi.etherscan.io/address/0x5cDbE1590c083b5A2A64427fAA63A7cfDB91FbB5))
  - IncreaseNodeOperatorStakingLimit: [`0x0f121e4069e17a2Dc5bAbF39d769313a1e20f323`](https://hoodi.etherscan.io/address/0x0f121e4069e17a2Dc5bAbF39d769313a1e20f323)
  - CuratedSubmitExitRequestHashes: [`0x397206ecdbdcb1A55A75e60Fc4D054feC72E5f63`](https://hoodi.etherscan.io/address/0x397206ecdbdcb1A55A75e60Fc4D054feC72E5f63)
- **Community Staking Module** (module: [`0x79CEf36D84743222f37765204Bec41E92a93E59d`](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d), trusted caller [`0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53`](https://hoodi.etherscan.io/address/0x4AF43Ee34a6fcD1fEcA1e1F832124C763561dA53))
  - CSMSettleElStealingPenalty: [`0x5c0af5b9f96921d3F61503e1006CF0ab9867279E`](https://hoodi.etherscan.io/address/0x5c0af5b9f96921d3F61503e1006CF0ab9867279E)
  - CSMSetVettedGateTree: [`0xa890fc73e1b771Ee6073e2402E631c312FF92Cd9`](https://hoodi.etherscan.io/address/0xa890fc73e1b771Ee6073e2402E631c312FF92Cd9)
  - SetMerkleGateTree: [`0xf71fcB20B9FB8468653Bcb24E31F39bc069D5995`](https://hoodi.etherscan.io/address/0xf71fcB20B9FB8468653Bcb24E31F39bc069D5995)
  - ReportWithdrawalsForSlashedValidators: [`0x4EaB04775837A6F0218750A10454119f349258FE`](https://hoodi.etherscan.io/address/0x4EaB04775837A6F0218750A10454119f349258FE)
  - SettleGeneralDelayedPenalty: [`0xd0c38B2F0C1F760976dA010C1c35D828331Ff9E2`](https://hoodi.etherscan.io/address/0xd0c38B2F0C1F760976dA010C1c35D828331Ff9E2)
  - UpdateStakingModuleShareLimits: [`0xD63cf25df1bA6144db27A81A98120Dfc53dE4540`](https://hoodi.etherscan.io/address/0xD63cf25df1bA6144db27A81A98120Dfc53dE4540)
- **Curated Module v2** (module: [`0x87EB69Ae51317405FD285efD2326a4a11f6173b9`](https://hoodi.etherscan.io/address/0x87EB69Ae51317405FD285efD2326a4a11f6173b9), committee ms [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://app.safe.protofire.io/home?safe=hoe:0x84DffcfB232594975C608DE92544Ff239a24c9E9))
  - SetMerkleGateTree: [`0x5194cC02B6F477B4a23DFA422fFC238c8B5b1736`](https://hoodi.etherscan.io/address/0x5194cC02B6F477B4a23DFA422fFC238c8B5b1736)
  - ReportWithdrawalsForSlashedValidators: [`0x6E40FED7c28bAA93a798cA10f8A93965a19eC52e`](https://hoodi.etherscan.io/address/0x6E40FED7c28bAA93a798cA10f8A93965a19eC52e)
  - SettleGeneralDelayedPenalty: [`0x3486B872768D361309e405A046C4BF995c21CC6c`](https://hoodi.etherscan.io/address/0x3486B872768D361309e405A046C4BF995c21CC6c)
  - CreateOrUpdateOperatorGroup: [`0x44D9b39bBdc2182Aa1af6f16f8F55E0eA038294d`](https://hoodi.etherscan.io/address/0x44D9b39bBdc2182Aa1af6f16f8F55E0eA038294d)
- **Staking Router** (router: [`0xCc820558B39ee15C7C45B59390B503b83fb499A8`](https://hoodi.etherscan.io/address/0xCc820558B39ee15C7C45B59390B503b83fb499A8))
  - AllowConsolidationPair: [`0x22D36e7616F541A527989C5652fDA4d527bB461C`](https://hoodi.etherscan.io/address/0x22D36e7616F541A527989C5652fDA4d527bB461C)
- **Simple DVT staking module** (registry: [`0x0B5236BECA68004DB89434462DfC3BB074d2c830`](https://hoodi.etherscan.io/address/0x0B5236BECA68004DB89434462DfC3BB074d2c830), committee ms [`0xbB958292042c604855d23F8db458855d20e16996`](https://app.safe.protofire.io/home?safe=hoe:0xbB958292042c604855d23F8db458855d20e16996))
  - AddNodeOperators: [`0x42f2532ab3d41dfD6030db1EC2fF3DBC8DCdf89a`](https://hoodi.etherscan.io/address/0x42f2532ab3d41dfD6030db1EC2fF3DBC8DCdf89a)
  - ActivateNodeOperators: [`0xfA3B3EE204E1f0f165379326768667300992530e`](https://hoodi.etherscan.io/address/0xfA3B3EE204E1f0f165379326768667300992530e)
  - DeactivateNodeOperators: [`0x3114bEbC222Faec27DF8AB7f9bD8dF2063d7fc77`](https://hoodi.etherscan.io/address/0x3114bEbC222Faec27DF8AB7f9bD8dF2063d7fc77)
  - SetVettedValidatorsLimits: [`0x956c5dC6cfc8603b2293bF8399B718cbf61a9dda`](https://hoodi.etherscan.io/address/0x956c5dC6cfc8603b2293bF8399B718cbf61a9dda)
  - SetNodeOperatorNames: [`0x2F98760650922cf65f1b596635bC5835b6E561d4`](https://hoodi.etherscan.io/address/0x2F98760650922cf65f1b596635bC5835b6E561d4)
  - SetNodeOperatorRewardAddresses: [`0x3d267e4f8d9dCcc83c2DE66729e6A5B2B0856e31`](https://hoodi.etherscan.io/address/0x3d267e4f8d9dCcc83c2DE66729e6A5B2B0856e31)
  - UpdateTargetValidatorLimits: [`0xc3975Bc4091B585c57357990155B071111d7f4f8`](https://hoodi.etherscan.io/address/0xc3975Bc4091B585c57357990155B071111d7f4f8)
  - ChangeNodeOperatorManagers: [`0x8a437cd5685e270cDDb347eeEfEbD22109Fa42a9`](https://hoodi.etherscan.io/address/0x8a437cd5685e270cDDb347eeEfEbD22109Fa42a9)
  - SDVTSubmitExitRequestHashes: [`0xAa3D6A8B52447F272c1E8FAaA06EA06658bd95E2`](https://hoodi.etherscan.io/address/0xAa3D6A8B52447F272c1E8FAaA06EA06658bd95E2)

### 💰 Easy Track Factories for Token Transfers {#easy-track-factories-for-token-transfers}

- **Sandbox stETH** (trusted caller is QA & DAO Ops ms [`0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A`](https://app.safe.protofire.io/home?safe=hoe:0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A))
  - AllowedRecipientsRegistry: [`0x7E33f2192c2cEC339493B9193110BC0510d6CBD2`](https://hoodi.etherscan.io/address/0x7E33f2192c2cEC339493B9193110BC0510d6CBD2)
  - TopUpAllowedRecipients: [`0xE5aE943A3AEFA44AD16438Bc3D2cA7654103F985`](https://hoodi.etherscan.io/address/0xE5aE943A3AEFA44AD16438Bc3D2cA7654103F985)
  - AddAllowedRecipient: [`0x8f05Cc4cC42745E9723E105D38638683f162e1d9`](https://hoodi.etherscan.io/address/0x8f05Cc4cC42745E9723E105D38638683f162e1d9)
  - RemoveAllowedRecipient: [`0x86E10ffC7c67A92e0c5E58ae42945213da43D0c7`](https://hoodi.etherscan.io/address/0x86E10ffC7c67A92e0c5E58ae42945213da43D0c7)
- **Sandbox stablecoins** (trusted caller is QA & DAO Ops ms [`0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A`](https://app.safe.protofire.io/home?safe=hoe:0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A))
  - AllowedRecipientsRegistry: [`0xdf53b1cd4CFE43b6CdA3640Be0e4f1a45126ec61`](https://hoodi.etherscan.io/address/0xdf53b1cd4CFE43b6CdA3640Be0e4f1a45126ec61)
  - AllowedTokensRegistry: [`0x40Db7E8047C487bD8359289272c717eA3C34D1D3`](https://hoodi.etherscan.io/address/0x40Db7E8047C487bD8359289272c717eA3C34D1D3)
  - TopUpAllowedRecipients: [`0x9D735eeDfa96F53BF9d31DbE81B51a5d333198dB`](https://hoodi.etherscan.io/address/0x9D735eeDfa96F53BF9d31DbE81B51a5d333198dB)
- **Tooling contracts:**
  - AllowedRecipientsBuilder (single token): [`0xC20129f1dd4DFeD023a6d6A8de9d54A7b61af5CC`](https://hoodi.etherscan.io/address/0xC20129f1dd4DFeD023a6d6A8de9d54A7b61af5CC)
  - AllowedRecipientsFactory (single token): [`0xFdf256eED0ec8B782065E2aCDb975071033A6110`](https://hoodi.etherscan.io/address/0xFdf256eED0ec8B782065E2aCDb975071033A6110)
  - AllowedRecipientsBuilder (multi token): [`0xf5436129Cf9d8fa2a1cb6e591347155276550635`](https://hoodi.etherscan.io/address/0xf5436129Cf9d8fa2a1cb6e591347155276550635)
  - AllowedRecipientsFactory (multi token): [`0x08c48Fef9Cadca882E27d2325D1785858D5c1aE3`](https://hoodi.etherscan.io/address/0x08c48Fef9Cadca882E27d2325D1785858D5c1aE3)
  - BokkyPooBah's DateTime Library: [`0xd1df0cf660d531fad9eaabd3e7b4e8881e28ae2f`](https://hoodi.etherscan.io/address/0xd1df0cf660d531fad9eaabd3e7b4e8881e28ae2f)
  - AllowedTokensRegistry: [`0x40Db7E8047C487bD8359289272c717eA3C34D1D3`](https://hoodi.etherscan.io/address/0x40db7e8047c487bd8359289272c717ea3c34d1d3)

### 🤖 Easy Track Factories for MEV-Boost Relay Allowed List Management {#easy-track-factories-for-mev-boost-relay-allowed-list-management}

- **MEV-Boost Relay Allowed List** (trusted caller is QA & DAO Ops ms [`0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A`](https://app.safe.protofire.io/home?safe=hoe:0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A))
  - AddMEVBoostRelays: [`0xF02DbeaA1Bbc90226CaB995db4C190DbE25983af`](https://hoodi.etherscan.io/address/0xF02DbeaA1Bbc90226CaB995db4C190DbE25983af)
  - RemoveMEVBoostRelays: [`0x7FCc2901C6C3D62784cB178B14d44445B038f736`](https://hoodi.etherscan.io/address/0x7FCc2901C6C3D62784cB178B14d44445B038f736)
  - EditMEVBoostRelay: [`0x27A99a7104190DdA297B222104A6C70A4Ca5A17e`](https://hoodi.etherscan.io/address/0x27A99a7104190DdA297B222104A6C70A4Ca5A17e)

### 🔨 Easy Track Factories for stVaults Management {#easy-track-factories-for-stvaults-management}

- **Operator Grid:** (trusted caller is Testnet stVaults Committee ms [`0xeBe5948787Bb3a565F67ccD93cb85A91960c472a`](https://app.safe.protofire.io/home?safe=hoe:0xeBe5948787Bb3a565F67ccD93cb85A91960c472a))
  - Register Groups: [`0x50ffc44FF526405dBA3e5a4833B003D93301dDDd`](https://hoodi.etherscan.io/address/0x50ffc44FF526405dBA3e5a4833B003D93301dDDd)
  - Update Groups Share Limit: [`0x99a645A4137ea171Ce4D43c22d30A71251D6Ed7d`](https://hoodi.etherscan.io/address/0x99a645A4137ea171Ce4D43c22d30A71251D6Ed7d)
  - Register Tiers: [`0x8182E168f858514328C06b5C21eec975E105D494`](https://hoodi.etherscan.io/address/0x8182E168f858514328C06b5C21eec975E105D494)
  - Alter Tiers: [`0x9A3Fe18BcD5e7657f6a78Ab895aF125Cacae2c36`](https://hoodi.etherscan.io/address/0x9A3Fe18BcD5e7657f6a78Ab895aF125Cacae2c36)
  - Set Jail Status: [`0x395E6AF61B6Ba3EC0E72E168A2Ec8204589F357c`](https://hoodi.etherscan.io/address/0x395E6AF61B6Ba3EC0E72E168A2Ec8204589F357c)
  - Update Vaults Fees: [`0x2D5b8B082d618A8d5DeFE3f4c2b2869e3f1C1a3D`](https://hoodi.etherscan.io/address/0x2D5b8B082d618A8d5DeFE3f4c2b2869e3f1C1a3D)
- **Vault Hub:** (trusted caller is Testnet stVaults Committee ms [`0xeBe5948787Bb3a565F67ccD93cb85A91960c472a`](https://app.safe.protofire.io/home?safe=hoe:0xeBe5948787Bb3a565F67ccD93cb85A91960c472a))
  - Force Validator Exits: [`0x820e9924C2059d37871acd6eccB578e4a3B15c30`](https://hoodi.etherscan.io/address/0x820e9924C2059d37871acd6eccB578e4a3B15c30)
  - Socialize Bad Debt: [`0x01C9dB53D7a87c3e47D537c925921fB735bEe6c9`](https://hoodi.etherscan.io/address/0x01C9dB53D7a87c3e47D537c925921fB735bEe6c9)
  - Set Liability Shares Target: [`0xaccaE3755d63EeaAF2e525E780aEeA8D58700Ab9`](https://hoodi.etherscan.io/address/0xaccaE3755d63EeaAF2e525E780aEeA8D58700Ab9)
- VaultsAdapter: [`0x854CF0D7446Faa7AdDFE557cc8aa9FA9b7017910`](https://hoodi.etherscan.io/address/0x854CF0D7446Faa7AdDFE557cc8aa9FA9b7017910)

## 💵 Testnet Stablecoins {#testnet-stablecoins}

- USDC: [`0x97bb030B93faF4684eAC76bA0bf3be5ec7140F36`](https://hoodi.etherscan.io/address/0x97bb030B93faF4684eAC76bA0bf3be5ec7140F36)
- USDT: [`0x64f1904d1b419c6889BDf3238e31A138E258eA68`](https://hoodi.etherscan.io/address/0x64f1904d1b419c6889BDf3238e31A138E258eA68)
- DAI: [`0x17fc691f6EF57D2CA719d30b8fe040123d4ee319`](https://hoodi.etherscan.io/address/0x17fc691f6EF57D2CA719d30b8fe040123d4ee319)
- sUSDS: [`0xDaE6a7669f9aB8b2C4E52464AA6FB7F9402aDc70`](https://hoodi.etherscan.io/address/0xDaE6a7669f9aB8b2C4E52464AA6FB7F9402aDc70)

## 🔐 Testnet DAO Multisigs {#testnet-dao-multisigs}

- QA & DAO Ops ms: [`0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A`](https://app.safe.protofire.io/home?safe=hoe:0x418B816A7c3ecA151A31d98e30aa7DAa33aBf83A)
- CMC ms [`0x84DffcfB232594975C608DE92544Ff239a24c9E9`](https://app.safe.protofire.io/home?safe=hoe:0x84DffcfB232594975C608DE92544Ff239a24c9E9)

---

:::caution
🧪 Testnet use only
stETH obtained on this network **has no real ETH backing** and **cannot** be bridged, swapped or redeemed on mainnet. Please do _not_ send mainnet tokens here – they will be lost forever.
:::

## 📚 Archived Deployments {#archived-deployments}

<details>
<summary>Lido V3: Testnet-2 (archive)</summary>

### 🏛️ Core Protocol (Archive)

- Lido Locator: [`0xD7c1B80fA86965B48cCA3aDcCB08E1DAEa291980`](https://hoodi.etherscan.io/address/0xD7c1B80fA86965B48cCA3aDcCB08E1DAEa291980) (proxy)
- Lido and stETH token: [`0x2C220A2a91602dd93bEAC7b3A1773cdADE369ba1`](https://hoodi.etherscan.io/address/0x2C220A2a91602dd93bEAC7b3A1773cdADE369ba1) (proxy)
- wstETH token: [`0x05F2927c5c2825BC0dCDc14d258a99A36116bE8B`](https://hoodi.etherscan.io/address/0x05F2927c5c2825BC0dCDc14d258a99A36116bE8B)
- EIP-712 helper for stETH: [`0xBa4F7888A7Cb803776cc2f64b269a7cC7447cD1f`](https://hoodi.etherscan.io/address/0xBa4F7888A7Cb803776cc2f64b269a7cC7447cD1f)
- Staking Router: [`0x7DE7173aeB9CDc06E429910104BD1e61a965f567`](https://hoodi.etherscan.io/address/0x7DE7173aeB9CDc06E429910104BD1e61a965f567) (proxy)
- Execution Layer Rewards Vault: [`0x99137683D4AAfaf76C84bD8F6e2Ae6A95DF90912`](https://hoodi.etherscan.io/address/0x99137683D4AAfaf76C84bD8F6e2Ae6A95DF90912)
- Withdrawal Queue (ERC‑721): [`0x07F941C56f155fA4233f0ed8d351C9Af3152E525`](https://hoodi.etherscan.io/address/0x07F941C56f155fA4233f0ed8d351C9Af3152E525) (proxy)
- Withdrawal Vault: [`0x9659aAa1458E2dba8713018Ffa36c64048345901`](https://hoodi.etherscan.io/address/0x9659aAa1458E2dba8713018Ffa36c64048345901) (proxy)
- Burner: [`0xa0f32368d67870f4864A748c910C7Ca9B99e1027`](https://hoodi.etherscan.io/address/0xa0f32368d67870f4864A748c910C7Ca9B99e1027) (proxy)
- Min First Allocation Strategy: [`0x4A08C1501a886861C17341317FF7885a5a1e5dB6`](https://hoodi.etherscan.io/address/0x4A08C1501a886861C17341317FF7885a5a1e5dB6)
- Accounting: [`0x6adfFb27Dcc6b005988E4f9D408c877643D2d8A6`](https://hoodi.etherscan.io/address/0x6adfFb27Dcc6b005988E4f9D408c877643D2d8A6) (proxy)
- Vault Hub: [`0x26b92f0fdfeBAf43E5Ea5b5974EeBee95F17Fe08`](https://hoodi.etherscan.io/address/0x26b92f0fdfeBAf43E5Ea5b5974EeBee95F17Fe08) (proxy)
- Operator Grid: [`0x35dd33A473D492745eD5226Cf940b5b1ef4C111D`](https://hoodi.etherscan.io/address/0x35dd33A473D492745eD5226Cf940b5b1ef4C111D) (proxy)
- Predeposit Guarantee: [`0xAcb99d36e19763C210A548019C6F238B67644417`](https://hoodi.etherscan.io/address/0xAcb99d36e19763C210A548019C6F238B67644417) (proxy)
- Triggerable Withdrawals Gateway: [`0xb273790D9ddA79E586Da819581f919e29ef6f83C`](https://hoodi.etherscan.io/address/0xb273790D9ddA79E586Da819581f919e29ef6f83C)
- Validator Exit Delay Verifier: [`0x1b007bC74aB26Db6413B46A04BAB88104050b142`](https://hoodi.etherscan.io/address/0x1b007bC74aB26Db6413B46A04BAB88104050b142)

#### 🔨 stVaults Factory Stack (Archive)

- Staking Vault Factory: [`0x74808E3Fe5B7714b580067Ab02032d19E0cD9f5f`](https://hoodi.etherscan.io/address/0x74808E3Fe5B7714b580067Ab02032d19E0cD9f5f)
- Staking Vault Beacon: [`0x8de3b125221d07b44FCbd2CFD7354251858817B3`](https://hoodi.etherscan.io/address/0x8de3b125221d07b44FCbd2CFD7354251858817B3)
- Staking Vault Implementation: [`0x5ff3782820Fc06cdF5a9ded897a778a6f0840b85`](https://hoodi.etherscan.io/address/0x5ff3782820Fc06cdF5a9ded897a778a6f0840b85)
- Dashboard Implementation: [`0xcb3Bb848252F7ca05ED7753Ead0Eb2bdfD2ba878`](https://hoodi.etherscan.io/address/0xcb3Bb848252F7ca05ED7753Ead0Eb2bdfD2ba878)
- Validator Consolidation Requests: [`0xD69239eFd4812E70238D9E3a80945C9138a241f6`](https://hoodi.etherscan.io/address/0xD69239eFd4812E70238D9E3a80945C9138a241f6)

### 🔮 Oracle Contracts (Archive)

- Accounting Oracle:
  - AccountingOracle: [`0x43b319f67F9c48Ca76AA60d8693dc63E3B94698F`](https://hoodi.etherscan.io/address/0x43b319f67F9c48Ca76AA60d8693dc63E3B94698F) (proxy)
  - Hash Consensus for Accounting Oracle: [`0x49C3eCB0F8C32a6F00be2848BE3Edb09Ef0646D9`](https://hoodi.etherscan.io/address/0x49C3eCB0F8C32a6F00be2848BE3Edb09Ef0646D9)
- Validators Exit Bus Oracle:
  - ValidatorsExitBusOracle: [`0xF1D059331C81C4ac9ACe81e3cE1a4961d59413f8`](https://hoodi.etherscan.io/address/0xF1D059331C81C4ac9ACe81e3cE1a4961d59413f8) (proxy)
  - Hash Consensus for Validators Exit Bus Oracle: [`0xd7890f55266A795b59E9468Cd37a8524FBf44EFd`](https://hoodi.etherscan.io/address/0xd7890f55266A795b59E9468Cd37a8524FBf44EFd)
- Oracle Report Sanity Checker: [`0x90F33A702E0DD5F050bA4910cCd3DC8b60C0901e`](https://hoodi.etherscan.io/address/0x90F33A702E0DD5F050bA4910cCd3DC8b60C0901e)
- Oracle Daemon Config: [`0x2cB903dA5DB2Ad46E367F32499fB2781E0D2eD7D`](https://hoodi.etherscan.io/address/0x2cB903dA5DB2Ad46E367F32499fB2781E0D2eD7D)
- Lazy Oracle: [`0xdF66Fb038CbB7587cC52A397CA88143657f3Ae4A`](https://hoodi.etherscan.io/address/0xdF66Fb038CbB7587cC52A397CA88143657f3Ae4A)

### 🗳️ DAO & Aragon Apps (Archive)

- Lido DAO (Kernel): [`0x207BAA2a636f094eCCBaA70FDE74D31723b7709c`](https://hoodi.etherscan.io/address/0x207BAA2a636f094eCCBaA70FDE74D31723b7709c) (proxy)
- LDO token: [`0xbfd40Db0a3CB72cF936353CE4EA6cdbBeB65F1Db`](https://hoodi.etherscan.io/address/0xbfd40Db0a3CB72cF936353CE4EA6cdbBeB65F1Db)
- Aragon Voting: [`0x3DF09262F937a92b9d7CC020e22709b6c6641d7d`](https://hoodi.etherscan.io/address/0x3DF09262F937a92b9d7CC020e22709b6c6641d7d) (proxy)
- Aragon Token Manager: [`0xB769867675CD2e3c2ea7b29b5Bd282dC1C00Ad66`](https://hoodi.etherscan.io/address/0xB769867675CD2e3c2ea7b29b5Bd282dC1C00Ad66) (proxy)
- Aragon Finance: [`0x86eAE4CBb13e5d7f8f4a3582F24F6133047672F2`](https://hoodi.etherscan.io/address/0x86eAE4CBb13e5d7f8f4a3582F24F6133047672F2) (proxy)
- Aragon Agent: [`0xEB9712bf5DD2179EEacc45A62A69b156299084a7`](https://hoodi.etherscan.io/address/0xEB9712bf5DD2179EEacc45A62A69b156299084a7) (proxy)
- Aragon ACL: [`0xF55a0c7Da6932eBd859Bd7AE896757959785340e`](https://hoodi.etherscan.io/address/0xF55a0c7Da6932eBd859Bd7AE896757959785340e) (proxy)
- GateSeal Blueprint: [`0x8685Ca0311E4aBd846ee1b5b8B09299E990523F7`](https://hoodi.etherscan.io/address/0x8685Ca0311E4aBd846ee1b5b8B09299E990523F7)
- GateSeal Factory: [`0xA402349F560D45310D301E92B1AA4DeCABe147B3`](https://hoodi.etherscan.io/address/0xA402349F560D45310D301E92B1AA4DeCABe147B3)
- GateSeal (Withdrawal Queue and TWG): [`0x3FC140BB4E493f999219B3cf1153853a507a511d`](https://hoodi.etherscan.io/address/0x3FC140BB4E493f999219B3cf1153853a507a511d)
- GateSeal (Vaulthub and PDG): [`0x58EaE128f46d2D5BF578fb4A21d0A4a3546D11d3`](https://hoodi.etherscan.io/address/0x58EaE128f46d2D5BF578fb4A21d0A4a3546D11d3)

### 🧩 Staking Modules (Archive)

#### 🛡️ Curated Module (Archive)

- Node Operators Registry: [`0xa38DE5874E81561F29cfa4436111852CC34aC1e1`](https://hoodi.etherscan.io/address/0xa38DE5874E81561F29cfa4436111852CC34aC1e1) (proxy)

#### 🧩 Simple DVT Module (Archive)

- Simple DVT: [`0x0718D0A48D9B3Fd6E03B10249655539DB4Bf63c4`](https://hoodi.etherscan.io/address/0x0718D0A48D9B3Fd6E03B10249655539DB4Bf63c4) (proxy)

### ⚡ Easy Track (Archive)

- EasyTrack: [`0x2b2b29E8C0f0fA5D16057Ca0cdC9B4152d4B8C9C`](https://hoodi.etherscan.io/address/0x2b2b29E8C0f0fA5D16057Ca0cdC9B4152d4B8C9C)
- EVMScriptExecutor: [`0xbf91a57E194c2c7a758247eC12648Fc5651478db`](https://hoodi.etherscan.io/address/0xbf91a57E194c2c7a758247eC12648Fc5651478db)
- Factories:
  - DecreaseShareLimitsInVaultHub: [`0x96B4215538d1B838a6A452d6F50c02e7fA258f43`](https://hoodi.etherscan.io/address/0x96B4215538d1B838a6A452d6F50c02e7fA258f43)
  - DecreaseVaultsFeesInVaultHub: [`0x806F27100347d735819f25B75Be3f0acBd6aEbAF`](https://hoodi.etherscan.io/address/0x806F27100347d735819f25B75Be3f0acBd6aEbAF)
  - ForceValidatorExitsInVaultHub: [`0xd0E3b451495E63923e45fC95f5Dc2e16c55e4209`](https://hoodi.etherscan.io/address/0xd0E3b451495E63923e45fC95f5Dc2e16c55e4209)
  - SocializeBadDebtInVaultHub: [`0x921A2D3efcE8b66b0CA9493a2C26AEf69aFC8f1E`](https://hoodi.etherscan.io/address/0x921A2D3efcE8b66b0CA9493a2C26AEf69aFC8f1E)
  - SetVaultRedemptionsInVaultHub: [`0x8562BA0D14851cb2cB88d7E1497968e9001E7f94`](https://hoodi.etherscan.io/address/0x8562BA0D14851cb2cB88d7E1497968e9001E7f94)
  - RegisterGroupsInOperatorGrid: [`0x89a7472DD79dDEb731Bc7B3Aad6ba42666616D22`](https://hoodi.etherscan.io/address/0x89a7472DD79dDEb731Bc7B3Aad6ba42666616D22)
  - UpdateGroupsShareLimitInOperatorGrid: [`0x34086e861a46F378AA89a53DCA8fF6eB03d4a0Ab`](https://hoodi.etherscan.io/address/0x34086e861a46F378AA89a53DCA8fF6eB03d4a0Ab)
  - RegisterTiersInOperatorGrid: [`0xB824727CA93C7f2C7749ce4F3FaCB138EbB46854`](https://hoodi.etherscan.io/address/0xB824727CA93C7f2C7749ce4F3FaCB138EbB46854)
  - AlterTiersInOperatorGrid:[`0xD4aF3d17efd18DF0D6a84b8111b9Cd71A039E4a4`](https://hoodi.etherscan.io/address/0xD4aF3d17efd18DF0D6a84b8111b9Cd71A039E4a4)
- Adapters:
  - VaultHubAdapter: [`0xb4A1E35cdE96A9E36542bDC3aDb276542a2378b4`](https://hoodi.etherscan.io/address/0xb4A1E35cdE96A9E36542bDC3aDb276542a2378b4)

#### ⛏️ Special accounts and addresses

<details>
<summary>Show/hide</summary>

| Contract                           | Address                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Deposit Security Module (EOA stub) | [`0xfF772cd178D04F0B4b1EFB730c5F2B9683B31611`](https://hoodi.etherscan.io/address/0xfF772cd178D04F0B4b1EFB730c5F2B9683B31611) |
| Deployer (EOA)                     | [`0x26EDb7f0f223A25EE390aCCccb577F3a31edDfC5`](https://hoodi.etherscan.io/address/0x26EDb7f0f223A25EE390aCCccb577F3a31edDfC5) |

</details>

---

</details>
