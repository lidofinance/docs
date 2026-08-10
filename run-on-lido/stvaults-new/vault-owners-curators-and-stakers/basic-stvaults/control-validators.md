---
sidebar_position: 7
---

# Control validators and withdraw from the Beacon Chain

The ETH your vault has staked sits on validators run by your Node Operator. This page covers what you, as a Vault Owner, can do about those validators: ask for an exit, pull ETH back from the Beacon Chain yourself, and stop new deposits.

There are two ways to get ETH back from validators:

- **Requesting an exit** is a signal to the Node Operator. It costs nothing and enforces nothing.
- **Triggering a withdrawal** goes to the Beacon Chain directly via EIP-7002. It works without the Node Operator, but it costs a fee and has restrictions.

## Who can do what

| Actor | Can | Permission |
| --- | --- | --- |
| Vault Owner | Request a validator exit | `REQUEST_VALIDATOR_EXIT_ROLE` |
| Vault Owner | Trigger a partial withdrawal or a full exit | `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` |
| Vault Owner | Pause / resume deposits to validators | `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE` / `RESUME_BEACON_CHAIN_DEPOSITS_ROLE` |
| Node Operator | Exit validators directly | the Node Operator address, non-delegable |
| stVaults Committee, Lido DAO | Force a full exit | only while the vault has an obligations shortfall |

All Vault Owner permissions above are held by the admin by default and can be delegated — see [Roles and permissions](./roles-and-permissions.md).

## Request a validator exit

The polite path: you signal which validators should leave, and the Node Operator performs the exit.

:::warning
This does **not** exit anything by itself. It emits a `ValidatorExitRequested` event per key, and the Node Operator has to be watching for it and act. Whether and when they do is an off-chain matter between you and them — the protocol does not enforce it.
:::

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard write exit <dashboard_address> <validator_pubkey>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `requestValidatorExit`, passing the validator public keys concatenated into a single hex string (48 bytes each).

</details>

## Trigger a validator withdrawal

This path pulls ETH from the Beacon Chain without involving the Node Operator, using EIP-7002 triggerable withdrawals. It comes in two flavours:

- **Full exit** — the validator leaves and its entire balance returns to the vault. Pass an amount of `0`.
- **Partial withdrawal** — only part of the balance returns. The amount is trimmed so that at least 32 ETH stays on the validator, otherwise it would be deactivated.

The withdrawn ETH lands on the vault's Not Staked Balance. How long it takes depends on the Ethereum exit queue.

### The fee

Every withdrawal request costs a fee per validator key, paid in the same transaction. It is set by the network and **changes from block to block**, so:

- estimate it with `calculateValidatorWithdrawalFee(numberOfKeys)` on the `StakingVault` contract;
- send a surplus, because the estimate is only accurate for the block it was made in;
- the exact amount is charged and the excess is refunded to the refund recipient you specify.

:::warning
The fee can spike sharply when the withdrawal queue is congested. Whatever you send is the most you can pay: the actual fee is taken and the rest is refunded. So keep the surplus modest — a large one only raises that ceiling.
:::

### When partial withdrawals are blocked

Full exits always go through. Partial withdrawals are rejected with `PartialValidatorWithdrawalNotAllowed` when:

- the vault has an **obligations shortfall** — anything it owes and cannot currently cover;
- the vault is **jailed**;
- the oracle report is **stale** — see [Apply oracle reports](./apply-oracle-reports.md).

The first restriction is deliberate: a vault that is behind on its obligations must not be able to occupy the consensus layer withdrawal queue and delay the forced exits needed to rebalance it.

<details>
  <summary>using stVaults Web UI</summary>

1. Open the **Validators** page of your vault.
2. Pick a validator and choose **Withdraw to stVault**.
3. Enter an amount for a partial withdrawal, or use **Force exit validator** to withdraw the entire balance.

The modal shows the amount available to withdraw and the estimated withdrawal fee. If the vault is jailed, the partial option is disabled and the modal says so.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts dashboard write trigger-validator-withdrawal \
  <dashboard_address> <pubkeys> <amounts> <refund_recipient>
```

Public keys and amounts are comma-separated lists of the same length. **Amounts are in ETH**, and `0` means a full exit. The CLI reads the current fee itself and attaches it to the transaction, so you do not pass it.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `calculateValidatorWithdrawalFee`, passing the number of keys, to estimate the fee.
3. Navigate to the **Dashboard** contract by its address.
4. Call `triggerValidatorWithdrawals`, passing the concatenated public keys, the amounts **in Gwei** (`0` for a full exit), and the refund recipient address. Attach the fee, with a surplus, as the payable value.

</details>

## Pause and resume deposits to validators

Pausing stops the Node Operator from depositing any more of the vault balance into new validators. Existing validators are unaffected and keep running.

This is useful when you are about to withdraw, disconnect, or simply do not want the balance to be staked further while you decide.

<details>
  <summary>using stVaults Web UI</summary>

Open the vault **Settings** and switch off deposits from the stVault balance to validators.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `pauseBeaconChainDeposits` or `resumeBeaconChainDeposits`.

</details>

## Forced exit by the protocol

If your vault falls behind on its obligations, the stVaults Committee and the Lido DAO can force its validators to exit, returning the ETH to the vault so the position can be rebalanced.

This is not arbitrary — the call reverts with `ForcedValidatorExitNotAllowed` unless the vault actually has an obligations shortfall at the time, and it requires a fresh oracle report. Forced exits are always full exits.

An **obligations shortfall** means the vault owes more than the liquid ETH on its balance can cover. What it owes is:

- the ETH needed to bring the Health Factor back above 100%, or the ETH needed to cover pending **Lido redemptions** — whichever of the two is larger;
- plus unsettled Lido fees, but only once they reach 1 ETH. Below that they are ignored.

If the vault balance covers all of that, there is no shortfall and forced exits are not possible — even if the vault is unhealthy.

The way to never meet this path is to watch the Health Factor and act early — see the [Health monitoring guide](./health-monitoring-guide.md) and the [Rebalance guide](./rebalance-guide.md).
