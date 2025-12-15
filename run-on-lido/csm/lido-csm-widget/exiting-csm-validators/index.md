---
sidebar_position: 3
---

# 🚪 Exiting CSM Validators

## Monitoring for exit requests from Lido

The **Dashboard** view  provides a consolidated view of the status of your keys. Including the exit requests as shown on the image below.

![Monitoring Dashboard](/img/csm-guide/exit1-1.png)

There are 2 reasons why CSM operators can receive exit request from the Lido Protocol:
1. If the protocol needs ETH to fulfill stETH withdrawal requests. Note that because of how the protocol works withdrawal requests will, for the most part, be requested from bigger modules like the Curated Module first.
2. If you have unbonded validators you're required to either top up the bond, or exit the validator.

If the operator does not exit their validators after the protocol request, the following will be applied:
1. Exclude the Node Operator from the CSM deposit queue until the issue is resolved.
2. Exclude the Node Operator from the staking rewards allocation cycle.

You can read more about exits [here](/staking-modules/csm/validator-exits).

### Notifications for exit requests

You can also subscribe to notifications for exit requests from Lido using the [CSM Sentinel](https://github.com/skhomuti/csm-sentinel) Telegram bot.

**Quick start:**

1. To use the hosted version, click [here for Mainnet](https://t.me/CSMSentinel_bot) or here for [Hoodi](https://t.me/CSMSentinelHoodi_bot). Alternatively, search for the **"CSM Sentinel"** bot on Telegram and open a chat with it
2. Type `/start` and send
3. Select the `Follow` option
4. Enter your CSM Operator ID. This can be found at the top of the CSM Widget after connecting your wallet.

![CSM Sentinel setup](/img/csm-guide/exit1-2.png)

This [video guide](https://youtu.be/U1RkKnIR3_Y?t=242) covering how to set this up starts at 4:02 minutes.

## How to Exit Keys and Withdraw Your Bond

1. Sign & broadcast an exit message for each validator key you want to exit. Refer to the sub-sections/pages below.
2. Wait for the validator key to be fully exited on the beacon chain. Check your validator pubkey on [beaconcha.in](https://beaconcha.in/).
3. Connect your wallet address to the Lido CSM Widget ([Mainnet](https://csm.lido.fi/) / [Testnet](https://csm.testnet.fi/)).
4. Navigate to **Keys » View Keys** to verify that the status of your validator key is marked as **Withdrawn**.
5. Navigate to **Bond & Rewards » Claim** to claim your deposited bond and any accumulated rewards.

![Claim Bond & Rewards](/img/csm-guide/exit1-3.png)

:::warning
The 32 ETH deposited to activate each validator key will return to the Lido Protocol. Meanwhile, CSM Operators get their ETH-based bond deposits back from the Lido CSM Contract.
:::

## Stuck Keys

`Stuck Keys` accrue when CSM operators do not perform timely (within 96 hours) exits on the required number of CSM-deposited validator keys when requested by the Lido Protocol.

**Penalties of having `Stuck Keys` include:**

1. New validator keys of the CSM operator will not be deposited
2. New staking rewards stop accruing for the CSM operator

Penalties are lifted when there are no more `Stuck Keys`. More details [here](https://operatorportal.lido.fi/modules/community-staking-module#block-0ed61a4c0a5a439bbb4be20e814b4e38).