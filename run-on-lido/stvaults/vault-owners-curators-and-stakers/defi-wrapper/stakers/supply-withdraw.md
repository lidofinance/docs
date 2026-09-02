---
sidebar_position: 2
---

# Supply and Withdraw ETH

How to put ETH into a DeFi Wrapper pool and get it back out, through the Web UI or directly against the contracts.

## What a depositor holds

Depositing ETH into a pool mints **stv**, an ERC-20 claim on the pool's share of the underlying stVault. It is transferable, and it grows in value as the vault earns — nothing is ever distributed to holders, the token just becomes worth more ETH.

$$
\text{assets} = \text{stv}_{\text{account}} \times \frac{\text{totalAssets}}{\text{totalSupply}}
$$

Getting ETH back goes through a queue rather than a swap, because the ETH usually has to be returned from validators first.

## Supplying

What a deposit does depends on the pool type. All three mint stv; the difference is what happens next in the same transaction.

**Plain pool** — ETH in, stv out, nothing else.

**Minting pool** — a depositor may also mint stETH or wstETH against their own stv, either in the same transaction or at any time afterwards. The amount is theirs to choose, bounded by their own [minting capacity](../../../concepts-and-reference/defi-wrapper-technical-design.md#33-stvstethpool). Minting records a debt against the account and locks the stv that collateralises it.

**Strategy pool** — deposits go through the strategy, which mints wstETH on the depositor's behalf and forwards it into the external protocol. The stv and the debt live on a per-user forwarder contract rather than on the depositor's own address, which is why the strategy is the contract to interact with rather than the pool.

<details>
  <summary>using the DeFi Wrapper widget</summary>

1. Open the pool's widget and connect your wallet.
2. Enter the amount on the **Deposit** tab and confirm.

For a minting pool the form also shows what you would be able to mint against the deposit, with the reserve ratio applied. For a strategy pool the deposit is routed through the strategy automatically — you do not choose the path.

If the pool has an allowlist, an address that is not on it cannot deposit.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
# Plain pool
yarn start dw c stv w deposit-eth <poolAddress> <amountInETH> <referralAddress>

# Minting pool: deposit and mint in one call
yarn start dw c stv-steth w deposit-eth-shares <poolAddress> <amountInETH> <stethShares> <referralAddress>
yarn start dw c stv-steth w deposit-eth-wsteth <poolAddress> <amountInETH> <wstethAmount> <referralAddress>

# Mint or repay later, independently of any deposit
yarn start dw c stv-steth w mint-steth-shares <poolAddress> <stethShares>
yarn start dw c stv-steth w burn-steth-shares <poolAddress> <stethShares>
```

Pass `0` as the referral if there is none. `deposit-eth` accepts `-s, --receiver` to credit the stv to a different address.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **pool** contract by its address — you can find it on the [Environments](../../../concepts-and-reference/architecture-overview.md#environments) page or from the product operator.
2. Call `depositETH`, passing the recipient and the referral address, with the ETH amount as the payable value.
3. On a minting pool, call `mintStethShares` or `mintWsteth` afterwards to borrow against the position.

The oracle report has to be fresh for either call to go through — see below.

</details>

## Oracle reports

The pool prices stv from the last oracle report, so a deposit or a withdrawal request made against a stale report would use a stale rate. Rather than allow that, the contracts reject it: the call reverts with `VaultReportStale`.

Applying a report is **permissionless** — `LazyOracle.updateVaultData` can be called by anyone, and it is the same report for the whole vault. In practice it rarely has to be done by hand:

- **In the widget** it is invisible. When the report is stale the interface prepends `updateVaultData` to the same transaction batch as the deposit or withdrawal, so one confirmation covers both.
- **On the CLI or Etherscan** it has to be applied first, as a separate call.

<details>
  <summary>checking and applying a report</summary>

```bash
# Is the pool's vault report fresh?
yarn start dw uc wo report-fresh <poolAddress>

# Apply the latest report to the vault
yarn start report w submit -v <vaultAddress>
```

The second command fetches the report data and proof and submits them. See [Apply oracle reports](../../basic-stvaults/apply-oracle-reports.md) for what it does under the hood.

</details>

## Withdrawing

A withdrawal is three stages, and the depositor drives only the first and the last:

1. **You request.** Your stv moves to the Withdrawal Queue and the request records what it is worth. Nothing is paid yet.
2. **The operator finalizes.** Once enough ETH is back on the vault and the delay has passed, the Node Operator settles a batch of requests and locks the ETH for them.
3. **The depositor claims.** The locked ETH is transferred to the address named in the call.

The wait between stages 1 and 2 is set by how long validators take to exit, not by the pool. The pool's own minimum delay is one hour in every shipped configuration; the Consensus Layer exit queue is what determines the timeline.

Two bounds apply to a request, and they are measured differently: the **minimum** of 0.001 ETH is measured on what the request will pay out, while the **maximum** of 10,000 ETH is measured on the gross value of the stv. Split a larger exit into several requests.

:::info
An account that has minted stETH can have a request carry part of that debt and settle it on the way out. The payout is then the value of the stv **minus** the debt settled — see [what a claim pays out](../../../concepts-and-reference/defi-wrapper-technical-design.md#what-a-claim-pays-out). That is not a loss: the stETH minted earlier stays with the account.
:::

<details>
  <summary>using the DeFi Wrapper widget</summary>

1. Open the **Withdraw** tab, enter the amount of stv and confirm the request.
2. Wait. The widget lists your requests and their status.
3. When a request shows as finalized, claim it.

If you hold minted stETH, the form shows how much of it the request will repay and what your position looks like afterwards. Claiming resolves the checkpoint hint for you.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
# Request: stv to withdraw, stETH shares to settle (0 if none), owner of the request
yarn start dw c wq w request-withdrawal <withdrawalQueueAddress> <stv> <stethShares> <ownerAddress>

# Track it
yarn start dw c wq r w-status <withdrawalQueueAddress> <requestId>

# Claim once finalized
yarn start dw c wq w claim-withdrawal <withdrawalQueueAddress> <requestId> <recipientAddress>
yarn start dw c wq w claim-withdrawals <withdrawalQueueAddress> <requestIds> <recipientAddress>
```

The `owner` you pass at request time is the only address that can later claim. `claim-withdrawal` finds the checkpoint hint itself.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **pool** contract, then approve the Withdrawal Queue to spend your stv.
2. Navigate to the **WithdrawalQueue** contract and call `requestWithdrawal`, passing the owner, the stv amount and the stETH shares to settle (`0` if none).
3. Once the request is finalized, call `claimWithdrawal`, passing the recipient and the request id.

Check `getWithdrawalStatus` for a request's state, and `getClaimableEther` for what it will pay.

</details>

## Withdrawing from a strategy pool

The depositor's stv sits on the strategy forwarder and is encumbered by the wstETH minted against it, so the position has to be unwound before the queue is involved. Every call goes to the **strategy**, not the pool:

1. `requestExitByWsteth` — leave the external protocol. With Lido EarnETH this queues a redemption that settles later.
2. `finalizeRequestExit` — collect it, once the external queue has settled. Separate transaction, because the wait is not yours to control.
3. `burnWsteth` — repay the debt with the recovered wstETH, which frees the stv behind it.
4. `requestWithdrawalFromPool` — file the queue request, passing **the depositor's own address** as the recipient so the request is theirs to claim.

From there it is the ordinary path: the operator finalizes, and the depositor claims — directly from the Withdrawal Queue, not through the strategy.

The widget batches steps 3 and 4, together with any report update, into a single confirmation. Steps 1 and 2 stay separate. The full sequence with a diagram is in [Withdrawal](../../../concepts-and-reference/defi-wrapper-technical-design.md#43-withdrawal).

## If the queue stops moving

Only the holder of `FINALIZE_ROLE` — the Node Operator by default — can finalize requests, and no permissionless fallback exists. A request that stays unfinalized is waiting on the operator: first for the validator exits, then for them to call finalize.

There is a route that does not depend on that operator, but it runs through the pool's governance rather than through the depositor: `FINALIZE_ROLE` is administered by the Timelock Controller, which can grant it to another address.

**Claiming keeps working regardless.** It is not pausable, and it survives the vault being disconnected from Lido Core. Once ETH is locked against a finalized request, nothing in the system can hold it back.
