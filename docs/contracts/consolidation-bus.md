# ConsolidationBus

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationBus.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

:::note
The deployed contract address will be added here after deployment.
:::

## What is ConsolidationBus

ConsolidationBus is a message bus for [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) consolidation requests that decouples request submission from execution and fee payment. The flow is two-step:

1. A registered publisher (`PUBLISH_ROLE`) publishes a batch of consolidation groups via `addConsolidationRequests`. The batch is validated and stored as a hash — no fee is paid at this stage.
2. After the configured execution delay has elapsed, anyone can call `executeConsolidation` (permissionless) supplying the matching groups and the required ETH fee. The bus recomputes the batch hash, verifies the delay, and forwards the batch to the [ConsolidationGateway](/contracts/consolidation-gateway), passing the executor (`msg.sender`) as the fee refund recipient.

This separation allows requests to be published by a trusted party while the fee is paid by an independent executor.

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## Roles and access control

| Role                 | Holder                                              | Description                                            |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `DEFAULT_ADMIN_ROLE` | Aragon Agent                                        | Manages all other roles.                               |
| `PUBLISH_ROLE`       | [ConsolidationMigrator](/contracts/consolidation-migrator) | Publishes consolidation batches.               |
| `REMOVE_ROLE`        | CMC Committee                                       | Removes pending batches from the queue.                |
| `MANAGE_ROLE`        | _unassigned_                                        | Manages batch size, group, and execution-delay limits. |

The proxy admin is the Aragon Agent.

## Constructor and initialization

The `consolidationGateway` address is set in the implementation constructor as an immutable; the rest of the configuration is set in `initialize`.

```sol
constructor(address consolidationGateway)

function initialize(
    address admin,
    uint256 initialBatchSize,
    uint256 initialMaxGroupsInBatch,
    uint256 initialExecutionDelay
) external
```

| Parameter                 | Type      | Description                                                                |
| ------------------------- | --------- | -------------------------------------------------------------------------- |
| `consolidationGateway`    | `address` | The [ConsolidationGateway](/contracts/consolidation-gateway) address.      |
| `admin`                   | `address` | Receives `DEFAULT_ADMIN_ROLE` (Aragon Agent). Reverts `AdminCannotBeZero` if zero. |
| `initialBatchSize`        | `uint256` | Maximum total source pubkeys per batch (initial value: `200`).             |
| `initialMaxGroupsInBatch` | `uint256` | Maximum number of groups per batch (initial value: `10`).                  |
| `initialExecutionDelay`   | `uint256` | Delay, in seconds, between publishing and executing a batch (initial value: `86400`). |

:::note
`maxGroupsInBatch` must always be less than or equal to `batchSize`; the setters enforce this invariant (`MaxGroupsExceedsBatchSize`).
:::

## Admin methods

### setBatchSize()

Sets the maximum total number of source public keys allowed in a batch. Requires `MANAGE_ROLE`. Emits `BatchLimitUpdated`.

```sol
function setBatchSize(uint256 limit) external onlyRole(MANAGE_ROLE)
```

### setMaxGroupsInBatch()

Sets the maximum number of groups allowed in a batch. Requires `MANAGE_ROLE`. Emits `MaxGroupsInBatchUpdated`.

```sol
function setMaxGroupsInBatch(uint256 limit) external onlyRole(MANAGE_ROLE)
```

### setExecutionDelay()

Sets the delay, in seconds, between publishing and executing a batch (`0` means no delay). Requires `MANAGE_ROLE`. Emits `ExecutionDelayUpdated`.

```sol
function setExecutionDelay(uint256 delay) external onlyRole(MANAGE_ROLE)
```

:::note
The execution delay is not snapshotted per batch; changing it applies retroactively to all pending batches.
:::

### removeBatches()

Removes pending batches from the queue by their hashes. Requires `REMOVE_ROLE`. Reverts if `batchHashes` is empty (`EmptyBatchHashes`) or any batch is not found (`BatchNotFound`). Emits `BatchesRemoved`.

```sol
function removeBatches(bytes32[] calldata batchHashes) external onlyRole(REMOVE_ROLE)
```

## Publisher API

### addConsolidationRequests()

Publishes a batch of grouped consolidation requests. The batch is validated and stored as `keccak256(abi.encode(groups))` mapped to a `BatchInfo { publisher, addedAt }` record. Requires `PUBLISH_ROLE`. Emits `RequestsAdded(publisher, batchData)`.

```sol
function addConsolidationRequests(ConsolidationGroup[] calldata groups) external onlyRole(PUBLISH_ROLE)
```

**Structures**:

```sol
struct ConsolidationGroup {
    bytes[] sourcePubkeys;
    bytes targetPubkey;
}
```

Reverts if:

- the caller does not have `PUBLISH_ROLE`;
- `groups` is empty (`EmptyBatch`);
- the number of groups exceeds `maxGroupsInBatch` (`TooManyGroups`);
- any group has no source public keys (`EmptyGroup`);
- the total number of source public keys exceeds `batchSize` (`BatchTooLarge`);
- the same batch is already pending (`BatchAlreadyPending`);
- any source or target public key is not exactly 48 bytes (`InvalidSourcePubkeyLength` / `InvalidTargetPubkeyLength`);
- any source public key equals its group's target public key (`SourceEqualsTarget`).

## Executor API

### executeConsolidation()

Executes a previously published batch. The function reconstructs the publisher's `ConsolidationGroup[]` from the supplied witness groups, recomputes the batch hash, verifies that the execution delay has elapsed, deletes the pending batch, and forwards the request to the [ConsolidationGateway](/contracts/consolidation-gateway) with `msg.value` as the fee and `msg.sender` as the refund recipient. Permissionless. Emits `RequestsExecuted(batchHash, feePaid)`.

```sol
function executeConsolidation(
    IConsolidationGateway.ConsolidationWitnessGroup[] calldata groups
) external payable
```

Reverts if the batch was never added, was already executed, or was removed (`BatchNotFound`), or if the execution delay has not yet passed (`ExecutionDelayNotPassed`).

## View methods

### batchSize()

```sol
function batchSize() external view returns (uint256)
```

### maxGroupsInBatch()

```sol
function maxGroupsInBatch() external view returns (uint256)
```

### executionDelay()

```sol
function executionDelay() external view returns (uint256)
```

### getConsolidationGateway()

Returns the [ConsolidationGateway](/contracts/consolidation-gateway) address.

```sol
function getConsolidationGateway() external view returns (address)
```

### getBatchInfo()

Returns the `BatchInfo { address publisher; uint64 addedAt; }` record for a batch hash (zero values if the batch is not in the queue).

```sol
function getBatchInfo(bytes32 batchHash) external view returns (BatchInfo memory)
```

## Events

```sol
event BatchLimitUpdated(uint256 newLimit);
event MaxGroupsInBatchUpdated(uint256 newLimit);
event ExecutionDelayUpdated(uint256 newDelay);
event RequestsAdded(address indexed publisher, bytes batchData);
event RequestsExecuted(bytes32 indexed batchHash, uint256 feePaid);
event BatchesRemoved(bytes32[] batchHashes);
```

## Related

- [ConsolidationGateway](/contracts/consolidation-gateway)
- [ConsolidationMigrator](/contracts/consolidation-migrator)
