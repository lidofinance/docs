---
toc_max_heading_level: 2
title: Hoodi
description: Addresses of Lido Lend contracts on the Hoodi testnet.
---

# Hoodi

:::info **Lido Lend deployment on Hoodi**

This page lists the Lido Lend contract addresses on the Hoodi testnet.

- Network: Ethereum Hoodi (chain ID `560048`);
- Status: test deployment.
  :::

For existing Lido Protocol contract addresses shared with Lido Lend, see the [main Lido Protocol deployed contracts](/deployed-contracts/hoodi) page.

## Protocol

| Contract                                    | Address                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `LidoLend` core (proxy)                     | [`0x78d3262E82A35d290507bCF9B4834735DdA6b854`](https://hoodi.etherscan.io/address/0x78d3262E82A35d290507bCF9B4834735DdA6b854) |
| `LidoLend` core (implementation)            | [`0x82Eb06AE9259e084ef0c2a8Ce2E02a6C8c260d44`](https://hoodi.etherscan.io/address/0x82Eb06AE9259e084ef0c2a8Ce2E02a6C8c260d44) |
| `LidoLendOwner`                             | [`0x5B2BdE06288a5db7289C028Fd4C8C175B5E3985B`](https://hoodi.etherscan.io/address/0x5B2BdE06288a5db7289C028Fd4C8C175B5E3985B) |
| `IrmRouter` (proxy)                         | [`0x88b624325385B3db69Db73A65DAdbaa15DE4406d`](https://hoodi.etherscan.io/address/0x88b624325385B3db69Db73A65DAdbaa15DE4406d) |
| `IrmRouter` (implementation)                | [`0xBcf75a605d09e3D31d1BCe9f5Fa3552C58271B28`](https://hoodi.etherscan.io/address/0xBcf75a605d09e3D31d1BCe9f5Fa3552C58271B28) |
| `AdaptiveCurveIrm`                          | [`0x781f04920A82504B5AE13E02678dFc696eCca892`](https://hoodi.etherscan.io/address/0x781f04920A82504B5AE13E02678dFc696eCca892) |
| `IrmConfigFactory`                          | [`0xcE80DA265F3b982a0B85192697c87df516c9555f`](https://hoodi.etherscan.io/address/0xcE80DA265F3b982a0B85192697c87df516c9555f) |
| `LidoLendMarketFactory`                     | [`0x1ba98E8Cb00dC00a00E41E10cc17692917aEe896`](https://hoodi.etherscan.io/address/0x1ba98E8Cb00dC00a00E41E10cc17692917aEe896) |
| `RiskStewardDashboard`                      | [`0xc249abf58AC31dDEB3C715d7B395119aeeF729d1`](https://hoodi.etherscan.io/address/0xc249abf58AC31dDEB3C715d7B395119aeeF729d1) |
| `GuardianSignals` (implementation)          | [`0x57Fc097F8235Fd17343f66e1855AF2Ae96452553`](https://hoodi.etherscan.io/address/0x57Fc097F8235Fd17343f66e1855AF2Ae96452553) |
| `LidoLendMarketController` (implementation) | [`0x115C265127A60e32b8EBF235caE88289D4315156`](https://hoodi.etherscan.io/address/0x115C265127A60e32b8EBF235caE88289D4315156) |
| `LidoLendERC4626` (implementation)          | [`0x236a99c185C7F1edB1FfB0efD2AaD20050A20eD7`](https://hoodi.etherscan.io/address/0x236a99c185C7F1edB1FfB0efD2AaD20050A20eD7) |

## Guardians

The Hoodi deployment has one Guardian registry, `hoodi-shared`, with a quorum of `1`.

| Contract                                          | Address                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `GuardianSignals` registry `hoodi-shared` (proxy) | [`0xF46eB3bf7783825B0ffb5f532C148A261Ec518a9`](https://hoodi.etherscan.io/address/0xF46eB3bf7783825B0ffb5f532C148A261Ec518a9) |
| Guardian                                          | [`0xe9bFDBB915b734D10aA53B3838371F67a7704102`](https://hoodi.etherscan.io/address/0xe9bFDBB915b734D10aA53B3838371F67a7704102) |
| Guardian                                          | [`0xA6b2dbCCE7895347A62b4409d29bA7ce29A74655`](https://hoodi.etherscan.io/address/0xA6b2dbCCE7895347A62b4409d29bA7ce29A74655) |

## Bundler and adapters

| Contract                  | Address                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Bundler3`                | [`0x4bF26080218F3F6B369Def91754c85ef7bb48e41`](https://hoodi.etherscan.io/address/0x4bF26080218F3F6B369Def91754c85ef7bb48e41) |
| `EthereumGeneralAdapter1` | [`0xc38648Cb6488C444809354Fa3ce4f1B66F015C5B`](https://hoodi.etherscan.io/address/0xc38648Cb6488C444809354Fa3ce4f1B66F015C5B) |
| `LidoLendVaultAdapter`    | [`0x57b125DB2A901A1031D52a1C8Be8Eb9c2EC79a0C`](https://hoodi.etherscan.io/address/0x57b125DB2A901A1031D52a1C8Be8Eb9c2EC79a0C) |

## Circuit Breaker

| Contract         | Address                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CircuitBreaker` | [`0x3d7f98a7aDa46DB97C100f09746bf3A0Ff4BE192`](https://hoodi.etherscan.io/address/0x3d7f98a7aDa46DB97C100f09746bf3A0Ff4BE192) |

## Exit Books

:::info[Not used yet]
The Exit Books and their Easy Track factory `LidoLendExitBookActions` are deployed, but no Lido Lend market uses them yet.
:::

| Contract          | Address                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `MorphoExitBook`  | [`0xE626f019B04930fd0992A524FbE162695E99644D`](https://hoodi.etherscan.io/address/0xE626f019B04930fd0992A524FbE162695E99644D) |
| `Erc4626ExitBook` | [`0xc0DB4417ee3F4510fa60eabFEfC0227e5a1CF127`](https://hoodi.etherscan.io/address/0xc0DB4417ee3F4510fa60eabFEfC0227e5a1CF127) |

## Easy Track factories

| Contract                                 | Address                                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `LidoLendPreseeder`                      | [`0xBcbAD842Dbf0fBc47f062136E8FbA7932ab706C8`](https://hoodi.etherscan.io/address/0xBcbAD842Dbf0fBc47f062136E8FbA7932ab706C8) |
| `LidoLendActivateMarket`                 | [`0xC4F75E3Da78230Ff9235A2E5Cf6F1962C56A4C69`](https://hoodi.etherscan.io/address/0xC4F75E3Da78230Ff9235A2E5Cf6F1962C56A4C69) |
| `LidoLendCircuitBreakerActions`          | [`0x812Ea1494d53d8D1ba479c4c1D88c9d680ea88C5`](https://hoodi.etherscan.io/address/0x812Ea1494d53d8D1ba479c4c1D88c9d680ea88C5) |
| `LidoLendGuardianActions`                | [`0x8df659bC546c1FED3eB761b14922098c0AD3Ad5B`](https://hoodi.etherscan.io/address/0x8df659bC546c1FED3eB761b14922098c0AD3Ad5B) |
| `LidoLendMarketManagerActions`           | [`0x915570870A6e9D141BF25ab155684e7fa2843356`](https://hoodi.etherscan.io/address/0x915570870A6e9D141BF25ab155684e7fa2843356) |
| `LidoLendRiskStewardActions`             | [`0xeF584E7fBbE0fCe7463dC00c063462973e5cbDa4`](https://hoodi.etherscan.io/address/0xeF584E7fBbE0fCe7463dC00c063462973e5cbDa4) |
| `LidoLendApplyIrmConfig`                 | [`0xca22a45A392d201EaaE540Fb12cA360Db9d847B2`](https://hoodi.etherscan.io/address/0xca22a45A392d201EaaE540Fb12cA360Db9d847B2) |
| `LidoLendExitBookActions` (not used yet) | [`0xC520f27acEF637B4F07Cce4a2B18c643F27f4D14`](https://hoodi.etherscan.io/address/0xC520f27acEF637B4F07Cce4a2B18c643F27f4D14) |

## Committees and multisigs

These test multisigs are configured for the committee roles on Hoodi only. The market activation motions appoint the market steward and register the Circuit Breaker pauser.

| Role                                                                                  | Address                                                                                                                       |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lend Risk Steward Committee Safe (market steward appointed by the activation motions) | [`0xe65b86bB03Bd1B11BF39C6d87060c7A52236988D`](https://hoodi.etherscan.io/address/0xe65b86bB03Bd1B11BF39C6d87060c7A52236988D) |
| Circuit Breaker pauser committee Safe (registered by the activation motions)          | [`0x8223d372898CA8f185F24b5EDA373FDaea16B1c6`](https://hoodi.etherscan.io/address/0x8223d372898CA8f185F24b5EDA373FDaea16B1c6) |
| Easy Track trusted caller Safe (Lend Operational Committee motions)                   | [`0x4D8448CF02B84b6D3555e3667b3Ad259C75d8102`](https://hoodi.etherscan.io/address/0x4D8448CF02B84b6D3555e3667b3Ad259C75d8102) |
