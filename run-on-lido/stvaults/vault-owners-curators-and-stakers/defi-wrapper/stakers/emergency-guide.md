---
sidebar_position: 4
---

# Stakers' Emergency Guide

A withdrawal request settles when someone calls `finalize` on the pool's withdrawal queue, and only the
holder of `FINALIZE_ROLE` can make that call — the Node Operator, by default. Nothing else in the system
settles a request, and nothing does it on a schedule. If that address stops acting, requests accumulate and
the queue stands still.

This page covers what can be done about it: what a depositor can do alone, and what to ask the Vault Owner or
curator for. The ordinary flow is described in [Supply and withdraw](./supply-withdraw.md).

## Step 1. Check whether the request is already finalized

Finalization and claiming are separate steps, so a finalized request may just be waiting to be collected.
Claiming cannot be paused and keeps working after the stVault is disconnected, so check this first.

<details>
  <summary>using the DeFi Wrapper widget</summary>

Connect your wallet and open the pool's status panel. Requests are split in two: **Pending withdrawal
requests** are still waiting on the operator, while **Available to claim** lists the finalized ones with a
**Claim** button on each.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
# status of one request
yarn start dw c wq r w-status <withdrawalQueueAddress> <requestId>

# every request this address owns
yarn start dw c wq r withdrawalRequestsOf <withdrawalQueueAddress> <ownerAddress>
```

If a request reports as finalized, claim it:

```bash
yarn start dw c wq w claim-withdrawal <withdrawalQueueAddress> <requestId> <recipientAddress>
```

</details>

## Step 2. Clear what a depositor can clear

None of the calls below finalizes anything. They clear conditions that can block the queue from the outside,
and all of them are permissionless — a depositor can make them without holding any role.

**The oracle report may be stale.** Without a fresh one, new requests and deposits are refused. A request
also needs a report that landed after it was created: finalization stops at the first request newer than the
latest report. Anyone can apply a report:

```bash
yarn start report w submit -v <vaultAddress>
```

**Unassigned liability freezes the whole pool.** While the vault owes more stETH than the pool has on record,
every movement of stv reverts. Finalization burns the stv behind each request it settles, so the whole call
reverts with it, and no new request can be filed either. See
[Unassigned liability](../vault-owners-and-curators/metrics.md#unassigned-liability).

Anyone can clear it — neither route has a role check, and both are capped at the outstanding amount. They
differ in who pays:

```bash
# out of the vault's own ETH: lowers Total Value, so every stv holder pays a share
yarn start dw c stv-steth w rebalance-unassigned-liability <poolAddress> <stethShares>

# out of the caller's ETH
yarn start dw c stv-steth w rebalance-unassigned-liability-with-ether <poolAddress> <ether>
```

**An unhealthy vault has nothing to pay out with.** Finalization draws on the vault's withdrawable value, and
a vault below its Forced Rebalance Threshold has none — the whole Total Value is locked as collateral, so a
run stops on its first request. Restoring the vault is permissionless, and it is the one force-rebalance that
unblocks the queue:

```bash
yarn start contracts hub w v-force-rebalance <vaultAddress>
```

See [Rebalance](../../basic-stvaults/rebalance.md) for what this costs the vault.

## Step 3. Ask for what needs a role

Everything past this point needs an address a depositor does not control. Each action below names the role it
requires, which is also what identifies who can perform it.

### Hand `FINALIZE_ROLE` to someone else

This is the remedy for an operator who has stopped acting. `FINALIZE_ROLE` is administered by
`DEFAULT_ADMIN_ROLE` on the queue, which the Factory grants to the Timelock Controller, so governance can take
the role off the unresponsive holder and give it to another address. Both steps are timelock proposals:
propose, wait out the delay, execute with the **same salt**.

```bash
yarn start dw uc tg wq w propose-grant-role \
  <timelockAddress> <withdrawalQueueAddress> FINALIZE_ROLE <newFinalizerAddress> --salt <salt>

yarn start dw uc tg wq w execute-grant-role \
  <timelockAddress> <withdrawalQueueAddress> FINALIZE_ROLE <newFinalizerAddress> --salt <salt>
```

:::warning
There is no timeout after which anyone may finalize, and no automatic escape hatch. A request does not become
claimable by waiting long enough — it becomes claimable when someone with `FINALIZE_ROLE` acts, or when
governance moves that role to an address that will. Escalate rather than wait.
:::

### Bring ETH back from validators

Finalization pays out of the vault's balance, so a queue that has outrun its ETH stays stuck whoever holds
the role. Validators have to be exited, and the Vault Owner can do that **without the Node Operator** through
the Dashboard, which submits an EIP-7002 withdrawal request directly:

```bash
yarn start contracts dashboard w trigger-validator-withdrawal \
  <dashboardAddress> <pubkeys> <amounts> <recipientAddress>
```

This needs `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` and ETH to cover the protocol's withdrawal fee, which is
dynamic — send a surplus, the excess is refunded to the recipient. See
[Control validators](../../basic-stvaults/control-validators.md).
