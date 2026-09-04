# Node Operators

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

![Staking module flow](/img/csm/join-csm-1.png)

## Node Operator creation

**In CMv2** an eligible address creates the Node Operator through the [`CuratedGate`](/staking-modules/contracts/CuratedGate) for its assigned operator type, providing a valid Merkle proof. Creation alone does not make the operator eligible for deposits as the Curated Module Committee must add it to an operator group and assign an allocation weight first.

**In CSM** entry is permissionless, through [`PermissionlessGate`](/staking-modules/contracts/PermissionlessGate), or through [`VettedGate`](/staking-modules/contracts/VettedGate) if the operator is part of ICS or IDVTC. The operator is created together with its first validator keys and bond in a single transaction.

### Node Operator structure

The Node Operator data structure is similar to that of the [Curated module](/contracts/node-operators-registry), with several minor differences:

- **In CMv2 the name and description are stored in [`MetaRegistry`](/staking-modules/contracts/MetaRegistry).** In CSM the `name` property is omitted as redundant for a permissionless module;
- The `rewardAddress` is used as a recipient of rewards and excess [bond](#bond) claims;
- A new property, `managerAddress`, is introduced. The Node Operator should perform method calls from this address;
- A new property, `extendedManagerPermissions`, is introduced. This option indicates whether the Node Operator's `managerAddress` has extended permissions to perform certain actions, such as changing the Node Operator's `rewardAddress`. This is useful for Node Operators utilizing a smart contract as a `rewardAddress`. **In CMv2 extended manager permissions are always enabled, so the manager is the Node Operator owner.**
- A new property, `totalWithdrawnKeys`, is introduced to count the total number of the withdrawn keys per Node Operator;
- A new property, `depositableValidatorsCount`, is introduced to count the current deposit data eligible for deposits;
- A new property, `enqueuedCount`, is introduced to keep track of the depositable keys that are in the queue. Also useful to determine depositable keys that are not in the queue at the moment;

## Deposit data preparation and upload

These modules accept deposit data in the same [format](/contracts/node-operators-registry#addsigningkeys) (`validator pubkey` + `deposit signature`) as the [Curated module](/contracts/node-operators-registry). The main difference is that the bond must be submitted prior to or alongside the deposit data upload.

[`deposit signature`](https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata) **must** sign the root of the `(deposit_message, domain)`. Where a `domain` is used to identify the chain, and `deposit_message` has the form of the following tuple:
- `validator pubkey`;
- `withdrawal_credentials` with the actual [`Lido Withdrawal Vault contract`](/contracts/withdrawal-vault) address. Should be retrieved from [Staking Router](/contracts/staking-router#getwithdrawalcredentials);
- `32 ETH amount`;

Each deployment serves a single withdrawal-credential type, so the credentials must match the module being joined: `0x01` for 0x01 CSM, `0x02` for 0x02 CSM and CMv2.

## Bond

:::info
Here and after, the term 'bond' has the following meaning:

**Bond** - a security collateral that Node Operators must submit before uploading validator keys into the module. This collateral covers possible losses caused by inappropriate actions on the Node Operator's side. Once the validator exits from the Beacon chain and all losses that occurred are covered, the collateral can be claimed or reused to upload new validator keys.
:::

A [bond](#bond) is a property of a Node Operator, not a validator. [Bond](#bond) is stored in the form of stETH. Node Operators can submit [bond](#bond) tokens in ETH, stETH, and wstETH. Provided ETH is staked, and wstETH is unwrapped during submission to ensure stETH is the only form of a [bond](#bond).

The amount of the [bond](#bond) required for each validator key to be uploaded and operated depends on the total number of Node Operator's validators and has the form of a curve. The curve is indexed by key count, not by the stake a validator holds, so a `0x02` validator that is topped up towards `2048 ETH` does not require additional bond.

![join-csm-2](/img/csm/join-csm-2.png)

There might be several [bond](#bond) curves. Typically a default curve is assigned to Node Operators upon creation. However, should Node Operator be eligible for a custom [Node Operator type](#node-operator-types), a custom curve can be set for the Node Operator.

![join-csm-3](/img/csm/join-csm-3.png)

Existing Node Operators can top-up [bond](#bond) without uploading deposit data to compensate for the penalties or to have [bond](#bond) tokens uploaded upfront.

### Unbonded validators
The term "unbonded" is introduced to refer to the validators for which the [bond](#bond) does not fully cover this validator. Taking into account the approach when the [bond](#bond) is common for all Node Operator's validators, unbonded validators can be determined in a way illustrated below. In the example, validator N+1 is unbonded.

![join-csm-4](/img/csm/join-csm-4.png)

:::info
Any unbonded validators are requested to exit. Unbonded but not deposited keys are excluded from the stake allocation queue.
:::

### Possible negative stETH rebase consequences
With the [bond](#bond) being stored in stETH, there is a risk of a reduction in the [bond](#bond) amount due to a negative stETH rebase. This might result in some Node Operators being unable to claim rewards (due to the actual [bond](#bond) being lower than required) or even validators becoming unbonded. This problem is described in detail in [Bond Mechanics in Lido ADR](https://hackmd.io/@lido/BJqWx7P0p). For this document, it is worth mentioning that no additional actions are required due to the low probability of the negative stETH rebase and a dedicated [reserve fund](/contracts/reserve) at the Lido DAO's disposal for possible use as cover.

## Deposit data validation and invalidation (aka vetting and unvetting)
These modules utilize an [optimistic vetting](https://hackmd.io/@lido/ryw2Qo5ia) approach. Uploaded deposit data will be treated as valid unless DSM reports it is not. In case of invalid deposit data detection, DSM reports it to the [Staking Router](/contracts/staking-router#decreasestakingmodulevettedkeyscountbynodeoperator), which calls `decreaseVettedSigningKeysCount` on the module ([`CuratedModule`](/staking-modules/contracts/CuratedModule#decreasevettedsigningkeyscount) or [`CSModule`](/staking-modules/contracts/CSModule#decreasevettedsigningkeyscount)) to set `vettedKeys` pointer to the deposit data prior to the first invalid deposit data. In this case a Node Operator should remove invalid keys to resume stake allocation to the valid non-deposited keys.

## Depositable keys
Several factors determine if the deposit can be made using corresponding deposit data. This information is reflected in the Node Operator's `depositableKeys` property. This property indicates the number of deposit data records extracted sequentially starting from the last deposited record available in the Node Operator's key storage for deposits by the staking router. This number is determined as follows:
- If `targetLimit` is not set => `depositableKeys = min(vettedKeys - depositedKeys, max(addedKeys - depositedKeys - unbondedKeys, 0))`
- If `targetLimit` is set => `depositableKeys = min(vettedKeys - depositedKeys, max(addedKeys - depositedKeys - unbondedKeys, 0), max(targetLimit - (depositedKeys - withdrawnKeys), 0))`

## Weighted stake allocation

:::info Applies to CMv2 only
CSM allocates stake through a queue instead. See [Stake allocation queue](#stake-allocation-queue) below.
:::

Rather than following the order in which keys were submitted, CMv2 distributes stake across Node Operators according to their allocation weights, aiming to keep each operator's share of the module close to its target. Weights are provided by the Meta Operators Registry, implemented by the [`MetaRegistry`](/staking-modules/contracts/MetaRegistry) contract, which arranges Node Operators into operator groups and stores their weights. It can also account for a group's stake held in external modules, such as the legacy Curated Module.

For every Node Operator, the strategy computes a `targetStake` (proportional to the operator's weight) and a `currentStake` (including any external stake). Operators are then sorted by their imbalance, that is, how far the current stake is below the target, and stake is allocated greedily, starting from the most imbalanced operator and moving on once its target is reached, its capacity is exhausted, or there is no more stake to allocate.

## Stake allocation queue

:::info Applies to CSM only
CMv2 does not use a queue. See [Weighted stake allocation](#weighted-stake-allocation) above.
:::

The stake allocation queue in CSM is a traditional [FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)) (first in, first out) queue. Node Operators occupy places in the queue with the `{noId, keysCount}` batches and wait for their turn.

In 0x02 CSM, this queue serves the initial `32 ETH` deposit. Top-ups after that are ordered by a separate [top-up queue](#top-up-queue).

![join-csm-5](/img/csm/join-csm-5.png)

Once the queue reaches the Node Operator's batch, the module checks how many keys from the batch can be deposited using the formula: `min(depositableKeys, keysInBatch)`.

![join-csm-6](/img/csm/join-csm-6.png)

A simple analogy can be used to understand the queue concept better. Imagine that there is a roller coaster with numbered tickets. Node Operators buy a bunch of tickets with the sequential numbers once they upload keys. When it is time for the next group to jump onto the roller coaster, the eligible ticket numbers are announced. Suppose Node Operators can not arrive on time (since they currently have no depositable keys) with the corresponding tickets. In that case, their tickets are invalidated, and the other Node Operators will be requested to join the roller coaster ride with the following tickets. All invalidated tickets should be repurchased once the keys are depositable.

A detailed description of the queue is provided in a separate [document](https://hackmd.io/@lido/ryw2Qo5ia).

### Priority queues

CSM v2 introduces the concept of priority queues. Depending on the [type](#node-operator-types), Node Operators can be eligible to get up to a certain number (`maxDeposits`) of the keys deposited via a priority queue defined by `queuePriority`. Both `queuePriority` and `maxDeposits` are defined per-node-operator-type.

![join-csm-7](/img/csm/join-csm-7.png)

Each priority queue operates in a FIFO manner as described above. The priority queues are processed in the order of their `queuePriority` value, with the lowest value being processed first.

More on the priority queues can be found in the [dedicated section of CSM v2 features](https://hackmd.io/@lido/csm-v2-tech#Priority-Queues) document.

## Top-up queue

:::info Applies to 0x02 CSM only
CMv2 validators also receive top-ups, but they are allocated by operator weight rather than through a queue.
:::

`0x02` validators are funded in two phases: an initial `32 ETH` deposit, followed by top-ups up to the `2048 ETH` maximum effective balance (`MAX_EB`). The initial `32 ETH` deposit is allocated exactly like any other deposit, through the [stake allocation queue](#stake-allocation-queue) (including [priority queues](#priority-queues)). The subsequent top-ups are ordered by a separate **top-up queue**.

Unlike the stake allocation queue, which stores `{noId, keysCount}` batches, the top-up queue stores individual `{noId, keyIndex}` items and is processed as a [FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)) queue. A key is appended to the top-up queue at the moment it receives its initial `32 ETH` deposit, so the order of the top-up queue mirrors the order in which the validators were initially deposited.

![join-csm-8](/img/csm/topup-queue.png)

The queue has a DAO-configured capacity limit (`topUpQueueLimit`). While the queue is at capacity, new initial `32 ETH` deposits are throttled (the depositable keys count is capped by the remaining capacity), so the number of validators awaiting top-ups stays bounded.

When the protocol tops up validators, it walks the queue strictly from the head. Each key is topped up in steps (multiples of `2 ETH`) toward its remaining room up to `2048 ETH`, bounded by the amount available in the current round. A key is dequeued once it has been fully topped up; a key that still has room remains at the head and is served again in a later round. Because processing is strictly ordered, keys cannot be topped up out of turn.

:::info
If a key is skipped or dequeued prematurely (for example, due to incorrect pending-deposit data reported by the depositor bot), a permissioned service method can rewind the queue head back to that key so it can be topped up correctly. Keys that were already fully topped up are skipped on reprocessing, since their remaining top-up room is zero.
:::

## Deposit data deletion

:::info Applies to CSM only
CMv2 does not charge for key removal.
:::

The Node Operator might delete uploaded deposit data voluntarily if it has not been deposited yet. The `keyRemovalCharge` is confiscated from the Node Operator's [bond](#bond) on each deleted key to cover the maximum possible operational costs associated with the queue processing. Deposit data can be deleted in continuous batches (ex., from index 5 to 10).

If the protocol has already deposited the validator related to the deposit data, the Node Operator cannot delete the deposit data. The only way to stop validation duties is to exit the validator on the CL. Once the validator is fully withdrawn, the Node Operator can claim the excess [bond](#bond).

## Node Operator Types

Node Operators can have different types, which define the Node Operator's properties. The type is set during Node Operator creation and can be changed later. The Node Operator type is defined by the bond curve assigned to the Node Operator.

The following parameters can be set for each Node Operator type:
- `keyRemovalCharge` - a fee charged for each deleted deposit data record;
- `generalDelayedPenaltyAdditionalFine` - an additional fine charged for each validator that has stolen EL rewards;
- `keysLimit` - a limit on the number of active keys for the Node Operator;
- `queuePriority` and `maxDeposits` - parameters defining the priority queue for the Node Operator;
- `rewardShareData` - the share of Node Operator rewards that the Node Operator receives for each validator. It can be customized depending on the key index in the Node Operator's key storage;
- `performanceLeewayData` - a leeway for the performance of the Node Operator's validators, which is used to define a performance threshold. It can be customized depending on the key index in the Node Operator's key storage;
- `strikesLifetime` and `strikesThreshold` - parameters defining the Node Operator's strikes system, which is used to decide whether to eject the Node Operator's validators due to systematic bad performance;
- `badPerformancePenalty` - a penalty charged for each validator that has been ejected due to bad performance;
- `performanceCoefficients` - coefficients used to calculate the Node Operator's performance based on the validators' effectiveness in performing duties such as attestations, block proposals, and sync committee participation;
- `allowedExitDelay` - the allowed delay between the time when a Node Operator's validator was requested to exit and when it initiates the exit process;
- `exitDelayFee` - a fee charged for each validator that has been requested to exit but has not exited within the allowed delay;
- `maxElWithdrawalRequestFee` - the maximum fee charged for each Node Operator validator that has been forcefully ejected using [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002);

The Lido DAO defines Node Operator types and associated parameters. The Lido DAO also defines Node Operators eligible for a certain type, either directly or via subcommittees granted the corresponding permissions. The Lido DAO can change the Node Operator type at any time, which will affect the Node Operator's properties and behavior.

For the values applied in each deployment, see the operator-facing parameter tables in the [CSM guide](/run-on-lido/csm/penalties#parameters-by-operator-profile) and the [CMv2 guide](/run-on-lido/cm-v2/node-operator-types).
