# TokenizedShareManager

## Overview

`TokenizedShareManager` combines `ShareManager` with `ERC20Upgradeable`, exposing vault shares as transferable ERC20 tokens. It retains the inherited minting, burning, whitelist, lockup, and claim rules while making shares usable by wallets and external protocols.

## Configuration and State

The constructor uses the deployment name and version to derive a namespaced storage slot. `initialize(data)` decodes the whitelist Merkle root, token name, and token symbol, then initializes both `ERC20Upgradeable` and `ShareManager`.

In addition to inherited share-manager state, the contract stores an `isClaiming` guard that prevents recursive claim processing during ERC20 balance updates.

## Behavior

Mint, burn, and transfer operations use the overridden ERC20 `_update`. It applies `updateChecks(from, to)` and claims pending shares for each non-zero participant. The `isClaiming` guard prevents recursive claims.

Locks use a separate path. `_lockShares` applies burn checks with `updateChecks(account, address(0))`, claims for the account only, then calls `super._update(account, address(this), value)`. It bypasses the override, so the manager contract is neither checked nor claimed as a recipient.

## Functions

### View Functions

| Function                  | Description                         |
| ------------------------- | ----------------------------------- |
| `activeSharesOf(account)` | Returns the account's ERC20 balance |
| `activeShares()`          | Returns the ERC20 total supply      |

### State-Changing Functions

| Function           | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `initialize(data)` | Initializes the whitelist root and ERC20 name and symbol |

### Internal Hooks

| Function                      | Description                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `_mintShares(account, value)` | Mints ERC20 shares                                                                                              |
| `_burnShares(account, value)` | Burns ERC20 shares                                                                                              |
| `_lockShares(account, value)` | Applies burn checks, claims for the account, then moves its shares to the manager through the base ERC20 update |
| `_update(from, to, value)`    | Applies transfer checks and claims pending shares before updating balances                                      |

## Invariants and Limitations

- ERC20 transfers remain subject to the whitelist, lockup, and pause rules inherited from `ShareManager`.
- The overridden `_update` claims for non-zero participants. The separate lock path claims only for the account.
- The token name and symbol cannot be changed through this contract after initialization.

## BurnableTokenizedShareManager

`BurnableTokenizedShareManager` extends this contract with public ERC20-style burns:

- `burn(value)` burns the caller's shares.
- `burnFrom(account, value)` spends the caller's allowance, then burns the account's shares.

These functions use the inherited burn checks and claim logic. They reduce the share supply without withdrawing assets. The burn emits an ERC20 `Transfer(account, address(0), value)`, without the queue-only ShareManager `Burn` event. Pending-share claims can emit their own events.

This extension was reviewed in [NM-0798](../../audits#module-and-incremental-audits).

## Related Contracts and References

- [ShareManager](./sharemanager)
