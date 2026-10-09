---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧪 Key Generation for Testnet

:::info Choose the right credential type
Hoodi accepts both **0x01** and **0x02** validator keys, with deposit data set to 32 ETH either way. Generate the credential type that matches the module you are joining, and check the notes in each tab below for tool-specific support.
:::

## Generating Keys

<Tabs>
<TabItem value="ethpillar" label="EthPillar">

### EthPillar

#### Method 1

You will be prompted to generate validator keys during the initial setup process. Select **Yes** and follow the terminal UI to generate your validator keys.

#### Method 2

If you selected **No** during the initial setup, run:

```bash
ethpillar
```

Then select **Validator Client → Generate / Import Validator Keys → Generate new validator keys** and follow the prompts.

:::warning 0x02 not yet supported for CSM
EthPillar's Lido CSM key-generation flow currently always generates 0x01 (regular-withdrawal) keys, regardless of the compounding option shown in its menu. Use Eth Docker or Wagyu Keygen (see other tabs) to generate 0x02 CSM keys for now.
:::

</TabItem>

<TabItem value="eth-docker" label="Eth Docker">

### Eth Docker

#### Method 1

You will be prompted to generate validator keys during initial setup. Select **Yes** and follow the terminal UI.

#### Method 2

If you selected **No**, run:

```bash
cd ~/eth-docker
./ethd cmd run --rm deposit-cli-new --execution_address 0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2 --uid $(id -u)
```

Keystores will be in `~/eth-docker/.eth/validator_keys`.

:::info Choose your credential type
Both methods prompt you to choose between a **distributing** validator (Type 1, 0x01) and an **accumulating** validator (Type 2, 0x02). Choose accumulating for 0x02 CSM, or distributing for 0x01 CSM.
:::

</TabItem>

<TabItem value="sedge" label="Sedge">

### Sedge

In the prompts when setting up your node with the interactive mode, choose to generate keystore source, mnemonic source (backup your seed), and passphrase. Specify the number of keys and initial index.

:::warning 0x02 not yet supported
Sedge does not currently support generating 0x02 (compounding) validator keys. Use Eth Docker or Wagyu Keygen (see other tabs) to generate 0x02 CSM keys for now.
:::

</TabItem>

<TabItem value="all" label="All Others">

### All Others

Use the [Wagyu Keygen](https://github.com/stake-house/wagyu-key-gen) GUI:

1. Go to [https://wagyu.gg/](https://wagyu.gg/) and install the tool.
2. Generate a secret recovery phrase and select the network.
3. Write down the phrase and confirm it.
4. Choose number of validator keys.
5. Choose the withdrawal credential type: **regular (0x01)** for 0x01 CSM, or **compounding (0x02)** for 0x02 CSM.
6. Encrypt keystores with a strong password.
7. **IMPORTANT:** Set withdrawal address to the Lido Withdrawal Vault:
   * **Hoodi:** `0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2`
8. Confirm password.
9. Select output folder for keystores and deposit data.

You will receive:

* `keystore-m_<timestamp>.json`: signing keystore
* `deposit_data-<timestamp>.json`: deposit data

</TabItem>
</Tabs>

## Importing Keys

<Tabs>
<TabItem value="dappnode" label="Dappnode">

### Dappnode

Go to UI → **Stakers → Hoodi** → click **Upload Keystores**. After install (\~5 min), refresh.

1. Click **Import Keystores**.
2. Browse keystores and enter password.
3. Tag them “Lido”; fee recipient is `0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`.

</TabItem>

<TabItem value="ethpillar-import" label="EthPillar">

### EthPillar

#### Method 1

If keys generated during setup, select **yes** on import prompt.

#### Method 2

For offline keys:

```bash
cat $(find /var/lib -name "keystore*.json" 2>/dev/null)
```

Run `ethpillar`, select **Validator Client → Generate / Import Validator Keys → Import validator keys from offline key generation or backup**, then paste the path.

</TabItem>

<TabItem value="stereum" label="Stereum">

### Stereum

Go to **Staking** tab, drag & drop keystores:

1. Select CSM validator client.
2. Enter password and click ✓.

</TabItem>

<TabItem value="sedge" label="Sedge">

### Sedge

To import keys in sedge, you just have to run:

```bash
sedge import-key --from `path-to-keys` -n `network` --start-validator `name-of-validator-client`
```
This will copy the keys from the specified path, ensure are set to the correct network, and help Sedge know how to import them based on the used client.

</TabItem>

<TabItem value="eth-docker-import" label="Eth Docker">

### Eth Docker

Move the keystores into `~/eth-docker/.eth/validator_keys`, adjust permissions, then import:

```bash
ethd keys import
```

</TabItem>

<TabItem value="systemd" label="Systemd">

### Systemd

Refer to **Advanced → Systemd → Method 2**:

[Method 2 Systemd Guide](/run-on-lido/csm/node-setup/advanced/systemd/method-2-configure-csm-fee-recipient-on-separate-validator-client)

</TabItem>
</Tabs>
