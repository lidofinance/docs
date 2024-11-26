# Tooling Overview

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 4.1.1
- **Docker image**: sha256:84f114555a32058c5f8e42946c3caa6c3aabf0d516b61e7e00462d622d24b6cc, [lidofinance/oracle@sha256-84f114555a32058c5f8e42946c3caa6c3aabf0d516b61e7e00462d622d24b6cc](https://hub.docker.com/layers/lidofinance/oracle/4.1.1/images/sha256-84f114555a32058c5f8e42946c3caa6c3aabf0d516b61e7e00462d622d24b6cc?context=explore)
- **Commit hash**: [lidofinance/lido-oracle@e363fe4](https://github.com/lidofinance/lido-oracle/tree/e363fe41fa771ebbc54bb33395222a5f5c8855ad)
- **Last update date**: 22 Nov, 2024 
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/4.1.1)
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

- **Version**: 3.3.0
- **Docker image**: sha256:35b6807baf1b509b48e7f0ef2f85542c259ed4e48a0a5d469dcc4b388fea680e, [lidofinance/lido-council-daemon@sha256-35b6807baf1b509b48e7f0ef2f85542c259ed4e48a0a5d469dcc4b388fea680e](https://hub.docker.com/layers/lidofinance/lido-council-daemon/3.3.0/images/sha256-35b6807baf1b509b48e7f0ef2f85542c259ed4e48a0a5d469dcc4b388fea680e?context=explore)
- Commit hash: [lidofinance/lido-council-daemon@0ac715d](https://github.com/lidofinance/lido-council-daemon/commit/77ecd8fbf74a06b2f92c6e6cdd344ef4ee6f33b8)
- **Last update date**: 31 October, 2024
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/3.3.0)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 2.2.0
- **Docker image**: sha256:90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae, [lidofinance/lido-keys-api@sha256-90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae](https://hub.docker.com/layers/lidofinance/lido-keys-api/2.2.0/images/sha256-90cedb5e0ec768eaa572a795fdf60df9739c78e9315a935f981c6408448155ae?context=explore)
- **Commit hash**: [lidofinance/lido-keys-api@b03e65b](https://github.com/lidofinance/lido-keys-api/commit/b03e65b18ff7bde3830554308b79fa9c234afa2d)
- **Last update date**: 10 October, 2024
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/2.2.0)
- [**Documentation**](/guides/kapi-guide)
