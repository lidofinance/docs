# OwnedCustomVerifier

## Overview

`OwnedCustomVerifier` is an abstract base contract for implementing `ICustomVerifier` compatible verifiers with configurable role based access control. It integrates with `MellowACL` and provides a flexible initialization mechanism for dynamic permission setup.

This verifier is designed to be used in `Verifier.sol` as a custom verifier, where specific calls must pass access control checks based on predefined roles.

## Key Components

### Inherits

- `ICustomVerifier`: Interface used by the `Verifier` contract for permission checks.
- `MellowACL`: Upgradeable, role based access control module compatible with OpenZeppelin's `AccessControl`.

## Constructor

```solidity
constructor(string memory name_, uint256 version_) MellowACL(name_, version_)
```

- Initializes the underlying `MellowACL` module with `name_` and `version_`.
- Disables further initialization to prevent misuse in logic contracts (`_disableInitializers()`).

## Initialization

```solidity
function initialize(bytes calldata data) external initializer
```

- Initializes access control roles.
- Decodes input as:

```solidity
(address admin, address[] memory holders, bytes32[] memory roles)
```

- Sets `admin` as the contract's `DEFAULT_ADMIN_ROLE`.
- Grants each `roles[i]` to `holders[i]`.
- Reverts with `ZeroValue` if `admin == address(0)`, any holder is the zero address, or any role is `DEFAULT_ADMIN_ROLE`.

## Usage Pattern

This base contract does not implement the `verifyCall()` method itself. Instead, it is expected to be inherited and extended by a concrete verifier contract that implements the permission logic based on role membership (for example checking `hasRole(role, who)`).

This allows teams to quickly implement custom verifiers that enforce arbitrary permissions (for example allow certain addresses to `approve`, `transfer`, or `delegate`) based on assigned roles instead of hardcoded logic.
