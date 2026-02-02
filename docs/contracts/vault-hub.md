# VaultHub

- [Source code](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/vaults/VaultHub.sol)
- [Deployed contract](https://etherscan.io/address/0x1d201BE093d847f6446530Efb0E8Fb426d176709)

Central registry and lifecycle manager for StakingVaults connected to the Lido protocol. Handles vault connection, minting/burning stETH against vault collateral, rebalancing, fee settlement, and bad debt management.

## What is VaultHub?

VaultHub is the coordinator between individual StakingVaults and the Lido protocol:

- **Connection management**: vaults connect permissionlessly (with OperatorGrid limits) and can disconnect voluntarily or be disconnected by governance
- **Minting/burning**: vault owners mint stETH shares against their vault's total value as collateral
- **Rebalancing**: when vaults become unhealthy, anyone can trigger forced rebalancing using available vault funds
- **Fee settlement**: Lido fees accrue on vaults and can be settled permissionlessly
- **Bad debt handling**: governance can socialize bad debt to other vaults or internalize it as protocol loss
- **Connect deposit lock**: VaultHub enforces the 1 ETH connect deposit as minimal reserve (Dashboard does not escrow funds)
- **Beacon chain deposits auto-pause**: deposits are automatically paused when vaults have outstanding obligations

## Inherits

- [PausableUntilWithRoles](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/utils/PausableUntilWithRoles.sol)

## Constants

| Constant                   | Value              | Description                                                          |
| -------------------------- | ------------------ | -------------------------------------------------------------------- |
| `CONNECT_DEPOSIT`          | 1 ether            | ETH locked on connection, returned on disconnect                     |
| `REPORT_FRESHNESS_DELTA`   | 2 days             | Maximum age for a report to be considered fresh                      |
| `MIN_BEACON_DEPOSIT`       | 1 ether            | Threshold for beacon chain deposits pause on unsettled fees          |
| `PDG_ACTIVATION_DEPOSIT`   | 31 ether           | ETH required per validator activation after PDG predeposit           |
| `DISCONNECT_NOT_INITIATED` | `type(uint48).max` | Special value indicating vault is connected (not pending disconnect) |
| `TOTAL_BASIS_POINTS`       | 10000              | Basis points denominator                                             |

## Immutable variables

| Variable                      | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `LIDO`                        | stETH contract for minting/burning external shares      |
| `LIDO_LOCATOR`                | Protocol locator for resolving contract addresses       |
| `CONSENSUS_CONTRACT`          | HashConsensus contract for ref slot tracking            |
| `MAX_RELATIVE_SHARE_LIMIT_BP` | Maximum share limit relative to Lido TVL (basis points) |

## Roles

| Role                     | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `VAULT_MASTER_ROLE`      | Can force disconnect vaults from the hub                   |
| `REDEMPTION_MASTER_ROLE` | Can set liability shares targets for Lido Core redemptions |
| `VALIDATOR_EXIT_ROLE`    | Can trigger forced validator exits for unhealthy vaults    |
| `BAD_DEBT_MASTER_ROLE`   | Can socialize or internalize bad debt from vaults          |

## Storage

### ERC-7201 Namespaced Storage

```solidity
struct Storage {
    mapping(address vault => VaultRecord) records;
    mapping(address vault => VaultConnection) connections;
    address[] vaults;  // 1-based array, index 0 reserved
    RefSlotCache.Uint104WithCache badDebtToInternalize;
}
```

## Structs

### VaultConnection

Connection parameters for a vault:

```solidity
struct VaultConnection {
    address owner;                      // Vault owner address
    uint96 shareLimit;                  // Maximum stETH shares mintable
    uint96 vaultIndex;                  // Index in vaults array (1-based, 0 = not connected)
    uint48 disconnectInitiatedTs;       // Timestamp when disconnect started (max = connected)
    uint16 reserveRatioBP;              // Reserve ratio (e.g., 30% = 3000)
    uint16 forcedRebalanceThresholdBP;  // Health threshold for forced rebalance
    uint16 infraFeeBP;                  // Infrastructure fee (basis points)
    uint16 liquidityFeeBP;              // Liquidity fee (basis points)
    uint16 reservationFeeBP;            // Reservation fee (basis points)
    bool beaconChainDepositsPauseIntent; // Owner's intent to pause beacon deposits
}
```

### VaultRecord

Accounting record for a vault:

```solidity
struct VaultRecord {
    Report report;                                          // Latest oracle report
    uint96 maxLiabilityShares;                              // Peak liability shares in current period
    uint96 liabilityShares;                                 // Current liability shares
    DoubleRefSlotCache.Int104WithCache[2] inOutDelta;       // Cumulative deposits - withdrawals
    uint128 minimalReserve;                                 // min(CONNECT_DEPOSIT, slashingReserve)
    uint128 redemptionShares;                               // Shares marked for Lido Core redemption
    uint128 cumulativeLidoFees;                             // Total accrued Lido fees
    uint128 settledLidoFees;                                // Total settled Lido fees
}
```

### Report

Oracle report snapshot:

```solidity
struct Report {
    uint104 totalValue;    // Total vault value (ETH)
    int104 inOutDelta;     // inOutDelta at report time
    uint48 timestamp;      // Report timestamp
}
```

## Obligations mechanism

Vaults have obligations that must be covered before withdrawals:

1. **Health restoration**: Shares to burn/rebalance to restore health ratio
2. **Redemptions**: Shares marked as `redemptionShares` for Lido Core
3. **Fee settlement**: Accrued but unsettled Lido fees (≥1 ETH triggers deposit pause)

The `obligations()` view returns `(sharesToBurn, feesToSettle)`. If sharesToBurn is `type(uint256).max`, the vault has bad debt.

### Beacon chain deposits auto-pause

Deposits are automatically paused when:

- Vault is unhealthy (health shortfall > 0)
- Vault has redemption shares to cover
- Unsettled Lido fees ≥ `MIN_BEACON_DEPOSIT` (1 ETH)

Once obligations are cleared and owner hasn't set manual pause intent, deposits resume automatically.

### Manual pause intent

Vault owners can explicitly pause or resume beacon chain deposits via `pauseBeaconChainDeposits()` and `resumeBeaconChainDeposits()` (typically through Dashboard). This toggles `beaconChainDepositsPauseIntent`:

- If pause intent is set, deposits stay paused regardless of obligations.
- If pause intent is cleared, deposits still remain paused until obligations are covered.

## View methods

### vaultsCount()

```solidity
function vaultsCount() external view returns (uint256)
```

Returns the number of vaults connected to the hub.

### vaultByIndex(uint256 \_index)

```solidity
function vaultByIndex(uint256 _index) external view returns (address)
```

Returns vault address by 1-based index. Indexes are not stable across transactions.

### vaultConnection(address \_vault)

```solidity
function vaultConnection(address _vault) external view returns (VaultConnection memory)
```

Returns connection parameters for a vault. Returns empty struct if not connected.

### vaultRecord(address \_vault)

```solidity
function vaultRecord(address _vault) external view returns (VaultRecord memory)
```

Returns accounting record for a vault. Returns empty struct if not connected.

### isVaultConnected(address \_vault)

```solidity
function isVaultConnected(address _vault) external view returns (bool)
```

Returns true if vault is connected (or pending disconnect).

### isPendingDisconnect(address \_vault)

```solidity
function isPendingDisconnect(address _vault) external view returns (bool)
```

Returns true if vault disconnect has been initiated and awaiting completion.

### totalValue(address \_vault)

```solidity
function totalValue(address _vault) external view returns (uint256)
```

Returns current total value of the vault (report value + inOutDelta changes).

### liabilityShares(address \_vault)

```solidity
function liabilityShares(address _vault) external view returns (uint256)
```

Returns current liability shares (minted stETH) of the vault.

### locked(address \_vault)

```solidity
function locked(address _vault) external view returns (uint256)
```

Returns amount of ETH locked on the vault based on current liability and reserve ratio.

### maxLockableValue(address \_vault)

```solidity
function maxLockableValue(address _vault) external view returns (uint256)
```

Returns maximum ETH that can be locked given current total value.

### totalMintingCapacityShares(address \_vault, int256 \_deltaValue)

```solidity
function totalMintingCapacityShares(address _vault, int256 _deltaValue) external view returns (uint256)
```

Returns total shares that can be minted, accounting for reserve ratio, minimal reserve, and operator grid limits. `_deltaValue` allows simulating value changes.

### withdrawableValue(address \_vault)

```solidity
function withdrawableValue(address _vault) external view returns (uint256)
```

Returns ETH instantly withdrawable from the vault (accounts for locked value, redemptions, and unsettled fees).

### latestReport(address \_vault)

```solidity
function latestReport(address _vault) external view returns (Report memory)
```

Returns the latest oracle report for the vault.

### isReportFresh(address \_vault)

```solidity
function isReportFresh(address _vault) external view returns (bool)
```

Returns true if the vault's report is considered fresh (within `REPORT_FRESHNESS_DELTA` of latest oracle report).

### isVaultHealthy(address \_vault)

```solidity
function isVaultHealthy(address _vault) external view returns (bool)
```

Returns true if vault's total value meets the forced rebalance threshold.

### healthShortfallShares(address \_vault)

```solidity
function healthShortfallShares(address _vault) external view returns (uint256)
```

Returns shares needed to restore vault health. Returns `type(uint256).max` if bad debt (impossible to fix via rebalance).

### obligationsShortfallValue(address \_vault)

```solidity
function obligationsShortfallValue(address _vault) external view returns (uint256)
```

Returns ETH shortfall needed to cover all obligations.

### obligations(address \_vault)

```solidity
function obligations(address _vault) external view returns (uint256 sharesToBurn, uint256 feesToSettle)
```

Returns the vault's current obligations: shares to burn/rebalance and fees to settle.

### settleableLidoFeesValue(address \_vault)

```solidity
function settleableLidoFeesValue(address _vault) external view returns (uint256)
```

Returns Lido fees that can currently be settled (limited by available withdrawable funds).

### badDebtToInternalize()

```solidity
function badDebtToInternalize() external view returns (uint256)
```

Returns bad debt shares pending internalization as protocol loss.

### badDebtToInternalizeForLastRefSlot()

```solidity
function badDebtToInternalizeForLastRefSlot() external view returns (uint256)
```

Returns bad debt shares that were pending at the last reference slot (for oracle accounting).

## Methods

### initialize(address \_admin)

```solidity
function initialize(address _admin) external initializer
```

Initializes the VaultHub with admin address.

### connectVault(address \_vault)

```solidity
function connectVault(address _vault) external whenResumed
```

Connects a vault to the hub permissionlessly. Vault must:

- Be deployed by a valid factory
- Have `msg.sender` as current owner
- Have `VaultHub` as pending owner
- Not be ossified
- Have PDG as depositor
- Have staged balance matching pending activations × 31 ETH
- Have at least `CONNECT_DEPOSIT` (1 ETH) available balance

Connection parameters are fetched from OperatorGrid based on the vault's tier.

### voluntaryDisconnect(address \_vault)

```solidity
function voluntaryDisconnect(address _vault) external whenResumed
```

Initiates voluntary disconnect. Requires:

- `msg.sender` is vault owner
- Fresh report
- Zero liability shares
- Full fee settlement (if funds available)

### disconnect(address \_vault)

```solidity
function disconnect(address _vault) external onlyRole(VAULT_MASTER_ROLE)
```

Governance-initiated disconnect. Same requirements as voluntary disconnect but allows partial fee settlement.

### updateConnection(...)

```solidity
function updateConnection(
    address _vault,
    uint256 _shareLimit,
    uint256 _reserveRatioBP,
    uint256 _forcedRebalanceThresholdBP,
    uint256 _infraFeeBP,
    uint256 _liquidityFeeBP,
    uint256 _reservationFeeBP
) external
```

Updates vault connection parameters. Only callable by OperatorGrid. Requires fresh report and validates new parameters don't breach minting capacity.

### fund(address \_vault)

```solidity
function fund(address _vault) external payable whenResumed
```

Funds the vault with ETH. Only callable by vault owner.

### withdraw(address \_vault, address \_recipient, uint256 \_ether)

```solidity
function withdraw(address _vault, address _recipient, uint256 _ether) external whenResumed
```

Withdraws ETH from vault. Only callable by vault owner. Requires fresh report and respects withdrawable limits.

### mintShares(address \_vault, address \_recipient, uint256 \_amountOfShares)

```solidity
function mintShares(address _vault, address _recipient, uint256 _amountOfShares) external whenResumed
```

Mints stETH shares backed by vault collateral. Only callable by vault owner. Requires fresh report.

### burnShares(address \_vault, uint256 \_amountOfShares)

```solidity
function burnShares(address _vault, uint256 _amountOfShares) public whenResumed
```

Burns stETH shares from VaultHub balance to reduce liability. Only callable by vault owner.

### transferAndBurnShares(address \_vault, uint256 \_amountOfShares)

```solidity
function transferAndBurnShares(address _vault, uint256 _amountOfShares) external
```

Transfers shares from `msg.sender` to VaultHub and burns them. For EOA vault owners.

### rebalance(address \_vault, uint256 \_shares)

```solidity
function rebalance(address _vault, uint256 _shares) external whenResumed
```

Voluntary rebalance by vault owner. Withdraws ETH and burns corresponding shares.

### forceRebalance(address \_vault)

```solidity
function forceRebalance(address _vault) external
```

Permissionless forced rebalance for unhealthy vaults. Uses all available balance to cover obligations.

### settleLidoFees(address \_vault)

```solidity
function settleLidoFees(address _vault) external
```

Permissionless fee settlement. Sends unsettled fees to treasury.

### setLiabilitySharesTarget(address \_vault, uint256 \_liabilitySharesTarget)

```solidity
function setLiabilitySharesTarget(address _vault, uint256 _liabilitySharesTarget) external onlyRole(REDEMPTION_MASTER_ROLE)
```

Sets target liability, marking excess as redemption shares. Used for Lido Core redemptions.

### transferVaultOwnership(address \_vault, address \_newOwner)

```solidity
function transferVaultOwnership(address _vault, address _newOwner) external
```

Transfers vault ownership within VaultHub without disconnecting.

### pauseBeaconChainDeposits(address \_vault)

```solidity
function pauseBeaconChainDeposits(address _vault) external
```

Owner sets intent to pause beacon chain deposits.

### resumeBeaconChainDeposits(address \_vault)

```solidity
function resumeBeaconChainDeposits(address _vault) external
```

Owner clears pause intent. Deposits may remain paused if obligations exist.

### requestValidatorExit(address \_vault, bytes calldata \_pubkeys)

```solidity
function requestValidatorExit(address _vault, bytes calldata _pubkeys) external
```

Emits exit request events for node operator. Only callable by vault owner.

### triggerValidatorWithdrawals(...)

```solidity
function triggerValidatorWithdrawals(
    address _vault,
    bytes calldata _pubkeys,
    uint64[] calldata _amountsInGwei,
    address _refundRecipient
) external payable
```

Triggers EIP-7002 validator withdrawals. Partial withdrawals require fresh report and sufficient amount to cover obligations shortfall.

### forceValidatorExit(address \_vault, bytes calldata \_pubkeys, address \_refundRecipient)

```solidity
function forceValidatorExit(
    address _vault,
    bytes calldata _pubkeys,
    address _refundRecipient
) external payable onlyRole(VALIDATOR_EXIT_ROLE)
```

Forces full validator exits for vaults with obligations shortfall.

### socializeBadDebt(address \_badDebtVault, address \_vaultAcceptor, uint256 \_maxSharesToSocialize)

```solidity
function socializeBadDebt(
    address _badDebtVault,
    address _vaultAcceptor,
    uint256 _maxSharesToSocialize
) external onlyRole(BAD_DEBT_MASTER_ROLE) returns (uint256)
```

Transfers bad debt to another vault of the same node operator. Requires fresh reports for both vaults.

### internalizeBadDebt(address \_badDebtVault, uint256 \_maxSharesToInternalize)

```solidity
function internalizeBadDebt(
    address _badDebtVault,
    uint256 _maxSharesToInternalize
) external onlyRole(BAD_DEBT_MASTER_ROLE) returns (uint256)
```

Internalizes bad debt as protocol loss. Requires fresh report.

### decreaseInternalizedBadDebt(uint256 \_amountOfShares)

```solidity
function decreaseInternalizedBadDebt(uint256 _amountOfShares) external
```

Called by Accounting contract to clear internalized bad debt after settlement.

### applyVaultReport(...)

```solidity
function applyVaultReport(
    address _vault,
    uint256 _reportTimestamp,
    uint256 _reportTotalValue,
    int256 _reportInOutDelta,
    uint256 _reportCumulativeLidoFees,
    uint256 _reportLiabilityShares,
    uint256 _reportMaxLiabilityShares,
    uint256 _reportSlashingReserve
) external whenResumed
```

Applies oracle report to vault. Only callable by LazyOracle. Updates vault record and may complete pending disconnect.

### proveUnknownValidatorToPDG(address \_vault, IPredepositGuarantee.ValidatorWitness calldata \_witness)

```solidity
function proveUnknownValidatorToPDG(
    address _vault,
    IPredepositGuarantee.ValidatorWitness calldata _witness
) external
```

Proves unknown validators to PDG. Only callable by vault owner.

### collectERC20FromVault(address \_vault, address \_token, address \_recipient, uint256 \_amount)

```solidity
function collectERC20FromVault(
    address _vault,
    address _token,
    address _recipient,
    uint256 _amount
) external
```

Recovers ERC-20 tokens from vault. Only callable by vault owner.

## Events

```solidity
event VaultConnected(
    address indexed vault,
    uint256 shareLimit,
    uint256 reserveRatioBP,
    uint256 forcedRebalanceThresholdBP,
    uint256 infraFeeBP,
    uint256 liquidityFeeBP,
    uint256 reservationFeeBP
);

event VaultConnectionUpdated(
    address indexed vault,
    address indexed nodeOperator,
    uint256 shareLimit,
    uint256 reserveRatioBP,
    uint256 forcedRebalanceThresholdBP
);

event VaultFeesUpdated(
    address indexed vault,
    uint256 preInfraFeeBP,
    uint256 preLiquidityFeeBP,
    uint256 preReservationFeeBP,
    uint256 infraFeeBP,
    uint256 liquidityFeeBP,
    uint256 reservationFeeBP
);

event VaultDisconnectInitiated(address indexed vault);
event VaultDisconnectCompleted(address indexed vault);
event VaultDisconnectAborted(address indexed vault, uint256 slashingReserve);

event VaultReportApplied(
    address indexed vault,
    uint256 reportTimestamp,
    uint256 reportTotalValue,
    int256 reportInOutDelta,
    uint256 reportCumulativeLidoFees,
    uint256 reportLiabilityShares,
    uint256 reportMaxLiabilityShares,
    uint256 reportSlashingReserve
);

event MintedSharesOnVault(address indexed vault, uint256 amountOfShares, uint256 lockedAmount);
event BurnedSharesOnVault(address indexed vault, uint256 amountOfShares);
event VaultRebalanced(address indexed vault, uint256 sharesBurned, uint256 etherWithdrawn);
event VaultInOutDeltaUpdated(address indexed vault, int256 inOutDelta);
event ForcedValidatorExitTriggered(address indexed vault, bytes pubkeys, address refundRecipient);
event VaultOwnershipTransferred(address indexed vault, address indexed newOwner, address indexed oldOwner);
event LidoFeesSettled(address indexed vault, uint256 transferred, uint256 cumulativeLidoFees, uint256 settledLidoFees);
event VaultRedemptionSharesUpdated(address indexed vault, uint256 redemptionShares);
event BeaconChainDepositsPauseIntentSet(address indexed vault, bool pauseIntent);
event BadDebtSocialized(address indexed vaultDonor, address indexed vaultAcceptor, uint256 badDebtShares);
event BadDebtWrittenOffToBeInternalized(address indexed vault, uint256 badDebtShares);
```

## Related

- [StakingVault](/contracts/staking-vault.md)
- [LazyOracle](/contracts/lazy-oracle.md)
- [OperatorGrid](/contracts/operator-grid.md)
- [Dashboard](/contracts/dashboard.md)
- [PredepositGuarantee](/contracts/predeposit-guarantee.md)
