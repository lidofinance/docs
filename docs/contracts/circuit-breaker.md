# CircuitBreaker

[Proposed in CircuitBreaker: Programmable Panic Layer](https://research.lido.fi/t/circuitbreaker-programmable-panic-layer/11400).

An emergency-pause layer for Lido protocol contracts.

| Network | Address                                                                                                                       |
|---------|-------------------------------------------------------------------------------------------------------------------------------|
| Mainnet | [`0x6019CB557978296BA3C08a7B73225C0975DFB2F7`](https://etherscan.io/address/0x6019CB557978296BA3C08a7B73225C0975DFB2F7)        |
| Hoodi   | [`0x44a5789dFeDa59cD176Ab5709ec2F4829dE4d555`](https://hoodi.etherscan.io/address/0x44a5789dFeDa59cD176Ab5709ec2F4829dE4d555)  |

## What is CircuitBreaker?

CircuitBreaker is a single, permanent contract that lets DAO-designated pauser committees instantly pause registered Lido contracts for a bounded duration without waiting for a governance vote. It is the successor to [GateSeal](/contracts/gate-seal): instead of single-use, expiring instances that must be redeployed every year, CircuitBreaker is reset on each use and operates indefinitely.

- [Source code](https://github.com/lidofinance/circuit-breaker/blob/main/src/CircuitBreaker.sol)
- [Repository](https://github.com/lidofinance/circuit-breaker)
- [LIP-34: Programmable panic layer](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-34.md)
- [Research forum proposal](https://research.lido.fi/t/circuitbreaker-programmable-panic-layer/11400/1)

## Why use a CircuitBreaker?

Putting critical Lido components on hold via a DAO vote can take many days. CircuitBreaker provides a way to temporarily pause these contracts immediately while the DAO investigates, deliberates, and executes a decision.

It is operated by committees, multisig accounts authorized to pull the brake in an emergency. Granting a committee unilateral pause authority is non-trivial, so CircuitBreaker has a number of safeguards:

- **Single-use per pausable**: a successful pause unregisters the committee from that pausable contract. To pause the same contract again, the pauser must be re-assigned by a full DAO vote. A misbehaving committee can pause only its assigned contracts and only once.
- **Bounded pause duration**: the pause has a limited duration controlled by the DAO, i.e. the pauser does not choose the duration when triggering the pause.
- **Pause only**: CircuitBreaker holds only the pause role on its registered pausables. The contract cannot resume the pausables, doesn't manage funds, doesn't have a proxy.
- **Liveness via heartbeats**: each pauser maintains its own heartbeat. If the heartbeat expires, the pauser can neither pause nor self-prolong authority. This means that unresponsive committees lose authority automatically.
- **Immutable admin**: the admin address is set at construction and cannot be changed, eliminating ownership-transfer exploits.

### Roles

- **`ADMIN`** — immutable address, the DAO Agent. Configures the registry and controls the pause duration and heartbeat interval.
- **Pauser** — a multisig committee assigned to one or more pausables. Can pause any pausable it is registered for, and must periodically call `heartbeat()` to remain authorized.

### Immutable bounds and current values

CircuitBreaker is deployed with immutable bounds:

- `MIN_PAUSE_DURATION` / `MAX_PAUSE_DURATION` — inclusive lower/upper bounds for `pauseDuration`.
- `MIN_HEARTBEAT_INTERVAL` / `MAX_HEARTBEAT_INTERVAL` — inclusive lower/upper bounds for `heartbeatInterval`.

Within these bounds, the admin can adjust `pauseDuration` and `heartbeatInterval` at any time without redeployment. Changes to `heartbeatInterval` apply only to **subsequent** heartbeats, i.e. already-stored expiries are not retroactively updated.

The deployed parameter sets are:

| Parameter                  | Mainnet              | Hoodi                |
|----------------------------|----------------------|----------------------|
| `MIN_PAUSE_DURATION`       | 5 days (432,000 s)   | 60 s                 |
| `MAX_PAUSE_DURATION`       | 60 days (5,184,000 s)| 30 days (2,592,000 s)|
| `MIN_HEARTBEAT_INTERVAL`   | 30 days (2,592,000 s)| 60 s                 |
| `MAX_HEARTBEAT_INTERVAL`   | 3 years (94,608,000 s)| 3 years (94,608,000 s)|
| Initial `pauseDuration`    | 21 days (1,814,400 s)| 1 hour (3,600 s)     |
| Initial `heartbeatInterval`| 1 year (31,536,000 s)| 1 year (31,536,000 s)|

The mainnet 21-day initial pause duration is sized to cover the worst-case governance timeline: two consecutive Aragon votes (≈10 days), a minimum Dual Governance timelock (4 days), and a 7-day buffer for analysis and coordination. Hoodi uses relaxed bounds appropriate for testnet drills.

### Heartbeat mechanism

Each pauser has its own heartbeat expiry timestamp. The pauser is considered *live* while their expiry timestamp is in the future. While live, the pauser can pause any of its assigned contracts and can extend its expiry by sending a heartbeat. Once the expiry passes, the pauser is no longer considered live and can neither pause nor extend expiry.

A heartbeat is a drill transaction that updates the caller's heartbeat. An expired pauser cannot revive itself, so the pauser must renew their heartbeat before it expires.

The expiry is also updated on registration and pause:

- When the DAO assigns a pauser to a pausable, that pauser's expiry is updated, regardless of its previous value.
- When a pauser is unassigned from its last remaining pausable (either by the DAO or by triggering a pause) its expiry is cleared.
- A successful pause that leaves the caller with at least one other assigned pausable refreshes the caller's expiry the same way a heartbeat would.

### Pause flow

When a registered, live pauser triggers a pause on one of its assigned pausables, CircuitBreaker:

1. Unregisters the pauser from that pausable.
2. Pauses the pausable for the preconfigured pause duration. The pausable is expected to follow the [`PausableUntil`](https://github.com/lidofinance/core/blob/master/contracts/0.8.9/utils/PausableUntil.sol) pattern.
3. Reads back the pausable's state to confirm the pause actually took effect, reverting if it did not.
4. Updates the caller's heartbeat expiry as described above.

A reentrancy guard prevents a malicious pausable from calling back into CircuitBreaker during this flow to trigger additional pauses.

CircuitBreaker does not verify at registration time that a pausable implements the expected interface or that CircuitBreaker has been granted the pause role on it. These properties can also change later, for example through a proxy upgrade or a role revocation. The DAO is therefore responsible for ensuring the pause role is granted before assigning a pauser.

## Covered pausables

The set of pausables and their assigned pausers is maintained by the DAO. See the deployed-contracts pages for the current registry on each network:

- [Mainnet deployments](/deployed-contracts/) #TODO
- [Hoodi deployments — CircuitBreaker](/deployed-contracts/hoodi#circuit-breaker)

## View Methods

### ADMIN()

Returns the immutable admin address.

```solidity
function ADMIN() external view returns (address);
```

### MIN_PAUSE_DURATION() / MAX_PAUSE_DURATION()

Inclusive lower and upper bounds, in seconds, for `pauseDuration`. Set at deployment, immutable thereafter.

```solidity
function MIN_PAUSE_DURATION() external view returns (uint256);
function MAX_PAUSE_DURATION() external view returns (uint256);
```

### MIN_HEARTBEAT_INTERVAL() / MAX_HEARTBEAT_INTERVAL()

Inclusive lower and upper bounds, in seconds, for `heartbeatInterval`. Set at deployment, immutable thereafter.

```solidity
function MIN_HEARTBEAT_INTERVAL() external view returns (uint256);
function MAX_HEARTBEAT_INTERVAL() external view returns (uint256);
```

### pauseDuration()

Current pause duration, in seconds, applied to a pausable on a successful trigger.

```solidity
function pauseDuration() external view returns (uint256);
```

### heartbeatInterval()

Current heartbeat interval, in seconds. The window after a heartbeat during which the pauser remains authorized.

```solidity
function heartbeatInterval() external view returns (uint256);
```

### heartbeatExpiry()

Returns the timestamp after which the given pauser is no longer authorized to heartbeat or pause.

```solidity
function heartbeatExpiry(address pauser) external view returns (uint256);
```

#### Parameters

| Name     | Type      | Description                |
|----------|-----------|----------------------------|
| `pauser` | `address` | Pauser address to look up. |

### getPauser()

Returns the pauser currently registered for a pausable, or the zero address if none.

```solidity
function getPauser(address _pausable) external view returns (address);
```

#### Parameters

| Name        | Type      | Description                 |
|-------------|-----------|-----------------------------|
| `_pausable` | `address` | Pausable contract address.  |

### getPausables()

Returns all pausable addresses currently registered.

```solidity
function getPausables() external view returns (address[] memory);
```

### getPausableCount()

Returns the number of pausables assigned to a pauser.

```solidity
function getPausableCount(address _pauser) external view returns (uint256);
```

#### Parameters

| Name      | Type      | Description       |
|-----------|-----------|-------------------|
| `_pauser` | `address` | Pauser address.   |

### isPauserLive()

Returns whether the pauser's heartbeat has not expired.

```solidity
function isPauserLive(address _pauser) external view returns (bool);
```

#### Parameters

| Name      | Type      | Description       |
|-----------|-----------|-------------------|
| `_pauser` | `address` | Pauser address.   |

Returns `true` when `block.timestamp < heartbeatExpiry[_pauser]`.

## Write Methods

### Admin methods

The following methods can be called only by `ADMIN`. They revert with `SenderNotAdmin` otherwise.

#### setPauseDuration()

Sets the pause duration applied on subsequent triggers. The new value takes effect immediately for any pauses called afterward.

```solidity
function setPauseDuration(uint256 _newPauseDuration) external;
```

#### Parameters

| Name                | Type      | Description                                |
|---------------------|-----------|--------------------------------------------|
| `_newPauseDuration` | `uint256` | New pause duration, in seconds.            |

:::note
Reverts if any of the following is true:

- caller is not `ADMIN` (`SenderNotAdmin`)
- `_newPauseDuration < MIN_PAUSE_DURATION` (`PauseDurationBelowMin`)
- `_newPauseDuration > MAX_PAUSE_DURATION` (`PauseDurationAboveMax`)
:::

Emits `PauseDurationUpdated(previousPauseDuration, newPauseDuration)`.

#### setHeartbeatInterval()

Sets the heartbeat interval pausers must maintain to remain authorized. The new value applies only to subsequent heartbeats and registrations; already-stored `heartbeatExpiry` values are not changed retroactively.

```solidity
function setHeartbeatInterval(uint256 _newHeartbeatInterval) external;
```

#### Parameters

| Name                    | Type      | Description                          |
|-------------------------|-----------|--------------------------------------|
| `_newHeartbeatInterval` | `uint256` | New heartbeat interval, in seconds.  |

:::note
Reverts if any of the following is true:

- caller is not `ADMIN` (`SenderNotAdmin`)
- `_newHeartbeatInterval < MIN_HEARTBEAT_INTERVAL` (`HeartbeatIntervalBelowMin`)
- `_newHeartbeatInterval > MAX_HEARTBEAT_INTERVAL` (`HeartbeatIntervalAboveMax`)
:::

Emits `HeartbeatIntervalUpdated(previousHeartbeatInterval, newHeartbeatInterval)`.

#### registerPauser()

Registers, replaces, or unregisters a pauser for a pausable.

- The previous pauser, if any, is overwritten. If they are left with zero remaining pausables, their `heartbeatExpiry` is cleared to `0`.
- The new pauser's `heartbeatExpiry` is set to `block.timestamp + heartbeatInterval` (extending or initializing it).
- Passing `address(0)` as `_newPauser` unregisters the pausable's current pauser.

```solidity
function registerPauser(address _pausable, address _newPauser) external;
```

#### Parameters

| Name         | Type      | Description                                                          |
|--------------|-----------|----------------------------------------------------------------------|
| `_pausable`  | `address` | Pausable contract address.                                           |
| `_newPauser` | `address` | New pauser address. Zero unregisters the current pauser, if any.     |

:::note
- Reverts if caller is not `ADMIN` (`SenderNotAdmin`).
- Does **not** verify that CircuitBreaker holds the pause role on `_pausable`, or that `_pausable` implements `IPausable`. The DAO is responsible for ensuring these invariants when assigning pausers.
:::

Emits `HeartbeatUpdated` for the previous pauser (if their expiry was cleared) and for the new pauser.

### Pauser methods

#### heartbeat()

Records a liveness proof, extending the caller's `heartbeatExpiry` to `block.timestamp + heartbeatInterval`.

```solidity
function heartbeat() external;
```

:::note
Reverts if any of the following is true:

- caller is not registered as a pauser for any pausable (`SenderNotPauser`)
- caller's heartbeat has already expired (`HeartbeatExpired`) — a lapsed pauser cannot self-renew; the DAO must explicitly re-register them
:::

Emits `HeartbeatUpdated(pauser, newHeartbeatExpiry)`.

#### pause()

Pauses a registered pausable for the current `pauseDuration`. Single-use: the caller is unregistered from this pausable on success.

```solidity
function pause(address _pausable) external;
```

The target must implement the minimal `IPausable` interface that CircuitBreaker calls into:

```solidity
interface IPausable {
    function isPaused() external view returns (bool);
    function pauseFor(uint256 _duration) external;
}
```

#### Parameters

| Name        | Type      | Description                       |
|-------------|-----------|-----------------------------------|
| `_pausable` | `address` | Pausable contract to pause.       |

The execution flow is:

1. Verify `msg.sender` is the registered pauser of `_pausable` and is live.
2. Unregister `msg.sender` from `_pausable`.
3. Call `IPausable(_pausable).pauseFor(pauseDuration)`.
4. Verify `IPausable(_pausable).isPaused()` is `true`.
5. Update the caller's `heartbeatExpiry`: extended to `block.timestamp + heartbeatInterval` if any other pausables are still assigned to them, or cleared to `0` otherwise.

:::note
Reverts if any of the following is true:

- caller is not the registered pauser of `_pausable` (`SenderNotPauser`)
- caller's heartbeat has expired (`HeartbeatExpired`)
- `pauseFor()` succeeded but the target does not report itself paused (`PauseFailed`)
- the call reentered (`ReentrantCall`)
:::

Emits `PauseTriggered(pausable, pauser, pauseDuration)` and `HeartbeatUpdated(pauser, newHeartbeatExpiry)`.

## Events

```solidity
event CircuitBreakerInitialized(
    address indexed admin,
    uint256 minPauseDuration,
    uint256 maxPauseDuration,
    uint256 minHeartbeatInterval,
    uint256 maxHeartbeatInterval
);
```

Emitted once at construction with the immutable admin and bounds.

```solidity
event PauseDurationUpdated(uint256 previousPauseDuration, uint256 newPauseDuration);
```

Emitted on `setPauseDuration` and once at construction for the initial value.

```solidity
event HeartbeatIntervalUpdated(uint256 previousHeartbeatInterval, uint256 newHeartbeatInterval);
```

Emitted on `setHeartbeatInterval` and once at construction for the initial value.

```solidity
event HeartbeatUpdated(address indexed pauser, uint256 newHeartbeatExpiry);
```

Emitted whenever a pauser's heartbeat expiry changes — on `heartbeat()`, `pause()`, and `registerPauser()`.

```solidity
event PauseTriggered(address indexed pausable, address indexed pauser, uint256 pauseDuration);
```

Emitted on a successful `pause()`.
