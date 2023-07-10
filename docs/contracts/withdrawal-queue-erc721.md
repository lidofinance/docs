# WithdrawalQueueERC721

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/WithdrawalQueueERC721.sol)
- [Deployed contract](https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1)

A FIFO queue for the `stETH` withdrawal requests and an `unstETH` NFT representing the position in the queue.

## What is WithdrawalQueueERC721?

This contract is a main entry point to exchange `stETH` for underlying ether directly from the pool. It is responsible for:

- managing a queue of withdrawal requests
- committing withdrawal request finalization as a part of the [AccountingOracle](./accounting-oracle.md) report
- storing `stETH` before and ether after the finalization
- transfer reserved ether to the user upon the claim

Also, the contract is [ERC-721](https://eips.ethereum.org/EIPS/eip-721) NFT with metadata extension representing the right to claim underlying ether once the request is finalized. This NFT is minted upon request and burned on the claim.

Also, the [ERC-4906](https://eips.ethereum.org/EIPS/eip-4906) is used to update the metadata as soon as the finalization status of the request is changed.

## Request

To request a withdrawal, one needs to approve the amount of `stETH` or `wstETH` to this contract, sign the [ERC-2612 Permit](https://eips.ethereum.org/EIPS/eip-2612), and then call the appropriate `requestWithdrawals*` method.

The **minimal** amount for a request is `100 wei`, and the **maximum** is `1000 eth`. More significant amounts should be split into several requests, which allows us to avoid clogging the queue with an extra large request.

During this call, the request is placed in the queue, and the related `unstETH` NFT is minted. The following structure represents the request:

```sol
struct WithdrawalRequestStatus {
    uint256 amountOfStETH;
    uint256 amountOfShares;
    address owner;
    uint256 timestamp;
    bool isFinalized;
    bool isClaimed;
}
```

where

- **`amountOfStETH`** — the number of `stETH` tokens transferred to the contract upon request
- **`amountOfShares`** — the number of underlying shares corresponding to transferred `stETH` tokens. See [Lido rebasing chapter](lido.md#rebase) to learn about the shares mechanic
- **`owner`** — the address of the owner for this request. The owner is also a holder of the `unstETH` NFT and can transfer the ownership and claim the underlying ether once finalized
- **`timestamp`** — the creation time of the request
- **`isFinalized`** — finalization status of the request; finalized requests are available to claim
- **`isClaimed`** — the claim status of the request. Once claimed, NFT is burned, and the request is not available to claim again

:::note

The `stETH`, once requested for withdrawal and transferred to this contract, stops accruing rewards, so the amount of ether to claim will not be greater than the amount of `stETH` on the withdrawal request. Moreover, it can be reduced during the finalization.

:::

## Finalization

After filing a withdrawal request, one can't claim it until finalization occurs.
[Accounting Oracle](./accounting-oracle.md) report finalizes a batch of withdrawal requests from the queue if the following conditions are met:

- There is enough ether to fulfill the request. Ether can be obtained from the Lido buffer, which is filled from the new users' stake, Beacon chain partial and full withdrawals, protocol tips, and MEV rewards. Withdrawals are prioritized over deposits, so ether can't be deposited to the Beacon chain if some withdrawal requests can be fulfilled.
- Some amount of time have passed since
- To check that there was no massive loss for the protocol on the Beacon chain side in the period when the withdrawal request was filed. If there was and its size exceeds the daily protocol earning (extremely rare situation), the request value can be discounted proportionally to reflect this loss.

:::note

So, to put it simply. Token holders don't receive rewards but still take risks during withdrawal.  Rewards are burned upon the finalization, effectively distributing them among the other token holders.

:::

So, the finalization sets the final value of the request, reserves ether on the balance of this contract and burns the underlying `stETH`.

## Claim

When the request is finalized, it can be claimed by the current owner, transferring the reserved amount of ether to the recipient's address and burning the withdrawal NFT.

To see if the request is claimable, one can get its status using `getWithdrawalStatus()` or subscribe to the event `WithdrawalsFinalized(uint256 from, uint256 to, ...)`, which is emitted once the batch of requests with ids in the range `(from, to]` is finalized.
