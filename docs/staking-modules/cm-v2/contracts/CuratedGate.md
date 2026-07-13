# CuratedGate

- [Source code](https://github.com/lidofinance/staking-modules/blob/68bbef5148bb51c1967785a7c6ed6e168acccc0f/src/CuratedGate.sol)
- [Deployed contract (implementation)](https://etherscan.io/address/0x3cb948FD454ad6b20DE67633f25DcbDbEaa0e849) — deployed as multiple gate instances (one per Node Operator type)

`CuratedGate` is a supplementary contract that allows an address included in a gate instance's Merkle tree to create an empty Node Operator in [`CuratedModule`](CuratedModule.md). In the same transaction, the gate configures the manager and reward addresses, stores the operator's name and description in [`MetaRegistry`](MetaRegistry.md), and assigns the gate's bond curve through [`Accounting`](Accounting.md) when it differs from the default curve. Each address can use a given gate instance only once.

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

