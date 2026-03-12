# Vault

## Overview

The `Vault` contract is the central entry point in the Flexible Vault system. It composes three foundational modules:

- `ACLModule`: Role based access control.
- `ShareModule`: Management of user facing shares, including deposit and redemption processes.
- `VaultModule`: Subvault management.

This contract allows secure, extensible, and upgradeable vault implementations by coordinating all external and internal interactions within the system. It is typically instantiated through `Factory` or `VaultConfigurator` and initialized with all the required components and role assignments in a single atomic transaction.

## Inheritance Structure

```solidity
contract Vault is IFactoryEntity, VaultModule, ShareModule, ACLModule
```

The contract inherits three modules:

- `ACLModule`: Admin and permission management.
- `ShareModule`: Deposits, redemptions, share management.
- `VaultModule`: Subvault delegation control.

It also implements the `IFactoryEntity` interface for standard factory based deployment patterns.

## Constructor

```solidity
constructor(
    string memory name_,
    uint256 version_,
    address depositQueueFactory_,
    address redeemQueueFactory_,
    address subvaultFactory_,
    address verifierFactory_
)
```

### Parameters

- `name_`: Unique name identifier for the vault instance.
- `version_`: Configuration version of the vault.
- `depositQueueFactory_`: Address of the factory used to deploy deposit queues.
- `redeemQueueFactory_`: Address of the factory used to deploy redemption queues.
- `subvaultFactory_`: Address of the factory used to deploy subvaults.
- `verifierFactory_`: Address of the factory for deploying verifier contracts.

### Behavior

Passes these arguments to the parent module constructors:

- `ACLModule(name_, version_)`
- `ShareModule(name_, version_, depositQueueFactory_, redeemQueueFactory_)`
- `VaultModule(name_, version_, subvaultFactory_, verifierFactory_)`

## Structs

### `RoleHolder`

```solidity
struct RoleHolder {
    bytes32 role;
    address holder;
}
```

Used to batch assign multiple roles during initialization. Each entry maps a role identifier to a designated address.

## External Functions

### `initialize`

```solidity
function initialize(bytes calldata initParams) external initializer
```

Initializes the vault instance. Can only be called once due to the `initializer` modifier.

### `initParams` structure (ABI-encoded)

```solidity
(
    address admin_,
    address shareManager_,
    address feeManager_,
    address riskManager_,
    address oracle_,
    address defaultDepositHook_,
    address defaultRedeemHook_,
    uint256 queueLimit_,
    RoleHolder[] roleHolders
)
```

### Initialization Logic

- Calls `__ACLModule_init(admin_)` to configure the default admin.
- Calls `__ShareModule_init(...)` to link share management and hook modules.
- Calls `__VaultModule_init(riskManager_)` to initialize risk management.
- Iterates over `roleHolders` and grants each role using `_grantRole(...)`.
- Emits `Initialized(initParams)`.

## Design Notes

- Modular composition: The vault is composed by inheriting three upgradeable modules, enabling reuse and flexible configuration.
- Factory compatible: The contract is factory deployable and supports atomic configuration during creation.
- Centralized control layer: Acts as a trusted coordinator for hooks, queues, shares, and strategy logic.
- Role assignment: Enables full delegation of operational control via batched `RoleHolder` entries.
- Upgradeable and isolated: Each module manages its own storage via deterministic slots (`SlotLibrary`) to support safe upgrades.

## Events

### `Initialized(bytes data)`

Emitted after successful initialization. Includes all parameters passed for transparency.
