---
sidebar_position: 2
---

# 🩺 Health Monitoring Guide

## Definitions

- **Reserve Ratio (RR)** limits minting — this means that users will be able to mint up to 90% of stETH out of ETH they put into the stVault. However, falling below RR doesn't force an immediate correction.
- **Utilization Ratio (UR)** is a metric that shows how much stETH is minted out of Total stETH Minting Capacity: Utilization Ratio = (stETH Liability / Total stETH Minting Capacity) × 100%

## TLDR

Regularly monitoring **Health factor**, **Carry Spread**, **Net staking APR**, and **stETH Liability / Utilization ratio** is a good operational practice for vault owners.

Keeping these metrics within safe ranges allows you to:

- Detect early signals that the vault economics are deteriorating.
- React before the Health factor approaches 100% or Utilization ratio reaches 100%.
- Reduce the likelihood that the vault will enter a state where [forced rebalancing or other emergency actions become necessary](./health-emergency-guide.md).

Consistent observation of these indicators helps minimize the risk that vault health degrades to unacceptable levels and supports the long-term stability of the stVault.

## Monitoring stVaults health in the UI

The **Vault overview** screen provides a quick view of the economic state of a specific stVault.

![stVaults UI: Overview screen](/img/stvaults/health/health-overview.png)

From here you can drill down into the key metrics that determine vault health:

- **Health factor**
- **Net staking APR**
- **stETH Liability / Utilization ratio**

This section explains what each metric means, where to find it in the UI, and what to pay attention to when monitoring your vault.

### Health factor

**Definition:** Health Factor (HF) is a metric calculated using the following formula: Health Factor = Total Value × (1 − FRT) / Minted stETH

**Health factor** shows how well the stETH Liability is collateralized by the Total value of the vault.

It is the primary indicator of the vault’s overall health.

- As a rule, the Health factor **should always remain above 100%**.
- When the Health factor moves closer to 100%, the vault becomes riskier and may approach the forced rebalancing zone.
- If the Health factor falls below 100%, the vault becomes subject to [**forced rebalancing**](./health-emergency-guide.md).

![stVaults UI: Health Factor](/img/stvaults/health/health-hf.png)

In the Health factor details view you can also see **Carry Spread**.

> Carry Spread — Estimated yearly returns from staking in the vault, after deductions of fees and stETH Liability growth due to stETH rebase.
> 

Carry Spread shows whether the vault economics are improving or deteriorating over time:

- **Positive Carry Spread**
    - Expected yearly return is positive after accounting for fees and Liability growth.
    - All else equal, this supports **improving** or **stable** Health factor.
- **Negative Carry Spread**
    - Expected yearly return is not sufficient to cover fees and Liability growth.
    - Over time this tends to **erode** the Health factor and push it closer to 100%.

If the Carry Spread turns negative or the Health factor trends down toward 100%, you should treat this as an early warning and consider taking actions to improve the vault’s economics.

If the Health Factor of the vault drops below 100%, please refer to the [stVaults Health Emergency Guide](./health-emergency-guide.md).

### Net staking APR

**Net staking APR** shows the estimated yearly return from staking in the vault **after all protocol and node operator fees**, but **without** taking into account stETH Liability growth due to the daily stETH rebase.

![stVaults UI: Net Staking APR](/img/stvaults/health/health-net-apr.png)

This metric should be monitored relative to the **stETH APR**:

- If **Net staking APR is higher than stETH APR**
    - The vault is expected to outperform plain stETH staking before Liability growth.
    - This is generally a **healthy** situation.
- If **Net staking APR is lower than stETH APR**
    - The vault underperforms plain stETH on a fee-adjusted basis.
    - This is a signal to **pay attention**: together with Carry Spread and the Health factor it may indicate that the vault configuration or performance needs to be reviewed.

Persistent underperformance (Net staking APR < stETH APR) can contribute to a negative Carry Spread over time and, consequently, to a deterioration in the Health factor.

### stETH liability and Utilization ratio

**stETH Liability** is the amount of stETH that the vault owner has minted in the vault, backed by the ETH collateral.

This value **increases daily** because of the stETH rebase.

![stVaults UI: stETH Liability](/img/stvaults/health/health-steth-liability.png)

In the stETH Liability details view you can also see:

- **Total stETH minting capacity** (constrained by the Reserve Ratio)
- **Reserve Ratio (RR)**
- **Forced Rebalance Threshold (FRT)**
- **Utilization ratio**

The key condition to monitor is that the vault’s Liability remains safely within its capacity:

- stETH Liability should **not exceed** the allowed capacity defined by the Reserve Ratio / Forced Rebalance Threshold.
- In practice, this is equivalent to keeping the **Utilization ratio below 100%**.

When **Utilization ratio approaches 100%**:

- There is little remaining capacity to mint additional stETH.
- The vault comes closer to the boundary where forced rebalancing may be triggered.

If Utilization reaches or exceeds 100%, the vault is effectively at or above its intended Liability limit and may enter the forced rebalancing zone. In this situation, the Vault Owner should promptly review their position and take corrective actions as described in the [stVaults Health Emergency Guide](./health-emergency-guide.md).
