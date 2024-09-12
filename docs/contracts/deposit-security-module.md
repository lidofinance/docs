# DepositSecurityModule

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/DepositSecurityModule.sol)
- [Deployed Contract](https://etherscan.io/address/0xC77F8768774E1c9244BEed705C4354f2113CFc09)

Due to front-running vulnerability, we [proposed](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) to establish the Deposit Security Committee dedicated to ensuring the safety of deposits on the Beacon chain:

- monitoring the history of deposits and the set of Lido keys available for the deposit, signing and disseminating messages allowing deposits;
- signing the special message allowing anyone to pause deposits once the malicious Node Operator pre-deposits are detected.

Each member must generate an EOA address to sign messages with their private key. The addresses of the committee members will be added to the smart contract.

To make a deposit, we propose to collect a quorum of 4/6 of the signatures of the committee members. Members of the committee can collude with node operators and steal money by signing bad data that contains malicious pre-deposits. To mitigate this, we propose allowing a single committee member to stop deposits and also enforce space deposits in time (e.g., no more than 150 deposits with 25 blocks in between them) to provide the single honest participant the ability to stop further deposits even if the supermajority colludes.

The guardian himself, or anyone else who has a signed pause message, can call `pauseDeposits` that pauses `DepositSecurityModule`.

To prevent a replay attack, the guardians sign the block number when  malicious pre-deposits are observed. After a certain number of blocks (`pauseIntentValidityPeriodBlocks`) message becomes invalid.

Values of the parameters `maxDepositsPerBlock` and `minDepositBlockDistance` are controlled by Lido DAO and must be harmonized with `appearedValidatorsPerDayLimit` of [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker).

## View Methods

### getOwner()

Returns the contract's owner address.

```solidity
function getOwner() external view returns (address);
```

### getPauseIntentValidityPeriodBlocks()

Returns `PAUSE_INTENT_VALIDITY_PERIOD_BLOCKS` (see `pauseDeposits`).

```solidity
function getPauseIntentValidityPeriodBlocks() external view returns (uint256);
```

### getGuardianQuorum()

Returns the number of valid guardian signatures required to vet (depositRoot, nonce) pair.

```solidity
function getGuardianQuorum() external view returns (uint256);
```

### getGuardians()

Returns guardian committee member list.

```solidity
function getGuardians() external view returns (address[] memory);
```

### isGuardian()

Checks whether the given address is a guardian.

```solidity
function isGuardian(address addr) external view returns (bool);
```

#### Parameters

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### getGuardianIndex()

Returns index of the guardian, or -1 if the address is not a guardian.

```solidity
function getGuardianIndex(address addr) external view returns (int256);
```

#### Parameters

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### canDeposit()

Returns whether `LIDO.deposit()` can be called and a deposit can be made for the staking module with
id `stakingModuleId`, given that the caller will provide guardian attestations of non-stale deposit
root and `nonce` and the number of such attestations will be enough to reach a quorum.

```solidity
function canDeposit(uint256 stakingModuleId) external view returns (bool);
```

#### Parameters

| Name              | Type      | Description              |
| ----------------- | --------- | ------------------------ |
| `stakingModuleId` | `uint256` | Id of the staking module |

## Methods

### setOwner()

Sets new owner.

```solidity
function setOwner(address newValue) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- `newValue` is zero address.
:::

#### Parameters

| Name       | Type      | Description       |
| ---------- | --------- | ----------------- |
| `newValue` | `address` | New owner address |

### setPauseIntentValidityPeriodBlocks()

Sets `pauseIntentValidityPeriodBlocks`.

```solidity
function setPauseIntentValidityPeriodBlocks(uint256 newValue) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- `newValue` is 0 (zero).
:::

#### Parameters

| Name       | Type      | Description                                          |
| ---------- | --------- | ---------------------------------------------------- |
| `newValue` | `uint256` | Number of blocks after which message becomes invalid |

### setGuardianQuorum()

Sets the number of valid guardian signatures required to vet (depositRoot, nonce) pair (aka "quorum").

```solidity
function setGuardianQuorum(uint256 newValue) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
:::

#### Parameters

| Name        | Type      | Description      |
| ----------- | --------- | ---------------- |
| `newValue`  | `uint256` | New quorum value |

### addGuardian()

Adds a guardian address and sets a new quorum value.

```solidity
function addGuardian(address addr, uint256 newQuorum) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- `addr` is already a guardian.
:::

#### Parameters

| Name        | Type      | Description      |
| ----------- | --------- | ---------------- |
| `addr`      | `address` | Guardian address |
| `newQuorum` | `uint256` | New Quorum value |

### addGuardians()

Adds a set of guardian addresses and sets a new quorum value.

```solidity
function addGuardians(address[] memory addresses, uint256 newQuorum) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- any of the `addresses` is already a guardian.
:::

#### Parameters

| Name        | Type        | Description                                          |
| ----------- | ----------- | --------------------------- |
| `addresses` | `address[]` | Array of Guardian addresses |
| `newQuorum` | `uint256`   | New Quorum value            |

### removeGuardian()

Removes a guardian with the given address and sets a new quorum value.

```solidity
function removeGuardian(address addr, uint256 newQuorum) external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner;
- `addr` is not a guardian.
:::

#### Parameters

| Name        | Type      | Description      |
| ----------- | --------- | ---------------- |
| `addr`      | `address` | Guardian address |
| `newQuorum` | `uint256` | New Quorum value |

### pauseDeposits()

Pauses deposits if both conditions are satisfied (reverts otherwise):

1. The function is called by the guardian with index guardianIndex OR sig
      is a valid signature by the guardian with index guardianIndex of the data
      defined below.

2. `block.number - blockNumber <= pauseIntentValidityPeriodBlocks`

 The signature, if present, must be produced for keccak256 hash of the following
 message (each component taking 32 bytes):

| PAUSE_MESSAGE_PREFIX | blockNumber |

If the staking module is not active does nothing.
In case of an emergency, the function `pauseDeposits` is supposed to be called
by all guardians. Thus, only the first call will do the actual change. So
the other calls would be OK operations from the point of view of the protocol logic.

```solidity
function pauseDeposits(uint256 blockNumber, Signature memory sig) external;
```

#### Parameters

| Name              | Type        | Description                                                                          |
| ----------------- | ----------- | ------------------------------------------------------------------------------------ |
| `blockNumber`     | `uint256`   | Block number with malicious pre-deposits have been observed by the guardian          |
| `sig`             | `Signature` | Short ECDSA guardian signature as defined in [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |

### unpauseDeposits()

Unpauses deposits.

```solidity
function unpauseDeposits() external;
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner.
- Deposits not paused.
:::

### depositBufferedEther()

Verifies the deposit security conditions are met and calls `LIDO.deposit(maxDepositsPerBlock, stakingModuleId, depositCalldata)`. Otherwise reverts.

:::note
Reverts if any of the following is true:

1. IDepositContract.get_deposit_root() != depositRoot;
2. StakingModule.getNonce() != nonce;
3. The number of guardian signatures is less than getGuardianQuorum();
4. An invalid or non-guardian signature received;
5. block.number - StakingModule.getLastDepositBlock() < minDepositBlockDistance;
6. blockhash(blockNumber) != blockHash.
:::

Signatures must be sorted in ascending order by the index of the guardian. Each signature must
be produced for the keccak256 hash of the following message (each component taking 32 bytes):

| ATTEST_MESSAGE_PREFIX | blockNumber | blockHash | depositRoot | stakingModuleId | nonce |

```solidity
function depositBufferedEther(
    uint256 blockNumber,
    bytes32 blockHash,
    bytes32 depositRoot,
    uint256 stakingModuleId,
    uint256 nonce,
    bytes calldata depositCalldata,
    Signature[] calldata sortedGuardianSignatures
) external;
```

#### Parameters

| Name                       | Type          | Description                                                                                        |
|----------------------------|---------------|----------------------------------------------------------------------------------------------------|
| `blockNumber`              | `uint256`     | Number of the current deposit block                                                                |
| `blockHash`                | `bytes32`     | Hash of the current deposit block                                                                  |
| `depositRoot`              | `bytes32`     | Deposit root of the Ethereum DepositContract                                                       |
| `stakingModuleId`          | `uint256`     | Id of the staking module to deposit with                                                           |
| `nonce`                    | `uint256`     | Nonce of key operations of the staking module                                                      |
| `depositCalldata`          | `bytes`       | Staking module deposit calldata                                                                    |
| `sortedGuardianSignatures` | `Signature[]` | Short ECDSA guardians signatures as defined in [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |


### unvetSigningKeys()

Unvets signing keys for the given node operators.

:::note
Reverts if any of the following is true:

1. The nonce is not equal to the on-chain nonce of the staking module;
2. nodeOperatorIds is not packed with 8 bytes per id;
3. vettedSigningKeysCounts is not packed with 16 bytes per count;
4. the number of node operators is greater than maxOperatorsPerUnvetting;
5. the signature is invalid or the signer is not a guardian;
6. blockHash is zero or not equal to the blockhash(blockNumber).
:::

The signature, if present, must be produced for the keccak256 hash of the following message:  
| UNVET_MESSAGE_PREFIX | blockNumber | blockHash | stakingModuleId | nonce | nodeOperatorIds | vettedSigningKeysCounts |

```solidity
function unvetSigningKeys(
    uint256 blockNumber,
    bytes32 blockHash,
    uint256 stakingModuleId,
    uint256 nonce,
    bytes calldata nodeOperatorIds,
    bytes calldata vettedSigningKeysCounts,
    Signature calldata sig
) external;
```

#### Parameters

| Name                      | Type        | Description                                                                                        |
|---------------------------|-------------|----------------------------------------------------------------------------------------------------|
| `blockNumber`             | `uint256`   | Number of the current deposit block                                                                |
| `blockHash`               | `bytes32`   | Hash of the current deposit block                                                                  |
| `stakingModuleId`         | `uint256`   | Id of the staking module to deposit with                                                           |
| `nonce`                   | `uint256`   | Nonce of key operations of the staking module                                                      |
| `nodeOperatorIds`         | `bytes`     | The list of node operator IDs packed with 8 bytes per id                                           |
| `vettedSigningKeysCounts` | `bytes`     | The list of vetted signing keys counts packed with 16 bytes per count                              |
| `sig`                     | `Signature` | Short ECDSA guardians signatures as defined in [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |
