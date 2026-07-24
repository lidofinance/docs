# VettedGate

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/VettedGate.sol)
- Deployed contracts (deployed as multiple gate instances):
  - [Identified Community Stakers Gate](https://etherscan.io/address/0xB314D4A76C457c93150d308787939063F4Cc67E0)
  - [Identified DVT Cluster Gate](https://etherscan.io/address/0xa12760721A72A7199aB38059DA6690b9Cd4ed7B8)

`VettedGate.sol` is a supplementary contract that allows addresses included in a gate instance's Merkle tree to register as Node Operators in the module. In a single transaction, an eligible participant can create a Node Operator, assign the gate's bond curve, and submit initial validator keys and a bond in ETH, `stETH`, or `wstETH`. An existing Node Operator owner can instead claim the gate's bond curve. Each address can use a given gate instance only once.

[`MerkleGateFactory`](MerkleGateFactory.md) deploys gate instances behind [OssifiableProxy](contracts/ossifiable-proxy.md). Each instance has its own participant list, bond curve, and administrator, so its eligibility list can be updated independently.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables
### MODULE
Address of the Staking Module.


```solidity
IBaseModule public immutable MODULE
```


### ACCOUNTING
Address of the Accounting.


```solidity
IAccounting public immutable ACCOUNTING
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

### addNodeOperatorETH

Add a new Node Operator using ETH as bond.
At least one deposit data and corresponding bond should be provided.
msg.sender is marked as consumed and will not be able to create Node Operators
or claim the beneficial curve via this VettedGate instance.
Any excess msg.value will be sent to the bond and can be claimed from there.


```solidity
function addNodeOperatorETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    bytes32[] calldata proof,
    address referrer
) external payable whenResumed returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count.|
|`publicKeys`|`bytes`|Public keys to submit.|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples.|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional management properties for the Node Operator.|
|`proof`|`bytes32[]`|Merkle proof of the sender being eligible to join via the gate.|
|`referrer`|`address`|Optional referrer address to pass through to module.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator.|


### addNodeOperatorStETH

Add a new Node Operator using stETH as bond.
At least one deposit data and corresponding bond should be provided.
msg.sender is marked as consumed and will not be able to create Node Operators
or claim the beneficial curve via this VettedGate instance.


```solidity
function addNodeOperatorStETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    IAccounting.PermitInput calldata permit,
    bytes32[] calldata proof,
    address referrer
) external whenResumed returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count.|
|`publicKeys`|`bytes`|Public keys to submit.|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples.|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional management properties for the Node Operator.|
|`permit`|`IAccounting.PermitInput`|Optional permit to use stETH as bond.|
|`proof`|`bytes32[]`|Merkle proof of the sender being eligible to join via the gate.|
|`referrer`|`address`|Optional referrer address to pass through to module.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator.|


### addNodeOperatorWstETH

Add a new Node Operator using wstETH as bond.
At least one deposit data and corresponding bond should be provided.
msg.sender is marked as consumed and will not be able to create Node Operators
or claim the beneficial curve via this VettedGate instance.


```solidity
function addNodeOperatorWstETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    IAccounting.PermitInput calldata permit,
    bytes32[] calldata proof,
    address referrer
) external whenResumed returns (uint256 nodeOperatorId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Signing keys count.|
|`publicKeys`|`bytes`|Public keys to submit.|
|`signatures`|`bytes`|Signatures of `(deposit_message_root, domain)` tuples.|
|`managementProperties`|`NodeOperatorManagementProperties`|Optional management properties for the Node Operator.|
|`permit`|`IAccounting.PermitInput`|Optional permit to use wstETH as bond.|
|`proof`|`bytes32[]`|Merkle proof of the sender being eligible to join via the gate.|
|`referrer`|`address`|Optional referrer address to pass through to module.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the created Node Operator.|


### claimBondCurve

Claim the bond curve for an eligible Node Operator.
msg.sender is marked as consumed and will not be able to create Node Operators
or claim again via this VettedGate instance.

Should be called by Node Operator owner.


```solidity
function claimBondCurve(uint256 nodeOperatorId, bytes32[] calldata proof) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|Id of the Node Operator.|
|`proof`|`bytes32[]`|Merkle proof of the sender being eligible to join via the gate.|


### _onlyNodeOperatorOwner


```solidity
function _onlyNodeOperatorOwner(uint256 nodeOperatorId) internal view;
```
