---
sidebar_position: 1
---

# 🎁 Rewards & Bonds

## Dashboard

![Dashboard](/img/csm-guide/bond-1.png)

### How to get here

* Go to the Lido CSM Widget
  * **Mainnet:** [https://csm.lido.fi/](https://csm.lido.fi/)
  * **Hoodi:** [https://csm.testnet.fi/](https://csm.testnet.fi/)
* Select the **BOND & REWARDS** section in the navigation bar

### Claim tab

Here, you will see your net rewards and bond claimable in aggregate and broken down into its individual parts. Note that `Locked bond` is also deducted from your aggregate rewards here.

You will also be able to claim your net rewards + bond in total or in individual parts if you wish, and select among 3 token types to receive: ETH (in the form of a [Withdrawal NFT](/guides/lido-tokens-integration-guide#unsteth)) / stETH / wstETH.

### Add Bond tab

![Add Bond](/img/csm-guide/bond-2.png)

There are 2 activities you can perform here:

1. Review the balance of your total bond provided and the excess/insufficient bond amounts.
2. Add more bond so that you can get more of your uploaded validator keys deposited by the CSM or top up any shortages due to poor performance or slashing events. **Read more on bond penalties [here](https://operatorportal.lido.fi/modules/community-staking-module#block-3951aa72ba1e471bafe95b40fef65d2b)**.

Once your excess bond amount is sufficient for new validator keys to be deposited, the **Keys available to upload** will increase.

On the other hand, if your bond falls below the required minimum, the unbonded keys count will increase.

:::info
The required minimum bond amount is based on the amount of keys in your operator (including both deposited and non-deposited). Exiting your CSM-deposited keys will not unlock your **Locked bonds**.
:::

**At this point, there are 2 options you can take:**

1. Top up your bond amount under the **ADD BOND** tab
2. Wait for new rewards to replenish the bond amount until it is back to the required level

:::info
You cannot replenish **Locked bonds** using the **ADD BOND** feature.
:::

### Unlock Bond tab

This tab allows you to replenish your **Locked bonds** due to MEV theft and resume the accruing of your CSM operator rewards.

## Resources

| Category                                                                                          | Navigation                                     |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Bond & Rewards](https://operatorportal.lido.fi/modules/community-staking-module#block-88e6d7eca6364a758541dc1ee66a278f) | CSM Operator Portal: "Economics" section      |
| [Bond Penalties](https://operatorportal.lido.fi/modules/community-staking-module#block-3951aa72ba1e471bafe95b40fef65d2b)   | CSM Operator Portal: "Penalties" sub-section |