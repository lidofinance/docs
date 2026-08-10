---
sidebar_position: 6
---

# Rebalance

Rebalancing transfers ETH from the stVault to Lido Core and writes off the same amount of stETH liability at a 1:1 ratio – all in a single transaction. The stETH is not burned — it stays in circulation, now backed by Lido Core instead of your stVault.

The stVault's Total Value and stETH Liability both go down by the rebalanced amount. Since the liability shrinks while the collateral shrinks by the same absolute amount, the reserve improves and so does the [Health Factor](./health-monitoring-guide.md).

## Rebalance or repay?

Both reduce the stETH liability, but they spend different things:

| | Repay (burn) | Rebalance |
| --- | --- | --- |
| What you spend | stETH you acquire externally | ETH from the stVault balance |
| Total Value | unchanged | decreases |
| Future rewards | unchanged | reduced, the stVault has less ETH working |

Repaying is the better option whenever you can get the stETH — see [Supply, withdraw, mint and repay](./supply-withdraw-mint-repay.md). Rebalancing is the fallback when you do not want to buy stETH on the market, and the mechanism the protocol falls back to when a [stVault becomes unhealthy](./health-emergency-guide.md).

## Before you start

- **You need `REBALANCE_ROLE`** — by default the Vault Owner has it; it can be delegated. See [Roles and permissions](./roles-and-permissions.md).
- **A fresh oracle report must be applied.** The call reverts with `VaultReportStale` otherwise. The Web UI handles this for you; via CLI or Etherscan you have to apply the report yourself — see [Apply oracle reports](./apply-oracle-reports.md).
- **The ETH must be on the stVault balance, not on validators.** If most of the stVault's ETH is staked, request validator exits first and wait for the ETH to be swept back.

## How much to rebalance

It depends on what you are trying to achieve:

- **Restore health** — rebalance the shortfall. Read it from `healthShortfallShares` on the `Dashboard` contract: it returns the shares needed to bring the stVault back to a healthy state and cover any pending redemptions, `0` if the stVault is already healthy, and the maximum `uint256` value if rebalancing alone cannot fix the position.
- **Close the stVault** — rebalance the entire stETH liability, which brings it to zero and unlocks the remaining ETH for withdrawal. See [Disconnection](./disconnection.md).

:::note
The stETH liability grows daily with the stETH rebase, so a number you calculated yesterday will be slightly short today. Always read the current value right before executing.
:::

## Doing the rebalance

Two methods are available on the `Dashboard` contract, differing only in how you denominate the amount:

| Method                      | Amount in |
| --------------------------- | --------- |
| `rebalanceVaultWithShares`  | stETH shares |
| `rebalanceVaultWithEther`   | ETH |

`rebalanceVaultWithEther` converts the amount to shares internally, so the ETH actually transferred can differ slightly from what you passed because of rounding. It is also payable: you can supply extra ETH in the same transaction to cover a shortfall the stVault balance cannot.

<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/rebalance`.
2. Enter the amount to rebalance. Utilization ratio, stETH Liability, Health Factor and Total Value are shown as current → projected values, so you can check the outcome before signing.
3. If the stVault balance is not enough, switch on the supply toggle and add the missing ETH — it is funded and rebalanced in the same transaction.

If the oracle report is stale, the UI prepends the report update to the same transaction batch, so there is no separate step for it.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard write rebalance-ether <dashboard_address> <ether>
yarn start contracts dashboard write rebalance-shares <dashboard_address> <shares>
```

To check the shortfall first:

```bash
yarn start contracts dashboard read health-shortfall-shares <dashboard_address>
```

Note that these commands take the **Dashboard** address, not the stVault address, and that `contracts`, `write` and `read` can be shortened to `c`, `w` and `r`.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `healthShortfallShares` to check how many shares are needed to restore health.
3. Call `rebalanceVaultWithEther` or `rebalanceVaultWithShares`, passing the amount **in wei**.

</details>

## Forced rebalancing

If the [stVault becomes unhealthy](./health-emergency-guide.md) and the owner does not act, the protocol restores the position without them.

`forceRebalance` on the `VaultHub` contract is **permissionless** — anyone can call it for an stVault that has an obligations shortfall. It takes **all available ETH on the stVault balance**, up to what is needed to cover the outstanding obligations, and rebalances it.

It also requires a fresh oracle report, and it does not settle Lido fees.

The Web UI exposes this as well. Once an stVault becomes force-rebalanceable, its rebalance page switches into force-rebalance mode: the amount field and the supply toggle disappear, and the submit button works for any connected address — no `REBALANCE_ROLE` needed.

:::warning
Being force-rebalanced is worse than rebalancing yourself: you lose control over how much is rebalanced and when. Monitor the Health Factor and act while it is still above 100% — see the [Health monitoring guide](./health-monitoring-guide.md) and the [Health emergency guide](./health-emergency-guide.md).
:::
