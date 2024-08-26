# Tooling Overview

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: **TBD** 
- **Docker image**: **TBD** 
- **Commit hash**: **TBD** 
- **Last update date**: **TBD** 
- [**Repository**]( **TBD** )
- [**Documentation**](/guides/oracle-operator-manual)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 1.6.0
- **Docker image**: sha256:6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e, [lidofinance/validator-ejector@sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e](https://hub.docker.com/layers/lidofinance/validator-ejector/1.6.0/images/sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e)
- **Commit hash**: [lidofinance/validator-ejector@cae145c](https://github.com/lidofinance/validator-ejector/commit/cae145cde6e0c41726335dcbb761395fd54c26de)
- **Last update date**: 17 April, 2024
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.6.0#readme)
- [**Documentation**](/guides/validator-ejector-guide)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: **TBD** 
- **Docker image**: **TBD** 
- Commit hash: **TBD** 
- **Last update date**: **TBD** 
- [**Repository**](**TBD** )
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 1.5.0
- **Docker image**: **TBD** 
- **Commit hash**: **TBD** 
- **Last update date**: **TBD** 
- [**Repository**](**TBD** )
- [**Documentation**](/guides/kapi-guide)

## Reward Distribution Bot

Permissionless reward distribution bot for Lido staking modules.

- **Version**: 1.0.0
- **Docker image**: **TBD** 
- **Commit hash**: **TBD**
- **Last update date**: **TBD**
- [**Repository**](https://github.com/lidofinance/nor-reward-distribution-bot)
- [**Documentation**](/guides/reward-distributor-bot)
