---
sidebar_position: 8
---

# Exit validators permissions and principles

Every withdrawal from the Consensus Layer is an EIP-7002 request sent by the `StakingVault` contract, because that is the address the validators' withdrawal credentials point at. Participants differ in who may make the stVault send that request, and whether the request may be partial.

| Actor | Action | Gate | Scope |
| --- | --- | --- | --- |
| Node Operator | `ejectValidators` | the Node Operator address on the stVault | full exits only |
| Vault Owner | `requestValidatorExit` | `REQUEST_VALIDATOR_EXIT_ROLE` | a signal, no withdrawal |
| Vault Owner | `triggerValidatorWithdrawals` | `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | full or partial |
| stVaults Committee, Lido DAO | `forceValidatorExit` | `VALIDATOR_EXIT_ROLE` on `VaultHub` | full exits only |

The EIP-7002 fee is paid by whoever sends the request, and the excess is refunded to the recipient given in the call.

## Node Operator

`ejectValidators` compares the sender against the Node Operator address stored in the stVault and reverts with `SenderNotNodeOperator` otherwise. Unlike the Vault Owner's permissions, this one is not a Dashboard role and cannot be delegated.

The call takes public keys and a refund recipient, but no amounts: it always issues full withdrawal requests.

## Vault Owner

The Vault Owner has two instruments, and only the second one moves ETH:

1. **`requestValidatorExit`** emits a `ValidatorExitRequested` event per public key and does nothing else. It costs no fee and enforces nothing: if the Node Operator is not watching for the event, the exit never happens.
2. **`triggerValidatorWithdrawals`** goes to the Consensus Layer directly and works without the Node Operator:
    - an empty amounts array, or an amount of **0**, requests a full exit;
    - a **positive amount** requests a partial withdrawal, and the Consensus Layer keeps at least 32 ETH on the validator.

Partial withdrawals carry three conditions that full exits do not. `VaultHub.triggerValidatorWithdrawals` reverts with `PartialValidatorWithdrawalNotAllowed` unless the report is fresh, the stVault is not in jail, and the stVault has no obligations shortfall. The last condition exists to stop a Vault Owner from filling the withdrawal queue with partial requests to delay the forced exits that would rebalance the stVault.

## stVaults Committee and Lido DAO

Both act through the same on-chain gate — `VALIDATOR_EXIT_ROLE` on `VaultHub` — and under the same restrictions. `forceValidatorExit` requires a fresh report, reverts with `ForcedValidatorExitNotAllowed` unless the stVault has an obligations shortfall at that moment, and always requests full exits.

An **obligations shortfall** means the stVault owes more than the ETH available on its balance. What it owes is the larger of the amount needed to bring the Health Factor back above 100% and the amount needed to cover pending Lido [redemptions](./stvaults-detailed-technical-design.md#2-redemptions), plus unsettled Lido fees once they reach 1 ETH. While the balance covers all of it, forced exits are impossible even for an unhealthy stVault.

The Committee does not hold the role itself; it acts through EasyTrack.

## Related

- [Control validators and withdraw from the Beacon Chain](../vault-owners-curators-and-stakers/basic-stvaults/control-validators.md) — the Vault Owner's step-by-step guide
- [Validators basics](../node-operators/validators-basics.md) — watching for exit requests on the Node Operator side
- [Health monitoring guide](../vault-owners-curators-and-stakers/basic-stvaults/health-monitoring-guide.md) — keeping the stVault out of forced-exit territory
- [Rebalance guide](../vault-owners-curators-and-stakers/basic-stvaults/rebalance-guide.md) — clearing a shortfall before the protocol acts
