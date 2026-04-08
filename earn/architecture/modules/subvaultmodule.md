# SubvaultModule

## Purpose

The `SubvaultModule` represents an isolated child vault within a modular vault system. It is tightly controlled by its parent vault (typically a `VaultModule`) and is responsible for securely holding and releasing assets upon authenticated requests.

## Responsibilities

- Store and isolate a portion of vault assets.
- Allow trusted actor (curator) to delegate liquidity from the subvault to external protocols based on the `Verifier` setup for this specific subvault.
- Respond to `pullAssets` calls from the parent vault only.

## Storage Layout (`SubvaultModuleStorage`)

```solidity
struct SubvaultModuleStorage {
  address vault;
}
```

- `vault`: Address of the root vault that controls this subvault. Only this address can request asset withdrawals.

The layout is stored in a deterministic custom slot derived using:

```solidity
SlotLibrary.getSlot("SubvaultModule", name_, version_)
```

## View Functions

### `vault() -> address`

Returns the address of the parent vault that instantiated this subvault.

## Mutable Functions

### `pullAssets(asset: address, value: uint256)`

Allows the parent vault to withdraw a specified amount of an asset.

- Access control: Can only be called by the `vault()` address.
- Reverts with `NotVault()` if the caller is not the vault.
- Transfer behavior: Uses `TransferLibrary.sendAssets()` to forward tokens or native ETH to the `Vault.sol` address.
- Emits `AssetsPulled(asset, vault, value)`.

## Internal Initialization

### `__SubvaultModule_init(address vault_)`

Internal setup method to be called during construction or proxy initialization.

## Events

### `event AssetsPulled(address indexed asset, address indexed to, uint256 value)`

Triggered when assets are withdrawn by the parent vault.

- `asset`: Address of the ERC20 token or native ETH.
- `to`: Always equals the `vault()` address.
- `value`: Amount of the asset transferred.

## Error Handling

- `NotVault()`: Raised when a non-vault caller attempts to call `pullAssets()`.
