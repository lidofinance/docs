---
sidebar_position: 4
---

# 👥 Operator Roles

CSM counts with two roles to interact with your Node Operator, these are **Manager** and **Rewards**. When you first create your operator both roles are assigned to the wallet you used at creation, but both can be changed later. Let's see what each role can do and how to change the wallet:

:::warning
You won't be able to change permissions if you can't sign transactions, make sure you're using an EOA or Smart Account that can sign arbitrary transactions as the Reward address.

You can work around this by using the Extended mode explained [here](#extended-mode).
:::

## Manager address <a href="#manager-address" id="manager-address"></a>

The Manager can perform the following actions:

* Add new validator keys
* Delete validator keys that were not deposited yet
* Claim rewards (rewards will be transferred to the Reward address)
* Put depositable keys back into the deposit queue if they were skipped during the queue iteration
* Propose a new `managerAddress`

As it has limited access, you can set the Manager as a hot wallet for more convenient management of your Node Operator within CSM.

## Reward address <a href="#reward-address" id="reward-address"></a>

The Reward can do the following:

* Claim rewards
* Propose a new Reward address
* Reset the Manager to make it equal to the current Reward address

Given the Reward address is the recipient of funds, it is recommended to be set to a cold wallet.

## Change roles

To change the roles for either the Manager or Reward address, navigate to the [Roles tab](https://csm.lido.fi/roles/).

![Roles Tab](/img/csm-guide/roles-1.png)

Select the role you want to change—remember the Manager can only change itself, and the Reward can change itself and reset the Manager.

Put the new address in the textbox, and confirm the changes.

![Change Role](/img/csm-guide/roles-2.png)

The other wallet will then have to sign a transaction accepting the request.

![Confirm Change](/img/csm-guide/roles-3.png)

## Extended mode <a href="#extended-mode" id="extended-mode"></a>

:::info
If you're using a wallet that can't sign transactions chances are that it can't support some of the withdrawal methods like the Withdrawal NFT or the rebasable stETH token. Please confirm with the source of your wallet.
:::

If you need to use a wallet that can't sign arbitrary transactions as the Reward address (e.g., Obol clusters using Splitter contracts), you can select **Extended mode** which gives the manager the ability to change the Reward address as well.

Find it at the bottom of the Lido CSM Widget during operator creation.

![Extended Mode](/img/csm-guide/roles-4.png)