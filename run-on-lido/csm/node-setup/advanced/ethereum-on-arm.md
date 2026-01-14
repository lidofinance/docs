---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ethereum on ARM

[Ethereum on ARM](https://ethereum-on-arm-documentation.readthedocs.io/) offers a custom Linux image for ARM64 devices (Raspberry Pi 5, Rock 5B, NanoPC T6 and Orange Pi 5 Plus) that comes pre-configured for running Ethereum nodes. It includes a specific package `ls-lido` to simplify setting up a Lido CSM operator.

:::info
This guide assumes you have a supported ARM64 device with the [Ethereum on ARM image](https://ethereum-on-arm-documentation.readthedocs.io/en/latest/installation.html) already installed and running.
:::

## Prerequisites

- A supported ARM64 device with Ethereum on ARM image installed (see above link for installation)
- A Full/Archive Ethereum node synced with MEV support.
- A MEV server compatible with Lido.
- A Validator Client with Lido configuration.
- 2.4 ETH (1.5 ETH if you are an ICS operator) for the first validator
- Ethereum on ARM `ls-lido` package.

## Running a Full Ethereum Node

First, ensure the `ls-lido` package is installed on your node:

```bash
sudo apt-get update && sudo apt-get install ls-lido
```

You need to run a Full or Archive Ethereum node. This follows the standard process for Ethereum on ARM, but you must enable MEV Boost on the Beacon Chain and start a MEV Boost server compatible with Lido.

1. **Start Consensus and Execution Clients**:
   Choose your preferred clients and start them. For example:

   ```bash
   sudo systemctl start nethermind
   sudo systemctl start lighthouse-beacon-mev
   ```

   :::warning
   Ensure you use the service name with the `-mev` suffix (e.g., `lighthouse-beacon-mev`, `prysm-beacon-mev`, `teku-beacon-mev`) to enable MEV, which is required for running Lido.
   :::

2. **Start MEV Boost**:

   ```bash
   sudo systemctl start mev-boost
   ```

## Creating Validator Keys

**Bond Requirements:**

- **Identified Community Stakers (ICS):** 1.5 ETH for the first validator, 1.3 ETH for each additional one.
- **General Permissionless Operators:** 2.4 ETH for the first validator, 1.3 ETH for each additional one.

### Option 1: Wagyu Key Generator (GUI)

1. Download the [Wagyu Key Gen](https://wagyu.gg) for your desktop.
2. Follow the instructions.
3. **Crucial**: Set the **Lido Withdrawal Address**:
   <Tabs>
     <TabItem value="withdrawal" label="Withdrawal Address">
       <ul>
         <li><strong>Mainnet:</strong> <a href="https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f">0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f</a></li>
         <li><strong>Hoodi:</strong> <a href="https://hoodi.cloud.blockscout.com/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2">0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2</a></li>
       </ul>
     </TabItem>
   </Tabs>
   :::warning
   You must set this withdrawal address to set up Lido CSM properly.
   :::

### Option 2: Command Line Deposit Tool

You can run this on your node or your desktop.

**On your node:**

```bash
ethereum  # Switch to ethereum user
deposit new-mnemonic --num_validators <NUMBER_OF_VALIDATORS> --chain mainnet --eth1_withdrawal_address 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f
```

This will create a `validator_keys` folder containing:

- `keystore(...)`: Encrypted private keys for your validator client.
- `deposit_data(...)`: File needed for the Lido CSM portal.

## Importing Keys and Starting the Validator

:::note
For more details on importing keys, refer to the [Ethereum on ARM Validator Client guide](https://ethereum-on-arm-documentation.readthedocs.io/en/latest/staking/solo-staking.html#running-validator-client-internal-alt).
:::

1. **Import Keys**:
   Transfer your keys to the node if generated on your desktop. Run the import command for your client. Example for Lighthouse:

   ```bash
   lighthouse account validator import --directory=/home/ethereum/validator_keys -d /home/ethereum/.lighthouse-validator-lido
   ```
   
   It is important to import the keys with the correct path, these are the commands for the rest of the supported validator clients:

    ```bash
   **Prysm**: validator accounts import --keys-dir=/home/ethereum/validator_keys --wallet-dir=/home/ethereum/.prysm-validator-mainnet-lido/prysm-wallet-v2
   **Nimbus**: nimbus_beacon_node deposits import /home/ethereum/validator_keys --data-dir=/home/ethereum/.nimbus-validator-lido 
   **Teku**: No need to specify the path
   ```
  

2. **Start Validator with Lido Config**:
   Start the validator service that includes the Lido configuration (look for `lido` in the service name).

   ```bash
   sudo systemctl start lighthouse-validator-lido
   ```

   :::warning
   The `lido` argument/suffix is essential as it applies the specific configuration required for Lido CSM.
   :::

## Create and Activate the CSM Operator

1. Go to the [CSM Lido Portal](https://csm.lido.fi).
2. Click **"Become a Node Operator"**.
3. Accept terms and connect the wallet (with at least 2.4 ETH or 1.5 ETH if you are an ICS operator).
4. Upload the `deposit_data` file you generated.
5. Confirm and click **"Create Node Operator"**.
6. Confirm the transaction in your wallet.

:::warning
Check if CSM has reached its stake share limit, your validator may not be activated immediately. You can still upload keys, but they might wait in the queue.
:::

## Running CSM on Hoodi Testnet

You can test the setup on the Hoodi testnet as well. The process is the same, you just need to adjust the network parameter for each client using the hoodi suffix.

1. **Start Clients on Testnet**:

   ```bash
   sudo systemctl start nethermind-hoodi
   sudo systemctl start lighthouse-beacon-hoodi-mev
   sudo systemctl start mev-boost-hoodi
   ```

2. **Generate Keys for hoodi**:
   Use Wagyu (select hoodi/Hoodi network) or the CLI tool with `--chain hoodi`.
   **Withdrawal Address for Testnet:**
   <Tabs>
     <TabItem value="withdrawal" label="Withdrawal Address">
       <ul>
         <li><strong>Hoodi:</strong> <a href="https://hoodi.cloud.blockscout.com/address/0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2</a></li>
       </ul>
     </TabItem>
   </Tabs>

3. **Import and Start**:

   ```bash
   lighthouse account validator --network hoodi import --directory=/home/ethereum/validator_keys -d /home/ethereum/.lighthouse-validator-lido
   sudo systemctl start lighthouse-validator-hoodi-lido
   ```

4. **CSM Testnet Portal**:
   [https://csm.testnet.fi](https://csm.testnet.fi)
