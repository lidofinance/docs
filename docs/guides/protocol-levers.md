# Protocol levers

Lido V3 governance controls a set of configurable parameters across core pool, oracle, withdrawals, and stVaults. This page summarizes the primary on-chain levers, who can operate them, and provides concrete addresses for role holders.

## Governance structure

| Entity             | Address                                                                                                                                        | Description                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Aragon Voting      | [`0x2e59A20f205bB85a89C53f1936454680651E618e`](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e)                        | LDO token voting for protocol governance               |
| DAO Agent          | [`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c)                        | DAO execution agent; holds most admin roles            |
| Aragon ACL         | [`0x9895f0f17cc1d1891b6f18ee0b483b6f221b37bb`](https://etherscan.io/address/0x9895f0f17cc1d1891b6f18ee0b483b6f221b37bb)                        | Permission registry for AragonApp-based access control |
| Easy Track         | [`0xF0211b7660680B49De1A7E9f25C65660F0a13Fea`](https://etherscan.io/address/0xF0211b7660680B49De1A7E9f25C65660F0a13Fea)                        | Optimistic governance for routine operations           |
| stVaults Committee | [`0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF`](https://app.safe.global/home?safe=eth:0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF)               | Manages stVaults operations via Easy Track             |
| GateSeal Committee | [`0x8772E3a2D86B9347A2688f9bc1808A6d8917760C`](https://app.safe.global/transactions/queue?safe=eth:0x8772E3a2D86B9347A2688f9bc1808A6d8917760C) | Emergency pause capability                             |
| Reseal Manager     | [`0x7914b5a1539b97Bd0bbd155757F25FD79A522d24`](https://etherscan.io/address/0x7914b5a1539b97Bd0bbd155757F25FD79A522d24)                        | Manages resume/reseal for emergency pauses (GateSeal)  |
| EasyTrack          | [`0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977`](https://etherscan.io/address/0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977)                        | Easy Track used for stVaults management                |
| VaultsAdapter      | [`0x28F9Ac198C4E0FA6A9Ad2c2f97CB38F1A3120f27`](https://etherscan.io/address/0x28F9Ac198C4E0FA6A9Ad2c2f97CB38F1A3120f27)                        | Easy Track adapter for stVaults management             |

## Upgradeability

All protocol proxy admins are set to the **Lido DAO Agent** ([`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c)). Upgrades require a successful DAO vote.

Core upgradeable contracts:

| Contract                                                         | Proxy Address                                                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [LidoLocator](/contracts/lido-locator)                           | [`0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb`](https://etherscan.io/address/0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb) |
| [Lido](/contracts/lido)                                          | [`0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) |
| [Accounting](/contracts/accounting)                              | [`0x23ED611be0e1a820978875C0122F92260804cdDf`](https://etherscan.io/address/0x23ED611be0e1a820978875C0122F92260804cdDf) |
| [AccountingOracle](/contracts/accounting-oracle)                 | [`0x852deD011285fe67063a08005c71a85690503Cee`](https://etherscan.io/address/0x852deD011285fe67063a08005c71a85690503Cee) |
| [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle) | [`0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e`](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e) |
| [StakingRouter](/contracts/staking-router)                       | [`0xFdDf38947aFB03C621C71b06C9C70bce73f12999`](https://etherscan.io/address/0xFdDf38947aFB03C621C71b06C9C70bce73f12999) |
| [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)      | [`0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1`](https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1) |
| [WithdrawalVault](/contracts/withdrawal-vault)                   | [`0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f`](https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f) |
| [Burner](/contracts/burner)                                      | [`0xE76c52750019b80B43E36DF30bf4060EB73F573a`](https://etherscan.io/address/0xE76c52750019b80B43E36DF30bf4060EB73F573a) |
| [VaultHub](/contracts/vault-hub)                                 | [`0x1d201BE093d847f6446530Efb0E8Fb426d176709`](https://etherscan.io/address/0x1d201BE093d847f6446530Efb0E8Fb426d176709) |
| [PredepositGuarantee](/contracts/predeposit-guarantee)           | [`0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3`](https://etherscan.io/address/0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3) |
| [OperatorGrid](/contracts/operator-grid)                         | [`0xC69685E89Cefc327b43B7234AC646451B27c544d`](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d) |
| [LazyOracle](/contracts/lazy-oracle)                             | [`0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c`](https://etherscan.io/address/0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c) |

## Lido (core pool)

Key levers on the core pool contract [Lido](/contracts/lido) ([`0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84)):

| Lever                 | Mutators                                    | Role                        | Role registry | Role admin | Holder     |
| --------------------- | ------------------------------------------- | --------------------------- | ------------- | ---------- | ---------- |
| Pause/Resume protocol | `stop()`, `resume()`                        | `PAUSE_ROLE`, `RESUME_ROLE` | Aragon ACL    | DAO Agent  | Unassigned |
| Staking limits        | `setStakingLimit()`, `removeStakingLimit()` | `STAKING_CONTROL_ROLE`      | Aragon ACL    | DAO Agent  | Unassigned |
| External shares cap   | `setMaxExternalRatioBP()`                   | `STAKING_CONTROL_ROLE`      | Aragon ACL    | DAO Agent  | Unassigned |

### Emergency pause

The GateSeal mechanism allows emergency pausing without a full DAO vote:

| GateSeal         | Address                                                                                                                 | Sealable Contracts                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| VEB and TWG      | [`0xA6BC802fAa064414AA62117B4a53D27fFfF741F1`](https://etherscan.io/address/0xA6BC802fAa064414AA62117B4a53D27fFfF741F1) | ValidatorsExitBusOracle, TriggerableWithdrawalsGateway |
| Withdrawal Queue | [`0x8A854C4E750CDf24f138f34A9061b2f556066912`](https://etherscan.io/address/0x8A854C4E750CDf24f138f34A9061b2f556066912) | WithdrawalQueueERC721                                  |
| VaultHub and PDG | [`0x881dAd714679A6FeaA636446A0499101375A365c`](https://etherscan.io/address/0x881dAd714679A6FeaA636446A0499101375A365c) | VaultHub, PredepositGuarantee                          |

GateSeal pauses are time-limited and require DAO vote to resume or extend.

## Accounting and oracles

| Lever                | Contract                                                             | Mutators                                          | Role                                                              | Role registry             | Role admin | Holder     |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | ------------------------- | ---------- | ---------- |
| Consensus settings   | [AccountingOracle](/contracts/accounting-oracle)                     | `setConsensusVersion()`, `setConsensusContract()` | `MANAGE_CONSENSUS_VERSION_ROLE`, `MANAGE_CONSENSUS_CONTRACT_ROLE` | AccountingOracle          | DAO Agent  | Unassigned |
| Oracle report bounds | [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker) | Various limit setters                             | `ALL_LIMITS_MANAGER_ROLE`                                         | OracleReportSanityChecker | DAO Agent  | Unassigned |
| LazyOracle sanity    | [LazyOracle](/contracts/lazy-oracle)                                 | `updateSanityParams()`                            | `UPDATE_SANITY_PARAMS_ROLE`                                       | LazyOracle                | DAO Agent  | Unassigned |

### Oracle consensus

Oracle reports are submitted through HashConsensus contracts:

| Oracle                                                           | HashConsensus Address                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [AccountingOracle](/contracts/accounting-oracle)                 | [`0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288`](https://etherscan.io/address/0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288) |
| [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle) | [`0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a`](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a) |

## StakingRouter and modules

[StakingRouter](/contracts/staking-router) ([`0xFdDf38947aFB03C621C71b06C9C70bce73f12999`](https://etherscan.io/address/0xFdDf38947aFB03C621C71b06C9C70bce73f12999)):

| Lever                  | Mutators                                                                  | Role                                 | Role registry | Role admin | Holder     |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------ | ------------- | ---------- | ---------- |
| Module registry        | `addStakingModule()`, `updateStakingModule()`, `setStakingModuleStatus()` | `STAKING_MODULE_MANAGE_ROLE`         | StakingRouter | DAO Agent  | DAO Agent  |
| Module fees            | `setStakingModuleFees()`                                                  | `STAKING_MODULE_MANAGE_ROLE`         | StakingRouter | DAO Agent  | DAO Agent  |
| Withdrawal credentials | `setWithdrawalCredentials()`                                              | `MANAGE_WITHDRAWAL_CREDENTIALS_ROLE` | StakingRouter | DAO Agent  | Unassigned |

### Active staking modules

| Module                          | Registry Address                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Curated (NodeOperatorsRegistry) | [`0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5`](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5) |
| SimpleDVT                       | [`0xaE7B191A31f627b4eB1d4DaC64eaB9976995b433`](https://etherscan.io/address/0xaE7B191A31f627b4eB1d4DaC64eaB9976995b433) |
| Community Staking (CSM)         | [`0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F`](https://etherscan.io/address/0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F) |

## Withdrawals

[WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721) ([`0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1`](https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1)):

| Lever       | Mutators         | Role          | Role registry         | Role admin | Holder                   |
| ----------- | ---------------- | ------------- | --------------------- | ---------- | ------------------------ |
| Pause       | `pauseFor()`     | `PAUSE_ROLE`  | WithdrawalQueueERC721 | DAO Agent  | Reseal Manager, GateSeal |
| Resume      | `resume()`       | `RESUME_ROLE` | WithdrawalQueueERC721 | DAO Agent  | Reseal Manager           |
| Bunker mode | `onOracleReport` | `ORACLE_ROLE` | WithdrawalQueueERC721 | DAO Agent  | AccountingOracle         |

## stVaults (VaultHub + OperatorGrid)

### VaultHub

[VaultHub](/contracts/vault-hub) ([`0x1d201BE093d847f6446530Efb0E8Fb426d176709`](https://etherscan.io/address/0x1d201BE093d847f6446530Efb0E8Fb426d176709)):

| Lever             | Mutators                                               | Role                   | Role registry | Role admin | Holder                       |
| ----------------- | ------------------------------------------------------ | ---------------------- | ------------- | ---------- | ---------------------------- |
| Vault connections | `connectVault()`, `updateConnection()`, `disconnect()` | `VAULT_MASTER_ROLE`    | VaultHub      | DAO Agent  | Unassigned                   |
| Bad debt handling | `socializeBadDebt()`, `internalizeBadDebt()`           | `BAD_DEBT_MASTER_ROLE` | VaultHub      | DAO Agent  | stVaults Easy Track executor |
| Forced exits      | `forceValidatorExit()`                                 | `VALIDATOR_EXIT_ROLE`  | VaultHub      | DAO Agent  | stVaults Easy Track executor |
| Pause             | `pauseFor()`                                           | `PAUSE_ROLE`           | VaultHub      | DAO Agent  | Reseal Manager, GateSeal     |
| Resume            | `resume()`                                             | `RESUME_ROLE`          | VaultHub      | DAO Agent  | Reseal Manager               |

### OperatorGrid

[OperatorGrid](/contracts/operator-grid) ([`0xC69685E89Cefc327b43B7234AC646451B27c544d`](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d)):

| Lever              | Mutators                                     | Role            | Role registry | Role admin | Holder                                          |
| ------------------ | -------------------------------------------- | --------------- | ------------- | ---------- | ----------------------------------------------- |
| Group registration | `registerGroup()`, `updateGroupShareLimit()` | `REGISTRY_ROLE` | OperatorGrid  | DAO Agent  | EVMScriptExecutor, stVaults Easy Track executor |
| Tier management    | `registerTiers()`, `alterTiers()`            | `REGISTRY_ROLE` | OperatorGrid  | DAO Agent  | EVMScriptExecutor, stVaults Easy Track executor |
| Vault fees         | `updateVaultFees()`                          | `REGISTRY_ROLE` | OperatorGrid  | DAO Agent  | EVMScriptExecutor, stVaults Easy Track executor |
| Jail status        | `setVaultJailStatus()`                       | `REGISTRY_ROLE` | OperatorGrid  | DAO Agent  | EVMScriptExecutor, stVaults Easy Track executor |

### stVaults Easy Track factories

The stVaults Committee operates these via Easy Track:

| Factory                   | Address                                                                                                                 | Purpose                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Register Groups           | [`0x194A46DA1947E98c9D79af13E06Cfbee0D8610cC`](https://etherscan.io/address/0x194A46DA1947E98c9D79af13E06Cfbee0D8610cC) | Add node operator groups       |
| Update Groups Share Limit | [`0x8Bdc726a3147D8187820391D7c6F9F942606aEe6`](https://etherscan.io/address/0x8Bdc726a3147D8187820391D7c6F9F942606aEe6) | Modify group share limits      |
| Set Jail Status           | [`0x93F1DEE4473Ee9F42c8257C201e33a6Da30E5d67`](https://etherscan.io/address/0x93F1DEE4473Ee9F42c8257C201e33a6Da30E5d67) | Jail/unjail vaults             |
| Update Vaults Fees        | [`0x5C3bDFa3E7f312d8cf72F56F2b797b026f6B471c`](https://etherscan.io/address/0x5C3bDFa3E7f312d8cf72F56F2b797b026f6B471c) | Modify vault fee parameters    |
| Force Validator Exits     | [`0x6C968cD89CA358fbAf57B18e77a8973Fa869a6aA`](https://etherscan.io/address/0x6C968cD89CA358fbAf57B18e77a8973Fa869a6aA) | Trigger forced validator exits |
| Socialize Bad Debt        | [`0x1dF50522A1D868C12bF71747Bb6F24A18Fe6d32C`](https://etherscan.io/address/0x1dF50522A1D868C12bF71747Bb6F24A18Fe6d32C) | Handle bad debt between vaults |

## Dual Governance

Lido V3 includes a Dual Governance system allowing stETH holders to veto DAO decisions:

| Component                      | Address                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Dual Governance                | [`0xC1db28B3301331277e307FDCfF8DE28242A4486E`](https://etherscan.io/address/0xC1db28B3301331277e307FDCfF8DE28242A4486E) |
| Emergency Protected Timelock   | [`0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316`](https://etherscan.io/address/0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316) |
| Veto Signaling Escrow          | [`0x165813A31446a98c84E20Dda8C101BB3C8228e1c`](https://etherscan.io/address/0x165813A31446a98c84E20Dda8C101BB3C8228e1c) |
| Emergency Activation Committee | [`0x8B7854488Fde088d686Ea672B6ba1A5242515f45`](https://etherscan.io/address/0x8B7854488Fde088d686Ea672B6ba1A5242515f45) |
| Emergency Execution Committee  | [`0xC7792b3F2B399bB0EdF53fECDceCeB97FBEB18AF`](https://etherscan.io/address/0xC7792b3F2B399bB0EdF53fECDceCeB97FBEB18AF) |

## References

- [Deployed contracts (mainnet)](/deployed-contracts)
- [AccountingOracle](/contracts/accounting-oracle)
- [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [VaultHub](/contracts/vault-hub)
- [OperatorGrid](/contracts/operator-grid)
- [Emergency Brakes Multisigs](/multisigs/emergency-brakes)
