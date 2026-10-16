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
yarn start dw uc wo r info <poolAddress>
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
| `REBALANCE_ROLE`                    | Dashboard        | Rebalance the stVault                                           |
| `VOLUNTARY_DISCONNECT_ROLE`         | Dashboard        | Call `voluntaryDisconnect()` directly (Step 6)                |
| `MANAGER_ROLE`                      | Distributor      | `add-token`, `distribute`, and Merkle root updates (Steps 7.3–7.4); pre-granted to `--nodeOperatorManager` unless a different actor distributes |

:::info
Every Dashboard role above is checked with `onlyRoleMemberOrAdmin`, which also passes for holders of the role's admin. None of them has an explicit admin, so the admin is `DEFAULT_ADMIN_ROLE` — the Timelock Controller. A timelock that already holds `DEFAULT_ADMIN_ROLE` on the Dashboard can call `triggerValidatorWithdrawals`, `rebalanceVaultWithShares` and `voluntaryDisconnect` without any of these grants; they exist so a separate trusted actor can act without a delay each time.
:::

:::danger
`MANAGER_ROLE` on the Distributor is a custody decision rather than an operational one. Its holder sets the Merkle root directly — no delay, and no on-chain check that the tree matches what was actually transferred — so a wrong or malicious root redirects every **unclaimed** token. Amounts users have already claimed are safe, because claims are cumulative per recipient and token, but the remaining balance stays exposed until it is all claimed.
:::

Schedule and execute a batch transaction through the Timelock Controller to grant the roles below. The example covers the seven grants that match the Pool, Withdrawal Queue, and Dashboard **rebalance / pause / exit** path. If the trusted actor must also call `voluntaryDisconnect()` without going through an admin Timelock, append one more `grantRole` call on the Dashboard for `VOLUNTARY_DISCONNECT_ROLE`. `MANAGER_ROLE` is on the Distributor — grant it separately if the distributor is managed by a different address than `--nodeOperatorManager`.

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

`<pubkeys>` and `<amounts>` are comma-separated lists of equal length. Pass `0` for every amount — a zero amount means a **full** exit, which is what this step needs; a non-zero amount is a partial withdrawal.

:::info
The call must carry the EIP-7002 withdrawal fee, charged per public key. The fee is set by the network and moves from block to block, rising when the withdrawal queue is busy. The command reads it with `calculateValidatorWithdrawalFee` on the `StakingVault` and sends exactly that — it adds no surplus, so if the fee rises between the read and inclusion the transaction reverts and you simply resend. The contract takes only what it needs and refunds any excess to `<recipient>`.
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

`finalize` checks for a fresh oracle report and reverts without one, so apply a report first.

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
Pausing is one-way without governance. The factory hands out only the pause roles, so after deployment no address holds `DEPOSITS_RESUME_ROLE`, `MINTING_RESUME_ROLE` or `WITHDRAWALS_RESUME_ROLE`. Undoing Steps 3.1 and 4 therefore goes through the Timelock Controller: grant the resume role, then call resume. Batch both into one `scheduleBatch` and it costs a single delay.

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
yarn start dw uc h r calculate-rebalance-need <poolAddress> --verbose
```

`--verbose` adds a per-account breakdown with an **Undercollateralized** column; run `force-rebalance-and-socialize-loss` only for the accounts marked there.
:::

:::warning
`forceRebalanceAndSocializeLoss` requires a fresh oracle report. Apply one before running this step.

The pool has a `maxLossSocializationBP` limit that caps how much loss one call may socialize, and it is **`0` by default** — so on a fresh pool this step reverts with `ExcessiveLossSocialization` until the limit is raised.

Raising it is `setMaxLossSocializationBP` on the pool, gated by `DEFAULT_ADMIN_ROLE`, which means a proposal through the Timelock Controller:

```bash
yarn start dw uc tg p w propose-set-max-loss-socialization-bp <timelock> <poolAddress> <maxSocializablePortionBP>
yarn start dw uc tg p w execute-set-max-loss-socialization-bp <timelock> <poolAddress> <maxSocializablePortionBP>
```

Do this before Step 5.1, not during it.
:::

### 5.2. Rebalance the stVault

Check the current liability:

```bash
yarn start contracts dashboard r liability-shares <dashboardAddress>
```

That read prints the raw on-chain value; `rebalance-shares` below expects it scaled down by 18 decimals, so divide by `1e18` before passing it on.

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

After disconnection, remaining ETH in the stVault must be distributed to pool users through the Distributor contract.

Steps 7.1 and 7.2 write to the `StakingVault`, which is `onlyOwner` once disconnected, so run them from the `newOwner` address chosen in Step 6. No Dashboard role applies here.

### 7.1. Convert vault ETH to an ERC-20

The Distributor only moves ERC-20 tokens, so the stVault's ETH has to become one first. Either wstETH or wETH works, and the choice is economic rather than technical:

| Token | While the tokens sit unclaimed | Consider it when |
| --- | --- | --- |
| **wstETH** | keeps accruing staking rewards | users may take weeks to claim, and you want them to keep earning meanwhile |
| **wETH** | holds a flat ETH value | you want the amounts to stay exactly what was distributed, with no rate to explain |

wstETH is the usual choice for that first reason. Whichever you pick, the rest of Step 7 is identical — substitute its address wherever the commands below say wstETH.

The conversion needs no extra step in either case: both contracts mint to the sender on receiving ETH — wstETH stakes it, wETH wraps it — so a single `withdraw` call to the token's address does the job.

First, retrieve the available balance of the stVault:

```bash
yarn start contracts vault r available-balance <vaultAddress>
```

That read prints wei; `<amountInETH>` below is in ETH, so divide by `1e18` first. Call `StakingVault.withdraw(recipient, amount)` with the **token contract address** as the recipient:

```bash
yarn start contracts vault w withdraw <vaultAddress> <tokenAddress> <amountInETH>
```

After this call, the stVault holds that token rather than ETH.

:::info
Make sure you account for the Initial Connect Deposit (1 ETH) that was unlocked after disconnect — it is now part of the available balance.
:::

### 7.2. Transfer wstETH to the Distributor

First, retrieve the wstETH balance of the stVault:

```bash
yarn start account r info <vaultAddress>
```

Then send the wstETH from the stVault to the Distributor contract using `StakingVault.collectERC20`, passing the retrieved `<wstethAmount>`:

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

1. Calculates each user's share — with `--mode=snapshot`, from their stv balance at `--to-block`.
2. Builds a Merkle tree mapping each user to their cumulative claimable amount.
3. Transfers tokens to the Distributor contract (if not already transferred).
4. Sets the Merkle root and CID on-chain.
5. Saves file locally so you can upload and pin to IPFS provider of choice

```bash
yarn start dw uc distributor w distribute <poolAddress> <wstethAddress> <amount> \
  --skip-transfer \
  --mode=snapshot \
  --output-path ./distribution.json
```

`--skip-transfer` is here because Step 7.2 already moved the tokens to the Distributor; without it this call would transfer them a second time.

**Options:**

| Option                                        | Description                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `--mode <integral\|snapshot>`                 | `integral` (default) weights by how long each user held; `snapshot` uses balances at `--to-block` |
| `--blacklist <addresses>`                     | Addresses to exclude from distribution                                    |
| `--from-block <block>` / `--to-block <block>` | Block range for processing transfer events                                |
| `--output-path <path>`                        | Path to save the distribution JSON                                        |
| `--upload [pinningUrl]`                       | Upload the Merkle tree to an IPFS pinning service                         |
| `--skip-transfer`                             | Skip transferring tokens to the Distributor (if already done in step 7.2) |
| `--skip-set-root`                             | Generate the tree without setting the root on-chain                       |
| `--skip-write`                                | Skip writing the distribution JSON to file                                |

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

Users can claim their funds — see below.

---

## User: claiming funds

After the operator has distributed assets and published the Merkle tree, users can claim their share on the UI.

:::info
For `StvStrategyPool` users must first request withdrawal from the underlying DeFi strategy before claiming distributed funds. This pulls funds from the strategy vault back to the proxy balance. The strategy address was shown at pool creation time — if you no longer have it, ask the pool operator.
:::

### Claiming with UI

:::info
If the UI is unavailable, contact the pool operator for contract addresses and run the UI locally, or use the CLI commands in the next section.
:::

The UI keeps working after the stVault is disconnected. Users can still:

- request and claim withdrawals from underlying strategy vaults
- claim any previous claimable withdrawals from pool's `WithdrawalQueue`
- claim any distributed funds. In case of `StvStrategyPool`, tokens are distributed to proxies but funds can be claimed via UI

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

#### StvStrategyPool: claiming distributed funds via CLI

For `StvStrategyPool` the Distributor distributes tokens to each user's **strategy proxy** contract, not directly to the user's wallet. To receive funds, users must first claim to the proxy, then transfer from the proxy to their wallet.

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
yarn start dw c str w safe-transfer-erc20 <strategyAddress> <wstethAddress> <userAddress> <amount>
```

The call goes to the **strategy**, not to the proxy. The strategy derives the caller's own proxy from `msg.sender`, so a proxy address is never passed in — which is what stops one user from reaching another's. Each user therefore runs this for themselves.

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
