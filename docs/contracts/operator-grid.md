# OperatorGrid

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/OperatorGrid.sol)
- [Deployed contract](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d)

Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults.

## What is OperatorGrid?

OperatorGrid governs vault risk and fee parameters:

- registers node operator groups
- defines tier parameters (share limits, reserve ratio, fees)
- applies tier changes to vaults
- enforces limits on minted shares and jailing status

VaultHub consults OperatorGrid to validate connection parameters and minting constraints.

## Key concepts

### Groups

A **group** represents a node operator in the OperatorGrid. Each group has:
- A unique node operator address
- A share limit (maximum stETH shares across all their vaults)
- One or more tiers defining risk parameters

Groups are registered via `registerGroup()` by addresses with `REGISTRY_ROLE`.

### Tiers

A **tier** defines risk and fee parameters for vaults:
- **Reserve ratio**: Minimum collateralization (e.g., 50%)
- **Forced rebalance threshold**: When to trigger force rebalance
- **Share limit**: Maximum shares for vaults in this tier
- **Fees**: Infrastructure, liquidity, and reservation fees

### Default tier

All vaults start in the **default tier** (tier ID 0), which has no specific node operator group. The default tier parameters are set during initialization and apply to all newly connected vaults until they explicitly change to a node operator's tier.

### Tier changes

Changing a vault's tier requires **multi-confirmation** from both parties:
1. Vault owner requests the tier change via `changeTier()`
2. Node operator confirms by also calling `changeTier()` with the same parameters
3. Once both confirm within the `confirmExpiry` window, `syncTier()` applies the change

This ensures both the vault owner and node operator agree to the new terms.

### Jailing

Vaults can be "jailed" by addresses with `REGISTRY_ROLE`. A jailed vault cannot mint new shares but can still burn shares and rebalance. This mechanism allows the protocol to restrict problematic vaults.

## Structs

### Group

Node operator group information:

```solidity
struct Group {
    uint256 shareLimit;      // Maximum shares across all group vaults
    uint256 mintedShares;    // Currently minted shares
    uint256 firstTierId;     // First tier ID for this group
    uint256 tiersCount;      // Number of tiers
}
```

### Tier

Tier parameters:

```solidity
struct Tier {
    uint256 shareLimit;                  // Max shares for vaults in this tier
    uint256 reserveRatioBP;              // Reserve ratio in basis points
    uint256 forcedRebalanceThresholdBP;  // Force rebalance threshold
    uint256 infraFeeBP;                  // Infrastructure fee
    uint256 liquidityFeeBP;              // Liquidity fee
    uint256 reservationFeeBP;            // Reservation fee
}
```

### TierParams

Parameters for registering or updating tiers:

```solidity
struct TierParams {
    uint256 shareLimit;
    uint256 reserveRatioBP;
    uint256 forcedRebalanceThresholdBP;
    uint256 infraFeeBP;
    uint256 liquidityFeeBP;
    uint256 reservationFeeBP;
}
```

## View methods

### group(address _nodeOperator)

```solidity
function group(address _nodeOperator) external view returns (Group memory)
```

Returns group info for a node operator.

### nodeOperatorAddress(uint256 _index)

```solidity
function nodeOperatorAddress(uint256 _index) external view returns (address)
```

Returns node operator address by index.

### nodeOperatorCount()

```solidity
function nodeOperatorCount() external view returns (uint256)
```

Returns number of node operators.

### tier(uint256 _tierId)

```solidity
function tier(uint256 _tierId) external view returns (Tier memory)
```

Returns tier parameters by id.

### tiersCount()

```solidity
function tiersCount() external view returns (uint256)
```

Returns number of tiers.

### vaultTierInfo(address _vault)

```solidity
function vaultTierInfo(address _vault) external view returns (
    address nodeOperator,
    uint256 tierId,
    uint256 shareLimit,
    uint256 reserveRatioBP,
    uint256 forcedRebalanceThresholdBP,
    uint256 infraFeeBP,
    uint256 liquidityFeeBP,
    uint256 reservationFeeBP
)
```

Returns effective tier configuration for a vault.

### effectiveShareLimit(address _vault)

```solidity
function effectiveShareLimit(address _vault) public view returns (uint256)
```

Returns share limit after applying tier rules.

### isVaultInJail(address _vault)

```solidity
function isVaultInJail(address _vault) external view returns (bool)
```

Returns whether a vault is jailed.

## Methods

### initialize(address _admin, TierParams _defaultTierParams)

```solidity
function initialize(address _admin, TierParams calldata _defaultTierParams) external initializer
```

Initializes registry with default tier.

### setConfirmExpiry(uint256 _newConfirmExpiry)

```solidity
function setConfirmExpiry(uint256 _newConfirmExpiry) external onlyRole(REGISTRY_ROLE)
```

Sets confirmation expiry used by tier changes.

### registerGroup(address _nodeOperator, uint256 _shareLimit)

```solidity
function registerGroup(address _nodeOperator, uint256 _shareLimit) external onlyRole(REGISTRY_ROLE)
```

Registers a node operator group.

### updateGroupShareLimit(address _nodeOperator, uint256 _shareLimit)

```solidity
function updateGroupShareLimit(address _nodeOperator, uint256 _shareLimit) external onlyRole(REGISTRY_ROLE)
```

Updates a group's share limit.

### registerTiers(address _nodeOperator, TierParams[] _tiers)

```solidity
function registerTiers(
    address _nodeOperator,
    TierParams[] calldata _tiers
) external onlyRole(REGISTRY_ROLE)
```

Registers tiers for a node operator.

### alterTiers(uint256[] _tierIds, TierParams[] _tierParams)

```solidity
function alterTiers(
    uint256[] calldata _tierIds,
    TierParams[] calldata _tierParams
) external onlyRole(REGISTRY_ROLE)
```

Updates existing tier parameters.

### changeTier(address _vault, uint256 _requestedTierId, uint256 _requestedShareLimit)

```solidity
function changeTier(
    address _vault,
    uint256 _requestedTierId,
    uint256 _requestedShareLimit
) external returns (bool)
```

Requests tier change for a vault.

### syncTier(address _vault)

```solidity
function syncTier(address _vault) external returns (bool)
```

Applies pending tier changes for a vault.

### updateVaultShareLimit(address _vault, uint256 _requestedShareLimit)

```solidity
function updateVaultShareLimit(address _vault, uint256 _requestedShareLimit) external returns (bool)
```

Requests a share limit change for a vault.

### resetVaultTier(address _vault)

```solidity
function resetVaultTier(address _vault) external
```

Resets vault to its default tier parameters.

### updateVaultFees(...)

```solidity
function updateVaultFees(
    address _vault,
    uint256 _infraFeeBP,
    uint256 _liquidityFeeBP,
    uint256 _reservationFeeBP
) external onlyRole(REGISTRY_ROLE)
```

Updates per-vault fee parameters.

### onMintedShares(address _vault, uint256 _amount, bool _overrideLimits)

```solidity
function onMintedShares(
    address _vault,
    uint256 _amount,
    bool _overrideLimits
) external
```

Notifies OperatorGrid about minted shares.

### onBurnedShares(address _vault, uint256 _amount)

```solidity
function onBurnedShares(address _vault, uint256 _amount) external
```

Notifies OperatorGrid about burned shares.

### setVaultJailStatus(address _vault, bool _isInJail)

```solidity
function setVaultJailStatus(address _vault, bool _isInJail) external onlyRole(REGISTRY_ROLE)
```

Jails or unjails a vault.

## Permissions

- `DEFAULT_ADMIN_ROLE` for admin actions
- `REGISTRY_ROLE` for registry and tier management

## Related

- [VaultHub](/contracts/vault-hub)
- [StakingVault](/contracts/staking-vault)
- [Dashboard](/contracts/dashboard)
- [stVaults Parameters and Metrics](/run-on-lido/stvaults/features-and-mechanics/parameters-and-metrics)
