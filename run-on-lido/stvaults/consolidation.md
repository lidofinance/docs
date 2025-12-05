---
sidebar_position: 9
---

# Consolidation: Migrate validators to the stVault

Stakers with validators already running may need to join stVaults. Validators in stVaults must have withdrawal credentials set to the Vault contract address. Instead of stopping existing validators, moving funds, and launching new ones, stakers can use the consolidation mechanism [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251). This makes it possible to migrate funds from their current validators to new validators whose withdrawal credentials point to the stVaults.

This document provides step-by-step instructions for performing the process smoothly with our stVaults CLI.

## 1. Setup stVaults CLI tool.

Use [these instructions](https://lidofinance.github.io/lido-staking-vault-cli/) to setup stVaults CLI.

## 2. Preconditions

- Set `NODE_OPERATOR_REWARDS_ADJUST_ROLE` to the address of your original validator's withdrawal credentials:
  - CLI
    - `yarn start dashboard -w role-grant [{"account": <withdrawal_credentials>, "role": <node_operator_role_in_hex>}]`
  - StVault UI
    - go to `https://stvaults-hoodi.testnet.fi/vaults/<vault_address>/settings/permissions`. **TODO: update links to mainnet.**
    - navigate to "Node Operator Manager Permissions" section, "Adjust rewards on the validators" item.
    - add the address of your original validator's withdrawal credentials.
- Source validiators
  - withdrawal credentials must be `0x01` or `0x02` (`0x00` is not supported).
  - must be active (i.e., not exiting or slashed).
  - must be active for at least 256 epochs to be able to perform consolidation.
- Target validators
  - must have a withdrawal credentials of type `0x02` equal to stVault's `withdrawalCredentials()` function result.
  - must be active (i.e., not exiting or slashed).

> **Note:** You can check a validator’s credentials or state at [Beaconcha](https://beaconcha.in/validator/<pubkey>).

## 3. Prepare input data

- A list of source pubkeys of validators that you want to consolidate from.
- A list of target pubkeys of validators that you want to consolidate to.
- Dashboard contract's address used to control the stVault [can be discovered via CLI](https://lidofinance.github.io/lido-staking-vault-cli/get-started/additional-helpers#find-dashboard-by-vault).
- To cover the consolidation fee costs, you'll need some amount of ETH. The exact amount depends on the number of public keys and the current state of the blockchain. You can determine the fee for a single consolidation request by calling the view function `getConsolidationRequestFee` on the `ValidatorConsolidationRequests` contract. The total amount required will be calculated as the number of consolidations multiplied by the fee per request.

## 4. Run consolidation command

All input data for consolidation requests undergoes two checks: off-chain in CLI and on-chain by our audited contract `ValidatorConsolidationRequests`. Additionally, the calldata for the final request is formed on-chain, which brings an additional level of security.

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
yarn start consolidation w <dashboard> --file <path-to-json-with-pubkeys> --wallet-connect
```

- stVaults CLI will use [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792), which enables transaction batching. It will display a QR code or a link for WalletConnect, allowing you to sign the transaction in an external wallet client or in Safe, if you are using a multisig with WalletConnect.
- If your wallet does not support `EIP-5792`, the consolidation request will be executed using the `eth_sendTransaction` method, processing the transaction calls one by one instead of in a batch.

> **Note:** Alternatively, you can list pubkeys directly in the command as parameters:
> If you prefere it's possible to list pubkeys in command as parameteres:

```bash
yarn start consolidation w <dashboard> \
  --source_pubkeys "source_pubkey_first_group_01 source_pubkey_first_group_02, source_pubkey_second_group_01 source_pubkey_second_group_02" \
  --target_pubkeys "target_pubkey_first target_pubkey_second" \
  --wallet-connect
```

## 5. Post-consolidation checks

### 5.1 Check consolidation request state

Consolidation request transactions may succeed on the execution layer but fail on the consensus layer.

- Navigate to: `https://hoodi.beaconcha.in/validator/<pubkey>#consolidations`. **TODO: update links to mainnet.**
- Check the consolidation request status for each validator you consolidated to.

### 5.2 Revoke NODE_OPERATOR_REWARDS_ADJUST_ROLE role

- go to `https://stvaults-hoodi.testnet.fi/vaults/<vault_address>/settings`. **TODO: update links to mainnet.**
- navigate to "Node Operator Manager Permissions" section, "Adjust rewards on the validators" item.
- remove withdrawal credentials address.
