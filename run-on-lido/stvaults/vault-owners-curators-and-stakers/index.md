---
sidebar_position: 3
---

# 🏦 Vault Owners, Curators, and Stakers

## Basic stVaults

1. [Supply/Withdraw ETH, Mint/Repay stETH](./basic-stvaults/supply-withdraw-mint-repay.md) — the day-to-day operations of any stVault.
2. [Apply Oracle Reports](./basic-stvaults/apply-oracle-reports.md) — applying the latest LazyOracle report before state-dependent operations.
3. [Rebalance](./basic-stvaults/rebalance.md) — simultaneous reducing the stVault's Total Value and stETH Liability together, 1:1.
4. [Control Validators and Withdraw ETH from the Beacon Chain](./basic-stvaults/control-validators.md) — exiting validators, partial withdrawing ETH from validators, and pausing new deposits.
5. [Covering Redemptions with stETH Liquidity](./basic-stvaults/redemptions_coverage_with_steth.md) — minting stETH to pay out redemptions without waiting on the validator exit queue.
6. [Health Monitoring Guide](./basic-stvaults/health-monitoring-guide.md) — Reserve Ratio, Utilization Ratio, and how to track an stVault's health.
7. [Health Emergency Guide](./basic-stvaults/health-emergency-guide.md) — what to do when an stVault approaches or breaches its Force Rebalance Threshold.
8. [Validate Setup Before Connecting](./basic-stvaults/validate-setup.md) — checks to run before connecting an stVault to VaultHub.
9. [Disconnection from VaultHub](./basic-stvaults/disconnection.md) — disconnecting an stVault from VaultHub and withdrawing 1 ETH of the Connection Deposit.

## DeFi Wrapper

### Vault Owners and Curators

1. [Roles and Permissions](./defi-wrapper/vault-owners-and-curators/roles-and-permissions.md) — DeFi Wrapper-specific roles for pooled staking products.
2. [Metrics](./defi-wrapper/vault-owners-and-curators/metrics.md) — the numbers behind the stVault with DeFi Wrapper.
3. [Health and Rebalance](./defi-wrapper/vault-owners-and-curators/health-guide.md) — Utilization Ratio, Health Factor, and what to do when they slip.
4. [Non-Custodial Operational Setup](./defi-wrapper/vault-owners-and-curators/non-custodial-operations.md) — delegating day-to-day operations without giving up custody of staker funds.
5. [Disconnect from VaultHub](./defi-wrapper/vault-owners-and-curators/disconnection.md) — disconnecting the stVault with DeFi Wrapper from VaultHub and distributing remaining assets to users.

### Stakers

1. [Supply and Withdraw](./defi-wrapper/stakers/supply-withdraw.md) — supplying and withdrawing via the DeFi Wrapper's interfaces.
2. [Rebalance Stakers's Position](./defi-wrapper/stakers/rebalance.md) — rebalancing a staker's position in the DeFi Wrapper.
3. [Stakers' Emergency Guide](./defi-wrapper/stakers/emergency-guide.md) — withdrawing ETH from a non-responsive stVault with DeFi Wrapper.