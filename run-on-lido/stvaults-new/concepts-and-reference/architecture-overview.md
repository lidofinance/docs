---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Architecture Overview

## Basic stVaults Architecture

![Basic stVaults Architecture](/img/stvaults/tech-design/architecture_stv.jpg)

## stVaults + DeFi Wrapper Architecture

![stVaults + DeFi Wrapper Architecture](/img/stvaults/tech-design/architecture_stv_wrapper.jpg)

## Environments


### stVaults infrastructure addresses to be whitelisted
<Tabs>
<TabItem value="mainnet" label="Mainnet addresses" default>
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `VaultFactory` | [`0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A`](https://etherscan.io/address/0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A) | Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy. [Learn more](/contracts/staking-vault-factory/) |
| `VaultHub` | [`0x1d201BE093d847f6446530Efb0E8Fb426d176709`](https://etherscan.io/address/0x1d201BE093d847f6446530Efb0E8Fb426d176709) | Central registry and lifecycle manager for StakingVaults connected to the Lido protocol. Handles vault connection, minting/burning stETH against vault collateral, rebalancing, fee settlement, and bad debt management. [Learn more](/contracts/vault-hub/) |
| `PredepositGuarantee` | [`0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3`](https://etherscan.io/address/0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3) | PredepositGuarantee (PDG) mitigates deposit frontrunning by requiring a node operator guarantee and validator withdrawal credentials proofs (EIP-4788) before activating staged deposits.  [Learn more](/contracts/predeposit-guarantee/)|
| `LazyOracle` | [`0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c`](https://etherscan.io/address/0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c) | Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub. [Learn more](/contracts/lazy-oracle/) |
| `OperatorGrid` | [`0xC69685E89Cefc327b43B7234AC646451B27c544d`](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d) | Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults. [Learn more](/contracts/operator-grid/) |
</TabItem>
<TabItem value="hoodi-testnet" label="Hoodi Testnet addresses">
| Smart Contract | Address | Description |
| -------- | -------- | -------- |
| `VaultFactory` | [`0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E`](https://hoodi.etherscan.io/address/0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E) | Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy. [Learn more](/contracts/staking-vault-factory/) |
| `VaultHub` | [`0x4C9fFC325392090F789255b9948Ab1659b797964`](https://hoodi.etherscan.io/address/0x4C9fFC325392090F789255b9948Ab1659b797964) | Central registry and lifecycle manager for StakingVaults connected to the Lido protocol. Handles vault connection, minting/burning stETH against vault collateral, rebalancing, fee settlement, and bad debt management. [Learn more](/contracts/vault-hub/) |
| `PredepositGuarantee` | [`0xa5F55f3402beA2B14AE15Dae1b6811457D43581d`](https://hoodi.etherscan.io/address/0xa5F55f3402beA2B14AE15Dae1b6811457D43581d) | PredepositGuarantee (PDG) mitigates deposit frontrunning by requiring a node operator guarantee and validator withdrawal credentials proofs (EIP-4788) before activating staged deposits.  [Learn more](/contracts/predeposit-guarantee/)|
| `LazyOracle` | [`0xf41491C79C30e8f4862d3F4A5b790171adB8e04A`](https://hoodi.etherscan.io/address/0xf41491C79C30e8f4862d3F4A5b790171adB8e04A) | Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub. [Learn more](/contracts/lazy-oracle/) |
| `OperatorGrid` | [`0x501e678182bB5dF3f733281521D3f3D1aDe69917`](https://hoodi.etherscan.io/address/0x501e678182bB5dF3f733281521D3f3D1aDe69917) | Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults. [Learn more](/contracts/operator-grid/) |
</TabItem>
</Tabs>

#### Hoodi Testnet

- UI: https://stvaults-hoodi.testnet.fi/
- CLI: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration
- Contracts: [Hoodi Testnet](/deployed-contracts/hoodi)
- Etherscan: https://hoodi.etherscan.io/

#### Mainnet

- UI: https://stvaults.lido.fi/
- CLI: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration
- Contracts: [Mainnet](/deployed-contracts)
- Etherscan: https://etherscan.io/