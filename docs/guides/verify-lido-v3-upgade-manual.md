---

TODO:

- [ ] GateSeal for VaultHub & PDG (pause window/roles)
  - [ ] GateSeal (VaultHub+PDG) address = 0x9c2D30177DB12334998EB554f5d4E6dD44458167
  - [ ] sealingCommittee = 0x8772E3a2D86B9347A2688f9bc1808A6d8917760C
  - [ ] sealDuration = 1,209,600 seconds (14 days)
  - [ ] `VAULT_HUB.PAUSE_ROLE` + `PREDEPOSIT_GUARANTEE.PAUSE_ROLE` holders = GateSeal; `RESUME_ROLE` = ResealManager 0x7914b5a1539b97Bd0bbd155757F25FD79A522d24
  - [ ] Seal expiry for VaultHub/PDG = 1791454296 (state-mate config)

- [ ] EasyTrack (stVaults)
  - [ ] trustedCaller = 0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF
  - [ ] initialValidatorExitFeeLimit = 100000000000000000 wei (0.1 ETH)
  - [ ] maxGroupShareLimit = 50000000000000000000000
  - [ ] maxDefaultTierShareLimit = 0
  - [ ] EVMScript executor = 0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977
  - [ ] Factories [AlterTiers, RegisterGroups, RegisterTiers, UpdateGroupsShareLimit, SetJailStatus, UpdateVaultsFees, ForceValidatorExits, SetLiabilitySharesTarget, SocializeBadDebt] wired to EasyTrack in the order asserted by `V3Template._assertEasyTrackFactoriesAdded()`
  - [ ] Each factory permission bytes = target (OperatorGrid or VaultsAdapter) + selector per `V3VoteScript`

- [ ] Legacy oracle removal
  - [ ] AccountingOracle proxy (0x852deD011285fe67063a08005c71a85690503Cee) implementation = 0xb2295820F5286BE40c2da8102eB2cDB24aD608Be
  - [ ] `REPORT_REWARDS_MINTED_ROLE` revoked from Lido (0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) and granted to Accounting (0xc9158c756D2a510eaC85792C847798a30dE20D46)
  - [ ] OLD_BURNER (0xD15a672319Cf0352560eE76d9e89eAB0889046D3) has zero `REQUEST_BURN_SHARES_ROLE` holders

- [ ] LazyOracle parameters
  - [ ] quarantinePeriod = 259200 seconds (3 days)
  - [ ] maxRewardRatioBP = 350
  - [ ] maxLidoFeeRatePerSecond = 180000000000000000 wei (0.18 ETH)

- [ ] VaultHub parameters
  - [ ] MAX_RELATIVE_SHARE_LIMIT_BP = 1000 (10%)
  - [ ] REPORT_FRESHNESS_DELTA = 172800 seconds
  - [ ] CONNECT_DEPOSIT = 1 ETH
  - [ ] GateSeal controls `PAUSE_ROLE`, ResealManager controls `RESUME_ROLE`

- [ ] PredepositGuarantee parameters
  - [ ] genesisForkVersion = 0x00000000
  - [ ] gIndex/gIndexAfterChange = 0x0000000000000000000000000000000000000000000000000096000000000028
  - [ ] firstSupportedSlot = 11649024, capellaSlot = 6209536, PIVOT_SLOT = 0

- [ ] OperatorGrid default tier parameters
  - [ ] shareLimitInEther = 0
  - [ ] reserveRatioBP = 5000
  - [ ] forcedRebalanceThresholdBP = 4975
  - [ ] infraFeeBP = 100, liquidityFeeBP = 650, reservationFeeBP = 0

- [ ] Burner migration switch
  - [ ] Pre-upgrade `IBurner(BURNER).isMigrationAllowed()` = true (per upgrade params)
  - [ ] Post-upgrade `IBurner(0xD140f4f3C515E1a328F6804C5426d9e8b883ED50).isMigrationAllowed()` = false and allowances migrated from OLD_BURNER

- [ ] Oracle versions
  - [ ] `Lido.getContractVersion()` = 3
  - [ ] `AccountingOracle.getContractVersion()` = 4
  - [ ] AccountingOracle consensus version after `finalizeUpgrade_v4` = 5

- [ ] Automation configs
  - [ ] Statemate configs = `state-mate/configs/lidov3/mainnet/lidov3-core-pre-vote.yaml` and `lidov3-et-pre-vote.yml`
  - [ ] Diffyscan configs = `diffyscan/config_samples/ethereum/mainnet/vaults/*.json`
  - [ ] Upgrade params = `core_contracts/scripts/upgrade/upgrade-params-mainnet.toml`
  - [ ] ACL + multisig docs refreshed under `docs/multisigs/*`
  - [ ] MixBytes deployment verification report attached for tokenholder review

- [ ] AI Agent friendly formatting (checkbox, one fact per line)

---

# Verify Lido V3 upgrade (mainnet)

This manual describes how to verify the [Lido V2 → V3 version line upgrade vote](https://research.lido.fi/TBD), including contract deployments, governance actions, and post-upgrade state on Ethereum mainnet. Each requirement is backed by the artifacts stored in this repository so that LDO tokenholders can reproduce the checks independently.

## 1) Scope and assumptions

> TODO: update tags and commits

- Network: Ethereum mainnet (`chain_id = 1`).
- Release target:
  - [Lido V3 core contracts, tag `v3.0.0-rc.5`](https://github.com/lidofinance/core/releases/tag/v3.0.0-rc.5) built from commit [`568ef50d5cb41de0f6bd1112155ebe69095910d7`](https://github.com/lidofinance/core/commit/568ef50d5cb41de0f6bd1112155ebe69095910d7).
  - [Lido V3 oracle offchain daemon, tag: `7.0.0-beta.4`](https://github.com/lidofinance/lido-oracle/releases/tag/7.0.0-beta.4) built from commit [`d6c09a16736b2c132343a4e349c8f27179c73e6e`](https://github.com/lidofinance/lido-oracle/commit/d6c09a16736b2c132343a4e349c8f27179c73e6e)
  - [Lido V3 Easy Track factories]() built from commit
- Voting stack:
  - `V3Template` [`TBD`](https://etherscan.io/address/TBD) encodes pre/post conditions and exposes `startUpgrade()` / `finishUpgrade()`.
  - `V3VoteScript` [`TBD`](https://etherscan.io/address/TBD) orchestrates the dual-governance vote (time constraints, Aragon ACL edits, proxy upgrades, role migrations, oracle config changes).
  - `V3TemporaryAdmin` [`TBD`](https://etherscan.io/address/TBD) handled intermediate admin tasks before transferring control to the Agent (`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`).
- Canonical reference files:
  - [`contracts/upgrade/V3Addresses`](https://github.com/lidofinance/core/tree/568ef50d5cb41de0f6bd1112155ebe69095910d7/contracts/upgrade/V3Addresses.sol) for the immutable address book referenced throughout the template and vote script.
  - [`deployed-mainnet.json`](https://github.com/lidofinance/core/tree/568ef50d5cb41de0f6bd1112155ebe69095910d7/deployed-mainnet.json) for the deployed proxies/implementations snapshot.
  - [`state-mate/configs/lidov3/mainnet/`](https://github.com/lidofinance/state-mate/tree/main/configs/lidov3/mainnet)
  - [`diffyscan/config_samples/ethereum/mainnet/vaults`](https://github.com/lidofinance/diffyscan/tree/v3-mainnet-test-deploy-episode-2/config_samples/ethereum/mainnet/vaults) for bytecode/constructor verification across all new contracts.
  - [`scripts/upgrade/upgrade-params-mainnet.toml`](https://github.com/lidofinance/core/tree/568ef50d5cb41de0f6bd1112155ebe69095910d7/scripts/upgrade/upgrade-params-mainnet.toml) for operational parameters (GateSeal metadata, LazyOracle/VaultHub limits, TimeConstraints window, etc.).

## 2) Audit & verification artifacts

> TODO: check the commit mentioned here and there

- Certora:
  - [Certora Lido V3 formal verification](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3-fv)
  - [Certora Lido V3 audit report](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3)
  - [Certora oracle audit](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3-oracle)
- Mixbytes
  - [Mixbytes Lido V3 audit report](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3)
  - [Mixbytes Lido V3 deployment verification report](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3-deployment)
  - [Mixbytes Easy Track factories audit](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3-easy-track)
- Consensys Dilligence
  - [Consensys Dilligence Lido V3 audit report](https://docs.lido.fi/security/audits/#10-2025-consensys-dilligence-lido-v3)
- Composable Security
  - [Composable Security oracle audit](https://docs.lido.fi/security/audits/#10-2025-composable-security-oracle-v7)
- Immunefi audit competition for Lido V3
  - [Link](Link)

## 3) Deployment verification references

### 3.1 MixBytes note on deployment verification

### 3.2 Diffyscan configs

- `diffyscan/config_samples/ethereum/mainnet/vaults/vaults_config.template.json` covers the Locator, Lido, Accounting, Burner, VaultHub, PredepositGuarantee, OperatorGrid, VaultFactory stack, AccountingOracle, OracleReportSanityChecker, LazyOracle, V3Template, V3VoteScript, V3TemporaryAdmin, and all dependencies.
  - The config pins the `core` repository at commit `bc6c56f567976f1df871789cdd8eb8c6dfb886b7` and lists every external dependency (Aragon apps, OpenZeppelin, solidity-bytes-utils, etc.) so bytecode comparison is reproducible.
  - Constructor arguments are explicitly encoded for each proxy/implementation pair.
- `diffyscan/config_samples/ethereum/mainnet/vaults/vaults_easy_track_config.template.json` lists the EasyTrack factory set used for stVaults management.
- Run Diffyscan with `ETHERSCAN_EXPLORER_TOKEN` to produce an artifact matching the MixBytes deployment verification report.

### 3.3 State-mate configs

- `state-mate/configs/lidov3/mainnet/lidov3-core-pre-vote.yaml` asserts:
  - Proxy admins (`proxy__getAdmin`) are equal to the Agent and proxies are not ossified before the vote.
  - ACL holders for every Aragon app, VaultHub, PredepositGuarantee, LazyOracle, WithdrawalQueue, CSAccounting, GateSeals, etc.
  - Chain constants (`CHAIN_ID`, `GENESIS_TIME`, `SLOTS_PER_EPOCH`, pause role hashes) that the oracle verifiers depend on.
- `state-mate/configs/lidov3/mainnet/lidov3-et-pre-vote.yml` covers EasyTrack:
  - Trusted caller (`0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF`), executor, objections thresholds, pause/unpause roles.
  - The full list of factories, share limits, validator exit fee limit, and VaultsAdapter wiring.

### 3.4 Upgrade parameters

- `core_contracts/scripts/upgrade/upgrade-params-mainnet.toml` contains:
  - `timeConstraintsContract = 0x2a30F5aC03187674553024296bed35Aa49749DDa` and `expiryTimestamp = 1768435200`.
  - `gateSealForVaults` metadata (14-day seal duration, sealing committee 0x8772...).
  - `easyTrack` VaultsAdapter + factory addresses (Section 4.1).
  - `vaultHub`, `lazyOracle`, `predepositGuarantee`, `operatorGrid`, and `burner` parameter sets.
  - `initialMaxExternalRatioBP = 300`, which is passed into `V3Template.finalizeUpgrade_v3`.

### 3.5 Address derivation guardrails

`V3Addresses` derives several addresses at deployment time:

- Validates the presence of the Curated (`NODE_OPERATORS_REGISTRY`), SimpleDVT, and Community Staking modules by name-hashing `StakingRouter.getStakingModules()`.
- Populates `contractsWithBurnerAllowances = [WITHDRAWAL_QUEUE, CSAccounting]` so burner allowance migrations are deterministic.
- Exposes every new V3 component (VaultHub, PredepositGuarantee, OperatorGrid, LazyOracle, VaultFactory, UpgradeableBeacon, Dashboard implementation, GateSeal, VaultsAdapter, EasyTrack factories) as immutables consumed by both the template and vote script. All verification steps should refer to these addresses.

## 4) Vote structure and encoded actions

### 4.1 Easy Track factory attachments (Lido voting items 2–10)

The vote adds nine EVMScript factories so the Vaults Adapter committee can manage stVaults. For each factory:

1. Ensure `easyTrack.getEVMScriptFactories()` ends with the factory address.
2. `easyTrack.isEVMScriptFactory(factory)` returns `true`.
3. Permission bytes equal `bytes20(target) ++ selector` (two selectors concatenated for RegisterGroups).

- **AlterTiersInOperatorGrid** (`0x25AB9D07356E8a3F95a5905f597c93CD8F31990b`)
  - Target: OperatorGrid (`0x79e2685C1DD4756AC709a6CeE7C6cC960128B031`)
  - Selector: `OperatorGrid.alterTiers`.
- **RegisterGroupsInOperatorGrid** (`0x9Ba3E4aDDe415943A831b97F9f7B8b842052b709`)
  - Target: OperatorGrid.
  - Permissions: `registerGroup` selector followed by `registerTiers`.
- **RegisterTiersInOperatorGrid** (`0x663cE8Aa1ded537Dc319529e71DE6BAb2E7D0747`)
  - Target: OperatorGrid.
  - Selector: `registerTiers`.
- **UpdateGroupsShareLimitInOperatorGrid** (`0xAEDB8D15197984D39152A2814e0BdCDAEED5462d`)
  - Target: OperatorGrid.
  - Selector: `updateGroupShareLimit`.
- **SetJailStatusInOperatorGrid** (`0x88D32aABa5B6A972D82E55D26B212eBeca07C983`)
  - Target: VaultsAdapter (`0x8cDA09f41970A8f4416b6bA4696a2f09a6080c76`).
  - Selector: `setVaultJailStatus`.
- **UpdateVaultsFeesInOperatorGrid** (`0x7DCf0746ff2F77A36ceC8E318b59dc8a8A5c066e`)
  - Target: VaultsAdapter.
  - Selector: `updateVaultFees`.
- **ForceValidatorExitsInVaultHub** (`0x6D0F542591eF4f8ebA8c77a11dc3676D9E9F7e66`)
  - Target: VaultsAdapter.
  - Selector: `forceValidatorExit`.
- **SetLiabilitySharesTargetInVaultHub** (`0xf61601787E84d89c30911e5A48d9CA630eC47044`)
  - Target: VaultsAdapter.
  - Selector: `setLiabilitySharesTarget`.
- **SocializeBadDebtInVaultHub** (`0xD60671a489948641954736A0e7272137b3A335CE`)
  - Target: VaultsAdapter.
  - Selector: `socializeBadDebt`.

The trusted caller, validator exit fee, share limits, and pause roles for these factories must match `state-mate/configs/lidov3/mainnet/lidov3-et-pre-vote.yml`.

### 4.2 Dual governance omnibus (V3VoteScript items 1–18)

| # | Action | Target (address) | Selector / calldata | Notes |
|---|--------|------------------|---------------------|-------|
| 1 | Enforce execution window 14:00–23:00 UTC | TimeConstraints `0x2a30F5aC03187674553024296bed35Aa49749DDa` | `abi.encodeCall(ITimeConstraints.checkTimeWithinDayTimeAndEmit, (50400, 82800))` | Must execute before any stateful call. |
| 2 | `startUpgrade()` via Agent | Agent `0x3e40…` → V3Template `0x2AE2…` | `0x2239c48a` | Block timestamp must be `< 1768435200`. |
| 3 | Upgrade LidoLocator implementation | Locator proxy `0xC1d0…` | `proxy__upgradeTo(0x26329a3D4cF2F89923b5c4C14a25A2485cD01aA2)` | Replaces OLD_LOCATOR_IMPL `0x2C298963FB76…`. |
| 4 | Grant `APP_MANAGER_ROLE` to Agent | ACL `0x9895…` | `grantPermission(Agent, Kernel, keccak256("APP_MANAGER_ROLE"))` | Temporarily elevates the Agent. |
| 5 | Set new Lido implementation | Kernel `0xb8FF…` | `abi.encodeCall(IKernel.setApp, (APP_BASES_NAMESPACE, LIDO_APP_ID, 0xD0b9826e0EAf6dE91CE7A6783Cd6fd137ae422Ec))` | Points the Lido proxy to the new logic. |
| 6 | Revoke `APP_MANAGER_ROLE` | ACL `0x9895…` | `revokePermission(Agent, Kernel, keccak256("APP_MANAGER_ROLE"))` | Restores ACL hygiene. |
| 7 | Revoke `REQUEST_BURN_SHARES_ROLE` from Lido | OLD_BURNER `0xD15a6723…` | `revokeRole(role, 0xae7a…)` | `role = IBurner(old).REQUEST_BURN_SHARES_ROLE()`. |
| 8 | Revoke same role from NodeOperatorsRegistry | OLD_BURNER | `revokeRole(role, 0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5)` | Removes Curated module access. |
| 9 | Revoke same role from SimpleDVT | OLD_BURNER | `revokeRole(role, 0xaE7B191A31f627b4eB1d4DaC64eaB9976995b433)` | Removes SimpleDVT access. |
|10 | Revoke same role from CSM Accounting | OLD_BURNER | `revokeRole(role, 0x4d72BFF1BeaC69925F8Bd12526a39BAAb069e5Da)` | Ensures no caller remains. |
|11 | Upgrade AccountingOracle implementation | AccountingOracle `0x852deD…` | `proxy__upgradeTo(0xb2295820F5286BE40c2da8102eB2cDB24aD608Be)` | Bytecode pinned by Diffyscan. |
|12 | Revoke `REPORT_REWARDS_MINTED_ROLE` from Lido | StakingRouter `0xFdDf3894…` | `revokeRole(role, 0xae7a…)` | `role = IStakingRouter.REPORT_REWARDS_MINTED_ROLE()`. |
|13 | Grant same role to Accounting | StakingRouter | `grantRole(role, 0xc9158c756D2a510eaC85792C847798a30dE20D46)` | Makes Accounting the sole reporter. |
|14 | Grant `CONFIG_MANAGER_ROLE` on OracleDaemonConfig | OracleDaemonConfig `0xbf05A929…` | `grantRole(role, Agent)` | Role obtained via `CONFIG_MANAGER_ROLE()`. |
|15 | Set `SLASHING_RESERVE_WE_RIGHT_SHIFT` = 0x2000 | OracleDaemonConfig | `set("SLASHING_RESERVE_WE_RIGHT_SHIFT", abi.encode(0x2000))` | |
|16 | Set `SLASHING_RESERVE_WE_LEFT_SHIFT` = 0x2000 | OracleDaemonConfig | `set("SLASHING_RESERVE_WE_LEFT_SHIFT", abi.encode(0x2000))` | |
|17 | Revoke `CONFIG_MANAGER_ROLE` | OracleDaemonConfig | `revokeRole(role, Agent)` | Leaves the contract without managers. |
|18 | `finishUpgrade()` via Agent | Agent → V3Template | `abi.encodeCall(V3Template.finishUpgrade, ())` | Must be in the same transaction as item 2. |

## 5) Rationale for parameters

### 5.1 GateSeal and pause matrix

- GateSeal (`0x9c2D30177DB12334998EB554f5d4E6dD44458167`) can pause VaultHub (`0xdcC04F506E24495E9F2599A7b214522647363669`) and PredepositGuarantee (`0x7B49b203A100E326B84886dCC0e2c426f9b8cbBd`) for 14 days, as specified in `upgrade-params-mainnet.toml`.
- The sealing committee is `0x8772E3a2D86B9347A2688f9bc1808A6d8917760C`; ResealManager (`0x7914b5a1539b97Bd0bbd155757F25FD79A522d24`) can pause/resume as a backup.
- Verify `PausableUntilWithRoles.PAUSE_ROLE` holders = [GateSeal, ResealManager] and `RESUME_ROLE` = [ResealManager].

### 5.2 LazyOracle sanity limits

- `quarantinePeriod = 259200 s`, `maxRewardRatioBP = 350`, `maxLidoFeeRatePerSecond = 0.18 ETH`.
- These values align with the constructor args captured in Diffyscan and the LIP-32 specification.

### 5.3 VaultHub limits

- `MAX_RELATIVE_SHARE_LIMIT_BP = 1000` keeps per-vault exposure at ≤10% of total stETH.
- `REPORT_FRESHNESS_DELTA = 172800 s` ensures inbound reports are fresh.
- `CONNECT_DEPOSIT = 1 ETH` enforces a minimal lock when connecting vaults.
- Pause/resume roles match the GateSeal + ResealManager split.

### 5.4 PredepositGuarantee

- Configured with `genesisForkVersion = 0x00000000`, `gIndex = gIndexAfterChange = 0x0000000000000000000000000000000000000000000000000096000000000028`, `firstSupportedSlot = 11649024`, `capellaSlot = 6209536`, `PIVOT_SLOT = 0`.
- Pause/resume roles match GateSeal + ResealManager.

### 5.5 OperatorGrid default tier

- `shareLimitInEther = 0`, `reserveRatioBP = 5000`, `forcedRebalanceThresholdBP = 4975`, `infraFeeBP = 100`, `liquidityFeeBP = 650`, `reservationFeeBP = 0`.
- These settings are referenced by both OperatorGrid and the EasyTrack factories, preventing mismatched expectations.

### 5.6 Initial max external ratio

- `INITIAL_MAX_EXTERNAL_RATIO_BP = 300` (3%) is supplied to `finalizeUpgrade_v3`. This is distinct from VaultHub’s 10% limit and governs aggregate external deposits.

### 5.7 Oracle daemon config knobs

- Items 14–17 temporarily grant the Agent `CONFIG_MANAGER_ROLE` to set `SLASHING_RESERVE_WE_RIGHT_SHIFT` and `SLASHING_RESERVE_WE_LEFT_SHIFT` to `0x2000`, then immediately revoke the role so the contract has zero managers post-upgrade.

## 6) Roles and permissions changes

### 6.1 Burner stack

- New Burner (0xD140f4f3C515E1a328F6804C5426d9e8b883ED50):
  - Proxy admin: Agent (0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c).
  - DEFAULT_ADMIN_ROLE holder: Agent.
  - `REQUEST_BURN_SHARES_ROLE` holders: Accounting (0xc9158c756D2a510eaC85792C847798a30dE20D46) and CSAccounting (0x4d72BFF1BeaC69925F8Bd12526a39BAAb069e5Da).
  - `isMigrationAllowed()` = false.
- Old Burner (0xD15a672319Cf0352560eE76d9e89eAB0889046D3):
  - `REQUEST_BURN_SHARES_ROLE` membership count = 0.
  - stETH balance = 0; cover/non-cover counters match the new burner.

### 6.2 VaultHub & PredepositGuarantee

- VaultHub (`0xdcC04F506E24495E9F2599A7b214522647363669`):
  - Proxy admin = Agent.
  - Roles: `VAULT_MASTER_ROLE` = Agent, `VALIDATOR_EXIT_ROLE` = VaultsAdapter, `BAD_DEBT_MASTER_ROLE` = VaultsAdapter, `PAUSE_ROLE` = [GateSeal, ResealManager], `RESUME_ROLE` = ResealManager.
- PredepositGuarantee (`0x7B49b203A100E326B84886dCC0e2c426f9b8cbBd`):
  - Proxy admin = Agent.
  - Roles: `DEFAULT_ADMIN_ROLE` = Agent, `PAUSE_ROLE` = [GateSeal, ResealManager], `RESUME_ROLE` = ResealManager.

### 6.3 OperatorGrid

- Proxy admin = Agent.
- Roles: `DEFAULT_ADMIN_ROLE` = Agent; `REGISTRY_ROLE` = [Agent, EVM script executor `0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977`, VaultsAdapter `0x8cDA09f41970A8f4416b6bA4696a2f09a6080c76`].

### 6.4 LazyOracle

- Proxy admin = Agent.
- `DEFAULT_ADMIN_ROLE` = Agent; `UPDATE_SANITY_PARAMS_ROLE` must have zero holders.

### 6.5 AccountingOracle & OracleReportSanityChecker

- AccountingOracle (`0x852deD...`):
  - DEFAULT_ADMIN = Agent; `getContractVersion()` = 4; `getConsensusVersion()` = 5.
- OracleReportSanityChecker (`0x4c42eF565ED49aDcC459a53C3abDCa86617E2f63`):
  - DEFAULT_ADMIN = Agent.
  - All manager roles (`ALL_LIMITS_MANAGER_ROLE`, `EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE`, `APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE`, `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE`, `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE`, `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE`, `MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE`, `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE`, `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE`, `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE`, `SECOND_OPINION_MANAGER_ROLE`, `INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE`) have zero holders.

### 6.6 Accounting & Locator-linked contracts

- Accounting (0xc9158c7...) proxy admin = Agent; `LIDO` pointer = 0xae7ab9...; `LIDO_LOCATOR` = 0xC1d0....
- Locator-managed proxies (VaultHub, PredepositGuarantee, OperatorGrid, LazyOracle, Burner, AccountingOracle, etc.) must each report the new implementation address and the Agent as admin.

### 6.7 StakingRouter

- `REPORT_REWARDS_MINTED_ROLE` has exactly one holder = Accounting. All other role membership remains as in state-mate unless explicitly changed by the vote.

## 7) Automated verification flows

### 7.1 Vote script & fork testing

- Use the scripts under `core_contracts/scripts/upgrade/` together with `upgrade-params-mainnet.toml` to replay the vote on a mainnet fork.
- `startUpgrade()` and `finishUpgrade()` must execute within the same transaction; replicate this sequencing in the fork test to exercise the template’s assertions.
- Confirm `_assertPreUpgradeState()` and `_assertPostUpgradeState()` pass; capture logs for publication.

### 7.2 Diffyscan

- Export `ETHERSCAN_EXPLORER_TOKEN` and run Diffyscan with `diffyscan/config_samples/ethereum/mainnet/vaults/vaults_config.template.json`.
- Investigate any mismatch and include the final report with the governance proposal.

### 7.3 State-mate

- Execute the state-mate CLI (see the state-mate README) against:
  - `state-mate/configs/lidov3/mainnet/lidov3-core-pre-vote.yaml`
  - `state-mate/configs/lidov3/mainnet/lidov3-et-pre-vote.yml`
- Archive the pre-vote output, then rerun a post-vote variant (once available) to prove the ACL and implementation diffs landed correctly.

### 7.4 Manual spot checks

- For parameters not covered automatically (e.g., TimeConstraints, GateSeal expiries), use `cast` or another read-only tool to fetch values and include them in the verification package (see Section 13).

## 8) Chain spec (mainnet)

- `slotsPerEpoch = 32`
- `secondsPerSlot = 12`
- `genesisTime = 1606824023`
- `depositContractAddress = 0x00000000219ab540356cBB839Cbe05303d7705Fa`

These constants feed the HashConsensus contracts, validator delay verifiers, and GateSeal timing.

## 9) Pre-upgrade snapshot (must hold before executing the vote)

- Record `Lido.getTotalShares()` and `Lido.getTotalPooledEther()` — these values must be identical after the upgrade.
- Proxy implementation checks:
  - `proxy__getImplementation()` on Locator (`0xC1d0...`) = `0x2C298963FB763f74765829722a1ebe0784f4F5Cf`.
  - `proxy__getImplementation()` on AccountingOracle (`0x852deD...`) = `0xE9906E543274cebcd335d2C560094089e9547e8d`.
  - `proxy__getImplementation()` on Lido (`0xae7a...`) = `0x17144556fd3424EDC8Fc8A4C940B2D04936d17eb`.
- Old burner allowances:
  - `stETH.allowance(WITHDRAWAL_QUEUE, OLD_BURNER)` = `uint256.max`.
  - `stETH.allowance(CSAccounting, OLD_BURNER)` = `uint256.max`.
  - `stETH.allowance(NodeOperatorsRegistry, OLD_BURNER)` = 0.
  - `stETH.allowance(SimpleDVT, OLD_BURNER)` = 0.
- `IBurner(BURNER).isMigrationAllowed()` = `true`.
- `Locator.postTokenRebaseReceiver()` should still point to the legacy TokenRateNotifier until `finishUpgrade()` finalizes the migration.

## 10) Vote execution validation

- Decode the governance transaction(s) and ensure every call matches the entries in Section 4.2 (address, selector, arguments, and ordering).
- Confirm both `grantPermission`/`revokePermission` calls reference `keccak256("APP_MANAGER_ROLE")`.
- Verify the two proxy upgrades use the implementations pinned in Diffyscan (`0x26329a...` for Locator, `0xb22958...` for AccountingOracle).
- Ensure `startUpgrade()` and `finishUpgrade()` executed in the same transaction with `block.timestamp < 1768435200`.

## 11) Post-upgrade validation and invariants

### 11.1 Lido supply invariants

- `getTotalShares()` and `getTotalPooledEther()` equal the pre-upgrade snapshot.

### 11.2 Contract versions

- `Lido.getContractVersion()` = 3.
- `AccountingOracle.getContractVersion()` = 4.
- `AccountingOracle.getConsensusVersion()` = 5 (after `finalizeUpgrade_v4`).

### 11.3 Locator implementation

- `proxy__getImplementation()` on `0xC1d0...` returns `0x26329a3D4cF2F89923b5c4C14a25A2485cD01aA2`.

### 11.4 Burner migration

- `getCoverSharesBurnt()`, `getNonCoverSharesBurnt()`, and `getSharesRequestedToBurn()` match between OLD_BURNER and BURNER.
- `stETH.balanceOf(OLD_BURNER) = 0`.
- `stETH.sharesOf(BURNER)` equals the initial old burner share balance.
- `IBurner(BURNER).isMigrationAllowed()` = `false`.
- For WITHDRAWAL_QUEUE and CSAccounting:
  - `allowance(contract, OLD_BURNER) = 0`.
  - `allowance(contract, BURNER) = uint256.max`.

### 11.5 Proxy admins

- `proxy__getAdmin()` for BURNER, VAULT_HUB, OPERATOR_GRID, LAZY_ORACLE, ACCOUNTING, PREDEPOSIT_GUARANTEE all return the Agent address.

### 11.6 ACL expectations

- Use Section 6 as the canonical role list and verify each role via `getRoleMemberCount`.
- GateSeal + ResealManager should control every `PAUSE_ROLE` / `RESUME_ROLE` pair documented in the state-mate configs.

### 11.7 stVaults factory stack

- `VaultFactory.BEACON()` = `0x5D8508D1eA725d35a61886658FB4BD7795027f6C`.
- `VaultFactory.DASHBOARD_IMPL()` = `0x08e197D82BC33Ddb7f3081f9aC31F3647cFabD46`.
- `UpgradeableBeacon.owner()` = Agent; `UpgradeableBeacon.implementation()` = `0xDAEf26cE8ba47d297e22A4318c1ACC5dB12dD3d6`.

## 12) Oracles frame sanity

- AccountingOracle HashConsensus (`0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288`):
  - `getChainConfig()` = `(32, 12, 1606824023)`.
  - `getFrameConfig()` = `(201600, 225, 100)`.
  - `getQuorum()` = 5; `getReportProcessor()` = `0x852deD...`.
- ValidatorsExitBusOracle HashConsensus (`0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a`):
  - `getFrameConfig()` = `(201600, 75, 100)`.
  - `getReportProcessor()` = `0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e`.
- ValidatorsExitBusOracle pause roles: ResealManager + GateSeal (`0xA6BC802fAa064414AA62117B4a53D27fFfF741F1`).
- `OracleDaemonConfig` must expose the new `SLASHING_RESERVE_WE_*` keys set to `0x2000`.

## 13) How to verify (examples)

Example `cast` calls (replace addresses as needed):

```bash
# Versions

cast call 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 "getContractVersion()(uint256)"
cast call 0x852deD011285fe67063a08005c71a85690503Cee "getContractVersion()(uint256)"
cast call 0x852deD011285fe67063a08005c71a85690503Cee "getConsensusVersion()(uint256)"

# Locator implementation / admin

cast call 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb "proxy__getImplementation()(address)"
cast call 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb "proxy__getAdmin()(address)"

# GateSeal + pause roles

cast call 0x9c2D30177DB12334998EB554f5d4E6dD44458167 "get_sealing_committee()(address)"
cast call 0x9c2D30177DB12334998EB554f5d4E6dD44458167 "get_sealables()(address[])"
PAUSE_ROLE=$(cast call 0xdcC04F506E24495E9F2599A7b214522647363669 "PAUSE_ROLE()(bytes32)")
cast call 0xdcC04F506E24495E9F2599A7b214522647363669 "getRoleMember(bytes32,uint256)(address)" $PAUSE_ROLE 0

# Burner migration

cast call 0xD15a672319Cf0352560eE76d9e89eAB0889046D3 "getCoverSharesBurnt()(uint256)"
cast call 0xD140f4f3C515E1a328F6804C5426d9e8b883ED50 "getCoverSharesBurnt()(uint256)"
cast call 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 "allowance(address,address)(uint256)" 0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1 0xD140f4f3C515E1a328F6804C5426d9e8b883ED50

# HashConsensus frame data

cast call 0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288 "getFrameConfig()(uint64,uint64,uint64)"
cast call 0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288 "getReportProcessor()(address)"

# EasyTrack factories

cast call 0xF0211b7660680B49De1A7E9f25C65660F0a13Fea "getEVMScriptFactories()(address[])"
cast call 0xF0211b7660680B49De1A7E9f25C65660F0a13Fea "isEVMScriptFactory(address)(bool)" 0x25AB9D07356E8a3F95a5905f597c93CD8F31990b

# Proxy admin spot checks

cast call 0xD140f4f3C515E1a328F6804C5426d9e8b883ED50 "proxy__getAdmin()(address)"
cast call 0x7B49b203A100E326B84886dCC0e2c426f9b8cbBd "proxy__getAdmin()(address)"
```

Capture the outputs (block number, result, RPC endpoint) and attach them to the governance discussion alongside the Diffyscan and state-mate reports.
