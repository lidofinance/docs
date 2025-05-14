import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Eth Docker

## Full Node Setup

### Video Guide
<iframe width="800" height="450" src="https://www.youtube.com/embed/PQ5qLfbBeTI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />


:::warning
For Testnet setups, replace all Holesky options with Hoodi.
:::

### Download & configure ETH Docker

```bash
cd ~ && git clone https://github.com/eth-educators/eth-docker.git && cd eth-docker
sudo usermod -aG sudo $USER
exit
cd eth-docker
./ethd install
source ~/.profile
````

You can now run `ethd` from anywhere. Configure the service:

```bash
ethd config
```

<details>
<summary>ETH Docker TUI Navigation</summary>

1. **Arrow** & **Tab**: cycle options
2. **Space bar**: select option
3. **Enter**: confirm option
4. **Ctrl+C**: exit view

</details>

**Follow the prompts to:**

1. Choose **Mainnet** or **Hoodi** → **Lido-compatible node (Community Staking / Simple DVT)** → **\[Community Staking] CSM node**
2. Select your consensus and execution clients
3. Use default **Checkpoint Sync URL**, **yes** for MEV Boost, **select all** relays, **yes** for Grafana dashboards, and set optional graffiti
4. **\[For Testnet only]** **yes** to generate validator keys: set quantity, password, save mnemonic, verify fee recipient on [CSM Operator Portal](https://operatorportal.lido.fi/modules/community-staking-module)
5. **\[For Mainnet]** **no** to generate keys here (use secure workflow in [Key Generation for Mainnet guide](../../generating-validator-keys/key-generation-for-mainnet/))

## Address Tabs

<Tabs>
  <TabItem value="withdrawal" label="Withdrawal Address">
    <ul>
      <li><strong>Mainnet:</strong> <a href="https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f">0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f</a></li>
      <li><strong>Hoodi:</strong> <a href="https://hoodi.etherscan.io/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2">0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2</a></li>
    </ul>
  </TabItem>
  <TabItem value="fee" label="Fee Recipient Address">
    <ul>
      <li><strong>Mainnet:</strong> <a href="https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297">0x388C818CA8B9251b393131C08a736A67ccB19297</a></li>
      <li><strong>Hoodi:</strong> <a href="https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258">0x9b108015fe433F173696Af3Aa0CF7CDb3E104258</a></li>
    </ul>
  </TabItem>
</Tabs>

### Start ETH Docker

```bash
ethd start
```

### Import validator keys

```bash
sudo cp <path-to-keystore> ~/eth-docker/.eth/validator_keys
sudo chown -R $USER:$USER ~/eth-docker/.eth/validator_keys
ethd keys import
```

### Upload deposit data

```bash
cat ~/eth-docker/.eth/validator_keys/deposit*json
```

### View Logs

```bash
ethd logs <container_name> -f --tail 20
```

**Containers:**

```
blackbox-exporter  consensus                  execution                  json-exporter
node-exporter     promtail                   cadvisor                   ethereum-metrics-exporter
grafana           loki                       prometheus                 validator
```

### Useful commands

```bash
ethd help       # list commands
ethd update     # update all clients & stack
ethd down       # stop ETH Docker
ethd restart    # restart services
ethd terminate  # delete and reinstall
```