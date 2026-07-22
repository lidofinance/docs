# ConsolidationGateway

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationGateway.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)


## What is ConsolidationGateway

ConsolidationGateway is the single entry point for all [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) validator consolidation requests in Lido Core. It proxies consolidation requests to the [WithdrawalVault](/contracts/withdrawal-vault), enforcing the following before a request is forwarded:

- the caller holds the `ADD_CONSOLIDATION_REQUEST_ROLE`;
- the target validator's withdrawal credentials are verified against the Lido `0x02` withdrawal credentials using on-chain Consensus Layer Merkle proofs (`CLProofVerifier`);
- the per-frame consolidation request limit is not exceeded;
- the protocol is operating normally — [DepositSecurityModule](/contracts/deposit-security-module) deposits are not paused, and Lido is neither stopped nor in bunker mode (`Lido.canDeposit()`);
- the supplied fee covers `requestsCount * WithdrawalVault.getConsolidationRequestFee()`. Any excess is refunded to the `refundRecipient`.

This contract is **not** behind a proxy. It inherits [AccessControlEnumerable](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/utils/access/AccessControlEnumerable.sol), `PausableUntil`, and `CLProofVerifier`.

:::note
This is the Lido Core consolidation gateway. For consolidations into stVaults, see [ValidatorConsolidationRequests](/contracts/validator-consolidation-requests).
:::

## State Variables
### PAUSE_ROLE
role that allows to pause the contract


```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE")
```


### RESUME_ROLE
role that allows to resume the contract


```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE")
```


### ADD_CONSOLIDATION_REQUEST_ROLE

```solidity
bytes32 public constant ADD_CONSOLIDATION_REQUEST_ROLE = keccak256("ADD_CONSOLIDATION_REQUEST_ROLE")
```


### EXIT_LIMIT_MANAGER_ROLE

```solidity
bytes32 public constant EXIT_LIMIT_MANAGER_ROLE = keccak256("EXIT_LIMIT_MANAGER_ROLE")
```


### CONSOLIDATION_LIMIT_POSITION

```solidity
bytes32 public constant CONSOLIDATION_LIMIT_POSITION =
    keccak256("lido.ConsolidationGateway.maxConsolidationRequestLimit")
```


### COMPOUNDING_PREFIX

```solidity
uint256 internal constant COMPOUNDING_PREFIX = uint256(0x02) << 248
```


### LOCATOR

```solidity
ILidoLocator internal immutable LOCATOR
```


## Functions
### preservesEthBalance

Ensures the contract's ETH balance is unchanged.


```solidity
modifier preservesEthBalance() ;
```

### constructor


```solidity
constructor(
    address admin,
    address lidoLocator,
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec,
    GIndex _gIFirstValidatorPrev,
    GIndex _gIFirstValidatorCurr,
    uint64 _pivotSlot
) CLProofVerifier(_gIFirstValidatorPrev, _gIFirstValidatorCurr, _pivotSlot);
```

### resume

Resume the contract

Reverts if contract is not paused

Reverts if sender has no `RESUME_ROLE`


```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause the contract for a specified period

Reverts if contract is already paused

Reverts if sender has no `PAUSE_ROLE`

Reverts if zero duration is passed


```solidity
function pauseFor(uint256 _duration) external onlyRole(PAUSE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_duration`|`uint256`|pause duration in seconds (use `PAUSE_INFINITELY` for unlimited)|


### pauseUntil

Pause the contract until a specified timestamp

Reverts if the timestamp is in the past

Reverts if sender has no `PAUSE_ROLE`

Reverts if contract is already paused


```solidity
function pauseUntil(uint256 _pauseUntilInclusive) external onlyRole(PAUSE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_pauseUntilInclusive`|`uint256`|the last second to pause until inclusive|


### addConsolidationRequests

Reverts if:
- The caller does not have the `ADD_CONSOLIDATION_REQUEST_ROLE`
- The total fee value sent is insufficient to cover all provided consolidation requests.
- There is not enough limit quota left in the current frame to process all requests.

Submits grouped Consolidation Requests to the Withdrawal Vault.
Each group represents multiple source validators consolidating into a single target.


```solidity
function addConsolidationRequests(ConsolidationWitnessGroup[] calldata groups, address refundRecipient)
    external
    payable
    onlyRole(ADD_CONSOLIDATION_REQUEST_ROLE)
    preservesEthBalance
    whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groups`|`ConsolidationWitnessGroup[]`|An array of consolidation groups, where each group contains source public keys and a target validator witness with a CL proof of withdrawal credentials.|
|`refundRecipient`|`address`|The address that will receive any excess ETH sent for fees.|


### setConsolidationRequestLimit

Sets the maximum request limit and the frame during which a portion of the limit can be restored.


```solidity
function setConsolidationRequestLimit(
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec
) external onlyRole(EXIT_LIMIT_MANAGER_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxConsolidationRequestsLimit`|`uint256`|The maximum number of consolidation requests.|
|`consolidationsPerFrame`|`uint256`|The number of consolidations that can be restored per frame.|
|`frameDurationInSec`|`uint256`|The duration of each frame, in seconds, after which `consolidationsPerFrame` consolidations can be restored.|


### getConsolidationRequestLimitFullInfo

Returns information about current limits data


```solidity
function getConsolidationRequestLimitFullInfo()
    external
    view
    returns (
        uint256 maxConsolidationRequestsLimit,
        uint256 consolidationsPerFrame,
        uint256 frameDurationInSec,
        uint256 prevConsolidationRequestsLimit,
        uint256 currentConsolidationRequestsLimit
    );
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`maxConsolidationRequestsLimit`|`uint256`|Maximum consolidation requests limit|
|`consolidationsPerFrame`|`uint256`|The number of consolidations that can be restored per frame.|
|`frameDurationInSec`|`uint256`|The duration of each frame, in seconds, after which `consolidationsPerFrame` consolidations can be restored.|
|`prevConsolidationRequestsLimit`|`uint256`|Limit left after previous requests|
|`currentConsolidationRequestsLimit`|`uint256`|Current consolidation requests limit|


### _checkConsolidationPreconditions

Internal functions


```solidity
function _checkConsolidationPreconditions() internal view;
```

### _checkFee


```solidity
function _checkFee(uint256 fee) internal view returns (uint256 refund);
```

### _refundFee


```solidity
function _refundFee(uint256 refund, address recipient) internal;
```

### _getTimestamp


```solidity
function _getTimestamp() internal view virtual returns (uint256);
```

### _setConsolidationRequestLimit


```solidity
function _setConsolidationRequestLimit(
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec
) internal;
```

### _consumeConsolidationRequestLimit


```solidity
function _consumeConsolidationRequestLimit(uint256 requestsCount) internal;
```

### _prepareConsolidationPairs

Flattens grouped source pubkeys and repeats each group's target pubkey.


```solidity
function _prepareConsolidationPairs(ConsolidationWitnessGroup[] calldata groups, uint256 totalCount)
    internal
    pure
    returns (bytes[] memory sourcePubkeys, bytes[] memory targetPubkeys);
```

### _getWithdrawalVaultData

Returns the withdrawal vault and its 0x02 withdrawal credentials.


```solidity
function _getWithdrawalVaultData()
    internal
    view
    returns (IWithdrawalVault withdrawalVault, bytes32 withdrawalCredentials);
```

## Events
### ConsolidationRequestsLimitSet
Emitted when limits configs are set.


```solidity
event ConsolidationRequestsLimitSet(
    uint256 maxConsolidationRequestsLimit, uint256 consolidationsPerFrame, uint256 frameDurationInSec
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxConsolidationRequestsLimit`|`uint256`|The maximum number of consolidation requests.|
|`consolidationsPerFrame`|`uint256`|The number of consolidations that can be restored per frame.|
|`frameDurationInSec`|`uint256`|The duration of each frame, in seconds, after which `consolidationsPerFrame` consolidations can be restored.|

## Errors
### ZeroArgument
Thrown when an invalid zero value is passed


```solidity
error ZeroArgument(string name);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`name`|`string`|Name of the argument that was zero|

### AdminCannotBeZero
Thrown when attempting to set the admin address to zero


```solidity
error AdminCannotBeZero();
```

### InsufficientFee
Thrown when a consolidation fee is insufficient


```solidity
error InsufficientFee(uint256 feeRequired, uint256 passedValue);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`feeRequired`|`uint256`|Amount of fee required to cover consolidation request|
|`passedValue`|`uint256`|Amount of fee sent to cover consolidation request|

### FeeRefundFailed
Thrown when a consolidation fee refund failed


```solidity
error FeeRefundFailed();
```

### ConsolidationRequestsLimitExceeded
Thrown when remaining consolidation requests limit is not enough to cover sender requests


```solidity
error ConsolidationRequestsLimitExceeded(uint256 requestsCount, uint256 remainingLimit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`requestsCount`|`uint256`|Amount of requests that were sent for processing|
|`remainingLimit`|`uint256`|Amount of requests that still can be processed at current frame|

### EmptyGroup
Thrown when a source group has zero elements


```solidity
error EmptyGroup(uint256 groupIndex);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupIndex`|`uint256`|Index of the empty group|

### DSMDepositsPaused
Thrown when DSM deposits are paused


```solidity
error DSMDepositsPaused();
```

### LidoDepositsPaused
Thrown when Lido deposits are paused (Lido stopped or bunker mode)


```solidity
error LidoDepositsPaused();
```

## Structs
### ConsolidationWitnessGroup

```solidity
struct ConsolidationWitnessGroup {
    bytes[] sourcePubkeys;
    IPredepositGuarantee.ValidatorWitness targetWitness;
}
```

