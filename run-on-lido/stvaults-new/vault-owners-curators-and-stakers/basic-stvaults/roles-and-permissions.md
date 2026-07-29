---
sidebar_position: 1
---

# Roles and permissions

Every Basic stVault is controlled through a [`Dashboard`](/contracts/dashboard) contract, which is deployed together with the [`StakingVault`](/contracts/staking-vault) and owns it. `Dashboard` uses OpenZeppelin's `AccessControl` with a **two-admin model**:

- **Vault Owner** (`DEFAULT_ADMIN_ROLE`) — the staker side of the vault.
- **Node Operator Manager** (`NODE_OPERATOR_MANAGER_ROLE`) — the validation service side of the vault.

Each admin holds every permission within its own scope and can delegate individual sub-roles to other addresses. Neither admin can grant roles belonging to the other side.

:::info
`Dashboard` is technically optional — advanced users can interact with `StakingVault` and `VaultHub` directly. Everything on this page describes the default setup, where `Dashboard` is the control surface for the vault.
:::

## Vault contract role

**Node Operator** provides the validation service for the vault: it deposits ETH from the vault balance to validators and exits validators when necessary.

:::warning
The Node Operator address is set once, when the vault is created, and **can never be changed**. There is no setter on `StakingVault`.
:::

:::info
The Node Operator address is registered in the [Operator Grid](/contracts/operator-grid) contract as the primary identifier of the Node Operator. Tiers with defined **Reserve Ratios** and **stETH minting limits** are assigned to this address according to the obtained Category.

This address is also used to perform key operations in stVaults from the Node Operator's perspective and must be set up as a **multisig** for security reasons.
:::

### Node Operator's non-delegable permissions

These are checked against the Node Operator address on `StakingVault` itself, not through `Dashboard` roles, and cannot be delegated.

| Operation                                                                                       |
| ----------------------------------------------------------------------------------------------- |
| Deposit ETH from the Staking Vault to validators using the Predeposit Guarantee contract.       |
| Eject validators (`ejectValidators`) — forcefully withdraw validators via EIP-7002.              |

## Dashboard contract roles and permissions

1. **Vault Owner** [`DEFAULT_ADMIN_ROLE`] is one of the two admin roles for the stVault. It allows managing permissions and changing key vault parameters from the Vault Owner (Staker) perspective. Multiple addresses are supported.

2. **Node Operator Manager** [`NODE_OPERATOR_MANAGER_ROLE`] is the other admin role for the stVault. It allows managing permissions and changing key vault parameters from the Node Operator perspective. Multiple addresses are supported.

:::info
**Holding an admin role is enough to perform any operation in its scope.** Almost all vault operations are guarded by a check for _"caller holds the sub-role **or** the admin of that sub-role"_. So the Vault Owner does not need to grant itself `FUND_ROLE` in order to fund the vault — granting a sub-role only matters when you want a **different** address to be able to perform the operation.
:::

### Permissionless operations

| Permission    | Operation                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------- |
| Permissionless | Disburse Node Operator fees (`disburseFee`).                                                |
| Permissionless | Recover the fee leftover collected on disconnect to the fee recipient (`recoverFeeLeftover`). |

### Vault Owner's non-delegable permissions

These operations are available only to addresses holding `DEFAULT_ADMIN_ROLE` — they cannot be delegated to a sub-role.

| Permission          | Operation                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Grant/revoke any Vault Owner role or permission, including `DEFAULT_ADMIN_ROLE` itself.                                       |
|                     | Accept and transfer the `StakingVault` ownership: `abandonDashboard`, `connectToVaultHub`, `reconnectToVaultHub`.              |
|                     | Set the PDG policy (`setPDGPolicy`) — see [PDGPolicy](/contracts/dashboard#pdgpolicy).                                          |
|                     | Disburse an abnormally high Node Operator fee (`disburseAbnormallyHighFee`).                                                   |
|                     | Recover ERC-20 tokens or ETH wrongly sent to the **`Dashboard` contract** (`recoverERC20`).                                    |

### Operations requiring confirmation from both admins

These are proposed by one admin and executed once the other admin confirms the exact same call within the confirmation expiry window.

| Operation                                        | Description                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `setFeeRate`                                     | Change the Node Operator fee rate.                                                                                              |
| `correctSettledGrowth`                           | Correct the settled growth baseline: marks value as already accounted for, so it is not charged as Node Operator fee again.       |
| `setConfirmExpiry`                               | Change how long a pending confirmation stays valid.                                                                             |
| `transferVaultOwnership`                         | Transfer the `StakingVault` ownership to a new owner without disconnecting from VaultHub.                                        |

:::warning
After `transferVaultOwnership` the Node Operator fee accrual is effectively disabled. To re-enable it, both parties must agree on a new `settledGrowth` via `correctSettledGrowth()`.
:::

### Vault Owner's delegatable permissions (sub-roles)

Granted and revoked by `DEFAULT_ADMIN_ROLE`.

:::info
By default, if no sub-role holder is set, the Vault Owner can perform all the actions described below.
:::

| Permission                          | Operation                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `FUND_ROLE`                         | Supply (fund) ETH to the stVault.                                              |
| `WITHDRAW_ROLE`                     | Withdraw ETH from the stVault balance.                                         |
| `MINT_ROLE`                         | Mint stETH within the boundaries of the stETH minting capacity.                |
| `BURN_ROLE`                         | Repay (burn) previously minted stETH to decrease the stETH liability.          |
| `REBALANCE_ROLE`                    | Perform a voluntary rebalance.                                                 |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE`  | Pause ETH deposits to the Beacon Chain.                                        |
| `RESUME_BEACON_CHAIN_DEPOSITS_ROLE` | Resume ETH deposits to the Beacon Chain.                                       |
| `REQUEST_VALIDATOR_EXIT_ROLE`       | Ask the Node Operator to exit a validator and return ETH to the stVault balance. |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Force a full or partial withdrawal of ETH from a validator via EIP-7002.        |
| `VOLUNTARY_DISCONNECT_ROLE`         | Disconnect from Lido VaultHub (disables minting stETH, stops paying fees to Lido, collects the Node Operator fee). |
| `VAULT_CONFIGURATION_ROLE`          | — Request OperatorGrid to change the vault tier (specify a new tier).           |
|                                     | — Request OperatorGrid to sync the tier params.                                |
|                                     | — Request OperatorGrid to update the share limit of the vault.                 |
|                                     | — Accept a new tier on connection to VaultHub.                                 |
| `COLLECT_VAULT_ERC20_ROLE`          | Collect ERC-20 tokens held by the **vault** — e.g. recovery of tokens wrongly transferred to the vault address, or claiming incentives paid to it as ERC-20. Does not support ETH. |

### Node Operator Manager's non-delegable permissions

| Permission                   | Operation                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NODE_OPERATOR_MANAGER_ROLE` | Grant/revoke any Node Operator role or permission, including `NODE_OPERATOR_MANAGER_ROLE` itself.     |
|                              | Set the Node Operator fee recipient address (`setFeeRecipient`).                                     |
|                              | Confirm the dual-confirmation operations listed [above](#operations-requiring-confirmation-from-both-admins). |

### Node Operator Manager's delegatable permissions (sub-roles)

Granted and revoked by `NODE_OPERATOR_MANAGER_ROLE`.

:::info
By default, if no sub-role holder is set, the Node Operator Manager can perform all the actions described below.
:::

| Permission                                   | Operation                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE`    | Withdraw ETH from the vault and deposit directly to provided validators, bypassing the default PDG process. Requires the `ALLOW_DEPOSIT_AND_PROVE` PDG policy. |
| `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` | Prove unknown validators through PDG. Requires the `ALLOW_PROVE` or `ALLOW_DEPOSIT_AND_PROVE` PDG policy.                                          |
| `NODE_OPERATOR_FEE_EXEMPT_ROLE`              | Add a fee exemption to exclude a value from the Node Operator fee base. The exemption works by increasing the settled growth, effectively treating the exempted amount as if fees were already paid on it. |

## Predeposit Guarantee contract roles and permissions

[`PredepositGuarantee`](/contracts/predeposit-guarantee) has its own permission model, independent of `Dashboard` roles.

### Permissionless operations

| Permission     | Operation                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Permissionless | Provide a Merkle proof of validator existence on CL (positive).                                   |
| Permissionless | Provide a Merkle proof of invalid validator existence on CL (negative) and compensate the staking vault. |

### Configurable permissions

| Role          | Operation                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| Node Operator | Set the Node Operator's guarantor. Set the Node Operator's depositor.                      |
| Vault Owner   | Prove an unknown validator.                                                                |
| Guarantor     | Top up the Node Operator's guarantor bond. Withdraw the guarantor bond. Claim a bond refund. |
| Depositor     | Pre-deposit validators to the Beacon Chain. Deposit validators to the Beacon Chain.        |

## How to change roles and permissions

### Who can change what

| Role being granted or revoked                | Can be granted/revoked by     |
| -------------------------------------------- | ------------------------------- |
| `DEFAULT_ADMIN_ROLE`                         | `DEFAULT_ADMIN_ROLE`          |
| Any Vault Owner sub-role                     | `DEFAULT_ADMIN_ROLE`          |
| `NODE_OPERATOR_MANAGER_ROLE`                 | `NODE_OPERATOR_MANAGER_ROLE`  |
| Any Node Operator Manager sub-role           | `NODE_OPERATOR_MANAGER_ROLE`  |

Role changes take effect immediately — they need no confirmation from the other admin.

:::danger
**Role renouncement is disabled.** `renounceRole()` always reverts, to prevent an address from accidentally locking itself out. A role can only be removed by its admin.

This also means: if you revoke the last `DEFAULT_ADMIN_ROLE` holder, **the vault becomes permanently unmanageable from the Vault Owner side**. The same applies to `NODE_OPERATOR_MANAGER_ROLE`. Always keep at least one working admin address, and prefer a multisig.
:::

### On-chain methods

`Dashboard` exposes both the standard `AccessControl` methods and batched helpers:

| Method                                    | Description                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `grantRole(bytes32 role, address account)`   | Grant a single role.                                                   |
| `revokeRole(bytes32 role, address account)`  | Revoke a single role.                                                  |
| `grantRoles(RoleAssignment[] assignments)`   | Grant several roles to several accounts in one transaction.            |
| `revokeRoles(RoleAssignment[] assignments)`  | Revoke several roles from several accounts in one transaction.         |
| `renounceRole(bytes32, address)`             | **Disabled** — always reverts.                                         |

Each `RoleAssignment` is a `{account, role}` pair. Granting a role an account already holds (or revoking one it does not hold) does not revert and emits no event.

To inspect the current state:

| Method                              | Description                                     |
| ----------------------------------- | ------------------------------------------------- |
| `hasRole(role, account)`            | Whether an account holds a role.                 |
| `getRoleMembers(role)`              | All addresses holding a role.                    |
| `getRoleMemberCount(role)`          | Number of addresses holding a role.              |
| `getRoleAdmin(role)`                | Which role is allowed to grant/revoke this role. |

### Granting a role

<details>
  <summary>using Command-line Interface</summary>

First, discover the role hashes:

```bash
yarn start vo r roles
```

Then grant the role:

```bash
yarn start vo w role-grant --roleAssignments '[{"account": "<address>", "role": "<role_hash_in_hex>"}]'
```

You can pass several assignments in the same array to grant them in one transaction. Interactive mode is also available:

```bash
yarn start vo w role-grant
```

For detailed CLI options, see the [vault operations documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations#role-grant).

</details>

<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/settings/permissions`.
2. Pick the section matching the role's scope — the Vault Owner permissions section, or the "Node Operator Manager Permissions" section.
3. Find the item for the permission you want to delegate and add the address.

You must be connected with an address holding the corresponding admin role.

</details>

### Revoking a role

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w role-revoke --roleAssignments '[{"account": "<address>", "role": "<role_hash_in_hex>"}]'
```

</details>

<details>
  <summary>using stVaults Web UI</summary>

On the same `settings/permissions` page, remove the address from the corresponding permission item.

</details>

### Recommended practices

- Use a **multisig** for both `DEFAULT_ADMIN_ROLE` and `NODE_OPERATOR_MANAGER_ROLE`. Losing an admin address is unrecoverable.
- Grant sub-roles only to addresses that must act **on their own**, e.g. an automation bot that tops up the vault (`FUND_ROLE`) or a monitoring service that can trigger a rebalance (`REBALANCE_ROLE`). The admin already covers all of these.
- Review role members after every operational change — `getRoleMembers` on `Dashboard`, or the permissions page in the Web UI.
- Before revoking, confirm that at least one other address holds the role (`getRoleMemberCount`).

## Related

- [Dashboard contract reference](/contracts/dashboard)
- [StakingVault contract reference](/contracts/staking-vault)
- [OperatorGrid contract reference](/contracts/operator-grid)
- [PredepositGuarantee contract reference](/contracts/predeposit-guarantee)
