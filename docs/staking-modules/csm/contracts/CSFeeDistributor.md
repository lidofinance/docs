# CSFeeDistributor

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSFeeDistributor.sol)
- [Deployed contract](https://etherscan.io/address/0xD99CC66fEC647E68294C6477B40fC7E0F6F618D0)

CSFeeDistributor.sol is the supplementary contract that stores non-claimed and non-distributed Node Operator rewards on balance and the latest root of a rewards distribution Merkle tree root. It accepts calls from CSAccounting.sol with reward claim requests and stores data about already claimed rewards by the Node Operator. It receives non-distributed rewards from the CSModule.sol each time the StakingRouter mints the new portion of the Node Operators' rewards.

## Upgradability

The contract uses [OssifiableProxy](../../../contracts/ossifiable-proxy.md) for upgradability.

## State Variables

### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```

### STETH

```solidity
IStETH public immutable STETH;
```

### ACCOUNTING

```solidity
address public immutable ACCOUNTING;
```

### ORACLE

```solidity
address public immutable ORACLE;
```

### treeRoot

Merkle Tree root

```solidity
bytes32 public treeRoot;
```

### treeCid

CID of the published Merkle tree

```solidity
string public treeCid;
```

### logCid

CID of the file with log of the last frame reported

```solidity
string public logCid;
```

### distributedShares

Amount of stETH shares sent to the Accounting in favor of the NO

```solidity
mapping(uint256 => uint256) public distributedShares;
```

### totalClaimableShares

Total Amount of stETH shares available for claiming by NOs

```solidity
uint256 public totalClaimableShares;
```

## Functions

### distributeFees

Distribute fees to the Accounting in favor of the Node Operator

```solidity
function distributeFees(
  uint256 nodeOperatorId,
  uint256 shares,
  bytes32[] calldata proof
) external returns (uint256 sharesToDistribute);
```

**Parameters**

| Name             | Type        | Description                                 |
| ---------------- | ----------- | ------------------------------------------- |
| `nodeOperatorId` | `uint256`   | ID of the Node Operator                     |
| `shares`         | `uint256`   | Total Amount of stETH shares earned as fees |
| `proof`          | `bytes32[]` | Merkle proof of the leaf                    |

**Returns**

| Name                 | Type      | Description                        |
| -------------------- | --------- | ---------------------------------- |
| `sharesToDistribute` | `uint256` | Amount of stETH shares distributed |

### processOracleReport

Receive the data of the Merkle tree from the Oracle contract and process it

```solidity
function processOracleReport(
  bytes32 _treeRoot,
  string calldata _treeCid,
  string calldata _logCid,
  uint256 distributed
) external;
```

### pendingSharesToDistribute

Get the Amount of stETH shares that are pending to be distributed

```solidity
function pendingSharesToDistribute() external view returns (uint256);
```

**Returns**

| Name     | Type      | Description                                                |
| -------- | --------- | ---------------------------------------------------------- |
| `<none>` | `uint256` | pendingShares Amount shares that are pending to distribute |

### getFeesToDistribute

Get the Amount of stETH shares that can be distributed in favor of the Node Operator

```solidity
function getFeesToDistribute(
  uint256 nodeOperatorId,
  uint256 shares,
  bytes32[] calldata proof
) public view returns (uint256 sharesToDistribute);
```

**Parameters**

| Name             | Type        | Description                                 |
| ---------------- | ----------- | ------------------------------------------- |
| `nodeOperatorId` | `uint256`   | ID of the Node Operator                     |
| `shares`         | `uint256`   | Total Amount of stETH shares earned as fees |
| `proof`          | `bytes32[]` | Merkle proof of the leaf                    |

**Returns**

| Name                 | Type      | Description                                    |
| -------------------- | --------- | ---------------------------------------------- |
| `sharesToDistribute` | `uint256` | Amount of stETH shares that can be distributed |

### hashLeaf

Get a hash of a leaf

_Double hash the leaf to prevent second preimage attacks_

```solidity
function hashLeaf(uint256 nodeOperatorId, uint256 shares) public pure returns (bytes32);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |
| `shares`         | `uint256` | Amount of stETH shares  |

**Returns**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `<none>` | `bytes32` | Hash of the leaf |

## Events

### FeeDistributed

_Emitted when fees are distributed_

```solidity
event FeeDistributed(uint256 indexed nodeOperatorId, uint256 shares);
```

### DistributionDataUpdated

_Emitted when distribution data is updated_

```solidity
event DistributionDataUpdated(uint256 totalClaimableShares, bytes32 treeRoot, string treeCid);
```

### DistributionLogUpdated

_Emitted when distribution log is updated_

```solidity
event DistributionLogUpdated(string logCid);
```
