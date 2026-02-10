---
sidebar_position: 6
---

# 🔌 StVault Disconnect Guide

This guide walks you through the process of disconnecting your stVault from Lido protocol. Disconnecting is a multi-step process that involves initiating the disconnect, waiting for an oracle report, abandoning the Dashboard, and accepting ownership on your EOA. Each step must be completed in order.

## Prerequisites

Before starting the disconnection process, make sure:

1. **All minted stETH is repaid.** Your vault must have zero liability shares. If you have outstanding stETH minted against the vault, [repay it first](./voluntary-rebalancing-and-vault-closure.md).
2. **Your vault has a fresh oracle report.** The disconnect will revert if the report is stale. [Apply a fresh report](./applying-report-guide.md) if needed.
3. **The vault has sufficient balance to cover all unsettled fees.** Both Lido protocol fees and accrued Node Operator fees are settled from the vault balance during the initiation step. If the vault balance is insufficient to cover them, the transaction will revert.

:::info
Once completed, the vault is removed from Lido Protocol. However, the same vault can be reconnected later unless it has been ossified.
:::

## Step 1. Initiate voluntary disconnect

The disconnection process starts by calling `Dashboard.voluntaryDisconnect()`. The caller must have the `VOLUNTARY_DISCONNECT_ROLE` or `DEFAULT_ADMIN_ROLE` on the Dashboard.

This call:

- Collects any accrued Node Operator fees and **transfers them to the Dashboard contract** as `feeLeftover`, for later recovery (see [Step 6](#step-6-recover-node-operator-fees)).
- Stops further fee accrual.
- Settles all outstanding Lido protocol fees from the vault balance to the Lido treasury.
- Marks the vault as **pending disconnection** in VaultHub.

:::tip Advanced: vault without a Dashboard
If your vault is not managed through a Dashboard, call `VaultHub.voluntaryDisconnect(vaultAddress)` directly. The caller must be the vault's owner as recorded in VaultHub (`connection.owner`).
:::

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w voluntary-disconnect <dashboardAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Since this contract is a proxy, complete the verification steps once (if not done before):
   - Go to **Contract → Code**.
   - Click **More options**.
   - Select **Is this a proxy?**.
   - Click **Verify** in the dialog.
   - Return to the contract details page.
3. Open the **Contract** tab → **Write as Proxy**.
4. Click **Connect to Web3** and connect your wallet in the dialog window.
5. Find the `voluntaryDisconnect` method in the list and click **Write**.
6. Sign the transaction in your wallet.
7. Click **View your transaction** and wait for it to be executed.

</details>

Once the transaction succeeds, your vault enters the **pending disconnection** state. While pending:

- No new stETH can be minted.
- No ETH can be withdrawn through VaultHub.
- The vault awaits the next oracle report to finalize the disconnection.

## Step 2. Apply the next oracle report

Wait for the next oracle report, then apply the report data to your vault via `LazyOracle.updateVaultData()`. This is the step that **finalizes** the disconnection.

:::info
Normally the oracle report occurs daily at 12 PM UTC.
:::

When the oracle report is applied and the report timestamp is after your disconnect initiation:

- If there are no slashing obligations and no remaining liability shares, the disconnect **completes successfully**. VaultHub transfers ownership of the StakingVault to the Dashboard and removes all vault records.
- If slashing was reported or liabilities remain, the disconnect is **aborted** and the vault returns to connected state.

This is a **permissionless operation** — anyone can apply the report.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start report w submit -v <vaultAddress>
```

The CLI automatically fetches the latest report CID, retrieves the Merkle tree from IPFS, generates the proof, and submits the transaction.

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Query the **LazyOracle** contract's `latestReportData()` method to get the current `reportCid`.
2. Fetch the Merkle tree JSON from IPFS using the CID: `https://ipfs.io/ipfs/<reportCid>`
3. Locate your vault's entry in the tree and extract the data fields and proof.
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

:::info
You can verify the disconnection completed by calling `VaultHub.isVaultConnected(vaultAddress)` or checking for the `VaultDisconnectCompleted` event in the transaction logs. If the disconnect was aborted due to slashing, a `VaultDisconnectAborted` event will appear instead, and you will need to resolve the issue before trying again.
:::

For more about applying report, read [Applying Report Guide](./applying-report-guide.md).

## Step 3. Abandon Dashboard and transfer ownership

After disconnection completes, the Dashboard holds pending ownership of the StakingVault. Since the Dashboard is tightly coupled to VaultHub, you need to transfer ownership away from it to your EOA.

Call `Dashboard.abandonDashboard(newOwner)`. This:

- Accepts the pending ownership on behalf of the Dashboard.
- Initiates an ownership transfer to the specified `newOwner` address.

The caller must have `DEFAULT_ADMIN_ROLE` on the Dashboard. The `newOwner` can be any address including the current vault owner (`DEFAULT_ADMIN_ROLE`) **except** the Dashboard itself.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w abandon-dashboard <dashboardAddress> <newOwnerAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Since this contract is a proxy, complete the verification steps once (if not done before):
   - Go to **Contract → Code**.
   - Click **More options**.
   - Select **Is this a proxy?**.
   - Click **Verify** in the dialog.
   - Return to the contract details page.
3. Open the **Contract** tab → **Write as Proxy**.
4. Click **Connect to Web3** and connect your wallet in the dialog window.
5. Find the `abandonDashboard` method in the list, enter the new owner address, and click **Write**.
6. Sign the transaction in your wallet.
7. Click **View your transaction** and wait for it to be executed.

</details>

## Step 4. Accept ownership on your EOA

The StakingVault uses a two-step ownership transfer. After the Dashboard initiates the transfer in the previous step, you must accept it from the `newOwner` address.

Call `StakingVault.acceptOwnership()` from the address specified as `newOwner` in the previous step.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault w accept-ownership <vaultAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Since this contract is a proxy, complete the verification steps once (if not done before):
   - Go to **Contract → Code**.
   - Click **More options**.
   - Select **Is this a proxy?**.
   - Click **Verify** in the dialog.
   - Return to the contract details page.
3. Open the **Contract** tab → **Write as Proxy**.
4. Click **Connect to Web3** and connect the wallet for the `newOwner` address.
5. Find the `acceptOwnership` method and click **Write**.
6. Sign the transaction in your wallet.
7. Click **View your transaction** and wait for it to be executed.

</details>

After this step, you are the full owner of the StakingVault with no dependency on VaultHub or the Dashboard.

## Step 5. Withdraw ETH

When your vault was connected to VaultHub, 1 ETH was locked as a connection deposit (minimal reserve). Now that the vault is fully disconnected, you can withdraw this deposit along with any other remaining balance.

Call `StakingVault.withdraw(recipient, amount)` from the owner address.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault w withdraw <vaultAddress> <recipientAddress> <amountInETH>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Since this contract is a proxy, complete the verification steps once (if not done before):
   - Go to **Contract → Code**.
   - Click **More options**.
   - Select **Is this a proxy?**.
   - Click **Verify** in the dialog.
   - Return to the contract details page.
3. Open the **Contract** tab → **Write as Proxy**.
4. Click **Connect to Web3** and connect the wallet for the `newOwner` address.
5. Find the `withdraw` method in the list and fill out the fields:
   - `_recipient`: the address to receive the ETH.
   - `_ether`: the amount in wei (e.g., `1000000000000000000` for 1 ETH).
6. Click **Write** and sign the transaction in your wallet.
7. Click **View your transaction** and wait for it to be executed.

</details>

## Step 6. Recover Node Operator fees

During Step 1, accrued Node Operator fees were withdrawn from the vault and stored on the Dashboard contract as `feeLeftover` rather than sent directly to the `feeRecipient`. This is intentional: if the `feeRecipient` were a contract that rejects ETH transfers, sending fees directly would revert and block the disconnect.

To send the stored fees to the configured `feeRecipient`, call `Dashboard.recoverFeeLeftover()`. This is a **permissionless operation**, anyone can call it, and the fees will be sent to the `feeRecipient` address configured on the Dashboard.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w recover-fee-leftover <dashboardAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Since this contract is a proxy, complete the verification steps once (if not done before):
   - Go to **Contract → Code**.
   - Click **More options**.
   - Select **Is this a proxy?**.
   - Click **Verify** in the dialog.
   - Return to the contract details page.
3. Open the **Contract** tab → **Write as Proxy**.
4. Click **Connect to Web3** and connect your wallet in the dialog window.
5. Find the `recoverFeeLeftover` method in the list and click **Write**.
6. Sign the transaction in your wallet.
7. Click **View your transaction** and wait for it to be executed.

</details>
