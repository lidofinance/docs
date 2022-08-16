# How to claim 1inch stETH/LDO pool rewards
This is how to claim 1inch stETH/LDO pool rewards with Etherscan UI.

Rewards distributed to LP on [1inch stETH/LDO pool](https://etherscan.io/address/0x1f629794b34ffb3b29ff206be5478a52678b47ae) proportional to the amount of liquidity and timespan of providing it as described in the [proposal](https://research.lido.fi/t/proposal-ldo-incentives-to-liquidity-providers-on-ldo-steth-pair-on-1inch-exchange/274).

## Reward claiming

### 1. Check if you are eligible to claim the reward

Find your address [here](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv) and get your index.

If there is no your address [here](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv) you are not eligible to claim the reward.

### 2. Check if you haven’t already claimed your reward
2.1 Go to [Etherscan](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296) (contract address  - [0xdB46C277dA1599390eAb394327602889E9546296](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296))

2.2 Paste your index on `isClaimed` method (1 row on [“Contract/Read contract”](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296#readContract) tab)

2.3 Press the “Query” button

2.4 Make sure that the method result is `false`

:::note
if you get `true` as a result of this step, it means that this reward was claimed earlier, and you can’t claim it once again

:::

### 3. Claim your reward

3.1 Open [“Contract/Write contract”](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296#writeContract) tab on Etherscan

3.2 Connect your wallet to Etherscan with either MetaMask or WalletConnect

3.3 Fill-in `Claim` method fields with data from [here](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv)
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
