# TriggerableWithdrawalsGateway

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.9/TriggerableWithdrawalsGateway.sol)
- [Deployed contract](https://etherscan.io/address/0xDC00116a0D3E064427dA2600449cfD2566B3037B)
- Specification basis: [LIP-30 — Triggerable withdrawals](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-30.md)

## What is TriggerableWithdrawalsGateway

TriggerableWithdrawalsGateway (TWG) is a gateway contract introducing an validators' execution triggerable exit path for the Lido protocol. It proxies exit request calls to the WithdrawalVault, checking permissions, applying limits, and refunding any redundant trigger fee costs.

## Roles and access control

Access to lever methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
contract and a bunch of [granular roles](#permissions).
To engage Emergency Brakes and unpause if required, it inherits from `PausableContract` (see [GateSeals](https://docs.lido.fi/contracts/gate-seal)).

## Methods

### `ADD_FULL_WITHDRAWAL_REQUEST_ROLE`

An ACL role granting the permission to submit exit requests.

```solidity
bytes32 public constant ADD_FULL_WITHDRAWAL_REQUEST_ROLE = keccak256("ADD_FULL_WITHDRAWAL_REQUEST_ROLE");
```

### `TW_EXIT_LIMIT_MANAGER_ROLE`

An ACL role granting the permission to modify limit params.

```solidity
bytes32 public constant TW_EXIT_LIMIT_MANAGER_ROLE = keccak256("TW_EXIT_LIMIT_MANAGER_ROLE");
```

### `getExitRequestLimitFullInfo`

Returns information about current limits data.

```solidity
function getExitRequestLimitFullInfo() external view;
```

**Returns:**

| Name                        | Type      | Description                                                                               |
|-----------------------------|-----------|-------------------------------------------------------------------------------------------|
| `_maxExitRequestsLimit`     | `uint256` | Maximum exit requests limit                                                               |
| `_exitsPerFrame`            | `uint256` | The number of exits that can be restored per frame                                        |
| `_frameDurationInSec`       | `uint256` | The duration of each frame, in seconds, after which `exitsPerFrame` exits can be restored |
| `_prevExitRequestsLimit`    | `uint256` | Limit left after previous requests                                                        |
| `_currentExitRequestsLimit` | `uint256` | Current exit requests limit                                                               |

### `setExitRequestLimit`

Sets the maximum exit request limit and the frame during which a portion of the limit can be restored.

```solidity
function setExitRequestLimit(
  uint256 maxExitRequestsLimit,
  uint256 exitsPerFrame,
  uint256 frameDurationInSec
) external onlyRole(TW_EXIT_LIMIT_MANAGER_ROLE);
```

**Parameters:**

| Name                   | Type      | Description                                                                                |
|------------------------|-----------|--------------------------------------------------------------------------------------------|
| `maxExitRequestsLimit` | `uint256` | The maximum number of exit requests.                                                       |
| `exitsPerFrame`        | `uint256` | The number of exits that can be restored per frame.                                        |
| `frameDurationInSec`   | `uint256` | The duration of each frame, in seconds, after which `exitsPerFrame` exits can be restored. |

### `triggerFullWithdrawals`

Submits Triggerable Withdrawal Requests to the Withdrawal Vault as full withdrawal requests for the specified validator public keys.

```solidity
function triggerFullWithdrawals(
  IStakingRouter.ValidatorExitData[] calldata validatorsData,
  address refundRecipient,
  uint256 exitType,
) external payable onlyRole(ADD_FULL_WITHDRAWAL_REQUEST_ROLE) preservesEthBalance whenResumed
```

**Structures**:
```solidity
struct ValidatorExitData {
  uint256 stakingModuleId;
  uint256 nodeOperatorId;
  bytes pubkey;
}
```

**Parameters:**

| Name              | Type                  | Description                                                                                                              |
|-------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------------|
| `validatorsData`  | `ValidatorExitData[]` | An array of `ValidatorExitData` structs, each representing a validator for which a withdrawal request will be submitted. |
| `refundRecipient` | `address`             | The address that will receive any excess ETH sent for fees.                                                              |
| `exitType`        | `uint256`             | A parameter indicating the type of exit, passed to the Staking Module.                                                   |

## Permissions

### ADD_FULL_WITHDRAWAL_REQUEST_ROLE()

An ACL role granting the permission to add withdrawal requests.

```solidity
bytes32 public constant RESUME_ROLE = keccak256("ADD_FULL_WITHDRAWAL_REQUEST_ROLE");
```

### TW_EXIT_LIMIT_MANAGER_ROLE()

An ACL role granting the permission to change trigger request limits.

```solidity
bytes32 public constant TW_EXIT_LIMIT_MANAGER_ROLE = keccak256("TW_EXIT_LIMIT_MANAGER_ROLE");
```
