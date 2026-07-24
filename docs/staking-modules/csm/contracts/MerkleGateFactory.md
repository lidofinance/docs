# MerkleGateFactory

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/MerkleGateFactory.sol)
- [Deployed contract](https://etherscan.io/address/0xc0f110Af6eA9119037a71C84D14506A22AE43DdE)

`MerkleGateFactory.sol` is a supplementary contract that deploys and initializes Merkle-based gate instances, such as [`VettedGate`](VettedGate.md), behind [OssifiableProxy](contracts/ossifiable-proxy.md). A factory is bound to a single gate implementation at deployment. Each new instance is configured with its bond curve, initial Merkle tree root and CID, name, and administrator. The factory itself is immutable, while each deployed gate is upgradeable through its proxy.

## Upgradability

The contract is immutable.

## State Variables
### GATE_IMPL

```solidity
address public immutable GATE_IMPL
```


## Functions
### constructor


```solidity
constructor(address gateImpl) ;
```

### create

Creates a new gate proxy for the predefined implementation and initializes it.


```solidity
function create(uint256 curveId, bytes32 treeRoot, string calldata treeCid, string calldata name, address admin)
    external
    returns (address instance);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`curveId`|`uint256`|Bond curve id used by the gate.|
|`treeRoot`|`bytes32`|Initial Merkle tree root.|
|`treeCid`|`string`|Initial Merkle tree CID.|
|`name`|`string`|Human-readable gate name.|
|`admin`|`address`|Address of the proxy admin and DEFAULT_ADMIN_ROLE holder.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`instance`|`address`|Address of the created proxy instance.|

