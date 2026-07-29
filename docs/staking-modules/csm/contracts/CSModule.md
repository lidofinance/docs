# CSModule

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/CSModule.sol)
- [Inherited API source](https://github.com/lidofinance/staking-modules/blob/v3.0/src/abstract/BaseModule.sol)
- [Deployed contract](https://etherscan.io/address/0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F)

`CSModule.sol` is a core module contract conforming to the `IStakingModule` and `IStakingModuleV2` interfaces. The contract stores information about Node Operators and deposit data (DD) and is responsible for all interactions with the `StakingRouter`, including deposit data queue management. To support `0x02` validators, it also maintains a top-up queue used to fund validators beyond the initial `32 ETH` deposit up to `2048 ETH`.

A Node Operator can perform a number of operations directly through this contract, for example:
- upload new validator keys (deposit data), supplying the required bond in ETH, stETH, or wstETH;
- remove uploaded keys that have not been deposited yet;
- manage the Node Operator's manager and reward addresses;
- compensate a reported (locked) penalty from the bond.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables
### MANAGE_TOP_UP_QUEUE_ROLE

```solidity
bytes32 public constant MANAGE_TOP_UP_QUEUE_ROLE = keccak256("MANAGE_TOP_UP_QUEUE_ROLE")
```


### REWIND_TOP_UP_QUEUE_ROLE

```solidity
bytes32 public constant REWIND_TOP_UP_QUEUE_ROLE = keccak256("REWIND_TOP_UP_QUEUE_ROLE")
```


### CSMODULE_STORAGE_LOCATION

```solidity
bytes32 private constant CSMODULE_STORAGE_LOCATION =
    0x48912ff6aecfe3259bdc07bbe67306543da3ba7172b1471bf49b659c3f4c6d00
```


### INITIALIZED_VERSION

```solidity
uint64 internal constant INITIALIZED_VERSION = 3
```


### STAKING_ROUTER_ROLE

```solidity
bytes32 public constant STAKING_ROUTER_ROLE = keccak256("STAKING_ROUTER_ROLE")
```


### REPORT_GENERAL_DELAYED_PENALTY_ROLE

```solidity
bytes32 public constant REPORT_GENERAL_DELAYED_PENALTY_ROLE = keccak256("REPORT_GENERAL_DELAYED_PENALTY_ROLE")
```


### SETTLE_GENERAL_DELAYED_PENALTY_ROLE

```solidity
bytes32 public constant SETTLE_GENERAL_DELAYED_PENALTY_ROLE = keccak256("SETTLE_GENERAL_DELAYED_PENALTY_ROLE")
```


### VERIFIER_ROLE

```solidity
bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE")
```


### REPORT_REGULAR_WITHDRAWN_VALIDATORS_ROLE

```solidity
bytes32 public constant REPORT_REGULAR_WITHDRAWN_VALIDATORS_ROLE =
    keccak256("REPORT_REGULAR_WITHDRAWN_VALIDATORS_ROLE")
```


### REPORT_SLASHED_WITHDRAWN_VALIDATORS_ROLE

```solidity
bytes32 public constant REPORT_SLASHED_WITHDRAWN_VALIDATORS_ROLE =
    keccak256("REPORT_SLASHED_WITHDRAWN_VALIDATORS_ROLE")
```


### CREATE_NODE_OPERATOR_ROLE

```solidity
bytes32 public constant CREATE_NODE_OPERATOR_ROLE = keccak256("CREATE_NODE_OPERATOR_ROLE")
```


### OPERATOR_ADDRESSES_ADMIN_ROLE

```solidity
bytes32 public constant OPERATOR_ADDRESSES_ADMIN_ROLE = keccak256("OPERATOR_ADDRESSES_ADMIN_ROLE")
```


### LIDO_LOCATOR

```solidity
ILidoLocator public immutable LIDO_LOCATOR
```


### STETH

```solidity
IStETH public immutable STETH
```


### PARAMETERS_REGISTRY

```solidity
IParametersRegistry public immutable PARAMETERS_REGISTRY
```


### ACCOUNTING

```solidity
IAccounting public immutable ACCOUNTING
```


### EXIT_PENALTIES

```solidity
IExitPenalties public immutable EXIT_PENALTIES
```


### FEE_DISTRIBUTOR

```solidity
address public immutable FEE_DISTRIBUTOR
```


### MODULE_TYPE

```solidity
bytes32 internal immutable MODULE_TYPE
```

## Functions
### constructor


```solidity
constructor(
    bytes32 moduleType,
    address lidoLocator,
    address parametersRegistry,
    address accounting,
    address exitPenalties
) BaseModule(moduleType, lidoLocator, parametersRegistry, accounting, exitPenalties);
```

### initialize

Initialize contract from scratch. In case of a method call frontrun, the contract instance should be discarded.
It is recommended to call this method in the same transaction as the deployment transaction
and perform extensive deployment verification before using the contract instance.


```solidity
function initialize(address admin, uint8 topUpQueueLimit) external reinitializer(INITIALIZED_VERSION);
```

### finalizeUpgradeV3

This method is expected to be called only when the contract is upgraded from version 2 to version 3 for the existing version 2 deployment.
If the version 3 contract is deployed from scratch, the `initialize` method should be used instead.
To prevent possible frontrun this method should strictly be called in the same TX as the upgrade transaction and should not be called separately.


```solidity
function finalizeUpgradeV3() external reinitializer(INITIALIZED_VERSION);
```

### rebuildTotalWithdrawnValidators

Rebuilds the global withdrawn validator counter from per-operator counters.

One-time migration helper for v2-to-v3 upgrades. The function is permissionless
because the resulting value is fully derived from stored Node Operator state.


```solidity
function rebuildTotalWithdrawnValidators() external;
```

### createNodeOperator

Permissioned method to add a new Node Operator
Should be called by `*Gate.sol` contracts. See `PermissionlessGate.sol` and `VettedGate.sol` for examples


```solidity
function createNodeOperator(
    address from,
    NodeOperatorManagementProperties calldata managementProperties,
    address referrer
) public override(BaseModule, IBaseModule) returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Sender address. Initial sender address to be used as a default manager and reward addresses. Gates must pass the correct address in order to specify which address should be the owner of the Node Operator.|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional. Management properties to be used for the Node Operator. `managerAddress`: Used as `managerAddress` for the Node Operator. If not passed `from` will be used. `rewardAddress`: Used as `rewardAddress` for the Node Operator. If not passed `from` will be used. `extendedManagerPermissions`: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled|
|`referrer`|`address`|Optional. Referrer address. Should be passed when Node Operator is created using partners integration|


### obtainDepositData

Get the next `depositsCount` of depositable keys with signatures from the queue

The method does not update depositable keys count for the Node Operators before the queue processing start.
Hence, in the rare cases of negative stETH rebase the method might return unbonded keys. This is a trade-off
between the gas cost and the correctness of the data. Due to module design, any unbonded keys will be requested
to exit by VEBO.

Second param `depositCalldata` is not used


```solidity
function obtainDepositData(
    uint256 depositsCount,
    bytes calldata depositCalldata // solhint-disable-line no-unused-vars
)
    external
    returns (bytes memory publicKeys, bytes memory signatures);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`depositsCount`|`uint256`|Number of deposits to be done|
|`depositCalldata`|`bytes`|Staking module defined data encoded as bytes. IMPORTANT: depositCalldata MUST NOT modify the deposit data set of the staking module|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`publicKeys`|`bytes`|Batch of the concatenated public validators keys|
|`signatures`|`bytes`|Batch of the concatenated deposit signatures for returned public keys|


### allocateDeposits

Validates that provided keys belong to the corresponding operators in the module and calculates deposit allocations for top-up

The function strictly follows the top-up queue.
If the provided deposit amount can be distributed only on 4 keys, but 5 keys were provided, then the function reverts.


```solidity
function allocateDeposits(
    uint256 maxDepositAmount,
    bytes[] calldata pubkeys,
    uint256[] calldata keyIndices,
    uint256[] calldata operatorIds,
    uint256[] calldata topUpLimits
) external returns (uint256[] memory allocations);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxDepositAmount`|`uint256`|Total ether amount available for top-up (must be multiple of 1 gwei)|
|`pubkeys`|`bytes[]`|List of validator public keys to top up|
|`keyIndices`|`uint256[]`|Indices of keys within their respective operators|
|`operatorIds`|`uint256[]`|Node operator IDs that own the keys|
|`topUpLimits`|`uint256[]`|Maximum amount that can be deposited per key based on CL data and SR internal logic.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`allocations`|`uint256[]`|Amount to deposit to each key|


### reportValidatorBalance

Update verified on-chain balance for a key.

The function stores balance relative to MIN_ACTIVATION_BALANCE.


```solidity
function reportValidatorBalance(uint256 nodeOperatorId, uint256 keyIndex, uint256 currentBalanceWei)
    public
    override(BaseModule, IBaseModule);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndex`|`uint256`|Index of the key in the Node Operator's keys storage|
|`currentBalanceWei`|`uint256`|Proven current validator balance in wei|


### setTopUpQueueLimit

Set the top-up queue capacity limit.


```solidity
function setTopUpQueueLimit(uint256 limit) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`limit`|`uint256`|How many items may sit in the top-up queue at most.|


### removeKeys

Remove keys for the Node Operator. Charging is module-specific (e.g., CSM applies a per-key fee).
This method is a part of the Optimistic Vetting scheme. After key deletion `totalVettedKeys`
is set equal to `totalAddedKeys`. If invalid keys are not removed, the unvetting process will be repeated
and `decreaseVettedSigningKeysCount` will be called by StakingRouter.


```solidity
function removeKeys(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount)
    external
    override(BaseModule, IBaseModule);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`startIndex`|`uint256`|Index of the first key|
|`keysCount`|`uint256`|Keys count to delete|


### rewindTopUpQueue

Rewind the top-up queue to be able to deposit to mistakenly skipped items.


```solidity
function rewindTopUpQueue(uint256 to) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`to`|`uint256`|Pointer to move the queue `head` to.|


### cleanDepositQueue

Clean the deposit queue from batches with no depositable keys

Use **eth_call** to check how many items will be removed


```solidity
function cleanDepositQueue(uint256 maxItems) external returns (uint256 removed, uint256 lastRemovedAtDepth);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxItems`|`uint256`|How many queue items to review|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`removed`|`uint256`|Count of batches to be removed by visiting `maxItems` batches|
|`lastRemovedAtDepth`|`uint256`|The value to use as `maxItems` to remove `removed` batches if the static call of the method was used|


### getTopUpQueue

Returns the top-up queue stats.


```solidity
function getTopUpQueue() external view returns (bool enabled, uint256 limit, uint256 length, uint256 head);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`enabled`|`bool`|Whether the queue was enabled upon initialization of the module.|
|`limit`|`uint256`|How many items may sit in the top-up queue at most.|
|`length`|`uint256`|How many items are in the queue.|
|`head`|`uint256`|Pointer to the head of the queue.|


### getTopUpQueueItem

Returns the top-up queue item by the given index.


```solidity
function getTopUpQueueItem(uint256 index) external view returns (uint256 nodeOperatorId, uint256 keyIndex);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`index`|`uint256`|An offset from the current head (not a global index) of the item to retrieve.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Node operator ID.|
|`keyIndex`|`uint256`|Index of the key in the Node Operator's keys storage|


### getStakingModuleSummary

Returns all-validators summary in the staking module


```solidity
function getStakingModuleSummary()
    external
    view
    override(BaseModule, IStakingModule)
    returns (uint256 totalExitedValidators, uint256 totalDepositedValidators, uint256 depositableValidatorsCount);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`totalExitedValidators`|`uint256`|Total number of validators in the EXITED state on the Consensus Layer. This value can't decrease in normal conditions|
|`totalDepositedValidators`|`uint256`|Total number of validators deposited via the official Deposit Contract. This value is a cumulative counter: even when the validator goes into EXITED state this counter is not decreasing|
|`depositableValidatorsCount`|`uint256`|Number of validators in the set available for deposit|


### depositQueuePointers

Get the pointers to the head and tail of queue with the given priority.


```solidity
function depositQueuePointers(uint256 queuePriority) external view returns (uint128 head, uint128 tail);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`queuePriority`|`uint256`|Priority of the queue to get the pointers.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`head`|`uint128`|Pointer to the head of the queue.|
|`tail`|`uint128`|Pointer to the tail of the queue.|


### depositQueueItem

Get the deposit queue item by an index


```solidity
function depositQueueItem(uint256 queuePriority, uint128 index) external view returns (Batch);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`queuePriority`|`uint256`|Priority of the queue to get an item from|
|`index`|`uint128`|Index of a queue item|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Batch`|Deposit queue item from the priority queue|


### getKeysForTopUp

Fetches up to `maxKeyCount` validator public keys from the top-up queue.

If the queue contains fewer than `maxKeyCount` entries, all available keys are returned.


```solidity
function getKeysForTopUp(uint256 maxKeyCount) external view returns (bytes[] memory pubkeys);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxKeyCount`|`uint256`|The maximum number of keys to retrieve.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`pubkeys`|`bytes[]`|The list of validator public keys returned from the queue.|


### addValidatorKeysETH

Add new keys to the existing Node Operator using ETH as a bond

Any excess msg.value will be sent to the bond and can be claimed from there. This behaviour is intentional
and protects users from key upload transaction front runs rendering the user transaction invalid due to changes
in the required bond amount.


```solidity
function addValidatorKeysETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures
) external payable whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Sender address. Commonly equals to `msg.sender` except for the case of Node Operator creation by `*Gate.sol` contracts|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|

### addValidatorKeysStETH

Add new keys to the existing Node Operator using stETH as a bond


```solidity
function addValidatorKeysStETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    IAccounting.PermitInput calldata permit
) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Sender address. Commonly equals to `msg.sender` except for the case of Node Operator creation by `*Gate.sol` contracts|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|
|`permit`|`IAccounting.PermitInput`|Optional. Permit to use stETH as bond|

### addValidatorKeysWstETH

Add new keys to the existing Node Operator using wstETH as a bond


```solidity
function addValidatorKeysWstETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    IAccounting.PermitInput calldata permit
) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Sender address. Commonly equals to `msg.sender` except for the case of Node Operator creation by `*Gate.sol` contracts|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|
|`permit`|`IAccounting.PermitInput`|Optional. Permit to use wstETH as bond|

### proposeNodeOperatorManagerAddressChange

Propose a new manager address for the Node Operator.

Passing address(0) clears the pending proposal without changing the current manager address.


```solidity
function proposeNodeOperatorManagerAddressChange(uint256 nodeOperatorId, address proposedAddress) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`proposedAddress`|`address`|Proposed manager address, or address(0) to cancel the current proposal|

### confirmNodeOperatorManagerAddressChange

Confirm a new manager address for the Node Operator.
Should be called from the currently proposed address


```solidity
function confirmNodeOperatorManagerAddressChange(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### proposeNodeOperatorRewardAddressChange

Propose a new reward address for the Node Operator.

Passing address(0) clears the pending proposal without changing the current reward address.


```solidity
function proposeNodeOperatorRewardAddressChange(uint256 nodeOperatorId, address proposedAddress) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`proposedAddress`|`address`|Proposed reward address, or address(0) to cancel the current proposal|

### confirmNodeOperatorRewardAddressChange

Confirm a new reward address for the Node Operator.
Should be called from the currently proposed address


```solidity
function confirmNodeOperatorRewardAddressChange(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### resetNodeOperatorManagerAddress

Reset the manager address to the reward address.
Should be called from the reward address


```solidity
function resetNodeOperatorManagerAddress(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### changeNodeOperatorRewardAddress

Change rewardAddress if extendedManagerPermissions is enabled for the Node Operator


```solidity
function changeNodeOperatorRewardAddress(uint256 nodeOperatorId, address newAddress) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`newAddress`|`address`|Proposed reward address|

### changeNodeOperatorAddresses

Change both reward and manager addresses of a node operator. An emergency method.

Only privileged role member can call this method if the role is assigned.


```solidity
function changeNodeOperatorAddresses(uint256 nodeOperatorId, address newManagerAddress, address newRewardAddress)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`newManagerAddress`|`address`|New manager address|
|`newRewardAddress`|`address`|New reward address|

### onRewardsMinted

Called by StakingRouter to signal that stETH rewards were minted for this module.

Passes through the minted stETH shares to the fee distributor


```solidity
function onRewardsMinted(uint256 totalShares) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`totalShares`|`uint256`|Amount of stETH shares that were minted to reward all node operators.|

### updateExitedValidatorsCount

Updates the number of the validators in the EXITED state for node operator with given id

exitedValidatorsCount is not used inside the module, but SR still expects this data to be stored and
returned. The method should be removed once there are no legacy modules in the Lido protocol and SR no longer
calls this method.


```solidity
function updateExitedValidatorsCount(bytes calldata nodeOperatorIds, bytes calldata exitedValidatorsCounts)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorIds`|`bytes`|Packed array of the node operators id|
|`exitedValidatorsCounts`|`bytes`|Packed array of the new number of EXITED validators for the node operators|

### unsafeUpdateValidatorsCount

Unsafely updates the number of validators in the EXITED/STUCK states for node operator with given id
'unsafely' means that this method can both increase and decrease exited and stuck counters

exitedValidatorsCount is not used inside the module, but SR still expects this data to be stored and
returned. The method should be removed once there are no legacy modules in the Lido protocol and SR no longer
calls this method.


```solidity
function unsafeUpdateValidatorsCount(uint256 nodeOperatorId, uint256 exitedValidatorsCount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`||
|`exitedValidatorsCount`|`uint256`||

### updateTargetValidatorsLimits

Updates the limit of the validators that can be used for deposit


```solidity
function updateTargetValidatorsLimits(uint256 nodeOperatorId, uint256 targetLimitMode, uint256 targetLimit)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`targetLimitMode`|`uint256`|Target limit mode for the Node Operator (see https://hackmd.io/@lido/BJXRTxMRp) 0 - disabled 1 - soft mode 2 - forced mode|
|`targetLimit`|`uint256`|Target limit of validators|

### decreaseVettedSigningKeysCount

Called by StakingRouter to decrease the number of vetted keys for Node Operators with given ids


```solidity
function decreaseVettedSigningKeysCount(bytes calldata nodeOperatorIds, bytes calldata vettedSigningKeysCounts)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorIds`|`bytes`|Bytes packed array of the Node Operator ids|
|`vettedSigningKeysCounts`|`bytes`|Bytes packed array of the new numbers of vetted keys for the Node Operators|

### updateDepositableValidatorsCount

Update depositable validators data for the given Node Operator.

The following rules are applied:
- Unbonded keys can not be depositable
- Unvetted keys can not be depositable
- Depositable keys count should respect targetLimit value


```solidity
function updateDepositableValidatorsCount(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### reportGeneralDelayedPenalty

Report general delayed penalty for the given Node Operator


```solidity
function reportGeneralDelayedPenalty(
    uint256 nodeOperatorId,
    bytes32 penaltyType,
    uint256 amount,
    string calldata details
) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`penaltyType`|`bytes32`|Type of the penalty|
|`amount`|`uint256`|Penalty amount in ETH|
|`details`|`string`|Additional details about the penalty|

### cancelGeneralDelayedPenalty

Cancel previously reported and not settled general delayed penalty for the given Node Operator


```solidity
function cancelGeneralDelayedPenalty(uint256 nodeOperatorId, uint256 amount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`amount`|`uint256`|Amount of penalty to cancel|

### settleGeneralDelayedPenalty

Settles locked bond for eligible Node Operators

SETTLE_GENERAL_DELAYED_PENALTY_ROLE role is expected to be assigned to Easy Track


```solidity
function settleGeneralDelayedPenalty(uint256[] calldata nodeOperatorIds, uint256[] calldata bondLockNonces)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorIds`|`uint256[]`|IDs of the Node Operators|
|`bondLockNonces`|`uint256[]`|Bond lock nonces for each Node Operator|

### compensateGeneralDelayedPenalty

Compensate general delayed penalty (locked bond) for the given Node Operator from Node Operator's bond

Can only be called by the Node Operator manager


```solidity
function compensateGeneralDelayedPenalty(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### reportValidatorSlashing

Report Node Operator's key as slashed.


```solidity
function reportValidatorSlashing(uint256 nodeOperatorId, uint256 keyIndex) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|The ID of the Node Operator|
|`keyIndex`|`uint256`|Index of the key in the Node Operator's keys storage|

### reportSlashedWithdrawnValidators

Report withdrawn validators that have been slashed.


```solidity
function reportSlashedWithdrawnValidators(WithdrawnValidatorInfo[] calldata validatorInfos) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validatorInfos`|`WithdrawnValidatorInfo[]`|An array of WithdrawnValidatorInfo structs|

### reportRegularWithdrawnValidators

Report Node Operator's keys as withdrawn and charge penalties associated with exit if any.
A validator is considered withdrawn in the following cases:
- if it's an exit of a non-slashed validator, when a withdrawal of the validator is included in a beacon
block;
- if it's an exit of a slashed validator, when the committee reports such a validator as withdrawn; note
that it can happen earlier than the actual withdrawal is included on the beacon chain if the committee
decides it can account for all penalties in advance;
- if it's a consolidated validator, when the corresponding pending consolidation is processed and the
balance of the validator has been moved to another validator.


```solidity
function reportRegularWithdrawnValidators(WithdrawnValidatorInfo[] calldata validatorInfos) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validatorInfos`|`WithdrawnValidatorInfo[]`|An array of WithdrawnValidatorInfo structs|

### reportValidatorExitDelay

Handles tracking and penalization logic for a validator that remains active beyond its eligible exit window.

This function is called by the StakingRouter to report the current exit-related status of a validator
belonging to a specific node operator. It accepts a validator's public key, associated
with the duration (in seconds) it was eligible to exit but has not exited.
This data could be used to trigger penalties for the node operator if the validator has exceeded the allowed exit window.


```solidity
function reportValidatorExitDelay(
    uint256 nodeOperatorId,
    uint256 proofSlotTimestamp, // solhint-disable-line no-unused-vars
    bytes calldata publicKey,
    uint256 eligibleToExitInSec
) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`||
|`proofSlotTimestamp`|`uint256`||
|`publicKey`|`bytes`||
|`eligibleToExitInSec`|`uint256`||

### onValidatorExitTriggered

Handles the triggerable exit event for a validator belonging to a specific node operator.

This function is called by the StakingRouter when a validator is exited using the triggerable
exit request on the Execution Layer (EL).


```solidity
function onValidatorExitTriggered(
    uint256 nodeOperatorId,
    bytes calldata publicKey,
    uint256 elWithdrawalRequestFeePaid,
    uint256 exitType
) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`||
|`publicKey`|`bytes`||
|`elWithdrawalRequestFeePaid`|`uint256`||
|`exitType`|`uint256`||

### updateDepositInfo

Update deposit info for the given Node Operator.


```solidity
function updateDepositInfo(uint256 nodeOperatorId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### requestFullDepositInfoUpdate

Request a full update of deposit info for all node operators.
Should be called after external changes that can affect deposit info such as bond curve change or parameters update.


```solidity
function requestFullDepositInfoUpdate() external;
```

### batchDepositInfoUpdate

Request a batch update of deposit info for node operators.
If `requestFullDepositInfoUpdate` was called before, the update will start from the first operator.
Otherwise, it will continue from the next operator after the last updated one.


```solidity
function batchDepositInfoUpdate(uint256 maxCount) external returns (uint256 operatorsLeft);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`maxCount`|`uint256`|Maximum number of operators to update in this batch|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`operatorsLeft`|`uint256`|Number of operators left to update|

### onExitedAndStuckValidatorsCountsUpdated

Called by StakingRouter after it finishes updating exited and stuck validators
counts for this module's node operators.
Guaranteed to be called after an oracle report is applied, regardless of whether any node
operator in this module has actually received any updated counts as a result of the report
but given that the total number of exited validators returned from getStakingModuleSummary
is the same as StakingRouter expects based on the total count received from the oracle.

This method is not used in the module since rewards are distributed by a performance oracle,
hence it does nothing


```solidity
function onExitedAndStuckValidatorsCountsUpdated() external view;
```

### onWithdrawalCredentialsChanged

Called by StakingRouter when withdrawal credentials are changed.

Changing the WC means that the current deposit data in the queue is not valid anymore and can't be deposited.
If there are depositable validators in the queue, the method should revert to prevent deposits with invalid
withdrawal credentials.


```solidity
function onWithdrawalCredentialsChanged() external view;
```

### getInitializedVersion

Returns the initialized version of the contract


```solidity
function getInitializedVersion() external view returns (uint64);
```

### isValidatorSlashed

Checks if a validator was reported as slashed


```solidity
function isValidatorSlashed(uint256 nodeOperatorId, uint256 keyIndex) external view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|The ID of the node operator|
|`keyIndex`|`uint256`|Index of the key in the Node Operator's keys storage|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|True if a validator was reported as slashed|

### isValidatorWithdrawn

Check if the given Node Operator's key is reported as withdrawn


```solidity
function isValidatorWithdrawn(uint256 nodeOperatorId, uint256 keyIndex) external view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndex`|`uint256`|Index of the key in the Node Operator's keys storage|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|Is validator reported as withdrawn or not|

### getType

Returns the type of the staking module


```solidity
function getType() external view returns (bytes32);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes32`|Module type|

### getNodeOperator

Get Node Operator info


```solidity
function getNodeOperator(uint256 nodeOperatorId) external view returns (NodeOperator memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`NodeOperator`|Node Operator info|

### getNodeOperatorManagementProperties

Get Node Operator management properties


```solidity
function getNodeOperatorManagementProperties(uint256 nodeOperatorId)
    external
    view
    returns (NodeOperatorManagementProperties memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`NodeOperatorManagementProperties`|Node Operator management properties|

### getNodeOperatorOwner

Get Node Operator owner. Owner is manager address if `extendedManagerPermissions` is enabled and reward address otherwise


```solidity
function getNodeOperatorOwner(uint256 nodeOperatorId) external view returns (address);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|Node Operator owner|

### getNodeOperatorNonWithdrawnKeys

Get Node Operator non-withdrawn keys


```solidity
function getNodeOperatorNonWithdrawnKeys(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Non-withdrawn keys count|

### getNodeOperatorBalance

Returns tracked operator balance (active validator base stake plus tracked extra).

The tracked extra is intentionally monotonic for active validators and is reduced on withdrawal reporting,
not on intermediate balance decreases, so the value serves both top-up allocation and withdrawal penalty accounting.


```solidity
function getNodeOperatorBalance(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

### getNodeOperatorSummary

depositableValidatorsCount depends on:
- totalVettedKeys
- totalDepositedKeys
- totalExitedKeys
- targetLimitMode
- targetValidatorsCount
- totalUnbondedKeys


```solidity
function getNodeOperatorSummary(uint256 nodeOperatorId)
    external
    view
    returns (
        uint256 targetLimitMode,
        uint256 targetValidatorsCount,
        uint256 stuckValidatorsCount,
        uint256 refundedValidatorsCount,
        uint256 stuckPenaltyEndTimestamp,
        uint256 totalExitedValidators,
        uint256 totalDepositedValidators,
        uint256 depositableValidatorsCount
    );
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|id of the operator to return report for|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`targetLimitMode`|`uint256`|shows whether the current target limit applied to the node operator (1 = soft mode, 2 = forced mode)|
|`targetValidatorsCount`|`uint256`|relative target active validators limit for operator|
|`stuckValidatorsCount`|`uint256`|number of validators with an expired request to exit time|
|`refundedValidatorsCount`|`uint256`|number of validators that can't be withdrawn, but deposit costs were compensated to the Lido by the node operator|
|`stuckPenaltyEndTimestamp`|`uint256`|time when the penalty for stuck validators stops applying to node operator rewards|
|`totalExitedValidators`|`uint256`|total number of validators in the EXITED state on the Consensus Layer. This value can't decrease in normal conditions|
|`totalDepositedValidators`|`uint256`|total number of validators deposited via the official Deposit Contract. This value is a cumulative counter: even when the validator goes into EXITED state this counter is not decreasing|
|`depositableValidatorsCount`|`uint256`|number of validators in the set available for deposit|

### getSigningKeys

Get Node Operator signing keys


```solidity
function getSigningKeys(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount)
    external
    view
    returns (bytes memory keys);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`startIndex`|`uint256`|Index of the first key|
|`keysCount`|`uint256`|Count of keys to get|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`keys`|`bytes`|Signing keys|

### getSigningKeysWithSignatures

Get Node Operator signing keys with signatures


```solidity
function getSigningKeysWithSignatures(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount)
    external
    view
    returns (bytes memory keys, bytes memory signatures);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`startIndex`|`uint256`|Index of the first key|
|`keysCount`|`uint256`|Count of keys to get|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`keys`|`bytes`|Signing keys|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|

### getNonce

Returns a counter that MUST change its value whenever the deposit data set changes.
Below is the typical list of actions that requires an update of the nonce:
1. a node operator's deposit data is added
2. a node operator's deposit data is removed
3. a node operator's ready-to-deposit data size is changed
4. a node operator was activated/deactivated
5. a node operator's deposit data is used for the deposit
Note: Depending on the StakingModule implementation above list might be extended

In some scenarios, it's allowed to update nonce without actual change of the deposit
data subset, but it MUST NOT lead to the DOS of the staking module via continuous
update of the nonce by the malicious actor


```solidity
function getNonce() external view returns (uint256);
```

### getNodeOperatorsCount

Returns total number of node operators


```solidity
function getNodeOperatorsCount() external view returns (uint256);
```

### getActiveNodeOperatorsCount

Returns number of active node operators

The module has no inactive Node Operator state, so active operators are all existing operators.


```solidity
function getActiveNodeOperatorsCount() external view returns (uint256);
```

### getNodeOperatorIsActive

Returns if the node operator with given id is active

The module has no inactive Node Operator state, so active means existing.


```solidity
function getNodeOperatorIsActive(uint256 nodeOperatorId) external view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the node operator|

### getNodeOperatorIds

Returns up to `limit` node operator ids starting from the `offset`. The order of
the returned ids is not defined and might change between calls.

This view must not revert in case of invalid data passed. When `offset` exceeds the
total node operators count or when `limit` is equal to 0 MUST be returned empty array.


```solidity
function getNodeOperatorIds(uint256 offset, uint256 limit)
    external
    view
    returns (uint256[] memory nodeOperatorIds);
```

### isValidatorExitDelayPenaltyApplicable

Determines whether a validator's exit status should be updated and will have an effect on the Node Operator.


```solidity
function isValidatorExitDelayPenaltyApplicable(
    uint256 nodeOperatorId,
    uint256 proofSlotTimestamp, // solhint-disable-line no-unused-vars
    bytes calldata publicKey,
    uint256 eligibleToExitInSec
) external view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`||
|`proofSlotTimestamp`|`uint256`||
|`publicKey`|`bytes`||
|`eligibleToExitInSec`|`uint256`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|Returns true if the contract should receive the updated status of the validator.|

### exitDeadlineThreshold

Returns the number of seconds after which a validator is considered late.


```solidity
function exitDeadlineThreshold(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|The exit deadline threshold in seconds.|

### getKeyAllocatedBalances

Get cumulative top-up amounts allocated to Node Operator keys (above MIN_ACTIVATION_BALANCE)


```solidity
function getKeyAllocatedBalances(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount)
    external
    view
    returns (uint256[] memory balances);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`startIndex`|`uint256`|Index of the first key|
|`keysCount`|`uint256`|Count of keys to get|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`balances`|`uint256[]`|Allocated balances above MIN_ACTIVATION_BALANCE (wei)|

### getKeyConfirmedBalances

Get verifier-confirmed balances for Node Operator keys (above MIN_ACTIVATION_BALANCE)


```solidity
function getKeyConfirmedBalances(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount)
    external
    view
    returns (uint256[] memory balances);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`startIndex`|`uint256`|Index of the first key|
|`keysCount`|`uint256`|Count of keys to get|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`balances`|`uint256[]`|Confirmed balances above MIN_ACTIVATION_BALANCE (wei)|

### getTotalModuleStake

Returns the total tracked stake of the module in wei.

This is the sum of the activation base for active validators and tracked extra stake.
The tracked extra is intentionally reduced on withdrawal reporting rather than on intermediate validator balance decreases.


```solidity
function getTotalModuleStake() public view override returns (uint256);
```

### getNodeOperatorDepositInfoToUpdateCount

Get the number of Node Operators with outdated deposit info that requires update.


```solidity
function getNodeOperatorDepositInfoToUpdateCount() external view returns (uint256 count);
```

### _applyDepositableValidatorsCount


```solidity
function _applyDepositableValidatorsCount(
    NodeOperator storage no,
    uint256 nodeOperatorId,
    uint256 newCount,
    bool incrementNonceIfUpdated
) internal override returns (bool changed);
```

### _addKeysAndUpdateDepositableValidatorsCount


```solidity
function _addKeysAndUpdateDepositableValidatorsCount(
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures
) internal override;
```

### _initTopUpQueue

Setting `topUpQueueLimit` to 0 effectively disables the top-up queue permanently.


```solidity
function _initTopUpQueue(uint8 topUpQueueLimit) internal;
```

### _onlyEnabledTopUpQueue


```solidity
function _onlyEnabledTopUpQueue() internal view;
```

### _topUpQueue


```solidity
function _topUpQueue() internal view returns (TopUpQueueLib.Queue storage);
```

### _topUpQueueEnabled


```solidity
function _topUpQueueEnabled() internal view returns (bool enabled);
```

### _queueLowestPriority


```solidity
function _queueLowestPriority() internal view returns (uint256);
```

### _checkCanAddKeys


```solidity
function _checkCanAddKeys(uint256 nodeOperatorId, address who) internal view override;
```

### _csmStorage


```solidity
function _csmStorage() internal pure returns (CSModuleStorage storage $);
```

### __BaseModule_init


```solidity
function __BaseModule_init(address admin) internal onlyInitializing;
```

### _updateDepositInfo


```solidity
function _updateDepositInfo(uint256 nodeOperatorId) internal virtual;
```

### _reportWithdrawnValidators


```solidity
function _reportWithdrawnValidators(WithdrawnValidatorInfo[] calldata validatorInfos, bool slashed) internal;
```

### _incrementModuleNonce


```solidity
function _incrementModuleNonce() internal;
```

### _updateDepositableValidatorsCount


```solidity
function _updateDepositableValidatorsCount(uint256 nodeOperatorId, bool incrementNonceIfUpdated)
    internal
    returns (bool changed);
```

### _removeKeys


```solidity
function _removeKeys(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount, bool useKeyRemovalCharge)
    internal
    virtual;
```

### _onlyNodeOperatorManager


```solidity
function _onlyNodeOperatorManager(uint256 nodeOperatorId, address from) internal view;
```

### _nodeOperatorExists


```solidity
function _nodeOperatorExists(uint256 nodeOperatorId) internal view returns (bool);
```

### _onlyExistingNodeOperator


```solidity
function _onlyExistingNodeOperator(uint256 nodeOperatorId) internal view;
```

### _onlyValidIndexRange

NOTE: The function does not revert when `startIndex` is equal to `totalAddedKeys` and `keysCount` is zero. The
method might be fixed later once we're sure all off-chain tooling will handle the updated behaviour.


```solidity
function _onlyValidIndexRange(uint256 nodeOperatorId, uint256 startIndex, uint256 keysCount) internal view;
```

### _onlyValidKeyIndex


```solidity
function _onlyValidKeyIndex(uint256 nodeOperatorId, uint256 keyIndex) internal view;
```

### _getBondCurveId


```solidity
function _getBondCurveId(uint256 nodeOperatorId) internal view returns (uint256);
```

### _getRequiredBondForNextKeys


```solidity
function _getRequiredBondForNextKeys(IAccounting accounting, uint256 nodeOperatorId, uint256 keysCount)
    internal
    view
    returns (uint256 amount);
```

### _checkStakingRouterRole


```solidity
function _checkStakingRouterRole() internal view;
```

### _checkReportGeneralDelayedPenaltyRole


```solidity
function _checkReportGeneralDelayedPenaltyRole() internal view;
```

### _checkVerifierRole


```solidity
function _checkVerifierRole() internal view;
```

### _checkCreateNodeOperatorRole


```solidity
function _checkCreateNodeOperatorRole() internal view;
```

### _accounting

This function is used to get the accounting contract from immutables to save bytecode.


```solidity
function _accounting() internal view returns (IAccounting);
```

### _exitPenalties

This function is used to get the exit penalties contract from immutables to save bytecode.


```solidity
function _exitPenalties() internal view returns (IExitPenalties);
```

### _parametersRegistry

This function is used to get the parameters registry contract from immutables to save bytecode.


```solidity
function _parametersRegistry() internal view returns (IParametersRegistry);
```

### _requireDepositInfoUpToDate


```solidity
function _requireDepositInfoUpToDate() internal view;
```

### _canRequestDepositInfoUpdate

Default implementation of the guard for requesting deposit info update.


```solidity
function _canRequestDepositInfoUpdate() internal view virtual;
```

### _onlyRecoverer


```solidity
function _onlyRecoverer() internal view override;
```

### __checkRole


```solidity
function __checkRole(bytes32 role) internal view override;
```

## Structs
### CSModuleStorage
**Note:**
storage-location: erc7201:CSModule


```solidity
struct CSModuleStorage {
    TopUpQueueLib.Queue topUpQueue;
}
```

