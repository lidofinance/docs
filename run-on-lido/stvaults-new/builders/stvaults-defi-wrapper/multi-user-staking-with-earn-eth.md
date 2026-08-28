---
sidebar_position: 2
title: 'Multi-User Staking + Lido EarnETH'

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Multi-User Staking with Additional Yield via Lido EarnETH

## Product value proposition
An end-user staking product with a higher risk/yield profile achieved by depositing stETH minted from the stVault into the Lido EarnETH strategy, with a user-friendly interface that can be embedded into your own or a partner’s distribution channel.

## Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Multiple |
| stETH minting capability | Yes, to deposit into custom DeFi strategy and generate additional yield |

## Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | DeFi Wrapper | Out-of-the-box |
| Connector to DeFi Strategy | Custom connector | Custom |
| User Interface | DeFi Wrapper Embeddable Widget / Custom | Out-of-the-box / Custom |

## What is DeFi Wrapper?

**The DeFi Wrapper** is a no-/low-code toolkit that lets builders, Node Operators, and platforms launch customized user-facing staking products powered by stVaults — with optional automated APR-boosting strategies such as leverage loops or any custom stETH-based yield module.

This guide walks through the concepts and practical steps to launch such a product without deep protocol knowledge.

## Architecture

![Multi-User Staking with Additional Yield via Lido EarnETH](/img/stvaults/builders/architecture_public_vault_earneth.jpg)

## Steps

➡️ URLs and Smart Contract addresses are listed on [Environments](../../concepts-and-reference/architecture-overview#environments)

### 1. Create a tokenized staking vault (pool)

The easiest way to create a tokenized staking vault (pool) is to use the [stVaults CLI](https://lidofinance.github.io/lido-staking-vault-cli).
It's a command-line tool for managing both staking vaults and DeFi Wrapper pools. It deploys a pool plus its underlying staking vault via the [`Factory`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/Factory.sol) contract.

The CLI performs the deployment in two transactions to stay within the current 16M transaction gas limit.

To start:

- Set up the CLI according to the [README](https://github.com/lidofinance/lido-staking-vault-cli/blob/main/README.md).
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

#### Deployment of `StvStrategyPool` with the `Lido Earn ETH` strategy

The pool with the `Lido Earn ETH` strategy: ETH is deposited to validators and generates staking rewards, stETH is minted and automatically deposited to the Earn ETH strategy to earn additional rewards. Deposited stETH is distributed across a curated set of high-performing DeFi strategies, including lending markets and LP positions. The `Earn ETH` strategy is built on Mellow architecture, so the strategy connector is called "MellowStrategy", and the factory is called "MellowStrategyFactory".

To deploy this pool, use the `create-strategy-pool-lido-earn-eth`. The factory addresses for each network are listed in the [Environments](#environments) section. The full parameter reference is available below.

Start the deployment like:

```bash
yarn start defi-wrapper contracts factory w create-strategy-pool-lido-earn-eth <DEFI_WRAPPER_FACTORY> <STRATEGY_FACTORY_ADDRESS> \
  --nodeOperator <NODE_OPERATOR_ADDRESS> \
  --nodeOperatorManager <NODE_OPERATOR_MANAGER_ADDRESS> \
  --nodeOperatorFeeRateBP 10 \
  --confirmExpiry 86400 \
  --minDelaySeconds 3600 \
  --minWithdrawalDelayTime 3600 \
  --name "Staked Earn ETH Pool" \
  --symbol STV \
  --proposer <PROPOSER_ADDRESS> \
  --executor <EXECUTOR_ADDRESS> \
  --emergencyCommittee <EMERGENCY_COMMITTEE_ADDRESS> \
  --reserveRatioGapBP 250
```

You can use `--allowList true` to enable the deposit allowlist for this strategy. AllowList Manager role on Strategy must be set separately by TimeLock governance.

:::warning
AllowList will be always enabled on StvStethPool contract. This allowlist ensures only the strategy contract can deposit into the pool, and minting is required to produce wstETH for the Earn ETH Vault. Strategy contract has its own allow list.
:::

<details>
  <summary>Parameter reference</summary>

| Parameter                    | Description                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<DEFI_WRAPPER_FACTORY>`     | DeFi Wrapper Factory contract address (see [Environments](/run-on-lido/stvaults/building-guides/pooled-staking-product/#environments))           |
| `<STRATEGY_FACTORY_ADDRESS>` | Lido Earn ETH Strategy Factory contract address (see [Environments](/run-on-lido/stvaults/building-guides/pooled-staking-product/#environments)) |
| `--nodeOperator`             | Address of the Node Operator managing validators                                                                                                 |
| `--nodeOperatorManager`      | Address authorized to manage Node Operator settings                                                                                              |
| `--nodeOperatorFeeRateBP`    | Node Operator fee in basis points (10 = 0.1%)                                                                                                    |
| `--confirmExpiry`            | Confirmation timeout in seconds                                                                                                                  |
| `--minDelaySeconds`          | TimeLock minimum delay before execution                                                                                                          |
| `--minWithdrawalDelayTime`   | Minimum delay before withdrawals can be finalized                                                                                                |
| `--name`                     | ERC-20 pool share token name                                                                                                                     |
| `--symbol`                   | ERC-20 pool share token symbol                                                                                                                   |
| `--proposer`                 | Address authorized to propose TimeLock operations                                                                                                |
| `--executor`                 | Address authorized to execute TimeLock operations                                                                                                |
| `--emergencyCommittee`       | Address that can pause pool operations                                                                                                           |
| `--reserveRatioGapBP`        | Reserve ratio gap in basis points (recommended min: 250)                                                                                         |

</details>

#### Managing AllowList for `StvStrategyPool` with `Lido Earn ETH` strategy

Due to design the allow list for `StvStrategyPool` is always on and is limited only to the strategies contracts attached to the pool. The strategy contract(if enabled by `--allowList true`) has it's own allow list. To manage the Strategy allow list, use the following CLI commands:

- `yarn start defi-wrapper use-cases wrapper-operations read info <poolAddress>` to check the current strategy address attached to the pool
- `yarn start defi-wrapper use-cases tinmelock-governance common read get-timelock-address <poolAddress>` to get the timelock address for the pool
- `yarn start defi-wrapper use-cases wrapper-operations read allow-list <strategyAddress>` to check the current allow list state for the strategy
- `yarn start defi-wrapper use-cases timelock-governance strategy write propose-grant-role <timelockAddress> <strategyAddress> ALLOW_LIST_MANAGER_ROLE <managerAddress>` AS PROPOSER to propose adding a manager to the strategy allow list
- `yarn start defi-wrapper use-cases timelock-governance strategy write execute-grant-role <timelockAddress> <strategyAddress> ALLOW_LIST_MANAGER_ROLE <managerAddress>` AS EXECUTOR to execute adding a manager to the strategy allow list after the timelock delay has passed
- `yarn start defi-wrapper use-cases wrapper-operations read allow-list <strategyAddress>` to verify that state was updated
- `yarn start defi-wrapper use-cases wrapper-operations write allow-list-add/allow-list-remove <strategyAddress> <addressesToAddOrRemove>` as holder of ALLOW_LIST_MANAGER_ROLE to add or remove an address from the strategy allow list


### 2. Create Web UI

Follow this [guide](https://github.com/lidofinance/defi-wrapper-widget/blob/main/README.md) to:

- Clone the provided repository
- Use addresses outputted by CLI to fill up `.env`
- Adjust titles, logos, texts, and color scheme to your liking
- Deploy the dApp

## Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed [identification](../../node-operators/node-operator-identification-guide.md) and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

For more information about how this process works for the Basic stVault, please follow [Adjust stETH minting parameters](../../node-operators/change-tier-and-steth-minting-limit.md).

For stVaults with DeFi Wrapper the process of changing tier is a bit different because the Vault Owner role is assigned to the Timelock contract. The Timelock contract itself implements a two-step process for performing an on-chain action. First, the holder of its proposer role creates a proposed on-chain action; second, after a time period, the holder of the executor role executes it.

Thus, changing tier for a pooled vault is a three-step process:

1. Holder of the Timelock's proposer role calls `TimelockController.schedule` to propose the `OperatorGrid.changeTier` call
2. After the timelock period, the holder of the Timelock's executor role calls `TimelockController.execute` for the scheduled proposal
3. Within the confirmation time window period (default 24 hours), the Node Operator calls `OperatorGrid.changeTier` with the same parameters

Confirming tier change request requires applying fresh report to vault. [Read more about applying reports](../../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md)

**Parameters needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier's stETH limit.
- `TimelockAddress`: the address of the `TimelockController` contract (deployed together with the pool).
- `OperatorGridAddress`: the address of the `OperatorGrid` contract (available in the stVaults contract addresses list, see [#Environments](#environments)).

<details>
  <summary>How to determine available tier IDs for your Node Operator</summary>

To find out which tier IDs are available for your Node Operator, you can use:

**CLI:**

```bash
# Get group information for your Node Operator (shows all available tier IDs)
yarn start contracts operator-grid r group <nodeOperatorAddress>

# Get information about a specific tier
yarn start contracts operator-grid r tier <tierId>
```

**Contract call (Etherscan):**

- Navigate to the `OperatorGrid` contract address
- Go to **Contract** → **Read Contract**
- Call `group(nodeOperatorAddress)` to get the `Group` struct, which includes the `tierIds` array
- Call `tier(tierId)` to get details about a specific tier

The `group` method returns a struct containing:

- `operator`: Node operator address
- `shareLimit`: Maximum liability shares across all group vaults
- `liabilityShares`: Current liability shares in the group
- `tierIds`: Array of tier IDs belonging to this Node Operator

</details>

<details>
  <summary>Step 1: Schedule the tier change (Proposer)</summary>

#### CLI

Use `--wallet-connect` option for all commands or provide private key to CLI `.env`

1. Get address of your timelock contract:
   ```bash
   yarn start defi-wrapper use-cases timelock-governance common read get-timelock-address <poolAddress>
   ```
2. Connect wallet that holds the proposer role to CLI
3. Propose change tier
   ```bash
   yarn start defi-wrapper use-cases timelock-governance dashboard write propose-change-tier <timelockAddress> <dashboard> <tierId> <shareLimit>
   ```

#### Etherscan

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

#### CLI

1. Check the timelock delay period:

   ```bash
   # Get timelock address
   yarn start defi-wrapper use-cases timelock-governance common read get-timelock-address <poolAddress>

   # Then get the minimum delay (replace <timelockAddress> with the address from previous command)
   yarn start defi-wrapper use-cases timelock-governance common read get-min-delay <timelockAddress>
   ```

2. Wait for the timelock delay period to pass. You can verify the operation is ready by calling
   ```bash
   yarn start defi-wrapper use-cases timelock-governance common read get-last-operations <timelockAddress>
   ```
3. Connect wallet that holds the executor role to CLI
4. Execute change tier
   ```bash
   yarn start defi-wrapper use-cases timelock-governance dashboard write execute-change-tier <timelockAddress> <dashboard> <tierId> <shareLimit>
   ```

#### Etherscan

1. Check the timelock delay period:

   - Open **Etherscan** and navigate to the **TimelockController** contract by its address.
   - Go to the **Contract** tab → **Read Contract**.
   - Find the `getMinDelay` method and click **Query** to see the minimum delay in seconds.

2. Wait for the timelock delay period to pass. You can verify the operation is ready by calling `isOperationReady(operationId)` on the TimelockController contract (in **Read Contract** tab).
3. Execute change tier, connect the wallet:
   - Open **Etherscan** and navigate to the **TimelockController** contract by its address.
   - Go to the **Contract** tab → **Write Contract**.
   - Click **Connect to Web3** and connect the wallet that holds the **executor role**.Click **Connect to Web3** and connect the wallet that holds the **executor role**.
4. Find the `execute` method in the list and fill out the fields with the **same values** used in the `schedule` call:
   - `target`: the `OperatorGrid` contract address.
   - `value`: `0`.
   - `payload`: the same ABI-encoded call data used in step 1.
   - `predecessor`: `0x0000000000000000000000000000000000000000000000000000000000000000`.
   - `salt`: the same salt value used in step 1.
5. Click **Write** and sign the transaction in your wallet.
6. Click **View your transaction** and wait for it to be executed.

</details>

<details>
  <summary>Step 3: Confirm the tier change (Node Operator)</summary>

Within the confirmation time window period (default 24 hours) after step 2, the Node Operator must confirm the tier change:

#### stVaults UI

1. Go to `https://stvaults.lido.fi/vaults/[vaultAddress]/settings/tier`
2. Connect wallet that has Node operator address
3. Follow UI to confirm tier change

#### CLI

1. Connect wallet that has Node operator address to CLI
2. `yarn start vo w change-tier-by-no -v <vaultAddress> -r <requestedShareLimit> <tierId>`

#### Etherscan

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

## Useful links

- [DeFi Wrapper Technical Design](../../concepts-and-reference/defi-wrapper-technical-design.md)
- [stVaults Roles](../../concepts-and-reference/roles-and-permissions.md)
- [stVaults Metrics](../../concepts-and-reference/metrics.md)
- [stVaults Health Monitoring Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-monitoring-guide.md)
- [stVaults Health Emergency Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-emergency-guide.md)
