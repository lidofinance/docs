# DepositQueue

## Overview

The `DepositQueue` contract enables asynchronous asset deposits into vaults using a time delayed, oracle priced queuing mechanism. Deposits are not processed immediately. Instead, users submit requests that are later fulfilled when an external price oracle submits a valid report. This enables batching (based on Fenwick Tree data structure), mitigates front running, and facilitates accurate share pricing.

## Deposit Lifecycle

### Step 1: User Deposits

- A user submits a deposit request via `deposit(assets, referral, merkleProof)`.
- The deposited amount is stored as a `(timestamp, value)` checkpoint under `requestOf[msg.sender]`.
- Each account can have only one pending request at a time.
- Deposits are validated via optional Merkle whitelist logic (using `merkleProof`) or onchain mapping (if `flags.hasWhitelist()` returns true).
- If a previous request exists, it must be claimed or canceled before creating a new one.

### Step 2: Oracle Report

- Oracle submits a report via the `handleReport(priceD18, timestamp)` method.
- The queue validates the report. It must be called by the vault, the timestamp must be in the past, and price must be non-zero.
- The queue handles deposit requests that are pending for longer than `depositInterval` seconds (the interval is specified in the oracle's security params).
- The contract stores the price in `prices` and uses it to convert accumulated assets to shares.
- Converted shares are allocated but not minted yet.
- `ReportHandled` is emitted.

### Step 3: User Claims

- A user calls `claim(account)` to mint and receive previously allocated shares.
- The number of shares is computed as:

  ```solidity
  uint256 shares = (request.assets * reducedByDepositFeePriceD18) / 1e18;
  ```

- Shares are minted to the user via `mintAllocatedShares`.

## Cancellation

- A user may cancel a pending request using `cancelDepositRequest()`.
- Cancellation reverts if the request has already become claimable (processed by an oracle report).
- Refund is issued in the original asset amount.
- `DepositRequestCanceled` is emitted.

## Query Methods

- `claimableOf(address account)`: Returns how many shares are currently claimable for a given user.
- `requestOf(address account)`: Returns the `(timestamp, amount)` tuple of a user's current pending request.

## Internal Mechanics

The system tracks all deposit requests and prices using the following structures:

- `Checkpoints.Trace224 prices`: Stores historical oracle reported prices keyed by timestamp.
- `mapping(address => Checkpoints.Checkpoint224) requestOf`: Maps users to their active deposit requests.
- `FenwickTreeLibrary.Tree requests`: A prefix sum data structure tracking asset totals across compressed timestamps.
- `uint256 handledIndices`: Tracks the last fully processed request index, ensuring each oracle report progresses the queue.

## Scalability Challenge

Vaults may face thousands of deposit requests daily. Processing each one individually leads to significant gas costs or out of gas. To optimize:

A Fenwick Tree (Binary Indexed Tree) is used to efficiently manage aggregate deposit data by timestamp.

## Fenwick Tree Mechanics

On deposit:

When a user deposits an amount `A` at time `T`, the system performs:

```
fenwickTree[T] += A
```

On cancellation:

If the user cancels the request:

```
fenwickTree[T] -= A
```

On oracle report:

During report at `reportTimestamp`, the system calculates:

```solidity
fenwickTree.getSum(latestHandledTimestamp + 1, reportTimestamp - depositInterval)
```

This determines the total amount eligible for conversion into vault shares at the reported price.

## Lazy Propagation of Shares

Rather than eagerly updating each user balance during `handleReport`, the vault employs lazy propagation:

- Each user's claimable shares are finalized only during subsequent calling `claim()`.
- This significantly reduces processing cost during batch report execution.

## Timestamp Compression

To minimize storage writes and reads used by `FenwickTree.sol` the system uses coordinate compression, storing only timestamps where actual deposit requests occurred.

This compression strategy ensures that the Fenwick Tree remains compact, even with high frequency usage.

## Key Invariants

1. Single Active Request: Each user may have at most one unprocessed deposit request. A user cannot create a new deposit until the previous one is claimed.
2. Delayed Execution: Deposit processing requires an oracle report submitted after a configured `depositInterval`.
3. Lazy Claiming: Deposits are converted to shares during oracle processing, but users must call `claim()` to receive them.
4. Whitelist Enforcement: Deposits may require Merkle proof for depositor whitelisting.

## Events

- `DepositRequested(address account, address referral, uint224 assets, uint32 timestamp)`: Emitted on new deposit submission.
- `DepositRequestCanceled(address account, uint256 assets, uint32 timestamp)`: Emitted when a request is canceled and assets refunded.
- `DepositRequestClaimed(address account, uint256 shares, uint32 timestamp)`: Emitted when deposit shares are successfully claimed.
- `ReportHandled(uint224 priceD18, uint32 timestamp)`: Emitted when an oracle report is processed.

## Errors

- `DepositNotAllowed()`: Depositor not whitelisted.
- `PendingRequestExists()`: Existing request not yet processed or claimed.
- `ClaimableRequestExists()`: Attempting to cancel after request has become claimable.
- `NoPendingRequest()`: No existing request to cancel.
- `ZeroValue()`: Input value is zero.
- `InvalidReport()`: Oracle report failed validation.
- `Forbidden()`: Unauthorized caller.
- `QueuePaused()`: Deposits disabled via vault pause mechanism.
