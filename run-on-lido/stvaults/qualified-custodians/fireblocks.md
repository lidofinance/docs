---
sidebar_position: 1
---

# 🔐 Fireblocks
## stVaults user flow for Fireblocks customers

This guide explains how Fireblocks clients can connect to the stVaults Web UI and interact with stVaults smart contracts using institutional approval workflows.

## Connecting Fireblocks to the stVaults Web UI
### 1. In the stVaults Web UI:
#### 1.1 Open stVaults Web UI and click "Connect wallet"
- Mainnnet: https://stvaults.lido.fi/
- Hoodi testnet: https://stvaults-hoodi.testnet.fi/

<img alt="stVaults Web UI" src="/img/stvaults/custodians/fireblocks/fb_1.png" />

#### 1.2. Click "WalletConnect" button in the dialog window.
<img alt="stVaults Web UI: Connect wallet" src="/img/stvaults/custodians/fireblocks/fb_2.png" />

#### 1.3. You will see a QR code.
<img alt="stVaults Web UI: Connect wallet: QR Code" src="/img/stvaults/custodians/fireblocks/fb_3.png" />

### 2. In Fireblocks app on your phone:
#### 2.1. Navigate to the Web3 Wallet section, tap the “Scan” icon, and scan the QR code.
#### Choose a User to connect.
<img alt="Fireblocks UI: Choose a User to connect" src="/img/stvaults/custodians/fireblocks/fb_4.jpeg" width="300" />
<br />

#### 2.2. Choose an account to connect.
<img alt="Fireblocks UI: Choose an account to connect" src="/img/stvaults/custodians/fireblocks/fb_5.jpeg" width="300" />
<br />

#### 2.3. Configure preferences and tap "Connect".
<img alt="Fireblocks UI: Configure preferences and proceed" src="/img/stvaults/custodians/fireblocks/fb_6.jpeg" width="300" />
<br />

#### 2.4. Connection established.
<img alt="Fireblocks UI: Connection established" src="/img/stvaults/custodians/fireblocks/fb_7.jpeg" width="300" />

### 3. In the stVaults Web UI:
Your Fireblocks wallet address will now appear as connected, and you can create and manage stVaults.
 <img alt="stVaults Web UI: Fireblocks wallet is connected" src="/img/stvaults/custodians/fireblocks/fb_8.png" />

## Whitelisting smart contract addresses
To use the stVaults infrastructure, the stVaults smart contracts must be whitelisted for interaction. Please ask your administrator to add the required stVaults contract addresses to the whitelist.

You can find the addresses required for whitelisting in the [Custodians overview list](./index.md#whitelisting-smart-contract-addresses).

## Useful guides
- [Create a Basic stVault with optional liquidity](../building-guides/basic-stvault.md)
- [Health Monitoring Guide](../operational-and-management-guides/health-monitoring-guide.md)
- [Health Emergency Guide](../operational-and-management-guides/health-emergency-guide.md)
- [Voluntary Rebalancing and Vault Closure](../operational-and-management-guides/voluntary-rebalancing-and-vault-closure.md)