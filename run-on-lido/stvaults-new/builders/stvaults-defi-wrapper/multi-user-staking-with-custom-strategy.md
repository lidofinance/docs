---
sidebar_position: 3
title: 'Multi-User Staking + Custom DeFi Strategy'

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Multi-User Staking with Additional Yield via Custom DeFi Strategy

## Product value proposition
An end-user staking product with a higher risk/yield profile achieved by depositing stETH minted from the stVault into a custom DeFi strategy, with a user-friendly interface that can be embedded into your own or a partner’s distribution channel.

## Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Multiple |
| stETH minting capability | Yes, to deposit into Lido EarnETH and generate additional DeFi yield |

## Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | DeFi Wrapper | Out-of-the-box |
| Connector to DeFi Strategy | Connector to Lido EarnETH | Out-of-the-box |
| User Interface | DeFi Wrapper Embeddable Widget / Custom | Out-of-the-box / Custom |

## What is DeFi Wrapper?

**The DeFi Wrapper** is a no-/low-code toolkit that lets builders, Node Operators, and platforms launch customized user-facing staking products powered by stVaults — with optional automated APR-boosting strategies such as leverage loops or any custom stETH-based yield module.

## Architecture

![Multi-User Staking with Additional Yield via Custom DeFi Strategy](/img/stvaults/builders/architecture_public_vault.jpg)

## Steps

➡️ URLs and Smart Contract addresses are listed on [Environments](../../concepts-and-reference/architecture-overview#environments)

This guide walks through how to build and deploy a **pooled staking product with a custom yield strategy** using the DeFi Wrapper toolkit.

The DeFi Wrapper architecture is designed to support **any custom strategy** as long as it implements the required interfaces.

There are **two paths** to getting a pool with a custom strategy:

1. [**Deploy from scratch**](#path-a-deploy-a-new-pool-with-custom-strategy) - Already have a custom strategy and ready to launch a pool

2. [**Upgrade existing pool**](#path-b-upgrade-an-existing-pool-to-a-strategy-pool) - Create a pool and add a custom strategy later

Both paths share the same smart-contract development steps (implementing `IStrategy` and `IStrategyFactory`).

### Smart contract development

1.  Implement the [`IStrategy`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/interfaces/IStrategy.sol) interface

2. Implement the [`IStrategyFactory`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/interfaces/IStrategyFactory.sol) interface. 
  The `_deployBytes` parameter can be used to pass additional strategy-specific configuration during deployment. If your strategy doesn't need extra config, it can be ignored.

3. Deploy the strategy factory

:::note
Note the deployed **strategy factory address** — you will need it in Path A.
:::

:::warning
Make sure to deploy the strategy factory on the same network where you will create the pool (Hoodi testnet for testing, Ethereum mainnet for production).
:::

---

### Path A: Deploy a new pool with custom strategy

Use this path when launching a new product from scratch.

#### Create the pool via CLI

Use the `create-pool-custom` command to deploy the pool with your strategy:

```bash
yarn start defi-wrapper contracts factory w create-pool-custom <DEFI_WRAPPER_FACTORY> \
  --nodeOperator <NODE_OPERATOR_ADDRESS> \
  --nodeOperatorManager <NODE_OPERATOR_MANAGER_ADDRESS> \
  --nodeOperatorFeeRateBP 10 \
  --confirmExpiry 86400 \
  --minDelaySeconds 3600 \
  --minWithdrawalDelayTime 3600 \
  --name "My Custom Strategy Pool" \
  --symbol STV \
  --proposer <PROPOSER_ADDRESS> \
  --executor <EXECUTOR_ADDRESS> \
  --emergencyCommittee <EMERGENCY_COMMITTEE_ADDRESS> \
  --reserveRatioGapBP 250 \
  --mintingEnabled true \
  --allowList true \
  --allowListManager <ALLOW_LIST_MANAGER_ADDRESS> \
  --strategyFactory <MY_STRATEGY_FACTORY_ADDRESS> \
  --strategyFactoryDeployBytes <strategyFactoryDeployBytes>
```

Run `yarn start defi-wrapper contracts factory write create-pool-custom -h` for the full description of all available parameters.

:::info
The deployer must have at least `1 ETH` available. This is the `CONNECT_DEPOSIT` required to be locked on the vault upon connection to Lido `VaultHub`.
:::

<details>
  <summary>Parameter reference</summary>

| Parameter | Description |
|-----------|-------------|
| `<DEFI_WRAPPER_FACTORY>` | DeFi Wrapper Factory contract address (see [Environments](../../concepts-and-reference/architecture-overview#environments)) |
| `--nodeOperator` | Address of the Node Operator managing validators |
| `--nodeOperatorManager` | Address authorized to manage Node Operator settings |
| `--nodeOperatorFeeRateBP` | Node Operator fee in basis points (10 = 0.1%) |
| `--confirmExpiry` | Confirmation timeout in seconds |
| `--minDelaySeconds` | TimeLock minimum delay before execution |
| `--minWithdrawalDelayTime` | Minimum delay before withdrawals can be finalized |
| `--name` | ERC-20 pool share token name |
| `--symbol` | ERC-20 pool share token symbol |
| `--proposer` | Address authorized to propose TimeLock operations |
| `--executor` | Address authorized to execute TimeLock operations |
| `--emergencyCommittee` | Address that can pause pool operations |
| `--reserveRatioGapBP` | Reserve ratio gap in basis points (recommended min: 250) |
| `--mintingEnabled` | Enable stETH minting (`true` / `false`) |
| `--allowList` | Enable deposit allowlist (`true` / `false`) |
| `--allowListManager` | Address managing the allowlist |
| `--strategyFactory` | Your deployed strategy factory address |
| `--strategyFactoryDeployBytes` | Optional hex-encoded bytes passed to your factory's `deploy()` |

</details>

:::warning
The minimum recommended value for `reserveRatioGapBP` is `250` (2.5%). It is expected to be sufficient to absorb enough of the vault's performance volatility to keep users' positions healthy in most cases.
:::


After successful deployment, the CLI outputs the addresses and environment variables you need:

- **Vault** contract address
- **Pool** contract address
- **WithdrawalQueue** contract address
- **Distributor** contract address
- **Strategy** contract address
- **TimeLock** contract address
- UI environment variables (`VITE_POOL_ADDRESS`, `VITE_POOL_TYPE`, etc.)

:::info
Keep the CLI output — you will need these addresses for the UI setup and ongoing operations.
:::

Continue with [Post-deployment steps](/run-on-lido/stvaults/building-guides/pooled-staking-product/#2-create-web-ui).

---

### Path B: Upgrade an existing pool to a strategy pool

Use this path when you have a running [`StvStETHPool`](/run-on-lido/stvaults/building-guides/pooled-staking-product/#deployment-of-stvstethpool-pool-with-steth-minting) and want to add a strategy without redeploying the pool. All existing user balances and state are preserved through the proxy upgrade.

:::info
This upgrade path uses the [`OssifiableProxy`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/proxy/OssifiableProxy.sol) pattern. The pool contract is a proxy whose implementation can be swapped by its admin (the `TimelockController`). Storage (user balances, roles, parameters) lives in the proxy and is preserved across implementation changes.
:::

#### What changes during the upgrade

| Aspect | Before (`StvStETHPool`) | After (`StvStrategyPool`) |
|--------|------------------------|--------------------------------------|
| Pool type | `STV_STETH_POOL_TYPE` | `STRATEGY_POOL_TYPE` |
| Allowlist | Disabled | Enabled (only strategy can deposit) |
| Strategy | None | Your custom strategy contract |
| Direct user deposits | Allowed | Blocked (users go through strategy) |
| User STV balances | ✅ Preserved | ✅ Preserved |
| Vault, Dashboard, WQ | ✅ Unchanged | ✅ Unchanged |

#### Deploy the new pool implementation and strategy

You need two new contracts: a new pool implementation (with `STRATEGY_POOL_TYPE` and `allowListEnabled = true`) and the strategy itself.

##### Deploy new pool implementation

Use the existing `StvStETHPoolFactory` to create a new implementation with the correct pool type:

```bash
cast send <STV_STETH_POOL_FACTORY> \
  "deploy(address,bool,uint256,address,address,bytes32)(address)" \
  <DASHBOARD> \
  true \
  <RESERVE_RATIO_GAP_BP> \
  <WITHDRAWAL_QUEUE> \
  <DISTRIBUTOR> \
  <STRATEGY_POOL_TYPE> \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY
```

Parameters:
- `<STV_STETH_POOL_FACTORY>` — the `StvStETHPoolFactory` address from the DeFi Wrapper Factory (`Factory.STV_STETH_POOL_FACTORY()`)
- `<DASHBOARD>` — your pool's existing Dashboard address
- `true` — enables the allowlist (immutable in the new implementation)
- `<RESERVE_RATIO_GAP_BP>` — same value as the existing pool (e.g., `500`)
- `<WITHDRAWAL_QUEUE>` — your pool's existing WithdrawalQueue address
- `<DISTRIBUTOR>` — your pool's existing Distributor address
- `<STRATEGY_POOL_TYPE>` — the strategy pool type hash (`Factory.STRATEGY_POOL_TYPE()`)

Note the deployed **new pool implementation address**.

##### Deploy strategy implementation

Deploy the strategy implementation contract. For example:

```bash
forge create src/strategy/MyStrategy.sol:MyStrategy \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY \
  --broadcast \
  --constructor-args <CONSTRUCTOR_ARGS>
```

Note the deployed **strategy implementation address**.

##### Deploy strategy proxy

The strategy must be deployed behind an [`OssifiableProxy`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/proxy/OssifiableProxy.sol). The proxy is created with three parameters:

- `implementation_` — the strategy implementation address from the previous step
- `admin_` — the pool's `TimelockController` address (proxy admin who can upgrade the implementation)
- `data_` — the ABI-encoded `initialize` calldata to be executed on the implementation during proxy creation

First, encode the `initialize` calldata:

```bash
INITIALIZE_CALLDATA=$(cast calldata "initialize(address,address)" <TIMELOCK> <EMERGENCY_COMMITTEE>)
```

Where:
- `<TIMELOCK>` — the pool's TimelockController address (will receive `DEFAULT_ADMIN_ROLE` on the strategy)
- `<EMERGENCY_COMMITTEE>` — address that will receive the initial pause role (e.g., `SUPPLY_PAUSE_ROLE`)

Then deploy the proxy:

```bash
forge create src/proxy/OssifiableProxy.sol:OssifiableProxy \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY \
  --broadcast \
  --constructor-args <STRATEGY_IMPL> <TIMELOCK> $INITIALIZE_CALLDATA
```

Note the deployed **strategy proxy address** — this is the address you will use in the TimelockController batch below.

:::warning
The proxy admin must be the pool's `TimelockController` address. The `initialize` call sets the Timelock as the strategy's `DEFAULT_ADMIN_ROLE` holder.
:::

#### Execute the upgrade via TimelockController batch

The upgrade must be executed as an **atomic batch** through the `TimelockController` to prevent an intermediate state where the allowlist is enabled but the strategy is not yet allowlisted.

The batch consists of operations, all targeting the pool proxy:

:::warning
The exact number and content of operations depends on the current pool configuration (e.g., whether minting is paused, which roles are assigned). The example below is illustrative and may differ in your case.
:::

| # | Operation | Purpose |
|---|-----------|---------|
| 1 | `proxy__upgradeToAndCall(newImpl, "")` | Swap implementation to strategy pool type |
| 2 | `grantRole(ALLOW_LIST_MANAGER_ROLE, timelock)` | Temporarily grant allowlist management to Timelock |
| 3 | `addToAllowList(strategyProxy)` | Allow the strategy to deposit into the pool |
| 4 | `revokeRole(ALLOW_LIST_MANAGER_ROLE, factory)` | Remove Factory's allowlist management |
| 5 | `revokeRole(ALLOW_LIST_MANAGER_ROLE, timelock)` | Remove Timelock's temporary allowlist management |
| 6 | `revokeRole(DEPOSITS_PAUSE_ROLE, nodeOperator)` | Adjust pause roles for the new setup |
| 7 | `revokeRole(MINTING_PAUSE_ROLE, nodeOperator)` | Adjust pause roles for the new setup |
| 8 | `grantRole(MINTING_RESUME_ROLE, timelock)` | Temporarily grant minting resume capability |
| 9 | `resumeMinting()` | Re-enable minting (needed if paused in the original pool) |
| 10 | `revokeRole(MINTING_RESUME_ROLE, timelock)` | Remove temporary minting resume capability |

:::info
Steps 8–10 (resume minting) are only needed if minting was paused in the original pool. If minting was already active, these steps can be omitted from the batch.
:::

:::info
Steps 6–7 (revoke pause roles from the Node Operator) adjust the emergency role setup to match the strategy pool configuration. Review the [DeFi Wrapper roles and permissions](../../vault-owners-curators-and-stakers/defi-wrapper/vault-owner-and-curator-guides/roles-and-permissions.md) to decide what role assignment is appropriate for your setup.
:::

<details>
  <summary>Step 1: Prepare calldata for each operation</summary>

Use `cast` (from Foundry) to encode each payload:

```bash
# 1. Upgrade pool implementation
PAYLOAD_1=$(cast calldata "proxy__upgradeToAndCall(address,bytes)" <NEW_POOL_IMPL> 0x)

# 2. Grant ALLOW_LIST_MANAGER_ROLE to timelock
ALLOW_LIST_MANAGER_ROLE=$(cast call <POOL> "ALLOW_LIST_MANAGER_ROLE()(bytes32)" --rpc-url $RPC_URL)
PAYLOAD_2=$(cast calldata "grantRole(bytes32,address)" $ALLOW_LIST_MANAGER_ROLE <TIMELOCK>)

# 3. Add strategy to allowlist
PAYLOAD_3=$(cast calldata "addToAllowList(address)" <STRATEGY_PROXY>)

# 4. Revoke ALLOW_LIST_MANAGER_ROLE from factory
PAYLOAD_4=$(cast calldata "revokeRole(bytes32,address)" $ALLOW_LIST_MANAGER_ROLE <FACTORY>)

# 5. Revoke ALLOW_LIST_MANAGER_ROLE from timelock
PAYLOAD_5=$(cast calldata "revokeRole(bytes32,address)" $ALLOW_LIST_MANAGER_ROLE <TIMELOCK>)

# 6. Revoke DEPOSITS_PAUSE_ROLE from node operator
DEPOSITS_PAUSE_ROLE=$(cast call <POOL> "DEPOSITS_PAUSE_ROLE()(bytes32)" --rpc-url $RPC_URL)
PAYLOAD_6=$(cast calldata "revokeRole(bytes32,address)" $DEPOSITS_PAUSE_ROLE <NODE_OPERATOR>)

# 7. Revoke MINTING_PAUSE_ROLE from node operator
MINTING_PAUSE_ROLE=$(cast call <POOL> "MINTING_PAUSE_ROLE()(bytes32)" --rpc-url $RPC_URL)
PAYLOAD_7=$(cast calldata "revokeRole(bytes32,address)" $MINTING_PAUSE_ROLE <NODE_OPERATOR>)

# 8. Grant MINTING_RESUME_ROLE to timelock
MINTING_RESUME_ROLE=$(cast call <POOL> "MINTING_RESUME_ROLE()(bytes32)" --rpc-url $RPC_URL)
PAYLOAD_8=$(cast calldata "grantRole(bytes32,address)" $MINTING_RESUME_ROLE <TIMELOCK>)

# 9. Resume minting
PAYLOAD_9=$(cast calldata "resumeMinting()")

# 10. Revoke MINTING_RESUME_ROLE from timelock
PAYLOAD_10=$(cast calldata "revokeRole(bytes32,address)" $MINTING_RESUME_ROLE <TIMELOCK>)
```

</details>

<details>
  <summary>Step 2: Schedule the batch (Proposer)</summary>

Call `TimelockController.scheduleBatch` on the Timelock contract. This can be done via **Etherscan** or `cast`:

```bash
POOL=<POOL_ADDRESS>
PREDECESSOR=0x0000000000000000000000000000000000000000000000000000000000000000
SALT=0x0000000000000000000000000000000000000000000000000000000000000000
DELAY=<MIN_DELAY_SECONDS>

cast send <TIMELOCK> \
  "scheduleBatch(address[],uint256[],bytes[],bytes32,bytes32,uint256)" \
  "[$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL]" \
  "[0,0,0,0,0,0,0,0,0,0]" \
  "[$PAYLOAD_1,$PAYLOAD_2,$PAYLOAD_3,$PAYLOAD_4,$PAYLOAD_5,$PAYLOAD_6,$PAYLOAD_7,$PAYLOAD_8,$PAYLOAD_9,$PAYLOAD_10]" \
  $PREDECESSOR \
  $SALT \
  $DELAY \
  --rpc-url $RPC_URL \
  --private-key $PROPOSER_KEY
```

Note the **operation ID** from the `CallScheduled` event in the transaction logs.

</details>

<details>
  <summary>Step 3: Execute the batch (Executor)</summary>

After the timelock delay has passed, execute the batch:

```bash
cast send <TIMELOCK> \
  "executeBatch(address[],uint256[],bytes[],bytes32,bytes32)" \
  "[$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL,$POOL]" \
  "[0,0,0,0,0,0,0,0,0,0]" \
  "[$PAYLOAD_1,$PAYLOAD_2,$PAYLOAD_3,$PAYLOAD_4,$PAYLOAD_5,$PAYLOAD_6,$PAYLOAD_7,$PAYLOAD_8,$PAYLOAD_9,$PAYLOAD_10]" \
  $PREDECESSOR \
  $SALT \
  --rpc-url $RPC_URL \
  --private-key $EXECUTOR_KEY
```

You can verify the operation is ready before executing:
```bash
cast call <TIMELOCK> "isOperationReady(bytes32)(bool)" <OPERATION_ID> --rpc-url $RPC_URL
```

</details>

#### Verify the upgrade via CLI

```bash
yarn start defi-wrapper contracts pool r info <POOL_ADDRESS>
yarn start vo r info -v <VAULT_ADDRESS>
```

#### What users experience after the upgrade

- **Existing STV balances** are fully preserved — users keep their tokens.
- **Direct deposits** to the pool are no longer possible (blocked by allowlist). Users must go through the strategy.
- **Existing STV holders** can approve and deposit their tokens into the strategy to start receiving strategy-boosted yield.
- **Withdrawals** of existing STV continue to work through the WithdrawalQueue as before.

---

### Reference implementation

The [`MellowStrategy`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/strategy/MellowStrategy.sol) (Lido EarnETH Strategy) and its [`MellowStrategyFactory`](https://github.com/lidofinance/vaults-wrapper/blob/main/src/factories/MellowStrategyFactory.sol) serve as the reference implementation for custom strategies.

Study them to understand the complete pattern, including:

- How `StrategyCallForwarderRegistry` manages per-user proxies
- How `FeaturePausable` enables granular pause control
- How to handle ERC-20 approvals and transfers through call forwarders
- How to implement cancel/replace flows for pending exit requests
- How the proxy upgrade preserves all user state

The [upgrade integration test](https://github.com/lidofinance/vaults-wrapper/blob/main/test/integration/wrapper-upgrade-b-to-c.test.sol) demonstrates the complete `StvStETHPool` → strategy pool upgrade flow.



### Create Web UI

If your custom strategy has an interface and operations similar to Lido EarnETH, you can use the out-of-the-box DeFi Wrapper embeddable widget with minor modifications. Follow this [guide](https://github.com/lidofinance/defi-wrapper-widget/blob/main/README.md) to:

- Clone the provided repository
- Use addresses outputted by CLI to fill up `.env`
- Adjust titles, logos, texts, and color scheme to your liking
- Deploy the dApp

## Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed [identification](../../node-operators/basic-stvaults/node-operator-identification-guide.md) and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

For more information about how this process works for the Basic stVault, please follow [Adjust stETH minting parameters](../../node-operators/basic-stvaults/change-tier-and-steth-minting-limit.md).

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
- `OperatorGridAddress`: the address of the `OperatorGrid` contract (available in the stVaults contract addresses list, see [Environments](../../concepts-and-reference/architecture-overview#environments)).

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

1. Open **Etherscan** and navigate to the **OperatorGrid** contract by its address (available in the stVaults contract addresses list, see [Environments](../../concepts-and-reference/architecture-overview#environments)).
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
