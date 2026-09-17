# MerkleGateFactory

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/MerkleGateFactory.sol)

## Deployed contracts

| Module | Mainnet |
| --- | --- |
| CMv2 | [`0xDdE99d63b352A665d04339D4792E6852Ce89d1B7`](https://etherscan.io/address/0xDdE99d63b352A665d04339D4792E6852Ce89d1B7) |
| CSM | [`0xc0f110Af6eA9119037a71C84D14506A22AE43DdE`](https://etherscan.io/address/0xc0f110Af6eA9119037a71C84D14506A22AE43DdE) |

`MerkleGateFactory` is an immutable supplementary contract that deploys and initializes Merkle-based gate instances behind [OssifiableProxy](/contracts/ossifiable-proxy), namely [`CuratedGate`](/staking-modules/contracts/CuratedGate) in CMv2 and [`VettedGate`](/staking-modules/contracts/VettedGate) in CSM. Each new proxy is initialized with its bond curve, Merkle tree root and CID, name, and administrator.

The factory is bound to one gate implementation at deployment. The factory and implementation are immutable, while each gate instance is an independently upgradeable proxy.

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

