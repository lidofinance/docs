# LidoExecutionLayerRewardsVault

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/LidoExecutionLayerRewardsVault.sol)
- [Deployed Contract](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)

A vault for temporary storage of execution layer (EL) rewards (MEV and tx priority fee).
See the Lido improvement proposal [#12](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-12.md).

Both the transaction priority fee and MEV rewards are collected by specifying the contract's address as the coinbase (`feeRecipient`). Additionally, MEV rewards are also extracted whenever payload builders include an explicit transaction that transfers MEV shares to the `feeRecipient` in the payload. Thereby, the contract features a payable receive function that accepts incoming ether.

Only the [`Lido`](lido) contract can withdraw the accumulated rewards to distribute them between `stETH` holders as part of the [`Accounting Oracle`](accounting-oracle) report.

NB: Any ether sent to the contract by accident is unrecoverable and will be distributed by the protocol as accrued rewards.

## Methods

### receive()

Allows the contract to receive ETH via transactions.

Emits the `ETHReceived` event.

```sol
receive() external payable;
```

### withdrawRewards()

Move all accumulated EL rewards to the Lido contract. Can only be called by the Lido contract.
Returns the ether amount withdrawn.

```sol
function withdrawRewards(uint256 _maxAmount) external returns (uint256 amount)
```

#### Parameters:

| Name         | Type      | Description                            |
| ------------ | --------- | -------------------------------------- |
| `_maxAmount` | `uint256` | Max amount of ETH to withdraw          |

### recoverERC20()

Transfers the given amount of the ERC20-token (defined by the provided token contract address)
currently belonging to the vault contract address to the Lido treasury address.

Emits the `ERC20Recovered` event.


```sol
function recoverERC20(address _token, uint256 _amount) external
```

#### Parameters:

| Name       | Type      | Description             |
| ---------- | --------- | ----------------------- |
| `_token`   | `address` | ERC20-compatible token  |
| `_amount`  | `uint256` | token amount to recover |

### recoverERC721()

Transfers the given tokenId of the ERC721-compatible NFT (defined by the provided token contract address)
currently belonging to the vault contract address to the Lido treasury address.

Emits the `ERC721Recovered` event.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

#### Parameters:

| Name       | Type      | Description             |
| ---------- | --------- | ----------------------- |
| `_token`   | `address` | ERC721-compatible token |
| `_tokenId` | `uint256` | minted token id         |
