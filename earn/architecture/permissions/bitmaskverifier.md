# BitmaskVerifier

## Overview

The `BitmaskVerifier` is a stateless `ICustomVerifier` implementation that authorizes calls through bitmask-based hashing. It checks whether a call, defined by `who`, `where`, `value`, and `data`, matches a pre-authorized pattern.

It supports:

- Partial matching of calldata.
- Exact or wildcard matching on sender, target, or ETH value.
- Verification without contract storage.

### Use Cases

This verifier enables granular control over contract interactions, for example:

- Approvals to a specific contract: Allow `approve(farmContract, anyAmount)` but block other approvals.
- Partial calldata authorization: Authorize only the first 4 bytes (function selector) of a call.
- Curated access for specific addresses: Allow only specific curators to call `delegate(address)` with known targets.
- Value matching: authorize a specific ETH value or ignore selected bits.

## Configuration and State

### Bitmask Format

The bitmask is a byte array with the following structure:

| Segment | Bytes | Targeted Field | Description |
| --- | --- | --- | --- |
| [0:32] | 32 bytes | `who` | Mask for the caller address (left padded to 32 bytes) |
| [32:64] | 32 bytes | `where` | Mask for the target contract address (left padded to 32 bytes) |
| [64:96] | 32 bytes | `value` | Mask for ETH value (uint256) |
| [96:] | `data.length` | `data` | One byte per calldata byte; used to mask calldata selectively |

Each mask bit selects whether the corresponding input bit affects the hash. An all-ones byte matches the whole input byte, an all-zero byte ignores it, and mixed values match selected bits.

## Behavior

### Core Concept: Bitmask Based Hashing

The verifier computes a chained hash over masked components of a transaction and compares it with the expected hash supplied in `verificationData`.

The verification succeeds if:

```solidity
calculateHash(bitmask, who, where, value, data) == expectedHash
```

The hash processes the masked inputs in this order:

1. `who`, masked by `bitmask[0:32]`
1. `where`, masked by `bitmask[32:64]`
1. `value`, masked by `bitmask[64:96]`
1. Each `data[i]` masked by `bitmask[96+i]`

### Verification Data

This input must be ABI encoded as:

```solidity
abi.encode(bytes32 expectedHash, bytes bitmask)
```

`verifyCall` decodes these values, requires the bitmask length to equal `96 + data.length`, and compares `calculateHash(...)` with `expectedHash`. In the standard `Verifier` flow, the Merkle proof authenticates `verificationData` before the custom verifier is called.

## Functions

### `calculateHash`

```solidity
function calculateHash(
  bytes calldata bitmask,
  address who,
  address where,
  uint256 value,
  bytes calldata data
) public pure returns (bytes32)
```

Returns the chained `keccak256` hash of the masked caller, target, value, and calldata.

### `verifyCall`

```solidity
function verifyCall(
  address who,
  address where,
  uint256 value,
  bytes calldata data,
  bytes calldata verificationData
) public pure returns (bool)
```

Returns `false` when the bitmask length is invalid or the calculated hash does not match the expected hash. Otherwise, it returns `true`.

## Invariants and Limitations

- The bitmask must contain exactly 96 fixed-field bytes plus one byte for every calldata byte.
- The verifier does not store or authenticate patterns itself; the surrounding permission system must authenticate `verificationData`.
- Masking is bitwise. A partially set byte constrains only the selected bits, not the entire byte.
