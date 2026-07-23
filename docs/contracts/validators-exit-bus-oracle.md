# ValidatorsExitBusOracle

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)
- Inherits [ValidatorsExitBus](https://github.com/lidofinance/core/blob/main/contracts/0.8.9/oracle/ValidatorsExitBus.sol)
- Inherits [BaseOracle](https://github.com/lidofinance/core/blob/main/contracts/0.8.9/oracle/BaseOracle.sol)

:::info
It's advised to read [What is Lido Oracle mechanism](/guides/oracle-operator-manual#intro) before
:::

## What is ValidatorsExitBusOracle

A contract that implements an on-chain "source of truth" message bus between the protocol's off-chain oracle and off-chain observers,
with the main goal of delivering validator exit requests to the Lido-participating node operators.

The oracle report determines which validators should be requested to exit to satisfy withdrawal queue demand, following the policy and prioritization rules described in the [Validator Exits and Penalties](/guides/oracle-spec/penalties) page.

:::note
Placed exit requests via `ValidatorsExitBusOracle` should be processed timely according to the ratified Lido on Ethereum Validator Exits SNOP 3.0 ([IPFS](https://ipfs.io/ipfs/QmW9kE61zC61PcuikCQRwn82aoTCj9yPuENGNPML9QLkSM), [GitHub](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md)).
:::

Access to privileged methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/core/blob/main/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
contract and a bunch of [granular roles](#permissions).

## Report cycle

The oracle work is delineated by equal time periods called frames. In normal operation, oracles finalize a report in each frame (the frame duration is 75 Ethereum Consensus Layer epochs, each frame starts at ~04:00, ~12:00, ~20:00 UTC). Each frame has a reference slot and processing deadline. Report data is gathered by looking at the world state (both Ethereum Execution and Consensus Layers) at the moment of the frame's reference slot (including any state changes made in that slot), and must be processed before the frame's processing deadline.

Reference slot for each frame is set to the last slot of the epoch preceding the frame's first epoch. The processing deadline is set to the last slot of the last epoch of the frame.

It's worth noting that frame length [can be changed](/contracts/hash-consensus#setframeconfig). And if oracle report is delayed it does not extend the report period, unless it's missed. In this case, the next report will have the report period increased.

The frame includes these stages:

- **Waiting** - oracle starts as a [daemon](/guides/oracle-operator-manual#the-oracle-daemon) and wakes up every 12 seconds (by default) in order to find the last finalized slot, trying to collate it with the expected reference slot;
- **Data collection**: oracles monitor the state of both the execution and consensus layers and collect the data for the successfully arrived finalized reference slot;
- **Hash consensus**: oracles analyze the report data, compile the report and submit its hash to the [HashConsensus](/contracts/hash-consensus) smart contract;
- **Core update report**: once the [quorum](/contracts/hash-consensus#getquorum) of hashes is reached, meaning more than half of the oracles submitted the same hash (i.e., 5 of 9 oracle committee members at the moment of writing), one of the oracles chosen in turn submits the actual report to the `ValidatorsExitBusOracle` contract, which triggers a chain of the [`ValidatorExitRequest`](#validatorexitrequest) events containing details about the next validators to be ejected (to initiate a voluntary exit from the Ethereum Consensus Layer side).

## Report data

The function `submitReportData()` accepts the following `ReportData` structure.

```solidity
struct ReportData {
    uint256 consensusVersion;
    uint256 refSlot;
    uint256 requestsCount;
    uint256 dataFormat;
    bytes data;
}
```

**Oracle consensus info**

- `consensusVersion` — Version of the oracle consensus rules. A current version expected by the oracle can be obtained by calling `getConsensusVersion()`.
- `refSlot` — Reference slot for which the report was calculated. The state being reported must include all state changes resulting from the all blocks up to this reference slot (inclusive). The epoch containing the slot must be finalized prior to calculating the report.

**Requests data**

- `requestsCount` — Total number of validator exit requests in this report. Must match the number of requests packed into `data`.
- `dataFormat` — Format of the validator exit requests data. For oracle reports, only the `DATA_FORMAT_LIST_WITH_KEY_INDEX=2` value is supported.
- `data` — Validator exit requests data. Can differ based on the data format, see the constant defining a specific data format [here](#data_format_list_with_key_index) for more info.

The report is sanity-checked by the [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker) contract: the upper-bound total effective balance of the validators referenced in the report — 32 ETH per validator for modules with `0x01`-type withdrawal credentials and 2048 ETH per validator for modules with `0x02`-type withdrawal credentials — must not exceed the limit enforced by `OracleReportSanityChecker.checkExitBusOracleReport`.

## Constants

### DATA_FORMAT_LIST()

The list format of the validator exit requests data. Accepted for exit requests data submitted by trusted entities (e.g., Easy Track for the Curated and SDVT modules) via [`submitExitRequestsData`](#submitexitrequestsdata). Oracle reports use [`DATA_FORMAT_LIST_WITH_KEY_INDEX`](#data_format_list_with_key_index).

:::note
Each validator exit request is described by the following 64-byte array:

```
    MSB <------------------------------------------------------- LSB
    |  3 bytes   |  5 bytes   |     8 bytes      |    48 bytes     |
    |  moduleId  |  nodeOpId  |  validatorIndex  | validatorPubkey |
```

All requests are tightly packed into a byte array where requests follow
one another without any separator or padding, and passed to the `data`
field of the report structure.

Requests must be sorted in the ascending order by the following compound
key: `(moduleId, nodeOpId, validatorIndex)`.
:::

```solidity
uint256 public constant DATA_FORMAT_LIST = 1;
```

### DATA_FORMAT_LIST_WITH_KEY_INDEX()

The extended list format of the validator exit requests data that includes a key index for each validator. The `keyIndex` is used to validate the pubkey against the keys registered in the staking module, which also allows the key type (`0x01`/`0x02`) to be determined on-chain. Oracle reports submitted via [`submitReportData`](#submitreportdata) must use this format.

:::note
Each validator exit request is described by the following 72-byte array:

```
    MSB <-------------------------------------------------------------------- LSB
    |  3 bytes   |  5 bytes   |     8 bytes      |   8 bytes  |    48 bytes     |
    |  moduleId  |  nodeOpId  |  validatorIndex  |  keyIndex  | validatorPubkey |
```

All requests are tightly packed into a byte array where requests follow
one another without any separator or padding, and passed to the `data`
field of the report structure.

Requests must be sorted in the ascending order by the following compound
key: `(moduleId, nodeOpId, validatorIndex)`; the `keyIndex` is excluded
from the sort key, so the same validator cannot appear twice with
different key indices.
:::

```solidity
uint256 public constant DATA_FORMAT_LIST_WITH_KEY_INDEX = 2;
```

### EXIT_TYPE()

The exit type code passed to the [TriggerableWithdrawalsGateway](/contracts/triggerable-withdrawals-gateway) when exits are triggered via [`triggerExits`](#triggerexits).

```solidity
uint256 public constant EXIT_TYPE = 2;
```

### SECONDS_PER_SLOT()

See [https://ethereum.org/en/developers/docs/blocks/#block-time](https://ethereum.org/en/developers/docs/blocks/#block-time)

:::note
always returns 12 seconds due to [the Merge](https://ethereum.org/en/roadmap/merge/)
:::

```solidity
uint256 public immutable SECONDS_PER_SLOT;
```

### GENESIS_TIME()

See [https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21)

:::note
always returns 1606824023 (December 1, 2020, 12:00:23pm UTC) on [Mainnet](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21)
:::

```solidity
uint256 public immutable GENESIS_TIME;
```

### PAUSE_INFINITELY()

Special value for the infinite pause.
See [`pauseFor`](#pausefor) and [`pauseUntil`](#pauseuntil).

```solidity
uint256 public constant PAUSE_INFINITELY = type(uint256).max;
```

## ProcessingState

```solidity
struct ProcessingState {
    uint256 currentFrameRefSlot;
    uint256 processingDeadlineTime;
    bytes32 dataHash;
    bool dataSubmitted;
    uint256 dataFormat;
    uint256 requestsCount;
    uint256 requestsSubmitted;
}
```

- `currentFrameRefSlot` — Reference slot for the current reporting frame.
- `processingDeadlineTime` — The last time at which a report data can be submitted for the current reporting frame.
- `dataHash` — Hash of the report data. Zero bytes if consensus on the hash hasn't been reached yet for the current reporting frame.
- `dataSubmitted` — Whether any report data for the current reporting frame has been already submitted.
- `dataFormat` — Format of the report data for the current reporting frame.
- `requestsCount` — Total number of validator exit requests for the current reporting frame.
- `requestsSubmitted` — How many validator exit requests are already submitted for the current reporting frame.

## View methods

### getTotalRequestsProcessed()

Returns the total number of validator exit requests ever processed across all received reports.

```solidity
function getTotalRequestsProcessed() external view returns (uint256);
```

### getProcessingState()

Returns data processing state for the current reporting frame. See the docs for the [ProcessingState](#processingstate) struct.

```solidity
function getProcessingState() external view returns (ProcessingState memory result);
```

### getConsensusContract()

Returns the address of the [HashConsensus](/contracts/hash-consensus) contract instance used by `ValidatorsExitBusOracle`.

```solidity
function getConsensusContract() external view returns (address);
```

### getConsensusReport()

Returns the last consensus report hash and metadata.

```solidity
function getConsensusReport() external view returns (
    bytes32 hash,
    uint256 refSlot,
    uint256 processingDeadlineTime,
    bool processingStarted
);
```

#### Returns

| Name                     | Type      | Description                                                                                                                                                                                                                                                   |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hash`                   | `bytes32` | The last reported hash                                                                                                                                                                                                                                        |
| `refSlot`                | `uint256` | The frame's reference slot: if the data the consensus is being reached upon includes or depends on any onchain state, this state should be queried at the reference slot. If the slot contains a block, the state should include all changes from that block. |
| `processingDeadlineTime` | `uint256` | Timestamp of the last slot at which a report can be reported and processed                                                                                                                                                                                    |
| `processingStarted`      | `bool`    | Has the processing of the report been started or not                                                                                                                                                                                                          |

### getConsensusVersion()

Returns the current consensus version expected by the oracle contract.

:::note
Consensus version must change every time consensus rules change, meaning that
an oracle looking at the same reference slot would calculate a different hash.
:::

```solidity
function getConsensusVersion() external view returns (uint256);
```

### getContractVersion()

Returns the current contract version.

```solidity
function getContractVersion() public view returns (uint256);
```

### getLastProcessingRefSlot()

Returns the last reference slot for which processing of the report was started.

```solidity
function getLastProcessingRefSlot() external view returns (uint256);
```

### getResumeSinceTimestamp()

Returns one of the `timestamp` values:

- `PAUSE_INFINITELY` if paused permanently (i.e., with no expiration timestamp)
- a first second when get contract get resumed if paused for specific duration (if `timestamp ≥ block.timestamp`)
- some timestamp in past if not paused (if `timestamp < block.timestamp`)

```solidity
function getResumeSinceTimestamp() external view returns (uint256 timestamp);
```

### isPaused()

Returns whether the contract is paused or not at the moment.

```solidity
function isPaused() public view returns (bool);
```

### getMaxValidatorsPerReport()

Returns the maximum number of validator exit requests that can be processed in a single [`submitExitRequestsData`](#submitexitrequestsdata) payload.

```solidity
function getMaxValidatorsPerReport() external view returns (uint256);
```

#### Returns

| Name                     | Type      | Description                                          |
| ------------------------ | --------- | ---------------------------------------------------- |
| `maxValidatorsPerReport` | `uint256` | The maximum number of exit requests allowed per report. |

### getExitRequestLimitFullInfo()

Returns information about the current ETH-denominated exit request limit. See [`setExitRequestLimit`](#setexitrequestlimit) for the limit semantics.

```solidity
function getExitRequestLimitFullInfo()
    external
    view
    returns (
        uint256 maxExitBalanceEth,
        uint256 balancePerFrameEth,
        uint256 frameDurationInSec,
        uint256 prevExitBalanceEth,
        uint256 currentExitBalanceEth
    );
```

#### Returns

| Name                    | Type      | Description                                                                                    |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `maxExitBalanceEth`     | `uint256` | Maximum exit balance limit in ETH.                                                             |
| `balancePerFrameEth`    | `uint256` | The exit balance in ETH that can be restored per frame.                                        |
| `frameDurationInSec`    | `uint256` | The duration of each frame, in seconds, after which `balancePerFrameEth` can be restored.      |
| `prevExitBalanceEth`    | `uint256` | Balance limit in ETH left after previous requests.                                             |
| `currentExitBalanceEth` | `uint256` | Current exit balance limit in ETH. Equals `type(uint256).max` if the limit is not set.         |

### getDeliveryTimestamp()

Returns the timestamp at which the exit requests data corresponding to the given hash was delivered.

```solidity
function getDeliveryTimestamp(bytes32 exitRequestsHash) external view returns (uint256 deliveryDateTimestamp);
```

#### Parameters

| Name               | Type      | Description                                                        |
| ------------------ | --------- | ------------------------------------------------------------------ |
| `exitRequestsHash` | `bytes32` | `keccak256(abi.encode(data, dataFormat))` hash of the exit requests data. |

#### Reverts

- Reverts with `ExitHashNotSubmitted()` if the hash was not submitted.
- Reverts with `RequestsNotDelivered()` if the corresponding data was not delivered yet.

### unpackExitRequest()

Returns validator exit request data by index.

```solidity
function unpackExitRequest(
    bytes calldata exitRequests,
    uint256 dataFormat,
    uint256 index
) external pure returns (bytes memory pubkey, uint256 nodeOpId, uint256 moduleId, uint256 valIndex);
```

#### Parameters

| Name           | Type      | Description                                                                                       |
| -------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `exitRequests` | `bytes`   | Encoded list of validator exit requests.                                                          |
| `dataFormat`   | `uint256` | Format of the encoded exit requests data: `DATA_FORMAT_LIST=1` or `DATA_FORMAT_LIST_WITH_KEY_INDEX=2`. |
| `index`        | `uint256` | Index of the exit request within the `exitRequests` list.                                         |

#### Returns

| Name       | Type      | Description                   |
| ---------- | --------- | ----------------------------- |
| `pubkey`   | `bytes`   | Public key of the validator.  |
| `nodeOpId` | `uint256` | ID of the node operator.      |
| `moduleId` | `uint256` | ID of the staking module.     |
| `valIndex` | `uint256` | Index of the validator.       |

#### Reverts

- Reverts with `UnsupportedRequestsDataFormat(format)` if the provided data format is not supported.
- Reverts with `InvalidRequestsDataLength()` if the provided data is empty or packed incorrectly.
- Reverts with `ExitDataIndexOutOfRange(exitDataIndex, requestsCount)` if `index` is out of range.

### MAX_EFFECTIVE_BALANCE_WEIGHT_WC_TYPE_01()

Returns the per-validator weight in ETH (32 ETH) used to compute the upper-bound total effective balance for validators of modules with `0x01`-type withdrawal credentials. The value is read from the [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker) contract.

```solidity
function MAX_EFFECTIVE_BALANCE_WEIGHT_WC_TYPE_01() public view returns (uint16);
```

### MAX_EFFECTIVE_BALANCE_WEIGHT_WC_TYPE_02()

Returns the per-validator weight in ETH (2048 ETH) used to compute the upper-bound total effective balance for validators of modules with `0x02`-type withdrawal credentials. The value is read from the [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker) contract.

```solidity
function MAX_EFFECTIVE_BALANCE_WEIGHT_WC_TYPE_02() public view returns (uint16);
```

## Methods

### submitReportData()

Submits report data for processing.

Processing the report emits a [`ValidatorExitRequest`](#validatorexitrequest) event for each request, stores the `keccak256(abi.encode(data.data, data.dataFormat))` hash as delivered (making the data usable with [`triggerExits`](#triggerexits)), and emits the [`RequestsHashSubmitted`](#requestshashsubmitted) and [`ExitDataProcessing`](#exitdataprocessing) events.

```solidity
function submitReportData(ReportData calldata data, uint256 contractVersion) external whenResumed;
```

#### Parameters

| Name              | Type         | Description                                                    |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `data`            | `ReportData` | The report data. See [`ReportData`](#report-data) for details. |
| `contractVersion` | `uint256`    | Expected version of the oracle contract.                       |

#### Reverts

- Reverts with `ResumedExpected()` if the contract is paused.
- Reverts with `SenderNotAllowed()` if the caller doesn't have a `SUBMIT_DATA_ROLE` role and is not a member of the oracle committee.
- Reverts with `UnexpectedContractVersion(expectedVersion, version)` if the provided contract version differs from the current one.
- Reverts with `UnexpectedConsensusVersion(expectedConsensusVersion, consensusVersion)` if the provided consensus version differs from the expected one.
- Reverts with `UnexpectedRefSlot(report.refSlot, refSlot)` if the provided reference slot differs from the current consensus frame's one.
- Reverts with `UnexpectedDataHash(report.hash, hash)` if a `keccak256` hash of the ABI-encoded data differs from the last hash.
- Reverts with `NoConsensusReportToProcess()` if the report hash data is `0`.
- Reverts with `ProcessingDeadlineMissed(deadline)` if the processing deadline for the current consensus frame is missed.
- Reverts with `RefSlotAlreadyProcessing()` if the report reference slot is equal to the previous processing reference slot.
- Reverts with `UnsupportedRequestsDataFormat(format)` if the provided data format is not `DATA_FORMAT_LIST_WITH_KEY_INDEX`
- Reverts with `InvalidRequestsDataLength()` if the provided data is packed incorrectly
- Reverts with `UnexpectedRequestsDataLength()` if the number of packed requests is not equal `data.requestsCount`
- Reverts if the upper-bound total effective balance of the validators in the report exceeds the limit enforced by `OracleReportSanityChecker.checkExitBusOracleReport`
- Reverts with `InvalidModuleId()` if `moduleId` in the provided data is `0`
- Reverts with `InvalidRequestsDataSortOrder()` when the provided data is not sorted in the ascending order by `(moduleId, nodeOpId, validatorIndex)` or contains duplicates
- Reverts with `InvalidPublicKey(index)` if a provided public key does not match the signing key registered in the staking module at the given `keyIndex`
- Reverts with `InvalidRetrievedKeyLength()` if the key retrieved from the staking module has an invalid length

### submitExitRequestsHash()

Submits a hash pre-commit for the exit requests data to be delivered later via [`submitExitRequestsData`](#submitexitrequestsdata). This enables a two-step delivery for trusted entities (e.g., Easy Track): first the hash, then the data.

```solidity
function submitExitRequestsHash(bytes32 exitRequestsHash) external whenResumed onlyRole(SUBMIT_REPORT_HASH_ROLE);
```

#### Parameters

| Name               | Type      | Description                                                                                                     |
| ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `exitRequestsHash` | `bytes32` | `keccak256(abi.encode(data, dataFormat))` hash of the exit requests payload to be submitted later via `submitExitRequestsData`. |

#### Reverts

- Reverts with `ResumedExpected()` if the contract is paused
- Reverts with `AccessControl:...` reason if the sender has no `SUBMIT_REPORT_HASH_ROLE`
- Reverts with `ExitHashAlreadySubmitted()` if the hash has already been submitted

### submitExitRequestsData()

Submits the exit requests payload pre-committed earlier via [`submitExitRequestsHash`](#submitexitrequestshash). Verifies the hash, validates the data, applies the per-report cap and the ETH-denominated exit request limit, and emits a [`ValidatorExitRequest`](#validatorexitrequest) event for each request.

Each request debits the exit request limit by the upper-bound effective balance of the validator: 32 ETH for validators of modules with `0x01`-type withdrawal credentials and 2048 ETH for validators of modules with `0x02`-type withdrawal credentials.

Structure:

```solidity
struct ExitRequestsData {
  bytes data;
  uint256 dataFormat;
}
```

```solidity
function submitExitRequestsData(ExitRequestsData calldata request) external whenResumed;
```

#### Parameters

| Name         | Type      | Description                                                                                          |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------- |
| `data`       | `bytes`   | Tightly packed list of exit requests.                                                                 |
| `dataFormat` | `uint256` | Data format: `DATA_FORMAT_LIST=1` or `DATA_FORMAT_LIST_WITH_KEY_INDEX=2`.                             |

#### Reverts

- Reverts with `ResumedExpected()` if the contract is paused
- Reverts with `ExitHashNotSubmitted()` if the hash of the provided data was not submitted earlier
- Reverts with `RequestsAlreadyDelivered()` if the provided data has already been delivered
- Reverts with `UnsupportedRequestsDataFormat(format)` if the provided data format is not supported
- Reverts with `InvalidRequestsDataLength()` if the provided data is empty or packed incorrectly
- Reverts with `UnexpectedContractVersion(expectedVersion, version)` if the contract version differs from the one at the time of the hash submission
- Reverts with `TooManyExitRequestsInReport(requestsCount, maxRequestsPerReport)` if the number of requests exceeds the [`getMaxValidatorsPerReport`](#getmaxvalidatorsperreport) cap
- Reverts with `ExitRequestsLimitExceeded(balanceEth, remainingLimitEth)` if the upper-bound total effective balance of the requested validators exceeds the currently available exit request limit
- Reverts with `InvalidModuleId()` if `moduleId` in the provided data is `0`
- Reverts with `InvalidRequestsDataSortOrder()` when the provided data is not sorted in the ascending order by `(moduleId, nodeOpId, validatorIndex)` or contains duplicates
- For the `DATA_FORMAT_LIST_WITH_KEY_INDEX` format, reverts with `InvalidPublicKey(index)` or `InvalidRetrievedKeyLength()` if a provided public key fails validation against the keys registered in the staking module

### triggerExits()

Submits Triggerable Withdrawal Requests to the [TriggerableWithdrawalsGateway](/contracts/triggerable-withdrawals-gateway) for the specified validators whose exit requests were delivered earlier via an oracle report or `submitExitRequestsData`. The attached `msg.value` covers the [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) withdrawal request fees; any excess is refunded to `refundRecipient`.

```solidity
function triggerExits(
  ExitRequestsData calldata exitsData,
  uint256[] calldata exitDataIndexes,
  address refundRecipient
) external payable whenResumed preservesEthBalance;
```

#### Parameters

| Name              | Type               | Description                                                                                    |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `exitsData`       | `ExitRequestsData` | The exit requests data delivered earlier via an oracle report or `submitExitRequestsData`.      |
| `exitDataIndexes` | `uint256[]`        | Strictly increasing list of item indexes in `exitsData.data` to be exited via Trigger Exit.     |
| `refundRecipient` | `address`          | Address to return the excess fee to. If set to zero address, the sender is used.                |

#### Reverts

- Reverts with `ResumedExpected()` if the contract is paused
- Reverts with `ZeroArgument("msg.value")` if no fee is attached to the call
- Reverts with `ZeroArgument("exitDataIndexes")` if the index array is empty
- Reverts with `ExitHashNotSubmitted()` if the hash of the provided data was not submitted earlier
- Reverts with `RequestsNotDelivered()` if the provided data was not delivered yet
- Reverts with `UnsupportedRequestsDataFormat(format)` if the provided data format is not supported
- Reverts with `InvalidRequestsDataLength()` if the provided data is empty or packed incorrectly
- Reverts with `ExitDataIndexOutOfRange(exitDataIndex, requestsCount)` if any of the provided indexes is out of range
- Reverts with `InvalidExitDataIndexSortOrder()` if `exitDataIndexes` is not a strictly increasing array
- Reverts with `InvalidModuleId()` if `moduleId` of a selected request is `0`

### setExitRequestLimit()

Sets the ETH-denominated limit applied to exit requests delivered via [`submitExitRequestsData`](#submitexitrequestsdata): the maximum exit balance and the frame during which a portion of the limit is restored. Emits the [`ExitBalanceLimitSet`](#exitbalancelimitset) event.

```solidity
function setExitRequestLimit(
  uint256 maxExitBalanceEth,
  uint256 balancePerFrameEth,
  uint256 frameDurationInSec
) external onlyRole(EXIT_REQUEST_LIMIT_MANAGER_ROLE);
```

#### Parameters

| Name                 | Type      | Description                                                                                |
| -------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `maxExitBalanceEth`  | `uint256` | The maximum exit balance limit in ETH.                                                     |
| `balancePerFrameEth` | `uint256` | The exit balance in ETH that can be restored per frame.                                    |
| `frameDurationInSec` | `uint256` | The duration of each frame, in seconds, after which `balancePerFrameEth` can be restored.  |

### setMaxValidatorsPerReport()

Sets the hard cap for the number of validator exit requests that can be processed in a single [`submitExitRequestsData`](#submitexitrequestsdata) payload. Emits the [`SetMaxValidatorsPerReport`](#setmaxvalidatorsperreport-1) event.

```solidity
function setMaxValidatorsPerReport(uint256 maxRequests) external onlyRole(EXIT_REQUEST_LIMIT_MANAGER_ROLE);
```

#### Parameters

| Name          | Type      | Description                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------------- |
| `maxRequests` | `uint256` | The maximum number of exit requests allowed per report. Must be greater than 0. |

### pauseFor()

Pause accepting the reports data and forming new validator exit requests for the provided duration in seconds.

```solidity
function pauseFor(uint256 _duration) external;
```

#### Parameters

| Name        | Type      | Description                                                    |
| ----------- | --------- | -------------------------------------------------------------- |
| `_duration` | `uint256` | pause duration, seconds (use `PAUSE_INFINITELY` for unlimited) |

#### Reverts

- Reverts with `ResumedExpected()` if contract is already paused
- Reverts with `AccessControl:...` reason if sender has no `PAUSE_ROLE`
- Reverts with `ZeroPauseDuration()` if zero duration is passed

### pauseUntil()

Pause accepting the reports data and forming new validator exit requests till the given timestamp (inclusive).

```solidity
function pauseUntil(uint256 _pauseUntilInclusive) external;
```

#### Parameters

| Name                   | Type      | Description                                |
| ---------------------- | --------- | ------------------------------------------ |
| `_pauseUntilInclusive` | `uint256` | the last second to pause until (inclusive) |

#### Reverts

- Reverts with `PauseUntilMustBeInFuture()` if the provided timestamp is in the past
- Reverts with `AccessControl:...` reason if the sender has no `PAUSE_ROLE`
- Reverts with `ResumedExpected()` if the contract is already paused

### resume()

Resume accepting the reports data and forming new validator exit requests.

```solidity
function resume() external;
```

#### Reverts

- Reverts with `PausedExpected()` if contract is already resumed (i.e., not paused)
- Reverts with `AccessControl:...` reason if the sender has no `RESUME_ROLE`

## Permissions

### SUBMIT_DATA_ROLE()

An ACL role granting the permission to submit the data for a committee report.

```solidity
bytes32 public constant SUBMIT_DATA_ROLE = keccak256("SUBMIT_DATA_ROLE");
```

### SUBMIT_REPORT_HASH_ROLE()

An ACL role granting the permission to submit a hash of the exit requests data by calling [`submitExitRequestsHash`](#submitexitrequestshash).

```solidity
bytes32 public constant SUBMIT_REPORT_HASH_ROLE = keccak256("SUBMIT_REPORT_HASH_ROLE");
```

### EXIT_REQUEST_LIMIT_MANAGER_ROLE()

An ACL role granting the permission to set the exit request limits by calling [`setExitRequestLimit`](#setexitrequestlimit) and the per-report cap by calling [`setMaxValidatorsPerReport`](#setmaxvalidatorsperreport).

```solidity
bytes32 public constant EXIT_REQUEST_LIMIT_MANAGER_ROLE = keccak256("EXIT_REQUEST_LIMIT_MANAGER_ROLE");
```

### PAUSE_ROLE()

An ACL role granting the permission to pause accepting the reports data and forming new validator exit requests.

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
```

### RESUME_ROLE()

An ACL role granting the permission to resume accepting the reports data and forming new validator exit requests.

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE");
```

### MANAGE_CONSENSUS_CONTRACT_ROLE()

An ACL role granting the permission to set the consensus contract address by calling `setConsensusContract`.

```solidity
bytes32 public constant MANAGE_CONSENSUS_CONTRACT_ROLE = keccak256("MANAGE_CONSENSUS_CONTRACT_ROLE");
```

### MANAGE_CONSENSUS_VERSION_ROLE()

An ACL role granting the permission to set the consensus version by calling `setConsensusVersion`.

```solidity
bytes32 public constant MANAGE_CONSENSUS_VERSION_ROLE = keccak256("MANAGE_CONSENSUS_VERSION_ROLE");
```

## Events

### ValidatorExitRequest()

Emits for each validator requested to exit when exit requests data is processed.

```solidity
event ValidatorExitRequest(
    uint256 indexed stakingModuleId,
    uint256 indexed nodeOperatorId,
    uint256 indexed validatorIndex,
    bytes validatorPubkey,
    uint256 timestamp
);
```

### RequestsHashSubmitted()

Emits when a hash of the exit requests data is stored, either via [`submitExitRequestsHash`](#submitexitrequestshash) or as part of an oracle report submitted via [`submitReportData`](#submitreportdata).

```solidity
event RequestsHashSubmitted(bytes32 exitRequestsHash);
```

### ExitDataProcessing()

Emits when exit requests data is delivered, either via [`submitReportData`](#submitreportdata) or [`submitExitRequestsData`](#submitexitrequestsdata).

```solidity
event ExitDataProcessing(bytes32 exitRequestsHash);
```

### ExitBalanceLimitSet()

Emits when the exit request limits are set by the [`setExitRequestLimit`](#setexitrequestlimit) call.

```solidity
event ExitBalanceLimitSet(uint256 maxExitBalanceEth, uint256 balancePerFrameEth, uint256 frameDurationInSec);
```

### SetMaxValidatorsPerReport()

Emits when the per-report cap is set by the [`setMaxValidatorsPerReport`](#setmaxvalidatorsperreport) call.

```solidity
event SetMaxValidatorsPerReport(uint256 maxValidatorsPerReport);
```

### WarnDataIncompleteProcessing()

Emits on attempt of new data submission having not all of the items processed yet.

```solidity
event WarnDataIncompleteProcessing(
    uint256 indexed refSlot,
    uint256 requestsProcessed,
    uint256 requestsCount
);
```

### ConsensusHashContractSet()

Emits when the consensus contract address is changed.

```solidity
event ConsensusHashContractSet(address indexed addr, address indexed prevAddr);
```

### ConsensusVersionSet()

Emits when a consensus version value is changed.

```solidity
event ConsensusVersionSet(uint256 indexed version, uint256 indexed prevVersion);
```

### ReportSubmitted()

Emits when a new consensus report hash is submitted.

```solidity
event ReportSubmitted(uint256 indexed refSlot, bytes32 hash, uint256 processingDeadlineTime);
```

### ReportDiscarded()

Emits when consensus report is discarded.

```solidity
event ReportDiscarded(uint256 indexed refSlot, bytes32 hash);
```

### ProcessingStarted()

Emits when report data processing is started.

```solidity
event ProcessingStarted(uint256 indexed refSlot, bytes32 hash);
```

### WarnProcessingMissed()

Emits on [`submitConsensusReport`](#submitconsensusreport) when `refSlot != prevSubmittedRefSlot && prevProcessingRefSlot != prevSubmittedRefSlot`

```solidity
event WarnProcessingMissed(uint256 indexed refSlot);
```

### Paused()

Emits when the contract is paused either by the `pauseFor` or `pauseUntil` calls.

```solidity
event Paused(uint256 duration);
```

### Resumed()

Emits when the contract is resumed by the `resume` call.

```solidity
event Resumed();
```
