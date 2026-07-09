# Off-chain Components Overview

Overview of core infrastructure components used in the Lido protocol.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 7.1.0
- **Docker image**: sha256:3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993, [lidofinance/oracle@sha256-3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993](https://hub.docker.com/layers/lidofinance/oracle/7.1.0/images/sha256-3dffe7e885a01961777d3cdebe1d8d0bdb988e90a14e44d18ae33b6ccb230993)
- **Commit hash**: [lidofinance/lido-oracle@b2e9296](https://github.com/lidofinance/lido-oracle/commit/b2e92969fd35b2a1838667a290ded649ca33fbf5)
- **Last update date**: 10 March 2026
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/7.1.0)
- [**Documentation**](/guides/oracle-operator-manual/)
- [**Audit Report for v7.0.0 (Certora)**](https://github.com/lidofinance/audits/blob/main/Certora%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)
- [**Audit Report for v7.0.0 (Composable Security)**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20V3%20Oracle%20V7%20Audit%20Report%20-%2012-2025.pdf)
- [**Audit Report for v7.1.0 (Composable Security)**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V7_1%20Audit%20Report.pdf)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 2.1.0
- **Docker image**: sha256:8953a4107d99ab84ff0f2b02cb7dd13b7cd7e5a565cf04fbe36e7911df5983dc, [lidofinance/validator-ejector@sha256-8953a4107d99ab84ff0f2b02cb7dd13b7cd7e5a565cf04fbe36e7911df5983dc](https://hub.docker.com/layers/lidofinance/validator-ejector/2.1.0/images/sha256-8953a4107d99ab84ff0f2b02cb7dd13b7cd7e5a565cf04fbe36e7911df5983dc)
- **Commit hash**: [lidofinance/validator-ejector@ec0992d](https://github.com/lidofinance/validator-ejector/commit/ec0992d9b4454425470b6608336755419ddb94ca)
- **Last update date**: 26 May, 2026
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/2.1.0#readme)
- [**Documentation**](/guides/validator-ejector-guide/)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: 4.0.4
- **Docker image**: sha256:8e419905599b55cf37dc51f667468e7a24c34e7b5bade17e7f08691e98dbdb02, [lidofinance/lido-council-daemon@sha256:8e419905599b55cf37dc51f667468e7a24c34e7b5bade17e7f08691e98dbdb0](https://hub.docker.com/layers/lidofinance/lido-council-daemon/4.0.4/images/sha256-8e419905599b55cf37dc51f667468e7a24c34e7b5bade17e7f08691e98dbdb02)
- Commit hash: [lidofinance/lido-council-daemon@b02577ff193ea8fa96f5c16025292d044ebd70f3](https://github.com/lidofinance/lido-council-daemon/commit/b02577ff193ea8fa96f5c16025292d044ebd70f3)
- **Last update date**: 7 July, 2026
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/4.0.4)
- [**Documentation**](/guides/deposit-security-manual/)

## Depositor Bot

Bot that submits deposit transactions to the Lido protocol once the Deposit Security Committee quorum is reached.

- **Version**: 5.5.1
- **Docker image**: sha256:bbacf8afbbb2be8b14efcfa0d03b4e8b01a0abe4ba87793d1684eeff5b4eb1a8, [lidofinance/depositor-bot@sha256-bbacf8afbbb2be8b14efcfa0d03b4e8b01a0abe4ba87793d1684eeff5b4eb1a8](https://hub.docker.com/layers/lidofinance/depositor-bot/5.5.1/images/sha256-bbacf8afbbb2be8b14efcfa0d03b4e8b01a0abe4ba87793d1684eeff5b4eb1a8)
- **Commit hash**: [lidofinance/depositor-bot@89fbbf8](https://github.com/lidofinance/depositor-bot/commit/89fbbf8deae2b93841f5b657b8865ff3d0c762d5)
- **Last update date**: 21 April, 2026
- [**Repository**](https://github.com/lidofinance/depositor-bot/tree/5.5.1)
- [**Documentation**](/guides/depositor-bot)

## Reward Distribution Bot

Bot that distributes node-operator rewards in the Curated and Simple DVT staking modules.

- **Version**: 1.1.0
- **Docker image**: sha256:610609ad79a31bd4973299f3744170199732ad8456a18dccd19a9a5b5798977e, [lidofinance/nor-reward-distribution-bot@sha256-610609ad79a31bd4973299f3744170199732ad8456a18dccd19a9a5b5798977e](https://hub.docker.com/layers/lidofinance/nor-reward-distribution-bot/1.1.0/images/sha256-610609ad79a31bd4973299f3744170199732ad8456a18dccd19a9a5b5798977e)
- **Commit hash**: [lidofinance/nor-reward-distribution-bot@1e37b0a](https://github.com/lidofinance/nor-reward-distribution-bot/commit/1e37b0abb72200cbfed6590704e0bdab3da789dc)
- **Last update date**: 21 April, 2026
- [**Repository**](https://github.com/lidofinance/nor-reward-distribution-bot/tree/1.1.0)
- [**Documentation**](/guides/reward-distributor-bot)

## Keys API

Lido keys HTTP API.

- **Version**: 4.0.1
- **Docker image**: sha256:7ea121b25b1b68f805cf2a7dd5094052be4a53c8dabdc7f3aa728c0318a90a1e, [lidofinance/lido-keys-api@sha256-7ea121b25b1b68f805cf2a7dd5094052be4a53c8dabdc7f3aa728c0318a90a1e](https://hub.docker.com/layers/lidofinance/lido-keys-api/4.0.1/images/sha256-7ea121b25b1b68f805cf2a7dd5094052be4a53c8dabdc7f3aa728c0318a90a1e)
- **Commit hash**: [lidofinance/lido-keys-api@f347ed5](https://github.com/lidofinance/lido-keys-api/commit/f347ed570c74a90456c6302a8f3e2168ae900675)
- **Last update date**: 8 July, 2026
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/4.0.1)
- [**Documentation**](/guides/kapi-guide/)
