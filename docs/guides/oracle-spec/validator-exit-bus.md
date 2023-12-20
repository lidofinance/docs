# Validators Exit Bus

:::info
It's advised to read [What is Lido Oracle mechanism](/guides/oracle-operator-manual#intro) before
:::

[Validators Exit Bus](/contracts/validators-exit-bus-oracle) is an oracle that ejects Lido validators when the protocol requires additional funds to process user withdrawals.

A report calculation consists of 4 key steps:

1. Calculate withdrawals amount to cover with ether.
2. Calculate ether rewards prediction per epoch.
3. Calculate withdrawal epoch for next validator eligible for exit to cover withdrawal requests if needed
4. Prepare validators exit order queue
5. Go through the queue until the exited validators’ balances cover all withdrawal requests (considering the predicated final exited balance of each validator).

:::note
Placed exit requests via `ValidatorsExitBusOracle` should be processed timely according to the ratified [Lido on Ethereum Validator Exits Policy V1.0](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330).

See also the provided [penalties](./penalties.md) spec.
:::

## Next validator to exit algorithm

The algorithm for the validators exiting is based on [the algorithm described on the research forum](https://research.lido.fi/t/withdrawals-on-validator-exiting-order/3048#combined-approach-17).

The algorithm is supposed to correct the future number of validators for each Node Operator. Suppose the validators and deposits in-flight of one of the Node Operator are represented in the following form, where validators are sorted by their indexes:

![VEBO 1](../../../static/img/oracle-spec/vebo-1.png)

The algorithm assumes that the oldest validators are exited first. Therefore, previously requested validators can be separated to exit by knowing the index of the last requested.

![VEBO 2](../../../static/img/oracle-spec/vebo-2.png)

Worth noting, each validator has a status. Some validators may be slashed or be exited without an request from the protocol:

![VEBO 3](../../../static/img/oracle-spec/vebo-3.png)

Among all validators the projected ones are the point of interest. They include all active validators and in-flight deposits, but exclude validators whose `exit_epoch != FAR_FUTURE_EPOCH` and those validators that were requested to exit.

![VEBO 4](../../../static/img/oracle-spec/vebo-4.png)

A few hours later it might look like the following:
![VEBO 5](../../../static/img/oracle-spec/vebo-5.png)

Note that th described algorithm is looking for a validator to exit only among those that can be exited, while using the projected number of validators, which includes non-existent yet validators. It's only weights, so there is no misconception here.

The final exit order predicate sequence:

1. Validator whose operator with the lowest number of delayed validators
2. Validator whose operator with the highest number of targeted validators to exit
3. Validator whose operator with the highest stake weight
4. Validator whose operator with the highest number of validators
5. Validator with the lowest index

## Get information to prepare ordered queue

In order to prepare a queue of validators to exit, the following actions and considerations involved:

- the maximum number of validators that can be requested to exit in one report;
- operator network penetration percent - only if the operator's share is greater than 1%;
- 'exitable' Lido validators;
- fetch node operators stats to sort exitable validators;
- total predictable validators count;
- last requested validators indices.

### Report limits

- `maxValidatorExitRequestsPerReport` - max number of exit requests allowed in report to `ValidatorsExitBusOracle` from `OracleReportSanityChecker.getOracleReportLimits()`.
- `VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS` - A parameter from from `OracleDaemonConfig` contract used to calculate validators going to exit.
- `NODE_OPERATOR_NETWORK_PENETRATION_THRESHOLD_BP` - - A parameter from `OracleDaemonConfig` that is taken into account when determining the penetration of the operator into the network.

### Get exitable validators

A validator is 'exitable' if two conditions are strictly have NOT met:

- `validator.exit_epoch != FAR_FUTURE_EPOCH` and
- `validator.index <= last_requested_to_exit_index`.

### Node operator stats

Statistics for each node operator, which are needed for sorting their validators in exit order:

- validators count that are not yet in CL
- validators that are in CL and are not yet requested to exit and not on exit
- validators that are in CL and requested to exit but not on exit and not requested to exit recently
- target validators count
- checks whether the target limit flag is enabled

NB: A validator can not be considered as delayed if it was requested to exit in last `VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS` slots

#### Last requested validators indices

The [`ValidatorsExitBusOracle`](../../contracts/validators-exit-bus-oracle.md) contract stores the index of the last validator that was requested to exit. Since validators are requested in strict order from the lowest `validatorIndex` to the highest, the indexes help find all the previously requested validators without fetching all events.

Returns the latest validator indices that were requested to exit for the given
        `operator_indexes` in the given `module`. For node operators that were never requested to exit
        any validator yet, index is set to `-1`.

```
ValidatorsExitBusOracle.getLastRequestedValidatorIndices(
    uint256 moduleId,
    uint256[] nodeOpIds
): int256[]
```

### State collection

To find the next validators to exit, Validators Exit Bus Oracle collects the following state from both Ethereum Consensus and Execution layers.

- From [OracleDaemonConfig](/contracts/oracle-daemon-config) contract:
  - PREDICTION_DURATION_IN_SLOTS
  - VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS
- From [Withdrawal Queue](/contracts/withdrawal-queue-erc721):
  - Get total unfinalized withdrawal request amount
- From [Lido](/contracts/lido) contract:
  - Recent postCLBalance/preCLBalance and withdrawals from Execution Layer Rewards and Withdrawal vaults via events
- From Consensus Layer node:
  - All validators and their states on the reference slot
- From [Staking Router](/contracts/staking-router):
  - Public keys of all Lido validators
  - Indices of the last requested validator to exit for each Node Operator
  - Validator keys statistics for each Node Operator
- From Oracle contract:
  - Maximum number of exit requests for the current frame
  - Recently requested via Exit Bus public keys to exit

### Fetching data

#### Get uncovered withdrawal requests amount of stETH

Collects the amount of stETH in the queue yet to be finalized from `WithdrawalQueue.unfinalizedStETH()`

#### Calculate average rewards speed per epoch

Fetches `ETHDistributed` and `TokenRebased` events from the [`Lido`](../../contracts/lido) contract and calculate average rewards amount per epoch. The rewards prediction period config fetches from the [OracleDaemonConfig](/contracts/oracle-daemon-config) contract.

To get events in past, addressing the cases where there can be slots with missed block, the next scheme is introduced:

![VEBO 6](../../../static/img/oracle-spec/vebo-6.png)

- Get from [OracleDaemonConfig](/contracts/oracle-daemon-config) contract `PREDICTION_DURATION_IN_SLOTS` value
- Get `TokenRebased` events from Lido
- Get `ETHDistributed` events from Lido
- Group that events by transaction hash
- Collect from events:
  - `total_rewards` as `postCLBalance + withdrawalsWithdrawn - preCLBalance executionLayerRewardsWithdrawn`
  - `time_spent` as sum of each event `timeElapsed`
- calculate `rewards_speed_per_epoch` as `max(total_rewards * chain_configs.seconds_per_slot * chain_configs.slots_per_epoch // time_spent, 0)`

#### Calculate epochs to sweep

##### Average sweep prediction

Predicts the average epochs of the sweep cycle. In the spec: [get expected withdrawals](https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/beacon-chain.md#new-get_expected_withdrawals), [process withdrawals](https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/beacon-chain.md#new-process_withdrawals)

[source](https://github.com/lidofinance/lido-oracle/blob/master/src/modules/ejector/ejector.py#L301)

##### Withdrawable validators

- Check if `validator` has the 0x01 prefixed "eth1" withdrawal credentials, and
- Check if `validator` is partially withdrawable, or
- Check if `validator` is fully withdrawable

[source](https://github.com/lidofinance/lido-oracle/blob/master/src/modules/ejector/ejector.py#L306)

#### Predict available ether before next withdrawn

In order to estimate the amount is needed to fully cover the non-finalized withdraw requests, the following values are calculated

- **Future rewards**
- **Future withdrawals amount**
- **Total available balance**
- **Validators to eject cummulative amount**
- **Going to withdrawn balance**

To calculate **future rewards**, it's needed to [predict](https://github.com/lidofinance/lido-oracle/blob/master/src/modules/ejector/ejector.py#L244) an epoch when all validators in queue and `validators_to_eject` will be withdrawn:

1. Calculate latest exit epoch number and amount of validators that are exiting in this epoch
2. If queue is empty - exit epoch will be calculated as `current epoch + MAX_SEED_LOOK AHEAD + 1`. **MAX_SEED_LOOKAHEAD** constant needs to mitigate some attacks, more details [here](https://eth2book.info/bellatrix/part3/config/preset/#max_seed_lookahead)
3. Calculate **churn limit** - like a rate-limit on changes to the validator set. Minimum is 4 validators per epoch. And recalculates each `CHURN_LIMIT_QUOTIENT = 2**16`. For example when active validators reaches up to 327,680 amount, `churn limit` rises to 5, [spec](https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/beacon-chain.md#get_validator_churn_limit)
4. Calculate slots capacity for exit:

```!
remain_exits_capacity_for_epoch=churn_limit - (amount of validators that are exiting in this epoch)
```

5. Calculate epoch to exit all `validators_to_eject_count`:

```!
epochs_required_to_exit_validators = (validators_to_eject_count - remain_exits_capacity_for_epoch) // churn_limit + 1
```

6. So the predictable withdrawable epoch:

```!
withdrawal_epoch=max_exit_epoch_number + epochs_required_to_exit_validators + MIN_VALIDATOR_WITHDRAWABILITY_DELAY)
```

MIN_VALIDATOR_WITHDRAWABILITY_DELAY [here](https://eth2book.info/altair/part3/config/configuration#min_validator_withdrawability_delay)

So now we can calculate what amount (and validators count) is needed to fully cover amount of non-finalized WithdrawQueue requests.

#### Calculate expected balance to withdraw

##### Future rewards

```!
future_rewards = (withdrawal_epoch + epochs_to_sweep - blockstamp.ref_epoch ) * rewards_speed_per_epoch
```

##### Future withdrawals amount

Get total balance from validators which can be fully withdrawn.

##### Total available balance

Fetch total balance as sum from:

- `Lido.getBufferedEther()` +
- Balance from `elRewardsVault` +
- Balance from `withdrawalVault`

##### Validators to eject cummulative amount

Get balance from next validator in exit queue.

##### Validators going to exit

Fetches recently emitted `ValidatorExitRequest` events from `ValidatorsExitBusOracle` contract and extract pubkeys from them. The delayed timeout config fetches from the `OracleDaemonConfig` contract.

Validators requested to exit, but didn't send exit message.
In case:

- Activation epoch is not old enough to initiate exit
- Node operator had not enough time to send exit message (VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS)

To get validators, oracle calculates:

- `lido_validators_by_operator` - Fetches all used Lido keys from [Keys API](https://github.com/lidofinance/lido-keys-api) + Fetches all validators at the reference slot and merge them with keys
- `ejected_indexes` - get operators with last exited validator indexes from for all staking_modules and node operators via `ValidatorsExitBusOracle.getLastRequestedValidatorIndices(module_id, uint256[] nodeOpIds)`
- `recent_pubkeys` - get last requested to exit pubkeys from `ValidatorExitRequest` event

For each `lido_validators_by_operator` oracle tries to find **non exited validators**, so:

- if not `validator_asked_to_exit` -> return False
- if `is_on_exit` -> return false
- if `validator_recently_asked_to_exit` -> return **True**
- if not `validator_eligible_to_exit` -> return **True**
- otherwise return False

Oracle calculates `going_to_withdraw_balance` for all **non exited validators**

##### Compare expected_balance vs to_withdrawn_balance

Expected balance is:

```
expected_balance = (
  future_withdrawals +  # Validators that have withdrawal_epoch
  future_rewards +  # Rewards we get until last validator in validators_to_eject will be withdrawn
  total_available_balance +  # Current EL balance (el vault, wc vault, buffered eth)
  validator_to_eject_balance_sum +  # Validators that we expected to be ejected (requested to exit, not delayed)
  going_to_withdraw_balance  # validators_to_eject balance
)
```

First of all, it's checked without exiting the validator, whether the protocol already has enough available ether to cover withdrawal requests in the queue. If yes, then it's not reasonable to exit validators.

If there is not enough, one more validator is considered to be exited and the expected balance gets calculated again. The process continues until the expected balance becomes greater than or equal to the unfinalized withdrawal requests amount.

## Helpful links

- [Lido Oracle source code](https://github.com/lidofinance/lido-oracle)
