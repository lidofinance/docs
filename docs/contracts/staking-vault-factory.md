# VaultFactory

- [Source code](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/vaults/VaultFactory.sol)
- [Deployed contract](https://etherscan.io/address/0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A)

Factory for deploying `StakingVault` + `Dashboard` pairs using a beacon proxy.

## What is VaultFactory?

VaultFactory creates new stVault instances:

- deploys a `PinnedBeaconProxy` pointing to the StakingVault beacon
- deploys a `Dashboard` to manage the vault
- optionally connects the vault to `VaultHub`

VaultHub enforces factory-based deployments upon connection by checking that the
vault was created by the current factory or a previous factory in the chain.

## Immutable variables

| Variable           | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `LIDO_LOCATOR`     | Address of the LidoLocator contract                    |
| `BEACON`           | Address of the StakingVault beacon contract            |
| `DASHBOARD_IMPL`   | Address of the Dashboard implementation for cloning    |
| `PREVIOUS_FACTORY` | Address of the previous factory in the chain (or zero) |

## Factory flows

VaultFactory exposes two creation flows:

### 1. Create + connect via `createVaultWithDashboard()`

- Requires `msg.value >= CONNECT_DEPOSIT` (1 ETH)
- Deploys StakingVault proxy and Dashboard clone
- Initializes vault with Dashboard as owner
- Initializes Dashboard with **factory as temporary default admin**
- Connects to VaultHub with the provided ETH
- Grants optional roles (only `_defaultAdmin` sub-roles)
- Transfers `DEFAULT_ADMIN_ROLE` to `_defaultAdmin` and revokes from factory

### 2. Create without connecting via `createVaultWithDashboardWithoutConnectingToVaultHub()`

- No ETH required
- Deploys StakingVault proxy and Dashboard clone
- Initializes vault with Dashboard as owner
- Initializes Dashboard with `_defaultAdmin` as default admin and **factory as temporary NODE_OPERATOR_MANAGER**
- Grants optional roles (only `_nodeOperatorManager` sub-roles)
- Transfers `NODE_OPERATOR_MANAGER_ROLE` to `_nodeOperatorManager` and revokes from factory

### Factory chaining

The factory supports a `PREVIOUS_FACTORY` immutable reference for migration between factory versions:

- VaultHub accepts vaults deployed by the **current factory** or any **previous factory in the chain**
- When a new factory is deployed, it references the old factory via `PREVIOUS_FACTORY`
- Creates a linked list of valid factories for backwards compatibility
- Previously deployed vaults remain eligible for connection without redeployment

```
NewFactory.PREVIOUS_FACTORY → OldFactory.PREVIOUS_FACTORY → ... → address(0)
```

### Connect deposit

When using `createVaultWithDashboard()`, the caller must send at least `CONNECT_DEPOSIT` (1 ETH) with the transaction. This ETH is escrowed by VaultHub and returned when the vault disconnects.

## Structs

### RoleAssignment

Role assignment for Dashboard initialization (from `Permissions`):

```solidity
struct RoleAssignment {
    address account;   // Account to grant role to
    bytes32 role;      // Role identifier
}
```

## View methods

### deployedVaults(address \_vault)

```solidity
function deployedVaults(address _vault) external view returns (bool)
```

Returns whether a vault was deployed by this factory or any previous factory in the chain. Recursively checks `PREVIOUS_FACTORY` if set.

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

**Parameters:**

- `_defaultAdmin`: Address to receive `DEFAULT_ADMIN_ROLE` on Dashboard
- `_nodeOperator`: Node operator address for the StakingVault
- `_nodeOperatorManager`: Address for `NODE_OPERATOR_MANAGER_ROLE` and fee recipient
- `_nodeOperatorFeeBP`: Node operator fee in basis points
- `_confirmExpiry`: Confirmation expiry time in seconds
- `_roleAssignments`: Optional roles to grant (only `_defaultAdmin` sub-roles)

**Requirements:**

- `msg.value >= CONNECT_DEPOSIT`

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

**Parameters:**

- `_defaultAdmin`: Address to receive `DEFAULT_ADMIN_ROLE` on Dashboard
- `_nodeOperator`: Node operator address for the StakingVault
- `_nodeOperatorManager`: Address to receive `NODE_OPERATOR_MANAGER_ROLE` and fee recipient
- `_nodeOperatorFeeBP`: Node operator fee in basis points
- `_confirmExpiry`: Confirmation expiry time in seconds
- `_roleAssignments`: Optional roles to grant (only `_nodeOperatorManager` sub-roles)

## Events

```solidity
event VaultCreated(address indexed vault);
event DashboardCreated(address indexed dashboard, address indexed vault, address indexed admin);
```

## Related

- [StakingVault](/contracts/staking-vault)
- [Staking Vault Beacon](/contracts/staking-vault-beacon)
- [Dashboard](/contracts/dashboard)
- [VaultHub](/contracts/vault-hub)
