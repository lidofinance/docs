# NodeOperatorsRegistry

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)
- [Deployed Contract](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5)

The `NodeOperatorsRegistry` contract acts as a registry of Node Operators selected by Lido DAO.
After [Lido V2 upgrade](https://blog.lido.fi/introducing-lido-v2/) `NodeOperatorsRegistry` contract became a module of [`StakingRouter`](./staking-router.md). The new name for `NodeOperatorsRegistry` contract as part of the entire Lido staking platform is **Curated staking module**. As a staking module, `NodeOperatorsRegistry` supports [StakingModule interface](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol).

As Ether is received from [`StakingRouter`](./staking-router.md) on oracle report, it is distributed in chunks of 32 Ether between all active, not penalized Node Operators.

 If NO does not exit its validators on a request from [`ValidatorsExitBusOracle`](./validators-exit-bus-oracle.md) in proper time, it might get penalized. In this case, the NO do not get new ether for deposits and also receives half of its rewards till the penalty is cleared. To clear the penalty, the NO must exit the stuck validators or refund the corresponding Ether amount and wait `getStuckPenaltyDelay()` seconds after that.

 The Lido DAO can also deactivate misbehaving operators by `deactivateNodeOperator()`.

For each NO the contract keeps a record of at least these values:
- `active: bool` if the NO is active
- `name: string` human-readable name of the NO
- `rewardAddress: address` where to send stETH rewards
- `totalVettedValidators: uint64` Max number of validator keys approved for deposit by the DAO
- `totalExitedValidators: uint64` incremental counter of all exited validators for the NO so far
- `totalAddedValidators: uint64` incremental counter of all added to the NO validators so far
- `totalDepositedValidators: uint64` incremental counter of all deposited validators for the NO so far
- `targetValidatorsCount: uint256` hard limit for the number of validators for the NO. If the current active number of validators is below the value, the excess ones will be exited. Allocation of deposits above the hard limit is prohibited. The hard limit works only if `isTargetLimitActive` is true.
- `isTargetLimitActive: bool` flag whether NO validators number is hard-limited (see `targetValidatorsCount`)
- `stuckValidatorsCount: uint256` number of stuck keys delivered by the oracle report
- `refundedValidatorsCount: uint256` number of validators refunded
- `depositableValidatorsCount: uint256` number of depositable validators

The values can be viewed by means of `getNodeOperator()` and `getNodeOperatorSummary()`.

Except for the function listed below, the contract has methods accessible only by [`StakingRouter`](./staking-router.md) (holder of `STAKING_ROUTER_ROLE`). These functions are called internally in the course of [`AccountingOracle`](./accounting-oracle.md) report.

## View Methods

### getRewardsDistribution()

Returns the rewards distribution proportional to the effective stake for each node operator

```sol
function getRewardsDistribution(uint256 _totalRewardShares) returns (
  address[] recipients,
  uint256[] shares,
  bool[] penalized
)
```

#### Parameters

| Name                 | Type      | Description                                 |
| -------------------- | --------- | ------------------------------------------- |
| `_totalRewardShares` | `uint256` | Total amount of reward shares to distribute |

### getActiveNodeOperatorsCount()

Returns the number of active node operators.

```sol
function getActiveNodeOperatorsCount() returns (uint256)
```

### getNodeOperator()

Returns the node operator by id.

```sol
function getNodeOperator(uint256 _nodeOperatorId, bool _fullInfo) returns (
    bool active,
    string name,
    address rewardAddress,
    uint64 totalVettedValidators,
    uint64 totalExitedValidators,
    uint64 totalAddedValidators,
    uint64 totalDepositedValidators
)
```

#### Parameters

| Name              | Type      | Description                            |
| ----------------- | --------- | -------------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                       |
| `_fullInfo`       | `bool`    | If true, name will be returned as well |

### getTotalSigningKeyCount()

Returns the total number of signing keys of the node operator.

```sol
function getTotalSigningKeyCount(uint256 _nodeOperatorId) returns (uint256)
```

#### Parameters

| Name              | Type      | Description      |
| ----------------- | --------- | ---------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id |

### getUnusedSigningKeyCount()

Returns the number of usable signing keys of the node operator.

```sol
function getUnusedSigningKeyCount(uint256 _nodeOperatorId) returns (uint256)
```

#### Parameters

| Name              | Type      | Description      |
| ----------------- | --------- | ---------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id |

### getSigningKey()

Returns n-th signing key of the node operator.

```sol
function getSigningKey(uint256 _nodeOperatorId, uint256 _index) returns (
    bytes key,
    bytes depositSignature,
    bool used
)
```

#### Parameters

| Name              | Type      | Description                       |
| ----------------- | --------- | --------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                  |
| `_index`          | `uint256` | Index of the key, starting with 0 |

#### Returns

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| `key`              | `bytes` | Key                                                   |
| `depositSignature` | `bytes` | Signature needed for a `depositContract.deposit` call |
| `used`             | `bool`  | Flag indication if the key was used in the staking    |

### getSigningKeys()

Returns `_limit` signing keys of the node operator.

```sol
function getSigningKey(uint256 _nodeOperatorId, uint256 _offset, uint256 _limit) returns (
    bytes pubkeys,
    bytes signatures,
    bool[] used
)
```

#### Parameters

| Name              | Type      | Description                        |
| ----------------- | --------- | ---------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                   |
| `_offset`         | `uint256` | Offset of the key, starting with 0 |
| `_limit`          | `uint256` | Number of keys to return           |

#### Returns

| Name         | Type     | Description                                                                             |
| ------------ | -------- | --------------------------------------------------------------------------------------- |
| `pubkeys`    | `bytes`  | Keys concatenated into the bytes batch                                                  |
| `signatures` | `bytes`  | Signatures concatenated into the bytes batch needed for a deposit_contract.deposit call |
| `used`       | `bool[]` | Array of flags indicated if the key was used in the staking                             |

### getNodeOperatorsCount()

Returns the total number of node operators.

```sol
function getNodeOperatorsCount() returns (uint256)
```

### getKeysOpIndex()

:::note
DEPRECATED use getNonce() instead
:::

Returns a counter that MUST change its value whenever the deposit data set changes.
Below is the typical list of actions that requires an update of the nonce:
1. a node operator's deposit data is added
2. a node operator's deposit data is removed
3. a node operator's ready-to-deposit data size is changed
4. a node operator was activated/deactivated
5. a node operator's deposit data is used for the deposit

:::note
Note: Depending on the StakingModule implementation above list might be extended
:::

```sol
function getKeysOpIndex() view returns (uint256)
```

### getNonce()

Returns a counter that MUST change its value whenever the deposit data set changes.
Below is the typical list of actions that requires an update of the nonce:
1. a node operator's deposit data is added;
2. a node operator's deposit data is removed;
3. a node operator's ready-to-deposit data size is changed;
4. a node operator was activated/deactivated;
5. a node operator's deposit data is used for the deposit.

:::note
Note: Depending on the StakingModule implementation above list might be extended
:::

```sol
function getNonce() view returns (uint256)
```

### getType()

Returns the type of the staking module.

```sol
function getType() view returns (bytes32)
```

### getStakingModuleSummary()

Returns some statistics of the staking module.

```sol
function getStakingModuleSummary() view returns (
    uint256 totalExitedValidators,
    uint256 totalDepositedValidators,
    uint256 depositableValidatorsCount
)
```

#### Returns

| Name                         | Type      | Description                                 |
| ---------------------------- | --------- | ------------------------------------------- |
| `totalExitedValidators`      | `uint256` | Total number of exited validators           |
| `totalDepositedValidators`   | `uint256` | Total number of deposited validators        |
| `depositableValidatorsCount` | `uint256` | Number of validators which can be deposited |

### getNodeOperatorIsActive()

Returns if the node operator with given id is active.

```sol
function getNodeOperatorIsActive(uint256 _nodeOperatorId) view returns (bool)
```

#### Parameters

| Name              | Type      | Description      |
| ----------------- | --------- | ---------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id |

### getNodeOperatorIds()

Returns up to `_limit` node operator ids starting from the `_offset`.

```sol
function getNodeOperatorIds(uint256 _offset, uint256 _limit) view
    returns (uint256[] memory nodeOperatorIds)
```

#### Parameters

| Name      | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `_offset` | `uint256` | Offset of the first element of the range |
| `_limit`  | `uint256` | Max number of NO ids to return           |

### getNodeOperatorSummary()

Returns some statistics of the staking module.

```sol
function getNodeOperatorSummary(uint256 _nodeOperatorId) view returns (
    bool isTargetLimitActive,
    uint256 targetValidatorsCount,
    uint256 stuckValidatorsCount,
    uint256 refundedValidatorsCount,
    uint256 stuckPenaltyEndTimestamp,
    uint256 totalExitedValidators,
    uint256 totalDepositedValidators,
    uint256 depositableValidatorsCount
)
```

#### Returns

| Name                         | Type      | Description                                                                                 |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `isTargetLimitActive`        | `bool`    | Is limiting target active validators count for NO enabled                                   |
| `targetValidatorsCount`      | `uint256` | Used to check how many keys should go to exit, 0 - means all deposited keys would be exited |
| `stuckValidatorsCount`       | `uint256` | Number of stuck keys from oracle report                                                     |
| `refundedValidatorsCount`    | `uint256` | Number of refunded keys                                                                     |
| `stuckPenaltyEndTimestamp`   | `uint256` | Extra penalty time after stuck keys resolved (refunded)                                     |
| `totalExitedValidators`      | `uint256` | Number of keys in the EXITED state of the NO for all time                                   |
| `totalDepositedValidators`   | `uint256` | Number of keys of the NO which were in DEPOSITED state for all time                         |
| `depositableValidatorsCount` | `uint256` | Number of validators which can be deposited                                                 |

### getStuckPenaltyDelay()

Returns value of the stuck penalty delay (in seconds).
This parameter defines how long a penalized NO stays in penalty state after the stuck keys were resolved.

```sol
function getStuckPenaltyDelay() view returns (uint256)
```

### isOperatorPenalized()

Returns flag whether the NO is penalized.

```sol
function isOperatorPenalized(uint256 _nodeOperatorId) view returns (bool)
```

### isOperatorPenaltyCleared()

Returns flag whether the NO penalty is cleared.

```sol
function isOperatorPenalized(uint256 _nodeOperatorId) view returns (bool)
```

### getLocator()

Returns the address of [`LidoLocator`](./lido-locator.md).

```sol
function getLocator() view returns (ILidoLocator)
```

## Methods

### addNodeOperator()

Add node operator named `_name` with reward address `_rewardAddress` and staking limit = 0.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

```sol
function addNodeOperator(
  string _name,
  address _rewardAddress
) returns (uint256 id)
```

#### Parameters

| Name             | Type      | Description                                            |
| ---------------- | --------- | ------------------------------------------------------ |
| `_name`          | `string`  | Human-readable name                                    |
| `_rewardAddress` | `address` | Address which receives stETH rewards for this operator |

#### Returns

| Name | Type      | Description                        |
| ---- | --------- | ---------------------------------- |
| `id` | `uint256` | A unique key of the added operator |

### activateNodeOperator()

Activates deactivated node operator with given id.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

:::note
Increases the validators keys nonce
:::

```sol
function activateNodeOperator(uint256 _nodeOperatorId)
```

#### Parameters

| Name              | Type      | Description      |
| ----------------- | --------- | ---------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id |

### deactivateNodeOperator()

Deactivates active node operator with given id.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

:::note
Increases the validators keys nonce
:::

```sol
function deactivateNodeOperator(uint256 _nodeOperatorId)
```

#### Parameters

| Name              | Type      | Description      |
| ----------------- | --------- | ---------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id |

### setNodeOperatorName()

Change human-readable name of the node operator with given id.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

```sol
function setNodeOperatorName(uint256 _nodeOperatorId, string _name)
```

#### Parameters

| Name              | Type      | Description         |
| ----------------- | --------- | ------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id    |
| `_name`           | `string`  | Human-readable name |

### setNodeOperatorRewardAddress()

Change reward address of the node operator with given id.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

```sol
function setNodeOperatorRewardAddress(uint256 _nodeOperatorId, address _rewardAddress)
```

#### Parameters

| Name              | Type      | Description        |
| ----------------- | --------- | ------------------ |
| `_nodeOperatorId` | `uint256` | Node Operator id   |
| `_rewardAddress`  | `address` | New reward address |

### setNodeOperatorStakingLimit()

Set the maximum number of validators to stake for the node operator with given id.

```sol
function setNodeOperatorStakingLimit(uint256 _nodeOperatorId, uint64 _vettedSigningKeysCount)
```

:::note
Current implementation preserves invariant:
`depositedSigningKeysCount <= vettedSigningKeysCount <= totalSigningKeysCount`.
If `_vettedSigningKeysCount` out of range `[depositedSigningKeysCount, totalSigningKeysCount]`,
the new vettedSigningKeysCount value will be set to the nearest range border.
:::

:::note
Increases the validators keys nonce
:::

#### Parameters

| Name                      | Type      | Description                               |
| ------------------------- | --------- | ----------------------------------------- |
| `_nodeOperatorId`         | `uint256` | Node operator id to set staking limit for |
| `_vettedSigningKeysCount` | `address` | New staking limit of the node operator    |


### addSigningKeys()

Add `_quantity` validator signing keys to the keys of the node operator `_nodeOperatorId`.
Concatenated keys are: `_pubkeys`
Can be done by the DAO in question by using the designated rewards address.

:::note
Increases the validators keys nonce
:::

```sol
function addSigningKeys(
  uint256 _nodeOperatorId,
  uint256 _keysCount,
  bytes _publicKeys,
  bytes _signatures
)
```

:::note
Along with each key the DAO has to provide a signatures for the
`(pubkey, withdrawal_credentials, 32000000000)` message.

Given that information, the contract'll be able to call deposit_contract.deposit on-chain.
:::

#### Parameters

| Name              | Type      | Description                                                                                |
| ----------------- | --------- | ------------------------------------------------------------------------------------------ |
| `_nodeOperatorId` | `uint256` | Node Operator id                                                                           |
| `_keysCount`      | `uint256` | Number of signing keys provided                                                            |
| `_pubkeys`        | `bytes`   | Several concatenated validator signing keys                                                |
| `_signatures`     | `bytes`   | Several concatenated signatures for (pubkey, withdrawal_credentials, 32000000000) messages |

### addSigningKeysOperatorBH()

Add `_quantity` validator signing keys of operator `_id` to the set of usable keys.
Concatenated keys are: `_pubkeys`.
Can be done by node operator in question by using the designated rewards address.

```sol
function addSigningKeysOperatorBH(
  uint256 _nodeOperatorId,
  uint256 _keysCount,
  bytes _pubkeys,
  bytes _signatures
)
```

:::note
Along with each key the DAO has to provide a signatures for the
`(pubkey, withdrawal_credentials, 32000000000)` message.

Given that information, the contract'll be able to call
`depositContract.deposit` on-chain.
:::

#### Parameters

| Name              | Type      | Description                                                                                |
| ----------------- | --------- | ------------------------------------------------------------------------------------------ |
| `_nodeOperatorId` | `uint256` | Node Operator id                                                                           |
| `_keysCount`      | `uint256` | Number of signing keys provided                                                            |
| `_pubkeys`        | `bytes`   | Several concatenated validator signing keys                                                |
| `_signatures`     | `bytes`   | Several concatenated signatures for (pubkey, withdrawal_credentials, 32000000000) messages |

### removeSigningKey()

:::note
DEPRECATED use removeSigningKeys instead
:::

Removes a validator signing key `_index` of operator `_id` from the set of usable keys. Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

:::note
Increases the validators keys nonce
:::

```sol
function removeSigningKey(uint256 _nodeOperatorId, uint256 _index)
```

#### Parameters

| Name              | Type      | Description                       |
| ----------------- | --------- | --------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                  |
| `_index`          | `uint256` | Index of the key, starting with 0 |

### removeSigningKeys()
Removes an `_keysCount` of validator signing keys starting from `_fromIndex`
of operator `_nodeOperatorId` usable keys. Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

Keys removing from the last index to the highest one, so we won't get outside the array.

:::note
Increases the validators keys nonce
:::

```sol
function removeSigningKeys(uint256 _nodeOperatorId, uint256 _fromIndex, uint256 _keysCount)
```

#### Parameters

| Name              | Type      | Description                       |
| ----------------- | --------- | --------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                  |
| `_fromIndex`      | `uint256` | Index of the key, starting with 0 |
| `_keysCount`      | `uint256` | Number of keys to remove          |

### removeSigningKeyOperatorBH()

:::note
DEPRECATED use removeSigningKeys instead
:::

Removes a validator signing key `_nodeOperatorId` of operator `_id` from the set of usable keys.
Executed on behalf of Node Operator.

```sol
function removeSigningKeyOperatorBH(uint256 _nodeOperatorId, uint256 _index)
```

#### Parameters

| Name              | Type      | Description                       |
| ----------------- | --------- | --------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                  |
| `_index`          | `uint256` | Index of the key, starting with 0 |

### removeSigningKeysOperatorBH()

:::note
DEPRECATED use removeSigningKeys instead
:::

Removes an `_keysCount` of validator signing keys starting from `_fromIndex` of operator `_nodeOperatorId` usable keys.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

Keys removing from the last index to the highest one, so we won't get outside the array.

```sol
function removeSigningKeysOperatorBH(uint256 _nodeOperatorId, uint256 _fromIndex, uint256 _keysCount)
```

#### Parameters

| Name              | Type      | Description                       |
| ----------------- | --------- | --------------------------------- |
| `_nodeOperatorId` | `uint256` | Node Operator id                  |
| `_fromIndex`      | `uint256` | Index of the key, starting with 0 |
| `_keysCount`      | `uint256` | Amount of keys                    |

### invalidateReadyToDepositKeysRange()

Invalidates all unused validators keys for node operators in the given range.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

```sol
function invalidateReadyToDepositKeysRange(uint256 _indexFrom, uint256 _indexTo)
```

#### Parameters

| Name         | Type      | Description                                                  |
| ------------ | --------- | ------------------------------------------------------------ |
| `_indexFrom` | `uint256` | the first index (inclusive) of the NO to invalidate keys for |
| `_indexTo`   | `uint256` | The last index (inclusive) of the NO to invalidate keys for  |


### clearNodeOperatorPenalty()

Clears penalty state for the NO if it is suitable for clearing.
The penalty state is switched automatically upon oracle report if the conditions are met
(e. g. if penalty delay expired), but this function allows it to happen quicker.
Can be called by anyone.

```sol
function clearNodeOperatorPenalty(uint256 _nodeOperatorId) external returns (bool)
```

#### Parameters

| Name              | Type      | Description  |
| ----------------- | --------- | ------------ |
| `_nodeOperatorId` | `uint256` | Id of the NO |

### setStuckPenaltyDelay()

Sets the stuck penalty delay parameter.

Add node operator named `_name` with reward address `_rewardAddress` and staking limit = 0.
Executed on behalf of DAO (holder of `MANAGE_NODE_OPERATOR_ROLE` role).

```sol
function setStuckPenaltyDelay(uint256 _delay)
```

#### Parameters

| Name     | Type      | Description         |
| -------- | --------- | ------------------- |
| `_delay` | `uint256` | Stuck penalty delay |
