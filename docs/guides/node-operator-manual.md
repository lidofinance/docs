# Node Operator Manual

This document is intended for those who wish to participate in the Lido protocol as Node Operators — entities
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
   Operator must use withdrawal credentials derived from the withdrawal address supplied by the DAO.

4. The DAO members check the submitted keys for correctness and, if everything’s good, vote for
   approving them. After successful approval, the keys become usable by the protocol.

5. The protocol distributes the pooled Ether evenly between all active Node Operators in `32 Ether`
   chunks. When it assigns the next deposit to a Node Operator, it takes the first non-used signing
   key, as well as the associated signature, from the Node Operator’s usable set and performs
   a deposit to the official `DepositContract`, submitting the pooled funds. At that time, the Node
   Operator should have the validator already running and configured with the public key being used.

6. From this point, the Node Operator is responsible for keeping the validator associated with
   the signing key operable and well-behaving.

7. The protocol includes Oracles that periodically report the combined Beacon balance of all
   validators launched by the protocol. When the balance increases as a result of Beacon chain
   rewards, a fee is taken from the amount of rewards (see below for the details on how the fee
   is denominated) and distributed between active Node Operators.

### The fee

The fee is taken as a percentage from Beacon chain rewards at the moment the Oracles report
those rewards. Oracles do that once in a while — the exact period is decided by the DAO members
via the voting process.

The total fee percentage, as well as the percentage that goes to all Node Operators, is also decided
by the DAO voting and can be changed during the lifetime of the DAO. The Node Operators’ part of the
fee is distributed between the active Node Operators proportionally to the number of validators that
each Node Operator runs.

> For example, if Oracles report that the protocol has received 10 Ether as a reward, the fee
> percentage that goes to Operators is `10%`, and there are two active Node Operators, running
> `2` and `8` validators, respectively, then the first operator will receive `0.2` stETH, the
> second — `0.8` stETH.

The fee is nominated in stETH, a liquid version of ETH2 token introduced by the Lido protocol. The
tokens correspond 1:1 to the Ether that the token holder would be able get by burning their stETH
if transfers were already enabled in the Beacon chain. At any time point, the total amount of stETH
tokens is equal to the total amount of Ether controlled by the protocol on both ETH1 and ETH2 sides.

When a user submits Ether to the pool, they get the same amount of freshly-minted stETH tokens.
When reward is received on the ETH2 side, each stETH holder’s balance increases by the same
percentage that the total amount of protocol-controlled Ether has increased, corrected for the
protocol fee which is taken by [minting new stETH tokens] to the fee recipients.

> For example, if the reward has increased the total amount of protocol-controlled Ether by `10%`,
> and the total protocol fee percentage is `10%`, then each token holder’s balance will grow by
> approximately `9.09%`, and `10%` of the reward will be forwarded to the treasury, insurance fund
> and Node Operators.

One side effect of this is that you, as a Node Operator, will continue receiving the percentage
of protocol rewards even after you stop actively validating, if you chose to hold stETH received
as a fee.

[minting new steth tokens]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L576

## Operations HOWTO

Becoming a Lido Node Operator involves several steps, all of which are detailed below.

### Expressing interest to the DAO holders

To include a Node Operator to the protocol, DAO holders must perform a voting. A Node Operator
is defined by an address that is used for two purposes:

1. The protocol pays the fee by minting stETH tokens to this address.
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

#### Withdrawal Credentials

Make sure to obtain correct withdrawal address by finding it inside the active withdrawal credentials either on Aragon UI or by calling the contract via [`Lido.getWithdrawalCredentials()`]. You can find the method on the [Etherscan page for the Mainnet-deployed Lido] and [Etherscan page for the Prater-deployed Lido].

For example withdrawal credentials `0x010000000000000000000000b9d7934878b5fb9610b3fe8a5e441e8fad7e293f` mean that the withdrawal address is `0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f`. For Mainnet, always verify the address is correct using an [explorer] - you will see that it was deployed from the Lido deployer.

[bls12-381]: https://ethresear.ch/t/pragmatic-signature-aggregation-with-bls/2105
[as defined in the spec]: https://github.com/ethereum/annotated-spec/blob/master/phase0/beacon-chain.md#depositmessage
[explorer]: https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f
[`lido.getwithdrawalcredentials()`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L312
[etherscan page for the mainnet-deployed lido]: https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84#readProxyContract
[etherscan page for the prater-deployed lido]: https://goerli.etherscan.io/address/0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F#readProxyContract
[`lib/abi/lido.json`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/lib/abi/Lido.json

#### Using staking-deposit-cli

Use the latest release of [`staking-deposit-cli`].

Example command usage:

```sh
./deposit new-mnemonic --folder . --num_validators 123 --mnemonic_language english --chain mainnet --eth1_withdrawal_address 0x123
```

Here, `chain` is one of the public Beacon chain names (run the command with the `--help` flag
to see the possible values: `./deposit new-mnemonic --help`) and `eth1_withdrawal_address` is the withdrawal address from the protocol documentation.

As a result of running this, the `validator_keys` directory will be created in the current working
directory. It will contain a deposit data file named `deposit-data-*.json` and a number of private key
stores named `keystore-*.json`, the latter encrypted with the password you were asked for when running
the command.

If you chose to use the UI for submitting the keys, you’ll need to pass the JSON data found in the
deposit data file to the protocol (see the next section). If you wish, you can remove any other
fields except `pubkey` and `signature` from the array items.

Never share the generated mnemonic and your private keys with anyone, including the protocol members
and DAO holders.

[`staking-deposit-cli`]: https://github.com/ethereum/staking-deposit-cli/releases

### Validating the keys

Please, make sure to check the keys validity before submitting them on-chain.

Lido submitter has validation functionality built-in, keys will be checked before submitting.

If you will be submitting keys manually via Lido contract, you can use Lido CLI. It's a Python package which you can install with pip:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_file_keys --file keys.json
```

You would need an RPC endpoint - a local node / RPC provider (eg Alchemy/Infura).

### Submitting the keys

> Please note, that the withdrawal address should be added to the Lido Node Operators Registry before it can submit the signing keys. Adding an address to the Node Operators Registry happens via DAO voting. When providing withdrawal address to be added to the Node Operators Registry, keep in mind the following:
> - it is the address that will receive rewards;
> - it is the address you will be using for submitting keys to Lido;
> - you should be able to access it at any time in case of emergency;
> - you can use multi-sig for it if you wish to;
> - you will not be able to replace it by another address/multi-sig later.

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

Lido provides UIs for key submission: [Mainnet web interface for submitting the keys] and a [Testnet web interface for submitting the keys].

![Submitter](/img/node-operators-manual/submitter.png)

If you’ve used the `staking-deposit-cli`, you can paste the content of the generated
`deposit-data-*.json` file as-is.

Else, prepare a JSON data of the following structure and paste it to the textarea that will appear in the center of the screen:

```json
[
  {
    "pubkey": "PUBLIC_KEY_1",
    "withdrawal_credentials": "WITHDRAWAL_CREDENTIALS_1",
    "amount": 32000000000,
    "signature": "SIGNATURE_1",
    "fork_version": "FORK_VERSION_1",
    "eth2_network_name": "ETH2_NETWORK_NAME_1",
    "deposit_message_root": "DEPOSIT_MESSAGE_ROOT_1",
    "deposit_data_root": "DEPOSIT_DATA_ROOT_1"
  },
  {
    "pubkey": "PUBLIC_KEY_2",
    "withdrawal_credentials": "WITHDRAWAL_CREDENTIALS_2",
    "amount": 32000000000,
    "signature": "SIGNATURE_2",
    "fork_version": "FORK_VERSION_2",
    "eth2_network_name": "ETH2_NETWORK_NAME_2",
    "deposit_message_root": "DEPOSIT_MESSAGE_ROOT_2",
    "deposit_data_root": "DEPOSIT_DATA_ROOT_2"
  }
]
```

This tool will automatically split the keys into chunks and submit the transactions to your wallet for approval. Transactions will come one by one for signing. Unfortunately, we cannot send a large number of keys in a single transaction. Right now, the chunk size is 50 keys, it's close to the limit of gas per block.

Connect your wallet, click `Validate` button, the interface would run required checks. And then click `Submit keys` button.

We now support the following connectors:

- MetaMask and similar injected wallets
- Wallet Connect
- Gnosis Safe
- Ledger HQ

If you want to use Gnosis, there are two ways to connect:

- Add this app as a [custom app] in your safe.
- [Use WalletConnect] to connect to your safe.

When you submit a form, the keys are saved in your browser. This tool checks the new key submits against the previously saved list to avoid duplication. Therefore it is important to use one browser for submitting.

[mainnet web interface for submitting the keys]: https://operators.lido.fi/submitter
[testnet web interface for submitting the keys]: https://operators.testnet.fi/submitter
[custom app]: https://help.gnosis-safe.io/en/articles/4022030-add-a-custom-safe-app
[use walletconnect]: https://help.gnosis-safe.io/en/articles/4356253-walletconnect-safe-app

### Importing the keys to a Lighthouse validator client

If you’ve used the forked `staking-deposit-cli` to generate the keys, you can import them to a
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

Key checking works with on-chain data. Make sure key submission transactions are confirmed before checking the keys.

Never vote for increasing the key limits of Node Operators before verifying new keys are present and valid.

#### Lido CLI

Make sure Python with pip is installed and then run:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_network_keys --details
```

This operation checks all Lido keys for validity. This is a CPU-intensive process, for example, a modern desktop with 6 cores, 12 threads and great cooling processes 1k keys in 1—2 seconds.

You would need an RPC endpoint - a local node / RPC provider (eg Alchemy/Infura).

#### Lido Node Operator Dashboard

You can also check the uploaded keys on [Mainnet Lido Node Operator Dashboard] or [Testnet Lido Node Operator Dashboard].

This UI shows a number of submitted, approved and valid keys for each Node Operator, along with all invalid keys in case there are any.

It is updated every 30 minutes via cron, but update period may change in the future.

[mainnet lido node operator dashboard]: https://operators.lido.fi
[testnet lido node operator dashboard]: https://operators.testnet.fi

#### Results

##### You don't see invalid keys

If the new keys are present and valid, Node Operators can vote for increasing the key limit for the Node Operator.

##### You spot invalid keys

It is urgent to notify Lido team and other Node Operators as soon as possible. For example, in the group chat.


### Execution Layer fees/rewards configuration (Priority Fee and MEV rewards collection and distribution)
Node Operators who run validators for Lido are required to set the fee recipient for the relevant validators to the protocol-managed [`LidoExecutionLayerRewardsVault`](/contracts/lido-execution-layer-rewards-vault) which manages [Execution Layer Rewards](/contracts/lido#execution-layer-rewards). This address differs depending on the network (Mainnet, testnet, etc.) and is *not* the same as the [Withdrawal Credentials](/contracts/lido#getwithdrawalcredentials) address.

This smart contract address can also be retrieved by [querying the `getELRewardsVault()`](/contracts/lido#getelrewardsvault) method in the core stETH contract.

The address is also available in the [Deployed Contracts] docs page, labeled as `Execution Layer Rewards Vault`. 

[Deployed contracts]: /deployed-contracts

#### Fee recipient options for various Beacon Chain clients


Beacon chain clients offer a variety of methods for configuring the fee recipient. 
For some clients the fee recipient option should be applied with other options, see reference pages for specific client. Please note that most clients also support setting the fee recipient on a per-validator key basis (e.g. for Teku this can be achieved via [the proposer config](https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-config). Consult the docs for each client for specific instructions. 

| Consensus client         |  CLI option                                              | CLI reference page     |
| ------------------------ |  ------------------------------------------------------- | ---------------------- |
| Teku                     |  `--validators-proposer-default-fee-recipient=<ADDRESS>` | [Teku CLI options]     |
| Lighthouse               |  `--suggested-fee-recipient=<ADDRESS>`                   | [Lighthouse Fee Recipient Config] |
| Nimbus                   |  `--suggested-fee-recipient=<ADDRESS>`                   | [Nimbus Fee Recipient Info]   |
| Prysm                    |  `--suggested-fee-recipient=<ADDRESS>`                   | [Prysm CLI options]    |
| Lodestar                 |  `--chain.defaultFeeRecipient=<ADDRESS>`                 | [Lodestar CLI options] |


[Teku CLI options]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-default-fee-recipient
[Nimbus Fee Recipient Info]: https://nimbus.guide/merge.html?highlight=recipient#prepare-a-suggested-fee-recipient
[Lighthouse Fee Recipient Config]: https://lighthouse-book.sigmaprime.io/suggested-fee-recipient.html?highlight=fee%20recipient#suggested-fee-recipient
[Lodestar CLI options]: https://chainsafe.github.io/lodestar/reference/cli/
[Prysm CLI options]: https://docs.prylabs.network/docs/execution-node/fee-recipient

#### MEV-Boost related options for various Beacon Chain clients
| Consensus client         |  CLI option                                              | CLI reference page     |
| ------------------------ |  ------------------------------------------------------- | ---------------------- |
| Teku                     |  `--builder-endpoint=<URL>`                              | [Teku MEV integration]           |
| Lighthouse               |  BN: `--builder=<URL>` VC: `--builder-proposals`         | [Lighthouse MEV integration] |
| Nimbus                   |  `--payload-builder=true --payload-builder-url=<URL>`    | [Nimbus MEV integration]     |
| Prysm                    |  `--http-mev-relay=<URL>`                                | [Prysm MEV integration]      |
| Lodestar                 |  BN: `--builder --builder.urls=<URL>` VC: `--builder`    | [Lodestar MEV integration]   |

[Teku MEV integration]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#builder-endpoint
[Nimbus MEV integration]: https://nimbus.guide/external-block-builder.html
[Lighthouse MEV integration]: https://lighthouse-book.sigmaprime.io/builders.html
[Lodestar MEV integration]: https://chainsafe.github.io/lodestar/usage/mev-integration/
[Prysm MEV integration]: https://docs.prylabs.network/docs/prysm-usage/parameters

#### Relays and MEV-Boost options

List of possible relays that have been approved by DAO can be fetched by [querying the `get_relays()`](/contracts/mev-boost-relays-allowed-list#get_relays) method in `MevBoostRelayAllowedList` contract.

##### Mainnet

```shell
./mev-boost -mainnet -relay-check -relay <comma-separated relay urls>
```

##### Goerli

```shell
./mev-boost -goerli -relay-check -relay <comma-separated relay urls>
```

Full list of MEV-boost CLI options can be found here [MEV-Boost CLI Options]

[MEV-Boost CLI Options]: https://github.com/flashbots/mev-boost
