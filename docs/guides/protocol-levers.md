# Protocol levers

The protocol provides a number of settings controllable by the DAO. Modifying each of them requires
the caller to have a specific permission. After deploying the DAO, all permissions belong to either DAO `Voting` or `Agent` apps,
which can also manage them. This means that, initially, levers can only be changed by
the DAO voting, and other entities can be allowed to do the same only as a result of the voting.

All existing levers are listed below, grouped by the contract.

## A note on upgradeability

The following contracts are upgradeable by the DAO voting:

- [`LidoLocator`](/contracts/lido-locator)
- [`Lido`](/contracts/lido)
- [`StakingRouter`](/contracts/staking-router)
- [`NodeOperatorsRegistry`](/contracts/node-operators-registry)
- [`AccountingOracle`](/contracts/accounting-oracle)
- [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle)
- [`WithdrawalVault`](/contracts/withdrawal-vault)
- [`WithdrawalQueueERC721`](/contracts/withdrawal-queue-erc721)
- [`LegacyOracle`](/contracts/legacy-oracle)

Upgradeability is implemented either by the Aragon kernel and base contracts OR by the [OssifiableProxy](/contracts/ossifiable-proxy) instances.

- To upgrade an Aragon app, one needs the `dao.APP_MANAGER_ROLE` permission provided by Aragon.
- To upgrade an `OssifiableProxy` implementation, one needs to be an owner of the proxy.
- As it was said previously, both belong either to the DAO [`Voting`](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e) or [`Agent`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c) apps.

All upgradeable contracts use the [Unstructured Storage pattern] in order to provide stable storage structure across upgrades.

:::note
Some of the contracts still contain structured storage data, hence the order of inheritance always matters.
:::

[Unstructured Storage pattern]: https://blog.openzeppelin.com/upgradeability-using-unstructured-storage

## [Lido](/contracts/lido)

### Burning stETH tokens

The `stETH` token burning itself is a part of the core protocol regular procedures:

- deduct underlying finalized withdrawal request `stETH`, see [`Lido.handleOracleReport`](/contracts/lido#handleOracleReport)
- penalize delinquent node operators by halving their rewards, see [`NodeOperatorsRegistry._distributeRewards](/contracts/node-operators-registry#_distributeRewards)

These responsibilities are controlled by the [`REQUEST_BURN_SHARES_ROLE`](https://etherscan.io/address/0xD15a672319Cf0352560eE76d9e89eAB0889046D3#readContract#F3) role which is assigned to both
[`Lido`](/contracts/lido) and [`NodeOperatorsRegistry`](/contracts/node-operators-registry) contracts.

:::note
The `REQUEST_BURN_SHARES_ROLE` role should not be ever permanently assigned to another entities.
:::

Apart from this, the `stETH` token burning can be applied to compensate for penalties/slashing losses by the DAO decision.
It's possible via the more restrictive role [`REQUEST_BURN_MY_STETH_ROLE`](https://etherscan.io/address/0xD15a672319Cf0352560eE76d9e89eAB0889046D3#readContract#F2) which is currently unassigned.

The key difference that despite of both roles rely on the `stETH` allowance provided to the `Burner` contract,
the latter allows token burning only from the request originator balance not relying on general allowance.

### Pausing

- Mutator: `stop()`
  - Permission required: [`PAUSE_ROLE`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F13)
- Mutator: `resume()`
  - Permission required: [`RESUME_ROLE`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F8)
- Accessor: `isStopped() returns (bool)`

When paused, `Lido` doesn't accept user submissions, doesn't allow user withdrawals and oracle
report submissions. No token ownership-changing actions (burning, transferring) are allowed.

The following transactions revert if Lido is paused:

- plain Ether transfers to `Lido`;
- calls to `submit(address)`;
- calls to `deposit(uint256, uint256, bytes)`;
- calls to `handleOracleReport(...)`;
- calls to `transfer(address, uint256)`;
- calls to `transferFrom(address, address, uint256)`;
- calls to `transferShares(address, uint256)`;
- calls to `transferSharesFrom(address, uint256)`.

As a consequence of the list above:

- calls to `WithdrawalQueueERC721.requestWithdrawals(uint256[] calldata, address)`, and its variants;
- calls to `wstETH.wrap(uint256)` and `wstETH.unwrap(uint256)`;
- calls to `Burner.requestBurnShares`, `Burner.requestBurnMyStETH`, and its variants;

:::note
External stETH/wstETH DeFi integrations are directly affected as well.
:::

### Override deposited validators counter

- Mutator: `unsafeChangeDepositedValidators(uint256)`
  - Permission required: `UNSAFE_CHANGE_DEPOSITED_VALIDATORS_ROLE`

The method unsafely changes deposited validator counter.
Can be required when onboarding external validators to Lido (i.e., had deposited before and rotated their type-0x00 withdrawal credentials to Lido).

:::note
The incorrect values might disrupt protocol operation.
:::

### Oracle report

StETH is a rebasable token.

It receives reports from the `AccoutingOracle` contract (via the `Lido.handleOracleReport` method) with the state of the protocol's Consensus Layer validators balances, and updates all the balances of stETH holders distributing the protocol's total staking rewards and penalties. This result in a change of the balances of all `stETH` holders.

The protocol employs distributed Oracle reporting: there are **nine** Oracle daemons running by the Lido Node operators, and the Oracle smart contract formats beacon report on the consensus of **five** of **nine** daemon reports. On top of the consensus mechanics, there are sanity checks for reports with sudden drops in total Consensus Layer balance or rewards with higher-than-possible APY and other security measurements.

The oracle committee is responsible for delivering two types of reports:

- Protocol's accounting data to [`AccountingOracle`](/contracts/accounting-oracle): Consensus Layer validators state,
balances of the execution layer and withdrawal vaults, `stETH` amount already requested to burn, and withdrawal request ranges to be finalized.
- Validator exits requests to [`ValidatorsExitBus`](/contracts/validators-exit-bus-oracle): validator indexes to request a voluntary exit propagation from the side of a node operator

Note that:

- The Lido DAO can set another addresses for the oracle contracts (it was case with the Lido V2 upgrade)
- The implementation of the contract can be changed as well

#### Oracle committee members

The following addresses form the Lido oracle members set and only they are allowed to push the new oracle data.

| Name                | Mainnet address                                | Görli address                                  |
| ------------------- | --------------------------------------------   | ---------------------------------------------- |
| Chorus One          | [`0x140bd8fbdc884f48da7cb1c09be8a2fadfea776e`] | [`0xA8aF49FB44AAA8EECa9Ae918bb7c05e2E71c9DE9`] |
| Jumpcrypto          | [`0x1d0813bf088be3047d827d98524fbf779bc25f00`] | [`0x1a13648EE85386cC101d2D7762e2848372068Bc3`] |
| Staking Facilities  | [`0x404335bce530400a5814375e7ec1fb55faff3ea2`] | [`0xb29dD2f6672C0DFF2d2f173087739A42877A5172`] |
| P2P                 | [`0x007de4a5f7bc37e2f26c0cb2e8a95006ee9b89b5`] | [`0xfdA7E01B2718C511bF016030010572e833C7aE6A`] |
| Stakefish           | [`0x946d3b081ed19173dc83cd974fc69e1e760b7d78`] | [`0xD3b1e36A372Ca250eefF61f90E833Ca070559970`] |
| Rated               | [`0xec4bfbaf681eb505b94e4a7849877dc6c600ca3a`] | [`0x3799bDA7B884D33F79CEC926af21160dc47fbe05`] |
| bloXroute           | [`0x61c91ECd902EB56e314bB2D5c5C07785444Ea1c8`] | [`0x4c75FA734a39f3a21C57e583c1c29942F021C6B7`] |
| Instadapp           | [`0x1ca0fec59b86f549e1f1184d97cb47794c8af58d`] | [`0x81E411f1BFDa43493D7994F82fb61A415F6b8Fd4`] |
| Kyber Network       | [`0xA7410857ABbf75043d61ea54e07D57A6EB6EF186`] | [`0x3fF28f2EDE8358E288798afC23Ee299a503aD5C9`] |

[`0x140bd8fbdc884f48da7cb1c09be8a2fadfea776e`]: https://etherscan.io/address/0x140bd8fbdc884f48da7cb1c09be8a2fadfea776e
[`0x1d0813bf088be3047d827d98524fbf779bc25f00`]: https://etherscan.io/address/0x1d0813bf088be3047d827d98524fbf779bc25f00
[`0x404335bce530400a5814375e7ec1fb55faff3ea2`]: https://etherscan.io/address/0x404335bce530400a5814375e7ec1fb55faff3ea2
[`0x007de4a5f7bc37e2f26c0cb2e8a95006ee9b89b5`]: https://etherscan.io/address/0x007de4a5f7bc37e2f26c0cb2e8a95006ee9b89b5
[`0x946d3b081ed19173dc83cd974fc69e1e760b7d78`]: https://etherscan.io/address/0x946d3b081ed19173dc83cd974fc69e1e760b7d78
[`0xec4bfbaf681eb505b94e4a7849877dc6c600ca3a`]: https://etherscan.io/address/0xec4bfbaf681eb505b94e4a7849877dc6c600ca3a
[`0x61c91ECd902EB56e314bB2D5c5C07785444Ea1c8`]: https://etherscan.io/address/0x61c91ECd902EB56e314bB2D5c5C07785444Ea1c8
[`0x1ca0fec59b86f549e1f1184d97cb47794c8af58d`]: https://etherscan.io/address/0x1ca0fec59b86f549e1f1184d97cb47794c8af58d
[`0xA7410857ABbf75043d61ea54e07D57A6EB6EF186`]: https://etherscan.io/address/0xA7410857ABbf75043d61ea54e07D57A6EB6EF186
[`0xA8aF49FB44AAA8EECa9Ae918bb7c05e2E71c9DE9`]: https://goerli.etherscan.io/address/0xA8aF49FB44AAA8EECa9Ae918bb7c05e2E71c9DE9
[`0x1a13648EE85386cC101d2D7762e2848372068Bc3`]: https://goerli.etherscan.io/address/0x1a13648EE85386cC101d2D7762e2848372068Bc3
[`0xb29dD2f6672C0DFF2d2f173087739A42877A5172`]: https://goerli.etherscan.io/address/0xb29dD2f6672C0DFF2d2f173087739A42877A5172
[`0xfdA7E01B2718C511bF016030010572e833C7aE6A`]: https://goerli.etherscan.io/address/0xfdA7E01B2718C511bF016030010572e833C7aE6A
[`0xD3b1e36A372Ca250eefF61f90E833Ca070559970`]: https://goerli.etherscan.io/address/0xD3b1e36A372Ca250eefF61f90E833Ca070559970
[`0x3799bDA7B884D33F79CEC926af21160dc47fbe05`]: https://goerli.etherscan.io/address/0x3799bDA7B884D33F79CEC926af21160dc47fbe05
[`0x4c75FA734a39f3a21C57e583c1c29942F021C6B7`]: https://goerli.etherscan.io/address/0x4c75FA734a39f3a21C57e583c1c29942F021C6B7
[`0x81E411f1BFDa43493D7994F82fb61A415F6b8Fd4`]: https://goerli.etherscan.io/address/0x81E411f1BFDa43493D7994F82fb61A415F6b8Fd4
[`0x3fF28f2EDE8358E288798afC23Ee299a503aD5C9`]: https://goerli.etherscan.io/address/0x3fF28f2EDE8358E288798afC23Ee299a503aD5C9

### Deposit access control

The `Lido.deposit` method performs an actual deposit (stake) of buffered ether to Consensus Layer
undergoing through `StakingRouter`, its selected module, and the official [Ethereum deposit contract](https://ethereum.org/en/staking/deposit-contract/) in the end.

The method can be called only by [`DepositSecurityModule`](/contracts/deposit-security-module) since access control is a part of the deposits frontrunning vulnerability mitigation.

Please see [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) for more details.

### Deposit loop iteration limit

Controls how many Ethereum deposits can be made in a single transaction.

- The `_maxDepositsCount` parameter of the `deposit(uint256 _maxDepositsCount, uint256 _stakingModuleId, bytes _depositCalldata)` function
- Default value: `16`
- [Scenario test](https://github.com/lidofinance/lido-dao/blob/master/test/scenario/lido_deposit_iteration_limit.js)

When DSM calls `depositBufferedEther`, `Lido` tries to register as many Ethereum validators
as it can given the buffered Ether amount. The limit is passed as an argument to this function and
is needed to prevent the transaction from [failing due to the block gas limit], which is possible
if the amount of the buffered Ether becomes sufficiently large.

[failing due to the block gas limit]: https://github.com/ConsenSys/smart-contract-best-practices/blob/8f99aef/docs/known_attacks.md#gas-limit-dos-on-a-contract-via-unbounded-operations

### Execution layer rewards

TODO

### Staking rate limiting

Lido features a safeguard mechanism to prevent huge APR losses facing the [post-merge entry queue demand](https://blog.lido.fi/modelling-the-entry-queue-post-merge-an-analysis-of-impacts-on-lidos-socialized-model/).

New staking requests could be rate-limited with a soft moving cap for the stake amount per desired period.

Limit explanation scheme:

```
    * ▲ Stake limit
    * │.....  .....   ........ ...            ....     ... Stake limit = max
    * │      .       .        .   .   .      .    . . .
    * │     .       .              . .  . . .      . .
    * │            .                .  . . .
    * │──────────────────────────────────────────────────> Time
    * │     ^      ^          ^   ^^^  ^ ^ ^     ^^^ ^     Stake events
```

- Mutators: `resumeStaking()`, `setStakingLimit(uint256, uint256)`, `removeStakingLimit()`
  - Permission required: `STAKING_CONTROL_ROLE`

- Mutator: `pauseStaking()`
  - Permission required: `STAKING_PAUSE_ROLE`

- Accessors:
  - `isStakingPaused()`
  - `getCurrentStakeLimit()`
  - `getStakeLimitFullInfo()`

When staking is paused, `Lido` doesn't accept user submissions. The following transactions revert:

- Plain Ether transfers;
- calls to `submit(address)`.

For details, see the Lido Improvement Proposal [#14](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-14.md).

## [StakingRouter](/contracts/staking-router)

### Fee

The total fee, in basis points (`10000` corresponding to `100%`).

- Mutator: `setFee(uint16)`
  - Permission required: `MANAGE_FEE`
- Accessor: `getFee() returns (uint16)`

The fee is taken on staking rewards and distributed between the treasury, the insurance fund, and
node operators.

### Fee distribution

Controls how the fee is distributed between the treasury, the insurance fund, and node operators.
Each fee component is in basis points; the sum of all components must add up to 1 (`10000` basis points).

- Mutator: `setFeeDistribution(uint16 treasury, uint16 insurance, uint16 operators)`
  - Permission required: `MANAGE_FEE`
- Accessor: `getFeeDistribution() returns (uint16 treasury, uint16 insurance, uint16 operators)`

### Ethereum withdrawal Credentials

Credentials to withdraw ETH on the Execution Layer side

- Mutator: `setWithdrawalCredentials(bytes)`
  - Permission required: `MANAGE_WITHDRAWAL_KEY`
- Accessor: `getWithdrawalCredentials() returns (bytes)`

The protocol uses these credentials to register new Ethereum validators.

## [NodeOperatorsRegistry](/contracts/node-operators-registry)

### Node Operators list

- Mutator: `addNodeOperator(string _name, address _rewardAddress, uint64 _stakingLimit)`
  - Permission required: `ADD_NODE_OPERATOR_ROLE`
- Mutator: `setNodeOperatorName(uint256 _id, string _name)`
  - Permission required: `SET_NODE_OPERATOR_NAME_ROLE`
- Mutator: `setNodeOperatorRewardAddress(uint256 _id, address _rewardAddress)`
  - Permission required: `SET_NODE_OPERATOR_ADDRESS_ROLE`
- Mutator: `setNodeOperatorStakingLimit(uint256 _id, uint64 _stakingLimit)`
  - Permission required: `SET_NODE_OPERATOR_LIMIT_ROLE`

Node Operators act as validators on the Beacon chain for the benefit of the protocol. Each
node operator submits no more than `_stakingLimit` signing keys that will be used later
by the protocol for registering the corresponding Ethereum validators. As oracle committee
reports rewards on the Ethereum side, the fee is taken on these rewards, and part of that fee
is sent to node operators’ reward addresses (`_rewardAddress`).

### Deactivating a node operator

- Mutator: `setNodeOperatorActive(uint256 _id, bool _active)`
  - Permission required: `SET_NODE_OPERATOR_ACTIVE_ROLE`

Misbehaving node operators can be deactivated by calling this function. The protocol skips
deactivated operators during validator registration; also, deactivated operators don’t
take part in fee distribution.

### Managing node operator’s signing keys

- Mutator: `addSigningKeys(uint256 _operator_id, uint256 _quantity, bytes _pubkeys, bytes _signatures)`
  - Permission required: `MANAGE_SIGNING_KEYS`
- Mutator: `removeSigningKey(uint256 _operator_id, uint256 _index)`
  - Permission required: `MANAGE_SIGNING_KEYS`

Allow to manage signing keys for the given node operator.

> Signing keys can also be managed by the reward address of a signing provider by calling
> the equivalent functions with the `OperatorBH` suffix: `addSigningKeysOperatorBH`, `removeSigningKeyOperatorBH`.

### Reporting new stopped validators

- Mutator: `reportStoppedValidators(uint256 _id, uint64 _stoppedIncrement)`
  - Permission required: `REPORT_STOPPED_VALIDATORS_ROLE`

Allows to report that `_stoppedIncrement` more validators of a node operator have become stopped.

## [AccountingOracle](/contracts/accounting-oracle) and [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle)

### Members list

The list of oracle committee members.

- Mutators: `addOracleMember(address)`, `removeOracleMember(address)`
  - Permission required: `MANAGE_MEMBERS`
- Accessor: `getOracleMembers() returns (address[])`

### The quorum

The number of exactly the same reports needed to finalize the epoch.

- Mutator: `setQuorum(uint256)`
  - Permission required: `MANAGE_QUORUM`
- Accessor: `getQuorum() returns (uint256)`

When the `quorum` number of the same reports is collected for the current epoch,

- the epoch is finalized (no more reports are accepted for it),
- the final report is pushed to the Lido,
- statistics collected and the [sanity check][1] is evaluated,
- [beacon report receiver][2] is called.

### Sanity check

To make oracles less dangerous, we can limit rewards report by 0.1% increase in stake and 15%
decrease in stake, with both values configurable by the governance in case of extremely unusual
circumstances.

- Mutators: `setAllowedBeaconBalanceAnnualRelativeIncrease(uint256)` and
  `setAllowedBeaconBalanceRelativeDecrease(uint256)`
  - Permission required: `SET_REPORT_BOUNDARIES`
- Accessors: `getAllowedBeaconBalanceAnnualRelativeIncrease() returns (uint256)` and
  `getAllowedBeaconBalanceRelativeDecrease() returns (uint256)`

### Current reporting status

For transparency we provide accessors to return status of the oracle daemons reporting for the
current "[expected epoch][3]".

- Accessors:
  - `getCurrentOraclesReportStatus() returns (uint256)` - returns the current reporting bitmap,
    representing oracles who have already pushed their version of report during the [expected][3]
    epoch, every oracle bit corresponds to the index of the oracle in the current members list,
  - `getCurrentReportVariantsSize() returns (uint256)` - returns the current reporting variants
    array size,
  - `getCurrentReportVariant(uint256 _index) returns (uint64 beaconBalance, uint32 beaconValidators, uint16 count)` - returns the current reporting array element with the given
    index.

### Expected epoch

The oracle daemons may provide their reports only for the one epoch in every frame: the first
one. The following accessor can be used to look up the current epoch that this contract expects
reports.

- Accessor: `getExpectedEpochId() returns (uint256)`.

Note that any later epoch, that has already come _and_ is also the first epoch of its frame, is
also eligible for reporting. If some oracle daemon reports it, the contract discards any results of
this epoch and advances to the just reported one.

### Version of the contract

Returns the initialized version of this contract starting from 0.

- Accessor: `getVersion() returns (uint256)`.

### Beacon specification

Sets and queries configurable beacon chain specification.

- Mutator: `setBeaconSpec( uint64 _epochsPerFrame, uint64 _slotsPerEpoch, uint64 _secondsPerSlot, uint64 _genesisTime )`,
  - Permission required: `SET_BEACON_SPEC`,
- Accessor: `getBeaconSpec() returns (uint64 epochsPerFrame, uint64 slotsPerEpoch, uint64 secondsPerSlot, uint64 genesisTime)`.

### Current epoch

Returns the epoch calculated from current timestamp.

- Accessor: `getCurrentEpochId() returns (uint256)`.

### Supplemental epoch information

Returns currently reportable epoch (the first epoch of the current frame) as well as its start and
end times in seconds.

- Accessor: `getCurrentFrame() returns (uint256 frameEpochId, uint256 frameStartTime, uint256 frameEndTime)`.

### Last completed epoch

Return the last epoch that has been pushed to Lido.

- Accessor: `getLastCompletedEpochId() returns (uint256)`.

### Supplemental rewards information

Reports beacon balance and its change during the last frame.

- Accessor: `getLastCompletedReportDelta() returns (uint256 postTotalPooledEther, uint256 preTotalPooledEther, uint256 timeElapsed)`.

[1]: #sanity-check
[2]: #beacon-report-receiver
[3]: #expected-epoch
