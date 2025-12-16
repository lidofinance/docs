# Tooling Overview

Summary of tooling used in Lido V3: Oracle, Validator Ejector, Council Daemon, and Keys API.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 6.0.2
- **Docker image**: sha256:1b0501724c9c3e00dc6c03b663dfccc5af545a8bacc9543bbc5456d408d6f098, [lidofinance/oracle@sha256-1b0501724c9c3e00dc6c03b663dfccc5af545a8bacc9543bbc5456d408d6f098](https://hub.docker.com/layers/lidofinance/oracle/6.0.2/images/sha256-1b0501724c9c3e00dc6c03b663dfccc5af545a8bacc9543bbc5456d408d6f098)
- **Commit hash**: [lidofinance/lido-oracle@1070513](https://github.com/lidofinance/lido-oracle/commit/10705137a8be0c4b9f4fb52bfdb8ece12d77cb69)
- **Last update date**: 30 September, 2025
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/6.0.2)
- [**Documentation**](/guides/oracle-operator-manual)
- [**Audit Report for v6**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V6%20Audit%20Report.pdf)
- [**Audit Report for v6.0.2**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V6_0_2%20Audit%20Report.pdf)

## Oracle V7 (proposed)

- **Version**: 7.0.0
- **Docker image**: sha256:d131169b163831daeed94d88280d8a6ee4e3509dd4798c2acdc47e3dc1de7f60, [lidofinance/oracle@sha256-d131169b163831daeed94d88280d8a6ee4e3509dd4798c2acdc47e3dc1de7f60](https://hub.docker.com/layers/lidofinance/oracle/7.0.0/images/sha256-d131169b163831daeed94d88280d8a6ee4e3509dd4798c2acdc47e3dc1de7f60)
- **Commit hash**: [lidofinance/lido-oracle@b6e546b](https://github.com/lidofinance/lido-oracle/commit/b6e546bd38e73f23fa4e3edd9502e34ec5eb62ae)
- **Last update date**: 16 December 2025
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/7.0.0)
- [**Documentation**](/guides/oracle-operator-manual)
- [**Composable Security Audit Report**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)
- [**Certora Audit Report**](https://github.com/lidofinance/audits/blob/main/Certora%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 1.9.0
- **Docker image**: sha256:5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32, [lidofinance/validator-ejector@sha256-5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32](https://hub.docker.com/layers/lidofinance/validator-ejector/1.9.0/images/sha256-5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32)
- **Commit hash**: [lidofinance/validator-ejector@28ae303](https://github.com/lidofinance/validator-ejector/commit/28ae303c3306fa9808b3bcfb8ec6a8ab6af06d02)
- **Last update date**: 21 Aug, 2025
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.9.0#readme)
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
