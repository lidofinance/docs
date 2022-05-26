# LidoExecutionLayerRewardsVault

- [Source Code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/LidoExecutionLayerRewardsVault.sol)
- [Deployed Contract](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)

A vault for temporary storage of execution layer (EL) rewards (MEV and tx priority fee).
See the Lido improvement proposal [#12](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-12.md).

Transactions priority fee collected by setting the the contract's address as a coinbase (`feeRecipient`). MEV rewards could be collected by the two ways simultenously: the first one require coinbase setup too but the second presumes that payload builders may include an explicit transaction which transfers MEV shares to the `feeRecipient` in the payload. Thus, the contract has the payable receive function which accepts incoming ether.

Only the `Lido` contract could withdraw the accumulated rewards to distribute them between `stETH` holders as part of the Lido oracle report.

NB: Accidentally sent by someone outside the Lido Node Operatorss set ether is unecoverable, and will be distributed by the protocol as the collected rewards.

## Methods

### receive()

Allows the contract to receive ETH via transactions.

Emits the `ETHReceived` event.

```sol
receive() external payable;
```

### withdrawRewards()

Withdraw all accumulated EL rewards to Lido contract. Can be called only by the Lido contract.
Returns withdrawn ether amount.

```sol
function withdrawRewards(uint256 _maxAmount) external returns (uint256 amount)
```

#### Parameters:

| Name         | Type      | Description                            |
| ------------ | --------- | -------------------------------------- |
| `_maxAmount` | `uint256` | Max amount of ETH to withdraw          |

### recoverERC20()

Transfers a given amount of an ERC20-token (defined by the provided token contract address)
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

Transfers a given tokenId of an ERC721-compatible NFT (defined by the provided token contract address)
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
