---
sidebar_position: 0
---

# ⚠️ Slashing Prevention

1. Never import the same validator signing keystore onto more than 1 validator node and do not store your validator signing keystores on more than 1 running device
2. Do not expose your validator signing keystores to any other entity or on any other online device unless you can be sure there are proper safeguards around them. This is so that you can be sure you retain full control over them
3. Always delete the keystores and any cached versions of it on your old device or VMs when doing migration
4. It is recommended to import the slashing protection database of your existing validator keys into a new validator client when performing client or hardware migrations
   * Always stop the validator client service before exporting the slashing protection database of your existing validator client
5. Consider using the doppelganger protection feature of your consensus layer client
6. Always wait for at least 15 minutes and verify that your validator has missed 2 epochs on [beaconcha.in](https://beaconcha.in/) before starting your new validator client and importing the validator keys when doing migrations
7. If you need to migrate your validator keys onto a new VM / hardware or client, always rehearse your migration process on the testnet first before you attempt to do so on the mainnet. Create your own playbook similar to [this](https://hackmd.io/0fAqTy8iSIKViJO5HOf3Nw) so that you can refer to it while you are doing the actual migration
8. Keep the seed phrase of your validator keystore secure
