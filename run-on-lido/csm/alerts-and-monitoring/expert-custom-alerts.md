---
sidebar_position: 3
---

# 🧪 Expert: Subscribing to Important Events

# Subscribing to the important events

Some smart contract events in the CSM may occur on the protocol side, such as withdrawal requests, penalties, etc., which require specific actions from the Node Operator (NO).

So, what exactly are the events that the operator has to follow?

:::info
If the guide seems too complicated, make sure to check out a tool: [SM Sentinel](https://github.com/lidofinance/sm-sentinel). This is a Telegram bot that you can run on your own or use one of the community-supported instances. Note that community-supported instances come with no guarantee!
:::

## Contract: [VEBO](/contracts/validators-exit-bus-oracle)

- [Mainnet](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)
- [Hoodi](https://hoodi.etherscan.io/address/0x8664d394C2B3278F26A1B44B967aEf99707eeAB2)

### ValidatorExitRequest
`ValidatorExitRequest` is the most important event for key management. It requires sending a voluntary exit request using the key specified in the event.
If the Node Operator doesn't exit in time, an exit delay charge is applied to the bond once the validator withdraws, and the protocol may force the exit from the Execution Layer at the operator's cost.
Following all the events filtered by `stakingModuleId` and `nodeOperatorId` is essential. For 0x01 CSM that is `stakingModuleId=3` on Mainnet and `stakingModuleId=4` on Hoodi. 0x02 CSM is a separate module with its own id and its own contract addresses, so check [Deployed Contracts](/deployed-contracts/) for the deployment you are monitoring.
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
- [Hoodi](https://hoodi.etherscan.io/address/0x79CEf36D84743222f37765204Bec41E92a93E59d)


### GeneralDelayedPenaltyReported
The [CSM Committee](https://research.lido.fi/t/community-staking-module-committee/8333) can report a protocol violation, such as stolen EL rewards. If so, the NO must either compensate or challenge the report. See [Penalties](/run-on-lido/csm/penalties#how-penalties-and-charges-are-applied).
```solidity
event GeneralDelayedPenaltyReported(
    uint256 indexed nodeOperatorId,
    bytes32 indexed penaltyType,
    uint256 amount,
    uint256 additionalFine,
    string details
);
```

### VettedSigningKeysCountDecreased
The uploaded keys might be invalid, so the Node Operator has to remove invalid keys to prevent the others from stopping deposits.
```solidity
event VettedSigningKeysCountDecreased(
    uint256 indexed nodeOperatorId
);
```

### ValidatorSlashingReported
Get notifications when a slashing is reported for one of your keys.
```solidity
event ValidatorSlashingReported(
    uint256 indexed nodeOperatorId,
    uint256 keyIndex,
    bytes pubkey
);
```

### ValidatorWithdrawn
Information event that the key has been reported as withdrawn, so the required bond for this key is released. `slashingPenalty` shows any loss deducted from the bond.
```solidity
event ValidatorWithdrawn(
    uint256 indexed nodeOperatorId,
    uint256 keyIndex,
    uint256 exitBalance,
    uint256 slashingPenalty,
    bytes pubkey
);
```

### KeyRemovalChargeApplied
A key removal charge has been taken from the bond.
```solidity
event KeyRemovalChargeApplied(uint256 indexed nodeOperatorId);
```

### DepositedSigningKeysCountChanged
Information event that the keys have been deposited
```solidity
event DepositedSigningKeysCountChanged(
    uint256 indexed nodeOperatorId,
    uint256 depositedKeysCount
);
```

## Contract: ExitPenalties

- [Mainnet](https://etherscan.io/address/0x06cd61045f958A209a0f8D746e103eCc625f4193)
- [Hoodi](https://hoodi.etherscan.io/address/0xD259b31083Be841E5C85b2D481Cfc17C14276800)

### ValidatorExitDelayProcessed
An exit delay charge has been applied because the validator was not exited within the allowed delay.
```solidity
event ValidatorExitDelayProcessed(
    uint256 indexed nodeOperatorId,
    bytes pubkey,
    uint256 delayFee
);
```

### TriggeredExitFeeRecorded
The protocol forced an exit from the Execution Layer and recorded the withdrawal request fee against the Node Operator.
```solidity
event TriggeredExitFeeRecorded(
    uint256 indexed nodeOperatorId,
    uint256 indexed exitType,
    bytes pubkey,
    uint256 withdrawalRequestPaidFee,
    uint256 withdrawalRequestRecordedFee
);
```

### StrikesPenaltyProcessed
A bad performance penalty has been applied after the key accumulated enough strikes.
```solidity
event StrikesPenaltyProcessed(
    uint256 indexed nodeOperatorId,
    bytes pubkey,
    uint256 strikesPenalty
);
```

## Contract: ValidatorStrikes

- [Mainnet](https://etherscan.io/address/0xaa328816027F2D32B9F56d190BC9Fa4A5C07637f)
- [Hoodi](https://hoodi.etherscan.io/address/0x8fBA385C3c334D251eE413e79d4D3890db98693c)

### StrikesDataUpdated
A new strikes tree has been published. Check whether any of your keys accumulated strikes, since enough strikes lead to ejection and a penalty.
```solidity
event StrikesDataUpdated(bytes32 treeRoot, string treeCid);
```

## Contract: FeeDistributor

- [Mainnet](https://etherscan.io/address/0xD99CC66fEC647E68294C6477B40fC7E0F6F618D0)
- [Hoodi](https://hoodi.etherscan.io/address/0xaCd9820b0A2229a82dc1A0770307ce5522FF3582)

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

Operators can use [Tenderly](https://tenderly.co/) as a service to subscribe to the emitted events on the particular contracts
and notify in the Telegram, Discord, Email, etc.

See corresponding doc for the set-up guide:
- [Tenderly - Intro into Alerts](https://docs.tenderly.co/alerts/intro-to-alerts)

## Other guides
### Stakesaurus' Telegram Bot

[Stakesaurus Validator Healthcheck Alerts](https://dvt-homestaker.stakesaurus.com/automation-tools/validator-healthcheck-alerts)

### Eridian's Pager Duty Setup

[Eridian Alerting and Monitoring Docs](https://docs.eridian.xyz/ethereum-dev/infrastructure/alerting-and-monitoring)
