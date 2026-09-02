---
sidebar_position: 2
---

# Manage Withdrawal Queue

Exits from a DeFi Wrapper pool do not settle on their own. Depositors file requests, the requests wait, and nothing pays them out until an account holding `FINALIZE_ROLE` — the Node Operator, by default — calls `finalize`. That gap is the operator's job: watch what the queue owes, bring back enough ETH from validators to cover it, and settle.

## Watching the queue

One command shows whether there is anything to settle and whether it can be settled right now:

```bash
yarn start dw uc wo withdrawal-status <poolAddress>
```

It prints the pool, queue and vault addresses, then the numbers that decide the next move:

| Field | What it reports |
| --- | --- |
| Is Report Fresh | whether finalization is possible at all right now |
| Requests to Finalize | how many requests are waiting |
| Unfinalized ETH | what those requests will pay out in total |
| ETH Available for Finalization | what the vault can cover today |
| **ETH to Withdraw from CL** | the shortfall — how much has to come back from validators |
| Is Finalization Paused | whether the feature has been paused |
| Min Withdrawal Delay | how long a request must sit before it can be settled |
| Finalization Gas Cost Coverage | the per-request deduction currently in force |

A non-zero **ETH to Withdraw from CL** is the signal to act: that much ETH must return from the Consensus Layer before those requests can be finalized.

<details>
  <summary>Reading individual values</summary>

Each figure is also available on its own, which is useful for scripting:

```bash
# Queue depth
yarn start dw c wq r unfinalizedRequestsNumber <withdrawalQueueAddress>
yarn start dw c wq r unfinal-assets <withdrawalQueueAddress>
yarn start dw c wq r unfinal-stv <withdrawalQueueAddress>
yarn start dw c wq r unfinalizedStethShares <withdrawalQueueAddress>

# The unfinalized range is lastFinalizedRequestId + 1 … lastRequestId
yarn start dw c wq r last-request-id <withdrawalQueueAddress>
yarn start dw c wq r last-finalized-request-id <withdrawalQueueAddress>

# A single request
yarn start dw c wq r w-status <withdrawalQueueAddress> <requestId>
yarn start dw c wq r get-claimable-ether <withdrawalQueueAddress> <requestIds> <hints>

# What the vault can pay from
yarn start contracts vault r available-balance <vaultAddress>
yarn start contracts vault r staged-balance <vaultAddress>
```

`get-claimable-ether` takes comma-separated **lists**, not a single id: request ids and their checkpoint hints. Find the hints with `findCheckpointHint`, or claim through the UI, which resolves them automatically.

`available-balance` excludes ETH staged for validator activations: that ETH is already committed and cannot settle a request.

</details>

## Bringing ETH back from validators

When the vault cannot cover the queue, ETH has to come back from the Consensus Layer. Three routes, with different owners:

```bash
# Ask the Node Operator to exit — emits an event, nothing more
yarn start contracts vault w no-val-exit <vaultAddress> <pubkeys>

# Node Operator exits directly, full exits only
yarn start contracts vault w eject-validators <vaultAddress> <pubkeys> <amounts> <refundRecipient>

# Owner-side EIP-7002 withdrawal, full or partial
yarn start contracts vault w trigger-v-w <vaultAddress> <pubkeys> <amounts> <refundRecipient>
```

The first is a request, not an action: `requestValidatorExit` emits `ValidatorExitRequested` per key and stops there. `eject-validators` is the Node Operator's own instrument — it is checked against the Node Operator address, cannot be delegated, and always performs full exits.

Both on-chain routes pay the EIP-7002 fee per public key. It is set by the network and rises while the withdrawal queue is congested, so read it with `calculateValidatorWithdrawalFee` and send a surplus; the excess is refunded.

An exit request has to clear the Consensus Layer exit queue and then the sweep before the ETH lands on the vault. Those two dominate the timeline; the queue's own minimum delay is the smallest part of a depositor's wait.

See [Validators basics](../basic-stvaults/validators-basics.md) for the full picture of who may do what.

## Finalizing

```bash
yarn start dw uc wo finalize-withdrawals <poolAddress>
```

| Option | Default | Purpose |
| --- | --- | --- |
| `--max-requests <n>` | 1000 | upper bound on requests settled in one transaction |
| `--gas-coverage-recipient <address>` | the sender | where the gas cost coverage is paid |

The call walks the queue in order and stops at the first request it cannot settle — it never skips ahead. A run that finalizes fewer requests than expected is normal: the vault ran out of available ETH, the minimum delay has not elapsed, or no oracle report has landed since the request was created. The exact conditions are in [Finalization](../../concepts-and-reference/defi-wrapper-technical-design.md#finalization).

If `finalize` reverts outright, the usual causes are a stale report or a paused finalization feature — both visible in `withdrawal-status`.

### Gas cost coverage

Finalizing costs the Node Operator gas while the benefit goes to the depositors leaving the pool. The coverage offsets that: a fixed amount is deducted from **each finalized request's payout** and paid to whoever called `finalize` — the address passed as `--gas-coverage-recipient`, or the sender by default.

It is **0 by default**, so nothing is deducted until it is set. Raising it is a `FINALIZE_ROLE` action:

```bash
yarn start dw uc wo set-finalization-gas-cost-coverage <withdrawalQueueAddress> <gasCostCoverageWei>
```

Two consequences follow. Coverage is part of what a finalization has to pay out, so raising it raises the vault balance needed to settle the same set of requests. And a request whose payout is smaller than the coverage surrenders only what it has, never going negative — which is also what makes a non-zero coverage discourage flooding the queue with dust.

The ceiling and the checkpoint behaviour are described in [Gas cost coverage](../../concepts-and-reference/defi-wrapper-technical-design.md#gas-cost-coverage).

## Automating it

The CLI can watch for reports, apply them and finalize what becomes settleable:

```bash
yarn start dw uc wo auto-report <poolAddress>
```

| Option | Default | Purpose |
| --- | --- | --- |
| `--max-requests <n>` | **10** | requests per finalization round |
| `--polling-interval <ms>` | 300000 (5 min) | how often to check for a new report |
| `--callback-url <url>` | — | POST notification after a report or finalization |
| `--skip-report` / `--skip-finalize` | off | run only one half of the loop |
| `--gas-coverage-recipient <address>` | the sender | where coverage is paid |

The key holding `FINALIZE_ROLE` has to sign, so this process runs with a hot key. It exits on error and checks for missed reports at startup, which is why the command's own help insists on a process manager for production.
