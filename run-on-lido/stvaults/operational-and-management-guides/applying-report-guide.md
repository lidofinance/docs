---
sidebar_position: 5
---

# 📊 Applying Report Guide

Before minting stETH or performing other operations that depend on current vault state, the protocol needs to ensure that you are working with the latest available data. [LazyOracle](/contracts/lazy-oracle) allows anyone to apply the latest report to a specific vault on demand.

## Why apply a fresh report?

Your stVault's state (total value, mintable stETH capacity, health factor) is updated through oracle reports. These reports are published periodically, but applying them to your specific vault is a separate, permissionless action. Fresh data is required for:

- minting stETH,
- withdrawing ETH,
- rebalancing,
- changing tiers,
- resuming beacon deposits,
- partial validator withdrawals,
- settling Lido fees,
- disconnecting the vault.

:::info
Many vault operations (except funding and burning shares) will revert if the report is stale. When you are not sure why your operation reverts, apply a fresh report first.
:::

## How it works

1. The [AccountingOracle](/contracts/accounting-oracle) publishes a Merkle tree root containing data for all vaults
2. You get your vault's data and proof from IPFS using the published CID
3. You submit the data and proof to the [LazyOracle](/contracts/lazy-oracle) contract
4. [LazyOracle](/contracts/lazy-oracle) verifies the proof and updates your vault's state in [VaultHub](/contracts/vault-hub).

This is a **permissionless operation** — anyone can apply a report to any vault.

<details>
  <summary>using stVaults Web UI</summary>

      The Web UI automatically applies fresh reports when needed before executing operations like minting, repaying, or tier changes. No manual action is required in most cases.

      The report status is displayed at the top of the vault overview page, showing the last update timestamp and a link to view the oracle report on IPFS.

      ![Oracle report](/img/stvaults/guide-basic-stvault/guide_1_src_10.png)

      In certain situations (such as when deposits are restricted due to accumulated fees, or when the vault is pending disconnection), an "Apply the latest Oracle report" button will appear in the relevant warning banner if a newer report is available.

</details>
<details>
  <summary>using Command-line Interface</summary>

      Apply the latest report to your vault:

      ```bash
      yarn start report w submit -v <vaultAddress>
      ```
      The CLI automatically:

      - fetches the latest report CID from LazyOracle,
      - retrieves the Merkle tree from IPFS,
      - generates the proof for your vault,
      - submits the transaction.

</details>
<details>
  <summary>using Etherscan UI</summary>

      Applying a report via Etherscan requires manually fetching the proof data from IPFS. For most users, the CLI or Web UI is recommended.

      1. Query the **LazyOracle** contract's `latestReportData()` method to get the current `reportCid`.
      2. Fetch the Merkle tree JSON from IPFS using the CID: `https://ipfs.io/ipfs/<reportCid>`
      3. Locate your vault's entry in the tree and copy the data.
      4. Open **Etherscan** and navigate to the **LazyOracle** contract by its address (available in the stVaults contract addresses list, see [Basic stVault with optional liquidity: Environments](../building-guides/basic-stvault#environments)).
      5. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      6. Open the **Contract** tab → **Write as Proxy**.
      7. Click **Connect to Web3** and connect your wallet in the dialog window.
      8. Find the `updateVaultData` method in the list, fill out the fields with the data from IPFS, and click **Write**.
      9. Sign the transaction in your wallet.
      10. Click **View your transaction** and wait for it to be executed.

</details>

## Checking report freshness

You can check when your vault's report was last updated:

<details>
  <summary>using Command-line Interface</summary>

      ```bash
      yarn start vo r info -v <vaultAddress>
      ```
      This displays the vault's current metrics including the last report timestamp.

</details>
<details>
  <summary>using Etherscan UI</summary>

      1. Open **Etherscan** and navigate to the **LazyOracle** contract.
      2. Go to the **Contract** tab → **Read as Proxy**.
      3. Find the `latestReportTimestamp` method and click **Query** to see when the latest report was published.
      4. Find the `vaultInfo` method, enter your vault address, and click **Query** to see your vault's current on-chain metrics.

</details>

:::info
You can use any online UNIX timestamp converter to get the human readable datetime format.
:::
