# Verifier

## Purpose

The `Verifier` contract is a multi mode permissioning module for verifying and enforcing call level access control across vault connected modules. It supports:

- Onchain allowlists using hashed shortened calls (`CompactCall`)
- Merkle tree based validation for compact merkle, extended merkle and custom verifier verification types
- Delegated verification logic through external custom verifiers (`ICustomVerifier`)

This contract enables secure and modular delegation of operational permissions.

## Core Responsibilities

- Validates function calls from external actors (e.g., operators, curators) or strategy contracts (strategies).
- Grants or revokes execution rights using onchain and offchain mechanisms.
- Ensures that only whitelisted or merkle authenticated calls are allowed.
- Integrates with vault based role system via `IAccessControl`.

## Roles and Access

- `SET_MERKLE_ROOT_ROLE`: Role allowed to update the active Merkle root.
- `CALLER_ROLE`: Role required by initiators of authorized calls.
- `ALLOW_CALL_ROLE`: Grants ability to add compact calls to allowlist.
- `DISALLOW_CALL_ROLE`: Grants ability to remove compact calls from allowlist.

## Storage Layout

```solidity
struct VerifierStorage {
  address vault;
  bytes32 merkleRoot;
  EnumerableSet.Bytes32Set compactCallHashes;
  mapping(bytes32 => CompactCall) compactCalls;
}
```

- `vault`: Vault contract that owns the verifier (must support `IAccessControl`).
- `merkleRoot`: Merkle root for offchain verified call proofs.
- `compactCallHashes`: Set of hashes representing allowed compact calls.
- `compactCalls`: Optional mapping for reverse lookup of call metadata by hash.

## Verification Types

```solidity
enum VerificationType {
  ONCHAIN_COMPACT,
  MERKLE_COMPACT,
  MERKLE_EXTENDED,
  CUSTOM_VERIFIER
}
```

- **ONCHAIN_COMPACT**: Checks `CompactCall` (who | where | selector) hash against internal set.
- **MERKLE_COMPACT**: Verifies Merkle proof of `CompactCall` (who | where | selector) hash.
- **MERKLE_EXTENDED**: Verifies Merkle proof of `ExtendedCall` (who | where | value | callData) hash.
- **CUSTOM_VERIFIER**: Delegates full verification to an external verifier.

## Call Structures

```solidity
struct CompactCall {
  address who;
  address where;
  bytes4 selector;
}

struct ExtendedCall {
  address who;
  address where;
  uint256 value;
  bytes data;
}

struct VerificationPayload {
  VerificationType verificationType;
  bytes verificationData;
  bytes32[] proof;
}
```

- `CompactCall`: Encodes permissioned call using address and selector.
- `ExtendedCall`: Encodes full call (selector + calldata + ETH value).
- `VerificationPayload`: Contains verification metadata and proof.

## View Functions

- `vault()`: Returns the associated vault contract.
- `merkleRoot()`: Returns current Merkle root.
- `allowedCalls()`: Returns number of compact calls in allowlist.
- `allowedCallAt(index)`: Returns `CompactCall` at index from internal set.
- `isAllowedCall(who, where, callData)`: Checks if `CompactCall` is explicitly allowed.
- `hashCall(CompactCall)`: Returns keccak256 hash of compact call.
- `hashCall(ExtendedCall)`: Returns keccak256 hash of extended call.

## Verification Functions

### `verifyCall(...)`

```solidity
function verifyCall(
  address who,
  address where,
  uint256 value,
  bytes calldata data,
  VerificationPayload calldata payload
) external view;
```

- Validates call permissions using the chosen `VerificationType`.
- Reverts with `VerificationFailed` on failure.

### `getVerificationResult(...) -> bool`

```solidity
function getVerificationResult(
  address who,
  address where,
  uint256 value,
  bytes calldata data,
  VerificationPayload calldata payload
) external view returns (bool);
```

- Returns `true` if the verification succeeds, `false` otherwise.

Verification decision logic:

- `ONCHAIN_COMPACT`: Validate hash against stored allowlist.
- `MERKLE_COMPACT`: Validate Merkle proof of compact hash.
- `MERKLE_EXTENDED`: Validate Merkle proof of full hash.
- `CUSTOM_VERIFIER`: Validate Merkle proof of the verification payload and delegate validation to external contract.

## Mutable Functions

- `initialize(bytes calldata initParams)`: Accepts `abi.encode(address vault_, bytes32 merkleRoot_)` and sets the vault address and initial Merkle root.
- `setMerkleRoot(bytes32 root)`: Updates Merkle root (requires `SET_MERKLE_ROOT_ROLE`).
- `allowCalls(CompactCall[] calldata calls)`: Adds compact calls to allowlist and reverts on duplicates.
- `disallowCalls(CompactCall[] calldata calls)`: Removes calls from allowlist and reverts if a call is not found.

## Initialization

```solidity
function initialize(bytes calldata initParams) external initializer;
```

- `initParams` format: `abi.encode(address vault_, bytes32 merkleRoot_)`.
