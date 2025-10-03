# NodeOperatorsRegistry

- [Source Code](https://github.com/lidofinance/core/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)
- [Deployed Contract](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5)

The `NodeOperatorsRegistry` contract acts as a registry of Node Operators selected by the Lido DAO.
Since [Lido V2 upgrade](https://blog.lido.fi/introducing-lido-v2/) `NodeOperatorsRegistry` contract became a module of [`StakingRouter`](/contracts/staking-router.md) and got the second name **Curated staking module** as part of the general Lido staking infrastructure. As a staking module, `NodeOperatorsRegistry` implements [StakingModule interface](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol).

`NodeOperatorsRegistry` keeps track of various Node Operators data, in particular limits of the allowed stake, reward addresses, penalty information, public keys of the Node Operators' validators. It defines order in which the Node Operators get the ether deposited and reward distribution between the node operators.

A curated node operator is obliged by the Lido DAO to exit its validators in a timely manner if requested by the Lido protocol. The exit request is formed on-chain by the [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle.md) contract. If a NO doesn't fulfill the request in time, it might be penalized. The penalized status is assigned automatically by the Lido protocol. A penalized NO does not receive new ether for deposits and receives only half of its rewards until the penalty is cleared. The other half of the NO’s rewards is distributed among all stETH holders (technically, it is burned). To get the penalty cleared, the NO must exit the stuck validators or refund the corresponding ether amount and then wait `getStuckPenaltyDelay()` seconds.

The Lido DAO can also:

- set a target validator limit for the NO, as well as the priority exit mode. If the current active number of validators is above the target, the excess ones will be requested to exit in a prioritized manner when required to [finalize withdrawal requests](/docs/contracts/withdrawal-queue-erc721.md#finalization). Allocation of deposits above the target value is prohibited.
- deactivate misbehaving operators by `deactivateNodeOperator()`. A deactivated node operator does not receive rewards or new deposits.

## Glossary

:::note
In the context of these terms "signing key", "key", "validator key", "validator" might be used interchangeably.
:::

**signing key**. BLS12-381 public key that will be used by the protocol for making Beacon deposits to [run a validator](/docs/guides/curated-module/validator-keys.md#generating-signing-keys)

**vetted** (signing key). Approved by the Lido DAO for receiving ether for deposit.

**submitted** (signing key). Added to the node operators registry.

**depositable** (signing key). Suitable for new deposits.

**deposited** (signing key). Ever received deposit.

**unused** (signing key). Submitted but not deposited yet.

**exited** (signing key). A validator that got into "Exited" state: either by [voluntary exit](https://lighthouse-book.sigmaprime.io/voluntary-exit.html) or as a result of slashing. [This doc](https://www.attestant.io/posts/understanding-the-validator-lifecycle/) might be useful regarding the validators lifecycle.

**used (active)** (signing key). Deposited but not yet exited.

**late** (validator). Not exited in proper time after an exit request from [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle.md) by Lido protocol.

**refunded** (stuck validator). Compensated by the NO for being stuck. For more information on handling of NO misbehavior see Lido on Ethereum Validator Exits SNOP 2.0 ([IPFS](https://lido.mypinata.cloud/ipfs/QmZTMfmJZsYHz61f2FjhYdh5VNu6ifjYQJzYUGkysHs8Uu), [GitHub](https://github.com/lidofinance/documents-and-policies/blob/0ed664255f48ef224b96fb0325f4d27bd3c03773/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md), [HackMD](https://hackmd.io/@lido/Bk9oDtV7ye)).

## Node operator parameters

For each NO the contract keeps a record of at least these values:

- `active: bool` active/inactive status of the NO. An active NO gets rewards and new deposits according to its staking limit. New node operators are added in active state.
- `name: string` human-readable name of the NO
- `rewardAddress: address` where to send stETH rewards (part of the protocol fee)
- `totalVettedValidators: uint64` Maximum number of validator keys approved for deposit by the DAO so far
- `totalExitedValidators: uint64` incremental counter of all exited validators for the NO so far
- `totalAddedValidators: uint64` incremental counter of all added to the NO validators so far
- `totalDepositedValidators: uint64` incremental counter of all deposited validators for the NO so far
- `targetValidatorsCount: uint256` target value for the number of validators for the NO. If the current active number of validators is above the value, the excess ones will be requested to exit. Allocation of deposits above the target value is prohibited. The exiting works only if `targetLimitMode` is non-zero. The `0` value will cause exit requests issued for all deposited validators of the NO. (see [VEBO](https://docs.lido.fi/guides/oracle-spec/validator-exit-bus) for details)
- `targetLimitMode: uint256` NO's target limitation mode value (0 = disabled, 1 = smooth exit mode, 2 = boosted exit mode), determines whether the number of NO validators is target-limited, and if so, which exit mode will be applied on the [VEBO](https://docs.lido.fi/guides/oracle-spec/validator-exit-bus) side (see also `targetValidatorsCount`)
- `stuckValidatorsCount: uint256` *deprecated* number of stuck validators. Always returns 0.
- `refundedValidatorsCount: uint256` *deprecated* number of refunded validators. Always returns 0.
- `depositableValidatorsCount: uint256` number of depositable validators

The values can be viewed by means of `getNodeOperator()` and `getNodeOperatorSummary()`.

Except for the functions listed below, the contract has methods accessible only by [`StakingRouter`](/contracts/staking-router.md)
(holder of `STAKING_ROUTER_ROLE`). These functions are called internally in the course of
[`AccountingOracle`](/contracts/accounting-oracle.md) report.

## View Methods

### getRewardsDistribution()

Returns the rewards distribution proportional to the effective stake for each node operator

```solidity
function getRewardsDistribution(uint256 _totalRewardShares) returns (
  address[] recipients,
  uint256[] shares,
  bool[] penalized
);
```

| Name                 | Type      | Description                                 |
|----------------------|-----------|---------------------------------------------|
| `_totalRewardShares` | `uint256` | Total amount of reward shares to distribute |

### getActiveNodeOperatorsCount()

Returns the number of active node operators.

```solidity
function getActiveNodeOperatorsCount() returns (uint256);
```

### getNodeOperator()

Returns the node operator by id.

```solidity
function getNodeOperator(uint256 _nodeOperatorId, bool _fullInfo) returns (
    bool active,
    string name,
    address rewardAddress,
    uint64 totalVettedValidators,
    uint64 totalExitedValidators,
    uint64 totalAddedValidators,
    uint64 totalDepositedValidators
);
```

| Name              | Type      | Description                            |
|-------------------|-----------|----------------------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id                       |
| `_fullInfo`       | `bool`    | If true, name will be returned as well |

### getTotalSigningKeyCount()

Returns the total number of signing keys of the node operator.

```solidity
function getTotalSigningKeyCount(uint256 _nodeOperatorId) returns (uint256);
```

| Name              | Type      | Description      |
|-------------------|-----------|------------------|
| `_nodeOperatorId` | `uint256` | Node operator id |

### getUnusedSigningKeyCount()

Returns the number of usable signing keys of the node operator.

```solidity
function getUnusedSigningKeyCount(uint256 _nodeOperatorId) returns (uint256);
```

| Name              | Type      | Description      |
|-------------------|-----------|------------------|
| `_nodeOperatorId` | `uint256` | Node operator id |

### getSigningKey()

Returns n-th signing key of the node operator.

```solidity
function getSigningKey(uint256 _nodeOperatorId, uint256 _index) returns (
    bytes key,
    bytes depositSignature,
    bool used
);
```

| Name              | Type      | Description                       |
|-------------------|-----------|-----------------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id                  |
| `_index`          | `uint256` | Index of the key, starting with 0 |

Returns:

| Name               | Type    | Description                                           |
|--------------------|---------|-------------------------------------------------------|
| `key`              | `bytes` | Key                                                   |
| `depositSignature` | `bytes` | Signature needed for a `depositContract.deposit` call |
| `used`             | `bool`  | Flag indicating whether the key was used for staking  |

### getSigningKeys()

Returns subset of the signing keys of the node operator corresponding to the specified range `[_offset, _offset + _limit)`.
If the requested range is out of bounds of the range `[0, <total keys number>)`, the call reverts with an `OUT_OF_RANGE` error.

```solidity
function getSigningKeys(uint256 _nodeOperatorId, uint256 _offset, uint256 _limit) returns (
    bytes memory pubkeys,
    bytes memory signatures,
    bool[] memory used
);
```

| Name              | Type      | Description                                                                                 |
|-------------------|-----------|---------------------------------------------------------------------------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id                                                                            |
| `_offset`         | `uint256` | Offset of the key in the array of all NO keys (`0` means the first key, `1` the second, etc |
| `_limit`          | `uint256` | Number of keys to return                                                                    |

Returns:

| Name         | Type     | Description                                                                                               |
|--------------|----------|-----------------------------------------------------------------------------------------------------------|
| `pubkeys`    | `bytes`  | Keys concatenated into the bytes batch: `[ 48 bytes key \| 48 bytes key \| ... ]`                         |
| `signatures` | `bytes`  | Signatures needed for a `depositContract.deposit` call, concatenated as `[ 96 bytes \| 96 bytes \| ... ]` |
| `used`       | `bool[]` | Array of flags indicating whether the key was used for staking                                            |

### getNodeOperatorsCount()

Returns the total number of node operators.

```solidity
function getNodeOperatorsCount() returns (uint256);
```

### getNonce()

Returns a counter that increments whenever the deposit data set changes. Namely, it increments every time when for a node operator:

- staking limit changed;
- target validators limit changed;
- stuck validators count changed;
- exited validators count changed;
- validator signing keys added/removed;
- penalty is cleared;
- ready to deposit keys invalidated (due to withdrawal credentials change or due to manual invalidation by call of `invalidateReadyToDepositKeysRange`);
- ether deposited.

```solidity
function getNonce() view returns (uint256);
```

### getType()

Returns the type of the staking module.

```solidity
function getType() view returns (bytes32);
```

### getStakingModuleSummary()

Returns some statistics of the staking module.

```solidity
function getStakingModuleSummary() view returns (
    uint256 totalExitedValidators,
    uint256 totalDepositedValidators,
    uint256 depositableValidatorsCount
);
```

| Name                         | Type      | Description                                 |
|------------------------------|-----------|---------------------------------------------|
| `totalExitedValidators`      | `uint256` | Total number of exited validators           |
| `totalDepositedValidators`   | `uint256` | Total number of deposited validators        |
| `depositableValidatorsCount` | `uint256` | Number of validators which can be deposited |

### getNodeOperatorIsActive()

Returns if the node operator with given id is active.

```solidity
function getNodeOperatorIsActive(uint256 _nodeOperatorId) view returns (bool);
```

| Name              | Type      | Description      |
|-------------------|-----------|------------------|
| `_nodeOperatorId` | `uint256` | Node operator id |

### getNodeOperatorIds()

Returns up to `_limit` node operator ids starting from the `_offset`.

```solidity
function getNodeOperatorIds(uint256 _offset, uint256 _limit) view
    returns (uint256[] memory nodeOperatorIds);
```

| Name      | Type      | Description                              |
|-----------|-----------|------------------------------------------|
| `_offset` | `uint256` | Offset of the first element of the range |
| `_limit`  | `uint256` | Max number of NO ids to return           |

### getNodeOperatorSummary()

Returns some statistics of the node operator.

```solidity
function getNodeOperatorSummary(uint256 _nodeOperatorId) view returns (
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

| Name                         | Type      | Description                                                                                      |
|------------------------------|-----------|--------------------------------------------------------------------------------------------------|
| `targetLimitMode`            | `uint256` | Current target limit mode applied to the NO (0 = disabled, 1 = soft, 2 = boosted)                |
| `targetValidatorsCount`      | `uint256` | Target validators count for full description see [parameters section](#node-operator-parameters) |
| `stuckValidatorsCount`       | `uint256` | *deprecated* Number of stuck keys from oracle report                                             |
| `refundedValidatorsCount`    | `uint256` | *deprecated* Number of refunded keys                                                             |
| `stuckPenaltyEndTimestamp`   | `uint256` | *deprecated* Extra penalty time after stuck keys refunded                                        |
| `totalExitedValidators`      | `uint256` | Number of keys in the EXITED state of the NO for all time                                        |
| `totalDepositedValidators`   | `uint256` | Number of keys of the NO which were in DEPOSITED state for all time                              |
| `depositableValidatorsCount` | `uint256` | Number of validators which can be deposited                                                      |

### getStuckPenaltyDelay()

*Deprecated*

Returns value of the stuck penalty delay (in seconds).
This parameter defines how long a penalized NO stays in penalty state after the stuck keys were refunded.

```solidity
function getStuckPenaltyDelay() view returns (uint256);
```

### isOperatorPenalized()

*Deprecated*

Returns flag whether the NO is penalized.

```solidity
function isOperatorPenalized(uint256 _nodeOperatorId) view returns (bool)
```

### isOperatorPenaltyCleared()

*Deprecated*

Returns whether the NO penalty is cleared.

```solidity
function isOperatorPenaltyCleared(uint256 _nodeOperatorId) view returns (bool)
```

### getLocator()

Returns the address of [`LidoLocator`](/contracts/lido-locator.md).

```solidity
function getLocator() view returns (ILidoLocator)
```

### getRewardDistributionState()

Gets the current reward distribution state. Anyone can monitor this state and distribute rewards (by calling `distributeReward`) among operators when it is `ReadyForDistribution`.

```solidity
enum RewardDistributionState {
	TransferredToModule,
	ReadyForDistribution,
	Distributed
}
```

```solidity
function getRewardDistributionState() public view returns (RewardDistributionState);
```

**Returns:**

| Name   | Type                    | Description                         |
|--------|-------------------------|-------------------------------------|
| state  | RewardDistributionState | Current reward distribution state   |

## Methods

### addNodeOperator()

Add node operator named `_name` with reward address `_rewardAddress` and staking limit = 0.

Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role.

```solidity
function addNodeOperator(
  string _name,
  address _rewardAddress
) returns (uint256 id);
```

| Name             | Type      | Description                                            |
|------------------|-----------|--------------------------------------------------------|
| `_name`          | `string`  | Human-readable name                                    |
| `_rewardAddress` | `address` | Address which receives stETH rewards for this operator |

Returns:

| Name | Type      | Description                        |
|------|-----------|------------------------------------|
| `id` | `uint256` | A unique key of the added operator |

### activateNodeOperator()

Activates deactivated node operator with given id.

Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role.

:::note
Increases the validators keys nonce
:::

```solidity
function activateNodeOperator(uint256 _nodeOperatorId);
```

| Name              | Type      | Description      |
|-------------------|-----------|------------------|
| `_nodeOperatorId` | `uint256` | Node operator id |

### deactivateNodeOperator()

Deactivates active node operator with given id.

Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role

:::note
Increases the validators keys nonce
:::

```solidity
function deactivateNodeOperator(uint256 _nodeOperatorId);
```

| Name              | Type      | Description      |
|-------------------|-----------|------------------|
| `_nodeOperatorId` | `uint256` | Node operator id |

### setNodeOperatorName()

Change human-readable name of the node operator with given id.

Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role.

```solidity
function setNodeOperatorName(uint256 _nodeOperatorId, string _name);
```

| Name              | Type      | Description         |
|-------------------|-----------|---------------------|
| `_nodeOperatorId` | `uint256` | Node operator id    |
| `_name`           | `string`  | Human-readable name |

### setNodeOperatorRewardAddress()

Change reward address of the node operator with given id.

Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role.

```solidity
function setNodeOperatorRewardAddress(uint256 _nodeOperatorId, address _rewardAddress);
```

| Name              | Type      | Description        |
|-------------------|-----------|--------------------|
| `_nodeOperatorId` | `uint256` | Node operator id   |
| `_rewardAddress`  | `address` | New reward address |

### setNodeOperatorStakingLimit()

Set the maximum number of validators to stake for the node operator with given id.

Executed on behalf of holder of `SET_NODE_OPERATOR_LIMIT_ROLE` role.

:::note
Current implementation preserves invariant:
`depositedSigningKeysCount <= vettedSigningKeysCount <= totalSigningKeysCount`.
If `_vettedSigningKeysCount` out of range `[depositedSigningKeysCount, totalSigningKeysCount]`,
the new vettedSigningKeysCount value will be set to the nearest range border.
:::

:::note
Increases the validators keys nonce
:::

```solidity
function setNodeOperatorStakingLimit(uint256 _nodeOperatorId, uint64 _vettedSigningKeysCount);
```

| Name                      | Type      | Description                               |
|---------------------------|-----------|-------------------------------------------|
| `_nodeOperatorId`         | `uint256` | Node operator id to set staking limit for |
| `_vettedSigningKeysCount` | `uint64`  | New staking limit of the node operator    |

### addSigningKeys()

Add `_keysCount` validator signing keys to the keys of the node operator `_nodeOperatorId`.

Can be executed for the given NO if called from the NO's reward address or by the holder of `MANAGE_SIGNING_KEYS` role.

:::note
Along with each key `pubkey`, a signature must be provided for the
`(pubkey, withdrawal_credentials, 32000000000)` message. For details, see the [keys section in the NO guide].

Given that information, the contract will be able to call `depositContract.deposit` on-chain.
:::

:::note
Increases the validators keys nonce
:::

```solidity
function addSigningKeys(
  uint256 _nodeOperatorId,
  uint256 _keysCount,
  bytes _publicKeys,
  bytes _signatures
);
```

| Name              | Type      | Description                                                                                         |
|-------------------|-----------|-----------------------------------------------------------------------------------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id                                                                                    |
| `_keysCount`      | `uint256` | Number of signing keys provided                                                                     |
| `_publicKeys`     | `bytes`   | Several concatenated validator signing public keys                                                  |
| `_signatures`     | `bytes`   | Several concatenated signatures for the DepositContract messages see the [keys section in NO guide] |

[keys section in NO guide]: /guides/curated-module/validator-keys.md#generating-signing-keys

### removeSigningKeys()

Removes an `_keysCount` of validator signing keys starting from `_fromIndex` of operator `_nodeOperatorId` usable keys.

Can be executed for the given NO if called from the NO's reward address or by the holder of `MANAGE_SIGNING_KEYS` role.

Keys are removed starting from the last index toward the highest one, so we won't go outside the array.

:::note
Increases the validators keys nonce
:::

```solidity
function removeSigningKeys(uint256 _nodeOperatorId, uint256 _fromIndex, uint256 _keysCount);
```

| Name              | Type      | Description                       |
|-------------------|-----------|-----------------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id                  |
| `_fromIndex`      | `uint256` | Index of the key, starting with 0 |
| `_keysCount`      | `uint256` | Number of keys to remove          |

### invalidateReadyToDepositKeysRange()

Invalidates all unused validator keys for node operators in the given range.
Executed on behalf of holder of `MANAGE_NODE_OPERATOR_ROLE` role.

```solidity
function invalidateReadyToDepositKeysRange(uint256 _indexFrom, uint256 _indexTo);
```

| Name         | Type      | Description                                                  |
|--------------|-----------|--------------------------------------------------------------|
| `_indexFrom` | `uint256` | The first index (inclusive) of the NO to invalidate keys for |
| `_indexTo`   | `uint256` | The last index (inclusive) of the NO to invalidate keys for  |

### distributeReward()

Permissionless method for distributing all accumulated module rewards among node operators based on the latest accounting report.

Rewards can be distributed after all necessary data required to distribute rewards among operators has been delivered, including exited and stuck keys.

The reward distribution lifecycle (see also [getRewardDistributionState](#getrewarddistributionstate)):

1. TransferredToModule: Rewards are transferred to the module during an oracle main report.
2. ReadyForDistribution: All necessary data required to distribute rewards among operators has been delivered.
3. Distributed: Rewards have been successfully distributed.

The function can only be called when the state is `ReadyForDistribution`.

```solidity
function distributeReward() external;
```

## reportValidatorExitDelay()

Handles the tracking and penalization logic for a node operator who fails to exit their validator within the defined exit window.

Marks a validator as late for the specified node operator using a proof timestamp and the elapsed eligibility-to-exit time. This information is then used by the module to apply exit-delay penalties to the node operator, if applicable.

Called by the StakingRouter.

```solidity
function reportValidatorExitDelay(
  uint256 _nodeOperatorId,
  uint256 _proofSlotTimestamp,
  bytes _publicKey,
  uint256 _eligibleToExitInSec
) external;
```

| Name                   | Type      | Description                                                              |
|------------------------|-----------|--------------------------------------------------------------------------|
| `_nodeOperatorId`      | `uint256` | Node operator id                                                         |
| `_proofSlotTimestamp`  | `uint256` | Beacon slot timestamp used as a proof reference for the validator status |
| `_publicKey`           | `bytes`   | Validator BLS public key                                                 |
| `_eligibleToExitInSec` | `uint256` | How many seconds the validator has been eligible to exit up to the proof |

## onValidatorExitTriggered()

Handles a triggerable exit event for a validator belonging to a specific node operator.

Called by the StakingRouter when a validator exit is initiated on the Execution Layer (via a withdrawal request). Records the trigger context and may affect the applicability of exit-delay penalties for the operator.

```solidity
function onValidatorExitTriggered(
  uint256 _nodeOperatorId,
  bytes _publicKey,
  uint256 _withdrawalRequestPaidFee,
  uint256 _exitType
) external;
```

| Name                        | Type      | Description                                                                |
|-----------------------------|-----------|----------------------------------------------------------------------------|
| `_nodeOperatorId`           | `uint256` | Node operator id                                                           |
| `_publicKey`                | `bytes`   | Validator BLS public key                                                   |
| `_withdrawalRequestPaidFee` | `uint256` | Fee paid to submit the withdrawal/exit request (units as defined by SR/WQ) |
| `_exitType`                 | `uint256` | Exit trigger type code as defined by the StakingRouter                     |

## isValidatorExitDelayPenaltyApplicable()

Determines whether a validator's exit delay should be considered when penalizing the node operator.

Use this view to check if the module expects an update for the given validator and whether the elapsed eligibility-to-exit time indicates that an exit-delay penalty may apply.

```solidity
function isValidatorExitDelayPenaltyApplicable(
  uint256 _nodeOperatorId,
  uint256 _proofSlotTimestamp,
  bytes _publicKey,
  uint256 _eligibleToExitInSec
) external view returns (bool);
```

| Name                   | Type      | Description                                              |
|------------------------|-----------|----------------------------------------------------------|
| `_nodeOperatorId`      | `uint256` | Node operator id                                         |
| `_proofSlotTimestamp`  | `uint256` | Beacon slot timestamp reference                          |
| `_publicKey`           | `bytes`   | Validator BLS public key                                 |
| `_eligibleToExitInSec` | `uint256` | How many seconds the validator has been eligible to exit |

Returns:

| Name                  | Type   | Description                                                               |
|-----------------------|--------|---------------------------------------------------------------------------|
| `isPenaltyApplicable` | `bool` | True if the exit-delay update should be accepted and may affect penalties |

## exitDeadlineThreshold()

Returns the number of seconds after which a validator is considered late for a specified node operator.

```solidity
function exitDeadlineThreshold(uint256 _nodeOperatorId) external view returns (uint256);
```

| Name              | Type      | Description       |
|-------------------|-----------|-------------------|
| `_nodeOperatorId` | `uint256` | Node operator id  |

Returns:

| Name                | Type      | Description                                         |
|---------------------|-----------|-----------------------------------------------------|
| `deadlineInSeconds` | `uint256` | Exit deadline threshold in seconds for specified NO |

## isValidatorExitingKeyReported()

Returns whether a validator's key has already been reported as late for a specified node operator.

```solidity
function isValidatorExitingKeyReported(uint256 _nodeOperatorId, bytes _publicKey) external view returns (bool);
```

| Name              | Type      | Description              |
|-------------------|-----------|--------------------------|
| `_nodeOperatorId` | `uint256` | Node operator id         |
| `_publicKey`      | `bytes`   | Validator BLS public key |

Returns:

| Name            | Type   | Description                                   |
|-----------------|--------|-----------------------------------------------|
| `isKeyReported` | `bool` | True if the validator exit delay was reported |
