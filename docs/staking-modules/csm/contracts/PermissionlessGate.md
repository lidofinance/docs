# PermissionlessGate

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/PermissionlessGate.sol)
- [Deployed contract](https://etherscan.io/address/0xcF33a38111d0B1246A3F38a838fb41D626B454f0)

`PermissionlessGate.sol` is a supplementary contract that enables permissionless Node Operator creation in `CSModule.sol`, serving as an entry point.

## Upgradability

The contract is immutable.

## State Variables
### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```


### CURVE_ID
*Curve ID is the default bond curve ID from the accounting contract
This immutable variable is kept here for consistency with the other gates*


```solidity
uint256 public immutable CURVE_ID;
```


### MODULE
*Address of the Staking Module*


```solidity
ICSModule public immutable MODULE;
```


## Functions

### addNodeOperatorETH

Add a new Node Operator using ETH as a bond.
At least one deposit data and corresponding bond should be provided


```solidity
function addNodeOperatorETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    address referrer
) external payable returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled|
|`referrer`|`address`|Optional. Referrer address. Should be passed when Node Operator is created using partners integration|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator|


### addNodeOperatorStETH

Add a new Node Operator using stETH as a bond.
At least one deposit data and corresponding bond should be provided


```solidity
function addNodeOperatorStETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    ICSAccounting.PermitInput calldata permit,
    address referrer
) external returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled|
|`permit`|`ICSAccounting.PermitInput`|Optional. Permit to use stETH as bond|
|`referrer`|`address`|Optional. Referrer address. Should be passed when Node Operator is created using partners integration|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator|


### addNodeOperatorWstETH

Add a new Node Operator using wstETH as a bond.
At least one deposit data and corresponding bond should be provided


```solidity
function addNodeOperatorWstETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    ICSAccounting.PermitInput calldata permit,
    address referrer
) external returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count|
|`publicKeys`|`bytes`|Public keys to submit|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled|
|`permit`|`ICSAccounting.PermitInput`|Optional. Permit to use wstETH as bond|
|`referrer`|`address`|Optional. Referrer address. Should be passed when Node Operator is created using partners integration|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator|
