---
sidebar_position: 4
---

# Parameters and metrics
:::warning
This document covers metric calculations intended for stVaults on mainnet. The implementation on deployed testnet contracts may vary.
:::
## stVaults parameters 

### Reserve ratio
Defines amount of ETH that will be reserved as a part of collateral when the vault owner mints stETH in the stVault. stETH isn't minted for this amount.

### Forced rebalance threshold
Defines the minimum allowed ratio stETH liability to Total value. Exceeding this minimum threshold makes the vault subject to forced rebalancing.

## stVaults metrics

### Total value
The total amount of ETH consists of ETH staked on validators plus ETH held in the vault balance. Rewards accrue to both and increase Total Value.

### Not staked stVault Balance
The amount of ETH held on the stVault Balance (Vault contract balance) and not deposited on validators, therefore not used for earning rewards.

### Staked on validators
The amount of ETH deposited on validators and used for earning rewards.

### Total Lock
The total amount of ETH locked in the stVault due to a combination of reasons: fees obligations, collateral either for stETH liability or the connection to Lido Core, etc.

### Collateral
The amount of ETH locked in the stVault, either to cover stETH liability under the Reserve Ratio or to maintain the connection to Lido Core (minimum 1 ETH).

### Reserve
The amount of ETH that is reserved as a part of collateral when the vault owner mints stETH in the stVault. stETH isn't minted for this amount.

### Minimal Reserve
The amount of ETH that is always reserved in the stVault despite the amount of Total Value. Minimum Reserve = 1 ETH by default, and may be increased as a reaction for a correlated slashing event according to the [Risk management framework](https://research.lido.fi/t/risk-assessment-framework-for-stvaults/9978/4). 

### stETH minting limit
Absolute maximum limit for the stETH minting capacity defined by the Tier the stVault belongs to. It can be changed by changing the Tier.

### Total stETH minting capacity
The amount of stETH the vault owner can mint within the Reserve Ratio boundaries, considering Minimum Reserve of 1 ETH:

```
Total stETH minting capacity =
max
    (
    0,
    Total Value
      - Unsettled Fees
      - max
          (
          Minimal Reserve,
          (Total Value - Unsettled Fees) * Reserve Ratio / 100%
          )
    )
```

Also, can be limited by:
- stVault personal stETH minting limit;
- Tier remaining capacity;
- Node operator remaining capacity;
- Total stVaults remaining capacity;
- Lido Core staking rate limits [learn more](https://docs.lido.fi/guides/lido-tokens-integration-guide/#staking-rate-limits).


### stETH Liability
The amount of stETH that the vault owner minted in the vault backed by the ETH collateral. Increases daily due to daily stETH rebase.

### Remaining stETH minting capacity
The amount of stETH remaining mintable in the vault, based on the current Total stETH minting capacity and stETH Liability.

### Utilization ratio
The share of the stETH minting capacity currently utilized by the vault owner.

### Health Factor
The Health Factor demonstrates the economic state of the stVault. It shows how the stETH Liability is backed by the Total Value.

### Locked by fees obligations (unsettled fees)
The amount of ETH locked in the vault due to the undisbursed Node Operator fee and unsettled Lido fees.

### Pending unlock
The amount of ETH eligible for unlocking after stETH is repaid, but still pending confirmation from the next Oracle report.

### Available to withdraw
The amount of ETH that is available to withdraw from the stVault Balance. Constrained by the total locked ETH on the stVault and the amount of ETH deposited on validators.

### Undisbursed Node Operator fee
The amount of accumulated but not yet disbursed Node Operator Fee. This amount of ETH increases the total locked ETH.

### Unsettled Lido fees
The amount of accumulated but not yet settled Lido fees. This amount of ETH increases the total locked ETH.

The Lido fee consists of the following components, calculated daily and automatically claimed whenever a vault report is applied:

- Infrastructure fee
- Liquidity fee
- Reservation liquidity fee

### Gross staking rewards
The amount of ETH earned by validators.

### Node operator rewards
The amount of ETH subject to node operator as a Node Operator fee.

### Net staking rewards
The amount of staking rewards remain after deductions of Node Operator fee and Lido fees.

### Gross staking APR
The amount of rewards earned by the validators expressed as a percentage of the stVault Total value, before fees deductions.

### Net staking APR
Estimated yearly returns from staking in the vault, after fees deductions but without taking into account stETH Liability growth due to stETH rebase.

### stVault bottom line
The final amount of rewards earned by the vault owner in the vault perimeter.

Calculated as difference between the Net Staking Rewards and the stETH Liability growth:

stVault bottom line = Net staking rewards - stETH rebase

### Carry spread
Estimated yearly returns from staking in the vault, after deductions of fees and stETH Liability growth due to stETH rebase.

Carry spread indicates the Health Factor trend: a positive spread raises the Health Factor, while a negative spread lowers it.

### Lido infrastructure fee
The fees that Lido charges for using the stVaults infrastructure. Calculated from the stVault Total value:

Infrastructure Fee = Total Value * Lido Core APR * Infrastructure Fee Percentage

### Lido liquidity fee
The fees that Lido charges for actual liquidity usage. Calculated from the stETH Liability:

Liquidity Fee = stETH Liability * Lido Core APR * Liquidity Fee Percentage


### Lido reservation liquidity fee
The fees that Lido charges for the liquidity on demand. Calculated from the stETH minting capacity:

Reservation Liquidity fee = stETH minting capacity * Lido Core APR * Reservation liquidity fee percentage

### stETH rebase
The change of stETH amount happening due to stETH is a rebasing token. Amount for rebase is based on the stETH APR.

### Node Operator fee
The share of Gross staking rewards that the Node Operator charges for provided validation service.

## Rebalancing unhealthy stVault

### ETH to supply
Amount of ETH that is recommended to supply to the vault to compensate ETH deficit and return the stETH minting utilization ratio back to 100%.

### stETH to repay
Amount of stETH that is recommended to repay to the vault to compensate ETH deficit and return the stETH minting utilization ratio back to 100%.

### ETH to rebalance
Amount of ETH on the vault balance that is recommended to rebalance to compensate ETH deficit and return the stETH minting utilization ratio back to 100%.

Rebalance is a mechanism that sends available ETH from the stVault balance to Lido Core, receiving stETH with a ratio of 1:1, and repaying received stETH back to stVault so that stETH minting utilization ratio is back to 100%.

The amount of ETH for rebalancing to make Utilization Ratio 100% is pre-calculated by the system or can be calculated by the formula:

ETH for rebalance = (stETH Liability - (1 - RR) * Total Value) / RR.


## Lido Core referrence metrics

### stETH APR
Estimated total yearly returns from staking in the Lido Core protocol.

### Lido Core APR
Gross annualized rewards earned by validators in the Lido Core protocol.

### Node Operator fee at Lido Core
The average share of staking rewards that node operators of the Lido Core protocol receive for providing validation service.