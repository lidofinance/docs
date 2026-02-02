# OperatorGrid

- [Source code](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/vaults/OperatorGrid.sol)
- [Deployed contract](https://etherscan.io/address/0xC69685E89Cefc327b43B7234AC646451B27c544d)

Registry for node operators, groups, and tier parameters that define share limits, reserve ratios, and fee schedules for stVaults.

## What is OperatorGrid?

OperatorGrid governs vault risk and fee parameters:

- registers node operator groups
- defines tier parameters (share limits, reserve ratio, fees)
- applies tier changes to vaults with multi-party confirmation
- enforces limits on liability shares and jailing status

VaultHub consults OperatorGrid to validate connection parameters and minting constraints.

## Key concepts

### Groups

A **group** represents a node operator in the OperatorGrid. Each group has:

- A unique node operator address
- A share limit (maximum liability shares across all their vaults)
- One or more tiers defining risk parameters
- Tracked liability shares across all group vaults

Groups are registered via `registerGroup()` by addresses with `REGISTRY_ROLE`.

### Tiers

A **tier** defines risk and fee parameters for vaults:

- **Share limit**: Maximum liability shares for vaults in this tier
- **Reserve ratio**: Minimum collateralization
- **Forced rebalance threshold**: When to trigger force rebalance (must be at least 10bp below reserve ratio)
- **Fees**: Infrastructure, liquidity, and reservation fees

Each tier belongs to a specific node operator (except the default tier).

### Default tier

All vaults start in the **default tier** (tier ID 0), which has a special operator address (`DEFAULT_TIER_OPERATOR`). The default tier parameters are set during initialization and apply to all newly connected vaults until they explicitly change to a node operator's tier.

Vaults in the default tier only count against the default tier's share limit, not any group's limit.

### Tier changes

Changing a vault's tier requires **multi-confirmation** from both parties. Either side can initiate:

1. Vault owner requests the tier change via Dashboard's `changeTier()` **or** the node operator requests it via OperatorGrid
2. The other party confirms by calling `changeTier()` with the same parameters
3. Once both confirm within the `confirmExpiry` window, the change is applied

**Important constraints:**

- Cannot change to the default tier (tier ID 0)
- Cannot change to a tier owned by a different node operator
- Node operators can pre-approve tier changes for disconnected vaults
- Vault owners can only confirm when the vault is connected to VaultHub
- Requested share limit must be between current liability shares and tier's share limit

### Tier sync

When tier parameters are updated via `alterTiers()`, existing vaults are **not** automatically updated. Vault owners and node operators must call `syncTier()` with dual confirmation to apply the new tier parameters to their vault.

### Liability shares tracking

OperatorGrid tracks `liabilityShares` (not `mintedShares`) at three levels:

1. **Tier level**: Sum of liability shares for all vaults in the tier
2. **Group level**: Sum of liability shares for all vaults in the group (excludes default tier)
3. **Vault level**: Tracked by VaultHub

When shares are minted or burned, OperatorGrid updates the tier and group totals.

### Jailing

Vaults can be "jailed" by addresses with `REGISTRY_ROLE`. A jailed vault:

- Cannot mint new shares (normal minting is blocked)
- Can still burn shares and rebalance
- Administrative operations (like bad debt socialization) can bypass jail restrictions

## Constants

| Constant                | Value           | Description                                          |
| ----------------------- | --------------- | ---------------------------------------------------- |
| `DEFAULT_TIER_ID`       | 0               | ID of the default tier                               |
| `DEFAULT_TIER_OPERATOR` | `0xFFFF...FFFF` | Special address for default tier (type(uint160).max) |
| `TOTAL_BASIS_POINTS`    | 10000           | Basis points denominator                             |
| `MAX_FEE_BP`            | 65535           | Maximum fee in basis points (~655%)                  |
| `MAX_RESERVE_RATIO_BP`  | 9999            | Maximum reserve ratio (99.99%)                       |

## Structs

### Group

Node operator group information:

```solidity
struct Group {
    address operator;        // Node operator address
    uint96 shareLimit;       // Maximum liability shares across all group vaults
    uint96 liabilityShares;  // Current liability shares in the group
    uint256[] tierIds;       // Array of tier IDs belonging to this group
}
```

### Tier

Tier parameters:

```solidity
struct Tier {
    address operator;                    // Node operator (DEFAULT_TIER_OPERATOR for default tier)
    uint96 shareLimit;                   // Max liability shares for vaults in this tier
    uint96 liabilityShares;              // Current liability shares in the tier
    uint16 reserveRatioBP;               // Reserve ratio in basis points
    uint16 forcedRebalanceThresholdBP;   // Force rebalance threshold in basis points
    uint16 infraFeeBP;                   // Infrastructure fee in basis points
    uint16 liquidityFeeBP;               // Liquidity fee in basis points
    uint16 reservationFeeBP;             // Reservation fee in basis points
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

### group(address \_nodeOperator)

```solidity
function group(address _nodeOperator) external view returns (Group memory)
```

Returns group info for a node operator.

### nodeOperatorAddress(uint256 \_index)

```solidity
function nodeOperatorAddress(uint256 _index) external view returns (address)
```

Returns node operator address by index.

### nodeOperatorCount()

```solidity
function nodeOperatorCount() external view returns (uint256)
```

Returns number of registered node operators.

### tier(uint256 \_tierId)

```solidity
function tier(uint256 _tierId) external view returns (Tier memory)
```

Returns tier parameters by ID.

### tiersCount()

```solidity
function tiersCount() external view returns (uint256)
```

Returns total number of tiers (including default tier).

### vaultTierInfo(address \_vault)

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

Returns effective tier configuration for a vault based on its current tier ID.

### effectiveShareLimit(address \_vault)

```solidity
function effectiveShareLimit(address _vault) public view returns (uint256)
```

Returns the effective share limit for a vault, which is the minimum of:

- Vault's configured share limit (from VaultHub connection)
- Remaining capacity in the tier and group

### isVaultInJail(address \_vault)

```solidity
function isVaultInJail(address _vault) external view returns (bool)
```

Returns whether a vault is jailed.

## Methods

### initialize(address \_admin, TierParams \_defaultTierParams)

```solidity
function initialize(address _admin, TierParams calldata _defaultTierParams) external initializer
```

Initializes registry with admin and default tier parameters.

### setConfirmExpiry(uint256 \_newConfirmExpiry)

```solidity
function setConfirmExpiry(uint256 _newConfirmExpiry) external
```

Sets confirmation expiry period for tier changes. Requires `REGISTRY_ROLE`.

### registerGroup(address \_nodeOperator, uint256 \_shareLimit)

```solidity
function registerGroup(address _nodeOperator, uint256 _shareLimit) external
```

Registers a new node operator group. Requires `REGISTRY_ROLE`.

### updateGroupShareLimit(address \_nodeOperator, uint256 \_shareLimit)

```solidity
function updateGroupShareLimit(address _nodeOperator, uint256 _shareLimit) external
```

Updates a group's share limit. Requires `REGISTRY_ROLE`.

### registerTiers(address \_nodeOperator, TierParams[] \_tiers)

```solidity
function registerTiers(
    address _nodeOperator,
    TierParams[] calldata _tiers
) external
```

Registers one or more tiers for a node operator. Requires `REGISTRY_ROLE`. Group must exist.

### alterTiers(uint256[] \_tierIds, TierParams[] \_tierParams)

```solidity
function alterTiers(
    uint256[] calldata _tierIds,
    TierParams[] calldata _tierParams
) external
```

Updates existing tier parameters. Requires `REGISTRY_ROLE`. Does not automatically update existing vaults - they must call `syncTier()`.

### changeTier(address \_vault, uint256 \_requestedTierId, uint256 \_requestedShareLimit)

```solidity
function changeTier(
    address _vault,
    uint256 _requestedTierId,
    uint256 _requestedShareLimit
) external returns (bool)
```

Requests tier change for a vault. Returns `true` if executed, `false` if awaiting confirmation.

**Requirements:**

- Cannot change to default tier (ID 0)
- Requested tier must belong to the vault's node operator
- Requested share limit must be ≤ tier's share limit
- Requested share limit must be ≥ vault's current liability shares
- Both vault owner and node operator must confirm
- Tier and group limits must not be exceeded

### syncTier(address \_vault)

```solidity
function syncTier(address _vault) external returns (bool)
```

Syncs vault's connection parameters with current tier parameters. Returns `true` if executed, `false` if awaiting confirmation. Requires dual confirmation. Vault must be connected and not already in sync.

### updateVaultShareLimit(address \_vault, uint256 \_requestedShareLimit)

```solidity
function updateVaultShareLimit(address _vault, uint256 _requestedShareLimit) external returns (bool)
```

Updates a vault's share limit within its current tier. Returns `true` if executed, `false` if awaiting confirmation. Requires dual confirmation.

**Requirements:**

- Requested limit must be ≤ tier's share limit
- Requested limit must be ≥ vault's current liability shares
- Must not be same as current limit

### resetVaultTier(address \_vault)

```solidity
function resetVaultTier(address _vault) external
```

Resets vault to the default tier. Only callable by VaultHub (on disconnect).

### updateVaultFees(...)

```solidity
function updateVaultFees(
    address _vault,
    uint256 _infraFeeBP,
    uint256 _liquidityFeeBP,
    uint256 _reservationFeeBP
) external
```

Updates per-vault fee parameters independently of tier. Requires `REGISTRY_ROLE`. Vault must be connected.

### onMintedShares(address \_vault, uint256 \_amount, bool \_overrideLimits)

```solidity
function onMintedShares(
    address _vault,
    uint256 _amount,
    bool _overrideLimits
) external
```

Notifies OperatorGrid about minted shares. Only callable by VaultHub.

**Checks (unless `_overrideLimits` is true):**

- Vault must not be jailed
- Tier limit must not be exceeded
- Group limit must not be exceeded (for non-default tiers)

### onBurnedShares(address \_vault, uint256 \_amount)

```solidity
function onBurnedShares(address _vault, uint256 _amount) external
```

Notifies OperatorGrid about burned shares. Only callable by VaultHub. Decrements tier and group liability shares.

### setVaultJailStatus(address \_vault, bool \_isInJail)

```solidity
function setVaultJailStatus(address _vault, bool _isInJail) external
```

Jails or unjails a vault. Requires `REGISTRY_ROLE`.

## Permissions

| Role                 | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Admin role for granting/revoking other roles                    |
| `REGISTRY_ROLE`      | Can register groups/tiers, update limits, jail vaults, set fees |

## Related

- [VaultHub](/contracts/vault-hub.md)
- [StakingVault](/contracts/staking-vault.md)
- [Dashboard](/contracts/dashboard.md)
- [stVaults Parameters and Metrics](/run-on-lido/stvaults/features-and-mechanics/parameters-and-metrics)
