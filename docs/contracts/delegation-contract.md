# DelegationContract

- [Source Code](https://github.com/lidofinance/execution-delegation-framework/blob/main/src/DelegationContract.sol)
- [Audit](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20EDF%20On-chain%20Audit%20Report%2008-2026.pdf)

`DelegationContract` is the per-seat contract of the [Execution Delegation Framework (EDF)](/guides/edf/edf-operator-guide). It has one owner and one active delegate. The owner is a cold multisig that nominates and revokes the delegate. The delegate is a hot key that does the day-to-day work: it sends transactions through `execute()` (push integration) or signs messages that the protocol verifies through ERC-1271 `isValidSignature()` (pull integration).

A `DelegationContract` holds a seat in the protocol instead of an EOA: it is a member of `HashConsensus` for the Lido Oracle, a guardian of the [`DepositSecurityModule`](/contracts/deposit-security-module), or the depositor for the depositor bot. The owner can never call `execute()` or sign on behalf of the contract.

Key properties:

- **Owner and cooldown are immutable.** Both are set in the constructor. Replacing the owner means deploying a new contract from the [`DelegationFactory`](/contracts/delegation-factory) and passing a governance vote to reassign the seat.
- **Nomination is cooldown-gated.** A new delegate becomes effective only `cooldown` seconds after `nominateDelegate()`. The current delegate stays effective until then, so a hostile nomination by a compromised owner is visible before it takes effect.
- **Revocation and termination are immediate.** `revokeDelegate()` drops the current and pending delegate at once. `terminate()` disables the contract forever.
- **The contract holds no ETH.** It has no `receive()` or `fallback()`. A target that tries to send ETH back to it makes `execute()` revert.

Contracts deployed from the official factory are listed on the [deployed contracts](/deployed-contracts/#execution-delegation-framework) page and on the [Lido Oracle](/holders/lido-oracle) and [Lido Council Daemon](/holders/lido-council-daemon) member pages.

## View Methods

### owner()

Returns the owner address. This is the ERC-5313 ownership view, so explorers and multisig UIs recognize the controlling party.

```solidity
function owner() external view returns (address);
```

### getDelegate()

Returns the currently effective delegate, or zero address if there is none.

A nominated delegate is returned only after its cooldown has elapsed. Before that, the previous delegate is returned. Zero address is returned when no delegate was ever nominated, after `revokeDelegate()`, and after `terminate()`.

```solidity
function getDelegate() external view returns (address);
```

### getPendingDelegate()

Returns the pending delegate and the timestamp when it becomes effective, or `(address(0), 0)` if there is no pending nomination.

The result is time-dependent. Once `block.timestamp` reaches `activeFrom`, the pending delegate becomes the effective one: `getDelegate()` starts returning it and this function returns `(address(0), 0)`. No transaction is needed for the transition.

```solidity
function getPendingDelegate() external view returns (address delegate, uint256 activeFrom);
```

### getCooldown()

Returns the cooldown in seconds between `nominateDelegate()` and the moment the new delegate becomes effective. Set in the constructor and cannot be changed.

```solidity
function getCooldown() external view returns (uint256);
```

### isTerminated()

Returns whether the contract has been terminated.

```solidity
function isTerminated() external view returns (bool);
```

### isValidSignature()

ERC-1271 signature validation. Returns the magic value `0x1626ba7e` if `signature` is a valid ECDSA signature over `hash` by the current effective delegate. Returns `0xffffffff` otherwise.

The delegate is resolved through `getDelegate()`, so validation fails when there is no effective delegate: never nominated, revoked, or terminated.

```solidity
function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
```

:::note
Unlike a raw ECDSA check, the result depends on the contract state. A signature that is valid at one block can become invalid at the next one, for example after the delegate is rotated or revoked, or the contract is terminated.
:::

#### Parameters

| Name        | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| `hash`      | `bytes32` | Message hash that was signed |
| `signature` | `bytes`   | ECDSA signature bytes        |

### supportsInterface()

ERC-165 interface detection. Returns `true` for the ERC-165, ERC-1271, ERC-5313 and `IDelegationContract` interface ids.

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool);
```

## Methods

### nominateDelegate()

Nominates a new delegate. The new delegate becomes effective after `getCooldown()` seconds (immediately if the cooldown is 0). The current delegate stays effective during the cooldown and is dropped only when the new one activates.

A second nomination before the cooldown elapses replaces the pending delegate and restarts the cooldown. To drop a delegate immediately, use `revokeDelegate()`.

```solidity
function nominateDelegate(address delegate) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is terminated;
- `delegate` is zero address;
- `delegate` is the owner;
- `delegate` is the current effective delegate;
- `delegate` is the pending delegate.
:::

#### Parameters

| Name       | Type      | Description                      |
| ---------- | --------- | -------------------------------- |
| `delegate` | `address` | Address of the incoming delegate |

### revokeDelegate()

Immediately removes the current and the pending delegate. After this call `getDelegate()` returns zero address until a new delegate is nominated and its cooldown elapses.

```solidity
function revokeDelegate() external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is terminated.
:::

### terminate()

Terminates the contract. This permanently disables `execute()`, `isValidSignature()` and `nominateDelegate()`, and clears the current and pending delegate. Intended for the case when the owner itself is suspected to be compromised. Termination is irreversible: the seat has to be reassigned to a new contract through a governance vote.

```solidity
function terminate() external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is already terminated.
:::

### execute()

Executes a call to `target` on behalf of the contract. The target sees the `DelegationContract` as `msg.sender`. `msg.value` is forwarded to the target. The revert reason of the target call is bubbled up.

```solidity
function execute(address target, bytes calldata data) external payable returns (bytes memory result);
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the current effective delegate;
- the contract is terminated;
- `target` is zero address;
- `target` is the contract itself;
- the target call reverts.
:::

#### Parameters

| Name     | Type      | Description     |
| -------- | --------- | --------------- |
| `target` | `address` | Address to call |
| `data`   | `bytes`   | Call data       |

#### Returns

| Name     | Type    | Description                    |
| -------- | ------- | ------------------------------ |
| `result` | `bytes` | Return data of the target call |

## Events

### InitialDelegateSet()

Emitted in the constructor when the contract is deployed with a non-zero initial delegate.

```solidity
event InitialDelegateSet(address indexed newDelegate);
```

### DelegateNominated()

Emitted on `nominateDelegate()`. `activeFrom` is the timestamp when the new delegate becomes effective.

```solidity
event DelegateNominated(address indexed newDelegate, uint256 activeFrom);
```

### DelegateRevoked()

Emitted on `revokeDelegate()`. `revokedDelegate` is the delegate that was effective at the moment of the call, or zero address if there was none.

```solidity
event DelegateRevoked(address indexed revokedDelegate);
```

### Terminated()

Emitted on `terminate()`.

```solidity
event Terminated();
```

:::note
`execute()` emits no event. To monitor delegate activity, use internal transactions of the contract (trace-level monitoring). See the [monitoring section](/guides/edf/edf-operator-guide#14-set-up-your-own-monitoring-and-alerts) of the operator guide.
:::
