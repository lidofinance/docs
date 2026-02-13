# Queue

## Overview

The `Queue` contract provides a shared foundation for time gated asset processing in systems like `DepositQueue` and `RedeemQueue`. It tracks user requests via timestamped checkpoints and processes them using oracle based pricing.

This abstract module is not directly deployable but is designed to be extended by concrete implementations, which define the behavior of `_handleReport` and allowed user actions (deposit and redeem functions).

## Purpose

- Serves as a modular base for deposit and redeem queues.
- Enforces vault request processing initially triggered by Oracle.
- Stores timestamped user action traces via `Checkpoints.Trace224`.
- Ensures vault controlled access and proper report validation.

## Derived contracts

- `DepositQueue`: handles queued deposits after a delay.
- `RedeemQueue`: handles redemption requests similarly.

## Use Cases

- Prevents manipulation by requiring delayed processing relative to price updates.

## Storage Structure

```solidity
struct QueueStorage {
  address asset;              // Token/ETH managed by this queue
  address vault;              // Vault that owns this queue
  Checkpoints.Trace224 timestamps; // Timeline of requests
}
```

- `asset`: token used for this queue (ERC20 or native ETH).
- `vault`: only this address can call `handleReport(...)`.
- `timestamps`: request history used in the implementations.

## Initialization

```solidity
function __Queue_init(address asset_, address vault_) internal
```

- Must be called by child contracts.
- Initializes asset, vault, and creates a starting checkpoint.

## Oracle Integration

```solidity
function handleReport(uint224 priceD18, uint32 timestamp) external
```

- Called by the vault when an oracle report is available.
- The function validates the report. The caller must be the `vault`, price must be non-zero, and the timestamp must be in the past (`timestamp < block.timestamp`).
- Internally delegates to `_handleReport(...)` (must be implemented by child).

## Abstract Hook

```solidity
function _handleReport(uint224 priceD18, uint32 timestamp) internal virtual
```

Must be implemented by child classes to:

- Read and process requests from `_timestamps()`.
- Apply pricing logic to convert shares to assets and assets to shares.
- Mint or burn shares, transfer tokens, etc.

## View Functions

| Function | Description |
| --- | --- |
| `vault()` | Returns the controlling vault address |
| `asset()` | Returns the ERC20 or native token used by the queue |
| `canBeRemoved()` | Not implemented in `Queue` (optional for children) |

## Internal Helpers

| Function | Description |
| --- | --- |
| `_timestamps()` | Returns the internal `Checkpoints.Trace224` structure |
| `_queueStorage()` | Loads queue storage using custom storage slot |
| `_queueStorageSlot` | Computed using SlotLibrary to prevent conflicts |

## Events

```solidity
event ReportHandled(uint224 priceD18, uint32 timestamp)
```

- Emitted when `handleReport()` completes.
- Signals that all eligible requests up to `timestamp` were processed.

## Errors

| Error               | Reason                                               |
|---------------------|------------------------------------------------------|
| `ZeroValue()`       | Called with `0` address or value                     |
| `Forbidden()`   | Caller not authorized (e.g., not the vault)        |
|`InvalidReport()`| Oracle report is zero-priced or timestamp is invalid |
| `QueuePaused()` | Reserved for future ACL/pause integration            |
