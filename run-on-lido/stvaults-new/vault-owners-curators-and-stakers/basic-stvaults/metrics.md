---
sidebar_position: 2
---

# Metrics

This page defines every stVault metric and gives the formula behind it.

The metrics fall into two families:

- **State metrics** describe the stVault right now. They are derived from the latest oracle report plus the on-chain flows since that report, and every one of them can be read from the [`Dashboard`](/contracts/dashboard) contract.
- **Performance metrics** describe what happened between two oracle reports. They are computed off-chain from consecutive reports by the Web UI and the [CLI](https://lidofinance.github.io/lido-staking-vault-cli/metrics-calculation).

### Notation

Formulas below use these short names:

| Symbol | Meaning |
| --- | --- |
| $TV$ | Total Value |
| $L$ | stETH Liability, in ETH |
| $RR$ | Reserve Ratio, as a fraction |
| $FRT$ | Forced Rebalance Threshold, as a fraction |
| $MR$ | Minimal Reserve |
| $\text{unsettledFees}$ | unsettled Lido fees |
| $\text{accruedFee}$ | undisbursed Node Operator fee |
| $\text{periodSeconds}$ | length of the report period, in seconds |
| $\text{secondsInYear}$ | 31,536,000 — the annualization constant (365 days) |

On-chain the ratios are stored in basis points (`10000` = 100%), and share amounts are converted with the stETH share rate. The formulas here use fractions and ETH for readability.

## stVault parameters

### Reserve Ratio

Defines the share of the collateral that is reserved when the Vault Owner mints stETH. stETH isn't minted for this amount. Set by the Tier the stVault belongs to.

### Forced Rebalance Threshold

Defines the minimum allowed ratio of Total Value to stETH Liability. Crossing it makes the stVault subject to [forced rebalancing](./rebalance-guide.md). Always lower than the Reserve Ratio.

### Minimal Reserve

The amount of ETH that is always reserved in the stVault regardless of Total Value. 1 ETH by default, and may be increased in response to a correlated slashing event according to the [Risk management framework](https://research.lido.fi/t/risk-assessment-framework-for-stvaults/9978/4).

### stETH minting limit

Absolute maximum for the minting capacity, defined by the stVault's Tier. Changing it requires changing the Tier.

### Node Operator fee

The share of the gross staking rewards that the Node Operator charges for providing validation services. Stored as `feeRate` in basis points, and changing it requires confirmation from both the Vault Owner and the Node Operator Manager — see [Roles and permissions](./roles-and-permissions.md).

## State metrics

### Total Value

The total amount of ETH attributed to the stVault. It splits into ETH deposited to validators and ETH held on the stVault balance, and rewards accrue to both:

$$
TV = \text{staked} + \text{notStaked}
$$

Between reports it is the last reported value adjusted by the net flows that happened since:

$$
TV = TV_{\text{report}} + \text{inOutDelta}_{\text{now}} - \text{inOutDelta}_{\text{report}}
$$

### Not Staked stVault Balance

ETH held on the stVault contract balance and not deposited to validators, and therefore not earning rewards. ETH staged for pending validator activations is excluded.

$$
\text{notStaked} = \text{stVault balance} - \text{staged}
$$

### stETH Liability

The amount of stETH the Vault Owner minted in the stVault, backed by the ETH collateral. Stored in shares, so its ETH value increases daily with the stETH rebase:

$$
L = \text{liabilityShares} \times \text{shareRate}
$$

### Undisbursed Node Operator fee

Accumulated but not yet disbursed Node Operator fee. Increases the total locked ETH.

$$
\begin{aligned}
\text{growth} &= TV_{\text{report}} + \text{quarantined} - \text{inOutDelta}_{\text{report}} \\[2pt]
\text{accruedFee} &= \max\bigl(0,\; (\text{growth} - \text{settledGrowth}) \times \text{feeRate}\bigr)
\end{aligned}
$$

Growth is the value the stVault gained on its own, as opposed to the ETH that was supplied into it. Two details matter here: it is measured from the **latest oracle report**, not from the live Total Value, and it **includes value still held in quarantine** — the fee accrues on quarantined value too.

$\text{settledGrowth}$ is the high-water mark of growth already accounted for: it moves up whenever the fee is disbursed, and also when an amount is explicitly exempted from the fee base. Because of the $\max(0, \dots)$, a drop in stVault value accrues no new fee until the growth exceeds that mark again — the Node Operator is not paid twice for recovering the same value.

### Unsettled Lido fees

Accumulated but not yet settled Lido fees. Increases the total locked ETH. The Lido fee is charged on every oracle report and consists of the infrastructure fee, the liquidity fee and the reservation liquidity fee.

$$
\text{unsettledFees} = \text{cumulativeLidoFees} - \text{settledLidoFees}
$$

### Locked by fees obligations (unsettled fees)

ETH locked in the stVault because of the undisbursed Node Operator fee and unsettled Lido fees.

$$
\text{feeObligation} = \text{accruedFee} + \text{unsettledFees}
$$

### Reserve

The part of the collateral that is reserved when minting and for which stETH isn't minted. It is capped by the value the stVault has on top of its liability:

$$
\text{reserve} = \min\Bigl(TV - L,\; \frac{L \times RR}{1 - RR}\Bigr)
$$

### Collateral

The ETH locked to cover the stETH liability under the Reserve Ratio, or to maintain the connection to Lido Core.

$$
\text{collateral} = L + \max(\text{reserve},\; MR)
$$

:::note
The liability used here is the **maximum** liability observed during the current report period, not the current one. Minting and then repaying within the same period does not release the collateral until the next report.
:::

### Total Lock

The total amount of ETH locked in the stVault: the collateral plus everything the stVault owes in fees.

$$
\text{totalLock} = \text{collateral} + \text{accruedFee} + \text{unsettledFees}
$$

### Pending unlock

ETH eligible for unlocking after stETH was repaid, but still awaiting confirmation from the next oracle report. It is the gap between the liability the collateral is still sized for and the liability that remains:

$$
\text{pendingUnlock} = \max(0,\; L_{\max} - L)
$$

where $L_{\max}$ is the maximum liability observed during the current report period.

### Total stETH minting capacity

The amount of stETH the Vault Owner can mint within the Reserve Ratio boundaries, respecting the Minimal Reserve:

$$
\begin{aligned}
\text{maxLockable} &= \max(0,\; TV - \text{unsettledFees} - \text{accruedFee}) \\[2pt]
\text{capacity} &= \max\bigl(0,\; \text{maxLockable} - \max(MR,\; \text{maxLockable} \times RR)\bigr)
\end{aligned}
$$

On-chain the capacity is denominated in shares, not in ETH.

It can additionally be capped by:

- the stVault's personal stETH minting limit;
- the Tier remaining capacity;
- the Node Operator remaining capacity;
- the total stVaults remaining capacity;
- Lido Core staking rate limits ([learn more](/guides/lido-tokens-integration-guide/#staking-rate-limits)).

### Remaining stETH minting capacity

How much more stETH can still be minted:

$$
\text{remaining} = \max(0,\; \text{capacity} - L)
$$

### Utilization Ratio

The share of the minting capacity currently used:

$$
UR = \frac{L}{\text{capacity}} \times 100\%
$$

At 100% no further stETH can be minted. Above 100% the stVault is at or beyond its intended liability limit and approaches the forced rebalancing zone.

### Health Factor

Shows how well the stETH Liability is backed by the Total Value. The primary indicator of stVault health:

$$
HF = \frac{TV \times (1 - FRT)}{L} \times 100\%
$$

The stVault is healthy while `HF ≥ 100%`. Below that it becomes subject to [forced rebalancing](./rebalance-guide.md). See the [Health monitoring guide](./health-monitoring-guide.md) for the risk bands used in the Web UI.

### Available to withdraw

ETH that can be withdrawn from the stVault balance right now. It is the lower of what is liquid and what is unlocked, reduced by the fees the stVault owes:

$$
\begin{aligned}
\text{liquid} &= \min(\text{stVault balance} - \text{staged},\; TV) - \text{lidoRedemptions} \\[2pt]
\text{unlocked} &= \max(0,\; TV - \text{collateral}) \\[2pt]
\text{available} &= \max\bigl(0,\; \min(\text{liquid},\; \text{unlocked}) - \text{unsettledFees} - \text{accruedFee}\bigr)
\end{aligned}
$$

While the stVault is pending disconnection, nothing is withdrawable.

## Lido Core reference metrics

### Lido Core APR

Gross annualized rewards earned by validators in Lido Core, **before** the protocol fee is taken. This is the rate the Lido fee components are charged against.

### stETH APR

What an stETH holder receives: the Lido Core APR **net** of the Lido protocol fee, currently 10% of staking rewards.

The fee is collected by minting new shares, so this return is exactly the growth of the stETH share rate:

$$
APR_{\text{stETH}} = \frac{\text{shareRate}_{curr} - \text{shareRate}_{prev}}{\text{shareRate}_{prev}} \times \frac{\text{secondsInYear}}{\text{periodSeconds}} \times 100\%
$$

This is the benchmark to compare the stVault's own [Net staking APR](#net-staking-apr) against: if the stVault earns less than plain stETH after fees, its configuration or performance needs a review. See [Last Lido APR for stETH](/integrations/api#last-lido-apr-for-steth) for the canonical calculation.

### Node Operator fee at Lido Core

The average share of staking rewards that Lido Core Node Operators receive for providing validation services.

## Performance metrics

These are computed between two consecutive oracle reports. `prev` and `curr` denote the opening and closing report of the period.

### Gross staking rewards

The ETH earned by validators — the increase in Total Value with ETH inflows and outflows excluded:

$$
\text{grossStakingRewards} = (TV_{curr} - TV_{prev}) - (\text{inOutDelta}_{curr} - \text{inOutDelta}_{prev})
$$

:::note
Any change in stVault value not captured by `inOutDelta` is currently counted as staking rewards. Slashing penalties and other stVault-level ETH movements therefore land in this metric rather than being tracked separately.
:::

### Node Operator rewards

The ETH payable to the Node Operator as its fee — its share of the gross staking rewards.

Because the Node Operator can disburse the fee at any moment, the period fee is computed from a claim-invariant helper rather than from the balance:

$$
\begin{aligned}
\text{noEarnings}(T) &= \underbrace{\text{settledGrowth}(T) \times \text{feeRate}}_{\text{already disbursed}} + \underbrace{\text{accruedFee}(T)}_{\text{owed, not yet taken}} \\[4pt]
\text{nodeOperatorFee} &= \text{noEarnings}(curr) - \text{noEarnings}(prev)
\end{aligned}
$$

The two terms do not overlap: $\text{accruedFee}$ *subtracts* the settled mark rather than including it, so together they add up to everything the Node Operator has earned over the stVault's lifetime, taken or not.

### Lido fees

The Lido protocol fee for the period, tracked as a running cumulative sum in the report:

$$
\text{lidoFees} = \text{fee}_{curr} - \text{fee}_{prev}
$$

The Lido fee is the sum of three components `infraFee + liquidityFee + reservationFee`, each charged on a different base.

#### Infrastructure fee

Charged for using the stVaults infrastructure, calculated from Total Value:

$$
\text{infraFee} = TV \times APR_{\text{Lido Core}} \times \text{infraFeeRate}
$$

#### Liquidity fee

Charged for actual liquidity usage, calculated from the stETH Liability:

$$
\text{liquidityFee} = L \times APR_{\text{Lido Core}} \times \text{liquidityFeeRate}
$$

#### Reservation liquidity fee

Charged for liquidity on demand, calculated from the stETH minting capacity:

$$
\text{reservationFee} = \text{capacity} \times APR_{\text{Lido Core}} \times \text{reservationFeeRate}
$$

### Net staking rewards

What remains of the staking rewards after both fees:

$$
\text{netStakingRewards} = \text{grossStakingRewards} - \text{nodeOperatorFee} - \text{lidoFees}
$$

### stETH rebase

The growth of the stETH liability caused by the stETH rebase. The liability grows at exactly the [stETH APR](#steth-apr) — both are the same share rate growth, one expressed in ETH and the other as a percentage.

Only the shares held at the **start** of the period are counted, which keeps the metric comparable to the APR figures:

$$
\text{rebaseCost} = \text{liabilityShares}_{prev} \times (\text{shareRate}_{curr} - \text{shareRate}_{prev})
$$

### stVault bottom line

The final result for the Vault Owner inside the stVault perimeter — net staking rewards after the stETH liability growth:

$$
\text{bottomLine} = \text{netStakingRewards} - \text{rebaseCost}
$$

A negative bottom line means the stETH liability grew faster than the stVault earned, which is common while new validators sit in the activation queue.

### APR metrics

All three annualize a period result against the opening Total Value:

$$
APR = \frac{\text{numerator}}{TV_{prev}} \times \frac{\text{secondsInYear}}{\text{periodSeconds}} \times 100\%
$$

They differ only in the numerator.

:::note
The denominator is the Total Value at the **start** of the period, so ETH supplied mid-period is not reflected in it. A large deposit therefore produces a one-period spike or dip in all three APR figures, which levels out in the next period.
:::

#### Gross staking APR

Validator rewards expressed as a yearly percentage of Total Value, before any fee deductions.

$$
APR_{\text{gross}} = \frac{\text{grossStakingRewards}}{TV_{prev}} \times \frac{\text{secondsInYear}}{\text{periodSeconds}} \times 100\%
$$

#### Net staking APR

Estimated yearly return after fees, but without the stETH liability growth from the rebase.

$$
APR_{\text{net}} = \frac{\text{netStakingRewards}}{TV_{prev}} \times \frac{\text{secondsInYear}}{\text{periodSeconds}} \times 100\%
$$

#### Carry Spread

Estimated yearly return after both fees and stETH liability growth.

$$
\text{carrySpread} = \frac{\text{bottomLine}}{TV_{prev}} \times \frac{\text{secondsInYear}}{\text{periodSeconds}} \times 100\%
$$

Carry Spread is the Health Factor trend indicator: a positive spread raises the Health Factor, a negative one lowers it.

## Restoring an unhealthy stVault

Three metrics show how much of each corrective action is needed to bring the Utilization Ratio back to 100%. See the [Health emergency guide](./health-emergency-guide.md) for a worked comparison.

### ETH to rebalance

The ETH to send from the stVault balance to Lido Core, writing off the same stETH liability 1:1:

$$
\text{ETH to rebalance} = \frac{L - (1 - RR) \times TV}{RR}
$$

The shortfall is zero while the stVault is healthy. If the liability already exceeds Total Value, rebalancing alone cannot fix the position and the stVault is considered to have bad debt.

### stETH to repay

The stETH to acquire externally and repay, which reduces the liability without touching Total Value:

$$
\text{repay} = \max\bigl(0,\; L - (TV - \text{feeObligation}) \times (1 - RR)\bigr)
$$

### ETH to supply

The ETH to add to the stVault, which raises Total Value without touching the liability:

$$
\text{supply} = \frac{\text{repay}}{1 - RR}
$$

## Related

- [Health monitoring guide](./health-monitoring-guide.md) — which of these to watch and how often
- [CLI metrics calculation reference](https://lidofinance.github.io/lido-staking-vault-cli/metrics-calculation) — the off-chain methodology in full
