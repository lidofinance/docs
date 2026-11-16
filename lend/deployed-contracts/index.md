---
toc_max_heading_level: 2
title: Mainnet
description: Addresses of Lido Lend contracts on Ethereum mainnet.
---

# Mainnet

This page lists the addresses of the Lido Lend contracts on Ethereum mainnet (chain ID `1`). The contracts are built from [`lidofinance/lend-markets`](https://github.com/lidofinance/lend-markets/tree/main). The contract sources under `src/` on `main` (commit `23416c4`) are the same as at the deploy commit `9c0ba34`. The core comes from [`lidofinance/lend`](https://github.com/lidofinance/lend/tree/422d589f9d098124249b54b55306884165833207) and the interest-rate contracts from [`lidofinance/lend-irm`](https://github.com/lidofinance/lend-irm/tree/566d31f7dfdf83d07a6593f641f7474c263a7f89). To check a contract, compare its verified source on the block explorer with these commits. The [Audits](../audits) page lists the security reviews and how the deployed code is matched to the audited code.

Per-market contracts (controller, vault, Guardian registry) are proxies that `LidoLendMarketFactory` creates from the shared implementations listed under Protocol. They will be listed on the page of each market.

:::danger[Pending: Lido DAO vote]
As of 2026-11-11, the Lido Lend core, the Bundler3 stack and the Easy Track factories are deployed on Ethereum mainnet (chain ID `1`) and their source code is verified on Etherscan. Cyfrin verified the deployment of the core contracts, the adapters, `Bundler3` and `CircuitBreaker`, and MixBytes verified the Easy Track factories (see [Audits](../audits#deployment-verification)). The Lido DAO vote that registers the Easy Track factories is not enacted. Until enactment, treat every Lido Lend mainnet address on this page as proposed.
:::

## Protocol

| Contract | Address |
| --- | --- |
| `LidoLend` core (proxy) | [`0x026a770badc7126c7252Ef8d407E5b9C56147491`](https://etherscan.io/address/0x026a770badc7126c7252Ef8d407E5b9C56147491) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLend` core (implementation) | [`0xa40Bd2281F54A2D3845F9535b74D2abD946E1911`](https://etherscan.io/address/0xa40Bd2281F54A2D3845F9535b74D2abD946E1911) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendOwner` | [`0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a`](https://etherscan.io/address/0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `IrmRouter` (proxy) | [`0x81B7cC9523B30429110282d90db2fa90ff443d91`](https://etherscan.io/address/0x81B7cC9523B30429110282d90db2fa90ff443d91) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `IrmRouter` (implementation) | [`0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868`](https://etherscan.io/address/0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `AdaptiveCurveIrm` | [`0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f`](https://etherscan.io/address/0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `IrmConfigFactory` | [`0xE7ce129Eb67970C4d71e1456ad50f84B43C35496`](https://etherscan.io/address/0xE7ce129Eb67970C4d71e1456ad50f84B43C35496) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendMarketFactory` | [`0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7`](https://etherscan.io/address/0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `RiskStewardDashboard` | [`0xC3C241bC213EF3ba16234A7c689999209cE515D7`](https://etherscan.io/address/0xC3C241bC213EF3ba16234A7c689999209cE515D7) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `GuardianSignals` (implementation) | [`0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f`](https://etherscan.io/address/0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendMarketController` (implementation) | [`0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8`](https://etherscan.io/address/0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendERC4626` (implementation) | [`0x8549736900BF3e643D7660E6DfDd09B0FBa2E286`](https://etherscan.io/address/0x8549736900BF3e643D7660E6DfDd09B0FBa2E286) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |

## Bundler and adapters

Lido Lend deploys its own Bundler3 instance together with the adapters. It is not shared with another protocol.

| Contract | Address |
| --- | --- |
| `Bundler3` | [`0x0056b888E90a1b783311351B54B782dE5de61e87`](https://etherscan.io/address/0x0056b888E90a1b783311351B54B782dE5de61e87) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `EthereumGeneralAdapter1` | [`0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260`](https://etherscan.io/address/0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendVaultAdapter` | [`0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A`](https://etherscan.io/address/0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |

## Circuit Breaker

| Contract | Address |
| --- | --- |
| `CircuitBreaker` | [`0xd0A81A130a303237d338A0b5835edcB011Ab3afd`](https://etherscan.io/address/0xd0A81A130a303237d338A0b5835edcB011Ab3afd) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |

## Easy Track factories

The factories become usable after the Lido DAO vote registers them in Easy Track. `LidoLendActivateMarket` stores the `LidoLendPreseeder` address.

| Contract | Address |
| --- | --- |
| `EasyTrack` (existing Lido contract) | [`0xF0211b7660680B49De1A7E9f25C65660F0a13Fea`](https://etherscan.io/address/0xF0211b7660680B49De1A7E9f25C65660F0a13Fea) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendPreseeder` | [`0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41`](https://etherscan.io/address/0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendActivateMarket` | [`0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6`](https://etherscan.io/address/0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendCircuitBreakerActions` | [`0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8`](https://etherscan.io/address/0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendGuardianActions` | [`0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779`](https://etherscan.io/address/0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendMarketManagerActions` | [`0x9D75EaE321976e85e472847AFD21246F1f87dC43`](https://etherscan.io/address/0x9D75EaE321976e85e472847AFD21246F1f87dC43) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendRiskStewardActions` | [`0x7276CE5f92911216d41C7b0A9C3575DE873763E9`](https://etherscan.io/address/0x7276CE5f92911216d41C7b0A9C3575DE873763E9) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |
| `LidoLendApplyIrmConfig` | [`0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668`](https://etherscan.io/address/0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] |

## Committees and multisigs

The market activation motions appoint the market steward and register the Circuit Breaker pauser. Signing thresholds are from the [Lido Lend Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62).

| Role | Address | Signing threshold |
| --- | --- | --- |
| Lend Operational Committee Safe (Easy Track trusted caller) | [`0x4f29aA4c299e17176b48c41D67ee97aE673d29bC`](https://etherscan.io/address/0x4f29aA4c299e17176b48c41D67ee97aE673d29bC) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] | 5 of 7 |
| Lend Risk Steward Committee Safe (market steward appointed by the activation motions) | [`0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E`](https://etherscan.io/address/0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] | 3 of 7 |
| Lend Emergency Brakes Committee Safe (Circuit Breaker pauser registered by the activation motions) | [`0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1`](https://etherscan.io/address/0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)\] | 3 of 6 |

See [Committees](../committees) for the role of each committee.

## Lido DAO contracts and tokens

These existing Lido DAO contracts and tokens hold roles in the Lido Lend deployment or are used by it.

| Contract | Address |
| --- | --- |
| Aragon Agent | [`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c) |
| `EVMScriptExecutor` (Easy Track) | [`0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977`](https://etherscan.io/address/0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977) |
| `ResealManager` (Dual Governance) | [`0x7914b5a1539b97Bd0bbd155757F25FD79A522d24`](https://etherscan.io/address/0x7914b5a1539b97Bd0bbd155757F25FD79A522d24) |
| WETH | [`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) |
| wstETH | [`0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`](https://etherscan.io/address/0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0) |
