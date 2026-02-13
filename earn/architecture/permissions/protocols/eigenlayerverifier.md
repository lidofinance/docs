# EigenLayerVerifier

## Overview

`EigenLayerVerifier` is a custom `ICustomVerifier` implementation tailored to securely authorize calls to EigenLayer contracts like `DelegationManager`, `StrategyManager`, and `RewardsCoordinator`. It uses strict role based gating, exact calldata matching, and entity specific validation to ensure that only authorized vaults and bots can interact with EigenLayer staking, delegation, withdrawal, and rewards workflows.

## Purpose

This verifier protects EigenLayer operations by:

- Ensuring only whitelisted entities (vaults, strategies, operators) can execute actions.
- Verifying target contracts and function selectors precisely.
- Enforcing exact calldata encoding to eliminate any ambiguity or abuse.

## Role Definitions

| Role Constant | Description |
| --- | --- |
| `CALLER_ROLE` | Address allowed to initiate EigenLayer calls (typically curators) |
| `ASSET_ROLE` | Whitelisted ERC20 token allowed in strategy deposits or withdrawals |
| `STRATEGY_ROLE` | Whitelisted EigenLayer strategy contracts |
| `OPERATOR_ROLE` | Approved EigenLayer operator address for delegation |
| `MELLOW_VAULT_ROLE` | Whitelisted vaults acting as stakers or earners (usually `Subvault`) |
| `RECEIVER_ROLE` | Authorized receivers for claimed rewards |

## Constructor

```solidity
constructor(address delegationManager_, address strategyManager_, address rewardsCoordinator_, string memory name_, uint256 version_)
```

Initializes the verifier by:

- Setting immutable references to EigenLayer's `DelegationManager`, `StrategyManager`, and `RewardsCoordinator`.
- Inheriting access control via `OwnedCustomVerifier`.

## `verifyCall`

```solidity
function verifyCall(
    address who,
    address where,
    uint256 value,
    bytes calldata callData,
    bytes calldata /* verificationData */
) external view override returns (bool)
```

## General Preconditions

- `who` must have `CALLER_ROLE`.
- `value` must be 0 (no ETH allowed).
- `callData.length >= 4` (valid selector).

## Validated Targets & Selectors

### StrategyManager – `depositIntoStrategy`

`depositIntoStrategy(IStrategy, address asset, uint256 shares)`

- Strategy must have `STRATEGY_ROLE`.
- Asset must have `ASSET_ROLE`.
- Shares must be non-zero.
- Calldata must match.

### DelegationManager

**`delegateTo(address operator, SignatureWithExpiry signature, bytes32 salt)`**

- Operator must have `OPERATOR_ROLE`.
- Calldata must match.

**`queueWithdrawals(QueuedWithdrawalParams[] params)`**

- Only one `params.length == 1` allowed.
- Param must include one strategy with `STRATEGY_ROLE` and one deposit share > 0.
- Calldata must match.

**`completeQueuedWithdrawal(Withdrawal, address[] tokens, bool receiveAsTokens)`**

- `receiveAsTokens` must be `true`.
- Withdrawal must have only one strategy with `STRATEGY_ROLE` and `staker` with `MELLOW_VAULT_ROLE`.
- `tokens.length == 1` and token must have `ASSET_ROLE`.
- Calldata must match.

### RewardsCoordinator – `processClaim`

Selector: `processClaim(RewardsMerkleClaim claimData, address receiver)`

- `claimData.earnerLeaf.earner` must have `MELLOW_VAULT_ROLE`.
- `receiver` must have `RECEIVER_ROLE`.
- Calldata must match.

## Security Properties

- Role enforcement: Prevents unauthorized usage of EigenLayer functions.
- Exact calldata match: Avoids incorrect encoding or maliciously crafted data.
- Zero ETH transfers: Disallows unexpected native token usage.
- Single param enforcement (withdrawals): Minimizes complexity and risk surface.
