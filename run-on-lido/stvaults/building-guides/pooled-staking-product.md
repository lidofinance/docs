---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌊 End-user staking product by DeFi Wrapper

## Intro

**The DeFi Wrapper** is a no-/low-code toolkit that lets builders, Node Operators, and platforms launch customized user-facing staking products powered by stVaults — with optional automated APR-boosting strategies such as leverage loops, GGV, or any custom stETH-based yield module.

This guide walks through the concepts and practical steps to launch such a product without deep protocol knowledge.

## What you can build

DeFi Wrapper supports three product archetypes:

### 1. Pooled delegated staking

![Pooled delegated staking](/img/stvaults/guide-pooled-staking-product/wrapped_products_pooled.png)

- Users stake ETH with the same Node Operator.
- Users receive APR from validator performance.

**Use case:** End-user staking product with conservative validation-based APR and a user-friendly interface embedded in your own traffic channel or a partner channel.

### 2. Pooled delegated liquid staking

![Pooled delegated liquid staking](/img/stvaults/guide-pooled-staking-product/wrapped_products_liquid.png)

- Users stake ETH with the same Node Operator.
- Users receive stETH (within the stVault’s Reserve Ratio).
- Users receive APR from validator performance.

**Use case:** Institution-targeted individual (whitelisted) staking product with conservative validation-based APR and liquidity, and a simple user interface hosted on the Node Operator's web server.

### 3. Pooled delegated staking with boosted APR

#### 3.1. Leveraged staking (looping)

![Boosted APR via leveraged staking (looping)](/img/stvaults/guide-pooled-staking-product/wrapped_products_looping.png)

- Users stake ETH with the same Node Operator.
- stETH is minted automatically and deposited into the connected looping strategy (pre-integrated or custom).
- ETH is borrowed against stETH and deposited back into the stVault, increasing the stVault's total value and the amount of ETH on validators.
- Users receive boosted APR from validator performance.

**Use case:** End-user staking product with higher risk/yield profile through the connected curated looping strategy, increasing the amount of ETH on validators. The product lets the Node Operator attract more ETH for validation than end users deposit.

#### 3.2. DeFi strategy (GGV or custom)

![Boosted APR via DeFi strategy](/img/stvaults/guide-pooled-staking-product/wrapped_products_defi.png)

- Users stake ETH with the same Node Operator.
- stETH is minted automatically and deposited into the connected DeFi strategy (leveraged staking, GGV, or any custom stETH-based module).
- Users receive APR from validator performance + strategy APR.

**Use case:** End-user staking product with higher risk/yield profile through the connected curated DeFi strategy, making the product more attractive for end users.

## Environments

<Tabs>
  <TabItem value="testnet" label="Testnet">
    <ul>
      <li><strong>CLI:</strong> <a href="https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration">Configuration guide</a></li>
      <li><strong>DeFi Wrapper Factory (Testnet-9):</strong> <a href="https://hoodi.etherscan.io/address/
        0xd05ebf24a340ece8b8fb53a170f1171dcd02b4d9#code">0xFA97…1f38</a></li>
      <li><strong>UI template:</strong> <a href="https://github.com/lidofinance/defi-wrapper-widget">defi-wrapper-widget</a></li>
      <li><strong>Latest development branch:</strong> <a href="https://github.com/lidofinance/vaults-wrapper/tree/develop">vaults-wrapper (develop)</a></li>
      <li><strong>Etherscan:</strong> <a href="https://hoodi.etherscan.io/">hoodi.etherscan.io</a></li>
    </ul>
  </TabItem>
  <TabItem value="mainnet" label="Mainnet">

:::info Coming soon
*Coming this Winter*
:::

  </TabItem>
</Tabs>

## Steps

### 1. Create a tokenized staking vault (pool)

The easiest way to create a tokenized staking vault (pool) is to use the [stVaults CLI](https://lidofinance.github.io/lido-staking-vault-cli).
It's a command-line tool for managing both staking vaults and DeFi Wrapper pools. It deploys a pool plus its underlying staking vault via the [`Factory`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/Factory.sol) contract.

The CLI performs the deployment in two transactions to stay within the current 16M transaction gas limit.

To start:
- Set up the CLI according to the [README](https://github.com/lidofinance/lido-staking-vault-cli/blob/develop/README.md).
- Prepare a valid CLI configuration — see the [configuration tutorial](https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration).

:::info

The deployer must have at least `1 ETH` available. This is the `CONNECT_DEPOSIT` required to be locked on the vault upon connection to Lido `VaultHub`.

The newly created staking vault is automatically connected to Lido `VaultHub` and placed into the default tier. Placement into non-default tiers right upon deployment is not supported.

:::

To list the available pool types and creation commands, run:
```bash
yarn start defi-wrapper contracts factory write -h
```

:::info

For each pool type, the CLI prints the environment variables required for the UI setup.
Keep this output if you plan to set up the UI.

:::

#### Deployment of `StvPool` (pool without stETH minting)

Run `yarn start defi-wrapper contracts factory write create-pool-stv -h` for the description of the required STV pool parameters.

Start the deployment like:
```bash
yarn start defi-wrapper contracts factory w create-pool-stv 0xd05ebf24a340ece8b8fb53a170f1171dcd02b4d9 \
  --nodeOperator 0x0000000000000000000000000000000000000001 \
  --nodeOperatorManager 0x0000000000000000000000000000000000000002 \
  --nodeOperatorFeeRate 10 \
  --confirmExpiry 86400 \
  --minDelaySeconds 3600 \
  --minWithdrawalDelayTime 3600 \
  --name "Debug STV Pool" \
  --symbol STV \
  --proposer 0x0000000000000000000000000000000000000003 \
  --executor 0x0000000000000000000000000000000000000004 \
  --emergencyCommittee 0x0000000000000000000000000000000000000005 \
  --allowList false
```

#### Deployment of `StvStETHPool` (pool with stETH minting)

Run `yarn start defi-wrapper contracts factory write create-pool-stv-steth -h` for the description of the required STV pool parameters.

Start the deployment like:
```bash
yarn start defi-wrapper contracts factory w create-pool-stv-steth 0xd05ebf24a340ece8b8fb53a170f1171dcd02b4d9 \
  --nodeOperator 0x0000000000000000000000000000000000000001 \
  --nodeOperatorManager 0x0000000000000000000000000000000000000002 \
  --nodeOperatorFeeRate 10 \
  --confirmExpiry 86400 \
  --minDelaySeconds 3600 \
  --minWithdrawalDelayTime 3600 \
  --name "Debug STV Pool" \
  --symbol STV \
  --proposer 0x0000000000000000000000000000000000000003 \
  --executor 0x0000000000000000000000000000000000000004 \
  --emergencyCommittee 0x0000000000000000000000000000000000000005 \
  --reserveRatioGapBP 250 \
  --allowList false
```

:::warning

The minimum recommended value for `reserveRatioGapBP` is `250` (2.5%). It is expected to be sufficient to absorb enough of the vault's performance volatility to keep users' positions healthy in most cases.

:::

#### Deployment of `StvGGV` (pool with GGV strategy)

Run `yarn start defi-wrapper contracts factory write create-pool-ggv -h` for the description of the required GGV pool parameters.

Start the deployment like:

```bash
yarn start defi-wrapper contracts factory w create-pool-ggv 0xd05ebf24a340ece8b8fb53a170f1171dcd02b4d9 \
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
  --emergencyCommittee 0x0000000000000000000000000000000000000005 \
  --reserveRatioGapBP 250
```

:::info

Note that for `StvGGV` pools, the allowlist is not configurable: the only address allowed to deposit is the GGV strategy contract itself.

Users do not deposit via the pool directly — they supply to the strategy.

:::

### 2. Create Web UI

Follow this [guide](https://github.com/lidofinance/defi-wrapper-widget/blob/develop/README.md) to:

- Clone the provided repository
- Use addresses outputted by CLI to fill up `.env`
- Adjust titles, logos, texts, and color scheme to your liking
- Deploy the dApp

### 3. (optional) Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed identification and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

For more information about stVault tiers please see [Adjust stETH minting parameters](./basic-stvault#adjust-steth-minting-parameters).

For pooled vaults the process of changing tier is a bit different because the Vault Owner role is assigned to the Timelock contract. The Timelock contract itself implements a two-step process for performing an on-chain action. First, the holder of its proposer role creates a proposed on-chain action; second, after a time period, the holder of the executor role executes it.

Thus, changing tier for a pooled vault is a three-step process:

1. Holder of the Timelock's proposer role calls `TimelockController.schedule` to propose the `OperatorGrid.changeTier` call
2. After the timelock period, the holder of the Timelock's executor role calls `TimelockController.execute` for the scheduled proposal
3. Within the confirmation time window period (default 24 hours), the Node Operator calls `OperatorGrid.changeTier` with the same parameters

:::info
Confirming a tier change request requires applying a fresh report to the vault.
:::

:::warning
CLI does not yet support operations with TimelockController contract and steps 1 and 2 must be performed via manual contract calls, e.g. via Etherscan.
:::

**Parameters needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier's stETH limit.
- `TimelockAddress`: the address of the `TimelockController` contract (deployed together with the pool).
- `OperatorGridAddress`: the address of the `OperatorGrid` contract (available in the stVaults contract addresses list, see [#Environments](#environments)).

<details>
  <summary>Step 1: Schedule the tier change (Proposer)</summary>

  1. Open **Etherscan** and navigate to the **TimelockController** contract by its address.
  2. Go to the **Contract** tab → **Write Contract**.
  3. Click **Connect to Web3** and connect the wallet that holds the **proposer role**.
  4. Find the `schedule` method in the list and fill out the fields:
     - `target`: the `OperatorGrid` contract address.
     - `value`: `0` (no ETH is sent with this call).
     - `data`: the ABI-encoded call to `changeTier(address vault, uint256 tierId, uint256 requestedShareLimit)`. You can generate this using tools like [ABI Encoder](https://abi.hashex.org/) or cast from Foundry:
       ```bash
       cast calldata "changeTier(address,uint256,uint256)" <VaultAddress> <TierID> <RequestedShareLimit>
       ```
     - `predecessor`: `0x0000000000000000000000000000000000000000000000000000000000000000` (no predecessor required).
     - `salt`: `0x0000000000000000000000000000000000000000000000000000000000000000` (or any unique value if you need to differentiate identical operations).
     - `delay`: the delay in seconds (must be at least the `minDelaySeconds` configured during pool deployment).
  5. Click **Write** and sign the transaction in your wallet.
  6. Click **View your transaction** and wait for it to be executed.
  7. Note down the **operation ID** from the `CallScheduled` event in the transaction logs — you will need it to verify the operation status before execution.

</details>

<details>
  <summary>Step 2: Execute the scheduled tier change (Executor)</summary>

  1. Wait for the timelock delay period to pass. You can verify the operation is ready by calling `isOperationReady(operationId)` on the TimelockController contract (in **Read Contract** tab).
  2. Open **Etherscan** and navigate to the **TimelockController** contract by its address.
  3. Go to the **Contract** tab → **Write Contract**.
  4. Click **Connect to Web3** and connect the wallet that holds the **executor role**.
  5. Find the `execute` method in the list and fill out the fields with the **same values** used in the `schedule` call:
     - `target`: the `OperatorGrid` contract address.
     - `value`: `0`.
     - `payload`: the same ABI-encoded call data used in step 1.
     - `predecessor`: `0x0000000000000000000000000000000000000000000000000000000000000000`.
     - `salt`: the same salt value used in step 1.
  6. Click **Write** and sign the transaction in your wallet.
  7. Click **View your transaction** and wait for it to be executed.

</details>

<details>
  <summary>Step 3: Confirm the tier change (Node Operator)</summary>

  Within the confirmation time window period (default 24 hours) after step 2, the Node Operator must confirm the tier change:

  1. Open **Etherscan** and navigate to the **OperatorGrid** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
  2. Since this contract is a proxy, complete the verification steps once (if not done before):
     - Go to **Contract → Code**.
     - Click **More options**.
     - Select **Is this a proxy?**.
     - Click **Verify** in the dialog.
     - Return to the contract details page.
  3. Open the **Contract** tab → **Write as Proxy**.
  4. Click **Connect to Web3** and connect the wallet registered as the **Node Operator**.
  5. Find the `changeTier` method in the list and fill out the fields with the **same values** used in steps 1 and 2:
     - `vault`: the `Vault` contract address.
     - `tierId`: the tier ID.
     - `requestedShareLimit`: the requested share limit.
  6. Click **Write** and sign the transaction in your wallet.
  7. Click **View your transaction** and wait for it to be executed.

</details>

### 4. Deposit ETH to validators

Supplying ETH to the stVault increases its balance. The Node Operator can then deposit ETH from this balance into validators.

**The Predeposit Guarantee (PDG)** contract, as part of the stVaults platform, helps prevent deposit frontrunning caused by the vulnerabilities described in [LIP-5](https://research.lido.fi/t/lip-5-mitigations-for-deposit-front-running-vulnerability/1269). PDG secures the Vault Owner’s ETH deposits to validators from being front-run by the Node Operator.

One of the key benefits of using PDG is the avoidance of commingling: it keeps the finances of the Vault Owner and the Node Operator strictly separated.

PDG enables three main use cases:

- **Full-cycle proof of validators.** Enables a non-custodial deposit mechanism by using guarantee ETH as collateral. [Follow the main guide](../tech-documentation/pdg#full-cycle-trustless-path-through-pdg).
- **PDG shortcut.** Allows skipping the pre-deposit steps and depositing directly to a validator without using PDG initially. The validator can later be associated with the vault by proving it through PDG. This path is applicable when there is unconditional trust between the Node Operator and the Vault Owner. [Follow the shortcut guide](../tech-documentation/pdg#pdg-shortcut).
- **Adding existing validators.** Lets you connect an existing validator from external staking infrastructure to an stVault as an advanced integration use case.

Read more: [Technical details](https://hackmd.io/@lido/stVaults-design#315-Essentials-PredepositGuarantee); [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol).

### 5. Monitor stVault health and rebalance

The key stVault metrics that the Vault Owner should monitor and control are:

- **Utilization ratio** — the share of the stETH minting capacity currently used by the Vault Owner. [Learn more](../features-and-mechanics/parameters-and-metrics)
- **Health Factor** — a metric that reflects the economic state of the vault. It shows how the stETH liability is collateralized by the Total Value. A Health Factor of 100% corresponds to the Forced Rebalance Threshold, meaning that if the Health Factor falls below 100%, the stVault becomes subject to forced rebalancing. [Learn more](../features-and-mechanics/parameters-and-metrics)

Read more:
- [Health Monitoring Guide](../operational-and-management-guides/health-monitoring-guide.md)
- [Health Emergency Guide](../operational-and-management-guides/health-emergency-guide.md)

The Health Factor metric may decrease as a result of validator underperformance, penalties, or a slashing event.

If this happens, there are three main options available:

- Supply ETH to increase Total Value.
- Repay stETH to reduce stETH liability.
- Rebalance ETH (optionally combined with a supply in a single transaction).

**Rebalancing** involves transferring available ETH from the stVault balance to Lido Core, receiving stETH at a 1:1 ratio, and repaying it back to the stVault. This reduces stETH liability and thereby increases the Health Factor.

Rebalancing is performed in one transaction.

The amount of ETH required for rebalancing to bring the Utilization Ratio to 100% depends on the current Health Factor and Reserve Ratio. It can be pre-calculated manually using the formula, or via the built-in methods.

<details>
  <summary>by Formula</summary>

      ETH for rebalance = (stETH Liability − (1 − Reserve Ratio) × Total Value) / Reserve Ratio

</details>
<details>
  <summary>by Command-line Interface</summary>

      See the [CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/) for rebalance commands.

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

- [DeFi Wrapper Technical Design](https://hackmd.io/@lido/lido-v3-wrapper-design)
- [stVaults Roles](../features-and-mechanics/roles-and-permissions)
- [stVaults Metrics](../features-and-mechanics/parameters-and-metrics)
- [Health Monitoring Guide](../operational-and-management-guides/health-monitoring-guide.md)
- [Health Emergency Guide](../operational-and-management-guides/health-emergency-guide.md)
