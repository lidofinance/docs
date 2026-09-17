# DelegationContract

- [Source Code](https://github.com/lidofinance/execution-delegation-framework/blob/main/src/DelegationContract.sol)
- [Audit](https://github.com/lidofinance/audits/blob/main/Composable%20Security%20Lido%20EDF%20On-chain%20Audit%20Report%2008-2026.pdf)
- \[[proposed](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/25)\] Deployed instances: [Lido Oracle](/holders/lido-oracle) and [Lido Council Daemon](/holders/lido-council-daemon) members

`DelegationContract` is the per-seat contract of the [Execution Delegation Framework (EDF)](/guides/edf/edf-operator-guide). It has one owner and one active delegate. The owner is a cold multisig that nominates and revokes the delegate. The delegate is a hot key that does the daily work: it sends transactions through `execute()` or signs messages that the protocol checks through ERC-1271 `isValidSignature()`.

The contract holds a protocol seat instead of an EOA: a `HashConsensus` member for the Lido Oracle, a [`DepositSecurityModule`](/contracts/deposit-security-module) guardian, or the depositor. The owner cannot call `execute()` or sign for the contract.

- Owner and cooldown are set in the constructor and cannot be changed. To change the owner, deploy a new contract from the [`DelegationFactory`](/contracts/delegation-factory) and move the seat by a governance vote.
- A nominated delegate becomes active only after the cooldown. The current delegate stays active until then, so a hostile nomination is visible before it takes effect.
- Revocation and termination are immediate. Termination is permanent.
- The contract cannot receive ETH. If the target sends ETH back, `execute()` reverts.

## View Methods

### owner()

Returns the owner address (ERC-5313).

```solidity
function owner() external view returns (address);
```

### getDelegate()

Returns the active delegate, or zero address if there is none: never nominated, revoked, or terminated. A nominated delegate is returned only after its cooldown has passed.

```solidity
function getDelegate() external view returns (address);
```

### getPendingDelegate()

Returns the pending delegate and the timestamp when it becomes active, or `(address(0), 0)` if there is no pending nomination. After `activeFrom` the pending delegate becomes the active one without any transaction.

```solidity
function getPendingDelegate() external view returns (address delegate, uint256 activeFrom);
```

### getCooldown()

Returns the cooldown in seconds between a nomination and the moment the new delegate becomes active.

```solidity
function getCooldown() external view returns (uint256);
```

### isTerminated()

Returns whether the contract is terminated.

```solidity
function isTerminated() external view returns (bool);
```

### isValidSignature()

ERC-1271 check. Returns `0x1626ba7e` if `signature` is a valid ECDSA signature of `hash` by the active delegate, and `0xffffffff` otherwise. Always fails when there is no active delegate.

```solidity
function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
```

:::note
The result depends on the contract state. A signature that is valid now becomes invalid after the delegate is rotated or revoked, or the contract is terminated.
:::

#### Parameters

| Name        | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| `hash`      | `bytes32` | Message hash that was signed |
| `signature` | `bytes`   | ECDSA signature              |

### supportsInterface()

ERC-165 check. Returns `true` for the ERC-165, ERC-1271, ERC-5313 and `IDelegationContract` interface ids.

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool);
```

## Methods

### nominateDelegate()

Nominates a new delegate. It becomes active after `getCooldown()` seconds. The current delegate stays active until then. A new nomination during the cooldown replaces the pending delegate and restarts the cooldown.

```solidity
function nominateDelegate(address delegate) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is terminated;
- `delegate` is zero address;
- `delegate` is the owner;
- `delegate` is the active delegate;
- `delegate` is the pending delegate.
:::

#### Parameters

| Name       | Type      | Description          |
| ---------- | --------- | -------------------- |
| `delegate` | `address` | New delegate address |

### revokeDelegate()

Immediately removes the active and the pending delegate.

```solidity
function revokeDelegate() external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is terminated.
:::

### terminate()

Terminates the contract: disables `execute()`, `isValidSignature()` and `nominateDelegate()` forever and removes the active and pending delegate. Intended for the case when the owner itself may be compromised. The seat then has to be moved to a new contract by a governance vote.

```solidity
function terminate() external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- the contract is already terminated.
:::

### execute()

Calls `target` with `data` on behalf of the contract. The target sees the contract as `msg.sender`. `msg.value` is forwarded. If the call fails, the revert reason is passed through.

```solidity
function execute(address target, bytes calldata data) external payable returns (bytes memory result);
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the active delegate;
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

| Name     | Type    | Description                 |
| -------- | ------- | --------------------------- |
| `result` | `bytes` | Return data of the call     |

## Events

### InitialDelegateSet()

Emitted at deployment when the initial delegate is not zero address.

```solidity
event InitialDelegateSet(address indexed newDelegate);
```

### DelegateNominated()

Emitted on `nominateDelegate()`. `activeFrom` is the timestamp when the new delegate becomes active.

```solidity
event DelegateNominated(address indexed newDelegate, uint256 activeFrom);
```

### DelegateRevoked()

Emitted on `revokeDelegate()`. `revokedDelegate` is the delegate that was active, or zero address if there was none.

```solidity
event DelegateRevoked(address indexed revokedDelegate);
```

### Terminated()

Emitted on `terminate()`.

```solidity
event Terminated();
```

:::note
`execute()` emits no event. Monitor delegate activity through internal transactions of the contract, see the [operator guide](/guides/edf/edf-operator-guide#14-set-up-your-own-monitoring-and-alerts).
:::
