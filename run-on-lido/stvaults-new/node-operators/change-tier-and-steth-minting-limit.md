---
sidebar_position: 4
---

# Change tier and stETH minting limit

A new stVault starts on the Default tier with a 50% Reserve Ratio. Once you have passed [identification](./node-operator-identification-guide.md) and been granted your own tiers, an stVault you serve can be moved onto one of them for better stETH minting terms.

Three operations live on the `OperatorGrid` contract, and each needs both you and the Vault Owner to agree:

| Operation | What it changes |
| --- | --- |
| `changeTier` | moves the stVault to another of your tiers, and sets its minting limit at the same time |
| `updateVaultShareLimit` | changes only the minting limit, keeping the current tier |
| `syncTier` | adopts the current parameters of the tier the stVault is already on |

## How the confirmation works

Both parties call the **same** `OperatorGrid` function with identical arguments. You call it directly; the Vault Owner reaches it through the `Dashboard`, which forwards the call. Whoever goes first registers a confirmation, and the operation executes when the second one matches it.

The window is the `OperatorGrid` confirmation expiry, which is a protocol-wide setting rather than your stVault's own confirmation lifetime. If it lapses before the second party acts, the first has to submit again.

:::note
You can register your confirmation while the stVault is still disconnected from VaultHub — the connection is only required to finalise the change from the Vault Owner's side. This lets you agree the terms before the stVault is connected.
:::

The change ends in a `VaultHub` connection update, which needs a fresh oracle report on the stVault — see [Apply oracle reports](../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md).

## Changing the tier

The tier you request must belong to your own group, otherwise the call reverts with `TierNotInOperatorGroup`. Two capacity limits are checked at the moment the change goes through:

- `TierLimitExceeded` — the stVault's liability would push the tier past its aggregate share limit.
- `GroupLimitExceeded` — the same for your group as a whole.

Both are evaluated against the stVault's **current liability**, so a heavily minted stVault can be refused by a tier that would accept an empty one.

:::warning
You cannot move an stVault back to the Default tier. `changeTier` rejects it with `CannotChangeToDefaultTier`. The only way back is automatic: when an stVault is disconnected from VaultHub, its tier returns to Default.
:::

## Changing the stETH minting limit

The minting limit is the absolute cap on how much stETH this stVault may mint, expressed in shares. It is bounded on both sides:

- it cannot exceed the tier's own share limit — `RequestedShareLimitTooHigh`;
- it cannot be set below what the stVault has already minted — `RequestedShareLimitTooLow`.

The second bound means lowering the limit on an active stVault only works down to its current liability. To go lower, the Vault Owner has to repay or rebalance first.

## Applying updated tier parameters

When the parameters of a tier change, stVaults already on it keep running on the values they were connected with. `syncTier` adopts the new ones, and it needs the same two-party confirmation.

## Doing it

<details>
  <summary>using stVaults Web UI</summary>

Open the **Tier** tab in the stVault settings. The UI recognises you as the Node Operator and routes your transaction to `OperatorGrid`, while the Vault Owner's goes to the `Dashboard` — both of you use the same screen.

1. Pick a tier under **Choose Tier**, or set a new value under **stVault minting limit**.
2. Review the projected metrics, then submit your request.
3. When the other party has submitted a matching request, the change goes through.

When a tier's parameters have been updated, a banner appears here naming the old and new values, with a button to apply them.

</details>

<details>
  <summary>using Command-line Interface</summary>

As the Node Operator:

```bash
yarn start vo write change-tier-by-no -v <vault_address> -r <requested_share_limit> <tier_id>
yarn start contracts operator-grid write update-vault-share-limit <vault_address> <requested_share_limit>
yarn start contracts operator-grid write sync-tier <vault_address>
```

`-r` takes shares by default; add `--steth` to pass the value in stETH and have it converted on-chain.

For reference, the Vault Owner's side of the same operations:

```bash
yarn start vo write change-tier -v <vault_address> -r <requested_share_limit> <tier_id>
yarn start contracts dashboard write update-share-limit <dashboard_address> <requested_share_limit>
yarn start vo write sync-tier -v <vault_address>
```

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **OperatorGrid** contract — find its address on the [Environments](../concepts-and-reference/integration-overview#stvaults-environments) page.
2. Call `changeTier`, `updateVaultShareLimit` or `syncTier`, passing the stVault address and the arguments the Vault Owner is using.

The Vault Owner calls the same-named methods on the **Dashboard** contract instead, without the stVault address argument.

</details>
