---
sidebar_position: 5
title: Disconnect stVault with DeFi Wrapper from VaultHub
sidebar_label: Disconnect from VaultHub
---

# Disconnect stVault with DeFi Wrapper from VaultHub

This guide walks through the full process of disconnecting a DeFi Wrapper (pooled staking product) from the Lido protocol and distributing remaining assets to users.

:::warning
Disconnecting a DeFi Wrapper is an irreversible operation that affects all pool users. Tell your users the timeline and the plan before you begin.
:::

## Overview

1. **Assign required roles** to a trusted actor via the Timelock Controller.
2. **Exit all validators** (voluntarily or forcibly).
3. **Pause withdrawals** on the Withdrawal Queue and **finalize all pending withdrawal requests**.
4. **Pause deposits and minting** on the Pool contract.
5. **Rebalance the Staking Vault** to zero liability.
6. **Disconnect the stVault** — follow the [stVault disconnection guide](../../basic-stvaults/disconnection.md) (initiate voluntary disconnect, apply oracle report, abandon Dashboard, accept ownership).
7. **Withdraw assets** from the Staking Vault and **distribute them to users** via the Distributor.

Steps 1–5 are DeFi Wrapper-specific and covered below. Step 6 follows the standard stVault disconnect flow. Step 7 covers asset distribution and user claiming.

---

## Before you start: get contract addresses

To view all contract addresses for your pool at once:

```bash
yarn start dw uc wo info <poolAddress>
```

This prints the Vault, Dashboard, WithdrawalQueue, Distributor, and other addresses in a single command. You will need these addresses throughout the guide.

---

## Step 1. Assign required roles

The disconnect process requires multiple roles across the Pool, Withdrawal Queue, and Dashboard contracts. Grant these roles to a trusted actor via the Timelock Controller.

| Role                                | Contract         | Purpose                                                       |
| ----------------------------------- | ---------------- | ------------------------------------------------------------- |
| `LOSS_SOCIALIZER_ROLE`              | Pool             | Force rebalance undercollateralized users                     |
| `DEPOSITS_PAUSE_ROLE`               | Pool             | Pause new deposits                                            |
| `MINTING_PAUSE_ROLE`                | Pool             | Pause stETH minting                                           |
| `WITHDRAWALS_PAUSE_ROLE`            | Withdrawal Queue | Pause new withdrawal requests                                 |
| `FINALIZE_ROLE`                     | Withdrawal Queue | Finalize pending withdrawal requests                          |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Dashboard        | Force validator exits                                         |
| `REBALANCE_ROLE`                    | Dashboard        | Rebalance the vault                                           |
| `VOLUNTARY_DISCONNECT_ROLE`         | Dashboard        | Call `voluntaryDisconnect()` directly (Step 6)                |
| `COLLECT_VAULT_ERC20_ROLE`          | Dashboard        | Transfer wstETH from vault to Distributor via `collectERC20` (Step 7.2) |
| `MANAGER_ROLE`                      | Distributor      | `add-token`, `distribute`, and Merkle root updates (Steps 7.3–7.4); pre-granted to `--nodeOperatorManager` unless a different actor distributes |

:::info
`VOLUNTARY_DISCONNECT_ROLE` is only needed if `trustedActor` calls `voluntaryDisconnect()` directly. If using a Timelock Controller that already holds `DEFAULT_ADMIN_ROLE` on the Dashboard, this grant can be skipped.

`COLLECT_VAULT_ERC20_ROLE` is only needed if `trustedActor` (not the vault owner) performs Step 7.2 (`collect-erc20`).

:::

:::warning
`MANAGER_ROLE` on the Distributor is a custody decision rather than an operational one. Its holder sets the Merkle root directly — no delay, and no on-chain check that the tree matches what was actually transferred — so a wrong or malicious root redirects every **unclaimed** token. Amounts users have already claimed are safe, because claims are cumulative per recipient and token, but the remaining balance stays exposed until it is all claimed.
:::

Schedule and execute a batch transaction through the Timelock Controller to grant the roles below. The example covers the seven grants that match the Pool, Withdrawal Queue, and Dashboard **rebalance / pause / exit** path. If `trustedActor` must also call `voluntaryDisconnect()` or `collectERC20` on the Dashboard without going through an admin Timelock, append two more `grantRole` calls on the Dashboard for `VOLUNTARY_DISCONNECT_ROLE` and `COLLECT_VAULT_ERC20_ROLE`. `MANAGER_ROLE` is on the Distributor — grant it separately if the distributor is managed by a different address than `--nodeOperatorManager`.

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
yarn start contracts dashboard w trigger-validator-withdrawal <dashboardAddress> <pubkeys> <amounts> <recipient>
```

:::info
The call must carry the EIP-7002 withdrawal fee, charged per public key. The fee is set by the network and moves from block to block, rising when the withdrawal queue is busy, so read it with `calculateValidatorWithdrawalFee` on the `StakingVault` and send a surplus. The exact amount is taken and the excess is refunded to `<recipient>`.
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

After finalization, verify all requests are processed — the following should all return `0`:

```bash
yarn start dw c wq r unfinalizedRequestsNumber <withdrawalQueueAddress>
yarn start dw c wq r unfinal-stv <withdrawalQueueAddress>
yarn start dw c wq r unfinal-assets <withdrawalQueueAddress>
```

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
yarn start dw c stv-steth w pause-minting <poolAddress>
```

After pausing, any attempts to deposit ETH, mint stETH shares, or mint wstETH will revert.

:::warning
Pausing is one-way without governance. The factory hands out only the pause roles, so after deployment no address holds `DEPOSITS_RESUME_ROLE`, `MINTING_RESUME_ROLE` or `WITHDRAWALS_RESUME_ROLE`. Undoing Steps 3.1 and 4 therefore takes two rounds through the Timelock Controller: one to grant the resume role, another to call resume.

Be sure the disconnect is going ahead before you pause. Abandoning it halfway leaves the pool frozen for its users until governance unfreezes it.
:::

---

## Step 5. Rebalance the Staking Vault to zero liability

### 5.1. Force rebalance undercollateralized users (if any)

Close any undercollateralized position — one whose stETH liability exceeds the value of its stv — before disconnecting. You can skip this and `rebalanceVaultWithShares` will still bring vault liability to zero, but then the shortfall comes out of vault ETH: the loss lands on everyone else while the undercollateralized user keeps their stv.

To avoid this, force-close each unhealthy position by calling `Pool.forceRebalanceAndSocializeLoss()` from an account with `LOSS_SOCIALIZER_ROLE`:

```bash
yarn start dw uc h w force-rebalance-and-socialize-loss <poolAddress> <accountAddress>
```

This burns the account's stv, repays its stETH liability as far as it goes, and spreads whatever is left over the remaining participants. Add `--dry-run` to preview without sending.

:::info
To identify undercollateralized accounts, use the health monitoring command:

```bash
yarn start dw uc h r list-unhealthy <poolAddress>
```

This lists all positions that have breached the forced rebalance threshold. Run `force-rebalance-and-socialize-loss` for each account in the output.
:::

:::warning
`forceRebalanceAndSocializeLoss` requires a fresh oracle report. Apply one before running this step.

The pool has a `maxLossSocializationBP` limit that caps how much loss one call may socialize, and it is **`0` by default** — so on a fresh pool this step reverts with `ExcessiveLossSocialization` until the limit is raised.

Raising it is `setMaxLossSocializationBP` on the pool, gated by `DEFAULT_ADMIN_ROLE`, which means a proposal through the Timelock Controller. The CLI has a helper for it, but that helper impersonates the timelock and therefore only works against a forked network — on mainnet or Hoodi, schedule the call the usual way. Do this before Step 5.1, not during it.
:::

### 5.2. Rebalance the vault

Check the current liability:

```bash
yarn start contracts dashboard r liability-shares <dashboardAddress>
```

Call `Dashboard.rebalanceVaultWithShares(liabilityShares)` from an account with `REBALANCE_ROLE`, passing the full `liabilityShares` amount to bring the liability to zero:

```bash
yarn start contracts dashboard w rebalance-shares <dashboardAddress> <liabilityShares>
```

:::warning
The disconnect will revert with `NoLiabilitySharesShouldBeLeft` if any liability shares remain. Ensure `Dashboard.liabilityShares()` returns `0` before proceeding.
:::

---

## Step 6. Disconnect the stVault

Follow the [stVault disconnection guide](../../basic-stvaults/disconnection.md) to complete the disconnection:

1. **Initiate voluntary disconnect** — schedule and execute `Dashboard.voluntaryDisconnect()` through the Timelock Controller. Requires a fresh oracle report.
2. **Apply the next oracle report** — finalizes the disconnection.
3. **Abandon Dashboard** — call `Dashboard.abandonDashboard(newOwner)` from the Timelock Controller.
4. **Accept ownership** — call `StakingVault.acceptOwnership()` from the `newOwner` address.

:::danger
**Choose `newOwner` carefully: from this step until Step 7, that one address holds every depositor's ETH.**

Use an address already trusted with the pool, never a personal key. The timelock is the safest choice but makes Step 7 manual: the CLI's `propose-operation` does not know the StakingVault, so `acceptOwnership`, `withdraw` and `collectERC20` would each need hand-built calldata and its own delay. The multisig behind the timelock keeps the CLI usable at the cost of that delay.

Either way, keep the window short — Step 7 is what puts the funds back behind something users can act on themselves.
:::

---

## Step 7. Withdraw assets and distribute to users

After disconnection, remaining ETH in the vault must be distributed to pool users through the Distributor contract.

### 7.1. Convert vault ETH to an ERC-20

The Distributor only moves ERC-20 tokens, so the vault's ETH has to become one first. Either wstETH or wETH works, and the choice is economic rather than technical:

| Token | While the tokens sit unclaimed | Consider it when |
| --- | --- | --- |
| **wstETH** | keeps accruing staking rewards | users may take weeks to claim, and you want them to keep earning meanwhile |
| **wETH** | holds a flat ETH value | you want the amounts to stay exactly what was distributed, with no rate to explain |

wstETH is the usual choice for that first reason. Whichever you pick, the rest of Step 7 is identical — substitute its address wherever the commands below say wstETH.

The conversion needs no extra step in either case: both contracts mint to the sender on receiving ETH — wstETH stakes it, wETH wraps it — so a single `withdraw` call to the token's address does the job.

First, retrieve the available balance of the vault:

```bash
yarn start contracts vault r available-balance <vaultAddress>
```

Use the value returned as `<amountInETH>` in the next command. Call `StakingVault.withdraw(recipient, amount)` with the **token contract address** as the recipient:

```bash
yarn start contracts vault w withdraw <vaultAddress> <tokenAddress> <amountInETH>
```

After this call, the vault holds that token rather than ETH.

:::info
Make sure you account for the Initial Connect Deposit (1 ETH) that was unlocked after disconnect — it is now part of the available balance.
:::

### 7.2. Transfer wstETH to the Distributor

First, retrieve the wstETH balance of the vault:

```bash
yarn start account r info <vaultAddress>
```

Then send the wstETH from the vault to the Distributor contract using `collectERC20`, passing the retrieved `<wstethAmount>`:

```bash
yarn start contracts vault w collect-erc20 <vaultAddress> <wstethAddress> <wstethAmount> <distributorAddress>
```

### 7.3. Add wstETH as a supported distribution token

If wstETH is not yet registered in the Distributor, add it:

```bash
yarn start dw uc distributor w add-token <poolAddress> <wstethAddress>
```

### 7.4. Generate the Merkle tree, upload to IPFS, and set the root

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
| `--skip-transfer`                             | Skip transferring tokens to the Distributor (if already done in step 7.2) |
| `--skip-set-root`                             | Generate the tree without setting the root on-chain                       |
| `--skip-write`                                | Skip writing the distribution JSON to file                                |

:::info
Since tokens were already transferred to distributor in step 7.2, use `--skip-transfer` to avoid a duplicate transfer:

```bash
yarn start dw uc distributor w distribute <poolAddress> <wstethAddress> <amount> \
  --skip-transfer \
  --mode=snapshot \
  --output-path=<path>
```

:::

:::info
The caller must have `MANAGER_ROLE` on the Distributor contract. This role is granted upon pool creation to the `--nodeOperatorManager` address.
:::

### 7.5. Verify the distribution

Check the Distributor state to confirm the distribution was successful:

```bash
yarn start dw uc distributor r state <poolAddress>
```

Verify the following fields in the output:

- **Merkle Root** — must be a non-zero value, indicating the Merkle tree has been set
- **CID** — must contain a valid IPFS CID, confirming the distribution data was uploaded to IPFS. You can open the CID via an IPFS gateway to inspect which tokens and amounts were distributed
- **Last Processed Block** — shows the block number at which the distribution was made

### 7.6. Upload distribution to IPFS and pin the file

Upload the saved `distribution.json` manually to your IPFS pinning provider.

When uploading, ensure the resulting CID is in **CIDv0 format** (starts with `Qm`). CIDv1 CIDs are not supported. Most pinning services produce CIDv0 by default when uploading a raw file.

Pin the file with your provider to ensure it remains accessible. After pinning, you can verify the content is reachable via any IPFS gateway.

### 7.7. Distribution complete

The distribution is now configured. Users can verify their allocation by opening the CID via an IPFS gateway and locating their address in the Merkle tree.

Users can claim their funds — see [User: claiming funds](#user-claiming-funds) below.

---

## User: claiming funds

After the operator has distributed assets and published the Merkle tree, users can claim their share on the UI.

:::info
For `stvStrategyPool` users must first request withdrawal from the underlying DeFi strategy before claiming distributed funds. This pulls funds from the strategy vault back to the proxy balance. The strategy address was shown at pool creation time — if you no longer have it, ask the pool operator.
:::

### Claiming with UI

:::info
If the UI is unavailable, contact the pool operator for contract addresses and run the UI locally, or use the CLI commands in the next section.
:::

The UI keeps working after the vault is disconnected. Users can still:

- request and claim withdrawals from underlying strategy vaults
- claim any previous claimable withdrawals from pool's `WithdrawalQueue`
- claim any distributed funds. In case of `stvStrategyPool`, tokens are distributed to proxies but funds can be claimed via UI

### Claiming with CLI

#### Claim distributed funds

You can claim on behalf of users from the CLI. It costs one transaction per user per token, though the CLI and WalletConnect support batching.

Claim:

```bash
yarn start dw uc distributor w claim <poolAddress>
```

You can adjust command with options:

- `--recipients [addresses...]` - listing only specific address to claim for
- `--tokens [addresses...]` - listing only specific tokens to claim
- `--print-only` - only print planned claim

#### stvStrategyPool: claiming distributed funds via CLI

For `stvStrategyPool` the Distributor distributes tokens to each user's **strategy proxy** contract, not directly to the user's wallet. To receive funds, users must first claim to the proxy, then transfer from the proxy to their wallet.

**Step 1.** Find your proxy address:

```bash
yarn start dw c str r proxy-of <strategyAddress> <userAddress>
```

**Step 2.** Claim wstETH to your proxy from the Distributor:

```bash
yarn start dw uc distributor w claim <poolAddress> --recipients <proxyAddress>
```

**Step 3.** Transfer wstETH from the proxy to your wallet:

```bash
yarn start dw c str w safe-transfer-erc20 <proxyAddress> <wstethAddress> <userAddress> <amount>
```

The `<amount>` is in decimal wstETH format (e.g. `1.5`), not raw wei.

:::info
The strategy address was provided at pool creation time via `create-strategy-pool-lido-earn-eth`. If you no longer have it, ask the pool operator.
:::

### Claiming ETH from previously requested withdrawals with CLI

If the user had requested withdrawals before the disconnect, those requests were finalized by the operator during [Step 3](#step-3-pause-withdrawals-and-finalize-pending-requests). The ETH is ready but still held by the Withdrawal Queue — the user must explicitly claim it to receive it in their wallet.

First, retrieve the user's withdrawal request IDs:

```bash
yarn start dw c wq r withdrawalRequestsOf <withdrawalQueueAddress> <ownerAddress>
```

Then claim the withdrawal(s):

```bash
# Claim a single request
yarn start dw c wq w claim-withdrawal <withdrawalQueueAddress> <requestId> <recipientAddress>

# Claim multiple requests
yarn start dw c wq w claim-withdrawals <withdrawalQueueAddress> <requestIds> <recipientAddress>
```

:::info
The Withdrawal Queue remains functional for claims even after the pool is disconnected. Users can claim at any time.
:::
