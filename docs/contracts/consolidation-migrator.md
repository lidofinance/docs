# ConsolidationMigrator

- [Source code](https://github.com/lidofinance/core/blob/v3.1.0/contracts/0.8.25/consolidation/ConsolidationMigrator.sol)
- [Deployed contract](https://etherscan.io/address/0x9Dc70b5A4f4F5E4AF9058C983D560564F031f1D7)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

ConsolidationMigrator is a temporary helper contract for migrating stake between staking modules via [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) consolidations. It validates consolidation requests submitted as validator key indices, resolves them to public keys through the staking modules, and publishes the resulting batches to the [ConsolidationBus](/contracts/consolidation-bus).

## What is ConsolidationMigrator

The migrator is the entry point of the [Lido Core consolidation pipeline](/contracts/consolidation-gateway#consolidation-flow-in-lido-core). Its primary purpose is to support the stake migration from legacy staking modules to new ones — initially, from Curated Module v1 (CMv1) to Curated Module v2 (CMv2), as described in [LIP-33](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-33.md) and [LIP-35](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md).

Each migrator instance is bound to a fixed **source** staking module and a fixed **target** staking module: both module IDs are immutable, set in the implementation constructor and readable via [`sourceModuleId`](#sourcemoduleid) and [`targetModuleId`](#targetmoduleid).

Consolidations are permitted only for explicitly allowed (source operator → target operator) pairs. Each allowed pair has a designated **Consolidation Manager** (submitter) — the only address authorized to submit consolidation batches for that pair. The allowlist is managed through an [EasyTrack](https://dao.lido.fi/easy-track/motions)-driven flow (see [Allowlist management](#allowlist-management)).

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## Migration flow

1. A node operator creates an EasyTrack motion specifying a single source operator ID (in the source module), a list of target operator IDs (in the target module), and a single Consolidation Manager address. Upon enactment, [`allowPair`](#allowpair) is called for each (source, target) pair.
2. The Consolidation Manager calls [`submitConsolidationBatch`](#submitconsolidationbatch) with validator key indices grouped by target key: each group maps several source key indices to a single target key index.
3. The migrator validates the batch (see [Batch validation](#batch-validation)) and resolves the key indices to validator public keys through the source and target staking modules.
4. The resulting groups are published to the [ConsolidationBus](/contracts/consolidation-bus) (the migrator is expected to hold the bus's `PUBLISH_ROLE`), from where the batch proceeds through the standard execution flow: [ConsolidationBus](/contracts/consolidation-bus) → [ConsolidationGateway](/contracts/consolidation-gateway) → [WithdrawalVault](/contracts/withdrawal-vault).

### Batch validation

A batch is an array of index groups:

```solidity
struct ConsolidationIndexGroup {
    uint256[] sourceKeyIndices;
    uint256 targetKeyIndex;
}
```

[`submitConsolidationBatch`](#submitconsolidationbatch) verifies that:

- the caller is the designated submitter (Consolidation Manager) for the (source operator → target operator) pair — which also implies the pair is currently allowed;
- every source key index refers to a deposited key of the source operator in the source module;
- the target key index of every group refers to a deposited key of the target operator in the target module.

A key index is considered deposited if it is less than the operator's `totalDepositedValidators` counter obtained via the module's `getNodeOperatorSummary`. The public keys themselves are fetched via the module's `getSigningKeys` (see [Module interaction](#module-interaction)).

Batch-level constraints — the batch size limit, the groups-per-batch limit, key length, and source-not-equal-to-target checks — are enforced downstream by the [ConsolidationBus](/contracts/consolidation-bus#publication).

### Module interaction

Since the migrator is a temporary contract, it relies on the key-retrieval methods already implemented by the supported modules through a `getSigningKeys` method. 

### Allowlist management

Consolidation pairs are managed with three methods:

- [`allowPair`](#allowpair) — allows consolidation from a source operator to a target operator with a designated submitter. Called via an EasyTrack motion upon enactment. Calling it again for an existing pair updates the submitter.
- [`disallowPair`](#disallowpair) — disallows a pair and removes its submitter. May be used to correct an incorrectly allowed pair, update the Consolidation Manager address, or stop a consolidation for operational reasons. 
- [`selfDisallowPair`](#selfdisallowpair) — lets the current submitter revoke their own pair without any role.

Once a pair is disallowed, it can be allowed again only through a new EasyTrack motion.

## Roles

Access to lever methods is restricted using the functionality of the `AccessControlEnumerableUpgradeable` contract:

- `DEFAULT_ADMIN_ROLE` — manages role assignments; held by the Lido DAO Aragon Agent;
- `ALLOW_PAIR_ROLE` — allows adding consolidation pairs to the allowlist; intended for the [EasyTrack](https://dao.lido.fi/easy-track/motions) executor;
- `DISALLOW_PAIR_ROLE` — allows removing consolidation pairs from the allowlist.

Submitting a batch requires no role — [`submitConsolidationBatch`](#submitconsolidationbatch) is restricted to the pair's designated submitter instead.

## View methods

### `isPairAllowed`

Returns whether consolidation from the source operator to the target operator is allowed.

```solidity
function isPairAllowed(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (bool);
```

**Parameters:**

| Name               | Type      | Description                                 |
| ------------------ | --------- | -------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module |
| `targetOperatorId` | `uint256` | id of the target operator in the target module |

### `getAllowedTargets`

Returns all allowed target operators for the given source operator.

```solidity
function getAllowedTargets(uint256 sourceOperatorId) external view returns (uint256[] memory);
```

**Parameters:**

| Name               | Type      | Description                                 |
| ------------------ | --------- | -------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module |

**Returns:**

| Name | Type        | Description                        |
| ---- | ----------- | ----------------------------------- |
|      | `uint256[]` | ids of the allowed target operators |

### `getSubmitter`

Returns the submitter (Consolidation Manager) address for a consolidation pair, or the zero address if the pair is not allowed.

```solidity
function getSubmitter(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (address);
```

**Parameters:**

| Name               | Type      | Description                                 |
| ------------------ | --------- | -------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module |
| `targetOperatorId` | `uint256` | id of the target operator in the target module |

### `getStakingRouter`

Returns the address of the [StakingRouter](/contracts/staking-router) used to resolve staking module addresses. The address is immutable, set at deployment.

```solidity
function getStakingRouter() external view returns (address);
```

### `getConsolidationBus`

Returns the address of the [ConsolidationBus](/contracts/consolidation-bus) the migrator publishes batches to. The address is immutable, set at deployment.

```solidity
function getConsolidationBus() external view returns (address);
```

### `sourceModuleId`

Returns the id of the source staking module this migrator is bound to.

```solidity
function sourceModuleId() external view returns (uint256);
```

### `targetModuleId`

Returns the id of the target staking module this migrator is bound to.

```solidity
function targetModuleId() external view returns (uint256);
```

## Write methods

### `submitConsolidationBatch`

Validates a consolidation batch submitted as key indices, resolves the indices to validator public keys, and publishes the resulting groups to the [ConsolidationBus](/contracts/consolidation-bus). See [Batch validation](#batch-validation) for the checks performed.

Can be called only by the designated submitter (Consolidation Manager) for the given pair, set via [`allowPair`](#allowpair).

```solidity
function submitConsolidationBatch(
    uint256 sourceOperatorId,
    uint256 targetOperatorId,
    ConsolidationIndexGroup[] calldata groups
) external;
```

**Parameters:**

| Name               | Type                        | Description                                                                    |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------- |
| `sourceOperatorId` | `uint256`                   | id of the source operator in the source module                                   |
| `targetOperatorId` | `uint256`                   | id of the target operator in the target module                                   |
| `groups`           | `ConsolidationIndexGroup[]` | index groups, each containing source key indices and a single target key index |

**Reverts:**

- with `NotAuthorized` if the caller is not the designated submitter for the pair (including when the pair is not allowed);
- with `KeyNotDeposited` if any referenced key index is not deposited;
- with any error propagated from the [bus's publication checks](/contracts/consolidation-bus#addconsolidationrequests) (batch limits, key length, duplicate batch).

### `allowPair`

Allows a consolidation pair (source operator → target operator) with a designated submitter. Calling it again for an existing pair updates the submitter. Restricted to the `ALLOW_PAIR_ROLE` role, intended to be called via an [EasyTrack](https://dao.lido.fi/easy-track/motions) motion upon enactment.

```solidity
function allowPair(uint256 sourceOperatorId, uint256 targetOperatorId, address submitter) external;
```

**Parameters:**

| Name               | Type      | Description                                                  |
| ------------------ | --------- | ------------------------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module                 |
| `targetOperatorId` | `uint256` | id of the target operator in the target module                 |
| `submitter`        | `address` | address authorized to submit consolidation batches for the pair |

**Reverts:**

- if the caller does not have the `ALLOW_PAIR_ROLE`;
- with `ZeroArgument` if `submitter` is the zero address.

### `disallowPair`

Disallows a consolidation pair and removes its submitter. Restricted to the `DISALLOW_PAIR_ROLE` role.

```solidity
function disallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external;
```

**Parameters:**

| Name               | Type      | Description                                 |
| ------------------ | --------- | -------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module |
| `targetOperatorId` | `uint256` | id of the target operator in the target module |

**Reverts:**

- if the caller does not have the `DISALLOW_PAIR_ROLE`;
- with `PairNotInAllowlist` if the pair is not allowed.

### `selfDisallowPair`

Lets the current submitter disallow their own pair. Requires no role: the caller must be the designated submitter for the pair.

```solidity
function selfDisallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external;
```

**Parameters:**

| Name               | Type      | Description                                 |
| ------------------ | --------- | -------------------------------------------- |
| `sourceOperatorId` | `uint256` | id of the source operator in the source module |
| `targetOperatorId` | `uint256` | id of the target operator in the target module |

**Reverts:**

- with `NotAuthorized` if the caller is not the designated submitter for the pair.

## Events

### `ConsolidationPairAllowed`

Emitted when a consolidation pair is allowed or its submitter is updated.

```solidity
event ConsolidationPairAllowed(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    address indexed submitter
);
```

### `ConsolidationPairDisallowed`

Emitted when a consolidation pair is disallowed, either by the `DISALLOW_PAIR_ROLE` holder or by the submitter themselves.

```solidity
event ConsolidationPairDisallowed(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    address indexed submitter
);
```

### `ConsolidationSubmitted`

Emitted when a consolidation batch is validated and published to the bus.

```solidity
event ConsolidationSubmitted(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    ConsolidationIndexGroup[] groups
);
```
