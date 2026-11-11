---
toc_max_heading_level: 3
title: Deployed contracts
description: Addresses of Lido Lend contracts on Ethereum mainnet and Hoodi testnet.
---

# Deployed contracts

This page lists the addresses of the Lido Lend contracts for integrators. The contracts are built from [`lidofinance/lend-markets`](https://github.com/lidofinance/lend-markets/tree/main). The contract sources under `src/` on `main` (commit `23416c4`) are the same as at the deploy commit `538a0ec`. The core comes from [`lidofinance/lend`](https://github.com/lidofinance/lend/tree/422d589f9d098124249b54b55306884165833207) and the interest-rate contracts from [`lidofinance/lend-irm`](https://github.com/lidofinance/lend-irm/tree/566d31f7dfdf83d07a6593f641f7474c263a7f89). To check a contract, compare its verified source on the block explorer with these commits. The [Audits](./audits) page lists the security reviews and how the deployed code is matched to the audited code.

Per-market contracts (controller, vault, Guardian registry) are proxies that `LidoLendMarketFactory` creates from the shared implementations listed under Protocol. They are listed on the page of each market.

## Mainnet

:::danger[Pending: Lido DAO vote]
As of 2026-11-11, the Lido Lend core, the Bundler3 stack and the Easy Track factories are deployed on Ethereum mainnet (chain ID `1`) and their source code is verified on Etherscan. Cyfrin verified the deployment of the core contracts, the adapters, `Bundler3` and `CircuitBreaker`, and MixBytes verified the Easy Track factories (see [Audits](./audits#deployment-verification)). The Lido DAO vote that registers the Easy Track factories is not enacted. Until enactment, treat every Lido Lend mainnet address on this page as proposed.
:::

### Protocol

| Contract | Address |
| --- | --- |
| `LidoLend` core (proxy) | [`0x026a770badc7126c7252Ef8d407E5b9C56147491`](https://etherscan.io/address/0x026a770badc7126c7252Ef8d407E5b9C56147491) <span className="lend-todo">proposed</span> |
| `LidoLend` core (implementation) | [`0xa40Bd2281F54A2D3845F9535b74D2abD946E1911`](https://etherscan.io/address/0xa40Bd2281F54A2D3845F9535b74D2abD946E1911) <span className="lend-todo">proposed</span> |
| `LidoLendOwner` | [`0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a`](https://etherscan.io/address/0x85378a1073E8f338e11A97E090E47e2F0FdD3D5a) <span className="lend-todo">proposed</span> |
| `IrmRouter` (proxy) | [`0x81B7cC9523B30429110282d90db2fa90ff443d91`](https://etherscan.io/address/0x81B7cC9523B30429110282d90db2fa90ff443d91) <span className="lend-todo">proposed</span> |
| `IrmRouter` (implementation) | [`0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868`](https://etherscan.io/address/0x683eA34c29658fb6cDeCc92Eb4B4e7f766979868) <span className="lend-todo">proposed</span> |
| `AdaptiveCurveIrm` | [`0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f`](https://etherscan.io/address/0xf6f1565F4fD3d29E6bDAb86764A50BCde381422f) <span className="lend-todo">proposed</span> |
| `IrmConfigFactory` | [`0xE7ce129Eb67970C4d71e1456ad50f84B43C35496`](https://etherscan.io/address/0xE7ce129Eb67970C4d71e1456ad50f84B43C35496) <span className="lend-todo">proposed</span> |
| `LidoLendMarketFactory` | [`0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7`](https://etherscan.io/address/0xBe1C1eaBda3eD8a93D3CE3246cf4EeF8111c76C7) <span className="lend-todo">proposed</span> |
| `RiskStewardDashboard` | [`0xC3C241bC213EF3ba16234A7c689999209cE515D7`](https://etherscan.io/address/0xC3C241bC213EF3ba16234A7c689999209cE515D7) <span className="lend-todo">proposed</span> |
| `GuardianSignals` (implementation) | [`0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f`](https://etherscan.io/address/0x66aFC8Bb3aB2f01127fDdEb05425bAD77923091f) <span className="lend-todo">proposed</span> |
| `LidoLendMarketController` (implementation) | [`0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8`](https://etherscan.io/address/0x69136Ab2be05194C0b2773f6E2Cb944bCeb1D6b8) <span className="lend-todo">proposed</span> |
| `LidoLendERC4626` (implementation) | [`0x8549736900BF3e643D7660E6DfDd09B0FBa2E286`](https://etherscan.io/address/0x8549736900BF3e643D7660E6DfDd09B0FBa2E286) <span className="lend-todo">proposed</span> |

### Bundler and adapters

Lido Lend deploys its own Bundler3 instance together with the adapters. It is not shared with another protocol. See [Bundler integration](./guides/bundler-integration).

| Contract | Address |
| --- | --- |
| `Bundler3` | [`0x0056b888E90a1b783311351B54B782dE5de61e87`](https://etherscan.io/address/0x0056b888E90a1b783311351B54B782dE5de61e87) <span className="lend-todo">proposed</span> |
| `EthereumGeneralAdapter1` | [`0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260`](https://etherscan.io/address/0x0C6151F0205A6Edf143b42C4f7B4E97a8f099260) <span className="lend-todo">proposed</span> |
| `LidoLendVaultAdapter` | [`0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A`](https://etherscan.io/address/0xb1A64663B5390Ecf1a582df7e19d0a6753d1B84A) <span className="lend-todo">proposed</span> |

### Circuit Breaker

| Contract | Address |
| --- | --- |
| `CircuitBreaker` | [`0xd0A81A130a303237d338A0b5835edcB011Ab3afd`](https://etherscan.io/address/0xd0A81A130a303237d338A0b5835edcB011Ab3afd) <span className="lend-todo">proposed</span> |

### Easy Track factories

The factories become usable after the Lido DAO vote registers them in Easy Track. `LidoLendActivateMarket` stores the `LidoLendPreseeder` address.

| Contract | Address |
| --- | --- |
| `EasyTrack` (existing Lido contract) | [`0xF0211b7660680B49De1A7E9f25C65660F0a13Fea`](https://etherscan.io/address/0xF0211b7660680B49De1A7E9f25C65660F0a13Fea) <span className="lend-todo">proposed</span> |
| `LidoLendPreseeder` | [`0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41`](https://etherscan.io/address/0x3F107d1fbCA49F425321Cb27f6Ef5CbB94a72c41) <span className="lend-todo">proposed</span> |
| `LidoLendActivateMarket` | [`0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6`](https://etherscan.io/address/0x17bb2A2B5983D29392A5d31D627D4C8B13383fe6) <span className="lend-todo">proposed</span> |
| `LidoLendCircuitBreakerActions` | [`0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8`](https://etherscan.io/address/0x4e89cc970F0DBAE2f8C38C083D5D345B4F9e76b8) <span className="lend-todo">proposed</span> |
| `LidoLendGuardianActions` | [`0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779`](https://etherscan.io/address/0x9fE41afb2114bF9430D7f9B1Fb65f0a4B9DeF779) <span className="lend-todo">proposed</span> |
| `LidoLendMarketManagerActions` | [`0x9D75EaE321976e85e472847AFD21246F1f87dC43`](https://etherscan.io/address/0x9D75EaE321976e85e472847AFD21246F1f87dC43) <span className="lend-todo">proposed</span> |
| `LidoLendRiskStewardActions` | [`0x7276CE5f92911216d41C7b0A9C3575DE873763E9`](https://etherscan.io/address/0x7276CE5f92911216d41C7b0A9C3575DE873763E9) <span className="lend-todo">proposed</span> |
| `LidoLendApplyIrmConfig` | [`0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668`](https://etherscan.io/address/0x5795E73C0c2007ceD7D65cE4FC21c0C09F14C668) <span className="lend-todo">proposed</span> |

### Committees and multisigs

The market activation motions appoint the market steward and register the Circuit Breaker pauser. Signing thresholds are from the [Lido Lend Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62).

| Role | Address | Signing threshold |
| --- | --- | --- |
| Lend Operational Committee Safe (Easy Track trusted caller) | [`0x4f29aA4c299e17176b48c41D67ee97aE673d29bC`](https://etherscan.io/address/0x4f29aA4c299e17176b48c41D67ee97aE673d29bC) <span className="lend-todo">proposed</span> | 5 of 7 (<span className="lend-todo">signers and threshold not set on-chain yet</span>) |
| Lend Risk Steward Committee Safe (market steward appointed by the activation motions) | [`0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E`](https://etherscan.io/address/0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E) <span className="lend-todo">proposed</span> | 3 of 7 (<span className="lend-todo">signers and threshold not set on-chain yet</span>) |
| Lend Emergency Brakes Committee Safe (Circuit Breaker pauser registered by the activation motions) | [`0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1`](https://etherscan.io/address/0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1) <span className="lend-todo">proposed</span> | 3 of 6 (<span className="lend-todo">signers and threshold not set on-chain yet</span>) |

See [Committees](./governance/committees) for the role of each committee.

### Lido DAO contracts and tokens

These existing Lido DAO contracts and tokens hold roles in the Lido Lend deployment or are used by it.

| Contract | Address |
| --- | --- |
| Aragon Agent | [`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c) |
| `EVMScriptExecutor` (Easy Track) | [`0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977`](https://etherscan.io/address/0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977) |
| `ResealManager` (Dual Governance) | [`0x7914b5a1539b97Bd0bbd155757F25FD79A522d24`](https://etherscan.io/address/0x7914b5a1539b97Bd0bbd155757F25FD79A522d24) |
| WETH | [`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) |
| wstETH | [`0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`](https://etherscan.io/address/0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0) |

## Hoodi testnet

The Hoodi deployment (chain ID `560048`) is a test run of the production deployment path. It uses the Hoodi Lido governance contracts: Aragon Agent, Easy Track `EVMScriptExecutor` and Dual Governance `ResealManager`. Addresses come from the deployment records in [`deployed/hoodi-testnet/`](https://github.com/lidofinance/lend-markets/tree/main/deployed/hoodi-testnet). Implementation addresses that appear only in the transaction records are shown in lowercase, as in those records.

### Protocol

| Contract | Address |
| --- | --- |
| `LidoLend` core (proxy) | [`0x78d3262E82A35d290507bCF9B4834735DdA6b854`](https://hoodi.etherscan.io/address/0x78d3262E82A35d290507bCF9B4834735DdA6b854) |
| `LidoLend` core (implementation) | [`0x82eb06ae9259e084ef0c2a8ce2e02a6c8c260d44`](https://hoodi.etherscan.io/address/0x82eb06ae9259e084ef0c2a8ce2e02a6c8c260d44) |
| `LidoLendOwner` | [`0x5B2BdE06288a5db7289C028Fd4C8C175B5E3985B`](https://hoodi.etherscan.io/address/0x5B2BdE06288a5db7289C028Fd4C8C175B5E3985B) |
| `IrmRouter` (proxy) | [`0x88b624325385B3db69Db73A65DAdbaa15DE4406d`](https://hoodi.etherscan.io/address/0x88b624325385B3db69Db73A65DAdbaa15DE4406d) |
| `IrmRouter` (implementation) | [`0xbcf75a605d09e3d31d1bce9f5fa3552c58271b28`](https://hoodi.etherscan.io/address/0xbcf75a605d09e3d31d1bce9f5fa3552c58271b28) |
| `AdaptiveCurveIrm` | [`0x781f04920A82504B5AE13E02678dFc696eCca892`](https://hoodi.etherscan.io/address/0x781f04920A82504B5AE13E02678dFc696eCca892) |
| `IrmConfigFactory` | [`0xcE80DA265F3b982a0B85192697c87df516c9555f`](https://hoodi.etherscan.io/address/0xcE80DA265F3b982a0B85192697c87df516c9555f) |
| `LidoLendMarketFactory` | [`0x1ba98E8Cb00dC00a00E41E10cc17692917aEe896`](https://hoodi.etherscan.io/address/0x1ba98E8Cb00dC00a00E41E10cc17692917aEe896) |
| `RiskStewardDashboard` | [`0xc249abf58AC31dDEB3C715d7B395119aeeF729d1`](https://hoodi.etherscan.io/address/0xc249abf58AC31dDEB3C715d7B395119aeeF729d1) |
| `GuardianSignals` (implementation) | [`0x57Fc097F8235Fd17343f66e1855AF2Ae96452553`](https://hoodi.etherscan.io/address/0x57Fc097F8235Fd17343f66e1855AF2Ae96452553) |
| `LidoLendMarketController` (implementation) | [`0x115c265127a60e32b8ebf235cae88289d4315156`](https://hoodi.etherscan.io/address/0x115c265127a60e32b8ebf235cae88289d4315156) |
| `LidoLendERC4626` (implementation) | [`0x236a99c185c7f1edb1ffb0efd2aad20050a20ed7`](https://hoodi.etherscan.io/address/0x236a99c185c7f1edb1ffb0efd2aad20050a20ed7) |

### Guardians

The Hoodi deployment has one Guardian registry, `shared`, with a quorum of `1`.

| Contract | Address |
| --- | --- |
| `GuardianSignals` registry `shared` (proxy) | [`0xF46eB3bf7783825B0ffb5f532C148A261Ec518a9`](https://hoodi.etherscan.io/address/0xF46eB3bf7783825B0ffb5f532C148A261Ec518a9) |
| Guardian | [`0xe9bFDBB915b734D10aA53B3838371F67a7704102`](https://hoodi.etherscan.io/address/0xe9bFDBB915b734D10aA53B3838371F67a7704102) |
| Guardian | [`0xA6b2dbCCE7895347A62b4409d29bA7ce29A74655`](https://hoodi.etherscan.io/address/0xA6b2dbCCE7895347A62b4409d29bA7ce29A74655) |

### Bundler and adapters

The Hoodi deployment does not include Bundler3 or its adapters. The `lend-markets` repository has no Bundler3 configuration or deployment record for `hoodi-testnet`.

### Circuit Breaker

| Contract | Address |
| --- | --- |
| `CircuitBreaker` | [`0x3d7f98a7aDa46DB97C100f09746bf3A0Ff4BE192`](https://hoodi.etherscan.io/address/0x3d7f98a7aDa46DB97C100f09746bf3A0Ff4BE192) |

### Easy Track factories

| Contract | Address |
| --- | --- |
| `EasyTrack` (existing Lido contract) | [`0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a`](https://hoodi.etherscan.io/address/0x284D91a7D47850d21A6DEaaC6E538AC7E5E6fc2a) |
| `LidoLendPreseeder` | [`0xBcbAD842Dbf0fBc47f062136E8FbA7932ab706C8`](https://hoodi.etherscan.io/address/0xBcbAD842Dbf0fBc47f062136E8FbA7932ab706C8) |
| `LidoLendActivateMarket` | [`0xC4F75E3Da78230Ff9235A2E5Cf6F1962C56A4C69`](https://hoodi.etherscan.io/address/0xC4F75E3Da78230Ff9235A2E5Cf6F1962C56A4C69) |
| `LidoLendCircuitBreakerActions` | [`0x812Ea1494d53d8D1ba479c4c1D88c9d680ea88C5`](https://hoodi.etherscan.io/address/0x812Ea1494d53d8D1ba479c4c1D88c9d680ea88C5) |
| `LidoLendGuardianActions` | [`0x8df659bC546c1FED3eB761b14922098c0AD3Ad5B`](https://hoodi.etherscan.io/address/0x8df659bC546c1FED3eB761b14922098c0AD3Ad5B) |
| `LidoLendMarketManagerActions` | [`0x915570870A6e9D141BF25ab155684e7fa2843356`](https://hoodi.etherscan.io/address/0x915570870A6e9D141BF25ab155684e7fa2843356) |
| `LidoLendRiskStewardActions` | [`0xeF584E7fBbE0fCe7463dC00c063462973e5cbDa4`](https://hoodi.etherscan.io/address/0xeF584E7fBbE0fCe7463dC00c063462973e5cbDa4) |
| `LidoLendApplyIrmConfig` | [`0xca22a45A392d201EaaE540Fb12cA360Db9d847B2`](https://hoodi.etherscan.io/address/0xca22a45A392d201EaaE540Fb12cA360Db9d847B2) |

### Committees and multisigs

These test multisigs are configured for the committee roles on Hoodi only. The market activation motions appoint the market steward and register the Circuit Breaker pauser.

| Role | Address |
| --- | --- |
| Lend Risk Steward Committee Safe (market steward appointed by the activation motions) | [`0xe65b86bB03Bd1B11BF39C6d87060c7A52236988D`](https://hoodi.etherscan.io/address/0xe65b86bB03Bd1B11BF39C6d87060c7A52236988D) |
| Circuit Breaker pauser committee Safe (registered by the activation motions) | [`0x8223d372898CA8f185F24b5EDA373FDaea16B1c6`](https://hoodi.etherscan.io/address/0x8223d372898CA8f185F24b5EDA373FDaea16B1c6) |
| Easy Track trusted caller Safe (Lend Operational Committee motions) | [`0x4D8448CF02B84b6D3555e3667b3Ad259C75d8102`](https://hoodi.etherscan.io/address/0x4D8448CF02B84b6D3555e3667b3Ad259C75d8102) |

### Lido DAO contracts

| Contract | Address |
| --- | --- |
| Aragon Agent | [`0x0534aA41907c9631fae990960bCC72d75fA7cfeD`](https://hoodi.etherscan.io/address/0x0534aA41907c9631fae990960bCC72d75fA7cfeD) |
| `EVMScriptExecutor` (Easy Track; `CircuitBreaker` admin) | [`0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E`](https://hoodi.etherscan.io/address/0x79a20FD0FA36453B2F45eAbab19bfef43575Ba9E) |
| `ResealManager` (Dual Governance) | [`0x05172CbCDb7307228F781436b327679e4DAE166B`](https://hoodi.etherscan.io/address/0x05172CbCDb7307228F781436b327679e4DAE166B) |
