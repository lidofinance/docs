---
sidebar_position: 3
---

# 🚪 Exiting CSM Validators

## Monitoring for exit requests from Lido

The **Dashboard** view  provides a consolidated view of the status of your keys. Including the exit requests as shown on the image below.

![Monitoring Dashboard](/img/csm-guide/exit1-1.png)

There are 3 reasons why CSM operators can receive an exit request from the Lido Protocol:
1. If the protocol needs ETH to fulfill stETH withdrawal requests. Note that because of how the protocol works withdrawal requests will, for the most part, be requested from bigger modules like the Curated Module first.
2. If you have unbonded validators you're required to either top up the bond, or exit the validator.
3. If a validator accumulated enough strikes for performing below the threshold, it can be ejected for bad performance.

If you do not exit the validator within the allowed delay for your operator profile, an exit delay charge is applied to your bond once the validator withdraws. The protocol can also force the exit from the Execution Layer, and the withdrawal request fee is charged to you as well. See [Penalties](/run-on-lido/csm/penalties#parameters-by-operator-profile) for the amounts that apply to your profile.

You can read more about exits [here](/staking-modules/validator-exits).

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

1. Sign & broadcast an exit message for each validator key you want to exit. See [Exit using validator keystores](./exit-using-validator-keystores) for the per-client commands.
2. Wait for the validator key to be fully exited on the beacon chain. Check your validator pubkey on [beaconcha.in](https://beaconcha.in/).
3. Connect your wallet address to the Lido CSM Widget ([Mainnet](https://csm.lido.fi/) / [Testnet](https://csm.testnet.fi/)).
4. Navigate to **Keys » View Keys** to verify that the status of your validator key is marked as **Withdrawn**.
5. Navigate to **Bond & Rewards » Claim** to claim your deposited bond and any accumulated rewards.

![Claim Bond & Rewards](/img/csm-guide/exit1-3.png)

:::warning
The stake deposited by the protocol returns to the Lido Protocol, not to you. In 0x01 CSM that is the 32 ETH used to activate each validator key. In 0x02 CSM it is the validator's full balance, which can be up to 2,048 ETH after top-ups. Meanwhile, CSM Operators get their ETH-based bond deposits back from the Lido CSM Contract.
:::
