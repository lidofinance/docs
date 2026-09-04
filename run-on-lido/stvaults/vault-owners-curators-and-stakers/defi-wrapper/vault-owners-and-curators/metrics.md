---
sidebar_position: 2
title: 'Metrics'
---

# Metrics of stVault with DeFi Wrapper

The stVault under a pool is an ordinary stVault, so every metric on
[stVaults Metrics](../../../concepts-and-reference/metrics.md) applies to it unchanged — Total Value, the
Health Factor, the fee obligations, the performance metrics. This page covers what the DeFi Wrapper adds on
top: the pool's own accounting, each depositor's position inside it, and the withdrawal queue.

## Notation

| Symbol | Meaning |
| --- | --- |
| $TV$ | Total Value of the underlying stVault |
| $RR$, $FRT$ | the vault's Reserve Ratio and Forced Rebalance Threshold, as fractions |
| $RR_{p}$, $FRT_{p}$ | the **pool's** own ratios, as fractions |
| $A$ | assets an account's stv is worth |
| $L_{a}$ | stETH an account has minted, in ETH |
| $R_{stv}$ | the stv rate — assets per stv |

stv carries **27 decimals** against the asset's 18, so rates involving it are scaled by $10^{36}$ on-chain.
Ratios are stored in basis points (`10000` = 100%). The formulas here use fractions and ETH.

$RR_{p}$ and $FRT_{p}$ are the vault's ratios plus a fixed gap, 250 BP in every shipped configuration, which
is what makes the pool force-rebalance an account before the protocol force-rebalances the vault — see
[§3.3](../../../concepts-and-reference/defi-wrapper-technical-design.md#33-stvstethpool).

## Pool state metrics

### Total nominal assets

The vault's Total Value minus the fees it owes. This is the raw number the pool prices stv from, before the
corrections in [Total assets](#total-assets):

$$
\text{nominalAssets} = \max(0,\; TV - \text{unsettledFees} - \text{accruedFee})
$$

### Total assets

What the pool's stv is collectively worth. Two corrections can apply, and only ever one of them, because they
are the same difference measured in opposite directions:

$$
\text{totalAssets} =
\begin{cases}
\text{nominalAssets} + \text{exceedingMintedSteth} & \text{if exceeding} > 0 \\[4pt]
\text{nominalAssets} - \text{unassignedLiabilitySteth} & \text{otherwise}
\end{cases}
$$

Both quantities are defined below, and the mechanics behind them are in
[Unassigned liability and bad debt](../../../concepts-and-reference/defi-wrapper-technical-design.md#unassigned-liability-and-bad-debt) and
[Exceeding minted stETH](../../../concepts-and-reference/defi-wrapper-technical-design.md#exceeding-minted-steth). The plain pool has no minting and therefore only the
second branch.

### stv rate

Assets per stv, the price at which deposits mint and withdrawals settle:

$$
R_{stv} = \frac{\text{totalAssets}}{\text{totalSupply}}
$$

Before any stv is issued the rate starts at 1 ETH per $10^{27}$ stv, which is what fixes the scale and keeps
later conversions exact.

### Total liability shares

The stETH shares the vault owes Lido Core. The pool separately tracks what its own accounts owe **it**, and
normally the two match. When they do not, the gap has a name: **unassigned liability** if the vault owes
more, **exceeding minted stETH** if the pool's records do.

### Unassigned liability

The excess of what the vault owes over what the pool has on record — debt no account is registered as owing.
It arises through bad debt socialization, when the DAO moves uncovered liability onto this vault.

$$
\text{unassignedLiabilityShares} = \max(0,\; \text{totalLiabilityShares} - \text{totalMintedStethShares})
$$

:::warning
While this is above zero, **every** transfer, mint and burn of stv reverts, deposits included. It is checked
inside the ERC-20 hook and no role can override it. Anyone can clear it permissionlessly, either out of the
vault's own assets or with ETH they supply — see
[Unassigned liability and bad debt](../../../concepts-and-reference/defi-wrapper-technical-design.md#unassigned-liability-and-bad-debt).
:::

### Exceeding minted stETH

The same difference the other way round: the pool has more debt on record than the vault owes, which happens
when the vault's liability is repaid without the pool being involved.

$$
\text{exceedingMintedShares} = \max(0,\; \text{totalMintedStethShares} - \text{totalLiabilityShares})
$$

It is a pool-wide budget that accounts settle against first come, first served — see
[Exceeding minted stETH](../../../concepts-and-reference/defi-wrapper-technical-design.md#exceeding-minted-steth).

## Per-account metrics

### Account assets

What an account's stv is worth:

$$
A = \text{stv}_{\text{account}} \times R_{stv}
$$

### Locked assets

What the account must keep to carry the debt it has:

$$
\text{lock}(L_{a}) = \left\lceil \frac{L_{a}}{1 - RR_{p}} \right\rceil
$$

A transfer that would leave the account holding less than this reverts, so the requirement is checked every
time stv leaves an account, not only when the debt is taken on.

### Threshold assets

The same shape at the lower ratio. Below it the account may be force-rebalanced by anyone:

$$
\text{threshold}(L_{a}) = \left\lceil \frac{L_{a}}{1 - FRT_{p}} \right\rceil
$$

The gap between `lock` and `threshold` is the room an account has to lose value before that happens, and it
is thin for an account that mints to its limit.

### Minting capacity

What the account could owe in total against what it holds, and how much of that is still unused:

$$
\begin{aligned}
\text{capacity} &= \left\lfloor A \times (1 - RR_{p}) \right\rfloor \\[2pt]
\text{remaining} &= \max(0,\; \text{capacity} - L_{a})
\end{aligned}
$$

Both are denominated in stETH shares. The remaining capacity can also be evaluated against ETH not yet
deposited, which is what tells a depositor how much a deposit would let them mint.

Rounding always runs against the account — capacity floors, `lock` ceils — so it can never leave a position
short of collateral.

### Account Utilization Ratio

The share of the account's own capacity in use:

$$
UR_{a} = \frac{L_{a}}{\text{capacity}} \times 100\%
$$

### Account Health Factor

How well the account's debt is backed by the assets behind its stv:

$$
HF_{a} = \frac{A \times (1 - FRT_{p})}{L_{a}} \times 100\%
$$

The account is healthy while `HF ≥ 100%`. This is the per-account analogue of the vault's
[Health Factor](../../../concepts-and-reference/metrics.md#health-factor), measured on one account's own
assets and debt. The vault's figure is an aggregate and says nothing about any single account: one account
can be in breach while the vault as a whole is healthy.

### Force-rebalance amount

The stETH shares a force-rebalance would repay out of a breached account's own stv, chosen to land it back
exactly on the pool reserve ratio:

$$
x = \frac{L_{a} - (1 - RR_{p}) \times A_{\text{shares}}}{RR_{p}}
$$

where $A_{\text{shares}}$ is the account's assets expressed in stETH shares. The derivation, and what happens
when the account's stv does not cover its debt, are in
[§3.3](../../../concepts-and-reference/defi-wrapper-technical-design.md#33-stvstethpool).

## Withdrawal queue metrics

### Unfinalized totals

What the queue still owes, counted four ways:

$$
\text{unfinalizedRequests} = \text{lastRequestId} - \text{lastFinalizedRequestId}
$$

`unfinalizedStv`, `unfinalizedStethShares` and `unfinalizedAssets` are the corresponding sums over that range,
each a difference of two cumulative totals stored on the boundary requests.

### ETH free to stake

The part of the vault balance the queue has no claim on — what can go to new validators without leaving
finalization short:

$$
\text{freeToStake} = \max\bigl(0,\; \text{availableBalance} - \text{unfinalizedAssets}\bigr)
$$

Here $\text{availableBalance}$ is the vault's own balance less the ETH already staged for pending validator
activations. At zero, everything sitting on the balance is spoken for by the queue.

### Rate discount

Each finalized batch records a checkpoint holding the stv rate in force. At claim time the request's own
creation rate is compared against it, and the correction runs one way only:

$$
\text{assets}_{\text{discounted}} =
\begin{cases}
\text{stv} \times R_{stv}^{\text{checkpoint}} & \text{if the rate fell} \\[4pt]
\text{assets at creation} & \text{otherwise}
\end{cases}
$$

A request that waited through a loss absorbs its share of it. A request that waited through rewards does not
capture them — those stay with the depositors still in the pool, whose validators were the ones earning. See
[§3.4](../../../concepts-and-reference/defi-wrapper-technical-design.md#34-withdrawalqueue).

### Claimable ETH

What a finalized request pays its owner:

$$
\text{payout} = \text{assets}_{\text{discounted}} - \text{debtSettled} - \text{gasCostCoverage}
$$

where the debt is valued at the checkpoint's stETH share rate. The gas cost coverage is a per-request
deduction that pays whoever finalizes, **0 by default** and capped at 0.0005 ETH. It is taken as
$\min(\text{payout},\ \text{coverage})$, so a request never goes negative.

## Performance and APR

The pool publishes no APR of its own. Performance is a property of the underlying stVault, so the
[performance metrics](../../../concepts-and-reference/metrics.md#performance-metrics) on the main page —
gross staking rewards, Node Operator and Lido fees, Gross and Net staking APR, Carry Spread — describe a
pool's returns too.

The DeFi Wrapper widget shows depositors an APY derived from those. It reads the vault's **Net staking APR**
as a simple moving average from the stVaults API and compounds it daily:

$$
APY = \left(1 + \frac{APR}{365}\right)^{365} - 1
$$

The period is a day because an oracle report updates the vault's value once a day, so each day's rewards
start earning from the next one. That compounding is what makes the APY come out slightly above the APR it
is derived from.

A depositor's own realized return is the growth of the [stv rate](#stv-rate) between two points in time.
