---
sidebar_position: 10
---

# 🔄 Consolidations & Migration

CMv2 runs only `0x02` validators with balances up to 2,048 ETH. If you are migrating from CMv1, your existing 32 ETH (`0x01`) validators should be consolidated into new `0x02` validators.

**This is a one-way process** from CMv1 source validators to CMv2 target validators. CMv1 validators are not exited and redeposited; they are consolidated at the Ethereum protocol level. Operators that do not complete the CMv2 migration requirements, such as providing bond and keys, will have their CMv1 validators exited eventually.


---

## What consolidation means

Consolidation is an Ethereum-native mechanism that moves stake from a source validator into a `0x02` target validator. The source validator exits and its balance merges into the target. The process is handled at the Ethereum protocol level and cannot be reversed.

Each consolidation request enters a consolidation-exclusive queue on the consensus layer. Please note that while queued, **both source and target validators must remain active and healthy**.

Total time from submission to completion depends on queue depth at the time of submission and cannot be predicted in advance. A 256 epoch (~27 hour) withdrawable period exists between the exit of the validator and the consolidation of its value into the target, and rewards do not accumulate during that period.

During periods of high migration activity across the network, waits may extend to several days or weeks.

You can monitor the consolidation queue using external services such as [Validator Queue](https://www.validatorqueue.com/), [Pectrified](https://pectrified.com/mainnet), or [Miga Labs](https://www.migalabs.io/consolidations).

---

## Migration process

:::info
Migrations on Mainnet have not started yet.

They are expected to initiate around Q3 2026, following a successful Hoodi testnet migration. Exact timing depends on the outcome of testnet results and DAO coordination.
:::

Migrating from CMv1 to CMv2 is a two-step process: first set up your CMv2 footprint, then consolidate validators into it.

Node Operators are expected to migrate one by one, according to a migration schedule coordinated by NOM. Operators that miss their migration window will not be consolidated.

### Preparation

Before starting, ensure the following:

- Confirm you can post the required bond for your intended CMv2 footprint.
- Validator clients, signers, and monitoring support `0x02` validators and consolidation events.
- Current CMv1 validators are mapped to infrastructure, so you know which clusters to retire first.

### Step 1: CMv2 setup and initial seeding

1. **Create CMv2 Node Operators** in the CMv2 widget (see [Creating & Managing Node Operators](/run-on-lido/cm-v2/creating-and-managing-node-operators)), set a manager address, rewards address, and confirm operator type. This is an administrative step and does not touch validator infrastructure yet.
2. **Generate `0x02` validator keys** using your standard key management tooling.
3. **Upload keys and post bond.** Post bond either before or during key upload so validators can receive initial deposits.
4. **Bring CMv2 validators live.** Configure validator clients, fee recipient (Lido EL Rewards Vault), MEV-boost, ejector settings, and monitoring.
5. **Wait for your new validators to be deposited** (32 ETH) and become active.

### Step 2: Consolidation

1. **Initiate via EasyTrack.** Submit a motion specifying the source CMv1 operator, the target CMv2 sub-Node Operator(s), and a consolidation manager address. Once enacted, stake transfers from the CMv1 entity to its corresponding CMv2 entity are permitted.
2. **Submit consolidation batches** using the Consolidations UI, specifying which CMv1 source validators consolidate into which CMv2 target validators.

    ![Submit consolidation batches](/img/cm-guide/consolidation-submit.png)

3. **Monitor progress.** Track queued, in-progress, and completed consolidations in the Consolidations UI. Operators are expected to stay aware of their own operations.

    ![Monitor consolidation progress](/img/cm-guide/consolidation-monitor.png)

### Wind-down

Once all consolidations for a given operator are complete:

- Confirm that the source CMv1 validators have no remaining duties. Their stake is now fully represented in CMv2.
- Decommission CMv1 infrastructure cluster by cluster once no active keys remain. **Do not decommission early**. Premature shutdown risks missed duties.
- Verify CMv2 validators reflect expected stake, bond is posted correctly, and all tooling is aligned.

---

## Operators during migration

A single Node Operator can run multiple sub-Node Operators, each with its own type, bond, and configuration. This allows operators to segment their setup, for example, running standard infrastructure under one sub-Node Operator and DVT under another.

All bonding, fees, and parameter enforcement apply at the sub-Node Operator level.

Creating a new sub-Node Operator is permissioned and requires DAO approval via the [CMC onboarding process](/run-on-lido/cm-v2/creating-and-managing-node-operators).

---

## Bond during migration

Bond must be posted at the sub-Node Operator level before validators can receive initial deposits. It can be posted ahead of time or during key upload.

Mainnet bond amounts depend on operator type, see [Bond & Key Management](/run-on-lido/cm-v2/bond-and-key-management) for details.
