---
sidebar_position: 2
---

# 📖 Context & Background

## What is CMv2

The **Curated Module v2 (CMv2)** is the successor to the existing Curated Module v1 (CMv1).

It's a permissioned module designed for professional operators that introduces bond requirements, operator classification, and a governance committee to handle routine operations without full DAO votes. It reuses architecture and components from the latest version of CSM, adapted for a permissioned setting.

A new Operator Group model is also introduced allowing each entity in CMv2 to manage multiple Node Operators (also referred to as sub-NOs) with different configurations.

CMv2 rolls out in two phases (planned for Q3 and Q4 2026) and will replace CMv1 through a structured migration once complete.

---

## Key differences from CMv1 and CSM

CMv2 introduces significant changes from CMv1 and CSM. The table below summarizes the most important differences.

| Feature | CMv1 | CSM | CMv2 |
| --- | --- | --- | --- |
| **Stake allocation** | MinFirst allocation | FIFO queue | Weighted stake allocation with respect to sub-operators |
| **Validator type** | `0x01` only | `0x01` only | `0x02` only |
| **Deposit flow** | Single 32 ETH deposits | Single 32 ETH deposits | Two-phased: initial 32 ETH + top-ups up to 2048 ETH validator balance |
| **Operator creation** | Via governance | Permissionless | Via Curated Gate contracts controlled by governance |
| **Bond** | No bond; reputation-based model | Per validator | Bond required per `0x02` key at the sub-NO level |
| **Rewards** | Push-based | Pull-based | Pull-based |
| **Address management** | Governance | Operator-controlled | Operator-controlled + governance fallback |

---

## Rollout Plan

CMv2 is being rolled out in two distinct phases. Understanding which features are available in each phase will help you plan your migration and operations.

### Phase 1

:::note
Live on Hoodi, targeted Q3 2026 for Mainnet
:::

- Introduction of [**bond**](/run-on-lido/cm-v2/bond-and-key-management) and [**penalties**](/run-on-lido/cm-v2/penalties) to Curated Module operators
- Address management by Node Operators
- [Operator types](/run-on-lido/cm-v2/node-operator-types) with type-specific bonds, fee caps, stake allocation weights, and other parameters
- [Weighted stake allocation](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-33.md#allocation-strategy)
- Two-phase deposits (initial 32 ETH + top-ups)
- [Consolidations from CMv1 validators](/run-on-lido/cm-v2/consolidations-and-migration)
- Pull-based reward claims with FeeSplit support
- Node Operator creation method and mapping into Operator Groups representing the entity

### Phase 2

:::note
Targeted Q4 2026 for Mainnet
:::

- Validator Market (ValMart), a dynamic allocation mechanism that can factor in parameters such as operator fees, risk profiles, additional bond reserves, and LDO locking or delegation
- Strike system, a sub-NO-level accountability mechanism where repeated misbehavior reduces allocation weight and can eventually lead to full Node Operator ejection
