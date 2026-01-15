---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ethereum on ARM

[Ethereum on ARM](https://ethereum-on-arm-documentation.readthedocs.io/) offers a custom Linux image for ARM64 devices (Raspberry Pi 5, Rock 5B, NanoPC T6, and Orange Pi 5 Plus) that comes pre-configured for running Ethereum nodes. It includes a specific package `ls-lido` to simplify setting up Lido CSM validators.

:::info
This guide assumes you have a supported ARM64 device with the [Ethereum on ARM image](https://ethereum-on-arm-documentation.readthedocs.io/en/latest/installation.html) already installed and running.
:::

## Prerequisites

- A supported ARM64 device with Ethereum on ARM image installed (see above link for installation)
- A Full/Archive Ethereum node synced.
- A MEV server compatible with Lido.
- A Validator Client with Lido configuration.
- Ethereum on ARM `ls-lido` package.

## Running CSM on Mainnet

First, ensure the `ls-lido` package is installed on your node:

```bash
sudo apt-get update && sudo apt-get install ls-lido
```

You need to run a Full or Archive Ethereum node. This follows the standard process for Ethereum on ARM, but you must enable MEV Boost on the Beacon Chain and start a MEV Boost server to meet Lido CSM requirements.

1. **Start Consensus and Execution Clients**:
   Choose your preferred clients and start them.

   <Tabs>

  <TabItem value="lighthouse" label="Lighthouse">

   ```bash
   sudo systemctl start nethermind
   sudo systemctl start lighthouse-beacon-mev
   ```

   </TabItem>
   <TabItem value="prysm" label="Prysm">

   ```bash
   sudo systemctl start nethermind
   sudo systemctl start prysm-beacon-mev
   ```

   </TabItem>
   <TabItem value="teku" label="Teku">

   ```bash
   sudo systemctl start nethermind
   sudo systemctl start teku-beacon-mev
   ```

   </TabItem>
   <TabItem value="nimbus" label="Nimbus">

   ```bash
   sudo systemctl start nethermind
   sudo systemctl start nimbus-beacon-mev
   ```

   </TabItem>
   </Tabs>

   :::warning
   Ensure you use the service name with the `-mev` suffix (e.g., `lighthouse-beacon-mev`, `prysm-beacon-mev`, `teku-beacon-mev`) to enable MEV, which is required for running CSM validators.
   :::

1. **Start MEV Boost**:

   ```bash
   sudo systemctl start mev-boost
   ```

## Creating Validator Keys

Bond requirements are available on the [Operator Portal](https://operatorportal.lido.fi/modules/community-staking-module).

To generate your validator keys, please refer to the [Key Generation for Mainnet](../../generating-validator-keys/key-generation-for-mainnet/) guide.

## Importing Keys and Starting the Validator

:::note
For more details on importing keys, refer to the [Ethereum on ARM Validator Client guide](https://ethereum-on-arm-documentation.readthedocs.io/en/latest/staking/solo-staking.html#running-validator-client-internal-alt).
:::

1. **Import Keys**:
   Transfer your keys to the node if generated on your desktop. Run the import command for your client.

   <Tabs>

  <TabItem value="lighthouse" label="Lighthouse">

   ```bash
   lighthouse account validator import --directory=/home/ethereum/validator_keys -d /home/ethereum/.lighthouse-validator-lido
   ```

   </TabItem>
   <TabItem value="prysm" label="Prysm">

   ```bash
   validator accounts import --keys-dir=/home/ethereum/validator_keys --wallet-dir=/home/ethereum/.prysm-validator-mainnet-lido/prysm-wallet-v2
   ```

   </TabItem>
   <TabItem value="nimbus" label="Nimbus">

   ```bash
   nimbus_beacon_node deposits import /home/ethereum/validator_keys --data-dir=/home/ethereum/.nimbus-validator-lido
   ```

   </TabItem>
   <TabItem value="teku" label="Teku">

   ```bash
   # No specific import command needed for Teku with standard Ethereum on ARM setup if keys are in the correct location or handled via config
   # Refer to Ethereum on ARM documentation for specific Teku key management if needed.
   # Based on original doc: "Teku: No need to specify the path"
   ```

   </TabItem>
   </Tabs>

1. **Start Validator with Lido Config**:
   Start the validator service that includes the Lido configuration (look for `lido` in the service name).

   <Tabs>

  <TabItem value="lighthouse" label="Lighthouse">

   ```bash
   sudo systemctl start lighthouse-validator-lido
   ```

   </TabItem>
   <TabItem value="prysm" label="Prysm">

   ```bash
   sudo systemctl start prysm-validator-lido
   ```

   </TabItem>
   <TabItem value="teku" label="Teku">

   ```bash
   sudo systemctl start teku-validator-lido
   ```

   </TabItem>
   <TabItem value="nimbus" label="Nimbus">

   ```bash
   sudo systemctl start nimbus-validator-lido
   ```

   </TabItem>
   </Tabs>

   :::warning
   The `lido` argument/suffix is essential as it applies the specific configuration required for Lido CSM.
   :::

## Create and Activate the CSM Operator

For instructions on how to upload your deposit data and activate your validator, please refer to the [CSM Activation](https://docs.lido.fi/run-on-lido/csm/activation/) guide.

## Running CSM on Hoodi Testnet

You can test the setup on the Hoodi testnet as well. The process is the same, you just need to adjust the network parameter for each client using the hoodi suffix.

1. **Start Clients on Testnet**:

   ```bash
   sudo systemctl start nethermind-hoodi
   sudo systemctl start lighthouse-beacon-hoodi-mev
   sudo systemctl start mev-boost-hoodi
   ```

2. **Generate Keys for hoodi**:
   Use [Key Generation for Testnet](../../generating-validator-keys/key-generation-for-testnet).

3. **Import and Start**:

   ```bash
   lighthouse account validator --network hoodi import --directory=/home/ethereum/validator_keys -d /home/ethereum/.lighthouse-validator-lido
   ```

4. **CSM Testnet Portal**:
   [https://csm.testnet.fi](https://csm.testnet.fi)
