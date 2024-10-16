# CSFeeOracle

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSFeeOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x4D4074628678Bd302921c20573EEa1ed38DdF7FB)

CSFeeOracle.sol is the utility contract responsible for the execution of the CSM Oracle report once the consensus is reached in the HashConsensus.sol contract, namely, transforming non-distributed rewards to non-claimed rewards stored on the CSFeeDistributor.sol, and reporting the latest root of rewards distribution Merkle tree to the CSFeeDistributor.sol. Inherited from the BaseOracle.sol from Lido on Ethereum.

## Upgradability

The contract uses [OssifiableProxy](../../../contracts/ossifiable-proxy.md) for upgradability.

## State Variables

### CONTRACT_MANAGER_ROLE

An ACL role granting the permission to manage the contract (update variables).

```solidity
bytes32 public constant CONTRACT_MANAGER_ROLE = keccak256("CONTRACT_MANAGER_ROLE");
```

### SUBMIT_DATA_ROLE

An ACL role granting the permission to submit the data for a committee report.

```solidity
bytes32 public constant SUBMIT_DATA_ROLE = keccak256("SUBMIT_DATA_ROLE");
```

### PAUSE_ROLE

An ACL role granting the permission to pause accepting oracle reports

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
```

### RESUME_ROLE

An ACL role granting the permission to resume accepting oracle reports

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE");
```

### RECOVERER_ROLE

An ACL role granting the permission to recover assets

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```

### MAX_BP

```solidity
uint256 internal constant MAX_BP = 10000;
```

### feeDistributor

```solidity
ICSFeeDistributor public feeDistributor;
```

### avgPerfLeewayBP

Leeway in basis points is used to determine the under-performing validators threshold.
`threshold` = `avgPerfBP` - `avgPerfLeewayBP`, where `avgPerfBP` is an average
performance over the network computed by the off-chain oracle.

```solidity
uint256 public avgPerfLeewayBP;
```

### MANAGE_CONSENSUS_CONTRACT_ROLE
An ACL role granting the permission to set the consensus
contract address by calling setConsensusContract.


```solidity
bytes32 public constant MANAGE_CONSENSUS_CONTRACT_ROLE = keccak256("MANAGE_CONSENSUS_CONTRACT_ROLE");
```


### MANAGE_CONSENSUS_VERSION_ROLE
An ACL role granting the permission to set the consensus
version by calling setConsensusVersion.


```solidity
bytes32 public constant MANAGE_CONSENSUS_VERSION_ROLE = keccak256("MANAGE_CONSENSUS_VERSION_ROLE");
```


### CONSENSUS_CONTRACT_POSITION
*Storage slot: address consensusContract*


```solidity
bytes32 internal constant CONSENSUS_CONTRACT_POSITION = keccak256("lido.BaseOracle.consensusContract");
```


### CONSENSUS_VERSION_POSITION
*Storage slot: uint256 consensusVersion*


```solidity
bytes32 internal constant CONSENSUS_VERSION_POSITION = keccak256("lido.BaseOracle.consensusVersion");
```


### LAST_PROCESSING_REF_SLOT_POSITION
*Storage slot: uint256 lastProcessingRefSlot*


```solidity
bytes32 internal constant LAST_PROCESSING_REF_SLOT_POSITION = keccak256("lido.BaseOracle.lastProcessingRefSlot");
```


### CONSENSUS_REPORT_POSITION
*Storage slot: ConsensusReport consensusReport*


```solidity
bytes32 internal constant CONSENSUS_REPORT_POSITION = keccak256("lido.BaseOracle.consensusReport");
```


### SECONDS_PER_SLOT

```solidity
uint256 public immutable SECONDS_PER_SLOT;
```


### GENESIS_TIME

```solidity
uint256 public immutable GENESIS_TIME;
```

## Functions

### setFeeDistributorContract

Set a new fee distributor contract

_\_setFeeDistributorContract() reverts if zero address_

```solidity
function setFeeDistributorContract(
  address feeDistributorContract
) external onlyRole(CONTRACT_MANAGER_ROLE);
```

**Parameters**

| Name                     | Type      | Description                                 |
| ------------------------ | --------- | ------------------------------------------- |
| `feeDistributorContract` | `address` | Address of the new fee distributor contract |

### setPerformanceLeeway

Set a new performance threshold value in basis points

```solidity
function setPerformanceLeeway(uint256 valueBP) external onlyRole(CONTRACT_MANAGER_ROLE);
```

**Parameters**

| Name      | Type      | Description                           |
| --------- | --------- | ------------------------------------- |
| `valueBP` | `uint256` | performance threshold in basis points |

### submitReportData

Submit the data for a committee report

```solidity
function submitReportData(ReportData calldata data, uint256 contractVersion) external whenResumed;
```

**Parameters**

| Name              | Type         | Description                           |
| ----------------- | ------------ | ------------------------------------- |
| `data`            | `ReportData` | Data for a committee report           |
| `contractVersion` | `uint256`    | Version of the oracle consensus rules |

### resume

Resume accepting oracle reports

```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause accepting oracle reports for a `duration` seconds

```solidity
function pauseFor(uint256 duration) external onlyRole(PAUSE_ROLE);
```

**Parameters**

| Name       | Type      | Description                      |
| ---------- | --------- | -------------------------------- |
| `duration` | `uint256` | Duration of the pause in seconds |

### pauseUntil

Pause accepting oracle reports until a timestamp

```solidity
function pauseUntil(uint256 pauseUntilInclusive) external onlyRole(PAUSE_ROLE);
```

**Parameters**

| Name                  | Type      | Description                                         |
| --------------------- | --------- | --------------------------------------------------- |
| `pauseUntilInclusive` | `uint256` | Timestamp until which the oracle reports are paused |

### getConsensusContract

Returns the address of the HashConsensus contract.


```solidity
function getConsensusContract() external view returns (address);
```

### setConsensusContract

Sets the address of the HashConsensus contract.


```solidity
function setConsensusContract(address addr) external onlyRole(MANAGE_CONSENSUS_CONTRACT_ROLE);
```

### getConsensusVersion

Returns the current consensus version expected by the oracle contract.
Consensus version must change every time consensus rules change, meaning that
an oracle looking at the same reference slot would calculate a different hash.


```solidity
function getConsensusVersion() external view returns (uint256);
```

### setConsensusVersion

Sets the consensus version expected by the oracle contract.


```solidity
function setConsensusVersion(uint256 version) external onlyRole(MANAGE_CONSENSUS_VERSION_ROLE);
```

### getConsensusReport


Data provider interface

Returns the last consensus report hash and metadata.

*Zero hash means that either there have been no reports yet, or the report for `refSlot` was discarded.*


```solidity
function getConsensusReport()
    external
    view
    returns (bytes32 hash, uint256 refSlot, uint256 processingDeadlineTime, bool processingStarted);
```

### submitConsensusReport


Consensus contract interface

Called by HashConsensus contract to push a consensus report for processing.
Note that submitting the report doesn't require the processor to start processing it right
away, this can happen later (see `getLastProcessingRefSlot`). Until processing is started,
HashConsensus is free to reach consensus on another report for the same reporting frame an
submit it using this same function, or to lose the consensus on the submitted report,
notifying the processor via `discardConsensusReport`.


```solidity
function submitConsensusReport(bytes32 reportHash, uint256 refSlot, uint256 deadline) external;
```

### discardConsensusReport

Called by HashConsensus contract to notify that the report for the given ref. slot
is not a consensus report anymore and should be discarded. This can happen when a member
changes their report, is removed from the set, or when the quorum value gets increased.
Only called when, for the given reference slot:
1. there previously was a consensus report; AND
2. processing of the consensus report hasn't started yet; AND
3. report processing deadline is not expired yet (enforced by HashConsensus); AND
4. there's no consensus report now (otherwise, `submitConsensusReport` is called instead) (enforced by HashConsensus).
Can be called even when there's no submitted non-discarded consensus report for the current
reference slot, i.e. can be called multiple times in succession.


```solidity
function discardConsensusReport(uint256 refSlot) external;
```

### getLastProcessingRefSlot

Returns the last reference slot for which processing of the report was started.


```solidity
function getLastProcessingRefSlot() external view returns (uint256);
```


## Events

### FeeDistributorContractSet

_Emitted when a new fee distributor contract is set_

```solidity
event FeeDistributorContractSet(address feeDistributorContract);
```

### PerfLeewaySet

```solidity
event PerfLeewaySet(uint256 valueBP);
```
### ConsensusHashContractSet

```solidity
event ConsensusHashContractSet(address indexed addr, address indexed prevAddr);
```

### ConsensusVersionSet

```solidity
event ConsensusVersionSet(uint256 indexed version, uint256 indexed prevVersion);
```

### ReportSubmitted

```solidity
event ReportSubmitted(uint256 indexed refSlot, bytes32 hash, uint256 processingDeadlineTime);
```

### ReportDiscarded

```solidity
event ReportDiscarded(uint256 indexed refSlot, bytes32 hash);
```

### ProcessingStarted

```solidity
event ProcessingStarted(uint256 indexed refSlot, bytes32 hash);
```

### WarnProcessingMissed

```solidity
event WarnProcessingMissed(uint256 indexed refSlot);
```
