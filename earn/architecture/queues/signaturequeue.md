# SignatureQueue

## Overview

The `SignatureQueue` enables instant user deposits or redemptions using off-chain signed approvals from a trusted consensus group. This queue type bypasses the normal time-delayed queuing mechanism (for example `DepositQueue` and `RedeemQueue`) by verifying orders via [EIP-712](https://eips.ethereum.org/EIPS/eip-712) or [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) signatures, offering fast lane access for users while preserving oracle bound price safety.

### Key Features

- Instant execution without waiting for oracle price reports.
- Nonce based signature protection to prevent replay attacks.
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712) and [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) compatible signed orders.
- Oracle price validation enforced on-chain.
- No pending requests or claims; removable despite persistent nonces and configuration.
- Fee bypass: no `depositFee` or `redeemFee` is charged for actions via this queue.

### Use Cases

- Instant UX: bypassing delays in `DepositQueue` or `RedeemQueue`.
- Institutional integrations: where trusted relayers or coordinators pre-sign valid actions.
- An alternative to queued execution while the oracle can still validate the quoted price.

## Configuration and State

### Order Structure

Each order encapsulates all the necessary metadata for verification:

```solidity
struct Order {
    uint256 orderId;       // Off-chain tracking ID
    address queue;         // Must match queue address
    address asset;         // Token involved in deposit/redeem
    address caller;        // Must match msg.sender
    address recipient;     // Recipient of assets or shares
    uint256 ordered;       // Assets in (deposit) or shares burned (redeem)
    uint256 requested;     // Shares minted (deposit) or assets paid (redeem)
    uint256 deadline;      // Expiration timestamp
    uint256 nonce;         // Unique per caller
}
```

### Storage Layout

```solidity
struct SignatureQueueStorage {
    address consensus;                        // Signature validator contract
    address vault;                            // Parent vault (Vault.sol)
    address asset;                            // Supported ERC20 token or native ETH
    mapping(address => uint256) nonces;       // Per-user nonces
}
```

## Behavior

### High Level Workflow

1. Off-chain consensus actors (for example operators, curators, admins) generate signed `Order` messages.
2. A user submits this order to the `SignatureQueue` contract for execution.
3. The queue verifies the order signature, validates nonce, queue address, asset match, deadline, and caller, then computes the implied asset or share price and checks it against the vault's oracle.
4. If all checks pass, the order is executed atomically.

### Signature Validation

- Orders are signed by a quorum of validators registered in the `Consensus` contract.
- Signatures can conform to [EIP-712](https://eips.ethereum.org/EIPS/eip-712) (structured message hashing) or [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) (smart contract based signature schemes).

The order hash is computed via:

```solidity
_hashTypedDataV4(keccak256(
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
));
```

`hashOrder(order)` returns this EIP-712 digest. Its domain uses the name and version decoded by `initialize`, the chain ID, and the queue address. Sign this digest through EIP-712, rather than the struct hash alone.

### Price Safety Check

For queues connected to the standard `Vault`, `SignatureQueue` always validates the price after signature verification. `ShareModule` requires a non-zero Oracle at initialization and has no setter to disable it:

- Deposits: `price = requestedShares / depositedAssets`.
- Redemptions: `price = burnedShares / redeemedAssets`.
- Oracle must confirm price is within allowed bounds and not marked as suspicious.

Otherwise, the operation is rejected with `InvalidPrice()`.

## Functions

### Initialization and Public Views

`initialize(data)` decodes the asset, vault, consensus, EIP-712 name, and version. The consensus must be an entity from `consensusFactory`, otherwise it reverts with `NotEntity()`.

- `validateOrder(order, signatures)`: Checks the order and signatures; returns no value.
- `hashOrder(order)`: Returns its EIP-712 digest.
- `nonces(account)`: Returns the account's next nonce.
- `consensus()`: Returns the consensus contract.

### Interface Compatibility

Despite not using claimable balances, `SignatureQueue` implements stub methods for compatibility with the `IQueue` interface:

- `claimableOf(...) -> 0`
- `claim(...) -> false`
- `handleReport(...)`: no-op
- `canBeRemoved() -> true`: it has no pending requests; nonces and configuration remain stored

## Events

```solidity
event OrderExecuted(Order order, IConsensus.Signature[] signatures);
```

Emitted after a signed order is successfully executed.

## Invariants and Limitations

### Security Assumptions

- Only trusted off-chain actors (consensus group) are authorized to sign orders.
- Price quotes must match oracle defined asset or share rates.
- Users cannot reuse old signatures due to nonce tracking.
- Orders must be executed before `deadline`.

### Limitations

- Does not charge fees (unlike time delayed queues).
- Requires trusted off-chain actors.
- Less decentralized if consensus actors are not well audited or rotated.
