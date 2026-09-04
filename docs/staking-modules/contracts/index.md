# Contracts

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

CMv2 and CSM run on the same [CSM v3 codebase](https://github.com/lidofinance/staking-modules), so most contracts below are deployed once per module from the same source. Each page lists the deployed address for every module that uses it.

Six contracts are specific to one module: the module contract and its entry gate differ, and `MetaRegistry` exists only in CMv2. Deployed addresses for every network are listed under [Deployed Contracts](/deployed-contracts/).

## Module

The core contract that stores Node Operators, validator keys, and deposit data, and talks to the [Staking Router](/contracts/staking-router).

| Contract | Applies to | What it does |
| --- | --- | --- |
| [`CuratedModule`](/staking-modules/contracts/CuratedModule) | CMv2 only | Core module contract. Stores operators and deposit data, and allocates stake by operator weight |
| [`CSModule`](/staking-modules/contracts/CSModule) | CSM only | Core module contract. Stores operators and deposit data, and allocates stake through the deposit queue |

## Entry gates

How an address becomes a Node Operator. Each module has its own gate, and the factory that deploys them is shared.

| Contract | Applies to | What it does |
| --- | --- | --- |
| [`CuratedGate`](/staking-modules/contracts/CuratedGate) | CMv2 only | Lets an address in the gate's Merkle tree create a Node Operator of the gate's type |
| [`PermissionlessGate`](/staking-modules/contracts/PermissionlessGate) | CSM only | Lets anyone register as a Node Operator |
| [`VettedGate`](/staking-modules/contracts/VettedGate) | CSM only | Lets addresses in the gate's Merkle tree register with a better bond curve, used for ICS and IDVTC |
| [`MerkleGateFactory`](/staking-modules/contracts/MerkleGateFactory) | Both | Deploys and initializes Merkle-based gate instances behind a proxy |

## Bond and rewards

| Contract | Applies to | What it does |
| --- | --- | --- |
| [`Accounting`](/staking-modules/contracts/Accounting) | Both | Holds the bond as `stETH` shares and manages required bond, rewards, penalties, and charges |
| [`FeeDistributor`](/staking-modules/contracts/FeeDistributor) | Both | Holds reward shares while unallocated or claimable, and stores the rewards Merkle tree |
| [`FeeOracle`](/staking-modules/contracts/FeeOracle) | Both | Processes the Performance Oracle report once consensus is reached |

## Configuration

| Contract | Applies to | What it does |
| --- | --- | --- |
| [`ParametersRegistry`](/staking-modules/contracts/ParametersRegistry) | Both | Stores per-Node-Operator-type parameters such as key limits, reward shares, and penalty amounts |
| [`MetaRegistry`](/staking-modules/contracts/MetaRegistry) | CMv2 only | Stores operator names and descriptions, and the operator groups and weights that drive stake allocation |

## Exits and penalties

| Contract | Applies to | What it does |
| --- | --- | --- |
| [`ValidatorStrikes`](/staking-modules/contracts/ValidatorStrikes) | Both | Stores strike data reported by the Performance Oracle and can trigger ejection |
| [`ExitPenalties`](/staking-modules/contracts/ExitPenalties) | Both | Records exit-related penalties and charges per validator |
| [`Ejector`](/staking-modules/contracts/Ejector) | Both | Triggers validator withdrawals through EIP-7002 |
| [`Verifier`](/staking-modules/contracts/Verifier) | Both | Validates Consensus Layer proofs against the beacon block root and reports the verified facts |
