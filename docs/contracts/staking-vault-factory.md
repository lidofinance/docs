# VaultFactory

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/VaultFactory.sol)
- [Deployed contract](https://etherscan.io/address/0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A)

Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy.

## What is VaultFactory?

VaultFactory creates new stVault instances:

- deploys a `PinnedBeaconProxy` pointing to the StakingVault beacon
- deploys a `Dashboard` to manage the vault
- optionally connects the vault to `VaultHub`

## View methods

### deployedVaults(address _vault)

```solidity
function deployedVaults(address _vault) external view returns (bool)
```

Returns whether a vault was deployed by this factory.

## Methods

### createVaultWithDashboard(...)

```solidity
function createVaultWithDashboard(
    address _defaultAdmin,
    address _nodeOperator,
    address _nodeOperatorManager,
    uint256 _nodeOperatorFeeBP,
    uint256 _confirmExpiry,
    Permissions.RoleAssignment[] calldata _roleAssignments
) external payable returns (IStakingVault vault, Dashboard dashboard)
```

Creates a vault + dashboard and connects to VaultHub.

### createVaultWithDashboardWithoutConnectingToVaultHub(...)

```solidity
function createVaultWithDashboardWithoutConnectingToVaultHub(
    address _defaultAdmin,
    address _nodeOperator,
    address _nodeOperatorManager,
    uint256 _nodeOperatorFeeBP,
    uint256 _confirmExpiry,
    Permissions.RoleAssignment[] calldata _roleAssignments
) external returns (IStakingVault vault, Dashboard dashboard)
```

Creates a vault + dashboard without connecting to VaultHub.

## Related

- [StakingVault](/contracts/staking-vault)
- [Staking Vault Beacon](/contracts/staking-vault-beacon)
- [Dashboard](/contracts/dashboard)
- [VaultHub](/contracts/vault-hub)
