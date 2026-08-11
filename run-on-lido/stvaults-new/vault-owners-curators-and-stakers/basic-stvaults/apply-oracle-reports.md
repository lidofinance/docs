---
sidebar_position: 9
---

# Apply oracle reports

Before minting stETH or performing other operations that depend on current stVault state, the protocol needs to ensure that you are working with the latest available data. [LazyOracle](/contracts/lazy-oracle) allows anyone to apply the latest report to a specific stVault on demand.

## Why apply a fresh report?

Your stVault's state (total value, mintable stETH capacity, health factor) is updated through oracle reports. These reports are published periodically, but applying them to your specific stVault is a separate, permissionless action. Fresh data is required for:

- minting stETH,
- withdrawing ETH,
- rebalancing,
- changing tiers,
- resuming beacon deposits,
- partial validator withdrawals,
- settling Lido fees,
- disconnecting the stVault.

:::info
Many stVault operations (except funding and burning shares) will revert if the report is stale. When you are not sure why your operation reverts, apply a fresh report first.
:::

## How it works

1. The [AccountingOracle](/contracts/accounting-oracle) publishes a Merkle tree root containing data for all stVaults
2. You get your stVault's data and proof from IPFS using the published CID
3. You submit the data and proof to the [LazyOracle](/contracts/lazy-oracle) contract
4. [LazyOracle](/contracts/lazy-oracle) verifies the proof and updates your stVault's state in [VaultHub](/contracts/vault-hub).

This is a **permissionless operation** — anyone can apply a report to any stVault.

<details>
  <summary>using stVaults Web UI</summary>

      The Web UI applies a fresh report automatically whenever an operation needs one — supplying, withdrawing, minting, repaying, rebalancing, disbursing the fee, tier changes and validator operations all prepend the report update to the same transaction batch. No manual action is required in most cases.

      The report status is shown in the navigation, next to the current stVault address: **Oracle report up to date** or **Oracle report outdated**. The question mark next to it opens the details — the timestamp of the last report, a link to view it on IPFS, and, while the report is stale, an **Apply fresh report** button to submit it manually.

      ![Oracle report](/img/stvaults/guide-basic-stvault/guide_1_src_10.png)

      The banner shown for an stVault pending disconnection carries its own **Apply the latest Oracle report** button.

</details>
<details>
  <summary>using Command-line Interface</summary>

      Apply the latest report to your stVault:

      ```bash
      yarn start report w submit -v <vaultAddress>
      ```
      The CLI automatically:

      - fetches the latest report CID from LazyOracle,
      - retrieves the Merkle tree from IPFS,
      - generates the proof for your stVault,
      - submits the transaction.

</details>
<details>
  <summary>using Etherscan UI</summary>

      Applying a report via Etherscan requires manually fetching the proof data from IPFS. For most users, the CLI or Web UI is recommended.

      1. Open **Etherscan** and navigate to the **LazyOracle** contract — find its address on the [Environments](../../concepts-and-reference/integration-overview#stvaults-environments) page.
      2. Call `latestReportData` to get the current `reportCid`.
      3. Fetch the Merkle tree JSON from IPFS: `https://ipfs.io/ipfs/<reportCid>`
      4. Locate your stVault's entry in the tree and copy its values and proof.
      5. Call `updateVaultData`, passing the stVault address, the values from the tree and the proof.

</details>

## Checking report freshness

You can check when your stVault's report was last updated:

<details>
  <summary>using Command-line Interface</summary>

      ```bash
      yarn start vo r info -v <vaultAddress>
      ```
      This displays the stVault's current metrics including the last report timestamp.

</details>
<details>
  <summary>using Etherscan UI</summary>

      1. Open **Etherscan** and navigate to the **LazyOracle** contract — find its address on the [Environments](../../concepts-and-reference/integration-overview#stvaults-environments) page.
      2. Call `latestReportTimestamp` to see when the latest report was published.
      3. Call `vaultInfo`, passing your stVault address, to see its current on-chain metrics.

</details>

:::info
You can use any online UNIX timestamp converter to get the human readable datetime format.
:::
