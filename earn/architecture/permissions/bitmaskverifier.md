# BitmaskVerifier

## Purpose

The `BitmaskVerifier` is a customizable, low level verifier module that enables selective call authorization using bitmask based hashing. It allows a contract to validate whether a function call (defined by `who`, `where`, `value`, and `data`) conforms to a pre authorized pattern.

It supports:

- Partial matching of calldata.
- Exact or wildcard matching on sender, target, or ETH value.
- Highly gas efficient verification with minimal storage.

## Core Concept: Bitmask Based Hashing

The `BitmaskVerifier` computes a hash over masked components of a transaction and compares it to a stored or expected hash.

The verification succeeds if:

```solidity
calculateHash(bitmask, who, where, value, data) == expectedHash
```

## Bitmask Format

The bitmask is a byte array with the following structure:

| Segment | Bytes | Targeted Field | Description |
| --- | --- | --- | --- |
| [0:32] | 32 bytes | `who` | Mask for the caller address (left padded to 32 bytes) |
| [32:64] | 32 bytes | `where` | Mask for the target contract address (left padded to 32 bytes) |
| [64:96] | 32 bytes | `value` | Mask for ETH value (uint256) |
| [96:] | `data.length` | `data` | One byte per calldata byte; used to mask calldata selectively |

This structure allows the verifier to:

- Fully match addresses and value.
- Partially match calldata (for example permit `approve(x, anyAmount)`).

## Function: `calculateHash`

```solidity
function calculateHash(
  bytes calldata bitmask,
  address who,
  address where,
  uint256 value,
  bytes calldata data
) public pure returns (bytes32)
```

## Logic

This function computes a `keccak256` hash over the masked versions of each input field:

1. `who`, masked by `bitmask[0:32]`
1. `where`, masked by `bitmask[32:64]`
1. `value`, masked by `bitmask[64:96]`
1. Each `data[i]` masked by `bitmask[96+i]`

## Example Use

If a bitmask has `0xff` for a given byte, that byte is strictly matched. If `0x00`, the byte is ignored (wildcarded). Mixed values allow partial matching.

## Function: `verifyCall`

```solidity
function verifyCall(
  address who,
  address where,
  uint256 value,
  bytes calldata data,
  bytes calldata verificationData
) public pure returns (bool)
```

## Input: `verificationData`

This input must be ABI encoded as:

```solidity
abi.encode(bytes32 expectedHash, bytes bitmask)
```

## Logic

1. Parses `expectedHash` and `bitmask` from the calldata.
1. Verifies that the bitmask length matches `96 + data.length`. The 96 bytes cover 32 for `who`, 32 for `where`, 32 for `value`, and one byte per calldata byte.
1. Calls `calculateHash()` and compares it to `expectedHash`.

Returns:

- `true` if the masked call hash matches the expected hash.
- `false` otherwise.

## Use Cases

This verifier enables granular control over contract interactions, for example:

- Approvals to a specific contract: Allow `approve(farmContract, anyAmount)` but block other approvals.
- Partial calldata authorization: Authorize only the first 4 bytes (function selector) of a call.
- Curated access for specific addresses: Allow only specific curators to call `delegate(address)` with known targets.
- Value bound actions: Authorize only zero ETH transactions or enforce a cap on `value`.
