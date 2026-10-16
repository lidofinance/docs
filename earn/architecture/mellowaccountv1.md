# MellowAccountV1

## Overview

`MellowAccountV1` is an upgradeable account that lets its owner batch calls to other contracts. Calls originate from the account, so targets check the account's permissions rather than the owner's permissions.

## Initialization

The implementation constructor disables initializers. `initialize(bytes data)` decodes `abi.encode(address owner)`, initializes ownership and reentrancy protection, and emits `Initialized(data)`. The initializer can run only once.

## Behavior

```solidity
struct Call {
    address target;
    bytes data;
}

function multicall(Call[] calldata calls)
    external
    nonReentrant
    onlyOwner
    returns (bytes[] memory results);
```

`multicall` executes each call sequentially through `Address.functionCall`, returns the raw results in the same order, and emits `Executed(caller)`. A failed call reverts the batch. The method is not payable and has no per-call ETH value field.

## Permissions and Limitations

- Only the owner can execute `multicall`; inherited ownership functions control who owns the account.
- Each target still applies its own roles, limits, and validation. Account ownership does not bypass those checks.
- The account has no separate call allowlist or verifier. Its owner chooses the targets and calldata.
- A vault or subvault can grant operational roles to the account so its owner can act through it. Deployment-specific grants are separate configuration.

## Source

[MellowAccountV1.sol at `69bbaf1`](https://github.com/mellow-finance/flexible-vaults/blob/69bbaf17530dc5127ecf9049cceaab141f516a1e/src/accounts/MellowAccountV1.sol)
