# OracleSubmitter

## Overview

The `OracleSubmitter` contract wraps a vault's `Oracle`. It applies its own access control to report submission and acceptance, keeps an onchain report history, and exposes the vault share price in a Chainlink-compatible format.

## Roles and Permissions

| Role | Permission |
| --- | --- |
| `SUBMIT_REPORTS_ROLE` | Calls `submitReports(...)` through this contract |
| `ACCEPT_REPORT_ROLE` | Calls `acceptReports(...)` through this contract |

The role identifiers match those exposed by the underlying oracle. Callers hold the roles on `OracleSubmitter`, while `OracleSubmitter` must hold the corresponding roles in the vault's ACL.

## Configuration and State

The `Oracle` address, base asset, and `decimals` value are fixed at deployment. Role assignments, report history, acceptance timestamps, and price feed state remain mutable.

## Behavior

### Exported Price Feed

The oracle reports `priceD18` as shares per unit of asset. `OracleSubmitter` inverts it to publish the share price in the base asset:

```solidity
latestAnswer = 1e36 / priceD18;
```

`decimals` equals the base asset's decimals (18 for native ETH).

The feed starts empty: `latestAnswer` and `updatedAt` are zero until the first non-suspicious (or manually accepted) base asset report passes through this contract. The constructor does not initialize them from the oracle's current report.

## Functions

### View Functions

| Function | Description |
| --- | --- |
| `oracle()` | Returns the underlying oracle |
| `baseAsset()` | Returns the vault's base asset |
| `decimals()` | Returns the price feed decimals |
| `latestAnswer()` | Returns the latest exported share price |
| `updatedAt()` | Returns the timestamp of the latest feed update |
| `reports(asset)` | Returns the number of stored reports for an asset |
| `reportAt(asset, index)` | Returns a stored `DetailedReport` |
| `acceptedAt(asset, index)` | Returns the manual acceptance timestamp, or zero if the report was not manually accepted |
| `latestRoundData()` | Returns Chainlink-style `(roundId, answer, startedAt, updatedAt, answeredInRound)` data; both round IDs are zero |
| `getRate()` | Returns `latestAnswer` as `uint256` |

### State-Changing Functions

#### `submitReports`

```solidity
function submitReports(IOracle.Report[] calldata reports_) external
```

- The first report in the batch must be for the vault's base asset, otherwise the call reverts with `InvalidOrder()`.
- Forwards the batch to `oracle.submitReports(...)`, then stores the resulting `DetailedReport` for each asset in the onchain history.
- If the base asset report is accepted without being flagged as suspicious, the exported price feed is updated.

#### `acceptReports`

```solidity
function acceptReports(address[] calldata assets, uint224[] calldata pricesD18, uint32[] calldata timestamps) external
```

- Manually accepts reports previously flagged as suspicious by the oracle's security checks.
- If the base asset is present, it must be first in the batch; accepting it updates the exported price feed.
- Records the acceptance timestamp per report in `acceptedAt`.

## Errors

| Error             | Reason                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `ZeroBaseAsset()` | The vault's fee manager has no base asset configured at deployment  |
| `InvalidOrder()`  | The base asset report is not first in the submitted/accepted batch  |
