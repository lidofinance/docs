---
title: Glossary
description: Terms used in the Lido Lend documentation.
---

# Glossary

This page defines the terms used in the Lido Lend documentation. The definitions follow the [lend-markets specifications](https://github.com/lidofinance/lend-markets/blob/main/docs/specs/README.md), the [core specification](https://github.com/lidofinance/lend/blob/422d589f9d098124249b54b55306884165833207/SPECIFICATION.md) and the [IRM specification](https://github.com/lidofinance/lend-irm/blob/566d31f7dfdf83d07a6593f641f7474c263a7f89/SPECIFICATION.md).

## A

**Access limiter** (`ACCESS_LIMITER_ROLE`) — A `GuardianSignals` role that can ban one account in one market without a guardian quorum. The production deployment grants this role to no one. See [Roles and permissions](./governance/roles-and-permissions).

**Access restorer** (`ACCESS_RESTORER_ROLE`) — A `GuardianSignals` role that clears the ban of one account in one market, together with all flags for that account. Suspect reports stay. The initial holder is `LidoLendOwner`. See [Roles and permissions](./governance/roles-and-permissions).

**Activating lot** — The activating collateral of one borrower. All of it shares one start time and one stored base delay. See [Market controller](./architecture/market-controller).

**Activation lock** (`activatingLockDuration`) — A period from the start of an activating lot during which the borrower cannot voluntarily withdraw the inactive collateral. Active collateral stays withdrawable. The lock is capped at seven days. See [Market controller](./architecture/market-controller).

**Active collateral** — The part of a borrower's collateral that is neither dust nor activating. It counts toward borrow capacity only when the total active amount reaches `minActivationAmount`. See [Market controller](./architecture/market-controller).

**`AdaptiveCurveIrm`** — The standard interest-rate model. It is the Morpho adaptive curve with per-market parameters and an optional cap on the borrow rate. It stores one config address and one adapting `rateAtTarget` for each market. See [Interest rate model](./architecture/interest-rate-model).

## B

**Bad debt** — In settlement policy, a position whose debt value exceeds its collateral value. While the risk queue root has bad debt, every settlement in the market reverts. See [Settlement](./architecture/settlement).

**Ban** — An account state in one market. A borrow reverts when its caller, debt owner or loan receiver is banned. A banned borrower's activating collateral cannot mature. A ban does not directly block repayment, liquidation, settlement or a debt-free collateral withdrawal. A latched ban stays until an authorized unban. A derived ban exists when current flags meet a newly lowered quorum and no latch is written. See [Guardian signals](./architecture/guardian-signals).

**Base delay** — The part of the activation delay that depends on recent non-instant collateral inflow across the market. It goes from `minActivationDelay` to `maxActivationDelay` as inflow approaches `maxDelayInflow`. Guardian strikes and suspect reports add separate surcharges on top of it when the controller computes the unlock time. See [Market controller](./architecture/market-controller).

**Borrow capacity** — The amount a borrower may owe under controller policy: the oracle value of active collateral multiplied by LLTV, rounded down. It is zero while active collateral is below `minActivationAmount`. See [Market controller](./architecture/market-controller).

**Borrow share** — The core's integer unit of borrower debt. Its value in loan assets changes as interest accrues. See [Core](./architecture/core).

**Borrow-share-rate transition guard** — A controller check that keeps the ratio of borrow shares to borrow assets at most ten times the core's empty-market ratio. Every borrow must leave the market within this ceiling, and repayment and settlement may not move the market above it. Liquidation is exempt. The guard protects the `uint128` share total from overflow. See [Market controller](./architecture/market-controller).

**`Bundler3`** — A contract that executes a bundle of calls in a chosen order. Protocol adapters act for the bundle's original user. `Bundler3` itself must not receive token approvals or core authorization. See [Bundler integration](./guides/bundler-integration).

## C

**`CircuitBreaker`** — A contract that lets a registered pauser apply one finite pause to a market controller while the pauser keeps a live heartbeat. A successful pause consumes the registration. The `EVMScriptExecutor` is its immutable `ADMIN`. See [Roles and permissions](./governance/roles-and-permissions).

**Collateral activation** — The controller policy that delays when new collateral supports new borrowing. New collateral protects the position from liquidation at once, but it counts toward borrow capacity only after it becomes active. See [Market controller](./architecture/market-controller).

**Config (IRM)** — A contract that returns the parameters of one interest-rate model. It takes effect only when an authorized caller applies it to a market. See [Interest rate model](./architecture/interest-rate-model).

## D

**Delegate** — An address that a guardian appoints to report for it. Reports and heartbeats are stored under the guardian identity. Active delegates are unique and are never guardian addresses. See [Guardian signals](./architecture/guardian-signals).

**Direct lender** — A lender that supplies loan tokens to the core and owns a supply position there, without a vault. See [Architecture](./architecture).

**Dust** — Inactive collateral without a timer. It comes from a collateral supply that does not reach `minActivationAmount`. A borrower has at most one unresolved dust lot. See [Market controller](./architecture/market-controller).

## E

**Easy Track motion** — A Lido governance route for routine actions. In the intended setup, routine Lido Lend configuration goes through predefined Easy Track motions, which are delayed, open to objections and executed through the `EVMScriptExecutor`. See [Committees](./governance/committees).

**`EVMScriptExecutor`** — The onchain executor that initially holds the routine governance capabilities of Lido Lend. See [Roles and permissions](./governance/roles-and-permissions).

## F

**Fallback exit** — A vault exit (`fallbackExit`) that first withdraws available loan tokens and then settles the remaining claim against the risk queue root. The receiver gets loan tokens, collateral or both. See [Settlement](./architecture/settlement).

**Flag** — A guardian report on one account in one market. Each distinct guardian flag adds one strike. When strikes reach quorum, the account is banned. See [Guardian signals](./architecture/guardian-signals).

**Freeze** — A market state that blocks new borrowing, collateral withdrawal while debt remains, and maturation of activating collateral. Repayment, liquidation, settlement and lender withdrawal stay available. Market stewards can freeze a market. Unfreezing needs `UNFREEZER_ROLE`. See [Market controller](./architecture/market-controller).

## G

**Guardian** — One address in the guardian committee of a `GuardianSignals` registry. It reports flags, suspect reports and heartbeats, directly or through its delegate. See [Guardian signals](./architecture/guardian-signals).

**`GuardianSignals`** — A registry that stores the reports of one guardian committee. One registry may serve several markets. Market controllers read it to restrict borrowing and collateral activation. It does not call the core or move tokens. See [Guardian signals](./architecture/guardian-signals).

## H

**Heartbeat** — A guardian report of how far the guardian has reviewed protocol activity. It contains a block hash, a block number and a guardian-supplied scan timestamp. See [Guardian signals](./architecture/guardian-signals).

## I

**Impact class** — A design label (C0 to C5) in the role specification that describes the effect of a privileged action, from taking user value (C0, not allowed as an operational action) to metadata-only changes (C5). The contracts do not enforce these labels. See [Roles and permissions](./governance/roles-and-permissions).

**Instant-activation caller** — An address that the market manager enables so that collateral supplied through it becomes active at once. It bypasses the deposit floor, dust, the activation delay and the inflow throttle. The setting is keyed by the call sender. No caller is enabled initially. See [Market controller](./architecture/market-controller).

**IRM** — Interest-rate model. It returns a WAD-scaled per-second borrow rate. See [Interest rate model](./architecture/interest-rate-model).

**IRM migration** — Changing the model implementation that `IrmRouter` selects for a market. See [Interest rate model](./architecture/interest-rate-model).

**IRM reconfiguration** — Applying new parameters to the same model instance for the same market. See [Interest rate model](./architecture/interest-rate-model).

**`IrmRouter`** — The stable IRM address stored in the `MarketParams` of a standard market. It forwards rate calls to the implementation selected for that market. See [Interest rate model](./architecture/interest-rate-model).

## L

**Lido DAO Agent** — The onchain address that initially holds the administration, ownership and proxy-upgrade powers assigned to the Lido DAO. See [Roles and permissions](./governance/roles-and-permissions).

**`LidoLend`** — The core contract, a fork of Morpho Blue. One core stores all markets of a deployment, keeps the canonical balances and accounting, and holds the tokens. See [Core](./architecture/core).

**`LidoLendERC4626`** — A vault that combines deposits into one core supply position in one market and issues transferable ERC-4626 shares. See [Settlement](./architecture/settlement).

**`LidoLendOwner`** — The standard governance entry contract. It is the core's initial owner and dispatches controller and `GuardianSignals` calls through separate capability roles. See [Roles and permissions](./governance/roles-and-permissions).

**LIF** — Liquidation incentive factor. It sets how much collateral a liquidator receives per unit of repaid debt: `LIF = min(1.15, 1 / (1 - 0.3 * (1 - LLTV)))`. See [Liquidations](./guides/liquidations).

**Liquidation** — Repayment of an unhealthy position's debt by any account in exchange for collateral, including the liquidation incentive. If collateral reaches zero and debt remains, the core writes that debt off against suppliers. See [Liquidations](./guides/liquidations).

**LLTV** — Liquidation loan-to-value threshold of a market. A position becomes liquidatable when its debt exceeds its LLTV-adjusted collateral value. LLTV is fixed at market creation. See [Core](./architecture/core).

**LTV** — Debt divided by oracle-valued collateral. The controller rounds debt up and collateral value down before it compares them. See [Settlement](./architecture/settlement).

## M

**Managed supply shares** — The core supply shares that a vault creates or consumes through its own deposit, withdrawal and settlement operations. Only these shares back the value of vault shares. See [Settlement](./architecture/settlement).

**Market** — One loan token, one collateral token, an oracle, an IRM and an LLTV. These five fields form `MarketParams`, and the market id is `keccak256(abi.encode(loanToken, collateralToken, oracle, irm, lltv))`. Positions and totals are isolated by market id. See [Architecture](./architecture).

**Market controller** — `LidoLendMarketController`, the policy layer for one market. The core calls it before most market actions, and it allows or rejects each action without changing the amounts. See [Market controller](./architecture/market-controller).

**Market steward** — An address appointed for one market in `RiskStewardDashboard`. A steward can only tighten that market: increase activation delays, the activation lock or the minimum deposit, revoke instant activation or freeze the market. See [Roles and permissions](./governance/roles-and-permissions).

**Maturation** — The move of an activating lot to active collateral. It happens on a later controller hook when the unlock time has passed, the market is not frozen and the borrower is not banned. In addition, the quorum frontier must have reached the unlock time, or the fallback deadline must have passed. See [Market controller](./architecture/market-controller).

## O

**Oracle price** — The conversion rate from collateral-token raw units to loan-token raw units, scaled by `1e36` and adjusted for the decimals of both tokens. See [Core](./architecture/core).

**Ossification** — The step in which a proxy admin permanently removes its own power to upgrade the contract code. See [Architecture](./architecture).

## P

**Pause** — A controller state that blocks every core action that calls the controller, including repayment, liquidation, settlement and explicit interest accrual. Interest keeps accruing. A finite pause expires automatically. See [Market controller](./architecture/market-controller).

**Personal settlement target** — A target LTV below 100% that a borrower selects. While the position is above the target, any lender may settle against it down to the target, whatever its place in the risk queue. A zero target disables it. See [Settlement](./architecture/settlement).

## Q

**Queue root** — The borrower at the top of the risk queue, with the largest stored risk key. Root policy and the vault fallback exit settle against it. See [Settlement](./architecture/settlement).

**Quorum** — The number of distinct guardian flags that bans an account. It is set per `GuardianSignals` registry and stays between one and the current guardian count. It also defines the quorum frontier. See [Guardian signals](./architecture/guardian-signals).

**Quorum frontier** — The quorum-th highest heartbeat timestamp among current guardians. The registry stores the highest value ever recorded, and that stored frontier never moves backward. See [Guardian signals](./architecture/guardian-signals).

## R

**Raw unit** — The smallest integer unit of a token or share value. It is not one whole token. See [Core](./architecture/core).

**Reseal Manager** — The protocol-wide pause-extension authority. It initially holds `PAUSER_ROLE` and `RESUMER_ROLE` on every controller, so it can extend a pause or end it early. See [Roles and permissions](./governance/roles-and-permissions).

**Risk queue** — A max-heap of the borrowers with debt in a market, ordered by `riskKey = borrowShares * 1e18 / rawCollateral`. The key is a rounded estimate of LTV. See [Settlement](./architecture/settlement).

**`RiskStewardDashboard`** — A non-upgradeable contract that holds controller roles. It lets per-market stewards only tighten settings within bounds, revoke instant activation and freeze the market. See [Roles and permissions](./governance/roles-and-permissions).

**Root policy** — The settlement policy that applies to the queue root without borrower action. Its allowance is the largest of a debt fraction (`sliceFloorBps`), an absolute floor (`sliceFloorAssets`) and an LTV step (`ltvStepBps`), capped at the borrower's debt. See [Settlement](./architecture/settlement).

## S

**Seizure floor** — The smallest settlement cut that seizes at least one raw unit of collateral. The controller reports a smaller cut as unavailable. See [Settlement](./architecture/settlement).

**Settleable supply** — A lender's live supply value minus the market's free liquidity. A root-policy settlement cannot cancel more debt than this amount. See [Settlement](./architecture/settlement).

**Settlement** — A lender exit through the core function `settle`. It burns the lender's supply shares to cancel a borrower's debt and transfers collateral of the same oracle value to a chosen receiver, with no liquidation incentive. No loan tokens move. A market enables or disables settlement at creation, and the choice cannot change later. See [Settlement](./architecture/settlement).

**Strike** — One unit of an account's `strikeCount` in one market. Each distinct guardian flag adds one strike, and each strike adds `delayPerStrike` to the account's activation delay. See [Guardian signals](./architecture/guardian-signals).

**Supply cap** — An admission limit on lender supply in one market. Zero means uncapped. Interest can carry total supply above the cap. See [Market controller](./architecture/market-controller).

**Supply share** — The core's integer unit of supplier ownership. Its value in loan assets changes as interest accrues. See [Core](./architecture/core).

**Supply-share budget** — The maximum number of core supply shares that one settlement quote may consume. See [Settlement](./architecture/settlement).

**Suspect report** — A guardian report on one account in one market that can add activation delay but never bans. It stays active for the suspect window. See [Guardian signals](./architecture/guardian-signals).

**Suspect window** — The period during which a suspect report stays active. It is set per `GuardianSignals` registry and cannot exceed 30 days. See [Guardian signals](./architecture/guardian-signals).

## T

**Targeted vault settlement** — A vault exit in which the vault-share owner settles against a caller-ordered list of borrowers. It uses personal settlement targets only and pays the receiver in collateral. See [Settlement](./architecture/settlement).

## U

**Unlock time** — The earliest time an activating lot can mature: its start plus the stored base delay plus guardian surcharges for strikes and, when they apply, suspect reports. See [Market controller](./architecture/market-controller).

**Utilization** — Total borrow assets divided by total supply assets, WAD-scaled. See [Interest rate model](./architecture/interest-rate-model).

## W

**WAD** — The fixed-point scale `1e18`. Ratios use WAD, and rates use WAD per second. See [Interest rate model](./architecture/interest-rate-model).
