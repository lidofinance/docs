---
sidebar_position: 8
---

# ⚡ Penalties

CMv2 uses a bond-based penalty system. When your validators underperform or violate protocol rules, the protocol deducts from your bond. Repeated or severe violations can reduce your stake allocation or result in removal from the module.

## Penalty types

### General delayed penalty

Reported manually by the CMC in case of EL stealing (MEV, priority fees), underperformance, or in other cases of protocol rule violations that are not reported automatically.

A **General delayed penalty** consists of the charge to cover the violation and a fixed additional fine. The penalty amount plus the fixed fine is locked from the sub-NO's bond when the penalty is reported. The fixed fine is 0.1 ETH for the PO type and 0.05 ETH for all the others.

Once the Curated Module Committee (CMC) reports the violation, the amount required to compensate for it, together with the additional fixed fine, is locked from the sub-NO's bond. From there 3 outcomes are possible:

- The Node Operator compensates the penalty, and the locked bond is released.
- The Node Operator does NOT compensate, and the CMC initiates an EasyTrack motion to burn the locked bond.
- If neither side acts, the Node Operator will be able to unlock the bond after 60 days.

### Late exit penalty

Applied automatically when a validator is not exited within the allowed time after an exit request. The allowed exit delay is 4 days (i.e., 96 hours) for all types according to the [Validator Exits Standard NO Protocol](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md).

The **late exit penalty** charged at withdrawal for a 2,048 ETH validator is 0.64 ETH for PO and 0.32 ETH for all other types. This charge can be reduced linearly if the validator's balance is below 2,048.

### Slashing penalty

Applied manually by the CMC when one of your validators is slashed on the consensus layer. The CMC proposes the bond deduction via an EasyTrack motion after the slashing is finalized and losses can be calculated.

## How penalties are applied

Most penalties are applied at the time of validator withdrawal. This means your bond is not reduced the moment a penalty is recorded. The deduction happens when the validator exits.

The only exception is the General Delayed Penalty. Once reported, the penalty amount plus a fixed fee is immediately locked in `Accounting.sol`. If not compensated before the EasyTrack motion executes, the locked bond is burned permanently. If available bond is insufficient, the uncovered amount is recorded as bond debt.

To unlock locked bond, go to the **Bond & Rewards** section in the CMv2 widget and open the Unlock Bond tab. For more details, see [Bond & Key Management](/run-on-lido/cm-v2/bond-and-key-management).

## Strike system

:::info
The strike system is planned for Phase 2 (expected Q4 2026) and is not active in Phase 1.
:::

- CMv2 Phase 2 will introduce a strike-based accountability system. Strikes apply at the sub-Node Operator level, not per key as in [CSM](/staking-modules/csm/penalties#bad-performance-strikes).
- Strikes are recorded for repeated misbehavior: poor performance, repeated delayed exits, and policy violations.
- Accumulated strikes progressively reduce your allocation weight.
- Enough strikes can result in ejection from the Curated Module.
