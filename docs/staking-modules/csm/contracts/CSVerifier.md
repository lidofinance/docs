# CSVerifier

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSVerifier.sol)
- [Deployed contract](https://etherscan.io/address/0x3Dfc50f22aCA652a0a6F28a0F892ab62074b5583)

`CSVerifier.sol` is a utility contract responsible for validating the CL data proofs using [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788). It accepts proof of the validator withdrawals and reports these facts to the `CSModule.sol` if the proof is valid.

**Changes in v2:**
- The slashing reporting method is removed;
- Pause methods added;

## Upgradability

The contract is immutable.

## State Variables
### PAUSE_ROLE

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
```


### RESUME_ROLE

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE");
```


### BEACON_ROOTS

```solidity
address public constant BEACON_ROOTS = 0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02;
```


### SLOTS_PER_EPOCH

```solidity
uint64 public immutable SLOTS_PER_EPOCH;
```


### SLOTS_PER_HISTORICAL_ROOT
*Count of historical roots per accumulator.*

*See https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#time-parameters*


```solidity
uint64 public immutable SLOTS_PER_HISTORICAL_ROOT;
```



### GI_FIRST_WITHDRAWAL_PREV
*This index is relative to a state like: `BeaconState.latest_execution_payload_header.withdrawals[0]`.*


```solidity
GIndex public immutable GI_FIRST_WITHDRAWAL_PREV;
```


### GI_FIRST_WITHDRAWAL_CURR
*This index is relative to a state like: `BeaconState.latest_execution_payload_header.withdrawals[0]`.*


```solidity
GIndex public immutable GI_FIRST_WITHDRAWAL_CURR;
```


### GI_FIRST_VALIDATOR_PREV
*This index is relative to a state like: `BeaconState.validators[0]`.*


```solidity
GIndex public immutable GI_FIRST_VALIDATOR_PREV;
```


### GI_FIRST_VALIDATOR_CURR
*This index is relative to a state like: `BeaconState.validators[0]`.*


```solidity
GIndex public immutable GI_FIRST_VALIDATOR_CURR;
```


### GI_FIRST_HISTORICAL_SUMMARY_PREV
*This index is relative to a state like: `BeaconState.historical_summaries[0]`.*


```solidity
GIndex public immutable GI_FIRST_HISTORICAL_SUMMARY_PREV;
```


### GI_FIRST_HISTORICAL_SUMMARY_CURR
*This index is relative to a state like: `BeaconState.historical_summaries[0]`.*


```solidity
GIndex public immutable GI_FIRST_HISTORICAL_SUMMARY_CURR;
```


### GI_FIRST_BLOCK_ROOT_IN_SUMMARY_PREV
*This index is relative to HistoricalSummary like: HistoricalSummary.blockRoots[0].*


```solidity
GIndex public immutable GI_FIRST_BLOCK_ROOT_IN_SUMMARY_PREV;
```


### GI_FIRST_BLOCK_ROOT_IN_SUMMARY_CURR
*This index is relative to HistoricalSummary like: HistoricalSummary.blockRoots[0].*


```solidity
GIndex public immutable GI_FIRST_BLOCK_ROOT_IN_SUMMARY_CURR;
```


### FIRST_SUPPORTED_SLOT
*The very first slot the verifier is supposed to accept proofs for.*


```solidity
Slot public immutable FIRST_SUPPORTED_SLOT;
```


### PIVOT_SLOT
*The first slot of the currently compatible fork.*


```solidity
Slot public immutable PIVOT_SLOT;
```


### CAPELLA_SLOT
*Historical summaries started accumulating from the slot of Capella fork.*


```solidity
Slot public immutable CAPELLA_SLOT;
```


### WITHDRAWAL_ADDRESS
*An address withdrawals are supposed to happen to (Lido withdrawal credentials).*


```solidity
address public immutable WITHDRAWAL_ADDRESS;
```


### MODULE
*Staking module contract*


```solidity
ICSModule public immutable MODULE;
```


## Functions
### constructor

*The previous and current forks can be essentially the same.*


```solidity
constructor(
    address withdrawalAddress,
    address module,
    uint64 slotsPerEpoch,
    GIndices memory gindices,
    Slot firstSupportedSlot,
    Slot pivotSlot,
    address admin
);
```

### resume

Resume write methods calls


```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause write methods calls for `duration` seconds


```solidity
function pauseFor(uint256 duration) external onlyRole(PAUSE_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`duration`|`uint256`|Duration of the pause in seconds|


### processWithdrawalProof

Verify withdrawal proof and report withdrawal to the module for valid proofs


```solidity
function processWithdrawalProof(
    ProvableBeaconBlockHeader calldata beaconBlock,
    WithdrawalWitness calldata witness,
    uint256 nodeOperatorId,
    uint256 keyIndex
) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`beaconBlock`|`ProvableBeaconBlockHeader`|Beacon block header|
|`witness`|`WithdrawalWitness`|Withdrawal witness against the `beaconBlock`'s state root.|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndex`|`uint256`|Index of the validator key in the Node Operator's key storage|


### processHistoricalWithdrawalProof

Verify withdrawal proof against historical summaries data and report withdrawal to the module for valid proofs


```solidity
function processHistoricalWithdrawalProof(
    ProvableBeaconBlockHeader calldata beaconBlock,
    HistoricalHeaderWitness calldata oldBlock,
    WithdrawalWitness calldata witness,
    uint256 nodeOperatorId,
    uint256 keyIndex
) external whenResumed;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`beaconBlock`|`ProvableBeaconBlockHeader`|Beacon block header|
|`oldBlock`|`HistoricalHeaderWitness`|Historical block header witness|
|`witness`|`WithdrawalWitness`|Withdrawal witness|
|`nodeOperatorId`|`uint256`|ID of the Node Operator|
|`keyIndex`|`uint256`|Index of the validator key in the Node Operator's key storage|

