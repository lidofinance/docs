# Subscribing to events

Some events in the CSM may occur on the protocol side, such as withdrawal requests, penalties, etc., which require specific actions from the Node Operator (NO).

So, what exactly are the events that the NO has to follow?

## Contract: [VEBO](https://docs.lido.fi/contracts/validators-exit-bus-oracle)

> [Holesky](https://holesky.etherscan.io/address/0xffDDF7025410412deaa05E3E1cE68FE53208afcb)  
> [Mainnet](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)

### ValidatorExitRequest
`ValidatorExitRequest` is the most important event for key management. It requires sending a voluntary exit request using the key specified in the event.
If the Node Operator doesn't do this in time, the key becomes stuck, and rewards for the current and upcoming frames until stuck keys are exited frame are zeroed.
Following all the events filtered by `stakingModuleId=4 (Holesky)` and `nodeOperatorId` is essential.
```solidity
event ValidatorExitRequest(
    uint256 indexed stakingModuleId,
    uint256 indexed nodeOperatorId,
    uint256 indexed validatorIndex,
    bytes validatorPubkey,
    uint256 timestamp
);
```

## Contract: CSM

> [Holesky](https://holesky.etherscan.io/address/0x4562c3e63c2e586cD1651B958C22F88135aCAd4f)
 
### ELRewardsStealingPenaltyReported
The DAO can report a potentially stolen amount of EL rewards. If so, the NO must either compensate or challenge the report.
```solidity
event ELRewardsStealingPenaltyReported(
    uint256 indexed nodeOperatorId,
    bytes32 proposedBlockHash,
    uint256 stolenAmount
);
```

### DecreaseVettedSigningKeysCountReported
The uploaded keys might be invalid, so the Node Operator has to remove invalid keys to prevent the others from stopping deposits.
```solidity
event DecreaseVettedSigningKeysCountReported(
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

> [Holesky](https://holesky.etherscan.io/address/0xD7ba648C8F72669C6aE649648B516ec03D07c8ED)

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

Node Operators can use [Tenderly](https://tenderly.co/) or [OZ Defender](https://www.openzeppelin.com/) as services that allow you to subscribe to the emitted events on the particular contracts and notify you in the Telegram, Discord, Email, etc. Both services work well, allowing filtering by event parameters and are available on the Holesky testnet.

The free plan on Tenderly has the following limitations:
- Batches events and sends them every 15 minutes. This is not a problem for CSM events, but you have to visit the app in the case of batch events to see them all.
- Max 3 alerts per account, so the recommended events are: `ValidatorExitRequest`, `ELRewardsStealingPenaltyReported` and `DecreaseVettedSigningKeysCountReported`

Using OZ Defender, you can subscribe to all required events per contract in one `Monitor`, so the free plan has no restrictions for the Node Operator's needs. The only difficulty is that the UI is less friendly than Tenderly's.

See corresponding docs for set up guide:
- [Tenderly - Intro into Alerts](https://docs.tenderly.co/alerts/intro-to-alerts)
- [OpenZeppelin - Monitor](https://docs.openzeppelin.com/defender/v2/module/monitor)
