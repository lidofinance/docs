# ERC20Verifier

## Overview

`ERC20Verifier` is a role-driven `ICustomVerifier` implementation that enforces strict, granular permissioning over ERC20 `approve` and `transfer` function calls. It builds upon `OwnedCustomVerifier`, using `MellowACL` style roles to validate the caller, target asset, and recipient of each operation.

This verifier is designed for use in modular vaults such as `Subvault` where only specific ERC20 operations should be allowed through a customizable permission matrix.

It accepts ERC20 `approve` and `transfer` calls only when all of the following conditions hold:

- The caller (must have `CALLER_ROLE`).
- The asset address (must have `ASSET_ROLE`).
- The recipient (must have `RECIPIENT_ROLE`).
- `transfer` must not be for zero amount.
- `approve` allows any amount.
- `value` sent with the call must be `0`.
- Only exact calldata is accepted (no encoding variation or garbage data).

## Roles and Permissions

Each permission check is mapped to a distinct `bytes32` role:

| Role Constant | Purpose |
| --- | --- |
| `ASSET_ROLE` | Marks which ERC20 tokens are allowed to be interacted with |
| `CALLER_ROLE` | Who is allowed to perform `approve` or `transfer` |
| `RECIPIENT_ROLE` | Who is allowed to receive tokens (for `transfer`) or get approval (for `approve`) |

These roles are expected to be configured via the `initialize()` function inherited from `OwnedCustomVerifier`.

## Configuration and State

The constructor passes `name_` and `version_` to `OwnedCustomVerifier`, which uses them to namespace the verifier's ACL storage. Roles are configured through the inherited `initialize()` function and ACL management functions.

## Behavior

`verifyCall` returns `false` unless the call has zero ETH value, exactly encoded calldata, an allowed caller and token, and an allowed non-zero recipient. It accepts only `approve(address,uint256)` and `transfer(address,uint256)` selectors; zero-value transfers are rejected, while zero-value approvals are allowed.

## Functions

### `verifyCall`

```solidity
function verifyCall(
    address who,
    address where,
    uint256 value,
    bytes calldata callData,
    bytes calldata /* verificationData */
) external view override returns (bool)
```

Checks whether a specific ERC20 call is authorized.

#### Validation Steps

1. Require a zero ETH value and exactly 68 bytes of calldata: a 4-byte selector, a 32-byte address, and a 32-byte amount.
2. Require `ASSET_ROLE` for `where` and `CALLER_ROLE` for `who`.
3. Accept only the `approve(address,uint256)` and `transfer(address,uint256)` selectors.
4. Require `RECIPIENT_ROLE` for the decoded `to` address and reject the zero address.
5. Reject a zero `amount` for `transfer`; `approve` may use any amount.
6. Re-encode the arguments and require an exact calldata hash match:

```solidity
keccak256(abi.encodeWithSelector(selector, to, amount)) == keccak256(callData)
```

The function returns `true` only if every check passes.

## Invariants and Limitations

### Security Considerations

- Prevents misuse of `approve` and `transfer` by enforcing strict role-based gating, zero ETH payload enforcement, and calldata normalization to eliminate encoding ambiguity.
- Ensures no contract or address receives funds or allowances without being explicitly whitelisted.
