---
title: Committees
description: Committees that operate Lido Lend, the contracts they act through, and the limits of their powers.
---

# Committees

This page is for governance participants. It describes who operates Lido Lend day to day and what each actor can and cannot do.

The design separates fast, risk-reducing actions from slower, risk-increasing ones. Committees with instant powers can only restrict: tighten a market's settings, freeze a market, or pause a market for a fixed time. Changes that add risk or restore service go through Easy Track motions, which LDO holders can object to, or through a Lido DAO vote. No committee can upgrade contracts or move user funds through the current contract interfaces. Until the relevant proxies are ossified, the Lido DAO remains the final trust assumption, because it controls upgrades and role administration.

| Actor | Execution path | Main purpose |
| --- | --- | --- |
| [Lend Operational Committee](#lend-operational-committee) | Predefined Easy Track motions | Activate markets and perform routine configuration, membership and recovery actions |
| [Lend Risk Steward Committee](#lend-risk-steward-committee) | Direct calls to `RiskStewardDashboard` | Tighten selected risk limits or freeze a market |
| [Lend Emergency Brakes Committee](#lend-emergency-brakes-committee) | [`CircuitBreaker`](/contracts/circuit-breaker) with a live registration and heartbeat | Apply one finite emergency pause to a market controller |
| [Guardian Security Council](#guardian-security-council) | Guardian or its current delegate calls `GuardianSignals` | Report account risk and attest to collateral-screening progress |
| [Reseal Committee / Dual Governance](#dual-governance-pause-extension) | `DualGovernance` through `ResealManager` | Keep an already paused controller paused during a governance emergency |
| [Lido DAO](#lido-dao) | Lido DAO Agent | Upgrades, role administration, ownership, and actions outside the Easy Track factories |

:::note
Committee names follow the [Lido Lend Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62) on the Research Forum. The Lend Emergency Brakes Committee is not the [CircuitBreaker Committee](/multisigs/emergency-brakes) of the Lido core protocol, and the Lido Lend `CircuitBreaker` is a separate instance.
:::

For the role behind each power, see [Roles and permissions](./roles-and-permissions).

## Lend Operational Committee

**Purpose:** Create markets and perform routine configuration through Easy Track motions. Each motion is delayed and LDO holders can object to it.

The committee is the trusted caller of the Lido Lend Easy Track factories. The factories fix the target contracts and functions of each motion. The committee chooses the parameters, and the factories and contracts validate them. Lido Lend authorizes the `EVMScriptExecutor`, so these limits depend on the factory set that the Lido DAO registers in Easy Track. See [Easy Track motions](./roles-and-permissions#easy-track-motions) for the full list of calls and the [Easy Track guide](/guides/easy-track-guide) for how motions and objections work.

**Powers:**

- activate a deployed market (`ActivateMarket`): configure and route the initial IRM, create the core market with its controller and settlement setting, appoint the market steward, register the Circuit Breaker pauser, preseed the market and vault with permanently locked shares, and optionally set the market fee;
- register, replace or remove the Circuit Breaker pauser of a controller, and change the instance-wide pause duration and heartbeat interval within immutable bounds (`RegisterPauser`, `SetPauseDuration`, `SetHeartbeatInterval`);
- unfreeze markets (`UnfreezeMarkets`);
- add, remove or replace guardians, and change the guardian quorum and suspect window (`AddGuardian`, `RemoveGuardian`, `ReplaceGuardian`, `SetGuardiansQuorum`, `SetSuspectWindow`);
- unban account and market pairs (`UnbanAccounts`);
- grant or revoke instant activation for an integration, and replace the collateral activation config, the settlement config and the supply cap (`SetInstantActivation`, `SetCollateralActivationConfig`, `SetSettlementConfig`, `SetSupplyCap`);
- change a market's protocol fee (`SetFee`), up to the core cap of 25%;
- add or remove a market steward (`AddRiskSteward`, `RemoveRiskSteward`);
- apply a new configuration to the market's active Adaptive Curve IRM without changing the route (`ApplyIrmConfig`).

**Cannot:**

- upgrade contracts or administer roles;
- withdraw user positions, choose borrowers for settlement, or start settlement;
- change the core fee recipient;
- change the IRM route of a live market;
- act without a motion: every action waits for the motion duration and fails if LDO holders reach the objection threshold.

**Address:** [`0x4f29aA4c299e17176b48c41D67ee97aE673d29bC`](https://etherscan.io/address/0x4f29aA4c299e17176b48c41D67ee97aE673d29bC) <span className="lend-todo">proposed</span> (the trusted caller of the Lido Lend Easy Track factories)

**Forum topics:**\
[Lido Lend: Technical Specification and Committees](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/60)\
[Lido Lend: Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)

**Quorum:** 5/7 (<span className="lend-todo">signers and threshold not set on-chain yet</span>)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [Izzy](https://research.lido.fi/u/Izzy) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [psirex](https://research.lido.fi/u/psirex) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [alexander_tarelkin](https://research.lido.fi/u/alexander_tarelkin) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [Willem](https://research.lido.fi/u/Willem) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [TheDZhon](https://research.lido.fi/u/TheDZhon) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/341699 | https://x.com/e330acid/status/2120599269438632367 |
| [mikgur](https://research.lido.fi/u/mikgur) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [Mol_Eliza](https://research.lido.fi/u/Mol_Eliza) | <span className="lend-todo">not confirmed yet</span> | - | - |

## Lend Risk Steward Committee

**Purpose:** Tighten risk controls of a market instantly, without a vote.

**Powers:**

- freeze one market (`RiskStewardDashboard.freezeMarket`). A freeze stops new borrowing and the maturation of activating collateral, and borrowers with debt cannot withdraw collateral. Lender supply, collateral supply, repayment, lender withdrawals, liquidation and settlement stay available;
- increase the market's base activation delays and the guardian-quorum fallback delay (`increaseActivationDelays`);
- lengthen the lock on activating collateral (`increaseActivatingLockDuration`);
- raise the minimum standard collateral deposit (`increaseMinDepositAmount`);
- remove one integration's instant-activation privilege (`revokeInstantActivation`). Its future deposits then follow the standard deposit floor, dust, activation delay and inflow rules.

The committee can use the dashboard powers only in a market where it is an appointed steward. Steward membership is stored per market. The `ActivateMarket` motion appoints the selected steward when the market is created, and the Lend Operational Committee can add or remove stewards through Easy Track. The Lido DAO Agent administers the dashboard roles and can reassign them. See [Market controller](../architecture/market-controller) for the user effects.

**Cannot:**

- loosen any setting: each `increase*` function reverts if the new value is lower than the current one;
- unfreeze a market;
- change fees or the interest rate configuration;
- ban an account directly. See [Direct account bans](#direct-account-bans);
- upgrade contracts.

**Address:** [`0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E`](https://etherscan.io/address/0x1011E8a0668da8bbED925cB5A6DA5aa128C2BB5E) <span className="lend-todo">proposed</span>

**Forum topics:**\
[Lido Lend: Technical Specification and Committees](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/60)\
[Lido Lend: Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)

**Quorum:** 3/7 (<span className="lend-todo">signers and threshold not set on-chain yet</span>)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [Izzy](https://research.lido.fi/u/Izzy) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [psirex](https://research.lido.fi/u/psirex) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [alexander_tarelkin](https://research.lido.fi/u/alexander_tarelkin) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [Willem](https://research.lido.fi/u/Willem) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [TheDZhon](https://research.lido.fi/u/TheDZhon) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/341699 | https://x.com/e330acid/status/2120599269438632367 |
| [mikgur](https://research.lido.fi/u/mikgur) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [Mol_Eliza](https://research.lido.fi/u/Mol_Eliza) | <span className="lend-todo">not confirmed yet</span> | - | - |

## Lend Emergency Brakes Committee

**Purpose:** Stop all controller-checked operations of a market for a fixed time in an emergency, without a vote.

**Powers:**

- apply the configured finite pause to one market controller (`CircuitBreaker.pause(controller)`). The call consumes the committee's registration for that controller. The pause blocks every operation that passes through the controller: supply, collateral supply and withdrawal, borrowing, repayment, lender withdrawal, liquidation, settlement and explicit interest accrual;
- keep its authority alive (`CircuitBreaker.heartbeat()`). Each call extends its pause authority for every controller still registered to it. If the deadline passes, the committee cannot send a heartbeat or pause a controller until the `CircuitBreaker` admin registers it again.

The `ActivateMarket` motion registers the selected pauser for the new market's controller. The `CircuitBreaker` admin is the `EVMScriptExecutor`, so the Lend Operational Committee configures `CircuitBreaker` through Easy Track. The pause does not forgive interest: after the market resumes, the next successful accrual covers the full elapsed period.

**Cannot:**

- choose the pause duration. The `CircuitBreaker` admin sets it for the whole instance within immutable bounds;
- extend an active pause or resume a controller;
- pause the same controller a second time until it is registered again through an Easy Track motion.

**Address:** [`0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1`](https://etherscan.io/address/0x604B13eD638663AA0C1eEF0c3482e51f228BA2E1) <span className="lend-todo">proposed</span>

**Forum topics:**\
[Lido Lend: Technical Specification and Committees](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/60)\
[Lido Lend: Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)

**Quorum:** 3/6 (<span className="lend-todo">signers and threshold not set on-chain yet</span>)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [Izzy](https://research.lido.fi/u/Izzy) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [psirex](https://research.lido.fi/u/psirex) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [alexander_tarelkin](https://research.lido.fi/u/alexander_tarelkin) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [skhomuti](https://research.lido.fi/u/skhomuti) | <span className="lend-todo">not confirmed yet</span> | - | - |
| [George](https://research.lido.fi/u/George) | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/341681 | https://x.com/george_avs/status/2120432030202663081 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | <span className="lend-todo">not confirmed yet</span> | - | - |

## Guardian Security Council

**Purpose:** Screen new collateral before it can back borrowing, and report risky accounts.

The council is the guardian set of a `GuardianSignals` registry. Each guardian is a separate identity, expected to be independently controlled. A registry can serve one market or several markets. Membership, quorum, the suspect window and the heartbeat frontier apply to the whole registry. Flags, suspects and bans apply to one account in one market. `GuardianSignals` records the reports but cannot verify the underlying screening. See [Guardian signals](../architecture/guardian-signals).

**Powers:**

- appoint, replace or remove a delegate for routine daemon transactions (`setDelegate`). A delegate cannot be a guardian or another guardian's delegate;
- flag accounts in one market (`flag`). The per-flag delay can extend collateral activation. When flags reach the quorum, the contract records a ban, which blocks borrowing and collateral maturation for that account in that market;
- retract a flag (`unflag`). This can reduce the activation delay, but it cannot lift a recorded ban;
- add or refresh a time-bounded suspicion report (`suspect`), or retract it (`unsuspect`). A suspect report can extend activation, but it cannot ban an account;
- attest to its latest scan progress (`heartbeat`). The heartbeats of a quorum of guardians set the shared frontier, which lets ready collateral mature when a later controller operation synchronizes the position.

A ban does not close the position, block repayment, or move assets.

**Cannot:**

- move assets or change market parameters;
- lift a ban. Removing flags or changing the quorum does not clear a recorded ban. Only an authorized `unban` does;
- change its own membership, quorum or suspect window. In the initial setup, these change through Lend Operational Committee motions, and the Lido DAO keeps role administration over the registry.

When a guardian is removed, its delegate and heartbeat are cleared, but its existing signals can stay effective until someone calls the permissionless `prune` function. Pruning never removes a recorded ban.

**Members:** defined per market. They are published in the Lido Lend Research Forum thread before the market's motion or vote ([Final Proposal](https://research.lido.fi/t/unveiling-lido-lend-security-first-lending/11987/62)) and listed on the page of the market.

## Dual Governance pause extension

Every standard controller gives `PAUSER_ROLE` to both `CircuitBreaker` and the protocol-wide `ResealManager`. The `ResealManager` is also the controller's only `RESUMER_ROLE` holder.

After Dual Governance leaves its `Normal` state, the [Dual Governance Reseal Committee](/multisigs/committees#2153-dual-governance-reseal-committee-ethereum) can use the Dual Governance path to reseal a controller that is already under a finite pause. The `ResealManager` replaces the finite pause with an indefinite one, which lasts until an explicit authorized resume. This path cannot reseal a controller that is not paused. When the Dual Governance tiebreak conditions are met, the [Tiebreaker Committee](/multisigs/committees#2154-dual-governance-tiebreaker-committees-ethereum) can resume a controller paused through either path. See the [Dual Governance guide](/guides/dg-guide).

This mechanism is separate from the Lend Emergency Brakes Committee, which can only start its configured finite pause.

## Lido DAO

The Lido DAO holds every power that is not delegated to a committee or exposed through the Easy Track factories. DAO votes are subject to Dual Governance where applicable.

| DAO action | Scope |
| --- | --- |
| Change revenue settings | Set the core fee recipient (`setFeeRecipient`) |
| Change a live market's IRM route | Switch the model selected by `IrmRouter.setMarketIrm` |
| Recover assets of auxiliary contracts | Recover assets held directly by `LidoLendPreseeder` |
| Administer authority | Grant or revoke roles, transfer core ownership, rotate the IRM owners and managers |
| Change contract code | Upgrade a proxy, transfer its admin, or irreversibly ossify it |

When the Lido DAO Agent does not hold the required role, the vote must use an authorized caller or grant the role before calling the setter. Recovery functions can move only assets held directly by the auxiliary contract, not assets in user positions.

## Direct account bans

`GuardianSignals.ACCESS_LIMITER_ROLE` has no holder in the initial setup. No committee can therefore impose a ban directly. Bans arise only when guardian flags reach the quorum.

Changing this requires a separate Lido DAO action to grant the role. A holder of the role could ban one account in one market without guardian quorum (`ban`). The ban blocks borrowing by, for or to that account and stops its activating collateral from maturing. It does not close the position, block repayment, or move assets.

The registry admin, the Lido DAO Agent, can grant or revoke the role, and a holder can renounce it. In the initial setup, a ban is lifted through the Lend Operational Committee's `UnbanAccounts` motion, which calls `unban` through `LidoLendOwner` (`ACCESS_RESTORER_ROLE`).
