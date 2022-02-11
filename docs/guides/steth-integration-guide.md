# stETH/wstETH integration guide

This document is intended for developers looking to integrate Lido's stETH or wstETH as an asset into their dApp, with a focus on money markets, DEXes and blockchain bridges.  

## Lido

Lido is a liquid staking protocol.  
Liquid refers to the ability for a user’s stake to become liquid. This is done by issuing a derivative that is closely pegged to the value of the staked asset. 
For ether staked in Lido, it gives users stETH that is equal to the amount staked. The main proposition of Lido is that stETH provides stakers with an ETH derivative that can be used throughout DeFi while accruing staking yield passively, it is paramount to preserve this stETH property when integrting it into any DeFi protocol.  
> Add current status of Lido's staking derivatives, e.g.: liquidity venues, listings on money markets, L2 and sidechain presence, price data sources.

## stETH vs. wstETH

There are two versions of Lido's staking derivative, namely stETH and wstETH. 
> Explain the basic difference between the tokens: both are ERC20, but stETH is rebasing, while wstETH increases in value eventually. Both tokens share liquidity, stETH can be converted to wstETH via trustless wrapper and vice versa.

## stETH

### What is stETH

stETH is a rebaseable ERC20 token that represents ether staked with Lido. Unlike staked ether, it is liquid and can be transferred, traded, or used in DeFi applications. Total supply of stETH reflects amount of ether deposited into protocol combined with staking rewards, minus potential validator penalties. stETH tokens are minted upon ether deposit at 1:1 ratio. When withdrawals from the Beacon chain will be introduced, it will also be possible to redeem ether by burning stETH at the same 1:1 ratio. 

The stETH token balances are being recalculated daily when the Lido oracle reports Beacon chain ether balance update. The balance update happens automatically on all the addresses holding stETH at the moment of rebase. The rebase mechanics have been implemented via shares (see [shares](#what-is-share)).

> The Beacon chain oracle explained: rebases happen daily, can be positive or negative. The Beacon chain oracle has sanity checks on both max APR reported (no more than 10%) and total staked amount drop (no more than 5%). The oracle is run by established node operators selected by the DAO. Corner cases: skipped report, two reports. Corner case: on-chain cover applies.

### What is share

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

Although user friendly, stETH rebases add a whole level of complexity to onboarding stETH. When integrating stETH as an assets into any dApp, it's highly recommended to store and operate shares rather than stETH public balances directly, because stETH balances change both upon transfers, mints'burns, and rebases, while shares balances can only change upon transfers and mints/burns.

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

If using the rebaseable stETH token is not an option for your integration, it is recommended to use wstETH instead of stETH. See how it works [here](#wstETH).

### Fees

Lido collects a percentage of the reward as a fee. The exact fee is defined by the DAO. To collect the fee, the protocol mints new stETH token shares and assigns them to the fee recipients.

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

### Does stETH compound?

stETH holders receive staking rewards, but those don't compound. Actual APR diminishes slightly over time for two main reasons:

1. Beacon chain rewards don't compound. To get more rewards one should withdraw funds and re-deposit them, skimming rewards. Until withdrawals are enabled, that can't be done at all. So, while the Lido's beacon chain balance increases over time, the yield bearing asset amount remains equal to deposited ether amount.
2. stETH holders receive rewards proportionally to their share in the total staked ETH. This share diminishes slightly with time because of the protocol fees on rewards (10% of rewards are distributed between Node Operators & the protocol Treasury).

## wstETH

Due to the rebasing nature of stETH, the stETH balance on holder's address is not constant, it changes daily as oracle report comes in.
Although rebaseable tokens are becoming a common thing in DeFi recently, many dApps do not support rebasing. For example, Maker, UniSwap, and SushiSwap are not designed for rebaseable tokens. Listing stETH on these apps can result in holders losing a portion of their daily staking rewards effectively defeating the benefits of liquid staking.

### What wstETH is

wstETH is an ERC20 token that represents the account's share of the total supply of stETH tokens (stETH token wrapper with static balances). The 1 wei of wstETH token equals the [share](#What-share-is) balance and can only be changed upon transfers, minting, and burning. wstETH balance does not rebase.  
At any given time, anyone holding wstETH can convert any amount of it to stETH at a fixed rate, and vice versa. The rate is the same for everyone at any given moment. The rate gets updated once a day, when stETH undergoes a rebase. The current rate can be obtained by calling `wstETH.stEthPerToken()`  

To be more consistent with stETH, wstETH allows to wrap stETH and get wstETH and to unwrap wstETH to get stETH back.

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
Note, that WstETH contract includes a shortcut to convert ether to wstETH under the hood, which allows to effectively skip the wrapping step and stake ether for wstETH directly.

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
