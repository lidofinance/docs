---
sidebar_position: 10
---

# Covering Redemptions with stETH Liquidity

An ETP/ETF product (or any other product with a similar mechanic) built on an stVault can pay out redemption requests without waiting on the validator exit queue. Minting stETH against the stVault's staked ETH turns part of an otherwise illiquid position into cash on demand, via the stETH secondary market instead of the beacon chain.

This guide covers the full cycle: minting to cover a redemption, and then clearing the stETH Liability that minting creates.

![Redemptions coverage scenarios](/img/stvaults/redemptions.jpg)

## Prerequisites

- **`MINT_ROLE` is required** — by default the Vault Owner has it; it can be delegated. See [Roles and permissions](../../concepts-and-reference/roles-and-permissions.md#vault-owners-delegatable-permissions-sub-roles).
- **A fresh oracle report must be applied.** Minting reverts otherwise — see [Apply oracle reports](./apply-oracle-reports.md).
- **Minting capacity must cover the redemption.** Minting is only possible within the stVault's [stETH minting capacity](../../concepts-and-reference/metrics.md#total-steth-minting-capacity).

## Step 1: Mint stETH to cover the redemption

Mint an amount of stETH equal to the redemption request — see [Mint stETH](./supply-withdraw-mint-repay.md#mint-steth) for the available methods (`mintShares`, `mintStETH`, `mintWstETH`). Each method takes a recipient address, which is what makes both paths below possible.

Which path applies depends on whether the Vault Owner can hold stETH on its own balance sheet.

### If the Vault Owner can hold stETH

1. **Mint** to the Vault Owner's own address.
2. **Swap** the minted stETH for ETH or for USDT/USDC on the secondary market, depending on what the redemption is denominated in.
3. **Settle the redemption** — send the proceeds to the client and close the request in your registrar system.

### If the Vault Owner cannot hold stETH (regulatory restrictions)

1. **Mint** directly to the counterparty's address — for example, a market maker with a standing agreement. Because the mint methods take a recipient address, the stETH never touches the Vault Owner's own balance sheet.
2. **Swap** — the counterparty converts the stETH to ETH or to USDT/USDC per the agreement.
3. **Settle the redemption** — the proceeds are routed to the client and the request is closed.

:::note
This path depends entirely on a prior commercial agreement with the counterparty (mint recipient, swap terms, settlement timing). Lido has no visibility into or role in that agreement — it only sees the mint transaction and its recipient.
:::

At this point the redemption is paid out, and the stVault carries a stETH Liability equal to the minted amount. The rest of this guide covers clearing it.

## Step 2: Clear the resulting stETH Liability

There are two ways to bring the stETH Liability back to zero — see [Rebalance or repay?](./rebalance.md#rebalance-or-repay) for the general trade-off. In the redemption context, they map to two situations:

| | Option A — Repay | Option B — Rebalance |
| --- | --- | --- |
| When to use | New client ETH arrives before the next redemption cycle | No new deposits are coming, or the liability needs to be cleared now |
| What is spent | stETH staked from new client deposits | ETH from the stVault's own validators |
| Total Value | unchanged | decreases |
| Future rewards | unchanged | reduced — the stVault has less ETH working |

### Option A — Repay with new client deposits

1. When clients bring in new ETH, **stake** it through Lido Core to receive stETH 1:1, or **swap** it to stETH on a secondary market.
2. **Repay** that stETH to the stVault — see [Repay (burn) stETH](./supply-withdraw-mint-repay.md#repay-burn-steth). This burns the stETH and reduces the stETH Liability by the same amount.

This is the better option economically whenever it's available — it doesn't touch the stVault's Total Value or reduce future staking rewards.

:::note
Approve the `Dashboard` contract for the stETH before repaying, and remember the ETH freed up by the repayment only becomes withdrawable after the next oracle report confirms it. The stVaults Web UI handles both automatically.
:::

### Option B — Rebalance using validator ETH

Use this when no new client ETH is expected in time, or the liability needs to be cleared as soon as possible.

1. **Check the stVault balance** against the stETH Liability. If the balance isn't enough, request a partial withdrawal from validators — stVaults use 0x02 withdrawal credentials, so this doesn't require a full validator exit.
2. **Wait for the sweep** — the withdrawn ETH lands back on the stVault balance.
3. **Rebalance** — see [Rebalance](./rebalance.md). This moves the ETH to Lido Core and writes off the same amount of stETH Liability 1:1 — all in one transaction.