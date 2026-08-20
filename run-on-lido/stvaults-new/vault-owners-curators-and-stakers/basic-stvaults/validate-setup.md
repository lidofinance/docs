---
sidebar_position: 13
---

# Validate the setup before connecting

An stVault is created first and connected to VaultHub second. Between those two moments the Vault Owner can still inspect everything the Node Operator configured.

Run these checks before the transaction that accepts the tier, supplies ETH and connects the stVault to Lido Core.

## The Node Operator address

The Node Operator is set when the stVault is created and there is no setter for it. If the address is wrong, the only remedy is to create a new stVault.

:::danger
Confirm the address matches the operator you agreed with, character by character, before you put any ETH in.
:::

The same address is registered in the [Operator Grid](/contracts/operator-grid) and determines which tiers and stETH minting terms the stVault is eligible for.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Main settings** page of your stVault and check the **Node Operator** field.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault read no <vault_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `nodeOperator`.

</details>

## Who holds the roles

Both admin roles and every sub-role are readable on the `Dashboard` contract. Check that:

- **`DEFAULT_ADMIN_ROLE` is your address**, ideally a multisig. In the two-step flow the Node Operator is the one who calls the factory and passes this address, so it is set by your counterparty rather than by you.
- **`NODE_OPERATOR_MANAGER_ROLE` is the operator's address** you agreed on.
- **No sub-role was granted to an address you do not recognise.** The factory accepts a list of role assignments at creation, so sub-roles can already be in place before you ever see the stVault. An admin can perform every operation in its scope anyway, so any sub-role holder is an extra key to your stVault.

Roles can be changed later, so a surprise here is recoverable — see [Roles and permissions](./roles-and-permissions.md).

<details>
  <summary>using stVaults Web UI</summary>

The **Main settings** page shows the **Vault Owner** and **Node Operator Manager** addresses. The **Permissions** page lists every sub-role under **Vault Manager Permissions** and **Node Operator Manager Permissions**.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo read roles -v <vault_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `getRoleMembers` for each role you want to inspect, or `hasRole` to test a specific address.

</details>

## The fee and the confirmation lifetime

Two settings decide the economics and how changes are agreed later:

- **Node Operator fee** — the share of gross staking rewards the operator takes.
- **Confirmation Lifetime** — how long a proposed change waits for the other side to confirm it.

Both are changeable only with confirmation from the Vault Owner **and** the Node Operator Manager, so agree them now. Keep the confirmation lifetime as short as practical: it is the window during which a pending change can still be completed.

Also check the **Node Operator Fee Recipient**, the address the fee is paid to. At creation it is set to the Node Operator Manager address, so change it if the operator wants the fee elsewhere.

<details>
  <summary>using stVaults Web UI</summary>

All three are on the **Main settings** page: **Node Operator Fee**, **Confirmation Lifetime** and **Node Operator Fee Recipient**.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard read no-fee-rate <dashboard_address>
yarn start contracts dashboard read get-confirm-expiry <dashboard_address>
yarn start contracts dashboard read node-operator-fee-recipient <dashboard_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `feeRate`, `getConfirmExpiry` and `feeRecipient`.

</details>

## The tier and its limits

The tier the Node Operator proposed sets the Reserve Ratio, Forced Rebalance Threshold and stETH minting limit. Those numbers decide how much stETH can be minted against the ETH in the stVault and how far the stVault can drift before forced rebalancing — see [Metrics](./metrics.md).

Compare the proposed tier against the Default tier. Changing the tier later is possible but needs the Node Operator to confirm it.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Tier** tab in your stVault settings. **Choose Tier** shows which tier is active, its reserve ratio and its minting limit, and **Current vault metrics** lists the numbers that follow from it: Reserve Ratio, Forced Rebalance Threshold, Lido infrastructure fee, Lido liquidity fee and reservation fee.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts operator-grid read vault-tier-info <vault_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **OperatorGrid** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview#environments) page.
2. Call `vaultTierInfo`, passing your stVault address.

</details>

## The deposit path

Two settings control how ETH reaches validators:

- **PDG policy** — `STRICT` by default, meaning every deposit goes through the full Predeposit Guarantee process. `ALLOW_PROVE` and `ALLOW_DEPOSIT_AND_PROVE` relax that, and `ALLOW_DEPOSIT_AND_PROVE` lets the Node Operator deposit your ETH to validators bypassing PDG entirely. A non-strict policy is a decision about how far you trust the Node Operator.
- **Depositor** — in the default setup this is the `PredepositGuarantee` contract. VaultHub refuses the connection otherwise, so a mismatch blocks the connection at this step.

<details>
  <summary>using stVaults Web UI</summary>

The **Main settings** page shows **Predeposit Guarantee Policy** and the **Allow deposits from stVault Balance to validators** toggle.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard read pdg-policy <dashboard_address>
yarn start contracts vault read depositor <vault_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract and call `pdgPolicy`.
2. Navigate to the **StakingVault** contract and call `depositor`.

</details>

## That the stVault is genuine

VaultHub only accepts stVaults deployed by the canonical `VaultFactory` and rejects anything else with `VaultNotFactoryDeployed`. It also refuses an stVault that has been ossified.

Compare the factory address that deployed the stVault against the one listed on the [Environments](../../concepts-and-reference/architecture-overview#environments) page for your network.

<details>
  <summary>using stVaults Web UI</summary>

The official stVaults Web UI for your network — see [Environments](../../concepts-and-reference/architecture-overview#environments) — queries the factory for every stVault it loads and refuses to open one it did not deploy, showing **stVault is not created by Factory** instead. If your stVault opens there, it passed this check.

The frontend is open-source and meant to be forked, so a self-hosted or modified build can skip the check. Rely on this only when you are on the official deployment.

</details>

## Fixing what you find

Most settings can still be corrected at this point, but not from the Web UI: it disables the settings forms for an stVault that is not connected yet. Use the CLI or Etherscan instead. Roles, the Node Operator fee, the confirmation lifetime, the fee recipient and the PDG policy all have setters that work on a disconnected stVault.

Two things are different:

- **The tier and the minting limit cannot be finalised yet.** The Node Operator can register their side of the agreement in advance, but the Vault Owner's side reverts with `VaultNotConnected` until the stVault is connected. Agree the terms now and apply them right after connecting — see [Change tier and stETH minting limit](../../node-operators/change-tier-and-steth-minting-limit.md).
- **The Node Operator address cannot be changed at all.** If it is wrong, abandon this stVault and have a new one created; nothing is lost as long as no ETH has been supplied.

## What connecting does

The connecting transaction funds the stVault and hands its ownership to VaultHub.

**1 ETH is a minimum, not a fixed amount.** The connect call is payable and funds whatever is attached, so the full intended stake can go in the same transaction instead of connecting first and funding after.

**Only 1 ETH is locked.** Whatever is supplied, exactly 1 ETH becomes the minimal reserve; the rest is ordinary stVault balance that counts towards the [stETH minting capacity](./metrics.md) and can be withdrawn. The reserve is refundable: it comes back when you [disconnect](./disconnection.md).

**Connecting can be combined with accepting the tier.** `connectAndAcceptTier` does both in one transaction, which is what the Web UI uses.

<details>
  <summary>using stVaults Web UI</summary>

An stVault that is not yet connected opens on its **Overview** page with the connection flow instead of the usual dashboard: it shows the stVault details, lets you request a tier and its minting limit, and finishes with **Approve connection to Lido VaultHub**.

The flow has no amount field — it always attaches exactly 1 ETH, the connection deposit. To supply more in the same transaction, connect through the CLI or Etherscan instead, or connect here and supply the rest afterwards.

</details>

Once connected, the stVault starts accruing Lido fees and stETH can be minted against it — see [Supply, withdraw, mint and repay](./supply-withdraw-mint-repay.md).
