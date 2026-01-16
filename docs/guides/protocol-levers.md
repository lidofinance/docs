# Protocol levers

Lido V3 governance controls a set of configurable parameters across core pool, oracle, withdrawals, and stVaults. This page summarizes the primary on-chain levers and who can operate them.

## Upgradeability

Upgradeable components are managed by the DAO via Aragon or proxy admins. Core upgradeable contracts include:

- [Lido](/contracts/lido)
- [LidoLocator](/contracts/lido-locator)
- [AccountingOracle](/contracts/accounting-oracle)
- [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [WithdrawalVault](/contracts/withdrawal-vault)
- [VaultHub](/contracts/vault-hub)
- [LazyOracle](/contracts/lazy-oracle)

## Lido (core pool)

Key levers on the core pool contract:

- **Pause/Resume protocol**
  - Mutators: `stop()`, `resume()`
  - Roles: `PAUSE_ROLE`, `RESUME_ROLE`
- **Staking limits**
  - Mutators: `setStakingLimit()`, `removeStakingLimit()`
  - Role: `STAKING_CONTROL_ROLE`
- **External shares cap (stVaults)**
  - Mutator: `setMaxExternalRatioBP()`
  - Role: `STAKING_CONTROL_ROLE`
- **Withdrawal credentials**
  - Mutator: `setWithdrawalCredentials()`
  - Role: `MANAGE_WITHDRAWAL_KEY_ROLE`

## Accounting and oracles

- **AccountingOracle consensus settings**
  - Mutators: `setConsensusVersion()`, `setConsensusContract()`
  - Roles: `MANAGE_CONSENSUS_VERSION_ROLE`, `MANAGE_CONSENSUS_CONTRACT_ROLE`
- **Oracle report sanity bounds**
  - Mutators: `setMaxAnnualIncreaseBps()`, `setMaxDecreaseBps()` (see OracleReportSanityChecker)
  - Role: `DEFAULT_ADMIN_ROLE`
- **LazyOracle sanity parameters**
  - Mutators: `updateSanityParams()`
  - Role: `UPDATE_SANITY_PARAMS_ROLE`

## StakingRouter and modules

- **Module registry and weights**
  - Mutators: `addStakingModule()`, `updateStakingModule()`, `setStakingModuleStatus()`
  - Role: `STAKING_MODULE_MANAGE_ROLE`
- **Fees**
  - Mutators: `setStakingModuleFees()`
  - Role: `STAKING_MODULE_MANAGE_ROLE`

## Withdrawals

- **Queue parameters and modes**
  - Mutators: `setBunkerMode()`, `setFinalizationBatchesLimit()` and related settings
  - Roles: `BUNKER_MODE_ROLE`, `FINALIZE_ROLE` (see WithdrawalQueueERC721)

## stVaults (VaultHub + OperatorGrid)

- **Vault connection parameters**
  - Mutator: `updateConnection()`
  - Role: `VAULT_MASTER_ROLE`
- **Bad debt handling**
  - Mutators: `socializeBadDebt()`, `internalizeBadDebt()`
  - Role: `BAD_DEBT_MASTER_ROLE`
- **Forced exits**
  - Mutator: `forceValidatorExit()`
  - Role: `VALIDATOR_EXIT_ROLE`
- **Tier and fee registry**
  - Mutators: `registerGroup()`, `registerTiers()`, `updateVaultFees()`
  - Role: `REGISTRY_ROLE`

## References

For detailed interfaces and roles, see the contract docs:

- [AccountingOracle](/contracts/accounting-oracle)
- [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [VaultHub](/contracts/vault-hub)
- [OperatorGrid](/contracts/operator-grid)
