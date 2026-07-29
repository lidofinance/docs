# WithdrawalVault

- [Source Code](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/WithdrawalVault.sol)
- [Deployed Contract](https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f)
- Inherits [WithdrawalVaultEIP7685](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/WithdrawalVaultEIP7685.sol). Abstract contract providing base functionality for [EIP-7685](https://eips.ethereum.org/EIPS/eip-7685) execution-layer requests.

## What is WithdrawalVault

A simple contract that accumulates partial and full withdrawals that come from the Beacon Chain. Its address corresponds to the Lido withdrawal credentials (both `0x01` and `0x02` types).
During the accounting oracle report, the vault is emptied by Lido into the internal buffer; see [Lido contract docs](lido.md#oracle-report) for details.

The vault is recoverable, so the DAO can transfer any ERC-20 and ERC-721 tokens to the treasury.

WithdrawalVault submits execution-layer requests on behalf of the protocol:

- [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) triggerable partial and full withdrawal requests, forwarded by the [TriggerableWithdrawalsGateway](/contracts/triggerable-withdrawals-gateway);
- [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) validator consolidation requests, forwarded by the [ConsolidationGateway](/contracts/consolidation-gateway).

The currently deployed version is upgradable because of anticipated Ethereum withdrawal mechanics changes.

## View methods

### getContractVersion()

Returns the current contract version.

```sol
function getContractVersion() returns (uint256)
```

## Methods

### withdrawWithdrawals()

Transfers the `_amount` of accumulated withdrawals to the Lido contract.

:::note
It can be called only by the [Lido](lido.md) contract.
:::

```sol
function withdrawWithdrawals(uint256 _amount)
```

### recoverERC20()

Transfers the given amount of the ERC20-token (defined by the provided token contract address)
currently belonging to the vault contract address to the Lido treasury address.

Emits a `ERC20Recovered` event.

```sol
function recoverERC20(address _token, uint256 _amount) external
```

#### Parameters:

| Name      | Type      | Description             |
| --------- | --------- | ----------------------- |
| `_token`  | `address` | ERC20-compatible token  |
| `_amount` | `uint256` | token amount to recover |

### recoverERC721()

Transfers the given tokenId of the ERC721-compatible NFT (defined by the provided token contract address)
currently belonging to the vault contract address to the Lido treasury address.

Emits an `ERC721Recovered` event.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

#### Parameters:

| Name       | Type      | Description             |
| ---------- | --------- | ----------------------- |
| `_token`   | `address` | ERC721-compatible token |
| `_tokenId` | `uint256` | minted token id         |

### addWithdrawalRequests()

Submits [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) full or partial withdrawal requests for the specified public keys.
Each full withdrawal request instructs a validator to fully withdraw its stake and exit its duties as a validator.
Each partial withdrawal request instructs a validator to withdraw a specified amount of ETH.

:::note
It can be called only by the [TriggerableWithdrawalsGateway](/contracts/triggerable-withdrawals-gateway) contract.
:::

```sol
function addWithdrawalRequests(bytes[] pubkeys, uint64[] amounts) payable
```

#### Parameters:

| Name      | Type       | Description                                                                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pubkeys` | `bytes[]`  | 48-byte public keys of validators requesting withdrawals                                                                        |
| `amounts` | `uint64[]` | Amounts in gwei to be withdrawn for each corresponding public key: `0` for a full withdrawal, greater than `0` for a partial one |

:::note
Reverts if the caller is not `TriggerableWithdrawalsGateway`, the public key array is empty or malformed,
the arrays are of unequal length, or the provided total withdrawal fee value is invalid.
:::

### addConsolidationRequests()

Submits [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) consolidation requests, one per (source, target) pair.
Each request instructs a source validator to consolidate its stake into the target validator.

:::note
It can be called only by the [ConsolidationGateway](/contracts/consolidation-gateway) contract.
:::

```sol
function addConsolidationRequests(bytes[] sourcePubkeys, bytes[] targetPubkeys) payable
```

#### Parameters:

| Name            | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| `sourcePubkeys` | `bytes[]` | 48-byte public keys of validators requesting the consolidation    |
| `targetPubkeys` | `bytes[]` | 48-byte public keys of validators receiving the consolidation     |

:::note
Reverts if the caller is not `ConsolidationGateway`, the public key arrays are empty or malformed,
the arrays are of unequal length, or the provided total consolidation fee value is invalid.
:::

### getWithdrawalRequestFee

Returns fee amount required per withdrawal request.

```solidity
function getWithdrawalRequestFee() public view returns (uint256);
```

#### Returns:

| Name                   | Type      | Description                     |
| ---------------------- | --------- | ------------------------------- |
| `withdrawalRequestFee` | `uint256` | Current withdrawal request fee. |

### getConsolidationRequestFee

Returns fee amount required per consolidation request.

```solidity
function getConsolidationRequestFee() external view returns (uint256);
```

#### Returns:

| Name                      | Type      | Description                        |
| ------------------------- | --------- | ---------------------------------- |
| `consolidationRequestFee` | `uint256` | Current consolidation request fee. |
