# RedeemQueue

## Purpose

The `RedeemQueue` contract enables delayed, batched redemptions of vault shares into underlying assets. Redemptions are processed in two phases:

1. Oracle pricing - shares are priced via a trusted price report.
2. Liquidity settlement - vault liquidity is allocated to fulfill priced requests.

This separation supports asynchronous liquidity management, gas efficiency, and protection against griefing.

## Overview

The `RedeemQueue` enables users to convert their vault shares into underlying assets, introducing a time delay enforced by an oracle defined `redeemInterval`. It maintains the following core invariants:

1. Request Format: Each request is structured as a `(shares, timestamp)` pair.
2. Non-Cancellable: Redemption requests cannot be cancelled to prevent griefing (for example submitting and cancelling after unstaking starts).
3. Multiple Requests Allowed: Users may submit multiple independent redemption requests.

Upon receiving an oracle report at `reportTimestamp`, the system processes all requests with:

```solidity
timestamp <= reportTimestamp - redeemInterval
```

On the next step these vault shares are converted to assets at the price specified in the oracle report in this step.

## Liquidity Processing (Two-Stage)

Redemption is handled in two distinct phases:

1. Post-Request: Vault curators monitor and, if needed, pull liquidity from external protocols.
2. Post-Oracle Report: Once a valid report is submitted and sufficient liquidity is available, the vault curator (or any other trusted actor) invokes `handleBatches(n)` on the `RedeemQueue`. This action triggers the movement of required assets from the vault (and associated subvaults) to process redemption requests.

## Scalability Approach

Unlike deposits, redemption requests are never cancelled, which allows for a simplified and gas efficient tracking model. A prefix sum array is used to efficiently manage cumulative share redemptions over time.

## Redemption Processing Logic

### On Redemption

When a user redeems `amount` of shares at time `T`, the system logs:

```
prefixSum[T] += amount
```

### On Oracle Report

At `reportTimestamp`, all requests with:

```solidity
timestamp <= reportTimestamp - redeemInterval
```

are marked as processed.

### Post-Processing

The curator ensures the necessary asset liquidity is available, then calls `handleBatches()` to finalize processing.

### User Claim

After requests are processed, users can call:

```solidity
claim(receiver, timestamps[])
```

to claim assets for their requested vault shares corresponding to each processed timestamp.

## Storage Layout

All internal state is maintained in `RedeemQueueStorage`, including:

| Field | Description |
| --- | --- |
| `handledIndices` | Tracks number of oracle checkpoints that have been priced |
| `batchIterator` | Index of the next unfulfilled batch |
| `totalDemandAssets` | Total asset amount needed to fulfill pending batches |
| `totalPendingShares` | Total shares in requests that are not yet claimable |
| `requestsOf` | Maps `address -> (timestamp -> shares)` for pending user requests |
| `prefixSum` | Maps `timestamp index -> shares` for batch creation and summation |
| `batches` | Array of `Batch` structs; each batch tracks fulfilled assets and shares |
| `prices` | Oracle reported price checkpoints, indexed by timestamp |

## Structs

### `Request`

Represents a single redemption request from a user:

- `timestamp`: When the request was submitted.
- `shares`: Amount of vault shares being redeemed.
- `isClaimable`: Set to true after batch is fulfilled.
- `assets`: Amount of assets claimable for this request (set after pricing).

### `Batch`

Represents a priced redemption batch:

- `assets`: Total value fulfilled for the batch (via oracle `shares / report.price`).
- `shares`: Total shares matched in this batch.

## View Functions

### `requestsOf(account, offset, limit)`

Returns paginated redemption request data for the specified account. Each request includes:

- Timestamp
- Shares
- Claimable status
- Asset amount

### `batchAt(index)`

Returns the `(assets, shares)` for a given redemption batch.

### `getState()`

Returns core system state:

- Current `batchIterator` (next unfulfilled batch index)
- Total `batches`
- Total `demandedAssets` still awaiting liquidity
- Total `pendingShares` that are not yet claimable

## State Transition Guarantees

1. Non-Cancellable Requests: Prevents griefing where a user requests redemption, causing curator to pull liquidity, then cancels.
2. Price Separation: Oracle reports must be delayed by at least `redeemInterval` seconds from the original request.
3. Asynchronous Fulfillment: Liquidity can be managed independently of oracle report submission.

## Events

- `RedeemRequested(account, shares, timestamp)`
- `RedeemRequestClaimed(account, receiver, assets, timestamp)`
- `RedeemRequestsHandled(counter, demand)`
