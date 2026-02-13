# RiskManager

On-chain risk control and allocation policy manager for modular vaults.

The `RiskManager` contract defines and enforces asset deposit limits across a `Vault` and its associated `Subvaults`. It maintains internal accounting of balances, limits, and allowed subvault assets.

## Purpose

This contract is a centralized module responsible for:

- Defining and enforcing deposit limits at vault and subvault levels.
- Allowlisting or disallowing specific assets per subvault.
- Tracking pending balances (deposits and withdrawals that are not yet finalized).
- Validating risk assumptions through oracle price reports.

## Core Concepts

- Vault Limit: global cap across all assets managed by the vault (in shares).
- Subvault Limit: individual cap per subvault, enforced independently (in shares).
- Allowed Assets: only explicitly allowlisted assets are permitted in a given subvault.
- Pending Assets: temporarily tracked assets, for example during deposit queueing.
- Shares Conversion: all balances are internally tracked in shares, calculated using the latest report in the `Oracle` contract.

## Storage Slot

Utilizes a deterministic storage slot computed via `SlotLibrary.getSlot("RiskManager", name, version)` to ensure safe upgrades and modular deployment.

## Roles and Permissions

The contract uses fine grained access roles:

- `SET_VAULT_LIMIT_ROLE`: Can modify global vault capacity.
- `SET_SUBVAULT_LIMIT_ROLE`: Can change limits on individual subvaults.
- `ALLOW_SUBVAULT_ASSETS_ROLE`: Can whitelist assets for specific subvaults.
- `DISALLOW_SUBVAULT_ASSETS_ROLE`: Can revoke asset approval from subvaults.
- `MODIFY_PENDING_ASSETS_ROLE`: Can manipulate pending balance delta.
- `MODIFY_VAULT_BALANCE_ROLE`: Can update the vault's live balance.
- `MODIFY_SUBVAULT_BALANCE_ROLE`: Can update a subvault's internal balance.

Roles are verified via the vault's ACL module (`IACLModule`) or allowed queues (`IShareModule`).

## Key Methods

### View

- `vault()`: Returns the vault address.
- `vaultState()`: Returns the global vault state (limit, balance).
- `pendingBalance()`: Returns the pending share balance across all assets and deposit queues.
- `subvaultState(address)`: Returns per subvault state.
- `pendingAssets(address)`: Returns currently pending asset amount.
- `pendingShares(address)`: Returns share equivalent of pending assets.
- `allowedAssets(address)`: Count of allowed assets in subvault.
- `allowedAssetAt(address, index)`: Indexed lookup of allowed asset.
- `isAllowedAsset(address, asset)`: Checks asset permission for subvault.
- `convertToShares(asset, value)`: Converts amount to share units using oracle.
- `maxDeposit(subvault, asset)`: Calculates max deposit amount given limits and prices.

### Mutable

- `initialize(bytes data)`: Initializes vault wide limit.
- `setVault(address)`: Assigns the vault address (one time only).
- `setVaultLimit(int256 limit)`: Updates vault's global limit.
- `setSubvaultLimit(address, int256)`: Updates limit for a specific subvault.
- `allowSubvaultAssets(address, address[])`: Adds assets to a subvault allowlist.
- `disallowSubvaultAssets(address, address[])`: Removes assets from allowlist.
- `modifyPendingAssets(address, int256)`: Adjusts pending assets and updates internal shares.
- `modifyVaultBalance(address, int256)`: Applies a delta to vault's current balance (with limit checks).
- `modifySubvaultBalance(address, asset, int256)`: Same as above, but scoped to a specific subvault.

## Internal Mechanics

### Conversion to Shares

Conversion is done with oracle price data, where:

```solidity
shares = (value * priceD18) / 1e18
```

## Assumptions

The system assumes that the vault and its subvaults operate exclusively with correlated assets, and that protocol level delegations performed by the curator do not introduce extreme APR variance or significant principal loss.

Given this, all vault and subvault level limits are treated as approximate and are computed using the most recent oracle report available at the time of the state update (for example on pull or push, or deposit and redeem operations).

If actual balances deviate significantly from the stored `balance` values due to oracle drift, delayed execution, or protocol side changes, a trusted actor can apply corrections to mitigate the difference using `modifyVaultBalance` for the vault or `modifySubvaultBalance` for individual subvaults.

Since the system is expected to hold only correlated assets, such manual adjustments are assumed to be rare under normal operating conditions.
