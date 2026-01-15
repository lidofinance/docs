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

- A supported ARM64 device with the Ethereum on ARM image installed (see above link for installation).
- Validator keys generated (see "Creating Validator Keys" below).

## Running CSM on Mainnet

First, ensure the `ls-lido` package is installed on your node:

```bash
sudo apt-get update && sudo apt-get install ls-lido
```

You need to run a Full or Archive Ethereum node. This follows the standard process for Ethereum on ARM, but you must enable MEV Boost on the Beacon Chain and start a MEV Boost server to meet Lido CSM requirements.

1. **Start Execution Client**:
   Choose your preferred Execution Client and start it.

   <Tabs>
   <TabItem value="nethermind" label="Nethermind">

   ```bash
   sudo systemctl start nethermind
   ```

   </TabItem>
   <TabItem value="geth" label="Geth">

   ```bash
   sudo systemctl start geth
   ```

   </TabItem>
   <TabItem value="besu" label="Besu">

   ```bash
   sudo systemctl start besu
   ```

   </TabItem>
   <TabItem value="reth" label="Reth">

   ```bash
   sudo systemctl start reth
   ```

   </TabItem>
   <TabItem value="erigon" label="Erigon">

   ```bash
   sudo systemctl start erigon
   ```

   </TabItem>
   </Tabs>

2. **Start Consensus Client**:
   Choose your preferred Consensus Client and start it.

   <Tabs>

   <TabItem value="lighthouse" label="Lighthouse">

   ```bash
   sudo systemctl start lighthouse-beacon-mev
   ```

   </TabItem>
   <TabItem value="prysm" label="Prysm">

   ```bash
   sudo systemctl start prysm-beacon-mev
   ```

   </TabItem>
   <TabItem value="teku" label="Teku">

   ```bash
   sudo systemctl start teku-beacon-mev
   ```

   </TabItem>
   <TabItem value="nimbus" label="Nimbus">

   ```bash
   sudo systemctl start nimbus-beacon-mev
   ```

   </TabItem>
   </Tabs>

   :::warning
   Ensure you use the service name with the `-mev` suffix (e.g., `lighthouse-beacon-mev`, `prysm-beacon-mev`, `teku-beacon-mev`) to enable MEV, which is required for running CSM validators.
   :::

3. **Start MEV Boost**:

   ```bash
   sudo systemctl start mev-boost
   ```

## Creating Validator Keys

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
   Run the helper script to create validator passwords:

   ```bash
   sudo setup_validator_passwords
   ```

   This will generate a secure random password and create a `.txt` file for each keystore with correct permissions.

   You should now have matching files like:

   ```text
   keystore-m_12381_3600_0_0_0-1661710189.json
   keystore-m_12381_3600_0_0_0-1661710189.txt
   ```

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

## Create and Activate the CSM Validator

For instructions on how to upload your deposit data and activate your validator, please refer to the [CSM Activation](../../lido-csm-widget/upload-remove-view-validator-keys) guide.

## Running CSM on Hoodi Testnet

You can test the setup on the Hoodi testnet as well. The process is the same, you just need to adjust the network parameter for each client using the hoodi suffix.

1. **Start Clients on Testnet**:

   <Tabs>
   <TabItem value="nethermind" label="Nethermind">

   ```bash
   sudo systemctl start nethermind-hoodi
   ```

   </TabItem>
   <TabItem value="geth" label="Geth">

   ```bash
   sudo systemctl start geth-hoodi
   ```

   </TabItem>
   <TabItem value="besu" label="Besu">

   ```bash
   sudo systemctl start besu-hoodi
   ```

   </TabItem>
   <TabItem value="reth" label="Reth">

   ```bash
   sudo systemctl start reth-hoodi
   ```

   </TabItem>
   <TabItem value="erigon" label="Erigon">

   ```bash
   sudo systemctl start erigon-hoodi
   ```

   </TabItem>
   </Tabs>

   <Tabs>
   <TabItem value="lighthouse" label="Lighthouse">

   ```bash
   sudo systemctl start lighthouse-beacon-hoodi-mev
   ```

   </TabItem>
   <TabItem value="prysm" label="Prysm">

   ```bash
   sudo systemctl start prysm-beacon-hoodi-mev
   ```

   </TabItem>
   <TabItem value="teku" label="Teku">

   ```bash
   sudo systemctl start teku-beacon-hoodi-mev
   ```

   </TabItem>
   <TabItem value="nimbus" label="Nimbus">

   ```bash
   sudo systemctl start nimbus-beacon-hoodi-mev
   ```

   </TabItem>
   </Tabs>

   ```bash
   sudo systemctl start mev-boost-hoodi
   ```

2. **Generate Keys for Hoodi**:
   Follow the testnet instructions in the [Key Generation guide](../generating-validator-keys/key-generation-for-mainnet/) (selecting Hoodi network).

3. **Import and Start on Testnet**:

   <Tabs groupId="consensus-client">
     <TabItem value="lighthouse" label="Lighthouse">

       ```bash
       lighthouse account validator --network hoodi import --directory=/home/ethereum/validator_keys -d /home/ethereum/.lighthouse-validator-lido
       sudo systemctl start lighthouse-validator-hoodi-lido
       ```

     </TabItem>
     <TabItem value="prysm" label="Prysm">

       ```bash
       validator accounts import --hoodi --keys-dir=/home/ethereum/validator_keys --wallet-dir=/home/ethereum/.prysm-validator-hoodi-lido/prysm-wallet-v2
       sudo systemctl start prysm-validator-hoodi-lido
       ```

     </TabItem>
     <TabItem value="nimbus" label="Nimbus">

       ```bash
       nimbus_beacon_node deposits import /home/ethereum/validator_keys --data-dir=/home/ethereum/.nimbus-validator-hoodi-lido
       sudo systemctl start nimbus-validator-hoodi-lido
       ```

     </TabItem>
     <TabItem value="teku" label="Teku">

       Run the helper script to create validator passwords:

       ```bash
       sudo setup_validator_passwords
       ```

       This will generate a secure random password and create a `.txt` file for each keystore with correct permissions.
       
       You should now have matching files like:

       ```text
       keystore-m_12381_3600_0_0_0-1661710189.json
       keystore-m_12381_3600_0_0_0-1661710189.txt
       ```

       ```bash
       sudo systemctl start teku-validator-hoodi-lido
       ```

     </TabItem>
   </Tabs>

4. **CSM Testnet Portal**:
   [https://csm.testnet.fi](https://csm.testnet.fi)
