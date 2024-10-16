# CSAccounting

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSAccounting.sol)
- [Deployed contract](https://etherscan.io/address/0x4d72BFF1BeaC69925F8Bd12526a39BAAb069e5Da)

CSAccounting.sol is the supplementary contract responsible for the management of bond, rewards, and penalties. It stores bond tokens in the form of stETH shares, provides information about the bond required, and provides interfaces for the penalties.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables

### PAUSE_ROLE

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
```

### RESUME_ROLE

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE");
```

### ACCOUNTING_MANAGER_ROLE

```solidity
bytes32 public constant ACCOUNTING_MANAGER_ROLE = keccak256("ACCOUNTING_MANAGER_ROLE");
```

### MANAGE_BOND_CURVES_ROLE

```solidity
bytes32 public constant MANAGE_BOND_CURVES_ROLE = keccak256("MANAGE_BOND_CURVES_ROLE");
```

### SET_BOND_CURVE_ROLE

```solidity
bytes32 public constant SET_BOND_CURVE_ROLE = keccak256("SET_BOND_CURVE_ROLE");
```

### RESET_BOND_CURVE_ROLE

```solidity
bytes32 public constant RESET_BOND_CURVE_ROLE = keccak256("RESET_BOND_CURVE_ROLE");
```

### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```

### CSM

```solidity
ICSModule public immutable CSM;
```

### feeDistributor

```solidity
ICSFeeDistributor public feeDistributor;
```

### chargePenaltyRecipient

```solidity
address public chargePenaltyRecipient;
```

### LIDO_LOCATOR

```solidity
ILidoLocator public immutable LIDO_LOCATOR;
```

### LIDO

```solidity
ILido public immutable LIDO;
```

### WITHDRAWAL_QUEUE

```solidity
IWithdrawalQueue public immutable WITHDRAWAL_QUEUE;
```

### WSTETH

```solidity
IWstETH public immutable WSTETH;
```

### MIN_CURVE_LENGTH

```solidity
uint256 public constant MIN_CURVE_LENGTH = 1;
```

### DEFAULT_BOND_CURVE_ID

```solidity
uint256 public constant DEFAULT_BOND_CURVE_ID = 0;
```

### MAX_CURVE_LENGTH

```solidity
uint256 public immutable MAX_CURVE_LENGTH;
```

### MIN_BOND_LOCK_RETENTION_PERIOD

```solidity
uint256 public immutable MIN_BOND_LOCK_RETENTION_PERIOD;
```

### MAX_BOND_LOCK_RETENTION_PERIOD

```solidity
uint256 public immutable MAX_BOND_LOCK_RETENTION_PERIOD;
```

## Functions

### resume

Resume reward claims and deposits

```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause reward claims and deposits for `duration` seconds

_Must be called together with `CSModule.pauseFor`_

_Passing MAX_UINT_256 as `duration` pauses indefinitely_

```solidity
function pauseFor(uint256 duration) external onlyRole(PAUSE_ROLE);
```

**Parameters**

| Name       | Type      | Description                      |
| ---------- | --------- | -------------------------------- |
| `duration` | `uint256` | Duration of the pause in seconds |

### setChargePenaltyRecipient

Set charge recipient address

```solidity
function setChargePenaltyRecipient(
  address _chargePenaltyRecipient
) external onlyRole(ACCOUNTING_MANAGER_ROLE);
```

**Parameters**

| Name                      | Type      | Description              |
| ------------------------- | --------- | ------------------------ |
| `_chargePenaltyRecipient` | `address` | Charge recipient address |

### setLockedBondRetentionPeriod

Set bond lock retention period

```solidity
function setLockedBondRetentionPeriod(uint256 retention) external onlyRole(ACCOUNTING_MANAGER_ROLE);
```

**Parameters**

| Name        | Type      | Description                           |
| ----------- | --------- | ------------------------------------- |
| `retention` | `uint256` | Period in seconds to retain bond lock |

### addBondCurve

Add a new bond curve

```solidity
function addBondCurve(
  uint256[] calldata bondCurve
) external onlyRole(MANAGE_BOND_CURVES_ROLE) returns (uint256 id);
```

**Parameters**

| Name        | Type        | Description                  |
| ----------- | ----------- | ---------------------------- |
| `bondCurve` | `uint256[]` | Bond curve definition to add |

**Returns**

| Name | Type      | Description           |
| ---- | --------- | --------------------- |
| `id` | `uint256` | Id of the added curve |

### updateBondCurve

Update existing bond curve

_If the curve is updated to a curve with higher values for any point,
Extensive checks should be performed to avoid inconsistency in the keys accounting_

```solidity
function updateBondCurve(
  uint256 curveId,
  uint256[] calldata bondCurve
) external onlyRole(MANAGE_BOND_CURVES_ROLE);
```

**Parameters**

| Name        | Type        | Description             |
| ----------- | ----------- | ----------------------- |
| `curveId`   | `uint256`   | Bond curve ID to update |
| `bondCurve` | `uint256[]` | Bond curve definition   |

### setBondCurve

Set the bond curve for the given Node Operator

_If called externally, the `normalizeQueue` method from CSModule.sol should be called after
to ensure key pointers consistency_

```solidity
function setBondCurve(
  uint256 nodeOperatorId,
  uint256 curveId
) external onlyRole(SET_BOND_CURVE_ROLE);
```

**Parameters**

| Name             | Type      | Description                 |
| ---------------- | --------- | --------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator     |
| `curveId`        | `uint256` | ID of the bond curve to set |

### resetBondCurve

Reset bond curve to the default one for the given Node Operator

_If called externally, the `normalizeQueue` method from CSModule.sol should be called after
to ensure key pointers consistency_

```solidity
function resetBondCurve(uint256 nodeOperatorId) external onlyRole(RESET_BOND_CURVE_ROLE);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

### depositETH

Stake user's ETH with Lido and deposit stETH to the bond

_Called by CSM exclusively_

```solidity
function depositETH(address from, uint256 nodeOperatorId) external payable whenResumed onlyCSM;
```

**Parameters**

| Name             | Type      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `from`           | `address` | Address to stake ETH and deposit stETH from |
| `nodeOperatorId` | `uint256` | ID of the Node Operator                     |

### depositStETH

Deposit user's stETH to the bond for the given Node Operator

_Called by CSM exclusively_

```solidity
function depositStETH(
  address from,
  uint256 nodeOperatorId,
  uint256 stETHAmount,
  PermitInput calldata permit
) external whenResumed onlyCSM;
```

**Parameters**

| Name             | Type          | Description                   |
| ---------------- | ------------- | ----------------------------- |
| `from`           | `address`     | Address to deposit stETH from |
| `nodeOperatorId` | `uint256`     | ID of the Node Operator       |
| `stETHAmount`    | `uint256`     | Amount of stETH to deposit    |
| `permit`         | `PermitInput` | stETH permit for the contract |

### depositWstETH

Unwrap the user's wstETH and deposit stETH to the bond for the given Node Operator

_Called by CSM exclusively_

```solidity
function depositWstETH(
  address from,
  uint256 nodeOperatorId,
  uint256 wstETHAmount,
  PermitInput calldata permit
) external whenResumed onlyCSM;
```

**Parameters**

| Name             | Type          | Description                    |
| ---------------- | ------------- | ------------------------------ |
| `from`           | `address`     | Address to unwrap wstETH from  |
| `nodeOperatorId` | `uint256`     | ID of the Node Operator        |
| `wstETHAmount`   | `uint256`     | Amount of wstETH to deposit    |
| `permit`         | `PermitInput` | wstETH permit for the contract |

### claimRewardsStETH

Claim full reward (fee + bond) in stETH for the given Node Operator with desirable value.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

_Called by CSM exclusively_

_It's impossible to use single-leaf proof via this method, so this case should be treated carefully by
off-chain tooling, e.g. to make sure a tree has at least 2 leafs._

```solidity
function claimRewardsStETH(
  uint256 nodeOperatorId,
  uint256 stETHAmount,
  address rewardAddress,
  uint256 cumulativeFeeShares,
  bytes32[] calldata rewardsProof
) external whenResumed onlyCSM;
```

**Parameters**

| Name                  | Type        | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| `nodeOperatorId`      | `uint256`   | ID of the Node Operator                           |
| `stETHAmount`         | `uint256`   | Amount of stETH to claim                          |
| `rewardAddress`       | `address`   | Reward address of the node operator               |
| `cumulativeFeeShares` | `uint256`   | Cumulative fee stETH shares for the Node Operator |
| `rewardsProof`        | `bytes32[]` | Merkle proof of the rewards                       |

### claimRewardsWstETH

Claim full reward (fee + bond) in wstETH for the given Node Operator available for this moment.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

_Called by CSM exclusively_

_It's impossible to use single-leaf proof via this method, so this case should be treated carefully by
off-chain tooling, e.g. to make sure a tree has at least 2 leafs._

```solidity
function claimRewardsWstETH(
  uint256 nodeOperatorId,
  uint256 wstETHAmount,
  address rewardAddress,
  uint256 cumulativeFeeShares,
  bytes32[] calldata rewardsProof
) external whenResumed onlyCSM;
```

**Parameters**

| Name                  | Type        | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| `nodeOperatorId`      | `uint256`   | ID of the Node Operator                           |
| `wstETHAmount`        | `uint256`   | Amount of wstETH to claim                         |
| `rewardAddress`       | `address`   | Reward address of the node operator               |
| `cumulativeFeeShares` | `uint256`   | Cumulative fee stETH shares for the Node Operator |
| `rewardsProof`        | `bytes32[]` | Merkle proof of the rewards                       |

### claimRewardsUnstETH

Request full reward (fee + bond) in Withdrawal NFT (unstETH) for the given Node Operator available for this moment.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

_Reverts if amount isn't between `MIN_STETH_WITHDRAWAL_AMOUNT` and `MAX_STETH_WITHDRAWAL_AMOUNT`_

_Called by CSM exclusively_

_It's impossible to use single-leaf proof via this method, so this case should be treated carefully by
off-chain tooling, e.g. to make sure a tree has at least 2 leafs._

```solidity
function claimRewardsUnstETH(
  uint256 nodeOperatorId,
  uint256 stEthAmount,
  address rewardAddress,
  uint256 cumulativeFeeShares,
  bytes32[] calldata rewardsProof
) external whenResumed onlyCSM;
```

**Parameters**

| Name                  | Type        | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| `nodeOperatorId`      | `uint256`   | ID of the Node Operator                           |
| `stEthAmount`         | `uint256`   | Amount of ETH to request                          |
| `rewardAddress`       | `address`   | Reward address of the node operator               |
| `cumulativeFeeShares` | `uint256`   | Cumulative fee stETH shares for the Node Operator |
| `rewardsProof`        | `bytes32[]` | Merkle proof of the rewards                       |

### lockBondETH

Lock bond in ETH for the given Node Operator

_Called by CSM exclusively_

```solidity
function lockBondETH(uint256 nodeOperatorId, uint256 amount) external onlyCSM;
```

**Parameters**

| Name             | Type      | Description                   |
| ---------------- | --------- | ----------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator       |
| `amount`         | `uint256` | Amount to lock in ETH (stETH) |

### releaseLockedBondETH

Release locked bond in ETH for the given Node Operator

_Called by CSM exclusively_

```solidity
function releaseLockedBondETH(uint256 nodeOperatorId, uint256 amount) external onlyCSM;
```

**Parameters**

| Name             | Type      | Description                      |
| ---------------- | --------- | -------------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator          |
| `amount`         | `uint256` | Amount to release in ETH (stETH) |

### compensateLockedBondETH

Compensate locked bond ETH for the given Node Operator

```solidity
function compensateLockedBondETH(uint256 nodeOperatorId) external payable onlyCSM;
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

### settleLockedBondETH

Settle locked bond ETH for the given Node Operator

_Called by CSM exclusively_

```solidity
function settleLockedBondETH(uint256 nodeOperatorId) external onlyCSM;
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

### penalize

Penalize bond by burning stETH shares of the given Node Operator

_Called by CSM exclusively_

```solidity
function penalize(uint256 nodeOperatorId, uint256 amount) external onlyCSM;
```

**Parameters**

| Name             | Type      | Description                       |
| ---------------- | --------- | --------------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator           |
| `amount`         | `uint256` | Amount to penalize in ETH (stETH) |

### chargeFee

Charge fee from bond by transferring stETH shares of the given Node Operator to the charge recipient

_Called by CSM exclusively_

```solidity
function chargeFee(uint256 nodeOperatorId, uint256 amount) external onlyCSM;
```

**Parameters**

| Name             | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator         |
| `amount`         | `uint256` | Amount to charge in ETH (stETH) |

### pullFeeRewards

Pull fees from CSFeeDistributor to the Node Operator's bond

_Permissionless method. Can be called before penalty application to ensure that rewards are also penalized_

```solidity
function pullFeeRewards(
  uint256 nodeOperatorId,
  uint256 cumulativeFeeShares,
  bytes32[] calldata rewardsProof
) external;
```

**Parameters**

| Name                  | Type        | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| `nodeOperatorId`      | `uint256`   | ID of the Node Operator                           |
| `cumulativeFeeShares` | `uint256`   | Cumulative fee stETH shares for the Node Operator |
| `rewardsProof`        | `bytes32[]` | Merkle proof of the rewards                       |

### renewBurnerAllowance

Service method to update allowance to Burner in case it has changed

```solidity
function renewBurnerAllowance() external;
```

### getBondSummary

Get current and required bond amounts in ETH (stETH) for the given Node Operator

_To calculate excess bond amount subtract `required` from `current` value.
To calculate missed bond amount subtract `current` from `required` value_

```solidity
function getBondSummary(
  uint256 nodeOperatorId
) public view returns (uint256 current, uint256 required);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name       | Type      | Description                 |
| ---------- | --------- | --------------------------- |
| `current`  | `uint256` | Current bond amount in ETH  |
| `required` | `uint256` | Required bond amount in ETH |

### getBondSummaryShares

Get current and required bond amounts in stETH shares for the given Node Operator

_To calculate excess bond amount subtract `required` from `current` value.
To calculate missed bond amount subtract `current` from `required` value_

```solidity
function getBondSummaryShares(
  uint256 nodeOperatorId
) public view returns (uint256 current, uint256 required);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name       | Type      | Description                          |
| ---------- | --------- | ------------------------------------ |
| `current`  | `uint256` | Current bond amount in stETH shares  |
| `required` | `uint256` | Required bond amount in stETH shares |

### getUnbondedKeysCount

Get the number of the unbonded keys

```solidity
function getUnbondedKeysCount(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description         |
| -------- | --------- | ------------------- |
| `<none>` | `uint256` | Unbonded keys count |

### getUnbondedKeysCountToEject

Get the number of the unbonded keys to be ejected using a forcedTargetLimit

```solidity
function getUnbondedKeysCountToEject(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description         |
| -------- | --------- | ------------------- |
| `<none>` | `uint256` | Unbonded keys count |

### getRequiredBondForNextKeys

Get the required bond in ETH (inc. missed and excess) for the given Node Operator to upload new deposit data

```solidity
function getRequiredBondForNextKeys(
  uint256 nodeOperatorId,
  uint256 additionalKeys
) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description               |
| ---------------- | --------- | ------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator   |
| `additionalKeys` | `uint256` | Number of new keys to add |

**Returns**

| Name     | Type      | Description                 |
| -------- | --------- | --------------------------- |
| `<none>` | `uint256` | Required bond amount in ETH |

### getBondAmountByKeysCountWstETH

Get the bond amount in wstETH required for the `keysCount` keys using the default bond curve

```solidity
function getBondAmountByKeysCountWstETH(
  uint256 keysCount,
  uint256 curveId
) public view returns (uint256);
```

**Parameters**

| Name        | Type      | Description                                      |
| ----------- | --------- | ------------------------------------------------ |
| `keysCount` | `uint256` | Keys count to calculate the required bond amount |
| `curveId`   | `uint256` | Id of the curve to perform calculations against  |

**Returns**

| Name     | Type      | Description                                |
| -------- | --------- | ------------------------------------------ |
| `<none>` | `uint256` | wstETH amount required for the `keysCount` |

### getBondAmountByKeysCountWstETH

Get the bond amount in wstETH required for the `keysCount` keys using the custom bond curve

```solidity
function getBondAmountByKeysCountWstETH(
  uint256 keysCount,
  BondCurve memory curve
) public view returns (uint256);
```

**Parameters**

| Name        | Type        | Description                                                                                                |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `keysCount` | `uint256`   | Keys count to calculate the required bond amount                                                           |
| `curve`     | `BondCurve` | Bond curve definition. Use CSBondCurve.getBondCurve(id) method to get the definition for the exiting curve |

**Returns**

| Name     | Type      | Description                                |
| -------- | --------- | ------------------------------------------ |
| `<none>` | `uint256` | wstETH amount required for the `keysCount` |

### getRequiredBondForNextKeysWstETH

Get the required bond in wstETH (inc. missed and excess) for the given Node Operator to upload new keys

```solidity
function getRequiredBondForNextKeysWstETH(
  uint256 nodeOperatorId,
  uint256 additionalKeys
) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description               |
| ---------------- | --------- | ------------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator   |
| `additionalKeys` | `uint256` | Number of new keys to add |

**Returns**

| Name     | Type      | Description             |
| -------- | --------- | ----------------------- |
| `<none>` | `uint256` | Required bond in wstETH |

### totalBondShares

Get total bond shares (stETH) stored on the contract

```solidity
function totalBondShares() public view returns (uint256);
```

**Returns**

| Name     | Type      | Description               |
| -------- | --------- | ------------------------- |
| `<none>` | `uint256` | Total bond shares (stETH) |

### getBondShares

Get bond shares (stETH) for the given Node Operator

```solidity
function getBondShares(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description          |
| -------- | --------- | -------------------- |
| `<none>` | `uint256` | Bond in stETH shares |

### getBond

Get bond amount in ETH (stETH) for the given Node Operator

```solidity
function getBond(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description                |
| -------- | --------- | -------------------------- |
| `<none>` | `uint256` | Bond amount in ETH (stETH) |

### getCurveInfo

Return bond curve for the given curve id

_Get default bond curve info if `curveId` is `0` or invalid_

```solidity
function getCurveInfo(uint256 curveId) public view returns (BondCurve memory);
```

**Parameters**

| Name      | Type      | Description                    |
| --------- | --------- | ------------------------------ |
| `curveId` | `uint256` | Curve id to get bond curve for |

**Returns**

| Name     | Type        | Description |
| -------- | ----------- | ----------- |
| `<none>` | `BondCurve` | Bond curve  |

### getBondCurve

Get bond curve for the given Node Operator

```solidity
function getBondCurve(uint256 nodeOperatorId) public view returns (BondCurve memory);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type        | Description |
| -------- | ----------- | ----------- |
| `<none>` | `BondCurve` | Bond curve  |

### getBondCurveId

Get bond curve ID for the given Node Operator

```solidity
function getBondCurveId(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description   |
| -------- | --------- | ------------- |
| `<none>` | `uint256` | Bond curve ID |

### getBondAmountByKeysCount

Get required bond in ETH for the given number of keys for default bond curve

_To calculate the amount for the new keys 2 calls are required:
getBondAmountByKeysCount(newTotal) - getBondAmountByKeysCount(currentTotal)_

```solidity
function getBondAmountByKeysCount(uint256 keys, uint256 curveId) public view returns (uint256);
```

**Parameters**

| Name      | Type      | Description                                     |
| --------- | --------- | ----------------------------------------------- |
| `keys`    | `uint256` | Number of keys to get required bond for         |
| `curveId` | `uint256` | Id of the curve to perform calculations against |

**Returns**

| Name     | Type      | Description                      |
| -------- | --------- | -------------------------------- |
| `<none>` | `uint256` | Amount for particular keys count |

### getKeysCountByBondAmount

Get keys count for the given bond amount with default bond curve

```solidity
function getKeysCountByBondAmount(uint256 amount, uint256 curveId) public view returns (uint256);
```

**Parameters**

| Name      | Type      | Description                                     |
| --------- | --------- | ----------------------------------------------- |
| `amount`  | `uint256` | Bond amount in ETH (stETH)to get keys count for |
| `curveId` | `uint256` | Id of the curve to perform calculations against |

**Returns**

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| `<none>` | `uint256` | Keys count  |

### getBondAmountByKeysCount

Get required bond in ETH for the given number of keys for particular bond curve.

_To calculate the amount for the new keys 2 calls are required:
getBondAmountByKeysCount(newTotal, curve) - getBondAmountByKeysCount(currentTotal, curve)_

```solidity
function getBondAmountByKeysCount(
  uint256 keys,
  BondCurve memory curve
) public pure returns (uint256);
```

**Parameters**

| Name    | Type        | Description                                |
| ------- | ----------- | ------------------------------------------ |
| `keys`  | `uint256`   | Number of keys to get required bond for    |
| `curve` | `BondCurve` | Bond curve to perform calculations against |

**Returns**

| Name     | Type      | Description                                                   |
| -------- | --------- | ------------------------------------------------------------- |
| `<none>` | `uint256` | Required bond amount in ETH (stETH) for particular keys count |

### getKeysCountByBondAmount

Get keys count for the given bond amount for particular bond curve.

```solidity
function getKeysCountByBondAmount(
  uint256 amount,
  BondCurve memory curve
) public pure returns (uint256);
```

**Parameters**

| Name     | Type        | Description                                |
| -------- | ----------- | ------------------------------------------ |
| `amount` | `uint256`   | Bond amount to get keys count for          |
| `curve`  | `BondCurve` | Bond curve to perform calculations against |

**Returns**

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| `<none>` | `uint256` | Keys count  |

### getBondLockRetentionPeriod

Get default bond lock retention period

```solidity
function getBondLockRetentionPeriod() external view returns (uint256);
```

**Returns**

| Name     | Type      | Description                        |
| -------- | --------- | ---------------------------------- |
| `<none>` | `uint256` | Default bond lock retention period |

### getLockedBondInfo

Get information about the locked bond for the given Node Operator

```solidity
function getLockedBondInfo(uint256 nodeOperatorId) public view returns (BondLock memory);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type       | Description      |
| -------- | ---------- | ---------------- |
| `<none>` | `BondLock` | Locked bond info |

### getActualLockedBond

Get amount of the locked bond in ETH (stETH) by the given Node Operator

```solidity
function getActualLockedBond(uint256 nodeOperatorId) public view returns (uint256);
```

**Parameters**

| Name             | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| `nodeOperatorId` | `uint256` | ID of the Node Operator |

**Returns**

| Name     | Type      | Description                      |
| -------- | --------- | -------------------------------- |
| `<none>` | `uint256` | Amount of the actual locked bond |

## Events

### BondLockCompensated

```solidity
event BondLockCompensated(uint256 indexed nodeOperatorId, uint256 amount);
```

### ChargePenaltyRecipientSet

```solidity
event ChargePenaltyRecipientSet(address chargePenaltyRecipient);
```

### BondDepositedETH

```solidity
event BondDepositedETH(uint256 indexed nodeOperatorId, address from, uint256 amount);
```

### BondDepositedStETH

```solidity
event BondDepositedStETH(uint256 indexed nodeOperatorId, address from, uint256 amount);
```

### BondDepositedWstETH

```solidity
event BondDepositedWstETH(uint256 indexed nodeOperatorId, address from, uint256 amount);
```

### BondClaimedUnstETH

```solidity
event BondClaimedUnstETH(
  uint256 indexed nodeOperatorId,
  address to,
  uint256 amount,
  uint256 requestId
);
```

### BondClaimedStETH

```solidity
event BondClaimedStETH(uint256 indexed nodeOperatorId, address to, uint256 amount);
```

### BondClaimedWstETH

```solidity
event BondClaimedWstETH(uint256 indexed nodeOperatorId, address to, uint256 amount);
```

### BondBurned

```solidity
event BondBurned(uint256 indexed nodeOperatorId, uint256 toBurnAmount, uint256 burnedAmount);
```

### BondCharged

```solidity
event BondCharged(uint256 indexed nodeOperatorId, uint256 toChargeAmount, uint256 chargedAmount);
```

### BondCurveAdded

```solidity
event BondCurveAdded(uint256[] bondCurve);
```

### BondCurveUpdated

```solidity
event BondCurveUpdated(uint256 indexed curveId, uint256[] bondCurve);
```

### BondCurveSet

```solidity
event BondCurveSet(uint256 indexed nodeOperatorId, uint256 curveId);
```

### BondLockChanged

```solidity
event BondLockChanged(uint256 indexed nodeOperatorId, uint256 newAmount, uint256 retentionUntil);
```

### BondLockRemoved

```solidity
event BondLockRemoved(uint256 indexed nodeOperatorId);
```

### BondLockRetentionPeriodChanged

```solidity
event BondLockRetentionPeriodChanged(uint256 retentionPeriod);
```
