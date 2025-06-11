import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Exit using validator keystores

## Dappnode

To exit validators in Dappnode open the Web3signer UI by going to the package and then clicking the UI link. After that select the validators you wish to exit, and click **Exit** at the top right.

Follow the instructions and type “I want to exit”, followed by `Exit`.

![Dappnode Exit](/img/csm-guide/exit2-1.png)

## EthPillar

1. Navigate to **EthPillar » Validator » Generate Voluntary Exit Message**
2. Broadcast Voluntary Exit Message

## Stereum

Navigate to the **Staking** tab, and click on the green **Withdrawal & Exit Individual Keys** of the keys you want to exit. Alternatively click on **Withdrawal & Exit All Keys** to exit all keys.

You will be asked to confirm that you want to exit. Check the box and click **Withdraw & Exit**.

![Stereum Exit](/img/csm-guide/exit2-2.png)

## Sedge

Sedge currently does not have a built-in validator exit feature. You need to find the exit command from your chosen client, you can find them in the Systemd section below.

To exit your validators manually:

```sh
# Go to the sedge-data folder
cd ~/sedge-data/

# Run the command inside the validator service container
docker compose exec validator <client-command>
```

## Eth Docker

You can exit your validators using the keymanager API. To do so:

* Get a list of your keys:

  ```sh
  ./ethd keys list
  ```
* Sign an exit message:

  ```sh
  ./ethd keys sign-exit <0xpubkey>
  ```

This signed message is valid indefinitely. When ready, submit your exit:

* Submit the JSON file at [beaconcha.in/tools/broadcast](https://beaconcha.in/tools/broadcast)
  OR
* Run:

  ```sh
  ./ethd keys send-exit
  ```

You can track status at `https://beaconcha.in/validator/<validator-id>` via the **Exited**, **Withdrawable**, and **Withdrawn** steps.

## Systemd

First, locate your validator keystore JSON files:

```sh
sudo find /var/lib -name "keystore*.json"
```

Copy the filepath for use in the commands below.

<Tabs>
  <TabItem value="teku" label="Teku">

Run the exit command:

```sh
teku voluntary-exit \
  --beacon-node-api-endpoint=http://127.0.0.1:5051 \
  --validator-keys=/path/to/validator_key.json:/path/to/validator_key_password.txt
```

**Replace**:

1. `/path/to/validator_key.json` with your keystore path
2. `/path/to/validator_key_password.txt` with your password file path

**Reference**: [Teku Voluntary Exit docs](https://docs.teku.consensys.io/how-to/voluntarily-exit)

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">

Run the exit command:

```sh
/usr/local/bin/build/nimbus_beacon_node deposits exit \
  --rest-url http://localhost:5052 --validator=/path/to/validator_keystore.json
```

**Replace** `<path>` with your keystore path.

**Reference**: [Nimbus Voluntary Exit Guide](https://nimbus.guide/voluntary-exit.html)

  </TabItem>
  <TabItem value="lodestar" label="Lodestar">

List validator pubkeys:

```sh
/usr/local/bin/lodestar validator list
```

:::success
You can check which pubkeys are active in the CSM Widget under your operator ID.
:::

Run the exit command:

```sh
docker run --rm -it \
  -v /var/lib/csm_lodestar_validator/validator_keystores:/validator_keystores \
  chainsafe/lodestar:latest validator voluntary-exit \
  --network NETWORK --pubkeys 0xF00
```

**Replace**:
1. Volume mapping with your keystore path
2. `NETWORK` with `holesky` or `mainnet`
3. `0xF00` with your validator pubkey

**Reference**: [Lodestar Exit CLI](https://chainsafe.github.io/lodestar/run/validator-management/validator-cli/#validator-voluntary-exit)

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">

Run the exit command:

```sh
lighthouse --network NETWORK account validator exit \
  --keystore /path/to/keystore --beacon-node http://localhost:5052
```

**Replace**:
1. `NETWORK` with `mainnet` or `holesky`
2. `/path/to/keystore` with your keystore path

You’ll be prompted for your keystore password and the exit phrase **Exit my validator**.

**Reference**: [Lighthouse Voluntary Exit](https://lighthouse-book.sigmaprime.io/voluntary-exit.html)

  </TabItem>
  <TabItem value="prysm" label="Prysm">

Download `prysmctl` binaries:

```sh
cd
curl -LO https://github.com/prysmaticlabs/prysm/releases/download/v5.3.0/prysmctl-v5.3.0-linux-amd64
curl -LO https://github.com/prysmaticlabs/prysm/releases/download/v5.3.0/prysmctl-v5.3.0-linux-amd64.sha256
sha256sum --check prysmctl-v5.3.0-linux-amd64.sha256
```

Run the exit command:

```sh
/usr/local/bin/prysmctl validator exit \
  --wallet-dir=/var/lib/csm_prysm_validator --beacon-rpc-provider=http://localhost:5052
```

**Replace** wallet directory as needed.

**Reference**: [Prysm Exit Guide](https://docs.prylabs.network/docs/wallet/exiting-a-validator)

  </TabItem>
</Tabs>