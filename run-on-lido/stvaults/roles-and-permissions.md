---
sidebar_position: 3
---

# Roles and permissions
:::warning
This document covers roles and permissions intended for stVaults on mainnet. The implementation on deployed testnet contracts may vary.
:::
## Vault contract role

**Node Operator** provides validation service for the vault: handles depositing ETH from the vault balance to validators and exiting validators if necessary. Address of the Node Operator can’t be changed after the vault is created.

:::info
**The Node Operator address** is registered in the **Operator Grid** contract as the primary identifier of the Node Operator. Tiers with defined **Reserve Ratios** and **stETH minting limits** are assigned to this address according to the obtained Category.

This address is also used to perform key operations in stVaults from the Node Operator’s perspective and must be set up as a **multisig** for security reasons.
:::

### Node Operator's non-delegable permissions
| Operation |
| -------- |
| Deposit ETH from Staking Vault to validators using Predeposit Guarantee contract. |

## Dashboard contract roles and permissions

1. **Vault Owner** [Dashboard contract role DEFAULT_ADMIN (VAULT_OWNER)] is one of the two admin roles for the stVault, allows to manage permissions and change key vault parameters from the Vault Owner (Staker) perspective. Multiple addresses supported.

2. **Node Operator Manager** [Dashboard contract role NODE_OPERATOR_MANAGER] is another of the two admin roles for the stVault, allows to manage permissions and change key vault parameters from the Node Operator perspective. Multiple addresses supported.

**Vault Owner** and **Node Operator Manager** addresses have permissions for all actions within their respective scopes in stVaults. They can also delegate specific permissions (sub-roles) to other addresses.
 
### Permissionless operations

| Permission | Operation |
| -------- | -------- |
|Permissionless | Disburse Node Operator fees. |

### Vault Owner's non-delegable permissions
These operations are available only for addresses with the admin role. 
| Permission | Operation |
| -------- | -------- |
|DEFAULT_ADMIN_ROLE | Grant/Remove role or permission, including own role DEFAULT_ADMIN (VAULT_OWNER). |
|| Confirm the transfer of the StakingVault ownership (Abandon Dashboard, Connect to VaultHub, Reconnect to VaultHub). |
|| Propose and confirm changing NO fee by Multi-roles confirmation. |
|| Propose and confirm changing the Confirmation Expiry parameter by Multi-roles confirmation. |
|| Propose and confirm AccruedRewardsAdjustment: Marks transferred directly ETH as funded (supplied) so that these assets wouldn’t considered as rewards. |


### Vault Owner's delegatable permissions (sub-roles)
:::info
By default, if no override admin role is set, the Vault Owner can perform all the actions described below.
:::
| Permission | Operation |
| -------- | -------- |
| FUND_ROLE | Supply (fund) ETH to the stVault. |
| WITHDRAW_ROLE | Withdraw ETH from the stVault Balance |
| MINT_ROLE | Mint stETH in a boundaries of stETH minting capacity |
| BURN_ROLE | Repay (burn) previously minted stETH to decrease stETH Liability |
| REBALANCE_ROLE | Perform volunteering rebalance |
| PAUSE_BEACON_CHAIN_DEPOSITS_ROLE | Pause deposits ETH to Beacon chain. |
| RESUME_BEACON_CHAIN_DEPOSITS_ROLE | Resume deposits ETH to Beacon chain. |
| REQUEST_VALIDATOR_EXIT_ROLE | Ask Node Operator to exit validator and return ETH to stVault Balance |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE | Force fully or partially withdraw ETH from validator |
| VOLUNTARY_DISCONNECT_ROLE | Disconnect from Lido VaultHub (disable minting stETH, stop paying fees to Lido, distribute Node Operator's fee) |
| VAULT_CONFIGURATION_ROLE | — Request to OperatorGrid to change the vault tier (specify new tier) |
| | — Request to OperatorGrid to change the sync with tier params |
| | — Request to OperatorGrid to update share limit on the vault |
| | — Accept new tier on connection to the VaultHub |
| COLLECT_VAULT_ERC20_ROLE |  Allows recovery of ERC20 tokens wrongly transferred to the Dashboard contract or claim of incentives transferred to the vault address as ERC20 tokens. |


### Node Operator Manager's non-delegable permissions (sub-roles)
| Permission | Operation |
| -------- | -------- |
|NODE_OPERATOR_MANAGER_ROLE| Grant/Remove role or permission, including own role NODE_OPERATOR_MANAGER. |
|| Propose and confirm changing NO fee by Multi-roles confirmation. |
|| Propose and confirm changing Confirmation Expiry parameter by Multi-roles confirmation. |
|| Propose and confirm AccruedRewardsAdjustment: Marks transferred directly ETH as funded (supplied) so that these assets wouldn’t considered as rewards. |
|| Set NO fee recipient address. |

### Node Operator Manager's delegatable permissions (sub-roles)
:::info
By default, if no override admin role is set, the Node Operator Manager can perform all the actions described below.
:::

| Permission | Operation |
| -------- | -------- |
| NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE | Withdraw ether from vault and deposits directly to provided validators bypassing the default PDG process |
| NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE | Prove unknown validators through PDG |
| NODE_OPERATOR_FEE_EXEMPT_ROLE | Add a fee exemption to exclude this value from node operator fee base. The exemption works by increasing the settled growth, effectively treating the exempted amount as if fees were already paid on it. |


## Predeposit guarantee contract roles and permissions

### Permissionless operations
| Permission | Operation |
| -------- | -------- |
|Permissionless | Provide Merkle Proof of validator existence on CL (positive). |
| | Provide Merkle Proof of invalid validator existence on CL (negative) and compensate the staking vault. |

### Predeposit guarantee contract configurable permissions

| Role | Operation |
| -------- | -------- |
| Node Operator | Set Node Operator’s guarantor. Set Node Operator’s depositor. |
| Vault Owner | Prove unknown validator. |
| Guarantor | Top up Node Operator’s guarantor bond. Withdraw Node Operator’s guarantor bond. Claim bond refund. |
| Depositor | Pre-deposit validators to Beacon Chain. Deposit validators to Beacon Chain. |
