# BaseModule

## Overview

`BaseModule` is an abstract contract that acts as a foundational layer for modules within the system. It integrates shared logic such as initializer protection, reentrancy guard, IERC721Receiver compliance and low-level storage access.

This module is intended to be inherited and extended by other functional modules.

## Constructor

```solidity
constructor() {
    _disableInitializers();
}
```

Prevents the contract from being initialized outside of proxy context. Ensures secure upgradeable deployments.

## Public & External Functions

### `getStorageAt(bytes32 slot)`

```solidity
function getStorageAt(bytes32 slot) external pure returns (StorageSlot.Bytes32Slot memory)
```

Returns a reference to a custom storage slot. Enables advanced access to shared storage across upgradeable modules using the `StorageSlot` pattern.

Parameters:

- `slot` — The `bytes32` identifier of the storage slot.

Returns:

- A `StorageSlot.Bytes32Slot` struct pointing to the slot.

### `onERC721Received(...)`

```solidity
function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4)
```

ERC721 receiver hook implementation to support safe transfers of NFTs to the module. Returns the selector as required by `IERC721Receiver`.

Returns:

- `IERC721Receiver.onERC721Received.selector` — confirms compliance.

### `receive()`

```solidity
receive() external payable {}
```

Allows the contract to receive native ETH transfers. This is typically used for vaults handling native tokens directly.

## Internal Functions

### `__BaseModule_init()`

```solidity
function __BaseModule_init() internal onlyInitializing
```

Initializes internal dependencies and base upgradeable components. Should be called from derived contract initializers.

Side effects:

- Calls `__ReentrancyGuard_init()` to initialize reentrancy protection.
