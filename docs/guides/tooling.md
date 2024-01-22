# Tooling Overview

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 3.0.0
- **Docker image**: sha256:d2ee5ecc78f8b991fcd2327e1d1bc84b8015aa7b8fde73e5ec0e702e6bec6c86, [lidofinance/oracle@sha256-d2ee5ecc78f8b991fcd2327e1d1bc84b8015aa7b8fde73e5ec0e702e6bec6c86](https://hub.docker.com/layers/lidofinance/oracle/3.0.0/images/sha256-d2ee5ecc78f8b991fcd2327e1d1bc84b8015aa7b8fde73e5ec0e702e6bec6c86?context=explore)
- **Commit hash**: [lidofinance/lido-oracle@4467895](https://github.com/lidofinance/lido-oracle/tree/44678954915b8291c949904c63de5e4e4983b427)
- **Last update date**: 17 May, 2023
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/3.0.0)
- [**Documentation**](/guides/oracle-operator-manual)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 1.2.0
- **Docker image**: sha256:e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a, [lidofinance/validator-ejector@sha256-e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a](https://hub.docker.com/layers/lidofinance/validator-ejector/1.2.0/images/sha256-e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a?context=explore)
- **Commit hash**: [lidofinance/validator-ejector@c2d05cb](https://github.com/lidofinance/validator-ejector/commit/c2d05cbfff039a8332f4ae5994fc1148b8cbf154)
- **Last update date**: 26 April, 2023
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.2.0#readme)
- [**Documentation**](/guides/validator-ejector-guide)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: 2.0.1
- **Docker image**: sha256:3a26a1e23f6bafbb0e0cc5a30d1a4440ad00e97e385babbf552bd1f9fe4dbd40, [lidofinance/lido-council-daemon@sha256-3a26a1e23f6bafbb0e0cc5a30d1a4440ad00e97e385babbf552bd1f9fe4dbd40](https://hub.docker.com/layers/lidofinance/lido-council-daemon/2.0.1/images/sha256-3a26a1e23f6bafbb0e0cc5a30d1a4440ad00e97e385babbf552bd1f9fe4dbd40?context=explore)
- Commit hash: [lidofinance/lido-council-daemon@fd04f3c](https://github.com/lidofinance/lido-council-daemon/commit/fd04f3c83ce48db333a187898e8b44d338543b8a)
- **Last update date**: 22 January, 2024
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/2.0.1)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 1.0.0
- **Docker image**: sha256:acab89209a6942ed48c1c5143584a1694e787b836e0142135727f4f88bae95b6, [lidofinance/lido-keys-api@sha256-acab89209a6942ed48c1c5143584a1694e787b836e0142135727f4f88bae95b6](https://hub.docker.com/layers/lidofinance/lido-keys-api/1.0.0/images/sha256-acab89209a6942ed48c1c5143584a1694e787b836e0142135727f4f88bae95b6?context=explore)
- **Commit hash**: [lidofinance/lido-keys-api@e34ba26](https://github.com/lidofinance/lido-keys-api/commit/e34ba2652db81eab60d16ba5dd6453e752de6c71)
- **Last update date**: 19 January, 2024
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/1.0.0)
- [**Documentation**](/guides/kapi-guide)
