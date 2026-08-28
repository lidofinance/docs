---
sidebar_position: 4
title: Non-Custodial Operational Setup for the stVault + DeFi Wrapper
sidebar_label: Non-Custodial Operational Setup
---

# Non-Custodial Operational Setup for the stVault + DeFi Wrapper

This guide explains how to configure role delegation for an stVault that sits behind a DeFi Wrapper, so that the entity operating it day to day (the **operations manager**) can manage the product smoothly, while remaining structurally unable to move staker funds out of the stVault on its own.

## Why this setup matters

An stVault + DeFi Wrapper setup typically needs frequent, low-friction operational actions — adjusting Predeposit Guarantee (PDG) policy, requesting validator exits, pausing deposits, and similar day-to-day tasks. At the same time, the same vault holds staker principal, and a single compromised or malicious operational key should never be able to withdraw funds, mint stETH fron the stVault, or reassign roles.

The setup below splits stVault permissions into two categories, based on whether an operation can move or re-collateralize staker funds:

- **Operational permissions** are delegated directly to the operations manager's multisig for fast, low-overhead management.
- **Custody-sensitive permissions** are delegated to a **Proposer/Executor** address (a timelock-style contract) instead of being held directly by any single party.

## Prerequisites

- The stVault and its DeFi Wrapper are already deployed and connected to VaultHub.
- The operations manager has set up a dedicated multisig (recommended: 2-of-3) that will act as the day-to-day operator of the vault.
- A second, broader multisig group is available to act as **Executor** — this should include parties independent from the operations manager, such as a custodian, an auditor, or another trusted counterparty (e.g. a traffic or distribution partner, a builder).

:::note
The Proposer/Executor pattern described here is a general non-custodial account design (proposer schedules an action, a separate executor confirms and executes it). It is independent from stVaults' native **Multi-roles confirmation** mechanism, which requires the Vault Owner and Node Operator Manager to jointly confirm a small set of protocol-level parameter changes (NO fee, Confirmation Expiry, AccruedRewardsAdjustment). The two mechanisms can, and should, be used together.
:::

## Step 1 — Classify roles by custody risk

Before delegating anything, classify all Dashboard sub-roles into two groups based on whether they give access to the stVault's principal or its collateralization state.

### Custody-sensitive roles

These roles must never be held directly by a single operational multisig, since they can move funds out of the stVault, create leveraged exposure against it, or change who controls it.

| Role | Risk |
| --- | --- |
| `DEFAULT_ADMIN` (Vault Owner) | Can grant or remove any role, including its own, and confirms transfer of StakingVault ownership. |
| `WITHDRAW_ROLE` | Withdraws ETH directly from the stVault balance. |
| `MINT_ROLE` | Mints stETH from the stVault, creating leveraged exposure on behalf of the owner. |
| `VOLUNTARY_DISCONNECT_ROLE` | Disconnects the stVault from VaultHub — an irreversible structural action, not a routine operational one. |
| `COLLECT_VAULT_ERC20_ROLE` | Recovers ERC20 tokens sent to the stVault, including incentive tokens that may belong to stakers rather than the operator. |

### Operational roles

These roles support day-to-day management and do not, on their own, allow custody-sensitive value to leave the stVault.

| Role | Notes |
| --- | --- |
| `FUND_ROLE` | Supplies ETH to the stVault; cannot cause harm. |
| `BURN_ROLE` | Repays previously minted stETH; only reduces risk exposure. |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE` / `RESUME_BEACON_CHAIN_DEPOSITS_ROLE` | Reversible, does not move capital. |
| `REQUEST_VALIDATOR_EXIT_ROLE` | Initiates a validator exit; returned ETH stays on the stVault balance. |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Forces a full or partial validator withdrawal; funds return to the stVault balance. |

### Discretionary roles

A small number of roles don't cleanly fall into either bucket and are left to the builder's judgment, depending on whether the priority is UX speed or maximum safety.

| Role | Why it needs judgment |
| --- | --- |
| `REBALANCE_ROLE` | Can trigger a sharp, momentary change in the stVault TVL. The end state remains economically unchanged because the stETH Liability is reduced by the same amount, but the operation itself reduces end users’ principal, which may negatively affect the user experience. |
| `VAULT_CONFIGURATION_ROLE` | Changes stVault tier and share limit; in collusion with the Node Operator it can be used to front-run a validator deposit. |

:::tip
`REBALANCE_ROLE` and `VAULT_CONFIGURATION_ROLE` can be assigned either to the operations manager multisig directly (faster, simpler UX) or routed through the Proposer/Executor address (slower, safer). There is no partial option — a role is assigned to one address or the other, so pick a side deliberately rather than defaulting.
:::

## Step 2 — Delegate operational roles to the operations manager multisig

Grant the operational roles (and, if chosen, the discretionary roles) directly to the operations manager's multisig address. This is a standard `grantRole` call from the Vault Owner's `DEFAULT_ADMIN` address for each role listed above.

This multisig should be sized for day-to-day usability (e.g. 2-of-3) rather than maximum security, since none of the roles it holds can move staker principal on their own.

## Step 3 — Route custody-sensitive roles through a Proposer/Executor address

Instead of granting custody-sensitive roles to any single multisig, grant them to a Proposer/Executor contract address, structured as follows:

- **Proposer**: the operations manager multisig (the same 2-of-3 used in Step 2), responsible for scheduling the technical setup — it can propose an action, but cannot execute it alone.
- **Executor**: a separate, broader multisig (recommended: 3-of-3) made up of parties independent from the operations manager — for example a custodian, an auditor, and another trusted partner (traffic channel, builder, etc.). Only the Executor can carry out a proposed action.

:::warning
The safety of this design depends on the Executor group being genuinely independent from the Proposer. If the same parties effectively control both sides, or the Executor signs every proposal automatically without review, the split provides no real protection against a compromised or malicious operations manager.
:::

With this structure:

- The operations manager can schedule custody-sensitive actions (a withdrawal, a mint, a role change) but cannot execute them unilaterally.
- The Executor group reviews and confirms each proposal before it takes effect, giving independent parties a genuine veto over any action that could move staker funds.

## Summary: direct delegation vs. Proposer/Executor delegation

| | Direct delegation (operational roles) | Proposer/Executor delegation (custody-sensitive roles) |
| --- | --- | --- |
| Holder | Operations manager multisig (e.g. 2-of-3) | Proposer (ops manager) + independent Executor (e.g. 3-of-3) |
| Speed | Fast, single signature round | Slower, requires two independent parties to act |
| Can move staker funds alone | No | No — Executor confirmation required |
| Best suited for | FUND, BURN, PAUSE/RESUME deposits, REQUEST_VALIDATOR_EXIT, TRIGGER_VALIDATOR_WITHDRAWAL | DEFAULT_ADMIN, WITHDRAW, MINT, VOLUNTARY_DISCONNECT, COLLECT_VAULT_ERC20 |
| Applies by builder's choice to | — | REBALANCE, VAULT_CONFIGURATION (optional) |

## Result

With this configuration, the operations manager can run the stVault + DeFi Wrapper day to day — managing the validator lifecycle, adjusting the PDG policy, and funding the stVault with incentives when necessary — without ever holding a role that, on its own, can withdraw funds, mint stETH, or reassign stVault ownership. Every custody-sensitive action requires a second, independent party to execute it.