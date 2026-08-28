---
sidebar_position: 6
---

# 🙋‍♂️ F.A.Q.


<details>
<summary>Can I mint stETH before my validator is active?</summary>

Yes. You can mint stETH right after supplying ETH to your stVault — you don't need an active validator, or even a validator at all, to mint.

The nuance shows up on the other side: once you've minted, how you deposit that ETH to a validator depends on the deposit method, because minted ETH is locked as collateral and can no longer be withdrawn from the vault.

- The [**full PDG flow**](./node-operators/basic-stvaults/pdg#full-cycle-trustless-path-through-pdg) deposits directly from the stVault Balance without withdrawing ETH first, so this way stays available even when your minting capacity is fully utilized.
- The [**PDG shortcut**](./node-operators/basic-stvaults/pdg#pdg-shortcut) works by withdrawing ETH from the vault and side-depositing it to the validator — which isn't possible once that ETH is locked as collateral for minted stETH.

This also affects whether **Ongoing Deposits** — ETH already sent to a validator but still sitting in the beacon chain activation queue — count toward your minting capacity:

**Ongoing Deposits = Top-ups and initial PDG deposits + Off-Book Deposits**

- **Top-ups and initial PDG deposits** are counted by the Oracle as part of stVault [Total Value](./concepts-and-reference/metrics.md#total-value) right away. This covers top-ups to an already active validator, and initial deposits made through the full PDG flow — PDG guarantees the deposit, so the Oracle can prove and count it before the validator is even active.
- **Off-Book Deposits** are validator deposits not yet included in Total Value. This includes deposits made via the PDG shortcut (unguaranteed deposits), and initial deposits made directly to a validator outside of the stVault. These only count once the validator is activated and its balance is proven by the Oracle.

So minting against queued ETH works as long as it went in as a top-up or through the full PDG flow — but not for off-book deposits, which stay outside Total Value until the validator goes live.

The technical details are explained in the [Predeposit Guarantee guide](./node-operators/basic-stvaults/pdg.md).
</details>

<details>
<summary>Does fee settlement impact stETH Minting Capacity or Liability?</summary>

No. Settling Node Operator or Lido fees changes neither your stETH Minting Capacity nor your stETH Liability.
 
This is because undisbursed fees are already subtracted from Total Value before the [Reserve Ratio](./concepts-and-reference/metrics.md) is applied — whether or not they've been paid out yet:
 
In simplified terms, stETH Minting Capacity can be calculated as:
```
stETH minting capacity =
(Total Value − undisbursed Node Operator fees − unsettled Lido fees) × (1 − Reserve Ratio)
```
*For the exact calculation, including Minimal Reserve and other constraints, see the [stETH Minting Capacity formula](./concepts-and-reference/metrics.md#total-steth-minting-capacity).*

Example:
- Total Value = 100 ETH
- Reserve Ratio = 5%
- Undisbursed Node Operator fees = 1 ETH
- Unsettled Lido fees = 1 ETH
```
stETH minting capacity = (100 − 1 − 1) × (1 − 5%) = 93.1 stETH
```
 
While these fees remain part of stVault Total Value (i.e. not yet paid out), that ETH still participates in validation — so it keeps contributing to capital efficiency even though it's already excluded from your minting capacity.
 
Now settle 1 ETH of fees: that ETH leaves the stVault balance, and Total Value drops by the same amount:
 
```
stETH minting capacity = (99 − 1) × (1 − 5%) = 93.1 stETH
```
 
The result is identical — the fee amount was already excluded from the calculation before settlement. That's why paying out fees has no effect on either metric.

</details>