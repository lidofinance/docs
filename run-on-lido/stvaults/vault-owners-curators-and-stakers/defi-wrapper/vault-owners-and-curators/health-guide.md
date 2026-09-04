---
sidebar_position: 3
title: 'Health and Rebalance'
---

# Health and Rebalance for stVault with DeFi Wrapper

The key stVault metrics that the Vault Owner should monitor and control are:

- **Utilization Ratio** — the share of the stETH minting capacity currently used by the Vault Owner. [Learn more](../../../concepts-and-reference/metrics.md#utilization-ratio)
- **Health Factor** — a metric that reflects the economic state of the vault. It shows how the stETH liability is collateralized by the Total Value. A Health Factor of 100% corresponds to the Forced Rebalance Threshold, meaning that if the Health Factor falls below 100%, the stVault becomes subject to forced rebalancing. [Learn more](../../../concepts-and-reference/metrics.md#health-factor)

Read more:

- [Health Monitoring Guide](../../basic-stvaults/health-monitoring-guide.md)
- [Health Emergency Guide](../../basic-stvaults/health-emergency-guide.md)

The Health Factor metric may decrease as a result of validator underperformance, penalties, or a slashing event.

If this happens, there are three main options available:

- Supply ETH to increase Total Value.
- Repay stETH to reduce stETH liability.
- Rebalance ETH (optionally combined with a supply in a single transaction).

**Rebalancing** involves transferring available ETH from the stVault balance to Lido Core, receiving stETH at a 1:1 ratio, and repaying it back to the stVault. This reduces stETH liability and thereby increases the Health Factor.

Rebalancing is performed in one transaction.

The amount of ETH required for rebalancing to bring the Utilization Ratio to 100% depends on the current Health Factor and Reserve Ratio. It can be pre-calculated manually using the formula, or via the built-in methods.

<details>
  <summary>by Formula</summary>

      ETH for rebalance = (stETH Liability − (1 − Reserve Ratio) × Total Value) / Reserve Ratio

</details>

<details>
  <summary>by Command-line Interface</summary>

      See the [CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/) for rebalance commands.

</details>

<details>
  <summary>using Etherscan UI</summary>

      1. Open **Etherscan** and navigate to the **VaultHub** contract by its address (available in the stVaults contract addresses list, see [Environments](../../../concepts-and-reference/architecture-overview#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Read as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the method `healthShortfallShares` in the list, fill out the input with the `vault` contract address, and click **Query**.
      6. Receive the result right under the submit button.
</details>
