# SwapModule

## Overview

The `SwapModule` contract is a subvault-attached utility that lets curators swap assets through whitelisted DEX routers or CoW Swap limit orders while enforcing oracle-based slippage protection. Every trade is checked against a reference price from an external price oracle (Aave-style `getAssetPrice` feed), so a curator cannot execute a swap at a rate worse than the configured tolerance.

The module holds its own role-based ACL (via `MellowACL`) that whitelists tokens, routers, and callers.

## Roles and Permissions

| Role                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Manages other roles and updates the price oracle via `setOracle`     |
| `TOKEN_IN_ROLE`      | Granted to token addresses allowed as swap input                     |
| `TOKEN_OUT_ROLE`     | Granted to token addresses allowed as swap output                    |
| `ROUTER_ROLE`        | Granted to DEX router addresses allowed in `swap`                    |
| `CALLER_ROLE`        | Granted to accounts allowed to execute swaps and manage CoW orders   |
| `SET_SLIPPAGE_ROLE`  | Granted to accounts allowed to update slippage multipliers           |

## Configuration and State

The CoW Swap settlement contract, CoW vault relayer, and WETH address are fixed at deployment. `initialize(...)` sets the admin, subvault, price oracle, default multiplier, and initial role assignments.

The admin can replace the price oracle. Accounts with `SET_SLIPPAGE_ROLE` can update the default multiplier or set a multiplier for a specific token pair. A pair-specific value takes precedence over the default; both must be within `[0.9e8, 1.1e8]`, where `BASE_MULTIPLIER = 1e8`.

## Behavior

### Slippage Protection

For every trade the module computes an oracle-implied output amount:

```solidity
oracleMinAmount = evaluate(tokenIn, tokenOut, amountIn) * multiplier / BASE_MULTIPLIER;
```

- `evaluate()` converts `amountIn` using the oracle prices of both tokens, normalizing decimals (native ETH is priced as WETH).
- `multiplier` is the pair-specific `customMultiplier(tokenIn, tokenOut)` if set, otherwise `defaultMultiplier`. The lower bound caps tolerated negative deviation from the oracle quote at 10%; values above `BASE_MULTIPLIER` require a premium over the quote.

`checkParams` reverts unless `amountIn` is non-zero, `minAmountOut >= oracleMinAmount`, the tokens hold the corresponding roles, the input balance is sufficient, the deadline has not passed (`deadline >= block.timestamp`), and `tokenIn != tokenOut`.

## Functions

### View Functions

| Function | Description |
| --- | --- |
| `subvault()` | Returns the only subvault allowed to push or pull assets |
| `oracle()` | Returns the current Aave-compatible price oracle |
| `defaultMultiplier()` | Returns the fallback slippage multiplier |
| `customMultiplier(tokenIn, tokenOut)` | Returns the pair-specific multiplier, or zero when none is set |
| `evaluate(tokenIn, tokenOut, amountIn)` | Converts the input amount at oracle prices while normalizing token decimals |
| `checkMultiplier(multiplier)` | Reverts if the multiplier is outside the allowed range |
| `checkParams(params)` | Validates token roles, balance, amount, oracle minimum, deadline, and token pair |
| `checkCowswapOrder(params, order, orderUid)` | Verifies that a CoW order exactly matches the requested swap |

### State-Changing Functions

#### Configuration

- `setOracle(oracle)`: updates the price oracle; restricted to `DEFAULT_ADMIN_ROLE`.
- `setDefaultMultiplier(multiplier)`: updates the fallback multiplier; restricted to `SET_SLIPPAGE_ROLE`.
- `setCustomMultiplier(tokenIn, tokenOut, multiplier)`: updates a pair-specific multiplier; restricted to `SET_SLIPPAGE_ROLE`.

#### Asset Custody

- `pushAssets(asset, value)`: transfers assets from the subvault into the module before trading.
- `pullAssets(asset, value)`: transfers assets from the module back to the subvault.

Both functions are restricted to the configured subvault.

#### Router Swaps

```solidity
function swap(Params calldata params, address router, bytes calldata data) external returns (bytes memory)
```

- Callable only by `CALLER_ROLE`; the router must hold `ROUTER_ROLE`.
- Validates `params` via `checkParams`, approves `amountIn` to the router, executes the arbitrary `data` call (or forwards ETH for native input), and resets the approval.
- Reverts if the received amount is below `params.minAmountOut`.

#### CoW Swap Limit Orders

Instead of an atomic router call, the module can place pre-signed CoW Swap orders:

- `setCowswapApproval(asset, amount)`: approves the CoW vault relayer to spend an input token.
- `createLimitOrder(params, order, orderUid)`: validates `params` (same slippage checks) and verifies that the CoW order fields match them exactly (sell/buy tokens, amounts, deadline, receiver, sell-kind, ERC20 balances, and the computed order UID), then pre-signs the order in the CoW settlement contract.
- `invalidateOrder(orderUid)`: cancels a previously created order.

All three are restricted to `CALLER_ROLE`. Native ETH cannot be traded through CoW orders.

## Events

- `AssetsPushed(address asset, uint256 value)` / `AssetsPulled(address asset, uint256 value)`: Asset movements between subvault and module.
- `Swap(Params params, address router, uint256 amountOut)`: Emitted on a successful router swap.
- `LimitOrderCreated(Params params, bytes orderUid)` / `LimitOrderInvalidated(bytes orderUid)`: CoW Swap order lifecycle.
- `CowswapApprovalSet(address asset, uint256 amount)`: Relayer approval updated.
- `DefaultMultiplierSet(uint256 multiplier)` / `CustomMultiplierSet(address tokenIn, address tokenOut, uint256 multiplier)`: Slippage settings updated.
- `OracleSet(address oracle)`: Price oracle updated.

## Errors

| Error               | Reason                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `Forbidden(reason)` | A validation failed; the string names the specific check (e.g. `"router"`, `"minAmountOut < oracleMinAmount"`) |
| `ZeroValue()`       | Zero address or invalid role data passed during initialization             |
