# CSVerifier

- [Source code](https://github.com/lidofinance/community-staking-module/blob/fa7ba8a0bab685fc924aa1b135b8d59f4c6de497/src/CSVerifier.sol)
- [Deployed contract](https://etherscan.io/address/0x3Dfc50f22aCA652a0a6F28a0F892ab62074b5583)

CSVerifier.sol is the utility contract responsible for the validation of the CL data proofs using [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788). It accepts proof of the validator withdrawal and slashing events and reports these facts to the CSModule.sol if the proof is valid.

## Upgradability

The contract is immutable.

## State Variables

### BEACON_ROOTS

```solidity
address public constant BEACON_ROOTS = 0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02;
```

### SLOTS_PER_EPOCH

```solidity
uint64 public immutable SLOTS_PER_EPOCH;
```

### GI_FIRST_WITHDRAWAL_PREV

_This index is relative to a state like: `BeaconState.latest_execution_payload_header.withdrawals[0]`._

```solidity
GIndex public immutable GI_FIRST_WITHDRAWAL_PREV;
```

### GI_FIRST_WITHDRAWAL_CURR

_This index is relative to a state like: `BeaconState.latest_execution_payload_header.withdrawals[0]`._

```solidity
GIndex public immutable GI_FIRST_WITHDRAWAL_CURR;
```

### GI_FIRST_VALIDATOR_PREV

_This index is relative to a state like: `BeaconState.validators[0]`._

```solidity
GIndex public immutable GI_FIRST_VALIDATOR_PREV;
```

### GI_FIRST_VALIDATOR_CURR

_This index is relative to a state like: `BeaconState.validators[0]`._

```solidity
GIndex public immutable GI_FIRST_VALIDATOR_CURR;
```

### GI_HISTORICAL_SUMMARIES_PREV

_This index is relative to a state like: `BeaconState.historical_summaries`._

```solidity
GIndex public immutable GI_HISTORICAL_SUMMARIES_PREV;
```

### GI_HISTORICAL_SUMMARIES_CURR

_This index is relative to a state like: `BeaconState.historical_summaries`._

```solidity
GIndex public immutable GI_HISTORICAL_SUMMARIES_CURR;
```

### FIRST_SUPPORTED_SLOT

_The very first slot the verifier is supposed to accept proofs for._

```solidity
Slot public immutable FIRST_SUPPORTED_SLOT;
```

### PIVOT_SLOT

_The first slot of the currently compatible fork._

```solidity
Slot public immutable PIVOT_SLOT;
```

### WITHDRAWAL_ADDRESS

_An address withdrawals are supposed to happen to (Lido withdrawal credentials)._

```solidity
address public immutable WITHDRAWAL_ADDRESS;
```

### MODULE

_Staking module contract_

```solidity
ICSModule public immutable MODULE;
```

## Functions

### processSlashingProof

Verify slashing proof and report slashing to the module for valid proofs

```solidity
function processSlashingProof(
  ProvableBeaconBlockHeader calldata beaconBlock,
  SlashingWitness calldata witness,
  uint256 nodeOperatorId,
  uint256 keyIndex
) external;
```

**Parameters**

| Name             | Type                        | Description                                                   |
| ---------------- | --------------------------- | ------------------------------------------------------------- |
| `beaconBlock`    | `ProvableBeaconBlockHeader` | Beacon block header                                           |
| `witness`        | `SlashingWitness`           | Slashing witness                                              |
| `nodeOperatorId` | `uint256`                   | ID of the Node Operator                                       |
| `keyIndex`       | `uint256`                   | Index of the validator key in the Node Operator's key storage |

### processWithdrawalProof

Verify withdrawal proof and report withdrawal to the module for valid proofs

```solidity
function processWithdrawalProof(
  ProvableBeaconBlockHeader calldata beaconBlock,
  WithdrawalWitness calldata witness,
  uint256 nodeOperatorId,
  uint256 keyIndex
) external;
```

**Parameters**

| Name             | Type                        | Description                                                   |
| ---------------- | --------------------------- | ------------------------------------------------------------- |
| `beaconBlock`    | `ProvableBeaconBlockHeader` | Beacon block header                                           |
| `witness`        | `WithdrawalWitness`         | Withdrawal witness                                            |
| `nodeOperatorId` | `uint256`                   | ID of the Node Operator                                       |
| `keyIndex`       | `uint256`                   | Index of the validator key in the Node Operator's key storage |

### processHistoricalWithdrawalProof

Verify withdrawal proof against historical summaries data and report withdrawal to the module for valid proofs

```solidity
function processHistoricalWithdrawalProof(
  ProvableBeaconBlockHeader calldata beaconBlock,
  HistoricalHeaderWitness calldata oldBlock,
  WithdrawalWitness calldata witness,
  uint256 nodeOperatorId,
  uint256 keyIndex
) external;
```

**Parameters**

| Name             | Type                        | Description                                                   |
| ---------------- | --------------------------- | ------------------------------------------------------------- |
| `beaconBlock`    | `ProvableBeaconBlockHeader` | Beacon block header                                           |
| `oldBlock`       | `HistoricalHeaderWitness`   | Historical block header witness                               |
| `witness`        | `WithdrawalWitness`         | Withdrawal witness                                            |
| `nodeOperatorId` | `uint256`                   | ID of the Node Operator                                       |
| `keyIndex`       | `uint256`                   | Index of the validator key in the Node Operator's key storage |
