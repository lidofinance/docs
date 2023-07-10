# LegacyOracle

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/oracle/LegacyOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb)

:::warning
LegacyOracle is used to be a previous oracle contract for Lido.
It's left currently for compatibility reasons only and might be deprecated completely in the future releases.
:::

## What is LegacyOracle?

`LegacyOracle` is an Aragon app previously known (before Lido V2 to be precise) as `LidoOracle`.

The original purpose of the `LidoOracle` contract was to accept the learnt changes of the Beacon Chain
(nowadays referred mostly as the Ethereum Consensus Layer) to account for the Lido-participating validators major state changes
(e.g., when a new validator appears or when the validator's balance changes).

With the latest Lido V2 protocol upgrade, the oracle workflow was redesigned to deliver more synchronized
historical data chunks for the same reference slot of the already finalized epoch (having both the Consensus and Execution Layer parts).

The `LidoOracle` contract functionality was superseded with [AccountingOracle](/contracts/accounting-oracle).

## What is left in LegacyOracle

### How it is invoked (flow)

TODO

### Rebase and APR

TODO

## Future plans

The `LegacyOracle` contract will be maintained till the end of 2023.
Then it will be eventually discontinued and unmaintained with a notice of a couple of months.

Any of the external integrations should rely on the `AccountingOracle` methods and events instead.

## View Methods

### getLido()

### getAccountingOracle()

### getVersion()

### getContractVersion()

### getBeaconSpec()

### getCurrentEpochId()

### getCurrentFrame()

### getLastCompletedEpochId()

### getLastCompletedReportDelta()

## Methods

### handlePostTokenRebase()

TODO

### handleConsensusLayerReport()

TODO

## Events

### Completed()

Emits whenever the `AccountingOracle` report landed.

This event is still emitted after oracle committee reaches consensus on a report, but only for compatibility purposes. The values in this event are not enough to calculate APR or TVL anymore due to withdrawals, Execution Layer rewards, and Consensus Layer rewards skimming.

```solidity
event Completed(
    uint256 epochId,
    uint128 beaconBalance,
    uint128 beaconValidators
);
```

:::note
TODO
:::

#### Arguments

| Name               | Type      | Description                                                                  |
| ------------------ | --------- | ---------------------------------------------------------------------------- |
| `epochId`          | `uint256` | Report reference epoch identifier                                            |
| `beaconBalance`    | `uint128` | The balance of the Lido-participating validators on the Consensus Layer side |
| `beaconValidators` | `uint128` | The number of the ever appeared Lido-participating validators                |

### PostTotalShares()

Emits whenever the `AccountingOracle` report landed.

This event is still emitted after each rebase but only for compatibility purposes. The values in this event are not enough to correctly calculate the rebase APR since a rebase can result from shares burning without changing total ETH held by the protocol.

```solidity
event PostTotalShares(
    uint256 postTotalPooledEther,
    uint256 preTotalPooledEther,
    uint256 timeElapsed,
    uint256 totalShares
)
```

:::note
The new [`TokenRebased`](/contracts/lido#TokenRebased) event emitted from the main Lido contract should be used instead because it provides the pre-report total shares amount as well which is essential to properly estimate a token rebase and its projected APR.
:::

#### Arguments

| Name                   | Type      | Description                                     |
| ---------------------- | --------- | ----------------------------------------------- |
| `postTotalPooledEther` | `uint256` | Post-report total pooled ether                  |
| `preTotalPooledEther`  | `uint256` | Pre-report total pooled ether                   |
| `timeElapsed`          | `uint256` | Time elapsed since the previous report, seconds |
| `totalShares`          | `uint256` | Post-report total shares                        |
