---
title: Security
description: How to report a vulnerability in Lido Lend and which emergency controls can stop market actions.
---

# Security

This page explains how to report a vulnerability in Lido Lend and which emergency controls can stop market actions.

## Reporting a vulnerability

Review the current scope and submit reports through the [Lido program page on Immunefi](https://immunefi.com/bug-bounty/lido/information/). Do not disclose a suspected vulnerability publicly before it is resolved and approved for disclosure. See [Bug bounty](/security/bugbounty#submit-a-report).

## Emergency controls

Lido Lend has three controls that stop or restrict market actions without a Lido DAO vote. Each control applies to one market. An action must pass every control that it uses.

| Control          | Who can trigger it                                              | What it stops                                                                                                                                                   | What stays available                                             | How it ends                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller pause | The committee registered for the controller in `CircuitBreaker` | Every action that calls the market controller, including supply, borrowing, repayment, lender withdrawal, liquidation, settlement and explicit interest accrual | Core calls without a market hook, ERC-4626 vault-share transfers | The pause has a fixed duration and expires automatically. It can be ended early only by the Dual Governance Tiebreaker in a tie, or by a Lido DAO vote that changes the controller's roles. The pause consumes the registration: the committee cannot extend the pause, and it cannot pause the same controller again until the Lend Operational Committee registers it again through Easy Track |
| Market freeze    | Market stewards, through `RiskStewardDashboard`                 | New borrowing, completion of collateral activation, and collateral withdrawal while debt remains                                                                | Repayment, liquidation, settlement, lender withdrawal            | An unfreeze through `LidoLendOwner` (`UnfreezeMarkets` Easy Track motion)                                                                                                                                                                                                                                                                                                                        |
| Guardian ban     | A quorum of distinct Guardians in `GuardianSignals`             | For one account in one market: borrowing by, for or to the account, and maturation of its activating collateral                                                 | Repayment, liquidation, settlement, collateral withdrawal        | An unban through `LidoLendOwner` (`UnbanAccounts` Easy Track motion)                                                                                                                                                                                                                                                                                                                             |

A controller pause does not stop interest. After the market resumes, the next successful accrual covers the whole paused period.

When Dual Governance is not in its `Normal` state, the Reseal Committee can use `ResealManager` to replace an active finite controller pause with an indefinite one. This path cannot pause a controller that is not already paused.

For details, see:

- [Architecture](./architecture#freeze-and-pause) for freeze and pause;
- [Governance](./governance) for who holds these powers;
- [Committees](./committees) for the powers and limits of each committee.

## Audits

See [Audits](./audits) for the security reviews of Lido Lend and its dependencies.
