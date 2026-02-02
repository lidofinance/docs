# CSStrikes

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/CSStrikes.sol)
- [Deployed contract](https://etherscan.io/address/0xaa328816027F2D32B9F56d190BC9Fa4A5C07637f)

`CSStrikes.sol` is a utility contract that stores information about strikes assigned to the CSM validators by CSM Performance Oracle. It has a permissionless method to prove that a particular validator should be ejected because the number of strikes is above the threshold for this validator. It calls `CSEjector.sol` to perform a strikes threshold check and eject the validator.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables

### ORACLE

```solidity
address public immutable ORACLE;
```

### MODULE

```solidity
ICSModule public immutable MODULE;
```

### ACCOUNTING

```solidity
ICSAccounting public immutable ACCOUNTING;
```

### EXIT_PENALTIES

```solidity
ICSExitPenalties public immutable EXIT_PENALTIES;
```

### PARAMETERS_REGISTRY

```solidity
ICSParametersRegistry public immutable PARAMETERS_REGISTRY;
```

### ejector

```solidity
ICSEjector public ejector;
```

### treeRoot

The latest Merkle Tree root

```solidity
bytes32 public treeRoot;
```

### treeCid

CID of the last published Merkle tree

```solidity
string public treeCid;
```

## Functions

### setEjector

Set the address of the Ejector contract

```solidity
function setEjector(address _ejector) external onlyRole(DEFAULT_ADMIN_ROLE);
```

**Parameters**

| Name       | Type      | Description                     |
| ---------- | --------- | ------------------------------- |
| `_ejector` | `address` | Address of the Ejector contract |

### processOracleReport

Receive the data of the Merkle tree from the Oracle contract and process it

_New tree might be empty and it is valid value because of `strikesLifetime`_

```solidity
function processOracleReport(bytes32 _treeRoot, string calldata _treeCid) external onlyOracle;
```

**Parameters**

| Name        | Type      | Description             |
| ----------- | --------- | ----------------------- |
| `_treeRoot` | `bytes32` | Root of the Merkle tree |
| `_treeCid`  | `string`  | an IPFS CID of the tree |

### processBadPerformanceProof

Report multiple CSM keys as bad performing

```solidity
function processBadPerformanceProof(
    KeyStrikes[] calldata keyStrikesList,
    bytes32[] calldata proof,
    bool[] calldata proofFlags,
    address refundRecipient
) external payable;
```

**Parameters**

| Name              | Type           | Description                                                  |
| ----------------- | -------------- | ------------------------------------------------------------ |
| `keyStrikesList`  | `KeyStrikes[]` | List of KeyStrikes structs                                   |
| `proof`           | `bytes32[]`    | Multi-proof of the strikes                                   |
| `proofFlags`      | `bool[]`       | Flags to process the multi-proof, see OZ `processMultiProof` |
| `refundRecipient` | `address`      | Address to send the refund to                                |

### getInitializedVersion

Returns the initialized version of the contract

```solidity
function getInitializedVersion() external view returns (uint64);
```

### verifyProof

Check the contract accepts the provided multi-proof

```solidity
function verifyProof(
    KeyStrikes[] calldata keyStrikesList,
    bytes[] memory pubkeys,
    bytes32[] calldata proof,
    bool[] calldata proofFlags
) public view returns (bool);
```

**Parameters**

| Name             | Type           | Description                                                  |
| ---------------- | -------------- | ------------------------------------------------------------ |
| `keyStrikesList` | `KeyStrikes[]` | List of KeyStrikes structs                                   |
| `pubkeys`        | `bytes[]`      |                                                              |
| `proof`          | `bytes32[]`    | Multi-proof of the strikes                                   |
| `proofFlags`     | `bool[]`       | Flags to process the multi-proof, see OZ `processMultiProof` |

**Returns**

| Name     | Type   | Description                    |
| -------- | ------ | ------------------------------ |
| `<none>` | `bool` | bool True if proof is accepted |

### hashLeaf

Get a hash of a leaf a tree of strikes

_Double hash the leaf to prevent second pre-image attacks_

```solidity
function hashLeaf(KeyStrikes calldata keyStrikes, bytes memory pubkey) public pure returns (bytes32);
```

**Parameters**

| Name         | Type         | Description       |
| ------------ | ------------ | ----------------- |
| `keyStrikes` | `KeyStrikes` | KeyStrikes struct |
| `pubkey`     | `bytes`      | Public key        |

**Returns**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `<none>` | `bytes32` | Hash of the leaf |

## Events

### StrikesDataUpdated

_Emitted when strikes data is updated_

```solidity
event StrikesDataUpdated(bytes32 treeRoot, string treeCid);
```

### StrikesDataWiped

_Emitted when strikes is updated from non-empty to empty_

```solidity
event StrikesDataWiped();
```

### EjectorSet

```solidity
event EjectorSet(address ejector);
```
