# CSEarlyAdoption

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSEarlyAdoption.sol)
- [Deployed contract](https://etherscan.io/address/0x3D5148ad93e2ae5DedD1f7A8B3C19E7F67F90c0E)

CSEarlyAdoption.sol is the supplementary contract responsible for the Early Adoption members' verification. It validates if the address is eligible to create a Node Operator during the Early Adoption period or if the address is eligible to create a Node Operator with the discounted bond curve once the Early Adoption period is over. It stores information about eligible addresses that have already been used to create a Node Operator.

## Upgradability

The contract is immutable.

## State Variables

### TREE_ROOT

_Root of the EA members Merkle Tree_

```solidity
bytes32 public immutable TREE_ROOT;
```

### CURVE_ID

_Id of the bond curve to be assigned for the EA members_

```solidity
uint256 public immutable CURVE_ID;
```

### MODULE

_Address of the Staking Module using Early Adoption contract_

```solidity
address public immutable MODULE;
```

## Functions

### consume

Validate EA eligibility proof and mark it as consumed

_Called only by the module_

```solidity
function consume(address member, bytes32[] calldata proof) external;
```

**Parameters**

| Name     | Type        | Description                                |
| -------- | ----------- | ------------------------------------------ |
| `member` | `address`   | Address to be verified alongside the proof |
| `proof`  | `bytes32[]` | Merkle proof of EA eligibility             |

### isConsumed

Check if the address has already consumed EA access

```solidity
function isConsumed(address member) external view returns (bool);
```

**Parameters**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `member` | `address` | Address to check |

**Returns**

| Name     | Type   | Description   |
| -------- | ------ | ------------- |
| `<none>` | `bool` | Consumed flag |

### verifyProof

Check is the address is eligible to consume EA access

```solidity
function verifyProof(address member, bytes32[] calldata proof) public view returns (bool);
```

**Parameters**

| Name     | Type        | Description                    |
| -------- | ----------- | ------------------------------ |
| `member` | `address`   | Address to check               |
| `proof`  | `bytes32[]` | Merkle proof of EA eligibility |

**Returns**

| Name     | Type   | Description                               |
| -------- | ------ | ----------------------------------------- |
| `<none>` | `bool` | Boolean flag if the proof is valid or not |

### hashLeaf

Get a hash of a leaf in EA Merkle tree

_Double hash the leaf to prevent second preimage attacks_

```solidity
function hashLeaf(address member) public pure returns (bytes32);
```

**Parameters**

| Name     | Type      | Description       |
| -------- | --------- | ----------------- |
| `member` | `address` | EA member address |

**Returns**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `<none>` | `bytes32` | Hash of the leaf |

## Events

### Consumed

```solidity
event Consumed(address indexed member);
```
