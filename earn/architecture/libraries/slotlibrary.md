# SlotLibrary

This library generates unique and collision resistant storage slots for use in upgradeable Solidity contracts. It ensures that different modules or instances do not unintentionally overwrite each other's storage, even when used via proxy or delegate calls.

## Storage Slot Strategy

- Based on EIP-7201.
- Inputs include contract name (`contractName`), human readable name (`name`), and version number (`version`).

Final slot:

```solidity
keccak256(
    abi.encode(
        uint256(
            keccak256(
                abi.encodePacked(
                    "mellow.flexible-vaults.storage.",
                    contractName,
                    name,
                    version
                )
            )
        ) - 1
    )
) & ~bytes32(uint256(0xff));
```

This structure ensures:

- Namespacing: prevents overlap between different modules (for example `ShareModule`, `FeeManager`).
- Instance separation: multiple deployments with different names produce distinct slots.
- Versioning: upgrades can cleanly migrate to new versions without collision.

## Function

### `getSlot(string contractName, string name, uint256 version) -> bytes32`

Computes a deterministic, collision resistant storage slot for a contract module.

Parameters:

- `contractName`: Logical name of the module (for example `"ShareModule"`).
- `name`: Instance identifier or label (for example `"Mellow"`).
- `version`: Numeric version for versioned slot separation.

Returns:

- A `bytes32` value representing the computed storage slot.

Example:

```solidity
bytes32 slot = SlotLibrary.getSlot("FeeManager", "Mellow", 1);
```
