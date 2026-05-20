---
sidebar_position: 1
---

# 🔑 Key Generation & Fee Recipient

The Curated Module v2 requires `0x02` (compounding) validator keys. This page walks through generating them using the [EthStaker Deposit CLI](https://github.com/ethstaker/ethstaker-deposit-cli), the most widely used tool for validator key generation.

If you're planning to use DVT or your organization uses a different key generation process, make sure the output meets the same requirements described below.

:::info
Please note that each key should be generated with a deposit amount of 32 ETH. This is the initial deposit with which the protocol will activate the validator. After activation, CMv2 may allocate additional stake to your validators, up to 2,048 ETH each.
:::

---

## Key addresses

To run your validators in the Curated Module, you will need to set the correct [Withdrawal Address](/contracts/withdrawal-vault) at key generation, and run your clients with the [Lido Execution Layer Rewards Vault](/contracts/lido-execution-layer-rewards-vault) as the Fee Recipient.

| Network | Withdrawal Address (Withdrawal Vault) | Fee Recipient (Execution Layer Rewards Vault) |
| --- | --- | --- |
| **Hoodi** | [`0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2`](https://hoodi.etherscan.io/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2) | [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258) |
| **Mainnet** | [`0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f`](https://etherscan.io/address/0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f) | [`0x388C818CA8B9251b393131C08a736A67ccB19297`](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297) |

You can verify these and other protocol contracts on the [Deployed Contracts](/deployed-contracts/) page.

Please note that the Withdrawal Address is set at generation. If you need to change it, you must re-generate the deposit data with the correct address before uploading. Once a validator is deposited its Withdrawal Address cannot be changed.

Similarly, blocks proposed with the incorrect Fee Recipient may result in a [**General Delayed Penalty**](/run-on-lido/cm-v2/penalties#general-delayed-penalty) being applied.

---

## Generating keys with EthStaker Deposit CLI

:::warning
- Generate your keys on a secure, ideally air-gapped machine.
- Never share your keystores or mnemonic.
- Back up your mnemonic on paper or steel. It is the only way to recover your keystore or generate additional keys. If you lose your keystores, you can still exit validators via [Triggerable Withdrawals](/run-on-lido/cm-v2/bond-and-key-management#ejection-triggerable-withdrawals).
:::

The steps below will help you create `0x02` keys **for the Hoodi testnet**.

For a broader overview of the tool and its capabilities, see the [EthStaker Deposit CLI documentation](https://deposit-cli.ethstaker.cc/landing.html).

### 1. Download and verify

1. Go to the [releases page](https://github.com/ethstaker/ethstaker-deposit-cli/releases) and download the archive for your operating system.

2. Extract the archive:

   ```bash
   tar -xzf ethstaker_deposit-cli-*.tar.gz
   cd ethstaker_deposit-cli-*/
   ```

3. Verify the binary attestation using the [GitHub CLI](https://cli.github.com/) (`gh`). Replace the filename with the actual file you downloaded:

   ```bash
   gh attestation verify ethstaker_deposit-cli-*******-***.*** --repo ethstaker/ethstaker-deposit-cli
   ```

   You should see `✓ Verification succeeded!` in the output. **Do not continue if verification fails.** For offline verification, see [GitHub's instructions](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/verifying-attestations-offline).

### 2. Generate keys

The examples below generate `0x02` compounding keys for the **Hoodi** testnet. For Mainnet adjustments, see [Common flags](#common-flags).

#### 2.1. From a new mnemonic

Use `new-mnemonic` if this is your first time generating keys:

```bash
./deposit new-mnemonic \
  --chain hoodi \
  --compounding \
  --num_validators <NUMBER_OF_VALIDATORS> \
  --amount 32 \
  --withdrawal_address 0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
```

The CLI will prompt you to create a mnemonic. Write it down on paper and store it securely. It cannot be recovered if lost.

#### 2.2. From an existing mnemonic

Use `existing-mnemonic` if you already have a mnemonic and want to generate additional keys. You will need to provide the `--validator_start_index` to avoid regenerating keys you already have.

```bash
./deposit existing-mnemonic \
  --chain hoodi \
  --compounding \
  --num_validators <NUMBER_OF_VALIDATORS> \
  --amount 32 \
  --validator_start_index <START_INDEX> \
  --withdrawal_address 0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
```

For example, if you previously generated 4 keys (indices 0 to 3), set `--validator_start_index 4` to generate the next batch.

#### Common flags

For **Mainnet**, replace `--chain hoodi` with `--chain mainnet` and set `--withdrawal_address` to `0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f`.

- **`--compounding`**: generates keys with `0x02` withdrawal credentials, required for CMv2. These validators support a maximum effective balance of 2,048 ETH.
- **`--amount 32`**: sets the initial deposit amount to 32 ETH per validator. After activation, CMv2 may top up validators up to 2,048 ETH through its allocation algorithm.
- **`--withdrawal_address`**: must point to the Lido Withdrawal Vault for the corresponding network (see table above).

### 3. Output files

A successful run produces:

- **`keystore-*.json`** (one per validator): encrypted signing keystores, used by your validator client.
- **`deposit_data-*.json`** (one file): contains the deposit data for all generated validators. This is the file you upload to the CMv2 widget.

---

## Configuring the fee recipient

The fee recipient is configured in your validator client. Set it to the address for the corresponding network from the [key addresses table](#key-addresses) above.

How you set the fee recipient depends on your node management setup. The CSM guide on [Setting the Fee Recipient](/run-on-lido/csm/troubleshooting/setting-the-fee-recipient-for-csm-validators) covers configuration for Dappnode, Stereum, Eth Docker, Sedge, EthPillar, Systemd, and others. The same steps apply to CMv2 validators using the addresses from the table above.