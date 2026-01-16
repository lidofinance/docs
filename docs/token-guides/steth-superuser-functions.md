# stETH superuser functions

This guide describes the stETH control surface in Lido V3 and the roles that can change protocol behavior. It is written from first principles rather than legacy V1/V2 flows.

## What stETH is in Lido V3

- stETH is the rebasing token that represents pooled ETH in the core Lido pool.
- stVaults can mint stETH as **external shares** against overcollateralized collateral.
- Rebases are driven by oracle reports applied through the `Accounting` contract.

## Who controls stETH behavior

Control is governed by the DAO. Roles are assigned to DAO-owned contracts (Voting/Agent) or protocol components.

All protocol proxy admins are set to the Lido DAO Agent.

### Pause and resume

- Mutators: `stop()`, `resume()` on [Lido](/contracts/lido)
- Roles: `PAUSE_ROLE`, `RESUME_ROLE`

When paused, token transfers, approvals, and rebases are disabled, and core protocol entry points revert.

### Burning stETH

Burning is routed through [Burner](/contracts/burner) and the withdrawal finalization process.

- Roles: `REQUEST_BURN_SHARES_ROLE` and `REQUEST_BURN_MY_STETH_ROLE`
- Used for: withdrawal finalization, penalties, and DAO-directed burns

### Fees and treasury configuration

- Mutators: protocol fee updates, treasury changes, and staking module fee splits
- Contracts: [Lido](/contracts/lido), [StakingRouter](/contracts/staking-router)
- Roles: `MANAGE_FEE`, `STAKING_MODULE_MANAGE_ROLE`

### Withdrawal credentials

- Mutator: `setWithdrawalCredentials()`
- Role: `MANAGE_WITHDRAWAL_KEY_ROLE`

### External shares cap (stVaults)

External shares are capped to preserve core pool solvency.

- Mutator: `setMaxExternalRatioBP()` on [Lido](/contracts/lido)
- Role: `STAKING_CONTROL_ROLE`

## Oracle and accounting flow

- `AccountingOracle` aggregates reports via `HashConsensus`.
- `Accounting` applies the report and updates Lido state.
- Token rebases are emitted after report application.

See [AccountingOracle](/contracts/accounting-oracle) and [Accounting](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.9/Accounting.sol) for details.

## Operational implications

- **Pausing** disables rebases and token transfers.
- **External shares cap** limits stVault minting against Lido core liquidity.
- **Fee configuration** affects stETH yield distribution.

## Governance references

- [Lido DAO Voting](https://vote.lido.fi/)
- [Protocol levers](/guides/protocol-levers)
