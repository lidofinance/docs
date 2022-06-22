# LidoOracle

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/oracle/LidoOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb)

LidoOracle is a contract where oracles send addresses' balances controlled by the DAO on the ETH
2.0 side. The balances can go up because of reward accumulation and can go down due to slashing and
staking penalties. Oracles are assigned by the DAO.

Oracle daemons push their reports every frame (225 epochs currently, equal to one day) and when the
number of the same reports reaches the ['quorum'](#getquorum) value, the report is pushed to the
[Lido contract][6].

The following mechanisms are also worth mentioning.

## Store the collected reports as an array

The report variant is a report with a counter - how many times this report was pushed by
oracles. This strongly simplified logic of `_getQuorumReport`, because in the majority of cases, we
only have 1 variant of the report so we just make sure that its counter exceeded the quorum value.

:::note
The important note here is that when we remove an oracle (with `removeOracleMember`), we
also need to remove her report from the currently accepted reports. As of now, we do not keep a
mapping between members and their reports, we just clean all existing reports and wait for the
remaining oracles to push the same epoch again.
:::

## Add calculation of staker rewards [APR][1]

To calculate the percentage of rewards for stakers, we store and provide the following data:

- `preTotalPooledEther` - total pooled ether mount, queried right before every report push to the
  [Lido contract][6],
- `postTotalPooledEther` - the same, but queried right after the push,
- `lastCompletedEpochId` - the last epoch that we pushed the report to the Lido,
- `timeElapsed` - the time in seconds between the current epoch of push and the
  `lastCompletedEpochId`. Usually, it should be a frame long: 32 _ 12 _ 225 = 86400, but maybe
  multiples more in case that the previous frame didn't reach the quorum,
- `lidoFee` - Lido's fee in basis points. Might be retrieved by calling `getFee()` in the [Lido contract][6],
- `basisPoint` - basis point. 1% equals 100.

:::note
It is important to note here, that we collect post/pre pair (not current/last), to avoid
the influence of new staking during the epoch.
:::

To calculate the APR, use the following formula:

    stethApr = (postTotalPooledEther - preTotalPooledEther) * secondsInYear / (preTotalPooledEther * timeElapsed)
    lidoFeeAsFraction = lidoFee / (100 * basisPoint)
    APR = stethApr * (1 - lidoFeeAsFraction) * 0.1

## Sanity checks the oracles reports by configurable values

In order to limit the misbehaving oracles impact, we want to limit oracles report change by 10% APR
increase in stake and 5% decrease in stake. Both values are configurable by the governance in case
of extremely unusual circumstances.

:::note
Note that the change is evaluated after the quorum of oracles reports is reached, and not
on the individual report.
:::

And the logic of reporting to the [Lido contract][6] got a call to `_reportSanityChecks` that does
the following. It compares the `preTotalPooledEther` and `postTotalPooledEther` (see above) and

- if there is a profit or same, calculates the [APR][1], compares it with the upper bound. If was
  above, reverts the transaction with `ALLOWED_BEACON_BALANCE_INCREASE` code.
- if there is a loss, calculates relative decrease and compares it with the lower bound. If was
  below, reverts the transaction with `ALLOWED_BEACON_BALANCE_DECREASE` code.

## Receiver function to be invoked on report pushes

To provide the external contract with updates on report pushes (every time the quorum is reached
among oracle daemons data), we provide the following setter and getter functions. It might be
needed to implement some updates to the external contracts that should happen at the same tx the
[rebase](/contracts/lido#rebasing) happens (e.g. adjusting uniswap v2 pools to reflect the
rebase).

And when the callback is set, the following function will be invoked on every report push.

    interface IBeaconReportReceiver {
        function processLidoOracleReport(uint256 _postTotalPooledEther,
                                         uint256 _preTotalPooledEther,
                                         uint256 _timeElapsed) external;
    }

The arguments provided are the same as described in section [above][3].

See also the [`CompositePostRebaseBeaconReceiver`](/contracts/composite-post-rebase-beacon-receiver)
adapter contract which allows to set multiple callbacks.

## View Methods

### getLido()

Return the [Lido contract][6] address.

```sol
function getLido() returns (ILido)
```

### getQuorum()

Return the number of exactly the same reports needed to finalize the epoch.

```sol
function getQuorum() returns (uint256)
```

### getAllowedBeaconBalanceAnnualRelativeIncrease()

Return the upper bound of the reported balance possible increase in [APR][1]. See above about
[sanity checks][4].

```sol
function getAllowedBeaconBalanceAnnualRelativeIncrease() returns (uint256)
```

### getAllowedBeaconBalanceRelativeDecrease()

Return the lower bound of the reported balance possible decrease. See above about [sanity
checks][4].

```sol
function getAllowedBeaconBalanceRelativeDecrease() returns (uint256)
```

### getBeaconReportReceiver()

Return the receiver contract address to be called when the report is pushed to [Lido][6].

```sol
function getBeaconReportReceiver() returns (address)
```

### getCurrentOraclesReportStatus()

Return the current reporting bitmap, representing oracles who have already pushed their version of
report during the expected epoch.

:::note
Every oracle bit corresponds to the index of the oracle in the current members list
:::

```sol
function getCurrentOraclesReportStatus() returns (uint256)
```

### getCurrentReportVariantsSize()

Return the current reporting variants array size.

```sol
function getCurrentReportVariantsSize() returns (uint256)
```

### getCurrentReportVariant()

Return the current reporting array element with index `_index`.

```sol
function getCurrentReportVariant(uint256 _index)
```

### getExpectedEpochId()

Return epoch that can be reported by oracles.

```sol
function getExpectedEpochId() returns (uint256)
```

### getOracleMembers()

Return the current oracle member committee list.

```sol
function getOracleMembers() returns (address[])
```

### getVersion()

Return the initialized version of this contract starting from 0.

```sol
function getVersion() returns (uint256)
```

### getBeaconSpec()

Return beacon specification data.

```sol
function getBeaconSpec()
    returns (
        uint64 epochsPerFrame,
        uint64 slotsPerEpoch,
        uint64 secondsPerSlot,
        uint64 genesisTime
    )
```

### getCurrentEpochId()

Return the epoch calculated from current timestamp.

```sol
function getCurrentEpochId() returns (uint256)
```

### getCurrentFrame()

Return currently reportable epoch (the first epoch of the current frame) as well as its start and
end times in seconds.

```sol
function getCurrentFrame()
    returns (
        uint256 frameEpochId,
        uint256 frameStartTime,
        uint256 frameEndTime
    )
```

### getLastCompletedEpochId()

Return last completed epoch.

```sol
function getLastCompletedEpochId() returns (uint256)
```

### getLastCompletedReportDelta()

Report beacon balance and its change during the last frame.

```sol
function getLastCompletedReportDelta()
    returns (
        uint256 postTotalPooledEther,
        uint256 preTotalPooledEther,
        uint256 timeElapsed
    )
```

## Methods

### setAllowedBeaconBalanceAnnualRelativeIncrease()

Set the upper bound of the reported balance possible increase in APR to `_value`. See above about
[sanity checks][4].

```sol
function setAllowedBeaconBalanceAnnualRelativeIncrease(uint256 _value) auth(SET_REPORT_BOUNDARIES)
```

### setAllowedBeaconBalanceRelativeDecrease()

Set the lower bound of the reported balance possible decrease to `_value`. See above about [sanity
checks][4].

```sol
function setAllowedBeaconBalanceRelativeDecrease(uint256 _value) auth(SET_REPORT_BOUNDARIES)
```

### setBeaconReportReceiver()

Set the receiver contract address to `_addr` to be called when the report is pushed.

:::note
Specify 0 to disable this functionality.
The receiver contract MUST implement [EIP-165](https://eips.ethereum.org/EIPS/eip-165).
:::

```sol
function setBeaconReportReceiver(address _addr) auth(SET_BEACON_REPORT_RECEIVER)
```

### setBeaconSpec()

Update beacon specification data.

```sol
function setBeaconSpec(
    uint64 _epochsPerFrame,
    uint64 _slotsPerEpoch,
    uint64 _secondsPerSlot,
    uint64 _genesisTime
) auth(SET_BEACON_SPEC)
```

### initialize()

Initialize the contract to perform v0 → v3 transition.

:::note
The function `initialize` could not be called twice and it needed once the contract is
initialized for the first time (i.e. deploying from scratch).
For more details see the Lido improvement proposal [#10](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-10.md).
:::

```sol
function initialize(
    address _lido,
    uint64 _epochsPerFrame,
    uint64 _slotsPerEpoch,
    uint64 _secondsPerSlot,
    uint64 _genesisTime,
    uint256 _allowedBeaconBalanceAnnualRelativeIncrease,
    uint256 _allowedBeaconBalanceRelativeDecrease
) external
```

### finalizeUpgrade_v3()

A function to finalize upgrade to v3 (from v1). Can be called only once.

:::note
v2 is skipped due to a change in numbering.
For more details see the Lido improvement proposal [#10](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-10.md).
:::

```sol
function finalizeUpgrade_v3() external
```

### addOracleMember()

Add `_member` to the oracle member committee list.

```sol
function addOracleMember(address _member) auth(MANAGE_MEMBERS)
```

### removeOracleMember()

Remove '\_member` from the oracle member committee list.

```sol
function removeOracleMember(address _member) auth(MANAGE_MEMBERS)
```

### setQuorum()

Set the number of exactly the same reports needed to finalize the epoch to `_quorum`.

```sol
function setQuorum(uint256 _quorum) auth(MANAGE_QUORUM)
```

### reportBeacon()

Accept oracle committee member reports from the ETH 2.0 side. Parameters:

- `_epochId` - beacon chain epoch
- `_beaconBalance` - balance in gwei on the ETH 2.0 side (9-digit denomination)
- `_beaconValidators` - number of validators visible in this epoch

```sol
function reportBeacon(uint256 _epochId, uint64 _beaconBalance, uint32 _beaconValidators)
```

[1]: https://en.wikipedia.org/wiki/Annual_percentage_rate
[2]: #store-the-collected-reports-as-an-array
[3]: #add-calculation-of-staker-rewards-apr
[4]: #sanity-checks-the-oracles-reports-by-configurable-values
[5]: #receiver-function-to-be-invoked-on-report-pushes
[6]: /contracts/lido
