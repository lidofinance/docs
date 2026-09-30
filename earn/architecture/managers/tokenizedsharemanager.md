# TokenizedShareManager

## Overview

`TokenizedShareManager` combines `ShareManager` with `ERC20Upgradeable`, exposing vault shares as transferable ERC20 tokens. It retains the inherited minting, burning, whitelist, lockup, and claim rules while making shares usable by wallets and external protocols.

## Configuration and State

The constructor uses the deployment name and version to derive a namespaced storage slot. `initialize(data)` decodes the whitelist Merkle root, token name, and token symbol, then initializes both `ERC20Upgradeable` and `ShareManager`.

In addition to inherited share-manager state, the contract stores an `isClaiming` guard that prevents recursive claim processing during ERC20 balance updates.

## Behavior

All mint, burn, transfer, and lock operations pass through the ERC20 `_update` path. Before balances change, the contract runs the inherited `updateChecks(from, to)` rules and claims pending shares for each non-zero participant. The `isClaiming` guard prevents those claims from recursively triggering another claim cycle.

## Functions

### View Functions

| Function | Description |
| --- | --- |
| `activeSharesOf(account)` | Returns the account's ERC20 balance |
| `activeShares()` | Returns the ERC20 total supply |

### State-Changing Functions

| Function | Description |
| --- | --- |
| `initialize(data)` | Initializes the whitelist root and ERC20 name and symbol |

### Internal Hooks

| Function | Description |
| --- | --- |
| `_mintShares(account, value)` | Mints ERC20 shares |
| `_burnShares(account, value)` | Burns ERC20 shares |
| `_lockShares(account, value)` | Claims pending shares, then moves shares from the account to the manager contract |
| `_update(from, to, value)` | Applies transfer checks and claims pending shares before updating balances |

## Invariants and Limitations

- ERC20 transfers remain subject to the whitelist, lockup, and pause rules inherited from `ShareManager`.
- Pending shares are claimed before a non-zero sender's or recipient's balance changes.
- The token name and symbol cannot be changed through this contract after initialization.

## Related Contracts and References

- [ShareManager](./sharemanager)
