# Validator Exit Bot

## Introduction

Validator Exit Bot automates triggering exits for Lido validators that have missed their exit deadline. The bot monitors the [ValidatorExitBusOracle](/guides/oracle-spec/validator-exit-bus) for exit requests, checks the current status of each validator on the beacon chain, and uses [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) triggerable exits to force the exit of any validator that has not exited on time. Exit trigger fees are paid from the bot's account and refunded by the withdrawal vault.

## Requirements

### Hardware

- 1-core CPU
- 1GB RAM

### Nodes

- Ethereum EL RPC service
- Ethereum CL API service (Beacon Node)

## How to use

On startup the bot fetches historical `ExitDataProcessing` events from the `ValidatorExitBusOracle` for the configured lookback period. It then runs in a continuous loop: for each validator in its state, the bot checks whether the validator has already exited on the CL, and if not, whether it has missed its exit deadline. Validators past their deadline are included in a batched `trigger_exits` transaction. The bot's address is set as the refund recipient to recover the per-validator withdrawal request fee.

### Envs

Required variables are (mainnet):

| Variable | Default | Description |
|---|---|---|
| `WEB3_RPC_ENDPOINTS` | - | Comma-separated list of EL RPC endpoints |
| `CONSENSUS_CLIENT_URL` | - | CL Beacon API endpoint |
| `WALLET_PRIVATE_KEY` | - | Private key used to send transactions. Omit to run in dry mode (no transactions sent) |
| --- | --- | --- |
| `LIDO_LOCATOR` | `0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb` | Lido Locator address. Other networks can be found [here](/deployed-contracts/) |
| `MODULES_WHITELIST` | *(all)* | Comma-separated staking module IDs to process (e.g. `1` for Curated, `2` for Simple DVT) |
| `LOOKBACK_DAYS` | `7` | Days of historical events to process on first startup |
| `BLOCKS_BETWEEN_EXECUTION` | `25` | Minimum blocks to wait between bot cycles |
| `SLEEP_INTERVAL_SECONDS` | `60` | Sleep time between cycles (seconds) |
| `DRY_RUN` | `false` | If `true`, transactions are built but not submitted |
| `MIN_PRIORITY_FEE` | `50 mwei` | Minimum priority fee for transactions |
| `MAX_PRIORITY_FEE` | `1 gwei` | Maximum priority fee for transactions |
| `MAX_GAS_FEE` | `10 gwei` | Bot will wait for a lower gas price if the current fee exceeds this threshold |
| `CONTRACT_GAS_LIMIT` | `15000000` | Gas limit for contract calls |
| `GAS_PRIORITY_FEE_PERCENTILE` | `15` | Priority fee percentile from recent blocks |
| `PROMETHEUS_PORT` | `9000` | Port for Prometheus metrics |
| `SERVER_PORT` | `9010` | Port for health check server |
| `LOG_LEVEL` | `INFO` | Log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |

Optional variables can be found [here](https://github.com/lidofinance/validator-exit-bot#readme).

## Running

### Source Code

1. Clone repository and install requirements:
    ```bash
    git clone git@github.com:lidofinance/validator-exit-bot.git
    cd validator-exit-bot
    ```
2. Install requirements:
    ```bash
    poetry install
    ```
3. Run validator exit bot:
    ```bash
    poetry run python -m src.main
    ```

### Docker

Docker image can be found [here](/guides/tooling/#validator-exit-bot).

## Monitoring

Prometheus metrics will be available on endpoint `http://localhost:${PROMETHEUS_PORT}/metrics`.

Health check endpoint: `http://localhost:${SERVER_PORT}/health`.
