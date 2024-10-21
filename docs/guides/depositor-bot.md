# Lido depositor bot

## Introduction

Depositor bot is a part of [Deposit Security Module](link to dsm)..

The Depositor Bot obtains signed deposit messages from Council Daemons. Once a sufficient number of messages is
collected to constitute a quorum, the bot proceeds to initiate a deposit into the designated staking module. This
deposit is executed using
the [depositBufferedEther](https://docs.lido.fi/contracts/deposit-security-module#depositbufferedether) function within
the [DepositSecurityModule](https://docs.lido.fi/contracts/deposit-security-module) smart contract.

## Requirements

### Hardware

- 1-core CPU
- 2GB RAM

### Nodes

- Ethereum EL node
- Onchain databus transport node (Gnosis node at the moment)

### Envs

Required variables are(mainnet):

| Variable                        | Default                                    | Description                                                                                                              |
|---------------------------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| WEB3_RPC_ENDPOINTS              | -                                          | List of rpc endpoints that will be used to send requests comma separated (`,`)                                           |
| WALLET_PRIVATE_KEY              | -                                          | Account private key                                                                                                      |
| CREATE_TRANSACTIONS             | false                                      | If true then tx will be send to blockchain                                                                               |
| LIDO_LOCATOR                    | 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb | Lido Locator address. Mainnet by default. Other networks could be found [here](https://docs.lido.fi/deployed-contracts/) |
| DEPOSIT_CONTRACT                | 0x00000000219ab540356cBB839Cbe05303d7705Fa | Ethereum deposit contract address                                                                                        |
| DEPOSIT_MODULES_WHITELIST       | 1                                          | List of staking module's ids in which the depositor bot will make deposits                                               |
| ---                             | ---	                                       | ---                                                                                                                      |
| MESSAGE_TRANSPORTS              | -                                          | Transports used in bot. Set: onchain_transport                                                                           |
| ONCHAIN_TRANSPORT_RPC_ENDPOINTS | -                                          | List of rpc endpoints that will be used for reading data bus contract, comma separated (`,`).                            |
| ONCHAIN_TRANSPORT_ADDRESS       | -                                          | Data bus contract address.                                                                                               |

Optional variables can be found [here](https://github.com/lidofinance/depositor-bot/blob/main/README.md).

## Running

### Source Code

1. Clone repository and install requirements:
    ```bash
    git clone git@github.com:lidofinance/depositor-bot.git
    cd depositor-bot
    ```
2. Install requirements
    ```bash
    poetry install
    ```
3. Run depositor bot
    ```bash
    poetry run python src/depositor.py
    ```
4. Verify in logs that depositor bot is performing validations, you should see logs of a kind:
    ```
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "execute", "lineno": 121, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1729511569, "msg": "Do deposit to module with id: 1."}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "_deposit_to_module", "lineno": 210, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1729511569, "msg": "Checks failed. Skip deposit."}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "_deposit_to_module", "lineno": 194, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1729511569, "msg": "Calculations deposit recommendations.", "value": false, "is_mellow": false}
    ```

If you are facing problems, check what environment variables depositor bot is using, find a log
line `"msg": "Bot env variables"`

### Docker

Docker image could be found [here](https://docs.lido.fi/guides/tooling#depositor-bot).

## Monitoring

Prometheus metrics will be available on endpoint `http://localhost:${PROMETHEUS_PORT}/metrics`.
