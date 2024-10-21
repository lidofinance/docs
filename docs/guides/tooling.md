# Tooling Overview

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 4.0.1
- **Docker image**: sha256:94b63501658c8eaa540d7d3221510354f8284803a1016c0577204dc7fc599e37, [lidofinance/oracle@sha256-94b63501658c8eaa540d7d3221510354f8284803a1016c0577204dc7fc599e37](https://hub.docker.com/layers/lidofinance/oracle/4.0.1/images/sha256-94b63501658c8eaa540d7d3221510354f8284803a1016c0577204dc7fc599e37?context=explore)
- **Commit hash**: [lidofinance/lido-oracle@3cc1193](https://github.com/lidofinance/lido-oracle/tree/3cc1193df61068f32504c2913f1f3da8bd179362)
- **Last update date**: 10 Oct, 2024
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/4.0.1)
- [**Documentation**](/guides/oracle-operator-manual)
- [**Audit**](https://github.com/lidofinance/audits/blob/main/MixBytes%20Lido%20Oracle%20Security%20Audit%20Report%2010-24.pdf)

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

- **Version**: 3.2.0
- **Docker image**: sha256:b288d200895708e1d929d8ce256944351aa86f9449101f24f846ad7615c9a2c9, [lidofinance/lido-council-daemon@sha256-b288d200895708e1d929d8ce256944351aa86f9449101f24f846ad7615c9a2c9](https://hub.docker.com/layers/lidofinance/lido-council-daemon/3.2.0/images/sha256-b288d200895708e1d929d8ce256944351aa86f9449101f24f846ad7615c9a2c9?context=explore)
- Commit hash: [lidofinance/lido-council-daemon@0ac715d](https://github.com/lidofinance/lido-council-daemon/commit/0ac715d93755d07b93c1997cecdcf04d2c5bd539)
- **Last update date**: 10 October, 2024
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/3.2.0)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 2.2.0
- **Docker image**: sha256:90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae, [lidofinance/lido-keys-api@sha256-90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae](https://hub.docker.com/layers/lidofinance/lido-keys-api/2.2.0/images/sha256-90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae?context=explore)
- **Commit hash**: [lidofinance/lido-keys-api@b03e65b](https://github.com/lidofinance/lido-keys-api/commit/b03e65b18ff7bde3830554308b79fa9c234afa2d)
- **Last update date**: 10 October, 2024
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/2.2.0)
- [**Documentation**](/guides/kapi-guide)
