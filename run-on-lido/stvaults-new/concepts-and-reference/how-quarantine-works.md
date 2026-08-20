---
sidebar_position: 10
---

# How Quarantine works

Quarantine is a timelock that [LazyOracle](/contracts/lazy-oracle) applies to a sudden increase in an stVault's reported Total Value when that increase cannot be confirmed on-chain. The excess is held aside for a cooldown period instead of entering Total Value immediately, which gives the protocol time to inspect the growth.

The cooldown is currently **3 days (72 hours)** and the tolerance for unexplained growth is **3.5%**. Both are `LazyOracle` parameters and can be read on-chain: `quarantinePeriod()` and `maxRewardRatioBP()`.

## What triggers quarantine

Every report compares the reported Total Value against what the protocol can already account for:

```
expected   = last accepted Total Value, adjusted for funding and withdrawals since then
threshold  = expected × (1 + maxRewardRatioBP / 10000)   // currently expected × 1.035
```

If the reported Total Value stays at or below the threshold, it is accepted in full. If it exceeds the threshold, the quarantined amount is the whole difference between the reported value and the expected one — not only the part sticking out above the threshold.

This splits operations into two groups:

- **Verifiable on-chain — never quarantined.** Funding the stVault with `fund()` moves ETH through the stVault balance, so the increase is recorded in `inOutDelta` and raises the expected value by the same amount.
- **Not verifiable on-chain — quarantined.** Any increase the protocol cannot match against `inOutDelta`: [consolidations](../node-operators/consolidations.md), side deposits to a validator, deposits that bypass PDG, and ETH sent straight to the `StakingVault` contract instead of through `fund()`.

Ordinary CL and EL rewards fall under the 3.5% tolerance and pass through untouched.

:::warning
The tolerance is relative, so the same amount of ETH may be quarantined in a small stVault and pass freely in a large one. It is also not scaled by time: the 3.5% is per report, not per day, so a long gap between applied reports leaves less headroom for accumulated rewards.
:::

## What quarantine changes

Quarantined ETH is excluded from Total Value: it does not raise the stETH minting capacity, does not improve the Health Factor, and cannot be withdrawn.

:::info
The Node Operator fee is calculated on Total Value **including** the quarantined amount (`NodeOperatorFee.sol`). Growth that the Vault Owner cannot use yet still accrues the fee.
:::

## Recommended flow

Quarantine is driven by oracle reports, not by wall-clock time: it starts when a report that reflects the increase is applied to the stVault, and it ends when a later report is applied. Both are the same `updateVaultData` call described in [Apply oracle reports](../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md), and both are permissionless: the Vault Owner or any third party can send them.

These four steps take an increase through quarantine in the minimum time:

1. **Perform the side operation** — a consolidation, a deposit that bypasses PDG, or anything else that raises validator balances directly.
2. **Wait for the next general oracle report that reflects the new CL balance**, then apply it to the stVault with `updateVaultData`. Quarantine starts at this moment.
3. **Wait 72 hours.**
4. **Apply the next report whose `vaultsDataTimestamp` is at least `startTimestamp + 72 h`.** That call releases the quarantine and the amount becomes part of Total Value.

Nothing releases the quarantine on its own. If step 4 is not sent, the amount stays outside Total Value past the 72 hours.

## Timing details

**Within a report cycle, the exact moment does not matter.** Quarantine starts from the report's `vaultsDataTimestamp`, not from the timestamp of the transaction, so applying a report an hour earlier or later gives the same start. What matters is applying it before the next daily report is published; if that one is missed, the start shifts to the timestamp of the later report and the release moves a day out.

**The end date shown in the interfaces is the earliest possible one.** `vaultQuarantine()` returns `endTimestamp` as `startTimestamp + quarantinePeriod`; both the Web UI and the CLI display exactly that. The actual release happens on the first report applied at or after that point.

**Quarantines do not run in parallel.** An increase arriving while a quarantine is active is queued as `totalValueRemainder` and gets no timer: its 72 hours begin only once the first amount is released. Two side operations a day apart therefore clear in about six days rather than three, while operations that land in the same report cycle share a single quarantine.

## Checking quarantine status

<details>
  <summary>using stVaults Web UI</summary>

      An stVault with an active quarantine carries the **Part of the capital is quarantined** notice on the Overview page, with the total amount held and the earliest date the running part can be released.

</details>
<details>
  <summary>using Command-line Interface</summary>

      ```bash
      yarn start report r by-vault -v <vaultAddress>
      ```

      When a quarantine is active, the command prints a warning and a table with the pending increase, the remainder, and the start and end timestamps. The same check runs before `report w submit`, so submitting a report shows the current state first.

      The protocol-wide parameters — `quarantinePeriod`, `maxRewardRatioBP`, `MAX_QUARANTINE_PERIOD` — are shown by:

      ```bash
      yarn start contracts lazy-oracle r info
      ```

</details>
<details>
  <summary>using Etherscan UI</summary>

      1. Open **Etherscan** and navigate to the **LazyOracle** contract — find its address on the [Environments](./architecture-overview#environments) page.
      2. Call `vaultQuarantine`, passing the stVault address, to see whether a quarantine is active, the amount, and the start and end timestamps. `quarantineValue` returns the total held, including the queued remainder.

</details>

## Related

- [Apply oracle reports](../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md) — how `updateVaultData` works and how to check report freshness
- [Metrics](../vault-owners-curators-and-stakers/basic-stvaults/metrics.md#total-value) — what Total Value includes
- [Consolidations](../node-operators/consolidations.md) — the most common reason for a quarantine
