# OracleReportSanityChecker

- [Source code](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol)
- [Deployed contract](https://etherscan.io/address/0xf1647c86E6D7959f638DD9CE1d90e2F3C9503129)

Some vital data for the Lido protocol is collected off-chain and delivered on-chain via Oracle contracts:
[`AccountingOracle`](/contracts/accounting-oracle), [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle).
Due to the high impact of data provided by the Oracles on the state of the protocol, each Oracle's
report passes a set of onchain
[sanity checks](https://en.wikipedia.org/wiki/Sanity_check).
For the simplicity of the contracts responsible for handling Oracle's reports, all sanity checks were collected in the
standalone `OracleReportSanityChecker` contract.

Besides the validation methods, the `OracleReportSanityChecker` contract contains a [set of tunable limits and restrictions](#limits-list)
used during the report validation process.
To configure the limits values contract provides the lever methods described in the [standalone section](#lever-methods).
Access to lever methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
contract and a bunch of [granular roles](#permissions).

## Limits List

`OracleReportSanityChecker` uses the `LimitsList` type which contains all the limits used by the contract.

```solidity
struct LimitsList {
    uint256 exitedEthAmountPerDayLimit;
    uint256 appearedEthAmountPerDayLimit;
    uint256 annualBalanceIncreaseBPLimit;
    uint256 simulatedShareRateDeviationBPLimit;
    uint256 maxBalanceExitRequestedPerReportInEth;
    uint256 maxEffectiveBalanceWeightWCType01;
    uint256 maxEffectiveBalanceWeightWCType02;
    uint256 maxItemsPerExtraDataTransaction;
    uint256 maxNodeOperatorsPerExtraDataItem;
    uint256 requestTimestampMargin;
    uint256 maxPositiveTokenRebase;
    uint256 maxCLBalanceDecreaseBP;
    uint256 clBalanceOraclesErrorUpperBPLimit;
    uint256 consolidationEthAmountPerDayLimit;
    uint256 exitedValidatorEthAmountLimit;
    uint256 externalPendingBalanceCapEth;
}
```

- **`exitedEthAmountPerDayLimit` ∈ [0, type(uint32).max]** — the max possible _**exited**_ ETH amount that might be reported
  per single day, denominated in whole ETH. Used together with `consolidationEthAmountPerDayLimit` in the
  [`checkExitedValidatorsCount()`](#checkexitedvalidatorscount) check.
- **`appearedEthAmountPerDayLimit` ∈ [0, type(uint32).max]** — the max possible _**appeared**_ (activated) ETH amount that
  might be reported per single day, denominated in whole ETH. Covers the Consensus Layer activation churn of up to 256 ETH
  per epoch (225 epochs × 256 ETH = 57,600 ETH per day).
- **`annualBalanceIncreaseBPLimit` ∈ [0, 10000]** — the max annual increase of the total validators' balances on the Consensus Layer
  since the previous oracle report. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`simulatedShareRateDeviationBPLimit` ∈ [0, 10000]** — the max deviation of the provided `simulatedShareRate` and the actual one within the
  currently processing oracle report. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`maxBalanceExitRequestedPerReportInEth` ∈ [0, 65535]** — the max total balance requested to exit per single report
  to [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md), denominated in whole ETH. The sum of the max effective
  balances of all validators requested to exit in one report must be equal or lower than this value.
- **`maxEffectiveBalanceWeightWCType01` ∈ [1, 65535]** — the max effective balance equivalent weight in ETH for a validator
  with the `0x01` type withdrawal credentials (32 ETH). Used to calculate the total balance requested to exit.
- **`maxEffectiveBalanceWeightWCType02` ∈ [1, 65535]** — the max effective balance equivalent weight in ETH for a validator
  with the `0x02` type withdrawal credentials (2048 ETH, [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) MaxEB).
  Used to calculate the total balance requested to exit.
- **`maxItemsPerExtraDataTransaction` ∈ [0, 65535]** — the max number of data list items reported to accounting oracle in extra data per single transaction.
- **`maxNodeOperatorsPerExtraDataItem` ∈ [0, 65535]** — the max number of node operators reported per extra data list item
- **`requestTimestampMargin` ∈ [0, type(uint32).max]** — the min time required to be passed from the creation of the request to be finalized till the time of the oracle report
- **`maxPositiveTokenRebase` ∈ [1, type(uint64).max]** — the max positive token rebase allowed per single oracle report token rebase
  happens on total supply adjustment, huge positive rebase can incur oracle report sandwiching.
  Uses 1e9 precision, e.g.: `1e6` — 0.1%; `1e9` — 100%; `type(uint64).max` — unlimited rebase.
- **`maxCLBalanceDecreaseBP` ∈ [0, 10000]** — the max allowed Consensus Layer balance decrease over the 36-day sliding window
  (`CL_BALANCE_WINDOW`) as a fraction of the expected balance restored from historical report snapshots.
  Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`clBalanceOraclesErrorUpperBPLimit` ∈ [0, 10000]** - the maximum percent on how Second Opinion Oracle reported value could be greater than reported by the AccountingOracle. There is an assumption that second opinion oracle CL balance can be greater as calculated for the withdrawal credentials. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`consolidationEthAmountPerDayLimit` ∈ [0, type(uint32).max]** — the max possible _**consolidated**_ ETH amount
  that might be reported per single day, denominated in whole ETH. Extends the per-module validators balance increase
  budget and the exited ETH amount per day limit to account for validator consolidations.
- **`exitedValidatorEthAmountLimit` ∈ [1, 65535]** — the effective ETH amount attributed to a single exited validator
  in the exited ETH amount per day check, denominated in whole ETH.
- **`externalPendingBalanceCapEth` ∈ [0, 65535]** — the extra protocol-level pending balance cap to tolerate bounded
  side deposits or same-validator top-ups that were not funded by Lido, denominated in whole ETH.

Internally, the limits are persisted in two packed structs, each occupying a single storage slot:

```solidity
struct AccountingCoreLimitsPacked {
    uint32 exitedEthAmountPerDayLimit;
    uint32 appearedEthAmountPerDayLimit;
    uint32 consolidationEthAmountPerDayLimit;
    uint16 annualBalanceIncreaseBPLimit;
    uint16 simulatedShareRateDeviationBPLimit;
    uint64 maxPositiveTokenRebase;
    uint16 maxCLBalanceDecreaseBP;
    uint16 clBalanceOraclesErrorUpperBPLimit;
    uint16 exitedValidatorEthAmountLimit;
    uint16 externalPendingBalanceCapEth;
}

struct OperationalLimitsPacked {
    uint16 maxBalanceExitRequestedPerReportInEth;
    uint16 maxEffectiveBalanceWeightWCType01;
    uint16 maxEffectiveBalanceWeightWCType02;
    uint16 maxItemsPerExtraDataTransaction;
    uint16 maxNodeOperatorsPerExtraDataItem;
    uint32 requestTimestampMargin;
}
```

The [`getOracleReportLimits()`](#getoraclereportlimits) view method returns the limits unpacked into the `LimitsList` type.

There is also parameter for Second Opinion Oracle which is not a part of the `LimitsList` structure. However
it's modification requires the same type of roles as for the Limits. It could be changed with a general
`setOracleReportLimits()` function or specific `setSecondOpinionOracleAndCLBalanceUpperMargin()`.

For the details about meaning of the parameters `clBalanceOraclesErrorUpperBPLimit` and `Second Opinion Oracle`
please refer to [LIP-23](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-23.md).

## Sanity Checks

### checkAccountingOracleReport()

Applies sanity checks to the accounting parameters of Lido's Oracle report.
Called by the [`Accounting`](/contracts/accounting) contract during oracle report processing;
reverts with `CalledNotFromAccounting()` error when called by any other address.

The method has side effects: on each successful accounting report it stores a report snapshot
(timestamp, CL balance, deposits, CL withdrawals) used by the CL balance decrease check over a sliding window,
and records the withdrawal vault balance remaining after the report's transfer.

The CL balance decrease check operates over a sliding window of up to 36 days (`CL_BALANCE_WINDOW`).
It restores the expected CL balance from the earliest stored snapshot within the window
(baseline CL balance plus deposits minus actual CL withdrawals accumulated after the baseline)
and compares it with the post-report CL balance (CL validators balance plus CL pending balance).
The decrease is limited by `LimitsList.maxCLBalanceDecreaseBP` of the restored balance.
When the decrease exceeds the limit and a Second Opinion Oracle is configured, the report is accepted
only if the Second Opinion Oracle confirms the CL validators balance (within
`LimitsList.clBalanceOraclesErrorUpperBPLimit`) and the exact withdrawal vault balance.

:::note
Below is the list of restrictions checked by the method execution:

- Revert with `IncorrectWithdrawalsVaultBalance(uint256 actualWithdrawalVaultBalance)` error when the reported withdrawals
  vault balance **is greater than** the actual balance of the withdrawal vault.
- Revert with `IncorrectELRewardsVaultBalance(uint256 actualELRewardsVaultBalance)` error when reported EL rewards vault
  balance **is greater than** the actual balance of EL rewards vault.
- Revert with `IncorrectSharesRequestedToBurn(uint256 actualSharesToBurn)` error when the amount of stETH shares requested
  to burn **exceeds** the number of shares marked to be burned in the Burner contract.
- Revert with `IncorrectCLWithdrawalsVaultBalance(uint256 withdrawalVaultBalance, uint256 lastWithdrawalVaultBalanceAfterTransfer)`
  error when the reported withdrawal vault balance **is lower than** the vault balance stored after the previous report's transfer.
- Revert with `IncorrectWithdrawalsVaultTransfer(uint256 withdrawalVaultBalance, uint256 withdrawalsVaultTransfer)` error
  when the reported withdrawal vault transfer **exceeds** the reported withdrawal vault balance.
- Revert with `IncorrectTotalPendingBalance(uint256 maxAllowed, uint256 actual)` error when the reported post-report
  CL pending balance **exceeds** the Lido-funded pending balance (pre-report CL pending balance plus deposits)
  plus `LimitsList.externalPendingBalanceCapEth`.
- Revert with `IncorrectTotalActivatedBalance(uint256 maxAllowed, uint256 actual)` error when the balance activated from
  the pending deposits queue **exceeds** the allowance derived from `LimitsList.appearedEthAmountPerDayLimit` prorated by
  the elapsed time, plus a single max validator effective balance (2048 ETH) as a report-window boundary allowance.
- Revert with `IncorrectTotalCLBalanceIncrease(uint256 maxAllowed, uint256 actual)` error when the increase of the
  CL validators balance (net of the CL withdrawals observed since the previous report) **exceeds** the activated balance
  plus the APR safety cap derived from `LimitsList.annualBalanceIncreaseBPLimit`.
- Revert with `IncorrectCLBalanceDecrease(uint256 negativeCLRebaseSum, uint256 maxNegativeCLRebaseSum)` error when the
  Consensus Layer balance decrease over the sliding window **exceeds** the allowed maximum and no Second Opinion Oracle is configured.
- Revert with `NegativeRebaseFailedCLBalanceMismatch(uint256 reportedValue, uint256 provedValue, uint256 limitBP)` error
  when the CL validators balance reported by oracles and Second Opinion Oracle is too different.
- Revert with `NegativeRebaseFailedWithdrawalVaultBalanceMismatch(uint256 reportedValue, uint256 provedValue)` error when Withdrawal vault balance reported by oracles and second opinion oracle is different.
- Revert with `NegativeRebaseFailedSecondOpinionReportIsNotReady()` error when second opinion oracle report is not available.
- Revert with `IncorrectCLBalanceIncrease(uint256 annualBalanceDiff)` error when Consensus Layer annual balance increase
  expressed in basis points **exceeds** allowed `LimitsList.annualBalanceIncreaseBPLimit`.

:::

```solidity
function checkAccountingOracleReport(
    uint256 _timeElapsed,
    uint256 _preCLValidatorsBalance,
    uint256 _preCLPendingBalance,
    uint256 _postCLValidatorsBalance,
    uint256 _postCLPendingBalance,
    uint256 _withdrawalVaultBalance,
    uint256 _elRewardsVaultBalance,
    uint256 _sharesRequestedToBurn,
    uint256 _deposits,
    uint256 _withdrawalsVaultTransfer
)
```

#### Arguments

- **`_timeElapsed`** — time elapsed since the previous oracle report, measured in **seconds**
- **`_preCLValidatorsBalance`** — sum of all Lido validators' balances on the Consensus Layer (excluding pending deposits)
  before the current oracle report
- **`_preCLPendingBalance`** — CL pending balance (Lido-attributed pending deposits) before the current oracle report
- **`_postCLValidatorsBalance`** — sum of all Lido validators' balances on the Consensus Layer (excluding pending deposits)
  after the current oracle report
- **`_postCLPendingBalance`** — CL pending balance (Lido-attributed pending deposits) after the current oracle report
- **`_withdrawalVaultBalance`** — withdrawal vault balance on Execution Layer for the report reference slot
- **`_elRewardsVaultBalance`** — el rewards vault balance on Execution Layer for the report reference slot
- **`_sharesRequestedToBurn`** — shares requested to burn for the report reference slot
- **`_deposits`** — deposits to the Beacon Chain since the previous oracle report, in wei
- **`_withdrawalsVaultTransfer`** — ETH amount transferred from the withdrawal vault during the current report

### checkModuleAndCLBalancesChangeRates()

Checks the per-module validator balances consistency and the global CL growth budget derived from the protocol
pending balance, all in wei. Called by [`AccountingOracle`](/contracts/accounting-oracle) during main report
submission, before the per-module validator balances are stored in the [`StakingRouter`](/contracts/staking-router).

The per-module validators balance increase check aggregates the positive deltas between the reported per-module
validator balances and the balances stored in the `StakingRouter`, and compares the sum with the activated balance
budget plus the consolidation allowance derived from `LimitsList.consolidationEthAmountPerDayLimit`.
The check is skipped until the first successful accounting report is finalized
(see [`isPostMigrationFirstReportDone()`](#ispostmigrationfirstreportdone)) and, per module,
while the module has no previous accounting baseline in the `StakingRouter`.

:::note
Below is the list of restrictions checked by the method execution:

- Revert with `InvalidClBalancesData()` error when the lengths of the module ids and balances arrays differ.
- Revert with `InconsistentValidatorsBalanceByModule(uint256 expected, uint256 actual)` error when the sum of the
  per-module validator balances **is not equal to** the reported total CL validators balance.
- Revert with `IncorrectTotalPendingBalance(uint256 maxAllowed, uint256 actual)` error when the reported post-report
  CL pending balance **exceeds** the Lido-funded pending balance plus `LimitsList.externalPendingBalanceCapEth`.
- Revert with `IncorrectTotalActivatedBalance(uint256 maxAllowed, uint256 actual)` error when the balance activated from
  the pending deposits queue **exceeds** the allowance derived from `LimitsList.appearedEthAmountPerDayLimit`.
- Revert with `IncorrectTotalCLBalanceIncrease(uint256 maxAllowed, uint256 actual)` error when the increase of the
  CL validators balance **exceeds** the activated balance plus the APR safety cap.
- Revert with `IncorrectTotalModuleValidatorsBalanceIncrease(uint256 maxAllowed, uint256 actual)` error when the sum of
  the positive per-module validator balance increases **exceeds** the activated balance budget plus the consolidation allowance.

:::

```solidity
function checkModuleAndCLBalancesChangeRates(
    uint256[] calldata _stakingModuleIdsWithUpdatedBalance,
    uint256[] calldata _validatorBalancesWeiByStakingModule,
    uint256 _preCLValidatorsBalanceWei,
    uint256 _preCLPendingBalanceWei,
    uint256 _postCLValidatorsBalanceWei,
    uint256 _postCLPendingBalanceWei,
    uint256 _depositsWei,
    uint256 _timeElapsed
)
```

#### Arguments

- **`_stakingModuleIdsWithUpdatedBalance`** — ids of the staking modules with updated validator balances
- **`_validatorBalancesWeiByStakingModule`** — reported validator balances per staking module, in wei
- **`_preCLValidatorsBalanceWei`** — CL validators balance (excluding pending deposits) before the current oracle report, in wei
- **`_preCLPendingBalanceWei`** — CL pending balance before the current oracle report, in wei
- **`_postCLValidatorsBalanceWei`** — CL validators balance (excluding pending deposits) after the current oracle report, in wei
- **`_postCLPendingBalanceWei`** — CL pending balance after the current oracle report, in wei
- **`_depositsWei`** — deposits to the Beacon Chain since the previous oracle report, in wei
- **`_timeElapsed`** — time elapsed since the previous oracle report, measured in **seconds**

### checkExitBusOracleReport()

Validates that the total balance requested to exit per oracle report does not exceed the limit set by
`LimitsList.maxBalanceExitRequestedPerReportInEth`.
The [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle) calculates the total by attributing to each
validator requested to exit the max effective balance weight of its withdrawal credentials type:
`LimitsList.maxEffectiveBalanceWeightWCType01` for the `0x01` type and
`LimitsList.maxEffectiveBalanceWeightWCType02` for the `0x02` type.

:::note
Reverts with `IncorrectSumOfExitBalancePerReport(uint256 maxBalanceSum)` error when check is failed.
:::

```solidity
function checkExitBusOracleReport(uint256 _maxBalanceExitRequestedPerReportInEth)
```

#### Arguments

- **`_maxBalanceExitRequestedPerReportInEth`** — total balance in ETH of all validators requested to exit in the oracle report

### checkExitedValidatorsCount()

Validates the newly exited validators count against the exited ETH amount per day limit.
Called by [`AccountingOracle`](/contracts/accounting-oracle) after the exited validators counts per staking module
are submitted to the [`StakingRouter`](/contracts/staking-router).


:::note
Reverts with `ExitedEthAmountPerDayLimitExceeded(uint256 limitPerDay, uint256 exitedPerDay)` error when check is failed.
:::

```solidity
function checkExitedValidatorsCount(
    uint256 _newlyExitedValidatorsCount,
    uint256 _timeElapsed
)
```

#### Arguments

- **`_newlyExitedValidatorsCount`** — number of newly exited validators since the previous report
- **`_timeElapsed`** — time elapsed since the previous oracle report, measured in **seconds**

### checkNodeOperatorsPerExtraDataItemCount()

Validates that number of node operators reported per extra data item does not exceed the limit
set by `LimitsList.maxNodeOperatorsPerExtraDataItem`.

:::note
Reverts with `TooManyNodeOpsPerExtraDataItem(uint256 itemIndex, uint256 nodeOpsCount)` error when check is failed.
:::

```solidity
function checkNodeOperatorsPerExtraDataItemCount(
    uint256 _itemIndex,
    uint256 _nodeOperatorsCount
)
```

#### Arguments

- **`_itemIndex`** — index of item in extra data
- **`_nodeOperatorsCount`** — number of node operators reported per the extra data item

### checkExtraDataItemsCountPerTransaction()

Validates that number of extra data items per transaction in the report does not exceed the limit
set by `LimitsList.maxItemsPerExtraDataTransaction`.

:::note
Reverts with `TooManyItemsPerExtraDataTransaction(uint256 maxItemsCount, uint256 receivedItemsCount)` error when check is failed.
:::

```solidity
function checkExtraDataItemsCountPerTransaction(uint256 _extraDataListItemsCount)
```

#### Arguments

- **`_extraDataListItemsCount`** — number of items per single transaction in the accounting oracle report

### checkWithdrawalQueueOracleReport()

Validates that withdrawal request with the passed `_lastFinalizableRequestId` was created more
than `LimitsList.requestTimestampMargin` seconds ago.

:::note
Reverts with `IncorrectRequestFinalization(uint256 requestCreationTimestamp)` error when check is failed.
:::

```solidity
function checkWithdrawalQueueOracleReport(
    uint256 _lastFinalizableRequestId,
    uint256 _reportTimestamp
)
```

#### Arguments

- **`_lastFinalizableRequestId`** — last finalizable withdrawal request id
- **`_reportTimestamp`** — timestamp when the originated oracle report was submitted

### checkSimulatedShareRate()

Applies sanity checks to the simulated share rate for withdrawal requests finalization.

:::note
Reverts with `IncorrectSimulatedShareRate(uint256 simulatedShareRate, uint256 actualShareRate)` error
when simulated share rate deviation exceeds the limit set by `LimitsList.simulatedShareRateDeviationBPLimit`
:::

```solidity
function checkSimulatedShareRate(
    uint256 _postInternalEther,
    uint256 _postInternalShares,
    uint256 _etherToFinalizeWQ,
    uint256 _sharesToBurnForWithdrawals,
    uint256 _simulatedShareRate
)
```

#### Arguments

- **`_postInternalEther`** — total pooled ether after report applied
- **`_postInternalShares`** — total shares after report applied
- **`_etherToFinalizeWQ`** — ether locked on withdrawal queue for the current oracle report
- **`_sharesToBurnForWithdrawals`** — shares burnt due to withdrawals finalization
- **`_simulatedShareRate`** — share rate provided with the oracle report (simulated via off-chain `eth_call`)

## Migration

### migrateBaselineSnapshot()

One-time permissionless method that seeds the initial snapshots into the [`reportData`](#reportdata) array
so that the sliding-window CL balance decrease check has a valid starting point.
The method is permissionless by design: after the first successful call, further calls revert.

:::note

- Reverts with `MigrationAlreadyDone()` error when the `reportData` array is not empty.
- Reverts with `UnexpectedLidoVersion(uint256 actual, uint256 expected)` error when the `Lido` contract version is not `4`.
- Emits `BaselineSnapshotMigrated(uint256 clBalance, uint256 clWithdrawals)`.

:::

```solidity
function migrateBaselineSnapshot()
```

## View Methods

### getLidoLocator()

Returns the address of the protocol-wide [LidoLocator](/contracts/lido-locator) instance.

```solidity
function getLidoLocator() returns (address)
```

### getOracleReportLimits()

Returns the limits list used for the sanity checks as the [`LimitsList`](#limits-list) type.

```solidity
function getOracleReportLimits() returns (LimitsList memory)
```

### getReportDataCount()

Returns the number of report snapshots stored in the [`reportData`](#reportdata) array.

```solidity
function getReportDataCount() returns (uint256)
```

### reportData()

Public array of historical report snapshots used by the CL balance decrease check over the sliding window.
Each snapshot stores the report-window timestamp, the total CL balance (CL validators balance plus CL pending balance),
the deposits for the period since the previous report, and the actual ETH moved from the Consensus Layer
to the withdrawal vault during the period.

```solidity
function reportData(uint256 _index) returns (
    uint64 timestamp,
    uint128 clBalance,
    uint128 deposits,
    uint128 clWithdrawals
)
```

### secondOpinionOracle()

Returns the address of the Second Opinion Oracle (zero address means the Second Opinion Oracle is disabled).

```solidity
function secondOpinionOracle() returns (ISecondOpinionOracle)
```

### lastVaultBalanceAfterTransfer()

Returns the withdrawal vault balance after the last report's transfer was applied.
Used to compute the actual CL withdrawals as `current vault balance - lastVaultBalanceAfterTransfer`.

```solidity
function lastVaultBalanceAfterTransfer() returns (uint256)
```

### lastReportTimestamp()

Returns the timestamp of the latest stored report snapshot used by the CL balance decrease window.
It is advanced by the elapsed time on each accounting report.

```solidity
function lastReportTimestamp() returns (uint256)
```

### isPostMigrationFirstReportDone()

Returns `false` until the first successful accounting report.
The per-module validators balance increase check of
[`checkModuleAndCLBalancesChangeRates()`](#checkmoduleandclbalanceschangerates) is skipped while the flag is `false`.

```solidity
function isPostMigrationFirstReportDone() returns (bool)
```

### getMaxCLBalanceDecreaseBP()

Returns the `LimitsList.maxCLBalanceDecreaseBP` value.

```solidity
function getMaxCLBalanceDecreaseBP() returns (uint256)
```

### getMaxEffectiveBalanceWeightWCType01()

Returns the `LimitsList.maxEffectiveBalanceWeightWCType01` value.

```solidity
function getMaxEffectiveBalanceWeightWCType01() returns (uint256)
```

### getMaxEffectiveBalanceWeightWCType02()

Returns the `LimitsList.maxEffectiveBalanceWeightWCType02` value.

```solidity
function getMaxEffectiveBalanceWeightWCType02() returns (uint256)
```

### getMaxPositiveTokenRebase()

Returns max positive token rebase value with 1e9 precision (e.g.: `1e6` — 0.1%; `1e9` — 100%):

:::note
Special values:

- `0` (zero value) means uninitialized
- `type(uint64).max` means unlimited, e.g. not enforced

:::

Get max positive rebase allowed per single oracle report. Token rebase happens on total supply and/or total
shares adjustment, while huge positive rebase can incur oracle report sandwiching stealing part of the
stETH holders' rewards.

The relative positive rebase value derived as follows:

stETH balance for the `account` defined as:

```solidity
    balanceOf(account) =
        shares[account] * totalPooledEther / totalShares = shares[account] * shareRate
```

Suppose shareRate changes when oracle reports (see `Accounting.handleOracleReport`)
which means that token rebase happens:

```solidity
    preShareRate = preTotalPooledEther() / preTotalShares()
    postShareRate = postTotalPooledEther() / postTotalShares()
    R = (postShareRate - preShareRate) / preShareRate
```

here `R > 0` corresponds to the relative positive rebase value (i.e., instant APR).

```solidity
function getMaxPositiveTokenRebase() returns (uint256)
```

### smoothenTokenRebase()

Evaluates the following amounts during Lido's oracle report processing:

- the allowed ETH amount that might be taken from the withdrawal vault and EL rewards vault
- the allowed amount of stETH shares to be burnt

```solidity
function smoothenTokenRebase(
    uint256 _preInternalEther,
    uint256 _preInternalShares,
    uint256 _preCLBalance,
    uint256 _postCLBalance,
    uint256 _withdrawalVaultBalance,
    uint256 _elRewardsVaultBalance,
    uint256 _sharesRequestedToBurn,
    uint256 _etherToLockForWithdrawals,
    uint256 _newSharesToBurnForWithdrawals
) returns (
    uint256 withdrawals,
    uint256 elRewards,
    uint256 sharesFromWQToBurn,
    uint256 sharesToBurn
)
```

#### Arguments

- **`_preInternalEther`** — amount of internal ETH controlled by the protocol
- **`_preInternalShares`** — number of internal shares
- **`_preCLBalance`** — sum of all Lido validators' active and pending balances on the Consensus Layer plus the deposits
  since the previous report, before the current oracle report
- **`_postCLBalance`** — sum of all Lido validators' active and pending balances on the Consensus Layer after the current oracle report
- **`_withdrawalVaultBalance`** — withdrawal vault balance on Execution Layer for the report calculation moment
- **`_elRewardsVaultBalance`** — elRewards vault balance on Execution Layer for the report calculation moment
- **`_sharesRequestedToBurn`** — shares requested to burn through Burner for the report calculation moment
- **`_etherToLockForWithdrawals`** — ether to lock on withdrawals queue contract
- **`_newSharesToBurnForWithdrawals`** — new shares to burn due to withdrawal request finalization

#### Returns

- **`withdrawals`** — ETH amount allowed to be taken from the withdrawals vault
- **`elRewards`** — ETH amount allowed to be taken from the EL rewards vault
- **`sharesFromWQToBurn`** — amount of shares from Burner that should be burned due to WQ finalization
- **`sharesToBurn`** — amount of shares to be burnt (accounting for withdrawals finalization)

## Lever Methods

### setOracleReportLimits()

Sets the new values for the limits list.
:::note

- Requires `ALL_LIMITS_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue(uint256 value, uint256 minAllowedValue, uint256 maxAllowedValue)` error when some
  value in the passed data out of the allowed range.
  See details of allowed value boundaries in the [Limits List](#limits-list) section.
- Emits the corresponding `...Set` event for each changed limit value.
- Emits `SecondOpinionOracleChanged(ISecondOpinionOracle indexed secondOpinionOracle)` in case of change for the second opinion oracle.

:::

```solidity
function setOracleReportLimits(LimitsList calldata _limitsList, ISecondOpinionOracle _secondOpinionOracle)
```

#### Arguments

- **`_limitsList`** — new limits list values
- **`_secondOpinionOracle`** — new second opinion oracle value

### setExitedEthAmountPerDayLimit()

Sets the new value for the `LimitsList.exitedEthAmountPerDayLimit`.
The limit is applicable for the _**exited**_ ETH amount.

:::note

- Requires `EXITED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setExitedEthAmountPerDayLimit(uint256 _exitedEthAmountPerDayLimit)
```

#### Arguments

- **`_exitedEthAmountPerDayLimit`** — new `LimitsList.exitedEthAmountPerDayLimit` value

### setAppearedEthAmountPerDayLimit()

Sets the new value for the `LimitsList.appearedEthAmountPerDayLimit`.
The limit is applicable for the _**appeared**_ (activated) ETH amount.

:::note

- Requires `APPEARED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setAppearedEthAmountPerDayLimit(uint256 _appearedEthAmountPerDayLimit)
```

#### Arguments

- **`_appearedEthAmountPerDayLimit`** — new `LimitsList.appearedEthAmountPerDayLimit` value

### setConsolidationEthAmountPerDayLimit()

Sets the new value for the `LimitsList.consolidationEthAmountPerDayLimit`.

:::note

- Requires `CONSOLIDATION_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setConsolidationEthAmountPerDayLimit(uint256 _consolidationEthAmountPerDayLimit)
```

#### Arguments

- **`_consolidationEthAmountPerDayLimit`** — new `LimitsList.consolidationEthAmountPerDayLimit` value

### setExitedValidatorEthAmountLimit()

Sets the new value for the `LimitsList.exitedValidatorEthAmountLimit`.

:::note

- Requires `EXITED_VALIDATOR_ETH_AMOUNT_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setExitedValidatorEthAmountLimit(uint256 _exitedValidatorEthAmountLimit)
```

#### Arguments

- **`_exitedValidatorEthAmountLimit`** — new `LimitsList.exitedValidatorEthAmountLimit` value

### setExternalPendingBalanceCapEth()

Sets the new value for the `LimitsList.externalPendingBalanceCapEth` — the extra external pending balance cap
tolerated above the Lido-funded pending balance. Stored in whole ETH units.

:::note

- Requires `EXTERNAL_PENDING_BALANCE_CAP_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setExternalPendingBalanceCapEth(uint256 _externalPendingBalanceCapEth)
```

#### Arguments

- **`_externalPendingBalanceCapEth`** — new `LimitsList.externalPendingBalanceCapEth` value

### setAnnualBalanceIncreaseBPLimit()

Sets the new value for the `LimitsList.annualBalanceIncreaseBPLimit` variable.

:::note

- Requires `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setAnnualBalanceIncreaseBPLimit(uint256 _annualBalanceIncreaseBPLimit)
```

#### Arguments

- **`_annualBalanceIncreaseBPLimit`** — new value for `LimitsList.annualBalanceIncreaseBPLimit`

### setSimulatedShareRateDeviationBPLimit()

Sets the new value for the `LimitsList.simulatedShareRateDeviationBPLimit` variable.

:::note

- Requires `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setSimulatedShareRateDeviationBPLimit(uint256 _simulatedShareRateDeviationBPLimit)
```

#### Arguments

- **`_simulatedShareRateDeviationBPLimit`** — new value for `LimitsList.simulatedShareRateDeviationBPLimit`

### setMaxBalanceExitRequestedPerReportInEth()

Sets the new value for the `LimitsList.maxBalanceExitRequestedPerReportInEth`.

:::note

- Requires `MAX_BALANCE_EXIT_REQUESTED_PER_REPORT_IN_ETH_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxBalanceExitRequestedPerReportInEth(uint256 _maxBalanceExitRequestedPerReportInEth)
```

#### Arguments

- **`_maxBalanceExitRequestedPerReportInEth`** — new value for `LimitsList.maxBalanceExitRequestedPerReportInEth`

### setMaxEffectiveBalanceWeightWCType01()

Sets the new max effective balance equivalent weight in ETH for validators with the `0x01` type withdrawal credentials.

:::note

- Requires `MAX_EFFECTIVE_BALANCE_WEIGHTS_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxEffectiveBalanceWeightWCType01(uint256 _maxEffectiveBalanceWeightWCType01)
```

#### Arguments

- **`_maxEffectiveBalanceWeightWCType01`** — new value for `LimitsList.maxEffectiveBalanceWeightWCType01`

### setMaxEffectiveBalanceWeightWCType02()

Sets the new max effective balance equivalent weight in ETH for validators with the `0x02` type withdrawal credentials.

:::note

- Requires `MAX_EFFECTIVE_BALANCE_WEIGHTS_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxEffectiveBalanceWeightWCType02(uint256 _maxEffectiveBalanceWeightWCType02)
```

#### Arguments

- **`_maxEffectiveBalanceWeightWCType02`** — new value for `LimitsList.maxEffectiveBalanceWeightWCType02`

### setRequestTimestampMargin()

Sets the new value for the `LimitsList.requestTimestampMargin` variable.

:::note

- Requires `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setRequestTimestampMargin(uint256 _requestTimestampMargin)
```

#### Arguments

- **`_requestTimestampMargin`** — new value for `LimitsList.requestTimestampMargin`

### setMaxPositiveTokenRebase()

Sets the new value for the `LimitsList.maxPositiveTokenRebase` variable.

:::note

- Requires `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxPositiveTokenRebase(uint256 _maxPositiveTokenRebase)
```

#### Arguments

- **`_maxPositiveTokenRebase`** — new value for `LimitsList.maxPositiveTokenRebase`

### setMaxItemsPerExtraDataTransaction()

Sets the new value for the `LimitsList.maxItemsPerExtraDataTransaction` variable.

:::note

- Requires `MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxItemsPerExtraDataTransaction(uint256 _maxItemsPerExtraDataTransaction)
```

#### Arguments

- **`_maxItemsPerExtraDataTransaction`** — new value for `LimitsList.maxItemsPerExtraDataTransaction`

### setMaxNodeOperatorsPerExtraDataItem()

Sets the new value for the `LimitsList.maxNodeOperatorsPerExtraDataItem` variable.

:::note

- Requires `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxNodeOperatorsPerExtraDataItem(uint256 _maxNodeOperatorsPerExtraDataItem)
```

#### Arguments

- **`_maxNodeOperatorsPerExtraDataItem`** — new value for `LimitsList.maxNodeOperatorsPerExtraDataItem`

### setSecondOpinionOracleAndCLBalanceUpperMargin()

Sets the new value for the Second Opinion Oracle and `LimitsList.clBalanceOraclesErrorUpperBPLimit` variable.

:::note

- Requires `SECOND_OPINION_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.
- Emits `SecondOpinionOracleChanged(ISecondOpinionOracle indexed secondOpinionOracle)` in case of change for the second opinion oracle.
  :::

```solidity
function setSecondOpinionOracleAndCLBalanceUpperMargin(ISecondOpinionOracle _secondOpinionOracle, uint256 _clBalanceOraclesErrorUpperBPLimit)
```

#### Arguments

- **`_secondOpinionOracle`** — new value for Second Opinion Oracle (zero address disables the Second Opinion Oracle)
- **`_clBalanceOraclesErrorUpperBPLimit`** — new value for `LimitsList.clBalanceOraclesErrorUpperBPLimit`

### setMaxCLBalanceDecreaseBP()

Sets the new value for the `LimitsList.maxCLBalanceDecreaseBP` variable — the max allowed CL balance decrease
over the 36-day sliding window, in basis points (e.g. `360` = 3.6%).

:::note

- Requires `MAX_CL_BALANCE_DECREASE_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxCLBalanceDecreaseBP(uint256 _maxCLBalanceDecreaseBP)
```

#### Arguments

- **`_maxCLBalanceDecreaseBP`** — new value for `LimitsList.maxCLBalanceDecreaseBP`

## Permissions

### ALL_LIMITS_MANAGER_ROLE()

```solidity
bytes32 public constant ALL_LIMITS_MANAGER_ROLE = keccak256("ALL_LIMITS_MANAGER_ROLE")
```

Granting this role allows updating **ANY** value of the Limits List.
See [`setOracleReportLimits()`](#setoraclereportlimits) method.

**Grant this role with caution and give preference to the granular roles described below.**

### EXITED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `exitedEthAmountPerDayLimit` value of the [Limits List](#limits-list).
See the [`setExitedEthAmountPerDayLimit()`](#setexitedethamountperdaylimit) method.

```solidity
bytes32 public constant EXITED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("EXITED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE");
```

### APPEARED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `appearedEthAmountPerDayLimit` value of the [Limits List](#limits-list).
See the [`setAppearedEthAmountPerDayLimit()`](#setappearedethamountperdaylimit) method.

```solidity
bytes32 public constant APPEARED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("APPEARED_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE");
```

### CONSOLIDATION_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `consolidationEthAmountPerDayLimit` value of the [Limits List](#limits-list).
See the [`setConsolidationEthAmountPerDayLimit()`](#setconsolidationethamountperdaylimit) method.

```solidity
bytes32 public constant CONSOLIDATION_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("CONSOLIDATION_ETH_AMOUNT_PER_DAY_LIMIT_MANAGER_ROLE");
```

### EXITED_VALIDATOR_ETH_AMOUNT_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `exitedValidatorEthAmountLimit` value of the [Limits List](#limits-list).
See the [`setExitedValidatorEthAmountLimit()`](#setexitedvalidatorethamountlimit) method.

```solidity
bytes32 public constant EXITED_VALIDATOR_ETH_AMOUNT_LIMIT_MANAGER_ROLE =
    keccak256("EXITED_VALIDATOR_ETH_AMOUNT_LIMIT_MANAGER_ROLE");
```

### EXTERNAL_PENDING_BALANCE_CAP_MANAGER_ROLE()

Granting this role allows updating the `externalPendingBalanceCapEth` value of the [Limits List](#limits-list).
See the [`setExternalPendingBalanceCapEth()`](#setexternalpendingbalancecapeth) method.

```solidity
bytes32 public constant EXTERNAL_PENDING_BALANCE_CAP_MANAGER_ROLE =
    keccak256("EXTERNAL_PENDING_BALANCE_CAP_MANAGER_ROLE");
```

### ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `annualBalanceIncreaseBPLimit` value of the [Limits List](#limits-list).
See the [`setAnnualBalanceIncreaseBPLimit()`](#setannualbalanceincreasebplimit) method.

```solidity
bytes32 public constant ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE =
    keccak256("ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE")
```

### SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `simulatedShareRateDeviationBPLimit` value of the [Limits List](#limits-list).
See the [`setSimulatedShareRateDeviationBPLimit()`](#setsimulatedshareratedeviationbplimit) method.

```solidity
bytes32 public constant SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE =
    keccak256("SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE")
```

### MAX_BALANCE_EXIT_REQUESTED_PER_REPORT_IN_ETH_ROLE()

Granting this role allows updating the `maxBalanceExitRequestedPerReportInEth` value of the [Limits List](#limits-list).
See the [`setMaxBalanceExitRequestedPerReportInEth()`](#setmaxbalanceexitrequestedperreportineth) method.

```solidity
bytes32 public constant MAX_BALANCE_EXIT_REQUESTED_PER_REPORT_IN_ETH_ROLE =
    keccak256("MAX_BALANCE_EXIT_REQUESTED_PER_REPORT_IN_ETH_ROLE")
```

### MAX_EFFECTIVE_BALANCE_WEIGHTS_MANAGER_ROLE()

Granting this role allows updating the `maxEffectiveBalanceWeightWCType01` and `maxEffectiveBalanceWeightWCType02`
values of the [Limits List](#limits-list).
See the [`setMaxEffectiveBalanceWeightWCType01()`](#setmaxeffectivebalanceweightwctype01) and
[`setMaxEffectiveBalanceWeightWCType02()`](#setmaxeffectivebalanceweightwctype02) methods.

```solidity
bytes32 public constant MAX_EFFECTIVE_BALANCE_WEIGHTS_MANAGER_ROLE =
    keccak256("MAX_EFFECTIVE_BALANCE_WEIGHTS_MANAGER_ROLE")
```

### MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE()

Granting this role allows updating the `maxItemsPerExtraDataTransaction` value of the [Limits List](#limits-list).
See the [`setMaxItemsPerExtraDataTransaction()`](#setmaxitemsperextradatatransaction) method.

```solidity
bytes32 public constant MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE =
    keccak256("MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE");
```

### MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE()

Granting this role allows updating the `maxNodeOperatorsPerExtraDataItem` value of the [Limits List](#limits-list).
See the [`setMaxNodeOperatorsPerExtraDataItem()`](#setmaxnodeoperatorsperextradataitem) method.

```solidity
bytes32 public constant MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE =
    keccak256("MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE");
```

### REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE()

Granting this role allows updating the `requestTimestampMargin` value of the [Limits List](#limits-list).
See the [`setRequestTimestampMargin()`](#setrequesttimestampmargin) method.

```solidity
bytes32 public constant REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE
    = keccak256("REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE")
```

### MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE()

Granting this role allows updating the `maxPositiveTokenRebase` value of the [Limits List](#limits-list).
See the [`setMaxPositiveTokenRebase()`](#setmaxpositivetokenrebase) method.

```solidity
bytes32 public constant MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE =
    keccak256("MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE")
```

### SECOND_OPINION_MANAGER_ROLE()

Granting this role allows updating the Second Opinion Oracle and `clBalanceOraclesErrorUpperBPLimit` value of the [Limits List](#limits-list).
See the [`setSecondOpinionOracleAndCLBalanceUpperMargin()`](#setsecondopinionoracleandclbalanceuppermargin) method.

```solidity
bytes32 public constant SECOND_OPINION_MANAGER_ROLE =
    keccak256("SECOND_OPINION_MANAGER_ROLE")
```

### MAX_CL_BALANCE_DECREASE_MANAGER_ROLE()

Granting this role allows updating the `maxCLBalanceDecreaseBP` value of the [Limits List](#limits-list).
See the [`setMaxCLBalanceDecreaseBP()`](#setmaxclbalancedecreasebp) method.

```solidity
bytes32 public constant MAX_CL_BALANCE_DECREASE_MANAGER_ROLE =
    keccak256("MAX_CL_BALANCE_DECREASE_MANAGER_ROLE")
```

## Events

### ExitedEthAmountPerDayLimitSet()

Emits whenever the value of the `LimitsList.exitedEthAmountPerDayLimit` value is changed.

```solidity
event ExitedEthAmountPerDayLimitSet(uint256 exitedEthAmountPerDayLimit);
```

#### Arguments

- **`exitedEthAmountPerDayLimit`** — new value of the `LimitsList.exitedEthAmountPerDayLimit`

### AppearedEthAmountPerDayLimitSet()

Emits whenever the value of the `LimitsList.appearedEthAmountPerDayLimit` value is changed.

```solidity
event AppearedEthAmountPerDayLimitSet(uint256 appearedEthAmountPerDayLimit);
```

#### Arguments

- **`appearedEthAmountPerDayLimit`** — new value of the `LimitsList.appearedEthAmountPerDayLimit`

### ConsolidationEthAmountPerDayLimitSet()

Emits whenever the value of the `LimitsList.consolidationEthAmountPerDayLimit` value is changed.

```solidity
event ConsolidationEthAmountPerDayLimitSet(uint256 consolidationEthAmountPerDayLimit);
```

#### Arguments

- **`consolidationEthAmountPerDayLimit`** — new value of the `LimitsList.consolidationEthAmountPerDayLimit`

### ExitedValidatorEthAmountLimitSet()

Emits whenever the value of the `LimitsList.exitedValidatorEthAmountLimit` value is changed.

```solidity
event ExitedValidatorEthAmountLimitSet(uint256 exitedValidatorEthAmountLimit);
```

#### Arguments

- **`exitedValidatorEthAmountLimit`** — new value of the `LimitsList.exitedValidatorEthAmountLimit`

### ExternalPendingBalanceCapEthSet()

Emits whenever the value of the `LimitsList.externalPendingBalanceCapEth` value is changed.

```solidity
event ExternalPendingBalanceCapEthSet(uint256 externalPendingBalanceCapEth);
```

#### Arguments

- **`externalPendingBalanceCapEth`** — new value of the `LimitsList.externalPendingBalanceCapEth`

### SecondOpinionOracleChanged()

Emits whenever the Second Opinion Oracle address is changed.

```solidity
event SecondOpinionOracleChanged(ISecondOpinionOracle indexed secondOpinionOracle);
```

#### Arguments

- **`secondOpinionOracle`** — new address of the Second Opinion Oracle

### AnnualBalanceIncreaseBPLimitSet()

Emits whenever the value of the `LimitsList.annualBalanceIncreaseBPLimit` value is changed.

```solidity
event AnnualBalanceIncreaseBPLimitSet(uint256 annualBalanceIncreaseBPLimit);
```

#### Arguments

- **`annualBalanceIncreaseBPLimit`** — new value of the `LimitsList.annualBalanceIncreaseBPLimit`

### SimulatedShareRateDeviationBPLimitSet()

Emits whenever the value of the `LimitsList.simulatedShareRateDeviationBPLimit` value is changed.

```solidity
event SimulatedShareRateDeviationBPLimitSet(uint256 simulatedShareRateDeviationBPLimit);
```

#### Arguments

- **`simulatedShareRateDeviationBPLimit`** — new value of the `LimitsList.simulatedShareRateDeviationBPLimit`

### MaxPositiveTokenRebaseSet()

Emits whenever the value of the `LimitsList.maxPositiveTokenRebase` value is changed.

```solidity
event MaxPositiveTokenRebaseSet(uint256 maxPositiveTokenRebase);
```

#### Arguments

- **`maxPositiveTokenRebase`** — new value of the `LimitsList.maxPositiveTokenRebase`

### MaxBalanceExitRequestedPerReportInEthSet()

Emits whenever the value of the `LimitsList.maxBalanceExitRequestedPerReportInEth` value is changed.

```solidity
event MaxBalanceExitRequestedPerReportInEthSet(uint256 maxBalanceExitRequestedPerReportInEth);
```

#### Arguments

- **`maxBalanceExitRequestedPerReportInEth`** — new value of the `LimitsList.maxBalanceExitRequestedPerReportInEth`

### MaxEffectiveBalanceWeightWCType01Set()

Emits whenever the value of the `LimitsList.maxEffectiveBalanceWeightWCType01` value is changed.

```solidity
event MaxEffectiveBalanceWeightWCType01Set(uint256 maxEffectiveBalanceWeightWCType01);
```

#### Arguments

- **`maxEffectiveBalanceWeightWCType01`** — new value of the `LimitsList.maxEffectiveBalanceWeightWCType01`

### MaxEffectiveBalanceWeightWCType02Set()

Emits whenever the value of the `LimitsList.maxEffectiveBalanceWeightWCType02` value is changed.

```solidity
event MaxEffectiveBalanceWeightWCType02Set(uint256 maxEffectiveBalanceWeightWCType02);
```

#### Arguments

- **`maxEffectiveBalanceWeightWCType02`** — new value of the `LimitsList.maxEffectiveBalanceWeightWCType02`

### MaxItemsPerExtraDataTransactionSet()

Emits whenever the value of the `LimitsList.maxItemsPerExtraDataTransaction` value is changed.

```solidity
event MaxItemsPerExtraDataTransactionSet(uint256 maxItemsPerExtraDataTransaction);
```

#### Arguments

- **`maxItemsPerExtraDataTransaction`** — new value of the `LimitsList.maxItemsPerExtraDataTransaction`

### MaxNodeOperatorsPerExtraDataItemSet()

Emits whenever the value of the `LimitsList.maxNodeOperatorsPerExtraDataItem` value is changed.

```solidity
event MaxNodeOperatorsPerExtraDataItemSet(uint256 maxNodeOperatorsPerExtraDataItem);
```

#### Arguments

- **`maxNodeOperatorsPerExtraDataItem`** — new value of the `LimitsList.maxNodeOperatorsPerExtraDataItem`

### RequestTimestampMarginSet()

Emits whenever the value of the `LimitsList.requestTimestampMargin` value is changed.

```solidity
event RequestTimestampMarginSet(uint256 requestTimestampMargin);
```

#### Arguments

- **`requestTimestampMargin`** — new value of the `LimitsList.requestTimestampMargin`

### MaxCLBalanceDecreaseBPSet()

Emits whenever the value of the `LimitsList.maxCLBalanceDecreaseBP` value is changed.

```solidity
event MaxCLBalanceDecreaseBPSet(uint256 maxCLBalanceDecreaseBP);
```

#### Arguments

- **`maxCLBalanceDecreaseBP`** — new value of the `LimitsList.maxCLBalanceDecreaseBP`

### CLBalanceOraclesErrorUpperBPLimitSet()

Emits whenever the value of the `LimitsList.clBalanceOraclesErrorUpperBPLimit` value is changed.

```solidity
event CLBalanceOraclesErrorUpperBPLimitSet(uint256 clBalanceOraclesErrorUpperBPLimit);
```

#### Arguments

- **`clBalanceOraclesErrorUpperBPLimit`** — new value of the `LimitsList.clBalanceOraclesErrorUpperBPLimit`

### NegativeCLRebaseConfirmed()

Emits whenever the checkAccountingOracleReport() finished with negative CL rebase check successfully with checking the Second Opinion Oracle.

```solidity
event NegativeCLRebaseConfirmed(uint256 refSlot, uint256 clBalanceWei, uint256 withdrawalVaultBalance);
```

#### Arguments

- **`refSlot`** — the reference slot for the report checked.
- **`clBalanceWei`** — the reported CL validators balance (excluding pending deposits), in wei.
- **`withdrawalVaultBalance`** — balance of the withdrawal vault.

### NegativeCLRebaseAccepted()

Emits whenever the checkAccountingOracleReport() finished with negative CL rebase check successfully without checking the Second Opinion Oracle.

```solidity
event NegativeCLRebaseAccepted(uint256 refSlot, uint256 clTotalBalance, uint256 clBalanceDecrease, uint256 maxAllowedDecrease);
```

#### Arguments

- **`refSlot`** — the reference slot for the report checked.
- **`clTotalBalance`** — the total Consensus Layer balance (CL validators balance plus CL pending balance).
- **`clBalanceDecrease`** — the decrease of Consensus Layer balance over the sliding window.
- **`maxAllowedDecrease`** — the maximum accepted CL balance decrease without second opinion.

### BaselineSnapshotMigrated()

Emits on the successful [`migrateBaselineSnapshot()`](#migratebaselinesnapshot) call.

```solidity
event BaselineSnapshotMigrated(uint256 clBalance, uint256 clWithdrawals);
```

#### Arguments

- **`clBalance`** — the CL balance seeded as the baseline snapshot.
- **`clWithdrawals`** — the withdrawal vault balance recorded as CL withdrawals at the migration moment.
