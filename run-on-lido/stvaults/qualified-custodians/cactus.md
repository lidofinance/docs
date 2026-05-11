---
sidebar_position: 3
---

# 🔐 Cactus Custody
## stVaults user flow for Cactus Custody customers

This guide explains how Cactus Custody clients can connect to the stVaults Web UI and interact with stVaults smart contracts using Cactus Link.

Cactus Link is a browser extension that works like one of the popular hot wallets.

## Connecting Cactus Link to the stVaults Web UI
### 1. In your browser:
Ensure that the [Cactus Link](https://chromewebstore.google.com/detail/cactus-link/chiilpgkfmcopocdffapngjcbggdehmj) browser extension is installed in [Chrome](https://www.google.com/chrome). Please confirm with your Administrator that the required permissions have been configured to connect your DeFi account to Cactus Link. For more details, refer to the [Cactus Link guide](https://manual.mycactus.com/defi/cactus-link).

Make sure that you've installed and configured the Cactus Link browser extension. To do so, please contact your administrator, or Cactus Custody Support team.

#### 1.1. Open browser extension UI:
<img alt="Cactus Link UI: Locked screen" src="/img/stvaults/custodians/cactus/cactus_0.png" width="300" />
<img alt="Cactus Link UI: Main screen" src="/img/stvaults/custodians/cactus/cactus_1.png" width="300" />

#### 1.2. Select network and address to connect:
<img alt="Cactus Link UI: Main screen" src="/img/stvaults/custodians/cactus/cactus_2.png" width="300" />
<img alt="Cactus Link UI: Selecting the network" src="/img/stvaults/custodians/cactus/cactus_3.png" width="300" />
<img alt="Cactus Link UI: Selecting the wallet" src="/img/stvaults/custodians/cactus/cactus_4.png" width="300" />

### 2. In the stVaults Web UI:
#### 2.1 Open stVaults Web UI and click "Connect wallet"
- Mainnet: https://stvaults.lido.fi/
- Hoodi testnet: https://stvaults-hoodi.testnet.fi/

<img alt="stVaults Web UI" src="/img/stvaults/custodians/cactus/cactus_5.png" />

#### 2.2. Click "Browser" button in the dialog window.
<img alt="stVaults Web UI: Connect wallet" src="/img/stvaults/custodians/cactus/cactus_6.png" />

#### 2.3. Connection established.
Your Cactus Link wallet address will now appear as connected, and you can create and manage stVaults.
<img alt="stVaults Web UI: Connection established" src="/img/stvaults/custodians/cactus/cactus_7.png" />

## Whitelisting smart contract addresses
To use the stVaults infrastructure, the stVaults smart contracts must be whitelisted for interaction. Please ask your administrator to add the required stVaults contract addresses to the whitelist.

You can find the addresses required for whitelisting in the [Custodians overview list](./index.md#whitelisting-smart-contract-addresses).

## Useful guides
- [Create a Basic stVault with optional liquidity](../building-guides/basic-stvault.md)
- [Health Monitoring Guide](../operational-and-management-guides/health-monitoring-guide.md)
- [Health Emergency Guide](../operational-and-management-guides/health-emergency-guide.md)
- [Voluntary Rebalancing and Vault Closure](../operational-and-management-guides/voluntary-rebalancing-and-vault-closure.md)