# Rewards
![rewards-1](../../../static/img/csm/rewards-1.png)

There are two types of rewards for CSM Node Operators:
- **Node Operator rewards;**
- **Bond rewards;**

![rewards-2](../../../static/img/csm/rewards-2.png)

Node Operator rewards come from the LoE protocol's share of the Consensus and Execution layers rewards. These rewards are calculated as a percentage of the rewards of a full 32 ETH validator. Node Operator rewards are distributed between all staking modules in the same [way](/contracts/staking-router#fee-distribution) (proportionally based on the number of active validators per module, where `active == deposited - exited`). Each [Accounting Oracle](/contracts/accounting-oracle.md) report allocates a new portion of staking rewards to CSM. Allocated rewards are stored on the module. Then, the allocation of the Node Operator rewards for CSM Node Operators using a Merkle tree is provided by CSM Performance Oracle once in a `frame`, making a new portion of the rewards available for claim.

Bond rewards (rebase) part of the rewards come from stETH being a rebasing token and the bond being stored in stETH. After each Accounting Oracle report, `shareRate` changes (most likely increases). Hence, the same amount of stETH shares will now be equal to a bigger stETH token balance.

The overall equation for the total rewards looks like this `totalRewards = validatorEffectiveBalance * moduleFee + bondAmount * shareRateChange`. More details on it are published in the [supplementary post](https://research.lido.fi/t/bond-and-staking-fee-napkin-math/5999).

A meaningful part of total rewards comes from bond rebase. The bond and the Node Operator rewards are combined before the claim. The final amount of rewards available for claiming is calculated as `bond + nodeOperatorRewards - bondRequired`. This approach also ensures that any missing bond will be recouped by the protocol prior to a rewards claim.

![rewards-3](../../../static/img/csm/rewards-3.png)

Also, any excess bond will be treated as a reward.

![rewards-4](../../../static/img/csm/rewards-4.png)


## Performance Oracle
The Performance Oracle creates a Merkle tree with the allocation of the staking rewards and delivers the root on-chain. To make the original tree available to users, it is published on [IPFS](https://ipfs.tech/) and [GitHub](https://github.com/). Instead of storing multiple roots, each new tree consists of all Node Operator rewards ever acquired by CSM Node Operators. Hence, only the latest tree is required to determine the reward allocation at any moment of time. The amount of rewards available for claiming can be calculated as `totalAcquiredRewards - claimedRewards`.

The Performance Oracle uses the successful attestation rate `successfulAttestations / totalAssignedAttestations` as a proxy for the overall performance of a validator. A performance threshold is utilized to determine the allocation of the actual Node Operator rewards. Validators with performance above the threshold are included in the allocation pool, while the rest are not. Activation and exit events are accounted for during the Node Operator's share calculation. Once the allocation pool is formed, each validator gets a part of `totalStakingRewardsAccumulated` proportional to its lifetime within a frame. This effectively means that all rewards acquired by the module will be allocated among well-performers. Then, validator shares are allocated to the corresponding Node Operators, and each Operator can claim rewards for all of their validators in one go.

![rewards-5](../../../static/img/csm/rewards-5.png)

It is crucial to note that the Performance Oracle manages only part of the total rewards. Even if the validator performs below the threshold within a frame, bond rewards (rebase) will still be acquired. One can find an example of the rewards calculation [here](https://docs.google.com/spreadsheets/d/1hLvuOesPVOYHDqO373bdyiKn4_3UXQF1rATbgTrKhWc/edit?usp=sharing). **Note that even when performing below the threshold, the rewards per validator will be higher than those for vanilla solo staking.**

The `frame` for the Performance Oracle report is set to 28 days. This makes the `frame` long enough to account for short performance outages (with a smaller frame, this effect will be lower, and the performance threshold will be less useful). Making the `frame` bigger than 28 days will result in an unnecessary delay in reward allocation.

The performance threshold is relative to the overall network attestation effectiveness to ensure that network issues outside the Node Operator's control do not affect reward allocation.

Performance Oracle creates a few artifacts for each successful round of reward distribution: a dump of a Merkle Tree with Node Operators' cumulative rewards and a log of per-operator performance assessment data.

Both files are uploaded to IPFS, and their corresponding CIDs (essentially hashes of the files used to retrieve the content back from the IPFS network) are pushed on-chain. The `CSFeeDistributor` contract (see [Deployed contracts](https://docs.lido.fi/deployed-contracts/holesky#community-staking-module)) has two view functions to retrieve these CIDs: **treeCid** and **logCid**.

The Merkle tree dump can be used to construct a valid proof for Node Operators to claim their acquired rewards. For pre-generated proofs, see the [csm-rewards](https://github.com/lidofinance/csm-rewards) GitHub repository. This repository also provides detailed instructions on how to generate proof and claim rewards manually via Etherscan.

A frame performance assessment log aims to achieve more transparency on rewards distribution made by Oracles. It's another JSON object that stores, among other things:

- the performance threshold for a given frame
- the total amount of shares distributable in the frame
- attestation rates of validators as "assigned" and "included" pairs
- amount of shares distributed every operator in the frame.

There's also additional data in the log; for a full definition look at the following [typescript gist](https://gist.github.com/madlabman/33bc63843b633aa114173d7898e5fcce).

One can inspect the file to ensure all the operators' `distributed` amounts are correct; for example, by using this [python gist](https://gist.github.com/madlabman/ce47a5311f004985341c6fcad53dcd0e). Interested persons can also check the attestations summaries for each validator in the log and report any discrepancies to the CSM team.

If you want to learn more about the actual Performance Oracle algorithm, check out this [detailed doc](https://hackmd.io/@lido/BJclaWbi6).

## Further reading

- [Penalties](/staking-modules/csm/penalties.md)
- [Validator exits](/staking-modules/csm/validator-exits.md)
