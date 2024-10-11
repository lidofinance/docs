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

- **Version**: 1.6.0
- **Docker image**: sha256:6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e, [lidofinance/validator-ejector@sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e](https://hub.docker.com/layers/lidofinance/validator-ejector/1.6.0/images/sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e)
- **Commit hash**: [lidofinance/validator-ejector@cae145c](https://github.com/lidofinance/validator-ejector/commit/cae145cde6e0c41726335dcbb761395fd54c26de)
- **Last update date**: 17 April, 2024
- [**Repository**](https://github.com/lidofinance/validator-ejector/tree/1.6.0#readme)
- [**Documentation**](/guides/validator-ejector-guide)

## Council daemon

The Lido Council Daemon monitors deposit contract keys.

- **Version**: 2.1.2
- **Docker image**: sha256:a8fe22fdb9d6c51422f12b99cdd920150d9039127758490294b6a60641aa5eeb, [lidofinance/lido-council-daemon@sha256-a8fe22fdb9d6c51422f12b99cdd920150d9039127758490294b6a60641aa5eeb](https://hub.docker.com/layers/lidofinance/lido-council-daemon/2.1.2/images/sha256-a8fe22fdb9d6c51422f12b99cdd920150d9039127758490294b6a60641aa5eeb)
- Commit hash: [lidofinance/lido-council-daemon@e675a48](https://github.com/lidofinance/lido-council-daemon/commit/e675a4856502b9f67e606f0c5f07d712288d5945)
- **Last update date**: 30 March, 2024
- [**Repository**](https://github.com/lidofinance/lido-council-daemon/tree/2.1.2)
- [**Documentation**](/guides/deposit-security-manual)

## Keys API

Lido keys HTTP API.

- **Version**: 1.0.2
- **Docker image**: sha256:1031ae9696c0cba41c32ca9496935be459a69ccbd18079631faa0413afd3ac4f, [lidofinance/lido-keys-api@sha256-1031ae9696c0cba41c32ca9496935be459a69ccbd18079631faa0413afd3ac4f](https://hub.docker.com/layers/lidofinance/lido-keys-api/1.0.2/images/sha256-1031ae9696c0cba41c32ca9496935be459a69ccbd18079631faa0413afd3ac4f)
- **Commit hash**: [lidofinance/lido-keys-api@33141b1](https://github.com/lidofinance/lido-keys-api/commit/33141b195563769151f3d1054acdf785d92db381)
- **Last update date**: 28 February, 2024
- [**Repository**](https://github.com/lidofinance/lido-keys-api/tree/1.0.2)
- [**Documentation**](/guides/kapi-guide)
