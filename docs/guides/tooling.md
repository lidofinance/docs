# Off-chain Components Overview

Overview of core infrastructure components used in the Lido protocol.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 7.1.0
- **Docker image**: sha256:3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993, [lidofinance/oracle@sha256-3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993](https://hub.docker.com/layers/lidofinance/oracle/7.1.0/images/sha256-3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993)
- **Commit hash**: [lidofinance/lido-oracle@b2e9296](https://github.com/lidofinance/lido-oracle/commit/b2e92969fd35b2a1838667a290ded649ca33fbf5)
- **Last update date**: 10 March 2026
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/7.1.0)
- [**Documentation**](/guides/oracle-operator-manual)
- [**Audit Report for v7.0.0 (Certora)**](https://github.com/lidofinance/audits/blob/main/Certora%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)
- [**Audit Report for v7.0.0 (Composable Security)**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)
- [**Audit Report for v7.1.0 (Composable Security)**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V7_1%20Audit%20Report.pdf)

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

- **Version**: 3.7.0
- **Docker image**: sha256:f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed, [lidofinance/lido-council-daemon@sha256:f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed](https://hub.docker.com/layers/lidofinance/lido-council-daemon/3.7.0/images/sha256-f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed)
- Commit hash: [lidofinance/lido-council-daemon@03f4325d](https://github.com/lidofinance/lido-council-daemon/commit/3f4325d6ecd95b54ab3db730878be2ff288e33bc)
- **Last update date**: 2 April, 2026
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/3.7.0)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 2.2.1
- **Docker image**: sha256:f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9, [lidofinance/lido-keys-api@sha256-f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9](https://hub.docker.com/layers/lidofinance/lido-keys-api/2.2.1/images/sha256-f8ce1d8828c99af22bba112ef23c0d235534a1436d8e4ba46f368c636f1c4bc9)
- **Commit hash**: [lidofinance/lido-keys-api@99d4d4d](https://github.com/lidofinance/lido-keys-api/commit/99d4d4d99878a192028bb391251976d7fce53ba8)
- **Last update date**: 1 April, 2025
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/2.2.1)
- [**Documentation**](/guides/kapi-guide)
