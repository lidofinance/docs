# SyncDepositQueue

## Overview

The `SyncDepositQueue` contract enables synchronous (instant) deposits into vaults. Unlike `DepositQueue`, where a request waits for the next oracle report, shares are minted in the same transaction using the latest oracle price. To compensate the vault for executing at a potentially stale price, a configurable penalty is applied to the conversion rate.

## Roles and Permissions

| Role                           | Permission                                                     |
| ------------------------------ | -------------------------------------------------------------- |
| `SET_SYNC_DEPOSIT_PARAMS_ROLE` | Updates the synchronous deposit penalty and maximum report age |

The role is checked against the vault's ACL.

## Configuration and State

### Parameters

```solidity
function syncDepositParams() external view returns (uint256 penaltyD6, uint32 maxAge)
```

| Parameter   | Description                                                           | Constraints                |
| ----------- | --------------------------------------------------------------------- | -------------------------- |
| `penaltyD6` | Penalty applied to the oracle price, in D6 precision (`1e4` = 1%)     | At most `5e5` (50%)        |
| `maxAge`    | Maximum allowed age of the oracle report used for pricing, in seconds | Non-zero, at most 365 days |

Parameters are set during initialization and updated via `setSyncDepositParams(penaltyD6, maxAge)`.

## Behavior

### Deposit Flow

A user calls `deposit(assets, referral, merkleProof)`. The queue then completes the following steps in one transaction:

1. Rejects the call if the queue is paused by the vault or the depositor is not whitelisted (all enabled whitelist checks, as in `DepositQueue`: local `canDeposit` permission when required, plus a valid proof when a Merkle root is set).
2. Reads the latest oracle report for the queue's asset and validates it:
   - the report must not be flagged as suspicious and must have a non-zero price;
   - the report must be fresh: `report.timestamp + maxAge >= block.timestamp`, otherwise the call reverts with `StaleReport()`.
3. Reduces the reported price by the penalty:

   ```solidity
   priceD18 = report.priceD18 * (1e6 - penaltyD6) / 1e6;
   ```

4. Transfers the assets from the caller and forwards them to the vault.
5. Converts assets to shares at the reduced price, mints the deposit fee (if any) to the fee recipient, and mints the remaining shares directly to the caller.
6. Updates the RiskManager vault balance, reverting with `LimitExceeded` above the vault limit, then calls the deposit hook.

There is nothing to claim afterwards: shares appear in the user's balance immediately. `claimableOf(account)` and `claim(account)` are implemented as no-ops for interface compatibility and always return zero values.

## Functions

### View Functions

| Function              | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `name()`              | Returns `"SyncDepositQueue"`                               |
| `syncDepositParams()` | Returns `penaltyD6` and `maxAge`                           |
| `canBeRemoved()`      | Returns `true` because the queue keeps no pending requests |

### State-Changing Functions

| Function                                  | Access                                          | Description                                                |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `setSyncDepositParams(penaltyD6, maxAge)` | `SET_SYNC_DEPOSIT_PARAMS_ROLE` in the vault ACL | Updates the pricing parameters                             |
| `deposit(assets, referral, merkleProof)`  | Public                                          | Transfers assets to the vault and mints shares immediately |

### Compatibility Functions

| Function               | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `claimableOf(account)` | Returns zero because synchronous deposits have no pending claims |
| `claim(account)`       | Returns `false` without changing state                           |

## Events

- `Deposited(address account, address referral, uint224 assets, uint256 shares, uint256 feeShares)`: Emitted on a successful synchronous deposit.
- `SyncDepositParamsSet(uint256 penaltyD6, uint32 maxAge)`: Emitted when queue parameters are updated.

## Errors

| Error                                             | Reason                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ZeroValue()`                                     | Zero deposit amount, the net share amount rounds to zero, or `maxAge == 0` in the setter |
| `QueuePaused()`                                   | Deposits disabled via vault pause mechanism                                              |
| `DepositNotAllowed()`                             | Depositor not whitelisted                                                                |
| `InvalidReport()`                                 | Latest oracle report is suspicious or zero-priced                                        |
| `LimitExceeded(int256 newValue, int256 maxValue)` | Deposit exceeds the RiskManager vault limit                                              |
| `StaleReport()`                                   | Latest oracle report is older than `maxAge`                                              |
| `Forbidden()`                                     | Caller lacks `SET_SYNC_DEPOSIT_PARAMS_ROLE`                                              |
| `TooLarge()`                                      | Parameter exceeds the allowed maximum                                                    |

## Invariants and Limitations

### Key Invariants

1. Instant Execution: shares are minted in the deposit transaction; no pending requests exist.
2. Fresh Pricing: deposits revert if the latest oracle report is older than `maxAge` or flagged as suspicious.
3. Penalized Rate: the current shares-per-asset price is reduced by `penaltyD6` before deposit fees. A queued deposit uses a later report, so its relative result also depends on price changes.
4. Removable: `canBeRemoved()` returns `true` since the queue holds no user funds or pending requests.

## Source

[SyncDepositQueue.sol at `69bbaf1`](https://github.com/mellow-finance/flexible-vaults/blob/69bbaf17530dc5127ecf9049cceaab141f516a1e/src/queues/SyncDepositQueue.sol)
