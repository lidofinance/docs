# FeeManager

## Overview

Modular, upgradeable fee management contract for vaults.

The `FeeManager` is responsible for managing and calculating various fee types in a vault system, including deposit, redemption, performance, and protocol fees. It uses a flexible architecture with deterministic storage slots (via `SlotLibrary`) and supports per-vault configurations.

### Key Responsibilities

- Configures and stores global fee settings (in D6 precision).
- Tracks vault specific state (base asset, min price, timestamp).
- Computes Deposit Fee, Redeem Fee, Performance Fee, and Protocol Fee.
- Provides administrative controls to update fee settings and vault metadata.

## Roles and Permissions

- Only the `owner` (defined during initialization) can modify fee parameters or vault configurations.
- `initialize(bytes)` is protected by `initializer`, without a factory-only caller check.
- Only the owner can call `setBaseAsset(vault, baseAsset)` to configure the supplied vault once.
- `updateState(asset, price)` is permissionless and updates state under the caller's address when the asset matches that caller's configured base asset.

## Configuration and State

### Storage

Uses an isolated storage slot per deployment instance, computed deterministically using `SlotLibrary.getSlot("FeeManager", name, version)`, ensuring safety and upgradability.

Each vault is associated with:

- `baseAsset`: Reference token used for performance fee calculation.
- `minPriceD18`: Minimum price recorded (used for performance fee calculation).
- `timestamps`: Last update timestamp for time-based fee accrual.

## Behavior

### Lifecycle

1. Constructor: Sets storage slot based on name and version.
2. Initialization (via `initialize(bytes)`): Sets owner, recipient, and fees.
3. Fee Updates: Admin can update recipient and fee parameters.
4. Vault Hooks: `updateState(asset, price)` uses the caller as the vault key and updates its timestamp and minimum price only for its configured base asset. The owner registers each vault's base asset once through `setBaseAsset(vault, baseAsset)`.

## Functions

### Fee Calculation Logic

#### `calculateDepositFee(uint256 shares) -> uint256`

Computes a linear fee as `shares * depositFeeD6 / 1e6`.

#### `calculateRedeemFee(uint256 shares) -> uint256`

Computes a linear fee as `shares * redeemFeeD6 / 1e6`.

#### `calculateFee(vault, asset, priceD18, totalShares) -> uint256 shares`

Calculates the total fee to be charged based on performance and protocol components.

- Performance: If `minPriceD18 != 0` and current `priceD18` is below `minPriceD18`, applies `performanceFeeD6` as `(minPriceD18 - priceD18) * performanceFeeD6 * totalShares / (priceD18 * 1e6)`.
- Protocol: time-weighted fee based on `block.timestamp - timestamps[vault]`, computed as `totalShares * protocolFee * (block.timestamp - timestamps[vault]) / (365 * 24 * 3600 * 1e6)`.

`calculateFee` returns zero unless the supplied asset is the supplied `vault`'s configured base asset. Both performance and protocol components use this condition. Fees are denominated in vault shares.

## Events

- `Initialized(bytes data)`: Emitted after initialization.
- `SetFeeRecipient(address feeRecipient)`: On recipient update.
- `SetFees(...)`: On any fee change.
- `SetBaseAsset(...)`: When base asset is configured per vault.
- `UpdateState(...)`: On state update used for protocol and performance fees.

## Errors

- `ZeroAddress()`: Thrown if an address input is zero.
- `InvalidFees(...)`: When the combined fee rate exceeds 100 percent (`1e6` D6).
- `BaseAssetAlreadySet(...)`: Prevents base asset override if already set.
