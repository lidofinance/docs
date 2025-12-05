---
sidebar_position: 6
---

# Health Emergency Guide

## TLDR

The stVault has two key parameters: **Reserve Ratio (RR)** and **Force Rebalance Threshold (FRT)**.

- **RR (e.g., 10%)** limits how much stETH can be minted from ETH in the stVault.
- **FRT (e.g., 9%)** triggers a forced rebalance if the stVault’s reserve drops too low.

When slashing events (or a low performance) reduce the stVault’s total value, its **reserve factor** can fall below RR and FRT, making it **unhealthy** and requiring corrective action.

There are **three ways to restore stVault Health**:

1. **Burn stETH** – Restores the reserve ratio without changing total value; keeps rewards unchanged but reduces external earnings.
2. **Add ETH** – Increases stVault value and future rewards; requires adding extra capital.
3. **Rebalance / Wait for Forced Rebalancing** – Moves ETH to Lido Core and writes off equivalent debt; least recommended, as it lowers stVault total value and reduces future rewards.

## Definitions

- **Reserve Ratio (RR)** limits minting - this means that user will be able to mint up to 90% of stETH out of ETH he put into the stVault. However falling below RR doesn’t force an immediate correction.
- **Force Rebalance Threshold (FRT)** - defines when force rebalancing *allowed to* happen. A rebalancing may happen to improve stVault’s health and prevent stVault’s insolvency. It is always lower then RR: FRT < RR (e.g. 9% if RR = 10%).
- **Health Factor (HF)** - is a metric calculated using following formula: Health Factor = TotalValue * (1 - FRT) / Minted stETH
    
    We have following levels of HF in stVaults Web UI:
    
    - HF ≥ 125% - Healthy stVault
    - 125% > HF ≥ 105% - Healthy stVault, and moderate risk of rebalancing
    - 105% > HF ≥ 100% - Healthy stVault, but too close to Unhealthy stVault, critical risk of rebalancing
    - 100% > HF - Unhealthy stVault

- **Utilization Ratio (UR)** - is a metric which shows how much stETH is minted out of Total Mintable stETH capacity: Utilization Ratio = (stETH Liability / Total stETH Minting Capacity) * 100%

## Explanatory scenario:

### stVault

- RR = 10%
- FRT = 9%
- Owner deposits 100 ETH → mints 90 stETH (up to max mintable)
- Utilization ratio = 90 / 90 = 100%
- Health factor = 100 * (100% - 9%) / 90 = 101.11%

<img src="/img/stvaults/health/101_11.png" width="600px" align="center" />

### Step 1: Slashing

Validator gets **slashed by 1 ETH**  → total backing = 99 ETH:
- Total Value = 99 ETH
- Reserve: 99 - 90 = 9 ETH
- Reserve factor is 9 / 99 = 9.09% → below 10% RR but above 9% FRT.
- Utilization ratio = 90 / (99 * 0.9) = 101%
- Health factor = 99 * (100% - 9%) / 90 = 100.1%

<img src="/img/stvaults/health/100_1.png" width="600px" align="center" />


**The stVault is still healthy, but is really close to rebalancing** (Reserve factor is below RR), however nothing happens (yet): user can’t mint more stETH, but the forced rebalancing will not happen if the ratio stop decreasing.

### Step 2: More slashing
Validator **slashing continues by additional 0.5 ETH** → total backing = 98.5 ETH:
- Total Value = 98.5 ETH
- Reserve: 98.5 - 90 = 8.5 ETH
- Reserve factor is 8.5 / 98.5 = 8.63% → **below 10% RR** and **below 9% FRT**
- Utilization ratio = 90 / (98.5 * 0.9) = 101.5%
- Health factor = 98.5 * (100% - 9%) / 90 = 99.6%

<img src="/img/stvaults/health/99_6.png" width="600px" align="center" />

### Step 3: Healing stVault

**The stVault is unhealthy now and the action is required to restore it’s health.**

There are a few ways to restore health:

#### 1. Burn stETH
    
    User needs to burn 1.35stETH, so that stVault has:
    
    - Total Value: 98.5 ETH
    - Debt: 90 - 1.35 = 88.65stETH minted
    - Reserve = 98.5 - 88.65 = 9.85
    - Reserve factor 9.85 / 98.5 = 10% → equals to 10% RR and above 9% FRT
    - Utilization ratio = 88.65 / (98.5 * 0.9) = 100%
    - Health Factor = 98.5 * (100% - 9%) / 88.65 = 101.11%
    
<img src="/img/stvaults/health/101_11.png" width="600px" align="center" />
    
    Pros:
    
    - Should this method be selected to restore stVault Health, the user’s future rewards from the stVault will remain unaffected, since the Total Value remains unchanged.
    
    Cons:
    
    - The user is required to burn stETH, potentially resulting in a decrease in earnings outside the stVault.
#### 2. Add ETH to the stVault
    
    User needs to top up stVault balance (Total Value) by 1.5 ETH:
    
    - Total Value: 98.5 + 1.5 = 100 ETH
    - Debt: 90 stETH minted
    - Reserve = 100 - 90 = 10
    - Reserve factor 10 / 100 = 10% → equals to 10% RR and above 9% FRT
    - Utilization ratio = 90 / (100 * 0.9) = 100%
    - Health factor = 100 * (100% - 9%) / 90 = 101.11%
    
<img src="/img/stvaults/health/101_11.png" width="600px" align="center" />
    
    Pros:
    
    - If this method is selected to restore stVault Health, the user’s future rewards from the stVault will increase, as the Total Value is higher.
    - The user is not required to burn stETH, so their potential earnings outside the stVault remain unaffected.
    
    Cons:
    
    - The user needs to provide additional capital to the stVault.
    
#### 3. Rebalance or do nothing and wait for forced rebalancing
    
    ⚖️ Rebalance is moving enough ETH from stVault to Lido Core, writing off the same stETH debt 1:1 (not burned, now backed by Core)
    
    For this example the required amount to be moved is 13.5 ETH:
    
    - Total Value: 98.5 - 13.5 = 85 ETH
    - Debt: 90 - 13.5 = 76.5 stETH minted
    - Reserve = 85 - 76.5 = 8.5
    - Reserve factor 8.5 / 85 = 10% → equals to 10% RR and above 9% FRT
    - Utilization ratio = 76.5 / (85 * 0.9) = 100%
    - Health factor = 85 * (100% - 9%) / 76.5 = 101.11%
    
<img src="/img/stvaults/health/101_11.png" width="600px" align="center" />
    
    This is the least suggested method for restoring stVault Health
    
    Pros:
    
    - The user is not required to burn stETH, so their potential earnings outside the stVault remain unaffected.
    
    Cons:
    
    - The user’s future rewards from the stVault will be significantly reduced due to a decrease in the stVault’s Total Value — from 98.5 ETH to 85 ETH (approximately -14%).

#### Let’s sum up:

In this scenario, there are three possible ways to restore the stVault’s health:

1. Repay 1.35 stETH
2. Supply 1.5 ETH
3. Rebalance 13.50 ETH

All three methods ultimately bring the stVault’s Utilization Ratio back to **100%**. However there are pros and cons for each of the methods.