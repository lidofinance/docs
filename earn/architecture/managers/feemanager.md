# FeeManager

Modular, upgradeable fee management contract for vaults.

The `FeeManager` is responsible for managing and calculating various fee types in a vault system, including deposit, redemption, performance, and protocol fees. It uses a flexible architecture with deterministic storage slots (via `SlotLibrary`) and supports per-vault configurations.

## Key Responsibilities

- Configures and stores global fee settings (in D6 precision).
- Tracks vault specific state (base asset, min price, timestamp).
- Computes Deposit Fee, Redeem Fee, Performance Fee, and Protocol Fee.
- Provides administrative controls to update fee settings and vault metadata.

## Storage

Uses an isolated storage slot per deployment instance, computed deterministically using `SlotLibrary.getSlot("FeeManager", name, version)`, ensuring safety and upgradability.

Each vault is associated with:

- `baseAsset`: Reference token used for performance fee calculation.
- `minPriceD18`: Minimum price recorded (used for performance fee calculation).
- `timestamps`: Last update timestamp for time based fee accrual.

## Fee Calculation Logic

### `calculateDepositFee(uint256 shares) -> uint256`

Computes a linear fee as `shares * depositFeeD6 / 1e6`.

### `calculateRedeemFee(uint256 shares) -> uint256`

Computes a linear fee as `shares * redeemFeeD6 / 1e6`.

### `calculateFee(...) -> uint256 shares`

Calculates the total fee to be charged based on performance and protocol components.

- Performance: If current `priceD18` below `minPriceD18`, applies `performanceFeeD6` as `(minPriceD18 - priceD18) * performanceFeeD6 * totalShares / 1e24`.
- Protocol: time weighted fee based on `block.timestamp - timestamps[vault]`, computed as `totalShares * protocolFee * (block.timestamp - timestamps[vault]) / (365 * 24 * 3600 * 1e6)`.

All fees are paid in shares of the vault (not assets).

## Access Control

- Only the `owner` (defined during initialization) can modify fee parameters or vault configurations.
- Calls to `initialize(...)` must come from the factory and include all required setup parameters.

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

## Lifecycle

1. Constructor: Sets storage slot based on name and version.
2. Initialization (via `initialize(bytes)`): Sets owner, recipient, and fees.
3. Fee Updates: Admin can update recipient and fee parameters.
4. Vault Hooks: `updateState(asset, price)` refreshes timestamp and min price, and `setBaseAsset` is called once per vault to register its performance reference token.
