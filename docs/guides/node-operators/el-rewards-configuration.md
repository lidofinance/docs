# Execution Layer Rewards Configuration

Node Operators who run validators for Lido are required to set the fee recipient for the relevant validators to the protocol-managed [`LidoExecutionLayerRewardsVault`](/contracts/lido-execution-layer-rewards-vault) which manages [Execution Layer Rewards](/contracts/lido#gettotalelrewardscollected). This address differs depending on the network (Mainnet, testnet, etc.) and is _not_ the same as the [Withdrawal Credentials](/contracts/staking-router#getwithdrawalcredentials) address.

This smart contract address can also be retrieved by [querying the `elRewardsVault()`](/contracts/lido-locator#elrewardsvault) method in the `LidoLocator` contract.

The address is also available in the [Deployed Contracts] docs page, labeled as `Execution Layer Rewards Vault`.

[deployed contracts]: /deployed-contracts

## Fee recipient options for various Beacon Chain clients

Beacon chain clients offer a variety of methods for configuring the fee recipient.
For some clients the fee recipient option should be applied with other options, see reference pages for specific client. Please note that most clients also support setting the fee recipient on a per-validator key basis (e.g. for Teku this can be achieved via [the proposer config](https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-config). Consult the docs for each client for specific instructions.

| Consensus client | CLI option                                              | CLI reference page                |
| ---------------- | ------------------------------------------------------- | --------------------------------- |
| Teku             | `--validators-proposer-default-fee-recipient=<ADDRESS>` | [Teku CLI options]                |
| Lighthouse       | `--suggested-fee-recipient=<ADDRESS>`                   | [Lighthouse Fee Recipient Config] |
| Nimbus           | `--suggested-fee-recipient=<ADDRESS>`                   | [Nimbus Fee Recipient Info]       |
| Prysm            | `--suggested-fee-recipient=<ADDRESS>`                   | [Prysm CLI options]               |
| Lodestar         | `--chain.defaultFeeRecipient=<ADDRESS>`                 | [Lodestar CLI options]            |

[teku cli options]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-default-fee-recipient
[nimbus fee recipient info]: https://nimbus.guide/suggested-fee-recipient.html
[lighthouse fee recipient config]: https://lighthouse-book.sigmaprime.io/suggested-fee-recipient.html?highlight=fee%20recipient#suggested-fee-recipient
[lodestar cli options]: https://chainsafe.github.io/lodestar/reference/cli/
[prysm cli options]: https://docs.prylabs.network/docs/execution-node/fee-recipient

## MEV-Boost related options for various Beacon Chain clients

| Consensus client | CLI option                                           | CLI reference page           |
| ---------------- | ---------------------------------------------------- | ---------------------------- |
| Teku             | `--builder-endpoint=<URL>`                           | [Teku MEV integration]       |
| Lighthouse       | BN: `--builder=<URL>` VC: `--builder-proposals`      | [Lighthouse MEV integration] |
| Nimbus           | `--payload-builder=true --payload-builder-url=<URL>` | [Nimbus MEV integration]     |
| Prysm            | `--http-mev-relay=<URL>`                             | [Prysm MEV integration]      |
| Lodestar         | BN: `--builder --builder.urls=<URL>` VC: `--builder` | [Lodestar MEV integration]   |

[teku mev integration]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#builder-endpoint
[nimbus mev integration]: https://nimbus.guide/external-block-builder.html
[lighthouse mev integration]: https://lighthouse-book.sigmaprime.io/builders.html
[lodestar mev integration]: https://chainsafe.github.io/lodestar/usage/mev-integration/
[prysm mev integration]: https://docs.prylabs.network/docs/prysm-usage/parameters

## Relays and MEV-Boost options

List of possible relays that have been approved by DAO can be fetched by [querying the `get_relays()`](/contracts/mev-boost-relays-allowed-list#get_relays) method in `MevBoostRelayAllowedList` contract.

### Mainnet

```shell
./mev-boost -mainnet -relay-check -relay <comma-separated relay urls>
```

### Goerli

```shell
./mev-boost -goerli -relay-check -relay <comma-separated relay urls>
```

Full list of MEV-boost CLI options can be found here [MEV-Boost CLI Options]

[mev-boost cli options]: https://github.com/flashbots/mev-boost#mev-boost-cli-arguments
