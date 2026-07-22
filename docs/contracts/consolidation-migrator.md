# ConsolidationMigrator

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationMigrator.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

:::note
The deployed contract address will be added here after deployment.
:::

## What is ConsolidationMigrator

ConsolidationMigrator is a temporary migration helper for moving validators from a fixed **source** staking module to a fixed **target** staking module. Both module IDs are immutable, set in the implementation constructor.

It validates consolidation requests submitted as key indices, resolves those indices to validator public keys through the source and target staking modules, and forwards the resulting groups to the [ConsolidationBus](/contracts/consolidation-bus). Pairs of (source operator, target operator) are managed through an allowlist driven by an [EasyTrack](https://dao.lido.fi/easy-track/motions) flow.

The contract inherits `AccessControlEnumerableUpgradeable` and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## Roles and access control

| Role                 | Holder                              | Description                                          |
| -------------------- | ----------------------------------- | ---------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Aragon Agent                        | Manages all other roles.                             |
| `ALLOW_PAIR_ROLE`    | EasyTrack EVMScriptExecutor         | Allows consolidation pairs and assigns submitters.   |
| `DISALLOW_PAIR_ROLE` | CMC Committee                       | Disallows consolidation pairs.                       |

The proxy admin is the Aragon Agent.

## Constants

| Constant         | Value | Description                            |
| ---------------- | ----- | -------------------------------------- |
| `PUBKEY_LENGTH`  | `48`  | Length of a validator public key in bytes. |

## Constructor and initialization

The module bindings are set in the implementation constructor as immutables; `initialize` only sets the admin.

```sol
constructor(
    address stakingRouter,
    address consolidationBus,
    uint256 _sourceModuleId,
    uint256 _targetModuleId
)

function initialize(address admin) external
```

| Parameter          | Type      | Description                                                              |
| ------------------ | --------- | ------------------------------------------------------------------------ |
| `stakingRouter`    | `address` | The [StakingRouter](/contracts/staking-router) address.                  |
| `consolidationBus` | `address` | The [ConsolidationBus](/contracts/consolidation-bus) address.            |
| `_sourceModuleId`  | `uint256` | Immutable source module ID (`1` — NOR / CMv1).                           |
| `_targetModuleId`  | `uint256` | Immutable target module ID (`4` — CMv2).                                 |
| `admin`            | `address` | Receives `DEFAULT_ADMIN_ROLE`. Reverts `AdminCannotBeZero` if zero.      |

## Allowlist management

### allowPair()

Allows a consolidation pair (source operator → target operator) and designates the address authorized to submit consolidation batches for that pair. Requires `ALLOW_PAIR_ROLE`. Can be called again for an existing pair to update the submitter. Reverts if `submitter` is zero (`ZeroArgument`). Emits `ConsolidationPairAllowed`.

```sol
function allowPair(
    uint256 sourceOperatorId,
    uint256 targetOperatorId,
    address submitter
) external onlyRole(ALLOW_PAIR_ROLE)
```

### disallowPair()

Disallows a consolidation pair and removes its submitter. Requires `DISALLOW_PAIR_ROLE`. Reverts if the pair is not in the allowlist (`PairNotInAllowlist`). Emits `ConsolidationPairDisallowed`.

```sol
function disallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external onlyRole(DISALLOW_PAIR_ROLE)
```

### selfDisallowPair()

Permissionless: lets a pair's designated submitter remove their own pair. The caller must be the pair's submitter, otherwise it reverts with `NotAuthorized`. Emits `ConsolidationPairDisallowed`.

```sol
function selfDisallowPair(uint256 sourceOperatorId, uint256 targetOperatorId) external
```

## Submit

### submitConsolidationBatch()

Submits a consolidation batch for an allowed pair. The caller must be the pair's designated submitter (`NotAuthorized` otherwise). Each referenced key index is validated to be deposited (`keyIndex < totalDepositedValidators`, else `KeyNotDeposited`), resolved to its public key via the corresponding staking module, and the resulting groups are forwarded to the [ConsolidationBus](/contracts/consolidation-bus). Emits `ConsolidationSubmitted`.

```sol
function submitConsolidationBatch(
    uint256 sourceOperatorId,
    uint256 targetOperatorId,
    ConsolidationIndexGroup[] calldata groups
) external
```

**Structures**:

```sol
struct ConsolidationIndexGroup {
    uint256[] sourceKeyIndices;
    uint256 targetKeyIndex;
}
```

**Parameters:**

| Name               | Type                        | Description                                                       |
| ------------------ | --------------------------- | ----------------------------------------------------------------- |
| `sourceOperatorId` | `uint256`                   | Source operator ID in the source module.                          |
| `targetOperatorId` | `uint256`                   | Target operator ID in the target module.                          |
| `groups`           | `ConsolidationIndexGroup[]` | Groups of source key indices each mapped to a single target key index. |

## View methods

### isPairAllowed()

```sol
function isPairAllowed(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (bool)
```

### getAllowedTargets()

Returns all allowed target operator IDs for a given source operator.

```sol
function getAllowedTargets(uint256 sourceOperatorId) external view returns (uint256[] memory)
```

### getSubmitter()

Returns the submitter address for a pair, or `address(0)` if the pair is not allowed.

```sol
function getSubmitter(uint256 sourceOperatorId, uint256 targetOperatorId) external view returns (address)
```

### getStakingRouter()

```sol
function getStakingRouter() external view returns (address)
```

### getConsolidationBus()

```sol
function getConsolidationBus() external view returns (address)
```

### sourceModuleId()

```sol
function sourceModuleId() external view returns (uint256)
```

### targetModuleId()

```sol
function targetModuleId() external view returns (uint256)
```

## Events

```sol
event ConsolidationPairAllowed(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    address indexed submitter
);
event ConsolidationPairDisallowed(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    address indexed submitter
);
event ConsolidationSubmitted(
    uint256 indexed sourceOperatorId,
    uint256 indexed targetOperatorId,
    ConsolidationIndexGroup[] groups
);
```

## Errors

| Error                                | Description                                                      |
| ------------------------------------ | ---------------------------------------------------------------- |
| `PairNotInAllowlist(...)`            | The pair is not in the allowlist.                                |
| `KeyNotDeposited(...)`               | A referenced key index has not been deposited.                   |
| `NotAuthorized(...)`                 | The caller is not the designated submitter for the pair.         |
| `ZeroArgument(string name)`          | A required zero-checked argument was zero.                       |
| `AdminCannotBeZero()`                | The admin address passed to `initialize` was zero.              |

## Related

- [ConsolidationBus](/contracts/consolidation-bus)
- [ConsolidationGateway](/contracts/consolidation-gateway)
- [StakingRouter](/contracts/staking-router)
