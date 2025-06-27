---
sidebar_position: 0
---

# ⚠️ Slashing Prevention

# Slashing and how to avoid it

## What is slashing?

In Ethereum terms, slashing is when the network kicks off a validator for misbehavior. A slashed validator can no longer participate in validation and is subject to penalties.

You can read more about slashing in the [eth2book](https://eth2book.info/capella/part2/incentives/slashing/).

## What misbehavior results in slashing?

There are two reasons for slashing to occur:

- **Double signature** also known as propagation of the two different messages (attestation or block proposal) signed by the same validator key and corresponding to the same slot.
- **Making attestation with the source and target votes "surrounding" the source and target votes from another attestation** by the same validator.

While the second case can only result from a client bug, **the first case is easily reachable by running the same validator keys on two distinct setups**.

:::info
Despite the common misconception, being offline is not a slashable event.
:::

## What are the slashing penalties?

There are three penalties associated with the slashing:

- **Initial penalty** also known as minimal penalty. Applied at the moment of slashing reporting to CSM. Amount = `effective_balance // 32` (usually 1 ETH)
- **Midterm penalty** also known as correlation penalty. Applied in the middle of the slashing period (day #18). The amount may vary from `0 ETH to 32 ETH` depending on the number of other ongoing slashings (usually `0 ETH`)
- **Missed attestations penalty**. During the whole period of slashing (usually 36 days), the validator balance is penalized for the missed attestations as if the validator was offline (usually `~0.1-0.2 ETH`)

A typical total slashing penalty is **~1.2 ETH**

## What are the consequences of slashing for the CSM validators?

Several things happen with the slashed validator in CSM:

1. Once the slashing is reported using a permissionless method (powered by EIP-4788), **1 ETH penalty is burned** from the Node Operator's bond.
2. Once the slashing period has ended and the validator is reported as withdrawn, **the [bond](/staking-modules/csm/join-csm#bond) curve is [reset](/staking-modules/csm/penalties#benefits-reset) to the default** one for the Node Operator due to the fact of slashing. Also, the **difference between the withdrawal balance and 31 ETH** (32 - 1, since 1 ETH was already penalized) **is [confiscated](/staking-modules/csm/penalties#reasons) from the Node Operator's bond.**

So, **CSM will confiscate all slashing-related penalties from the Node Operator's bond and reset the beneficial bond curve if it was ever set.**

## What should I do to avoid slashing?

Just ensure you never use the same validator keys on two different setups.

### Voluntary keys migration

If you need to migrate keys from one setup to another, follow these simple steps:

1. Copy validator key stores from the source machine to the air-gapped device (USB flash or new machine that is not currently connected to the network)
2. Remove the keys from the source machine. Always delete the keystores and any cached versions of it on your old device or VMs when doing migration
3. Wait for at least 1 hour and double-check that the keys are deleted and that no attestations have been performed from the validator that you are migrating. **Do not worry. Being offline for 1 hour will not affect your CSM rewards**
4. Import key stores on the new machine
5. It is recommended to import the slashing protection database of your existing validator keys into a new validator client when performing client or hardware migrations.
6. Start the new setup
7. Check that your validator is now submitting attestations again

### Forced key migration

Forced key migration might be required if your existing setup has hardware issues. In this case, disconnect the malfunctioning setup from the network and follow the steps in the section above.

:::info
Note that your malfunctioning setup might return back to normal without you noticing. So, disconnecting it from the network is crucial to avoid slashing.
:::