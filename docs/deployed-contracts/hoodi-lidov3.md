# Hoodi: Lido V3 testnet instance :eyes:

:::info 🔬 **Experimental playground**
This page documents the **very first public testnet deployment of Lido V3 (stVaults)**. The contracts listed below exist *only* on this test network and can be redeployed without notice.

If you are looking for mainnet Lido V3 addresses – hang tight, they are not live yet.

**Tip →** Learn more about Lido V3 at **[v3.lido.fi](https://v3.lido.fi)** and share feedback on the Lido [research forum](https://research.lido.fi/t/lido-v3-ethereum-staking-infrastructure-for-a-diverse-product-line/9511).

:::

## 📚 Further reading

- 🏗️ [Technical design doc](https://hackmd.io/@lido/stVaults-design)
- 🔌 [Integration guide](https://docs.lido.fi/guides/stVaults-integration-guide)

---

## 🏛️ Core protocol

- **Lido (stETH) token**: [`0x04d160820C0f2E2C693D9Eb26078189D10A1a3e1`](https://hoodi.etherscan.io/address/0x04d160820C0f2E2C693D9Eb26078189D10A1a3e1)
- **wstETH token**: [`0xDFD55388020a8CEDADCe0B177DF5EF1E11553b43`](https://hoodi.etherscan.io/address/0xDFD55388020a8CEDADCe0B177DF5EF1E11553b43)
- **Staking Router**: [`0xf320D34b55E89826631C2bb1b3c5b50932cCaB3C`](https://hoodi.etherscan.io/address/0xf320D34b55E89826631C2bb1b3c5b50932cCaB3C) *(proxy)*
- **Vault Hub**: [`0xDfA0B34F28b1b6735d2df150a99048139302a80E`](https://hoodi.etherscan.io/address/0xDfA0B34F28b1b6735d2df150a99048139302a80E) *(proxy)*
- **Operator Grid**: [`0xccb86588b776743CCCB6572D2a6eAFd466012191`](https://hoodi.etherscan.io/address/0xccb86588b776743CCCB6572D2a6eAFd466012191) *(proxy)*
- **Pre‑deposit Guarantee**: [`0x4C003D5586B32359Df5f37B42A2E717E24817Ec2`](https://hoodi.etherscan.io/address/0x4C003D5586B32359Df5f37B42A2E717E24817Ec2) *(proxy)*

### 🔨 Vault factory stack

- **Staking Vault Factory**: [`0xBf18618d1Ba07cCcA63d3D74f6a9056762Eac3cA`](https://hoodi.etherscan.io/address/0xBf18618d1Ba07cCcA63d3D74f6a9056762Eac3cA)
- **Staking Vault Beacon**: [`0xAF5bf52E784361f4eBBA86f2e918fFDd6A31453A`](https://hoodi.etherscan.io/address/0xAF5bf52E784361f4eBBA86f2e918fFDd6A31453A)
- **Staking Vault Implementation**: [`0x7ade83C09A0Aa0FEA45695840067438a9dC96361`](https://hoodi.etherscan.io/address/0x7ade83C09A0Aa0FEA45695840067438a9dC96361)

### 💸 Withdrawals

- **Withdrawal Queue (ERC‑721)**: [`0xe41d78740A1009029c44E43618Fe09C8f368851F`](https://hoodi.etherscan.io/address/0xe41d78740A1009029c44E43618Fe09C8f368851F) *(proxy)*
- **Withdrawal Vault**: [`0x79e52DbA27718B1b618FC519A8F05a1386F4A8d2`](https://hoodi.etherscan.io/address/0x79e52DbA27718B1b618FC519A8F05a1386F4A8d2) *(proxy)*

---

## 🔮 Oracle contracts

- **Accounting Oracle**: [`0xaBDf9686e4fbC7eEFff91621df82457dAb300168`](https://hoodi.etherscan.io/address/0xaBDf9686e4fbC7eEFff91621df82457dAb300168) *(proxy)*
- **Validators Exit Bus Oracle**: [`0xaf41922d0b9677e8CF21D72a318C72a5188dd9f1`](https://hoodi.etherscan.io/address/0xaf41922d0b9677e8CF21D72a318C72a5188dd9f1) *(proxy)*
- **Oracle Report Sanity Checker**: [`0x4077619FBAdB002fDC125171c8daf6a149C71166`](https://hoodi.etherscan.io/address/0x4077619FBAdB002fDC125171c8daf6a149C71166)
- **Oracle Daemon Config**: [`0x2c2e8fE09a2449aB93D9eAD68f987D33189E6168`](https://hoodi.etherscan.io/address/0x2c2e8fE09a2449aB93D9eAD68f987D33189E6168)

---

## 🗳️ DAO & Aragon apps

- **Agent**: [`0x2cE254Fd852d6B5023b1B2355ae96A8d752a47cf`](https://hoodi.etherscan.io/address/0x2cE254Fd852d6B5023b1B2355ae96A8d752a47cf) *(proxy)*
- **Finance**: [`0x9C7d4c81BfdDc76F916bf724829029bFCCd1Aefb`](https://hoodi.etherscan.io/address/0x9C7d4c81BfdDc76F916bf724829029bFCCd1Aefb) *(implementation — for reference)*

---

### ⛏️ Special accounts and addresses

<details>
<summary>Show/hide</summary>

| Contract | Address |
|---|---|
| Accounting implementation | [`0xE633f4758B17c004656Bf33aac5ED9F14E713246`](https://hoodi.etherscan.io/address/0xE633f4758B17c004656Bf33aac5ED9F14E713246) |

</details>

---

:::caution 🧪 Testnet use only
stETH obtained on this network **has no real ETH backing** and **cannot** be bridged, swapped or redeemed on mainnet. Please do *not* send mainnet tokens here – they will be lost forever.
:::
