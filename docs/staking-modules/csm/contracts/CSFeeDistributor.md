# CSFeeDistributor

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/CSFeeDistributor.sol)
- [Deployed contract](https://etherscan.io/address/0xD99CC66fEC647E68294C6477B40fC7E0F6F618D0)

`CSFeeDistributor.sol` is a supplementary contract that stores non-claimed and non-distributed Node Operator rewards on its balance. This contract stores the latest root of a rewards distribution Merkle tree. It accepts calls from `CSAccounting.sol` with reward claim requests and stores data about already claimed rewards by the Node Operator. It receives non-distributed rewards from the `CSModule.sol` each time the `StakingRouter` mints the new portion of the module's rewards. This contract transfers excess rewards allocated by `StakingRouter` due to variable Node Operator reward share back to Lido treasury.

**Changes in v2:**
- Added storage of the distribution history;
- Added support of the variable Node Operator reward share and rebate transfer to Lido treasury;

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables
### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```


### STETH

```solidity
IStETH public immutable STETH;
```


### ACCOUNTING

```solidity
address public immutable ACCOUNTING;
```


### ORACLE

```solidity
address public immutable ORACLE;
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


### logCid
CID of the file with log for the last frame reported


```solidity
string public logCid;
```


### distributedShares
Amount of stETH shares sent to the Accounting in favor of the NO


```solidity
mapping(uint256 nodeOperatorId => uint256 distributed) public distributedShares;
```


### totalClaimableShares
Total Amount of stETH shares available for claiming by NOs


```solidity
uint256 public totalClaimableShares;
```

### distributionDataHistoryCount
The number of _distributionDataHistory records


```solidity
uint256 public distributionDataHistoryCount;
```


### rebateRecipient
The address to transfer rebate to


```solidity
address public rebateRecipient;
```


## Functions

### setRebateRecipient

Set address to send rebate to


```solidity
function setRebateRecipient(address _rebateRecipient) external onlyRole(DEFAULT_ADMIN_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_rebateRecipient`|`address`|Address to send rebate to|


### distributeFees

Distribute fees to the Accounting in favor of the Node Operator


```solidity
function distributeFees(uint256 nodeOperatorId, uint256 cumulativeFeeShares, bytes32[] calldata proof)
    external
    onlyAccounting
    returns (uint256 sharesToDistribute);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`cumulativeFeeShares`|`uint256`|Total Amount of stETH shares earned as fees|
|`proof`|`bytes32[]`|Merkle proof of the leaf|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`sharesToDistribute`|`uint256`|Amount of stETH shares distributed|


### processOracleReport

Receive the data of the Merkle tree from the Oracle contract and process it


```solidity
function processOracleReport(
    bytes32 _treeRoot,
    string calldata _treeCid,
    string calldata _logCid,
    uint256 distributed,
    uint256 rebate,
    uint256 refSlot
) external onlyOracle;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_treeRoot`|`bytes32`|Root of the Merkle tree|
|`_treeCid`|`string`|an IPFS CID of the tree|
|`_logCid`|`string`|an IPFS CID of the log|
|`distributed`|`uint256`|an amount of the distributed shares|
|`rebate`|`uint256`|an amount of the rebate shares|
|`refSlot`|`uint256`|refSlot of the report|


### recoverERC20

*Allows sender to recover ERC20 tokens held by the contract*


```solidity
function recoverERC20(address token, uint256 amount) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|The address of the ERC20 token to recover|
|`amount`|`uint256`|The amount of the ERC20 token to recover Emits an ERC20Recovered event upon success Optionally, the inheriting contract can override this function to add additional restrictions|


### getInitializedVersion

Get the initialized version of the contract


```solidity
function getInitializedVersion() external view returns (uint64);
```

### pendingSharesToDistribute

Get the Amount of stETH shares that are pending to be distributed


```solidity
function pendingSharesToDistribute() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|pendingShares Amount shares that are pending to distribute|


### getHistoricalDistributionData

Get the historical record of distribution data


```solidity
function getHistoricalDistributionData(uint256 index) external view returns (DistributionData memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`index`|`uint256`|Historical entry index|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`DistributionData`|Historical distribution data|


### getFeesToDistribute

Get the Amount of stETH shares that can be distributed in favor of the Node Operator


```solidity
function getFeesToDistribute(uint256 nodeOperatorId, uint256 cumulativeFeeShares, bytes32[] calldata proof)
    public
    view
    returns (uint256 sharesToDistribute);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`cumulativeFeeShares`|`uint256`|Total Amount of stETH shares earned as fees|
|`proof`|`bytes32[]`|Merkle proof of the leaf|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`sharesToDistribute`|`uint256`|Amount of stETH shares that can be distributed|


### hashLeaf

Get a hash of a leaf

*Double hash the leaf to prevent second preimage attacks*


```solidity
function hashLeaf(uint256 nodeOperatorId, uint256 shares) public pure returns (bytes32);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`shares`|`uint256`|Amount of stETH shares|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes32`|Hash of the leaf|


## Events
### OperatorFeeDistributed
*Emitted when fees are distributed*


```solidity
event OperatorFeeDistributed(uint256 indexed nodeOperatorId, uint256 shares);
```

### DistributionDataUpdated
*Emitted when distribution data is updated*


```solidity
event DistributionDataUpdated(uint256 totalClaimableShares, bytes32 treeRoot, string treeCid);
```

### DistributionLogUpdated
*Emitted when distribution log is updated*


```solidity
event DistributionLogUpdated(string logCid);
```

### ModuleFeeDistributed
*It logs how many shares were distributed in the latest report*


```solidity
event ModuleFeeDistributed(uint256 shares);
```

### RebateTransferred
*Emitted when rebate is transferred*


```solidity
event RebateTransferred(uint256 shares);
```

### RebateRecipientSet
*Emitted when rebate recipient is set*


```solidity
event RebateRecipientSet(address recipient);
```
