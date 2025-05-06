# Hoodi: Lido V3 testnet instance :eyes:

:::info 🔬 **Experimental playground**
This page documents the **very first public testnet deployment of Lido V3 (stVaults)**. The contracts listed below exist *only* on this test network and can be redeployed without notice.

If you are looking for mainnet Lido V3 addresses – hang tight, they are not live yet.

---

**Tip →** Learn more about Lido V3 on **[v3.lido.fi](https://v3.lido.fi)** and share feedback on the Lido [research forum](https://research.lido.fi/t/lido-v3-ethereum-staking-infrastructure-for-a-diverse-product-line/9511).

:::

:::tip 📣 **Leave feedback** ← NEW
Tried this testnet? Lido contributors would love to hear from you!  
Take 30 s to drop your thoughts through **[this quick form](https://tally.so/r/3X9vYe)**.
:::

## 📚 Further reading

- 🏗️ [Technical design doc](https://hackmd.io/@lido/stVaults-design)
- 🔌 [stVaults integration guide](/guides/stvaults)
- 🛡️ [stVaults Predeposit Guarantee (PDG) guide](/guides/stvaults/pdg)
- ⚓ [stVaults deployment tag: **`v3.0.0-alpha`**](https://github.com/lidofinance/core/releases/tag/v3.0.0-alpha)

---

## 🏛️ Core protocol

- Lido Locator: [`0xbE861866E2Ca8f401e2b51b2cFb36A61B0Bf6840`](https://hoodi.etherscan.io/address/0xbE861866E2Ca8f401e2b51b2cFb36A61B0Bf6840) (proxy)
- Lido and stETH token: [`0x04d160820C0f2E2C693D9Eb26078189D10A1a3e1`](https://hoodi.etherscan.io/address/0x04d160820C0f2E2C693D9Eb26078189D10A1a3e1) (proxy)
- wstETH token: [`0xDFD55388020a8CEDADCe0B177DF5EF1E11553b43`](https://hoodi.etherscan.io/address/0xDFD55388020a8CEDADCe0B177DF5EF1E11553b43)
- EIP-712 helper for stETH: [`0x53520A0F043Bf005009588fcbb8Ef19bd0B98BC1`](https://hoodi.etherscan.io/address/0x53520A0F043Bf005009588fcbb8Ef19bd0B98BC1)
- Staking Router: [`0xf320D34b55E89826631C2bb1b3c5b50932cCaB3C`](https://hoodi.etherscan.io/address/0xf320D34b55E89826631C2bb1b3c5b50932cCaB3C) (proxy)
- Execution Layer Rewards Vault: [`0xA60b3AF9244D7AF1e844d714fDc0E3796CC4390d`](https://hoodi.etherscan.io/address/0xA60b3AF9244D7AF1e844d714fDc0E3796CC4390d)
- Withdrawal Queue (ERC‑721): [`0xe41d78740A1009029c44E43618Fe09C8f368851F`](https://hoodi.etherscan.io/address/0xe41d78740A1009029c44E43618Fe09C8f368851F) (proxy)
- Withdrawal Vault: [`0x79e52DbA27718B1b618FC519A8F05a1386F4A8d2`](https://hoodi.etherscan.io/address/0x79e52DbA27718B1b618FC519A8F05a1386F4A8d2) (proxy)
- Burner: [`0x87d699cBC410511216BC88E8c8523A8EFf41102b`](https://hoodi.etherscan.io/address/0x87d699cBC410511216BC88E8c8523A8EFf41102b)
- Min First Allocation Strategy: [`0x9b322efdB04840052f97649fD0C27B678De88DA2`](https://hoodi.etherscan.io/address/0x9b322efdB04840052f97649fD0C27B678De88DA2)
- Accounting: [`0x7d7EcCE45cAc6eF043f34e8049399b4b03044F97`](https://hoodi.etherscan.io/address/0x7d7EcCE45cAc6eF043f34e8049399b4b03044F97) (proxy)
- Vault Hub: [`0xDfA0B34F28b1b6735d2df150a99048139302a80E`](https://hoodi.etherscan.io/address/0xDfA0B34F28b1b6735d2df150a99048139302a80E) (proxy)
- Operator Grid: [`0xccb86588b776743CCCB6572D2a6eAFd466012191`](https://hoodi.etherscan.io/address/0xccb86588b776743CCCB6572D2a6eAFd466012191) (proxy)
- Predeposit Guarantee: [`0x4C003D5586B32359Df5f37B42A2E717E24817Ec2`](https://hoodi.etherscan.io/address/0x4C003D5586B32359Df5f37B42A2E717E24817Ec2) (proxy)

### 🔨 stVaults factory stack

- Staking Vault Factory: [`0xBf18618d1Ba07cCcA63d3D74f6a9056762Eac3cA`](https://hoodi.etherscan.io/address/0xBf18618d1Ba07cCcA63d3D74f6a9056762Eac3cA)
- Staking Vault Beacon: [`0xAF5bf52E784361f4eBBA86f2e918fFDd6A31453A`](https://hoodi.etherscan.io/address/0xAF5bf52E784361f4eBBA86f2e918fFDd6A31453A)
- Staking Vault Implementation: [`0x7ade83C09A0Aa0FEA45695840067438a9dC96361`](https://hoodi.etherscan.io/address/0x7ade83C09A0Aa0FEA45695840067438a9dC96361)
- Dashboard Implementation: [`0x5667f7477325F85C1b5E324387545C5045A57E2b`](https://hoodi.etherscan.io/address/0x5667f7477325F85C1b5E324387545C5045A57E2b)

## 🔮 Oracle contracts

- Accounting Oracle:
  - AccountingOracle: [`0xaBDf9686e4fbC7eEFff91621df82457dAb300168`](https://hoodi.etherscan.io/address/0xaBDf9686e4fbC7eEFff91621df82457dAb300168) (proxy)
  - Hash Consensus for Accounting Oracle: [`0x9F1c37DBCb2e01537786aEB2e6b4d6106dd81234`](https://hoodi.etherscan.io/address/0x9F1c37DBCb2e01537786aEB2e6b4d6106dd81234)
- Validators Exit Bus Oracle:
  - ValidatorsExitBusOracle: [`0xaf41922d0b9677e8CF21D72a318C72a5188dd9f1`](https://hoodi.etherscan.io/address/0xaf41922d0b9677e8CF21D72a318C72a5188dd9f1) (proxy)
  - Hash Consensus for Validators Exit Bus Oracle: [`0xF1BbbB0749736cC0c39eA1a1EDAA7fD36E2924d1`](https://hoodi.etherscan.io/address/0xF1BbbB0749736cC0c39eA1a1EDAA7fD36E2924d1)
- Oracle Report Sanity Checker: [`0x4077619FBAdB002fDC125171c8daf6a149C71166`](https://hoodi.etherscan.io/address/0x4077619FBAdB002fDC125171c8daf6a149C71166)
- Oracle Daemon Config: [`0x2c2e8fE09a2449aB93D9eAD68f987D33189E6168`](https://hoodi.etherscan.io/address/0x2c2e8fE09a2449aB93D9eAD68f987D33189E6168)

## 🗳️ DAO & Aragon apps

- Lido DAO (Kernel): [`0xf5591B4CA4De7f3e339248bbA35b0A02Ef9939c2`](https://hoodi.etherscan.io/address/0xf5591B4CA4De7f3e339248bbA35b0A02Ef9939c2) (proxy)
- LDO token: [`0x0E9Fa6947804c5573796aE211898f7a652e58d1f`](https://hoodi.etherscan.io/address/0x0E9Fa6947804c5573796aE211898f7a652e58d1f)
- Aragon Voting: [`0xd401Bf29751aE77cF5A479b22fbAaB30cD027dD6`](https://hoodi.etherscan.io/address/0xd401Bf29751aE77cF5A479b22fbAaB30cD027dD6) (proxy)
- Aragon Token Manager: [`0x32Ea1c8Df51BCAd93309DB159E54415951782992`](https://hoodi.etherscan.io/address/0x32Ea1c8Df51BCAd93309DB159E54415951782992) (proxy)
- Aragon Finance: [`0x973bD4e3F387F1BBF1576c5B12101450328F067f`](https://hoodi.etherscan.io/address/0x973bD4e3F387F1BBF1576c5B12101450328F067f) (proxy)
- Aragon Agent: [`0x2cE254Fd852d6B5023b1B2355ae96A8d752a47cf`](https://hoodi.etherscan.io/address/0x2cE254Fd852d6B5023b1B2355ae96A8d752a47cf) (proxy)
- Aragon ACL: [`0x428d6E1C384B743b1D6bed40b3a01F5357Ec24A9`](https://hoodi.etherscan.io/address/0x428d6E1C384B743b1D6bed40b3a01F5357Ec24A9) (proxy)

## 🧩 Staking modules

### Curated Module

- Node Operators Registry: [`0x94bd69Be2711205F4eBAA084c34cEf29E24A8E59`](https://hoodi.etherscan.io/address/0x94bd69Be2711205F4eBAA084c34cEf29E24A8E59) (proxy)

### Simple DVT Module

- Simple DVT: [`0x90106946d5525003385310D8e3e123cA6CFCf5Cd`](https://hoodi.etherscan.io/address/0x90106946d5525003385310D8e3e123cA6CFCf5Cd) (proxy)

## Easy Track

- EasyTrack: [`0x9A2029735Bd14C8b17fd03FE05D5F04F7AF797c2`](https://hoodi.etherscan.io/address/0x9A2029735Bd14C8b17fd03FE05D5F04F7AF797c2)
- EVMScriptExecutor: [`0x0b6de69562CADa4dBFdCA7e448fdc71D3542A590`](https://hoodi.etherscan.io/address/0x0b6de69562CADa4dBFdCA7e448fdc71D3542A590)

## ⛏️ Special accounts and addresses

<details>
<summary>Show/hide</summary>

| Contract | Address |
|---|---|
| Deposit Security Module (EOA stub) | [`0xfF772cd178D04F0B4b1EFB730c5F2B9683B31611`](https://hoodi.etherscan.io/address/0xfF772cd178D04F0B4b1EFB730c5F2B9683B31611) |
| Deployer (EOA) | [`0x26EDb7f0f223A25EE390aCCccb577F3a31edDfC5`](https://hoodi.etherscan.io/address/0x26EDb7f0f223A25EE390aCCccb577F3a31edDfC5) |

</details>

---

:::caution
🧪 Testnet use only
stETH obtained on this network **has no real ETH backing** and **cannot** be bridged, swapped or redeemed on mainnet. Please do *not* send mainnet tokens here – they will be lost forever.
:::
