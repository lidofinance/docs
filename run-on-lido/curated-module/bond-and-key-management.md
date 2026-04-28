---
sidebar_position: 6
---

# 🔐 Bond & Key Management

This page covers how to upload and manage your validator keys, and how bond works in CMv2. Bond is collateral you post to back your keys. The amount required depends on your Node Operator type and number of keys.

---

## Key management

### Uploading keys

![Upload keys](/img/cm-guide/bond-upload-keys.png)

To upload keys, go to the keys tab in cm.lido.fi, and drag and drop the `deposit-data.json` file from your keys. The widget will tell you how much bond is required for the amount of keys submitted.

### How deposits work

After valid keys are uploaded, they become eligible for deposits. Deposits in CMv2 happen in two stages:

- **Initial deposit:** a validator first receives its initial 32 ETH deposit to get activated.
- **Top-ups:** after activation, the same validator can receive additional deposits over time.

CMv2 does not deposit validators in simple upload order. New 0x02 keys are deposited 32 ETH to get activated and then the protocol will deposit into them until they reach 2,048 ETH.

These top-ups are determined by the module's weighted allocation algorithm, which prioritizes Node Operators that are furthest below their target stake allocation.

### Key statuses

Each key inside your Node Operator has one of the following statuses.

| Status | What it means | What to do? |
| --- | --- | --- |
| **Depositable** | Key is valid and bond is sufficient. Pending deposit from Lido Protocol | Maintain sufficient bond amounts and make sure your node is active and online |
| **Pending activation** | Key has been deposited and is awaiting activation on the beacon chain | Make sure your validator node is online and ready to perform duties |
| **Active** | Key is active on the beacon chain | Make sure your validator node is online to perform its duties |
| **Exited** | Key has been exited | — |
| **Withdrawn** | Key has been exited and ETH has been returned to the protocol | — |
| **Unbonded** | Bond is insufficient for this key, which can be Active or otherwise | Top up bond or remove/exit the key |
| **Exit requested** | An exit has been requested by [VEBO](https://docs.lido.fi/contracts/validators-exit-bus-oracle/) but the validator has not yet exited | Exit the validator as soon as possible to avoid a Late exit penalty |
| **Duplicated** | Key has been uploaded twice either to the Lido protocol or Ethereum CL | Remove duplicate key |
| **Invalid** | Uploaded key has an invalid signature | Remove key and re-upload it with the valid signature |

### Exiting keys

![Exit keys](/img/cm-guide/bond-exit-keys.png)

Operators in the Curated Module can exit their keys through the following options:

**Removing keys before getting deposits**

You can remove keys that have not yet received the 32 ETH initial deposit.

To remove them, go to the Keys section in the CMv2 widget and open the Remove tab.

**Voluntary exit**

Voluntary exits are appropriate when the protocol has requested an exit via the [Validators Exit Bus Oracle](https://docs.lido.fi/contracts/validators-exit-bus-oracle) to fulfill stETH withdrawal requests, or when you have insufficient bond to cover this key.

Please note this can't be done in the CMv2 widget, it can only be done through your validator client.

Exiting validators outside of a protocol-requested exit is discouraged. If you plan to exit validators without a prior exit request, notify the Lido community in advance via the research forum.

**Ejection (triggerable withdrawals)**

Through the CMv2 widget, you can force-exit an active validator directly from the Execution Layer using EIP-7002 triggerable withdrawals. This is an emergency measure. It is recommended to use voluntary exits broadcast via CL in normal operations.

:::info
Read the [Lido Standard Node Operator Protocol (SNOP) for Validator Exits](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md) before exiting any validator. It covers exit order, your obligations when processing requests, and what happens if you don't follow it.
:::

---

## Bond basics

Curated Module v2 introduces a bond for sub-NOs. Every new key requires a certain amount of bond (described in the section below), and it's used to cover certain losses from the NO. The amount depends on the Node Operator type and number of keys.

Because the bond is staked, it generates staking rewards which can be claimed if they exceed the minimum required for the amount of keys submitted.

---

### Bond amounts

The required bond per key varies by Node Operator type.

| **NO type** | **Bond (first key)** | **Bond (subsequent keys)** |
| --- | --- | --- |
| Professional Trusted Operator (PTO) | 11 ETH | 0.1 ETH next 17 keys, 0.7 ETH after |
| Professional Operator (PO) | 11 ETH | 1 ETH |
| Public Good Operator (PGO) | 11 ETH | 0.1 ETH next 17 keys, 0.7 ETH after |
| Decentralization Operator (DO) | 11 ETH | 0.1 ETH next 17 keys, 0.7 ETH after |
| Extra Effort Operator (EEO) | 11 ETH | 0.1 ETH next 17 keys, 0.7 ETH after |
| Intra-Operator DVT Cluster (IODC) | 11 ETH | 0.1 ETH next 17 keys, 0.7 ETH after |

:::info
These are Hoodi testnet confirmed values. Mainnet values will be confirmed before launch and may differ.
:::

---

### Locked bond

![Locked bond](/img/cm-guide/bond-locked.png)

When a [penalty](./penalties) is reported to your operator, the equivalent of the penalty plus a fee enters a **locked** state.

You can compensate the penalty from your excess bond. If needed, top up your bond first so there is enough excess to cover the penalty, then compensate it through the interface.

If no further action is taken by the Curated Module Committee, the Node Operator can do a transaction to unlock it after the lock period of 60 days ends.

You can also see previous penalties in the history toggle with penalties including:

- Late Exit Penalty
- General delayed Penalty
- Compensation (shown when you have already compensated a previous penalty)

:::warning
If you do not compensate a locked bond before the EasyTrack motion executes, those funds are **permanently burned**. In Phase 2, this will also result in a strike being assigned to the sub-Node Operator.
:::

---

### Unbonded keys

If your bond falls below the required minimum, some of your keys become **Unbonded** and will not be deposited to, or will be requested to exit in case the deposited or active key is unbonded.

To solve this you can either top up the bond, or exit the key.
