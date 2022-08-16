# How to claim Lido early stakers airdrop
This is how to claim Lido early stakers airdrop with Etherscan UI

## Introduction

### Who is eligible to claim Lido early stakers airdrop?

LDO Airdrop could be claimed by early Lido stakers. [Here](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv) you can find a list of addresses for which airdrops are available.

### How to find out the volume of available airdrop?

[Here](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv) you can see your airdrop LDO amount. The formula is detailed in the [proposal](https://research.lido.fi/t/proposal-16-retroactive-airdrop-0-5-ldo-to-early-steth-users/69/18).

## Airdrop claiming

### 1. Check if you are eligible to claim airdrop

Find your address [here](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv) and get your index.

If there is no your address [here](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv) you are not eligible to claim airdrop.

### 2. Check if you haven’t already claimed your airdrop
2.1 Go to [Etherscan](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b) (contract address  - [0x4b3EDb22952Fb4A70140E39FB1adD05A6B49622B](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b))

2.2 Paste your index on `isClaimed` method (1 row on [“Contract/Read contract”](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b#readContract) tab)

2.3 Press the “Query” button

2.4 Make sure that the method result is `false`

:::note
if you get `true` as a result of this step, it means that this reward was claimed earlier, and you can’t claim it once again

:::

### 3. Claim your LDO airdrop

3.1 Open [“Contract/Write contract”](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b#writeContract) tab on Etherscan

3.2 Connect your wallet to Etherscan with either MetaMask or WalletConnect

3.3 Fill-in `Claim` method fields with data from [here](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv)
- index (uint256)
- account (address)
- amount (uint256)
- merkleProof (bytes32[])

3.4 Press the “Write” button and confirm the transaction in your wallet

3.5 Wait for the transaction to succeed

:::note
in case of invalid input transaction can be reverted

:::


That's it! 💪🎉🏝
