# CompositePostRebaseBeaconReceiver

- [Source Code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/CompositePostRebaseBeaconReceiver.sol)
- [Deployed Contract](https://etherscan.io/address/0x55a7E1cbD678d9EbD50c7d69Dc75203B0dBdD431)

The contract allows using multiple [`LidoOracle`](/contracts/lido-oracle)
beacon report intercepting
[callbacks](/contracts/lido-oracle#receiver-function-to-be-invoked-on-report-pushes)
by implementing a composite design pattern. In other words, `CompositePostRebaseBeaconReceiver`
follows the `IBeaconReceiver` interface and internally holds an array of nested `IBeaconReceiver`
instances for iterative execution by calling `processLidoOracleReport` in a simple for-loop.

The storage-changing calls (add/insert/remove) are only allowed from the `Voting` contract, and `processLidoOracleReport`
calls from the `LidoOracle` contract.

For architecture consistency, the contract is derived from two contracts: `OrderedCallbacksArray`
(array housekeeping functions) and `IBeaconReportReceiver` (compatibility interface for `LidoOracle`).

The full formal spec is provided with
[LIP-7](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-7.md).

## View methods

### Function: callbacksLength

Returns the current callbacks array length.

```sol
function callbacksLength() external view returns (uint256);
```

### Function: callbacks

Returns the callback element (i.e. callback address) at the specified position.

```sol
function callbacks(uint256 _atIndex) external view returns (address);
```

:::note
Reverts if `_atIndex` is equal to or greater than the length of the callbacks array.
:::

#### Parameters:

| Name       | Type      | Description                            |
| ---------- | --------- | -------------------------------------- |
| `_atIndex` | `uint256` | position (index) of the needed element |

## Methods

### Function: addCallback

Adds the provided callback address at the end of the callbacks array.

```sol
function addCallback(address _callback) external override onlyVoting;
```

:::note
Reverts if any of the following is true:
* `_callback` address is zero;
* `msg.sender` is not equal to the set upon construction `voting` address;
* current length of the callbacks array is equal to `MAX_CALLBACKS_CNT`(=16) contract-wide constant.
:::

#### Parameters:

| Name        | Type      | Description      |
| ----------- | --------- | ---------------- |
| `_callback` | `uint256` | callback address |

### Function: insertCallback

Inserts `_callback` at the `_atIndex` location in the callbacks array.
Elements at and following the `_atIndex` position are shifted one position to the right to preserve the existing invocation order.


```sol
function insertCallback(address _callback, uint256 _atIndex) external override onlyVoting;
```

:::note
Reverts if any of the following is true:
* `_callback` address is zero;
* `msg.sender` is not equal to the set upon construction `voting` address;
* `_atIndex` is greater than the length of the callbacks array;
* current length of the callbacks array is equal to `MAX_CALLBACKS_CNT`(=16) contract-wide constant.
:::

#### Parameters:

| Name        | Type      | Description                               |
| ----------- | --------- | ----------------------------------------- |
| `_callback` | `uint256` | callback address                          |
| `_atIndex_` | `uint256` | destination index (position) in the array |

### Function: removeCallback

Removes the element at the `_atIndex` position from the callbacks array.
Elements following the `_atIndex` position are shifted one position to the left to preserve the existing invocation order.

```sol
function removeCallback(uint256 _atIndex) external override onlyVoting
```

:::note
Reverts if any of the following is true:
* `_atIndex` is equal to or greater than the length of the callbacks array;
* `msg.sender` is not equal to the set upon construction `voting` address.
:::note

| Name        | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| `_atIndex`  | `uint256` | position of the callback being removed |

### Function: processLidoOracleReport

Implements the `IBeaconReceiver` interface supported by the `LidoOracle` contract.
Iteratively calls `callback.processLidoOracleReport` for each stored `callback` in the callbacks array preserving the order.

```sol
function processLidoOracleReport(
    uint256 _postTotalPooledEther,
    uint256 _preTotalPooledEther,
    uint256 _timeElapsed
) external override onlyOracle
```

:::note
Reverts if any of the following is true:
* `msg.sender` is not equal to the set upon construction `oracle` address;
* one of the callbacks reverts
:::

#### Parameters:

| Name                       | Type      | Description                                                                             |
| -------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `_postTotalPooledEther`    | `uint256` | total pooled ether mount, queried right **after* every report push                      |
| `_preTotalPooledEther`     | `uint256` | total pooled ether mount, queried right **before** every report push                    |
| `_timeElapsed`             | `uint256` | the time in seconds between the current epoch of push and the last quorum-reached epoch |

See also the [LidoOracle APR docs](/contracts/lido-oracle#add-calculation-of-staker-rewards-apr) for the in-depth parameters explanation.
