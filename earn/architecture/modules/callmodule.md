# CallModule

## Overview

Abstract contract extending `VerifierModule`, implementing low-level contract calls with verification via a pluggable verifier.

## `call`

```solidity
function call(
    address where,
    uint256 value,
    bytes calldata data,
    IVerifier.VerificationPayload calldata payload
) external nonReentrant returns (bytes memory response)
```

## Description

Executes a low-level call to a target contract after validating the call parameters through an external `Verifier` contract. The verification logic is determined by the verification type specified in the `Verifier` contract.

For details on available verification types, refer to the Verifier specification.

## Parameters

- `where`: The address of the target contract.
- `value`: The ETH value to send along with the call.
- `data`: Calldata to pass to the target contract.
- `payload`: Encoded verification payload used to authorize the call.

## Returns

- `response`: The raw returned data from the target contract call.

## Requirements

- All the provided parameters must be externally verified via `verifier().verifyCall`.
- Reentrancy is prevented via `nonReentrant` modifier.
