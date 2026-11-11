---
title: Risks
description: Risks of using Lido Lend markets and how the protocol limits them.
---

# Risks

This page describes the main risks of supplying, borrowing and liquidating in Lido Lend markets, and the mechanisms that limit them. It is for lenders, borrowers and risk reviewers. The list is not complete, and the mitigations reduce risks but do not remove them. This page is not legal, financial or investment advice. Users are responsible for their own assessment.

## Smart contracts and the modified fork

**Risk:** Lido Lend is a modified fork of Morpho Blue. The changes add new security assumptions, and the upstream audits, formal verification and track record do not carry over automatically. Integrations built for Morpho Blue can behave differently because of the additional controller checks. Lido Lend contracts can contain bugs that cause loss of funds or block market actions.

**Mitigation:** the fork changes are documented in [`FORK_NOTES.md`](https://github.com/lidofinance/lend/blob/422d589f9d098124249b54b55306884165833207/FORK_NOTES.md). The contracts went through external audits, listed on [Audits](./audits). Vulnerability reporting is described on [Security](./security). See [Core](./architecture/core) for the core design.

## Upgradeability

**Risk:** the core, the IRM router, controllers, vaults and guardian registries are deployed behind upgradeable proxies. A proxy admin can replace contract code, and therefore has full power over state and funds, until the proxy is ossified. The immutability guarantees of upstream Morpho Blue apply only after ossification.

**Mitigation:** only the Lido DAO, as proxy admin, can upgrade contracts, transfer proxy administration or ossify a proxy. No committee can upgrade contracts. DAO votes are subject to Dual Governance where applicable. See [Roles and permissions](./governance/roles-and-permissions).

## Shared components

**Risk:** one core holds the tokens of all markets. Token custody is shared by token address, so a failing token affects every market that uses it, and a flash loan can use the core's full balance of a token across markets. Core authorization is global: an operator authorized by an account can act for that account in every market of the core. An oracle, IRM or `GuardianSignals` registry shared by several markets affects all of them if it fails or is changed.

**Mitigation:** positions, collateral and market totals are isolated per market id, and assets in one market do not back positions in another. Freeze and pause apply per market. Sharing of oracles, IRMs and guardian registries is decided per market. See [Core](./architecture/core).

## Oracle

**Risk:** a wrong or stale value can allow unsafe borrowing, block actions, or misprice liquidation and settlement.

**Mitigation:** detection and response are operational, for example a controller pause. See [Core](./architecture/core#trust-assumptions-and-limitations).

## Interest rate model

**Risk:** the selected IRM and its configuration determine interest accrual. A reverting, reentrant or extreme-rate model can block or distort a market. IRM roles can change the rate routing or configuration after market creation, including after the router proxy is ossified.

**Mitigation:** the included `AdaptiveCurveConfig` validates its parameters against fixed bounds when it is deployed, and `maxBorrowRate` can cap the rate that `AdaptiveCurveIrm` returns. These bounds protect the implementation's arithmetic. They do not make a parameter set economically suitable. IRM configuration changes go through the governance roles described in [Roles and permissions](./governance/roles-and-permissions). See [Interest rate model](./architecture/interest-rate-model).

## Lender liquidity and exits

**Risk:** borrowers use the supplied loan tokens, so a lender's full claim may not be withdrawable at once. At high utilization, ordinary withdrawal is limited by free market liquidity.

**Mitigation:** when free liquidity is not enough, a lender can exit through settlement and receive collateral at the oracle price. A vault lender can use the fallback exit, which pays free liquidity first and settles the rest. See [Settlement](./architecture/settlement).

## Settlement for borrowers

**Risk:** during a liquidity shortage, a borrower's debt can be cancelled against collateral at the oracle price, without a liquidation incentive. By default, settlement targets the borrower with the highest LTV in the market.

**Mitigation:** settlement covers only the part of a lender's supply that free liquidity cannot cover. Each settlement is capped by the market's settlement policy, so a large exit may take several transactions. Settlement is blocked while the top borrower in the queue has bad debt. Settlement is enabled or disabled per market at creation. See [Settlement](./architecture/settlement).

## Liquidation and bad debt

**Risk:** a position whose debt exceeds its LLTV-adjusted collateral value can be liquidated by anyone. The liquidator repays debt and may receive collateral with a liquidation incentive. If a liquidation exhausts the collateral and debt remains, the core writes the remaining debt off against suppliers, so lenders bear the loss. The core safety model assumes that the oracle price cannot fall at once below its previous value multiplied by `LLTV * LIF`. A larger jump can create bad debt before liquidation can act.

**Mitigation:** liquidation is permissionless and stays available during a market freeze. Each market's `lltv` is selected by governance and fixed when the market is created. See [Liquidations](./guides/liquidations) and [Core](./architecture/core).

## Freeze and pause

**Risk:** a controller pause blocks every controller-checked action in a market, including repayment, liquidation, settlement and lender withdrawal, while interest keeps accruing. A borrower cannot repay during a pause. A market freeze stops new borrowing, collateral withdrawal from positions with debt, and collateral activation.

**Mitigation:** freeze and pause apply per market. A pause has a fixed duration set in the `CircuitBreaker`. The Lend Emergency Brakes Committee cannot choose the duration, extend a pause or end it early. It cannot pause the same controller again until a Lend Operational Committee motion registers it again as the pauser for that controller. The Dual Governance Reseal Manager can extend a pause or end it early. A freeze leaves repayment, liquidation, settlement and lender withdrawal available. Unfreezing requires a Lend Operational Committee motion. See [Market controller](./architecture/market-controller).

## Governance and committee actions

**Risk:** committee members can make wrong or delayed decisions, or lose access to their keys. Governance roles can change the settings assigned to them, such as the supply cap, collateral-activation, settlement and IRM configuration.

**Mitigation:** committees are multisigs with signing thresholds. The Lend Risk Steward Committee can only tighten settings and freeze a market. The Lend Operational Committee acts only through Easy Track motions, which LDO holders can object to. No committee can upgrade contracts or move user funds. Contract upgrades and role administration require Lido DAO votes. See [Committees](./governance/committees) and [Roles and permissions](./governance/roles-and-permissions).

## Guardian screening

**Risk:** Guardians screen new collateral off-chain. They stop collateral from becoming borrowing capacity, but they do not keep funds out of the market. The `GuardianSignals` registry checks the referenced block hash in a heartbeat, but it cannot verify the scan itself or the scan timestamp. A party that controls a quorum of Guardian identities can advance the scan frontier without scanning, and the quorum is set per registry and may be one. If Guardian reports do not arrive in time, collateral activates after the fallback deadline without them.

**Mitigation:** a ban requires flags from a quorum of distinct Guardian identities. A ban blocks new borrowing and collateral activation. It does not block repayment, liquidation, settlement or collateral withdrawal. Guardians cannot lift a ban, change market settings or move user funds. A ban is lifted only through a Lend Operational Committee motion. See [Guardian signals](./architecture/guardian-signals).

## Collateral and loan assets

**Risk:** each collateral and loan asset carries its own risks. A token with transfer restrictions can reject a transfer to a borrower, receiver or liquidator, and the action then fails. The protocol cannot bypass an issuer freeze or blocklist on a loan token. The protocol also assumes that tokens move the exact requested amount, without fees, rebasing or callbacks into the protocol.

**Mitigation:** each market is assessed separately, and its parameters are published on the Lido Research Forum before its activation motion. A controller pause can stop liquidation and settlement in an affected market. See [Market onboarding](./governance/market-onboarding).

## Sources

- [Lido Lend architecture: trust boundaries](https://github.com/lidofinance/lend-markets/blob/main/docs/specs/architecture.md#trust-boundaries)
- [Lido Lend core specification: trust assumptions](https://github.com/lidofinance/lend/blob/422d589f9d098124249b54b55306884165833207/SPECIFICATION.md#trust-assumptions)
- [Lido Lend IRM specification: trust assumptions and failure modes](https://github.com/lidofinance/lend-irm/blob/566d31f7dfdf83d07a6593f641f7474c263a7f89/SPECIFICATION.md#trust-assumptions-and-failure-modes)
