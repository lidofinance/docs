# StableSwapStateOracle

- [Source Code](https://github.com/lidofinance/curve-merkle-oracle/blob/main/contracts/StableSwapStateOracle.sol)
- [Deployed Contract](https://etherscan.io/address/0x3a6bd15abf19581e411621d669b6a2bbe741ffd6)

A trustless oracle for the ETH/stETH Curve pool using Merkle Patricia proofs of Ethereum state.

Contract receives and verifies the report from the offchain code,
and persists the verified state along with its timestamp.

The oracle assumes that the pool's `fee` and `A` (amplification coefficient) values don't
change between the time of proof generation and submission.

## Mechanics

The oracle works by verifying Merkle Patricia proofs of the following Ethereum state:

- Curve stETH/ETH pool contract account and the following slots from its storage trie:

  - `admin_balances[0]`
  - `admin_balances[1]`

- stETH contract account and the following slots from its storage trie:
  - `shares[0xDC24316b9AE028F1497c275EB9192a3Ea0f67022]`
  - `keccak256("lido.StETH.totalShares")`
  - `keccak256("lido.Lido.beaconBalance")`
  - `keccak256("lido.Lido.bufferedEther")`
  - `keccak256("lido.Lido.depositedValidators")`
  - `keccak256("lido.Lido.beaconValidators")`

## View Methods

### getState()

```sol
function getState() external view returns (
  uint256 _timestamp,
  uint256 _etherBalance,
  uint256 _stethBalance,
  uint256 _stethPrice
)
```

Returns current state of oracle

| Return Parameter | Type      | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `_timestamp`     | `uint256` | The timestamp of the proven pool state/price |
| `_etherBalance`  | `uint256` | The proven ETH balance of the pool           |
| `_stethBalance`  | `uint256` | The proven stETH balance of the pool         |
| `_stethPrice`    | `uint256` | The proven stETH/ETH price in the pool       |

### getProofParams()

```sol
function getProofParams() external view returns (
  address poolAddress,
  address stethAddress,
  bytes32 poolAdminEtherBalancePos,
  bytes32 poolAdminCoinBalancePos,
  bytes32 stethPoolSharesPos,
  bytes32 stethTotalSharesPos,
  bytes32 stethBeaconBalancePos,
  bytes32 stethBufferedEtherPos,
  bytes32 stethDepositedValidatorsPos,
  bytes32 stethBeaconValidatorsPos,
  uint256 advisedPriceUpdateThreshold
)
```

Returns values of proof params

## Methods

### setAdmin()

```sol
function setAdmin(address _admin) external
```

Passes the right to set the suggested price update threshold to a new address.

| Parameter Name | type      | Description       |
| -------------- | --------- | ----------------- |
| `_admin`       | `address` | New admin address |

### setPriceUpdateThreshold()

```sol
function setPriceUpdateThreshold(uint256 _priceUpdateThreshold) external
```

Sets the suggested price update threshold.

| Parameter Name          | type      | Description                                                                                      |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `_priceUpdateThreshold` | `uint256` | The suggested price update threshold. Expressed in basis points, 10000 BP corresponding to 100%. |

### submitState()

```sol
function submitState(
  bytes memory _blockHeaderRlpBytes,
  bytes memory _proofRlpBytes
) external
```

Used by the offchain clients to submit the proof

:::note
Reverts unless:

- the block the submitted data corresponds to is in the chain;
- the block is at least `MIN_BLOCK_DELAY` blocks old
- all submitted proofs are valid

:::

| Parameter Name         | type    | Description                                 |
| ---------------------- | ------- | ------------------------------------------- |
| `_blockHeaderRlpBytes` | `bytes` | RLP-encoded block header                    |
| `_proofRlpBytes`       | `bytes` | RLP-encoded list of Merkle Patricia proofs. |

`_proofRlpBytes` contains next encoded variables in exact order:

1. proof of the Curve pool contract account;
2. proof of the stETH contract account;
3. proof of the `admin_balances[0]` slot of the Curve pool contract;
4. proof of the `admin_balances[1]` slot of the Curve pool contract;
5. proof of the `shares[0xDC24316b9AE028F1497c275EB9192a3Ea0f67022]` slot of stETH contract;
6. proof of the `keccak256("lido.StETH.totalShares")` slot of stETH contract;
7. proof of the `keccak256("lido.Lido.beaconBalance")` slot of stETH contract;
8. proof of the `keccak256("lido.Lido.bufferedEther")` slot of stETH contract;
9. proof of the `keccak256("lido.Lido.depositedValidators")` slot of stETH contract;
10. proof of the `keccak256("lido.Lido.beaconValidators")` slot of stETH contract.
