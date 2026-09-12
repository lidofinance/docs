---
slug: /
---

# Introduction

## earnETH

earnETH provides on-chain access to strategies involving ETH-denominated digital assets. It uses defined asset selection and risk controls, supported by transparent reporting.

### How it works

earnETH consists of two subvaults. Each subvault specializes in its respective strategy, and combined, they aim to deliver sustainable, risk-adjusted rewards for earnETH users' assets. Mellow is appointed to provide curation services for subvaults — stRATEGY and GGV.

### How deposits work

The current interface supports ETH, WETH, wstETH, GG, strETH, and DVstETH deposits. A synchronous route mints earnETH in the deposit transaction when its queue and Oracle conditions are satisfied. An asynchronous route records a request whose shares must be claimed after processing. See the [integration guide](./integration-guide) for route discovery and verification.

### How withdrawals work

The current interface redeems earnETH into wstETH. It uses synchronous redemption when fresh pricing, liquid assets, and capacity are available; otherwise it creates an asynchronous request that must be claimed after processing. Completion time is not guaranteed.

### Curators

- Mellow - https://mellow.finance/

## earnUSD

earnUSD provides on-chain access to strategies involving USD-denominated digital assets. It uses defined asset selection and risk controls, supported by transparent reporting.

### How it works

Deposited tokens are allocated across yield-generating protocols through subvaults. Strategy performance, losses, and fees are reflected in the asset value of each earnUSD share, while the holder's active token quantity does not rebase. Currently there is one subvault, curated by Mellow.

### How deposits work

The current interface supports USDC and USDT deposits. A synchronous route mints earnUSD in the deposit transaction when its queue and Oracle conditions are satisfied. An asynchronous route records a request whose shares must be claimed after processing. See the [integration guide](./integration-guide) for route discovery and verification.

### How withdrawals work

The current interface redeems earnUSD into USDC. It uses synchronous redemption when fresh pricing, liquid assets, and capacity are available; otherwise it creates an asynchronous request that must be claimed after processing. Completion time is not guaranteed.

### Curators

- Mellow - https://mellow.finance/
