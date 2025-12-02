---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pooled Staking Product powered by stVaults

## Intro
The DeFi Wrapper is a no-/low-code toolkit that allows Builders, Node Operators, and platforms to launch customized user-facing staking products powered by stVaults — with optional automated APR-boosting strategies such as leverage loops, GGV, or any custom stETH-based yield module.

This guide explains conceptually and practically how to launch such a product without deep protocol knowledge.

## What You Can Build

DeFi Wrapper supports three product archetypes:

### 1. Pooled Delegated Staking
![Pooled delegarted staking product](/img/stvaults/guide-pooled-staking-product/wrapped_products_pooled.png)
- Users stake ETH with the same Node Operator.
- Users receive APR from validator performance.

**Use case:** End-user staking product with conservative validation-based APR and user friendly-interface embedded in the colntrolled or partner's traffic channel.

## 2. Pooled Delegated Liquid Staking
![Pooled delegarted staking product](/img/stvaults/guide-pooled-staking-product/wrapped_products_liquid.png)
- Users stake ETH with the same Node Operator.
- Users receive stETH (within the stVault’s Reserve Ratio).
- Users receive APR from validator performance.

**Use case:** Institutional-aimed individual (whitelisted) staking product with conservative validation-based APR and liquidity, and simple user interface hosted on the Node Operator's web server.

## 3.1. Pooled Delegated Staking with Boosted APR via Leveraged staking
![Pooled delegarted staking product](/img/stvaults/guide-pooled-staking-product/wrapped_products_looping.png)
- Users stake ETH with the same Node Operator.
- stETH is minted automatically and deposited to the connected curated looping strategy: pre-integrated, or custom one.
- ETH is borrowed against stETH and deposited back to the stVault increasing stVault Total Value and the amount of ETH on validators.
- Users receive boosted APR from validator performance.

**Use case:** End-user staking product with higher risk/yield profile through the connected curated looping strategy which increases amount of ETH on validators. The product allows the Node Operator to attract more ETH for validation than the end-users deposit.

## 3.2. Pooled Delegated Staking with Boosted APR via DeFi Strategy
![Pooled delegarted staking product](/img/stvaults/guide-pooled-staking-product/wrapped_products_defi.png)
- Users stake ETH with the same Node Operator and 
- stETH is minted automatically and deposited to the connected DeFi strategy: Leverage staking, GGV, or any custom one.
- Users receive APR from validator performance + Startegy APR.

**Use case:**
- end-user staking product with higher risk/yield profile through the connected curated looping strategy which increases amount of ETH on validators.
- end-user staking product with higher risk/yield profile through the connected curated DeFi strategy which makes the product more attractive for the end-user.


## Environments

### Testnet

- CLI: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration
- DeFi Wrapper Factory (Testnet-3): https://hoodi.etherscan.io/address/0x3405ef99395db3e8a9a0ab720429a8d68650a96f
  - NB: Testnet-4 is not supported by the CLI yet
- Latest development branch: https://github.com/lidofinance/vaults-wrapper/tree/develop
- Etherscan: https://hoodi.etherscan.io/

### Mainnet

:::info

      *Coming this Winter*

::::

## Steps

### 1. Create a tokenized staking vault (pool)

The easiest way to create a pool over staking vault is to use [CLI](https://lidofinance.github.io/lido-staking-vault-cli).
This is a command line tool intended both for staking vault and pool (wrapper) management. It supports creation of a pool with its underlying staking vault via dedicated [`Factory`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/Factory.sol) contract.
The deployment happens in two transactions (to fit Fusaka 16m tx gas limit) which the CLI does in its single command run.

To start:
- setup CLI according to the [README](https://github.com/lidofinance/lido-staking-vault-cli/blob/develop/README.md)
- prepare a valid CLI configuration - see [this tutorial](https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration).

:::info

  The deployer must have at least `1 ETH` on their balance - this is `CONNECT_DEPOSIT` required to be locked
  on the vault upon connection to Lido `VaultHub`. The newly created staking vault is automatically connected to
  Lido `VaultHub` and placed into the default tier. Placement to none-default tiers right upon deployment is not supported.

::::

To list commands for creation of available pool types, run
```shell
yarn start defi-wrapper contracts factory write -h
```

#### Deployment of a pool with GGV strategy

Run `yarn start defi-wrapper contracts factory write create-pool-ggv -h` for the description of the required GGV pool parameters.

Start the deployment like:

```shell
yarn start defi-wrapper contracts factory w create-pool-ggv 0x3405ef99395db3e8a9a0ab720429a8d68650a96f \ 
  --nodeOperator 0x0000000000000000000000000000000000000001 \
  --nodeOperatorManager 0x0000000000000000000000000000000000000002 \
  --nodeOperatorFeeRate 10 \
  --confirmExpiry 86400 \
  --minDelaySeconds 3600 \
  --minWithdrawalDelayTime 3600 \
  --name "Debug GGV Pool" \
  --symbol STV \
  --proposer 0x0000000000000000000000000000000000000003 \
  --executor 0x0000000000000000000000000000000000000004 \
  --reserveRatioGapBP 250
```

:::info

  Comming soon:
  - CLI update for the Hoodi testnet-4+ (with configurable emergency committee).
  - support of config like https://github.com/lidofinance/vaults-wrapper/blob/develop/config/hoodi-stv-ggv.json

::::

### 2. Create Web UI

TODO

### Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed identification and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

Tier changes are performed via a multi-role confirmation mechanism, where the Node Operator and Vault Owner act as contracting parties. One party proposes the change, and the other party accepts it. Technically, both requests are made through the same method: `changeTier(tierId, requestedShareLimit)`. Both parties must submit the request with identical parameters within the confirmation lifetime of 24 hours for the change to take effect.

In case of the vault deployed as part of a pool deployment Vault Owner role is assigned to the Timelock contract. The timelock contract as well implements a two-step process of performing an onchain action. At first, the holder of its proposer role creates a proposed on-chain action, at second, after a time period the holder of the executor role executes it.

:::info
Confirming tier change request requires applying fresh report to vault.
:::

TODO: CLI and UI?

**Parameters and addresses needed for this step (for CLI and Smart contracts):**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit.

<details>
  <summary>using stVaults Web UI</summary>
      1. On behalf of the first contracting party, open 'Settings > Tiers', and click the tier selector:

      ![Settings > Tiers](/img/stvaults/guide-basic-stvault/guide_1_scr_1.png)

      2. Select the desired tier from the list:

      ![Selecting Tier](/img/stvaults/guide-basic-stvault/guide_1_scr_2.png)

      3. Review how the stVault metrics will change after moving to the new tier, then submit your request/proposal.

      ![Review settings](/img/stvaults/guide-basic-stvault/guide_1_scr_3.png)

      4. On behalf of the another contracting party open 'Settings > Tiers'.

      ![Open proposal](/img/stvaults/guide-basic-stvault/guide_1_scr_4.png)

      5. Open the request details, review the projected changes to the stVault metrics, and submit approval.

      ![Review settings](/img/stvaults/guide-basic-stvault/guide_1_scr_5.png)

</details>

<details>
  <summary>by Command-line Interface</summary>

      On behalf of the Vault Owner ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations/#change-tier-ct)):

      ```bash
      yarn start vo w change-tier -v <vaultAddress> -r <requestedShareLimit> <tierId>
      ```

      On behalf of the Node Operator ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations/#change-tier-by-no-ct-no))::

      ```bash
      yarn start vo w change-tier-by-no -v <vaultAddress> -r <requestedShareLimit> <tierId>
      ```

</details>
<details>
  <summary>using Etherscan UI</summary>

      The Node Operator and Vault Owner use same-named metods in different contracts to perform this change.

      **Node Operator:**
      1. Open **Etherscan** and navigate to the **Operator Grid** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `changeTier` method in the list, fill out the fields, and click **Write**.
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.

      **Vault Owner:**
      1. Open **Etherscan** and navigate to the **Dashboard** contract by its address (provided in the results of stVault creation, see step 1.1).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `changeTier` method in the list, fill out the fields, and click **Write**.
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.

</details>

### Deposit ETH to validators

Supplying ETH to the stVault increases its balance. The Node Operator can then deposit ETH from this balance into validators.

**The Predeposit Guarantee (PDG)** contract, as part of the stVaults platform, helps prevent deposit frontrunning caused by the vulnerabilities described in [LIP-5](https://research.lido.fi/t/lip-5-mitigations-for-deposit-front-running-vulnerability/1269). PDG secures the Vault Owner’s ETH deposits to validators from being front-run by the Node Operator.

One of the key benefits of using PDG is the avoidance of commingling: it keeps the finances of the Vault Owner and the Node Operator strictly separated.

PDG enables three main use cases:

- **Full-cycle proof of validators.** Enables a non-custodial deposit mechanism by using guarantee ETH as collateral. [Follow the main guide](../pdg/#full-cycle-trustless-path-through-pdg).
- **PDG shortcut.** Allows skipping the pre-deposit steps and depositing directly to a validator without using PDG initially. The validator can later be associated with the vault by proving it through PDG. This path is applicable when there is unconditional trust between the Node Operator and the Vault Owner. [Follow the shortcut guide](../pdg/#pdg-shortcut).
- **Adding existing validators.** Lets you connect an existing validator from external staking infrastructure to an stVault as an advanced integration use case.

Read more: [Technical details](https://hackmd.io/@lido/stVaults-design#315-Essentials-PredepositGuarantee); [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol).

### Monitor stVault health and rebalance

The key stVault metrics that the Vault Owner should monitor and control are:

- **Utilization ratio** -- the share of the stETH minting capacity currently used by the Vault Owner. [Learn more](../parameters-and-metrics)
- **Health Factor** -- a metric that reflects the economic state of the vault. It shows how the stETH liability is collateralized by the Total Value. A Health Factor of 100% corresponds to the Forced Rebalance Threshold, meaning that if the Health Factor falls below 100%, the stVault becomes subject to forced rebalancing. [Learn more](../parameters-and-metrics)

The Health Factor metric may decrease as a result of validator underperformance, penalties, or a slashing event.

If this happens, there are three main options available:

- Supply ETH to increase Total Value.
- Repay stETH to reduce stETH liability.
- Rebalance ETH (optionally combined with a supply in a single transaction).

**Rebalancing** involves transferring available ETH from the stVault balance to Lido Core, receiving stETH at a 1:1 ratio, and repaying it back to the stVault. This reduces stETH Liability and thereby increases the Health Factor.

Rebalancing is performed in one transacion.

The amount of ETH required for rebalancing to bring the Utilization Ratio to 100% depends on the current Health Factor and Reserve Ratio. It can be pre-calculated manually using the formula, or via the built-in methods.

<details>
  <summary>by Formula</summary>

      ETH for rebalance = stETH Liability - (1 - Reserve Ratio * Total Value ) / Reserve Ratio

</details>
<details>
  <summary>by Command-line Interface</summary>

      *Will be supported later on testnet-3*

</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **VaultHub** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Read as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the method `healthShortfallShares` in the list, fill out the input with the `vault` contract address, and click **Query**.
      6. Receive the result right under the submit button.
</details>

## Useful links

- [stVaults Roles](../roles-and-permissions)
- [stVaults Metrics](../parameters-and-metrics)
- [DeFi Wrapper Technical Design](https://hackmd.io/@lido/lido-v3-wrapper-design)
