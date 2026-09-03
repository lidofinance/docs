---
sidebar_position: 8
title: Disconnect stVault from VaultHub
sidebar_label: Disconnect from VaultHub
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Disconnect stVault from VaultHub

Disconnecting an stVault from the Lido protocol is a multi-step process, and each step must be completed in the given order.

## Why disconnect an stVault and what changes after

Disconnecting an stVault is a deliberate action fully controlled by the Vault Owner. It allows the Vault Owner to remove the stVault’s connection to the Lido protocol and operate it independently.

### Why disconnect?

A Vault Owner may choose to disconnect for several reasons:

- **Withdraw the connection deposit**
  The 1 ETH deposit used for stVault connection can be withdrawn after disconnection.

- **Stop using Lido protocol services**
  Disconnecting disables Lido-provided accounting, liquidity by stETH, and fee mechanisms, and therefore stops Lido fee accrual.

- **Make the stVault irrevocably independent (ossification)**
  The stVault can be ossified to prevent any future upgrades or changes, removing any influence from Lido DAO.
  Disconnection does not imply ossification: ossification is an optional, separate action available after disconnection.
### What stops working after disconnection

After disconnection, all integrations with Lido protocol components are disabled.

**Dashboard contract is abandoned, which means:**
- Granular roles and permissions are no longer available.
- Most of the Web UI functionality becomes unavailable.
- Node Operator fee distribution stops.

:::warning
Node Operators must independently monitor disconnection events, as validation continues after disconnection, but Node Operator fees are no longer accrued. Disconnection can be detected by monitoring the `VaultDisconnectInitiated(address indexed vault)` event emitted by the VaultHub contract on-chain.
:::

**No connection to VaultHub:**
- All stETH-related operations are disabled: Minting, Repayment, Rebalancing.

**No oracles reports:**
- No accounting updates are performed, including Total Value updates and any oracle-driven state changes.
- No Lido fees are charged.

### What remains functional after disconnection

stVault disconnection from VaultHub does not affect validators.

The following functionality remains available **at the smart contract / CLI level:**
- Supplying ETH to the stVault.
- Predeposit Guarantee contract functionality.
- Validator operations continue unaffected: validators keep running and validation rewards continue to accrue.

:::info
If the stVault is **not ossified**, it can be reconnected to VaultHub in the future.
:::

## Prerequisites

Before starting the disconnection process, make sure:

1. **All minted stETH is repaid.** Your stVault must have zero liability shares. If you have outstanding stETH minted against the stVault, [repay it first](./supply-withdraw-mint-repay.md).
2. **Your stVault has a fresh oracle report.** The disconnect will revert if the report is stale. [Apply a fresh report](./apply-oracle-reports.md) if needed.
3. **The stVault has sufficient balance to cover all unsettled fees.** Both Lido protocol fees and accrued Node Operator fees (if applicable) are settled from the stVault balance during the initiation step. If the stVault balance is insufficient to cover them, the transaction will revert.

:::info
Once completed, the stVault is removed from Lido protocol. However, the same stVault can be reconnected later unless it has been ossified.
:::


<Tabs>
<TabItem value="dashboard" label="With Dashboard" default>

## Step 1. Initiate voluntary disconnect

The disconnection process starts by calling `Dashboard.voluntaryDisconnect()`. The caller must have the `VOLUNTARY_DISCONNECT_ROLE` or `DEFAULT_ADMIN_ROLE` on the Dashboard.

This call:

- Collects any accrued Node Operator fees and **transfers them to the Dashboard contract** as `feeLeftover`, for later recovery (see [Step 6](#step-6-recover-node-operator-fees)).
- Stops further fee accrual.
- Settles all outstanding Lido protocol fees from the stVault balance to the Lido treasury.
- Marks the stVault as **pending disconnection** in VaultHub.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Disconnect** tab in your stVault settings. The step shows the Total Value, the Not staked stVault Balance and the Unsettled Lido fees so you can check them before confirming, then submits the transaction.

</details>
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w voluntary-disconnect <dashboardAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract — find its address on the [Per-setup addresses](../../concepts-and-reference/architecture-overview.md#per-setup-addresses) page.
2. Call `voluntaryDisconnect`.

</details>

Once the transaction succeeds, your stVault enters the **pending disconnection** state. While pending:

- No new stETH can be minted.
- No ETH can be withdrawn through VaultHub.
- The stVault awaits the next oracle report to finalize the disconnection.

## Step 2. Apply the next oracle report

Wait for the next oracle report, then apply the report data to your stVault via `LazyOracle.updateVaultData()`. This is the step that **finalizes** the disconnection.

:::info
Normally the oracle report occurs daily shortly after 12 PM UTC.
:::

When the oracle report is applied and the report timestamp is after your disconnect initiation:

- If there are no slashing obligations and no remaining liability shares, the disconnect **completes successfully**. VaultHub transfers ownership of the StakingVault to the Dashboard and removes all stVault records.
- If slashing was reported or liabilities remain, the disconnect is **aborted** and the stVault returns to connected state.

This is a **permissionless operation** — anyone can apply the report.

<details>
  <summary>using stVaults Web UI</summary>

The step becomes available once a newer report exists. Submitting it applies the report and completes the disconnection.

</details>
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start report w submit -v <vaultAddress>
```

The CLI automatically fetches the latest report CID, retrieves the Merkle tree from IPFS, generates the proof, and submits the transaction.

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **LazyOracle** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview#environments) page.
2. Call `latestReportData` to get the current `reportCid`.
3. Fetch the Merkle tree JSON from IPFS: `https://ipfs.io/ipfs/<reportCid>`
4. Locate your stVault's entry in the tree and copy its values and proof.
5. Call `updateVaultData`, passing the stVault address, the values from the tree and the proof.

</details>

:::info
You can verify the disconnection completed by calling `VaultHub.isVaultConnected(vaultAddress)` or checking for the `VaultDisconnectCompleted` event in the transaction logs. If the disconnect was aborted due to slashing or liabilities, a `VaultDisconnectAborted` event will appear instead, and you will need to resolve the issue before trying again.
:::

For more about applying reports, read [Apply oracle reports](./apply-oracle-reports.md).

## Step 3. Abandon Dashboard and transfer ownership

After disconnection completes, the Dashboard holds pending ownership of the StakingVault. Since the Dashboard is tightly coupled to VaultHub, you need to transfer ownership away from it to your account.

Call `Dashboard.abandonDashboard(newOwner)`. This:

- Accepts the pending ownership on behalf of the Dashboard.
- Initiates an ownership transfer to the specified `newOwner` address.

The caller must have `DEFAULT_ADMIN_ROLE` on the Dashboard. The `newOwner` can be any account including the current stVault owner (`DEFAULT_ADMIN_ROLE`) **except** the Dashboard itself.

<details>
  <summary>using stVaults Web UI</summary>

Enter the address that will own the stVault and submit. The step warns you to check the transaction in your wallet before signing — the ownership transfer cannot be undone.

</details>
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w abandon-dashboard <dashboardAddress> <newOwnerAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `abandonDashboard`, passing the new owner address.

</details>

## Step 4. Accept ownership

The StakingVault uses a two-step ownership transfer. After the Dashboard initiates the transfer in the previous step, you must accept it from the `newOwner` address.

Call `StakingVault.acceptOwnership()` from the address specified as `newOwner` in the previous step.

<details>
  <summary>using stVaults Web UI</summary>

Connect the wallet of the address you named in the previous step, then submit. Until you do, the step asks you to accept ownership by that address.

</details>
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault w accept-ownership <vaultAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `acceptOwnership`.

</details>

After this step, you are the full owner of the StakingVault with no dependency on VaultHub or the Dashboard.

## Step 5. Withdraw ETH

When your stVault was connected to VaultHub, 1 ETH was locked as a connection deposit (minimal reserve). Now that the stVault is fully disconnected, you can withdraw this deposit along with any other remaining balance.

Call `StakingVault.withdraw(recipient, amount)` from the owner address.

<details>
  <summary>using stVaults Web UI</summary>

The step shows the Last known stVault Total Value and the Withdrawable stVault Balance. Pick where the ETH goes — the Vault Owner's address or another one — and submit.

</details>
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault w withdraw <vaultAddress> <recipientAddress> <amountInETH>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `withdraw`, passing:
   - `_recipient`: the address to receive the ETH.
   - `_ether`: the amount in wei (e.g., `1000000000000000000` for 1 ETH).
</details>

## Step 6. Recover Node Operator fees

During Step 1, accrued Node Operator fees were withdrawn from the stVault and stored on the Dashboard contract as `feeLeftover` rather than sent directly to the `feeRecipient`. This is intentional: if the `feeRecipient` were a contract that rejects ETH transfers, sending fees directly would revert and block the disconnect.

To send the stored fees to the configured `feeRecipient`, call `Dashboard.recoverFeeLeftover()`. This is a **permissionless operation**, anyone can call it, and the fees will be sent to the `feeRecipient` address configured on the Dashboard.

:::note
This step has no action in the Web UI. It shows what the leftover fees are and points back here, so use the CLI or Etherscan below.
:::
<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard w recover-fee-leftover <dashboardAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `recoverFeeLeftover`.

</details>

</TabItem>
<TabItem value="no-dashboard" label="Without Dashboard">

## Step 1. Initiate voluntary disconnect

Call `VaultHub.voluntaryDisconnect(vaultAddress)` directly. The caller must be the stVault's owner as recorded in VaultHub (`connection.owner`).

This call:

- Settles all outstanding Lido protocol fees from the stVault balance to the Lido treasury.
- Marks the stVault as **pending disconnection** in VaultHub.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts hub w v-owner-disconnect <vaultAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **VaultHub** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview#environments) page.
2. Call `voluntaryDisconnect`, passing your stVault address.

</details>

Once the transaction succeeds, your stVault enters the **pending disconnection** state. While pending:

- No new stETH can be minted.
- No ETH can be withdrawn through VaultHub.
- The stVault awaits the next oracle report to finalize the disconnection.

## Step 2. Apply the next oracle report

Wait for the next oracle report, then apply the report data to your stVault via `LazyOracle.updateVaultData()`. This is the step that **finalizes** the disconnection.

:::info
Normally the oracle report occurs daily shortly after 12 PM UTC.
:::

When the oracle report is applied and the report timestamp is after your disconnect initiation:

- If there are no slashing obligations and no remaining liability shares, the disconnect **completes successfully**. VaultHub transfers ownership of the StakingVault to `connection.owner` and removes all stVault records.
- If slashing was reported or liabilities remain, the disconnect is **aborted** and the stVault returns to connected state.

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

1. Open **Etherscan** and navigate to the **LazyOracle** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview#environments) page.
2. Call `latestReportData` to get the current `reportCid`.
3. Fetch the Merkle tree JSON from IPFS: `https://ipfs.io/ipfs/<reportCid>`
4. Locate your stVault's entry in the tree and copy its values and proof.
5. Call `updateVaultData`, passing the stVault address, the values from the tree and the proof.

</details>

:::info
You can verify the disconnection completed by calling `VaultHub.isVaultConnected(vaultAddress)` or checking for the `VaultDisconnectCompleted` event in the transaction logs. If the disconnect was aborted due to slashing or liabilities, a `VaultDisconnectAborted` event will appear instead, and you will need to resolve the issue before trying again.
:::

For more about applying reports, read [Apply oracle reports](./apply-oracle-reports.md).

## Step 3. Accept ownership

The StakingVault uses a two-step ownership transfer. After the disconnect completes, VaultHub transfers pending ownership to `connection.owner`. You must accept it from that address.

Call `StakingVault.acceptOwnership()` from the `connection.owner` address.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault w accept-ownership <vaultAddress>
```

</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `acceptOwnership`.

</details>

After this step, you are the full owner of the StakingVault with no dependency on VaultHub.

## Step 4. Withdraw ETH

When your stVault was connected to VaultHub, 1 ETH was locked as a connection deposit (minimal reserve). Now that the stVault is fully disconnected, you can withdraw this deposit along with any other remaining balance.

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
2. Call `withdraw`, passing:
   - `_recipient`: the address to receive the ETH.
   - `_ether`: the amount in wei (e.g., `1000000000000000000` for 1 ETH).
</details>

</TabItem>
</Tabs>
