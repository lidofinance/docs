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

Use the staking-deposit-cli to generate keys, then transfer them via USB:

```bash
lsblk
sudo mount /dev/sda1 /media # Replace sda1 with the actual name of your USB drive.
cd /media/staking-deposit-cli # Go into your USB drive
sudo cp -r validator_keys ~ # Copy your validator signing keystore into the HOME directory of your node.
```

Then unmount and eject your USB drive:

```bash
cd
sudo umount /media
```


Create the password file:

```bash
cd ~/validator_keys
ls
sudo nano <validator_signing_keystore_file_name>.txt
```

Type in the password you used when generating your validator keys in the earlier step. Then save and exit the file with `CTRL + O, enter, CTRL + X`.

---

### Import Validator Keys

> Detailed instructions vary by client; refer to each client's section for exact commands and file layout. Permissions should be:

```bash
sudo chown -R csm_<client>_validator:csm_<client>_validator /var/lib/csm_<client>_validator
sudo chmod 700 /var/lib/csm_<client>_validator
```

---

### Configure VC as a Service (systemd or Docker Compose)

Examples (Teku shown):

```bash
sudo nano /etc/systemd/system/csm_tekuvalidator.service
```

```ini
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
ExecStart=/usr/local/bin/teku/bin/teku vc \
  --network=mainnet \
  --data-path=/var/lib/csm_teku_validator \
  --validator-keys=/var/lib/csm_teku_validator/validator_keystores:/var/lib/csm_teku_validator/keystore_password \
  --beacon-node-api-endpoint=http://127.0.0.1:5051 \
  --validators-proposer-default-fee-recipient=0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f \
  --validators-builder-registration-default-enabled=true \
  --validators-graffiti="My Validator" \
  --metrics-enabled=true \
  --metrics-port=8108 \
  --doppelganger-detection-enabled=true

[Install]
WantedBy=multi-user.target
```

Reload systemd and enable:

```bash
sudo systemctl daemon-reload
sudo systemctl start csm_tekuvalidator.service
sudo systemctl enable csm_tekuvalidator.service
```

---

### Run Lodestar with Docker Compose

`docker-compose.yml` example:

```yaml
version: '3.7'
services:
  validator_client:
    image: chainsafe/lodestar:latest
    container_name: csm_lodestar_validator
    user: "1001:1001" # Replace with correct UID:GID
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
      - mainnet
      - --beaconNodes
      - http://127.0.0.1:5051
      - --builder
      - --builder.boostFactor
      - "100"
      - --suggestedFeeRecipient
      - "0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f"
      - --doppelgangerProtection
      - --metrics
      - --metrics.port
      - "5064"
      - --graffiti
      - "My Validator"
```

Run:

```bash
cd ~/csm_lodestar_validator
docker compose up -d
docker logs csm_lodestar_validator -f
```

---

### Clean Up Duplicate Keystores

```bash
sudo rm -r ~/staking_deposit-cli*/validator_keys
```

---

### Resources

* Teku: [https://github.com/Consensys/teku/releases](https://github.com/Consensys/teku/releases)
* Nimbus: [https://github.com/status-im/nimbus-eth2/releases](https://github.com/status-im/nimbus-eth2/releases)
* Lodestar: [https://github.com/ChainSafe/lodestar](https://github.com/ChainSafe/lodestar)
* Lighthouse: [https://github.com/sigp/lighthouse/releases](https://github.com/sigp/lighthouse/releases)
* Prysm: [https://github.com/prysmaticlabs/prysm/releases](https://github.com/prysmaticlabs/prysm/releases)