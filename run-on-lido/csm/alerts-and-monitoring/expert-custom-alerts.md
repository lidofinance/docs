---
sidebar_position: 2
---

# 🧪 Expert: Subscribing to Important Events

# Subscribing to the important events

:::info
Check out the [video guide](https://youtu.be/ByRujrL501c) by one of the Lido contributors, which explains how to subscribe to the events.
:::

Some smart contract events in the CSM may occur on the protocol side, such as withdrawal requests, penalties, etc., which require specific actions from the Node Operator (NO).

So, what exactly are the events that the operator has to follow?

:::info
If the guide seems too complicated, make sure to check out a community-developed tool: [CSM Sentinel](https://github.com/skhomuti/csm-sentinel). This is a Telegram bot that you can run on your own or use one of the community-supported instances. Note that community-supported instances come with no guarantee!
:::

## Contract: [VEBO](/contracts/validators-exit-bus-oracle)

- [Mainnet](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)
- [Hoodi](https://hoodi.cloud.blockscout.com/address/0x8664d394C2B3278F26A1B44B967aEf99707eeAB2)

### ValidatorExitRequest
`ValidatorExitRequest` is the most important event for key management. It requires sending a voluntary exit request using the key specified in the event.
If the Node Operator doesn't do this in time, the key becomes stuck, and rewards for the current and upcoming frames until stuck keys are exited frame are zeroed.
Following all the events filtered by `stakingModuleId=3 (Mainnet), stakingModuleId=4 (Hoodi)` and `nodeOperatorId` is essential.
```solidity
event ValidatorExitRequest(
    uint256 indexed stakingModuleId,
    uint256 indexed nodeOperatorId,
    uint256 indexed validatorIndex,
    bytes validatorPubkey,
    uint256 timestamp
);
```

:::info
This event can be tracked using [Ejector](https://github.com/lidofinance/validator-ejector). In the case of Ejector usage, the requested validators will be exited automatically if the pre-signed messages for them are uploaded to the Ejector.
:::


## Contract: CSM

- [Mainnet](https://etherscan.io/address/0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F)
- [Hoodi](https://hoodi.cloud.blockscout.com/address/0x79CEf36D84743222f37765204Bec41E92a93E59d)


### ELRewardsStealingPenaltyReported
The [CSM Committee](https://research.lido.fi/t/csm-committee-creation/8333) can report a potentially stolen amount of EL rewards. If so, the NO must either compensate or challenge the report.
```solidity
event ELRewardsStealingPenaltyReported(
    uint256 indexed nodeOperatorId,
    bytes32 proposedBlockHash,
    uint256 stolenAmount
);
```

### VettedSigningKeysCountDecreased
The uploaded keys might be invalid, so the Node Operator has to remove invalid keys to prevent the others from stopping deposits.
```solidity
event VettedSigningKeysCountDecreased(
    uint256 indexed nodeOperatorId
);
```

### StuckSigningKeysCountChanged
Stuck keys for the Node Operator mean no rewards for the current frame. It's too late already to exit these keys in the current frame, but it is still required to receive further rewards
```solidity
event StuckSigningKeysCountChanged(
    uint256 indexed nodeOperatorId,
    uint256 stuckKeysCount
);
```

### InitialSlashingSubmitted
Get notifications when slashing occurs and is reported
```solidity
event InitialSlashingSubmitted(
    uint256 indexed nodeOperatorId,
    uint256 keyIndex
);
```

### WithdrawalSubmitted
Information event that the key has been reported as `withdrawn`, so the required bond for this key is released.
```solidity
event WithdrawalSubmitted(
    uint256 indexed nodeOperatorId,
    uint256 keyIndex,
    uint256 amount
);
```

### DepositedSigningKeysCountChanged
Information event that the keys have been deposited
```solidity
event DepositedSigningKeysCountChanged(
    uint256 indexed nodeOperatorId,
    uint256 depositedKeysCount
);
```

## Contract: CSFeeDistributor

- [Mainnet](https://etherscan.io/address/0xD99CC66fEC647E68294C6477B40fC7E0F6F618D0)
- [Hoodi](https://hoodi.cloud.blockscout.com/address/0xaCd9820b0A2229a82dc1A0770307ce5522FF3582)

### DistributionDataUpdated
Notify when rewards for the current frame are available to claim
```solidity
event DistributionDataUpdated(
    uint256 totalClaimableShares,
    bytes32 treeRoot,
    string treeCid
);
```

## 3rd party notification providers

Operators can use [OZ Defender](https://www.openzeppelin.com/) or [Tenderly](https://tenderly.co/) as services ok that allow them to subscribe to the emitted events on the particular contracts
and notify in the Telegram, Discord, Email, etc.

It is recommended to use OZ Defender - you can subscribe to all required events per contract in one `Monitor` using the free plan.

At the same time, Tenderly has some limitations:
- Not allowed to filter events by two or more fields, so you cannot subscribe to `ValidatorExitRequest` properly.
- Batches events and sends them every 15 minutes on the free plan. This is not a problem for CSM events, but you have to visit the app in the case of batch events to see them all.
- Max 3 alerts per account, so the recommended events are: `ELRewardsStealingPenaltyReported`, `DecreaseVettedSigningKeysCountReported` and `StuckSigningKeysCountChanged`


See corresponding docs for set up guide:
- [Tenderly - Intro into Alerts](https://docs.tenderly.co/alerts/intro-to-alerts)
- [OpenZeppelin - Monitor](https://docs.openzeppelin.com/defender/v2/module/monitor)

## Other guides
### Stakesaurus' Telegram Bot

[Stakesaurus Validator Healthcheck Alerts](https://dvt-homestaker.stakesaurus.com/automation-tools/validator-healthcheck-alerts)

### Eridian's Pager Duty Setup

[Eridian Alerting and Monitoring Docs](https://docs.eridian.xyz/infrastructure-docs/alerting-and-monitoring)