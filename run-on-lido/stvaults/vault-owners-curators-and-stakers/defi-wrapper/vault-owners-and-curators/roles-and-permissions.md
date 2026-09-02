---
sidebar_position: 1
title: 'Roles and Permissions'

---

# Roles and Permissions of stVault with DeFi Wrapper

This page describes **DeFi Wrapper-specific roles** for pooled staking products. For **stVaults roles**, see [stVaults Roles and permissions](../../../concepts-and-reference/roles-and-permissions.md).

DeFi Wrapper is deployed as a set of on-chain contracts (Pool, Withdrawal Queue, Distributor, optional Strategy) connected to a stVault (Vault + Dashboard). Access is controlled by a combination of:

- **`TimelockController` governance** (proposer/executor with a mandatory delay)
- **Role-based access control** (`AccessControl` roles on Pool/WithdrawalQueue/Distributor/Dashboard)
- **Emergency Committee** (fast “pause” capabilities)

## TimelockController roles (governance)

:::info
Use CLI `yarn start defi-wrapper use-cases timelock-governance --help` to get list of commands to operate TimelockController. There are shortcut commands for governing roles and other common operations for the DeFi wrapper.
:::

`TimelockController` is deployed together with the pool and becomes the admin for most DeFi Wrapper components. It is **self-administered**, meaning role changes and privileged actions should go through timelocked proposals.

**Proposer** – schedules operations, and may also cancel a scheduled one. **Executor** – runs an operation once its delay has elapsed. Both are set at deployment, and we recommend splitting them as described in [Non-Custodial Operational Setup](./non-custodial-operations.md).

The Emergency Committee is then granted `CANCELLER_ROLE`, so it can drop a scheduled operation without being able to schedule or run one. The factory grants only the proposer and executor, so that role has to be added afterwards by a proposal through the timelock itself.

| Role            | Where                | Permissions                                                                                              |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `PROPOSER_ROLE` | `TimelockController` | Schedule operations (`schedule`); proposers also get `CANCELLER_ROLE` (can cancel scheduled operations). |
| `EXECUTOR_ROLE` | `TimelockController` | Execute ready operations (`execute`).                                                                    |

## Pool roles

The Pool is an ERC20 share token contract (`StvPool` / `StvStETHPool`) where users deposit ETH and receive STV shares.

| Role | When applicable | Permissions | Default assignment |
| --- | --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | always | Admin for pool roles and configuration | `TimelockController` |
| `ALLOW_LIST_MANAGER_ROLE` | allowlist pools (non-strategy) | Manage the deposit allowlist: add and remove accounts, which is what `DEPOSIT_ROLE` records | the allowlist manager from the deploy config; **nobody** on strategy pools |
| `DEPOSITS_PAUSE_ROLE` | always | Pause ETH deposits into the pool | Emergency Committee |
| `DEPOSITS_RESUME_ROLE` | always | Resume ETH deposits | **nobody** |
| `MINTING_PAUSE_ROLE` | minting pools (`StvStETHPool`) | Pause (w)stETH minting | Emergency Committee |
| `MINTING_RESUME_ROLE` | minting pools (`StvStETHPool`) | Resume (w)stETH minting | **nobody** |
| `LOSS_SOCIALIZER_ROLE` | minting pools (`StvStETHPool`) | Call `forceRebalanceAndSocializeLoss(...)` to close an undercollateralized account, spreading the shortfall over everyone else | **nobody** |

### Allowlist specifics

- If allowlist is enabled for `StvPool` / `StvStETHPool`, the address is granted `ALLOW_LIST_MANAGER_ROLE`.
- For strategy pools the Strategy contract is added to the allowlist during deployment, and **users are expected to supply via the Strategy** (not via the Pool directly).

:::warning
Every role marked **nobody** on this page is unassigned at deployment. Each implementation starts with its features paused and the factory hands out only the pause halves, so resuming takes two timelock rounds: one to grant the resume role, another to use it. Pausing is immediate; unpausing is not.
:::

## Withdrawal Queue roles

Withdrawal Queue (`WithdrawalQueue`) manages withdrawal requests, finalization, and claiming.

| Role | Permissions | Default assignment |
| --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | Admin for queue roles | `TimelockController` |
| `FINALIZE_ROLE` | Finalize withdrawals, and set the finalization gas cost coverage | `nodeOperator` |
| `WITHDRAWALS_PAUSE_ROLE` | Pause new withdrawal requests | Emergency Committee |
| `WITHDRAWALS_RESUME_ROLE` | Resume new withdrawal requests | **nobody** |
| `FINALIZE_PAUSE_ROLE` | Pause finalization | Emergency Committee |
| `FINALIZE_RESUME_ROLE` | Resume finalization | **nobody** |

## Distributor roles

Distributor (`Distributor`) is used for Merkle-based token distributions (e.g., incentives).

| Role | Permissions | Default assignment |
| --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | Admin for distributor roles | `TimelockController` |
| `MANAGER_ROLE` | Add supported tokens, and update the Merkle root and CID | `nodeOperatorManager` |

## EarnETH strategy roles

A pool with the EarnETH connector adds one more contract with its own roles.

| Role | Permissions | Default assignment |
| --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | Admin for strategy roles | `TimelockController` |
| `ALLOW_LIST_MANAGER_ROLE` | Manage who may supply through the strategy, when its allowlist is enabled | `TimelockController` |
| `SUPPLY_PAUSE_ROLE` | Pause entering the strategy | Emergency Committee |
| `SUPPLY_RESUME_ROLE` | Resume entering the strategy | **nobody** |
| `REDEEM_PAUSE_ROLE` | Pause exiting the strategy | **nobody** |
| `REDEEM_RESUME_ROLE` | Resume exiting the strategy | **nobody** |

The strategy carries its own allowlist, separate from the pool's. Whether it is enforced is fixed in the constructor and cannot be switched off by a transaction — turning a private strategy pool public means upgrading to an implementation deployed with the flag off.

## How DeFi Wrapper wires stVault permissions

During deployment, the Factory grants the DeFi Wrapper contracts the minimum required stVault `Dashboard` permissions:

| Role | Permissions | Default assignment |
| --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | Admin for Dashboard roles | `TimelockController` |
| `FUND_ROLE` / `REBALANCE_ROLE` / `MINT_ROLE` / `BURN_ROLE` | Move ETH into the vault, rebalance it, and mint or burn stETH against it | the pool (`StvPool` / `StvStETHPool`) |
| `WITHDRAW_ROLE` | Take ETH out of the vault to settle finalized requests | the Withdrawal Queue |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE` | Stop deposits to validators | Emergency Committee |
