# TransferLibrary

This utility abstracts away the differences between transferring native ETH and ERC20 tokens by introducing a unified interface for both sending and receiving assets. It also standardizes how native ETH is represented on-chain to simplify integration logic across different components.

## ETH Representation

The constant `ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (EIP-7528) is used as a sentinel value to distinguish native ETH from ERC20 tokens.

## Errors

- `InvalidValue()`: Thrown when the contract expects a specific `msg.value` (for native ETH transfers) but receives a different amount.

## Constants

- `ETH`: Reserved address used to represent native Ether. When passed to `sendAssets` or `receiveAssets`, the function will process ETH instead of calling token functions.

## Functions

### `sendAssets(address asset, address to, uint256 assets)`

Sends the specified asset (`assets` amount) to the recipient `to`.

- If `asset == ETH`, the function uses `Address.sendValue` to transfer native ETH.
- If `asset` is an ERC20 token, it uses `IERC20.safeTransfer`.

Parameters:

- `asset`: Address of the asset to transfer. Use `ETH` for native Ether or the ERC20 token address.
- `to`: Address to send the asset to.
- `assets`: Amount of the asset to transfer.

Reverts if the ETH transfer fails or the ERC20 transfer fails via `SafeERC20`.

### `receiveAssets(address asset, address from, uint256 assets)`

Receives assets from the caller (or a third party) into the current contract.

- If `asset == ETH`, verifies that `msg.value == assets`.
- If `asset` is an ERC20 token, calls `IERC20.safeTransferFrom` from `from` to the current contract.

Parameters:

- `asset`: Address of the asset to receive. Use `ETH` for native Ether or an ERC20 token address.
- `from`: Address sending the ERC20 tokens (ignored for ETH).
- `assets`: Expected amount of the asset to receive.

Reverts if the contract receives an incorrect `msg.value` for ETH or the ERC20 transfer fails.

:::note
Calling `receiveAssets(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, from, assets)` multiple times within a single function call will result in incorrect asset accounting. Do not use this function in scenarios like the following:

```solidity
function func() external payable {
    TransferLibrary.receiveAssets(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.sender, 1 ether);
    TransferLibrary.receiveAssets(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.sender, 1 ether);
    ...
}
```
:::
