# SymbioticVerifier

## Overview

`SymbioticVerifier` is a custom `ICustomVerifier` implementation used to authorize interactions with the Symbiotic protocol. It restricts access to `deposit`, `withdraw`, `claim`, and `claimRewards` calls across Symbiotic vaults and farm contracts. All permissions are tightly scoped using role based access control via `MellowACL`.

This verifier ensures that only allowed addresses (typically curators) can perform specific actions within the Symbiotic ecosystem.

## Purpose

The verifier ensures that:

- Only whitelisted vaults can act on behalf of themselves in Symbiotic vaults and farms.
- All interactions are strictly validated against exact calldata to prevent misuse or encoding variation.
- Only allowed selectors and targets can be used.

## Role Definitions

| Role Constant | Description |
| --- | --- |
| `CALLER_ROLE` | Who is allowed to initiate Symbiotic operations (typically curators) |
| `MELLOW_VAULT_ROLE` | Addresses that are allowed to be the recipient of deposits, withdrawals, or claims (usually Subvaults) |
| `SYMBIOTIC_VAULT_ROLE` | Contracts that are approved as Symbiotic vault |
| `SYMBIOTIC_FARM_ROLE` | Contracts that are approved as Symbiotic farm |

## Constructor

```solidity
constructor(address vaultFactory_, address farmFactory_, string memory name_, uint256 version_)
```

## `verifyCall`

```solidity
function verifyCall(
    address who,
    address where,
    uint256 value,
    bytes calldata callData,
    bytes calldata /* verificationData */
) public view returns (bool)
```

## High Level Behavior

- Verifies caller (`who`) has `CALLER_ROLE`.
- Matches target contract (`where`) with either a Symbiotic vault or farm.
- Validates exact function selector and arguments using full `keccak256(callData)` hash.
- Rejects any calls with non zero ETH value.

## Supported Calls

| Target Type | Function | Signature | Additional Checks |
| --- | --- | --- | --- |
| Symbiotic Vault | `deposit(onBehalfOf, amount)` | `ISymbioticVault.deposit.selector` | `onBehalfOf` must have `MELLOW_VAULT_ROLE`, `amount > 0` |
| Symbiotic Vault | `withdraw(claimer, amount)` | `ISymbioticVault.withdraw.selector` | `claimer` must have `MELLOW_VAULT_ROLE`, `amount > 0` |
| Symbiotic Vault | `claim(recipient, epoch)` | `ISymbioticVault.claim.selector` | `recipient` must have `MELLOW_VAULT_ROLE` |
| Symbiotic Farm | `claimRewards(recipient, token, data)` | `ISymbioticStakerRewards.claimRewards.selector` | `recipient` must have `MELLOW_VAULT_ROLE`, `token != 0x0` |

For all calls, the calldata must exactly match the selector and parameters. All other selectors or targets are denied.

## Security Properties

- Strict call gating: Only explicitly allowed selectors, targets, and roles pass.
- Calldata hash check: Enforces strict encoding to avoid alternate ABI variants or garbage data.
- Zero value enforcement: Prevents accidental ETH transfers.
- Factory pattern compatibility: Target contracts can be validated indirectly via registries.
