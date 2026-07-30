# Lido depositor bot

## Introduction

Depositor bot is a part of [Deposit Security Module](/contracts/deposit-security-module/).

The Depositor Bot obtains signed deposit messages from Council Daemons. Once a sufficient number of messages is
collected to constitute a quorum, the bot proceeds to initiate a deposit into the designated staking module. This
deposit is executed using
the [depositBufferedEther](/contracts/deposit-security-module/#depositbufferedether) function within
the [DepositSecurityModule](/contracts/deposit-security-module) smart contract.

Since v5.6.0 the bot also performs **top-ups**: adding ETH to already-active validators of `0x02` (compounding)
staking modules through the `TopUpGateway` contract. Top-ups do not require a guardian quorum — only the bot itself
can submit them — and they keep working while deposits are paused in the DSM. Top-ups are disabled by default
(`ENABLE_TOP_UP=false`) and must stay disabled until Node Operators have submitted consolidation requests.

The full per-iteration algorithm (module prioritisation, seed deposits vs. top-ups, validator selection) is described
in [depositor-algorithm.md](https://github.com/lidofinance/depositor-bot/blob/main/docs/depositor-algorithm.md) in the
bot repository.

## Requirements

### Hardware

- 1-core CPU
- 2GB RAM

With top-ups enabled the bot fetches and decodes the full beacon state (SSZ) to build validator proofs, which needs
noticeably more RAM and network bandwidth than the figures above — size the host against the current validator set.

### Nodes

- Ethereum EL RPC service
- Ethereum CL RPC service with the debug API available (`/eth/v2/debug/beacon/states`)
- [Lido Keys API](/guides/tooling/#keys-api) instance
- Onchain databus transport RPC service (Gnosis at the moment)

The CL node and the Keys API are only *used* by the top-up path, but the depositor bot verifies that the EL, CL and
Keys API endpoints are reachable and report the same chain id on start up. It therefore requires all of them even when
`ENABLE_TOP_UP=false`, and exits on start up if they are missing or unreachable.

## How to use

Depositor bot performs series of checks before accepting the deposit. One of the most important optimisations it is
doing is optimising gas spending. An example of this is fetching `GAS_FEE_PERCENTILE_DAYS_HISTORY_1` days of gas history
and checking `GAS_FEE_PERCENTILE_1` bot will send transactions only if current gas price is less or equals to the
percentile. Also `GAS_PRIORITY_FEE_PERCENTILE`, `MIN_PRIORITY_FEE`, `MAX_PRIORITY_FEE` variables are used to calculate
`maxFeePerGas` and `maxPriorityFeePerGas` transaction parameters. The formula is:

```
priority = min(max(
      GAS_PRIORITY_FEE_PERCENTILE reward percentile of fee history for the last block,
      MIN_PRIORITY_FEE,
    ),
    MAX_PRIORITY_FEE,
)

maxFeePerGas = baseFeePerGas * 2 + priority
maxPriorityFeePerGas = priority
```

### Envs

Required variables are(mainnet):

| Variable                          | Default                                    | Description                                                                                                              |
|-----------------------------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| WEB3_RPC_ENDPOINTS                | -                                          | List of EL rpc endpoints that will be used to send requests comma separated (`,`)                                        |
| WALLET_PRIVATE_KEY                | -                                          | Account private key                                                                                                      |
| CREATE_TRANSACTIONS               | false                                      | If true then tx will be send to blockchain                                                                               |
| LIDO_LOCATOR                      | 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb | Lido Locator address. Mainnet by default. Other networks can be found [here](/deployed-contracts/) |
| DEPOSIT_CONTRACT                  | 0x00000000219ab540356cBB839Cbe05303d7705Fa | Ethereum deposit contract address                                                                                        |
| DEPOSIT_MODULES_WHITELIST         | -                                          | Comma separated list of staking module's ids in which the depositor bot will make deposits and top-ups                    |
| ---                               | ---	                                       | ---                                                                                                                      |
| ENABLE_TOP_UP                     | false                                      | Enables top-ups of `0x02` modules. Keep disabled until Node Operators submit consolidation requests                       |
| CL_API_URLS                       | -                                          | Comma separated list of CL endpoints. Required even when `ENABLE_TOP_UP=false`                                             |
| KEYS_API_URL                      | -                                          | [Keys API](/guides/tooling/#keys-api) URL. Required even when `ENABLE_TOP_UP=false`                                       |
| MAX_VALIDATORS_PER_TOP_UP         | 32                                         | Maximum number of validators per top-up transaction (also capped onchain by the `TopUpGateway`)                           |
| ---                               | ---	                                       | ---                                                                                                                      |
| MESSAGE_TRANSPORTS                | -                                          | Transports used in bot. Set: onchain_transport                                                                           |
| ONCHAIN_TRANSPORT_RPC_ENDPOINTS   | -                                          | List of databus(Gnosis) rpc endpoints that will be used for reading data bus contract, comma separated (`,`).            |
| ONCHAIN_TRANSPORT_ADDRESS         | -                                          | Data bus contract address.                                                                                               |
| MIN_PRIORITY_FEE                  | 50 mwei                                    | Min priority fee that will be used in tx                                                                                 |
| MAX_PRIORITY_FEE                  | 10 gwei                                    | Max priority fee that will be used in tx                                                                                 |
| MAX_GAS_FEE                       | 100 gwei                                   | Bot will wait for a lower price. Threshold for gas_fee                                                                    |
| CONTRACT_GAS_LIMIT                | 15000000                                   | Default transaction gas limit                                                                                            |
| GAS_FEE_PERCENTILE_1              | 20                                         | Percentile for first recommended fee calculation                                                                         |
| GAS_FEE_PERCENTILE_DAYS_HISTORY_1 | 1                                          | Percentile for first recommended calculates from N days of the fee history                                               |
| GAS_PRIORITY_FEE_PERCENTILE       | 25                                         | Priority transaction will be N percentile from priority fees in last block (min MIN_PRIORITY_FEE - max MAX_PRIORITY_FEE) |

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
    poetry run python src/main.py depositor
    ```
4. Verify in logs that depositor bot is performing validations, you should see logs of a kind:
    ```
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "execute", "lineno": 210, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1753350000, "msg": "Depositor iteration start.", "block_number": 23000000}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "_execute_actual", "lineno": 245, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1753350000, "msg": "Depositable ether.", "value": 3200000000000000000000}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "_execute_actual", "lineno": 303, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1753350000, "msg": "Phase B start: full deposits to 0x01 + top-up to 0x02."}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "_deposit_to_module", "lineno": 490, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1753350000, "msg": "Gas price too high — skip deposit.", "module_id": 1}
    {"name": "bots.depositor", "levelname": "INFO", "funcName": "execute", "lineno": 215, "module": "depositor", "pathname": "/app/src/bots/depositor.py", "timestamp": 1753350000, "msg": "Depositor iteration finished.", "value": true}
    ```

If you are facing problems, check what environment variables depositor bot is using, find a log
line `"msg": "Bot env variables"`

### Docker

Docker image can be found [here](/guides/tooling/#depositor-bot).

## Monitoring

Prometheus metrics will be available on endpoint `http://localhost:${PROMETHEUS_PORT}/metrics`. The metrics list is
defined in [src/metrics/metrics.py](https://github.com/lidofinance/depositor-bot/blob/main/src/metrics/metrics.py).
Alerts [source code](https://github.com/lidofinance/depositor-bot/blob/main/alerts/alerts.yml) for AlertManager.
