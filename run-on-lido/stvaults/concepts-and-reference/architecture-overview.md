---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Architecture Overview

## Basic stVaults Architecture

![Basic stVaults Architecture](/img/stvaults/tech-design/architecture_stv.jpg)

## stVaults + DeFi Wrapper Architecture

![stVaults + DeFi Wrapper Architecture](/img/stvaults/tech-design/architecture_stv_wrapper.jpg)

## Environments

### Basic stVaults infrastructure addresses

<Tabs>
<TabItem value="mainnet" label="Mainnet addresses" default>
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `VaultFactory` | [`0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A`](https://etherscan.io/address/0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A) | Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy. [Learn more](/contracts/staking-vault-factory/) |
| `VaultHub` | [`0x1d201BE093d847f6446530Efb0E8Fb426d176709`](https://etherscan.io/address/0x1d201BE093d847f6446530Efb0E8Fb426d176709) | Central registry and lifecycle manager for StakingVaults connected to the Lido protocol. Handles vault connection, minting/burning stETH against vault collateral, rebalancing, fee settlement, and bad debt management. [Learn more](/contracts/vault-hub/) |
| `PredepositGuarantee` | [`0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3`](https://etherscan.io/address/0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3) | PredepositGuarantee (PDG) mitigates deposit frontrunning by requiring a node operator guarantee and validator withdrawal credentials proofs (EIP-4788) before activating staged deposits. [Learn more](/contracts/predeposit-guarantee/) |
| `LazyOracle` | [`0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c`](https://etherscan.io/address/0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c) | Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub. [Learn more](/contracts/lazy-oracle/) |
| `OperatorGrid` | [`0xC69685E89Cefc327b43B7234AC646451B27c544d`](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d) | Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults. [Learn more](/contracts/operator-grid/) |
 
</TabItem>
<TabItem value="hoodi-testnet" label="Hoodi Testnet addresses">
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `VaultFactory` | [`0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E`](https://hoodi.etherscan.io/address/0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E) | Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy. [Learn more](/contracts/staking-vault-factory/) |
| `VaultHub` | [`0x4C9fFC325392090F789255b9948Ab1659b797964`](https://hoodi.etherscan.io/address/0x4C9fFC325392090F789255b9948Ab1659b797964) | Central registry and lifecycle manager for StakingVaults connected to the Lido protocol. Handles vault connection, minting/burning stETH against vault collateral, rebalancing, fee settlement, and bad debt management. [Learn more](/contracts/vault-hub/) |
| `PredepositGuarantee` | [`0xa5F55f3402beA2B14AE15Dae1b6811457D43581d`](https://hoodi.etherscan.io/address/0xa5F55f3402beA2B14AE15Dae1b6811457D43581d) | PredepositGuarantee (PDG) mitigates deposit frontrunning by requiring a node operator guarantee and validator withdrawal credentials proofs (EIP-4788) before activating staged deposits. [Learn more](/contracts/predeposit-guarantee/) |
| `LazyOracle` | [`0xf41491C79C30e8f4862d3F4A5b790171adB8e04A`](https://hoodi.etherscan.io/address/0xf41491C79C30e8f4862d3F4A5b790171adB8e04A) | Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub. [Learn more](/contracts/lazy-oracle/) |
| `OperatorGrid` | [`0x501e678182bB5dF3f733281521D3f3D1aDe69917`](https://hoodi.etherscan.io/address/0x501e678182bB5dF3f733281521D3f3D1aDe69917) | Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults. [Learn more](/contracts/operator-grid/) |
 
</TabItem>
</Tabs>

### DeFi Wrapper infrastructure addresses
 
<Tabs>
<TabItem value="mainnet" label="Mainnet addresses" default>
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `DeFi Wrapper Factory` | [`0x3f221b8E5bC098cC6C23611BEeacaeCfD77e1587`](https://etherscan.io/address/0x3f221b8E5bC098cC6C23611BEeacaeCfD77e1587) | Factory for deploying all contracts required for the multi-user staking setup: DeFi Wrapper and stVault contracts. |
| `Lido EarnETH Strategy Factory` | [`0x8Fac09FD82F031D390B94622E2E4baBf16Fd2236`](https://etherscan.io/address/0x8Fac09FD82F031D390B94622E2E4baBf16Fd2236) | Factory for deploying smart contracts of the connector to the Lido EarnETH strategy for the DeFi Wrapper. |
 
</TabItem>
<TabItem value="hoodi-testnet" label="Hoodi Testnet addresses">
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `DeFi Wrapper Factory` | [`0xd05ebF24A340ece8B8FB53a170F1171DCd02b4d9`](https://hoodi.etherscan.io/address/0xd05ebF24A340ece8B8FB53a170F1171DCd02b4d9) | Factory for deploying all contracts required for the multi-user staking setup: DeFi Wrapper and stVault contracts. |
| `Lido EarnETH Strategy Factory` | [`0x0b860bfFDA72D214Dc8aC98bEcd8D1cd55307561`](https://hoodi.etherscan.io/address/0x0b860bfFDA72D214Dc8aC98bEcd8D1cd55307561) | Factory for deploying smart contracts of the connector to the Lido EarnETH strategy for the DeFi Wrapper. |
 
</TabItem>
</Tabs>

### Interfaces
 
| Interface | Mainnet | Hoodi Testnet |
| -------- | -------- | -------- |
| stVaults Web UI | [stvaults.lido.fi](https://stvaults.lido.fi/) | [stvaults-hoodi.testnet.fi](https://stvaults-hoodi.testnet.fi/) |
| Etherscan Web UI | [etherscan.io](http://etherscan.io/) | [hoodi.etherscan.io](https://hoodi.etherscan.io/) |
| stVault Command-Line Interface (CLI) | [Configuration guide](https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration) | [Configuration guide](https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration) |
 
### Source Code Repositories
 
| Repository | Link |
| -------- | -------- |
| stVaults (part of Lido Core) | [github.com/lidofinance/core](https://github.com/lidofinance/core/tree/master/contracts/0.8.25/vaults) |
| stVault CLI | [github.com/lidofinance/lido-staking-vault-cli](https://github.com/lidofinance/lido-staking-vault-cli) |
| stVaults Web UI | [github.com/lidofinance/staking-vault-widget](https://github.com/lidofinance/staking-vault-widget/) |
| stVaults API | [github.com/lidofinance/vaults-api](https://github.com/lidofinance/vaults-api) |
| stVaults DeFi Wrapper | [github.com/lidofinance/vaults-wrapper](https://github.com/lidofinance/vaults-wrapper/) |
| DeFi Wrapper UI Template | [github.com/lidofinance/defi-wrapper-widget](https://github.com/lidofinance/defi-wrapper-widget) |
