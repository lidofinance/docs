import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🚀 Key Generation for Mainnet

## Important

* It is highly recommended that you perform this step using an air-gapped machine (a device that has never connected to the public internet).
* If this is not available, turn off all internet and wireless connections (Ethernet, WiFi, Bluetooth) before proceeding.
* In both cases, ensure you’re in a safe environment with a trusted network and physically block all camera devices.
* Generate the keys using **0x01 Withdrawal Credentials with deposit amount set to 32 ETH**.

## Creating an air-gapped machine

1. Buy a cheap single-board computer (e.g., Raspberry Pi).
2. **OS‑on‑a‑stick:** Flash a USB drive with TailsOS and run from USB—no files persist after removal.

## What you will need

1. Two new, empty USB drives
2. A paper notebook and pencil
3. ***100% FOCUS***

## Download the validator keystore generation file

<Tabs>
  <TabItem value="wagyu" label="Wagyu Keygen">

This GUI method generates keystores, deposit data, and mnemonic.

1. Download the Linux executable from [wagyu.gg](https://wagyu.gg/).
2. Copy it onto a new USB drive.

  </TabItem>
  <TabItem value="executable" label="Executable binaries">

### Downloading the executable binary file

On your working laptop, get the latest [release](https://github.com/ethstaker/ethstaker-deposit-cli/releases) of the EthStaker validator key generation tool and it's corresponding sha256 checksum.

```bash
cd ~
# change the URL to the actual URL (right-click & copy link URL)
curl -LO https://github.com/eth-educators/ethstaker-deposit-cli/releases/download/v1.2.2/ethstaker_deposit-cli-b13dcb9-linux-amd64.tar.gz
# change the sha256 checksum to the actual checksum
echo "04af3f4fd2fdccf4ae060abde47637622a31114d9f2e53e62722a694a4d5b206 ethstaker_deposit-cli-b13dcb9-linux-amd64.tar.gz" | sha256sum --check
```

**Expected output:**

```
ethstaker_deposit-cli-b13dcb9-linux-amd64.tar.gz: OK
```

After verification, move the `.tar.gz` file onto a new USB drive.

  </TabItem>
  <TabItem value="source" label="Build from source">

*No action needed at this step.*

  </TabItem>
</Tabs>

## Flash and install OS

1. Download latest TailsOS and verify checksums.
2. Flash a USB drive with your preferred OS using BalenaEtcher. [See TailsOS on USB guide →](./tailsos-on-usb-as-air-gapped-machine)

<details>
<summary>Boot menu keys for laptop models</summary>

* Non-Apple/Mac: consult \[techofide guide] for keys.
* Apple/Mac: consult \[Apple support].

</details>

3. Boot from the USB drive; you should see “Tails.”

![Boot menu screenshot](/img/csm-guide/mainnet-key-1.png)

4. Select **Try or Install Tails**
5. Click **+**, set an admin password, then **Start Tails**

![Add password screenshot](/img/csm-guide/mainnet-key-2.png)

## Generate your validator signing keys

<Tabs>
  <TabItem value="wagyu-run" label="Wagyu Keygen">

### Wagyu Keygen

#### Before proceeding

1. Turn off Ethernet, WiFi, Bluetooth.
2. Physically cover all camera devices.

Load the USB drive with `Wagyu Keygen` to the fresh OS.
Run the GUI and:

1. Create a secret recovery phrase.
2. Select network (Mainnet/Hoodi).
3. Write down and confirm the phrase.
4. Choose number of keys.
5. Encrypt keystores with a password.
6. **IMPORTANT:** Set withdrawal address to the Lido Withdrawal Vault in Ethereum Mainnet: `0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f`
7. Confirm password.
8. Save keystores & deposit data to a USB drive.

  </TabItem>
  <TabItem value="executable-run" label="Executable binaries">

### Executable binaries

Load the USB drive with the `.tar.gz` file to the fresh OS. Open terminal:

```bash
cd Desktop
tar xvf ethstaker_deposit-cli-b13dcb9-linux-amd64.tar.gz
cd ethstaker_deposit-cli-b13dcb9-linux-amd64
```

#### Before proceeding

1. Turn off Ethernet, WiFi, Bluetooth.
2. Cover camera devices.

Generate keys:

```bash
./deposit new-mnemonic --num_validators <number> --chain mainnet --eth1_withdrawal_address 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f
```

Expected output:

![CLI output](/img/csm-guide/mainnet-key-3.png)

Mnemonic generated—write it down on paper:

![Mnemonic screenshot](/img/csm-guide/mainnet-key-4.png)

Verify by retyping phrase; you’ll see a Rhino ASCII art:

![Rhino ASCII screenshot](/img/csm-guide/mainnet-key-5.png)

Store generated files on a new USB drive; remove OS-on-a-stick.

  </TabItem>
  <TabItem value="source-run" label="Build from source">

### Build from source

On the fresh OS, install dependencies:

```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt install python3-venv python3-pip python3-virtualenv git
```

Create venv & clone tool:

```bash
virtualenv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

![Build output screenshot](/img/csm-guide/mainnet-key-6.png)

#### Before proceeding

1. Turn off Ethernet, WiFi, Bluetooth.
2. Cover camera devices.

Generate keys:

```bash
python -m ethstaker_deposit new-mnemonic --num_validators <number> --chain mainnet --eth1_withdrawal_address 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f
```

  </TabItem>
</Tabs>

## Import Validator Key to your Node

<Tabs>
  <TabItem value="dappnode" label="Dappnode">

Go to **Stakers → Ethereum** in Dappnode UI, click **Upload Keystores**.
Import your keystores and enter passwords.
Tag them “Lido”; fee recipient set to `0x388C818CA8B9251b393131C08a736A67ccB19297`.

[Import guide →](/run-on-lido/csm/lido-csm-widget/upload-remove-view-validator-keys)

  </TabItem>
  <TabItem value="ethpillar" label="EthPillar">

Locate keystore path:

```bash
cat $(find /var/lib -name "keystore*.json" 2>/dev/null)
```

Run:

```bash
ethpillar
```

Select **Validator Client → Generate / Import Validator Keys → Import from backup** and paste path.

  </TabItem>
  <TabItem value="stereum" label="Stereum">

In Staking tab of Stereum Launcher, drag & drop keystores, enter password, click ✓.

  </TabItem>
  <TabItem value="sedge" label="Sedge">

To import keys in sedge, you just have to run:

```bash
sedge import-key --from `path-to-keys` -n `network` --start-validator `name-of-validator-client`
```
This will copy the keys from the specified path, ensure are set to the correct network, and help Sedge know how to import them based on the used client.

  </TabItem>
  <TabItem value="eth-docker" label="Eth Docker">

Move keystores into `~/eth-docker/.eth/validator_keys`, adjust permissions, then:

```bash
ethd keys import
```

  </TabItem>
  <TabItem value="systemd" label="Systemd">

Refer to **Advanced → Systemd → Method 2** for systemd instructions:

[Systemd Method 2 Guide](/run-on-lido/csm/node-setup/advanced/systemd/method-2-configure-csm-fee-recipient-on-separate-validator-client)

  </TabItem>
</Tabs>
