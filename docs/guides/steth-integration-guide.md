# stETH/wstETH integration guide

This document is intended for developers looking to integrate Lido's stETH or wstETH as an asset into their dApp, with a focus on money markets, DEXes and blockchain bridges.  

## Lido

Lido is a family of liquid staking protocols across multiple blockchains.  
Liquid refers to the ability for a user’s stake to become liquid. This is done by issuing a derivative that is closely pegged to the value of the staked asset.  
This guide refers to Lido on Ethereum (hereinafter referred to as Lido).
For ether staked in Lido, it gives users stETH that is equal to the amount staked. The main proposition of Lido is that stETH provides stakers with an ETH derivative that can be used throughout DeFi while accruing staking yield passively, it is paramount to preserve this stETH property when integrating it into any DeFi protocol.  

Lido's staking dericatives are widely adopted across Ethereum ecosystem. 
- The most important liquidity venues include [stETH<>ETH liquidity pool on Curve](https://curve.fi/steth) and [wstETH<>ETH MetaStable pool on Balancer v2](https://app.balancer.fi/pool/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080).
- stETH is [listed as collateral asset on AAVE v2 market](https://app.aave.com/reserve-overview/?underlyingAsset=0xae7ab96520de3a18e5e111b5eaab095312d7fe84&marketName=proto_mainnet) on Ethereum mainnet.
- wstETH is [listed as collateral asset on Maker](https://daistats.com/#/collateral).
- There are live ChainLink price feeds for [stETH/USD](https://app.ens.domains/name/steth-usd.data.eth) and [stETH/ETH](https://etherscan.io/address/0x86392dC19c0b719886221c78AB11eb8Cf5c52812) pairs.

## stETH vs. wstETH

There are two versions of Lido's staking derivative, namely stETH and wstETH. 
Both tokens are ERC-20 tokens, but they reflect the accrued staking rewards in different ways. stETH implements rebasing mechanics which means the stETH balance increases periodically. In cintrary, wstETH balance is constant, while the token increases in value eventually (denominated in ether). Both tokens share liquidity, stETH can be converted to wstETH via trustless wrapper and vice versa.

## stETH

### What is stETH

stETH is a ERC20 token that represents ether staked with Lido. Unlike staked ether, it is liquid and can be transferred, traded, or used in DeFi applications. Total supply of stETH reflects amount of ether deposited into protocol combined with staking rewards, minus potential validator penalties. stETH tokens are minted upon ether deposit at 1:1 ratio. When withdrawals from the Beacon chain will be introduced, it will also be possible to redeem ether by burning stETH at the same 1:1 ratio. 

Although considered a full ERC-20 token, stETH is rebasable. The stETH token balances are being recalculated daily when the Lido oracle reports Beacon chain ether balance update. The balance update happens automatically on all the addresses holding stETH at the moment of rebase. The rebase mechanics have been implemented via shares (see [shares](#steth-internals-share-mechanics).

### The Beacon chain oracle  

Normally, stETH balance rebases happen daily as soon as the Lido oeacle reports the Beacon chain ether balance update. The rebase can be positive or negative, depending on the validators' performance. In case Lido's validators get slashed, the daily rewards decrease according to penalty sizes. However, daily rebases have never been negative by the time of writing.
The Beacon chain oracle has sanity checks on both max APR reported (it cannot exceed 10%) and total staked amount drop (staked ether decrease reported cannot exceed 5%). Currently, the Beacon chain oracle report is based on five oracle daemons hosted by established node operators selected by the DAO. As soon as three out of five oracle daemons report matching Beacon chain data, the oracle reports it to the Lido smart contract and the rebase occurs. There is a [dedicated oracle dashboard](https://mainnet.lido.fi/#/lido-dao/0x442af784a788a5bd6f42a01ebe9f287a871243fb/) to monitor current Beacon chain reports.

#### Oracle corner cases

- In case oracle daemons do not report Beacon chain balance update or do not reach quorum, the oracle does not submit the daily report, and the daily rebase doesn't occur until the quorum is reached. 
- In case the quorum hasn't been reached, the oracle can skip the daily report. The report will happen as soon as the quorum for one of the next periods will be reached, and it will include the balance update for all the period since last oracle report. 
- Oracle daemons only report the finalized epochs. In case of no finality on the Beacon chain, the daemons won't submit their reports, and the daily rebase won't occur. 
- StETH smart contract includes [a method that allows burning stETH shares](https://github.com/lidofinance/lido-dao/blob/816bf1d0995ba5cfdfc264de4acda34a7fe93eba/contracts/0.4.24/StETH.sol#L391). The method is meant for in-protocol cover and doesn't interfere with oracle in any way. When sETH shares get burnt, the underlying ether adds up to the daily rewards for all stETH holders.

### stETH internals: share mechanics

Daily rebases result in stETH token balances changing. This mechanism is implemented via shares.
The `share` is a basic unit representing the stETH holder's share in the total amount of ether controlled by the protocol. When a new deposit happens, the new shares get minted to reflect what share of the protocol controlled ether has been added to the pool. When the Beacon chain oracle report comes in, the price of 1 share in ether is being recalculated. Shares aren't normalized, so the contract also stores the sum of all shares to calculate each account's token balance.

### 1 wei corner case

Because of math rounding down, there is a common case when the whole stETH balance can't be transferred from the account leaving 1 wei on the sender's account. Initially, 1 share was equal to 1 wei, but after each rebase this ratio changes depending on amount of recent deposits, withdrawals, staking rewards and slashing penalties.

Representative example:

1) User stakes 1 wei and receives 1 share
2) Some count of rebases happens, now 1 share is equal to 1.05 wei
3) User wants to withdraw 1.05 wei, math rounds it down to 1 wei
4) Protocol takes 1 wei and transforms it to 0.95 share, math rounds it down to 0 share
5) This number of shares can't be withdrawn

### Bookkeeping shares

Although user friendly, stETH rebases add a whole level of complexity to integrating stETH into other protocols. When integrating stETH as an assets into any dApp, it's highly recommended to store and operate shares rather than stETH public balances directly, because stETH balances change both upon transfers, mints'burns, and rebases, while shares balances can only change upon transfers and mints/burns.

Shares balance by ether balance can be calculated by this formula:

```
shares = ethAmount * totalShares / totalPooledEther
```

To transform stETH to shares `getSharesByPooledEth(uint256)` function can be used. It returns the value not affected by future rebases and it can be converted back into stETH by calling `getPooledEthByShares` function.

> See all available stETH methods [here](https://github.com/lidofinance/docs/blob/main/docs/contracts/lido.md#view-methods). 

Any operations on the shares can be done with no difference between share and stETH.

So the common case of using stETH should be:
1) get stETH token balance;
2) convert stETH balance into shares balance and use it as primary balance unit in your dapp;
3) when any operation on the balance should be done, do it on shares balance;
4) when users interact with stETH, convert shares balance back to stETH token balance.

> Please note that 10% APR on shares balance and 10% APR on stETH token balance will ultimately result in different output values.

If using the rebasable stETH token is not an option for your integration, it is recommended to use wstETH instead of stETH. See how it works [here](#wstETH).

### Fees

Lido collects a percentage of the staking rewards as a fee. The exact fee size is defined by the DAO and can be changed in the future via DAO voting. To collect the fee, the protocol mints new stETH token shares and assigns them to the fee recipients. Currenty, the fee collected by Lido protocol is 10% of staking rewards with half of it going to the node operators and the other half to the protocol treasury.

Since total amount of Lido pooled ether tends to increase, the combined value of all holders' shares denominated in stETH increases respectively. Thus, the rewards effectively spread between each token holder proportionally to their share in the protocol TVL. So Lido mints new shares to the fee recipient, so that the total cost of the newly-minted shares exactly corresponds to the fee taken:

```
shares2mint * newShareCost = (_totalRewards * feeBasis) / 10000
newShareCost = newTotalPooledEther / (prevTotalShares + shares2mint)
```
which follows to:
```
                        _totalRewards * feeBasis * prevTotalShares
shares2mint = --------------------------------------------------------------
                (newTotalPooledEther * 10000) - (feeBasis * _totalRewards)
```

### Do stETH rewards compound?

stETH holders receive staking rewards, but those don't compound. Actual APR diminishes slightly over time for two main reasons:

1. Beacon chain rewards don't compound. To get more rewards one should withdraw funds and re-deposit them, skimming rewards. Until withdrawals are enabled, that isn't technically possible. So, while the Lido's beacon chain balance increases over time, the yield bearing asset amount remains equal to deposited ether amount.
2. stETH holders receive rewards proportionally to their share in the stETH total supply. This share diminishes slightly over time because of the protocol fee on rewards because it eats up eventually from other holders' shares.

## wstETH

Due to the rebasing nature of stETH, the stETH balance on holder's address is not constant, it changes daily as oracle report comes in.
Although rebasable tokens are becoming a common thing in DeFi recently, many dApps do not support rebasing. For example, Maker, UniSwap, and SushiSwap are not designed for rebasable tokens. Listing stETH on these apps can result in holders not receiving their daily staking rewards which effectively defeats the benefits of liquid staking.

### What is wstETH

wstETH is an ERC20 token that represents the account's share of the total supply of stETH total supply (stETH token wrapper with static balances). The 1 wei of wstETH token equals the [share](#What-share-is) balance and can only be changed upon transfers, minting, and burning. wstETH balance does not rebase, wstETH's price denominated in stETH changes instead.  
At any given time, anyone holding wstETH can convert any amount of it to stETH at a fixed rate, and vice versa. The rate is the same for everyone at any given moment. The rate gets updated once a day, when stETH undergoes a rebase. The current rate can be obtained by calling `wstETH.stEthPerToken()`  

To be more consistent with stETH, wstETH allows to wrap stETH and get wstETH, and to unwrap wstETH to get stETH back. 

Note, that WstETH contract includes a shortcut to convert ether to wstETH under the hood, which allows to effectively skip the wrapping step and stake ether for wstETH directly.

### Rewards accounting

Insofar as wstETH represents the holder's share in the total amount of Lido-controlled ether, rebases don't affect wstETH balances, but change the wstETH price.

**Basic example**:

1) User wraps 1 stETH and gets 1 wstETH (1 stETH = 1 wstETH)
2) A rebase happens, the wstETH price goes up by 5%
3) User unwraps 1 wstETH and gets 1.05 stETH (1 stETH = 0.95 wstETH)


### Wrap & Unwrap

When wrapping stETH to wstETH, the desired amount of stETH is being locked on the WStETH contract balance and the wstETH is being minted according to the [shares bokkeeping](#Bookkeeping-shares) formula.

When unwrapping, wstETH gets burns and stETH is getting unlocked.

Thus, amount of stETH unlocked when unwrapping is diferent from what has been initially wrapped (given a rebase happened between wrapping and unwrapping wstETH).

## General integration examples

### stETH/wstETH as collateral

> Why is it a good collateral? Explain how liquidations would work. Explain Chainlink price feeds.
> Add examples of stETH/wstETH listed as collateral - Maker, Compound. Add relevant code examples (AAVE).
> Why is stETH/wstETH (not) great for borrowing?

### Wallet integrations

> Great UX of direct staking from the wallet.
> Referral program (how it works, whitelisting).
> How to handle rebases from the wallet (avoid caching balance for over 24hrs)

### Liquidity mining

> List the existing pools
> What happens to staking rewards accrued by the pool (Curve LP vs. Balancer LP ())?

### Cross chain bridging

> Explain how wstETH is the only asset to be bridged, not stETH

## Risks

1. Smart contract security
    There is an inherent risk that Lido could contain a smart contract vulnerability or bug. The Lido code is open-sourced, audited and covered by an extensive bug bounty program to minimise this risk.
2. ETH 2.0 - Technical risk
    Lido is built atop experimental technology under active development, and there is no guarantee that ETH 2.0 has been developed error-free. Any vulnerabilities inherent to ETH 2.0 brings with it slashing risk, as well as stETH fluctuation risk.
3. ETH 2.0 - Adoption risk
    The value of stETH is built around the staking rewards associated with the Ethereum beacon chain. If ETH 2.0 fails to reach required levels of adoption we could experience significant fluctuations in the value of ETH and stETH.
4. Slashing risk
    ETH 2.0 validators risk staking penalties, with up to 100% of staked funds at risk if validators fail. To minimise this risk, Lido stakes across multiple professional and reputable node operators with heterogeneous setups, with additional mitigation in the form of insurance that is paid from Lido fees.
5. stETH price risk
    Users risk an exchange price of stETH which is lower than inherent value due to withdrawal restrictions on Lido, making arbitrage and risk-free market-making impossible. The Lido DAO is driven to mitigate above risks and eliminate them entirely to the extent possible. Despite this, they may still exist and, as such, it is our duty to communicate them.
