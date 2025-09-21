---
sidebar_position: 0
---

# 📊 Beginner: CSM Widget, MigaLabs, Beaconcha.in

To get rewards on your CSM validators, their performance must be above the average performance of the network minus 5% during the monitoring frame of 28 days. That makes it very easy to receive rewards, and it's even easier to check how your operator is doing.

## Snapshot Performance

Go to the [monitoring](https://csm.lido.fi/monitoring) tab in the CSM UI to see the overall performance of your Node Operator. Note that only keys above the threshold will receive rewards at the end of the frame.

![Snapshot Performance](/img/csm-guide/beginner-1.png)

## MigaLabs: Performance vs Network Average

The easiest way to see the performance of your keys against the network average is via [MigaLabs](https://migalabs.io/lido-csm). To see them:

1. Head to the [monitoring](https://csm.lido.fi/monitoring) and click on MigaLabs under **External dashboards**. This will open the view of your operator.  
2. Scroll down and click on the validator number you want to monitor.  
3. There you will see information including Source, Target and Head correctness from your validator against the network for the selected period of time.

![EthSeer Performance](/img/csm-guide/beginner-2.png)

## Beaconcha.in App

Download the Beaconcha.in mobile app and use it for on-the-go monitoring & alerts.

- **1st tab:** Summary of validators in your watchlist  
- **2nd tab:** Search for your Validator ID or public key and tap the flag to add it to your watchlist  
- **3rd tab:** View device-level diagnostics like CPU, RAM, disk space, networking throughput, peer count, etc.  
- **4th tab:** Configure your notification preferences for your validator in Settings  

:::success
**Pro tip:** If you are running all of your validator keys on a single machine, adding just one validator ID/pubkey to your Beaconcha.in watchlist is sufficient.
:::