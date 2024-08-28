# OracleReportSanityChecker

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol)
- [Deployed contract](https://etherscan.io/address/todo_put_new_address)

Some vital data for the Lido protocol is collected off-chain and delivered on-chain via Oracle contracts:
[`AccountingOracle`](./accounting-oracle.md), [`ValidatorsExitBusOracle`](./validators-exit-bus-oracle.md).
Due to the high impact of data provided by the Oracles on the state of the protocol, each Oracle's
report passes a set of onchain
[sanity checks](https://en.wikipedia.org/wiki/Sanity_check).
For the simplicity of the contracts responsible for handling Oracle's reports, all sanity checks were collected in the
standalone `OracleReportSanityChecker` contract.

Besides the validation methods, the `OracleReportSanityChecker` contract contains a [set of tunable limits and restrictions](#limits-list)
used during the report validation process.
To configure the limits values contract provides the lever methods described in the [standalone section](#lever-methods).
Access to lever methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
contract and a bunch of [granular roles](#permissions).

## Limits List

`OracleReportSanityChecker` introduces a new type `LimitsList` which contains all the limits used by the contract.

```solidity
struct LimitsList {
    uint256 exitedValidatorsPerDayLimit;
    uint256 appearedValidatorsPerDayLimit;
    uint256 annualBalanceIncreaseBPLimit;
    uint256 simulatedShareRateDeviationBPLimit;
    uint256 maxValidatorExitRequestsPerReport;
    uint256 maxItemsPerExtraDataTransaction;
    uint256 maxNodeOperatorsPerExtraDataItem;
    uint256 requestTimestampMargin;
    uint256 maxPositiveTokenRebase;
    uint256 initialSlashingAmountPWei;
    uint256 inactivityPenaltiesAmountPWei;
    uint256 clBalanceOraclesErrorUpperBPLimit;
}
```

- **`exitedValidatorsPerDayLimit`  ∈ [0, 65535]** — the max possible number of validators that might be reported as exited per single day, _**exited**_ are reported according to the
  [Consensus Layer churn limit](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#get_validator_churn_limit).
- **`appearedValidatorsPerDayLimit` ∈ [0, 65535]** — the max possible number of validators that might been reported as _**appeared**_ during a single day. [`AccountingOracle`](./accounting-oracle.md) reports validators as _**appeared**_ once them become _**pending**_ (might be not _**activated**_ yet). Thus, this limit should be high enough for such cases because Consensus Layer has no
  intrinsic churn limit for the amount of _**pending**_ validators (only for _**activated**_ instead).
  For Lido it's limited by the max daily deposits via [`DepositSecurityModule`](./deposit-security-module.md). 
- **`annualBalanceIncreaseBPLimit` ∈ [0, 10000]** — the max annual increase of the total validators' balances on the Consensus Layer
  since the previous oracle report. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`simulatedShareRateDeviationBPLimit` ∈ [0, 10000]** — the max deviation of the provided `simulatedShareRate` and the actual one within the
  currently processing oracle report. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`maxValidatorExitRequestsPerReport` ∈ [0, 65535]** — the max number of exit requests allowed in report
  to [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md)
- **`maxItemsPerExtraDataTransaction` ∈ [0, 65535]** — the max number of data list items reported to accounting oracle in extra data per single transaction.
- **`maxNodeOperatorsPerExtraDataItem` ∈ [0, 65535]** — the max number of node operators reported per extra data list item
- **`requestTimestampMargin` ∈ [0, type(uint64).max]** — the min time required to be passed from the creation of the request to be finalized till the time of the oracle report
- **`maxPositiveTokenRebase` ∈ [1, type(uint64).max]** — the max positive token rebase allowed per single oracle report token rebase
  happens on total supply adjustment, huge positive rebase can incur oracle report sandwiching.
  Uses 1e9 precision, e.g.: `1e6` — 0.1%; `1e9` — 100%; `type(uint64).max` — unlimited rebase.
- **`initialSlashingAmountPWei` ∈ [0, 65535]** - initial slashing amount per one validator to calculate initial slashing of the validators' balances on the Consensus Layer.
- **`inactivityPenaltiesAmountPWei` ∈ [0, 65535]** - inactivity penalties amount per one validator to calculate penalties of the validators' balances on the Consensus Layer.
- **`clBalanceOraclesErrorUpperBPLimit` ∈ [0, 10000]** - the maximum percent on how Second Opinion Oracle reported value could be greater than reported by the AccountingOracle. There is an assumption that second opinion oracle CL balance can be greater as calculated for the withdrawal credentials. Represented in the [Basis Points](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).

There is also parameter for Second Opinion Oracle which is not a part of the `LimitList` structure. However
it's modification requires the same type of roles as for the Limits. It could be changed with a general 
`setOracleReportLimits()` function or specific `setSecondOpinionOracleAndCLBalanceUpperMargin()`.

For the details about meaning of the parameters: `initialSlashingAmountPWei`, `inactivityPenaltiesAmountPWei`,
`clBalanceOraclesErrorUpperBPLimit` and `Second Opinion Oracle` please refer to [LIP-23](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-23.md).

## Sanity Checks

### checkAccountingOracleReport()

Applies sanity checks to the accounting parameters of Lido's Oracle report.

:::note
Below is the list of restrictions checked by the method execution:

- Revert with `IncorrectWithdrawalsVaultBalance(uint256 actualWithdrawalVaultBalance)` error when the reported withdrawals
  vault balance **is greater than** the actual balance of the withdrawal vault.
- Revert with `IncorrectELRewardsVaultBalance(uint256 actualELRewardsVaultBalance)` error when reported EL rewards vault
  balance **is greater than** the actual balance of EL rewards vault.
- Revert with `IncorrectSharesRequestedToBurn(uint256 actualSharesToBurn)` error when the amount of stETH shares requested
  to burn **exceeds** the number of shares marked to be burned in the Burner contract.
- Revert with `IncorrectCLBalanceDecrease(uint256 negativeCLRebaseSum, uint256 maxNegativeCLRebaseSum)` error when Consensus Layer balance decrease **exceeds** the allowed. See [LIP-23](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-23.md) for this and other similar errors.
- Revert with `IncorrectCLBalanceDecrease(uint256 negativeCLRebaseSum, uint256 maxNegativeCLRebaseSum)` error when Consensus Layer balance reported by oracles and second opinion oracle is too different. 
- Revert with `NegativeRebaseFailedWithdrawalVaultBalanceMismatch(uint256 reportedValue, uint256 provedValue)` error when Withdrawal vault balance reported by oracles and second opinion oracle is different. 
- Revert with `NegativeRebaseFailedSecondOpinionReportIsNotReady()` error when second opinion oracle report is not available. 
- Revert with `IncorrectCLBalanceIncrease(uint256 annualBalanceDiff)` error when Consensus Layer annual balance increase
  expressed in basis points **exceeds** allowed `LimitsList.annualBalanceIncreaseBPLimit`.
- Revert with `IncorrectAppearedValidators(uint256 appearedValidatorsLimit)` error when the number of appeared validators **exceeds**
  the limit set by `LimitsList.appearedValidatorsPerDayLimit`.

:::

```solidity
function checkAccountingOracleReport(
    uint256 _timeElapsed,
    uint256 _preCLBalance,
    uint256 _postCLBalance,
    uint256 _withdrawalVaultBalance,
    uint256 _elRewardsVaultBalance,
    uint256 _sharesRequestedToBurn,
    uint256 _preCLValidators,
    uint256 _postCLValidators
)
```

#### Arguments

- **`_timeElapsed`** — time elapsed since the previous oracle report, measured in **seconds**
- **`_preCLBalance`** — sum of all Lido validators' balances on the Consensus Layer before the current oracle report
  (NB: also include the initial balance of newly appeared validators)
- **`_postCLBalance`** — sum of all Lido validators' balances on the Consensus Layer after the current oracle report
- **`_withdrawalVaultBalance`** — withdrawal vault balance on Execution Layer for the report reference slot
- **`_elRewardsVaultBalance`** — el rewards vault balance on Execution Layer for the report reference slot
- **`_sharesRequestedToBurn`** — shares requested to burn for the report reference slot
- **`_preCLValidators`** — Lido-participating validators on the CL side before the current oracle report
- **`_postCLValidators`** — Lido-participating validators on the CL side after the current oracle report

### checkExitBusOracleReport()

Validates that number of exit requests does not exceed the limit set by `LimitsList.maxValidatorExitRequestsPerReport`.

:::note
Reverts with `IncorrectNumberOfExitRequestsPerReport(uint256 maxRequestsCount)` error when check is failed.
:::

```solidity
function checkExitBusOracleReport(uint256 _exitRequestsCount)
```

#### Arguments

- **`_exitRequestsCount`** — number of validator exit requests supplied per oracle report

### checkExitedValidatorsRatePerDay()

Validates that number of exited validators does not exceed the limit set by `LimitsList.exitedValidatorsPerDayLimit`.

:::note
Reverts with `ExitedValidatorsLimitExceeded(uint256 limitPerDay, uint256 exitedPerDay)` error when check is failed.
:::

```solidity
function checkExitedValidatorsRatePerDay(uint256 _exitedValidatorsCount)
```

#### Arguments

- **`_exitedValidatorsCount`** — number of validator exit requests supplied per oracle report

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
- **`_nodeOperatorsCount`** — number of validator exit requests supplied per oracle report

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
Reverts with `IncorrectRequestFinalization(uint256 requestCreationBlock)` error when check is failed.
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
    uint256 _postTotalPooledEther,
    uint256 _postTotalShares,
    uint256 _etherLockedOnWithdrawalQueue,
    uint256 _sharesBurntDueToWithdrawals,
    uint256 _simulatedShareRate
)
```

#### Arguments

- **`_postTotalPooledEther`** — total pooled ether after report applied
- **`_postTotalShares`** — total shares after report applied
- **`_etherLockedOnWithdrawalQueue`** — ether locked on withdrawal queue for the current oracle report
- **`_sharesBurntDueToWithdrawals`** — shares burnt due to withdrawals finalization
- **`_simulatedShareRate`** — share rate provided with the oracle report (simulated via off-chain "eth_call")

## View Methods

### getLidoLocator()

Returns the address of the protocol-wide [LidoLocator](./lido-locator.md) instance.

```solidity
function getLidoLocator() returns (address)
```

### getOracleReportLimits()

Returns the limits list used for the sanity checks as the [`LimitsList`](#limits-list) type.

```solidity
function getOracleReportLimits() returns (LimitsList memory)
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

Suppose shareRate changes when oracle reports (see `handleOracleReport`)
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
    uint256 _preTotalPooledEther,
    uint256 _preTotalShares,
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
    uint256 simulatedSharesToBurn,
    uint256 sharesToBurn
)
```

#### Arguments

- **`_preTotalPooledEther`** — total amount of ETH controlled by the protocol
- **`_preTotalShares`** — total amount of minted stETH shares
- **`_preCLBalance`** — sum of all Lido validators' balances on the Consensus Layer before the current oracle report
- **`_postCLBalance`** — sum of all Lido validators' balances on the Consensus Layer after the current oracle report
- **`_withdrawalVaultBalance`** — withdrawal vault balance on Execution Layer for the report calculation moment
- **`_elRewardsVaultBalance`** — elRewards vault balance on Execution Layer for the report calculation moment
- **`_sharesRequestedToBurn`** — shares requested to burn through Burner for the report calculation moment
- **`_etherToLockForWithdrawals`** — ether to lock on withdrawals queue contract
- **`_newSharesToBurnForWithdrawals`** — new shares to burn due to withdrawal requests finalization

#### Returns

- **`withdrawals`** — ETH amount allowed to be taken from the withdrawals vault
- **`elRewards`** — ETH amount allowed to be taken from the EL rewards vault
- **`simulatedSharesToBurn`** — simulated amount of shares to be burnt (if no ether locked on withdrawals)
- **`sharesToBurn`** — amount of shares to be burnt (accounting for withdrawals finalization)

## Lever Methods

### setOracleReportLimits()

Sets the new values for the limits list.
:::note

- Requires `ALL_LIMITS_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue(uint256 value, uint256 minAllowedValue, uint256 maxAllowedValue)` error when some
  value in the passed data out of the allowed range.
  See details of allowed value boundaries in the [Limits List](#limits-list) section.
- Emits `SecondOpinionOracleChanged(ISecondOpinionOracle indexed secondOpinionOracle)` in case of change for the second opinion oracle.  

:::

```solidity
function setOracleReportLimits(LimitsList calldata _limitsList, ISecondOpinionOracle _secondOpinionOracle)
```

#### Arguments

- **`_limitsList`** — new limits list values
- **`_secondOpinionOracle`** — new second opinion oracle value

### setExitedValidatorsPerDayLimit()

Sets the new value for the `LimitsList.exitedValidatorsPerDayLimit`.
The limit is applicable for _**exited**_ validators.

:::note

- Requires `EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setExitedValidatorsPerDayLimit(uint256 _exitedValidatorsPerDayLimit)
```

#### Arguments

- **`_exitedValidatorsPerDayLimit`** — new `LimitsList.exitedValidatorsPerDayLimit` value

### setAppearedValidatorsPerDayLimit()

Sets the new value for the `LimitsList.appearedValidatorsPerDayLimit`.
The limit is applicable for _**appeared**_ validators.

:::note

- Requires `APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setAppearedValidatorsPerDayLimit(uint256 _appearedValidatorsPerDayLimit)
```

#### Arguments

- **`_appearedValidatorsPerDayLimit`** — new `LimitsList.appearedValidatorsPerDayLimit` value

### setOneOffCLBalanceDecreaseBPLimit()

Sets the new value for the `LimitsList.oneOffCLBalanceDecreaseBPLimit` variable.

:::note

- Requires `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setOneOffCLBalanceDecreaseBPLimit(uint256 _oneOffCLBalanceDecreaseBPLimit)
```

#### Arguments

- **`_oneOffCLBalanceDecreaseBPLimit`** — new value for `LimitsList.oneOffCLBalanceDecreaseBPLimit`

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

### setMaxExitRequestsPerOracleReport()

Sets the new value for the `LimitsList.maxValidatorExitRequestsPerReport`.

:::note

- Requires `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.

:::

```solidity
function setMaxExitRequestsPerOracleReport(uint256 _maxValidatorExitRequestsPerReport)
```

#### Arguments

- **`_maxValidatorExitRequestsPerReport`** — new value for `LimitsList.maxValidatorExitRequestsPerReport`

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

- **`_requestTimestampMargin`** — new new value for `LimitsList.requestTimestampMargin`

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

- **`_secondOpinionOracle`** — new value for Second Opinion Oracle
- **`_clBalanceOraclesErrorUpperBPLimit`** — new value for `LimitsList.clBalanceOraclesErrorUpperBPLimit`

### setInitialSlashingAndPenaltiesAmount()

Sets the new value for the `LimitsList.initialSlashingAmountPWei` and `LimitsList.inactivityPenaltiesAmountPWei` variable.

:::note

- Requires `INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE` to be granted to the caller.
- Reverts with `IncorrectLimitValue()` error when the passed value is out of the allowed range.
  See [Limits List](#limits-list) section for details.
:::

```solidity
function setInitialSlashingAndPenaltiesAmount(uint256 _initialSlashingAmountPWei, uint256 _inactivityPenaltiesAmountPWei)
```

#### Arguments

- **`_initialSlashingAmountPWei`** — new value for `LimitsList.initialSlashingAmountPWei`
- **`_inactivityPenaltiesAmountPWei`** — new value for `LimitsList.inactivityPenaltiesAmountPWei`

## Permissions

### ALL_LIMITS_MANAGER_ROLE()

```solidity
bytes32 public constant ALL_LIMITS_MANAGER_ROLE = keccak256("ALL_LIMITS_MANAGER_ROLE")
```

Granting this role allows updating **ANY** value of the Limits List.
See [`setOracleReportLimits()`](#setoraclereportlimits) method.

**Grant this role with caution and give preference to the granular roles described below.**

### EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `exitedValidatorsPerDayLimit` value of the [Limits List](#limits-list).
See the [`setExitedValidatorsPerDayLimit()`](#setExitedValidatorsPerDayLimit) method.

```solidity
bytes32 public constant EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("EXITED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE");
```

### APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `appearedValidatorsPerDayLimit` value of the [Limits List](#limits-list).
See the [`setAppearedValidatorsPerDayLimit()`](#setAppearedValidatorsPerDayLimit) method.

```solidity
bytes32 public constant APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("APPEARED_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE");
```

### ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `annualBalanceIncreaseBPLimit` value of the [Limits List](#limits-list).
See the [`setOneOffCLBalanceDecreaseBPLimit()`](#setoneoffclbalancedecreasebplimit) method.

```solidity
bytes32 public constant ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE =
    keccak256("ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE")
```

### ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE()

Granting this role allows updating the `oneOffCLBalanceDecreaseBPLimit` value of the [Limits List](#limits-list).
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

### MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE()

Granting this role allows updating the `maxValidatorExitRequestsPerReport` value of the [Limits List](#limits-list).
See the [`setMaxExitRequestsPerOracleReport()`](#setmaxexitrequestsperoraclereport) method.

```solidity
bytes32 public constant MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE =
    keccak256("MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE")
```

### MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE()

Granting this role allows updating the `maxItemsPerExtraDataTransaction` value of the [Limits List](#limits-list).
See the [`setMaxItemsPerExtraDataTransaction()`](#setMaxItemsPerExtraDataTransaction) method.

```solidity
bytes32 public constant MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE =
    keccak256("MAX_ITEMS_PER_EXTRA_DATA_TRANSACTION_ROLE");
```

### MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_ROLE()

Granting this role allows updating the `maxNodeOperatorsPerExtraDataItem` value of the [Limits List](#limits-list).
See the [`setMaxNodeOperatorsPerExtraDataItem()`](#setMaxNodeOperatorsPerExtraDataItem) method.

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

### INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE

Granting this role allows updating the `initialSlashingAmountPWei` and `inactivityPenaltiesAmountPWei` values of the [Limits List](#limits-list).
See the [`setInitialSlashingAndPenaltiesAmount()`](#setinitialslashingandpenaltiesamount) method.

```solidity
bytes32 public constant INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE =
    keccak256("INITIAL_SLASHING_AND_PENALTIES_MANAGER_ROLE")
```

## Events

### ExitedValidatorsPerDayLimitSet()

Emits whenever the value of the `LimitsList.exitedValidatorsPerDayLimit` value is changed.

```solidity
event ExitedValidatorsPerDayLimitSet(uint256 exitedValidatorsPerDayLimit);
```

#### Arguments

- **`exitedValidatorsPerDayLimit`** — new value of the `LimitsList.exitedValidatorsPerDayLimit`

### AppearedValidatorsPerDayLimitSet()

Emits whenever the value of the `LimitsList.appearedValidatorsPerDayLimit` value is changed.

```solidity
event AppearedValidatorsPerDayLimitSet(uint256 appearedValidatorsPerDayLimit);
```

#### Arguments

- **`appearedValidatorsPerDayLimit`** — new value of the `LimitsList.appearedValidatorsPerDayLimit`

### OneOffCLBalanceDecreaseBPLimitSet()

Emits whenever the value of the `LimitsList.oneOffCLBalanceDecreaseBPLimit` value is changed.

```solidity
event OneOffCLBalanceDecreaseBPLimitSet(uint256 oneOffCLBalanceDecreaseBPLimit);
```

#### Arguments

- **`oneOffCLBalanceDecreaseBPLimit`** — new value of the `LimitsList.oneOffCLBalanceDecreaseBPLimit`

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

- **`annualBalanceIncreaseBPLimit`** — new value of the `LimitsList.simulatedShareRateDeviationBPLimit`

### MaxPositiveTokenRebaseSet()

Emits whenever the value of the `LimitsList.maxPositiveTokenRebase` value is changed.

```solidity
event MaxPositiveTokenRebaseSet(uint256 maxPositiveTokenRebase);
```

#### Arguments

- **`annualBalanceIncreaseBPLimit`** — new value of the `LimitsList.maxPositiveTokenRebase`

### MaxValidatorExitRequestsPerReportSet()

Emits whenever the value of the `LimitsList.maxValidatorExitRequestsPerReport` value is changed.

```solidity
event MaxValidatorExitRequestsPerReportSet(uint256 maxValidatorExitRequestsPerReport);
```

#### Arguments

- **`maxValidatorExitRequestsPerReport`** — new value of the `LimitsList.maxValidatorExitRequestsPerReport`

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

### InitialSlashingAmountSet()

Emits whenever the value of the `LimitsList.initialSlashingAmountPWei` value is changed.

```solidity
event InitialSlashingAmountSet(uint256 initialSlashingAmountPWei);
```

#### Arguments

- **`initialSlashingAmountPWei`** — new value of the `LimitsList.initialSlashingAmountPWei`

### InactivityPenaltiesAmountSet()

Emits whenever the value of the `LimitsList.InactivityPenaltiesAmountSet` value is changed.

```solidity
event InactivityPenaltiesAmountSet(uint256 inactivityPenaltiesAmountPWei);
```

#### Arguments

- **`inactivityPenaltiesAmountPWei`** — new value of the `LimitsList.inactivityPenaltiesAmountPWei`

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
- **`clBalanceWei`** — the total Consensus Layer balance.
- **`withdrawalVaultBalance`** — balance of the withdrawal vault.

### NegativeCLRebaseAccepted()

Emits whenever the checkAccountingOracleReport() finished with negative CL rebase check successfully without checking the Second Opinion Oracle.

```solidity
event NegativeCLRebaseAccepted(uint256 refSlot, uint256 clTotalBalance, uint256 clBalanceDecrease, uint256 maxAllowedCLRebaseNegativeSum);
```

#### Arguments

- **`refSlot`** — the reference slot for the report checked.
- **`clTotalBalance`** — the total Consensus Layer balance.
- **`clBalanceDecrease`** — the decrease of Consensus Layer balance during report.
- **`maxAllowedCLRebaseNegativeSum`** — the maximul accepted negative rebase balance change without second opinion.
