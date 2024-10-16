# Lido tokens integration guide

This document is intended for developers looking to integrate Lido's stETH or wstETH tokens into their dApps or services, with a focus on money markets, DEXes and blockchain bridges.

:::info
The integration might be implemented on the level of smart contracts (on-chain) or [Lido on Ethereum SDK](/docs/integrations/sdk.md#lido-ethereum-sdk) (off-chain).
:::

## Lido

Lido is a family of liquid staking protocols across multiple blockchains, with headquarters on Ethereum.
Liquid refers to the ability of a user’s stake to become liquid. Upon the user's deposit Lido issues stToken, which represents the deposited tokens along with all the rewards & penalties accrued through the deposit's staking. Unlike the staked funds, this stToken is liquid — it can be freely transferred between parties, making it usable across different DeFi applications while still receiving daily staked rewards. It is paramount to preserve this property when integrating stTokens into any DeFi protocol.

This guide refers to Lido on Ethereum (hereinafter referred to as Lido).

## Lido tokens

### stTokens: stETH and wstETH

Staking ether with Lido gives an equivalent amount of [stETH](#steth).
The user's stETH balance represents the amount of ether withdrawable directly from the Lido protocol.

For easier DeFi integrations, `stETH` has a non-rebasable value-accruing (non-rebasable) counterpart called ['wrapped stETH'](#wsteth)
(or just `wstETH`).

Lido's ERC-20 compatible stTokens are widely adopted across the Ethereum ecosystem:

- The most important on-chain [liquidity venues](https://dune.com/lido/wsteth-liquidity) include:
  - [stETH/ETH liquidity pool on Curve](https://curve.fi/#/ethereum/pools/steth)
  - [wstETH/ETH pool on Uniswap V3](https://app.uniswap.org/explore/pools/ethereum/0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa)
  - [wstETH/ETH Composable stable pool on Balancer v2](https://app.balancer.fi/#/ethereum/pool/0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2)
- wstETH is listed as a collateral token on the following AAVE v3 markets:
  - [Ethereum mainnet](https://app.aave.com/reserve-overview/?underlyingAsset=0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0&marketName=proto_mainnet_v3)
  - [Arbitrum](https://app.aave.com/reserve-overview/?underlyingAsset=0x5979d7b546e38e414f7e9822514be443a4800529&marketName=proto_arbitrum_v3)
  - [Scroll](https://app.aave.com/reserve-overview/?underlyingAsset=0xf610a9dfb7c89644979b4a0f27063e9e7d7cda32&marketName=proto_scroll_v3)
  - [Base](https://app.aave.com/reserve-overview/?underlyingAsset=0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452&marketName=proto_base_v3)
  - [Optimism](https://app.aave.com/reserve-overview/?underlyingAsset=0x1f32b1c2345538c0c6f582fcb022739c4a194ebb&marketName=proto_optimism_v3)
  - [Polygon PoS](https://app.aave.com/reserve-overview/?underlyingAsset=0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd&marketName=proto_polygon_v3)
- wstETH is [listed as a collateral token on Maker](https://daistats.com/#/collateral)
- there are various [Mellow LRT](https://app.mellow.finance/restake) projects built on top of the (w)stETH
- stETH is listed as a collateral token on the AAVE v2 [Ethereum mainnet](https://app.aave.com/reserve-overview/?underlyingAsset=0xae7ab96520de3a18e5e111b5eaab095312d7fe84&marketName=proto_mainnet) market
- steCRV (the Curve stETH/ETH LP token) is [listed as a collateral token on Maker](https://daistats.com/#/collateral)
- Blast L2 integrated [stETH](https://docs.blastfutures.com/get-started/introduction/what-is-blast#how-blast-works) as a rebasable ether (being staked implicitly as a part of the L1->L2 ether bridging flow)
- there are multiple liquidity strategies built on top of Lido's stTokens, including [Yearn](https://yearn.fi/vaults/1/0xdCD90C7f6324cfa40d7169ef80b12031770B4325) and [Harvest Finance](https://harvest.finance/)

#### Integration utilities: Rate and price feeds

The current sentiment for the money markets and DeFi integrations in general is to consider Liquid Staked Tokens being backed by their native exchange rates against ETH.
This approach implies 1 stETH = 1 ETH pricing invariant to be used.

Real world applications include [AAVE v3](https://github.com/bgd-labs/aave-proposals/blob/main/src/AaveV2-V3PriceFeedsUpdate_20230613/PRICE-FEEDS-UPDATE-20230613.md#motivation)
markets and [Mellow LRT](https://etherscan.io/address/0x1Dc89c28e59d142688D65Bd7b22C4Fd40C2cC06d) pricing approaches.

More in depth analysis is available [here](https://www.comp.xyz/t/franklin-dao-request-for-comment-on-market-pricing-vs-exchange-rate-pricing-for-lsts-and-potential-oracle-implementations/5130).

There are following `wstETH/stETH` rate feeds available to use in conjunction with (w)stETH:

- [Ethereum Mainnet](https://etherscan.io/address/0x94336dF517036f2Bf5c620a1BC75a73A37b7bb16#readContract)
- [Arbitrum](https://data.chain.link/feeds/arbitrum/mainnet/wsteth-steth%20exchangerate)
- [Optimism](https://data.chain.link/feeds/optimism/mainnet/wsteth-steth%20exchangerate)
- [Scroll](https://data.chain.link/feeds/scroll/mainnet/wsteth-steth%20exchangerate)
- [Base](https://data.chain.link/feeds/base/base/wsteth-steth%20exchangerate)
- [Polygon PoS](https://data.chain.link/feeds/polygon/mainnet/wsteth-steth)
- [ZKSync](https://data.chain.link/feeds/zksync/zksync/wsteth-steth%20exchangerate)
:::note
The Ethereum Mainnet Chainlink-compatible feed is deployed and used by the Mellow LRT vaults, being a wrapper for `wstETH.getStETHByWstETH(10 ** decimals)`
:::

These feeds might be used to compose a target feed, e.g., for the `wstETH/USD` pair, see the following examples of AAVE v3 markets:

- [Ethereum Mainnet `WstETHSynchronicityPriceAdapter`](https://etherscan.io/address/0x8b6851156023f4f5a66f68bea80851c3d905ac93#code)
- [Optimism `CLSynchronicityPriceAdapterPegToBase`](https://optimistic.etherscan.io/address/0x80f2c02224a2e548fc67c0bf705ebfa825dd5439)
- [Arbitrum `CLSynchronicityPriceAdapterPegToBase`](https://arbiscan.io/address/0x945fd405773973d286de54e44649cc0d9e264f78)


### LDO

[LDO](#ldo-1) is a Lido governance ERC-20 compliant token derived from the [MiniMe Token](https://github.com/Giveth/minime).
Thus, LDO holder balances are queryable for an arbitrary block number, an essential security feature for the Lido voting mechanics.

### unstETH

A non-fungible token (NFT) is used to represent a withdrawal request position [in the protocol-level withdrawals queue](/contracts/withdrawal-queue-erc721) when a stToken holder decides to redeem it for ether via the protocol.

:::note
Unlike the other Lido's tokens (`stETH`, `wstETH`, and `LDO`), [unstETH](#withdrawals-unsteth) is non-fungible,
and implements the ERC-721 token standard instead of ERC-20.
:::

## stETH vs. wstETH

There are two versions of Lido's stTokens, namely stETH and wstETH.
Both are fungible tokens but they reflect the accrued staking rewards differently. stETH implements rebasing mechanics which means the stETH balance updates regularly. On the contrary, the wstETH balance does not change on its own but rather increases in value against stETH.

:::info
At any moment, any amount of stETH can be converted to wstETH via a trustless wrapper and vice versa, thus tokens effectively share liquidity.
:::

For instance, undercollateralized wstETH positions on Maker can be liquidated by unwrapping wstETH and swapping it for ether on Curve.

## stETH

### What is stETH

stETH is a rebasable ERC-20 token that represents ether staked with Lido. Unlike staked ether, it is liquid and can be transferred, traded, or used in DeFi applications. The total supply of stETH reflects the amount of ether deposited into protocol combined with staking rewards, minus potential validator penalties. stETH tokens are minted upon ether deposit at 1:1 ratio. Since withdrawals from the Consensus Layer have been introduced, it is also possible to redeem ether by burning stETH at the same 1:1 ratio (in rare cases it won't preserve 1:1 ratio though).

Please note, Lido has implemented staking rate limits aimed at reducing the post-Merge staking surge's impact on the staking queue & Lido’s socialized rewards distribution model. Read more about it [here](#staking-rate-limits).

stETH is a rebasable ERC-20 token. Normally, the stETH token balances get recalculated daily when the Lido oracle reports the Consensus Layer ether balance update. The stETH balance update happens automatically on all the addresses holding stETH at the moment of rebase. The rebase mechanics have been implemented via shares (see [shares](#steth-internals-share-mechanics)).

### Note on ERC-20 compliance

stETH does not strictly comply with ERC-20. The only exception is that it does not emit `Transfer()` on rebase as [ERC-20](https://eips.ethereum.org/EIPS/eip-20#events) standard requires.

### Accounting oracle

Normally, stETH rebases happen daily when the Lido oracle reports the Consensus Layer ether balance update. The rebase can be positive or negative, depending on the validators' performance. In case Lido's validators get slashed or penalized, the stETH balances can decrease according to penalty sizes. However, daily rebases have never been negative by the time of writing.

The accounting oracle has sanity checks on both max APR reported (the APR cannot exceed 27%, which means a daily rebase is limited to `(27/365)%`) and total staked amount drop (staked ether decrease reported cannot exceed 5%).

Currently, Oracle network includes 9 independent oracles, oracle daemons hosted by established node operators selected by the DAO.
As soon as five out of nine oracle daemons report the same data, reaching the consensus, the report goes to the Lido smart contract, and the rebase occurs.

#### Oracle corner cases

- In case oracle daemons do not report Consensus Layer balance update or do not reach quorum, the oracle does not submit the daily report, and the daily rebase doesn't occur until the quorum is reached.
- Oracle report might be delayed, but it will include values actual for the reporting refSlot. So, even if reported 2 hours late, it will include only rebase values for the original period.
- In case the quorum hasn't been reached, the oracle can skip the daily report. The report will happen as soon as the quorum for one of the next periods will be reached, and it will include the incremental balance update for all periods since the last successful oracle report.
- Oracle daemons only report the finalized epochs. In case of no finality on the Consensus Layer, the daemons won't submit their reports, and the daily rebase won't occur.
- In case sanity checks on max APR or total staked amount drop fail, the oracle report cannot be finalized, and the rebase cannot happen.

### stETH internals: share mechanics

Daily rebases result in stETH token balances changing. This mechanism is implemented via shares.
The `share` is a basic unit representing the stETH holder's share in the total amount of ether controlled by the protocol. When a new deposit happens, the new shares get minted to reflect what share of the protocol-controlled ether has been added to the pool. When the Consensus Layer oracle report comes in, the price of 1 share in stETH is being recalculated. Shares aren't normalized, so the contract also stores the sum of all shares to calculate each account's token balance.
Shares balance by stETH balance can be calculated by this formula:

```js
shares[account] = balanceOf(account) * totalShares / totalPooledEther
```

#### 1-2 wei corner case

stETH balance calculation includes integer division, and there is a common case when the whole stETH balance can't be transferred from the account while leaving the last 1-2 wei on the sender's account. The same thing can actually happen at any transfer or deposit transaction. In the future, when the stETH/share rate will be greater, the error can become a bit bigger. To avoid it, one can use `transferShares` to be precise.

Example:

1. User A transfers 1 stETH to User B.
2. Under the hood, stETH balance gets converted to shares, integer division happens and rounding down applies.
3. The corresponding amount of shares gets transferred from User A to User B.
4. Shares balance gets converted to stETH balance for User B.
5. In many cases, the actually transferred amount is 1-2 wei less than expected.

The issue is documented here: [lido-dao/issues/442](https://github.com/lidofinance/lido-dao/issues/442)

### Bookkeeping shares

Although user-friendly, stETH rebases add a whole level of complexity to integrating stETH into other dApps and protocols. When integrating stETH as a token into any dApp, it's highly recommended to store and operate shares rather than stETH public balances directly, because stETH balances change both upon transfers, mints/burns, and rebases, while shares balances can only change upon transfers and mints/burns.

To figure out the shares balance, `getSharesByPooledEth(uint256)` function can be used. It returns the value not affected by future rebases and it can be converted back into stETH by calling `getPooledEthByShares` function.

> See all available stETH methods [here](https://github.com/lidofinance/docs/blob/main/docs/contracts/lido.md#view-methods).

Any operation on stETH can be performed on shares directly, with no difference between share and stETH.

The preferred way of operating stETH should be:

1) get stETH token balance;
2) convert stETH balance into shares balance and use it as a primary balance unit in your dApp;
3) when any operation on the balance should be done, do it on the shares balance;
4) when users interact with stETH, convert the shares balance back to stETH token balance.

Please note that 10% APR on shares balance and 10% APR on stETH token balance will ultimately result in different output values over time, because shares balance is stable, while stETH token balance changes eventually.

There are two convenience methods to work with shares available for the stETH token:

- `transferShares` (when `msg.sender` spends their own balance)
- `transferSharesFrom` (when `msg.sender` spends the approved allowance)

If using the rebasable stETH token is not an option for your integration, it is recommended to use wstETH instead of stETH. See how it works [here](#wsteth).

### Transfer shares function for stETH

The [LIP-11](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-11.md) introduced the `transferShares` function which allows to transfer stETH in a "rebase-agnostic" manner: transfer in terms of [shares](#steth-internals-share-mechanics) amount.

Normally, one transfers stETH using ERC-20 `transfer` and `transferFrom` functions which accept as an input the amount of stETH, not the amount of the underlying shares.
Sometimes it's better operate with shares directly to avoid possible rounding issues. Rounding issues usually could appear after a token rebase.
This feature is aimed to provide an additional level of precision when operating with stETH.
Read more about the function in the [LIP-11](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-11.md).

Also, V2 upgrade introduced a `transferSharesFrom` to completely match ERC-20 set of transfer methods.

### Fees

Lido collects a percentage of the staking rewards as a protocol fee. The exact fee size is defined by the DAO and can be changed in the future via DAO voting. To collect the fee, the protocol mints new stETH token shares and assigns them to the fee recipients. Currently, the fee collected by Lido protocol is 10% of staking rewards with half of it going to the node operators and the other half going to the protocol treasury.

Since the total amount of Lido pooled ether tends to increase, the combined value of all holders' shares denominated in stETH increases respectively. Thus, the rewards effectively spread between each token holder proportionally to their share in the protocol TVL. So Lido mints new shares to the fee recipient so that the total cost of the newly-minted shares exactly corresponds to the fee taken (calculated in basis points):

```
shares2mint * newShareCost = (_totalRewards * feeBasis) / 10000
newShareCost = newTotalPooledEther / (prevTotalShares + shares2mint)
```

which follows:

```
                        _totalRewards * feeBasis * prevTotalShares
shares2mint = --------------------------------------------------------------
                (newTotalPooledEther * 10000) - (feeBasis * _totalRewards)
```

### How to get APR?

Please refer to [this page](https://docs.lido.fi/integrations/api/#last-lido-apr-for-steth) for the correct Lido V2 APR calculation.

It is worth noting that with withdrawals enabled, the APR calculation method for Lido has changed significantly.
When Lido V2 protocol finalizes withdrawal requests, the Lido contract excludes funds from TVL and assigns to burn underlying locked requests’ stETH shares in return. In other words, withdrawal finalization decreases both TVL and total shares.
The old V1 formula isn’t suitable anymore because it catches TVL changes, but skips total shares changes.

### Do stETH rewards compound?

Yes, stETH rewards do compound.

All rewards that are withdrawn from the Consensus Layer or received as MEV or EL priority fees (that aren't used to fulfill withdrawal requests) are finally restaked to set up new validators and receive more rewards at the end. So, we can say that stETH becomes fully auto-compounding after V2 release.

## wstETH

Due to the rebasing nature of stETH, the stETH balance on the holder's address is not constant, it changes daily as oracle report comes in.
Although rebasable tokens are becoming a common thing in DeFi recently, many dApps do not support rebasing. For example, Maker, UniSwap, and SushiSwap are not designed for rebasable tokens. Listing stETH on these apps can result in holders not receiving their daily staking rewards which effectively defeats the benefits of liquid staking. To integrate with such dApps, there's another form of Lido stTokens called wstETH (wrapped staked ether).

### What is wstETH

wstETH is an ERC20 token that represents the account's share of the stETH total supply (stETH token wrapper with static balances). For wstETH, 1 wei in [shares](#steth-internals-share-mechanics) equals to 1 wei in balance. The wstETH balance can only be changed upon transfers, minting, and burning. wstETH balance does not rebase, wstETH's price denominated in stETH changes instead.
At any given time, anyone holding wstETH can convert any amount of it to stETH at a fixed rate, and vice versa. The rate is the same for everyone at any given moment. Normally, the rate gets updated once a day, when stETH undergoes a rebase. The current rate can be obtained by calling `wstETH.stEthPerToken()` or `wstETH.getStETHByWstETH(10 ** decimals)`.

### Wrap & Unwrap

When wrapping stETH to wstETH, the desired amount of stETH is locked on the WstETH contract balance, and the wstETH is minted according to the [share bookkeeping](#bookkeeping-shares) formula.

When unwrapping, wstETH gets burnt and the corresponding amount of stETH gets unlocked.

Thus, the amount of stETH unlocked when unwrapping is different from what has been initially wrapped (given a rebase happened between wrapping and unwrapping stETH).

#### wstETH shortcut

Note, that the WstETH contract includes a shortcut to convert ether to wstETH under the hood, which allows you to effectively skip the wrapping step and stake ether for wstETH directly. Keep in mind that when using the shortcut, [the staking rate limits](#staking-rate-limits) still apply.

### Rewards accounting

Since wstETH represents the holder's share in the total amount of Lido-controlled ether, rebases don't affect wstETH balances but change the wstETH price denominated in stETH.

**Basic example**:

1. User wraps 1 stETH and gets 0.9803 wstETH (1 stETH = 0.9803 wstETH)
2. A rebase happens, the wstETH price goes up by 5%
3. User unwraps 0.9803 wstETH and gets 1.0499 stETH (1 stETH = 0.9337 wstETH)

### Holešky or Sepolia wstETH for testing

The most recent testnet version of the Lido protocol lives on the Holešky testnet ([see the full list of contracts deployed here](https://docs.lido.fi/deployed-contracts/holesky)). Just like on mainnet, Holešky wstETH for testing purposes can be obtained by approving the desired amount of stETH to the WstETH contract on Holešky, and then calling `wrap` method on it. The corresponding amount of Holešky stETH will be locked on the WstETH contract, and the wstETH tokens will be minted to your account. Holešky ether can also be converted to wstETH directly using the [wstETH shortcut](#wsteth-shortcut) – just send your Holešky ether to WstETH contract on Holešky, and the corresponding amount of wstETH will be minted to your account.

The minimal version of the protocol is also deployed on the Sepolia testnet ([see the full list of contracts deployed here](https://docs.lido.fi/deployed-contracts/sepolia)). The process of getting wstETH is the same as described above for Holešky. Note that the protocol setup on Sepolia has no UIs and various services available on Holešky and Mainnet. For instance, the in-protocol [withdrawals](/docs/contracts/withdrawal-queue-erc721.md) aren't available (paused indefinitely), please use the Holešky testnet deployment if possible.

### Lido Multichain

#### wstETH

Currently, wstETH token is [present on](/docs/deployed-contracts/index.md#lido-multichain):

- [Arbitrum](https://arbiscan.io/address/0x5979D7b546E38E414F7E9822514be443A4800529)
- [Optimism](https://optimistic.etherscan.io/address/0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb)
- [Scroll](https://scrollscan.com/address/0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32)
- [Base](https://basescan.org/address/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452)
- [Linea](https://lineascan.build/address/0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F)
- [ZKSync](https://docs.lido.fi/deployed-contracts/#zksync-era)
- [Mantle](https://explorer.mantle.xyz/address/0x458ed78EB972a369799fb278c0243b25e5242A83)
- [Polygon PoS](https://polygonscan.com/token/0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd)
- [Mode](https://explorer.mode.network/address/0x98f96A4B34D03a2E6f225B28b8f8Cb1279562d81)
- [Binance Smart Chain (BSC)](https://bscscan.com/address/0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C)

with bridging implemented via [the canonical bridges recommended approach](/docs/token-guides/wsteth-bridging-guide.md).

:::note
Unlike on the Ethereum mainnet, wstETH for Lido Multichain is a plain ERC-20 token and cannot be unwrapped to unlock stETH on the corresponding L2 network unless handled via [LIP-22](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-22.md)
:::

Without the shares bookkeeping, the token cannot provide the `wstETH/stETH` rate and the rewards accrued on-chain.
Use the [wstETH/stETH rate feeds](/guides/lido-tokens-integration-guide.md#integration-utilities-rate-and-price-feeds) listed above.

#### stETH (Optimism pilot)

Effective 2024 October, stETH token has become available [on Optimism](/docs/deployed-contracts/index.md#optimism).
The wstETH and stETH tokens design follows the [LIP-22](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-22.md) architecture approach.

- Token address: [`0x76A50b8c7349cCDDb7578c6627e79b5d99D24138`](https://optimistic.etherscan.io/address/0x76A50b8c7349cCDDb7578c6627e79b5d99D24138)
- wstETH/stETH in-protocol native rate feed on Optimism: [`0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0`](https://optimistic.etherscan.io/address/0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0)

The native rate feed allows getting `wstETH/stETH` in-protocol rate delivered from the L1 side by the canonical bridge.

## LDO

### What is LDO

LDO is a governance token used for the Lido DAO's voting process ([both off-chain and on-chain](https://lido.fi/governance#regular-process)).
The token is widely available in DeFi and CeFi ecosystems.

LDO has internal mechanics of the balance snapshots ([`balanceOfAt`](https://etherscan.io/address/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32#readContract#F5) and [`totalSupplyAt`](https://etherscan.io/address/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32#readContract#F10)) to allow voting power not being manipulated within the time of the ongoing vote.

### Note on ERC-20 compliance

Although the LDO is fully compliant with ERC-20, it is worth noting that the token doesn't revert a transaction on all of the
failure paths inside both `transfer` and `transferFrom` methods returning the `false` status instead.

:::note
It's critical to check the return status for external integrations as the ERC-20 token standard [requires](https://eips.ethereum.org/EIPS/eip-20#methods) to prevent various attack vectors (e.g. token deposits in vaults):

> Callers MUST handle `false` from `returns (bool success)`. Callers MUST NOT assume that `false` is never returned!
:::

## ERC20Permit

wstETH and stETH Ethereum Mainnet tokens implement the ERC20 Permit extension allowing approvals to be made via signatures, as defined in [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612).
stETH is also compatible with smart contract signatures, implementing [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) that is used as a part of the Account Abstraction.

The `permit` method allows users to modify the allowance using a signed message, instead of through `msg.sender`.
By not relying on `approve` method, you can build interfaces that will approve and use wstETH in one tx.

## Staking rate limits

In order to handle the staking surge in case of some unforeseen market conditions, the Lido protocol implemented staking rate limits aimed at reducing the surge's impact on the staking queue & Lido’s socialized rewards distribution model.
There is a sliding window limit that is parametrized with `_maxStakingLimit` and `_stakeLimitIncreasePerBlock`. This means it is only possible to submit this much ether to the Lido staking contracts within a 24-hours timeframe. Currently, the daily staking limit is set at 150,000 ether.

You can picture this as a health globe from Diablo 2 with a maximum of `_maxStakingLimit` and regenerating with a constant speed per block.
When you deposit ether to the protocol, the level of health is reduced by its amount and the current limit becomes smaller and smaller.
When it hits the ground, the transaction gets reverted.

To avoid that, you should check if `getCurrentStakeLimit() >= amountToStake`, and if it's not you can go with an alternative route.
The staking rate limits are denominated in ether, thus, it makes no difference if the stake is being deposited for stETH or using [the wstETH shortcut](#wsteth-shortcut), the limits apply in both cases.

### Alternative routes

1. Wait for staking limits to regenerate to higher values and retry depositing ether to Lido later.
2. Consider swapping ETH for stETH on DEXes like Curve or Balancer. At specific market conditions, stETH may effectively be purchased from there with a discount due to stETH price fluctuations.

## Withdrawals (unstETH)

Lido V2 introduced the possibility to withdraw ETH from the Lido on Ethereum protocol (i.e., primary market).

:::note
As in-protocol withdrawals have asynchronous nature and sophisticated execution flow, in general,
using secondary markets (exchanges and swap aggregators) might be more UX-friendly and convenient option to consider
for integrations.
:::

A high-level upgrade overview can be found in [the blog post](https://blog.lido.fi/introducing-lido-v2/).
Withdrawals flow is organized as a FIFO queue that accepts the requests with stETH attached and these requests are finalized with oracle reports as soon as ether to fulfill the request is available.

So to obtain ether from the protocol, you'll need to proceed with the following steps:

- request the withdrawal, locking your steth in the queue and receiving an NFT, that represents your position in the queue
- wait, until the request is finalized by the oracle report and becomes claimable
- claim your ether, burning the NFT

Request size should be at least **100 wei** (in stETH) and at most **1000 stETH**. Larger amounts should be withdrawn in multiple requests, which can be batched via in-protocol API. Once requested, withdrawal cannot be canceled. The withdrawal NFT can be transferred to a different address, and the new owner will be able to claim the requested withdrawal once finalized.

The amount of claimable ETH is determined once the withdrawal request is finalized. The rate stETH/ETH of the request finalization can't get higher than it's been at the moment of request creation. The user will be able to claim:

- normally – the ETH amount corresponding to the stETH amount at the moment of the request's placement

**OR**

- discounted - lowered ETH amount corresponding to the oracle-reported share rate in case the protocol had undergone significant losses (slashings and penalties)

The second option is unlikely, and we haven't ever seen the conditions for it on mainnet so far.

The end-user contract to deal with the withdrawals is `WithdrawalQueueERC721.sol`, which implements the ERC721 standard. NFT represents the position in the withdrawal queue and may be claimed after the finalization of the request.

Let's follow these steps in detail:

### Request withdrawal and mint NFT

You have several options for requesting withdrawals, they require you to have stETH or wstETH on your address:

#### stETH

- Call `requestWithdrawalsWithPermit(uint256[] _amounts, address _owner, PermitInput _permit)` and get the ids of created positions, where `msg.sender` will be used to transfer tokens from and the `_owner` will be the address that can claim or transfer NFT (defaults to `msg.sender` if it’s not provided)
- Alternatively, sending stETH on behalf of `WithdrawalQueueERC721.sol` contract can be approved in a separate upfront transaction (`stETH.approve(withdrawalQueueERC721.address, allowance)`), and the `requestWithdrawals(uint256[] _amounts, address _owner)` method called afterwards

#### wstETH

- Call `requestWithdrawalsWstETHWithPermit(uint256[] _amounts, address _owner, PermitInput _permit)` and get the ids of created positions, where `msg.sender` will be used to transfer tokens from, and the `_owner` will be the address that can claim or transfer NFT (defaults to `msg.sender` if it’s not provide)
- Alternatively, sending wstETH on behalf of `WithdrawalQueueERC721.sol` contract can be approved in a separate upfront transaction (`wstETH.approve(withdrawalQueueERC721.address, allowance)`), and the `requestWithdrawalsWstETH(uint256[] _amounts, address _owner)` method called afterwards

`PermitInput` structure is defined as follows:

```solidity
struct PermitInput {
    uint256 value;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
}
```

After request, [ERC721](https://eips.ethereum.org/EIPS/eip-721) NFT is minted to `_owner` address and can be transferred to the other owner who will have all the rights to claim the withdrawal.

Additionally, this NFT implements the [ERC4906](https://eips.ethereum.org/EIPS/eip-4906) standard and it's recommended to rely on

```solidity
event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
```

to update the NFT metadata if you're integrating it somewhere where it should be displayed correctly.

:::note
Withdrawal transactions made with `requestWithdrawalsWithPermit` or `requestWithdrawalsWstETHWithPermit` might fail due to being front-run by stealing the user-provided signature to execute `token.permit` method. It does not impose any fund loss risks nor blocks the capability to withdraw, but it affects the UX. For the details, see [this issue](https://github.com/lidofinance/lido-dao/issues/803).

It's recommended to mitigate the issue, e.g. by utilizing the approach used in [Lido staking widget](https://github.com/lidofinance/ethereum-staking-widget). Shortly, the idea is as follows. If the initial `...WithPermit` transaction fails, immediately resent the request but via `requestWithdrawals/requestWithdrawalsWstETH` method this time, seamlessly relying on the allowance already provided as a result of the griefing transaction.
For the specific example, see [the following code](https://github.com/lidofinance/ethereum-staking-widget/blob/ba65f2180ad0ab43b5f3bdcfeee118e6ceeabe7f/features/withdrawals/hooks/contract/useRequest.ts#L319C6-L319C6).

Any other viable approach for mitigation might be used as well. As one more example, deploy a wrapper smart contract that tries `requestWithdrawalsWithPermit/requestWithdrawalsWithPermitWstETH` and if [catches](https://docs.soliditylang.org/en/latest/control-structures.html#try-catch) the revert error, continues with `requestWithdrawals/requestWithdrawalsWstETH`, checking the allowance is enough.
:::

### Checking the state of withdrawal

- You can check all the withdrawal requests for the owner by calling `getWithdrawalRequests(address _owner)` which returns an array of NFT ids.
- To check the state of the particular NFTs you can call `getWithdrawalStatus(uint256[] _requestIds)` which returns an array of [`WithdrawalRequestStatus`](https://github.com/lidofinance/core/blob/master/contracts/0.8.9/WithdrawalQueueBase.sol#L67-L81) struct.

```solidity
    struct WithdrawalRequestStatus {
        /// @notice stETH token amount that was locked on withdrawal queue for this request
        uint256 amountOfStETH;
        /// @notice amount of stETH shares locked on withdrawal queue for this request
        uint256 amountOfShares;
        /// @notice address that can claim or transfer this request
        address owner;
        /// @notice timestamp of when the request was created, in seconds
        uint256 timestamp;
        /// @notice true, if request is finalized
        bool isFinalized;
        /// @notice true, if request is claimed. Request is claimable if (isFinalized && !isClaimed)
        bool isClaimed;
    }
```

>NOTE: Since stETH is an essential token if the user requests a withdrawal using wstETH directly, the amount will be nominated in stETH on request creation.

You can call `getClaimableEther(uint256[] _requestIds, uint256[] _hints)` to get the exact amount of eth that is reserved for the requests, where `_hints` can be found by calling `findCheckpointHints(__requestIds, 1, getLastCheckpointIndex())`. It will return a non-zero value only if the request is claimable (`isFinalized && !isClaimed`)

### Claiming

To claim ether you need to call:

- `claimWithdrawal(uint256 _requestId)` with the NFT Id on behalf of the NFT owner
- `claimWithdrawals(uint256[] _requestIDs, uint256[] _hints)` if you want to claim multiple withdrawals in batches or optimize on hint search
  - hints = `findCheckpointHints(uint256[] calldata _requestIDs, 1, lastCheckpoint)`
  - lastCheckpoint = `getLastCheckpointIndex()`

## General integration examples

### stETH/wstETH as collateral

stETH/wstETH as DeFi collateral is beneficial for several reasons:

- stETH/wstETH is almost as safe as ether, price-wise: barring catastrophic scenarios, its value tends to hold the ETH 1:1 well;
- stETH/wstETH is a productive token: getting rewards on collateral effectively lowers the cost of borrowing;
- stETH/wstETH is a very liquid token with billions of liquidity locked in liquidity pools (see [above](#sttokens-steth-and-wsteth))

Lido's staked tokens have been listed on major liquidity protocols:

- On Maker, [wstETH collateral (scroll down to Dai from WSTETH-A section)](https://daistats.com/#/collateral) can be used to mint DAI stablecoin. See [Lido's blog post](https://blog.lido.fi/makerdao-integrates-lidos-staked-eth-steth-as-collateral-asset/) for more details.
- On AAVE v3, multiple tokens can be borrowed against wstETH on various chains (see the list of the [markets](#sttokens-steth-and-wsteth))

Robust price sources are required for listing on most money markets, with ChainLink price feeds being the industry standard.
The default option to use is exchange [rate feeds](/guides/lido-tokens-integration-guide.md#sttokens-steth-and-wsteth) with an option to compose arbitrary feeds:

```python
'wstETH/X price feed' = 'wstETH/stETH rate feed' × 'ETH/X price feed'
```

### Wallet integrations

Lido's Ethereum staking services have been successfully integrated into the most popular DeFi wallets, including Ledger, Metamask, MyEtherWallet, ImToken and others.
Having stETH integrated can provide wallet users with a great user experience of direct staking from the wallet UI itself.

When adding stETH support to a DeFi wallet, it is important to preserve stETH's rebasing nature.
Note that stETH balance changes on each rebase without any incoming or outgoing user transfers and does not emit ERC-20 'Transfer' events.
As a consequence, avoid storing cached stETH balance for extended periods of time (over 24 hours).

The integration might be implemented leveraging the [Lido on Ethereum SDK](/docs/integrations/sdk.md#lido-ethereum-sdk)

### Cross chain bridging

The Lido's wstETH gets bridged to various L2's and sidechains.
The process of a new network adoption in a future-proof way is outlined as a part of the separate [bridging guide](/docs/token-guides/wsteth-bridging-guide.md).

Most cross-chain token bridges have no mechanics to handle rebases.
This means bridging stETH to other chains will prevent stakers from collecting their staking rewards.

:::warning
In the most common case, the rewards will naturally go to the bridge smart contract becoming locked there and never make it to the stakers.
:::

While working on full-blown bridging solutions, the Lido contributors encourage the users to only bridge the non-rebasable representation of staked ether, namely wstETH.

## Risks

There exist a number of potential risks when staking using liquid staking protocols.

### Smart contract security

  There is an inherent risk that Lido could contain a smart contract vulnerability or bug. The Lido code is open-source, audited, and covered by an extensive bug bounty program to minimize this risk. To mitigate smart contract risks, all of the core Lido contracts are audited. Audit reports can be found [here](https://github.com/lidofinance/audits). Besides, Lido is covered with a massive Immunefi bug bounty program.

### Slashing risk
  Validators risk staking penalties, with up to 100% of staked funds at risk if validators fail. To minimize this risk, Lido stakes across multiple professional and reputable node operators with heterogeneous setups, with additional mitigation in the form of self-coverage.

### stToken price risk
  Users risk an exchange price of stTokens which is lower than inherent value due to withdrawal restrictions on Lido, making arbitrage and risk-free market-making impossible. The Lido DAO is driven to mitigate the above risks to the extent possible. Despite this, they may still exist and, as such, it is our duty to communicate them.

The Lido DAO is driven to mitigate the above risks to the extent possible. Despite this, they may still exist.
