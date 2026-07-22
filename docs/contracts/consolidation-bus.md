# ConsolidationBus

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationBus.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

## What is ConsolidationBus

ConsolidationBus is a message bus for [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) consolidation requests that decouples request submission from execution and fee payment. The flow is two-step:

1. A registered publisher (`PUBLISH_ROLE`) publishes a batch of consolidation groups via `addConsolidationRequests`. The batch is validated and stored as a hash — no fee is paid at this stage.
2. After the configured execution delay has elapsed, anyone can call `executeConsolidation` (permissionless) supplying the matching groups and the required ETH fee. The bus recomputes the batch hash, verifies the delay, and forwards the batch to the [ConsolidationGateway](/contracts/consolidation-gateway), passing the executor (`msg.sender`) as the fee refund recipient.

This separation allows requests to be published by a trusted party while the fee is paid by an independent executor.

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## State Variables
### PUBKEY_LENGTH

```solidity
uint256 internal constant PUBKEY_LENGTH = 48
```


### MANAGE_ROLE

```solidity
bytes32 public constant MANAGE_ROLE = keccak256("MANAGE_ROLE")
```


### PUBLISH_ROLE

```solidity
bytes32 public constant PUBLISH_ROLE = keccak256("PUBLISH_ROLE")
```


### REMOVE_ROLE

```solidity
bytes32 public constant REMOVE_ROLE = keccak256("REMOVE_ROLE")
```


### CONSOLIDATION_GATEWAY

```solidity
IConsolidationGateway internal immutable CONSOLIDATION_GATEWAY
```


### _batchSize

```solidity
uint256 internal _batchSize
```


### _maxGroupsInBatch

```solidity
uint256 internal _maxGroupsInBatch
```


### _executionDelay

```solidity
uint256 internal _executionDelay
```


### _pendingBatches

```solidity
mapping(bytes32 batchHash => BatchInfo info) internal _pendingBatches
```


## Functions
### constructor


```solidity
constructor(address consolidationGateway) ;
```

### initialize

Initializes the contract.

Proxy initialization method.


```solidity
function initialize(
    address admin,
    uint256 initialBatchSize,
    uint256 initialMaxGroupsInBatch,
    uint256 initialExecutionDelay
) external initializer;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`admin`|`address`|Lido DAO Aragon agent contract address.|
|`initialBatchSize`|`uint256`||
|`initialMaxGroupsInBatch`|`uint256`||
|`initialExecutionDelay`|`uint256`||


### setBatchSize

Sets the maximum batch size limit

Reverts if caller does not have MANAGE_ROLE


```solidity
function setBatchSize(uint256 limit) external onlyRole(MANAGE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`limit`|`uint256`|New batch size limit|


### setMaxGroupsInBatch

Sets the maximum number of groups allowed in a batch

Reverts if caller does not have MANAGE_ROLE


```solidity
function setMaxGroupsInBatch(uint256 limit) external onlyRole(MANAGE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`limit`|`uint256`|New max groups in batch limit|


### setExecutionDelay

Sets the execution delay in seconds between adding and executing a batch

Reverts if caller does not have MANAGE_ROLE

The execution delay is not snapshotted per batch
Changes to this parameter apply retroactively to all pending batches
MANAGE_ROLE holders are trusted


```solidity
function setExecutionDelay(uint256 delay) external onlyRole(MANAGE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`delay`|`uint256`|New execution delay in seconds (0 means no delay)|


### removeBatches

Removes batches from the queue

Reverts if caller does not have REMOVE_ROLE

Reverts if batchHashes is empty

Reverts if any batch is not found or already executed


```solidity
function removeBatches(bytes32[] calldata batchHashes) external onlyRole(REMOVE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHashes`|`bytes32[]`|Array of batch hashes to remove|


### batchSize

Returns the current batch size limit


```solidity
function batchSize() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Current maximum batch size|


### maxGroupsInBatch

Returns the maximum number of groups allowed in a batch


```solidity
function maxGroupsInBatch() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Current max groups in batch limit|


### executionDelay

Returns the current execution delay in seconds


```solidity
function executionDelay() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Current execution delay|


### getConsolidationGateway

Returns the address of the ConsolidationGateway


```solidity
function getConsolidationGateway() external view returns (address);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|Address of the ConsolidationGateway contract|


### getBatchInfo

Returns the batch info for a pending batch


```solidity
function getBatchInfo(bytes32 batchHash) external view returns (BatchInfo memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHash`|`bytes32`|Hash of the batch to check|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`BatchInfo`|Batch info struct with publisher address and addedAt timestamp (zero values if batch is not in queue)|


### addConsolidationRequests

Adds grouped consolidation requests to the queue

The same batch can be submitted again after it has been executed.

Reverts if:
- Caller does not have PUBLISH_ROLE
- Batch is empty
- Any group is empty
- Total batch size exceeds limit
- Any source or target pubkey length is not 48 bytes
- Any source pubkey equals its corresponding target pubkey
- Batch already exists


```solidity
function addConsolidationRequests(ConsolidationGroup[] calldata groups) external onlyRole(PUBLISH_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groups`|`ConsolidationGroup[]`|Array of consolidation groups, where each group contains source pubkeys and a target pubkey|


### executeConsolidation

Executes a batch of grouped consolidation requests

Forwards the batch to ConsolidationGateway with msg.value as fee

Reverts if:
- Batch was not added or was already executed/removed


```solidity
function executeConsolidation(IConsolidationGateway.ConsolidationWitnessGroup[] calldata groups) external payable;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groups`|`IConsolidationGateway.ConsolidationWitnessGroup[]`|Array of consolidation witness groups, each containing source pubkeys and a target validator witness|


### _setBatchSize


```solidity
function _setBatchSize(uint256 limit) internal;
```

### _setMaxGroupsInBatch


```solidity
function _setMaxGroupsInBatch(uint256 limit) internal;
```

### _setExecutionDelay


```solidity
function _setExecutionDelay(uint256 delay) internal;
```

## Events
### BatchLimitUpdated
Emitted when the batch size limit is updated


```solidity
event BatchLimitUpdated(uint256 newLimit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newLimit`|`uint256`|New batch size limit|

### MaxGroupsInBatchUpdated
Emitted when the max groups in batch limit is updated


```solidity
event MaxGroupsInBatchUpdated(uint256 newLimit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newLimit`|`uint256`|New max groups in batch limit|

### RequestsAdded
Emitted when consolidation requests are added


```solidity
event RequestsAdded(address indexed publisher, bytes batchData);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`publisher`|`address`|Address of the publisher who added the requests|
|`batchData`|`bytes`|Encoded batch data (abi.encode(groups))|

### RequestsExecuted
Emitted when consolidation requests are executed


```solidity
event RequestsExecuted(bytes32 indexed batchHash, uint256 feePaid);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHash`|`bytes32`|Hash of the executed batch|
|`feePaid`|`uint256`|Amount of ETH paid for the execution|

### BatchesRemoved
Emitted when batches are removed


```solidity
event BatchesRemoved(bytes32[] batchHashes);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHashes`|`bytes32[]`|Array of removed batch hashes|

### ExecutionDelayUpdated
Emitted when the execution delay is updated


```solidity
event ExecutionDelayUpdated(uint256 newDelay);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newDelay`|`uint256`|New execution delay in seconds|

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

### EmptyBatch
Thrown when batch is empty


```solidity
error EmptyBatch();
```

### EmptyBatchHashes
Thrown when attempting to remove an empty list of batch hashes


```solidity
error EmptyBatchHashes();
```

### EmptyGroup
Thrown when a source group has zero elements


```solidity
error EmptyGroup(uint256 groupIndex);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupIndex`|`uint256`|Index of the empty group|

### BatchTooLarge
Thrown when batch size exceeds the limit


```solidity
error BatchTooLarge(uint256 size, uint256 limit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`size`|`uint256`|Actual batch size|
|`limit`|`uint256`|Maximum allowed batch size|

### TooManyGroups
Thrown when the number of groups in a batch exceeds the limit


```solidity
error TooManyGroups(uint256 groupsCount, uint256 limit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupsCount`|`uint256`|Actual number of groups|
|`limit`|`uint256`|Maximum allowed number of groups|

### MaxGroupsExceedsBatchSize
Thrown when maxGroupsInBatch exceeds batchSize


```solidity
error MaxGroupsExceedsBatchSize(uint256 maxGroupsInBatch, uint256 batchSizeLimit);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxGroupsInBatch`|`uint256`|The max groups in batch value|
|`batchSizeLimit`|`uint256`|The batch size limit value|

### BatchAlreadyPending
Thrown when attempting to add a batch that is already pending execution


```solidity
error BatchAlreadyPending(bytes32 batchHash);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHash`|`bytes32`|Hash of the batch that already exists in the pending queue|

### BatchNotFound
Thrown when batch is not found in storage


```solidity
error BatchNotFound(bytes32 batchHash);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`batchHash`|`bytes32`|Hash of the missing batch|

### SourceEqualsTarget
Thrown when source and target pubkeys are the same


```solidity
error SourceEqualsTarget(uint256 groupIndex, uint256 sourceIndex);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupIndex`|`uint256`|Index of the invalid group in the batch|
|`sourceIndex`|`uint256`|Index of the invalid source key in the batch|

### InvalidTargetPubkeyLength
Thrown when target pubkey length is invalid


```solidity
error InvalidTargetPubkeyLength(uint256 groupIndex, uint256 length);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupIndex`|`uint256`|Index of the group with invalid target pubkey|
|`length`|`uint256`|Actual pubkey length in bytes|

### InvalidSourcePubkeyLength
Thrown when source pubkey length is invalid


```solidity
error InvalidSourcePubkeyLength(uint256 groupIndex, uint256 sourceIndex, uint256 length);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`groupIndex`|`uint256`|Index of the group with invalid source pubkey|
|`sourceIndex`|`uint256`|Index of the source pubkey inside the group|
|`length`|`uint256`|Actual pubkey length in bytes|

### ExecutionDelayNotPassed
Thrown when attempting to execute a batch before the execution delay has passed


```solidity
error ExecutionDelayNotPassed(uint256 currentTime, uint256 executeAfter);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`currentTime`|`uint256`|Current block timestamp|
|`executeAfter`|`uint256`|Earliest timestamp at which the batch can be executed|

## Structs
### ConsolidationGroup

```solidity
struct ConsolidationGroup {
    bytes[] sourcePubkeys;
    bytes targetPubkey;
}
```

### BatchInfo

```solidity
struct BatchInfo {
    address publisher;
    uint64 addedAt;
}
```
