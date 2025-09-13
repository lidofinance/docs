---
sidebar_position: 4
---

# 👥 Operator Roles

CSM has two roles to interact with your Node Operator: **Manager** and **Rewards**. When you first create your operator, both roles are assigned to the wallet you used at creation (unless you are explicitly specifying custom addresses), but both can be changed later. Let's see what each role can do and how to change the wallet:

:::warning
You won't be able to change permissions or use certain claim methods if you can't sign transactions, make sure you're using an EOA or Smart Account that can sign arbitrary transactions as the Reward address.

You can work around this by using the Extended mode explained [here](#extended-mode). **Note**: you can only do this when creating the Node Operator.
:::

## Roles
### Manager address

The Manager can perform the following actions:

* Add new validator keys
* Compensate the reported MEV stealing penalty
* Delete validator keys that were not deposited yet
* Claim rewards (rewards will be transferred to the Reward address)
* Put depositable keys back into the deposit queue if they were skipped during the queue iteration
* Propose a new `managerAddress`

As it has limited access, you can set the Manager as a hot wallet for more convenient management of your Node Operator within CSM.

### Reward address

The Reward can do the following:

* Claim rewards
* Propose a new Reward address
* Reset the Manager to make it equal to the current Reward address

Given the Reward address is the recipient of funds, it is recommended to be set to a [cold wallet](https://www.coinbase.com/en-es/learn/wallet/hot-vs-cold-crypto-wallet-what-is-the-difference).

### Permissionless operations
On top of the permissions above, there's several methods that can be called by any Ethereum address:
- Top-up bond
- Distribute allocated rewards to the Node Operator's bond
- Report validator withdrawal to release bond tokens (usually done by the CSM Bot)
- Report validator slashing (usually done by the CSM Bot)


## Change roles

To change the roles for either the Manager or Reward address, navigate to the [Roles tab](https://csm.lido.fi/roles/).

![Roles Tab](/img/csm-guide/roles-1.png)

Select the role you want to change—remember the Manager can only change itself, and the Reward can change itself and reset the Manager.

Put the new address in the textbox, and confirm the changes.

![Change Role](/img/csm-guide/roles-2.png)

The other wallet will then have to sign a transaction accepting the request.

![Confirm Change](/img/csm-guide/roles-3.png)

## Extended mode

:::note
The extended mode can only be set upon the creation of the Node Operator and can't be changed later.
:::

If you need to use a wallet that can't sign arbitrary transactions as the Reward address (e.g., Obol clusters using Splitter contracts), you can select **Extended mode** which gives the manager the ability to change the Reward address as well.

Find it at the bottom of the Lido CSM Widget during operator creation.

![Extended Mode](/img/csm-guide/roles-4.png)

## Examples
### Default
By default, the Node Operator creator's address is set as the Manager and Rewards.

![roles-5](/img/csm-guide/roles-5.png)

Following the creation of the operator (i.e. once at least one key has been registered), it is recommended that addresses be re-assigned according to one of the optimal configurations below.

### Optimal for solo operator
It's optimal to set the Manager to a *hot* address and the Rewards to a secure *cold* wallet or multisig.

![roles-6](/img/csm-guide/roles-6.png)

### Optimal for DVT clusters
There's multiple ways to set up a DVT cluster using CSM.

1. Set the Manager address to a *hot* wallet controlled by the cluster coordinator and the Rewards to a cluster mulgisig. This option is only recommended in cases where cluster participants trust the coordinator completely (or have other types of guarantees/agreements in place) or if the DVT setup is an intra-operator setup rather than an inter-operator setup.

![roles-7](/img/csm-guide/roles-7.png)

2. Set both Manager and Rewards address to a cluster multisig.

![roles-8](/img/csm-guide/roles-8.png)

3. Set Manager address to a cluster multisig and Rewards to a splitter contract (e.g. to benefit from automated rewards splitting between cluster participants). For this to work you need to set up [Extended Mode](#extended-mode) at the creation of the operator.

![roles-9](/img/csm-guide/roles-9.png)