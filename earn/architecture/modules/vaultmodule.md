# VaultModule

## Overview

`VaultModule` is a core component of the modular vault architecture. It manages liquidity routing between the Vault and its connected Subvaults, enabling flexible strategy composition and modular upgrades. It supports hot swapping of Subvault contracts and ensures robust control over asset movement.

### Responsibilities

- Orchestrate liquidity push and pull operations between the vault and Subvaults.
- Create, disconnect, and reconnect Subvaults.
- Verify creations, removals, and reconnections using external factory contracts and local state.
- Track and update risk exposure via `RiskManager`.

## Roles and Permissions

- `CREATE_SUBVAULT_ROLE`: Allows creation of new Subvaults.
- `DISCONNECT_SUBVAULT_ROLE`: Allows disconnection of active Subvaults.
- `RECONNECT_SUBVAULT_ROLE`: Allows reattachment of disconnected or new properly configured Subvaults.
- `PULL_LIQUIDITY_ROLE`: Grants permission to pull assets from Subvaults.
- `PUSH_LIQUIDITY_ROLE`: Grants permission to send assets to Subvaults.

## Configuration and State

### Storage Layout (`VaultModuleStorage`)

```solidity
struct VaultModuleStorage {
  address riskManager;
  EnumerableSet.AddressSet subvaults;
}
```

- `riskManager`: Module used to track and limit exposure per asset and Subvault.
- `subvaults`: Enumerable set of currently connected Subvaults.

### Initialization

```solidity
function __VaultModule_init(address riskManager_) internal onlyInitializing
```

- Sets the `riskManager` address (must be non-zero).
- Should be invoked during deployment or upgrade setup.

## Functions

### View Functions

- `subvaultFactory()`: Returns `IFactory` used to deploy and check deployed Subvaults.
- `verifierFactory()`: Returns `IFactory` used to deploy and check deployed verifiers.
- `subvaults()`: Returns the total number of connected Subvaults.
- `subvaultAt(index)`: Returns the Subvault address at a specific index.
- `hasSubvault(address)`: Checks if a given address is an active Subvault.
- `riskManager()`: Returns the address of the risk manager.

### State-Changing Functions

#### Subvault Management

- `createSubvault(version, owner, verifier)`: Deploys a new Subvault via `subvaultFactory`, requires the provided verifier to be a `verifierFactory` entity bound to this vault (`NotEntity(address subvault)` or `Forbidden()` otherwise), links it, adds it to the vault's Subvault list, and emits `SubvaultCreated(address indexed subvault, uint256 version, address indexed owner, address indexed verifier)`.
- `disconnectSubvault(subvault)`: Removes a Subvault from the vault registry, emits `SubvaultDisconnected(address indexed subvault)`, and reverts with `NotConnected(address subvault)` if not already linked.
- `reconnectSubvault(subvault)`: Re-adds a Subvault to the vault registry, validates via `subvaultFactory` and `verifierFactory`, emits `SubvaultReconnected(address indexed subvault, address indexed verifier)`, and reverts with `InvalidSubvault(address subvault)`, `NotEntity(address subvault)`, `Forbidden()`, or `AlreadyConnected(address subvault)` if checks fail.

#### Liquidity Movement

- `pushAssets(subvault, asset, value)`: Transfers assets from vault to subvault, updates internal risk manager state (adds exposure), and emits `AssetsPushed(address indexed asset, address indexed subvault, uint256 value)`.
- `pullAssets(subvault, asset, value)`: Retrieves assets from a subvault, updates internal risk manager state (reduces exposure), and emits `AssetsPulled(address indexed asset, address indexed subvault, uint256 value)`.

#### Internal Liquidity Hooks

These can only be invoked by the vault itself via hooks:

- `hookPushAssets(subvault, asset, value)`
- `hookPullAssets(subvault, asset, value)`

## Events

- `SubvaultCreated(address indexed subvault, uint256 version, address indexed owner, address indexed verifier)`
- `SubvaultDisconnected(address indexed subvault)`
- `SubvaultReconnected(address indexed subvault, address indexed verifier)`
- `AssetsPulled(address indexed asset, address indexed subvault, uint256 value)`
- `AssetsPushed(address indexed asset, address indexed subvault, uint256 value)`

## Errors

- `AlreadyConnected(address subvault)`: When attempting to reconnect an already connected subvault.
- `NotConnected(address subvault)`: When attempting to disconnect a subvault that isn't connected.
- `NotEntity(address subvault)`: Provided contract is not a valid factory deployed entity.
- `InvalidSubvault(address subvault)`: Subvault fails verification (incorrect `subvault.vault()` address).
- `ZeroAddress()`: Passed `RiskManager` address is zero (used in `__VaultModule_init`).
- `Forbidden()`: A hook call comes from anyone other than the vault itself, or the verifier is bound to a different vault.
- `AccessControlUnauthorizedAccount(address account, bytes32 neededRole)`: Caller lacks a required role.

## Invariants and Limitations

### Security Considerations

- All critical functions gated by role-based ACL.
- Uses factory verified deployments for submodules.
- Internal state (risk exposure) updated on every asset movement.
- Only the vault contract itself may invoke `hook*` liquidity functions.
