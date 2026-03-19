---
sidebar_position: 3
---

# 🔁 Consolidations

Stakers with validators already running may need to join stVaults. Validators in stVaults must have withdrawal credentials set to the Vault contract address. Instead of stopping existing validators, moving funds, and launching new ones, stakers can use the consolidation mechanism [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251). This makes it possible to migrate funds from their current validators to new validators whose withdrawal credentials point to the stVaults.

This document provides step-by-step instructions for performing the process smoothly with our stVaults CLI.

:::warning
Consolidation is irreversible. Once initiated, the process cannot be undone.
:::

:::info
The consolidation mechanism only transfers the effective balance from source validators to target validators. Any rewards above the effective balance are automatically withdrawn to the source validator's withdrawal credentials during the consolidation process.
:::

## 1. Setup stVaults CLI tool

Use [these instructions](https://lidofinance.github.io/lido-staking-vault-cli/) to setup stVaults CLI.

## 2. Preconditions

- A fresh oracle report must be applied to the vault before consolidating. See the [Applying Report Guide](../operational-and-management-guides/applying-report-guide) for details.
- Grant `NODE_OPERATOR_FEE_EXEMPT_ROLE` to the address of your original validator's withdrawal credentials:

<details>
  <summary>using Command-line Interface</summary>

First, discover the role hash:

```bash
yarn start vo r roles
```

Then grant the role:

```bash
yarn start vo w role-grant --roleAssignments '[{"account": "<withdrawal_credentials>", "role": "<node_operator_fee_exempt_role_in_hex>"}]'
```

You can also use interactive mode:

```bash
yarn start vo w role-grant
```

For detailed CLI options, see [vault operations documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations#role-grant).

</details>
<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/settings/permissions`.
2. Navigate to the "Node Operator Manager Permissions" section, "Node operator's sub-role for fee exemptions" item.
3. Add the address of your original validator's withdrawal credentials.

</details>

- Source validators
  - withdrawal credentials must be `0x01` or `0x02` (`0x00` is not supported).
  - withdrawal credentials must point to an address able to sign and execute transactions.
  - must be active (i.e., not exiting or slashed).
  - must be active for at least 256 epochs (`SHARD_COMMITTEE_PERIOD`) to be able to perform consolidation.
  - must have no pending withdrawals in the queue.
- Target validators
  - must have withdrawal credentials of type `0x02` equal to stVault's `withdrawalCredentials()` function result.
  - must be active (i.e., not exiting or slashed). **For newly created validators, this means depositing at least 32 ETH (`MIN_ACTIVATION_BALANCE`) and waiting for activation.**

:::note
You can check a validator's credentials or state at [beaconcha.in](https://beaconcha.in/validator/<pubkey>).
:::

## 3. Prepare input data

- A list of source pubkeys of validators that you want to consolidate from.
- A list of target pubkeys of validators that you want to consolidate to.
- The [Dashboard](/contracts/dashboard) contract address used to control the stVault. You can discover it via CLI:
  ```bash
  yarn start helpers find-dashboard-by-vault <vault_address>
  ```
  For more details, see [additional helpers documentation](https://lidofinance.github.io/lido-staking-vault-cli/get-started/additional-helpers#find-dashboard-by-vault).
- To cover the consolidation fee costs, you'll need some amount of ETH. The exact amount depends on the number of public keys and the current state of the blockchain. You can determine the fee for a single consolidation request by calling the view function [`getConsolidationRequestFee`](/contracts/validator-consolidation-requests#getconsolidationrequestfee) on the [`ValidatorConsolidationRequests`](/contracts/validator-consolidation-requests) contract. The total amount required will be calculated as the number of consolidations multiplied by the fee per request.

## 4. Run consolidation command

All input data for consolidation requests undergoes two checks: off-chain in CLI and on-chain by our audited contract [`ValidatorConsolidationRequests`](/contracts/validator-consolidation-requests). Additionally, the calldata for the final request is formed on-chain, which brings an additional level of security.

---

### Steps

1. Configure WalletConnect [by the instruction](https://lidofinance.github.io/lido-staking-vault-cli/get-started/wallet-connect).
2. Create a JSON file with pubkeys in the following format:

```json
{
  "target_pubkey_first": ["source_pubkey_first_group_01", "source_pubkey_first_group_02"],
  "target_pubkey_second": ["source_pubkey_second_group_01", "source_pubkey_second_group_02"]
}
```

3. Run the command using the WalletConnect option:

```bash
yarn start consolidation write consolidate-validators <dashboard> --file <path-to-json-with-pubkeys> --wallet-connect --batch
```

- By default, stVaults CLI will execute consolidation requests using the `eth_sendTransaction` method, processing the transaction calls one by one. It will display a QR code or a link for WalletConnect, allowing you to sign the transactions in an external wallet client or in Safe, if you are using a multisig with WalletConnect.
- You can use the `--batch` flag (requires `--wallet-connect`) to bundle all consolidation requests and fee exemption adjustments into a single transaction using [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) for more gas-efficient execution.
- If your wallet does not support batching with `EIP-5792`, the consolidation requests will fall back to individual transactions even with the `--batch` flag.

:::info
The CLI automatically filters out inactive validators from the consolidation list and displays a warning for any removed validators.
:::

For detailed information about consolidation command options, requirements, and error handling, see the [stVaults CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/consolidation#consolidate-validators-consolidate).

:::note
Alternatively, you can list pubkeys directly in the command as parameters:

```bash
yarn start consolidation write consolidate-validators <dashboard> \
  --source_pubkeys "source_pubkey_first_group_01 source_pubkey_first_group_02, source_pubkey_second_group_01 source_pubkey_second_group_02" \
  --target_pubkeys "target_pubkey_first target_pubkey_second" \
  --wallet-connect
```

:::

:::info[What happens after the request]
Once a consolidation request is processed on the consensus layer:

1. **Exit is scheduled** — the source validator's `exit_epoch` is set. If many validators are exiting network-wide, the churn limit may delay the actual exit epoch. The source validator **earns rewards** while waiting.
2. **Source validator exits** — at `exit_epoch`, the source validator is excluded from active duties (attestations, block proposals)[^1]. The source validator **stops earning rewards**.

[^1]: In rare cases, exited validators [may still be called for sync committee duties](https://ethresear.ch/t/sync-committees-exited-validators-participating-in-sync-committee/15634) if they were assigned before exit. Such validators should remain active for up to 256 epochs (`SHARD_COMMITTEE_PERIOD`) after exit to fulfill these duties.
3. **Withdrawability delay** — the source validator waits `MIN_VALIDATOR_WITHDRAWABILITY_DELAY` (256 epochs, ~27 hours). **No rewards are earned** on this balance during the delay.
4. **Balance transfer** — the source validator's effective balance is moved to the target validator. Any excess above the effective balance is withdrawn to the source validator's withdrawal credentials. The target validator **starts earning rewards** on the combined balance.
   :::

## 5. Post-consolidation checks

### 5.1 Check consolidation request state

Consolidation request transactions may succeed on the execution layer but fail on the consensus layer.

- Navigate to: `https://beaconcha.in/validator/<pubkey>#consolidations`.
- Check the consolidation request status for each validator you consolidated to.

### 5.2 Revoke NODE_OPERATOR_FEE_EXEMPT_ROLE role

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start vo w role-revoke --roleAssignments '[{"account": "<withdrawal_credentials>", "role": "<node_operator_fee_exempt_role_in_hex>"}]'
```

You can also use interactive mode:

```bash
yarn start vo w role-revoke
```

For detailed CLI options, see [vault operations documentation](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations#role-revoke).

</details>
<details>
  <summary>using stVaults Web UI</summary>

1. Go to `https://stvaults.lido.fi/vaults/<vault_address>/settings/permissions`.
2. Navigate to the "Node Operator Manager Permissions" section, "Node operator's sub-role for fee exemptions" item.
3. Remove the withdrawal credentials address.

</details>

## Useful links

- [ValidatorConsolidationRequests contract](/contracts/validator-consolidation-requests)
- [Dashboard contract](/contracts/dashboard)
- [stVaults Roles and Permissions](../features-and-mechanics/roles-and-permissions)
- [Applying Report Guide](../operational-and-management-guides/applying-report-guide)
- [EIP-7251: Increase the MAX_EFFECTIVE_BALANCE](https://eips.ethereum.org/EIPS/eip-7251)
- [stVaults CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/)
- [stVaults CLI consolidation command](https://lidofinance.github.io/lido-staking-vault-cli/commands/consolidation)
