---
sidebar_position: 2
---

# PDG Shortcut Bootstrap

A freshly deployed pool has no depositors, so it has no ETH to stake and nothing for the operator to run. This guide covers the bootstrap: the operator supplies 32 ETH themselves, activates the first validator with it through the [PDG shortcut](../basic-stvaults/pdg.md#pdg-shortcut), and later recovers that ETH through the ordinary withdrawal queue.

This route keeps the operator out of the vault's custody path: no `WITHDRAW_ROLE`, no direct `Dashboard.fund()`. The money goes in as an ordinary pool deposit and comes back as an ordinary withdrawal request, on the same terms as any depositor's.

Two addresses appear below. **OPERATOR** deposits the ETH and ends up holding the stv. **DEPOSITOR** signs the shortcut transaction. They can be the same address.

## Which role grants what

The Dashboard has two independent role trees, and this procedure needs both.

| Action | Role | Held by |
| --- | --- | --- |
| Add OPERATOR to the pool allowlist | `ALLOW_LIST_MANAGER_ROLE` on the pool | the allowlist manager; **nobody** on a strategy pool until the timelock grants it |
| Set the PDG policy | `DEFAULT_ADMIN_ROLE` on the Dashboard | Timelock Controller |
| Run the shortcut | `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` on the Dashboard | granted by `NODE_OPERATOR_MANAGER_ROLE` |
| Request a validator exit | `REQUEST_VALIDATOR_EXIT_ROLE` on the Dashboard | Timelock Controller |
| Finalize the withdrawal | `FINALIZE_ROLE` on the queue | the Node Operator |

:::info
`NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` is administered by `NODE_OPERATOR_MANAGER_ROLE`, not by the timelock, so **a timelock proposal cannot grant it** — the grant has to be signed by the Node Operator Manager address. See [Roles and permissions](../../concepts-and-reference/roles-and-permissions.md).
:::

## Step 1 — Let OPERATOR deposit

Pools deployed with an allowlist only accept listed addresses, and on a strategy pool the list contains the strategy alone. Add OPERATOR to it:

```bash
yarn start dw c stv w add-to-allow-list <poolAddress> <operatorAddress>
```

On a strategy pool `ALLOW_LIST_MANAGER_ROLE` is not granted to anyone at deployment, so the timelock has to grant it first — to itself or to an operations key — before this call will go through. Both the grant and the later revoke are timelock operations.

## Step 2 — OPERATOR deposits 32 ETH

```bash
yarn start dw c stv w deposit-eth <poolAddress> 32 0x0000000000000000000000000000000000000000
```

Called by OPERATOR. The pool mints stv to OPERATOR and forwards the ETH to the vault; the strategy is not involved even on a strategy pool. Record the amount of stv minted — that is the claim used to get the ETH back in Step 7.

## Step 3 — Allow the shortcut

The shortcut is refused unless the vault's PDG policy permits it:

```bash
yarn start contracts dashboard w set-pdg-policy <dashboardAddress> 2
```

`2` is `ALLOW_DEPOSIT_AND_PROVE`. Called by the timelock, so this is a proposal like any other Dashboard admin action.

## Step 4 — Grant the shortcut role to DEPOSITOR

```bash
yarn start vo w role-grant -v <vaultAddress> \
  -r '[{"account":"<depositorAddress>","role":"NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE"}]'
```

Signed by the **Node Operator Manager**, for the reason given above.

## Step 5 — Run the shortcut

```bash
yarn start deposits w unguaranteed-deposit '<depositsJson>' -v <vaultAddress>
```

The argument is an array of deposit structs — `pubkey`, `signature`, `amount` in gwei, `deposit_data_root` — the same data a normal deposit uses. The CLI checks the BLS signature first; `--no-bls-check` skips that.

This withdraws the 32 ETH from the vault and sends it straight to the deposit contract with the vault's withdrawal credentials, bypassing the predeposit. From there the validator takes the ordinary entry path — the deposit is processed, then the validator waits in the activation queue, which is as long as the number of validators entering at the time makes it.

:::warning
The vault's reported Total Value drops by 32 ETH the moment this executes, and the stv price drops with it, because the ETH has left the vault while the validator's balance is not yet reported. Every stv holder sees the dip, not just OPERATOR. On a pool that already has depositors, tell them beforehand.
:::

## Step 6 — Wait for the oracle, then for quarantine

The dip reverses in two stages, and neither can be hurried:

1. An oracle report has to include the new validator's Consensus Layer balance.
2. That balance arrives as an increase the protocol cannot verify on-chain, so it goes into [quarantine](../../concepts-and-reference/how-quarantine-works.md) — three days on Mainnet — before it counts towards Total Value.

:::warning
OPERATOR's stv is worth roughly 32 ETH again only once the quarantine releases. Withdrawing before that settles the position at the depressed rate.
:::

## Step 7 — Recover the 32 ETH

From here OPERATOR is an ordinary depositor. File a withdrawal request for the stv from Step 2, wait for finalization, claim — see [Supply and withdraw](../../vault-owners-curators-and-stakers/defi-wrapper/stakers/supply-withdraw.md).

Finalization needs ETH on the vault balance, which by now is staked. Either wait for organic deposits to cover it, or exit the bootstrap validator and let the ETH sweep back. Driving that is the operator's ordinary job — see [Manage the withdrawal queue](./manage-withdrawal-queue.md).

## Cleaning up

Once the bootstrap is done and the pool has real depositors, undo the temporary access. Four steps, and the order matters — removing an address from the allowlist needs the manager role, so that role goes last.

**1. Take OPERATOR off the pool allowlist**, if the pool is meant to stay closed. Signed by the `ALLOW_LIST_MANAGER_ROLE` holder from Step 1:

```bash
yarn start dw c stv w remove-from-allow-list <poolAddress> <operatorAddress>
```

**2. Revoke `ALLOW_LIST_MANAGER_ROLE`** from whoever the timelock granted it to. This is a pool role administered by the timelock, so it is a proposal, executed after the delay with the **same salt**:

```bash
yarn start dw uc tg pool w propose-revoke-role \
  <timelockAddress> <poolAddress> ALLOW_LIST_MANAGER_ROLE <accountAddress> --salt <salt>

yarn start dw uc tg pool w execute-revoke-role \
  <timelockAddress> <poolAddress> ALLOW_LIST_MANAGER_ROLE <accountAddress> --salt <salt>
```

**3. Revoke the shortcut role** from DEPOSITOR. Like the grant in Step 4, this must be signed by the **Node Operator Manager**, not the timelock:

```bash
yarn start contracts dashboard w role-revoke <dashboardAddress> \
  '[{"account":"<depositorAddress>","role":"NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE"}]'
```

**4. Return the PDG policy to `STRICT`**, so the shortcut cannot be used again without a fresh decision. A timelock proposal, as in Step 3:

```bash
yarn start contracts dashboard w set-pdg-policy <dashboardAddress> 0
```

:::note
Step 4 is a judgment call rather than a cleanup chore. Leaving the policy at `ALLOW_DEPOSIT_AND_PROVE` keeps the shortcut available for later top-ups, at the cost of leaving a path that moves ETH out of the vault without PDG's guarantee. Setting it back to `STRICT` closes that path; reopening it later is another proposal.
:::
