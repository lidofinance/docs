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

- **Initial penalty** also known as minimal penalty. Applied at the moment of slashing detection. Amount = `effective_balance // (32*128)` (0.008 ETH for a 32 ETH validator)
- **Midterm penalty** also known as correlation penalty. Applied in the middle of the slashing period (day #18). The amount may vary from `0 ETH` up to the validator's whole effective balance depending on the number of other ongoing slashings (usually `0 ETH`)
- **Missed attestations penalty**. During the whole period of slashing (usually 36 days), the validator balance is penalized for the missed attestations as if the validator was offline (`~0.1-0.2 ETH` for a 32 ETH validator)

A typical total slashing penalty is **~0.3 ETH** for a 32 ETH validator.

All three penalties scale with the validator's effective balance, so a 0x02 CSM validator that has been topped up carries a proportionally larger downside. Because the loss is deducted from your bond, a slashing on a large 0x02 validator can exceed the available bond, and the outstanding amount is then [recorded as debt](/run-on-lido/csm/penalties#if-your-bond-becomes-insufficient) and recovered from future top-ups and rewards.

## What are the consequences of slashing for the CSM validators?

Once the slashing period has ended and the validator is reported as withdrawn, the **slashing-related loss is [assessed and deducted](/run-on-lido/csm/penalties#what-can-affect-your-bond) from the Node Operator's bond.**

## What should I do to avoid slashing?

Just ensure you never use the same validator keys on two different setups.

### Voluntary keys migration

If you need to migrate keys from one setup to another, follow these simple steps:

1. Copy validator key stores from the source machine to the air-gapped device (USB flash or new machine that is not currently connected to the network).
2. Remove the keys from the source machine. Always delete the keystores and any cached versions of it on your old device or VMs when doing migration.
3. Wait for at least 1 hour and double-check that the keys are deleted and that no attestations have been performed from the validator that you are migrating. **Do not worry. Being offline for 1 hour will not affect your CSM rewards**.
4. Import key stores on the new machine.
5. It is recommended to import the slashing protection database of your existing validator keys into a new validator client when performing client or hardware migrations.
6. Start the new setup.
7. Check that your validator is now submitting attestations again.

### Forced key migration

Forced key migration might be required if your existing setup has hardware issues. In this case, disconnect the malfunctioning setup from the network and follow the steps in the section above.

:::info
Note that your malfunctioning setup might return back to normal without you noticing. So, disconnecting it from the network is crucial to avoid slashing.
:::
