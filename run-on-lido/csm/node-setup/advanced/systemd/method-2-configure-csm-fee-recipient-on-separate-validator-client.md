import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Method 2: Configure CSM Fee Recipient on Separate Validator Client

This guide covers how to configure a Community Staking Module (CSM) fee recipient using a separate validator client setup for various Ethereum clients (Teku, Nimbus, Lodestar, Lighthouse, Prysm).

---

## Set up a Separate CSM Validator Client Only

### Download Validator Client

<Tabs>
  <TabItem value="teku" label="Teku">
Install Java dependencies:

```bash
sudo apt-get update
sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get -y install openjdk-21-jre libjemalloc-dev
```

Download and verify Teku:

```bash
cd
curl -LO https://artifacts.consensys.net/public/teku/raw/names/teku.tar.gz/versions/24.10.2/teku-24.10.2.tar.gz
echo "1cc76913f3b85987e2a60c9b94c6918d31773ebd3237c5fdf33de366fa259202 teku-24.10.2.tar.gz" | sha256sum --check
```

If verified:

```bash
tar xvf teku-24.10.2.tar.gz
sudo cp -a teku-24.10.2 /usr/local/bin/teku
rm -r teku*
```
  </TabItem>
  <TabItem value="nimbus" label="Nimbus">
Download and verify Nimbus:

```bash
cd
curl -LO https://github.com/status-im/nimbus-eth2/releases/download/v24.9.0/nimbus-eth2_Linux_amd64_24.9.0_f54a0366.tar.gz
tar xvf nimbus-eth2_Linux_amd64_24.9.0_f54a0366.tar.gz
cd nimbus-eth2_Linux_amd64_24.9.0_f54a0366/build
echo "<checksum>  nimbus_beacon_node" | sha512sum --check
echo "<checksum>  nimbus_validator_client" | sha512sum --check
```

If verified:

```bash
cd ~/nimbus-eth2_Linux_amd64_24.9.0_f54a0366/build
sudo cp nimbus_beacon_node nimbus_validator_client /usr/local/bin
cd
rm -r nimbus*
```
  </TabItem>
  <TabItem value="lodestar" label="Lodestar">
No download needed here as Lodestar will be run via Docker.

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">
Download and verify Lighthouse:

```bash
cd
curl -LO https://github.com/sigp/lighthouse/releases/download/v5.3.0/lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz
curl -LO https://github.com/sigp/lighthouse/releases/download/v5.3.0/lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz.asc
gpg --keyserver keyserver.ubuntu.com --recv-keys 15E66D941F697E28F49381F426416DC3F30674B0
gpg --verify lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz.asc lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz
```

If verified:

```bash
tar xvf lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz
sudo cp lighthouse /usr/local/bin
rm -r lighthouse*
```

  </TabItem>
  <TabItem value="prysm" label="Prysm">
Download and verify Prysm:

```bash
cd
curl -LO https://github.com/prysmaticlabs/prysm/releases/download/v5.1.2/beacon-chain-v5.1.2-linux-amd64
curl -LO https://github.com/prysmaticlabs/prysm/releases/download/v5.1.2/beacon-chain-v5.1.2-linux-amd64.sha256
sha256sum --check beacon-chain-v5.1.2-linux-amd64.sha256
```

If verified:

```bash
mv beacon-chain-v5.1.2-linux-amd64 prysmbeacon
chmod +x prysmbeacon
sudo cp prysmbeacon /usr/local/bin
rm -r prysmbeacon beacon-chain-v5.1.2-linux-amd64.sha256
```
  </TabItem>
</Tabs>
---

### Create CSM User

```bash
# Replace <client> with teku/nimbus/lodestar/lighthouse/prysm
sudo useradd --no-create-home --shell /bin/false csm_<client>_validator
```

---

### Generate and Transfer Validator Keys

Generate your validator keys. Check the [Generating Validator Keys](/run-on-lido/csm/generating-validator-keys/) section of the guide to learn how.

Now that we have our validator signing keystore, we will need to place it in our validator node itself so that the node can sign attestations and propose blocks.

Plug in the USB drive with your validator signing keystores into your node device. Once the USB drive is plugged in, we will need to identify it. On the terminal of your node, run:

```bash
lsblk
```
The command above will show a list of devices. Look for your USB drive in the output list.

After you got the name, proceed to mount the USB into the `/media` folder, access your USB and copy the keystores into the HOME directory of your node:

```bash
sudo mount /dev/sda1 /media # Replace sda1 with the actual name of your USB drive.
cd /media/ # Go into your USB drive
ls # find the actual file name of your validator keystore
```
Copy your validator keystore into the HOME directory of your node

```bash
sudo cp keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```

Then unmount and eject your USB drive:

```bash
cd
sudo umount /media
```

Now you need to create a **plain text password file** for your validator node to decrypt your validator signing keystores.

Use the following command to move to the keys folder, and get the `validator_signing_keystore_file_name`:

```bash
cd ~/validator_keys
ls
```

With the name of the keystore filename copied, create the password file:

```bash
sudo nano <validator_signing_keystore_file_name>.txt
```

Type in the password you used when generating your validator keys in the earlier step. Then save and exit the file with `CTRL + O, enter, CTRL + X`.

---

### Import Validator Keys

<Tabs>
  <TabItem value="teku" label="Teku">
#### Prepare the CSM validator keystores

1. Create 3 new folders to store the validator client data, validator keystore, and the validator keystore password
2. Copy the validator keystores and it's password file into their respective folders
3. Change the owner of this folder to the teku user
4. Restrict permissions on this new folder such that only the owner is able to read, write, and execute files in this folder

```bash
sudo mkdir -p /var/lib/csm_teku_validator/validator_keystores /var/lib/csm_teku_validator/keystore_password
sudo cp ~/keystore-m_<timestamp>.json /var/lib/csm_teku_validator/validator_keystores # replace <timestamp> with actual file name
sudo cp ~/keystore-m_<timestamp>.txt /var/lib/csm_teku_validator/keystore_password # replace <timestamp> with actual file name
sudo chown -R csm_teku_validator:csm_teku_validator /var/lib/csm_teku_validator
sudo chmod 700 /var/lib/csm_teku_validator
```

:::info
Aside from the file extension, the validator_keystore_password file will need to be named identically as the validator signing keystore file (e.g. keystore-m-123.json, keystore-m-123.txt)
:::

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">
#### Prepare the CSM validator keystores

1. Create a new folder to store the validator client data, validator keystore, and the validator keystore password
```bash
sudo mkdir -p /var/lib/csm_nimbus_validator
```
2. Run the validator key import process.
```bash
sudo /usr/local/bin/nimbus_beacon_node deposits import --data-dir:/var/lib/csm_nimbus_validator/ ~/validator_keys
```
3. Change the owner of this new folder to the `csm_nimbus_validator` user
4. Restrict permissions on this new folder such that only the owner is able to read, write, and execute files in this folder
```bash
sudo chown -R csm_nimbus_validator:csm_nimbus_validator /var/lib/csm_nimbus_validator
sudo chmod 700 /var/lib/csm_nimbus_validator
```

  </TabItem>
  <TabItem value="lodestar" label="Lodestar">
#### Prepare the validator data directory

1. Create 3 new folders to store the validator client data, validator keystore, and the validator keystore password
2. Copy the validator keystores and it's password file into their respective folders
3. Change the owner of these new folders to the `csm_lodestar_validator` user
4. Restrict permissions on this new folder such that only the owner is able to read, write, and execute files in this folder
5. Retrieve the UID and GID of the `csm_lodestar_validator` user account to be used in your `docker-compose.yml` file in the next step

```bash
sudo mkdir -p /var/lib/csm_lodestar_validator/validator_keystores /var/lib/csm_lodestar_validator/keystore_password
sudo cp ~/keystore-m_<timestamp>.json /var/lib/csm_lodestar_validator/validator_keystores # replace <timestamp> with actual file name
sudo cp ~/<keystore-m_<timestamp>.txt /var/lib/csm_lodestar_validator/keystore_password # replace <timestamp> with actual file name
sudo chown -R csm_lodestar_validator:csm_lodestar_validator /var/lib/csm_lodestar_validator
sudo chmod 700 /var/lib/csm_lodestar_validator
id csm_lodestar_validator
```

:::info
Aside from the file extension, the validator_keystore_password file will need to be named identically as the validator signing keystore file (e.g. keystore-m-123.json, keystore-m-123.txt)
:::

**Expected output:**
```bash
uid=1004(csm_lodestar_validator) gid=1005(csm_lodestar_validator) groups=1005(csm_lodestar_validator)
```

**New folders created:**
```bash
/var/lib/csm_lodestar_validator/
/var/lib/csm_lodestar_validator/validator_keystores
/var/lib/csm_lodestar_validator/keystore_password
```

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">
#### Prepare the validator data directory

1. Create a new folders to store the validator client data, validator keystore, and the validator keystore password
```bash
sudo mkdir -p /var/lib/csm_lighthouse_validator
```
2. Run the validator key import process.
```bash
sudo lighthouse account validator import --network mainnet --datadir /var/lib/csm_lighthouse_validator --directory=$HOME/staking_deposit-cli*/validator_keys
```
:::important
set to --network hoodi if running on Testnet.
:::

3. Change the owner of this new folder to the `csm_lighthouse_validator` user
4. Restrict permissions on this new folder such that only the owner is able to read, write, and execute files in this folder
```bash
sudo chown -R csm_lighthouse_validator:csm_lighthouse_validator /var/lib/csm_lighthouse_validator
sudo chmod 700 /var/lib/csm_lighthouse_validator
```
  
  </TabItem>
  <TabItem value="prysm" label="Prysm">
#### Prepare the validator data directory

1. Create a new folders to store the validator client data, validator keystore, and the validator keystore password
```bash
sudo mkdir -p /var/lib/csm_prysm_validator
```
2. Run the validator key import process.
```bash
sudo /usr/local/bin/prysmvalidator accounts import --keys-dir=$HOME/validator_keys --wallet-dir=/var/lib/csm_prysm_validator --mainnet
```
:::important
set to --network hoodi if running on Testnet.
:::

**Note**: You will be prompted to accept the terms of use, create a new password for the Prysm wallet, and enter the password of your validator keystore.

3. Create a plain text password file for the Prysm wallet
```bash
sudo nano /var/lib/csm_prysm_validator/password.txt
```
Enter the password you set during the validator keystore import process. Then, save + exit with `CTRL+O`,`ENTER`, `CTRL+C`.
4) Change the owner of this new folder to the `csm_prysm_validator` user
5) Restrict permissions on this new folder such that only the owner is able to read, write, and execute files in this folder
```bash
sudo chown -R csm_prysmvalidator:csm_prysmvalidator /var/lib/csm_prysm_validator
sudo chmod 700 /var/lib/csm_prysm_validator
```
  </TabItem>
</Tabs>

---

### Configure the separate Validator Client
Create a new configuration file for your separate validator client.

<Tabs>
  <TabItem value="teku" label="Teku">
Create a systemd configuration file for the Teku Validator Client service to run in the background.

```bash
sudo nano /etc/systemd/system/csm_tekuvalidator.service
```

Paste the configuration parameters below into the file:

```bash
[Unit]
Description=CSM Teku Validator Client
Wants=network-online.target
After=network-online.target
[Service]
User=csm_teku_validator
Group=csm_teku_validator
Type=simple
Restart=always
RestartSec=5
Environment="JAVA_OPTS=-Xmx8g"
Environment="TEKU_OPTS=-XX:-HeapDumpOnOutOfMemoryError"
ExecStart=/usr/local/bin/teku/bin/teku vc \
  --network=<hoodi_or_mainnet> \
  --data-path=/var/lib/csm_teku_validator \
  --validator-keys=/var/lib/csm_teku_validator/validator_keystores:/var/lib/csm_teku_validator/keystore_password \
  --beacon-node-api-endpoint=http://<Internal_IP_address>:5051 \
  --validators-proposer-default-fee-recipient=<hoodi_or_mainnet_fee_recipient_address> \
  --validators-builder-registration-default-enabled=true \
  --validators-graffiti="<your_graffiti>" \
  --metrics-enabled=true \
  --metrics-port=8108 \
  --doppelganger-detection-enabled=true 

[Install]
WantedBy=multi-user.target
```

Once you're done, save with Ctrl+O and Enter, then exit with Ctrl+X. Understand and review your configuration summary below, and amend if needed.

:::important
Recall that you will have to use designated fee recipient addresses as a CSM operator.
Mainnet: 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f 
Hoodi:  0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
:::

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">
Create a systemd configuration file for the Nimbus Validator Client service to run in the background.

```bash
sudo nano /etc/systemd/system/csm_nimbusvalidator.service
```

Paste the configuration parameters below into the file:

```bash
[Unit]
Description=CSM Nimbus Validator Client
Wants=network-online.target
After=network-online.target

[Service]
User=csm_nimbus_validator
Group=csm_nimbus_validator
Type=simple
Restart=always
RestartSec=5
ExecStart=/usr/local/bin/nimbus_validator_client \
  --data-dir=/var/lib/csm_nimbus_validator \
  --payload-builder=true \
  --beacon-node=http://<Internal_IP_address>:5051 \
  --metrics \
  --metrics-port=8108 \
  --suggested-fee-recipient=<hoodi_or_mainnet_fee_recipient_address> \
  --graffiti="<your_graffiti>" \
  --doppelganger-detection

[Install]
WantedBy=multi-user.target
```

Once you're done, save with Ctrl+O and Enter, then exit with Ctrl+X. Understand and review your configuration summary below, and amend if needed.

:::important
Recall that you will have to use designated fee recipient addresses as a CSM operator.
Mainnet: 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f 
Hoodi:  0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
:::
  
  </TabItem>
    <TabItem value="lodestar" label="Lodestar">
Create a new folder for the CSM Lodestar validator client. 

```bash
cd
sudo mkdir csm_lodestar_validator
```

Create a `docker-compose.yml` file in the Lodestar folder.

```
cd ~/csm_lodestar_validator
sudo nano docker-compose.yml
```

Paste the following configuration into the `docker-compose.yml` file. Note: This is similar to the `systemd` configuration file used in the setup of other clients in this curriculum.

```bash
services:
  validator_client:
    image: chainsafe/lodestar:latest
    container_name: csm_lodestar_validator
    user: <UID>:<GID> #replace with the actual UID and GID of the csm_lodestar_validator user
    restart: unless-stopped
    volumes:
      - /var/lib/csm_lodestar_validator:/var/lib/csm_lodestar_validator
    command:
      - validator
      - --dataDir
      - /var/lib/csm_lodestar_validator
      - --importKeystores
      - /var/lib/csm_lodestar_validator/validator_keystores
      - --importKeystoresPassword
      - /var/lib/csm_lodestar_validator/keystore_password/<validator_signing_keystore_password_file_name>.txt
      - --network
      - <hoodi_or_mainnet>
      - --beaconNodes
      - http://<Internal_IP_address>:5051
      - --builder
      - --builder.boostFactor
      - 100
      - --suggestedFeeRecipient
      - "<hoodi_or_mainnet_fee_recipient_address>"
      - --doppelgangerProtection
      - --metrics
      - --metrics.port
      - "5064"
      - --graffiti
      - "your_graffiti"
    environment:
      NODE_OPTIONS: --max-old-space-size=2048
    ports:
      - "5064:5064"
```

Once you're done, save with Ctrl+O and Enter, then exit with Ctrl+X. Understand and review your configuration summary below, and amend if needed.

:::important
Recall that you will have to use designated fee recipient addresses as a CSM operator.
Mainnet: 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f 
Hoodi:  0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
:::
  
  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">
Create a systemd configuration file for the Lighthouse Validator Client service to run in the background.

```bash
sudo nano /etc/systemd/system/csm_lighthousevalidator.service
```

Paste the configuration parameters below into the file:

```bash
[Unit]
Description=CSM Lighthouse Validator Client (Hoodi)
Wants=network-online.target
After=network-online.target

[Service]
User=csm_lighthouse_validator
Group=csm_lighthouse_validator
Type=simple
Restart=always
RestartSec=5
ExecStart=/usr/local/bin/lighthouse vc \
  --network <hoodi_or_mainnet> \
  --datadir /var/lib/csm_lighthouse_validator \
  --builder-proposals \
  --builder-boost-factor 100 \
  --beacon-nodes http://<Internal_IP_address>:5051 \
  --metrics \
  --metrics-port 8108 \
  --suggested-fee-recipient <hoodi_or_mainnet_fee_recipient_address> \
  --graffiti="<your_graffiti>" \
  --enable-doppelganger-protection

[Install]
WantedBy=multi-user.target
```

Once you're done, save with Ctrl+O and Enter, then exit with Ctrl+X. Understand and review your configuration summary below, and amend if needed.

:::important
Recall that you will have to use designated fee recipient addresses as a CSM operator.
Mainnet: 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f 
Hoodi:  0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
:::

  </TabItem>
    <TabItem value="prysm" label="Prysm">
Create a systemd configuration file for the Prysm Validator Client service to run in the background.

```bash
sudo nano /etc/systemd/system/csm_prysmvalidator.service
```

Paste the configuration parameters below into the file:

```bash
[Unit]
Description=CSM Prysm Validator Client (Hoodi)
Wants=network-online.target
After=network-online.target

[Service]
User=csm_prysm_validator
Group=csm_prysm_validator
Type=simple
Restart=always
RestartSec=5
ExecStart=/usr/local/bin/prysmvalidator \
  --accept-terms-of-use \
  --<hoodi_or_mainnet> \
  --datadir=/var/lib/csm_prysm_validator \
  --enable-builder \
  --beacon-rpc-provider=<Internal_IP_address>:4000 \
  --beacon-rpc-gateway-provider=<Internal_IP_address>:5051 \
  --wallet-dir=/var/lib/csm_prysm_validator \
  --wallet-password-file=/var/lib/csm_prysm_validator/password.txt \
  --monitoring-port=8108 \
  --suggested-fee-recipient=<hoodi_or_mainnet_fee_recipient_address> \
  --graffiti="<your_graffiti>" \
  --enable-doppelganger

[Install]
WantedBy=multi-user.target
```

Once you're done, save with Ctrl+O and Enter, then exit with Ctrl+X. Understand and review your configuration summary below, and amend if needed.

:::important
Recall that you will have to use designated fee recipient addresses as a CSM operator.
Mainnet: 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f 
Hoodi:  0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2
:::

  </TabItem>
</Tabs>

---
### Start the CSM Validator Client

<Tabs>
  <TabItem value="teku" label="Teku">
Reload the systemd daemon to register the changes made, start the Teku Validator Client, and check its status to make sure its running.

```bash
sudo systemctl daemon-reload
sudo systemctl start csm_tekuvalidator.service
sudo systemctl status csm_tekuvalidator.service
```

The output should say the Teku Validator Client is “active (running)”. Press CTRL-C to exit and the Teku Validator Client will continue to run.

Use the following command to check the logs for any warnings or errors:

```bash
sudo journalctl -fu csm_tekuvalidator -o cat | ccze -A
```

Press CTRL-C to exit.

If the Teku Validator Client service is running smoothly, we can now enable it to fire up automatically when rebooting the system.

```bash
sudo systemctl enable csm_tekuvalidator
```

**Expected output:**
```bash
Created symlink /etc/systemd/system/multi-user.target.wants/csm_tekuvalidator.service → /etc/s
```

**Remove duplicates of validator keystores**
To prevent configuration mistakes leading to double signing in the future, remove duplicate copies of the validator signing keystores once everything is running smoothly.

```bash
sudo rm -r ~/keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">
Reload the systemd daemon to register the changes made, start the Nimbus Validator Client, and check its status to make sure its running.

```bash
sudo systemctl daemon-reload
sudo systemctl start csm_nimbusvalidator.service
sudo systemctl status csm_nimbusvalidator.service
```

The output should say the Nimbus Validator Client is “active (running)”. Press CTRL-C to exit and the Nimbus Validator Client will continue to run.

Use the following command to check the logs for any warnings or errors:

```bash
sudo journalctl -fu csm_nimbusvalidator -o cat | ccze -A
```

Press CTRL-C to exit.

If the Nimbus Validator Client service is running smoothly, we can now enable it to fire up automatically when rebooting the system.

```bash
sudo systemctl enable csm_nimbusvalidator
```

**Expected output:**
```bash
Created symlink /etc/systemd/system/multi-user.target.wants/csm_nimbusvalidator.service → /etc/systemd/system/csm_nimbusvalidator.service.
```

**Remove duplicates of validator keystores**
To prevent configuration mistakes leading to double signing in the future, remove duplicate copies of the validator signing keystores once everything is running smoothly.

```bash
sudo rm -r ~/keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```
  
  </TabItem>
    <TabItem value="lodestar" label="Lodestar">
1. Make sure you are in the same folder as the docker-compose.yml file you created earlier.

```bash
cd ~/csm_lodestar_validator
```

2. Start the docker container

```bash
docker compose up -d
```

3. Make sure there are no error messages by monitoring the logs for a few minutes

```bash
docker logs csm_lodestar_validator -f
```

**Remove duplicates of validator keystores**

To prevent configuration mistakes leading to double signing in the future, remove duplicate copies of the validator signing keystores once everything is running smoothly.

```bash
sudo rm -r ~/keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">
Reload the systemd daemon to register the changes made, start the Lighthouse Validator Client, and check its status to make sure its running.

```bash
sudo systemctl daemon-reload
sudo systemctl start csm_lighthousevalidator.service
sudo systemctl status csm_lighthousevalidator.service
```

The output should say the Lighthouse Validator Client is “active (running)”. Press CTRL-C to exit and the Lighthouse Validator Client will continue to run.

Use the following command to check the logs for any warnings or errors:

```bash
sudo journalctl -fu csm_lighthousevalidator -o cat | ccze -A
```

Press CTRL-C to exit.

If the Lighthouse Validator Client service is running smoothly, we can now enable it to fire up automatically when rebooting the system.

```bash
sudo systemctl enable csm_lighthousevalidator
```

**Expected output:**
```bash
Created symlink /etc/systemd/system/multi-user.target.wants/csm_lighthousevalidator.service → /etc/systemd/system/csm_lighthousevalidator.service.
```

**Remove duplicates of validator keystores**
To prevent configuration mistakes leading to double signing in the future, remove duplicate copies of the validator signing keystores once everything is running smoothly.

```bash
sudo rm -r ~/keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```

  </TabItem>
    <TabItem value="prysm" label="Prysm">
Reload the systemd daemon to register the changes made, start the Prysm Validator Client, and check its status to make sure its running.

```bash
sudo systemctl daemon-reload
sudo systemctl start csm_prysmvalidator.service
sudo systemctl status csm_prysmvalidator.service
```

The output should say the Prysm Validator Client is “active (running)”. Press CTRL-C to exit and the Prysm Validator Client will continue to run.

Use the following command to check the logs for any warnings or errors:

```bash
sudo journalctl -fu csm_prysmvalidator -o cat | ccze -A
```

Press CTRL-C to exit.

If the Prysm Validator Client service is running smoothly, we can now enable it to fire up automatically when rebooting the system.

```bash
sudo systemctl enable csm_prysmvalidator
```

**Expected output:**
```bash
Created symlink /etc/systemd/system/multi-user.target.wants/csm_prysmvalidator.service → /etc/systemd/system/csm_prysmvalidator.service.
```

**Remove duplicates of validator keystores**
To prevent configuration mistakes leading to double signing in the future, remove duplicate copies of the validator signing keystores once everything is running smoothly.

```bash
sudo rm -r ~/keystore-m_<timestamp>.json ~ # replace <timestamp> with what's in your actual file name
```

  </TabItem>
</Tabs>

---

### Resources

* Teku: [Releases](https://github.com/Consensys/teku/releases), [Documentation](https://docs.teku.consensys.io/introduction) & [Discord](https://discord.gg/consensys) (Select the Teku channel)
* Nimbus: [Releases](https://github.com/status-im/nimbus-eth2/releases), [Documentation](https://nimbus.guide/install.html) & [Discord](https://discord.gg/BWKx5Xta)
* Lodestar: [Git Repository](https://github.com/ChainSafe/lodestar-quickstart.git), [Documentation](https://chainsafe.github.io/lodestar/) & [Discord](https://discord.gg/7Gdb4nFh)
* Lighthouse: [Releases](https://github.com/sigp/lighthouse/releases), [Documentation](https://lighthouse-book.sigmaprime.io/intro.html) & [Discord](https://discord.com/invite/TX7HKfgJN3)
* Prysm: [Releases](https://github.com/prysmaticlabs/prysm/releases), [Documentation](https://docs.prylabs.network/docs/getting-started) & [Discord](https://discord.gg/prysmaticlabs)
