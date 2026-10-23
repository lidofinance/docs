# CuratedGate

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/CuratedGate.sol)

## Deployed contracts

| Module | Gate | Mainnet |
| --- | --- | --- |
| CMv2 | Professional Operator | [`0x6093EFA6B5E2FF3be54d1c895c9deA932805c49F`](https://etherscan.io/address/0x6093EFA6B5E2FF3be54d1c895c9deA932805c49F) |
| CMv2 | Professional Trusted Operator | [`0x8c002c6eE10cf8adb78D1F9EB2e134FdaF8A7C1a`](https://etherscan.io/address/0x8c002c6eE10cf8adb78D1F9EB2e134FdaF8A7C1a) |
| CMv2 | Public Good Operator | [`0x207798e6fD1aa7Ee8a63782A64c959cD6727b78C`](https://etherscan.io/address/0x207798e6fD1aa7Ee8a63782A64c959cD6727b78C) |
| CMv2 | Decentralization Operator | [`0xeF273Ca4A21Ba7B414Ae3C9f9b443038cb133F72`](https://etherscan.io/address/0xeF273Ca4A21Ba7B414Ae3C9f9b443038cb133F72) |
| CMv2 | Extra Effort Operator | [`0x3BbBb175f7F07954DE00052b20E1c5572223F24D`](https://etherscan.io/address/0x3BbBb175f7F07954DE00052b20E1c5572223F24D) |
| CMv2 | Intra-Operator DVT Cluster | [`0x86A8d4E0db5938D21d98047544668FCCB1A9ADc8`](https://etherscan.io/address/0x86A8d4E0db5938D21d98047544668FCCB1A9ADc8) |
| CMv2 | Intra-Operator DVT Cluster Plus | [`0x773933F9db8964A17d62fb808f2EC7A2de4247CC`](https://etherscan.io/address/0x773933F9db8964A17d62fb808f2EC7A2de4247CC) |

`CuratedGate` is a supplementary contract that allows an address included in a gate instance's Merkle tree to create an empty Node Operator in [`CuratedModule`](/staking-modules/contracts/CuratedModule). In the same transaction, the gate configures the manager and reward addresses, stores the operator's name and description in [`MetaRegistry`](/staking-modules/contracts/MetaRegistry), and assigns the gate's bond curve through [`Accounting`](/staking-modules/contracts/Accounting) when it differs from the default curve. Each address can use a given gate instance only once.

## State Variables
### MODULE

```solidity
ICuratedModule public immutable MODULE
```


### ACCOUNTING

```solidity
IAccounting public immutable ACCOUNTING
```


### DEFAULT_BOND_CURVE_ID
Cached default bond curve id from Accounting.


```solidity
uint256 public immutable DEFAULT_BOND_CURVE_ID
```


### META_REGISTRY

```solidity
IMetaRegistry public immutable META_REGISTRY
```


## Functions
### constructor


```solidity
constructor(address module) ;
```

### initialize


```solidity
function initialize(uint256 curveId, bytes32 treeRoot, string calldata treeCid, string calldata name, address admin)
    public
    override(IMerkleGate, MerkleGate)
    initializer;
```

### createNodeOperator

Create an empty Node Operator for the caller if eligible.
Stores provided name/description in MetaRegistry. Marks caller as consumed.

If `curveId()` equals `Accounting.DEFAULT_BOND_CURVE_ID()`,
the created operator stays on the default bond curve.


```solidity
function createNodeOperator(
    string calldata name,
    string calldata description,
    address managerAddress,
    address rewardAddress,
    bytes32[] calldata proof
) external whenResumed returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`name`|`string`|Display name of the Node Operator|
|`description`|`string`|Description of the Node Operator|
|`managerAddress`|`address`|Address to set as manager; if zero, defaults will be used by the module|
|`rewardAddress`|`address`|Address to set as rewards receiver; if zero, defaults will be used by the module|
|`proof`|`bytes32[]`|Merkle proof for the caller address|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Newly created Node Operator id|

