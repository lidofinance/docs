# Late Prover Bot

## Introduction

Late Prover Bot monitors the beacon chain for validator exit requests that have passed their required deadline. When a validator fails to exit on time, the bot generates a cryptographic Merkle proof of the delay and submits it to the `ValidatorExitDelayVerifier` smart contract, enabling penalty enforcement on the responsible node operator.

## Requirements

### Hardware

- 1-core CPU
- 8GB RAM

### Nodes

- Ethereum EL RPC service
- Ethereum CL API service (Beacon Node)

## How to use

The bot runs as a daemon, continuously processing finalized beacon chain roots. For each root, it discovers `ValidatorsExitBusOracle` events in the corresponding EL block range, groups validators by their exit deadline slot, and generates proofs for any that have exceeded their deadline. Proofs are submitted in batches via `verifyValidatorExitDelay()` (or `verifyHistoricalValidatorExitDelay()` for older roots).

### Envs

Required variables are (mainnet):

| Variable | Default | Description |
|---|---|---|
| `CHAIN_ID` | - | Ethereum chain ID. `1` for mainnet, `17000` for Holesky |
| `EL_RPC_URLS` | - | Comma-separated list of EL RPC endpoints |
| `CL_API_URLS` | - | Comma-separated list of CL Beacon API endpoints |
| `LIDO_LOCATOR_ADDRESS` | - | Lido Locator contract address. Addresses for each network can be found [here](/deployed-contracts/) |
| `TX_SIGNER_PRIVATE_KEY` | - | Private key used to sign and submit transactions. Not required when `DRY_RUN=true` |
| --- | --- | --- |
| `DRY_RUN` | `false` | If `true`, proofs are generated but transactions are not sent |
| `DAEMON_SLEEP_INTERVAL_MS` | `300000` | Sleep interval between daemon cycles (ms) |
| `TX_GAS_LIMIT` | `2000000` | Hard gas limit for transactions. Increase if processing large batches |
| `VALIDATOR_BATCH_SIZE` | `50` | Maximum number of validators per transaction |
| `TX_MIN_GAS_PRIORITY_FEE` | `50000000` | Minimum priority fee (wei) |
| `TX_MAX_GAS_PRIORITY_FEE` | `10000000000` | Maximum priority fee (wei) |
| `TX_GAS_PRIORITY_FEE_PERCENTILE` | `25` | Priority fee percentile from the last block's fee history |
| `TX_GAS_FEE_HISTORY_DAYS` | `1` | Days of gas fee history used for base fee estimation |
| `TX_GAS_FEE_HISTORY_PERCENTILE` | `50` | Percentile for base fee estimation |
| `HTTP_PORT` | `8080` | Port for health check and Prometheus metrics endpoints |
| `LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `LOG_FORMAT` | `simple` | Log format: `simple` or `json` |

Optional variables can be found [here](https://github.com/lidofinance/late-prover-bot#readme).

## Running

### Source Code

1. Clone repository and install requirements:
    ```bash
    git clone git@github.com:lidofinance/late-prover-bot.git
    cd late-prover-bot
    ```
2. Install dependencies:
    ```bash
    yarn install
    yarn run typechain
    yarn build
    ```
3. Run the bot:
    ```bash
    yarn run start:prod
    ```

### Docker

Docker image can be found [here](/guides/tooling/#late-prover-bot).

## Monitoring

Prometheus metrics and health check are available on the same port:
- `http://localhost:${HTTP_PORT}/metrics`
- `http://localhost:${HTTP_PORT}/health`
