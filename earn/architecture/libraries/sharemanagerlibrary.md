# ShareManagerLibrary

This library helps pack multiple boolean flags and lockup durations into a compact `uint256` bitmask. It enables efficient storage and quick access to share manager configuration in vault systems.

Designed for the `ShareManager` component to control:

- Whether minting, burning, or transfers are paused.
- Whether deposit or transfer whitelists are active.
- How long global or user specific lockups last.

All data is packed into a single `uint256` using bit level encoding for optimal storage and gas efficiency.

## Bitmask Layout

| Bit Range | Purpose |
| --- | --- |
| `[0]` | `hasMintPause` (bool) |
| `[1]` | `hasBurnPause` (bool) |
| `[2]` | `hasTransferPause` (bool) |
| `[3]` | `hasWhitelist` (bool) |
| `[4]` | `hasTransferWhitelist` (bool) |
| `[5..36]` | `globalLockup` (uint32) |
| `[37..68]` | `targetedLockup` (uint32) |

## Functions

### `hasMintPause(uint256 mask) -> bool`

Returns `true` if minting is paused (bit 0 is set).

### `hasBurnPause(uint256 mask) -> bool`

Returns `true` if burning is paused (bit 1 is set).

### `hasTransferPause(uint256 mask) -> bool`

Returns `true` if transfers are paused (bit 2 is set).

### `hasWhitelist(uint256 mask) -> bool`

Returns `true` if a deposit whitelist is enabled (bit 3 is set).

### `hasTransferWhitelist(uint256 mask) -> bool`

Returns `true` if a transfer whitelist is enabled (bit 4 is set).

### `getGlobalLockup(uint256 mask) -> uint32`

Returns the global lockup duration in seconds, encoded in bits `[5..36]`.

### `getTargetedLockup(uint256 mask) -> uint32`

Returns the targeted lockup duration in seconds, encoded in bits `[37..68]`.

### `createMask(IShareManager.Flags calldata f) -> uint256`

Encodes the values in a `Flags` struct into a single bitmask:

```solidity
struct Flags {
    bool hasMintPause;
    bool hasBurnPause;
    bool hasTransferPause;
    bool hasWhitelist;
    bool hasTransferWhitelist;
    uint32 globalLockup;
    uint32 targetedLockup;
}
```
