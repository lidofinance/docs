import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Method 1: Configure CSM Fee Recipient on validator keys

**Note:** You will have to import your CSM validator keystores into your validator client first. Refer to the key import steps in Method 2 if you are unsure about how to proceed.

## Validator Clients

<Tabs>
  <TabItem value="teku" label="Teku">

Assuming your Teku validator client is already set up, stop it:

```bash
sudo systemctl stop tekuvalidator.service
```

Find your non‑CSM validator keystore pubkeys:

```bash
sudo find /var/lib -name "keystore*.json"
```

Extract each pubkey:

```bash
grep -oP '"pubkey": *"\K[^"]+' RESULTING_FILEPATH
```

Create a proposer configuration file:

```bash
sudo nano /var/lib/teku_validator/validator/proposer_configuration.json
```

Paste:

```json
{
  "proposer_config": {
    "YOUR_PUBKEY_01": {"fee_recipient":"YOUR_WALLET_ADDRESS","builder":{"enabled":true}},
    "YOUR_PUBKEY_02": {"fee_recipient":"YOUR_WALLET_ADDRESS","builder":{"enabled":true}},
    "YOUR_PUBKEY_03": {"fee_recipient":"YOUR_WALLET_ADDRESS","builder":{"enabled":true}}
  },
  "default_config": {"fee_recipient":"LIDO_EXECUTION_LAYER_REWARDS_VAULT","builder":{"enabled":true}}
}
```

Replace `YOUR_PUBKEY_*`, `YOUR_WALLET_ADDRESS`, and `LIDO_EXECUTION_LAYER_REWARDS_VAULT` (e.g. `0x388C818CA8B9251b393131C08a736A67ccB19297` for Mainnet).

Save (Ctrl+O, Enter) and exit (Ctrl+X).

Set permissions:

```bash
sudo chown -R teku_validator:teku_validator /var/lib/teku_validator/validator
```

Edit the systemd service:

```bash
sudo nano /etc/systemd/system/tekuvalidator.service
```

Add the `--validators-proposer-config` flag and remove the default fee-recipient flag. For example:

```ini
[Service]
ExecStart=/usr/local/bin/teku/bin/teku vc \
  --network=hoodi \
  --data-path=/var/lib/teku_validator \
  --validators-proposer-config=/var/lib/teku_validator/validator/proposer_configuration.json \
  --validators-builder-registration-default-enabled=true \
  --validators-graffiti="your_graffiti" \
  --metrics-enabled=true
```

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl start tekuvalidator.service
sudo systemctl status tekuvalidator.service
```

Monitor logs:

```bash
sudo journalctl -fu tekuvalidator -o cat
```

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">

Only **Method 2** is available for Nimbus.

  </TabItem>
  <TabItem value="lodestar" label="Lodestar">

Create proposer settings:

```bash
sudo nano /var/lib/lodestar_validator/proposer_settings.yml
```

Paste:

```yaml
proposer_config:
  'YOUR_PUBKEY_01':
    fee_recipient: 'YOUR_WALLET_ADDRESS'
    builder:
      enabled: true
      gas_limit: '30000000'
default_config:
  fee_recipient: 'LIDO_EXECUTION_LAYER_REWARDS_VAULT'
  builder:
    enabled: true
    gas_limit: '30000000'
```

Replace placeholders, save, and exit.

Set permissions:

```bash
sudo chown -R lodestar_validator:lodestar_validator /var/lib/lodestar_validator
```

Edit docker-compose:

```bash
cd ~/lodestar_validator
sudo nano docker-compose.yml
```

Add:

```yaml
      - --proposerSettingsFile
      - /var/lib/lodestar_validator/proposer_settings.yml
```

Remove `--suggestedFeeRecipient` flags, then reload:

```bash
docker compose down
docker compose up -d
```

Monitor:

```bash
docker logs lodestar_validator -f
```

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">

Stop Lighthouse:

```bash
sudo systemctl stop lighthousevalidator.service
```

Edit definitions:

```bash
sudo nano /var/lib/lighthouse_validator/validators/validator_definitions.yml
```

For each pubkey, add:

```yaml
  suggested_fee_recipient: "LIDO_EXECUTION_LAYER_REWARDS_VAULT"
```

Restart and monitor:

```bash
sudo systemctl start lighthousevalidator.service
sudo journalctl -fu lighthousevalidator -o cat
```

  </TabItem>
  <TabItem value="prysm" label="Prysm">

Stop Prysm:

```bash
sudo systemctl stop prysmvalidator.service
```

Repeat similar steps as Teku, editing `proposer_configuration.json` under `/var/lib/prysm_validator/validator/` and updating service flags in `/etc/systemd/system/prysmvalidator.service` with `--proposer-settings-file`.

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl start prysmvalidator.service
sudo journalctl -fu prysmvalidator -o cat
```

  </TabItem>
</Tabs>

## Automation Tools

<Tabs>
  <TabItem value="eth-docker" label="ETH Docker">
With ETH Docker (`ethd up`), list keys and set recipient:

```bash
./ethd keys list
./ethd keys set-recipient <pubkey> <address>
```

  </TabItem>
  <TabItem value="ethpillar" label="ETH Pillar">
Not straightforward—run a separate validator client to customize `fee_recipient`.
  </TabItem>
</Tabs>
