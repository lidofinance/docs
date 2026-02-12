# VerifierModule

## Overview

`VerifierModule` is an abstract extension of `BaseModule` designed to provide standardized access to a `Verifier` contract. It manages internal storage using a deterministic slot derived via `SlotLibrary`, supporting secure modular composition across multiple vault systems.

## Constructor

```solidity
constructor(string memory name_, uint256 version_)
```

Computes and stores the custom storage slot used for verifier configuration based on a unique `(name_, version_)` pair.

Parameters:

- `name_` — Unique identifier used to namespace the storage slot.
- `version_` — Version number used for slot derivation.

## Public & External Functions

### `verifier()`

```solidity
function verifier() public view returns (IVerifier)
```

Returns the address of the configured `Verifier` contract. It is retrieved from internal storage using a fixed slot.

Returns:

- `IVerifier` — The verifier contract associated with the module.

## Internal Functions

### `__VerifierModule_init(address verifier_)`

```solidity
function __VerifierModule_init(address verifier_) internal onlyInitializing
```

Initializes the verifier module with the given verifier contract address. Validates non-zero address to prevent misconfiguration.

Parameters:

- `verifier_` — Address of the verifier contract.

Reverts:

- `ZeroAddress()` if verifier address is zero.

## Private Functions

### `_verifierModuleStorage()`

```solidity
function _verifierModuleStorage() private view returns (VerifierModuleStorage storage)
```

Internal function to access the `VerifierModuleStorage` struct using the precomputed custom slot. Utilizes inline assembly for direct storage access.

Returns:

- `VerifierModuleStorage` — Storage struct holding verifier address.
