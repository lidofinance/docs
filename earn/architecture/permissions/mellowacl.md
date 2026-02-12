# MellowACL

## Purpose

`MellowACL` is a lightweight but extendable access control layer that wraps OpenZeppelin's `AccessControlEnumerableUpgradeable`. It introduces automatic tracking and enumeration of active roles to improve governance transparency.

This contract is intended to be inherited by modules that require dynamic role management and storage isolated initialization.

## Responsibilities

- Grant and revoke access control roles to addresses.
- Keep track of all active (assigned) roles in a dedicated set.
- Expose enumerable functions for external auditing of granted roles.
- Emit structured events when roles are added or fully revoked.

## Storage Layout

```solidity
struct MellowACLStorage {
  EnumerableSet.Bytes32Set supportedRoles;
}
```

- `supportedRoles`: A unique set of role identifiers (`bytes32`) currently assigned to any address.
- Uses a dedicated storage slot derived from:

```solidity
SlotLibrary.getSlot("MellowACL", name_, version_)
```

## View Functions

### `supportedRoles() -> uint256`

Returns the number of currently active roles (roles with at least one member).

### `supportedRoleAt(index: uint256) -> bytes32`

Returns the role identifier at the specified index from the active role set.

### `hasSupportedRole(role: bytes32) -> bool`

Returns `true` if the role is currently active (assigned to at least one account).

## Internal Logic

### `_grantRole(role: bytes32, account: address) -> bool`

Grants the specified role to an account. If the role was not previously active, it is added to `supportedRoles`, and `RoleAdded` is emitted.

- Inherits from `AccessControlUpgradeable._grantRole`.
- Emits:

```solidity
event RoleAdded(bytes32 indexed role)
```

### `_revokeRole(role: bytes32, account: address) -> bool`

Revokes the specified role from an account. If the role has no remaining members afterward, it is removed from `supportedRoles`, and `RoleRemoved` is emitted.

- Inherits from `AccessControlUpgradeable._revokeRole`.
- Emits:

```solidity
event RoleRemoved(bytes32 indexed role)
```

## Constructor

```solidity
constructor(string memory name_, uint256 version_)
```

- Computes a deterministic storage slot using `SlotLibrary`.
- Disables initializer to prevent accidental direct deployment.
- Should be initialized later via proxy aware module constructor.

## Events

- `event RoleAdded(bytes32 indexed role)`: Emitted when a new role is introduced into the system.
- `event RoleRemoved(bytes32 indexed role)`: Emitted when the last holder of a role is revoked and the role becomes inactive.
