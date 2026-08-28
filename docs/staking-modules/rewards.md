# Rewards

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

![rewards-1](/img/csm/rewards-1.png)

Node Operators earn from two separate streams:

- **Node Operator rewards** are a share of the protocol fee allocated to the module, distributed once per frame by the Performance Oracle.
- **Bond rewards** accrue on the bond itself, since it is held as stETH, and do not depend on validator performance.

## Node Operator rewards

Node Operator rewards are paid from the Lido on Ethereum protocol fees collected on Consensus and Execution Layer rewards. After an [Accounting Oracle](/contracts/accounting-oracle) report, [Staking Router](/contracts/staking-router#fee-distribution) mints the module fee allocated to the module as `stETH` shares. The module transfers these shares to [`FeeDistributor`](/staking-modules/contracts/FeeDistributor), where they remain pending until the next [Performance Oracle](#performance-oracle) report.

Once per `frame`, the Performance Oracle allocates the pending shares among Node Operators. A validator's contribution to the allocation depends on how long it was active during the frame, its effective balance, its performance, and the reward share configured for the Node Operator type and key number. This accounts for both standard `32 ETH` validators and `0x02` validators with effective balances of up to `2048 ETH`. The Oracle publishes the cumulative allocation in a Merkle tree, making the newly allocated rewards claimable. Any shares designated as a protocol rebate are transferred from `FeeDistributor` to the Lido treasury.

## Bond rewards

[Bond](/staking-modules/node-operators#bond) rewards, also called the rebase, come from stETH being a rebasing token and the [bond](/staking-modules/node-operators#bond) being stored in stETH. After each Accounting Oracle report, `shareRate` changes (most likely increases). Hence, the same amount of stETH shares will now be equal to a bigger stETH token balance.

## Total rewards

![rewards-2](/img/csm/rewards-2.png)

The overall equation can be represented as `totalRewards = nodeOperatorRewards + bondRewards`, where Node Operator rewards are allocated by the Performance Oracle and `bondRewards = bondAmount * shareRateChange`. The [supplementary post](https://research.lido.fi/t/bond-and-staking-fee-napkin-math/5999) provides more details.

A meaningful part of total rewards comes from [bond](/staking-modules/node-operators#bond) rebase. The [bond](/staking-modules/node-operators#bond) and the Node Operator rewards are combined before the claim. The final amount of rewards available for claiming is calculated as `totalBond + nodeOperatorRewards - bondRequired`. This approach also ensures that any missing [bond](/staking-modules/node-operators#bond) will be recouped by the protocol prior to a rewards claim.

![rewards-3](/img/csm/rewards-3.png)

Also, any excess [bond](/staking-modules/node-operators#bond) will be treated as a reward.

![rewards-4](/img/csm/rewards-4.png)

## Reward splitters

These modules include an optional built-in fee splitter. When the Node Operator's portion of the staking fees is claimed, the configured shares are transferred to one or more `FeeSplitRecipients` (up to 10). This streamlines integration with infrastructure providers that charge a percentage of the staking rewards, and can also be used for opt-in donations.

Node Operators can also authorize another address to submit reward-claim transactions on their behalf. That address only triggers the claim, and the claimed funds are always sent to the configured reward address.

## Performance Oracle
The Performance Oracle creates a [Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree) with the allocation of the Node Operator rewards and delivers the root on-chain. To make the original tree available to users, it is published on [IPFS](https://ipfs.tech/) and [GitHub](https://github.com/lidofinance/csm-rewards). Instead of storing multiple roots, each new tree consists of all Node Operator rewards ever acquired by the module's Node Operators. Hence, only the latest tree is required to determine the reward allocation at any moment in time. The amount available for distribution can be calculated as `cumulativeFeeShares - distributedShares`. `FeeDistributor` stores `distributedShares` for each Node Operator to ensure correct accounting.

The Performance Oracle calculates validators performance based on their **attestation, block proposal, and sync committee participation effectiveness**, weighted by the `performanceCoefficients` configured for each [Node Operator type](/staking-modules/node-operators#node-operator-types).

A performance threshold is used to determine which validators participate in the Node Operator reward allocation. Validators at or above the threshold are included, while the rest receive no Node Operator rewards for the frame. Activation and exit events determine how long a validator participated in the frame. Each eligible validator's allocation weight is then adjusted by its effective balance and configured reward share. The resulting validator allocations are aggregated for each Node Operator and published in the cumulative rewards tree.

![rewards-5](/img/csm/rewards-5.png)

Each deployment sets its own `frame` length, it is 28 days in CSM and 14 days in CMv2.

The length is a trade-off. A short frame makes the performance threshold less forgiving, because a brief outage weighs more heavily on the average. A long frame smooths that out, but delays reward allocation.

The performance threshold is relative to the overall network attestation effectiveness to ensure that network issues outside the Node Operator's control do not affect reward allocation.

### Artifacts

Performance Oracle creates a few artifacts for each successful round of reward distribution: a dump of a Merkle Tree with Node Operators' cumulative rewards and a log of per-operator performance assessment data.

Both files are uploaded to IPFS, and their corresponding CIDs (essentially hashes of the files used to retrieve the content back from the IPFS network) are pushed on-chain. The [`FeeDistributor` contract](/staking-modules/contracts/FeeDistributor) has two view functions to retrieve these CIDs: [**treeCid**](/staking-modules/contracts/FeeDistributor#treecid) and [**logCid**](/staking-modules/contracts/FeeDistributor#logcid).

The Merkle tree dump can be used to construct a valid proof for Node Operators to claim their acquired rewards. Each module publishes its tree and pre-generated proofs in a repository with one branch per network: [cm-v2-rewards](https://github.com/lidofinance/cm-v2-rewards) for CMv2 and [csm-rewards](https://github.com/lidofinance/csm-rewards) for CSM.

A frame performance assessment log provides transparency into the rewards distribution performed by the Oracle. It stores, among other things:

- The frame epochs and reference block;
- The reward shares available for distribution, distributed in the frame, and rebated to the protocol;
- The rewards distributed to each Node Operator and the performance coefficients configured for the Node Operator's type;
- Each validator's performance, threshold, reward share, and effective balance multiplier used in the rewards calculation;
- Each validator's slashing status and strikes;
- Attestation, block proposal, and sync committee duty summaries for each validator.

For the full definition, see the following [TypeScript gist](https://github.com/lidofinance/staking-modules/blob/7b005bfdb7f236a2fc8327ec9aa31bcb1be9b0a8/gists/FramePerfLog.ts).

One can inspect the log to verify the rewards distributed to each Node Operator and the inputs used in the calculation. Interested persons can report discrepancies using the official [Lido Discord](https://discord.com/invite/lido).

If you want to learn more about the actual Performance Oracle algorithm, check out this [detailed doc](https://hackmd.io/@lido/BJclaWbi6).

### Bad performance

If a Node Operator's performance is below the threshold, they will not receive any rewards for that frame. However, the Node Operator can still claim their [bond](/staking-modules/node-operators#bond) rewards (rebase) as usual. This means that even if a Node Operator's validators are not performing well, they can still benefit from the bond rebase. One can find an example of the rewards calculation [here](https://docs.google.com/spreadsheets/d/1hLvuOesPVOYHDqO373bdyiKn4_3UXQF1rATbgTrKhWc/edit?usp=sharing).

However, consistent bad performance can lead to forced ejection and the application of penalties. Please refer to the [Penalties](/run-on-lido/csm/penalties) guide for more details on this process.
