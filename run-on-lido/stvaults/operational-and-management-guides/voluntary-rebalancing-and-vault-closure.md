---
sidebar_position: 4
---

# 🔄 Volunteering Rebalancing and Vault Closure

## TLDR

- **To close a stVault and withdraw all ETH**, you must first eliminate the stETH Liability entirely.
- **Option 1:** Acquire stETH externally and repay it to the stVault to reduce the liability.
- **Option 2:** Use voluntary rebalancing to transfer ETH from the stVault to Lido Core, writing off debt at a 1:1 ratio.
- Once the liability is cleared, the remaining ETH becomes fully withdrawable.

---

## 📚 Definitions

- **Voluntary Rebalancing** — a Vault Owner-initiated action that transfers ETH from the stVault to Lido Core, writing off the equivalent stETH liability at a 1:1 ratio.
- **Reserve Ratio (RR)** — defines the amount of ETH that will be reserved as part of the collateral when the Vault Owner mints stETH in the stVault. stETH isn’t minted for this amount.
- **stETH Liability** — the amount of stETH that the Vault Owner minted in the stVault, backed by the ETH collateral. Increases daily due to the stETH rebase.
- **Total Value** — the total amount of ETH, consisting of ETH staked on validators plus ETH held in the stVault Balance. Rewards accrue to both and increase Total Value.
- **stVault Balance** — the portion of ETH held directly in the StakingVault contract, not staked on validators. Only stVault Balance ETH can be used for rebalancing or withdrawal.
- **Validator Balance** — the portion of ETH staked on validators. To make this ETH available for rebalancing, you must first request validator exits and wait for the exit to complete.

---

## 🔍 Why you need to repay stETH Liability to close an stVault

When you mint stETH against your stVault, you create a **debt obligation** — the stETH Liability. The stVault’s ETH serves as collateral backing that liability.

You cannot simply withdraw all ETH while stETH Liability remains outstanding. To close the stVault and unlock your ETH, you must first eliminate the liability entirely.

There are two ways to do this:

1. **Repay stETH** — acquire stETH externally and repay it back to the stVault to reduce the liability directly.
2. **Voluntary rebalancing** — transfer ETH from the stVault Balance to Lido Core, which writes off the equivalent stETH Liability at a 1:1 ratio.

Once the liability reaches zero, and it's confirmed by a fresh Oracle report, the remaining ETH in the stVault is unlocked to withdraw.

---

## 📝 Option 1 — repay stETH

The standard way to reduce stETH Liability is to acquire stETH and repay it back to the stVault.

### How it works

1. Acquire stETH equal to your stETH Liability (e.g., buy on a DEX, swap ETH → stETH, or use stETH you already hold).
2. Repay the stETH back to the stVault. Each stETH repay reduces the stETH Liability by the same amount.
3. Once the full liability is repaid, the stVault’s ETH is fully withdrawable.

### Calculation

`stETH to Repay = stETH Liability`

For example, an stVault with 1000 ETH Total Value and 400 stETH minted: acquire and repay **400 stETH**.

After repaying, the stVault has 1,000 ETH with zero liability — all of it is withdrawable (once validators are exited and ETH is back in stVault balance, and a fresh Oracle report is applied to the stVault).

---

## 📝 Option 2 — Voluntary rebalancing

If you do not have or do not wish to acquire stETH externally, you can use voluntary rebalancing to repay the liability using the stVault’s own ETH.

### How it works

1. Transfer ETH from the stVault balance to Lido Core.
2. Lido Core writes off the equivalent stETH debt at a 1:1 ratio.
3. The stVault’s stETH Liability decreases by the amount of ETH transferred.

### Trade-offs compared to repaying stETH

- **Cons:** Reduces the stVault’s Total Value. To repay 400 stETH, you spend 400 ETH from the stVault — leaving you with less ETH to withdraw at the end.
- **Cons:** Requires sufficient stVault balance (not validator balance), so you may need to exit validators before rebalancing.
- **Pros:** No need to acquire stETH externally or interact with DEXes.

### How to calculate the ETH needed

To **fully close the stVault**, you are repaying the entire stETH debt. Since voluntary rebalancing writes off stETH at a 1:1 ratio for each ETH transferred, the total ETH required equals the full stETH Liability (**full rebalancing**):

`ETH for full repayment = stETH Liability`

---

## 🔍 Example: closing an stVault with 1,000 ETH and 400 stETH minted

### Initial stVault state

| Metric | Value |
| --- | --- |
| Total Value | 1,000 ETH |
| — Validator Balance | 960 ETH (30 validators × 32 ETH) |
| — stVault Balance | 40 ETH |
| Reserve Ratio (RR) | 5% |
| stETH Liability (minted stETH) | 400 stETH |

### Path A — Repay stETH

1. Acquire 400 stETH externally.
2. Repay 400 stETH against the stVault. stETH Liability drops to **0**.
3. Exit all 30 validators. Wait for ETH to be swept back to the stVault balance.
4. Withdraw all 1,000 ETH.

| Metric | Before | After repay | After withdrawal |
| --- | --- | --- | --- |
| Total Value | 1,000 ETH | 1,000 ETH | 0 ETH |
| stETH Liability | 400 stETH | 0 stETH | 0 stETH |
| ETH withdrawn | — | — | 1,000 ETH |

**Result:** You recover all 1,000 ETH from the stVault (minus any unsettled fees). The 400 stETH used to repay was acquired externally.

### Path B — Voluntary rebalancing

Voluntary rebalancing can only use ETH from the **stVault Balance** (40 ETH here), not from validators directly. Since the full repayment requires 400 ETH, you must exit validators first to move enough ETH into the stVault Balance.

**Step 1 — Exit validators to free up ETH**

You need 400 ETH available in the stVault Balance to fully repay the stETH Liability. Currently, only 40 ETH is available — the remaining 960 ETH is locked on validators.

Request exits for enough validators to cover the shortfall:

`ETH shortfall = stETH Liability − stVault Balance = 400 − 40 = 360 ETH`

At 32 ETH per validator, you need to exit at least **12 validators** (12 × 32 = 384 ETH) to cover the 360 ETH shortfall.

After the exits complete and ETH is swept back to the stVault:

| Metric | Value |
| --- | --- |
| Total Value | 1,000 ETH |
| — Validator Balance | 576 ETH (18 validators × 32 ETH) |
| — stVault Balance | 424 ETH |

The stVault Balance now has enough ETH to cover the full 400 ETH rebalance.

**Step 2 — Calculate the ETH for full rebalancing**

To eliminate all stETH Liability, you must rebalance the full 400 ETH:

`ETH for full repayment = stETH Liability = 400 ETH`

**Step 3 — Execute voluntary rebalancing**

Initiate a voluntary rebalance of **400 ETH**:

1. The stVault transfers 400 ETH to Lido Core.
2. Lido Core writes off 400 stETH debt at a 1:1 ratio.
3. The stVault’s stETH Liability drops from 400 stETH to **0 stETH**.

**Post-rebalancing stVault state**

| Metric | Before | After |
| --- | --- | --- |
| Total Value | 1,000 ETH | 600 ETH |
| — Validator Balance | 576 ETH | 576 ETH |
| — stVault Balance | 424 ETH | 24 ETH |
| stETH Liability | 400 stETH | 0 stETH |

**Step 4 — Withdraw remaining ETH**

With stETH Liability at zero, the remaining **600 ETH** is fully withdrawable. No collateral is locked, and no reserve requirements apply.

Of this 600 ETH, 24 ETH is already in the stVault Balance and can be withdrawn immediately. The remaining 576 ETH is still on validators — exit the remaining 18 validators and withdraw once the ETH is swept back to the stVault.

**Result:** You recover 600 ETH from the stVault. The other 400 ETH was spent on rebalancing.

Keep in mind that **unsettled fees** may reduce the actual withdrawable amount. Fees accrue daily and are deducted from the stVault’s Total Value. Ensure all fees are settled before calculating the final withdrawal amount.

---

## ❗️Important considerations

### stETH Liability grows over time

stETH Liability increases daily due to the stETH rebase. If you calculated 400 stETH today, the actual liability at the time of execution may be slightly higher. Always use the **current** stETH Liability value when executing the repay or rebalance.

### stVault balance vs. staked ETH

Voluntary rebalancing and withdrawals can only use the stVault's **available balance** (unstaked ETH). If the stVault’s ETH is primarily staked on validators, you must first exit enough validators and wait for the ETH to become available in the stVault Balance.

### Partial closure

If you do not have enough stETH or liquid ETH to repay the full liability at once, you can repay in stages — using multiple repays, multiple voluntary rebalances, or a combination of both. Each action reduces the stETH Liability.

### Fees

Unsettled fees reduce the effective Total Value. Factor in accrued fees when planning the closure to avoid a shortfall.