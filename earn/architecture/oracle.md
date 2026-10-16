# Oracle

## Overview

The `Oracle` contract is responsible for secure and configurable price reporting for supported assets. It is tightly coupled with a vault module (implementing `IShareModule`) and provides price validation, deviation tracking, and rate limited report submission.

Trusted role holders supply prices within the configured timing and deviation rules. Other components use these reports for share conversion and limit accounting.

### Key Responsibilities

- Report submission: Allows trusted accounts to submit price updates.
- Deviation analysis: Compares new prices against the last report for suspicious behavior.
- Timestamp based rate limiting: Prevents frequent or premature reports.
- Asset management: Controls which tokens are supported by the oracle.
- Oracle price validation: Used by other modules (for example `SignatureQueue`) to verify incoming prices.

## Roles and Permissions

| Role                           | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `SUBMIT_REPORTS_ROLE`          | Permission to submit regular price reports    |
| `ACCEPT_REPORT_ROLE`           | Permission to accept suspicious reports       |
| `SET_SECURITY_PARAMS_ROLE`     | Can modify validation rules and intervals     |
| `ADD_SUPPORTED_ASSETS_ROLE`    | Can whitelist new assets for reporting        |
| `REMOVE_SUPPORTED_ASSETS_ROLE` | Can remove assets and delete associated state |

## Configuration and State

### `SecurityParams`

```solidity
struct SecurityParams {
  uint224 maxAbsoluteDeviation;
  uint224 suspiciousAbsoluteDeviation;
  uint64 maxRelativeDeviationD18;
  uint64 suspiciousRelativeDeviationD18;
  uint32 timeout;
  uint32 depositInterval;
  uint32 redeemInterval;
}
```

- Absolute deviation: Hard limits on price delta in price units.
- Relative deviation: Tolerance as a percentage (for example 5% = 0.05e18).
- Timeout: Minimum time between valid reports (ignored if the previous report is suspicious).
- `depositInterval`: Minimum age required for a deposit to be processed.
- `redeemInterval`: Same, but for redemptions.

### `Reports`

```solidity
struct Report {
  address asset;
  uint224 priceD18;
}

struct DetailedReport {
  uint224 priceD18;
  uint32 timestamp;
  bool isSuspicious;
}
```

Used to validate asset prices and coordinate cross queue processing.

## Behavior

### Reporting Logic

When calling `submitReports(...)`:

Step 1: Each asset is checked for support.

Step 2: The previous report is evaluated. If `timeout` has not passed and the report is not suspicious, revert `TooEarly(uint256 timestamp, uint256 minTimestamp)`.

Step 3: If the stored previous price is zero, including before the first report, the new report is suspicious without deviation checks. Otherwise, prices above either maximum deviation limit revert with `InvalidPrice(uint256 priceD18)`. Within those limits, a report is suspicious if the previous report is suspicious or either suspicious deviation threshold is exceeded. Suspicious reports require `acceptReport`.

Step 4: Only a non-suspicious report calls `vault.handleReport(...)`, with adjusted deposit and redeem timestamps. `ReportsSubmitted` is emitted once for the entire submitted batch.

### Validation Logic

When the stored previous price is non-zero, prices are validated by:

- Calculating absolute deviation.
- Calculating relative deviation.
- Comparing against `max` and `suspicious` thresholds.

With a non-zero previous price, a new price is:

- Rejected if either deviation exceeds max.
- Accepted but suspicious if above suspicious threshold.
- Normal only when the previous report is not suspicious and both deviations are within the suspicious thresholds. When the previous price is zero, validation instead returns valid and suspicious without deviation checks.

Used by:

- Only `SignatureDepositQueue` and `SignatureRedeemQueue` call `validatePrice`.
- `RiskManager`, `SyncDepositQueue`, `SyncRedeemQueue`, and `OracleSubmitter` read `getReport`.
- `DepositQueue` and `RedeemQueue` receive prices through `vault.handleReport`.

## Functions

### View Functions

| Function                         | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `vault()`                        | Returns the linked vault (must implement `IShareModule`)               |
| `securityParams()`               | Current oracle thresholds and intervals                                |
| `supportedAssets()`              | Count of whitelisted tokens                                            |
| `supportedAssetAt(index)`        | Token at a given index                                                 |
| `isSupportedAsset(address)`      | Whether an asset is valid for reporting                                |
| `getReport(asset)`               | Returns last report (price, timestamp, suspicious flag)                |
| `validatePrice(priceD18, asset)` | Validates a given price against the current report and security params |

### State-Changing Functions

| Function                                | Description                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `initialize(params)`                    | Initializes with assets and security settings                                                                             |
| `setVault(vault)`                       | Registers the vault for report consumption                                                                                |
| `submitReports(reports[])`              | Batch submits prices for multiple assets                                                                                  |
| `acceptReport(asset, price, timestamp)` | Marks a previously suspicious report as trusted                                                                           |
| `setSecurityParams(params)`             | Updates thresholds and timing rules                                                                                       |
| `addSupportedAssets(assets[])`          | Adds tokens to the supported set                                                                                          |
| `removeSupportedAssets(assets[])`       | Removes tokens and clears their reports; reverts with `Forbidden()` for the FeeManager base asset or an asset with queues |

## Events

| Event                                     | Purpose                            |
| ----------------------------------------- | ---------------------------------- |
| `ReportsSubmitted(Report[])`              | Emitted when new prices are posted |
| `ReportAccepted(asset, price, timestamp)` | Suspicious report accepted         |
| `SecurityParamsSet(params)`               | Oracle thresholds changed          |
| `SupportedAssetsAdded(addresses[])`       | New tokens added                   |
| `SupportedAssetsRemoved(addresses[])`     | Tokens delisted                    |
| `SetVault(address)`                       | Vault set                          |

## Invariants and Limitations

### Security Considerations

- Only trusted roles can push prices.
- Suspicious reports cannot be accepted without explicit approval.
- Price validation is local and does not rely on external feeds.
- Reports with a non-zero previous price are checked against absolute and relative deviation limits; role holders remain trusted for price accuracy.
