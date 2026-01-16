# LazyOracle

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/LazyOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c)

Oracle adapter for stVaults. Stores per-vault reports, applies sanity checks, and forwards vault updates to VaultHub.

## What is LazyOracle?

LazyOracle is a lightweight oracle for stVaults:

- stores the latest report metadata (timestamp, ref slot, tree root, CID)
- validates vault proofs against a report tree root
- applies per-vault accounting updates to VaultHub
- quarantines vaults with suspicious deltas

## How it works

1. Oracles publish a report root and metadata.
2. Vault owners (or operators) submit per-vault updates with Merkle proofs.
3. LazyOracle validates proofs and checks reward/fee bounds.
4. VaultHub applies the report data and updates vault health.

Per-vault report submissions are **permissionless**: any account can call `updateVaultData`
with a valid Merkle proof from the latest report root.

### Quarantine mechanics

LazyOracle applies a quarantine buffer for sudden total value jumps that cannot be
verified immediately via `inOutDelta`. The NatSpec in the contract describes the
flow as follows:

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

Returns quarantine period duration.

### maxRewardRatioBP()

```solidity
function maxRewardRatioBP() external view returns (uint256)
```

Returns max reward ratio in basis points.

### maxLidoFeeRatePerSecond()

```solidity
function maxLidoFeeRatePerSecond() external view returns (uint256)
```

Returns max Lido fee rate per second.

### quarantineValue(address _vault)

```solidity
function quarantineValue(address _vault) external view returns (uint256)
```

Returns value locked during quarantine for a vault.

### vaultQuarantine(address _vault)

```solidity
function vaultQuarantine(address _vault) external view returns (QuarantineInfo memory)
```

Returns quarantine info for a vault.

### vaultsCount()

```solidity
function vaultsCount() external view returns (uint256)
```

Returns number of registered vaults in LazyOracle.

### batchVaultsInfo(uint256 _offset, uint256 _limit)

```solidity
function batchVaultsInfo(uint256 _offset, uint256 _limit) external view returns (VaultInfo[] memory)
```

Returns vault info for a range.

### vaultInfo(address _vault)

```solidity
function vaultInfo(address _vault) external view returns (VaultInfo memory)
```

Returns vault info for a specific vault.

### batchValidatorStatuses(bytes[] _pubkeys)

```solidity
function batchValidatorStatuses(bytes[] calldata _pubkeys)
    external
    view
    returns (IPredepositGuarantee.ValidatorStatus[] memory batch)
```

Returns validator statuses from PDG.

## Methods

### initialize(address _admin, uint256 _quarantinePeriod, uint256 _maxRewardRatioBP, uint256 _maxLidoFeeRatePerSecond)

```solidity
function initialize(
    address _admin,
    uint256 _quarantinePeriod,
    uint256 _maxRewardRatioBP,
    uint256 _maxLidoFeeRatePerSecond
) external initializer
```

Initializes LazyOracle with sanity parameters.

### updateSanityParams(...)

```solidity
function updateSanityParams(
    uint256 _quarantinePeriod,
    uint256 _maxRewardRatioBP,
    uint256 _maxLidoFeeRatePerSecond
) external onlyRole(UPDATE_SANITY_PARAMS_ROLE)
```

Updates sanity bounds.

### updateReportData(...)

```solidity
function updateReportData(
    uint256 _vaultsDataTimestamp,
    uint256 _vaultsDataRefSlot,
    bytes32 _vaultsDataTreeRoot,
    string memory _vaultsDataReportCid
) external
```

Publishes the report root and metadata.

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

Applies a per-vault update with a Merkle proof.

### removeVaultQuarantine(address _vault)

```solidity
function removeVaultQuarantine(address _vault) external
```

Removes quarantine for a vault once issues are resolved.

## Permissions

- `DEFAULT_ADMIN_ROLE` for admin actions
- `UPDATE_SANITY_PARAMS_ROLE` for sanity configuration

## Related

- [VaultHub](/contracts/vault-hub)
- [OperatorGrid](/contracts/operator-grid)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [stVaults Technical Design](/run-on-lido/stvaults/tech-documentation/tech-design)
