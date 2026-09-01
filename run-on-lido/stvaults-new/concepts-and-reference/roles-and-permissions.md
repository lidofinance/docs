---
sidebar_position: 1
---

# Roles and Permissions

Every Basic stVault is controlled through a [`Dashboard`](/contracts/dashboard) contract, which is deployed together with the [`StakingVault`](/contracts/staking-vault) and owns it. `Dashboard` uses OpenZeppelin's `AccessControl` with a **two-admin model**:

- **Vault Owner** (`DEFAULT_ADMIN_ROLE`) — the staker side of the stVault.
- **Node Operator Manager** (`NODE_OPERATOR_MANAGER_ROLE`) — the validation service side of the stVault.

Each admin holds every permission within its own scope and can delegate individual sub-roles to other addresses. Neither admin can grant roles belonging to the other side.

## stVault contract

**Node Operator** provides the validation service for the stVault: it deposits ETH from the stVault balance to validators and exits validators when necessary. The Node Operator address is set once, when the stVault is created, and **can never be changed**.

:::info
The Node Operator address is registered in the [Operator Grid](/contracts/operator-grid) contract as the primary identifier of the Node Operator. Tiers with defined **Reserve Ratios** and **stETH minting limits** are assigned to this address according to the obtained Category.

This address is also used to perform key operations in stVaults from the Node Operator's perspective and must be set up as a **multisig** for security reasons.
:::

### Permissions checked by the stVault contract

These are checked on `StakingVault` itself, not through `Dashboard` roles.

| Permission                     | Operation                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Node Operator — non-delegable  | Eject validators: forcefully withdraw validators via EIP-7002 (`ejectValidators`).                                |
| The stVault's depositor          | Deposit ETH from the stVault balance to validators (`depositToBeaconChain`). In the default setup the depositor is the [`PredepositGuarantee`](#predeposit-guarantee-contract) contract, so the Node Operator triggers deposits through PDG rather than calling the stVault directly. |

## Dashboard contract

1. **Vault Owner** [`DEFAULT_ADMIN_ROLE`] is one of the two admin roles for the stVault. It allows managing permissions and changing key stVault parameters from the Vault Owner (Staker) perspective. Multiple addresses are supported.

2. **Node Operator Manager** [`NODE_OPERATOR_MANAGER_ROLE`] is the other admin role for the stVault. It allows managing permissions and changing key stVault parameters from the Node Operator perspective. Multiple addresses are supported.

**Vault Owner** and **Node Operator Manager** addresses have permissions for all actions within their respective scopes in stVaults. They can also delegate specific permissions (sub-roles) to other addresses.

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

| Permission                                                | Operation                                                                                                                        |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` + `NODE_OPERATOR_MANAGER_ROLE`       | Change the Node Operator fee rate (`setFeeRate`).                                                                                |
|                                                           | Correct the settled growth baseline (`correctSettledGrowth`): marks value as already accounted for, so it is not charged as Node Operator fee again. |
|                                                           | Change how long a pending confirmation stays valid (`setConfirmExpiry`).                                                         |
|                                                           | Transfer the `StakingVault` ownership to a new owner without disconnecting from VaultHub (`transferVaultOwnership`).              |

### Vault Owner's delegatable permissions (sub-roles)

Granted and revoked by `DEFAULT_ADMIN_ROLE`.

:::info
`DEFAULT_ADMIN_ROLE` can perform every action below directly, whether or not the sub-role has been granted to anyone. The Dashboard checks these permissions with `onlyRoleMemberOrAdmin`, which passes for the holder of the role **or** the holder of that role's admin.
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
| `VAULT_CONFIGURATION_ROLE`          | — Request OperatorGrid to change the stVault tier (specify a new tier).           |
|                                     | — Request OperatorGrid to sync the tier params.                                |
|                                     | — Request OperatorGrid to update the share limit of the stVault.                 |
|                                     | — Accept a new tier on connection to VaultHub.                                 |
| `COLLECT_VAULT_ERC20_ROLE`          | Collect ERC-20 tokens held by the **stVault** — e.g. recovery of tokens wrongly transferred to the stVault address, or claiming incentives paid to it as ERC-20. Does not support ETH. |

### Node Operator Manager's non-delegable permissions

| Permission                   | Operation                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NODE_OPERATOR_MANAGER_ROLE` | Grant/revoke any Node Operator role or permission, including `NODE_OPERATOR_MANAGER_ROLE` itself.     |
|                              | Set the Node Operator fee recipient address (`setFeeRecipient`).                                     |
|                              | Confirm the dual-confirmation operations listed [above](#operations-requiring-confirmation-from-both-admins). |

### Node Operator Manager's delegatable permissions (sub-roles)

Granted and revoked by `NODE_OPERATOR_MANAGER_ROLE`.

:::info
As on the Vault Owner side, `NODE_OPERATOR_MANAGER_ROLE` can perform every action below directly, whether or not the sub-role has been granted to anyone — it is the admin of all three, and the checks use `onlyRoleMemberOrAdmin`.

It is also its own admin, so the Vault Owner can neither grant nor revoke it.
:::

| Permission                                   | Operation                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE`    | Withdraw ETH from the stVault and deposit directly to provided validators, bypassing the default PDG process. Requires the `ALLOW_DEPOSIT_AND_PROVE` PDG policy. |
| `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` | Prove unknown validators through PDG. Requires the `ALLOW_PROVE` or `ALLOW_DEPOSIT_AND_PROVE` PDG policy.                                          |
| `NODE_OPERATOR_FEE_EXEMPT_ROLE`              | Add a fee exemption to exclude a value from the Node Operator fee base. The exemption works by increasing the settled growth, effectively treating the exempted amount as if fees were already paid on it. |

## Predeposit Guarantee contract

[`PredepositGuarantee`](/contracts/predeposit-guarantee) has its own permission model, independent of `Dashboard` roles.

### Permissionless operations

| Permission     | Operation                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Permissionless | Provide a Merkle proof of validator existence on CL (positive).                                   |
| Permissionless | Provide a Merkle proof of invalid validator existence on CL (negative) and compensate the staking stVault. |

### Configurable permissions

| Role          | Operation                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| Node Operator | Set the Node Operator's guarantor (`setNodeOperatorGuarantor`). Set the Node Operator's depositor (`setNodeOperatorDepositor`). |
| Vault Owner   | Prove an unknown validator.                                                                |
| Guarantor     | Top up the Node Operator's guarantor bond. Withdraw the guarantor bond. Claim a bond refund. |
| Depositor     | Pre-deposit validators to the Beacon Chain (`predeposit`). Deposit validators to the Beacon Chain (`topUpExistingValidators`, `proveWCActivateAndTopUpValidators`). |

## How to change roles and permissions

### Who can change what

| Role being granted or revoked                | Can be granted/revoked by     |
| -------------------------------------------- | ------------------------------- |
| `DEFAULT_ADMIN_ROLE`                         | `DEFAULT_ADMIN_ROLE`          |
| Any Vault Owner sub-role                     | `DEFAULT_ADMIN_ROLE`          |
| `NODE_OPERATOR_MANAGER_ROLE`                 | `NODE_OPERATOR_MANAGER_ROLE`  |
| Any Node Operator Manager sub-role           | `NODE_OPERATOR_MANAGER_ROLE`  |

Role changes take effect immediately — they need no confirmation from the other admin.

Role changes are made with `grantRole` / `revokeRole` and their batched variants `grantRoles` / `revokeRoles`; current holders can be read with `hasRole` and `getRoleMembers`. See the [Dashboard contract reference](/contracts/dashboard) for full signatures.

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

For detailed CLI options, see the [stVault operations documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations#role-grant).

</details>

<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/settings/permissions`.
2. Pick the section matching the role's scope — **Vault Manager Permissions** (editable by `DEFAULT_ADMIN_ROLE`) or **Node Operator Manager Permissions** (editable by `NODE_OPERATOR_MANAGER_ROLE`). A section you are not allowed to edit is shown read-only.
3. Find the item for the permission you want to delegate and add the address. It is highlighted as a pending addition until you submit.
4. Submit the form to send the transaction.

The page is a single form: every pending addition across all permission items is applied together in one `grantRoles` transaction.

</details>

### Revoking a role

<details>
  <summary>using Command-line Interface</summary>

First, discover the role hashes:

```bash
yarn start vo r roles
```

Then revoke the role:

```bash
yarn start vo w role-revoke --roleAssignments '[{"account": "<address>", "role": "<role_hash_in_hex>"}]'
```

You can pass several assignments in the same array to revoke them in one transaction. Interactive mode is also available:

```bash
yarn start vo w role-revoke
```

For detailed CLI options, see the [stVault operations documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations#role-revoke).

</details>

<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/settings/permissions`.
2. Pick the section matching the role's scope — **Vault Manager Permissions** or **Node Operator Manager Permissions**.
3. Click the address you want to remove in the corresponding permission item — it gets marked for revocation. Click it again to undo.
4. Submit the form to send the transaction.

All addresses marked for revocation are removed together in one `revokeRoles` transaction. If you stage grants and revocations in the same submission, they are sent as two separate transactions.

</details>

### Recommended practices

- Use a **multisig** for both `DEFAULT_ADMIN_ROLE` and `NODE_OPERATOR_MANAGER_ROLE`. Losing an admin address is unrecoverable.
- Grant sub-roles only to addresses that must act **on their own**, e.g. an automation bot that tops up the stVault (`FUND_ROLE`) or a monitoring service that can trigger a rebalance (`REBALANCE_ROLE`). The admin already covers all of these.
- Review role members after every operational change — `getRoleMembers` on `Dashboard`, or the permissions page in the Web UI.
- Before revoking, confirm that at least one other address holds the role (`getRoleMemberCount`).
