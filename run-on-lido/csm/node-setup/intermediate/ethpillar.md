import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# EthPillar

## Full Node Setup

### Video Guide
<iframe width="800" height="450" src="https://www.youtube.com/embed/aZLPACj2oPI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

### Download EthPillar

Go to the [Coincashew website](https://www.coincashew.com/coins/overview-eth/ethpillar) and copy the latest install script, then run:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/coincashew/EthPillar/main/install.sh)"
```

Next, type and enter `ethpillar` to launch the terminal UI and:

1. Sync an execution client and a consensus + validator client.
2. **\[For Testnet only]** select **Generate validator keys**, choose how many to generate, set a password, and save your 24-word mnemonic.
3. **\[For Mainnet]** select **No** for key generation here (use a secure process in the [Key Generation for Mainnet guide](../../generating-validator-keys/key-generation-for-mainnet/)).
4. Verify the fee recipient and withdrawal address below or on the [CSM Operator Portal](https://operatorportal.lido.fi/modules/community-staking-module).
5. Import the generated validator keys into your validator client.

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

### Deposit Data

Copy your deposit data for the CSM widget:

```sh
cat ~/staking-deposit-cli/validator_keys*/deposit*json
```

**Interfaces:**

* Mainnet: [https://csm.lido.fi/](https://csm.lido.fi/)
* Hoodi: [https://csm.testnet.fi/](https://csm.testnet.fi/)

## ETHPillar Terminal-UI Navigation

1. **Arrow** & **Tab** keys: cycle options
2. **Space** bar: select option
3. **Enter**: confirm
4. **Ctrl+B**, then **D**: exit split-screen
5. **Ctrl+C**: exit individual view
6. Type `exit` + **Enter** to leave the current screen

## Setup Additional CSM Validator Client Only

<Tabs>
  <TabItem value="plugin" label="EthPillar CSM VC Additional Plugin">

This lets you run an extra validator client using your existing EthPillar setup with the Lido Execution Layer Rewards Vault as the fee recipient.

1. Run `ethpillar` to open the UI.
2. Select **Plugins** → **Lido CSM Validator: Activate an extra validator service. Reuse this node's EL/CL.**

![EthPillar VC Plugin](/img/csm-guide/ethpillar-1.png)

3. Enter the fee recipient address:

   * Mainnet: [0x388C818CA8B9251b393131C08a736A67ccB19297](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)
   * Hoodi: [0x9b108015fe433F173696Af3Aa0CF7CDb3E104258](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)

4. Generate and import your CSM validator keys here.

  </TabItem>
  <TabItem value="existing" label="EthPillar CSM VC + Existing Setup">

This lets you attach a new validator client to an existing beacon node, with a separate fee recipient (Lido Execution Layer Rewards Vault).

1. Run `ethpillar`.
2. Select **4 – Lido CSM Validator Client Only**.
3. Enter your beacon node endpoint (e.g. `http://127.0.0.1:5052`).
4. Verify the fee recipient address:

   * Mainnet: [0x388C818CA8B9251b393131C08a736A67ccB19297](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)
   * Hoodi: [0x9b108015fe433F173696Af3Aa0CF7CDb3E104258](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)
5. Generate and import your CSM validator keys.

![EthPillar VC + Existing Setup](/img/csm-guide/ethpillar-2.png)

  </TabItem>
</Tabs>

### Keep your clients up to date
To keep your clients and other packages up to date for network upgrades, security releases or minor improvements please follow [this guide](/run-on-lido/csm/updates-and-maintenance/client-updates).