# Ejector

- [Source code](https://github.com/lidofinance/staking-modules/blob/68bbef5148bb51c1967785a7c6ed6e168acccc0f/src/Ejector.sol)
- [Deployed contract](https://etherscan.io/address/0x610B517D380f287c239C93F8eF6FfBd567AA4bA5)

`Ejector` is a supplementary contract that triggers validator exits through Lido's [`TriggerableWithdrawalsGateway`](/contracts/triggerable-withdrawals-gateway) (`TWG`) using EIP-7002 execution-layer withdrawal requests. It supports voluntary ejections initiated by Node Operators and forced ejections initiated by [`ValidatorStrikes`](ValidatorStrikes.md) for validators that have exceeded the strike threshold.

## Upgradability

The contract is immutable.

## State Variables
### MODULE

```solidity
IBaseModule public immutable MODULE
```


### STRIKES

```solidity
address public immutable STRIKES
```


### stakingModuleId

```solidity
uint256 public stakingModuleId
```


## Functions
### onlyStrikes


```solidity
modifier onlyStrikes() ;
```

### constructor


```solidity
constructor(address module, address strikes, address admin) ;
```

### voluntaryEject

Request triggerable full withdrawals for Node Operator validator keys

Called by the node operator


```solidity
function voluntaryEject(uint256 nodeOperatorId, uint256[] calldata keyIndices, address refundRecipient)
    external
    payable
    whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndices`|`uint256[]`|Array of indices of the keys to withdraw|
|`refundRecipient`|`address`|Address to send the refund to|


### ejectBadPerformer

Eject Node Operator's key as a bad performer

Called by the `ValidatorStrikes` contract.
See `ValidatorStrikes.processBadPerformanceProof` to use this method permissionless


```solidity
function ejectBadPerformer(uint256 nodeOperatorId, uint256 keyIndex, address refundRecipient)
    external
    payable
    whenResumed
    onlyStrikes;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndex`|`uint256`|Index of deposited key to eject|
|`refundRecipient`|`address`|Address to send the refund to|


### triggerableWithdrawalsGateway

TriggerableWithdrawalsGateway implementation used by the contract.


```solidity
function triggerableWithdrawalsGateway() public view returns (ITriggerableWithdrawalsGateway);
```

### _getOrCacheStakingModuleId


```solidity
function _getOrCacheStakingModuleId() internal returns (uint256 moduleId);
```

### _msgSenderIfEmpty


```solidity
function _msgSenderIfEmpty(address input) internal view returns (address);
```

### _onlyStrikes


```solidity
function _onlyStrikes() internal view;
```

### _onlyNodeOperatorOwner

Verifies that the sender is the owner of the node operator


```solidity
function _onlyNodeOperatorOwner(uint256 nodeOperatorId) internal view;
```

### _onlyRecoverer


```solidity
function _onlyRecoverer() internal view override;
```

### __checkRole


```solidity
function __checkRole(bytes32 role) internal view override;
```
