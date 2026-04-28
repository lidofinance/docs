---
sidebar_position: 4
---

# 🔍 Node Operator Types

The Curated Module classifies each Node Operator into one of 6 types based on its profile, contribution history, and underlying infrastructure.

Each NO type determines your bond requirement, your reward share, and base stake allocation weight.

## All Node Operator types

### Professional Operator (PO)

PO is the entry point for new operators joining after CMv2 launch. You start here on a trial basis, operating under tighter bond requirements, lower reward share, and stake allocation weight than PTO.

Once you meet the defined criteria, the CMC can propose that you graduate to PTO (subject to an explicit DAO approval via the on-chain vote).

**Bond:** 11 ETH first key, 1 ETH for all the subsequent.  
**Reward share:** 2.5% on all keys.  

### Professional Trusted Operator (PTO)

PTO is the default type. It covers for-profit entities that either operated in CMv1 or completed a trial period as a Professional Operator and met the graduation criteria.

**Bond:** 11 ETH for the first key, 0.1 ETH for the following 17 keys, and 0.7 ETH for all subsequent keys.  
**Reward share:** 3.5% on all keys.

### Public Good Operator (PGO)

PGO is for entities that develop or substantially fund Ethereum clients, or that contribute meaningfully to broader public infrastructure.

**Bond:** 11 ETH for the first key, 0.1 ETH for the following 17 keys, and 0.7 ETH for all subsequent keys.  
**Reward share:** 4% on all keys.

### Decentralization Operator (DO)

DO is for operators running infrastructure in geographic regions or with client/hardware combinations that are underrepresented in Ethereum staking.

**Bond:** 11 ETH for the first key, 0.1 ETH for the following 17 keys, and 0.7 ETH for all subsequent keys.  
**Reward share:** 4% on all keys.

### Extra Effort Operator (EEO)

EEO recognizes operators that go beyond standard operation and demonstrate meaningful alignment with Lido through additional contributions.

**Bond:** 11 ETH for the first key, 0.1 ETH for the following 17 keys, and 0.7 ETH for all subsequent keys.  
**Reward share:** 4% on all keys.

### Intra-Operator DVT Cluster (IODC)

IODC is a distributed validator cluster where all participating nodes belong to the same entity. The setup improves operational resilience compared to a single-node configuration.

**Bond:** 11 ETH for the first key, 0.1 ETH for the following 17 keys, and 0.7 ETH for all subsequent keys.  
**Reward share:** 3.5% or 4% on all keys (depending on the main type of an operator).

## How types compare

The table below summarizes the key parameters for each type.

| **Type** | **Bond** | **Reward share** | **Keys limit** | **ValMart weight** |
| --- | --- | --- | --- | --- |
| PTO | 11 ETH first key, 0.1 ETH following 17 keys and 0.7 ETH for all the subsequent. | 3.5% | 500 | 1 |
| PO | 11 ETH first key, 1 ETH subsequent | 2.5% | 80 | 0.7 |
| PGO | 11 ETH first key, 0.1 ETH following 17 keys and 0.7 ETH for all the subsequent. | 4% | 500 | 1 |
| DO | 11 ETH first key, 0.1 ETH following 17 keys and 0.7 ETH for all the subsequent. | 4% | 500 | 1 |
| EEO | 11 ETH first key, 0.1 ETH following 17 keys and 0.7 ETH for all the subsequent. | 4% | 500 | 1 |
| IODC | 11 ETH first key, 0.1 ETH following 17 keys and 0.7 ETH for all the subsequent. | 3.5% / 4% | 500 | 1 |

:::info
These values are confirmed for the Hoodi testnet. Mainnet parameters may differ and will be confirmed before launch.
:::

## Operator Groups and stake allocation

After your NO is created, the CMC adds it to an **Operator Group**. You are not eligible for stake deposits until this assignment is made.

Within a group, each sub-NO has a **weight share** expressed in basis points. The sum of all shares in a group must equal 10,000 BP. These shares determine each sub-NO's weight in the stake allocation calculation, not a guaranteed stake outcome.

The effective weight of each sub-NO is derived from its configured weight and share within the group. Operators that are not part of any group receive a weight of zero and will not receive stake allocations. See the [sub-NO weights section of LIP-33](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-33.md#sub-node-operator-weights) for the exact formula and variable definitions.

In Phase 2, stake allocation weight becomes more dynamic. Your effective weight will also factor in your custom fee, operator type, current strike count, any additional stETH bond you hold voluntarily, and any LDO you have locked or delegated. This means Node Operators may be able to increase the weight of an individual sub-NO, and therefore the total effective weight of the group.
