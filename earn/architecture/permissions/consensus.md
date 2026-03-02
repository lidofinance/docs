# Consensus

## Purpose

The `Consensus` contract manages a permissioned set of signers and enforces multi signature validation logic using either EIP 712 or EIP 1271 signatures. It is a lightweight module designed for verifying offchain consensus before executing critical actions such as deposits and redemptions via SignatureQueues.

It supports:

- Threshold based consensus.
- Two signature modes: EIP 712 (EOA) and EIP 1271 (contract based).
- Dynamic signer set management.
- Stateless, reusable verification interface.

## Core Concepts

### Threshold Based Verification

To validate an action, a set of authorized signers must collectively submit signatures. The number of valid signatures must be greater than or equal to the configured `threshold`.

### Signature Types

Each signer is associated with a `SignatureType`:

- `EIP712`: Used for externally owned accounts (standard `ECDSA.recover`).
- `EIP1271`: Used for contract accounts (via `isValidSignature()`).

## Storage Layout

```solidity
struct ConsensusStorage {
    uint256 threshold;
    EnumerableMap.AddressToUintMap signers;
}
```

- `threshold`: Minimum number of valid signatures required for verification to succeed.
- `signers`: Mapping of signer addresses to their configured signature type.

## Initialization

```solidity
function initialize(bytes calldata data)
```

- Expects `abi.encode(owner)` as input.
- Sets the initial owner using `OwnableUpgradeable`.

## Signature Verification

### `checkSignatures`

```solidity
function checkSignatures(bytes32 orderHash, Signature[] calldata signatures) public view returns (bool)
```

Returns `true` if:

- At least `threshold` signatures are present.
- Each signature is from an authorized signer.
- Each signature is valid according to the signer's configured signature type.

Returns `false` otherwise.

Signature validation behavior:

- `EIP712`: Uses `ECDSA.recover(orderHash, sig)` and matches signer.
- `EIP1271`: Calls `isValidSignature(orderHash, sig)` on the contract.

### `requireValidSignatures`

```solidity
function requireValidSignatures(bytes32 orderHash, Signature[] calldata signatures) external view
```

Same logic as `checkSignatures`, but reverts with `InvalidSignatures` error if validation fails.

## Signer Management (Owner only)

### `setThreshold`

```solidity
function setThreshold(uint256 threshold_) external onlyOwner
```

- Sets a new threshold.
- Must be greater than zero and less than or equal to `signers.length()`.
- Emits `ThresholdSet`.

### `addSigner`

```solidity
function addSigner(address signer, uint256 threshold_, SignatureType sigType) external onlyOwner
```

- Adds a new signer with specified signature type.
- Updates threshold as part of signer addition.
- Reverts if `signer == address(0)` or signer already exists.
- Emits `SignerAdded` and `ThresholdSet`.

### `removeSigner`

```solidity
function removeSigner(address signer, uint256 threshold_) external onlyOwner
```

- Removes signer from consensus set.
- Updates threshold.
- Reverts if signer not found.
- Emits `SignerRemoved` and `ThresholdSet`.

## View Functions

| Function | Returns |
| --- | --- |
| `threshold()` | Current consensus threshold |
| `signers()` | Total number of signers |
| `signerAt(uint256)` | Signer address and type at index |
| `isSigner(address)` | Boolean indicating if address is a signer |

## Events

- `Initialized(bytes)`
- `ThresholdSet(uint256)`
- `SignerAdded(address signer, SignatureType)`
- `SignerRemoved(address signer)`
- `InvalidSignatures(bytes32 hash, Signature[] signatures)` (used in revert)

## Security Considerations

- Only the owner (via `OwnableUpgradeable`) may update signer set or threshold.
- Signatures are stateless and externally verifiable.
- Replay protection (for example nonce checks) must be handled by upstream systems.
- Signers using `EIP1271` are trusted for contract logic; contracts must not be mutable without governance.
