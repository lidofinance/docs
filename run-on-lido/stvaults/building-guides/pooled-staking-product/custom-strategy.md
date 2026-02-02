---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧩 Pool with a custom strategy

## Intro

This guide walks through how to build and deploy a **pooled staking product with a custom yield strategy** using the DeFi Wrapper toolkit.

The DeFi Wrapper architecture is designed to support **any custom strategy** as long as it implements the required interfaces.

There are **two paths** to getting a pool with a custom strategy:

1. [**Deploy from scratch**](#path-a-deploy-a-new-pool-with-custom-strategy) - Already have a custom strategy and ready to launch a pool

2. [**Upgrade existing pool**](#path-b-upgrade-an-existing-pool-to-a-strategy-pool) - Create a pool and add a custom strategy later

Both paths share the same smart-contract development steps (implementing `IStrategy` and `IStrategyFactory`).

## Smart contract development

1.  Implement the [`IStrategy`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/interfaces/IStrategy.sol) interface

2. Implement the [`IStrategyFactory`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/interfaces/IStrategyFactory.sol) interface. 
  The `_deployBytes` parameter can be used to pass additional strategy-specific configuration during deployment. If your strategy doesn't need extra config, it can be ignored.

3. Deploy the strategy factory

:::note
Note the deployed **strategy factory address** — you will need it in Path A.
:::

:::warning
Make sure to deploy the strategy factory on the same network where you will create the pool (Hoodi testnet for testing, Ethereum mainnet for production).
:::

---

## Path A: Deploy a new pool with custom strategy

Use this path when launching a new product from scratch.

### Create the pool via CLI

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
| `<DEFI_WRAPPER_FACTORY>` | DeFi Wrapper Factory contract address (see [Environments](/run-on-lido/stvaults/building-guides/pooled-staking-product/#environments)) |
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

## Path B: Upgrade an existing pool to a strategy pool

Use this path when you have a running [`StvStETHPool`](/run-on-lido/stvaults/building-guides/pooled-staking-product/#deployment-of-stvstethpool-pool-with-steth-minting) (Wrapper-B) and want to add a strategy without redeploying the pool. All existing user balances and state are preserved through the proxy upgrade.

:::info
This upgrade path uses the [`OssifiableProxy`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/proxy/OssifiableProxy.sol) pattern. The pool contract is a proxy whose implementation can be swapped by its admin (the `TimelockController`). Storage (user balances, roles, parameters) lives in the proxy and is preserved across implementation changes.
:::

### What changes during the upgrade

| Aspect | Before (Wrapper-B) | After (Wrapper-C) |
|--------|--------------------|--------------------|
| Pool type | `STV_STETH_POOL_TYPE` | `STRATEGY_POOL_TYPE` |
| Allowlist | Disabled | Enabled (only strategy can deposit) |
| Strategy | None | Your custom strategy contract |
| Direct user deposits | Allowed | Blocked (users go through strategy) |
| User STV balances | ✅ Preserved | ✅ Preserved |
| Vault, Dashboard, WQ | ✅ Unchanged | ✅ Unchanged |

### Deploy the new pool implementation and strategy

You need two new contracts: a new pool implementation (with `STRATEGY_POOL_TYPE` and `allowListEnabled = true`) and the strategy itself.

#### Deploy new pool implementation

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

#### Deploy strategy implementation and proxy


Deploy your strategy, you can use `forge create` or `cast send` for example

Note the deployed **strategy proxy address**.

:::warning
The strategy proxy admin must be the pool's `TimelockController` address. The `initialize` call sets the Timelock as the strategy's `DEFAULT_ADMIN_ROLE` holder.
:::

### Execute the upgrade via TimelockController batch

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
| 9 | `resumeMinting()` | Re-enable minting (needed if paused in Wrapper-B) |
| 10 | `revokeRole(MINTING_RESUME_ROLE, timelock)` | Remove temporary minting resume capability |

:::info
Steps 8–10 (resume minting) are only needed if minting was paused in the original pool. If minting was already active, these steps can be omitted from the batch.
:::

:::info
Steps 6–7 (revoke pause roles from the Node Operator) adjust the emergency role setup to match the strategy pool configuration. Review the [DeFi Wrapper roles and permissions](./roles-and-permissions) to decide what role assignment is appropriate for your setup.
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

Call `TimelockController.scheduleBatch` on the Timelock contract. This can be done via **Etherscan**, `cast`, or using the **CLI** `propose-*` commands for individual operations.

For a batch call via `cast`:

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

Alternatively, individual operations can be proposed via CLI (each as a separate timelock operation):

```bash
# Propose proxy upgrade
yarn start dw use-cases timelock-governance proxy w propose-upgrade-to-and-call <TIMELOCK> <POOL> <NEW_POOL_IMPL> 0x

# Propose role changes
yarn start dw use-cases timelock-governance pool w propose-grant-role <TIMELOCK> <POOL> <ROLE> <ACCOUNT>
yarn start dw use-cases timelock-governance pool w propose-revoke-role <TIMELOCK> <POOL> <ROLE> <ACCOUNT>
```

:::warning
CLI propose commands schedule individual timelock operations (not a batch). This means each operation requires a separate propose → wait → execute cycle and they are **not atomic**. Use `scheduleBatch` via `cast` or Etherscan if atomicity is required.
:::

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

### Verify the upgrade via CLI

```bash
yarn start defi-wrapper contracts pool r info <POOL_ADDRESS>
yarn start vo r info -v <VAULT_ADDRESS>
```

### What users experience after the upgrade

- **Existing STV balances** are fully preserved — users keep their tokens.
- **Direct deposits** to the pool are no longer possible (blocked by allowlist). Users must go through the strategy.
- **Existing STV holders** can approve and deposit their tokens into the strategy to start receiving strategy-boosted yield.
- **Withdrawals** of existing STV continue to work through the WithdrawalQueue as before.

---

## Reference implementation

The [`GGVStrategy`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/strategy/GGVStrategy.sol) and its [`GGVStrategyFactory`](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/factories/GGVStrategyFactory.sol) serve as the reference implementation for custom strategies.

Study them to understand the complete pattern, including:

- How `StrategyCallForwarderRegistry` manages per-user proxies
- How `FeaturePausable` enables granular pause control
- How to handle ERC-20 approvals and transfers through call forwarders
- How to implement cancel/replace flows for pending exit requests
- How the proxy upgrade preserves all user state

The [upgrade integration test](https://github.com/lidofinance/vaults-wrapper/blob/develop/test/integration/wrapper-upgrade-b-to-c.test.sol) demonstrates the complete Wrapper-B → Wrapper-C upgrade flow.

## Useful links

- [DeFi Wrapper Technical Design](https://hackmd.io/@lido/lido-v3-wrapper-design)
- [IStrategy interface](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/interfaces/IStrategy.sol)
- [IStrategyFactory interface](https://github.com/lidofinance/vaults-wrapper/blob/develop/src/interfaces/IStrategyFactory.sol)
- [Upgrade integration test (Wrapper-B → C)](https://github.com/lidofinance/vaults-wrapper/blob/develop/test/integration/wrapper-upgrade-b-to-c.test.sol)
- [stVaults CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/)
- [stVaults Roles and Permissions](../../features-and-mechanics/roles-and-permissions)
- [Health Monitoring Guide](../../operational-and-management-guides/health-monitoring-guide.md)
