# SyncQueue

## Overview

The `SyncQueue` contract provides a shared foundation for synchronous queues, `SyncDepositQueue` and `SyncRedeemQueue`. Unlike the asynchronous `Queue` base, synchronous queues execute user operations immediately at the latest oracle price instead of storing requests and waiting for the next oracle report.

This abstract module is not directly deployable. Concrete implementations define the user-facing actions (`deposit` or `redeem`).

- Serves as a modular base for synchronous deposit and redeem queues.
- Stores the queue's `asset` and controlling `vault` addresses.
- Keeps the queue interface compatible with `ShareModule`, so synchronous queues can be attached to a vault alongside asynchronous ones.

## Configuration and State

### Storage Structure

```solidity
struct SyncQueueStorage {
  address vault; // Vault that owns this queue
  address asset; // Token/ETH managed by this queue
}
```

### Initialization

```solidity
function __SyncQueue_init(address asset_, address vault_) internal
```

- Must be called by child contracts.
- Reverts with `ZeroValue()` if either address is zero.

## Functions

### Oracle Integration

```solidity
function handleReport(uint224 priceD18, uint32 timestamp) external virtual {}
```

Synchronous queues do not accumulate pending requests, so there is nothing to process on an oracle report. The function is a no-op kept for interface compatibility with the vault's report propagation. Instead of consuming reports, synchronous queues read the latest oracle price directly at execution time and enforce a maximum report age.

### View Functions

| Function        | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `vault()`       | Returns the controlling vault address                             |
| `asset()`       | Returns the ERC20 or native token used by the queue               |
| `canBeRemoved()`| Always returns `true`: a sync queue holds no pending user requests |

## Errors

| Error             | Reason                                          |
| ----------------- | ----------------------------------------------- |
| `ZeroValue()`     | Called with `0` address or value                |
| `QueuePaused()`   | Queue operations disabled via vault pause       |
| `InvalidReport()` | Latest oracle report is suspicious or zero-priced |

## Related Contracts and References

### Derived contracts

- `SyncDepositQueue`: mints shares immediately at the latest oracle price with a configurable penalty.
- `SyncRedeemQueue`: burns shares and pays out assets immediately, limited by vault liquidity and a daily limit.
