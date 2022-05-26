# DepositSecurityModule

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/DepositSecurityModule.sol)
- [Deployed Contract](https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd)

Due to front-running vulnerability, we [proposed](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) to establish the Deposit Security Committee dedicated to ensuring the safety of deposits on the Beacon chain:

- monitoring the history of deposits and the set of Lido keys available for the deposit, signing and disseminating messages allowing deposits;
- signing the special message allowing anyone to pause deposits once the malicious Node Operator pre-deposits are detected.

Each member must generate an EOA address to sign messages with their private key. The addresses of the committee members will be added to the smart contract.

To make a deposit, we propose to collect a quorum of 2/3 of the signatures of the committee members. Members of the committee can collude with node operators and steal money by signing bad data that contains malicious pre-deposits. To mitigate this we propose to allow a single committee member to stop deposits and also enforce space deposits in time (e.g. no more than 150 deposits with 150 blocks in between them), to provide the single honest participant an ability to stop further deposits even if the supermajority colludes.

The guardian himself, or anyone else who has a signed pause message, can call `pauseDeposits` that pauses `DepositSecurityModule`.

To prevent a replay attack, the guardians sign the block number at the time of which malicious pre-deposits are observed. After a certain number of blocks (`pauseIntentValidityPeriodBlocks`) message becomes invalid.

## View Methods

### getOwner()

Returns the contract's owner address.

```sol
function getOwner() external view returns (address);
```

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

### getLastDepositBlock()

Returns the last block that contains a deposit performed via this security module.

```sol
function getLastDepositBlock() external view returns (uint256)
```

## Methods

### setOwner()

Sets new owner. Only callable by the current owner.

```sol
function setOwner(address newValue) external;
```

#### Parameters:

| Name       | Type      | Description       |
| ---------- | --------- | ----------------- |
| `newValue` | `address` | New owner address |

### setNodeOperatorsRegistry()

Sets NodeOperatorsRegistry contract address. Only callable by the owner.

```sol
function setNodeOperatorsRegistry(address newValue)
```

#### Parameters:

| Name       | Type      | Description                            |
| ---------- | --------- | -------------------------------------- |
| `newValue` | `address` | NodeOperatorsRegistry contract address |

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

### setLastDepositBlock()
Sets `lastDepositBlock`. Only callable by the owner.

```sol
function setLastDepositBlock(uint256 newLastDepositBlock) external;
```

#### Parameters:

| Name                  | Type        | Description                              |
| --------------------- | ----------- | ---------------------------------------- |
| `newLastDepositBlock` | `uint256`   | Block number containing the last deposit |


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
