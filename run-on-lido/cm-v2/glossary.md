---
sidebar_position: 3
---

# 📚 Glossary

This page provides a quick-reference glossary for all the terms related to Curated Module v2 (CMv2).

:::warning
CMv2 parameters are subject to change before Mainnet. Bond amounts and fee caps shown in this documentation reflect the current Hoodi testnet deployment.
:::

---

## Core terms

### Operator Group

The technical unit that represents an operator entity in CMv2. It is a weighted grouping stored in `MetaRegistry.sol` that determines how stake is distributed among sub-NOs. Each group also references external operators (e.g. from CMv1) whose stake is accounted for in both allocation and exit calculations across modules.

A sub-operator can belong to only one Operator Group.

### Node Operator (NO) / Sub-Node Operator (sub-NO)

In CMv2, these two terms refer to the same thing. Every Node Operator is a distinct on-chain identity in `CuratedModule.sol` with its own bond, operator type, validator keys, manager address, rewards address, and other parameters. The term "sub-Node Operator" (or sub-NO) is used to describe Node Operators under the same Operator Group.

### Node Operator Type

A Node Operator Type defines the parameter set applied to a sub-Node Operator and its keys. This can include bond requirements, fee caps, allocation weight, and other parameters.

### 0x02 withdrawal credentials

CMv2 exclusively supports `0x02` validators. These validators can hold effective balances up to 2,048 ETH and receive deposits in two steps: an initial 32 ETH deposit, followed by top-up deposits that increase the validator's balance up to 2,048 ETH. `0x01` credentials are no longer accepted.

### Bond

stETH-denominated collateral tracked per sub-NO in `Accounting.sol`. It can be uploaded as ETH, stETH, or wstETH. Each new key requires bond to be posted, and the required amount varies by Node Operator type.

### Curated Gate

A permissioned entry-point contract for Node Operator creation. Each instance represents a different operator type and maps to a specific `bondCurveId` (Node Operator type) in `Accounting.sol`. An allowlisted address can use a certain gate once to create a new operator.

### [Curated Module Committee (CMC)](https://docs.lido.fi/multisigs/committees#220-curated-module-committee-cmc)

An off-chain multisig committee responsible for overseeing CMv2 operations, including adding Operator Groups to the registry (via Easy Track), setting operator name, description, and actioning certain penalty flows (via Easy Track as well).

### Easy Track (ET) motion

An optimistic governance mechanism that lets DAO-approved addresses, including the CMC, execute routine operations without explicit DAO approval (ET motions can be objected to, but do not require explicit support). When a motion is proposed, it becomes executable after 72 hours unless challenged, and can then be executed permissionlessly. Note, it may still be challenged until it's executed.

It's used in CMv2 for operator onboarding, type assignments, penalty management, consolidations, and similar operational actions.

### Reward Splitter

A mechanism that automatically splits a portion of Node Operator staking rewards to the designated addresses when rewards are claimed. Up to 10 FeeSplitRecipients can be configured per operator.

This enables rewards splits for inter-operator DVT clusters, or if node operators want to segment some rewards towards secondary recipients (e.g. public goods funding).

### Rewards Claimer

An optional delegated address that can call `claimRewards` methods on behalf of the sub-Node Operator. The Rewards Claimer can trigger claims, but cannot redirect funds; rewards always flow to the configured rewards address.

Useful for automating the reward claim process.

### Meta Registry

A contract that stores Operator Groups and their configurations (sub-NOs list, their weight shares within a group, and the list of external operators). It is the source of truth for stake allocation weights and external operator references.

### External Operator

An operator outside CMv2 that is referenced from an Operator Group so its active stake is taken into account when calculating stake allocation targets.

In Phase 1 of CMv2, only CMv1 operators are taken as External Operators.

### Triggerable Withdrawals / [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)

EIP-7002 enables on-chain triggerable validator exits without requiring the validator's signing key. CMv2 operators can use this to exit the validator in emergency situations.

### Strike

In Phase 2 of CMv2, there will be a strike-based accountability system. Unlike in [CSM](/staking-modules/csm/penalties#bad-performance-strikes), where strikes are applied per key, CMv2 will apply strikes at the sub-NO level. They serve as a long-term disincentive by reducing allocation weight, instead of relying solely on immediate penalties.

### Phase 1 / Phase 2

CMv2 is deployed in two phases.

Phase 1 covers operator types, bonding, consolidations from CMv1, and the initial allocation strategy.

Phase 2 introduces direct deposits, the ValMart allocation mechanism, and dynamic fees.
