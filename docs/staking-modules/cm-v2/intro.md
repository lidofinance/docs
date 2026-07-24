# Intro

:::tip
For practical, operational instructions aimed at Curated Module Node Operators, see the guide [here](/run-on-lido/cm-v2/).
:::

Curated Module v2 (CM v2) is the next version of the Lido on Ethereum Curated Staking Module. It is built on the same codebase as [CSM](/staking-modules/csm/intro.md) and inherits the concepts introduced in CSM v3, such as the bond, rewards, penalties, and validator exit mechanics. As a result, most of the module works exactly as in CSM, and the [CSM documentation](/staking-modules/csm/intro.md) can be used as a reference for those parts. Note that CM v2 supports only `0x02` validator withdrawal credentials.

The main difference between CM v2 and CSM is how stake is allocated across Node Operators, described below.

## Stake allocation

Unlike CSM, which allocates deposits through a FIFO [stake allocation queue](/staking-modules/csm/join-csm.md#stake-allocation-queue), CM v2 uses a weighted stake allocation strategy, implemented by the [`CuratedModule`](./contracts/CuratedModule.md) contract. Rather than following the order in which keys were submitted, CM v2 distributes stake across Node Operators according to their allocation weights, aiming to keep each operator's share of the module close to its target.

### Meta Operators Registry

Allocation weights are provided by the Meta Operators Registry, implemented by the [`MetaRegistry`](./contracts/MetaRegistry.md) contract. It arranges Node Operators into operator groups and stores their weights, and it can also account for a group's stake held in external modules (e.g., the legacy Curated Module). These weights determine each operator's target share of the module's stake.

### Weighted stake allocation

For every Node Operator, the strategy computes a `targetStake` (proportional to the operator's weight) and a `currentStake` (including any external stake). Operators are then sorted by their imbalance — how far the current stake is below the target — and stake is allocated greedily, starting from the most imbalanced operator and moving on once its target is reached, its capacity is exhausted, or there is no more stake to allocate.
