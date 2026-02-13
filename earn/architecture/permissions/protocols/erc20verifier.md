# ERC20Verifier

## Overview

`ERC20Verifier` is a role driven `ICustomVerifier` implementation that enforces strict, granular permissioning over ERC20 `approve` and `transfer` function calls. It builds upon `OwnedCustomVerifier`, using `MellowACL` style roles to validate the caller, target asset, and recipient of each operation.

This verifier is designed for use in modular vaults such as `SubVault` where only specific ERC20 operations should be allowed through a customizable permission matrix.

## Purpose

To allow or deny ERC20 `approve` and `transfer` calls based on:

- The caller (must have `CALLER_ROLE`).
- The asset address (must have `ASSET_ROLE`).
- The recipient (must have `RECIPIENT_ROLE`).
- `transfer` must not be for zero amount.
- `approve` allows any amount.
- `value` sent with the call must be `0`.
- Only exact calldata is accepted (no encoding variation or garbage data).

## Roles

Each permission check is mapped to a distinct `bytes32` role:

| Role Constant | Purpose |
| --- | --- |
| `ASSET_ROLE` | Marks which ERC20 tokens are allowed to be interacted with |
| `CALLER_ROLE` | Who is allowed to perform `approve` or `transfer` |
| `RECIPIENT_ROLE` | Who is allowed to receive tokens (for `transfer`) or get approval (for `approve`) |

These roles are expected to be configured via the `initialize()` function inherited from `OwnedCustomVerifier`.

## Contract Behavior

### Constructor

```solidity
constructor(string memory name_, uint256 version_)
```

- Passes initialization parameters to `OwnedCustomVerifier` and disables further initializers.

### `verifyCall` Function

```solidity
function verifyCall(
    address who,
    address where,
    uint256 value,
    bytes calldata callData,
    bytes calldata /* verificationData */
) external view override returns (bool)
```

### Summary

Checks if a specific ERC20 call is authorized.

### Logic Steps

Step 1: Pre checks

- Must be a zero ETH call: `value == 0`.
- Calldata must be exactly 68 bytes: 4 byte selector + 32 bytes address + 32 bytes uint.
- `where` (the token address) must have `ASSET_ROLE`.
- `who` (the caller, usually curator) must have `CALLER_ROLE`.

Step 2: Selector validation

Accepts only two ERC20 functions: `approve(address,uint256)` and `transfer(address,uint256)`.

Step 3: Recipient and amount validation

- `to` address must have `RECIPIENT_ROLE`.
- For `transfer`, `amount` must not be zero.
- `to` must not be the zero address in any case.

Step 4: Exact calldata matching

Ensures call is not forged via alternate encodings:

```solidity
keccak256(abi.encodeWithSelector(selector, to, amount)) == keccak256(callData)
```

### Returns

- `true` if all checks pass.
- `false` otherwise.

## Security Considerations

- Prevents misuse of `approve` and `transfer` by enforcing strict role based gating, zero ETH payload enforcement, and calldata normalization to eliminate encoding ambiguity.
- Ensures no contract or address receives funds or allowances without being explicitly whitelisted.
