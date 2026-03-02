# RedirectingDepositHook

## Overview

`RedirectingDepositHook` is a deposit time liquidity allocation hook implementing the `IHook` interface. It is designed to redirect newly deposited assets from a vault into its underlying subvaults, based on per-subvault risk and capacity constraints defined by a `RiskManager`.

This hook helps distribute liquidity optimally during deposit flows.

## Purpose

- Automatically forwards newly deposited assets from the main vault into eligible subvaults.
- Delegates decision making to the vault's configured `RiskManager`, which determines per-subvault deposit limits.
- Ensures that subvaults do not exceed their capacity constraints.

## Key Function

### `callHook(address asset, uint256 assets)`

Distributes a given amount of `asset` across available subvaults based on their individual deposit capacity.

Execution Logic:

1. Retrieves active `vault` context via `IVaultModule(address(this))`, configured `RiskManager` via `vault.riskManager()`, and the number of subvaults via `vault.subvaults()`.
2. Iterates over each subvault and fetches max allowed deposit via `riskManager.maxDeposit(subvault, asset)`. If allowed amount is zero, skip. Otherwise, pushes `min(assets, allowed)` via `vault.hookPushAssets()`, decrements `assets` accordingly, and stops early if the full amount has been distributed.

## Components and Assumptions

- Vault must implement `IVaultModule` and support `subvaults()`, `subvaultAt(index)`, `hookPushAssets(subvault, asset, amount)`, and `riskManager()`.
- Risk Manager must implement `maxDeposit(subvault, asset)` to return max allowed deposit into that subvault.
