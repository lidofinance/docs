---
title: Glossary
description: Terms used in the Lido Lend documentation.
---

# Glossary

This page defines the terms used in the Lido Lend documentation. The definitions follow the [lend-markets specifications](https://github.com/lidofinance/lend-markets/blob/23416c43c4038ea3c00a13d6203949c8f88905cc/docs/specs/README.md), the [core specification](https://github.com/lidofinance/lend/blob/4d55f1dd98a0f7712543965c66e03c963a004263/SPECIFICATION.md) and the [IRM specification](https://github.com/lidofinance/lend-irm/blob/97af4c39c51f1e023d8025319f34a1658036066c/SPECIFICATION.md).

## A

**Access limiter** (`ACCESS_LIMITER_ROLE`) — A `GuardianSignals` role that can ban one account in one market without a guardian quorum. The production deployment grants this role to no one.

**Access restorer** (`ACCESS_RESTORER_ROLE`) — A `GuardianSignals` role that clears the ban of one account in one market, together with all flags for that account. Suspect reports stay. The initial holder is `LidoLendOwner`.

**Activation lock** (`activatingLockDuration`) — A period from the start of collateral activation during which the borrower cannot voluntarily withdraw the inactive collateral. Active collateral stays withdrawable. After the lock ends, or always when the lock is 0, a voluntary withdrawal must take the whole inactive balance at once, or it reverts. A top-up that extends the delay restarts the lock. The lock is capped at seven days.

**Active collateral** — The part of a borrower's collateral that is neither dust nor activating. It counts toward borrow capacity only when the total active amount reaches `minActivationAmount`.

**`AdaptiveCurveIrm`** — The standard interest-rate model. It is the Morpho adaptive curve with per-market parameters and an optional cap on the borrow rate. It stores one config address and one adapting `rateAtTarget` for each market.

## B

**Bad debt** — In settlement policy, a position whose debt value exceeds its collateral value. While the risk queue root has bad debt, every settlement in the market reverts.

**Ban** — An account state in one market. A borrow reverts when its caller, debt owner or loan receiver is banned. A banned borrower's activating collateral cannot mature. A ban does not block repayment, liquidation, settlement or collateral withdrawal. A latched ban stays until an authorized unban. A derived ban exists when current flags meet a newly lowered quorum and no latch is written.

**Base delay** — The part of the activation delay that depends on recent non-instant collateral inflow across the market. It goes from `minActivationDelay` to `maxActivationDelay` as inflow approaches `maxDelayInflow`. Guardian flags and suspect reports add separate surcharges on top of it.

**Borrow capacity** — The amount a borrower may owe under controller policy: the oracle value of active collateral multiplied by LLTV, rounded down. It is zero while active collateral is below `minActivationAmount`.

**Borrow share** — The core's integer unit of borrower debt. Its value in loan assets changes as interest accrues.

**Borrow-share-rate transition guard** — A controller check that keeps the ratio of borrow shares to borrow assets at most ten times the core's empty-market ratio. Every borrow must leave the market within this ceiling, and repayment and settlement may not move the market above it. Liquidation is exempt. The guard protects the `uint128` share total from overflow.

**`Bundler3`** — A contract that executes a bundle of calls in a chosen order. Protocol adapters act for the bundle's original user. `Bundler3` itself must not receive token approvals or core authorization.

## C

**`CircuitBreaker`** — A contract that lets a registered pauser apply one finite pause to a market controller while the pauser keeps a live heartbeat. A successful pause consumes the registration. The `EVMScriptExecutor` is its immutable `ADMIN`.

**Collateral activation** — The controller policy that delays when new collateral supports new borrowing. New collateral protects the position from liquidation at once, but it counts toward borrow capacity only after it becomes active.

**Config (IRM)** — A contract that returns the parameters of one interest-rate model. It takes effect only when an authorized caller applies it to a market.

## D

**Delegate** — An address that a guardian appoints to report for it. Reports and heartbeats are stored under the guardian identity. Active delegates are unique and are never guardian addresses.

**Direct lender** — A lender that supplies loan tokens to the core and owns a supply position there, without a vault. See [Architecture](./architecture).

**Dust** — Inactive collateral without a timer. It comes from a collateral supply that does not reach `minActivationAmount`. A borrower has at most one unresolved dust lot.

## E

**Easy Track motion** — A Lido governance route for routine actions. In the intended setup, routine Lido Lend configuration goes through predefined Easy Track motions, which are delayed, open to objections and executed through the `EVMScriptExecutor`. See [Committees](./committees).

**`EVMScriptExecutor`** — The onchain executor that initially holds the routine governance capabilities of Lido Lend.

## F

**Fallback exit** — A vault exit (`fallbackExit`) that first withdraws available loan tokens and then settles the remaining claim against the risk queue root. The receiver gets loan tokens, collateral or both.

**Flag** — A guardian report on one account in one market. Each flag adds a delay to the collateral activation of the account. When flags from distinct guardians reach the quorum, the account is banned.

**Freeze** — A market state that blocks new borrowing, collateral withdrawal while debt remains, and maturation of activating collateral. Repayment, liquidation, settlement and lender withdrawal stay available. Market stewards can freeze a market. Unfreezing needs `UNFREEZER_ROLE`.

## G

**Guardian** — One address in the guardian committee of a `GuardianSignals` registry. It reports flags, suspect reports and heartbeats, directly or through its delegate.

**`GuardianSignals`** — A registry that stores the reports of one guardian committee. One registry may serve several markets. Market controllers read it to restrict borrowing and collateral activation. It does not call the core or move tokens.

## H

**Heartbeat** — A guardian report of how far the guardian has reviewed protocol activity. It contains a block hash, a block number and a guardian-supplied scan timestamp.

## I

**Instant-activation caller** — An address that the market manager enables so that collateral supplied through it becomes active at once. It bypasses the deposit floor, dust, the activation delay and the inflow throttle. The setting is keyed by the call sender. No caller is enabled initially.

**IRM** — Interest-rate model. It returns a per-second borrow rate, scaled by `1e18`.

**`IrmRouter`** — The stable IRM address stored in the `MarketParams` of a standard market. It forwards rate calls to the implementation selected for that market.

## L

**Lido DAO Agent** — The onchain address that initially holds the administration, ownership and proxy-upgrade powers assigned to the Lido DAO.

**`LidoLend`** — The core contract, a fork of Morpho Blue. One core stores all markets of a deployment, keeps the canonical balances and accounting, and holds the tokens.

**`LidoLendERC4626`** — A vault that combines deposits into one core supply position in one market and issues transferable ERC-4626 shares.

**`LidoLendOwner`** — The standard governance entry contract. It is the core's initial owner and dispatches controller and `GuardianSignals` calls through separate capability roles.

**LIF** — Liquidation incentive factor. It sets how much collateral a liquidator receives per unit of repaid debt: `LIF = min(1.15, 1 / (1 - 0.3 * (1 - LLTV)))`.

**Liquidation** — Repayment of an unhealthy position's debt by any account in exchange for collateral, including the liquidation incentive. If collateral reaches zero and debt remains, the core writes that debt off against suppliers.

**LLTV** — Liquidation loan-to-value threshold of a market. A position becomes liquidatable when its debt exceeds its LLTV-adjusted collateral value. LLTV is fixed at market creation.

**LTV** — Debt divided by oracle-valued collateral. The controller rounds debt up and collateral value down before it compares them.

## M

**Market** — One loan token, one collateral token, an oracle, an IRM and an LLTV. These five fields form `MarketParams`, and the market id is `keccak256(abi.encode(loanToken, collateralToken, oracle, irm, lltv))`. Positions and totals are isolated by market id. See [Architecture](./architecture).

**Market controller** — `LidoLendMarketController`, the policy layer for one market. The core calls it before most market actions, and it allows or rejects each action without changing the amounts.

**Market steward** — An address appointed for one market in `RiskStewardDashboard`. A steward can only tighten that market: increase activation delays, the activation lock or the minimum deposit, revoke instant activation or freeze the market.

**Maturation** — The move of activating collateral to active collateral. It happens on a later controller hook when the activation delay has passed, the market is not frozen and the borrower is not banned. In addition, the quorum frontier must have reached the end of the activation delay, or the fallback deadline must have passed.

## O

**Oracle price** — The conversion rate from the smallest collateral-token unit to the smallest loan-token unit, scaled by `1e36` and adjusted for the decimals of both tokens.

**Ossification** — The step in which a proxy admin permanently removes its own power to upgrade the contract code. See [Architecture](./architecture).

## P

**Pause** — A controller state that blocks every core action that calls the controller, including repayment, liquidation, settlement and explicit interest accrual. Interest keeps accruing. A finite pause expires automatically.

**Personal settlement target** — A target LTV below 100% that a borrower selects. While the position is above the target, any lender may settle against it down to the target, whatever its place in the risk queue. A zero target disables it.

## Q

**Queue root** — The borrower at the top of the risk queue, with the largest stored risk key. Settlement without borrower action and the vault fallback exit settle against it.

**Quorum** — The number of distinct guardian flags that bans an account. It is set per `GuardianSignals` registry and stays between one and the current guardian count. It also defines the quorum frontier.

**Quorum frontier** — The quorum-th highest heartbeat timestamp among current guardians. The registry stores the highest value ever recorded, and that stored frontier never moves backward.

## R

**Reseal Manager** — The protocol-wide pause-extension authority. It initially holds `PAUSER_ROLE` and `RESUMER_ROLE` on every controller, so Dual Governance can use it to extend a pause in a governance emergency, or to end one in a tie.

**Risk queue** — A max-heap of the borrowers with debt in a market, ordered by `riskKey = borrowShares * 1e18 / rawCollateral`. The key is a rounded estimate of LTV.

**`RiskStewardDashboard`** — A non-upgradeable contract that holds controller roles. It lets per-market stewards only tighten settings within bounds, revoke instant activation and freeze the market.

## S

**Settlement** — A lender exit through the core function `settle`. It burns the lender's supply shares to cancel a borrower's debt and transfers collateral of the same oracle value to a chosen receiver, with no liquidation incentive. No loan tokens move. A market enables or disables settlement at creation, and the choice cannot change later.

**Supply cap** — An admission limit on lender supply in one market. Zero means uncapped. Interest can carry total supply above the cap.

**Supply share** — The core's integer unit of supplier ownership. Its value in loan assets changes as interest accrues.

**Suspect report** — A guardian report on one account in one market that can add activation delay but never bans. It stays active for the suspect window.

**Suspect window** — The period during which a suspect report stays active. It is set per `GuardianSignals` registry and cannot exceed 30 days.

## T

**Targeted vault settlement** — A vault exit in which the vault-share owner settles against a caller-ordered list of borrowers. It uses personal settlement targets only and pays the receiver in collateral.

## U

**Utilization** — Total borrow assets divided by total supply assets, scaled by `1e18`.
