---
title: Bundling Lido Lend transactions with Bundler3
sidebar_label: Bundler integration
description: How a frontend builds one-signature Lido Lend transactions with Bundler3, the general adapter and the Lido Lend vault adapter.
---

# Bundling Lido Lend transactions with Bundler3

This guide is for frontend integrators. One user action in Lido Lend is usually several onchain calls: approve, wrap, supply collateral, borrow. `Bundler3` runs these calls as one transaction. The user signs once, and the whole action either lands or reverts.

This guide covers how to build a bundle, the rules that decide whether it works, and recipes for the common flows. Two of the recipes use actions that exist only in Lido Lend: the Lido staking actions of the general adapter and `fallbackExit` of the vault adapter.

## Prerequisites

- The addresses of the Lido Lend `Bundler3`, `EthereumGeneralAdapter1` and `LidoLendVaultAdapter`, and of the `LidoLend` core, from [Deployed contracts](../deployed-contracts);
- the `MarketParams` of the target market;
- a JavaScript environment with [ethers v6](https://docs.ethers.org/v6/). The samples below use it.

:::info
Lido Lend deploys its own `Bundler3`, not Morpho's dispatcher, and binds both adapters to it. The general adapter is bound to the Lido Lend core, so use the Lido Lend `Bundler3` and adapters, not Morpho's.
:::

## How it works

### The call model

`Bundler3.multicall(Call[])` runs the calls in order, in one transaction:

```solidity
struct Call {
    address to;           // usually an adapter
    bytes   data;         // ABI-encoded action
    uint256 value;        // ETH forwarded with this call
    bool    skipRevert;   // true = ignore this call's revert (use with care)
    bytes32 callbackHash; // commits to a re-entrant sub-bundle; 0 for plain calls
}
```

While the bundle runs, `Bundler3` records the sender as the **initiator**. The adapters read it to know whose position they act on. For this reason `morphoBorrow`, `morphoWithdraw`, `morphoWithdrawCollateral` and the vault adapter's `fallbackExit` take no owner argument: they always act for the initiator.

Adapters are stateless conduits, not vaults. They hold tokens only between two calls of the same bundle. Any token left on an adapter after the transaction can be taken by the next bundle, from any user (see rule 4).

Every adapter action has the `onlyBundler3` modifier. A direct call to an adapter reverts with `UnauthorizedSender()`.

### The adapters

| Adapter | Origin | Actions used in this guide |
| --- | --- | --- |
| `EthereumGeneralAdapter1` | Upstream Bundler3 adapter, vendored with the MORPHO token actions removed | ERC-20 transfers, WETH wrap and unwrap, core actions (`morphoSupply`, `morphoSupplyCollateral`, `morphoBorrow`, `morphoRepay`, `morphoWithdraw`, `morphoWithdrawCollateral`), ERC-4626 actions, Lido actions (`stakeEth`, `wrapStEth`, `unwrapStEth`) |
| `LidoLendVaultAdapter` | Lido Lend | `fallbackExit`, plus `erc20Transfer` and `nativeTransfer` inherited from `CoreAdapter` |

The general adapter binds WETH, stETH and wstETH as immutables. The mainnet configuration binds canonical WETH9 and Lido wstETH; stETH is read from wstETH. The Lido actions work only with markets that use these token addresses.

For depth on the core actions and the controller rules that apply to them, see [Core](../architecture/core) and [Market controller](../architecture/market-controller).

### Setup in JavaScript

```js
import { ethers } from "ethers";

const call = (to, data, value = 0n) => ({ to, data, value, skipRevert: false, callbackHash: ethers.ZeroHash });

const bundler3 = new ethers.Contract(bundler3Addr, [
  "function multicall((address to,bytes data,uint256 value,bool skipRevert,bytes32 callbackHash)[]) payable",
], signer);

const general = new ethers.Interface([
  "function erc20TransferFrom(address,address,uint256)",
  "function erc20Transfer(address,address,uint256)",
  "function morphoSupplyCollateral((address,address,address,address,uint256),uint256,address,bytes)",
  "function morphoBorrow((address,address,address,address,uint256),uint256,uint256,uint256,address)",
  "function morphoRepay((address,address,address,address,uint256),uint256,uint256,uint256,address,bytes)",
  "function morphoWithdrawCollateral((address,address,address,address,uint256),uint256,address)",
  "function morphoWithdraw((address,address,address,address,uint256),uint256,uint256,uint256,address)",
  "function morphoSupply((address,address,address,address,uint256),uint256,uint256,uint256,address,bytes)",
  "function erc4626Deposit(address,uint256,uint256,address)",
  "function erc4626Redeem(address,uint256,uint256,address,address)",
  "function wrapNative(uint256,address)",
  "function unwrapNative(uint256,address)",
  "function stakeEth(uint256,uint256,address,address)",
  "function wrapStEth(uint256,address)",
  "function unwrapStEth(uint256,address)",
]);

const MAX = ethers.MaxUint256;
```

`marketParams` is a 5-tuple in this order:

```js
const params = [loanToken, collateralToken, oracle, irm, lltv];
```

You can read all five fields from the core with `idToMarketParams(id)`. For markets created by `LidoLendMarketFactory`, `irm` is the `IrmRouter` address.

## Five rules

### 1. The user approves the adapter, not Bundler3

`Bundler3` is a public dispatcher. Anyone can call it with any calldata. Never give it an allowance. Give allowances to the adapter that pulls the tokens: the general adapter for ERC-20 legs, the vault adapter for vault shares.

### 2. An adapter spends only the tokens it holds

Actions such as `morphoRepay` and `morphoSupplyCollateral` use the adapter's own balance. A bundle must first move the tokens in with `erc20TransferFrom`. The calls run in the order of the array.

```js
call(generalAdapter, general.encodeFunctionData("erc20TransferFrom", [token, generalAdapter, amount])),
call(generalAdapter, general.encodeFunctionData("morphoSupplyCollateral", [params, MAX, user, "0x"])),
```

### 3. Actions that reduce the user's position need an authorization

`morphoBorrow`, `morphoWithdraw` and `morphoWithdrawCollateral` call the core for the initiator. The user must run `setAuthorization(generalAdapter, true)` on the core once. Send it as a separate transaction the first time, and skip it after that:

```js
if (!(await core.isAuthorized(user, generalAdapter))) {
  await (await core.connect(signer).setAuthorization(generalAdapter, true)).wait();
}
```

A call to `setAuthorization` with the value that is already stored reverts with `already set`. Read the value first. The core also accepts an EIP-712 `setAuthorizationWithSig`, which can be a call inside the bundle, so the first-time flow can also be one signature.

Core authorization is global to the core: it is not scoped by market or action. An authorized operator can withdraw supply, borrow, withdraw collateral or call `settle` for the user in every market of the core.

### 4. Sweep the adapter at the end of the bundle

Overshoot is normal. For example, you size a repayment with headroom for the interest that accrues before the transaction lands. The rest stays on the adapter, and the next bundle from any user can take it. End the bundle with an explicit sweep:

```js
call(generalAdapter, general.encodeFunctionData("erc20Transfer", [token, user, MAX])),
```

With `MAX`, `erc20Transfer` sends the adapter's whole balance and does not revert when the balance is zero.

### 5. `type(uint256).max` means "the amount there now", resolved onchain

Use `MAX` to avoid a race between the quote and the transaction:

| Action | `MAX` means |
| --- | --- |
| `erc20Transfer(token, to, MAX)` | the adapter's whole balance |
| `erc20TransferFrom(token, to, MAX)` | the initiator's whole balance |
| `morphoSupplyCollateral(params, MAX, …)` | the adapter's whole collateral-token balance |
| `morphoRepay(params, 0, MAX, …)` | the whole debt of `onBehalf`, in borrow shares |
| `morphoWithdrawCollateral(params, MAX, …)` | the initiator's whole collateral |
| `fallbackExit(vault, MAX, …)` | the initiator's whole vault-share balance |

To repay all debt, pass `shares = MAX`, not `assets = MAX`. Debt quoted in assets grows between the read and the transaction, so an asset-sized repayment leaves dust.

## Recipes

### Close a position: repay all debt and take the collateral back

Four calls, one signature:

```js
// once, if the adapter is not authorized yet (rule 3)
if (!(await core.isAuthorized(user, generalAdapter))) {
  await (await core.connect(signer).setAuthorization(generalAdapter, true)).wait();
}
// the user approves the adapter for the loan token (once, can be MAX)
await (await loanToken.connect(signer).approve(generalAdapter, MAX)).wait();

const budget = debtAssets + headroom; // read the debt, add a margin for interest

await bundler3.multicall([
  // 1. pull the repay budget in
  call(generalAdapter, general.encodeFunctionData("erc20TransferFrom", [loanToken, generalAdapter, budget])),
  // 2. repay ALL debt (shares = MAX); maxSharePriceE27 = MAX disables the price check
  call(generalAdapter, general.encodeFunctionData("morphoRepay", [params, 0n, MAX, MAX, user, "0x"])),
  // 3. with no debt, the whole collateral is free
  call(generalAdapter, general.encodeFunctionData("morphoWithdrawCollateral", [params, MAX, user])),
  // 4. return the unused budget (rule 4)
  call(generalAdapter, general.encodeFunctionData("erc20Transfer", [loanToken, user, MAX])),
]);
```

Expected result: the user's borrow shares and collateral are zero, the collateral is back with the user, and no loan token stays on the adapter.

`maxSharePriceE27` caps the assets paid per borrow share burned, scaled by `1e27`. Set it to a real bound if you want slippage protection.

### Withdraw collateral only

This is the same bundle without the repay legs. It needs the authorization from rule 3:

```js
await bundler3.multicall([
  call(generalAdapter, general.encodeFunctionData("morphoWithdrawCollateral", [params, amount, user])),
]);
```

Pass an explicit `amount` for a partial withdrawal, or `MAX` for all collateral. The controller adds rules to this action:

- with open debt, the remaining **active** collateral must cover the debt at LLTV, otherwise the call reverts with `InsufficientActiveCollateral()`. `MAX` with open debt therefore reverts;
- with open debt, a frozen market rejects the withdrawal with `MarketIsFrozen()`;
- if the position has inactive collateral (dust or an activating lot), the withdrawal must clear the whole inactive balance. While the activation lock applies, only a withdrawal within the active balance passes.

See [Market controller](../architecture/market-controller) for collateral activation.

### Supply collateral

```js
await (await collateralToken.connect(signer).approve(generalAdapter, MAX)).wait();

await bundler3.multicall([
  call(generalAdapter, general.encodeFunctionData("erc20TransferFrom", [collateralToken, generalAdapter, amount])),
  call(generalAdapter, general.encodeFunctionData("morphoSupplyCollateral", [params, MAX, user, "0x"])),
]);
```

No authorization is needed: anyone can supply collateral to a position. New collateral protects the position from liquidation at once, but it gives no borrow capacity until it completes the market's activation delay. A supply below the market's `minDepositAmount` reverts with `DepositTooSmall`.

### Borrow straight to native ETH

```js
await bundler3.multicall([
  call(generalAdapter, general.encodeFunctionData("morphoBorrow", [params, amount, 0n, minSharePriceE27, generalAdapter])),
  call(generalAdapter, general.encodeFunctionData("unwrapNative", [MAX, user])),
]);
```

The borrow sends WETH to the adapter. The adapter unwraps it and sends ETH to the user. `minSharePriceE27` is the floor on assets received per borrow share, scaled by `1e27`; pass `0` to disable it. The borrow needs the authorization from rule 3.

### Enter from ETH: stake, wrap, supply as collateral

`stakeEth` is not payable. First fund the adapter with a value-bearing call that has empty data, then act on the adapter's balance:

```js
await bundler3.multicall([
  call(generalAdapter, "0x", ethers.parseEther("5")),                                   // ETH → adapter
  call(generalAdapter, general.encodeFunctionData("stakeEth", [MAX, maxSharePriceE27, referral, generalAdapter])),
  call(generalAdapter, general.encodeFunctionData("wrapStEth", [MAX, generalAdapter])),
  call(generalAdapter, general.encodeFunctionData("morphoSupplyCollateral", [params, MAX, user, "0x"])),
], { value: ethers.parseEther("5") });
```

- `maxSharePriceE27` caps the wei paid per stETH share minted, scaled by `1e27`;
- `referral` is the address for the Lido Rewards-Share Program, or `ZeroAddress` if there is none;
- the reverse leg is `unwrapStEth(amount, receiver)`.

### Exit an illiquid vault position: `fallbackExit`

When borrowers use most of the market's liquidity, a plain `redeem` can pay only what free liquidity covers. `fallbackExit` on `LidoLendVaultAdapter` pays that part in loan tokens and settles the rest against borrower collateral, so the lender exits in one transaction. See [Settlement](../architecture/settlement) for the settlement mechanism.

```js
const vaultAdapterAbi = new ethers.Interface([
  "function fallbackExit(address vault,uint256 shares,uint256 maxIterations,address receiver,uint256 minExitAssets,uint256 minSharesBurned)",
]);

// the user approves their VAULT SHARES to the vault adapter
await (await vault.connect(signer).approve(vaultAdapter, MAX)).wait();

await bundler3.multicall([
  call(vaultAdapter, vaultAdapterAbi.encodeFunctionData("fallbackExit", [
    vaultAddr,
    MAX,        // shares: the initiator's whole balance
    0n,         // maxIterations: 0 = the vault default
    user,       // receiver of BOTH payout tokens
    minExit,    // floor on loan assets paid + debt canceled, in loan tokens
    minBurned,  // floor on shares burned; pass `shares` for all-or-nothing
  ])),
]);
```

The UI must handle two things:

- **The payout is two tokens.** Show both legs. `minExitAssets` is one floor over the sum of loan tokens paid and debt canceled, valued in loan tokens, so the split between the two legs does not matter;
- **The exit can burn fewer shares than requested** when settlement runs out of eligible borrowers or reaches the iteration cap. Pass `minSharesBurned = shares` if a partial exit is not acceptable. Otherwise read the burned amount from the receipt and refresh the position.

The adapter always exits the initiator's position. A share approval to the adapter can therefore be spent only by a bundle that the share owner started.

If `receiver` is an adapter, later calls in the bundle must transfer both payout tokens out of it.

## Errors and edge cases

A bundle revert shows the error of the failing call.

| Error | Cause | What to do |
| --- | --- | --- |
| `UnauthorizedSender()` | An adapter action was called directly, not through `Bundler3` | Send the action inside `multicall` |
| `EmptyBundle()` | `multicall` with an empty array | Send at least one call |
| `ZeroAmount()` / `ZeroShares()` | A `MAX`-resolved amount is 0: the adapter balance or the position is empty | Check the order of calls and the position |
| `SlippageExceeded()` | A `maxSharePriceE27` or `minSharePriceE27` bound was breached | Re-quote, or widen the bound |
| `AdapterAddress()` | `onBehalf` or `receiver` was set to the adapter itself where the action forbids it | Use the user's address |
| `MissingExpectedReenter()` | A call set `callbackHash` but made no callback | Set `callbackHash` to zero for plain calls |
| `ExitBelowMinimum(exitAssets, minExitAssets)` | `fallbackExit` paid less than the floor | Lower the floor or retry later |
| `BurnBelowMinimum(sharesBurned, minSharesBurned)` | `fallbackExit` burned fewer shares than the floor | Accept a partial exit or retry later |
| `already set` | `setAuthorization` called with the stored value | Read `isAuthorized` first |
| `InsufficientActiveCollateral()` | Borrow or debt-bearing withdrawal exceeds the capacity of active collateral | Wait for activation, or reduce the amount |
| `MarketIsFrozen()` | Borrow or debt-bearing collateral withdrawal in a frozen market | Wait for unfreeze; repay is still allowed |
| `SupplyCapExceeded(cap, attempted)` | Lender supply above the market's supply cap | Reduce the amount |
| `AddressBanned()` | The caller, receiver or debt owner of a borrow is banned in the market | Borrowing is not possible for this address |
| `DepositTooSmall(assets, minDepositAmount)` | Collateral supply below the market floor | Increase the amount |
| `DustNotResolved(dust, assets, minActivationAmount)` | A pending dust lot needs a supply that lifts it to `minActivationAmount` | Supply at least `minActivationAmount - dust` |
| `InactiveCollateralNotCleared(requested, inactive)` | No activation lock applies, and the withdrawal is smaller than the whole inactive balance | Withdraw at least the whole inactive balance |
| `ActivatingCollateralLocked(activating, lockDeadline)` | A withdrawal beyond the active balance during the activation lock | Withdraw within the active balance or wait for `lockDeadline` |
| `ResumedExpected()` | The market controller is paused | Wait for the pause to end |

Other notes:

- Do not set `skipRevert = true` on a call that later calls depend on. A skipped failure leaves the earlier calls committed;
- a Morpho callback (`onMorpho*`) runs before the core receives the incoming tokens. Use `callbackHash` and `reenter` only if you understand the upstream Bundler3 callback model.

## Related

- [Core](../architecture/core)
- [Market controller](../architecture/market-controller)
- [Settlement](../architecture/settlement)
- [Deployed contracts](../deployed-contracts)
- [Integration guide in `lidofinance/lend-markets`](https://github.com/lidofinance/lend-markets/blob/main/docs/integration/bundler.md)
- [Bundler3 adapters API reference](https://github.com/lidofinance/lend-markets/blob/main/docs/specs/api/bundler3-adapters.md)
- [Adapter source: `src/adapters/`](https://github.com/lidofinance/lend-markets/tree/main/src/adapters)
- [Upstream Bundler3 at the pinned commit](https://github.com/morpho-org/bundler3/tree/9afc2f4ea32c9dbeba2205a485731b8a98f7ae4c)
