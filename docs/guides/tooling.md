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

- **Version**: 1.9.1
- **Docker image**: sha256:112d35cd784072b3b531521f80c148cbfea975a93a079fab1f8e8ce705f6f580, [lidofinance/lido-council-daemon@sha256-112d35cd784072b3b531521f80c148cbfea975a93a079fab1f8e8ce705f6f580](https://hub.docker.com/layers/lidofinance/lido-council-daemon/1.9.1/images/sha256-112d35cd784072b3b531521f80c148cbfea975a93a079fab1f8e8ce705f6f580?context=explore)
- Commit hash: [lidofinance/lido-council-daemon@94e11f0](https://github.com/lidofinance/lido-council-daemon/commit/94e11f031d49241e09471a05b8505ac712eb773f)
- **Last update date**: 24 June, 2023
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/1.9.1)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 0.8.1
- **Docker image**: sha256:76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc, [lidofinance/lido-keys-api@sha256-76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc](https://hub.docker.com/layers/lidofinance/lido-keys-api/0.8.1/images/sha256-76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc?context=explore)
- **Commit hash**: [lidofinance/lido-keys-api@d0e4080](https://github.com/lidofinance/lido-keys-api/commit/d0e4080a8982dca4aed97aa8f7f76ab7411a665d)
- **Last update date**: 3 May, 2023
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/0.8.1#readme)
- [**Documentation**](/guides/kapi-guide)
