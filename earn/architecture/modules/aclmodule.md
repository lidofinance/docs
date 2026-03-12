# ACLModule

## Overview

Abstract module integrating role-based access control via `MellowACL`, providing permission management functionality.

## Internal Functions

### `__ACLModule_init`

```solidity
function __ACLModule_init(address admin_) internal onlyInitializing
```

### Description

Initializes the module with an admin address by assigning the `DEFAULT_ADMIN_ROLE`. This sets up the foundational RBAC structure.

### Parameters

- `admin_`: Address to be granted the `DEFAULT_ADMIN_ROLE`.

### Requirements

- `admin_` must not be the zero address.
- Callable only during initialization (`onlyInitializing`).
