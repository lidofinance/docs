# SignatureQueue

## Purpose

The `SignatureQueue` enables instant user deposits or redemptions using off-chain signed approvals from a trusted consensus group. This queue type bypasses the normal time-delayed queuing mechanism (for example `DepositQueue` and `RedeemQueue`) by verifying orders via EIP-712 or EIP-1271 signatures, offering fast lane access for users while preserving oracle bound price safety.

## Key Features

- Instant execution without waiting for oracle price reports.
- Nonce based signature protection to prevent replay attacks.
- EIP-712 and EIP-1271 compatible signed orders.
- Oracle price validation enforced on-chain.
- Stateless and removable (does not accumulate shares or process claims).
- Fee bypassed: no `depositFee` or `redeemFee` is charged for actions via this queue.

## High Level Workflow

1. Off-chain consensus actors (for example operators, curators, admins) generate signed `Order` messages.
2. A user submits this order to the `SignatureQueue` contract for execution.
3. The queue verifies the order signature, validates nonce, queue address, asset match, deadline, and caller, then computes the implied asset or share price and checks it against the vault's oracle.
4. If all checks pass, the order is executed atomically.

## Order Structure

Each order encapsulates all the necessary metadata for verification:

```solidity
struct Order {
    uint256 orderId;       // Off-chain tracking ID
    address queue;         // Must match queue address
    address asset;         // Token involved in deposit/redeem
    address caller;        // Must match msg.sender
    address recipient;     // Recipient of assets or shares
    uint256 ordered;       // Assets in (deposit) or shares out (redeem)
    uint256 requested;     // Shares out (deposit) or assets in (redeem)
    uint256 deadline;      // Expiration timestamp
    uint256 nonce;         // Unique per caller
}
```

## Signature Validation

- Orders are signed by a quorum of validators registered in the `Consensus` contract.
- Signatures can conform to EIP-712 (structured message hashing) or EIP-1271 (smart contract based signature schemes).

The order hash is computed via:

```solidity
keccak256(
    abi.encode(
        ORDER_TYPEHASH,
        order.orderId,
        order.queue,
        order.asset,
        order.caller,
        order.recipient,
        order.ordered,
        order.requested,
        order.deadline,
        order.nonce
    )
);
```

## Price Safety Check

After signature verification, `SignatureQueue` uses the vault's `Oracle` to validate the price:

- Deposits: `price = requestedShares / depositedAssets`.
- Redemptions: `price = burnedShares / redeemedAssets`.
- Oracle must confirm price is within allowed bounds and not marked as suspicious.

Otherwise, the operation is rejected with `InvalidPrice`.

## Storage Layout

```solidity
struct SignatureQueueStorage {
    address consensus;                        // Signature validator contract
    address vault;                            // Parent vault (Vault.sol)
    address asset;                            // Supported ERC20 token or native ETH
    mapping(address => uint256) nonces;       // Per-user nonces
}
```

## Interface Compatibility

Despite not using claimable balances, `SignatureQueue` implements stub methods for compatibility with the `IQueue` interface:

- `claimableOf(...) -> 0`
- `claim(...) -> false`
- `handleReport(...)`: no-op
- `canBeRemoved() -> true`: confirms it has no persistent state

## Events

```solidity
event OrderExecuted(Order order, IConsensus.Signature[] signatures);
```

Emitted after a signed order is successfully executed.

## Security Assumptions

- Only trusted off-chain actors (consensus group) are authorized to sign orders.
- Price quotes must match oracle defined asset or share rates.
- Users cannot reuse old signatures due to nonce tracking.
- Orders must be executed before `deadline`.

## Use Cases

- Instant UX: bypassing delays in `DepositQueue` or `RedeemQueue`.
- Institutional integrations: where trusted relayers or coordinators pre-sign valid actions.
- Fallback mechanism: during oracle lags or downtime.

## Limitations

- Does not charge fees (unlike time delayed queues).
- Requires trusted off-chain actors.
- Less decentralized if consensus actors are not well audited or rotated.
