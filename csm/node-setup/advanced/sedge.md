import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sedge

**Sedge** is a one-click setup tool for PoS network/chain validators and nodes. It takes care of the entire on-premise full node setup based on the chosen client, using generated docker-compose scripts based on the desired configuration.

## Full Node Setup

### Video Guide

<iframe width="800" height="450" src="https://www.youtube.com/embed/wTxhkr_eDa4?si=1vHZfSK5QMipt31O" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

### Install Sedge

Go to the [Sedge docs](https://docs.sedge.nethermind.io/) and run:

```bash
bash <(curl -fsSL https://github.com/NethermindEth/sedge/raw/main/scripts/install.sh)
```

Then check and install dependencies:

```bash
# Check dependencies
sedge deps check

# Install dependencies
sedge deps install
```

### Interactive Setup

Run Sedge in interactive mode:

```bash
sedge cli
```

Follow the terminal UI prompts to:

1. Choose `lido-node` → `Mainnet` or `Hoodi` → `full-node` and accept (or customize) the path.
2. Set the container tag (e.g. `lido-setup`) and choose **yes** to set up a validator, selecting the default MEV-Boost image.
3. Select execution, consensus, and validator clients (or randomize).
4. Set **validator grace period** to `1` and **graffiti** to `lidoiscool` (or custom).
5. Use default **Checkpoint Sync** and **No** for **expose all ports**.
6. Choose **Create** for **JWT Source** and **yes** for the monitoring stack.

### Generate & Import Validator Keys

Set up validator keys:

1. **\[Testnet only]** In the prompts, choose to generate keystore source, mnemonic source (backup your seed), and passphrase. Specify the number of keys and initial index. Verify fee recipient on the [CSM Operator Portal](https://operatorportal.lido.fi/modules/community-staking-module).
2. **\[Mainnet]** use a secure workflow in the [Key Generation for Mainnet guide](../../generating-validator-keys/key-generation-for-mainnet/) (WIP).

## Address Tabs

<Tabs>
  <TabItem value="withdrawal" label="Withdrawal Address">
    <ul>
      <li><strong>Mainnet:</strong> <a href="https://etherscan.io/address/0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f">0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f</a></li>
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

Sometimes the validator import container exits with an error. If that happens, run:

```bash
sedge run
```

### Upload deposit data

Copy deposit data for the CSM widget:

```bash
cat ~/sedge-data/keystore/deposit_data.json
```

### Monitor your setup

**View logs (all services):**

```bash
sedge logs --tail 20
```

**View logs per service:**

```bash
sedge logs <service> --tail 20
```

Services include: `execution`, `mev-boost`, `consensus`, `validator`.

**Check Node Operator status:**

```bash
sedge lido-status <reward-address>
```

Flags:

* `--network <mainnet|hoodi>`
* `--NodeID <operator-id>`

**Grafana Dashboards & Monitoring:**

```bash
sedge monitoring init lido --node-operator-id <id> --network <mainnet or hoodi>
```

This will install Grafana, Prometheus, Node Exporter, and Lido Exporter with CSM dashboards. Access at `INTERNAL_IP:3000`.

---

You can read more about Nethermind Sedge in the [official docs](https://docs.sedge.nethermind.io/).