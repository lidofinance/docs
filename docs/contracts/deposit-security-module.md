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

Values of the parameters `maxDepositsPerBlock` and `minDepositBlockDistance` are controlled by Lido DAO and must be harmonized with `churnValidatorsPerDayLimit` of [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker).

## View Methods

### getOwner()

Returns the contract's owner address.

```sol
function getOwner() external view returns (address);
```

### getPauseIntentValidityPeriodBlocks()

Returns `PAUSE_INTENT_VALIDITY_PERIOD_BLOCKS` (see `pauseDeposits`).

```sol
function getPauseIntentValidityPeriodBlocks() external view returns (uint256)
```

### getMaxDeposits()

Returns max amount of deposits per block (see `depositBufferedEther`).

```sol
function getMaxDeposits() external view returns (uint256)
```

### getMinDepositBlockDistance()

Returns min distance in blocks between deposits (see `depositBufferedEther`).

```sol
function getMinDepositBlockDistance() external view returns (uint256)
```

### getGuardianQuorum()

Returns the number of valid guardian signatures required to vet (depositRoot, nonce) pair.

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

#### Parameters

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### getGuardianIndex()

Returns index of the guardian, or -1 if the address is not a guardian.

```sol
function getGuardianIndex(address addr) external view returns (int256)
```

#### Parameters

| Name   | Type      | Description                        |
| ------ | --------- | ---------------------------------- |
| `addr` | `address` | Valid ETH-1 address                |

### canDeposit()

Returns whether `LIDO.deposit()` can be called and a deposit can be made for the staking module with
id `stakingModuleId`, given that the caller will provide guardian attestations of non-stale deposit
root and `nonce` and the number of such attestations will be enough to reach a quorum.

```sol
function canDeposit(uint256 stakingModuleId) external view returns (bool)
```

#### Parameters

| Name              | Type      | Description              |
| ----------------- | --------- | ------------------------ |
| `stakingModuleId` | `uint256` | Id of the staking module |

## Methods

### setOwner()

Sets new owner.

```sol
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

```sol
function setPauseIntentValidityPeriodBlocks(uint256 newValue)
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

### setMaxDeposits()

Sets `maxDepositsPerBlock`.

The value must be harmonized with the parameter `churnValidatorsPerDayLimit` of [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker).

```sol
function setMaxDeposits(uint256 newValue)
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner.
:::

#### Parameters

| Name       | Type      | Description                                    |
| ---------- | --------- | ---------------------------------------------- |
| `newValue` | `uint256` | New value of the maxDepositsPerBlock parameter |

### setMinDepositBlockDistance()

Sets `minDepositBlockDistance`.

The value must be harmonized with the parameter `churnValidatorsPerDayLimit` of [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker).

```sol
function setMinDepositBlockDistance(uint256 newValue)
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner.
:::

#### Parameters

| Name       | Type      | Description                                    |
| ---------- | --------- | ---------------------------------------------- |
| `newValue` | `uint256` | New value of the min DepositsPerBlock parameter |

### setGuardianQuorum()

Sets the number of valid guardian signatures required to vet (depositRoot, nonce) pair (aka "quorum").

```sol
function setGuardianQuorum(uint256 newValue)
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

```sol
function addGuardian(address addr, uint256 newQuorum)
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

```sol
function addGuardians(address[] memory addresses, uint256 newQuorum)
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

```sol
function removeGuardian(address addr, uint256 newQuorum)
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

Pauses deposits for staking module given that both conditions are satisfied (reverts otherwise):

1. The function is called by the guardian with index guardianIndex OR sig
      is a valid signature by the guardian with index guardianIndex of the data
      defined below.

2. `block.number - blockNumber <= pauseIntentValidityPeriodBlocks`

 The signature, if present, must be produced for keccak256 hash of the following
 message (each component taking 32 bytes):

 | PAUSE_MESSAGE_PREFIX | blockNumber | stakingModuleId |

If the staking module is not active does nothing.
In case of an emergency, the function `pauseDeposits` is supposed to be called
by all guardians. Thus only the first call will do the actual change. So
the other calls would be OK operations from the point of view of the protocol logic.

```sol
function pauseDeposits(uint256 blockNumber, uint256 stakingModuleId, Signature memory sig)
```

#### Parameters

| Name              | Type        | Description                                                                          |
| ----------------- | ----------- | ------------------------------------------------------------------------------------ |
| `blockNumber`     | `uint256`   | Block number with malicious pre-deposits have been observed by the guardian          |
| `stakingModuleId` | `uint256`   | Id of the staking module to pause deposits for                                       |
| `sig`             | `Signature` | Short ECDSA guardian signature as defined in [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |

### unpauseDeposits()

Unpauses deposits for staking module.
If the staking module is not paused, do nothing.

```sol
function unpauseDeposits(uint256 stakingModuleId)
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not the owner.
:::

#### Parameters

| Name              | Type      | Description              |
| ----------------- | --------- | ------------------------ |
| `stakingModuleId` | `uint256` | Id of the staking module |

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

```sol
function depositBufferedEther(
        uint256 blockNumber,
        bytes32 blockHash,
        bytes32 depositRoot,
        uint256 stakingModuleId,
        uint256 nonce,
        bytes calldata depositCalldata,
        Signature[] calldata sortedGuardianSignatures
    )
```

#### Parameters

| Name                       | Type          | Description                                                                            |
| -------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `blockNumber`              | `uint256`     | Number of the current deposit block                                                    |
| `blockHash`                | `bytes32`     | Hash of the current deposit block                                                      |
| `depositRoot`              | `bytes32`     | Deposit root of the Ethereum DepositContract                                           |
| `stakingModuleId`          | `uint256`     | Id of the staking module to deposit with                                               |
| `nonce`                    | `uint256`     | Nonce of key operations of the staking module                                          |
| `depositCalldata`          | `bytes`       | Staking module deposit calldata                                                        |
| `sortedGuardianSignatures` | `Signature[]` | Short ECDSA guardians signatures as defined in [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |
