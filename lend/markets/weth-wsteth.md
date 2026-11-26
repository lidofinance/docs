---
title: WETH / wstETH market
sidebar_label: WETH / wstETH
description: Parameters of the Lido Lend WETH / wstETH market on Ethereum mainnet and who can change them.
---

# WETH / wstETH market

In this market, lenders supply WETH and borrowers borrow WETH against wstETH on Ethereum mainnet. This page lists the market's parameters and who can change each of them. The reasons behind the values are in the [WETH / wstETH market parameters](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/78) post on the Lido Research Forum.

:::info[Not activated]
The market contracts are deployed with the values on this page. The market is created when the Lend Operational Committee's activation motion is enacted. The motion also enables settlement and sets the market fee.
:::

## Market

| Parameter              | Value                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Market ID              | `0xe4af8961b4e5a779b85d8c461be1007e4b78a7933976e0a5f23121682020de29`                                                           |
| Loan token             | WETH [`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)   |
| Collateral token       | wstETH [`0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`](https://etherscan.io/address/0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0) |
| Liquidation LTV (LLTV) | 98%                                                                                                                            |
| Liquidation incentive  | 0.60%                                                                                                                          |
| Oracle                 | `WstEthRateOracle`: the stETH share rate, with 1 stETH counted as 1 ETH                                                        |
| Interest rate model    | `AdaptiveCurveIrm`, through `IrmRouter`                                                                                        |
| Settlement             | Enabled                                                                                                                        |

The tokens, the LLTV, the oracle address, the controller and the settlement setting cannot change after the market is created. The oracle is an upgradeable proxy: the Lido DAO can change its code by vote until the proxy is ossified. The contract addresses are on [Deployed contracts](../deployed-contracts#weth--wsteth-market).

## Parameters

"Motion" means a Lend Operational Committee Easy Track motion, which LDO holders can object to before it is enacted. "Steward" means the Lend Risk Steward Committee, which the activation motion appoints as the market's steward and which can only tighten a setting, at once. See [Committees](../committees).

### Interest rate and fee

| Parameter                          | Value                                                    | Who can change it                           |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| Target utilization                 | 90%                                                      | Motion, by applying a new rate-curve config |
| Rate at target, at market creation | 2.01% APR                                                | Applies once, when the market is created    |
| Rate at target, bounds             | 0.10% to 4.47% APR                                       | Motion, by applying a new rate-curve config |
| Maximum borrow rate                | 4.47% APR                                                | Motion, by applying a new rate-curve config |
| Curve steepness                    | 4×                                                       | Motion, by applying a new rate-curve config |
| Adjustment speed                   | 50 per year                                              | Motion, by applying a new rate-curve config |
| Market fee                         | 10% of the interest borrowers pay, to the Lido DAO Agent | Motion, up to 25%                           |

Moving the market to a different rate model takes a Lido DAO vote.

### Supply cap

| Parameter  | Value      | Who can change it |
| ---------- | ---------- | ----------------- |
| Supply cap | 5,000 WETH | Motion            |

### Collateral activation

| Parameter                             | Value                                                                                                            | Who can change it                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Activation delay                      | 2 hours at no recent inflow, up to 8 hours as the recent collateral inflow to the market approaches 1,000 wstETH | Motion; the steward can increase it        |
| Extra delay per suspect report        | 12 hours                                                                                                         | Motion                                     |
| Extra delay per guardian flag         | 12 hours; no effect while the quorum is 1, because one flag bans the account                                     | Motion                                     |
| Activation without guardian coverage  | After 48 hours                                                                                                   | Motion; the steward can increase it        |
| Minimum deposit                       | 1 wstETH                                                                                                         | Motion; the steward can increase it        |
| Minimum amount that starts activation | 10 wstETH                                                                                                        | Motion                                     |
| Lock on activating collateral         | None                                                                                                             | Motion; the steward can set or increase it |

The minimum amount that starts activation is also the minimum active collateral of a borrower: a position with less than 10 wstETH of active collateral cannot borrow, and a position with debt cannot withdraw collateral below it. To exit below it, repay the debt first.

### Settlement

| Parameter                     | Value                                                                                                     | Who can change it |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------- |
| Largest cut in one settlement | The largest of 1% of the debt, 10 WETH, and the debt that lowers the borrower's LTV by 1 percentage point | Motion            |
| Full close                    | A cut that would leave less than 10 wstETH of collateral can cover the whole debt                         | Motion            |

### Guardians

| Parameter         | Value                                                                                                                                                    | Who can change it                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Guardian          | Lend Risk Steward Committee Safe [`0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E`](https://etherscan.io/address/0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E) | Motion                                                                                      |
| Guardian delegate | [`0xB3779664CeE33Df484D7e610eD600fe1A2983651`](https://etherscan.io/address/0xB3779664CeE33Df484D7e610eD600fe1A2983651), held by the Lido Lend team      | The guardian Safe; a motion that replaces or removes the guardian also removes its delegate |
| Quorum            | 1 of 1                                                                                                                                                   | Motion                                                                                      |
| Suspect window    | 24 hours                                                                                                                                                 | Motion                                                                                      |
