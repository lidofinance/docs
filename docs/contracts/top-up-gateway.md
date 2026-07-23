# TopUpGateway

- [Source code](https://github.com/lidofinance/core/blob/v3.1.0/contracts/0.8.25/TopUpGateway.sol)
- [Deployed contract](https://etherscan.io/address/0x3FC2C71579D80790Aaa3fc7Be8B66ac39dC57374)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

## What is TopUpGateway

TopUpGateway is the entry point for topping up `0x02`-type (compounding) Lido validators. For each validator it:

- verifies the validator container against the Consensus Layer state using Merkle proofs anchored to a beacon block root fetched via [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) (`CLValidatorVerifier`);
- computes a per-validator top-up limit from the configured target balance, the validator's effective balance, and its pending deposits;
- forwards the validated keys and limits to [StakingRouter.topUp](/contracts/staking-router).

The per-validator top-up limit is `targetBalanceGwei − (effectiveBalance + pendingBalanceGwei)`. The limit is zeroed if the validator is exiting/exited (`exitEpoch != FAR_FUTURE_EPOCH`) or slashed, if the current total already meets the target, or if the resulting amount is below `minTopUpGwei`.

`topUp` is permissioned (`TOP_UP_ROLE`, held by the Lido Depositor Bot). The contract inherits `CLValidatorVerifier`, `AccessControlEnumerableUpgradeable`, and `PausableUntil`, and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## State Variables
### LOCATOR

```solidity
ILidoLocator internal immutable LOCATOR
```


### GATEWAY_STORAGE_POSITION
Storage slot: keccak256(abi.encode(uint256(keccak256("lido.TopUpGateway.storage")) - 1)) & ~bytes32(uint256(0xff))


```solidity
bytes32 internal constant GATEWAY_STORAGE_POSITION =
    0x22e512057841e2bc1e6d80030c8bb8b4935377af2e64ba9bf8e6a3e88fb32200
```


### PUBKEY_LENGTH

```solidity
uint256 internal constant PUBKEY_LENGTH = 48
```


### FAR_FUTURE_EPOCH

```solidity
uint256 internal constant FAR_FUTURE_EPOCH = type(uint64).max
```


### SLOTS_PER_EPOCH

```solidity
uint256 public immutable SLOTS_PER_EPOCH
```


### TOP_UP_ROLE

```solidity
bytes32 public constant TOP_UP_ROLE = keccak256("TOP_UP_ROLE")
```


### MANAGE_LIMITS_ROLE

```solidity
bytes32 public constant MANAGE_LIMITS_ROLE = keccak256("MANAGE_LIMITS_ROLE")
```


### PAUSE_ROLE

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE")
```


### RESUME_ROLE

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE")
```


## Functions
### constructor


```solidity
constructor(
    address _lidoLocator,
    GIndex _gIFirstValidatorPrev,
    GIndex _gIFirstValidatorCurr,
    uint64 _pivotSlot,
    uint256 _slotsPerEpoch
) CLValidatorVerifier(_gIFirstValidatorPrev, _gIFirstValidatorCurr, _pivotSlot);
```

### initialize

Initializes the TopUpGateway proxy with admin, rate limits, and top-up balance parameters.


```solidity
function initialize(
    address _admin,
    uint256 _maxValidatorsPerTopUp,
    uint256 _minTopUpBlockDistance,
    uint256 _maxRootAgeSec,
    uint256 _targetBalanceGwei,
    uint256 _minTopUpGwei
) external initializer;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_admin`|`address`|Address to receive DEFAULT_ADMIN_ROLE|
|`_maxValidatorsPerTopUp`|`uint256`|Maximum number of validators per single topUp call|
|`_minTopUpBlockDistance`|`uint256`|Minimum blocks between topUp calls|
|`_maxRootAgeSec`|`uint256`|Maximum age (seconds) of beacon root relative to block.timestamp|
|`_targetBalanceGwei`|`uint256`|Target validator balance ceiling after top-up (in Gwei). Top-up amount = targetBalance - currentTotal.|
|`_minTopUpGwei`|`uint256`|Minimum top-up that can be performed (in Gwei). If calculated top-up < minTopUp, returns 0. Must be <= _targetBalanceGwei.|


### resume

Resume the contract

Reverts if contracts is not paused

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


### topUp

Method verifying Merkle proofs on validators and proceeding to top up validators
via StakingRouter.topUp(stakingModuleId, keyIndices, operatorIds, pubkeys, topUpLimits)

Only callable by accounts with TOP_UP_ROLE.
validatorIndices MUST be sorted in strictly ascending order. The corresponding keyIndices,
operatorIds, validatorWitness and pendingBalanceGwei arrays must be aligned by position
to validatorIndices[i].
Reverts if:
- the caller doesn't have TOP_UP_ROLE (AccessControl);
- validatorIndices is empty, or any of keyIndices, operatorIds, validatorWitness,
pendingBalanceGwei has a length different from validatorIndices
(`WrongArrayLength`);
- validatorIndices length exceeds maxValidatorsPerTopUp (`MaxValidatorsPerTopUpExceeded`);
- validatorIndices is not strictly increasing (not sorted or contains duplicates) (`InvalidValidatorIndicesSortOrder`);
- fewer than minBlockDistance blocks have passed since the last top-up (`MinBlockDistanceNotMet`);
- the beacon root is older than maxRootAge relative to block.timestamp (`RootIsTooOld`);
- the beacon root childBlockTimestamp is not newer than the last top-up timestamp
(`RootPrecedesLastTopUp`);
- the module's withdrawal credentials are not of type 0x02 (`WrongWithdrawalCredentials`);
- any validator pubkey has a length different from 48 bytes (`WrongPubkeyLength`);
- any validator has activationEpoch > current epoch (derived from beacon root slot) (`ValidatorIsNotActivated`);
- any validator Merkle proof fails verification in CLValidatorVerifier.


```solidity
function topUp(TopUpData calldata _topUps) external onlyRole(TOP_UP_ROLE) whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_topUps`|`TopUpData`|TopUpData structure, containing validators' container fields, pending deposits and Merkle proofs on inclusion of each container in Beacon State tree|


### getLastTopUpTimestamp

Returns the timestamp when last top up happened


```solidity
function getLastTopUpTimestamp() external view returns (uint256);
```

### getMaxValidatorsPerTopUp

Returns the allowed amount of validators per top up


```solidity
function getMaxValidatorsPerTopUp() external view returns (uint256);
```

### getMinBlockDistance

Returns the min block distance that should pass from last top up


```solidity
function getMinBlockDistance() external view returns (uint256);
```

### isBlockDistancePassed

Returns true if enough blocks have passed since the last top-up
(or no top-up has happened yet).


```solidity
function isBlockDistancePassed() external view returns (bool);
```

### getMaxRootAge

Returns the maximum age (seconds) of beacon root relative to block.timestamp


```solidity
function getMaxRootAge() external view returns (uint256);
```

### getTargetBalanceGwei

Returns target validator balance ceiling after top-up (in Gwei)


```solidity
function getTargetBalanceGwei() external view returns (uint256);
```

### getMinTopUpGwei

Returns minimum top-up that can be performed (in Gwei).


```solidity
function getMinTopUpGwei() external view returns (uint256);
```

### setMaxValidatorsPerTopUp

Set max validators per top up value


```solidity
function setMaxValidatorsPerTopUp(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_newValue`|`uint256`|Max validators per top up value|


### setMinBlockDistance

Set min block distance


```solidity
function setMinBlockDistance(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_newValue`|`uint256`|Min block distance|


### setTopUpBalanceLimits

Set targetBalanceGwei and minTopUpGwei values


```solidity
function setTopUpBalanceLimits(uint256 _targetBalanceGwei, uint256 _minTopUpGwei)
    external
    onlyRole(MANAGE_LIMITS_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_targetBalanceGwei`|`uint256`|target validator balance ceiling after top-up (in Gwei)|
|`_minTopUpGwei`|`uint256`| minimum top-up that can be performed (in Gwei).|


### setMaxRootAge

Sets the maximum allowed age of beacon root relative to current block timestamp


```solidity
function setMaxRootAge(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_newValue`|`uint256`|Maximum age in seconds|


### _isBlockDistancePassed


```solidity
function _isBlockDistancePassed() internal view returns (bool);
```

### _requireBlockDistancePassed


```solidity
function _requireBlockDistancePassed() internal view;
```

### _requireWithdrawalCredentials02


```solidity
function _requireWithdrawalCredentials02(bytes32 _wc) internal pure;
```

### _setLastTopUpData


```solidity
function _setLastTopUpData() internal;
```

### _setMaxRootAge


```solidity
function _setMaxRootAge(uint256 _newValue) internal;
```

### _setMaxValidatorsPerTopUp


```solidity
function _setMaxValidatorsPerTopUp(uint256 _newValue) internal;
```

### _setMinBlockDistance


```solidity
function _setMinBlockDistance(uint256 _newValue) internal;
```

### _setTopUpBalanceLimits


```solidity
function _setTopUpBalanceLimits(uint256 _targetBalanceGwei, uint256 _minTopUpGwei) internal;
```

### _verifyRootAge


```solidity
function _verifyRootAge(BeaconRootData calldata _beaconRootData) internal view;
```

### _verifyValidatorWasActivated


```solidity
function _verifyValidatorWasActivated(uint64 _slot, ValidatorWitness calldata _w) internal view;
```

### _evaluateTopUpLimit


```solidity
function _evaluateTopUpLimit(ValidatorWitness calldata _validator, uint256 _pendingBalanceGwei)
    internal
    view
    returns (uint256);
```

### _gatewayStorage


```solidity
function _gatewayStorage() internal pure returns (Storage storage $);
```

## Events
### MaxValidatorsPerTopUpChanged

```solidity
event MaxValidatorsPerTopUpChanged(uint256 newValue);
```

### MinBlockDistanceChanged

```solidity
event MinBlockDistanceChanged(uint256 newValue);
```

### LastTopUpChanged

```solidity
event LastTopUpChanged(uint256 newValue);
```

### MaxRootAgeChanged

```solidity
event MaxRootAgeChanged(uint256 newValue);
```

### TopUpBalanceLimitsChanged

```solidity
event TopUpBalanceLimitsChanged(uint256 targetBalanceGwei, uint256 minTopUpGwei);
```

## Errors
### ZeroValue

```solidity
error ZeroValue();
```

### ZeroArgument

```solidity
error ZeroArgument(string argument);
```

### TooLargeValue

```solidity
error TooLargeValue();
```

### RootIsTooOld

```solidity
error RootIsTooOld();
```

### RootPrecedesLastTopUp

```solidity
error RootPrecedesLastTopUp();
```

### WrongArrayLength

```solidity
error WrongArrayLength();
```

### MaxValidatorsPerTopUpExceeded

```solidity
error MaxValidatorsPerTopUpExceeded();
```

### WrongWithdrawalCredentials

```solidity
error WrongWithdrawalCredentials();
```

### WrongPubkeyLength

```solidity
error WrongPubkeyLength();
```

### MinBlockDistanceNotMet

```solidity
error MinBlockDistanceNotMet();
```

### InvalidValidatorIndicesSortOrder

```solidity
error InvalidValidatorIndicesSortOrder();
```

### ValidatorIsNotActivated

```solidity
error ValidatorIsNotActivated();
```

### MinTopUpExceedsTarget

```solidity
error MinTopUpExceedsTarget();
```

## Structs
### Storage

```solidity
struct Storage {
    uint64 maxValidatorsPerTopUp; // 64
    uint32 lastTopUpTimestamp; // 32
    uint32 lastTopUpBlock; // 32
    uint16 minBlockDistance; // 16
    uint16 maxRootAge; // 16
    uint64 targetBalanceGwei; // 64
    uint64 minTopUpGwei; // 64
}
```

