# DepositSecurityModule

- [Source Code](https://github.com/lidofinance/lido-dao/blob/feature/deposit-frontrun-protection-upgrade/contracts/0.8.9/DepositSecurityModule.sol)
- [Deployed Contract](https://etherscan.io)

DepositSecurityModule - non-upgradable contract.

This contract allows  to a single committee member to stop deposits and also enforce space deposits in time (e.g. no more than 150 deposits with 25 blocks in between them), to provide the single honest participant an ability to stop further deposits even if the supermajority colludes.

After deploying and setting up the contract, the ownership will be transferred to the [DAO Agent](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c).

See [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) that describes long-term mitigation for the front-running vulnerability.

## View Methods

### getNodeOperatorsRegistry()

Returns NodeOperatorsRegistry contract address.

```sol
function getNodeOperatorsRegistry() external view returns (address)
```

### getPauseIntentValidityPeriodBlocks()

Returns `PAUSE_INTENT_VALIDITY_PERIOD_BLOCKS` (see `pauseDeposits`).

```sol 
function getPauseIntentValidityPeriodBlocks() external view returns (uint256)
```

### getMaxDeposits()

Returns `MAX_DEPOSITS` (see `depositBufferedEther`).

```sol 
function getMaxDeposits() external view returns (uint256)
```

### getMinDepositBlockDistance()

Returns `MIN_DEPOSIT_BLOCK_DISTANCE`  (see `depositBufferedEther`).

```sol 
function getMinDepositBlockDistance() external view returns (uint256)
```

### getGuardianQuorum()

Returns number of valid guardian signatures required to vet (depositRoot, keysOpIndex) pair.

```sol 
function getGuardianQuorum() external view returns (uint256)
```

### getGuardians()

Returns guardian committee member list.

```sol 
function getGuardians() external view returns (address[] memory)
```

### isGuardian() 

Checks whether the given address is a guardian.

```sol 
function isGuardian(address addr) external view returns (bool)
```

#### Parameters:

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### getGuardianIndex()

Returns index of the guardian, or -1 if the address is not a guardian.

```sol 
function getGuardianIndex(address addr) external view returns (int256)
```

#### Parameters:

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### isPaused()

Returns whether deposits were paused.

```sol 
function isPaused() external view returns (bool)
```

### canDeposit()

Returns whether depositBufferedEther can be called, given that the caller will provide
guardian attestations of non-stale deposit root and `keysOpIndex`, and the number of
such attestations will be enough to reach quorum.

```sol 
function canDeposit() external view returns (bool)
```

## Methods

### getNodeOperatorsRegistry()

Returns NodeOperatorsRegistry contract address.

```sol 
function getNodeOperatorsRegistry() external view returns (address)
```

### setNodeOperatorsRegistry()

Sets NodeOperatorsRegistry contract address. Only callable by the owner.

```sol 
function setNodeOperatorsRegistry(address newValue)
```

#### Parameters:

| Name       | Type      | Description                            |
| ---------- | --------- | -------------------------------------- |
| `newValue` | `address` | NodeOperatorsRegistry contract address |   

### getPauseIntentValidityPeriodBlocks()

Returns `pauseIntentValidityPeriodBlocks` (see `pauseDeposits`).

```sol 
function getPauseIntentValidityPeriodBlocks() external view returns (uint256)
```

### setPauseIntentValidityPeriodBlocks()

Sets `pauseIntentValidityPeriodBlocks`. Only callable by the owner.

```sol 
function setPauseIntentValidityPeriodBlocks(uint256 newValue)
```

#### Parameters:

| Name       | Type      | Description                                          |
| ---------- | --------- | ---------------------------------------------------- |
| `newValue` | `uint256` | Number of blocks after which message becomes invalid | 

### setMaxDeposits()
Sets `maxDepositsPerBlock`. Only callable by the owner.

```sol 
function setMaxDeposits(uint256 newValue)
```

### setMinDepositBlockDistance()
Sets `minDepositBlockDistance`. Only callable by the owner.

```sol 
function setMinDepositBlockDistance(uint256 newValue)
```

### setGuardianQuorum()

Sets `quorum`. Only callable by the owner.

```sol 
function setGuardianQuorum(uint256 newValue)
```

### addGuardian()

Adds a guardian address and sets a new quorum value.
Reverts if the address is already a guardian.

Only callable by the owner.

```sol 
function addGuardian(address addr, uint256 newQuorum)
```

#### Parameters:

| Name        | Type      | Description                                          |
| ----------- | --------- | ---------------- |
| `addr`      | `address` | Guardian address | 
| `newQuorum` | `uint256` | New Quorum value |

### addGuardians()
Adds a set of guardian addresses and sets a new quorum value.
Reverts any of them is already a guardian.

Only callable by the owner.

```sol 
function addGuardians(address[] memory addresses, uint256 newQuorum)
```

| Name        | Type        | Description                                          |
| ----------- | ----------- | --------------------------- |
| `addresses` | `address[]` | Array of Guardian addresses | 
| `newQuorum` | `uint256`   | New Quorum value            |

### removeGuardian()
Removes a guardian with the given address and sets a new quorum value.

Only callable by the owner.

```sol 
function removeGuardian(address addr, uint256 newQuorum)
```

#### Parameters:

| Name        | Type      | Description                                          |
| ----------- | --------- | ---------------- |
| `addr`      | `address` | Guardian address | 
| `newQuorum` | `uint256` | New Quorum value |

### pauseDeposits()
Pauses deposits given that both conditions are satisfied (reverts otherwise):

1. The function is called by the guardian with index guardianIndex OR sig
      is a valid signature by the guardian with index guardianIndex of the data
      defined below.

2. block.number - blockNumber <= pauseIntentValidityPeriodBlocks

 The signature, if present, must be produced for keccak256 hash of the following
 message (each component taking 32 bytes):

 | PAUSE_MESSAGE_PREFIX | blockNumber

```sol
function pauseDeposits(uint256 blockNumber, Signature memory sig)
```

#### Parameters:

| Name          | Type        | Description                                          |
| ------------- | ----------- | ---------------- |
| `blockNumber` | `uint256`   | Block number | 
| `sig`         | `Signature` | Short ECDSA guardian signature as defined in https://eips.ethereum.org/EIPS/eip-2098 |

### unpauseDeposits()
Unpauses deposits. Only callable by the owner.

```sol 
function unpauseDeposits()
```

### depositBufferedEther()
Calls Lido.depositBufferedEther(maxDepositsPerBlock).

:::note
Reverts if any of the following is true:

1. IDepositContract.get_deposit_root() != depositRoot.
2. INodeOperatorsRegistry.getKeysOpIndex() != keysOpIndex.
3. The number of guardian signatures is less than getGuardianQuorum().
4. An invalid or non-guardian signature received.
5. block.number - lastLidoDepositBlock < MIN_DEPOSIT_BLOCK_DISTANCE
6. blockhash(blockNumber) == blockHash
:::

Signatures must be sorted in ascending order by index of the guardian. Each signature must
be produced for keccak256 hash of the following message (each component taking 32 bytes):

| ATTEST_MESSAGE_PREFIX | depositRoot | keysOpIndex | blockNumber | blockHash |

```sol
function depositBufferedEther(
        bytes32 depositRoot,
        uint256 keysOpIndex,
        uint256 blockNumber,
        bytes32 blockHash,
        Signature[] memory sortedGuardianSignatures
    )
```
