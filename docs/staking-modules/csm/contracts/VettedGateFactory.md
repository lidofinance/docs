# VettedGateFactory

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/VettedGateFactory.sol)
- [Deployed contract](https://etherscan.io/address/0xFdab48c4D627e500207e9AF29c98579d90Ea0ad4)

`VettedGateFactory.sol` is a supplementary contract that is used to deploy new instances of `VettedGate` contract behind [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## Upgradability

The contract is immutable.

## State Variables
### VETTED_GATE_IMPL

```solidity
address public immutable VETTED_GATE_IMPL;
```


## Functions

### create

*Creates a new VettedGate instance behind the OssifiableProxy based on known implementation address*


```solidity
function create(uint256 curveId, bytes32 treeRoot, string calldata treeCid, address admin)
    external
    returns (address instance);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`curveId`|`uint256`|Id of the bond curve to be assigned for the eligible members|
|`treeRoot`|`bytes32`|Root of the eligible members Merkle Tree|
|`treeCid`|`string`|CID of the eligible members Merkle Tree|
|`admin`|`address`|Address of the admin role|
