---
sidebar_position: 2
---

# 🔐 DeFi Wrapper roles and permissions

This page describes **DeFi Wrapper-specific roles** for pooled staking products. For **stVaults roles**, see [stVaults Roles and permissions](../../features-and-mechanics/roles-and-permissions).

DeFi Wrapper is deployed as a set of on-chain contracts (Pool, Withdrawal Queue, Distributor, optional Strategy) connected to a stVault (Vault + Dashboard). Access is controlled by a combination of:

- **`TimelockController` governance** (proposer/executor with a mandatory delay)
- **Role-based access control** (`AccessControl` roles on Pool/WithdrawalQueue/Distributor/Dashboard)
- **Emergency Committee** (fast “pause” capabilities)

## TimelockController roles (governance)

:::info
Use CLI `yarn start defi-wrapper use-cases timelock-governance --help` to get list of commands to operate TimelockController. There are shortcut commands for governing roles and other common operations for the DeFi wrapper.  
:::

`TimelockController` is deployed together with the pool and becomes the admin for most DeFi Wrapper components. It is **self-administered**, meaning role changes and privileged actions should go through timelocked proposals.

**Proposer** – the entity responsible for proposing an upgrade. By default, this actor is the Vault owner.

**Executor** – the entity responsible for accepting the upgrade. This may be a committee of independent security experts trusted by both the vault owner and its users.

| Role            | Where                | Permissions                                                                                              |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `PROPOSER_ROLE` | `TimelockController` | Schedule operations (`schedule`); proposers also get `CANCELLER_ROLE` (can cancel scheduled operations). |
| `EXECUTOR_ROLE` | `TimelockController` | Execute ready operations (`execute`).                                                                    |

## Pool roles

The Pool is an ERC20 share token contract (`StvPool` / `StvStETHPool`) where users deposit ETH and receive STV shares.

| Role                                           | When applicable                | Permissions                                                                                                                                                     |
| ---------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`                           | always                         | Admin for pool roles and configuration. Assigned to the pool `TimelockController`.                                                                              |
| `ALLOW_LIST_MANAGER_ROLE`                      | allowlist pools (non-strategy) | Manage the deposit allowlist: add/remove accounts (controls `DEPOSIT_ROLE`).                                                                                    |
| `DEPOSITS_PAUSE_ROLE` / `DEPOSITS_RESUME_ROLE` | always                         | Pause/resume ETH deposits into the pool. <br/><br/> **Pause**: Emergency Committee; <br/>**Resume**: via timelock governance                                    |
| `MINTING_PAUSE_ROLE` / `MINTING_RESUME_ROLE`   | minting pools (`StvStETHPool`) | Pause/resume (w)stETH minting. <br/><br/> **Pause**: Emergency Committee; <br/>**Resume**: via timelock governance                                              |
| `LOSS_SOCIALIZER_ROLE`                         | minting pools (`StvStETHPool`) | Call `forceRebalanceAndSocializeLoss(...)` for undercollateralized accounts (typically used by an operator/keeper before emergency actions such as disconnect). |

### Allowlist specifics

- If allowlist is enabled for `StvPool` / `StvStETHPool`, the address is granted `ALLOW_LIST_MANAGER_ROLE`.
- For strategy pools the Strategy contract is added to the allowlist during deployment, and **users are expected to supply via the Strategy** (not via the Pool directly).

## Withdrawal Queue roles

Withdrawal Queue (`WithdrawalQueue`) manages withdrawal requests, finalization, and claiming.

| Role                                                 | Permissions                                                                                                                          | Default assignment   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `DEFAULT_ADMIN_ROLE`                                 | Admin for queue roles.                                                                                                               | `TimelockController` |
| `FINALIZE_ROLE`                                      | Finalize withdrawals; set finalization gas cost coverage.                                                                            | `nodeOperator`       |
| `WITHDRAWALS_PAUSE_ROLE` / `WITHDRAWALS_RESUME_ROLE` | Pause/resume new withdrawal request submissions. <br/><br/> **Pause**: Emergency Committee; <br/>**Resume**: via timelock governance |                      |
| `FINALIZE_PAUSE_ROLE` / `FINALIZE_RESUME_ROLE`       | Pause/resume finalization. <br/><br/> **Pause**: Emergency Committee; <br/>**Resume**: via timelock governance                       |                      |

## Distributor roles

Distributor (`Distributor`) is used for Merkle-based token distributions (e.g., incentives).

| Role                 | Permissions                                                                   | Default assignment    |
| -------------------- | ----------------------------------------------------------------------------- | --------------------- |
| `DEFAULT_ADMIN_ROLE` | Admin for distributor roles.                                                  | `TimelockController`  |
| `MANAGER_ROLE`       | Manage distribution config: add supported tokens; update Merkle root and CID. | `nodeOperatorManager` |

## How DeFi Wrapper wires stVault permissions

During deployment, the Factory grants the DeFi Wrapper contracts the minimum required stVault `Dashboard` permissions:

| Role                                                       | Default assignment                                    |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`                                       | TimelockController contract on the Dashboard contract |
| `FUND_ROLE` / `REBALANCE_ROLE` / `MINT_ROLE` / `BURN_ROLE` | StvPool/StvStETHPool contract                         |
| `WITHDRAW_ROLE`                                            | Withdrawal Queue contract                             |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE`                         | Emergency Committee                                   |
