---
title: Settlement and lender exits
sidebar_label: Settlement
description: How lenders exit through settlement when market liquidity is borrowed, including the risk queue, settlement policies, budgeted quotes, and the vault exit paths.
---

# Settlement and lender exits

Lenders normally exit by withdrawing loan tokens from the market's free liquidity. That path cannot serve a large exit when most supplied assets are borrowed. Settlement is an alternative exit: it cancels a borrower's debt against an authorized lender's supply and sends collateral of the same oracle value to a chosen receiver. No liquidation incentive is added. This page is for lenders, vault integrators, and auditors.

Settlement uses the core's `settle` primitive in `LidoLend`, policy in `LidoLendMarketController`, and the exit functions of `LidoLendERC4626`.

:::info Source
Based on [`docs/specs/lender-settlement.md`](https://github.com/lidofinance/lend-markets/blob/main/docs/specs/lender-settlement.md). The deployed code is the final reference.
:::

## Overview

Settlement does not create loan-token liquidity. It reduces market supply and debt together, removes the matching collateral from the borrower, and pays that collateral to the receiver.

| Path | Supplier position | Borrower selection | Receiver gets |
|---|---|---|---|
| Direct core settlement | A direct core supplier, or its authorized operator | One borrower chosen by the caller. Personal policy works for any borrower; root policy needs the live queue root. | Collateral |
| Targeted vault settlement (`settle`) | A vault-share owner, or its approved operator | A caller-ordered list; personal policy only | Collateral |
| Vault fallback exit (`fallbackExit`) | A vault-share owner, or its approved operator | No list. Free liquidity first, then the live queue root. | Loan tokens first, then collateral if settlement is needed |

## Setup and authorization

Settlement must be enabled when the market is created, and this cannot change later. On the direct path, the caller must own the core supply position or be authorized by its owner. The vault paths need ownership of, or allowance over, vault shares. These permissions are independent. The receiver can differ from the position owner.

## Core boundary

The controller quotes an exact borrow-share amount, because that is the core's settlement input. From live totals after interest accrual, the core derives the debt cancellation, supply-share burn, and collateral payout. The formulas and rounding are on the [Core](./core#settlement-entry-point) page.

Before applying the settlement, the core sends the resolved amounts to the controller, which can allow or reject but not change them. The core does not check borrower health. The queue and policies below add that layer.

## Risk queue and bad-debt gate

The controller keeps every borrower with debt in a max-heap, a queue whose first item has the largest key. The first item is the **queue root**, the borrower that automatic settlement targets during a lender exit. The key is:

```text
riskKey = borrowShares * 1e18 / rawCollateral
```

`rawCollateral` is the collateral balance before oracle conversion, and the division rounds down. Within one market all borrowers share the same share rate and price, so the unrounded ratio orders borrowers by LTV. The stored key is a rounded estimate: borrowers with equal keys are not ordered by exact LTV. The controller updates or removes a borrower's entry on every position change.

Before authorizing any settlement, the controller checks the root for bad debt. If the root's debt value exceeds its collateral value, every settlement path reverts until the root becomes solvent or its debt is cleared. Checking one borrower keeps the cost independent of queue length, but it does not prove that every other borrower is solvent.

Because the key is rounded, a borrower with the same `riskKey` as the root can already be insolvent. A personal-policy settlement of that borrower with a partial cut that takes all its collateral could then leave debt with zero collateral. The controller drops that borrower from the queue, and if the debt is later written off, suppliers bear the loss. This requires an exact key tie, the borrower's personal opt-in and a specific partial cut. Positions become liquidatable before insolvency, and the design assumes liquidators act in that window.

The bad-debt check compares debt with 100% of collateral value and ignores the liquidation incentive factor (`LIF`). Ignoring rounding, a root with `1 / LIF < LTV <= 100%` passes the settlement gate even though a collateral-exhausting liquidation would write unpaid debt off against suppliers. The design assumes liquidators act once `LTV > LLTV`. The contracts do not enforce that timing.

## Settlement policies

Two policies size a settlement. Both compute a loan-asset allowance, cap it at the borrower's debt, and convert it to a borrow-share limit. Both are empty when debt or oracle-valued collateral is zero.

### Personal settlement target

A borrower can call `setSettlementLtv(ltv)` to choose a target post-settlement LTV below 100%. Zero disables the personal policy. When the position is above a positive target:

```text
personalSliceAssets =
    (debtAssets * 1e18 - targetLtv * collateralValue)
    / (1e18 - targetLtv)
```

`debtAssets` rounds up. `collateralValue` prices the borrower's entire raw collateral, including collateral that is not yet active, rounded down. The final division rounds down.

A positive allowance lets any authorized supplier settle against the borrower, whatever its queue position and whatever the free liquidity. The borrower picks only the target, not the supplier or receiver. Only the borrower can change the target, and closing the position does not clear it.

> **Example.** Debt is 80, collateral value is 100, and the target is 50%. The formula returns 60. Ignoring rounding, settlement leaves debt of 20 and collateral value of 40, which is 50% LTV.

### Queue-root policy

The root policy needs no borrower opt-in, but it applies only while that borrower is the live root. Its allowance is the largest of three terms:

| Rule | Loan-asset allowance |
|---|---|
| Debt fraction | `floor(debtAssets * sliceFloorBps / 10_000)` |
| Absolute floor | `sliceFloorAssets` |
| LTV step | The amount that lowers the current LTV by `ltvStepBps / 10_000`; `0` when `ltvStepBps = 0` |

When `ltvStepBps` is not zero, the LTV-step term reuses the personal formula with this target:

```text
currentLtv = floor(debtAssets * 1e18 / collateralValue)
ltvReduction = floor(ltvStepBps * 1e18 / 10_000)
stepTargetLtv = max(currentLtv - ltvReduction, 0)
```

The term is zero when `ltvStepBps = 0` or when `stepTargetLtv >= 1e18` ([`SettlementQueueLib.sol`](https://github.com/lidofinance/lend-markets/blob/main/src/libs/SettlementQueueLib.sol#L251), [L294–L299](https://github.com/lidofinance/lend-markets/blob/main/src/libs/SettlementQueueLib.sol#L294-L299)).

The result is capped at the borrower's debt. The controller then estimates the remaining collateral:

```text
estimatedSeizedCollateral = floor(nominalAllowance * 1e36 / oraclePrice)
estimatedRemainingCollateral = max(rawCollateral - estimatedSeizedCollateral, 0)
```

If a positive allowance leaves `estimatedRemainingCollateral < fullCutBelowCollateral`, the root allowance becomes the full debt. This applies only to the root policy.

> **Example.** A root has debt of 1,000 at 92% LTV. With `sliceFloorBps = 500`, `sliceFloorAssets = 100`, and `ltvStepBps = 100`, the terms give 50, 100, and about 120. The root allowance is 120. The supply-share budget and the settleable-supply limit can still reduce or reject it.

## Budgeted quotes

Policy sets the nominal amount. The settling supplier sets how many core supply shares it can spend. The controller combines both into one quote:

```text
affordableBorrowShares =
    assets represented by budgetSupplyShares, rounded down,
    converted to borrow shares, rounded down

quotedBorrowShares = min(policyBorrowShares, affordableBorrowShares)
quotedSupplyShares = debt assets represented by quotedBorrowShares, rounded up,
                     converted to supply shares, rounded up
```

The policy allowance is converted to borrow shares and rounded up, so canceled debt can exceed the asset allowance slightly. Against one market snapshot:

```text
canceledDebt - assetAllowance <= ceil((totalBorrowAssets + 1) / (totalBorrowShares + 1e6))
```

Each quote has the predicted supply-share burn, the exact borrow shares to pass to the core, and the borrow shares left after settlement. Zero remaining shares marks a full close. If the budget cannot fund a full close, the quote returns a smaller partial settlement. At the quote's snapshot, the core's supply burn never exceeds the supplied budget.

### Seizure floor

The core prices the seizure from canceled debt rounded down:

```text
cutAssets        = assets represented by quotedBorrowShares, rounded down
seizedCollateral = floor(cutAssets * 1e36 / oraclePrice)
```

`settle` rejects a cut with zero `seizedCollateral`. When `oraclePrice > 1e36`, the smallest executable cut is `ceil(oraclePrice / 1e36)` loan-asset units. The controller applies the same calculation and reports such a cut as unavailable, so a quote handed to the core is never rejected for seizing nothing.

### Quote views

- `settlementFor(borrower, budgetSupplyShares)` returns independently budgeted personal and prospective root-policy candidates, which are alternatives and not amounts to add;
- `nextSettlementBorrower(budgetSupplyShares)` returns the live root and the larger of its personal and root-policy allowances, budgeted to the supplied shares, or the zero address for an empty queue.

A zero budget asks for the unbudgeted policy quote. Quotes simulate pending interest at read time. A quote read for a later direct-core transaction can go stale when interest, the root, the price, or the position changes before inclusion.

## Controller execution rules

The controller reads the oracle again to evaluate the queue and policy limits. Settleable supply models the supplier withdrawing all free liquidity first:

```text
supplierSupplyAssets   = supplier's live core supply value, rounded down
marketFreeLiquidity    = max(totalSupplyAssets - totalBorrowAssets, 0)
settleableSupplyAssets = max(supplierSupplyAssets - marketFreeLiquidity, 0)
```

With `P` the personal allowance in borrow shares, `R` the root allowance in borrow shares (zero when the borrower is not the root), `C` the borrow shares the core cancels, `A` the canceled debt in loan assets, and `T` the supplier's settleable supply, the first matching row decides:

| Condition | Result |
|---|---|
| The live queue root has bad debt | Reject every settlement. |
| `C <= P` | Allow as personal policy, whether or not the borrower is the root. `T` is not checked. |
| The borrower is not the live root | Reject. |
| `C > max(P, R)` | Reject. |
| `A > T` | Reject. |
| Otherwise | Allow as root policy. |

The table classifies the whole cut and never splits it between policies. A root-policy settlement equal to the settleable supply succeeds; one raw unit more is rejected.

Every settlement also passes the [borrow-share-rate guard](./market-controller#borrow-share-rate-transition-guard). The controller removes seized collateral from the borrower's activation buckets. Freeze, guardian bans, and activation locks do not block settlement because it reduces the position. A controller pause blocks it.

## Vault accounting

A `LidoLendERC4626` vault represents one supplier position in one market. Vault shares are transferable and are backed only by **managed supply shares**: core supply shares created or consumed by the vault's own operations. Core shares credited to the vault by third parties and loan tokens sent to the vault directly are not counted as backing.

```text
managedSupplyShares <= actual core supply shares held by the vault
```

For either settlement entry point, a request for `requestedVaultShares` gets this core budget:

```text
redeemAssets = previewRedeem(requestedVaultShares)
settlingSupplyShares =
    floor(redeemAssets * (totalCoreSupplyShares + 1e6) / (totalCoreSupplyAssets + 1))
```

Both vault exits need non-zero shares, a non-zero receiver, and a request no larger than the owner's vault-share balance.

### Targeted vault settlement

`settle(shares, borrowers, receiver, owner)` does not withdraw or reserve loan-token liquidity. For each borrower in the caller's list, the vault asks the controller for the **personal** settlement budgeted to the remaining supply shares and passes it to the core. Root policy is not available on this path.

Borrowers without a positive personal settlement consume nothing. Iteration stops when the budget runs out or the list ends. If no supply share is consumed, the call reverts. The receiver gets only collateral. For a partial result, the vault burns the same proportion of the request, rounded up:

```text
vaultSharesBurned =
    ceil(requestedVaultShares * consumedSupplyShares / settlingSupplyShares)
```

### Vault fallback exit

`fallbackExit(shares, receiver, owner, maxIterations)` runs two steps in one transaction:

1. withdraw as many loan tokens as the vault's core position can withdraw now, and stop if this covers the whole request;
2. for the remaining shares, compute the supply budget and repeatedly settle against the live queue root's larger personal-or-root allowance, sending collateral to the same receiver.

The loop stops when the budget is exhausted, when the queue gives no executable settlement, or when the iteration bound is reached. A zero `maxIterations` selects `DEFAULT_MAX_SETTLEMENT_ITERATIONS = 50`. The bound counts attempts, not distinct borrowers. A call that makes progress returns a partial result, so a large exit can need several calls. A root candidate that the core rejects reverts the call.

:::note Head-of-line rounding boundary
A root whose executable cut falls under the [seizure floor](#seizure-floor) quotes nothing, so the loop stops there instead of moving to later borrowers. Repaying that root's remaining borrow shares on its behalf lets later calls advance.
:::

`FallbackExit` reports `sharesBurned` for the whole call, `sharesSettled` for the settlement step, and `assetsWithdrawn` for the liquid step. Each core settlement also emits a borrower-specific `Settle` event.

## Parameters

| Parameter | Meaning | Who can change it | Bounds |
|---|---|---|---|
| Settlement enabled | Whether `settle` is available in the market | Fixed at market creation | Requires a controller |
| `sliceFloorBps` | Root allowance as a share of borrower debt | `MANAGER_ROLE` (`setSettlementConfig`) | At most `10_000` (100%) |
| `sliceFloorAssets` | Minimum root allowance in loan-token units | `MANAGER_ROLE` | `uint96` |
| `ltvStepBps` | LTV reduction per root settlement | `MANAGER_ROLE` | At most `10_000` (100%) |
| `fullCutBelowCollateral` | Remaining collateral below which a root cut becomes a full close | `MANAGER_ROLE` | `0` disables |
| Personal target LTV | Borrower's own settlement target | The borrower (`setSettlementLtv`) | Below `1e18` (100%); `0` disables |
| `DEFAULT_MAX_SETTLEMENT_ITERATIONS` | Default fallback-exit attempt bound | Fixed in code | `50` |

## Permissions

- governance sets the settlement configuration through `LidoLendOwner` (`MARKET_MANAGER_ROLE`), which holds `MANAGER_ROLE` on the controller;
- `RiskStewardDashboard` also holds `MANAGER_ROLE`, but it has no settlement setter;
- each borrower sets only its own personal target;
- a direct supplier or its core-authorized operator calls `settle` on the core;
- a vault-share owner or an address with vault-share allowance calls the vault exits.

See [Roles and permissions](../governance/roles-and-permissions).

## Trust assumptions and limitations

- settlement pays collateral at the oracle price, so a wrong or stale price, or a gap between the oracle and the market price, passes directly to the receiver;
- the bad-debt gate checks only the queue root, and rounded keys can hide an insolvent non-root borrower;
- the gate ignores the liquidation incentive, and the design relies on liquidators acting once `LTV > LLTV`;
- a direct-core quote can go stale before inclusion;
- a root under the seizure floor blocks `fallbackExit` until someone repays it;
- after the last vault shares are burned, managed supply and borrower debt can remain.

## Related

- [Architecture overview](../architecture)
- [Core](./core)
- [Market controller](./market-controller)
- [Full settlement specification on GitHub](https://github.com/lidofinance/lend-markets/blob/main/docs/specs/lender-settlement.md)
