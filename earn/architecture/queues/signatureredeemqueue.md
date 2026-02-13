# SignatureRedeemQueue

## Purpose

`SignatureRedeemQueue` extends `SignatureQueue` to enable instant share redemption from a vault without the usual delay of on-chain oracle processing. It leverages off-chain consensus signatures conforming to EIP-712 or EIP-1271 to authorize redemptions, allowing trusted users to convert shares to assets in a fast and secure manner.

This module provides a low latency redemption path under stronger trust assumptions, useful in environments where responsiveness is critical and participants are whitelisted by a governance consensus.

## Key Features

- Off-chain authorized redemptions using signed `Order` messages.
- Oracle bound price validation to prevent manipulation.
- EIP-712 structured data signature verification.
- Direct burning of shares and asset pulling from the vault and payout.
- Nonce based replay protection.
- Vault hook execution and balance tracking.
- No redeem fee applied (unlike possible fees in `RedeemQueue`).

## Function: `redeem`

```solidity
function redeem(Order calldata order, IConsensus.Signature[] calldata signatures) external payable nonReentrant
```

## Parameters

- `order`: A signed redemption `Order` struct specifying asset amount and recipient.
- `signatures`: Validator signatures from the consensus group.

## Workflow

1. Validation via `validateOrder(...)`: signature freshness (`deadline`), queue and asset correctness, caller authenticity and correct nonce, signatures validated by registered `Consensus` contract, and price computed from `ordered` and `requested` values and verified via oracle.
2. Nonce incremented for the caller to prevent signature reuse.
3. Vault liquid asset check. Ensures enough liquidity is available for the redemption and reverts with `InsufficientAssets` if funds are lacking.
4. Redemption Processing: burns `order.ordered` shares from the user via `shareManager`, calls `vault.callHook(...)` for any strategy exit logic, transfers `order.requested` assets to the user, and updates internal vault balance via the `RiskManager`.
5. Event emitted: `OrderExecuted(order, signatures)` confirms successful execution.

## Error: `InsufficientAssets`

```solidity
error InsufficientAssets(uint256 requested, uint256 available);
```

Thrown when the vault does not have enough liquid assets to fulfill the request. Ensures safety during instantaneous exits.
