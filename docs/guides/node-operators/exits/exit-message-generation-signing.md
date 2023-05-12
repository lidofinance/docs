# Exit Message Generation & Signing

## Keystores or Dirk

If your validator signing keys are in [keystores](https://eips.ethereum.org/EIPS/eip-2335) or in [Dirk](https://github.com/attestantio/dirk) remote keymanager, the easiest method is to use [ethdo](https://github.com/wealdtech/ethdo).

### For Keystores:

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

### For Dirk:

```bash
./ethdo --remote=server.example.com:9091 --client-cert=client.crt --client-key=client.key --server-ca-cert=dirk_authority.crt validator exit --account=Validators/1 --json --connection=http://127.0.0.1:5051
```

[ethdo](https://github.com/wealdtech/ethdo)
[ethdo Docs](https://github.com/wealdtech/ethdo/blob/master/docs/usage.md#exit)

## For Web3Signer or Proprietary Signers

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
