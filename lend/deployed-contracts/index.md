---
toc_max_heading_level: 2
title: Mainnet
description: Addresses of Lido Lend contracts on Ethereum mainnet.
---

# Mainnet

:::info **Lido Lend deployment on Ethereum mainnet**

This page lists the Lido Lend contract addresses.

- 🌐 Network: Ethereum Mainnet (Chain ID: `1`)
- ✅ Status: Deployed and maintained
- 🔍 How the deployed code matches the audited code: [Audits](../audits#deployment-verification)
  :::

For existing Lido Protocol contract addresses shared with Lido Lend, see the [main Lido Protocol deployed contracts](/deployed-contracts/) page.

## Protocol

| Contract                                    | Address                                                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `LidoLend` core (proxy)                     | [`0x026a770badc7126c7252Ef8d407E5b9C56147491`](https://etherscan.io/address/0x026a770badc7126c7252Ef8d407E5b9C56147491) |
| `LidoLend` core (implementation)            | [`0xa40Bd2281F54A2D3845F9535b74D2abD946E1911`](https://etherscan.io/address/0xa40Bd2281F54A2D3845F9535b74D2abD946E1911) |
| `LidoLendOwner`                             | [`0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a`](https://etherscan.io/address/0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a) |
| `IrmRouter` (proxy)                         | [`0x81B7cC9523B30429110282d90db2fa90ff443d91`](https://etherscan.io/address/0x81B7cC9523B30429110282d90db2fa90ff443d91) |
| `IrmRouter` (implementation)                | [`0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868`](https://etherscan.io/address/0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868) |
| `AdaptiveCurveIrm`                          | [`0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f`](https://etherscan.io/address/0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f) |
| `IrmConfigFactory`                          | [`0xE7ce129Eb67970C4d71e1456ad50f84B43C35496`](https://etherscan.io/address/0xE7ce129Eb67970C4d71e1456ad50f84B43C35496) |
| `LidoLendMarketFactory`                     | [`0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7`](https://etherscan.io/address/0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7) |
| `RiskStewardDashboard`                      | [`0xC3C241bC213EF3ba16234A7c689999209cE515D7`](https://etherscan.io/address/0xC3C241bC213EF3ba16234A7c689999209cE515D7) |
| `GuardianSignals` (implementation)          | [`0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f`](https://etherscan.io/address/0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f) |
| `LidoLendMarketController` (implementation) | [`0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8`](https://etherscan.io/address/0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8) |
| `LidoLendERC4626` (implementation)          | [`0x8549736900BF3e643D7660E6DfDd09B0FBa2E286`](https://etherscan.io/address/0x8549736900BF3e643D7660E6DfDd09B0FBa2E286) |

## Bundler and adapters

Lido Lend deploys its own instance of Morpho's [`Bundler3`](https://github.com/morpho-org/bundler3/tree/9afc2f4ea32c9dbeba2205a485731b8a98f7ae4c) (commit `9afc2f4`), together with its adapters from [`lend-markets`](https://github.com/lidofinance/lend-markets/tree/9c0ba34580ab5cff4354be8cb701419fb02b65d5/src/adapters). It is not shared with another protocol.

| Contract                  | Address                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Bundler3`                | [`0x0056b888E90a1b783311351B54B782dE5de61e87`](https://etherscan.io/address/0x0056b888E90a1b783311351B54B782dE5de61e87) |
| `EthereumGeneralAdapter1` | [`0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260`](https://etherscan.io/address/0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260) |
| `LidoLendVaultAdapter`    | [`0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A`](https://etherscan.io/address/0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A) |

## Circuit Breaker

| Contract         | Address                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CircuitBreaker` | [`0xd0A81A130a303237d338A0b5835edcB011Ab3afd`](https://etherscan.io/address/0xd0A81A130a303237d338A0b5835edcB011Ab3afd) |

## Exit Books

:::info[Not used yet]
The Exit Books and their Easy Track factory `LidoLendExitBookActions` are deployed, but no Lido Lend market uses them yet.
:::

| Contract          | Address                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `MorphoExitBook`  | [`0xAd28EFa8f2ef56a68b0Eb6836f4aE1d2D6459Ecd`](https://etherscan.io/address/0xAd28EFa8f2ef56a68b0Eb6836f4aE1d2D6459Ecd) |
| `Erc4626ExitBook` | [`0x0d2580e4c9b20507eDFAeFC7777d760F12Ad55D4`](https://etherscan.io/address/0x0d2580e4c9b20507eDFAeFC7777d760F12Ad55D4) |

## Easy Track factories

The factories, except `LidoLendExitBookActions`, are registered in Easy Track. `LidoLendActivateMarket` stores the `LidoLendPreseeder` address.

| Contract                                 | Address                                                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `LidoLendPreseeder`                      | [`0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41`](https://etherscan.io/address/0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41) |
| `LidoLendActivateMarket`                 | [`0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6`](https://etherscan.io/address/0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6) |
| `LidoLendCircuitBreakerActions`          | [`0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8`](https://etherscan.io/address/0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8) |
| `LidoLendGuardianActions`                | [`0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779`](https://etherscan.io/address/0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779) |
| `LidoLendMarketManagerActions`           | [`0x9D75EaE321976e85e472847AFD21246F1f87dC43`](https://etherscan.io/address/0x9D75EaE321976e85e472847AFD21246F1f87dC43) |
| `LidoLendRiskStewardActions`             | [`0x7276CE5f92911216d41C7b0A9C3575DE873763E9`](https://etherscan.io/address/0x7276CE5f92911216d41C7b0A9C3575DE873763E9) |
| `LidoLendApplyIrmConfig`                 | [`0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668`](https://etherscan.io/address/0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668) |
| `LidoLendExitBookActions` (not used yet) | [`0xA30b212c3657fa745feaE4b48B7Eb0A8F429C604`](https://etherscan.io/address/0xA30b212c3657fa745feaE4b48B7Eb0A8F429C604) |

## WETH / wstETH market

:::info[Not activated]
The market contracts are deployed. The market is created when the Lend Operational Committee's activation motion is enacted. Cyfrin verified the deployment of the market contracts (see [Audits](../audits#deployment-verification)). The market parameters are on the [WETH / wstETH market](../markets/weth-wsteth) page.
:::

| Contract                                    | Address                                                                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Market ID                                   | `0xe4af8961b4e5a779b85d8c461be1007e4b78a7933976e0a5f23121682020de29` \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\]                                                    |
| `LidoLendMarketController` (proxy)          | [`0xCF1B266d320CA9c0d4e13eF2C46465962F040e88`](https://etherscan.io/address/0xCF1B266d320CA9c0d4e13eF2C46465962F040e88) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |
| `LidoLendMarketController` (implementation) | [`0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8`](https://etherscan.io/address/0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8)                                                                                                |
| `LidoLendERC4626` (proxy)                   | [`0xd8765FA896be3D30A49B9a7d95453E34E2c7A056`](https://etherscan.io/address/0xd8765FA896be3D30A49B9a7d95453E34E2c7A056) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |
| `LidoLendERC4626` (implementation)          | [`0x8549736900BF3e643D7660E6DfDd09B0FBa2E286`](https://etherscan.io/address/0x8549736900BF3e643D7660E6DfDd09B0FBa2E286)                                                                                                |
| `GuardianSignals` (proxy)                   | [`0xc8a8CBBF4c55980F85332fD8470DF0fC52d690aC`](https://etherscan.io/address/0xc8a8CBBF4c55980F85332fD8470DF0fC52d690aC) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |
| `GuardianSignals` (implementation)          | [`0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f`](https://etherscan.io/address/0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f)                                                                                                |
| `WstEthRateOracle` (proxy)                  | [`0x20a078F9940dC05C46De4153D1bCbd54D2b5b151`](https://etherscan.io/address/0x20a078F9940dC05C46De4153D1bCbd54D2b5b151) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |
| `WstEthRateOracle` (implementation)         | [`0xEA67847D37069bF385983c6f58e59dD6011A59a0`](https://etherscan.io/address/0xEA67847D37069bF385983c6f58e59dD6011A59a0) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |
| `AdaptiveCurveConfig`                       | [`0x6076f89f5Cd68c526C73eA1F730d9ce8f05301a6`](https://etherscan.io/address/0x6076f89f5Cd68c526C73eA1F730d9ce8f05301a6) \[[proposed](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78)\] |

## Committees and multisigs

The market activation motions appoint the market steward and register the Circuit Breaker pauser. The owners and signing thresholds set on-chain follow the [Lido Lend Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62).

| Role                                                                                               | Address                                                                                                                 | Signing threshold |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Lend Operational Committee Safe (Easy Track trusted caller)                                        | [`0x4f29aA4c299e17176b48c41D67ee97aE673d29bC`](https://etherscan.io/address/0x4f29aA4c299e17176b48c41D67ee97aE673d29bC) | 5 of 7            |
| Lend Risk Steward Committee Safe (market steward appointed by the activation motions)              | [`0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E`](https://etherscan.io/address/0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E) | 3 of 7            |
| Lend Emergency Brakes Committee Safe (Circuit Breaker pauser registered by the activation motions) | [`0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1`](https://etherscan.io/address/0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1) | 3 of 6            |

See [Committees](../committees) for the role of each committee.

## External token

| Token | Address                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------- |
| WETH  | [`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) |
