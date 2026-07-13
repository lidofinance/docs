# FeeOracle

- [Source code](https://github.com/lidofinance/staking-modules/blob/68bbef5148bb51c1967785a7c6ed6e168acccc0f/src/FeeOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x4D4074628678Bd302921c20573EEa1ed38DdF7FB)

`FeeOracle.sol` is a supplementary contract responsible for the execution of the Performance Oracle report once consensus is reached in the `HashConsensus.sol` contract, namely, transforming non-distributed rewards into non-claimed rewards stored on the `FeeDistributor.sol` and reporting the latest root of the rewards distribution Merkle tree to the `FeeDistributor.sol`. Alongside rewards distribution, the contract manages strikes data delivery to `ValidatorStrikes.sol`. The contract inherits from [`BaseOracle.sol`](https://github.com/lidofinance/core/blob/master/contracts/0.8.9/oracle/BaseOracle.sol) from Lido on Ethereum (LoE) core.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables
### INITIALIZED_VERSION

```solidity
uint256 internal constant INITIALIZED_VERSION = 3
```


### SUBMIT_DATA_ROLE
An ACL role granting the permission to submit the data for a committee report.


```solidity
bytes32 public constant SUBMIT_DATA_ROLE = keccak256("SUBMIT_DATA_ROLE")
```


### FEE_DISTRIBUTOR

```solidity
IFeeDistributor public immutable FEE_DISTRIBUTOR
```


### STRIKES

```solidity
IValidatorStrikes public immutable STRIKES
```


### __freeSlot1

```solidity
bytes32 internal __freeSlot1
```


### __freeSlot2

```solidity
bytes32 internal __freeSlot2
```


## Functions
### constructor


```solidity
constructor(address feeDistributor, address strikes, uint256 secondsPerSlot, uint256 genesisTime)
    BaseOracle(secondsPerSlot, genesisTime);
```

### initialize

Initialize contract from scratch. In case of a method call frontrun, the contract instance should be discarded.
It is recommended to call this method in the same transaction as the deployment transaction
and perform extensive deployment verification before using the contract instance.


```solidity
function initialize(address admin, address consensusContract, uint256 consensusVersion) external;
```

### finalizeUpgradeV3

This method is expected to be called only when the contract is upgraded from version 2 to version 3 for the existing version 2 deployment.
If the version 3 contract is deployed from scratch, the `initialize` method should be used instead.
To prevent possible frontrun this method should strictly be called in the same TX as the upgrade transaction and should not be called separately.


```solidity
function finalizeUpgradeV3(uint256 consensusVersion) external;
```

### submitReportData

Submit the data for a committee report


```solidity
function submitReportData(ReportData calldata data, uint256 contractVersion) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`data`|`ReportData`|Data for a committee report|
|`contractVersion`|`uint256`|Expected storage contract version of the FeeOracle implementation|


### _handleConsensusReport

Called in `submitConsensusReport` after a consensus is reached.


```solidity
function _handleConsensusReport(
    ConsensusReport memory,
    /* report */
    uint256,
    /* prevSubmittedRefSlot */
    uint256 /* prevProcessingRefSlot */
)
    internal
    override;
```

### _handleConsensusReportData


```solidity
function _handleConsensusReportData(ReportData calldata data) internal;
```

### _checkMsgSenderIsAllowedToSubmitData


```solidity
function _checkMsgSenderIsAllowedToSubmitData() internal view;
```

### _onlyRecoverer


```solidity
function _onlyRecoverer() internal view override;
```

### __checkRole


```solidity
function __checkRole(bytes32 role) internal view override;
```
