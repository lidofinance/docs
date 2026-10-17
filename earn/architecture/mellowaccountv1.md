# MellowAccountV1

## Overview

`MellowAccountV1` is an upgradeable account that lets its owner batch calls to other contracts. Calls originate from the account, so targets check the account's permissions rather than the owner's permissions.

## Initialization

The implementation constructor disables initializers. `initialize(bytes data)` decodes `abi.encode(address owner)`, initializes ownership and reentrancy protection, and emits `Initialized(bytes initParams)`. The initializer can run only once.

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

`multicall` executes each call sequentially through `Address.functionCall`, returns the raw results in the same order, and emits `Executed(address indexed caller)`. A failed call reverts the batch. The method is not payable and has no per-call ETH value field.

## Permissions and Limitations

- Only the owner can execute `multicall`; inherited ownership functions control who owns the account.
- Each target still applies its own roles, limits, and validation. Account ownership does not bypass those checks.
- The account has no separate call allowlist or verifier. Its owner chooses the targets and calldata.
- The parent vault can grant roles to the account, including the `CALLER_ROLE` checked by a subvault's verifier. On-chain and Merkle compact/extended call entries must name the account as the caller (`who`); custom verifiers receive that address and apply their own policy. Deployment-specific grants are separate configuration.

## Audit

[NM-0829](../audits#module-and-incremental-audits) reviewed `MellowAccountV1` at commit `6ca2926`.

## Source

[MellowAccountV1.sol at `69bbaf1`](https://github.com/mellow-finance/flexible-vaults/blob/69bbaf17530dc5127ecf9049cceaab141f516a1e/src/accounts/MellowAccountV1.sol)
