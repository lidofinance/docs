# BasicRedeemHook

## Overview

`BasicRedeemHook` is a minimal hook implementation for `IHook`, designed to dynamically fetch liquidity from subvaults during redemption processing in a `VaultModule`. It ensures that enough assets are available for user redemptions by pulling liquidity from a set of registered subvaults.

This hook is typically invoked by a vault's redemption queue or during `redeem()` operations when assets must be made liquid.

## Purpose

- Ensures sufficient liquidity in the vault to fulfill asset redemptions.
- Minimizes idle capital by pulling only when needed.
- Supports liquidity routing across subvaults.

## Key Functions

### `callHook(address asset, uint256 assets)`

Attempts to make `assets` of `asset` liquid within the main vault by pulling from subvaults if needed.

Execution Flow:

1. Checks how much of the `asset` the vault already holds.
2. If balance is sufficient, no-op.
3. Otherwise, iterates over subvaults (via `subvaultAt(i)`), and for each subvault pulls only the required portion via `hookPullAssets()`, then stops when total required assets have been pulled.

Guarantees:

- Only pulls the exact missing amount, no over-pulling.
- Efficient: stops once liquidity need is satisfied.
- Skips subvaults with zero balance.

### `getLiquidAssets(address asset) -> uint256`

Returns the total liquid amount of a given asset available across the vault and all its subvaults.

- Reads balances from `vault.balanceOf(asset)` and `subvault[i].balanceOf(asset)` for each subvault.
- Aggregates and returns the sum.

## Contract Assumptions

- The `vault` invoking this hook implements `IVaultModule` and supports:
- `subvaults()` -> total number of subvaults.
- `subvaultAt(index)` -> address of a given subvault.
- `hookPullAssets(subvault, asset, amount)` -> callable method to move funds.

## Security Considerations

- Hook only pulls assets using vault controlled `hookPullAssets()`, ensuring controlled asset flow.
- Assumes vault validates which hook is active. There is no permissioning within the hook itself.
