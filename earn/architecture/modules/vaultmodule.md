# VaultModule

## Purpose

`VaultModule` is a core component of the modular vault architecture. It manages liquidity routing between the Vault and its connected Subvaults, enabling flexible strategy composition and modular upgrades. It supports hot swapping of subvault contracts and ensures robust control over asset movement.

## Responsibilities

- Orchestrate liquidity push and pull operations between the vault and subvaults.
- Create, disconnect, and reconnect subvaults.
- Verify creations, removals, and reconnections using external factory contracts and local state.
- Track and update risk exposure via `RiskManager`.

## Roles

- `CREATE_SUBVAULT_ROLE`: Allows creation of new subvaults.
- `DISCONNECT_SUBVAULT_ROLE`: Allows disconnection of active subvaults.
- `RECONNECT_SUBVAULT_ROLE`: Allows reattachment of disconnected or new properly configured subvaults.
- `PULL_LIQUIDITY_ROLE`: Grants permission to pull assets from subvaults.
- `PUSH_LIQUIDITY_ROLE`: Grants permission to send assets to subvaults.

## Storage Layout (`VaultModuleStorage`)

```solidity
struct VaultModuleStorage {
  address riskManager;
  EnumerableSet.AddressSet subvaults;
}
```

- `riskManager`: Module used to track and limit exposure per asset and subvault.
- `subvaults`: Enumerable set of currently connected subvaults.

## View Functions

- `subvaultFactory()`: Returns `IFactory` used to deploy and check deployed subvaults.
- `verifierFactory()`: Returns `IFactory` used to deploy and check deployed verifiers.
- `subvaults()`: Returns the total number of connected subvaults.
- `subvaultAt(index)`: Returns the subvault address at a specific index.
- `hasSubvault(address)`: Checks if a given address is an active subvault.
- `riskManager()`: Returns the address of the risk manager.

## Mutable Functions

### Subvault Management

- `createSubvault(version, owner, verifier)`: Deploys a new subvault via `subvaultFactory`, links it to the provided `verifier`, adds it to the vault's subvault list, and emits `SubvaultCreated`.
- `disconnectSubvault(subvault)`: Removes a subvault from the vault registry, emits `SubvaultDisconnected`, and reverts with `NotConnected` if not already linked.
- `reconnectSubvault(subvault)`: Re-adds a subvault to the vault registry, validates via `subvaultFactory` and `verifierFactory`, emits `SubvaultReconnected`, and reverts with `InvalidSubvault`, `NotEntity`, or `AlreadyConnected` if checks fail.

### Liquidity Movement

- `pushAssets(subvault, asset, value)`: Transfers assets from vault to subvault, updates internal risk manager state (adds exposure), and emits `AssetsPushed`.
- `pullAssets(subvault, asset, value)`: Retrieves assets from a subvault, updates internal risk manager state (reduces exposure), and emits `AssetsPulled`.

### Internal Liquidity Hooks

These can only be invoked by the vault itself via hooks:

- `hookPushAssets(subvault, asset, value)`
- `hookPullAssets(subvault, asset, value)`

## Error Conditions

- `AlreadyConnected(subvault)`: When attempting to reconnect an already connected subvault.
- `NotConnected(subvault)`: When attempting to disconnect a subvault that isn't connected.
- `NotEntity(address)`: Provided contract is not a valid factory deployed entity.
- `InvalidSubvault(address)`: Subvault fails verification (incorrect `subvault.vault()` address).
- `ZeroAddress()`: Passed `RiskManager` address is zero (used in `__VaultModule_init`).
- `Forbidden()`: Caller is not authorized (used in internal checks).

## Events

- `SubvaultCreated(subvault, version, owner, verifier)`
- `SubvaultDisconnected(subvault)`
- `SubvaultReconnected(subvault, verifier)`
- `AssetsPulled(asset, subvault, value)`
- `AssetsPushed(asset, subvault, value)`

## Security Considerations

- All critical functions gated by role-based ACL.
- Uses factory verified deployments for submodules.
- Internal state (risk exposure) updated on every asset movement.
- Only the vault contract itself may invoke `hook*` liquidity functions.

## Initialization

```solidity
function __VaultModule_init(address riskManager_) internal onlyInitializing
```

- Sets the `riskManager` address (must be non-zero).
- Should be invoked during deployment or upgrade setup.
