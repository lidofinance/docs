# Reward distribution bot

## Introduction

Permissionless reward distribution bot for Lido staking modules. Operates with smart contract based on the [Node Operator Registry](/contracts/node-operators-registry) smart contract. 
After the [Accounting Oracle](/guides/oracle-spec/accounting-oracle) completes the third phase, anyone can initiate reward distribution to allocate rewards among Node Operators in the Staking Module, unless the oracle sends the next frame report.

## Requirements

### Hardware

- 1-core CPU
- 2GB RAM

### Nodes

- Execution Node

## How to use

Every epoch daemon checks the staking modules provided in environment. If a module has a non-distributed rewards, the bot pulls the trigger and distributes rewards between Node Operators inside this module.

Basically bot is watching [RewardDistributionState](https://docs.lido.fi/contracts/node-operators-registry#getrewarddistributionstate) of module. 
If module has `ReadyForDistribution` state, bot triggers [distributeReward](https://docs.lido.fi/contracts/node-operators-registry#distributereward) method to distribute rewards.

### Envs

Required variables are:
- WEB3_RPC_ENDPOINTS - list of EL rpc endpoints separated by `,`. All except the first rpc will serve as fallback options.
- NODE_OPERATOR_REGISTRY_ADDRESSES - List of staking modules that can accept rewards distribution. All addresses could be found [here](https://docs.lido.fi/deployed-contracts/).
- WALLET_PRIVATE_KEY - Wallet private key that will send such transactions. Do not provide to run bot in DRY mode (do not send transaction).

Optional variables can be found [here](https://github.com/lidofinance/nor-reward-distribution-bot?tab=readme-ov-file#optional).

## Running

### Source Code

1. Clone repository and install requirements:

```bash
git clone git@github.com:lidofinance/nor-reward-distribution-bot.git
cd nor-reward-distribution-bot
```

2. Install requirements
```bash
poetry install
```

3. Run distributor bot
```bash
poetry run python src/main.py
```

### Docker

Docker image could be found [here](https://docs.lido.fi/guides/tooling#reward-distribution-bot).

## Monitoring

Prometheus metrics will be available on endpoint `http://localhost:${PROMETHEUS_PORT}/metrics`.

Alerts [source code](https://github.com/lidofinance/nor-reward-distribution-bot/blob/main/alerts/alerts.yml) for AlertManager.
