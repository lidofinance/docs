# StakingRouter

- [Source code](https://github.com/lidofinance/core/blob/v3.1.0/contracts/0.8.25/sr/StakingRouter.sol)
- [Deployed contract](https://etherscan.io/address/0xFdDf38947aFB03C621C71b06C9C70bce73f12999)

StakingRouter is a registry of staking modules, each encapsulating a certain validator subset, e.g. curated staking module, community staking module. The contract allocates stake to modules, executes validator deposits and top-ups with ether pulled from [Lido](/contracts/lido), distributes protocol fees, and tracks per-module validator balances.

## What is StakingRouter?

StakingRouter is a top-level controller contract for staking modules. Each staking module is a contract that, in turn, manages its own subset of validators, e.g. the [Curated](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5) staking module is a set of Lido DAO-vetted node operators. Such modular design opens the opportunity for anyone to build a staking module and join the Lido staking platform, including permissionless community stakers, DVT-enabled validators or any other validator subset, technology or mechanics.

StakingRouter performs a number of functions, including:

- maintaining a registry of staking modules,
- allocating stake to modules,
- executing deposits and validator top-ups with ether pulled from [Lido](/contracts/lido),
- tracking per-module validator balances and exited validators, and
- distributing protocol fees.

## Module Management

### Registering a module

Modules are registered with StakingRouter through the Lido DAO voting process. To be considered by the governance, the applying module contract should implement the appropriate module interface, meet security requirements, and have a fee structure aligned with the Lido protocol sustainability. Once voted in, the module starts receiving stake and protocol fees.

Staking modules are registered using the `addStakingModule` function, providing a human-readable module name, the address of the deployed staking module contract, and a `StakingModuleConfig` struct with the module parameters:

- stake share limit, a relative hard cap on deposits within Lido;
- priority exit share threshold, the module's share upon crossing which validator exits from the module are prioritized;
- module fee, a percentage of staking rewards to be awarded to the module;
- treasury fee, a percentage of staking rewards to be directed to the protocol treasury;
- maximum deposits per block and minimum deposit block distance, deposit rate limits;
- withdrawal credentials type, either `0x01` or `0x02`.

### Withdrawal credential types

Each staking module is permanently configured with a withdrawal credentials type:

- `0x01` — modules whose validators have a maximum effective balance of 32 ETH (`MAX_EFFECTIVE_BALANCE_WC_TYPE_01`);
- `0x02` — modules whose validators use [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) compounding withdrawal credentials with a maximum effective balance of 2048 ETH (`MAX_EFFECTIVE_BALANCE_WC_TYPE_02`) and support [validator top-ups](#top-ups).

The router stores a single protocol-wide withdrawal credentials value that contains the withdrawal address. The effective withdrawal credentials of a particular module are derived by applying the module's type prefix (`0x01` or `0x02`) to that value and can be read via [`getStakingModuleWithdrawalCredentials`](#getstakingmodulewithdrawalcredentials).

### Pausing modules

Each staking module has a status: a state that determines whether the module can perform deposits and receive rewards:

- `Active`, can make deposits and receives rewards,
- `DepositsPaused`, deposits are not allowed but receives rewards,
- `Stopped`, cannot make deposits and does not receive rewards.

```solidity
enum StakingModuleStatus {
	Active, // deposits and rewards allowed
	DepositsPaused, // deposits NOT allowed, rewards allowed
	Stopped // deposits and rewards NOT allowed
}
```

### Exited validators

When the withdrawal requests demand exceed buffered ether sitting in Lido together with projected rewards, the protocol signals to node operators to start exiting validators to cover the withdrawals. In this connection, StakingRouter distinguishes two types of validator states:

- [exited](https://hackmd.io/zHYFZr4eRGm3Ju9_vkcSgQ?view) validators,
- and late validators, meaning those validators which were requested to exit that failed to exit in a specified timeframe.

The StakingRouter tracks exited validators for correct stake allocation and notifies Staking Modules about late validators, enabling penalization actions if needed.

## Stake allocation

StakingRouter carries out a vital task of distributing depositable ether to staking modules in a manner that aligns with their growth targets set by the DAO. This design ensures a regulated and controlled growth for the modules that have been newly integrated into the system. The principles governing this methodology are comprehensively discussed in [ADR: Staking Router](https://hackmd.io/f1wvHzpjTIq41-GCrdaMjw?view#Target-shares).

### Deposit

The deposit workflow involves submitting batches of 32 ether deposits, along with associated validator keys, to [`DepositContract`](https://ethereum.org/en/staking/deposit-contract/) in one transaction. Given that each staking module handles its own deposits, every batch deposit is restricted to keys originating from a single module.

The deposit operation is, at its core, a sequence of contract calls sparked by an off-chain software, the [depositor bot](https://github.com/lidofinance/depositor-bot). This bot gathers guardian messages to confirm that there are no pre-existing keys in the registry that could take advantage of the [frontrunning vulnerability](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). Once the necessary quorum of guardians is reached, the bot forwards these messages along with the module identifier to the [DepositSecurityModule](/contracts/deposit-security-module) (not to be confused with a staking module). This contract verifies the messages and calls the `deposit` function on StakingRouter.

Deposits follow the pull model: buffered ether stays on the [Lido](/contracts/lido) contract until the moment of the deposit, and StakingRouter pulls exactly the amount it is about to deposit. The `deposit` function:

1. verifies that the caller is the DepositSecurityModule and that the staking module is active;
2. determines how much of Lido's depositable ether (`Lido.getDepositableEther()`) can be allocated to the module according to the [allocation algorithm](#allocation-algorithm), and derives the maximum number of deposits as the allocation divided by 32 ether, additionally capped by the module's `maxDepositsPerBlock`;
3. obtains deposit data (public keys and signatures) from the staking module contract via `obtainDepositData`; the module may return fewer keys than requested;
4. records the current timestamp and block number as the module's last deposit state (this happens even if the module returned zero keys);
5. pulls `number of obtained keys × 32 ether` from Lido via [`Lido.withdrawDepositableEther()`](/contracts/lido#withdrawdepositableether), which sends the ether back to the router's [`receiveDepositableEther`](#receivedepositableether) within the same call;
6. performs a 32 ether deposit to `DepositContract` for each key, using the module's withdrawal credentials (the module's `0x01` or `0x02` type prefix applied to the protocol-wide withdrawal credentials);
7. confirms that all pulled ether has been deposited by comparing the contract's ether balance before and after the deposits.

Direct ether transfers to StakingRouter are rejected: the `receive()` function reverts with the `DirectETHTransfer` error. Ether can enter the contract only through `receiveDepositableEther` as part of a deposit or top-up transaction.

### Top-ups

Validators of `0x02` modules can hold an effective balance of up to 2048 ETH. Beyond the initial 32 ether deposit that activates a validator, additional stake reaches these validators via top-ups: the depositor bot calls [`TopUpGateway`](/contracts/top-up-gateway), which verifies each validator's Consensus Layer state with Merkle proofs, computes per-key top-up limits, and calls the router's `topUp` function.

The `topUp` function:

1. verifies that the caller is the [TopUpGateway](/contracts/top-up-gateway), that the staking module is active, and that its withdrawal credentials type is `0x02`;
2. determines the module's top-up allocation according to the [allocation algorithm](#allocation-algorithm), capped by the global per-block top-up limit ([`getMaxTopUpPerBlockGwei`](#getmaxtopupperblockgwei)) and rounded down to a whole gwei;
3. calls `allocateDeposits` on the staking module, which validates that the supplied keys belong to the module and returns the exact deposit amount for each key; each amount must be gwei-aligned and within its per-key limit, and the total must not exceed the module allocation;
4. pulls the total amount from Lido via [`Lido.withdrawDepositableEther()`](/contracts/lido#withdrawdepositableether);
5. executes a top-up deposit to `DepositContract` for each key with a non-zero amount;
6. confirms that all pulled ether has been deposited by comparing the contract's ether balance before and after the top-ups.

If the module allocation rounds down to zero, the module is still called with a zero amount so that it can advance its internal deposit queue — but only if Lido deposits are enabled; otherwise the call reverts with `LidoDepositsPaused`.

### Allocation algorithm

StakingRouter distributes incoming ether across staking modules using the [`MinFirstAllocationStrategy`](https://github.com/lidofinance/core/blob/v3.1.0/contracts/common/lib/MinFirstAllocationStrategy.sol) algorithm: modules with proportionally less stake receive deposits first, gradually equalizing their sizes over time. The strategy operates in 32 ETH units (`MAX_EFFECTIVE_BALANCE_WC_TYPE_01`), so the amount allocated to each module is always a multiple of 32 ETH. The allocation is exposed via the [`getDepositAllocations`](#getdepositallocations) view and is computed as follows:

1. The ether amount to allocate is converted into 32 ETH units (`depositsToAllocate`).

2. The current allocation of each module is calculated in the same units:

   - for `0x01` modules, it is derived from on-chain accounting as the number of active validators (each holding 32 ETH): `currentAllocation = depositedValidators - max(moduleReportedExited, stakingRouterTrackedExited)`;
   - for `0x02` modules, the router queries the module directly via `getTotalModuleStake()` to obtain the actual total ether staked in the module and converts it into 32 ETH units, rounded up: `currentAllocation = ceil(getTotalModuleStake() / 32 ETH)`.

3. A `capacities` array is built, where each entry represents the maximum allocation a module can reach. For an active module, the capacity is the minimum of two constraints — the module's stake share limit and its available room:

   - for initial (seed) deposits: `capacity = min(stakeShareLimit * totalUnits / TOTAL_BASIS_POINTS, currentAllocation + depositableValidatorsCount)`, where `totalUnits` is the sum of all current allocations plus `depositsToAllocate`;
   - for top-up allocations, a `0x02` module's capacity is measured by the effective balance headroom of its active validators rather than by available keys: `capacity = min(stakeShareLimit * totalUnits / TOTAL_BASIS_POINTS, activeValidatorsCount * maxEBType2 / maxEBType1)`; `0x01` modules keep their seed-deposit capacity to preserve the priority ordering between modules, but the top-up amounts computed for them are never used since `0x01` modules cannot receive top-ups.

   A module that is not in the `Active` status has its capacity set to the current allocation and receives nothing.

4. `MinFirstAllocationStrategy.allocate` is called with the current allocations, the capacities, and `depositsToAllocate`. It fills the modules with the least allocation first, until either the whole amount is distributed or all modules reach their capacity. The results are converted back to ether amounts.

## Fee distribution

The fee structure is set independently in each module. There are two components to the fee structure: the module fee and the treasury fee, both specified as percentages (basis points). For example, a 5% (500 basis points) module fee split between node operators in the module and a 5% (500 basis points) treasury fee sent to the treasury. The sum of the module fee and the treasury fee must be equal across all registered modules; this invariant is enforced on every fee update. Additionally, `StakingRouter` utilizes a precision factor of 100 \* 10^18 for fees that prevents arithmetic operations from truncating the fees of small modules.

The protocol fee is distributed between modules proportionally to their validator balances and the specified module fee:

```
moduleShare = moduleValidatorsBalance / totalModulesValidatorsBalance
```

where `moduleValidatorsBalance` is the module's CL validators balance (excluding pending deposits) reported by the [AccountingOracle](/contracts/accounting-oracle) and stored on the router (see [Validator balance accounting](#validator-balance-accounting)). For example, a module holding 75% of the total validator balance in the protocol and having a 5% module fee will receive 3.75% of the total rewards across the protocol. A module with a single 2048 ETH validator receives the share of rewards corresponding to its contribution to the total stake, regardless of its validator count. This means that if the modules' fee and treasury fee do not exceed 10%, the total protocol fee will not either, no matter how many modules there are. There is also an edge case where the module is stopped for emergency while its validators are still active. In this case the module fee will be transferred to the treasury and once the module is back online, the rewards will be returned back to the module from the treasury.

The distribution function itself works as follows:

1. The function reads the total validator balance across all registered modules. If there are no staking modules or the total balance is zero, it returns an empty response.

2. Otherwise, it initializes arrays to store the module IDs (`stakingModuleIds`), the addresses of reward recipients (`recipients`), and the fees of each recipient (`stakingModuleFees`). It also sets the `precisionPoints` to a constant `FEE_PRECISION_POINTS`, which represents the base precision number that constitutes 100% fee.

3. Then it loops through each staking module, skipping modules with a zero validator balance. For each remaining module, it:

   - Stores the module ID and recipient address in the respective arrays.
   - Calculates the module's share as its validator balance divided by the total validator balance across all modules (scaled by `FEE_PRECISION_POINTS`).
   - Calculates the `stakingModuleFee` as the product of the module's share and the fee of the staking module divided by `TOTAL_BASIS_POINTS`. If the module is not stopped, this fee is stored in the `stakingModuleFees` array.
   - Adds to `totalFee` the sum of the staking module's fee and a fee going to the treasury (calculated similarly to `stakingModuleFee`), where the treasury is a central pool of funds.

4. After looping through all modules, it makes an assertion that `totalFee` doesn't exceed 100% (represented by `precisionPoints`).

5. If there are staking modules with a zero validator balance, it shrinks the `stakingModuleIds`, `recipients`, and `stakingModuleFees` arrays to exclude those modules.

Finally, the function returns five arrays/values: `recipients`, `stakingModuleIds`, `stakingModuleFees`, `totalFee`, and `precisionPoints`. These give the caller an overview of how rewards are distributed amongst the staking modules.

## Validator balance accounting

StakingRouter tracks the total balance of active validators for each module (`validatorsBalanceGwei`) and the aggregate balance across all modules. These balances are the basis for [fee distribution](#fee-distribution).

The balances are delivered by the [AccountingOracle](/contracts/accounting-oracle) as part of the main report phase via [`reportValidatorBalancesByStakingModule`](#reportvalidatorbalancesbystakingmodule). The report must include all registered staking modules in their registration order, with each value being the sum of the module's validator balances (excluding pending deposits), nominated in gwei. The view counterpart [`validateReportValidatorBalancesByStakingModule`](#validatereportvalidatorbalancesbystakingmodule) allows pre-validating a report against the current module set without mutating state.

The stored balances are readable via [`getModuleValidatorsBalance`](#getmodulevalidatorsbalance), [`getTotalModulesValidatorsBalance`](#gettotalmodulesvalidatorsbalance), and [`getStakingModuleStateAccounting`](#getstakingmodulestateaccounting).

## Helpful links

- [Staking Router ADR](https://hackmd.io/f1wvHzpjTIq41-GCrdaMjw?view)
- [Staking Router LIP](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-20.md)
- [LIP-35: Staking Router v3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-35.md)
- Lido on Ethereum Validator Exits SNOP 3.0 ([IPFS](https://ipfs.io/ipfs/QmW9kE61zC61PcuikCQRwn82aoTCj9yPuENGNPML9QLkSM), [GitHub](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md))

## View methods

### `getStakingModules`

Returns the list of structs of all registered staking modules. Each staking module has an associated data structure,

```solidity
struct StakingModule {
	uint24 id;
	address stakingModuleAddress;
	uint16 stakingModuleFee;
	uint16 treasuryFee;
	uint16 stakeShareLimit;
	uint8 status;
	string name;
	uint64 lastDepositAt;
	uint256 lastDepositBlock;
	uint256 exitedValidatorsCount;
	uint16 priorityExitShareThreshold;
	uint64 maxDepositsPerBlock;
	uint64 minDepositBlockDistance;
	uint8 withdrawalCredentialsType;
	uint64 validatorsBalanceGwei;
}
```

```solidity
function getStakingModules() external view returns (StakingModule[] memory res);
```

**Returns:**

| Name  | Type              | Description                                       |
| ----- | ----------------- | ------------------------------------------------- |
| `res` | `StakingModule[]` | list of structs of all registered staking modules |

### `getStakingModuleIds`

Returns the list of ids of all registered staking modules.

```solidity
function getStakingModuleIds() external view returns (uint256[] memory stakingModuleIds);
```

**Returns:**

| Name               | Type        | Description                       |
| ------------------ | ----------- | --------------------------------- |
| `stakingModuleIds` | `uint256[]` | list of id of all staking modules |

### `getStakingModule`

Returns the struct of the specified staking module by its id.

```solidity
function getStakingModule(uint256 _stakingModuleId) external view returns (StakingModule memory);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type            | Description                |
| ---- | --------------- | -------------------------- |
|      | `StakingModule` | staking module information |

### `getStakingModulesCount`

Returns the number of registered staking modules.

```solidity
function getStakingModulesCount() external view returns (uint256);
```

### `hasStakingModule`

Return a boolean value indicating whether a staking module with the specified id is registered.

```solidity
function hasStakingModule(uint256 _stakingModuleId) public view returns (bool);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

### `getStakingModuleStatus`

Return the status of the staking module.

```solidity
function getStakingModuleStatus(uint256 _stakingModuleId) public view returns (StakingModuleStatus);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type                  | Description                  |
| ---- | --------------------- | ---------------------------- |
|      | `StakingModuleStatus` | status of the staking module |

### `getStakingModuleStateConfig`

Returns the configuration part of the staking module state: the module address, fees, share limits, status, and withdrawal credentials type.

```solidity
struct ModuleStateConfig {
	address moduleAddress;
	uint16 moduleFee;
	uint16 treasuryFee;
	uint16 stakeShareLimit;
	uint16 priorityExitShareThreshold;
	StakingModuleStatus status;
	uint8 withdrawalCredentialsType;
}
```

```solidity
function getStakingModuleStateConfig(uint256 _stakingModuleId) external view returns (ModuleStateConfig memory stateConfig);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name          | Type                | Description                                 |
| ------------- | ------------------- | ------------------------------------------- |
| `stateConfig` | `ModuleStateConfig` | configuration part of the module state      |

### `getStakingModuleStateDeposits`

Returns the deposit-related part of the staking module state: the last deposit timestamp and block, the maximum number of deposits per block, and the minimum deposit block distance.

```solidity
struct ModuleStateDeposits {
	uint64 lastDepositAt;
	uint64 lastDepositBlock;
	uint64 maxDepositsPerBlock;
	uint64 minDepositBlockDistance;
}
```

```solidity
function getStakingModuleStateDeposits(uint256 _stakingModuleId) external view returns (ModuleStateDeposits memory stateDeposits);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name            | Type                  | Description                              |
| --------------- | --------------------- | ---------------------------------------- |
| `stateDeposits` | `ModuleStateDeposits` | deposit-related part of the module state |

### `getStakingModuleStateAccounting`

Returns the accounting part of the staking module state: the total balance of the module's active validators (in gwei) and the total exited validators count tracked by StakingRouter for the module.

```solidity
function getStakingModuleStateAccounting(uint256 _stakingModuleId) external view returns (uint64 validatorsBalanceGwei, uint64 exitedValidatorsCount);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name                    | Type     | Description                                                     |
| ----------------------- | -------- | --------------------------------------------------------------- |
| `validatorsBalanceGwei` | `uint64` | total balance of the module's active validators, in gwei        |
| `exitedValidatorsCount` | `uint64` | total exited validators count tracked by the router for the module |

### `getStakingModuleSummary`

Returns the struct containing a short summary of validators in the specified staking module, as shown below,

```solidity
struct StakingModuleSummary {
	uint256 totalExitedValidators;
	uint256 totalDepositedValidators;
	uint256 depositableValidatorsCount;
}
```

```solidity
function getStakingModuleSummary(uint256 _stakingModuleId) external view returns (StakingModuleSummary memory summary);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type                   | Description                                |
| ---- | ---------------------- | ------------------------------------------ |
|      | `StakingModuleSummary` | summary of the staking module's validators |

### `getNodeOperatorSummary`

Returns the summary of a node operator from the staking module, as shown below,

```solidity
struct NodeOperatorSummary {
	uint256 targetLimitMode;
	uint256 targetValidatorsCount;
	uint256 stuckValidatorsCount; // DEPRECATED: always zero, kept for backward compatibility
	uint256 refundedValidatorsCount; // DEPRECATED: always zero, kept for backward compatibility
	uint256 stuckPenaltyEndTimestamp; // DEPRECATED: always zero, kept for backward compatibility
	uint256 totalExitedValidators;
	uint256 totalDepositedValidators;
	uint256 depositableValidatorsCount;
}
```

```solidity
function getNodeOperatorSummary(
	uint256 _stakingModuleId,
	uint256 _nodeOperatorId
) external view returns (NodeOperatorSummary memory summary);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |
| `_nodeOperatorId`  | `uint256` | node operator id  |

**Returns:**

| Name | Type                  | Description                  |
| ---- | --------------------- | ---------------------------- |
|      | `NodeOperatorSummary` | summary of the node operator |

### `getAllStakingModuleDigests`

Returns the digests of all staking modules, as show below,

```solidity
struct StakingModuleDigest {
	uint256 nodeOperatorsCount;
	uint256 activeNodeOperatorsCount;
	StakingModule state;
	StakingModuleSummary summary;
}
```

```solidity
function getAllStakingModuleDigests() external view returns (StakingModuleDigest[]);
```

**Returns:**

| Name | Type                    | Description                     |
| ---- | ----------------------- | ------------------------------- |
|      | `StakingModuleDigest[]` | array of staking module digests |

### `getStakingModuleDigests`

Returns the digest of the specified staking modules.

```solidity
function getStakingModuleDigests(uint256[] memory _stakingModuleIds) public view returns (StakingModuleDigest[]);
```

**Parameters:**

| Name                | Type        | Description                 |
| ------------------- | ----------- | --------------------------- |
| `_stakingModuleIds` | `uint256[]` | array of staking module ids |

**Returns:**

| Name | Type                    | Description                     |
| ---- | ----------------------- | ------------------------------- |
|      | `StakingModuleDigest[]` | array of staking module digests |

### `getAllNodeOperatorDigests`

Returns the digests of all node operators in the specified staking module,

```solidity
struct NodeOperatorDigest {
	uint256 id;
	bool isActive;
	NodeOperatorSummary summary;
}
```

```solidity
function getAllNodeOperatorDigests(uint256 _stakingModuleId) external view returns (NodeOperatorDigest[]);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type                   | Description                    |
| ---- | ---------------------- | ------------------------------ |
|      | `NodeOperatorDigest[]` | array of node operator digests |

### `getNodeOperatorDigests`

Returns the digests for the specified node operators in the staking module.

```solidity
function getNodeOperatorDigests(uint256 _stakingModuleId, uint256[] memory _nodeOperatorIds) public view returns (NodeOperatorDigest[]);
```

**Parameters:**

| Name               | Type        | Description                |
| ------------------ | ----------- | -------------------------- |
| `_stakingModuleId` | `uint256`   | staking module id          |
| `_nodeOperatorIds` | `uint256[]` | array of node operator ids |

**Returns:**

| Name | Type                   | Description                    |
| ---- | ---------------------- | ------------------------------ |
|      | `NodeOperatorDigest[]` | array of node operator digests |

### `getStakingModuleIsStopped`

Return a boolean value whether the staking module is stopped.

```solidity
function getStakingModuleIsStopped(uint256 _stakingModuleId) external view returns (bool);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type   | Description                                            |
| ---- | ------ | ------------------------------------------------------ |
|      | `bool` | true if the staking module is stopped, false otherwise |

### `getStakingModuleIsDepositsPaused`

Return a boolean value whether deposits are paused for the staking module.

```solidity
function getStakingModuleIsDepositsPaused(uint256 _stakingModuleId) external view returns (bool);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type   | Description                                                         |
| ---- | ------ | ------------------------------------------------------------------- |
|      | `bool` | true if deposits are paused for the staking module, false otherwise |

### `getStakingModuleIsActive`

Return a boolean value whether the staking module is active.

```solidity
function getStakingModuleIsActive(uint256 _stakingModuleId) external view returns (bool);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type   | Description                                           |
| ---- | ------ | ----------------------------------------------------- |
|      | `bool` | true if the staking module is active, false otherwise |

### `getStakingModuleNonce`

Get the nonce of a staking module.

```solidity
function getStakingModuleNonce(uint256 _stakingModuleId) external view returns (uint256);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                 |
| ---- | --------- | --------------------------- |
|      | `uint256` | nonce of the staking module |

### `getStakingModuleLastDepositBlock`

Get the block number of the last deposit to the staking module.

```solidity
function getStakingModuleLastDepositBlock(uint256 _stakingModuleId) external view returns (uint256);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                      |
| ---- | --------- | -------------------------------- |
|      | `uint256` | block number of the last deposit |

### `getStakingModuleMinDepositBlockDistance`

Get the min deposit block distance for the staking module

```solidity
function getStakingModuleMinDepositBlockDistance(uint256 _stakingModuleId) external view returns (uint256);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                                       |
| ---- | --------- | ------------------------------------------------- |
|      | `uint256` | min deposit block distance for the staking module |

### `getStakingModuleMaxDepositsPerBlock`

Get the max deposits count per block for the staking module

```solidity
function getStakingModuleMaxDepositsPerBlock(uint256 _stakingModuleId) external view returns (uint256);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                                         |
| ---- | --------- | --------------------------------------------------- |
|      | `uint256` | Max deposits count per block for the staking module |

### `getStakingModuleActiveValidatorsCount`

Returns the number of active validators in the staking module.

```solidity
function getStakingModuleActiveValidatorsCount(uint256 _stakingModuleId) external view returns (uint256 activeValidatorsCount);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                 |
| ---- | --------- | --------------------------- |
|      | `uint256` | number of active validators |

### `getModuleValidatorsBalance`

Returns the total balance of the staking module's active validators used for [fee distribution](#fee-distribution), in wei. See [Validator balance accounting](#validator-balance-accounting).

```solidity
function getModuleValidatorsBalance(uint256 moduleId) external view returns (uint256);
```

**Parameters:**

| Name       | Type      | Description       |
| ---------- | --------- | ----------------- |
| `moduleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                                              |
| ---- | --------- | -------------------------------------------------------- |
|      | `uint256` | total balance of the module's active validators, in wei |

### `getTotalModulesValidatorsBalance`

Returns the sum of active validators balances across all registered staking modules, in wei.

```solidity
function getTotalModulesValidatorsBalance() external view returns (uint256);
```

**Returns:**

| Name | Type      | Description                                             |
| ---- | --------- | ------------------------------------------------------- |
|      | `uint256` | total balance of validators across all modules, in wei |

### `getStakingModuleMaxDepositsCount`

Calculates the maximum number of deposits a staking module can handle based on the available deposit value: the module's [allocation](#allocation-algorithm) for that amount divided by 32 ether.

```solidity
function getStakingModuleMaxDepositsCount(
	uint256 _stakingModuleId,
	uint256 _maxDepositsValue
) public view returns (uint256);
```

**Parameters:**

| Name                | Type      | Description                                             |
| ------------------- | --------- | ------------------------------------------------------- |
| `_stakingModuleId`  | `uint256` | staking module id                                       |
| `_maxDepositsValue` | `uint256` | maximum amount of deposits based on the available ether |

**Returns:**

| Name | Type      | Description                                                                |
| ---- | --------- | -------------------------------------------------------------------------- |
|      | `uint256` | maximum number of deposits that can be made using the given staking module |

### `getStakingFeeAggregateDistribution`

Returns the total fee distribution proportion.

```solidity
function getStakingFeeAggregateDistribution() public view returns (
	uint96 modulesFee,
	uint96 treasuryFee,
	uint256 basePrecision
);
```

**Returns:**

| Name            | Type      | Description                                                  |
| --------------- | --------- | ------------------------------------------------------------ |
| `modulesFee`    | `uint96`  | total fees for all staking modules                           |
| `treasuryFee`   | `uint96`  | total fee for the treasury                                   |
| `basePrecision` | `uint256` | base precision number, a value corresponding to the full fee |

### `getStakingRewardsDistribution`

Get the shares table.

```solidity
function getStakingRewardsDistribution() public view returns (
	address[] memory recipients,
	uint256[] memory stakingModuleIds,
	uint96[] memory stakingModuleFees,
	uint96 totalFee,
	uint256 precisionPoints
);
```

**Returns:**

| Name                | Type        | Description                                                  |
| ------------------- | ----------- | ------------------------------------------------------------ |
| `recipients`        | `address[]` | total staking module addresses                               |
| `stakingModuleIds`  | `uint256[]` | staking module ids                                           |
| `stakingModuleFees` | `uint96[]`  | staking module fees                                          |
| `totalFee`          | `uint96`    | total fee                                                    |
| `precisionPoints`   | `uint256`   | base precision number, a value corresponding to the full fee |

### `getDepositAllocations`

Calculates the ether allocation between staking modules after the distribution of the `_depositAmount` amount using the [allocation algorithm](#allocation-algorithm). With `_isTopUp` set to `true`, calculates the [top-up](#top-ups) allocation; with `false`, the initial-deposit allocation.

```solidity
function getDepositAllocations(uint256 _depositAmount, bool _isTopUp) public view returns (
	uint256 totalAllocated, uint256[] memory allocated, uint256[] memory newAllocations
);
```

**Parameters:**

| Name             | Type      | Description                                                                   |
| ---------------- | --------- | ----------------------------------------------------------------------------- |
| `_depositAmount` | `uint256` | maximum ether amount of deposits to be allocated between staking modules      |
| `_isTopUp`       | `bool`    | whether the allocation is requested for top-ups (true) or initial deposits (false) |

**Returns:**

| Name             | Type        | Description                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| `totalAllocated` | `uint256`   | ether amount actually allocated                      |
| `allocated`      | `uint256[]` | array of newly allocated ether amounts per module    |
| `newAllocations` | `uint256[]` | array of resulting allocation amounts per module     |

### `getWithdrawalCredentials`

Get the protocol-wide withdrawal credentials containing the withdrawal address. The per-module credentials are derived from this value by applying the module's type prefix; see [`getStakingModuleWithdrawalCredentials`](#getstakingmodulewithdrawalcredentials).

```solidity
function getWithdrawalCredentials() public view returns (bytes32);
```

**Returns:**

| Name | Type      | Description            |
| ---- | --------- | ---------------------- |
|      | `bytes32` | withdrawal credentials |

### `getStakingModuleWithdrawalCredentials`

Get the withdrawal credentials of the staking module: the protocol-wide withdrawal credentials with the module's type prefix applied — `0x01...` for `0x01` modules, `0x02...` for `0x02` modules.

```solidity
function getStakingModuleWithdrawalCredentials(uint256 _stakingModuleId) external view returns (bytes32);
```

**Parameters:**

| Name               | Type      | Description       |
| ------------------ | --------- | ----------------- |
| `_stakingModuleId` | `uint256` | staking module id |

**Returns:**

| Name | Type      | Description                                  |
| ---- | --------- | -------------------------------------------- |
|      | `bytes32` | withdrawal credentials of the staking module |

### `getMaxTopUpPerBlockGwei`

Returns the global per-block limit for [validator top-ups](#top-ups), in gwei.

```solidity
function getMaxTopUpPerBlockGwei() external view returns (uint64);
```

**Returns:**

| Name | Type     | Description                        |
| ---- | -------- | ---------------------------------- |
|      | `uint64` | per-block top-up limit, in gwei    |

### `validateReportValidatorBalancesByStakingModule`

Validates a validator balances report against the current staking module set: the arrays must cover all registered staking modules in their registration order, and each balance value must not exceed the sanity limit. The view counterpart of [`reportValidatorBalancesByStakingModule`](#reportvalidatorbalancesbystakingmodule) used to pre-validate report data without mutating state.

```solidity
function validateReportValidatorBalancesByStakingModule(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _validatorBalancesGwei
) external view;
```

**Parameters:**

| Name                     | Type        | Description                                                                    |
| ------------------------ | ----------- | ------------------------------------------------------------------------------ |
| `_stakingModuleIds`      | `uint256[]` | ids of all registered staking modules in their registration order              |
| `_validatorBalancesGwei` | `uint256[]` | validator balances for the specified staking modules, in gwei                  |

### `getContractVersion`

Returns the current initialized version of the contract.

```solidity
function getContractVersion() external view returns (uint256);
```

**Returns:**

| Name | Type      | Description                                 |
| ---- | --------- | ------------------------------------------- |
|      | `uint256` | current initialized version of the contract |

## Write methods

### `deposit`

Invokes a batch of 32 ether deposit calls to the official [`DepositContract`](https://ethereum.org/en/staking/deposit-contract/) using the keys of the specified staking module. The router calculates the module [allocation](#allocation-algorithm), obtains deposit data from the module, pulls the required ether from [Lido](/contracts/lido) via [`Lido.withdrawDepositableEther()`](/contracts/lido#withdrawdepositableether), and performs a 32 ether deposit for each key using the module's withdrawal credentials. See [Deposit](#deposit) for the detailed flow.

Can be called only by the [DepositSecurityModule](/contracts/deposit-security-module) contract.

```solidity
function deposit(uint256 _stakingModuleId, bytes calldata _depositCalldata) external;
```

**Parameters:**

| Name               | Type      | Description                            |
| ------------------ | --------- | -------------------------------------- |
| `_stakingModuleId` | `uint256` | id of the staking module to deposit to |
| `_depositCalldata` | `bytes`   | staking module calldata                |

### `topUp`

Performs top-up deposits to the official [`DepositContract`](https://ethereum.org/en/staking/deposit-contract/) for existing validators of a `0x02` staking module. The router determines how much ether can be deposited to the module, obtains the exact per-key amounts from the module via `allocateDeposits`, pulls the total ether from [Lido](/contracts/lido), and executes the top-ups. See [Top-ups](#top-ups) for the detailed flow.

Can be called only by the [TopUpGateway](/contracts/top-up-gateway) contract.

```solidity
function topUp(
	uint256 _stakingModuleId,
	uint256[] calldata _keyIndices,
	uint256[] calldata _operatorIds,
	bytes[] calldata _pubkeys,
	uint256[] calldata _topUpLimits
) external;
```

**Parameters:**

| Name               | Type        | Description                                                                              |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| `_stakingModuleId` | `uint256`   | id of the staking module to deposit to                                                   |
| `_keyIndices`      | `uint256[]` | list of keys' indices                                                                    |
| `_operatorIds`     | `uint256[]` | list of node operator ids                                                                |
| `_pubkeys`         | `bytes[]`   | list of validator public keys to top up                                                  |
| `_topUpLimits`     | `uint256[]` | maximum amount (in wei) that can be deposited per key based on CL data and TopUpGateway logic |

### `receiveDepositableEther`

A payable function for depositable ether acquisition: the single entry point for ether into the contract, invoked within [`Lido.withdrawDepositableEther()`](/contracts/lido#withdrawdepositableether) during [deposits](#deposit) and [top-ups](#top-ups). Any other direct ether transfer to StakingRouter reverts.

Can be called only by the [Lido](/contracts/lido) contract.

```solidity
function receiveDepositableEther() external payable;
```

### `addStakingModule`

Register a staking module. Restricted to the `STAKING_MODULE_MANAGE_ROLE` role.

```solidity
struct StakingModuleConfig {
	uint256 stakeShareLimit;
	uint256 priorityExitShareThreshold;
	uint256 stakingModuleFee;
	uint256 treasuryFee;
	uint256 maxDepositsPerBlock;
	uint256 minDepositBlockDistance;
	uint256 withdrawalCredentialsType;
}
```

```solidity
function addStakingModule(
	string calldata _name,
	address _stakingModuleAddress,
	StakingModuleConfig calldata _stakingModuleConfig
) external;
```

**Parameters:**

| Name                    | Type                  | Description                                                          |
| ----------------------- | --------------------- | -------------------------------------------------------------------- |
| `_name`                 | `string`              | human-readable name of the module                                    |
| `_stakingModuleAddress` | `address`             | address of the module contract                                       |
| `_stakingModuleConfig`  | `StakingModuleConfig` | staking module configuration                                         |

`StakingModuleConfig` fields:

| Name                         | Type      | Description                                                          |
| ---------------------------- | --------- | -------------------------------------------------------------------- |
| `stakeShareLimit`            | `uint256` | maximum share that can be allocated to a module, in basis points     |
| `priorityExitShareThreshold` | `uint256` | module's priority exit share threshold, in basis points              |
| `stakingModuleFee`           | `uint256` | fee of the staking module taken from the staking rewards, in basis points |
| `treasuryFee`                | `uint256` | treasury fee, in basis points                                        |
| `maxDepositsPerBlock`        | `uint256` | maximum number of validators that can be deposited in a single block |
| `minDepositBlockDistance`    | `uint256` | minimum distance between deposits in blocks                          |
| `withdrawalCredentialsType`  | `uint256` | withdrawal credentials type of the module (`0x01` or `0x02`)         |

### `updateStakingModule`

Update the parameters of a staking module. The withdrawal credentials type cannot be changed. Restricted to the `STAKING_MODULE_MANAGE_ROLE` role.

```solidity
function updateStakingModule(
	uint256 _stakingModuleId,
	uint256 _stakeShareLimit,
	uint256 _priorityExitShareThreshold,
	uint256 _stakingModuleFee,
	uint256 _treasuryFee,
	uint256 _maxDepositsPerBlock,
	uint256 _minDepositBlockDistance
) external;
```

**Parameters:**

| Name                          | Type      | Description                                                          |
| ----------------------------- | --------- | -------------------------------------------------------------------- |
| `_stakingModuleId`            | `uint256` | id of the module                                                     |
| `_stakeShareLimit`            | `uint256` | maximum share that can be allocated to a module                      |
| `_priorityExitShareThreshold` | `uint256` | Module's priority exit share threshold                               |
| `_stakingModuleFee`           | `uint256` | updated module fee                                                   |
| `_treasuryFee`                | `uint256` | updated module treasury fee                                          |
| `_maxDepositsPerBlock`        | `uint256` | maximum number of validators that can be deposited in a single block |
| `_minDepositBlockDistance`    | `uint256` | minimum distance between deposits in blocks                          |

### `updateAllStakingModulesFees`

Updates fees for all staking modules in a single atomic operation. The values must be provided in the module registration order (as returned by `getStakingModuleIds()`), and the sum `staking module fee + treasury fee` must be equal across all modules. Restricted to the `STAKING_MODULE_MANAGE_ROLE` role.

```solidity
function updateAllStakingModulesFees(
	uint256[] calldata _stakingModuleFees,
	uint256[] calldata _treasuryFees
) external;
```

**Parameters:**

| Name                 | Type        | Description                                                       |
| -------------------- | ----------- | ----------------------------------------------------------------- |
| `_stakingModuleFees` | `uint256[]` | new staking module fee values in the module registration order    |
| `_treasuryFees`      | `uint256[]` | new treasury fee values in the module registration order          |

### `updateModuleShares`

Updates the share-related parameters of a staking module. Restricted to the `STAKING_MODULE_SHARE_MANAGE_ROLE` role, which allows for granular permissions on share management separate from the full module management.

```solidity
function updateModuleShares(
	uint256 _stakingModuleId,
	uint16 _stakeShareLimit,
	uint16 _priorityExitShareThreshold
) external;
```

**Parameters:**

| Name                          | Type      | Description                                     |
| ----------------------------- | --------- | ------------------------------------------------ |
| `_stakingModuleId`            | `uint256` | id of the module                                 |
| `_stakeShareLimit`            | `uint16`  | new stake share limit value, in basis points     |
| `_priorityExitShareThreshold` | `uint16`  | new priority exit share threshold, in basis points |

### `setMaxTopUpPerBlockGwei`

Sets the global per-block limit for [validator top-ups](#top-ups), in gwei. The value must be greater than zero and fit into `uint64`. Restricted to the `STAKING_MODULE_MANAGE_ROLE` role.

```solidity
function setMaxTopUpPerBlockGwei(uint256 _newValue) external;
```

**Parameters:**

| Name        | Type      | Description                        |
| ----------- | --------- | ---------------------------------- |
| `_newValue` | `uint256` | new per-block top-up limit, in gwei |

### `updateTargetValidatorsLimits`

Updates the limit of the validators that can be used for deposit. Restricted to the `STAKING_MODULE_MANAGE_ROLE` role.

```solidity
function updateTargetValidatorsLimits(
	uint256 _stakingModuleId,
	uint256 _nodeOperatorId,
	uint256 _targetLimitMode,
	uint256 _targetLimit
) external;
```

**Parameters:**

| Name               | Type      | Description                                             |
| ------------------ | --------- | ------------------------------------------------------- |
| `_stakingModuleId` | `uint256` | id of the module                                        |
| `_nodeOperatorId`  | `uint256` | id of the node operator                                 |
| `_targetLimitMode` | `uint256` | target limit mode (0 = disabled, 1 = soft, 2 = boosted) |
| `_targetLimit`     | `uint256` | target limit validators count of the node operator      |

### `reportRewardsMinted`

Reports the minted rewards to the staking modules with the specified ids. Restricted to the `REPORT_REWARDS_MINTED_ROLE` role.

```solidity
function reportRewardsMinted(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _totalShares
) external;
```

**Parameters:**

| Name                | Type        | Description                                      |
| ------------------- | ----------- | ------------------------------------------------ |
| `_stakingModuleIds` | `uint256[]` | list of the reported staking module ids          |
| `_totalShares`      | `uint256[]` | total shares minted to the given staking modules |

### `updateExitedValidatorsCountByStakingModule`

Update total numbers of exited validators for staking modules with the specified module ids. Called by the [AccountingOracle](/contracts/accounting-oracle); restricted to the `REPORT_EXITED_VALIDATORS_ROLE` role.

```solidity
function updateExitedValidatorsCountByStakingModule(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _exitedValidatorsCounts
) external returns (uint256);
```

**Parameters:**

| Name                      | Type        | Description                                                       |
| ------------------------- | ----------- | ----------------------------------------------------------------- |
| `_stakingModuleIds`       | `uint256[]` | list of the reported staking module ids                           |
| `_exitedValidatorsCounts` | `uint256[]` | new counts of exited validators for the specified staking modules |

**Returns:**

| Name | Type      | Description                                                                       |
| ---- | --------- | ---------------------------------------------------------------------------------- |
|      | `uint256` | total increase in the aggregate number of exited validators across the updated modules |

### `reportValidatorBalancesByStakingModule`

Stores per-module validator balances used for [fee distribution](#fee-distribution); see [Validator balance accounting](#validator-balance-accounting). The report must include all registered staking modules in their registration order; each value is the sum of the module's validator balances (excluding pending deposits), nominated in gwei. Called by the [AccountingOracle](/contracts/accounting-oracle) as part of the main report phase; restricted to the `REPORT_EXITED_VALIDATORS_ROLE` role.

```solidity
function reportValidatorBalancesByStakingModule(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _validatorBalancesGwei
) external;
```

**Parameters:**

| Name                     | Type        | Description                                                        |
| ------------------------ | ----------- | ------------------------------------------------------------------ |
| `_stakingModuleIds`      | `uint256[]` | ids of all registered staking modules in their registration order  |
| `_validatorBalancesGwei` | `uint256[]` | validator balances for the specified staking modules, in gwei      |

### `reportStakingModuleExitedValidatorsCountByNodeOperator`

Updates exited validators counts per node operator for the staking module with the specified id. Restricted to the `REPORT_EXITED_VALIDATORS_ROLE` role.

```solidity
function reportStakingModuleExitedValidatorsCountByNodeOperator(
	uint256 _stakingModuleId,
	bytes calldata _nodeOperatorIds,
	bytes calldata _exitedValidatorsCounts
) external;
```

**Parameters:**

| Name                      | Type      | Description                                                      |
| ------------------------- | --------- | ---------------------------------------------------------------- |
| `_stakingModuleId`        | `uint256` | staking module id                                                |
| `_nodeOperatorIds`        | `bytes`   | ids of the node operators                                        |
| `_exitedValidatorsCounts` | `bytes`   | new counts of exited validators for the specified node operators |

### `unsafeSetExitedValidatorsCount`

DEPRECATED. Sets exited validators count for the given module and given node operator in that module without performing critical safety checks, e.g. that exited validators count cannot decrease. Should only be used by the DAO in extreme cases and with sufficient precautions to correct invalid data reported by the oracle committee due to a bug in the oracle daemon. Restricted to the `UNSAFE_SET_EXITED_VALIDATORS_ROLE` role.

```solidity
function unsafeSetExitedValidatorsCount(
	uint256 _stakingModuleId,
	uint256 _nodeOperatorId,
	bool _triggerUpdateFinish,
	ValidatorsCountsCorrection calldata _correction
) external;
```

where `ValidatorsCountsCorrection` is a struct as seen below,

```solidity
struct ValidatorsCountsCorrection {
	/// @notice The expected current number of exited validators of the module that is
	/// being corrected.
	uint256 currentModuleExitedValidatorsCount;
	/// @notice The expected current number of exited validators of the node operator
	/// that is being corrected.
	uint256 currentNodeOperatorExitedValidatorsCount;
	/// @notice The corrected number of exited validators of the module.
	uint256 newModuleExitedValidatorsCount;
	/// @notice The corrected number of exited validators of the node operator.
	uint256 newNodeOperatorExitedValidatorsCount;
}
```

**Parameters:**

| Name                   | Type                         | Description                                                                                         |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `_stakingModuleId`     | `uint256`                    | staking module id                                                                                   |
| `_nodeOperatorId`      | `uint256`                    | id of the node operator                                                                             |
| `_triggerUpdateFinish` | `bool`                       | flag to call `onExitedAndStuckValidatorsCountsUpdated` on the module after applying the corrections |
| `_correction`          | `ValidatorsCountsCorrection` | correction details                                                                                  |

### `onValidatorsCountsByNodeOperatorReportingFinished`

Post-report hook called by the oracle when the second phase of data reporting finishes, i.e. when the oracle submitted the complete data on the exited validator counts per node operator for the current reporting frame. Restricted to the `REPORT_EXITED_VALIDATORS_ROLE` role.

```solidity
function onValidatorsCountsByNodeOperatorReportingFinished() external;
```

### `decreaseStakingModuleVettedKeysCountByNodeOperator`

Decreases vetted signing keys counts per node operator for the staking module with the specified id. Method is called by DSM during the unvetting process. Restricted to the `STAKING_MODULE_UNVETTING_ROLE` role.

```solidity
function decreaseStakingModuleVettedKeysCountByNodeOperator(
	uint256 _stakingModuleId,
	bytes calldata _nodeOperatorIds,
	bytes calldata _vettedSigningKeysCounts
) external;
```

**Parameters:**

| Name                       | Type      | Description                                                         |
| -------------------------- | --------- | ------------------------------------------------------------------- |
| `_stakingModuleId`         | `uint256` | staking module id                                                   |
| `_nodeOperatorIds`         | `bytes`   | ids of the node operators                                           |
| `_vettedSigningKeysCounts` | `bytes`   | new counts of vetted signing keys for the specified node operators. |

### `reportValidatorExitDelay`

Reports a validator that was requested to exit, but has not exited yet. The report is used to track potential exit‑delay penalties for the responsible node operator within the specified staking module.

Called by the designated verifier contract ([ValidatorExitDelayVerifier](/contracts/validator-exit-delay-verifier)) that verifies validator status on Consensus Layer. Restricted to the `REPORT_VALIDATOR_EXITING_STATUS_ROLE` role.

```solidity
function reportValidatorExitDelay(
    uint256 _stakingModuleId,
    uint256 _nodeOperatorId,
    uint256 _proofSlotTimestamp,
    bytes calldata _publicKey,
    uint256 _eligibleToExitInSec
) external;
```

Parameters:

| Name                   | Type      | Description                                                              |
| ---------------------- | --------- | ------------------------------------------------------------------------ |
| `_stakingModuleId`     | `uint256` | Staking module id                                                        |
| `_nodeOperatorId`      | `uint256` | Node operator id within the specified staking module                     |
| `_proofSlotTimestamp`  | `uint256` | Beacon slot timestamp used as a proof reference for the validator status |
| `_publicKey`           | `bytes`   | Validator BLS public key                                                 |
| `_eligibleToExitInSec` | `uint256` | How many seconds the validator has been eligible to exit up to the proof |

### `onValidatorExitTriggered`

Handles triggerable exit events for a set of validators, notifying the corresponding staking modules.

Called by the [Triggerable Withdrawals Gateway](/contracts/triggerable-withdrawals-gateway). Restricted to the `REPORT_VALIDATOR_EXIT_TRIGGERED_ROLE` role.

```solidity
struct ValidatorExitData {
    uint256 stakingModuleId;
    uint256 nodeOperatorId;
    bytes pubkey;
}
```

```solidity
function onValidatorExitTriggered(
    ValidatorExitData[] calldata validatorExitData,
    uint256 _withdrawalRequestPaidFee,
    uint256 _exitType
) external;
```

Parameters:

| Name                        | Type                  | Description                                                                                                     |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `validatorExitData`         | `ValidatorExitData[]` | array of validators for which a triggerable exit was requested (staking module id, node operator id, public key) |
| `_withdrawalRequestPaidFee` | `uint256`             | Fee paid to submit the withdrawal request on the Execution Layer                                                 |
| `_exitType`                 | `uint256`             | Exit trigger type code; may be interpreted differently across staking modules                                    |
