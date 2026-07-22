# ConsolidationGateway

- [Source code](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/consolidation/ConsolidationGateway.sol)
- Specification basis: [LIP-35 — Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)

:::note
The deployed contract address will be added here after deployment.
:::

## What is ConsolidationGateway

ConsolidationGateway is the single entry point for all [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) validator consolidation requests in Lido Core. It proxies consolidation requests to the [WithdrawalVault](/contracts/withdrawal-vault), enforcing the following before a request is forwarded:

- the caller holds the `ADD_CONSOLIDATION_REQUEST_ROLE`;
- the target validator's withdrawal credentials are verified against the Lido `0x02` withdrawal credentials using on-chain Consensus Layer Merkle proofs (`CLProofVerifier`);
- the per-frame consolidation request limit is not exceeded;
- the protocol is operating normally — [DepositSecurityModule](/contracts/deposit-security-module) deposits are not paused, and Lido is neither stopped nor in bunker mode (`Lido.canDeposit()`);
- the supplied fee covers `requestsCount * WithdrawalVault.getConsolidationRequestFee()`. Any excess is refunded to the `refundRecipient`.

This contract is **not** behind a proxy. It inherits [AccessControlEnumerable](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/utils/access/AccessControlEnumerable.sol), `PausableUntil`, and `CLProofVerifier`.

:::note
This is the Lido Core consolidation gateway. For consolidations into stVaults, see [ValidatorConsolidationRequests](/contracts/validator-consolidation-requests).
:::

## Roles and access control

Access to lever methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/core/blob/main/contracts/0.8.25/utils/access/AccessControlEnumerable.sol)
contract and a set of granular roles. To engage Emergency Brakes and unpause if required, it inherits `PausableUntil` (see [GateSeal](/contracts/gate-seal)).

| Role                            | Holder                                          | Description                                              |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`            | Aragon Agent         | Manages all other roles.                                 |
| `PAUSE_ROLE`                    | [CircuitBreaker](/contracts/circuit-breaker) + ResealManager | Pauses the contract.                        |
| `RESUME_ROLE`                   | ResealManager                                   | Resumes the contract.                                    |
| `ADD_CONSOLIDATION_REQUEST_ROLE`| [ConsolidationBus](/contracts/consolidation-bus)| Submits consolidation requests.                          |
| `EXIT_LIMIT_MANAGER_ROLE`       | _unassigned_                                    | Manages the consolidation request limit parameters.      |

## Constructor

```sol
constructor(
    address admin,
    address lidoLocator,
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec,
    GIndex _gIFirstValidatorPrev,
    GIndex _gIFirstValidatorCurr,
    uint64 _pivotSlot
)
```

| Parameter                       | Type      | Description                                                                              |
| ------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `admin`                         | `address` | Receives `DEFAULT_ADMIN_ROLE`. Reverts with `AdminCannotBeZero` if zero.                 |
| `lidoLocator`                   | `address` | The [LidoLocator](/contracts/lido-locator) address.                                      |
| `maxConsolidationRequestsLimit` | `uint256` | Maximum consolidation requests limit (initial value: `2900`).                            |
| `consolidationsPerFrame`        | `uint256` | Number of consolidations restored per frame (initial value: `1`).                        |
| `frameDurationInSec`            | `uint256` | Duration of each frame, in seconds (initial value: `30`).                                |
| `_gIFirstValidatorPrev`         | `GIndex`  | Generalized index of the first validator before the pivot slot (proof verification).     |
| `_gIFirstValidatorCurr`         | `GIndex`  | Generalized index of the first validator at/after the pivot slot (proof verification).   |
| `_pivotSlot`                    | `uint64`  | Slot at which the generalized index changes (initial value: `0`).                        |

## Methods

### `ADD_CONSOLIDATION_REQUEST_ROLE`

An ACL role granting the permission to submit consolidation requests.

```sol
bytes32 public constant ADD_CONSOLIDATION_REQUEST_ROLE = keccak256("ADD_CONSOLIDATION_REQUEST_ROLE");
```

### `EXIT_LIMIT_MANAGER_ROLE`

An ACL role granting the permission to modify the consolidation request limit parameters.

```sol
bytes32 public constant EXIT_LIMIT_MANAGER_ROLE = keccak256("EXIT_LIMIT_MANAGER_ROLE");
```

### addConsolidationRequests()

Submits grouped consolidation requests to the [WithdrawalVault](/contracts/withdrawal-vault). Each group represents multiple source validators consolidating into a single target validator, whose withdrawal credentials are verified via an on-chain Consensus Layer proof.

The total fee is `requestsCount * WithdrawalVault.getConsolidationRequestFee()`, where `requestsCount` is the sum of `sourcePubkeys` lengths across all groups. Any excess ETH is refunded to `refundRecipient` (or to `msg.sender` if `refundRecipient` is the zero address).

```sol
function addConsolidationRequests(
    ConsolidationWitnessGroup[] calldata groups,
    address refundRecipient
) external payable onlyRole(ADD_CONSOLIDATION_REQUEST_ROLE) preservesEthBalance whenResumed
```

**Structures**:

```sol
struct ConsolidationWitnessGroup {
    bytes[] sourcePubkeys;
    IPredepositGuarantee.ValidatorWitness targetWitness;
}
```

The `targetWitness` is an `IPredepositGuarantee.ValidatorWitness` and carries the target validator's container fields together with the Merkle proof used to verify its withdrawal credentials.

**Parameters:**

| Name              | Type                          | Description                                                                              |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `groups`          | `ConsolidationWitnessGroup[]` | The consolidation groups, each pairing a set of source public keys with one target witness. |
| `refundRecipient` | `address`                     | The address that receives any excess ETH sent for fees (defaults to `msg.sender` if zero). |

Reverts if:

- the caller does not have `ADD_CONSOLIDATION_REQUEST_ROLE`;
- the contract is paused (`whenResumed`);
- `msg.value` is zero, or `groups` is empty (`ZeroArgument`);
- any group has no source public keys (`EmptyGroup`);
- DepositSecurityModule deposits are paused (`DSMDepositsPaused`);
- Lido is stopped or in bunker mode (`LidoDepositsPaused`);
- target validator proof verification fails;
- the per-frame consolidation request limit is exceeded (`ConsolidationRequestsLimitExceeded`);
- the supplied fee is insufficient (`InsufficientFee`);
- the excess fee refund transfer fails (`FeeRefundFailed`).

### setConsolidationRequestLimit()

Sets the maximum consolidation request limit and the frame during which a portion of the limit is restored.

```sol
function setConsolidationRequestLimit(
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec
) external onlyRole(EXIT_LIMIT_MANAGER_ROLE)
```

Emits a `ConsolidationRequestsLimitSet` event.

**Parameters:**

| Name                            | Type      | Description                                                                                                       |
| ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `maxConsolidationRequestsLimit` | `uint256` | The maximum number of consolidation requests.                                                                     |
| `consolidationsPerFrame`        | `uint256` | The number of consolidations restored per frame.                                                                  |
| `frameDurationInSec`            | `uint256` | The duration of each frame, in seconds, after which `consolidationsPerFrame` consolidations can be restored.      |

### getConsolidationRequestLimitFullInfo()

Returns information about the current limit data.

```sol
function getConsolidationRequestLimitFullInfo() external view returns (
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec,
    uint256 prevConsolidationRequestsLimit,
    uint256 currentConsolidationRequestsLimit
)
```

**Returns:**

| Name                                | Type      | Description                                                                       |
| ----------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `maxConsolidationRequestsLimit`     | `uint256` | Maximum consolidation requests limit.                                             |
| `consolidationsPerFrame`            | `uint256` | The number of consolidations that can be restored per frame.                      |
| `frameDurationInSec`                | `uint256` | The duration of each frame, in seconds, after which the limit is partly restored. |
| `prevConsolidationRequestsLimit`    | `uint256` | Limit left after previous requests.                                               |
| `currentConsolidationRequestsLimit` | `uint256` | Current consolidation requests limit.                                             |

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

## Events

### ConsolidationRequestsLimitSet

Emitted when the consolidation request limit parameters are set.

```sol
event ConsolidationRequestsLimitSet(
    uint256 maxConsolidationRequestsLimit,
    uint256 consolidationsPerFrame,
    uint256 frameDurationInSec
);
```

## Errors

| Error                                | Description                                                                |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `ZeroArgument(string name)`          | A required zero-checked argument was zero.                                 |
| `AdminCannotBeZero()`                | The admin address passed to the constructor was zero.                      |
| `InsufficientFee(...)`               | The provided fee is less than the required total fee.                      |
| `FeeRefundFailed()`                  | Refunding the excess fee to the recipient failed.                          |
| `ConsolidationRequestsLimitExceeded(...)` | Not enough limit quota left in the current frame for all requests.    |
| `EmptyGroup(uint256 groupIndex)`     | A consolidation group contains no source public keys.                      |
| `DSMDepositsPaused()`                | DepositSecurityModule deposits are paused.                                 |
| `LidoDepositsPaused()`               | Lido is stopped or bunker mode is active.                                  |

## Related

- [ConsolidationBus](/contracts/consolidation-bus)
- [ConsolidationMigrator](/contracts/consolidation-migrator)
- [WithdrawalVault](/contracts/withdrawal-vault)
