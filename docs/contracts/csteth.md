# cstETH

It's an ERC20 token that represents the account's share of the total supply of stETH tokens. The balance of a cstETH token holder only changes on transfers, unlike the balance of stETH that is also changed when oracles report staking rewards, penalties, and slashings. It's a "power user" token that might be needed to work correctly with some DeFi protocols like Uniswap v2, cross-chain bridges, etc.

The contract also works as a wrapper that accepts stETH tokens and mints cstETH in return. The reverse exchange works exactly the opposite, the received cstETH tokens are burned, and stETH tokens are returned to the user.

The source code can be found on [Github here](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.6.12/CstETH.sol).
