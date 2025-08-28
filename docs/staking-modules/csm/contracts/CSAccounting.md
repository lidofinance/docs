# CSAccounting

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/CSAccounting.sol)
- [Deployed contract](https://etherscan.io/address/0x4d72BFF1BeaC69925F8Bd12526a39BAAb069e5Da)

`CSAccounting.sol` is a supplementary contract responsible for the management of bond, rewards, and penalties. It stores bond tokens as `stETH` shares, provides information about the bond required, and provides interfaces for the penalties. Node Operators claim rewards and top-up bonds using this contract.

**Changes in v2:**
- User-facing methods for reward claims and bond top-ups are moved to `CSAccounting.sol` from `CSModule.sol`;
- Public methods to get claimable bond amounts and rewards are added;

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


### MANAGE_BOND_CURVES_ROLE

```solidity
bytes32 public constant MANAGE_BOND_CURVES_ROLE = keccak256("MANAGE_BOND_CURVES_ROLE");
```


### SET_BOND_CURVE_ROLE

```solidity
bytes32 public constant SET_BOND_CURVE_ROLE = keccak256("SET_BOND_CURVE_ROLE");
```


### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```


### MODULE

```solidity
ICSModule public immutable MODULE;
```


### FEE_DISTRIBUTOR

```solidity
ICSFeeDistributor public immutable FEE_DISTRIBUTOR;
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
uint256 public constant MAX_CURVE_LENGTH = 100;
```

### MIN_BOND_LOCK_PERIOD

```solidity
uint256 public immutable MIN_BOND_LOCK_PERIOD;
```


### MAX_BOND_LOCK_PERIOD

```solidity
uint256 public immutable MAX_BOND_LOCK_PERIOD;
```


### chargePenaltyRecipient

```solidity
address public chargePenaltyRecipient;
```


## Functions

### resume

Resume reward claims and deposits


```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause reward claims and deposits for `duration` seconds

*Must be called together with `CSModule.pauseFor`*


```solidity
function pauseFor(uint256 duration) external onlyRole(PAUSE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`duration`|`uint256`|Duration of the pause in seconds|


### setChargePenaltyRecipient

Set charge recipient address


```solidity
function setChargePenaltyRecipient(address _chargePenaltyRecipient) external onlyRole(DEFAULT_ADMIN_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_chargePenaltyRecipient`|`address`|Charge recipient address|


### setBondLockPeriod

Set bond lock period


```solidity
function setBondLockPeriod(uint256 period) external onlyRole(DEFAULT_ADMIN_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`period`|`uint256`|Period in seconds to retain bond lock|


### addBondCurve

Add a new bond curve


```solidity
function addBondCurve(BondCurveIntervalInput[] calldata bondCurve)
    external
    onlyRole(MANAGE_BOND_CURVES_ROLE)
    returns (uint256 id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`bondCurve`|`BondCurveIntervalInput[]`|Bond curve definition to add|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`id`|`uint256`|Id of the added curve|


### updateBondCurve

Update existing bond curve

*If the curve is updated to a curve with higher values for any point,
Extensive checks and actions should be performed by the method caller to avoid
inconsistency in the keys accounting. A manual update of the depositable validators count
in CSM might be required to ensure that the keys pointers are consistent.*


```solidity
function updateBondCurve(uint256 curveId, BondCurveIntervalInput[] calldata bondCurve)
    external
    onlyRole(MANAGE_BOND_CURVES_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`curveId`|`uint256`|Bond curve ID to update|
|`bondCurve`|`BondCurveIntervalInput[]`|Bond curve definition|


### setBondCurve

Set the bond curve for the given Node Operator

*Updates depositable validators count in CSM to ensure key pointers consistency*


```solidity
function setBondCurve(uint256 nodeOperatorId, uint256 curveId) external onlyRole(SET_BOND_CURVE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`curveId`|`uint256`|ID of the bond curve to set|


### depositETH

Stake user's ETH with Lido and deposit stETH to the bond

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositETH(address from, uint256 nodeOperatorId) external payable whenResumed onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Address to stake ETH and deposit stETH from|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|


### depositETH

Stake user's ETH with Lido and deposit stETH to the bond

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositETH(uint256 nodeOperatorId) external payable whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|


### depositStETH

Deposit user's stETH to the bond for the given Node Operator

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositStETH(address from, uint256 nodeOperatorId, uint256 stETHAmount, PermitInput calldata permit)
    external
    whenResumed
    onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Address to deposit stETH from.|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`stETHAmount`|`uint256`|Amount of stETH to deposit|
|`permit`|`PermitInput`|stETH permit for the contract|


### depositStETH

Deposit user's stETH to the bond for the given Node Operator

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositStETH(uint256 nodeOperatorId, uint256 stETHAmount, PermitInput calldata permit) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`stETHAmount`|`uint256`|Amount of stETH to deposit|
|`permit`|`PermitInput`|stETH permit for the contract|


### depositWstETH

Unwrap the user's wstETH and deposit stETH to the bond for the given Node Operator

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositWstETH(address from, uint256 nodeOperatorId, uint256 wstETHAmount, PermitInput calldata permit)
    external
    whenResumed
    onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|Address to unwrap wstETH from|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`wstETHAmount`|`uint256`|Amount of wstETH to deposit|
|`permit`|`PermitInput`|wstETH permit for the contract|


### depositWstETH

Unwrap the user's wstETH and deposit stETH to the bond for the given Node Operator

*Called by CSM exclusively. CSM should check node operator existence and update depositable validators count*


```solidity
function depositWstETH(uint256 nodeOperatorId, uint256 wstETHAmount, PermitInput calldata permit)
    external
    whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`wstETHAmount`|`uint256`|Amount of wstETH to deposit|
|`permit`|`PermitInput`|wstETH permit for the contract|


### claimRewardsStETH

Claim full reward (fee + bond) in stETH for the given Node Operator with desirable value.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

*It's impossible to use single-leaf proof via this method, so this case should be treated carefully by
off-chain tooling, e.g. to make sure a tree has at least 2 leafs.*


```solidity
function claimRewardsStETH(
    uint256 nodeOperatorId,
    uint256 stETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external whenResumed returns (uint256 claimedShares);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`stETHAmount`|`uint256`|Amount of stETH to claim|
|`cumulativeFeeShares`|`uint256`|Cumulative fee stETH shares for the Node Operator|
|`rewardsProof`|`bytes32[]`|Merkle proof of the rewards|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimedShares`|`uint256`|shares Amount of stETH shares claimed|


### claimRewardsWstETH

Claim full reward (fee + bond) in wstETH for the given Node Operator available for this moment.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

*It's impossible to use single-leaf proof via this method, so this case should be treated carefully by
off-chain tooling, e.g. to make sure a tree has at least 2 leafs.*


```solidity
function claimRewardsWstETH(
    uint256 nodeOperatorId,
    uint256 wstETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external whenResumed returns (uint256 claimedWstETH);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`wstETHAmount`|`uint256`|Amount of wstETH to claim|
|`cumulativeFeeShares`|`uint256`|Cumulative fee stETH shares for the Node Operator|
|`rewardsProof`|`bytes32[]`|Merkle proof of the rewards|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimedWstETH`|`uint256`|claimedWstETHAmount Amount of wstETH claimed|


### claimRewardsUnstETH

Request full reward (fee + bond) in Withdrawal NFT (unstETH) for the given Node Operator available for this moment.
`rewardsProof` and `cumulativeFeeShares` might be empty in order to claim only excess bond

*Reverts if amount isn't between `MIN_STETH_WITHDRAWAL_AMOUNT` and `MAX_STETH_WITHDRAWAL_AMOUNT`*


```solidity
function claimRewardsUnstETH(
    uint256 nodeOperatorId,
    uint256 stETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external whenResumed returns (uint256 requestId);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`stETHAmount`|`uint256`|Amount of ETH to request|
|`cumulativeFeeShares`|`uint256`|Cumulative fee stETH shares for the Node Operator|
|`rewardsProof`|`bytes32[]`|Merkle proof of the rewards|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`requestId`|`uint256`|Withdrawal NFT ID|


### lockBondETH

Lock bond in ETH for the given Node Operator

*Called by CSM exclusively*


```solidity
function lockBondETH(uint256 nodeOperatorId, uint256 amount) external onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`amount`|`uint256`|Amount to lock in ETH (stETH)|


### releaseLockedBondETH

Release locked bond in ETH for the given Node Operator

*Called by CSM exclusively*


```solidity
function releaseLockedBondETH(uint256 nodeOperatorId, uint256 amount) external onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`amount`|`uint256`|Amount to release in ETH (stETH)|


### compensateLockedBondETH

Compensate locked bond ETH for the given Node Operator

*Called by CSM exclusively*


```solidity
function compensateLockedBondETH(uint256 nodeOperatorId) external payable onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|


### settleLockedBondETH

Settle locked bond ETH for the given Node Operator

*Called by CSM exclusively*


```solidity
function settleLockedBondETH(uint256 nodeOperatorId) external onlyModule returns (bool applied);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|


### penalize

Penalize bond by burning stETH shares of the given Node Operator

*Penalty application has a priority over the locked bond.
Method call can result in the remaining bond being lower than the locked bond.*


```solidity
function penalize(uint256 nodeOperatorId, uint256 amount) external onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`amount`|`uint256`|Amount to penalize in ETH (stETH)|


### chargeFee

Charge fee from bond by transferring stETH shares of the given Node Operator to the charge recipient

*Charge confiscation has a priority over the locked bond.
Method call can result in the remaining bond being lower than the locked bond.*


```solidity
function chargeFee(uint256 nodeOperatorId, uint256 amount) external onlyModule;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`amount`|`uint256`|Amount to charge in ETH (stETH)|


### pullFeeRewards

Pull fees from CSFeeDistributor to the Node Operator's bond

*Permissionless method. Can be called before penalty application to ensure that rewards are also penalized*


```solidity
function pullFeeRewards(uint256 nodeOperatorId, uint256 cumulativeFeeShares, bytes32[] calldata rewardsProof)
    external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`cumulativeFeeShares`|`uint256`|Cumulative fee stETH shares for the Node Operator|
|`rewardsProof`|`bytes32[]`|Merkle proof of the rewards|


### recoverERC20

*Allows sender to recover ERC20 tokens held by the contract*


```solidity
function recoverERC20(address token, uint256 amount) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|The address of the ERC20 token to recover|
|`amount`|`uint256`|The amount of the ERC20 token to recover Emits an ERC20Recovered event upon success Optionally, the inheriting contract can override this function to add additional restrictions|


### recoverStETHShares

Recover all stETH shares from the contract

*Accounts for the bond funds stored during recovery*


```solidity
function recoverStETHShares() external;
```

### renewBurnerAllowance

Service method to update allowance to Burner in case it has changed


```solidity
function renewBurnerAllowance() external;
```

### getInitializedVersion

Get the initialized version of the contract


```solidity
function getInitializedVersion() external view returns (uint64);
```

### totalBondShares

Get total bond shares (stETH) stored on the contract


```solidity
function totalBondShares() public view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Total bond shares (stETH)|


### getBondShares

Get bond shares (stETH) for the given Node Operator


```solidity
function getBondShares(uint256 nodeOperatorId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Bond in stETH shares|


### getBond

Get bond amount in ETH (stETH) for the given Node Operator


```solidity
function getBond(uint256 nodeOperatorId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Bond amount in ETH (stETH)|

### getCurvesCount


```solidity
function getCurvesCount() external view returns (uint256);
```

### getCurveInfo

Return bond curve for the given curve id

*Reverts if `curveId` is invalid*


```solidity
function getCurveInfo(uint256 curveId) external view returns (BondCurve memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`curveId`|`uint256`|Curve id to get bond curve for|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`BondCurve`|Bond curve|


### getBondCurve

Get bond curve for the given Node Operator


```solidity
function getBondCurve(uint256 nodeOperatorId) external view returns (BondCurve memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`BondCurve`|Bond curve|


### getBondCurveId

Get bond curve ID for the given Node Operator


```solidity
function getBondCurveId(uint256 nodeOperatorId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Bond curve ID|


### getBondAmountByKeysCount

Get required bond in ETH for the given number of keys for default bond curve

*To calculate the amount for the new keys 2 calls are required:
getBondAmountByKeysCount(newTotal) - getBondAmountByKeysCount(currentTotal)*


```solidity
function getBondAmountByKeysCount(uint256 keys, uint256 curveId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keys`|`uint256`|Number of keys to get required bond for|
|`curveId`|`uint256`|Id of the curve to perform calculations against|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Amount for particular keys count|


### getKeysCountByBondAmount

Get keys count for the given bond amount with default bond curve


```solidity
function getKeysCountByBondAmount(uint256 amount, uint256 curveId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|Bond amount in ETH (stETH)to get keys count for|
|`curveId`|`uint256`|Id of the curve to perform calculations against|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Keys count|

### getBondLockPeriod

Get default bond lock period


```solidity
function getBondLockPeriod() external view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|period Default bond lock period|


### getLockedBondInfo

Get information about the locked bond for the given Node Operator


```solidity
function getLockedBondInfo(uint256 nodeOperatorId) external view returns (BondLock memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`BondLock`|Locked bond info|


### getActualLockedBond

Get amount of the locked bond in ETH (stETH) by the given Node Operator


```solidity
function getActualLockedBond(uint256 nodeOperatorId) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Amount of the actual locked bond|


### getBondSummary

Get current and required bond amounts in ETH (stETH) for the given Node Operator

*To calculate excess bond amount subtract `required` from `current` value.
To calculate missed bond amount subtract `current` from `required` value*


```solidity
function getBondSummary(uint256 nodeOperatorId) external view returns (uint256 current, uint256 required);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`current`|`uint256`|Current bond amount in ETH|
|`required`|`uint256`|Required bond amount in ETH|


### getUnbondedKeysCount

Get the number of the unbonded keys


```solidity
function getUnbondedKeysCount(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Unbonded keys count|


### getUnbondedKeysCountToEject

Get the number of the unbonded keys to be ejected using a forcedTargetLimit
Locked bond is not considered for this calculation to allow Node Operators to
compensate the locked bond via `compensateLockedBondETH` method before the ejection happens


```solidity
function getUnbondedKeysCountToEject(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Unbonded keys count|


### getBondAmountByKeysCountWstETH

Get the bond amount in wstETH required for the `keysCount` keys using the default bond curve


```solidity
function getBondAmountByKeysCountWstETH(uint256 keysCount, uint256 curveId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`keysCount`|`uint256`|Keys count to calculate the required bond amount|
|`curveId`|`uint256`|Id of the curve to perform calculations against|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|wstETH amount required for the `keysCount`|


### getRequiredBondForNextKeysWstETH

Get the required bond in wstETH (inc. missed and excess) for the given Node Operator to upload new keys


```solidity
function getRequiredBondForNextKeysWstETH(uint256 nodeOperatorId, uint256 additionalKeys)
    external
    view
    returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`additionalKeys`|`uint256`|Number of new keys to add|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Required bond in wstETH|


### getClaimableBondShares

Get current claimable bond in stETH shares for the given Node Operator


```solidity
function getClaimableBondShares(uint256 nodeOperatorId) external view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Current claimable bond in stETH shares|


### getClaimableRewardsAndBondShares

Get current claimable bond in stETH shares for the given Node Operator
Includes potential rewards distributed by the Fee Distributor


```solidity
function getClaimableRewardsAndBondShares(
    uint256 nodeOperatorId,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external view returns (uint256 claimableShares);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`cumulativeFeeShares`|`uint256`|Cumulative fee stETH shares for the Node Operator|
|`rewardsProof`|`bytes32[]`|Merkle proof of the rewards|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimableShares`|`uint256`|Current claimable bond in stETH shares|


### feeDistributor

```solidity
function feeDistributor() external view returns (ICSFeeDistributor);
```

### getBondSummaryShares

Get current and required bond amounts in stETH shares for the given Node Operator

*To calculate excess bond amount subtract `required` from `current` value.
To calculate missed bond amount subtract `current` from `required` value*


```solidity
function getBondSummaryShares(uint256 nodeOperatorId) public view returns (uint256 current, uint256 required);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`current`|`uint256`|Current bond amount in stETH shares|
|`required`|`uint256`|Required bond amount in stETH shares|


### getRequiredBondForNextKeys

Get the required bond in ETH (inc. missed and excess) for the given Node Operator to upload new deposit data


```solidity
function getRequiredBondForNextKeys(uint256 nodeOperatorId, uint256 additionalKeys) public view returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`additionalKeys`|`uint256`|Number of new keys to add|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|Required bond amount in ETH|


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
event BondClaimedUnstETH(uint256 indexed nodeOperatorId, address to, uint256 amount, uint256 requestId);
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
event BondBurned(uint256 indexed nodeOperatorId, uint256 amountToBurn, uint256 burnedAmount);
```

### BondCharged

```solidity
event BondCharged(uint256 indexed nodeOperatorId, uint256 toChargeAmount, uint256 chargedAmount);
```

### BondCurveAdded

```solidity
event BondCurveAdded(uint256 indexed curveId, BondCurveIntervalInput[] bondCurveIntervals);
```

### BondCurveUpdated

```solidity
event BondCurveUpdated(uint256 indexed curveId, BondCurveIntervalInput[] bondCurveIntervals);
```

### BondCurveSet

```solidity
event BondCurveSet(uint256 indexed nodeOperatorId, uint256 curveId);
```

### BondLockChanged

```solidity
event BondLockChanged(uint256 indexed nodeOperatorId, uint256 newAmount, uint256 until);
```

### BondLockRemoved

```solidity
event BondLockRemoved(uint256 indexed nodeOperatorId);
```

### BondLockPeriodChanged

```solidity
event BondLockPeriodChanged(uint256 period);
```
