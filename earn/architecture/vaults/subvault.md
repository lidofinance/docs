# Subvault

## Overview

The `Subvault` contract represents a modular, permissioned vault component designed to manage delegated asset strategies within a parent `Vault`. It enables curated logic for permissioned calls and asset management without exposing external deposit or redemption interfaces.

This contract combines callable and verifiable logic to serve as a secure, controlled execution unit within a system.

## Inheritance Structure

```solidity
contract Subvault is IFactoryEntity, CallModule, SubvaultModule
```

The `Subvault` inherits:

- `CallModule`: Enables arbitrary low level calls to external contracts (used by curator of the vault), and verification through a verifier module.
- `SubvaultModule`: Handles vault linkage and liquidity handling.
- `IFactoryEntity`: Standard initialization interface for factory deployment compatibility.

The constructor explicitly calls:

```solidity
VerifierModule(name_, version_)
SubvaultModule(name_, version_)
```

This indicates that both modules rely on deterministic storage and versioned deployment identifiers via `SlotLibrary`.

## Constructor

```solidity
constructor(string memory name_, uint256 version_)
```

### Parameters

- `name_`: A unique string identifier for the deployment (for example "Mellow").
- `version_`: A version number used to derive storage slots and allow upgradeable logic.

### Behavior

Passes the `name_` and `version_` arguments into the constructors of `VerifierModule` and `SubvaultModule`.

## External Functions

### `initialize`

```solidity
function initialize(bytes calldata initParams) external initializer
```

Initializes the subvault contract. This function can only be called once due to the `initializer` modifier.

### Parameters

- `initParams`: ABI-encoded as `(address verifier_, address vault_)`.

### Initialization Steps

1. Decodes `verifier_` and `vault_` from the calldata.
2. Calls `__VerifierModule_init(verifier_)` to link the external verifier (used for strategy proof or access control).
3. Calls `__SubvaultModule_init(vault_)` to register this subvault with the parent vault.
4. Emits the `Initialized(initParams)` event for transparency.

## Design Notes

- Modular strategy execution: The `CallModule` enables arbitrary external calls, useful for delegating assets into other protocols or yield strategies.
- Trust minimized calls: External strategy actions are gated via a `VerifierModule`, which can enforce logic like off-chain signatures or time based constraints.
- Parent vault registration: Initialization ensures the `vault` address is securely set once and governs access and lifecycle.
- Upgradeable architecture: Follows the shared pattern of using deterministic storage slots (via `SlotLibrary`) to remain safely upgradeable and composable.

## Events

### `Initialized(bytes data)`

Emitted once after a successful `initialize` call. Contains the raw ABI-encoded input for auditing or debugging.
