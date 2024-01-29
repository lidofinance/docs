# HashConsensus

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/oracle/HashConsensus.sol)
- [Deployed instance for AccountingOracle](https://etherscan.io/address/0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288)
- [Deployed instance for ValidatorsExitBusOracle](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a)

:::info
It's advised to read [What is Lido Oracle mechanism](/guides/oracle-operator-manual#intro) before
:::

## What is HashConsensus

HashConsensus is a contract responsible for managing oracle members committee and allowing the members to reach consensus on a data hash for each reporting frame.

Time is divided in frames of equal length, each having reference slot and processing deadline. Report data must be gathered by looking at the world state (both Ethereum Consensus and Execution Layers) at the moment of the frame’s reference slot (including any state changes made in that slot), and must be processed before the frame’s processing deadline.

Frame length is defined in Ethereum Consensus Layer epochs. Reference slot for each frame is set to the last slot of the epoch preceding the frame’s first epoch. The processing deadline is set to the last slot of the last epoch of the frame.

Note that all state changes a report processing could entail are guaranteed to be observed while gathering data for the next frame’s report. This is an essential property given that oracle reports sometimes have to contain diffs instead of the entire state, which might be impractical or even impossible to transmit and process.

Consensus members rotate within one time into two subsets:

- Non-fast-lane members
- [Fast-lane members](/contracts/hash-consensus#fast-lane-members)

Once the consensus is gathered, a [Report processor](#report-processor-ireportasyncprocessor) would allow submitting and processing the actual report data.
The latter is a part of the [phased Oracle report flow](../guides/oracle-operator-manual#oracle-phases).

## Report processor (`IReportAsyncProcessor`)

`IReportAsyncProcessor` defines the interface for a contract that gets consensus reports (i.e. hashes) pushed to and processes them asynchronously.
`HashConsensus` doesn't expect any specific behavior from a report processor, and guarantees the following:

1. `HashConsensus` won't submit reports via `IReportAsyncProcessor.submitConsensusReport` or ask to discard
reports via `IReportAsyncProcessor.discardConsensusReport` for any slot up to (and including)
the slot returned from `IReportAsyncProcessor.getLastProcessingRefSlot`.

2. `HashConsensus` won't accept member reports (and thus won't include such reports in calculating the consensus)
that have `consensusVersion` argument of the `HashConsensus.submitReport` call holding a diff.
value than the one returned from `IReportAsyncProcessor.getConsensusVersion`
at the moment of the `HashConsensus.submitReport` call.

There are two core protocol contracts that implements this interface:

- [AccountingOracle](./accounting-oracle)
- [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md)

## Fast-lane members

Fast lane members is a subset of all members that changes each reporting frame. These members can, and are expected to, submit a report during the first part of the frame called the "fast lane interval" and defined via [setFrameConfig](#setframeconfig) or [setFastLaneLengthSlots](#setfastlanelengthslots). The calculation of the Fast-lane members subset depends on `frameIndex`, `totalMembers` and `quorum`. Under regular circumstances, all other members are only allowed to submit a report after the fast lane interval passes. This is done to encourage each oracle from the full set to participate in reporting on a regular basis, and identify any malfunctioning members.

The fast lane subset consists of quorum members; selection is implemented as a sliding window of the quorum width over member indices (`mod` total members). The window advances by one index each reporting frame.

With the fast lane mechanism active, it's sufficient for the monitoring to check that consensus is consistently reached during the fast lane part of each frame to conclude that all members are active and share the same consensus rules.

:::note
There is no guarantee that, at any given time, it holds true that only the current fast lane members can or were able to report during the currently-configured fast lane interval of the current frame.

In particular, this assumption can be violated in any frame during which the members set, initial epoch, or the quorum number was changed, or the fast lane interval length was increased.

Therefore, the fast lane mechanism should not be used for any purpose other than monitoring of the members liveness, and monitoring tools should take into consideration the potential irregularities within frames with any configuration changes.
:::

## View methods

### getChainConfig()

Returns the immutable chain parameters required to calculate epoch and slot given a timestamp.

```solidity
function getChainConfig() external view returns (
    uint256 slotsPerEpoch,
    uint256 secondsPerSlot,
    uint256 genesisTime
)
```

#### Returns

| Name             | Type      | Description                                                |
| ---------------- | --------- | ---------------------------------------------------------- |
| `slotsPerEpoch`  | `uint256` | Number of slots per epoch, `32` by default                 |
| `secondsPerSlot` | `uint256` | The time allocated for each slot, `12` by default          |
| `genesisTime`    | `uint256` | Consensus Layer genesis time, `1606824023` on [Mainnet](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21)          |

### getFrameConfig()

Returns the time-related configuration.

```solidity
function getFrameConfig() external view returns (
    uint256 initialEpoch,
    uint256 epochsPerFrame,
    uint256 fastLaneLengthSlots
)
```

#### Returns

| Name                  | Type      | Description                                                           |
| --------------------- | --------- | --------------------------------------------------------------------- |
| `initialEpoch`        | `uint256` | Epoch of the frame with zero index                                    |
| `epochsPerFrame`      | `uint256` | Length of a frame in epochs                                           |
| `fastLaneLengthSlots` | `uint256` | Length of the fast lane interval in slots; see `getIsFastLaneMember`  |

### getCurrentFrame()

Returns the current reporting frame.

```solidity
function getCurrentFrame() external view returns (
    uint256 refSlot,
    uint256 reportProcessingDeadlineSlot
)
```

#### Returns

| Name                           | Type      | Description                                                                          |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| `refSlot`                      | `uint256` | The frame's reference slot: if the data the consensus is being reached upon includes or depends on any onchain state, this state should be queried at the reference slot. If the slot contains a block, the state should include all changes from that block. |
| `reportProcessingDeadlineSlot` | `uint256` | The last slot at which the report can be processed by the report processor contract. |

### getInitialRefSlot()

Returns the earliest possible reference slot, i.e. the reference slot of the reporting frame with zero index.

```solidity
function getInitialRefSlot() external view returns (uint256)
```

### getIsMember()

Returns whether the given address is currently a member of the consensus.

```solidity
function getIsMember(address addr) external view returns (bool)
```

### getIsFastLaneMember()

Returns whether the given address is a fast lane member for the current reporting frame.

```solidity
function getIsFastLaneMember(address addr) external view returns (bool)
```

### getMembers()

Returns all current members, together with the last reference slot each member submitted a report for.

```solidity
function getMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

### getFastLaneMembers()

Returns the subset of the oracle committee members (consisting of `quorum` items) that changes each frame.

```solidity
function getFastLaneMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

### getQuorum()

Returns quorum number

```solidity
function getQuorum() external view returns (uint256)
```

### getReportProcessor()

Returns report processor address, i.e oracle address

```solidity
function getReportProcessor() external view returns (address)
```

### getConsensusState()

Returns info about the current frame and consensus state in that frame.

```solidity
function getConsensusState() external view returns (
    uint256 refSlot,
    bytes32 consensusReport,
    bool isReportProcessing
)
```

#### Returns

Returns info about the current frame and consensus state in that frame.

| Name                 | Type      | Description                                                           |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `refSlot`            | `uint256` | Reference slot of the current reporting frame.                        |
| `consensusReport`    | `bytes32` | Consensus report for the current frame, if any. Zero bytes otherwise. |
| `isReportProcessing` | `bool`    | If consensus report for the current frame is already being processed. Consensus can be changed before the processing starts. |

### getReportVariants()

Returns report variants and their support for the current reference slot.

```solidity
function getReportVariants() external view returns (
    bytes32[] memory variants,
    uint256[] memory support
)
```

### getConsensusStateForMember()

Returns the extended information related to an oracle committee member with the
given address and the current consensus state. Provides all the information needed for
an oracle daemon to decide if it needs to submit a report.

```solidity
function getConsensusStateForMember(address addr) external view returns (MemberConsensusState memory result)
```

#### Parameters

| Name   | Type      | Description         |
| ------ | --------- | ------------------- |
| `addr` | `address` | The member address. |

#### Returns

Returns a new type `MemberConsensusState`

```solidity
struct MemberConsensusState {
    /// @notice Current frame's reference slot.
    uint256 currentFrameRefSlot;

    /// @notice Consensus report for the current frame, if any. Zero bytes otherwise.
    bytes32 currentFrameConsensusReport;

    /// @notice Whether the provided address is a member of the oracle committee.
    bool isMember;

    /// @notice Whether the oracle committee member is in the fast lane members subset
    /// of the current reporting frame. See `getIsFastLaneMember`.
    bool isFastLane;

    /// @notice Whether the oracle committee member is allowed to submit a report at
    /// the moment of the call.
    bool canReport;

    /// @notice The last reference slot for which the member submitted a report.
    uint256 lastMemberReportRefSlot;

    /// @notice The hash reported by the member for the current frame, if any.
    /// Zero bytes otherwise.
    bytes32 currentFrameMemberReport;
}
```

## Methods

### updateInitialEpoch()

Sets a new initial epoch given that the current initial epoch is in the future.

Can only be called by users with `DEFAULT_ADMIN_ROLE`.

```solidity
function updateInitialEpoch(uint256 initialEpoch) external
```

- Reverts with `InitialEpochAlreadyArrived()` if current epoch more or equal initial epoch from current frame config.
- Reverts with `InitialEpochRefSlotCannotBeEarlierThanProcessingSlot()` if initial frame refSlot less than last processing refSlot.
- Reverts with `EpochsPerFrameCannotBeZero()` if `epochsPerFrame` from frame config is zero.
- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` from config more than frame length.

### setFrameConfig()

Updates the time-related configuration.

Can only be called by users with `MANAGE_FRAME_CONFIG_ROLE`.

```solidity
function setFrameConfig(uint256 epochsPerFrame, uint256 fastLaneLengthSlots) external
```

- Reverts with `EpochsPerFrameCannotBeZero()` if `epochsPerFrame` is zero.
- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` more than frame length.

#### Parameters

| Name                  | Type      | Description                                                           |
| --------------------- | --------- | --------------------------------------------------------------------- |
| `epochsPerFrame`      | `uint256` | ALength of a frame in epochs.                                         |
| `fastLaneLengthSlots` | `uint256` | Length of the fast lane interval in slots; see `getIsFastLaneMember`. |

### setFastLaneLengthSlots()

Sets the duration of the fast lane interval of the reporting frame.

Can only be called by users with `MANAGE_FAST_LANE_CONFIG_ROLE`.

```solidity
function setFastLaneLengthSlots(uint256 fastLaneLengthSlots) external
```

- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` more than frame length.

#### Parameters

| Name                  | Type      | Description                                                           |
| --------------------- | --------- | --------------------------------------------------------------------- |
| `fastLaneLengthSlots` | `uint256` | The length of the fast lane reporting interval in slots. Setting it to zero disables the fast lane subset, allowing any oracle to report starting from the first slot of a frame and until the frame's reporting deadline. |

### addMember()

Add a new member of the consensus.

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function addMember(address addr, uint256 quorum) external
```

- Reverts with `DuplicateMember()` if `addr` address is already the member of consensus.
- Reverts with `AddressCannotBeZero()` if `addr` address is zero.
- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### removeMember()

Remove a member from the consensus.

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function removeMember(address addr, uint256 quorum) external
```

- Reverts with `NonMember()` if `addr` address doesn't exists
- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### setQuorum()

Update consensus quorum

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function setQuorum(uint256 quorum) external
```

- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### disableConsensus()

Disable consensus quorum, i.e set quorum as `UINT256_MAX` (UNREACHABLE_QUORUM)

Can only be called by users with `DISABLE_CONSENSUS_ROLE`

```solidity
function disableConsensus() external
```

- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### setReportProcessor()

Set report processor address, i.e oracle address

Can only be called by users with `MANAGE_REPORT_PROCESSOR_ROLE`.

```solidity
function setReportProcessor(address newProcessor) external
```

- Reverts with `ReportProcessorCannotBeZero()` if `newProcessor` address is zero.
- Reverts with `NewProcessorCannotBeTheSame()` if `newProcessor` address is equal to the previous processor address.

### submitReport()

Used by oracle members to submit hash of the data calculated for the given reference slot.

```solidity
function submitReport(uint256 slot, bytes32 report, uint256 consensusVersion) external
```

#### Parameters

| Name               | Type      | Description                                                           |
| ------------------ | --------- | --------------------------------------------------------------------- |
| `slot`             | `uint256` | The reference slot the data was calculated for. Reverts if doesn't match the current reference slot.                                         |
| `report`           | `bytes32` | Hash of the data calculated for the given reference slot. |
| `consensusVersion` | `uint256` | Version of the oracle consensus rules. Reverts if doesn't match the version returned by the currently set consensus report processor, or zero if no report processor is set. |

#### Reverts

- Reverts with `InvalidSlot()` if `slot` is zero.
- Reverts with `InvalidSlot()` if `slot` is not equal current frame refSlot.
- Reverts with `NumericOverflow()` if `slot` is more than `UINT64_MAX`
- Reverts with `EmptyReport()` if `reports` is zero hash (`bytes32(0)`)
- Reverts with `NonMember()` if caller address doesn't exists in members array
- Reverts with `UnexpectedConsensusVersion(uint256 expected, uint256 received)` if `consensusVersion` is not equal report processor consensus version.
- Reverts with `StaleReport()` if the current frame slot is more than the frame report processing deadline slot.
- Reverts with `NonFastLaneMemberCannotReportWithinFastLaneInterval()` if the current frame slot is less or equal frame ref slot plus fastlane length AND the member who submits the report is not fastlane member.
- Reverts with `ConsensusReportAlreadyProcessing()` if the member sends a report for the same slot.
- Reverts with `DuplicateReport()` if the member already sends the report.

## Events

### FrameConfigSet()

Emits when a new frame config set via [`setFrameConfig`](#setframeconfig).

```solidity
event FrameConfigSet(uint256 newInitialEpoch, uint256 newEpochsPerFrame)
```

### FastLaneConfigSet()

Emits when fast lane length changed (i.e., length defined in slots).

```solidity
event FastLaneConfigSet(uint256 fastLaneLengthSlots)
```

### MemberAdded()

Emits when a new member of consensus is added.

```solidity
event MemberAdded(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### MemberRemoved()

Emits when an existing member of consensus is removed.

```solidity
event MemberRemoved(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### QuorumSet()

Emits when a quorum of consensus members is changed.

```solidity
event QuorumSet(uint256 newQuorum, uint256 totalMembers, uint256 prevQuorum)
```

### ReportReceived()

Emits when a new report received for the provided `refSlot` by `member` containing the `report` hash.

```solidity
 event ReportReceived(uint256 indexed refSlot, address indexed member, bytes32 report)
```

### ConsensusReached()

Emits when a consensus reached for the provided `refSlot` containing the `report` hash.

```solidity
event ConsensusReached(uint256 indexed refSlot, bytes32 report, uint256 support)
```

### ConsensusLost()

Emits when the previously established consensus for the provided `refSlot` is disbanded.

```solidity
event ConsensusLost(uint256 indexed refSlot)
```

### ReportProcessorSet()

Emits when the report processor is changed from `prevProcessor` to `processor`.
Both addresses must comply with the `IReportAsyncProcessor` interface.

```solidity
event ReportProcessorSet(address indexed processor, address indexed prevProcessor)
```
