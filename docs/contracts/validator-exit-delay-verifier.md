# ValidatorExitDelayVerifier

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/ValidatorExitDelayVerifier.sol)
- [Deployed contract](https://etherscan.io/address/0xbDb567672c867DB533119C2dcD4FB9d8b44EC82f)

## What is ValidatorExitDelayVerifier

`ValidatorExitDelayVerifier` is a helper contract that accepts reports about validators that have not started to exit within the allowed window after being requested to exit via the Validators Exit Bus. It verifies basic preconditions and forwards accepted reports into the staking modules through the `StakingRouter`.

In short: when a validator remains eligible to exit for too long (exceeds a node-operator threshold), the contract accepts a proof and calls `StakingRouter.reportValidatorExitDelay(...)`. The data is then propagated to the respective staking module (e.g., Curated, Simple DVT, CSM) where exit-delay penalties may be applied per module rules.

## Methods

### verifyValidatorExitDelay

Verifies that the provided validators were not requested to exit on the CL after a VEB exit request. Reports exit delays to the Staking Router.

```solidity
function verifyValidatorExitDelay(
    ProvableBeaconBlockHeader calldata beaconBlock,
    ValidatorWitness[] calldata validatorWitnesses,
    ExitRequestData calldata exitRequests
) external;
```

#### Parameters

| Name                 | Type                        | Description                                                                        |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `beaconBlock`        | `ProvableBeaconBlockHeader` | Header of the beacon block root with block timestamp                               |
| `validatorWitnesses` | `ValidatorWitness[]`        | Validators' state at the specified slot with proofs from the EL and CL             |
| `exitRequests`       | `ExitRequestData`           | Data submitted to the VEB. Used to verify that the validator was requested to exit |

### verifyHistoricalValidatorExitDelay

Verifies that the provided validators were not requested to exit on the CL after a VEB exit request. Reports exit delays to the Staking Router.
Contains additional proof for historical blocks.

```solidity
function verifyHistoricalValidatorExitDelay(
  ProvableBeaconBlockHeader calldata beaconBlock,
  HistoricalHeaderWitness calldata oldBlock,
  ValidatorWitness[] calldata validatorWitnesses,
  ExitRequestData calldata exitRequests
) external;
```

| Name                 | Type                        | Description                                                                              |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `beaconBlock`        | `ProvableBeaconBlockHeader` | Header of the beacon block root with block timestamp                                     |
| `oldBlock`           | `HistoricalHeaderWitness`   | Historical block header witness data and its proof                                       |
| `validatorWitnesses` | `ValidatorWitness[]`        | Array of validator witnesses confirming they have not yet exited in `beaconBlock.header` |
| `exitRequests`       | `ExitRequestData`           | Data submitted to the VEB. Used to verify that validator was requested to exit           |
