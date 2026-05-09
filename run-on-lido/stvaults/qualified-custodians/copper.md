---
sidebar_position: 2
---

# 🔐 Copper
## stVaults user flow for Copper customers

This guide explains how Copper clients can connect to the stVaults Web UI and interact with stVaults smart contracts using CopperConnect.

CopperConnect is a browser extension that works like one of the popular hot wallets.

## Connecting CopperConnect to the stVaults Web UI
### 1. In your browser:
Make sure that you've installed and configured the CopperConnect browser extension.

#### 1.1. Open browser extension UI:
<img alt="CopperConnect UI: Login" src="/img/stvaults/custodians/copper/copper_0.png" width="300" />
<img alt="CopperConnect UI: Main screen" src="/img/stvaults/custodians/copper/copper_1.png" width="300" />

#### 1.2. Select Organization and Account to connect:
<img alt="CopperConnect UI: Organization" src="/img/stvaults/custodians/copper/copper_2.png" width="300" />
<img alt="CopperConnect UI: Account" src="/img/stvaults/custodians/copper/copper_3.png" width="300" />

### 2. In the stVaults Web UI:
#### 2.1 Open stVaults Web UI and click "Connect wallet"
- Mainnnet: https://stvaults.lido.fi/
- Hoodi testnet: https://stvaults-hoodi.testnet.fi/

<img alt="stVaults Web UI" src="/img/stvaults/custodians/copper/copper_4.png" />

#### 2.2. Click "Browser" button in the dialog window.
<img alt="stVaults Web UI: Connect wallet" src="/img/stvaults/custodians/copper/copper_5.png" />

#### 2.3. Connection established.
Your CopperConnect wallet address will now appear as connected, and you can create and manage stVaults.
<img alt="stVaults Web UI: Connection established" src="/img/stvaults/custodians/copper/copper_6.png" />

## Whitelisting smart contract addresses
To use the stVaults infrastructure, the stVaults smart contracts must be whitelisted for interaction. Please ask your administrator to add the required stVaults contract addresses to the whitelist.

You can find the addresses required for whitelisting in the [Custodians overview list](./index.md#whitelisting-smart-contract-addresses).

## Useful guides
- [Create a Basic stVault with optional liquidity](../building-guides/basic-stvault.md)
- [Health Monitoring Guide](../operational-and-management-guides/health-monitoring-guide.md)
- [Health Emergency Guide](../operational-and-management-guides/health-emergency-guide.md)
- [Voluntary Rebalancing and Vault Closure](../operational-and-management-guides/voluntary-rebalancing-and-vault-closure.md)