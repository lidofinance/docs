# Tooling

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 3.0.0-rc.2
- **Docker image**: sha256:85b6f33784df5c1fd76b987f2dac5422539e5ec81a921f0e33f7c167f6e3501b, [lidofinance/oracle@sha256-85b6f33784df5c1fd76b987f2dac5422539e5ec81a921f0e33f7c167f6e3501b](https://hub.docker.com/layers/lidofinance/oracle/dev/images/sha256-85b6f33784df5c1fd76b987f2dac5422539e5ec81a921f0e33f7c167f6e3501b?context=explore)
- **Commit hash**: [lidofinance/lido-oracle@e50088b](https://github.com/lidofinance/lido-oracle/commit/e50088b0cc51d3ae8954f5651348fb1405bdf61f)
- **Last update date**: 2 May, 2023
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/3.0.0-rc.2#readme)
- [**Documentation**](https://docs.lido.fi/guides/node-operator-manual)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 1.2.0
- **Docker image**: sha256:e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a, [lidofinance/validator-ejector@sha256-e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a](https://hub.docker.com/layers/lidofinance/validator-ejector/1.2.0/images/sha256-e3acb5eb1bab5a871bf70e9bb736e1a1016567e1846a9b96c27232c84643597a?context=explore)
- **Commit hash**: [lidofinance/validator-ejector@c2d05cb](https://github.com/lidofinance/validator-ejector/commit/c2d05cbfff039a8332f4ae5994fc1148b8cbf154)
- **Last update date**: 26 April, 2023
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.2.0#readme)
- [**Documentation**](https://docs.lido.fi/guides/validator-ejector-guide)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: 1.8.2
- **Docker image**: sha256:db99dd3494301abd586a77692154a6eef62b6e07ef3e60e49a0e6f0f5495865a, [lidofinance/lido-keys-api@sha256-db99dd3494301abd586a77692154a6eef62b6e07ef3e60e49a0e6f0f5495865a](https://hub.docker.com/layers/lidofinance/lido-keys-api/0.8.0/images/sha256-db99dd3494301abd586a77692154a6eef62b6e07ef3e60e49a0e6f0f5495865a?context=explore)
- Commit hash: [lidofinance/lido-council-daemon@e10a1dc](https://github.com/lidofinance/lido-council-daemon/commit/e10a1dcce34b118e0e830efafa44198f4e865414)
- **Last update date**: 27 April, 2023
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/1.8.2)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 0.8.1
- **Docker image**: sha256:76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc, [lidofinance/lido-keys-api@sha256-76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc](https://hub.docker.com/layers/lidofinance/lido-keys-api/0.8.1/images/sha256-76f5a48f0baab46ada3bf4b09bdb115a74803a7ba53e783e505436d8177383dc?context=explore)
- **Commit hash**: [lidofinance/lido-keys-api@d0e4080](https://github.com/lidofinance/lido-keys-api/commit/d0e4080a8982dca4aed97aa8f7f76ab7411a665d)
- **Last update date**: 3 May, 2023
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/0.8.1#readme)
- [**Documentation**](/guides/kapi-guide)