# Tooling Overview

Summary of tooling used in Lido V2: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 5.4.1
- **Docker image**: sha256:db0d00468df9840aa4084485314911a030c39c57da80656e92152883b2da6566, [lidofinance/oracle@sha256-db0d00468df9840aa4084485314911a030c39c57da80656e92152883b2da6566](https://hub.docker.com/layers/lidofinance/oracle/5.4.1/images/sha256-db0d00468df9840aa4084485314911a030c39c57da80656e92152883b2da6566)
- **Commit hash**: [lidofinance/lido-oracle@f17f089](https://github.com/lidofinance/lido-oracle/commit/f17f0898cd8c46eefba5da0ad3162dc2f4bcf439)
- **Last update date**: 20 Aug, 2025
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/5.4.1)
- [**Documentation**](/guides/oracle-operator-manual)
- [**Audit 1**](https://github.com/lidofinance/audits/blob/main/MixBytes%20Lido%20Oracle%20v5%2004-25.pdf)
- [**Audit 2**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20v5%2004-25.pdf)
- [**Audit 3**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V5_4_1%2008-25.pdf)

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

- **Version**: 2.2.1
- **Docker image**: sha256:f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9, [lidofinance/lido-keys-api@sha256-f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9](https://hub.docker.com/layers/lidofinance/lido-keys-api/2.2.1/images/sha256-f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9)
- **Commit hash**: [lidofinance/lido-keys-api@99d4d4d](https://github.com/lidofinance/lido-keys-api/commit/99d4d4d99878a192028bb391251976d7fce53ba8)
- **Last update date**: 1 April, 2025
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/2.2.1)
- [**Documentation**](/guides/kapi-guide)
