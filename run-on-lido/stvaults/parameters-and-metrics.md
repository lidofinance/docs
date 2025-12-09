---
sidebar_position: 4
---

# Parameters and metrics
:::warning
This document covers metric calculations intended for stVaults on mainnet. The implementation on deployed testnet contracts may vary.
:::
## stVaults parameters

### Reserve Ratio
Defines the amount of ETH that will be reserved as part of the collateral when the Vault Owner mints stETH in the stVault. stETH isn't minted for this amount.

### Forced Rebalance Threshold
Defines the minimum allowed ratio of stETH Liability to Total Value. Exceeding this minimum threshold makes the vault subject to forced rebalancing.

## stVaults metrics

### Total Value
The total amount of ETH, consisting of ETH staked on validators plus ETH held in the vault balance. Rewards accrue to both and increase Total Value.

### Unstaked stVault Balance
The amount of ETH held on the stVault Balance (Vault contract balance) and not deposited on validators, and therefore not used for earning rewards.

### Staked on validators
The amount of ETH deposited on validators and used for earning rewards.

### Total Lock
The total amount of ETH locked in the stVault due to a combination of reasons: fees obligations, collateral either for stETH liability or the connection to Lido Core, etc.

### Collateral
The amount of ETH locked in the stVault, either to cover stETH liability under the Reserve Ratio or to maintain the connection to Lido Core (minimum 1 ETH).

### Reserve
The amount of ETH that is reserved as part of the collateral when the Vault Owner mints stETH in the stVault. stETH isn't minted for this amount.

### Minimal Reserve
The amount of ETH that is always reserved in the stVault regardless of the Total Value. Minimal Reserve = 1 ETH by default, and may be increased in response to a correlated slashing event according to the [Risk management framework](https://research.lido.fi/t/risk-assessment-framework-for-stvaults/9978/4). 

### stETH minting limit
Absolute maximum limit for the stETH minting capacity defined by the Tier the stVault belongs to. It can be changed by changing the Tier.

### Total stETH minting capacity
The amount of stETH the Vault Owner can mint within the Reserve Ratio boundaries, considering a Minimal Reserve:

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

Also, it can be limited by:
- stVault personal stETH minting limit;
- Tier remaining capacity;
- Node Operator remaining capacity;
- Total stVaults remaining capacity;
- Lido Core staking rate limits ([learn more](https://docs.lido.fi/guides/lido-tokens-integration-guide/#staking-rate-limits)).


### stETH Liability
The amount of stETH that the Vault Owner minted in the vault, backed by the ETH collateral. Increases daily due to the stETH rebase.

### Remaining stETH minting capacity
The amount of stETH remaining mintable in the vault, based on the current Total stETH minting capacity and stETH Liability.

### Utilization Ratio
The share of the stETH minting capacity currently utilized by the Vault Owner.

### Health Factor
The Health Factor demonstrates the economic state of the stVault. It shows how the stETH Liability is backed by the Total Value.

$$
Health Factor = \frac{Total Value \times (1 - Forced Rebalance Threshold)}{stETH Liability}
$$

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

### Node Operator rewards
The amount of ETH payable to the Node Operator as a Node Operator fee.

### Net staking rewards
The amount of staking rewards remaining after deduction of the Node Operator fee and Lido fees.

### Gross staking APR
The amount of rewards earned by the validators expressed as a percentage of the stVault Total Value, before fee deductions.

### Net staking APR
Estimated yearly returns from staking in the vault, after fees deductions but without taking into account stETH Liability growth due to stETH rebase.

### stVault bottom line
The final amount of rewards earned by the Vault Owner within the vault perimeter.

Calculated as the difference between the Net Staking Rewards and the stETH Liability growth:

stVault bottom line = Net staking rewards - stETH rebase

### Carry Spread
Estimated yearly returns from staking in the vault, after deduction of fees and stETH Liability growth due to stETH rebase.

Carry spread indicates the Health Factor trend: a positive spread raises the Health Factor, while a negative spread lowers it.

### Lido infrastructure fee
The fee that Lido charges for using the stVaults infrastructure. Calculated from the stVault Total Value:

Infrastructure Fee = Total Value × Lido Core APR × Infrastructure Fee Percentage

### Lido liquidity fee
The fee that Lido charges for actual liquidity usage. Calculated from the stETH Liability:

Liquidity Fee = stETH Liability × Lido Core APR × Liquidity Fee Percentage

### Lido reservation liquidity fee
The fee that Lido charges for liquidity on demand. Calculated from the stETH minting capacity:

Reservation Liquidity Fee = stETH minting capacity × Lido Core APR × Reservation Liquidity Fee Percentage

### stETH rebase
The change in stETH amount that occurs because stETH is a rebasing token. The rebase amount is based on the stETH APR.

### Node Operator fee
The share of Gross staking rewards that the Node Operator charges for providing validation services.

## Rebalancing unhealthy stVault

### ETH to supply
The amount of ETH recommended to supply to the vault to compensate for the ETH deficit and return the Utilization Ratio to 100%.

### stETH to repay
The amount of stETH recommended to repay to the vault to compensate for the ETH deficit and return the Utilization Ratio to 100%.

### ETH to rebalance
The amount of ETH on the vault balance recommended to rebalance to compensate for the ETH deficit and return the Utilization Ratio to 100%.

Rebalance is a mechanism that sends available ETH from the stVault balance to Lido Core, receiving stETH at a 1:1 ratio, and repaying the received stETH back to the stVault so that the Utilization Ratio returns to 100%.

The amount of ETH for rebalancing to bring the Utilization Ratio to 100% is pre-calculated by the system or can be calculated using the formula:

ETH for rebalance = (stETH Liability − (1 − RR) × Total Value) / RR

## Lido Core reference metrics

### stETH APR
Estimated total yearly returns from staking in the Lido Core protocol.

### Lido Core APR
Gross annualized rewards earned by validators in the Lido Core protocol.

### Node Operator fee at Lido Core
The average share of staking rewards that Node Operators of the Lido Core protocol receive for providing validation services.