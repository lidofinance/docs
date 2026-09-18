# SyncRedeemQueue

## Overview

The `SyncRedeemQueue` contract enables synchronous (instant) redemptions of vault shares. Unlike `RedeemQueue`, where requests are batched and settled after an oracle report and liquidity handling, shares are burned and assets paid out in the same transaction at the latest oracle price. Instant exits are constrained by a price penalty, available vault liquidity, and a leaky-bucket daily limit.

## Roles and Permissions

| Role | Permission |
| --- | --- |
| `SET_SYNC_REDEEM_PARAMS_ROLE` | Updates the synchronous redemption penalty, maximum report age, and daily limit |

The role is checked against the vault's ACL.

## Configuration and State

### Parameters

```solidity
function syncRedeemParams()
    external
    view
    returns (uint256 penaltyD6, uint32 maxAge, uint256 usage, uint256 dailyLimit, uint256 latestRequestTimestamp)
```

| Parameter | Description | Update rule or constraint |
| --- | --- | --- |
| `penaltyD6` | Penalty applied to synchronous redemptions, in D6 precision (`1e4` = 1%) | At most `5e5` (50%) |
| `maxAge` | Maximum allowed age of the oracle report used for pricing, in seconds | Non-zero, at most 365 days |
| `usage` | Stored leaky-bucket usage before decay since the last synchronization | Updated when a redemption or parameter change synchronizes usage |
| `dailyLimit` | Leaky-bucket capacity for synchronous redemptions, denominated in shares | Divisible by 86400 |
| `latestRequestTimestamp` | Timestamp of the latest usage synchronization | Updated together with `usage` |

The configurable parameters are set during initialization and updated via `setSyncRedeemParams(penaltyD6, maxAge, dailyLimit)`.

## Behavior

### Redeem Flow

A user calls `redeem(shares, receiver)`. The queue then completes the following steps in one transaction:

1. Rejects the call if the queue is paused by the vault.
2. Reads the latest oracle report for the queue's asset and validates it:
   - the report must not be flagged as suspicious and must have a non-zero price;
   - the report must be fresh: `report.timestamp + maxAge >= block.timestamp`, otherwise the call reverts with `StaleReport()`.
3. Applies the penalty and the redeem fee to the share amount:

   ```solidity
   sharesToRedeem = shares * (1e6 - penaltyD6) / 1e6;
   feeShares = feeManager.calculateRedeemFee(sharesToRedeem);
   assets = (sharesToRedeem - feeShares) * 1e18 / priceD18;
   ```

4. Reverts with `InsufficientAssets(requested, available)` if the vault's liquid assets do not cover the payout.
5. Reverts with `DailyLimitOverflow()` if the full `shares` amount exceeds the remaining daily limit; otherwise adds it to the current usage.
6. Burns `shares` from the caller, mints `feeShares` to the fee recipient, triggers the vault's redeem hook, and transfers the assets to `receiver`.
7. Updates the `RiskManager` vault balance.

### Daily Limit (Leaky Bucket)

The queue throttles instant exits with a leaky-bucket counter denominated in shares:

- Every redemption adds its share amount to `usage`.
- `usage` decays linearly over time at a rate of `dailyLimit / 24 hours`.
- A redemption reverts if `shares > dailyLimit - usage` at execution time.

Because capacity refills continuously, `dailyLimit` is not a strict rolling 24-hour cap: up to `2 * dailyLimit` shares can be redeemed within some 24-hour windows (`dailyLimit` from initially available capacity plus `dailyLimit` from refill). Risk limits should account for this burst behavior.

`dailyLimit` must be divisible by `24 hours` (86400) so the linear decay is exact; otherwise `setSyncRedeemParams` reverts with `InvalidDailyLimit()`.

## Functions

### View Functions

| Function | Description |
| --- | --- |
| `name()` | Returns `"SyncRedeemQueue"` |
| `syncRedeemParams()` | Returns the configured parameters and stored usage state |
| `remainingDailyLimit()` | Returns usage after linear decay and the currently available redemption capacity |
| `getLiquidAssets()` | Returns liquidity reported by the vault for this queue |
| `canBeRemoved()` | Returns `true` because the queue keeps no pending requests |

`getLiquidAssets()` delegates to `vault.getLiquidAssets()`. If no redeem hook is configured, the vault returns its direct asset balance; otherwise it returns the hook's liquidity estimate.

### State-Changing Functions

| Function | Access | Description |
| --- | --- | --- |
| `setSyncRedeemParams(penaltyD6, maxAge, dailyLimit)` | `SET_SYNC_REDEEM_PARAMS_ROLE` in the vault ACL | Synchronizes usage, then updates the pricing and limit parameters |
| `redeem(shares, receiver)` | Public | Burns shares and transfers assets immediately after all checks pass |

## Events

- `Redeemed(address account, uint256 shares, uint256 assets, uint256 feeShares)`: Emitted on a successful synchronous redemption.
- `SyncRedeemParamsSet(uint256 penaltyD6, uint32 maxAge, uint256 dailyLimit)`: Emitted when queue parameters are updated.

## Errors

| Error                                 | Reason                                                       |
| ------------------------------------- | ------------------------------------------------------------ |
| `ZeroValue()`                         | Zero shares, zero receiver, the payout rounds to zero, or `maxAge == 0` in the setter |
| `QueuePaused()`                       | Redemptions disabled via vault pause mechanism               |
| `InvalidReport()`                     | Latest oracle report is suspicious or zero-priced            |
| `StaleReport()`                       | Latest oracle report is older than `maxAge`                  |
| `InsufficientAssets(requested, available)` | Vault lacks liquid assets to cover the payout          |
| `DailyLimitOverflow()`                | Redemption exceeds the remaining daily limit                 |
| `InvalidDailyLimit()`                 | `dailyLimit` is not divisible by 86400                       |
| `Forbidden()`                         | Caller lacks `SET_SYNC_REDEEM_PARAMS_ROLE`                   |
| `TooLarge()`                          | Parameter exceeds the allowed maximum                        |

## Invariants and Limitations

### Key Invariants

1. Instant Execution: shares are burned and assets paid out in the redeem transaction; no pending requests exist.
2. Fresh Pricing: redemptions revert if the latest oracle report is older than `maxAge` or flagged as suspicious.
3. Liquidity-Bounded: without a redeem hook, available liquidity is the vault's direct asset balance. With a hook, liquidity is determined by that hook and may include assets available from eligible subvaults (for example, `BasicRedeemHook` counts both).
4. Rate-Limited: total instant redemptions are throttled by the leaky-bucket daily limit.
