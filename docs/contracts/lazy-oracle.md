# LazyOracle

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/LazyOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c)

Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub.

## What is LazyOracle?

LazyOracle is a lightweight oracle for stVaults:

- stores the latest report metadata (timestamp, ref slot, tree root, CID)
- validates vault proofs against a report tree root
- applies per-vault accounting updates to VaultHub
- quarantines vaults with suspicious value deltas

## How it works

1. `AccountingOracle` publishes a report root and metadata via `updateReportData()`.
2. Anyone can submit per-vault updates with Merkle proofs via `updateVaultData()`.
3. LazyOracle validates proofs and checks reward/fee bounds.
4. Sanity-checked data is forwarded to VaultHub via `applyVaultReport()`.

Per-vault report submissions are **permissionless**: any account can call `updateVaultData`
with a valid Merkle proof from the latest report root.

### Report freshness

A vault report freshness is determined by VaultHub based on the report timestamp stored in LazyOracle. When stale, the vault cannot perform operations like withdrawals, mints, beacon chain deposits or disconnect.

### Quarantine mechanics

LazyOracle applies a quarantine buffer for sudden total value jumps that cannot be
verified immediately via `inOutDelta`. Value increases beyond the expected reward threshold
are quarantined for a configurable period before being released to VaultHub.

```
Time 0: Total Value = 100 ETH
┌────────────────────────────────────┐
│            100 ETH Active          │
└────────────────────────────────────┘

Time 1: Sudden jump of +50 ETH → start quarantine for 50 ETH
┌────────────────────────────────────┐
│            100 ETH Active          │
│            50 ETH Quarantined      │
└────────────────────────────────────┘

Time 2: Another jump of +70 ETH → wait for current quarantine to expire
┌────────────────────────────────────┐
│            100 ETH Active          │
│            50 ETH Quarantined      │
│            70 ETH Quarantine Queue │
└────────────────────────────────────┘

Time 3: First quarantine expires → add 50 ETH to active value, start new quarantine for 70 ETH
┌────────────────────────────────────┐
│            150 ETH Active          │
│            70 ETH Quarantined      │
└────────────────────────────────────┘

Time 4: Second quarantine expires → add 70 ETH to active value
┌────────────────────────────────────┐
│            220 ETH Active          │
└────────────────────────────────────┘
```

### Quarantine state machine

```
States:
• NO_QUARANTINE: No active quarantine, all value is immediately available
• QUARANTINE_ACTIVE: Total value increase is quarantined, waiting for expiration
• QUARANTINE_EXPIRED: Quarantine period passed, quarantined value can be released

┌─────────────────┐                              ┌──────────────────┐
│  NO_QUARANTINE  │ reported > threshold         │QUARANTINE_ACTIVE │
│                 ├─────────────────────────────►│                  │
│  quarantined=0  │                              │  quarantined>0   │
│  startTime=0    │◄─────────────────────────────┤  startTime>0     │
│                 |                              │  time<expiration |
└─────────────────┘ reported ≤ threshold         └───┬──────────────┘
        ▲         (early release)                    │       ▲
        │                                            │       │  increase > quarantined + rewards
        │                          time ≥            │       │  (release old, start new)
        │                          quarantine period │       │
        │                                            ▼       │
        │                                      ┌─────────────┴────────┐
        │ reported ≤ threshold OR              │  QUARANTINE_EXPIRED  │
        │ increase ≤ quarantined + rewards     │                      │
        │                                      │  quarantined>0       │
        │                                      │  startTime>0         │
        └──────────────────────────────────────┤  time>=expiration    │
                                               └──────────────────────┘

Legend:
• threshold = onchainTotalValue * (100% + maxRewardRatio)
• increase = reportedTotalValue - onchainTotalValue
• quarantined = total value increase that is currently quarantined
• rewards = expected EL/CL rewards based on maxRewardRatio
• expiration = quarantine.startTimestamp + quarantinePeriod
```

Normal top-ups via `fund()` do not go through quarantine since they can be verified on-chain via `inOutDelta`. Only consolidations or deposits that bypass the vault's balance are quarantined.

## Constants

| Constant                       | Value                    | Description                       |
| ------------------------------ | ------------------------ | --------------------------------- |
| `MAX_QUARANTINE_PERIOD`        | 30 days                  | Maximum allowed quarantine period |
| `MAX_REWARD_RATIO`             | 65535 (type(uint16).max) | Maximum reward ratio (~655%)      |
| `MAX_LIDO_FEE_RATE_PER_SECOND` | 10 ether                 | Maximum Lido fee rate per second  |

## Structs

### QuarantineInfo

```solidity
struct QuarantineInfo {
    bool isActive;                      // Whether quarantine is active
    uint256 pendingTotalValueIncrease;  // Amount quarantined
    uint256 startTimestamp;             // When quarantine started
    uint256 endTimestamp;               // When quarantine expires
    uint256 totalValueRemainder;        // Additional value waiting in queue
}
```

### VaultInfo

Aggregated vault information returned by view methods:

```solidity
struct VaultInfo {
    address vault;                      // Vault address
    uint256 aggregatedBalance;          // availableBalance + stagedBalance
    int256 inOutDelta;                  // Current in/out delta
    bytes32 withdrawalCredentials;      // Vault withdrawal credentials
    uint256 liabilityShares;            // Current liability shares
    uint256 maxLiabilityShares;         // Maximum liability shares
    uint256 mintableStETH;              // Remaining mintable stETH
    uint96 shareLimit;                  // Share limit from connection
    uint16 reserveRatioBP;              // Reserve ratio in basis points
    uint16 forcedRebalanceThresholdBP;  // Forced rebalance threshold
    uint16 infraFeeBP;                  // Infrastructure fee
    uint16 liquidityFeeBP;              // Liquidity fee
    uint16 reservationFeeBP;            // Reservation fee
    bool pendingDisconnect;             // Whether vault is pending disconnect
}
```

## View methods

### latestReportData()

```solidity
function latestReportData() external view returns (
    uint256 timestamp,
    uint256 refSlot,
    bytes32 treeRoot,
    string memory reportCid
)
```

Returns latest report metadata.

### latestReportTimestamp()

```solidity
function latestReportTimestamp() external view returns (uint256)
```

Returns latest report timestamp.

### quarantinePeriod()

```solidity
function quarantinePeriod() external view returns (uint256)
```

Returns quarantine period duration in seconds.

### maxRewardRatioBP()

```solidity
function maxRewardRatioBP() external view returns (uint256)
```

Returns max reward ratio in basis points. Used to determine quarantine threshold.

### maxLidoFeeRatePerSecond()

```solidity
function maxLidoFeeRatePerSecond() external view returns (uint256)
```

Returns max Lido fee rate per second in wei.

### quarantineValue(address \_vault)

```solidity
function quarantineValue(address _vault) external view returns (uint256)
```

Returns total value pending in quarantine for a vault (includes both `pendingTotalValueIncrease` and `totalValueRemainder`).

### vaultQuarantine(address \_vault)

```solidity
function vaultQuarantine(address _vault) external view returns (QuarantineInfo memory)
```

Returns detailed quarantine info for a vault. Returns zeroed struct if no active quarantine.

### vaultsCount()

```solidity
function vaultsCount() external view returns (uint256)
```

Returns number of vaults connected to VaultHub.

### batchVaultsInfo(uint256 \_offset, uint256 \_limit)

```solidity
function batchVaultsInfo(uint256 _offset, uint256 _limit) external view returns (VaultInfo[] memory)
```

Returns vault info for a range of vaults. Offset is 0-indexed from VaultHub vault list.

### vaultInfo(address \_vault)

```solidity
function vaultInfo(address _vault) external view returns (VaultInfo memory)
```

Returns aggregated info for a specific vault.

### batchValidatorStatuses(bytes[] \_pubkeys)

```solidity
function batchValidatorStatuses(bytes[] calldata _pubkeys)
    external
    view
    returns (IPredepositGuarantee.ValidatorStatus[] memory batch)
```

Returns validator statuses from PredepositGuarantee for multiple pubkeys.

## Methods

### initialize(address \_admin, uint256 \_quarantinePeriod, uint256 \_maxRewardRatioBP, uint256 \_maxLidoFeeRatePerSecond)

```solidity
function initialize(
    address _admin,
    uint256 _quarantinePeriod,
    uint256 _maxRewardRatioBP,
    uint256 _maxLidoFeeRatePerSecond
) external initializer
```

Initializes LazyOracle with admin and sanity parameters.

### updateSanityParams(...)

```solidity
function updateSanityParams(
    uint256 _quarantinePeriod,
    uint256 _maxRewardRatioBP,
    uint256 _maxLidoFeeRatePerSecond
) external
```

Updates sanity bounds. Requires `UPDATE_SANITY_PARAMS_ROLE`.

### updateReportData(...)

```solidity
function updateReportData(
    uint256 _vaultsDataTimestamp,
    uint256 _vaultsDataRefSlot,
    bytes32 _vaultsDataTreeRoot,
    string memory _vaultsDataReportCid
) external
```

Publishes the report root and metadata. Only callable by `AccountingOracle`.

### updateVaultData(...)

```solidity
function updateVaultData(
    address _vault,
    uint256 _totalValue,
    uint256 _cumulativeLidoFees,
    uint256 _liabilityShares,
    uint256 _maxLiabilityShares,
    uint256 _slashingReserve,
    bytes32[] calldata _proof
) external
```

Applies a per-vault update with a Merkle proof. Permissionless - anyone can call with valid proof.

**Sanity checks performed:**

1. Report must be newer than vault's previous report
2. Total value increase is quarantined if above reward threshold
3. Dynamic total value calculation must not underflow
4. Cumulative Lido fees must be monotonically increasing
5. Cumulative Lido fees increase must not exceed max rate
6. `maxLiabilityShares` must be >= `liabilityShares` and &lt;= on-chain value

### removeVaultQuarantine(address \_vault)

```solidity
function removeVaultQuarantine(address _vault) external
```

Removes quarantine for a vault. Only callable by `VaultHub`.

## Permissions

| Role                        | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| `DEFAULT_ADMIN_ROLE`        | Admin role for granting/revoking other roles                             |
| `UPDATE_SANITY_PARAMS_ROLE` | Can update sanity parameters (quarantine period, reward ratio, fee rate) |

## Related

- [VaultHub](/contracts/vault-hub)
- [AccountingOracle](/contracts/accounting-oracle)
- [OperatorGrid](/contracts/operator-grid)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [stVaults Technical Design](/run-on-lido/stvaults/tech-documentation/tech-design)
