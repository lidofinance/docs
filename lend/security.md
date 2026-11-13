---
title: Security
description: Bug bounty, Safe Harbor and emergency controls for Lido Lend.
---

# Security

This page is for security researchers and users. It explains how to report a vulnerability in Lido Lend, the status of bug bounty and Safe Harbor coverage, and which emergency controls can stop market actions.

## Reporting a vulnerability

The reporting rules are in [`SECURITY.md`](https://github.com/lidofinance/lend/blob/422d589f9d098124249b54b55306884165833207/SECURITY.md) of `lidofinance/lend` and [`SECURITY.md`](https://github.com/lidofinance/lend-irm/blob/566d31f7dfdf83d07a6593f641f7474c263a7f89/SECURITY.md) of `lidofinance/lend-irm`:

- check the current scope of the [Lido bug bounty program on Immunefi](https://immunefi.com/bug-bounty/lido/information/) before you submit a report. Repository code and development branches are not automatically in scope;
- send findings that do not fit the published scope to [security@lido.fi](mailto:security@lido.fi), the contact in Lido's [security.txt](https://lido.fi/.well-known/security.txt);
- report Lido-specific issues to Lido, not to Morpho Labs. If an issue also affects upstream Morpho Blue, send it privately to [security@morpho.org](mailto:security@morpho.org) too;
- do not disclose a vulnerability publicly before it is triaged and remediated.

## Bug bounty

Lido runs its bug bounty program on Immunefi. See [Bug bounty](/security/bugbounty) for the program, its rules and how reports are assessed.

:::danger[Data needed]
**What:** whether the Lido bug bounty program on Immunefi covers Lido Lend, and which contracts and repositories are in scope.
**Source:** published update of the Lido program scope on Immunefi.
**Owner:** Lend dev team.
:::

## Safe Harbor

The Lido DAO has adopted the SEAL Safe Harbor agreement. See [Safe Harbor](/security/safeharbor) for its rules.

:::danger[Data needed]
**What:** whether the Lido Safe Harbor agreement covers the Lido Lend contracts, and the recovery address that applies to them.
**Source:** Lido DAO decision that adds Lido Lend to the Safe Harbor scope.
**Owner:** Lend dev team, DAO Ops.
:::

## Emergency controls

Lido Lend has three controls that stop or restrict market actions without a Lido DAO vote. Each control applies to one market. An action must pass every control that it uses.

| Control | Who can trigger it | What it stops | What stays available | How it ends |
| --- | --- | --- | --- | --- |
| Controller pause | The committee registered for the controller in `CircuitBreaker` | Every action that calls the market controller, including supply, borrowing, repayment, lender withdrawal, liquidation, settlement and explicit interest accrual | Core calls without a market hook, ERC-4626 vault-share transfers | The pause has a fixed duration and expires automatically. The `ResealManager` can end it early. The pause consumes the registration: the committee cannot extend the pause, and it cannot pause the same controller again until the Lend Operational Committee registers it again through Easy Track |
| Market freeze | Market stewards, through `RiskStewardDashboard` | New borrowing, completion of collateral activation, and collateral withdrawal while debt remains | Repayment, liquidation, settlement, lender withdrawal | An unfreeze through `LidoLendOwner` (`UnfreezeMarkets` Easy Track motion) |
| Guardian ban | A quorum of distinct Guardians in `GuardianSignals` | For one account in one market: borrowing by, for or to the account, and maturation of its activating collateral | Repayment, liquidation, settlement, debt-free withdrawal of active collateral | An unban through `LidoLendOwner` (`UnbanAccounts` Easy Track motion) |

A controller pause does not stop interest. After the market resumes, the next successful accrual covers the whole paused period.

When Dual Governance is not in its `Normal` state, the Reseal Committee can use `ResealManager` to replace an active finite controller pause with an indefinite one. This path cannot pause a controller that is not already paused.

For details, see:

- [Market controller](./architecture/market-controller) for freeze, pause and collateral activation;
- [Guardian signals](./architecture/guardian-signals) for flags, quorum and bans;
- [Committees](./governance/committees) for the committees that hold these powers;
- [Roles and permissions](./governance/roles-and-permissions) for the exact role holders.

## Audits

See [Audits](./audits) for the security reviews of Lido Lend and its dependencies.
