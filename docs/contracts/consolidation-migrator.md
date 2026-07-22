# ConsolidationMigrator

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationMigrator.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)


## What is ConsolidationMigrator

ConsolidationMigrator is a temporary migration helper for moving validators from a fixed **source** staking module to a fixed **target** staking module. Both module IDs are immutable, set in the implementation constructor.

It validates consolidation requests submitted as key indices, resolves those indices to validator public keys through the source and target staking modules, and forwards the resulting groups to the [ConsolidationBus](/contracts/consolidation-bus). Pairs of (source operator, target operator) are managed through an allowlist driven by an [EasyTrack](https://dao.lido.fi/easy-track/motions) flow.

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## State Variables
### ALLOW_PAIR_ROLE

```solidity
bytes32 public constant ALLOW_PAIR_ROLE = keccak256("ALLOW_PAIR_ROLE")
```


### DISALLOW_PAIR_ROLE

```solidity
bytes32 public constant DISALLOW_PAIR_ROLE = keccak256("DISALLOW_PAIR_ROLE")
```


### PUBKEY_LENGTH

```solidity
uint256 public constant PUBKEY_LENGTH = 48
```


### STAKING_ROUTER

```solidity
IStakingRouter internal immutable STAKING_ROUTER
```


### CONSOLIDATION_BUS

```solidity
IConsolidationBus internal immutable CONSOLIDATION_BUS
```


### SOURCE_MODULE_ID

```solidity
uint256 internal immutable SOURCE_MODULE_ID
```


### TARGET_MODULE_ID

```solidity
uint256 internal immutable TARGET_MODULE_ID
```


### _allowedPairs
mapping(sourceOperatorId => set of allowed targetOperatorIds)


```solidity
mapping(uint256 => EnumerableSet.UintSet) internal _allowedPairs
```


### _submitters
mapping(sourceOperatorId => mapping(targetOperatorId => submitter address))


```solidity
mapping(uint256 => mapping(uint256 => address)) internal _submitters
```


## Functions
### constructor


```solidity
constructor(address stakingRouter, address consolidationBus, uint256 _sourceModuleId, uint256 _targetModuleId) ;
```

### initialize

Initializes the contract.

Proxy initialization method.


```solidity
function initialize(address admin) external initializer;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`admin`|`address`|Lido DAO Aragon agent contract address.|


### allowPair

Allows a consolidation pair (source operator -> target operator) with a designated submitter

Can be called multiple times to update the submitter for an existing pair

Reverts if caller does not have ALLOW_PAIR_ROLE or if submitter is zero address


```solidity
function allowPair(uint256 sourceOperatorId, uint256 targetOperatorId, address submitter)
    external
    onlyRole(ALLOW_PAIR_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator in source module|
|`targetOperatorId`|`uint256`|ID of the target operator in target module|
|`submitter`|`address`|Address authorized to submit consolidation batches for this pair|


### disallowPair

Disallows a consolidation pair and removes the submitter

Reverts if caller does not have DISALLOW_PAIR_ROLE


```solidity
function disallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external onlyRole(DISALLOW_PAIR_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|
|`targetOperatorId`|`uint256`|ID of the target operator|


### selfDisallowPair

Allows a submitter to disallow their own pair (permissionless)

Caller must be the designated submitter for the pair

Reverts if caller is not the submitter


```solidity
function selfDisallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|
|`targetOperatorId`|`uint256`|ID of the target operator|


### isPairAllowed

Checks if a consolidation pair is allowed


```solidity
function isPairAllowed(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|
|`targetOperatorId`|`uint256`|ID of the target operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|True if the pair is allowed|


### getAllowedTargets

Returns all allowed target operators for a given source operator


```solidity
function getAllowedTargets(uint256 sourceOperatorId) external view returns (uint256[] memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256[]`|Array of allowed target operator IDs|


### getSubmitter

Returns the submitter address for a consolidation pair


```solidity
function getSubmitter(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (address);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|
|`targetOperatorId`|`uint256`|ID of the target operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|Address authorized to submit consolidation batches, or address(0) if pair not allowed|


### getStakingRouter

Returns the StakingRouter address


```solidity
function getStakingRouter() external view returns (address);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|Address of the StakingRouter|


### getConsolidationBus

Returns the ConsolidationBus address


```solidity
function getConsolidationBus() external view returns (address);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|Address of the ConsolidationBus|


### sourceModuleId

Returns the source module ID this migrator is bound to


```solidity
function sourceModuleId() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Source module ID|


### targetModuleId

Returns the target module ID this migrator is bound to


```solidity
function targetModuleId() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Target module ID|


### submitConsolidationBatch

Submits a consolidation batch after validation

Caller must be the designated submitter for this pair (set via allowPair)

Forwards the validated batch to ConsolidationBus


```solidity
function submitConsolidationBatch(
    uint256 sourceOperatorId,
    uint256 targetOperatorId,
    ConsolidationIndexGroup[] calldata groups
) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sourceOperatorId`|`uint256`|ID of the source operator|
|`targetOperatorId`|`uint256`|ID of the target operator|
|`groups`|`ConsolidationIndexGroup[]`|Array of consolidation index groups, each containing source key indices and a target key index|


### _getValidatedConsolidationPubkeys

Validates consolidation key sets and returns corresponding pubkeys.
Ensures all referenced keys are deposited.


```solidity
function _getValidatedConsolidationPubkeys(
    uint256 sourceOperatorId,
    uint256 targetOperatorId,
    ConsolidationIndexGroup[] calldata groups
) internal view returns (IConsolidationBus.ConsolidationGroup[] memory pubkeyGroups);
```

### _validateAndExtractSourceKeys


```solidity
function _validateAndExtractSourceKeys(uint256 operatorId, uint256[] calldata keyIndices)
    internal
    view
    returns (bytes[] memory pubkeys);
```

### _validateAndExtractTargetKey


```solidity
function _validateAndExtractTargetKey(uint256 operatorId, uint256 keyIndex)
    internal
    view
    returns (bytes memory pubkey);
```

### _getModule


```solidity
function _getModule(uint256 moduleId) internal view returns (IUnifiedStakingModule);
```

### _getDepositedValidatorsCount


```solidity
function _getDepositedValidatorsCount(IUnifiedStakingModule module, uint256 operatorId)
    internal
    view
    returns (uint256 totalDeposited);
```

## Events
### ConsolidationPairAllowed

```solidity
event ConsolidationPairAllowed(
    uint256 indexed sourceOperatorId, uint256 indexed targetOperatorId, address indexed submitter
);
```

### ConsolidationPairDisallowed

```solidity
event ConsolidationPairDisallowed(
    uint256 indexed sourceOperatorId, uint256 indexed targetOperatorId, address indexed submitter
);
```

### ConsolidationSubmitted

```solidity
event ConsolidationSubmitted(
    uint256 indexed sourceOperatorId, uint256 indexed targetOperatorId, ConsolidationIndexGroup[] groups
);
```

## Errors
### ZeroArgument

```solidity
error ZeroArgument(string name);
```

### AdminCannotBeZero

```solidity
error AdminCannotBeZero();
```

### PairNotInAllowlist

```solidity
error PairNotInAllowlist(uint256 sourceOperatorId, uint256 targetOperatorId);
```

### KeyNotDeposited

```solidity
error KeyNotDeposited(uint256 moduleId, uint256 operatorId, uint256 keyIndex);
```

### NotAuthorized

```solidity
error NotAuthorized(address caller, uint256 sourceOperatorId, uint256 targetOperatorId);
```

## Structs
### ConsolidationIndexGroup

```solidity
struct ConsolidationIndexGroup {
    uint256[] sourceKeyIndices;
    uint256 targetKeyIndex;
}
```

