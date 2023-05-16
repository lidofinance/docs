# Oracle Operator Manual

This document is intended for those who wish to participate in the Lido protocol as Oracle - an entity who runs a daemons synchronizing state from Beacon Layer to Execution Layer of the protocol.
Due to the lack of native communication between these two networks, Lido employs a network of oracles to synchronize the system at regular intervals.

## TL;DR

1. Generate an Ethereum address.
2. Launch and sync an [archive](https://ethereum.org/en/developers/docs/nodes-and-clients/#archive-node) Execution Layer node with JSON-RPC endpoint enabled.
3. Launch and sync an [archive](https://ethereum.org/en/developers/docs/nodes-and-clients/#archive-node) Consensus Layer node with API endpoint enabled.
4. Launch and sync a [Keys API Service](https://github.com/lidofinance/lido-keys-api).
5. Launch the accounting and ejector modules of Oracle.
6. [**Optional**] Add alerts to Oracle's prometheus metrics.
7. In case of mainnet share your address and intention to join the Oracle set with public. You need to publish it on Twitter and also write a message with a twitter link under Onboarding post on [the Research forum](https://research.lido.fi/).
8. Propose your oracle's ethereum address to Lido Team to vote on your address being added to the Oracle Members.

## Intro

The Lido Oracle mechanism comprises three main components. The first component is the Oracle smart-contract suite, which receives update reports from the oracles and passes them on to the Lido contract to execute the necessary actions based on the reported changes. The second component is the off-chain oracle daemon, run by each oracle node and responsible for monitoring the protocol state and generating update reports. The third component is the network of computer nodes that run by oracle member, which collectively provide the necessary information to the Oracle smart contract to calculate the new state of the protocol.

Based on the update reports received from the oracles, the Lido smart contract performs state transitions such as updating user balances, processing withdrawal requests, and distributing rewards to node operators. Thus, the Lido Oracle mechanism acts as a synchronization device that bridges the protocol across the execution and consensus layers. It ensures that the protocol is updated in a timely and accurate manner and allows for smooth and efficient operation of the entire Lido system.

The two core contracts in the Lido Oracle suite are called AccountingOracle and ValidatorsExitBus. Together, these contracts collect information submitted by oracles about the state of validators and their balances, the amount of funds accumulated on protocol vaults, and the number of withdrawal requests the protocol is able to process. This information is then used for these crucial processes:

- rebasing user balances,
- distributing node operator rewards,
- processing withdrawal requests,
- decides which validators should initiate volunteer exit,
- distributing stake,
- putting the protocol into the bunker mode.

## Prerequisites

### Execution Client Node

To prepare the report, Oracle fetches up to 10 days old events, makes historical requests for balance data and makes simulated reports on historical blocks. This requires an [archive](https://ethereum.org/en/developers/docs/nodes-and-clients/#archive-node) execution node.
Oracle needs two weeks of archived data.

| Client                                          | Tested | Notes                                                                                                                                                                                 |
|-------------------------------------------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Geth](https://geth.ethereum.org/)              |        | `--gcmode=archive` <br/> `--syncmode=snap` <br/><br/>OR<br/><br/>`--gcmode=archive`<br/>`--syncmode=full`                                                                             |
| [Nethermind](https://nethermind.io/)            |        | Not tested yet                                                                                                                                                                        |
| [Besu](https://besu.hyperledger.org/en/stable/) |        | Use <br/>`--rpc-max-logs-range=100000` <br/> `--sync-mode=FULL` <br/> `--data-storage-format="FOREST"` <br/> `--pruning-enabled` <br/>`--pruning-blocks-retained=100000` <br/> params |
| [Erigon](https://github.com/ledgerwatch/erigon) |        | Use <br/> `--prune=htc` <br/> `--prune.h.before=100000` <br/> `--prune.t.before=100000` <br/> `--prune.c.before=100000` <br/> params                                                  |

### Consensus Client Node

To calculate some metrics for bunker mode Oracle needs [archive](https://ethereum.org/en/developers/docs/nodes-and-clients/#archive-node) consensus node.

| Client                                            | Tested | Notes                                                                                                                                               |
|---------------------------------------------------|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| [Lighthouse](https://lighthouse.sigmaprime.io/)   |        | Use `--reconstruct-historic-states` param                                                                                                           |
| [Lodestar](https://nethermind.io/)                |        | Not tested yet                                                                                                                                      |
| [Nimbus](https://besu.hyperledger.org/en/stable/) |        | Not tested yet                                                                                                                                      |
| [Prysm](https://github.com/ledgerwatch/erigon)    |        | Use <br/> `--grpc-max-msg-size=104857600` <br/> `--enable-historical-state-representation=true` <br/> `--slots-per-archive-point=1024` <br/> params |
| [Teku](https://docs.teku.consensys.net)           |        | Use <br/> `--data-storage-mode=archive` <br/>`--data-storage-archive-frequency=1024`<br/> `--reconstruct-historic-states=true`<br/> params          |

### Keys API Service

This is a separate service that uses Execution Client to fetch all lido keys. It stores the latest state of lido keys in database.

[Lido Keys API repository.](https://github.com/lidofinance/lido-keys-api)

## The oracle daemon

The Oracle daemon is a Python application that contains two modules:
- Accounting module
- Ejector module

The oracle source code is available at https://github.com/lidofinance/lido-oracle.

Modules fetch the reportable slot, and if this slot is finalized, calculate and send the report to AccountingOracle and ExitBusOracle smart contracts.

### Environment variables

The oracle daemon requires the following environment variables:

**Required**
- `EXECUTION_CLIENT_URI` - list of Execution Client uris separated with comma. The second and next uris will be used as fallback.
- `CONSENSUS_CLIENT_URI` - list of Consensus Client uris separated with comma. The second and next uris will be used as fallback.
- `KEYS_API_URI` - list of Key API client uris separated with comma. The second and next uris will be used as fallback.
- `LIDO_LOCATOR_ADDRESS` - Lido Locator smart contract address.

**Optional**

**One of:**
- `MEMBER_PRIV_KEY` - Private key of the Oracle member account.
- `MEMBER_PRIV_KEY_FILE` - A path to the file contained the private key of the Oracle member account.

Full list could be found [here](https://github.com/lidofinance/lido-oracle#env-variables).

### Lido Locator address

**Mainnet**  
**0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb**

**Goerli**  
**0x1eDf09b5023DC86737b59dE68a8130De878984f5**

### Running the daemon

Startup accounting module

```shell
docker run -d --name lido-oracle-accounting \
  --env "EXECUTION_CLIENT_URI=$EXECUTION_CLIENT_URI" \
  --env "CONSENSUS_CLIENT_URI=$CONSENSUS_CLIENT_URI" \
  --env "KEYS_API_URI=$KEYS_API_URI" \
  --env "LIDO_LOCATOR_ADDRESS=$LOCATOR_ADDRESS" \
  --env "MEMBER_PRIV_KEY=$MEMBER_PRIV_KEY" \
  lidofinance/oracle@<image-hash> accounting
```

Startup ejector module

```shell
docker run -d --name lido-oracle-ejector \
  --env "EXECUTION_CLIENT_URI=$EXECUTION_CLIENT_URI" \
  --env "CONSENSUS_CLIENT_URI=$CONSENSUS_CLIENT_URI" \
  --env "KEYS_API_URI=$KEYS_API_URI" \
  --env "LIDO_LOCATOR_ADDRESS=$LOCATOR_ADDRESS" \
  --env "MEMBER_PRIV_KEY=$MEMBER_PRIV_KEY" \
  lidofinance/oracle@<image-hash> ejector
```

**Latest image hash**  
https://docs.lido.fi/guides/tooling/#oracle

This will start the oracle in daemon mode. You can also run it in a one-off mode, for example if you’d prefer to trigger oracle execution as a `cron` job. In this case, set the `DAEMON` environment variable to 0.

### Metrics and Alerts

How to set up alerts and details about metrics could be found [here](https://github.com/lidofinance/lido-oracle#alerts).
