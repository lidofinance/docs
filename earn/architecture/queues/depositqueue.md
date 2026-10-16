# DepositQueue

## Overview

The `DepositQueue` contract enables asynchronous asset deposits into vaults using a time delayed, oracle priced queuing mechanism. Deposits are not processed immediately. Instead, users submit requests that are later fulfilled when an external price oracle submits a valid report. This enables batching (based on Fenwick Tree data structure), mitigates front running, and facilitates accurate share pricing.

## Behavior

### Deposit Lifecycle

#### Step 1: User Deposits

- A user submits a deposit request via `deposit(assets, referral, merkleProof)`.
- The deposited amount is stored as a `(timestamp, value)` checkpoint under `requestOf[msg.sender]`.
- Each account can have only one pending request at a time.
- If `hasWhitelist` is enabled, the account must have `canDeposit`. If a Merkle root is set, its proof must also be valid. Both requirements apply when both mechanisms are enabled.
- `deposit` automatically claims a previous request when its processed fee-adjusted price checkpoint is positive. Otherwise, it reverts with `PendingRequestExists`.

#### Step 2: Oracle Report

- Oracle submits a report via the `handleReport(priceD18, timestamp)` method.
- The queue validates the report. It must be called by the vault, the timestamp must be in the past, and price must be non-zero.
- The queue handles deposit requests that are pending for longer than `depositInterval` seconds (the interval is specified in the oracle's security params).
- The contract stores the price in `prices` and uses it to convert accumulated assets to shares.
- User shares are allocated for later claims. Deposit fee shares are minted to the fee recipient.
- The queue sends the processed assets to the vault, reduces pending assets, updates the vault balance in the RiskManager, and calls the deposit hook.
- `ReportHandled` is emitted.

#### Step 3: User Claims

- A user calls `claim(account)` to mint and receive previously allocated shares.
- The number of shares is computed as:

  ```solidity
  uint256 shares = (request.assets * reducedByDepositFeePriceD18) / 1e18;
  ```

- Shares are minted to the user via `mintAllocatedShares`.

### Cancellation

- A user may cancel a pending request using `cancelDepositRequest()`.
- Cancellation reverts if the request has already become claimable (processed by an oracle report).
- Refund is issued in the original asset amount.
- `DepositRequestCanceled` is emitted.

### Internal Mechanics

The system tracks all deposit requests and prices using the following structures:

- `Checkpoints.Trace224 prices`: Stores historical oracle reported prices keyed by timestamp.
- `mapping(address => Checkpoints.Checkpoint224) requestOf`: Maps users to their active deposit requests.
- `FenwickTreeLibrary.Tree requests`: A prefix sum data structure tracking asset totals across compressed timestamps.
- `uint256 handledIndices`: Tracks the last fully processed request index, ensuring each oracle report progresses the queue.

### Scalability Challenge

Vaults may face thousands of deposit requests daily. Processing each one individually leads to significant gas costs or out-of-gas. To optimize:

A Fenwick Tree (Binary Indexed Tree) is used to efficiently manage aggregate deposit data by timestamp.

### Fenwick Tree Mechanics

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

### Lazy Propagation of Shares

Rather than eagerly updating each user balance during `handleReport`, the vault employs lazy propagation:

- Shares are allocated during report processing and minted when claimed. Anyone can call `claim(account)` or the vault's `claimShares(account)`; a subsequent deposit also attempts to claim the account's previous request. `TokenizedShareManager` transfers attempt to claim for both sender and recipient.
- This significantly reduces processing cost during batch report execution.

### Timestamp Compression

To minimize storage writes and reads used by `FenwickTree.sol` the system uses coordinate compression, storing only timestamps where actual deposit requests occurred.

This compression strategy ensures that the Fenwick Tree remains compact, even with high frequency usage.

## Functions

### View Functions

- `claimableOf(address account)`: Returns how many shares are currently claimable for a given user.
- `requestOf(address account)`: Returns the `(timestamp, amount)` tuple of a user's current pending request.
- `unclaimedRequests()`: Returns the number of requests still awaiting a claim or cancellation.
- `canBeRemoved()`: Returns true only when `unclaimedRequests() == 0`.

## Events

- `DepositRequested(address account, address referral, uint224 assets, uint32 timestamp)`: Emitted on new deposit submission.
- `DepositRequestCanceled(address account, uint256 assets, uint32 timestamp)`: Emitted when a request is canceled and assets refunded.
- `DepositRequestClaimed(address account, uint256 shares, uint32 timestamp)`: Emitted when deposit shares are successfully claimed.
- `ReportHandled(uint224 priceD18, uint32 timestamp)`: Emitted when an oracle report is processed.

## Errors

- `DepositNotAllowed()`: Depositor not whitelisted.
- `PendingRequestExists()`: The previous request cannot be claimed because its fee-adjusted price checkpoint is not yet available or is zero.
- `ClaimableRequestExists()`: Attempting to cancel after request has become claimable.
- `NoPendingRequest()`: No existing request to cancel.
- `ZeroValue()`: Input value is zero.
- `InvalidReport()`: Invalid report input, or the latest supported-asset report is zero-priced or suspicious during deposit/cancellation accounting.
- `LimitExceeded(int256 newValue, int256 maxValue)`: A deposit or report-time vault balance update exceeds the RiskManager vault limit.
- `Forbidden()`: Unauthorized caller.
- `QueuePaused()`: Deposits disabled via vault pause mechanism.

## Invariants and Limitations

### Key Invariants

1. Single Active Request: Each user may have at most one outstanding deposit request. The next deposit claims it automatically only when its processed fee-adjusted price checkpoint is positive; otherwise it reverts with `PendingRequestExists`.
2. Delayed Execution: Deposit processing requires an oracle report submitted after a configured `depositInterval`.
3. Lazy Claiming: Shares are allocated during oracle processing and minted when claimed through permissionless claim calls or automatic claim paths.
4. Whitelist Enforcement: Deposits require every enabled whitelist mechanism, including both local permission and Merkle proof when configured together.

The allowed 100% deposit fee creates a zero price checkpoint. The processed request cannot be claimed or canceled and blocks further deposits from that account. Later positive checkpoints do not replace the first checkpoint applicable to that request.

Report processing also checks the vault limit when moving a nonempty batch from pending assets into the vault balance at the current reported price. Repricing or a lowered limit can make this update revert with `LimitExceeded`, which propagates through `vault.handleReport` and reverts the entire Oracle `submitReports` batch or `acceptReport` call.
