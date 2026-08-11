---
sidebar_position: 3
---

# Supply, withdraw, mint and repay

These four operations are the everyday lifecycle of a Basic stVault: you supply ETH into the stVault, mint stETH against it, repay the stETH, and withdraw the ETH back out.

All four are permissioned on the [`Dashboard`](/contracts/dashboard) contract. By default the Vault Owner can perform all of them; each can be delegated separately to one or more addresses.

| Operation      | Role            |
| -------------- | --------------- |
| Supply (fund)  | `FUND_ROLE`     |
| Withdraw       | `WITHDRAW_ROLE` |
| Mint           | `MINT_ROLE`     |
| Repay (burn)   | `BURN_ROLE`     |

An address holding `DEFAULT_ADMIN_ROLE` can perform all of them without granting itself the sub-roles — see [Roles and permissions](./roles-and-permissions.md).

:::warning
Withdrawing and minting depend on the current stVault state. Make sure a fresh oracle report is applied to your stVault before you start — see [Apply oracle reports](./apply-oracle-reports.md).
:::

## Supply ETH

Supplying (funding) adds ETH to the stVault balance. It has no upper limit and does not depend on the oracle report.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Supply / Withdraw** section of your stVault.

![Supply and Withdraw](/img/stvaults/guide-basic-stvault/guide_1_scr_6.png)

You can choose which token to supply — ETH or wETH. Selecting the checkbox mints all the available stETH immediately after supplying.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w fund <amount>
```

The amount is in ETH. Add `-v, --vault <address>` to target a specific stVault, otherwise the CLI prompts you to pick one.

See [details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/supply-withdrawal#fund-vault).

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `fund`, putting the amount of ETH into the payable field.

</details>

## Withdraw ETH

Withdrawing moves ETH from the stVault balance to a recipient address.

To be withdrawable, ETH has to be both:

- **Liquid** — sitting on the stVault balance, not on validators. ETH on validators must be withdrawn from the Beacon Chain first.
- **Unlocked** — not reserved as collateral for the stETH liability, as the minimal reserve, for pending [Lido redemptions](../../concepts-and-reference/stvaults-detailed-technical-design.md#2-redemptions), or for unpaid fees.

See [Metrics](./metrics.md) for the full breakdown and where to find the current number.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Supply / Withdraw** section of your stVault. You can specify a destination address for the withdrawal, and choose whether to receive ETH or wETH.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w withdraw <amount>
```

The amount is in ETH. Add `-r, --recipient <address>` to send the ETH somewhere other than your own address, and `-v, --vault <address>` to target a specific stVault.

See [details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/supply-withdrawal#withdraw-from-vault).

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `withdrawableValue` to check how much ETH is available.
3. Call `withdraw`, passing the recipient address and the amount **in wei**.

</details>

## Mint stETH

Once ETH is supplied, you can mint stETH against it on demand. Unlike Lido Core, stVaults allow minting only within the stVault's [stETH minting capacity](./metrics.md).

Three flavours are available, all of them payable so you can fund and mint in one transaction:

| Method              | Mints                                          |
| ------------------- | ---------------------------------------------- |
| `mintShares`        | stETH shares                                   |
| `mintStETH`         | stETH tokens (rebasing)                        |
| `mintWstETH`        | wstETH tokens (non-rebasing), wrapped for you  |

Each takes a recipient address, so minted tokens can go straight to another address.

<details>
  <summary>using stVaults Web UI</summary>

Open the **Mint / Repay** section of your stVault.

![Mint and Repay](/img/stvaults/guide-basic-stvault/guide_1_scr_7.png)

You can specify an address to receive the minted tokens and choose which token to mint: stETH or wstETH.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w mint-shares <amount>   # alias: mint
yarn start vo w mint-steth <amount>
yarn start vo w mint-wsteth <amount>
```

See [details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/mint-burn#mint-operations).

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract by its address.
2. Call `mintShares`, `mintStETH` or `mintWstETH`, passing the recipient address and the amount **in wei**.

</details>

## Repay (burn) stETH

Repaying burns stETH and decreases the stVault's stETH liability, which frees up the collateral that was backing it.

| Method        | Burns                     |
| ------------- | ------------------------- |
| `burnShares`  | stETH shares              |
| `burnStETH`   | stETH tokens              |
| `burnWstETH`  | wstETH tokens             |

The tokens are pulled from your address, so the `Dashboard` contract needs an allowance first: approve stETH for `burnShares` and `burnStETH`, or wstETH for `burnWstETH`.

The allowance is always denominated in tokens, never in shares. When repaying with `burnShares`, approve the stETH value of those shares — `getPooledEthByShares(shares)`. The two differ because one share is worth more than one wei of stETH, and the gap grows with every oracle report ([learn more about shares and stETH / wstETH tokens](/guides/lido-tokens-integration-guide#steth-internals-share-mechanics)).

:::note
The ETH released by the repayment is unlocked only once the next oracle report confirms the repaid amount — it does not become withdrawable in the same transaction.
:::

<details>
  <summary>using stVaults Web UI</summary>

Open the **Mint / Repay** section of your stVault and choose which token to repay: stETH or wstETH.

</details>

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w burn-shares <amount>   # alias: burn
yarn start vo w burn-steth <amount>
yarn start vo w burn-wsteth <amount>
```

The CLI checks your current allowance before repaying. If it is insufficient, it shows the current allowance and offers to send the `approve` transaction for you, so no separate approval step is needed.

See [details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/mint-burn#burn-operations).

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **stETH** or **wstETH** token contract — find the addresses on the [Environments](../../concepts-and-reference/integration-overview#stvaults-environments) page.
2. Call `approve`, passing the `Dashboard` contract address and the amount **in wei** you want to allow it to pull.
3. Once the approval is confirmed, navigate to the **Dashboard** contract by its address.
4. Call `burnShares`, `burnStETH` or `burnWstETH`, passing the amount **in wei**.

</details>
