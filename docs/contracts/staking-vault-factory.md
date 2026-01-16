# VaultFactory

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/VaultFactory.sol)
- [Deployed contract](https://etherscan.io/address/0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A)

Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy.

## What is VaultFactory?

VaultFactory creates new stVault instances:

- deploys a `PinnedBeaconProxy` pointing to the StakingVault beacon
- deploys a `Dashboard` to manage the vault
- optionally connects the vault to `VaultHub`

VaultHub enforces factory-based deployments upon connection by checking that the
vault was created by the current factory or a previous factory in the chain.

## Factory flows

VaultFactory exposes two creation flows, reflected in the NatSpec:

1. **Create + connect** via `createVaultWithDashboard()`:
   - deploys `StakingVault` and `Dashboard`
   - initializes the vault with `Dashboard` as owner
   - initializes the dashboard and immediately connects to `VaultHub`
2. **Create without connecting** via `createVaultWithDashboardWithoutConnectingToVaultHub()`:
   - deploys `StakingVault` and `Dashboard`
   - initializes the vault with `Dashboard` as owner
   - initializes the dashboard without calling `connectToVaultHub`

### Factory chaining

The factory supports a `PREVIOUS_FACTORY` immutable reference. This enables migration between factory versions:

- VaultHub only accepts vaults deployed by the **current factory** or any **previous factory in the chain**
- When a new factory is deployed, it references the old factory via `PREVIOUS_FACTORY`
- This creates a linked list of valid factories, maintaining backwards compatibility
- Previously deployed vaults remain eligible for connection without redeployment

```
NewFactory.PREVIOUS_FACTORY → OldFactory.PREVIOUS_FACTORY → ... → address(0)
```

### Connect deposit

When using `createVaultWithDashboard()`, the caller must send **1 ETH** with the transaction. This ETH is escrowed by VaultHub as a connect deposit and returned when the vault disconnects.

## Structs

### RoleAssignment

Role assignment for Dashboard initialization:

```solidity
struct RoleAssignment {
    bytes32 role;      // Role identifier
    address account;   // Account to grant role to
}
```

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
