# wstETH

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.6.12/WstETH.sol)
- [Deployed Contract](https://etherscan.io/token/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0)

It's an ERC20 token that represents the account's share of the total
supply of stETH tokens. WstETH token's balance only changes on transfers,
unlike StETH that is also changed when oracles report staking rewards and
penalties. It's a "power user" token for DeFi protocols which don't
support rebasable tokens.

The contract is also a trustless wrapper that accepts stETH tokens and mints
wstETH in return. Then the user unwraps, the contract burns user's wstETH
and sends user locked stETH in return.

The contract provides the staking shortcut: user can send ETH with regular
transfer and get wstETH in return. The contract will send ETH to Lido submit
method, staking it and wrapping the received stETH.

## View Methods

### getWstETHByStETH()

Returns amount of wstETH for a given amount of stETH

```sol
function getWstETHByStETH(uint256 _stETHAmount) returns (uint256)
```

#### Parameters:

| Name           | Type      | Description     |
| -------------- | --------- | --------------- |
| `_stETHAmount` | `uint256` | amount of stETH |

### getStETHByWstETH()

Returns amount of stETH for a given amount of wstETH

```sol
function getStETHByWstETH(uint256 _wstETHAmount) returns (uint256)
```

#### Parameters:

| Parameter Name  | Type      | Description      |
| --------------- | --------- | ---------------- |
| `_wstETHAmount` | `uint256` | amount of wstETH |

### stEthPerToken()

Returns the amount of stETH tokens corresponding to one wstETH

```sol
function stEthPerToken() returns (uint256)
```

### tokensPerStEth()

Returns the amount of wstETH tokens corresponding to one stETH

```sol
function tokensPerStEth() returns (uint256)
```

## Methods

### wrap()

Exchanges stETH to wstETH

```sol
function wrap(uint256 _stETHAmount) returns (uint256)
```

:::note
Requirements:

- `_stETHAmount` must be non-zero
- `msg.sender` must approve at least `_stETHAmount` stETH to this contract.
- `msg.sender` must have at least `_stETHAmount` of stETH.

:::

#### Parameters:

| Parameter Name | Type      | Description                                    |
| -------------- | --------- | ---------------------------------------------- |
| `_stETHAmount` | `uint256` | amount of stETH to wrap in exchange for wstETH |

#### Returns:

Amount of wstETH user receives after wrap

### unwrap()

Exchanges wstETH to stETH

```sol
function unwrap(uint256 _wstETHAmount) returns (uint256)
```

:::note
Requirements:

- `_wstETHAmount` must be non-zero
- `msg.sender` must have at least `_wstETHAmount` wstETH.

:::

#### Parameters:

| Parameter Name  | Type      | Description                                     |
| --------------- | --------- | ----------------------------------------------- |
| `_wstETHAmount` | `uint256` | amount of wstETH to uwrap in exchange for stETH |

#### Returns:

Amount of stETH user receives after unwrap

### receive()

Shortcut to stake ETH and auto-wrap returned stETH

```sol
receive() payable
```
