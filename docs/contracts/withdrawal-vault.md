# WithdrawalVault

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/WithdrawalVault.sol)
- [Deployed Contract](https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f)
- Inherits [WithdrawalVaultEIP7002](https://github.com/lidofinance/core/blob/master/contracts/0.8.9/WithdrawalVaultEIP7002.sol). Interface that implements basic EIP-7002 functionality.

## What is WithdrawalVault

A simple contract that accumulates partial and full withdrawals that come from the Beacon Chain. Its address corresponds to the type-0x01 Lido withdrawal credentials.
During the accounting oracle report, the vault is emptied by Lido into the internal buffer; see [Lido contract docs](lido.md#oracle-report) for details.

The vault is recoverable, so the DAO can transfer any ERC-20 and ERC-721 tokens to the treasury.

WithdrawalVault supports [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) - execution-layer triggered partial and full withdrawals.

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
|-----------|-----------|-------------------------|
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
|------------|-----------|-------------------------|
| `_token`   | `address` | ERC721-compatible token |
| `_tokenId` | `uint256` | minted token id         |


### getWithdrawalRequestFee

Returns fee amount required per withdrawal request.

```solidity
function getWithdrawalRequestFee() public view returns (uint256);
```

#### Returns:

| Name                   | Type      | Description                     |
|------------------------|-----------|---------------------------------|
| `withdrawalRequestFee` | `uint256` | Current withdrawal request fee. |
