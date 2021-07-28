# Node Operator Manual

This document is intended for those who wish to participate in the Lido protocol as Node Operators—entities
who run Beacon validator nodes on behalf of the protocol and receive fee in return. It consists of
two sections: [General overview](#general-overview) and [Operations HOWTO](#operations-howto).
If you’re here for the technical details of interacting with the protocol, feel free to skip to
the latter.

## General overview

Node Operators manage a secure and stable infrastructure for running Beacon validator clients
for the benefit of the protocol. They’re professional staking providers who can ensure the safety
of funds belonging to the protocol users and correctness of validator operations.

The general flow is the following:

1. A Node Operator expresses their interest to the DAO members. Their address gets proposed to the DAO vote for inclusion to the DAO's Node Operator list. Note that the Node Operator address should be supplied to the DAO with zero signing keys limit.

2. The DAO votes for including the Operator to the list of active operators. After successful
   voting for inclusion, the Node Operator becomes active.

3. The Node Operator generates and submits a set of signing public keys and associated signatures
   for future validators that will be managed by the Operator. When generating the signatures, the
   Operator must use the withdrawal credentials supplied by the DAO.

4. The DAO members check the submitted keys for correctness and, if everything’s good, vote for
   approving them. After successful approval, the keys become usable by the protocol.

5. The protocol distributes the pooled Ether evenly between all active Node Operators in `32 Ether`
   chunks. When it assigns the next deposit to a Node Operator, it takes the first non-used signing
   key, as well as the accociated signature, from the Node Operator’s usable set and performs
   a deposit to the official `DepositContract`, submitting the pooled funds. At that time, the Node
   Operator should have the validator already running and configured with the public key being used.

6. From this point, the Node Operator is responsible for keeping the validator associated with
   the signing key operable and well-behaving.

7. The protocol includes Oracles that periodically report the combined Beacon balance of all
   validators launched by the protocol. When the balance increases as a result of Beacon chain
   rewards, a fee is taken from the amount of rewards (see below for the details on how the fee
   is nominated) and distributed between active Node Operators.

### The fee

The fee is taken as a percentage from Beacon chain rewards at the moment the Oracles report
those rewards. Oracles do that once in a while—the exact period is decided by the DAO members
via the voting process.

The total fee percentage, as well as the percentage that goes to all Node Operators, is also decided
by the DAO voting and can be changed during the lifetime of the DAO. The Node Operators’ part of the
fee is distributed between the active Node Operators proportionally to the number of validators that
each Node Operator runs.

> For example, if Oracles report that the protocol has received 10 Ether as a reward, the fee
> percentage that goes to Operators is `10%`, and there are two active Node Operators, running
> `2` and `8` validators, respectively, then the first operator will receive `0.2` StETH, the
> second — `0.8` StETH.

The fee is nominated in StETH, a liquid version of ETH2 token introduced by the Lido protocol. The
tokens correspond 1:1 to the Ether that the token holder would be able get by burning their StETH
if transfers were already enabled in the Beacon chain. At any time point, the total amount of StETH
tokens is equal to the total amount of Ether controlled by the protocol on both ETH1 and ETH2 sides.

When a user submits Ether to the pool, they get the same amount of freshly-minted StETH tokens.
When reward is received on the ETH2 side, each StETH holder’s balance increases by the same
percentage that the total amount of protocol-controlled Ether has increased, corrected for the
protocol fee which is taken by [minting new StETH tokens] to the fee recipients.

> For example, if the reward has increased the total amount of protocol-controlled Ether by `10%`,
> and the total protocol fee percentage is `10%`, then each token holder’s balance will grow by
> approximately `9.09%`, and `10%` of the reward will be forwarded to the treasury, insurance fund
> and Node Operators.

One side effect of this is that you, as a Node Operator, will continue receiving the percentage
of protocol rewards even after you stop actively validating, if you chose to hold StETH received
as a fee.

[minting new steth tokens]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L576

## Operations HOWTO

Becoming a Lido Node Operator involves several steps, all of which are detailed below.

### Expressing interest to the DAO holders

To include a Node Operator to the protocol, DAO holders must perform a voting. A Node Operator
is defined by an address that is used for two purposes:

1. The protocol pays the fee by minting StETH tokens to this address.
2. The Node Operator uses this address for submitting signing keys to be used by the protocol.

Pass this address to the DAO holders along with the other relevant information.

### Generating signing keys

Upon inclusion into the protocol, a Node Operator should generate and submit a set of [BLS12-381]
public keys that will be used by the protocol for making Beacon deposits. Along with the keys,
a Node Operator submits a set of the corresponding signatures [as defined in the spec]. The
`DepositMessage` used for generating the signature must be the following:

- `pubkey` must be derived from the private key used for signing the message;
- `amount` must equal to 32 Ether;
- `withdrawal_credentials` must equal to the protocol credentials set by the DAO.

The fork version used for generating the signature must correspond to the fork version of the Beacon
chain the instance of Lido protocol is targeted to.

#### Mainnet

Make sure to obtain a correct withdrawal address by finding it inside active withdrawal credentials either on Aragon UI or calling the contract via [`Lido.getWithdrawalCredentials()`]. You can quickly find on the [Etherscan page for the Mainnet-deployed Lido].

For example withdrawal credentials `0x010000000000000000000000b9d7934878b5fb9610b3fe8a5e441e8fad7e293f` mean that the withdrawal address is `0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f`. Always verify the address is correct using an [explorer] - you will see it's deployed from the Lido deployer.

#### Testnet

You can obtain the protocol withdrawal credentials by calling [`Lido.getWithdrawalCredentials()`].
On the [Etherscan page for the Prater-deployed Lido], it’s the field number 19. The ABI of the
`Lido` contract can be found in [`lib/abi/Lido.json`].

[bls12-381]: https://ethresear.ch/t/pragmatic-signature-aggregation-with-bls/2105
[as defined in the spec]: https://github.com/ethereum/annotated-spec/blob/master/phase0/beacon-chain.md#depositmessage
[explorer]: https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f
[`lido.getwithdrawalcredentials()`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L312
[etherscan page for the mainnet-deployed lido]: https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84#readProxyContract
[etherscan page for the prater-deployed lido]: https://goerli.etherscan.io/address/0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F#readProxyContract
[`lib/abi/lido.json`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/lib/abi/Lido.json

#### Using eth2.0-deposit-cli

##### Mainnet

For a mainnet deployment, use the latest release of [`eth2.0-deposit-cli`].

Example command usage:

```sh
./deposit new-mnemonic --folder . --num_validators 123 --mnemonic_language english --chain mainnet --eth1_withdrawal_address 0x123
```

##### Testnet

In a testnet environment, you can use [a fork of `eth2.0-deposit-cli`] which is also published to the
Docker Hub as [`lidofinance/deposit-cli`]. It is modified to support passing a pre-defined withdrawal
public key instead of generating new one.

To generate the keys and signatures, run the following:

```sh
docker run -it --rm -v "$(pwd):/data" lidofinance/deposit-cli \
  new-mnemonic \
  --folder /data \
  --chain="$CHAIN_NAME" \
  --withdrawal_credentials="$WITHDRAWAL_CREDENTIALS"
```

Here, `CHAIN_NAME` is one of the public Beacon chain names (run the container with the `--help` flag
to see the possible values) and `WITHDRAWAL_CREDENTIALS` is the withdrawal credentials
from the protocol documentation.

As a result of running this, the `validator_keys` directory will be created in the current working
directory. It will contain a deposit data file named `deposit-data-*.json` and a number of private key
stores named `keystore-*.json`, the latter encrypted with the password you were asked for when running
the command.

If you chose to use the UI for submitting the keys, you’ll need to pass the JSON data found in the
deposit data file to the protocol (see the next section). If you wish, you can remove any other
fields except `pubkey` and `signature` from the array items.

Never share the generated mnemonic and your private keys with anyone, including the protocol members
and DAO holders.

[`eth2.0-deposit-cli`]: https://github.com/ethereum/eth2.0-deposit-cli/releases
[a fork of `eth2.0-deposit-cli`]: https://github.com/lidofinance/eth2.0-deposit-cli
[`lidofinance/deposit-cli`]: https://hub.docker.com/repository/docker/lidofinance/deposit-cli

### Validating the keys

It's vital to check the correctness of the keys before submitting them.

If you will be submitting keys using Lido's submitter, they will be checked before submitting - the "submit" button won't be active unless keys are validated and they are valid.

If you will be submitting keys manually via Lido contract, you can use Lido CLI, it's as simple as having Python with pip installed and running:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_file_keys --file keys.json
```

You would need an RPC endpoint - a local node / RPC provider (eg Alchemy/Infura).

### Submitting the keys

After generating the keys, a Node Operator submits them to the protocol. To do this, they send a
transaction from the Node Operator’s withdrawal address to the `NodeOperatorsRegistry` contract
instance, calling [`addSigningKeysOperatorBH` function] and with the following arguments:

```
* `uint256 _operator_id` the zero-based sequence number of the operator in the list.
* `uint256 _quantity` the number of keys being submitted.
* `bytes _pubkeys` the concatenated keys.
* `bytes _signatures` the concatenated signatures.
```

The address of the `NodeOperatorsRegistry` contract instance can be obtained by calling the
[`getOperators()` function] on the `Lido` contract instance. The ABI of the `NodeOperatorsRegistry`
contract can be found in [`lib/abi/NodeOperatorsRegistry.json`].

Operator ID for a given reward address can be obtained by successively calling
[`NodeOperatorsRegistry.getNodeOperator`] with the increasing `_id` argument until you get the
operator with the matching `rewardAddress`.

Etherscan pages for the Görli/Prater contracts:

- [`Lido`](https://goerli.etherscan.io/address/0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F#readProxyContract)
- [`NodeOperatorsRegistry`](https://goerli.etherscan.io/address/0x9D4AF1Ee19Dad8857db3a45B0374c81c8A1C6320)

Etherscan pages for the Mainnet contracts:

- [`Lido`](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84#readProxyContract)
- [`NodeOperatorsRegistry`](https://etherscan.io/address/0x55032650b14df07b85bf18a3a3ec8e0af2e028d5#readProxyContract)

[`addsigningkeysoperatorbh` function]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/nos/NodeOperatorsRegistry.sol#L250
[`getoperators()` function]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L361
[`lib/abi/nodeoperatorsregistry.json`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/lib/abi/NodeOperatorsRegistry.json
[`nodeoperatorsregistry.getnodeoperator`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/nos/NodeOperatorsRegistry.sol#L335

#### Using the batch key submitter UI

Lido has specialised key submitters: [Mainnet web interface for submitting the keys] and a [Testnet web interface for submitting the keys].

It will require that all keys are validated first - click the check button. Please be patient - we aim to process 1k keys under a minute, but several users can be checking keys simultaneously, so the process can take longer. Also, please don't update the page manually - UI will automatically repeat failing requests and will show an error if retries fail.

This tool will automatically split the keys into chunks and submit the transactions to Metamask for approval.

As a precaution, always check that the number of transactions in Metamask is `n of keys / chunk size`.

Right now, the chunk size is 20 keys, but may change in the future.

After keys are approved in Metamask, never submit more keys unless previous transaction have been mined.

<img width="1280" alt="image" src="https://user-images.githubusercontent.com/4445523/113226738-8b522480-9299-11eb-84eb-186bb6f198dc.png" />

Prepare a JSON data of the following structure and paste it to the textarea that will appear in the center of the screen:

```json
[
  {
    "pubkey": "PUBLIC_KEY_1",
    "signature": "SIGNATURE_1"
  },
  {
    "pubkey": "PUBLIC_KEY_2",
    "signature": "SIGNATURE_2"
  }
]
```

If you’ve used the forked `eth2.0-deposit-cli`, you can paste the content of the generated
`deposit-data-*.json` file as-is.

Click `Check` button, and then the interface would run required checks connect the MetaMask and click `Submit` button.

[mainnet web interface for submitting the keys]: https://stake.lido.fi/key-checker/submit
[testnet web interface for submitting the keys]: https://stake.testnet.lido.fi/key-checker/submit

#### Using the Aragon UI

WARNING: At this moment please use other methods. Aragon UI submitting is being adjusted.

Alternatively, you can use the Node Operators Registry app UI for submitting the keys.

Mainnet: https://mainnet.lido.fi/#/lido-dao/
Testnet: https://testnet.lido.fi/#/lido-testnet-prater/0x9d4af1ee19dad8857db3a45b0374c81c8a1c6320/

Make sure you’re using a browser that exposes a Web3 provider allowing to sign transactions on
behalf of the Node Operator’s reward address. Press the Connect account button in the top-right and
allow the access to the account associated with the reward address. Then, find yourself in the
list of Node Operators — the corresponding item will be suffixed by `(you)`:

<img width="1124" alt="add-signing-keys-1" src="https://user-images.githubusercontent.com/1699593/100355848-7f143d00-3003-11eb-9d63-94630e059eb8.png" />

Then, press the `...` button on the right of the item and select `add my signing keys`:

<img width="1123" alt="add-signing-keys-2" src="https://user-images.githubusercontent.com/1699593/100355837-7d4a7980-3003-11eb-84ae-02a71f9ed2ec.png" />

If you’ve used the forked `eth2.0-deposit-cli`, you can paste the content of the generated
`deposit-data-*.json` file as-is.

Else, prepare a JSON data of the following structure and paste it to the `JSON` field in the side panel
that will appear on the right:

```js
;[
  {
    pubkey: 'PUBLIC_KEY_1',
    signature: 'SIGNATURE_1',
  },
  {
    pubkey: 'PUBLIC_KEY_2',
    signature: 'SIGNATURE_2',
  },
  // ... etc.
]
```

Then, press `Add signing keys` and sign the transaction. Wait for it to be included in a block,
refresh the page and make sure that the number in the `Total` field corresponds to the number
of the keys you’ve just submitted:

<img width="1125" alt="add-signing-keys-3" src="https://user-images.githubusercontent.com/1699593/100355828-7ae81f80-3003-11eb-9d04-d29ae57c0904.png" />

### Importing the keys to a Lighthouse validator client

If you’ve used the forked `eth2.0-deposit-cli` to generate the keys, you can import them to a
Lighthouse validator client by running this command:

```sh
docker run --rm -it \
  --name validator_keys_import \
  -v "$KEYS_DIR":/root/validator_keys \
  -v "$DATA_DIR":/root/.lighthouse \
  sigp/lighthouse \
  lighthouse account validator import \
  --reuse-password \
  --network "$TESTNET_NAME" \
  --datadir /root/.lighthouse/data \
  --directory /root/validator_keys
```

### Checking the keys of all Lido Node Operators

After keys are submitted, it's encouraged to wait for the transactions to be mined and to check how they appear on the chain.

#### Lido CLI

Make sure Python with pip is installed and then run:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_network_keys
```

This operation checks all Lido keys for validity. This is a CPU-intensive process, for example, a modern desktop with 6 cores, 12 threads and great cooling processes 1k keys in ~1 minute.

You would need an RPC endpoint - a local node / RPC provider (eg Alchemy/Infura).

#### Lido Node Operator Dashboard

You can also check the uploaded keys on [Mainnet Lido Node Operator Dashboard] or [Testnet Lido Node Operator Dashboard].

It will display key summary for each node operator, including checks for number of keys over staking limit and invalid keys if found.

It is updated every 30 minutes via cron, but update period may change in the future.

[mainnet lido node operator dashboard]: https://stake.lido.fi/key-checker/existing
[testnet lido node operator dashboard]: https://stake.testnet.lido.fi/key-checker/existing

#### Results

##### You don't see invalid keys

If the new keys are present and valid, Node Operators can vote for increasing the key limit for the Node Operator.

##### You spot invalid keys

It is urgent to notify Lido team and other Node Operators as soon as possible. For example, in the group chat.
