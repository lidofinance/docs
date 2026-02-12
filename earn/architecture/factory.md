# Factory

## Overview

The `Factory` contract is a generalized deployment mechanism for creating upgradeable proxy instances of pre-approved implementations. It tracks multiple implementation versions, proposal workflows, blacklisting for security, and ownership based access control.

It conforms to the `IFactory` interface and supports deploying any `IFactoryEntity` compliant contracts via `TransparentUpgradeableProxy`, using `initialize()` for configuration.

## Key Capabilities

- Versioned deployment: track multiple logic contract versions, each deployable by index.
- Proposal system: allow anyone to propose implementations, with owner approval required.
- Blacklist mechanism: prevent deployment of insecure or deprecated versions.
- Deterministic deployments: uses `create2` salt to ensure predictable addresses.
- Entity tracking: keeps a registry of all deployed entities.

## Storage Structure

The contract uses a deterministic storage layout via:

```solidity
bytes32 _factoryStorageSlot = SlotLibrary.getSlot("Factory", name_, version_);
```

Storage fields (in `FactoryStorage`) include:

| Field | Description |
| --- | --- |
| `entities` | Set of all deployed proxy instances |
| `implementations` | Approved logic contract addresses |
| `proposals` | Pending implementation proposals |
| `isBlacklisted` | Mapping from version -> is blacklisted |

## Initialization

```solidity
function initialize(bytes calldata data) external initializer
```

- Accepts encoded owner address.
- Sets initial admin and emits `Initialized`.

## Entity Deployment

```solidity
function create(uint256 version, address owner, bytes calldata initParams) external returns (address instance)
```

Deploys a new `TransparentUpgradeableProxy`:

- Uses implementation from `implementations.at(version)`.
- Rejects if version is out of bounds or blacklisted.
- Uses `salt = keccak256(version, owner, initParams, currentEntityCount)` for deterministic deployment.
- Calls `initialize(initParams)` on the new proxy.

Emits:

```solidity
event Created(address instance, uint256 version, address owner, bytes initParams);
```

## Implementation Management

### Propose New Implementation

```solidity
function proposeImplementation(address implementation) external
```

- Fails if already in `implementations` or `proposals`.
- Adds to `proposals`.
- Emits `ProposeImplementation(implementation)`.
- Permissionless function.

### Accept Proposed Implementation

```solidity
function acceptProposedImplementation(address implementation) external onlyOwner
```

- Only callable by owner.
- Fails if not proposed.
- Moves from `proposals` to `implementations`.
- Emits `AcceptProposedImplementation(implementation)`.

### Blacklisting

```solidity
function setBlacklistStatus(uint256 version, bool flag) external onlyOwner
```

- Blocks deployments using a specific version.
- Enforces that version index exists.
- Emits `SetBlacklistStatus(version, flag)`.

## View Functions

| Function | Returns |
| --- | --- |
| `entities()` | Total number of deployed entities |
| `entityAt(index)` | Deployed entity at index |
| `isEntity(address)` | Checks if address is a deployed entity |
| `implementations()` | Total implementation count |
| `implementationAt(index)` | Implementation at index |
| `proposals()` | Total proposals pending approval |
| `proposalAt(index)` | Proposal at index |
| `isBlacklisted(version)` | Whether a version is blocked from deployment |

## Access Control

- Uses `OwnableUpgradeable`.
- Only owner can accept implementations and blacklist versions.

## Security Considerations

- Immutable logic whitelist: only approved contracts can be deployed.
- Blacklisting: emergency response for vulnerabilities.
- Replay protection: deployment salt ensures unique addresses.
- Decentralized proposals: anyone can propose implementations, but only owner can accept.
