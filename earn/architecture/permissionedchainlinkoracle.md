# PermissionedChainlinkOracle

## Overview

`PermissionedChainlinkOracle` is an owner-controlled price feed with a Chainlink-compatible `latestRoundData` interface. The owner supplies each price; the contract does not aggregate external observations or check price freshness.

## Configuration and State

The constructor sets the owner, decimals, initial answer, inclusive minimum and maximum answers, and description. The decimals and answer bounds are immutable.

- `decimals` must not exceed 36.
- The minimum must be non-negative and no greater than the maximum.
- Every answer, including the initial answer, must fall within the bounds. Zero is allowed when the range includes it.

## Functions

- `updatePrice(newAnswer)`: Owner only. Checks the bounds, stores the answer and current timestamp, then emits `AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt)`.
- `latestRoundData()`: Returns `(0, latestAnswer, latestTimestamp, latestTimestamp, 0)`. Both round IDs are always zero.
- Public getters expose `decimals`, `description`, `minAllowedAnswer`, `maxAllowedAnswer`, `latestAnswer`, and `latestTimestamp`.
- Inherited ownership functions allow ownership transfer or renunciation.

## Errors

- `InvalidDecimals()`: Decimals exceed 36.
- `InvalidAllowedRange()`: Bounds are negative or out of order.
- `InvalidPrice()`: An answer falls outside the inclusive bounds.

## Trust Assumptions

The owner controls the price within the configured bounds. Consumers must check freshness and decide whether this authority is acceptable. The interface does not imply decentralized Chainlink price aggregation.

## Audit

[NM-0891](../audits#module-and-incremental-audits) reviewed `PermissionedChainlinkOracle` at commit `bcf37ae`.

## Source

[PermissionedChainlinkOracle.sol at `69bbaf1`](https://github.com/mellow-finance/flexible-vaults/blob/69bbaf17530dc5127ecf9049cceaab141f516a1e/src/oracles/PermissionedChainlinkOracle.sol)
