# VaultConfigurator

## Overview

The `VaultConfigurator` contract provides a streamlined and modular deployment mechanism for setting up a new `Vault` instance and its associated managers. It orchestrates the creation and initialization of the following components:

- `Vault`
- `ShareManager`
- `FeeManager`
- `RiskManager`
- `Oracle`

It ensures that all components are correctly wired together by setting appropriate references between them.

## Purpose

This contract is designed to be used by an actor that need to deploy and configure fully functional vaults in a deterministic and upgradeable way, using versioned module factories.

## Contract Structure

### State Variables

```solidity
IFactory public immutable shareManagerFactory;
IFactory public immutable feeManagerFactory;
IFactory public immutable riskManagerFactory;
IFactory public immutable oracleFactory;
IFactory public immutable vaultFactory;
```

Each of these holds a reference to a factory contract responsible for creating a specific type of contract.

### Constructor

```solidity
constructor(
    address shareManagerFactory_,
    address feeManagerFactory_,
    address riskManagerFactory_,
    address oracleFactory_,
    address vaultFactory_
)
```

Initializes the configurator with references to module factories.

## InitParams Struct

```solidity
struct InitParams {
    uint256 version;
    address proxyAdmin;
    address vaultAdmin;
    uint256 shareManagerVersion;
    bytes shareManagerParams;
    uint256 feeManagerVersion;
    bytes feeManagerParams;
    uint256 riskManagerVersion;
    bytes riskManagerParams;
    uint256 oracleVersion;
    bytes oracleParams;
    address defaultDepositHook;
    address defaultRedeemHook;
    uint256 queueLimit;
    Vault.RoleHolder[] roleHolders;
}
```

### Fields

- `version`: Version of the `Vault` implementation to deploy.
- `proxyAdmin`: Address to be set as `ProxyAdmin` for upgradeable proxies.
- `vaultAdmin`: Address to be set as the vault's owner (admin).
- `_Version`: Specific implementation version to use for each module (used in the corresponding factory).
- `_Params`: ABI-encoded initialization parameters for each module.
- `defaultDepositHook`: Address of the default deposit hook to attach to queues.
- `defaultRedeemHook`: Address of the default redeem hook to attach to queues.
- `queueLimit`: Maximum number of queued operations per deposit and redeem queue.
- `roleHolders`: List of role assignments for vault level access control.

## External Functions

### `create`

```solidity
function create(InitParams calldata params)
    external
    returns (
        address shareManager,
        address feeManager,
        address riskManager,
        address oracle,
        address vault
    )
```

### Description

Creates and initializes a new vault instance along with all dependent modules using the provided factory addresses and parameters.

### Steps

1. Deploy ShareManager using `shareManagerFactory` to deploy a versioned `ShareManager` proxy.
2. Deploy FeeManager using `feeManagerFactory` to deploy a versioned `FeeManager`.
3. Deploy RiskManager using `riskManagerFactory` to deploy a versioned `RiskManager`.
4. Deploy Oracle using `oracleFactory` to deploy a versioned `Oracle`.
5. Deploy Vault by preparing encoded initialization calldata and calling `vaultFactory.create()` with the version and proxy admin.
6. Post deployment wiring sets the `vault` address in each of the deployed components using `IShareManager(shareManager).setVault(vault)`, `IRiskManager(riskManager).setVault(vault)`, and `IOracle(oracle).setVault(vault)`.

### Returns

- `shareManager`: Address of the deployed share manager contract.
- `feeManager`: Address of the deployed fee manager contract.
- `riskManager`: Address of the deployed risk manager contract.
- `oracle`: Address of the deployed oracle contract.
- `vault`: Address of the newly created vault.
