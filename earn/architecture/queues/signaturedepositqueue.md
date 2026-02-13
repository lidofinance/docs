# SignatureDepositQueue

## Purpose

`SignatureDepositQueue` extends `SignatureQueue` to enable instant deposit of assets into a vault, bypassing the standard on-chain `DepositQueue` mechanism. It leverages off-chain approvals signed by a trusted consensus group, using EIP-712 or EIP-1271 compliant signatures, to authorize asset inflows and minting of vault shares.

This contract is optimized for high-trust environments requiring immediate asset onboarding while maintaining on-chain price safety guarantees.

## Key Features

- Instant deposit execution with no queuing delay.
- EIP-712 signed orders with nonce based replay protection.
- Vault share minting at off-chain pre-agreed price.
- Fully integrated with vault accounting and share manager.
- No deposit fee applied (unlike possible fees in `DepositQueue`).

## Workflow

1. A consensus group signs an `Order` authorizing a user deposit. The order includes asset amount (`ordered`) and shares to mint (`requested`), binds the request to a specific queue and vault, and includes a nonce and expiration timestamp.
2. The user submits the order on-chain by calling `deposit`. The contract validates the order using signatures and price logic, receives tokens from the user, transfers these tokens to the vault, mints shares to the specified recipient, updates vault internal balance, and executes the post-deposit hook.

## Function: `deposit`

```solidity
function deposit(Order calldata order, IConsensus.Signature[] calldata signatures) external payable nonReentrant
```

## Parameters

- `order`: A signed `Order` struct including deposit parameters.
- `signatures`: Signatures from the off-chain consensus validating the order.

## Steps

1. `validateOrder(...)` confirms the order is not expired, the order is intended for this queue, the asset, caller, and nonce are correct, off-chain signatures are valid, and the asset or share price is validated using the vault oracle.
2. Increments the caller's nonce to prevent replay.
3. Transfers `order.ordered` assets from the caller to this contract.
4. Transfers these assets into the vault.
5. Calls `vault.callHook(...)` for any optional strategy logic.
6. Notifies the vault's `RiskManager` of the new deposit.
7. Mints `order.requested` shares to `order.recipient`.
8. Emits `OrderExecuted` event.

## Security Considerations

- Consensus signatures are required to prevent unauthorized deposits.
- Oracle validation ensures price sanity even in trusted setups.
- Replay protection enforced using per-user nonces.
- No deposit can proceed if asset or queue mismatch, caller mismatch, nonce is reused, or off-chain price is out of oracle bounds.
