---
sidebar_position: 5
---

# 🔌 DeFi Wrapper Disconnect Guide

This guide walks through the full process of disconnecting a DeFi Wrapper (pooled staking product) from the Lido protocol and distributing remaining assets to users.

:::warning
Disconnecting a DeFi Wrapper is an irreversible operation that affects all pool users. Ensure you communicate the timeline and plan to your users well in advance.
:::

## Overview

1. **Assign required roles** to a trusted actor via the Timelock Controller.
2. **Exit all validators** (voluntarily or forcibly).
3. **Pause withdrawals** on the Withdrawal Queue and **finalize all pending withdrawal requests**.
4. **Pause deposits and minting** on the Pool contract.
5. **Rebalance the Staking Vault** to zero liability.
6. **Disconnect the stVault** — follow the [stVault Disconnect Guide](../../operational-and-management-guides/stvault-disconnect-guide.md) (initiate voluntary disconnect, apply oracle report, abandon Dashboard, accept ownership).
7. **Withdraw assets** from the Staking Vault and **distribute them to users** via the Distributor.

Steps 1–5 are DeFi Wrapper-specific and covered below. Step 6 follows the standard stVault disconnect flow. Step 7 covers asset distribution and user claiming.

---

## Step 1. Assign required roles

The disconnect process requires multiple roles across the Pool, Withdrawal Queue, and Dashboard contracts. Grant these roles to a trusted actor via the Timelock Controller.

| Role                                | Contract         | Purpose                                   |
| ----------------------------------- | ---------------- | ----------------------------------------- |
| `LOSS_SOCIALIZER_ROLE`              | Pool             | Force rebalance undercollateralized users |
| `DEPOSITS_PAUSE_ROLE`               | Pool             | Pause new deposits                        |
| `MINTING_PAUSE_ROLE`                | Pool             | Pause stETH minting                       |
| `WITHDRAWALS_PAUSE_ROLE`            | Withdrawal Queue | Pause new withdrawal requests             |
| `FINALIZE_ROLE`                     | Withdrawal Queue | Finalize pending withdrawal requests      |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Dashboard        | Force validator exits                     |
| `REBALANCE_ROLE`                    | Dashboard        | Rebalance the vault                       |

Schedule and execute a batch transaction through the Timelock Controller to grant all roles at once:

```
targets: [Pool, Pool, Pool, WithdrawalQueue, WithdrawalQueue, Dashboard, Dashboard]
payloads: [
  grantRole(LOSS_SOCIALIZER_ROLE, trustedActor),
  grantRole(DEPOSITS_PAUSE_ROLE, trustedActor),
  grantRole(MINTING_PAUSE_ROLE, trustedActor),
  grantRole(WITHDRAWALS_PAUSE_ROLE, trustedActor),
  grantRole(FINALIZE_ROLE, trustedActor),
  grantRole(TRIGGER_VALIDATOR_WITHDRAWAL_ROLE, trustedActor),
  grantRole(REBALANCE_ROLE, trustedActor)
]
```

---

## Step 2. Exit all validators

Exit all validators associated with the Staking Vault. This moves ETH from the Beacon Chain back to the vault balance.

- **Voluntary exit:** Request exits through your standard validator management tooling.
- **Forced exit:** If voluntary exits are not possible, call `Dashboard.triggerValidatorWithdrawals()` from an account with `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE`:

```bash
yarn start contracts dashboard w trigger-v-w <dashboardAddress> <pubkeys> <amounts> <refundAddress>
```

:::info
The `triggerValidatorWithdrawals` call requires sending a small withdrawal fee (currently ~10 gwei per validator) to cover the EIP-7002 triggerable withdrawal fee.
:::

Wait for all validator exits to complete and ETH to be swept back to the Staking Vault balance before proceeding.

---

## Step 3. Pause withdrawals and finalize pending requests

### 3.1. Pause new withdrawal requests

Prevent users from creating new withdrawal requests by calling `WithdrawalQueue.pauseWithdrawals()` from an account with `WITHDRAWALS_PAUSE_ROLE`:

```bash
yarn start dw c wq w pause <withdrawalQueueAddress>
```

### 3.2. Finalize all pending withdrawal requests

Before disconnecting, all pending withdrawal requests must be finalized.

An oracle report may be required before finalization to update the vault state. Apply a fresh report if needed.

Call `WithdrawalQueue.finalize(maxRequests, gasCostCoverageRecipient)` from an account with `FINALIZE_ROLE`:

```bash
yarn start dw c wq w finalize <withdrawalQueueAddress> <maxRequests> <gasCostCoverageRecipient>
```

After finalization, verify all requests are processed — `unfinalizedRequestsNumber()`, `unfinalizedStv()`, `unfinalizedAssets()`, and `unfinalizedStethShares()` should all return `0`.

---

## Step 4. Pause deposits and minting

### 4.1. Pause deposits

Call `Pool.pauseDeposits()` from an account with `DEPOSITS_PAUSE_ROLE`:

```bash
yarn start dw c stv w pause-deposits <poolAddress>
```

### 4.2. Pause minting

Call `Pool.pauseMinting()` from an account with `MINTING_PAUSE_ROLE`:

```bash
yarn start dw c stv w pause-minting <poolAddress>
```

After pausing, any attempts to deposit ETH, mint stETH shares, or mint wstETH will revert.

---

## Step 5. Rebalance the Staking Vault to zero liability

### 5.1. Force rebalance undercollateralized users (if any)

If any pool users are undercollateralized, force rebalance them by calling `Pool.forceRebalanceAndSocializeLoss()` from an account with `LOSS_SOCIALIZER_ROLE`.

### 5.2. Rebalance the vault

Check the current liability:

```bash
yarn start contracts dashboard r liability-shares <dashboardAddress>
```

Call `Dashboard.rebalanceVaultWithShares(liabilityShares)` from an account with `REBALANCE_ROLE`, passing the full `liabilityShares` amount to bring the liability to zero:

```bash
yarn start contracts dashboard w rebalance-vault-with-shares <dashboardAddress> <liabilityShares>
```

:::warning
The disconnect will revert with `NoLiabilitySharesShouldBeLeft` if any liability shares remain. Ensure `Dashboard.liabilityShares()` returns `0` before proceeding.
:::

---

## Step 6. Disconnect the stVault

Follow the [stVault Disconnect Guide](../../operational-and-management-guides/stvault-disconnect-guide.md) to complete the disconnection:

1. **Initiate voluntary disconnect** — schedule and execute `Dashboard.voluntaryDisconnect()` through the Timelock Controller. Requires a fresh oracle report.
2. **Apply the next oracle report** — finalizes the disconnection.
3. **Abandon Dashboard** — call `Dashboard.abandonDashboard(newOwner)` from the Timelock Controller.
4. **Accept ownership** — call `StakingVault.acceptOwnership()` from the `newOwner` address.

---

## Step 7. Withdraw assets and distribute to users

After disconnection, remaining ETH in the vault must be distributed to pool users through the Distributor contract.

### 7.1. Get the Distributor address

```bash
yarn start dw c stv r DISTRIBUTOR <poolAddress>
```

### 7.2. Convert vault ETH to wstETH

The Distributor contract does not accept raw ETH, so the vault balance must be converted to wstETH first.

Call `StakingVault.withdraw(recipient, amount)` with the **wstETH contract address** as the recipient. The wstETH contract has a `receive()` function that automatically stakes incoming ETH into stETH and mints wstETH back to the sender (the vault):

```bash
yarn start contracts vault w withdraw <vaultAddress> <wstethAddress> <amountInETH>
```

After this call, the vault holds wstETH tokens (not ETH).

:::info
Make sure you account for the Initial Connect Deposit (1 ETH) that was unlocked after disconnect — it is now part of the available balance.
:::

### 7.3. Transfer wstETH to the Distributor

First, retrieve the wstETH balance of the vault:

```bash
yarn start account r info <vaultAddress>
```

Then send the wstETH from the vault to the Distributor contract using `collectERC20`, passing the retrieved `<wstethAmount>`:

```bash
yarn start contracts vault w collect-erc20 <vaultAddress> <wstethAddress> <distributorAddress> <wstethAmount>
```

### 7.4. Add wstETH as a supported distribution token

If wstETH is not yet registered in the Distributor, add it:

```bash
yarn start dw uc distributor w add-token <poolAddress> <wstethAddress>
```

### 7.5. Generate the Merkle tree, upload to IPFS, and set the root

The CLI provides a single command that handles the entire distribution flow:

1. Calculates each user's share based on their balance at the time of distribution.
2. Builds a Merkle tree mapping each user to their cumulative claimable amount.
3. Transfers tokens to the Distributor contract (if not already transferred).
4. Sets the Merkle root and CID on-chain.
5. Saves file locally so you can upload and pin to IPFS provider of choice

```bash
yarn start dw uc distributor w distribute <poolAddress> <wstethAddress> <amount> \
  --mode=snapshot \
  --output-path ./distribution.json
```

**Options:**

| Option                                        | Description                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `--blacklist <addresses>`                     | Addresses to exclude from distribution                                    |
| `--from-block <block>` / `--to-block <block>` | Block range for processing transfer events                                |
| `--output-path <path>`                        | Path to save the distribution JSON                                        |
| `--upload [pinningUrl]`                       | Upload the Merkle tree to an IPFS pinning service                         |
| `--skip-transfer`                             | Skip transferring tokens to the Distributor (if already done in step 7.3) |
| `--skip-set-root`                             | Generate the tree without setting the root on-chain                       |
| `--skip-write`                                | Skip writing the distribution JSON to file                                |

:::info
Since tokens were already transferred in step 7.3, use `--skip-transfer` to avoid a duplicate transfer:

```bash
yarn start dw uc distributor w distribute <poolAddress> <wstethAddress> <amount> \
  --skip-transfer \
  --mode=snapshot \
```

:::

The caller must have `MANAGER_ROLE` on the Distributor contract.

### 7.6. Verify the distribution

Check the Distributor state to confirm the distribution was successful:

```bash
yarn start dw uc distributor r state <poolAddress>
```

Verify the following fields in the output:

- **Merkle Root** — must be a non-zero value, indicating the Merkle tree has been set
- **CID** — must contain a valid IPFS CID, confirming the distribution data was uploaded to IPFS. You can open the CID via an IPFS gateway to inspect which tokens and amounts were distributed
- **Last Processed Block** — shows the block number at which the distribution was made

### 7.7 Upload distribution to IPFS and pin the file

When uploading the distribution to IPFS it's important to set CID to v0 format.

---

## User: claiming funds

After the operator has distributed assets and published the Merkle tree, users can claim their share on the UI.

:::info
For `stvStrategyPool` users must perform first step of withdrawal via UI to request funds back from underlying DeFi-strategy to proxy balance.
:::

### Claiming with UI

Even when vault is disconnected users will be able to use UI:

- request and claim withdrawals from underlying strategy vaults
- claim any previous claimable withdrawals from pool's `WithdrawalQueue`
- claim any distributed funds. In case of `stvStrategyPool` token are distributed to proxies but funds can be claimed via UI

### Claiming with CLI

If you want you can claim funds on behalf of the users via CLI, but this will produce 1 transaction per user per token(batch transactions are supported via CLI and WalletConnect)

Claim:

```bash
yarn start dw uc distributor w claim <poolAddress>
```

You can adjust command with options:

- `--recipients [addresses...]` - listing only specific address to claim for
- `--tokens [addresses...]` - listing only specific tokens to claim
- `--print-only` - only print planned claim

### Claiming ETH from previously requested withdrawals with CLI

If the user had requested withdrawals before the disconnect, those requests were finalized by the operator during [Step 3](#step-3-pause-withdrawals-and-finalize-pending-requests). The ETH is ready but still held by the Withdrawal Queue — the user must explicitly claim it to receive it in their wallet:

```bash
# Claim a single request
yarn start dw c wq w claim-withdrawal <withdrawalQueueAddress> <requestId> <recipientAddress>

# Claim multiple requests
yarn start dw c wq w claim-withdrawals <withdrawalQueueAddress> <requestIds> <hints> <recipientAddress>
```

:::info
The Withdrawal Queue remains functional for claims even after the pool is disconnected. Users can claim at any time.
:::
