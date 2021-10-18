# NodeOperatorsRegistry

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)
- [Deployed Contract](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5)

Node Operators act as validators on the Beacon chain for the benefit of the protocol. The DAO selects node operators and adds their addresses to the NodeOperatorsRegistry contract. Authorized operators have to generate a set of keys for the validation and also provide them with the smart contract. As Ether is received from users, it is distributed in chunks of 32 Ether between all active Node Operators. The contract contains a list of operators, their keys, and the logic for distributing rewards between them. The DAO can deactivate misbehaving operators.

## View Methods

### getRewardsDistribution()

Returns the rewards distribution proportional to the effective stake for each node operator

```sol
function getRewardsDistribution(uint256 _totalRewardShares) returns (
  address[] recipients,
  uint256[] shares
)
```

#### Parameters:

| Name                 | Type      | Description                                 |
| -------------------- | --------- | ------------------------------------------- |
| `_totalRewardShares` | `uint256` | Total amount of reward shares to distribute |

### getActiveNodeOperatorsCount()

Returns number of active node operators

```sol
function getActiveNodeOperatorsCount() returns (uint256)
```

### getNodeOperator()

Returns the n-th node operator

```sol
function getNodeOperator(uint256 _id, bool _fullInfo) returns (
    bool active,
    string name,
    address rewardAddress,
    uint64 stakingLimit,
    uint64 stoppedValidators,
    uint64 totalSigningKeys,
    uint64 usedSigningKeys
)
```

#### Parameters:

| Name        | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| `_id`       | `uint256` | Node Operator id                       |
| `_fullInfo` | `bool`    | If true, name will be returned as well |

### getTotalSigningKeyCount()

Returns total number of signing keys of the node operator

```sol
function getTotalSigningKeyCount(uint256 _operator_id) returns (uint256)
```

#### Parameters:

| Name           | Type      | Description      |
| -------------- | --------- | ---------------- |
| `_operator_id` | `uint256` | Node Operator id |

### getUnusedSigningKeyCount()

Returns number of usable signing keys of the node operator

```sol
function getUnusedSigningKeyCount(uint256 _operator_id) returns (uint256)
```

#### Parameters:

| Name           | Type      | Description      |
| -------------- | --------- | ---------------- |
| `_operator_id` | `uint256` | Node Operator id |

### getSigningKey()

Returns n-th signing key of the node operator

```sol
function getSigningKey(uint256 _operator_id, uint256 _index) returns (
  bytes key,
  bytes depositSignature,
  bool used
)
```

#### Parameters:

| Name           | Type      | Description                        |
| -------------- | --------- | ---------------------------------- |
| `_operator_id` | `uint256` | Node Operator id                   |
| `_index`       | `uint256` | Index of the key, starting with 0d |

#### Returns:

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| `key`              | `bytes` | Key                                                   |
| `depositSignature` | `bytes` | Signature needed for a `depositContract.deposit` call |
| `used`             | `bool`  | Flag indication if the key was used in the staking    |

### getNodeOperatorsCount()

Returns total number of node operators

```sol
function getNodeOperatorsCount() returns (uint256)
```

### getKeysOpIndex()
Returns a monotonically increasing counter that gets incremented when any of the following happens:
1. a node operator's key(s) is added;
2. a node operator's key(s) is removed;
3. a node operator's approved keys limit is changed.

```sol
function getKeysOpIndex() public view returns (uint256)
```

## Methods

### addNodeOperator()

Add node operator named `_name` with reward address `_rewardAddress` and staking limit `_stakingLimit`

```sol
function addNodeOperator(
  string _name,
  address _rewardAddress,
  uint64 _stakingLimit
) returns (uint256 id)
```

#### Parameters:

| Name             | Type      | Description                                                       |
| ---------------- | --------- | ----------------------------------------------------------------- |
| `_name`          | `string`  | Human-readable name                                               |
| `_rewardAddress` | `address` | Ethereum 1 address which receives stETH rewards for this operator |
| `_stakingLimit`  | `uint64`  | The maximum number of validators to stake for this operator       |

#### Returns:

| Name | Type      | Description                        |
| ---- | --------- | ---------------------------------- |
| `id` | `uint256` | A unique key of the added operator |

### setNodeOperatorActive()

Activate or disable node operator with given id

```sol
function setNodeOperatorActive(uint256 _id, bool _active)
```

#### Parameters:

| Name      | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `_id`     | `uint256` | Node Operator id                  |
| `_active` | `bool`    | Activate or disable node operator |

### setNodeOperatorName()

Change human-readable name of the node operator `_id` to `_name`

```sol
function setNodeOperatorName(uint256 _id, string _name)
```

#### Parameters:

| Name    | Type      | Description         |
| ------- | --------- | ------------------- |
| `_id`   | `uint256` | Node Operator id    |
| `_name` | `string`  | Human-readable name |

### setNodeOperatorRewardAddress()

Change reward address of the node operator `_id` to `_rewardAddress`

```sol
function setNodeOperatorRewardAddress(uint256 _id, address _rewardAddress)
```

#### Parameters:

| Name             | Type      | Description        |
| ---------------- | --------- | ------------------ |
| `_id`            | `uint256` | Node Operator id   |
| `_rewardAddress` | `address` | New reward address |

### setNodeOperatorStakingLimit()

Set the maximum number of validators to stake for the node operator `_id` to `_stakingLimit`

```sol
function setNodeOperatorStakingLimit(uint256 _id, uint64 _stakingLimit)
```

#### Parameters:

| Name            | Type      | Description                       |
| --------------- | --------- | --------------------------------- |
| `_id`           | `uint256` | Node Operator id                  |
| `_stakingLimit` | `address` | Max number of validators to stake |

### reportStoppedValidators()

Report `_stoppedIncrement` more stopped validators of the node operator `_id`

```sol
function reportStoppedValidators(uint256 _id, uint64 _stoppedIncrement)
```

#### Parameters:

| Name                | Type      | Description                              |
| ------------------- | --------- | ---------------------------------------- |
| `_id`               | `uint256` | Node Operator id                         |
| `_stoppedIncrement` | `uint64`  | Count of stopped validators to increment |

### trimUnusedKeys()

Remove unused signing keys

```sol
function trimUnusedKeys()
```

:::note
Function is used by the Lido contract
:::

### addSigningKeys()

Add `_quantity` validator signing keys of operator `_id` to the set of usable keys.
Concatenated keys are: `_pubkeys`.
Can be done by the DAO in question by using the designated rewards address.

```sol
function addSigningKeys(
  uint256 _operator_id,
  uint256 _quantity,
  bytes _pubkeys,
  bytes _signatures
)
```

:::note
Along with each key the DAO has to provide a signatures for the
(pubkey, withdrawal_credentials, 32000000000) message.

Given that information, the contract'll be able to call
`depositContract.deposit` on-chain.
:::

#### Parameters:

| Name           | Type      | Description                                                                                |
| -------------- | --------- | ------------------------------------------------------------------------------------------ |
| `_operator_id` | `uint256` | Node Operator id                                                                           |
| `_quantity`    | `uint64`  | Number of signing keys provided                                                            |
| `_pubkeys`     | `bytes`   | Several concatenated validator signing keys                                                |
| `_signatures`  | `bytes`   | Several concatenated signatures for (pubkey, withdrawal_credentials, 32000000000) messages |

### addSigningKeysOperatorBH()

Add `_quantity` validator signing keys of operator `_id` to the set of usable keys.
Concatenated keys are: `_pubkeys`.
Can be done by node operator in question by using the designated rewards address.

```sol
function addSigningKeysOperatorBH(
  uint256 _operator_id,
  uint256 _quantity,
  bytes _pubkeys,
  bytes _signatures
)
```

:::note
Along with each key the DAO has to provide a signatures for the
(pubkey, withdrawal_credentials, 32000000000) message.

Given that information, the contract'll be able to call
`depositContract.deposit` on-chain.
:::

#### Parameters:

| Name           | Type      | Description                                                                                |
| -------------- | --------- | ------------------------------------------------------------------------------------------ |
| `_operator_id` | `uint256` | Node Operator id                                                                           |
| `_quantity`    | `uint64`  | Number of signing keys provided                                                            |
| `_pubkeys`     | `bytes`   | Several concatenated validator signing keys                                                |
| `_signatures`  | `bytes`   | Several concatenated signatures for (pubkey, withdrawal_credentials, 32000000000) messages |

### removeSigningKey()

Removes a validator signing key #`_index` of operator #`_id` from the set of usable keys. Executed on behalf of DAO.

```sol
function removeSigningKey(uint256 _operator_id, uint256 _index)
```

#### Parameters:

| Name           | Type      | Description                       |
| -------------- | --------- | --------------------------------- |
| `_operator_id` | `uint256` | Node Operator id                  |
| `_index`       | `uint256` | Index of the key, starting with 0 |

### removeSigningKeyOperatorBH()

Removes a validator signing key `_index` of operator `_id` from the set of usable keys. Executed on behalf of Node Operator.

```sol
function removeSigningKeyOperatorBH(uint256 _operator_id, uint256 _index)
```

#### Parameters:

| Name           | Type      | Description                       |
| -------------- | --------- | --------------------------------- |
| `_operator_id` | `uint256` | Node Operator id                  |
| `_index`       | `uint256` | Index of the key, starting with 0 |

### assignNextSigningKeys()

Selects and returns at most `_numKeys` signing keys (as well as the corresponding
signatures) from the set of active keys and marks the selected keys as used.
May only be called by the Lido contract.

```sol
function assignNextSigningKeys(uint256 _numKeys) returns (
  bytes memory pubkeys,
  bytes memory signatures
)
```

#### Parameters:

| Name       | Type    | Description                                                                                                  |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `_pubkeys` | `bytes` | The number of keys to select. The actual number of selected keys may be less due to the lack of active keys. |

#### Returns:

| Name          | Type    | Description                                                                                |
| ------------- | ------- | ------------------------------------------------------------------------------------------ |
| `_pubkeys`    | `bytes` | Several concatenated validator signing keys                                                |
| `_signatures` | `bytes` | Several concatenated signatures for (pubkey, withdrawal_credentials, 32000000000) messages |
