# stETH on AAVE caveats

### Flashloans
AAVE protocol allows borrowing any token via flashloans, whether borrowing is enabled or not for the specific token. Any user can borrow stETH on AAVE via a flashloan.  
Due to internal stETH mechanics required for rebasing support, in most cases stETH transfers are performed for the value of 1 wei less than passed to `transfer` method. That could break returning a flashloan, with transaction reverting with `SafeERC20: low-level call failed` error.

### Workarounds
There are two workarounds:

- Have at least 1 stETH wei more than it is required to close the flashoan. In this case, the amount of stETH transferred will be equal to or 1 wei greater than the loaned amount.
- If leaving an extra wei is somehow not an option, you should check if the amount to transfer actually matches the loaned amount beforehand. This can be done using this formula:
```
    uint256 exactTransferedAmount = StETH.getPooledEthByShares(StETH.getSharesByPooledEth(amount))
```

### Why does it happen?

Daily rebases of stETH are implemented via `shares`, a basic unit representing the stETH holder's share in the total amount of ether controlled by the Lido protocol.
Because of math rounding down, there is a common case when the whole stETH balance can't be transferred from the account leaving 1 wei on the sender's account. This happens because the last wei is less than 1 share and gets rounded down to zero at transfer.

### Deposits

When depositing stETH to the lending pool on AAVE, the following statement is meant to be correct:  
"At any time, a user can deposit X stETH to mint X astETH. Total astETH supply increases by X."  
In fact, the actual amount of astETH minted may be less than or equal to X because of double integer division (on stETH token rebase rate and AAVE interest rate). 
However, the actual rounding error is not expected to exceed a couple of wei at any time. Meanwhile, the event emitted will report the full initially deposited amount.

#### Deposit example
In this [deposit case](https://etherscan.io/tx/0xd599641193da40080f3effa175874624f49a8efd6f5b748abd8bc7950fc270f0) we can see 369 stETH being deposited to AAVE stETH lending pool. But in fact, 368.999999999999999999 stETH have been transferred from sender and 368.999999999999999998 astETH have been minted on sender's address. 
However, the events were emitted about exactly 369 stETH transferred and 369 astETH minted.
