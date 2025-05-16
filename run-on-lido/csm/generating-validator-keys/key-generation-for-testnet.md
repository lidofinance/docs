---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧪 Key Generation for Testnet

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

</TabItem>

<TabItem value="eth-docker" label="Eth Docker">

### Eth Docker

#### Method 1

You will be prompted to generate validator keys during initial setup. Select **Yes** and follow the terminal UI.

#### Method 2

If you selected **No**, run:

```bash
cd ~/eth-docker
./ethd cmd run --rm deposit-cli-new --execution_address YOURHARDWAREWALLETADDRESS --uid $(id -u)
```

Keystores will be in `~/eth-docker/.eth/validator_keys`.

</TabItem>

<TabItem value="all" label="All Others">

### All Others

Use the [Wagyu Keygen](https://github.com/stake-house/wagyu-key-gen) GUI:

1. Go to [https://wagyu.gg/](https://wagyu.gg/) and install the tool.
2. Generate a secret recovery phrase and select the network.
3. Write down the phrase and confirm it.
4. Choose number of validator keys.
5. Encrypt keystores with a strong password.
6. **IMPORTANT:** Set withdrawal address to the Lido Withdrawal Vault:

   * **Hoodi:** `0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2`
7. Confirm password.
8. Select output folder for keystores and deposit data.

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

Run `ethpillar`, select **Validator Client → Generate / Import Validator Keys → Import validator keys from offline ...**, paste path.

</TabItem>

<TabItem value="stereum" label="Stereum">

### Stereum

Go to **Staking** tab, drag & drop keystores:

1. Select CSM validator client.
2. Enter password and click ✓.

</TabItem>

<TabItem value="sedge" label="Sedge">

### Sedge

WIP

</TabItem>

<TabItem value="eth-docker-import" label="Eth Docker">

### Eth Docker

Import keys:

```bash
ethd keys import
```

</TabItem>

<TabItem value="systemd" label="Systemd">

### Systemd

Refer to **Advanced → Systemd → Method 2**:

[Method 2 Systemd Guide](/csm/node-setup/advanced/systemd/method-2-configure-csm-fee-recipient-on-separate-validator-client)

</TabItem>
</Tabs>