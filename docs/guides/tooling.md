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

- **Version**: 2.1.0
- **Docker image**: sha256:5011d052162c0944e3a2eeafc7ea59c7297cfc955b208f9d5db163d7a0d76c62, [lidofinance/lido-council-daemon@sha256-5011d052162c0944e3a2eeafc7ea59c7297cfc955b208f9d5db163d7a0d76c62](https://hub.docker.com/layers/lidofinance/lido-council-daemon/2.1.0/images/sha256-5011d052162c0944e3a2eeafc7ea59c7297cfc955b208f9d5db163d7a0d76c62)
- Commit hash: [lidofinance/lido-council-daemon@b94bd01](https://github.com/lidofinance/lido-council-daemon/commit/b94bd014615ec32ba5dac09f81665a629e47e243)
- **Last update date**: 1 March, 2024
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/2.1.0)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 1.0.1
- **Docker image**: sha256:1fa93bf79f68c624b144aa02f3af780f9a6236cbe2dc95a11208d3aa33ca11ad, [lidofinance/lido-keys-api@sha256-1fa93bf79f68c624b144aa02f3af780f9a6236cbe2dc95a11208d3aa33ca11ad](https://hub.docker.com/layers/lidofinance/lido-keys-api/1.0.1/images/sha256-1fa93bf79f68c624b144aa02f3af780f9a6236cbe2dc95a11208d3aa33ca11ad)
- **Commit hash**: [lidofinance/lido-keys-api@495ab7d](https://github.com/lidofinance/lido-keys-api/commit/495ab7d8c63b770e98f06b80a7c7e3bd8eb13a0c)
- **Last update date**: 5 February, 2024
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/1.0.1)
- [**Documentation**](/guides/kapi-guide)
