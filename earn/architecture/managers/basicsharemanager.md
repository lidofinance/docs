# BasicShareManager

## Overview

`BasicShareManager` is a concrete implementation of the abstract `ShareManager`, designed to provide native ERC20 style share accounting within a modular vault system. It handles minting, burning, and tracking balances of vault shares directly through a local ERC20 compatible storage layout, without exposing standard ERC20 interfaces.

This contract is intended for setups where shares are not tokenized on-chain as ERC20s but are still tracked internally using the `ERC20Upgradeable` storage schema.

## Key Features

- Uses `ShareManager` for permissioning, allocation, and whitelisting logic.
- Maintains balances and total supply using `ERC20Upgradeable.ERC20Storage`.
- Internal mint and burn logic emits `IERC20.Transfer` events (for transparency or compatibility).
- Fully decoupled from standard `ERC20` interface. Share transfers are governed by vault queues and mint and burn logic only.

## Storage

ERC20 style balances and supply are stored at a fixed storage slot allowing for migrations between BasicShareManager and TokenizedShareManager:

```solidity
bytes32 private constant ERC20StorageLocation = 0x52c6...ce00;
```

## Initialization

```solidity
function initialize(bytes calldata data) external initializer
```

- Expects a single `bytes32 whitelistMerkleRoot` (used by `ShareManager`).

## View Functions

- `activeShares()`: Returns `_totalSupply` from ERC20 storage.
- `activeSharesOf(account)`: Returns balance of `account`.

## Internal Logic

### `_mintShares(address, uint256)`

- Checks if minting is allowed via `updateChecks`.
- Increments total supply and receiver's balance.
- Emits `IERC20.Transfer(address(0), account, value)`.

Reverts if:

- `account == address(0)`.
- Minting is paused or restricted by lockup, whitelist, or blacklist.

### `_burnShares(address, uint256)`

- Checks if burning is allowed via `updateChecks`.
- Decreases sender's balance and total supply.
- Emits `IERC20.Transfer(account, address(0), value)`.

Reverts if:

- `account == address(0)`.
- `value > account balance`.
- Burning is paused or blocked.

## Design Notes

- This module deliberately avoids exposing the ERC20 interface, preventing unintended external transfers or integrations.
- It is intended for internal share accounting within vault systems, where shares are tracked but not tokenized on-chain.
- All permissioning logic, including minting, burning, whitelisting, and lockup enforcement, is delegated to the inherited `ShareManager`.
- This implementation is ideal when the vault owner requires non transferable shares for internal logic, without compliance to ERC20 or ERC4626 standards.
- It is not appropriate for setups where shares must be externally transferable, interoperable with third party protocols, or conform to token standards.
