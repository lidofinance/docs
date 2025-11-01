---

TODO:

- [ ] GateSeal for VaultHub & PDG (pause window/roles)
  - [ ] GateSeal address: 0x2291496c76CC2e9368DbE9d4977ED2623cbDfb32
  - [ ] sealDuration: 1209600 seconds (14 days) from `gateSealForVaults.sealDuration`
  - [ ] sealingCommittee: 0x8772E3a2D86B9347A2688f9bc1808A6d8917760C
  - [ ] VAULT_HUB.PAUSE_ROLE holder = GateSeal
  - [ ] PREDEPOSIT_GUARANTEE.PAUSE_ROLE holder = GateSeal
  - [ ] Compute seal end: activation_tx.timestamp + 1209600

- [ ] EasyTrack (stVaults)
  - [ ] trustedCaller: TBD (from `easyTrack.trustedCaller`)
  - [ ] initialValidatorExitFeeLimit: 100000000000000000 wei (0.1 ETH)
  - [ ] maxGroupShareLimit: 50000000000000000000000
  - [ ] maxDefaultTierShareLimit: 0
  - [ ] New factories deployed and wired; trusted caller set

- [ ] Legacy oracle removal
  - [ ] AccountingOracle proxy implementation = 0x6D799F4C92e8eE9CC0E33367Dd47990ed49a21AC
  - [ ] Lido `REPORT_REWARDS_MINTED_ROLE` revoked
  - [ ] StakingRouter `REPORT_REWARDS_MINTED_ROLE` granted to Accounting
  - [ ] No remaining roles/refs to Legacy Oracle

- [ ] LazyOracle parameters
  - [ ] quarantinePeriod: 259200 seconds (3 days)
  - [ ] maxRewardRatioBP: 350
  - [ ] maxLidoFeeRatePerSecond: 180000000000000000 wei (0.18 ETH)

- [ ] VaultHub parameters
  - [ ] relativeShareLimitBP: 300 (3%)

- [ ] PredepositGuarantee parameters
  - [ ] genesisForkVersion: 0x00000000
  - [ ] gIndex: 0x0000000000000000000000000000000000000000000000000096000000000028
  - [ ] gIndexAfterChange: 0x0000000000000000000000000000000000000000000000000096000000000028
  - [ ] firstSupportedSlot: 11649024
  - [ ] changeSlot: 11649024
  - [ ] capellaSlot: 6209536

- [ ] OperatorGrid default tier parameters
  - [ ] shareLimitInEther: 0
  - [ ] reserveRatioBP: 5000
  - [ ] forcedRebalanceThresholdBP: 4950
  - [ ] infraFeeBP: 100
  - [ ] liquidityFeeBP: 650
  - [ ] reservationFeeBP: 0

- [ ] Burner migration switch
  - [ ] isMigrationAllowed (pre-upgrade) = true
  - [ ] Post-upgrade `IBurner(BURNER).isMigrationAllowed()` = false

- [ ] Oracle versions
  - [ ] AccountingOracle consensus version after `finalizeUpgrade_v4` = 5

- [ ] Statemate checks: link to config and run instructions (TBD)
- [ ] Diffyscan checks: link to config and run instructions (TBD)
- [ ] Scripts checks on fork: link to vote items in scripts repo (TBD)
- [ ] ACL diagrams pre/post vote (TBD)
- [ ] Multisigs: enumerate Lido V3 multisigs (`docs/multisigs/*`) (TBD)
- [ ] Audit reports: list reports and summaries (TBD)
- [ ] Deployment verification: attach report (MixBytes) (TBD)
- [ ] AI Agent friendly: keep checkbox, one-fact-per-line style

---

# Verify Lido V3 upgrade (mainnet)

This manual describes how to verify the Lido V3 upgrade on Ethereum mainnet. It follows the structure and rigor of the V2 verification guide and adapts it to the V3 architecture (stVaults, Accounting/Oracle split, GateSeal roles, etc.).

Use it as a step-by-step checklist around the enacted governance vote and as a post-upgrade audit of on-chain state and ACLs.

## 1) Scope and assumptions

- Network: mainnet (chain_id = 1)
- Target upgrade: Lido V3
- We use the deployed V3 Template and Vote Script to derive exact actions and invariants.
- Where an address is unknown, read it from the deployed `V3Template` contract on mainnet.

References used for this manual:

- Deployed contracts (mainnet): see `https://github.com/lidofinance/core/blob/v3.0.0-rc.2/deployed-mainnet.json` and `docs/deployed-contracts/index.md`
- Upgrade logic and invariants: `https://github.com/lidofinance/core/blob/v3.0.0-rc.2/contracts/upgrade/V3Template.sol`
- On-chain vote actions: `https://github.com/lidofinance/core/blob/v3.0.0-rc.2/contracts/upgrade/V3VoteScript.sol`
- Design context: [Lido V3 forum post (design & implementation proposal)](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665)

## 2) Prerequisites

- Block explorer access for mainnet
- Ability to make read-only calls (cast/etherscan RPC) to contracts
- The following deployed artifacts on mainnet:
  - V3 Template: `v3Template.address` from [`deployed-mainnet.json`](https://github.com/lidofinance/core/blob/v3.0.0-rc.2/deployed-mainnet.json)
  - V3 Vote Script: `v3VoteScript.address` from [`deployed-mainnet.json`](https://github.com/lidofinance/core/blob/v3.0.0-rc.2/deployed-mainnet.json)

Tip: The `V3Template` exposes most addresses via public getters; prefer reading them from the live template to avoid drift.

## 3) Core addresses (mainnet)

Cross-check these against `https://github.com/lidofinance/core/blob/v3.0.0-rc.2/deployed-mainnet.json` and `docs/deployed-contracts/index.md`.

Established addresses:

- AGENT: `0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`
- KERNEL (DAO): `0xb8FFC3Cd6e7Cf5a098A1c92F48009765B24088Dc`
- ACL (Aragon): `0x9895f0f17cc1d1891b6f18ee0b483b6f221b37bb`
- Lido (proxy): `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`
- wstETH: `0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0`
- Lido Locator (proxy): `0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb`
- AccountingOracle (proxy): `0x852deD011285fe67063a08005c71a85690503Cee`
- OracleDaemonConfig: `0xbf05A929c3D7885a6aeAd833a992dA6E5ac23b09`

Newly introduced addresses

- Lido Locator (impl): `TBD`
- Accounting (proxy): `TBD`
- Accounting (impl): `TBD`

- AccountingOracle (impl): `0x6D799F4C92e8eE9CC0E33367Dd47990ed49a21AC`
- OracleReportSanityChecker: `0x53417BA942bC86492bAF46FAbA8769f246422388`
- LazyOracle (proxy): `0xf41491C79C30e8f4862d3F4A5b790171adB8e04A`
- OperatorGrid (proxy): `0x501e678182bB5dF3f733281521D3f3D1aDe69917`
- VaultHub (proxy): `0x4C9fFC325392090F789255b9948Ab1659b797964`
- PredepositGuarantee (proxy): `0xa5F55f3402beA2B14AE15Dae1b6811457D43581d`
- VaultsAdapter: `0xBC2bb8310730F3D2b514Cb26f7e0A8776De879Ac`
- EasyTrack EVMScriptExecutor: `0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E`
- GateSeal (Vaulthub & PDG): `0x2291496c76CC2e9368DbE9d4977ED2623cbDfb32`
- UPGRADEABLE BEACON (StakingVault): `0xb3e6a8B6A752d3bb905A1B3Ef12bbdeE77E8160e`
- StakingVault Implementation: `0xdc79D1751D1435fEc9204c03ca3D64ceEB73A7df`
- Dashboard Implementation: `0x7b2B6EA1e53B2039a493cA587805183883Cb8B88`
- StakingVault Factory: `0x67Fc99587B4Cd6FA16E26FF4782711f79055d7ad`
- TriggerableWithdrawalsGateway: `0x6679090D92b08a2a686eF8614feECD8cDFE209db`

Deployment verification report ⇒ [MixBytes deployment verification](TBD)

Note: The old/new Burner addresses are available via the deployed `V3Template` getters (`OLD_BURNER()`, `BURNER()`). Use those for checks below.

## 4) Chain spec (mainnet)

From `deployed-mainnet.json` → `chainSpec`:

- slotsPerEpoch: 32
- secondsPerSlot: 12
- genesisTime: `1742213400`
- depositContractAddress: `0x00000000219ab540356cBB839Cbe05303d7705Fa`

These parameters affect oracle frame calculations and timing expectations.

## 5) Pre-upgrade snapshot (must hold across the upgrade)

Before the upgrade vote executes, record the following from on-chain state:

- Lido invariants:
  - `getTotalShares()`
  - `getTotalPooledEther()`
- Old Burner snapshot:
  - `sharesOf(OLD_BURNER)`
  - stETH `allowance(WITHDRAWAL_QUEUE, OLD_BURNER)` == max uint
  - stETH `allowance(CSAccounting, OLD_BURNER)` == max uint
  - stETH `allowance(NodeOperatorsRegistry, OLD_BURNER)` == 0
  - stETH `allowance(SimpleDVT, OLD_BURNER)` == 0
- Proxy implementations (pre):
  - Locator proxy implementation equals OLD locator impl
  - AccountingOracle proxy implementation equals OLD oracle impl
  - Lido Aragon App Repo `getLatest()` impl equals OLD Lido impl

Tip: All preconditions above are asserted by `V3Template._assertPreUpgradeState()`.

## 6) Vote execution items (on-chain actions)

Validate the governance vote executed the following, in order, as encoded by `V3VoteScript`:

1. Call `V3Template.startUpgrade()` via AGENT
2. Upgrade Lido Locator implementation (proxy upgrade)
3. Grant `APP_MANAGER_ROLE` to AGENT on Kernel ACL
4. Kernel `setApp(APP_BASES_NAMESPACE, lidoAppId, NEW_LIDO_IMPL)`
5. Revoke `APP_MANAGER_ROLE` from AGENT on Kernel ACL
6. Revoke `REQUEST_BURN_SHARES_ROLE` from Lido on OLD_BURNER
7. Revoke `REQUEST_BURN_SHARES_ROLE` from Curated module (NodeOperatorsRegistry) on OLD_BURNER
8. Revoke `REQUEST_BURN_SHARES_ROLE` from SimpleDVT on OLD_BURNER
9. Revoke `REQUEST_BURN_SHARES_ROLE` from CSAccounting on OLD_BURNER
10. Upgrade AccountingOracle implementation (proxy upgrade)
11. Revoke `REPORT_REWARDS_MINTED_ROLE` from Lido on StakingRouter
12. Grant `REPORT_REWARDS_MINTED_ROLE` to Accounting on StakingRouter
13. Call `V3Template.finishUpgrade()` via AGENT

For each item, verify the corresponding transaction exists and succeeded, with correct calldata and target.

## 7) Post-upgrade validation and invariants

All checks below reflect `V3Template._assertPostUpgradeState()` and `_assertFinalACL()` expectations.

### 7.1 Lido supply invariants

- `getTotalShares()` unchanged vs pre-snapshot
- `getTotalPooledEther()` unchanged vs pre-snapshot

### 7.2 Contract versions

- Lido `getContractVersion()` == 3
- AccountingOracle `getContractVersion()` == 4
- AccountingOracle consensus version after `finalizeUpgrade_v4` == 5

### 7.3 Locator upgrade

- Locator proxy implementation equals the NEW Locator implementation

### 7.4 Burner migration

- `getCoverSharesBurnt()` matches between OLD_BURNER and BURNER
- `getNonCoverSharesBurnt()` matches between OLD_BURNER and BURNER
- `getSharesRequestedToBurn()` (cover and non-cover) match between OLD_BURNER and BURNER
- `balanceOf(OLD_BURNER)` == 0 (stETH)
- `sharesOf(BURNER)` equals pre-snapshot `sharesOf(OLD_BURNER)`
- `IBurner(BURNER).isMigrationAllowed()` == false
- stETH allowances:
  - For each of: `WITHDRAWAL_QUEUE`, `CSAccounting`
    - `allowance(<contract>, OLD_BURNER)` == 0
    - `allowance(<contract>, BURNER)` == max uint

### 7.5 Proxy admins

- Proxy admin of: `BURNER`, `VAULT_HUB`, `OPERATOR_GRID`, `LAZY_ORACLE`, `ACCOUNTING`, `PREDEPOSIT_GUARANTEE` is `AGENT`

### 7.6 ACL expectations (OZ roles)

- BURNER
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - `REQUEST_BURN_SHARES_ROLE`: holders = `ACCOUNTING`, `CSAccounting`
- OLD_BURNER
  - 0 holders of `REQUEST_BURN_SHARES_ROLE`
- VAULT_HUB
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - `VAULT_MASTER_ROLE`: single holder = `AGENT`
  - `REDEMPTION_MASTER_ROLE`: holders = `AGENT`, `VAULTS_ADAPTER`
  - `VALIDATOR_EXIT_ROLE`: single holder = `VAULTS_ADAPTER`
  - `BAD_DEBT_MASTER_ROLE`: single holder = `VAULTS_ADAPTER`
  - `PAUSE_ROLE` (from `PausableUntilWithRoles`): single holder = `GATE_SEAL` (Vaulthub & PDG GateSeal)
- OPERATOR_GRID
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - `REGISTRY_ROLE`: holders = `AGENT`, `EVM_SCRIPT_EXECUTOR`, `VAULTS_ADAPTER`
- LAZY_ORACLE
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - `UPDATE_SANITY_PARAMS_ROLE`: single holder = `AGENT`
- ACCOUNTING_ORACLE
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
- ORACLE_REPORT_SANITY_CHECKER
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - All manager roles are empty (0 holders):
    - ALL_LIMITS_MANAGER_ROLE
    - EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE
    - APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE
    - ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE
    - SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE
    - MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE
    - MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE
    - MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE
    - REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE
    - MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE
    - SECOND_OPINION_MANAGER_ROLE
    - INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE
- PREDEPOSIT_GUARANTEE
  - `DEFAULT_ADMIN_ROLE`: single holder = `AGENT`
  - `PAUSE_ROLE`: single holder = `GATE_SEAL` (Vaulthub & PDG GateSeal)
- STAKING_ROUTER
  - `REPORT_REWARDS_MINTED_ROLE`: single holder = `ACCOUNTING` (and revoked from `LIDO`)

### 7.7 stVaults factory stack

Validate factory/beacon wiring and ownership:

- `VaultFactory.BEACON()` == `UPGRADEABLE_BEACON`
- `VaultFactory.DASHBOARD_IMPL()` == `Dashboard Implementation`
- `UpgradeableBeacon.owner()` == `AGENT`
- `UpgradeableBeacon.implementation()` == `StakingVault Implementation`

## 8) Oracles frame sanity (Hoodi)

Cross-check against `deployed-hoodi.json`:

- AccountingOracle HashConsensus: epochsPerFrame = 12, fastLaneLengthSlots = 10, genesisTime = `1742213400`
- ValidatorsExitBusOracle HashConsensus: epochsPerFrame = 4, fastLaneLengthSlots = 10, genesisTime = `1742213400`

Confirm the corresponding Oracle constructor args and HashConsensus deployments match these.

## 9) How to verify (examples)

Use any read-only tool; examples below use cast-like semantics. Replace placeholders with actual addresses.

```bash
# Versions
cast call <LIDO_PROXY> "getContractVersion()(uint256)"
cast call <ACCOUNTING_ORACLE_PROXY> "getContractVersion()(uint256)"

# Locator implementation
cast call <LOCATOR_PROXY> "proxy__getImplementation()(address)"

# Burner migration
cast call <OLD_BURNER> "getCoverSharesBurnt()(uint256)"
cast call <BURNER> "getCoverSharesBurnt()(uint256)"
cast call <OLD_BURNER> "getSharesRequestedToBurn()(uint256,uint256)"
cast call <BURNER> "getSharesRequestedToBurn()(uint256,uint256)"
cast call <LIDO_PROXY> "balanceOf(address)(uint256)" <OLD_BURNER>
cast call <LIDO_PROXY> "sharesOf(address)(uint256)" <BURNER>

# stETH allowances
cast call <LIDO_PROXY> "allowance(address,address)(uint256)" <WITHDRAWAL_QUEUE> <OLD_BURNER>
cast call <LIDO_PROXY> "allowance(address,address)(uint256)" <WITHDRAWAL_QUEUE> <BURNER>

# Proxy admins
cast call <BURNER_PROXY> "proxy__getAdmin()(address)"
cast call <VAULT_HUB_PROXY> "proxy__getAdmin()(address)"

# Roles
cast call <BURNER> "getRoleMemberCount(bytes32)(uint256)" <REQUEST_BURN_SHARES_ROLE>
cast call <STAKING_ROUTER> "getRoleMember(bytes32,uint256)(address)" <REPORT_REWARDS_MINTED_ROLE> 0

# Factory / Beacon
cast call <VAULT_FACTORY> "BEACON()(address)"
cast call <VAULT_FACTORY> "DASHBOARD_IMPL()(address)"
cast call <UPGRADEABLE_BEACON> "owner()(address)"
cast call <UPGRADEABLE_BEACON> "implementation()(address)"
```

## 10) Troubleshooting notes

- If any invariant fails, re-run the pre-snapshot reads and compare carefully; mismatches usually indicate a missed vote item or mis-ordered execution.
- For Hoodi-only vote item 14 (Sandbox role on OLD_BURNER), validate the expected end-state against the enacted transaction: both “retained by Sandbox” or “fully revoked” patterns have been used on test deployments; the canonical check is the executed vote calldata.

## 11) References

- Deployed contracts and parameters: `docs/deployed-hoodi.json`, `docs/deployed-contracts/hoodi.md`
- Upgrade invariants: `docs/V3Template.sol`
- Governance actions: `docs/V3VoteScript.sol`
- Lido V3 design and implementation proposal (forum)
