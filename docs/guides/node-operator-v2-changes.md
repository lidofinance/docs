# What's Changing for Node Operators in Lido V2

## Intro

[Lido V2](https://blog.lido.fi/introducing-lido-v2/) protocol upgrade will add support for [Ethereum Withdrawals](https://ethereum.org/en/staking/withdrawals/) and introduce additional responsibilities for Node Operators.

Lido Withdrawals will be happening in four stages:

1. stETH holders request a withdrawal
2. Lido Oracles decide which Lido validators should be exited to fulfil the request and publish the list on-chain
3. Lido Node Operators exit these validators
4. stETH holders claim their ETH

This means that Node Operators need a way to react quickly to protocol requests.

The suggested method is to generate and sign exit messages ahead of time which will be sent out when needed by a special new daemon called the Validator Ejector.

To understand for which validators to generate and sign exit messages, another new app called Keys API is introduced.

## Requirements

First, is running new tooling required?

New Lido tooling is not required to use, but is recommended.

The only new requirement for Node Operators is to exit their validators in time after requested by the protocol.

For details, check out [Validator Exits Policy](https://hackmd.io/@lido/HJYFjmf6s) and [Research Forum Discussion](https://research.lido.fi/t/lido-validator-exits-policy-draft-for-discussion).

## New Tooling

### Keys API (KAPI for short)

KAPI is a new service which stores and serves up-to-date information about Lido validators.

It provides a very important function: it provides two endpoints, using which a Node Operator understands for which validators to generate and sign exit messages in advance.

Under the hood, KAPI also automatically filters out validators which are exited already or are currently exiting.

### Validator Ejector (Ejector for short)

Ejector is a daemon service which monitors `ValidatorsExitBusOracle` events and initiates an exit when required.

In messages mode, on start, it loads exit messages in form of individual .json files from a specified folder or an external storage and validates their format, structure and signature.

It then loads events from a configurable amount of latest finalized blocks, checks if exits should be made and after that periodically fetches fresh events.

In webhook mode, it simply fetches a remote endpoint when an exit should be made, allowing to implement JIT approach by offloading exiting logic to an external service and using the Ejector as a secure exit events reader.

## General Overview

### What Are Exit Messages?

To initiate a validator exit, an [exit message](https://github.com/ethereum/consensus-specs/blob/v1.0.1/specs/phase0/beacon-chain.md#voluntaryexit) needs to be generated, signed and submitted to a Consensus Node.

It looks like this:

```json
{
  "message": { "epoch": "123", "validator_index": "123" },
  "signature": "0x123"
}
```

After it's generated, it is signed using the validator BLS key which needs to be exited and a [signed exit message](https://github.com/ethereum/consensus-specs/blob/v1.0.1/specs/phase0/beacon-chain.md#signedvoluntaryexit) is formed.

### Pre-sign or Not to Pre-sign

In short, it's a well balanced solution allowing to achieve meaningful automation without sacrificing security or decentralisation.

You can find the reasoning behind the suggested approach in the [Lido Withdrawals: Automating Validator Exits RFC](https://hackmd.io/@lido/BkxRxAr-o).

However, if you have existing tooling in place to create and send out exit messages, you can use webhook mode of the Ejector which will call an endpoint in order to initiate a validator exit.

On the endpoint, JSON will be POSTed with the following structure:

```json
{
		"validatorIndex": "123"
		"validatorPubkey": "0x123"
}
```

200 response will be counted as a successful exit, non-200 as a fail.

If it's not enough, you'll have to fork the Ejector or monitor `ValidatorExitRequest` events of the [`ValidatorsExitBusOracle`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol) in your tooling.

[Example in the Ejector](https://github.com/lidofinance/validator-ejector/blob/d72cac9767a57936f29c5b54e7de4f74344342de/src/services/execution-api/service.ts#L160-L203)

### How Many Keys to Pre-sign

Node Operators should pre-sign an amount or a percentage of validators which they are comfortable with managing. Smaller amounts means more frequent refills and vice versa.

For Withdrawals preparations, for example, exits for 10% of the validators pre-signed is suggested. After that, it wilsl depend on the Withdrawals demand and Node Operator preferences.

### How to Understand Which Keys to Pre-sign

#### Using KAPI (recommended)

First endpoint returns a list of validators for a specific Node Operator, for which to generate and sign exit messages next:

`/v1/modules/{module_id}/validators/validator-exits-to-prepare/{operator_id}`

Returns data:

```json
[{
	"validatorIndex": 123;
	"key": "0x123";
}]
```

Additionally, there is also a second endpoint which calculates the same data, but returns ready to sign exit messages:

`/v1/modules/{module_id}/validators/generate-unsigned-exit-messages/{operator_id}`

:::danger
Make sure to visually inspect the returned data as a precaution as you will be signing it.
You can find the expected format in the [What Are Exit Messages](#what-are-exit-messages) section.
:::

Returns data:

```json
[{
	"validator_index": "123";
	"epoch": "123";
}]
```

Furthermore, both endpoints allow for additional configuration via query parameters:

- `percent` - Percent of validators to return data for. Default value is 10.
- `max_amount` - Number of validators to return data for. If validator number is less than the specified amount, all validators are returned.

:::info
Note: Only one parameter is active at a time. If both are provided, `percent` has a higher priority.
:::

KAPI will automatically filter out validators which are exited already or are currently exiting, so one call to the KAPI is all that's needed.

#### Manually

If your validator signing keys are stored in generation order, you can simply start exit generation and signing from the oldest keys since the exit algorithm is deterministic and will choose oldest keys first for each Node Operator.

However, for each batch you'll need to either track the last key exit message was generated for or query validator statuses on the Consensus Node to understand where to start next.

### Exit Message Generation & Signing

#### Keystores or Dirk

If your validator signing keys are in [keystores](https://eips.ethereum.org/EIPS/eip-2335) or in [Dirk](https://github.com/attestantio/dirk) remote keymanager, the easiest method is to use [ethdo](https://github.com/wealdtech/ethdo).

##### For Keystores:

1. Create an ethdo wallet
2. Import keystores
3. Generate an exit
4. Erase the wallet if it's no longer needed

Create a new wallet:

```bash
./ethdo --base-dir=./temp wallet create --wallet=wallet
```

Add key from a keystore:

```bash
./ethdo --base-dir=./temp account import --account=wallet/account --keystore=./ethdo/keystore.json --keystore-passphrase=12345678 --passphrase=pass
```

Generate and sign an exit message:

```bash
./ethdo --base-dir=./temp validator exit --account=wallet/account --passphrase=pass --json --connection=http://consensus_node:5052
```

ethdo will print out the exit message to stdout. You can save the file `ethdo ... > 0x123.json`.

After we are done, delete the wallet:

```bash
./ethdo --base-dir=./temp wallet delete --wallet=wallet
```

If you are looking for a way to automate the process, check out [this example](https://gist.github.com/kolyasapphire/d2bafce3cdd04305bc109cbd49728ffe).

:::info
Although keystores are encrypted, it is highly recommended to interact with them in a secure environment without internet access.
:::

ethdo allows you to prepare everything necessary for offline exit message generation in one convenient file. For this, on a machine with access to a Consensus Node run:

```bash
./ethdo validator exit --prepare-offline --connection=http://consensus_node:5052 --timeout=300s
```

This command will pull validators info, fork versions, current epoch and other chain data for offline exit message generation and save it to `offline-preparation.json` in the `ethdo` directory.

This file can be then transferred to a secure machine along with `ethdo` binary, for example on a encrypted USB drive.

On the secure machine, put `offline-preparation.json` into the directory `ethdo` is ran from, use `--offline` argument for the `validator exit` command and remove `--connection`:

```bash
./ethdo --base-dir=./temp validator exit --account=wallet/account --passphrase=pass --json --offline
```

##### For Dirk:

```bash
./ethdo --remote=server.example.com:9091 --client-cert=client.crt --client-key=client.key --server-ca-cert=dirk_authority.crt validator exit --account=Validators/1 --json --connection=http://127.0.0.1:5051
```

[ethdo](https://github.com/wealdtech/ethdo)
[ethdo Docs](https://github.com/wealdtech/ethdo/blob/master/docs/usage.md#exit)

#### For Web3Signer or Proprietary Signers

If you are using the `/api/v1/modules/{module_id}/validators/generate-unsigned-exit-messages/{operator_id}` endpoint of the KAPI, you can skip getting the epoch and constructing an unsigned exit message in the example below.

Get current epoch:

```javascript
const blockReq = await fetch(CONSENSUS_BLOCK_ENDPOINT)
const blockRes = await blockReq.json()
const blockNumber = blockRes.data.message.slot
const currentEpoch = Math.floor(blockNumber / 32)
```

Get fork parameters:

```javascript
const forkReq = await fetch(CONSENSUS_FORK_ENDPOINT)
const forkRes = await forkReq.json()
const fork = forkRes.data
```

Get genesis parameters:

```javascript
const genesisReq = await fetch(CONSENSUS_GENESIS_ENDPOINT)
const genesisRes = await genesisReq.json()
const genesis_validators_root = genesisRes.data.genesis_validators_root
```

Construct an exit message:

```javascript
const voluntaryExit = {
  epoch: String(currentEpoch),
  validator_index: String(VALIDATOR_INDEX),
}
```

Prepare a signing request:

```javascript
const body = {
  type: 'VOLUNTARY_EXIT',
  fork_info: {
    fork,
    genesis_validators_root,
  },
  voluntary_exit: voluntaryExit,
}
```

Send the request:

```javascript
const signerReq = await fetch(WEB3SIGNER_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify(body),
})
const signature = await signerReq.text()
```

Finally, construct a signed exit message:

```javascript
const signedMessage = {
  message: voluntaryExit,
  signature,
}
```

[Complete Example](https://gist.github.com/kolyasapphire/53dbdab35f1a033b0d37ddf582dce414)

:::info
It's advised to prepare all the necessary parameters (forks, epoch, etc) ahead of time and communicate with Web3Signer securely, for example via a secure network with no other internet access.
:::

[Web3Signer API Docs](https://consensys.github.io/web3signer/web3signer-eth2.html#tag/Signing)

### Storing Signed Exit Messages

Storing signed exit messages as-is is discouraged. If an attacker gains access to them, they will simply submit them, which will exit every validator for which you had exit messages.

It's recommended to encrypt the messages, for example using the encryption script provided with the Ejector.

[How to Use the Ejector Encryptor](https://hackmd.io/@lido/BJvy7eWln#Encrypting-Messages)

You can also check out the [source code](https://github.com/lidofinance/validator-ejector/blob/develop/encryptor/encrypt.ts) and integrate it in your own tooling if needed.

Ejector automatically decrypts [EIP-2335](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2335.md)-encrypted files on app start.

### How to Initiate a Validator Exit

Signed messages are sent to a Consensus Node via the `/eth/v1/beacon/pool/voluntary_exits` endpoint in order to initiate an exit.

The Ejector will do this automatically when necessary.

If you don't run the Ejector, you'll have to do this manually or develop your own tooling.
If your exit messages are encrypted, you'll need to decrypt them first.

### Flow Examples

#### With Lido Tooling (KAPI + Ejector)

[![](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)

Using the recommended tooling, the flow looks like this:

1. Get a list of validators for which to generate and sign exit messages - KAPI
2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Encrypt the message files using the Ejector encryptor script
4. Add files to the Ejector
5. Wait until valid Ejector messages are running out
6. Repeat

#### Ejector Only

[![](https://hackmd.io/_uploads/H1_Z4Creh.jpg)](https://hackmd.io/_uploads/H1_Z4Creh.jpg)

1. Get a list of validators for which to generate and sign exit messages:

- By the order keys are stored in (eg choose oldest)
- Query [NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol) contract to get all your keys, sort by index, start with the lowest indexes. Each batch, either track the last pre-signed index or query validator status on the Consensus Node to ignore exiting and already exited validators.

2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Encrypt the message files using the Ejector encryptor script
4. Add files to the Ejector
5. Wait until valid Ejector messages are running out
6. Repeat

#### Without Lido Tooling

[![](https://hackmd.io/_uploads/rJZ5TBme3.jpg)](https://hackmd.io/_uploads/rJZ5TBme3.jpg)

1. Monitor `ValidatorExitRequest` events of the [`ValidatorsExitBusOracle`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol)
2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Submit the messages:

- ethdo can do it straight away in the previous step by leaving out `--json` argument
- Submit it manually to the Consensus Node: [API Docs](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolVoluntaryExit)

## Tooling Setup & Configuration

### Keys API (KAPI)

[Dedicated Setup Guide](https://hackmd.io/@lido/S1Li-wXl3)

[GitHub Repo](https://github.com/lidofinance/lido-keys-api)

### Validator Ejector (Ejector)

[Dedicated Setup Guide](https://hackmd.io/@lido/BJvy7eWln)

[GitHub Repo](https://github.com/lidofinance/validator-ejector)

### Required Infra for New Tooling

In order for the new tooling to read Lido contracts and validator information, tooling needs access to an Execution Node (full node to be exact) and a Consensus Node.

A dedicated CL+EL setup is recommended.

:::info
Although the Ejector has [security protections](https://github.com/lidofinance/validator-ejector#safety-features), using hosted RPC providers (Infura, Alchemy, etc) is discouraged.
:::

:::info
It's also advised to have secure Ejector->Nodes and KAPI->Nodes communication, for example via a private network.
:::

### Common Configuration Options

#### Operator ID

You can find it on the Operators Dashboard (`#123` on the operator card): [Goerli](https://operators.testnet.fi), [Mainnet](https://operators.lido.fi)

#### Staking Router Module ID:

ID of the [StakingRouter](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol) contract module.

Currently, it has only one module ([NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)), it's id is `1`.

### Example Infra Setup

Lido DevOps team prepared an easy way to get the recommended tooling and its dependencies up and running using [Ansible](https://github.com/ansible/ansible). This is a great way to get familiar with the new tooling. This is an example implementation, and still requires security and hardening by the NO; it can be found on [GitHub](https://github.com/lidofinance/node-operators-setup).

It sets up 3 hosts:

- Execution Layer + Consensus Layer nodes ([Geth](https://github.com/ethereum/go-ethereum) + [Lighthouse](https://github.com/sigp/lighthouse))
- KAPI & Ejector
- Monitoring

Monitoring consists of:

- [Prometheus](https://github.com/prometheus/prometheus) for metrics
- [Alertmanager](https://github.com/prometheus/alertmanager) for alerts
- [Loki](https://github.com/grafana/loki) for logs
- [Grafana](https://github.com/grafana/grafana) for dashboards
