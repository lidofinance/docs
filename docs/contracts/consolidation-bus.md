# ConsolidationBus

- [Source code](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.25/consolidation/ConsolidationBus.sol)
- [Deployed contract](https://etherscan.io/address/0xd907CE33B4Be423823d1CFFe80BD147E8b8554C8)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

ConsolidationBus is a message bus for [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) consolidation requests that decouples batch publication from execution and fee payment. Trusted publishers announce consolidation batches on-chain, and after a configurable delay anyone can execute a published batch by supplying the required fee.

## What is ConsolidationBus

The bus is the middle link of the [Lido Core consolidation pipeline](/contracts/consolidation-gateway#consolidation-flow-in-lido-core): it receives validated consolidation batches from the [ConsolidationMigrator](/contracts/consolidation-migrator) and forwards them to the [ConsolidationGateway](/contracts/consolidation-gateway) for execution. The flow is two-step:

1. **Publish.** A registered publisher (`PUBLISH_ROLE`, intended for the ConsolidationMigrator) publishes a batch of consolidation groups via [`addConsolidationRequests`](#addconsolidationrequests). The batch is validated and stored as a hash together with the submission timestamp — no fee is paid at this stage.
2. **Execute.** After the [execution delay](#execution-delay) has elapsed, anyone can call [`executeConsolidation`](#executeconsolidation), supplying the matching batch extended with target validator witnesses and the required ether fee. The bus recomputes the batch hash, verifies the delay, and forwards the batch to the gateway, passing the executor as the fee refund recipient.

This separation serves two purposes. First, batches can be published by a trusted on-chain party while the consolidation fee is paid by an independent, permissionless executor (a dedicated Consolidation Executor bot is expected to monitor the bus and execute pending batches). Second, the delay between publication and execution creates a time window during which an erroneous or malicious batch can be [removed](#removebatches) from the queue or blocked by pausing [DepositSecurityModule](/contracts/deposit-security-module) deposits (see [Execution delay](#execution-delay)).

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## Batch lifecycle

### Publication

A batch is an array of consolidation groups, each mapping several source validator public keys to a single target validator public key:

```solidity
struct ConsolidationGroup {
    bytes[] sourcePubkeys;
    bytes targetPubkey;
}
```

On publication via [`addConsolidationRequests`](#addconsolidationrequests), the bus validates that:

- the batch is not empty and the number of groups does not exceed [`maxGroupsInBatch`](#maxgroupsinbatch);
- every group contains at least one source key, and the total number of source keys across the batch does not exceed [`batchSize`](#batchsize);
- every source and target public key is 48 bytes long, and no source key equals its group's target key;
- an identical batch is not already pending.

Only the batch hash — `keccak256(abi.encode(groups))` — is stored on-chain, along with the publisher address and the submission timestamp:

```solidity
struct BatchInfo {
    address publisher;
    uint64 addedAt;
}
```

The full encoded batch data is emitted in the [`RequestsAdded`](#requestsadded) event, so executors can reconstruct pending batches from event logs. The same batch cannot be pending twice, but it can be published again after it has been executed or removed.

### Execution

Execution via [`executeConsolidation`](#executeconsolidation) is permissionless and payable. The executor supplies the batch in the gateway's format — each group's target key replaced with a [`ValidatorWitness`](/contracts/predeposit-guarantee#validatorwitness) carrying the target's withdrawal credentials proof.

The bus reconstructs the published batch from the witness groups (taking each target public key from its witness), recomputes the hash, and verifies that:

- the batch is pending — it was published and has not been executed or removed;
- the [execution delay](#execution-delay) has elapsed since publication.

The batch is then deleted from the queue and forwarded to [`ConsolidationGateway.addConsolidationRequests`](/contracts/consolidation-gateway#addconsolidationrequests) together with the attached ether, with the executor (`msg.sender`) set as the refund recipient for any fee excess.

The bus itself does not re-validate the requests' contents at execution time — hash equality guarantees the batch is byte-for-byte the one published. All execution-time checks (withdrawal credentials proofs, rate limits, protocol state, fee sufficiency) are performed by the [gateway](/contracts/consolidation-gateway#request-processing). If the gateway reverts, the whole execution transaction reverts and the batch remains pending, so execution can be retried later.

### Removal

An account with the `REMOVE_ROLE` can remove pending batches from the queue by hash via [`removeBatches`](#removebatches). This is the safety hatch for the window between publication and execution: a batch published in error can be withdrawn before any executor pays for it.

### Execution delay

The delay between publication and execution, in seconds, readable via [`executionDelay`](#executiondelay) and configurable via [`setExecutionDelay`](#setexecutiondelay) (zero means batches are executable immediately).

The delay ensures that honest [DepositSecurityModule](/contracts/deposit-security-module) guardians have sufficient time to pause deposits — which blocks consolidation execution at the [gateway](/contracts/consolidation-gateway#protocol-state-checks) — in case keys with invalid withdrawal credentials were deposited.

The delay is a single global parameter and is not snapshotted per batch: changing it applies retroactively to all pending batches. `MANAGE_ROLE` holders are trusted with this behavior.

## Roles

Access to lever methods is restricted using the functionality of the `AccessControlEnumerableUpgradeable` contract:

- `DEFAULT_ADMIN_ROLE` — manages role assignments; held by the Lido DAO Aragon Agent;
- `PUBLISH_ROLE` — allows publishing consolidation batches; intended for the [ConsolidationMigrator](/contracts/consolidation-migrator);
- `MANAGE_ROLE` — allows configuring the batch limits and the execution delay;
- `REMOVE_ROLE` — allows removing pending batches from the queue.

Executing a pending batch requires no role: [`executeConsolidation`](#executeconsolidation) is permissionless.

## View methods

### `batchSize`

Returns the maximum total number of source keys allowed in a single batch.

```solidity
function batchSize() external view returns (uint256);
```

### `maxGroupsInBatch`

Returns the maximum number of consolidation groups allowed in a single batch. Cannot exceed [`batchSize`](#batchsize).

```solidity
function maxGroupsInBatch() external view returns (uint256);
```

### `executionDelay`

Returns the current [execution delay](#execution-delay) in seconds.

```solidity
function executionDelay() external view returns (uint256);
```

### `getConsolidationGateway`

Returns the address of the [ConsolidationGateway](/contracts/consolidation-gateway) the bus forwards batches to. The address is immutable, set at deployment.

```solidity
function getConsolidationGateway() external view returns (address);
```

### `getBatchInfo`

Returns the stored info for a pending batch: the publisher address and the publication timestamp. Both fields are zero if the batch is not in the queue (never published, already executed, or removed).

```solidity
function getBatchInfo(bytes32 batchHash) external view returns (BatchInfo memory);
```

**Parameters:**

| Name        | Type      | Description                    |
| ----------- | --------- | ------------------------------- |
| `batchHash` | `bytes32` | hash of the batch to look up    |

**Returns:**

| Name | Type        | Description                                                                    |
| ---- | ----------- | ------------------------------------------------------------------------------- |
|      | `BatchInfo` | publisher address and `addedAt` timestamp; zero values if the batch is not pending |

## Write methods

### `addConsolidationRequests`

Publishes a batch of grouped consolidation requests to the queue. See [Publication](#publication) for the validation rules. Restricted to the `PUBLISH_ROLE` role, intended for the [ConsolidationMigrator](/contracts/consolidation-migrator).

```solidity
function addConsolidationRequests(ConsolidationGroup[] calldata groups) external;
```

**Parameters:**

| Name     | Type                   | Description                                                                     |
| -------- | ---------------------- | -------------------------------------------------------------------------------- |
| `groups` | `ConsolidationGroup[]` | consolidation groups, each containing source public keys and a target public key |

**Reverts:**

- if the caller does not have the `PUBLISH_ROLE`;
- with `EmptyBatch` if the batch is empty, and with `EmptyGroup` if any group has no source keys;
- with `TooManyGroups` or `BatchTooLarge` if the batch exceeds the [limits](#publication);
- with `InvalidSourcePubkeyLength` or `InvalidTargetPubkeyLength` if any public key is not 48 bytes;
- with `SourceEqualsTarget` if any source key equals its group's target key;
- with `BatchAlreadyPending` if an identical batch is already in the queue.

### `executeConsolidation`

Executes a pending batch of grouped consolidation requests, forwarding it to the [ConsolidationGateway](/contracts/consolidation-gateway) with the attached ether as the fee and the caller as the refund recipient. See [Execution](#execution) for the detailed flow. Permissionless.

```solidity
function executeConsolidation(
    IConsolidationGateway.ConsolidationWitnessGroup[] calldata groups
) external payable;
```

**Parameters:**

| Name     | Type                          | Description                                                                                  |
| -------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `groups` | `ConsolidationWitnessGroup[]` | consolidation witness groups, each containing source public keys and a target validator witness |

**Reverts:**

- with `BatchNotFound` if the reconstructed batch was never published, was already executed, or was removed;
- with `ExecutionDelayNotPassed` if the [execution delay](#execution-delay) has not elapsed since publication;
- with any error propagated from the [gateway's request processing](/contracts/consolidation-gateway#request-processing) (insufficient fee, rate limit, protocol state, proof verification).

### `removeBatches`

Removes pending batches from the queue by hash. See [Removal](#removal). Restricted to the `REMOVE_ROLE` role.

```solidity
function removeBatches(bytes32[] calldata batchHashes) external;
```

**Parameters:**

| Name          | Type        | Description                       |
| ------------- | ----------- | ---------------------------------- |
| `batchHashes` | `bytes32[]` | hashes of the batches to remove    |

**Reverts:**

- if the caller does not have the `REMOVE_ROLE`;
- with `EmptyBatchHashes` if the array is empty;
- with `BatchNotFound` if any batch is not pending.

### `setBatchSize`

Sets the maximum total number of source keys allowed in a single batch. Restricted to the `MANAGE_ROLE` role.

```solidity
function setBatchSize(uint256 limit) external;
```

**Parameters:**

| Name    | Type      | Description                                                             |
| ------- | --------- | ------------------------------------------------------------------------ |
| `limit` | `uint256` | new batch size limit; must be non-zero and not below `maxGroupsInBatch` |

### `setMaxGroupsInBatch`

Sets the maximum number of consolidation groups allowed in a single batch. Restricted to the `MANAGE_ROLE` role.

```solidity
function setMaxGroupsInBatch(uint256 limit) external;
```

**Parameters:**

| Name    | Type      | Description                                                          |
| ------- | --------- | --------------------------------------------------------------------- |
| `limit` | `uint256` | new groups limit; must be non-zero and must not exceed `batchSize`   |

### `setExecutionDelay`

Sets the [execution delay](#execution-delay) between publishing and executing a batch. The new value applies retroactively to all pending batches. Restricted to the `MANAGE_ROLE` role.

```solidity
function setExecutionDelay(uint256 delay) external;
```

**Parameters:**

| Name    | Type      | Description                                     |
| ------- | --------- | ------------------------------------------------ |
| `delay` | `uint256` | new execution delay in seconds (0 means no delay) |

## Events

### `RequestsAdded`

Emitted when a batch of consolidation requests is published. `batchData` contains the full ABI-encoded batch (`abi.encode(groups)`), allowing executors to reconstruct it off-chain.

```solidity
event RequestsAdded(address indexed publisher, bytes batchData);
```

### `RequestsExecuted`

Emitted when a pending batch is executed and forwarded to the gateway.

```solidity
event RequestsExecuted(bytes32 indexed batchHash, uint256 feePaid);
```

### `BatchesRemoved`

Emitted when pending batches are removed from the queue.

```solidity
event BatchesRemoved(bytes32[] batchHashes);
```

### `BatchLimitUpdated`

Emitted when the batch size limit is updated.

```solidity
event BatchLimitUpdated(uint256 newLimit);
```

### `MaxGroupsInBatchUpdated`

Emitted when the groups-per-batch limit is updated.

```solidity
event MaxGroupsInBatchUpdated(uint256 newLimit);
```

### `ExecutionDelayUpdated`

Emitted when the execution delay is updated.

```solidity
event ExecutionDelayUpdated(uint256 newDelay);
```
