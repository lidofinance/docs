# Oracle

## Overview

The `Oracle` contract is responsible for secure and configurable price reporting for supported assets. It is tightly coupled with a vault module (implementing `IShareModule`) and provides price validation, deviation tracking, and rate limited report submission.

It enforces strong assumptions around data integrity, report timing, and trust minimization through roles and deviation thresholds. This oracle ensures consistent pricing across all queue, share, and vault related computations.

## Key Responsibilities

- Report submission: Allows trusted accounts to submit price updates.
- Deviation analysis: Compares new prices against the last report for suspicious behavior.
- Timestamp based rate limiting: Prevents frequent or premature reports.
- Asset management: Controls which tokens are supported by the oracle.
- Oracle price validation: Used by other modules (for example `SignatureQueue`) to verify incoming prices.

## Roles

| Role | Description |
| --- | --- |
| `SUBMIT_REPORTS_ROLE` | Permission to submit regular price reports |
| `ACCEPT_REPORT_ROLE` | Permission to accept suspicious reports |
| `SET_SECURITY_PARAMS_ROLE` | Can modify validation rules and intervals |
| `ADD_SUPPORTED_ASSETS_ROLE` | Can whitelist new assets for reporting |
| `REMOVE_SUPPORTED_ASSETS_ROLE` | Can remove assets and delete associated state |

## `SecurityParams`

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

## `Reports`

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

## Key Functions

### View

| Function | Description |
| --- | --- |
| `vault()` | Returns the linked vault (must implement `IShareModule`) |
| `securityParams()` | Current oracle thresholds and intervals |
| `supportedAssets()` | Count of whitelisted tokens |
| `supportedAssetAt(index)` | Token at a given index |
| `isSupportedAsset(address)` | Whether an asset is valid for reporting |
| `getReport(asset)` | Returns last report (price, timestamp, suspicious flag) |
| `validatePrice(priceD18, asset)` | Validates a given price against the current report and security params |

### Mutable

| Function | Description |
| --- | --- |
| `initialize(params)` | Initializes with assets and security settings |
| `setVault(vault)` | Registers the vault for report consumption |
| `submitReports(reports[])` | Batch submits prices for multiple assets |
| `acceptReport(asset, price, timestamp)` | Marks a previously suspicious report as trusted |
| `setSecurityParams(params)` | Updates thresholds and timing rules |
| `addSupportedAssets(assets[])` | Adds tokens to the supported set |
| `removeSupportedAssets(assets[])` | Removes tokens and clears their reports |

## Reporting Logic

When calling `submitReports(...)`:

Step 1: Each asset is checked for support.

Step 2: The previous report is evaluated. If `timeout` has not passed and the report is not suspicious, revert `TooEarly`.

Step 3: Price is compared against previous:

- Too far off -> revert `InvalidPrice`.
- Moderately off -> flagged `isSuspicious`.

Step 4: If the report is accepted, it triggers `vault.handleReport(...)` with adjusted deposit and redeem timestamps and emits `ReportsSubmitted`.

## Validation Logic

Prices are validated by:

- Calculating absolute deviation.
- Calculating relative deviation.
- Comparing against `max` and `suspicious` thresholds.

A price is:

- Rejected if either deviation exceeds max.
- Accepted but suspicious if above suspicious threshold.
- Accepted as normal if within all limits.

Used by:

- `SignatureDepositQueue`, `SignatureRedeemQueue`, `DepositQueue` and `RedeemQueue` contracts.
- Vault's limit accounting (`RiskManager`).

## Events

| Event | Purpose |
| --- | --- |
| `ReportsSubmitted(Report[])` | Emitted when new prices are posted |
| `ReportAccepted(asset, price, timestamp)` | Suspicious report accepted |
| `SecurityParamsSet(params)` | Oracle thresholds changed |
| `SupportedAssetsAdded(addresses[])` | New tokens added |
| `SupportedAssetsRemoved(addresses[])` | Tokens delisted |
| `SetVault(address)` | Vault set |

## Security Considerations

- Only trusted roles can push prices.
- Suspicious reports cannot be accepted without explicit approval.
- Price validation is local and does not rely on external feeds.
- Prevents manipulation by enforcing absolute and relative deviation constraints.
