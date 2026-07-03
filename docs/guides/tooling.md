# Off-chain Components Overview

Overview of core infrastructure components used in the Lido protocol.

## Oracle

Oracle daemon for Lido decentralized staking service.

- **Version**: 8.0.1
- **Docker image**: sha256:2110bbd1de37b38ddb4be347b51e98868b144eb57c7e80c20b5a7f6270067c1d, [lidofinance/oracle@sha256-2110bbd1de37b38ddb4be347b51e98868b144eb57c7e80c20b5a7f6270067c1d](https://hub.docker.com/layers/lidofinance/oracle/8.0.1/images/sha256-2110bbd1de37b38ddb4be347b51e98868b144eb57c7e80c20b5a7f6270067c1d)
- **Commit hash**: [lidofinance/lido-oracle@0da5606](https://github.com/lidofinance/lido-oracle/commit/0da56064d7f1a24d951e3f0c35b56443fb245742)
- **Last update date**: 24 June, 2026
- [**Repository**](https://github.com/lidofinance/lido-oracle/tree/8.0.1)
- [**Documentation**](/guides/oracle-operator-manual/)
- [**Audit Report for v8.0.1 (Composable Security)**](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20Oracle%20V8%20Audit%20Report.pdf)

## Validator Ejector

Daemon service which loads LidoOracle events for validator exits and sends out exit messages when necessary.

- **Version**: 1.9.0
- **Docker image**: sha256:5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32, [lidofinance/validator-ejector@sha256-5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32](https://hub.docker.com/layers/lidofinance/validator-ejector/1.9.0/images/sha256-5346eb0c07557c567fed110c603a8cc35fe51ff1a7790922d03541c56b38da32)
- **Commit hash**: [lidofinance/validator-ejector@28ae303](https://github.com/lidofinance/validator-ejector/commit/28ae303c3306fa9808b3bcfb8ec6a8ab6af06d02)
- **Last update date**: 21 Aug, 2025
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.9.0#readme)
- [**Documentation**](/guides/validator-ejector-guide/)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: 3.7.0
- **Docker image**: sha256:f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed, [lidofinance/lido-council-daemon@sha256:f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed](https://hub.docker.com/layers/lidofinance/lido-council-daemon/3.7.0/images/sha256-f68b31ee6d02c40dfaf471683e27aec3e5b27f20cd58e6588a6d34cab4ca59ed)
- Commit hash: [lidofinance/lido-council-daemon@03f4325d](https://github.com/lidofinance/lido-council-daemon/commit/3f4325d6ecd95b54ab3db730878be2ff288e33bc)
- **Last update date**: 2 April, 2026
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/3.7.0)
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

- **Version**: 4.0.0
- **Docker image**: sha256:c7eab0cf4e21f4bceb86716e6de3c13f07ffe9df5becc3c7f7d72807c0227670, [lidofinance/lido-keys-api@sha256-c7eab0cf4e21f4bceb86716e6de3c13f07ffe9df5becc3c7f7d72807c0227670](https://hub.docker.com/layers/lidofinance/lido-keys-api/4.0.0/images/sha256-c7eab0cf4e21f4bceb86716e6de3c13f07ffe9df5becc3c7f7d72807c0227670)
- **Commit hash**: [lidofinance/lido-keys-api@4033629](https://github.com/lidofinance/lido-keys-api/commit/403362973bcf6b98aad0bfe29029a2e19be06081)
- **Last update date**: 19 June, 2026
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/4.0.0)
- [**Documentation**](/guides/kapi-guide/)

## Validator Exit Bot

Bot that automates triggering exits for Lido validators that have missed their exit deadline using [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) triggerable exits.

- **Version**: 1.0.1
- **Docker image**: sha256:0a649a5eff41a9c05ee82bc974ba4b40943ea2225c37568d52a9f3416f75f31c, [lidofinance/validator-exit-bot@sha256-0a649a5eff41a9c05ee82bc974ba4b40943ea2225c37568d52a9f3416f75f31c](https://hub.docker.com/layers/lidofinance/validator-exit-bot/1.0.1/images/sha256-0a649a5eff41a9c05ee82bc974ba4b40943ea2225c37568d52a9f3416f75f31c)
- **Commit hash**: [lidofinance/validator-exit-bot@edf5daf](https://github.com/lidofinance/validator-exit-bot/commit/edf5daf684f48f8a2b989e49dde0f2afc72565f8)
- **Last update date**: 9 February 2026
- [**Repository**](https://github.com/lidofinance/validator-exit-bot/tree/1.0.1)
- [**Documentation**](/guides/validator-exit-bot)

## Late Prover Bot

Bot that monitors the beacon chain for validators that missed their exit deadline and submits Merkle proofs of the delay to the `ValidatorExitDelayVerifier` contract.

- **Version**: 1.0.5
- **Docker image**: sha256:eb23b4fb757dcdc9d2c418941a2a29ce3513a3800d20e3fa162a594519b7f52c, [lidofinance/late-prover-bot@sha256-eb23b4fb757dcdc9d2c418941a2a29ce3513a3800d20e3fa162a594519b7f52c](https://hub.docker.com/layers/lidofinance/late-prover-bot/1.0.5/images/sha256-eb23b4fb757dcdc9d2c418941a2a29ce3513a3800d20e3fa162a594519b7f52c)
- **Commit hash**: [lidofinance/late-prover-bot@59d102a](https://github.com/lidofinance/late-prover-bot/commit/59d102a25c096e21c76798d0bdae7cae0ba65f56)
- **Last update date**: 28 April 2026
- [**Repository**](https://github.com/lidofinance/late-prover-bot/tree/1.0.5)
- [**Documentation**](/guides/late-prover-bot)
