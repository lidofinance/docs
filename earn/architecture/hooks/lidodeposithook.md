# LidoDepositHook

## Overview

`LidoDepositHook` is an implementation of the `IHook` interface that acts as a conversion adapter for incoming deposits. It standardizes various ETH-like assets into `wstETH` for use in downstream vault logic. The hook supports ETH, WETH, and stETH as input formats and ensures conversion to `wstETH` before optionally forwarding execution to a downstream `nextHook`.

## Primary Purpose

- Converts ETH, WETH, or stETH into `wstETH` on deposit.
- Ensures compatibility with protocols that expect `wstETH`.
- Provides composable hooks by chaining into a downstream `IHook` (`nextHook`).

## Constructor Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `wsteth_` | address | Address of the `wstETH` token contract |
| `weth_` | address | Address of the `WETH` token contract |
| `nextHook_` | address | Address of the optional downstream hook to forward to after wrapping |

## Key Function

### `callHook(address asset, uint256 assets)`

Handles conversion of an input asset into `wstETH` and optionally delegates the call to a downstream hook.

Supported Input Types:

1. `wstETH`: forwarded directly.
2. `stETH`: wrapped into `wstETH` via `IWSTETH(wsteth).wrap()`.
3. `WETH`: unwrapped into ETH via `IWETH(weth).withdraw()`, then deposited into `wstETH`.
4. `ETH` (that is `address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)`): directly deposited into `wstETH`.

Execution Steps:

- If `asset == wstETH`: do nothing.
- If `asset == stETH`: approves `wstETH` to pull `stETH` and calls `wrap()` on `wstETH` to convert to `wstETH`.
- If `asset == WETH`: unwraps to ETH using `withdraw()` and sends ETH to `wstETH` contract to mint `wstETH`.
- If `asset == ETH`: sends ETH directly to `wstETH`.
- After conversion, calculates how much new `wstETH` was received. If `nextHook` is configured, delegates `callHook(wstETH, amount)` to it.

## Errors

- `UnsupportedAsset(address asset)` is thrown if the provided asset is neither `wstETH`, `stETH`, `WETH`, nor `ETH`.

## Assumptions

It is assumed this hook will not trigger `STAKE_LIMIT` or other limit related errors in the Lido contracts. If such errors do occur, the vault admin can reconfigure the system to bypass the automated staking hook. In this case, `RedirectingDepositHook` can be assigned to the relevant queues, delegating staking responsibilities to the vault curator via manual liquidity management.
