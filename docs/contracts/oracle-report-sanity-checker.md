# OracleReportSanityChecker

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol)
- [Deployed contract](https://etherscan.io/address/0x9305c1Dbfe22c12c66339184C0025d7006f0f1cC)

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
Below is a detailed description of the limits contained in the `LimitsList` struct:

- **`uint256 churnValidatorsPerDayLimit` ∈ [0, 65535]** - the max possible number of validators that might been reported as _**appeared**_
  or _**exited**_ during a single day. [`AccountingOracle`](./accounting-oracle.md) reports validators as _**appeared**_ once them become
  _**pending**_ (might be not _**activated**_ yet). Thus, this limit should be high enough for such cases because Consensus Layer has no
  intrinsic churn limit for the amount of _**pending**_ validators (only for _**activated**_ instead).
  For Lido it's limited by the max daily deposits via [`DepositSecurityModule`](./deposit-security-module.md). In contrast, _**exited**_ are reported according to the
  [Consensus Layer churn limit](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#get_validator_churn_limit).
- **`uint256 oneOffCLBalanceDecreaseBPLimit` ∈ [0, 10000]** - the max decrease of the total validators' balances on the Consensus Layer since
  the previous oracle report. Represented in the Basis Points (100% == 10000).
- **`uint256 annualBalanceIncreaseBPLimit` ∈ [0, 10000]** - the max annual increase of the total validators' balances on the Consensus Layer
  since the previous oracle report. Represented in the Basis Points (100% == 10000).
- **`uint256 simulatedShareRateDeviationBPLimit` ∈ [0, 10000]** - the max deviation of the provided `simulatedShareRate` and the actual one within the
  currently processing oracle report. Represented in the Basis Points (100% == 10000).
- **`uint256 maxValidatorExitRequestsPerReport` ∈ [0, 65535]** - the max number of exit requests allowed in report
  to [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md)
- **`uint256 maxAccountingExtraDataListItemsCount` ∈ [0, 65535]** - the max number of data list items reported to accounting oracle in extra data
- **`uint256 maxNodeOperatorsPerExtraDataItemCount` ∈ [0, 65535]** - the max number of node operators reported per extra data list item
- **`uint256 requestTimestampMargin` ∈ [0, type(uint64).max]** - the min time required to be passed from the creation of the request to be finalized till the time of the oracle report
- **`uint256 maxPositiveTokenRebase` ∈ [1, type(uint64).max]** - the max positive token rebase allowed per single oracle report token rebase
  happens on total supply adjustment, huge positive rebase can incur oracle report sandwiching.
  Uses 1e9 precision, e.g.: 1e6 - 0.1%; 1e9 - 100%; type(uint64).max - unlimited rebase.

## Sanity Checks

### `smoothenTokenRebase()`

#### Arguments

- **`uint256 _preTotalPooledEther`** - total amount of ETH controlled by the protocol
- **`uint256 _preTotalShares`** - total amount of minted stETH shares
- **`uint256 _preCLBalance`** - sum of all Lido validators' balances on the Consensus Layer before the current oracle report
- **`uint256 _postCLBalance`** - sum of all Lido validators' balances on the Consensus Layer after the current oracle report
- **`uint256 _withdrawalVaultBalance`** - withdrawal vault balance on Execution Layer for the report calculation moment
- **`uint256 _elRewardsVaultBalance`** - elRewards vault balance on Execution Layer for the report calculation moment
- **`uint256 _sharesRequestedToBurn`** - shares requested to burn through Burner for the report calculation moment
- **`uint256 _etherToLockForWithdrawals`** - ether to lock on withdrawals queue contract
- **`uint256 _newSharesToBurnForWithdrawals`** - new shares to burn due to withdrawal request finalization

#### Returns

- **`uint256 withdrawals`** - ETH amount allowed to be taken from the withdrawals vault
- **`uint256 elRewards`** - ETH amount allowed to be taken from the EL rewards vault
- **`uint256 simulatedSharesToBurn`** - simulated amount of shares to be burnt (if no ether locked on withdrawals)
- **`uint256 sharesToBurn`** - amount of shares to be burnt (accounting for withdrawals finalization)

Evaluates the allowed ETH amount that might be taken from the withdrawal vault and EL rewards vault during Lido's oracle report processing

### `checkAccountingOracleReport()`

#### Arguments

- **`uint256 _timeElapsed`** - time elapsed since the previous oracle report
- **`uint256 _preCLBalance`** - sum of all Lido validators' balances on the Consensus Layer before the current oracle report
  (NB: also include the initial balance of newly appeared validators)
- **`uint256 _postCLBalance`** - sum of all Lido validators' balances on the Consensus Layer after the current oracle report
- **`uint256 _withdrawalVaultBalance`** - withdrawal vault balance on Execution Layer for the report reference slot
- **`uint256 _elRewardsVaultBalance`** - el rewards vault balance on Execution Layer for the report reference slot
- **`uint256 _sharesRequestedToBurn`** - shares requested to burn for the report reference slot
- **`uint256 _preCLValidators`** - Lido-participating validators on the CL side before the current oracle report
- **`uint256 _postCLValidators`** - Lido-participating validators on the CL side after the current oracle report

Applies sanity checks to the accounting parameters of Lido's Oracle report. Below is the list of restrictions
checked by the method execution:

- Revert with `IncorrectWithdrawalsVaultBalance(uint256 actualWithdrawalVaultBalance)` error when the reported withdrawals
  vault balance is greater than the actual balance of the withdrawal vault.
- Revert with `IncorrectELRewardsVaultBalance(uint256 actualELRewardsVaultBalance)` error when reported EL rewards vault
  balance is greater than the actual balance of EL rewards vault.
- Revert with `IncorrectSharesRequestedToBurn(uint256 actualSharesToBurn)` error when the amount of stETH shares requested
  to burn exceeds the number of shares marked to be burned in the Burner contract.
- Revert with `IncorrectCLBalanceDecrease(uint256 oneOffCLBalanceDecreaseBP)` error when Consensus Layer one-off balance
  decrease in basis points exceeds the allowed `LimitsList.oneOffCLBalanceDecreaseBPLimit`.
- Revert with `IncorrectCLBalanceIncrease(uint256 annualBalanceDiff)` error when Consensus Layer annual balance increase
  expressed in basis points exceeds allowed `LimitsList.annualBalanceIncreaseBPLimit`.
- Revert with `IncorrectAppearedValidators(uint256 churnLimit)` error when the number of appeared validators exceeds
  the limit set by `LimitsList.churnValidatorsPerDayLimit`.

### `checkExitBusOracleReport()`

#### Arguments

- **`uint256 _exitRequestsCount`** - number of validator exit requests supplied per oracle report

Validates that number of exit requests does not exceed the limit set by `LimitsList.maxValidatorExitRequestsPerReport`.
Reverts with `IncorrectNumberOfExitRequestsPerReport(uint256 maxRequestsCount)` error in other cases.

### `checkExitedValidatorsRatePerDay()`

#### Arguments

- **`uint256 _exitedValidatorsCount`** - number of validator exit requests supplied per oracle report

Validates that number of exited validators does not exceed the limit set by `LimitsList.churnValidatorsPerDayLimit`.
Reverts with `ExitedValidatorsLimitExceeded(uint256 limitPerDay, uint256 exitedPerDay)` error in other cases.

### `checkNodeOperatorsPerExtraDataItemCount()`

#### Arguments

- **`uint256 _itemIndex`** - index of item in extra data
- **`uint256 _nodeOperatorsCount`** - number of validator exit requests supplied per oracle report

Validates that number of node operators reported per extra data item does not exceed the limit
set by `LimitsList.maxNodeOperatorsPerExtraDataItemCount`.
Reverts with `TooManyNodeOpsPerExtraDataItem(uint256 itemIndex, uint256 nodeOpsCount)` error in other cases.

### `checkAccountingExtraDataListItemsCount()`

#### Arguments

- **`uint256 _extraDataListItemsCount`** - number of validator exit requests supplied per oracle report

Validates that number of extra data items in the report does not exceed the limit
set by `LimitsList.maxAccountingExtraDataListItemsCount`.
Reverts with `MaxAccountingExtraDataItemsCountExceeded(uint256 maxItemsCount, uint256 receivedItemsCount)` error in other cases.

### `checkWithdrawalQueueOracleReport()`

#### Arguments

- **`uint256 _lastFinalizableRequestId`** - last finalizable withdrawal request id
- **`uint256 _reportTimestamp`** - timestamp when the originated oracle report was submitted

Validates that withdrawal request with the passed \_lastFinalizableRequestId was created more
than `LimitsList.requestTimestampMargin` seconds ago.
Reverts with `IncorrectRequestFinalization(uint256 requestCreationBlock)` error in other cases.

### `checkSimulatedShareRate()`

#### Arguments

- **`uint256 _postTotalPooledEther`** - total pooled ether after report applied
- **`uint256 _postTotalShares`** - total shares after report applied
- **`uint256 _etherLockedOnWithdrawalQueue`** - ether locked on withdrawal queue for the current oracle report
- **`uint256 _sharesBurntDueToWithdrawals`** - shares burnt due to withdrawals finalization
- **`uint256 _simulatedShareRate`** - share rate provided with the oracle report (simulated via off-chain "eth_call")

Applies sanity checks to the simulated share rate for withdrawal requests finalization.
Reverts with `IncorrectSimulatedShareRate(uint256 simulatedShareRate, uint256 actualShareRate)` error
when simulated share rate deviation exceeds the limit set by `LimitsList.simulatedShareRateDeviationBPLimit`

## View Methods

### `getLidoLocator()`

Returns the address of the [LidoLocator](./lido-locator.md)

### `getOracleReportLimits()`

Returns the limits list used for the sanity checks as the [`LimitsList`](#limits-list) type.

### `getMaxPositiveTokenRebase()`

Returns max positive token rebase value with 1e9 precision (e.g.: 1e6 - 0.1%; 1e9 - 100%):

- zero value means uninitialized
- `type(uint64).max` means unlimited

Get max positive rebase allowed per single oracle report token rebase happens on total supply adjustment, huge positive rebase can incur oracle report sandwiching.

stETH balance for the `account` defined as:

    balanceOf(account) =
        shares[account] * totalPooledEther / totalShares = shares[account] * shareRate

Suppose shareRate changes when oracle reports (see `handleOracleReport`)
which means that token rebase happens:

    preShareRate = preTotalPooledEther() / preTotalShares()
    postShareRate = postTotalPooledEther() / postTotalShares()
    R = (postShareRate - preShareRate) / preShareRate

    R > 0 corresponds to the relative positive rebase value (i.e., instant APR)

## Permissions

### `ALL_LIMITS_MANAGER_ROLE()`

Granting this role allows updating **ANY** value of the Limits List.
See [`setOracleReportLimits()`](#setoraclereportlimits) method.

**Grant this role with caution and give preference to the granular roles described below.**

### `CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE()`

Granting this role allows updating the `churnValidatorsPerDayLimit` value of the [Limits List](#limits-list).
See the [`setChurnValidatorsPerDayLimit()`](#setchurnvalidatorsperdaylimit) method.

### `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE()`

Granting this role allows updating the `annualBalanceIncreaseBPLimit` value of the [Limits List](#limits-list).
See the [`setOneOffCLBalanceDecreaseBPLimit()`](#setoneoffclbalancedecreasebplimit) method.

### `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE()`

Granting this role allows updating the `oneOffCLBalanceDecreaseBPLimit` value of the [Limits List](#limits-list).
See the [`setAnnualBalanceIncreaseBPLimit()`](#setannualbalanceincreasebplimit) method.

### `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE()`

Granting this role allows updating the `simulatedShareRateDeviationBPLimit` value of the [Limits List](#limits-list).
See the [`setSimulatedShareRateDeviationBPLimit()`](#setsimulatedshareratedeviationbplimit) method.

### `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE()`

Granting this role allows updating the `maxValidatorExitRequestsPerReport` value of the [Limits List](#limits-list).
See the [`setMaxExitRequestsPerOracleReport()`](#setmaxexitrequestsperoraclereport) method.

### `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE()`

Granting this role allows updating the `maxAccountingExtraDataListItemsCount` value of the [Limits List](#limits-list).
See the [`setMaxAccountingExtraDataListItemsCount()`](#setmaxaccountingextradatalistitemscount) method.

### `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE()`

Granting this role allows updating the `maxNodeOperatorsPerExtraDataItemCount` value of the [Limits List](#limits-list).
See the [`setMaxNodeOperatorsPerExtraDataItemCount()`](#setmaxnodeoperatorsperextradataitemcount) method.

### `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE()`

Granting this role allows updating the `requestTimestampMargin` value of the [Limits List](#limits-list).
See the [`setRequestTimestampMargin()`](#setrequesttimestampmargin) method.

### `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE()`

Granting this role allows updating the `maxPositiveTokenRebase` value of the [Limits List](#limits-list).
See the [`setMaxPositiveTokenRebase()`](#setmaxpositivetokenrebase) method.

## Lever Methods

### `setOracleReportLimits()`

#### Arguments

- **`LimitsList _limitsList`** - new limits list values

Sets the new values for the limits list. Requires `ALL_LIMITS_MANAGER_ROLE` to be granted to the caller.

Reverts with **`IncorrectLimitValue(uint256 value, uint256 minAllowedValue, uint256 maxAllowedValue)`** error when some
value in the passed data out of the allowed range.
See details of allowed value boundaries in the [Limits List](#limits-list) section.

### `setChurnValidatorsPerDayLimit()`

#### Arguments

- **`uint256 _churnValidatorsPerDayLimit`** - new `LimitsList.churnValidatorsPerDayLimit` value

Sets the new value for the `LimitsList.churnValidatorsPerDayLimit`.
The limit is applicable for `appeared` and `exited` validators.
Requires `CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE` to be granted to the caller.

AccountingOracle reports validators as `appeared` once them become `pending`
(might be not `activated` yet). Thus, this limit should be high enough for such cases
because Consensus Layer has no intrinsic churn limit for the amount of `pending` validators
(only for `activated` instead). For Lido it's limited by the max daily deposits via `DepositSecurityModule`
In contrast, `exited` are reported according to the Consensus Layer churn limit.

Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setOneOffCLBalanceDecreaseBPLimit()`

#### Arguments

- **`uint256 _oneOffCLBalanceDecreaseBPLimit`** - new value for `LimitsList.oneOffCLBalanceDecreaseBPLimit`

Sets the new value for the `LimitsList.oneOffCLBalanceDecreaseBPLimit` variable.
Requires `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setAnnualBalanceIncreaseBPLimit()`

#### Arguments

- **`uint256 _annualBalanceIncreaseBPLimit`** - new value for `LimitsList.annualBalanceIncreaseBPLimit`

Sets the new value for the `LimitsList.annualBalanceIncreaseBPLimit` variable.
Requires `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setSimulatedShareRateDeviationBPLimit()`

#### Arguments

- **`uint256 _simulatedShareRateDeviationBPLimit`** - new value for `LimitsList.simulatedShareRateDeviationBPLimit`

Sets the new value for the `LimitsList.simulatedShareRateDeviationBPLimit` variable.
Requires `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setMaxExitRequestsPerOracleReport()`

#### Arguments

- **`uint256 _maxValidatorExitRequestsPerReport`** - new value for `LimitsList.maxValidatorExitRequestsPerReport`

Sets the new value for the `LimitsList.maxValidatorExitRequestsPerReport`.
Requires `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setRequestTimestampMargin()`

#### Arguments

- **`uint256 _requestTimestampMargin`** - new new value for `LimitsList.requestTimestampMargin`

Sets the new value for the `LimitsList.requestTimestampMargin` variable.
Requires `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setMaxPositiveTokenRebase()`

#### Arguments

- **`uint256 _maxPositiveTokenRebase`** - new value for `LimitsList.maxPositiveTokenRebase`

Sets the new value for the `LimitsList.maxPositiveTokenRebase` variable.
Requires `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setMaxAccountingExtraDataListItemsCount()`

#### Arguments

- **`uint256 _maxAccountingExtraDataListItemsCount`** - new value for `LimitsList.maxAccountingExtraDataListItemsCount`

Sets the new value for the `LimitsList.maxAccountingExtraDataListItemsCount` variable.
Requires `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.

### `setMaxNodeOperatorsPerExtraDataItemCount()`

#### Arguments

- **`uint256 _maxNodeOperatorsPerExtraDataItemCount`** - new value for `LimitsList.maxNodeOperatorsPerExtraDataItemCount`

Sets the new value for the `LimitsList.maxNodeOperatorsPerExtraDataItemCount` variable.
Requires `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE` to be granted to the caller.
Reverts with **`IncorrectLimitValue()`** error when the passed value is out of the allowed range.
See [Limits List](#limits-list) section for details.
