# TopUpGateway

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/TopUpGateway.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

:::note
The deployed contract address will be added here after deployment.
:::

## What is TopUpGateway

TopUpGateway is the entry point for topping up `0x02`-type (compounding) Lido validators. For each validator it:

- verifies the validator container against the Consensus Layer state using Merkle proofs anchored to a beacon block root fetched via [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) (`CLValidatorVerifier`);
- computes a per-validator top-up limit from the configured target balance, the validator's effective balance, and its pending deposits;
- forwards the validated keys and limits to [StakingRouter.topUp](/contracts/staking-router).

The per-validator top-up limit is `targetBalanceGwei − (effectiveBalance + pendingBalanceGwei)`. The limit is zeroed if the validator is exiting/exited (`exitEpoch != FAR_FUTURE_EPOCH`) or slashed, if the current total already meets the target, or if the resulting amount is below `minTopUpGwei`.

`topUp` is permissioned (`TOP_UP_ROLE`, held by the Lido Depositor Bot). The contract inherits `CLValidatorVerifier`, `AccessControlEnumerableUpgradeable`, and `PausableUntil`, and is deployed behind an [OssifiableProxy](/contracts/ossifiable-proxy).

## Roles and access control

To engage Emergency Brakes and unpause if required, the contract inherits `PausableUntil` (see [GateSeal](/contracts/gate-seal)).

| Role                 | Holder                                              | Description                                      |
| -------------------- | --------------------------------------------------- | ------------------------------------------------ |
| `DEFAULT_ADMIN_ROLE` | Aragon Agent                                        | Manages all other roles.                         |
| `TOP_UP_ROLE`        | Lido Depositor Bot                                  | Submits top-up transactions.                     |
| `MANAGE_LIMITS_ROLE` | _unassigned_                                        | Manages top-up limit parameters.                 |
| `PAUSE_ROLE`         | [CircuitBreaker](/contracts/circuit-breaker) + ResealManager | Pauses the contract.                    |
| `RESUME_ROLE`        | ResealManager                                       | Resumes the contract.                            |

The proxy admin is the Aragon Agent.

## Constructor and initialization

```sol
constructor(
    address _lidoLocator,
    GIndex _gIFirstValidatorPrev,
    GIndex _gIFirstValidatorCurr,
    uint64 _pivotSlot,
    uint256 _slotsPerEpoch
)

function initialize(
    address _admin,
    uint256 _maxValidatorsPerTopUp,
    uint256 _minTopUpBlockDistance,
    uint256 _maxRootAgeSec,
    uint256 _targetBalanceGwei,
    uint256 _minTopUpGwei
) external
```

| Parameter                | Type      | Description                                                                                       |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| `_lidoLocator`           | `address` | The [LidoLocator](/contracts/lido-locator) address.                                               |
| `_gIFirstValidatorPrev`  | `GIndex`  | Generalized index of the first validator before the pivot slot (proof verification).              |
| `_gIFirstValidatorCurr`  | `GIndex`  | Generalized index of the first validator at/after the pivot slot (proof verification).            |
| `_pivotSlot`             | `uint64`  | Slot at which the generalized index changes.                                                      |
| `_slotsPerEpoch`         | `uint256` | Slots per epoch (initial value: `32`), stored in the `SLOTS_PER_EPOCH` immutable.                 |
| `_admin`                 | `address` | Receives `DEFAULT_ADMIN_ROLE`. Reverts `ZeroArgument` if zero.                                     |
| `_maxValidatorsPerTopUp` | `uint256` | Maximum validators per single `topUp` call (initial value: `32`).                                 |
| `_minTopUpBlockDistance` | `uint256` | Minimum blocks between `topUp` calls (initial value: `75`).                                        |
| `_maxRootAgeSec`         | `uint256` | Maximum age of the beacon root relative to `block.timestamp`, in seconds (initial value: `600`).  |
| `_targetBalanceGwei`     | `uint256` | Target validator balance ceiling after top-up, in Gwei (initial value: `2046.75 ETH`).            |
| `_minTopUpGwei`          | `uint256` | Minimum top-up that can be performed, in Gwei (initial value: `2 ETH`). Must be `<= _targetBalanceGwei`. |

## Constants and immutables

| Name              | Description                                                  |
| ----------------- | ----------------------------------------------------------- |
| `SLOTS_PER_EPOCH` | Immutable slots-per-epoch value used to derive epochs from slots. |

## Methods

### `TOP_UP_ROLE`

An ACL role granting the permission to submit top-up transactions.

```sol
bytes32 public constant TOP_UP_ROLE = keccak256("TOP_UP_ROLE");
```

### `MANAGE_LIMITS_ROLE`

An ACL role granting the permission to modify top-up limit parameters.

```sol
bytes32 public constant MANAGE_LIMITS_ROLE = keccak256("MANAGE_LIMITS_ROLE");
```

### topUp()

Verifies the Merkle proofs for the provided validators and tops them up via [StakingRouter.topUp](/contracts/staking-router). Only callable by accounts with `TOP_UP_ROLE` and only when not paused.

```sol
function topUp(TopUpData calldata _topUps) external onlyRole(TOP_UP_ROLE) whenResumed
```

**Structures**:

```sol
struct TopUpData {
    uint256 moduleId;
    uint256[] keyIndices;
    uint256[] operatorIds;
    uint256[] validatorIndices;
    BeaconRootData beaconRootData;
    ValidatorWitness[] validatorWitness;
    uint256[] pendingBalanceGwei;
}
```

`validatorIndices` MUST be sorted in strictly ascending order. The `keyIndices`, `operatorIds`, `validatorWitness`, and `pendingBalanceGwei` arrays must be aligned by position to `validatorIndices[i]`.

Reverts if:

- the caller does not have `TOP_UP_ROLE`;
- the contract is paused (`whenResumed`);
- `validatorIndices` is empty, or any of `keyIndices`, `operatorIds`, `validatorWitness`, `pendingBalanceGwei` has a different length (`WrongArrayLength`);
- `validatorIndices` length exceeds `maxValidatorsPerTopUp` (`MaxValidatorsPerTopUpExceeded`);
- `validatorIndices` is not strictly increasing (`InvalidValidatorIndicesSortOrder`);
- fewer than `minBlockDistance` blocks have passed since the last top-up (`MinBlockDistanceNotMet`);
- the beacon root is older than `maxRootAge` relative to `block.timestamp` (`RootIsTooOld`);
- the beacon root's child block timestamp is not newer than the last top-up timestamp (`RootPrecedesLastTopUp`);
- the module's withdrawal credentials are not of type `0x02` (`WrongWithdrawalCredentials`);
- any validator pubkey is not exactly 48 bytes (`WrongPubkeyLength`);
- any validator has not yet been activated (`activationEpoch > current epoch`) (`ValidatorIsNotActivated`);
- any validator Merkle proof fails verification.

### setMaxValidatorsPerTopUp()

Sets the maximum number of validators per single `topUp` call. Requires `MANAGE_LIMITS_ROLE`. Emits `MaxValidatorsPerTopUpChanged`.

```sol
function setMaxValidatorsPerTopUp(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE)
```

### setMinBlockDistance()

Sets the minimum number of blocks between `topUp` calls. Requires `MANAGE_LIMITS_ROLE`. Emits `MinBlockDistanceChanged`.

```sol
function setMinBlockDistance(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE)
```

### setTopUpBalanceLimits()

Sets the target validator balance ceiling and the minimum top-up amount (both in Gwei). Requires `MANAGE_LIMITS_ROLE`. Reverts if `_minTopUpGwei > _targetBalanceGwei` (`MinTopUpExceedsTarget`). Emits `TopUpBalanceLimitsChanged`.

```sol
function setTopUpBalanceLimits(uint256 _targetBalanceGwei, uint256 _minTopUpGwei) external onlyRole(MANAGE_LIMITS_ROLE)
```

### setMaxRootAge()

Sets the maximum allowed age (in seconds) of the beacon root relative to `block.timestamp`. Requires `MANAGE_LIMITS_ROLE`. Emits `MaxRootAgeChanged`.

```sol
function setMaxRootAge(uint256 _newValue) external onlyRole(MANAGE_LIMITS_ROLE)
```

### resume()

Resumes the contract. Reverts if the contract is not paused or the caller lacks `RESUME_ROLE`.

```sol
function resume() external onlyRole(RESUME_ROLE)
```

### pauseFor()

Pauses the contract for a specified duration (use `PAUSE_INFINITELY` for an unlimited pause).

```sol
function pauseFor(uint256 _duration) external onlyRole(PAUSE_ROLE)
```

### pauseUntil()

Pauses the contract until a specified timestamp (inclusive).

```sol
function pauseUntil(uint256 _pauseUntilInclusive) external onlyRole(PAUSE_ROLE)
```

## View methods

### getLastTopUpTimestamp()

Returns the timestamp of the last top-up.

```sol
function getLastTopUpTimestamp() external view returns (uint256)
```

### getMaxValidatorsPerTopUp()

Returns the allowed number of validators per top-up.

```sol
function getMaxValidatorsPerTopUp() external view returns (uint256)
```

### getMinBlockDistance()

Returns the minimum block distance required between top-ups.

```sol
function getMinBlockDistance() external view returns (uint256)
```

### isBlockDistancePassed()

Returns `true` if enough blocks have passed since the last top-up (or if no top-up has happened yet).

```sol
function isBlockDistancePassed() external view returns (bool)
```

### getMaxRootAge()

Returns the maximum age (in seconds) of the beacon root relative to `block.timestamp`.

```sol
function getMaxRootAge() external view returns (uint256)
```

### getTargetBalanceGwei()

Returns the target validator balance ceiling after top-up (in Gwei).

```sol
function getTargetBalanceGwei() external view returns (uint256)
```

### getMinTopUpGwei()

Returns the minimum top-up that can be performed (in Gwei).

```sol
function getMinTopUpGwei() external view returns (uint256)
```

## Events

```sol
event MaxValidatorsPerTopUpChanged(uint256 newValue);
event MinBlockDistanceChanged(uint256 newValue);
event LastTopUpChanged(uint256 newValue);
event MaxRootAgeChanged(uint256 newValue);
event TopUpBalanceLimitsChanged(uint256 targetBalanceGwei, uint256 minTopUpGwei);
```

## Related

- [StakingRouter](/contracts/staking-router)
- [LidoLocator](/contracts/lido-locator)
