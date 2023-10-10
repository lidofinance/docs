# wstETH

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.6.12/WstETH.sol)
- [Deployed Contract](https://etherscan.io/token/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0)

## What is wrapped stETH (wstETH)?

It's an [ERC-20](https://eips.ethereum.org/EIPS/eip-20) value-accruing token
wrapper for `stETH`. Its balance does not change with each oracle report, but its
value in `stETH` does. Internally, it represents the user's [share](../guides/lido-tokens-integration-guide#steth-internals-share-mechanics) of the total
supply of `stETH` tokens.

## Why use wstETH?

`wstETH` is mainly used as a layer of compatibility to integrate `stETH` into other
DeFi protocols, that do not support rebasable tokens, especially bridges to L2s and
other chains, as rebases don't work for bridged assets by default.

## How to use wstETH?

The contract can be used as a trustless wrapper that accepts stETH tokens and mints
wstETH in return. When the user unwraps, the contract burns the user's `wstETH`,
and sends the user locked `stETH` in return.

### Staking shortcut

The user can send ETH with regular transfer to the address of the contract and
get wstETH in return. The contract will send ETH to Lido submit method,
staking it and wrapping the received stETH seamlessly under the hood.

## Standards

Contract implements the following Ethereum standards:

- [ERC-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [ERC-2612: Permit Extension for ERC-20 Signed Approvals](https://eips.ethereum.org/EIPS/eip-2612)
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)

## View Methods

### getWstETHByStETH()

Returns amount of `wstETH` for a given amount of `stETH`

```sol
function getWstETHByStETH(uint256 _stETHAmount) returns (uint256)
```

#### Parameters

| Name           | Type      | Description     |
| -------------- | --------- | --------------- |
| `_stETHAmount` | `uint256` | amount of stETH |

### getStETHByWstETH()

Returns amount of `stETH` for a given amount of `wstETH`

```sol
function getStETHByWstETH(uint256 _wstETHAmount) returns (uint256)
```

#### Parameters

| Parameter Name  | Type      | Description      |
| --------------- | --------- | ---------------- |
| `_wstETHAmount` | `uint256` | amount of wstETH |

### stEthPerToken()

Returns the amount of stETH tokens corresponding to one `wstETH`

```sol
function stEthPerToken() returns (uint256)
```

### tokensPerStEth()

Returns the number of `wstETH` tokens corresponding to one `stETH`

```sol
function tokensPerStEth() returns (uint256)
```

## Methods

### wrap()

Exchanges `stETH` to `wstETH`

```sol
function wrap(uint256 _stETHAmount) returns (uint256)
```

:::note
Requirements:

- `_stETHAmount` must be non-zero
- `msg.sender` must approve at least `_stETHAmount` stETH to this contract.
- `msg.sender` must have at least `_stETHAmount` of stETH.

:::

#### Parameters

| Parameter Name | Type      | Description                                    |
| -------------- | --------- | ---------------------------------------------- |
| `_stETHAmount` | `uint256` | amount of stETH to wrap in exchange for wstETH |

#### Returns

Amount of wstETH user receives after wrap

### unwrap()

Exchanges wstETH to `stETH`

```sol
function unwrap(uint256 _wstETHAmount) returns (uint256)
```

:::note
Requirements:

- `_wstETHAmount` must be non-zero
- `msg.sender` must have at least `_wstETHAmount` wstETH.

:::

#### Parameters

| Parameter Name  | Type      | Description                                     |
| --------------- | --------- | ----------------------------------------------- |
| `_wstETHAmount` | `uint256` | amount of wstETH to unwrap in exchange for stETH |

#### Returns

Amount of stETH user receives after unwrapping

### receive()

Shortcut to stake ETH and auto-wrap returned `stETH`

```sol
receive() payable
```
