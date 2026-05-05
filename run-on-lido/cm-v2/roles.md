---
sidebar_position: 9
---

# 🔑 Roles

Every Node Operator has two required addresses: a Manager Address and a Rewards Address. Both are set during creation and can be changed later through their respective role-change flows. The current Manager Address can propose a new Manager Address or directly change the Rewards Address, while the Rewards Address can also propose its own replacement.

:::warning
Use highly secure addresses for roles that control funds or operator configuration. Multisig wallets are strongly recommended for Manager and Rewards Addresses.
:::

You also can optionally configure a Rewards Claimer and a Rewards Splitter.

![Roles overview](/img/cm-guide/roles-overview.png)

## Roles overview

:::info
There's a separate role (`OPERATOR_ADDRESSES_ADMIN_ROLE`) that can override your manager and reward addresses. It exists only for emergencies where your key is compromised and you can't recover it yourself. If that ever happens, the DAO can step in through a full Aragon vote to restore access on your behalf.
:::

| **Role** | **Required** | **What it controls** | **Change mechanism** |
| --- | --- | --- | --- |
| Manager Address | Yes | Full operator control (keys, bond, address changes, metadata) | Two-step: propose from current Manager, new address confirms |
| Rewards Address | Yes | Receiving rewards, topping up bond, proposing its own replacement | The Manager Address can change the Rewards Address directly. The Rewards Address can propose a replacement, but the new address must confirm via Inbox Requests. |
| Rewards Claimer | No | Triggering reward claim transactions (does not receive funds) | Single-step: set or change from Manager Address |
| Rewards Splitter | No | Splitting rewards across up to 10 addresses by percentage | Single-step: configure from Manager Address section |

## Manager Address

**Manager Address** is the primary control address for your operator. It has the broadest set of permissions.

What the Manager Address can do:

- Add and remove validator keys
- Top up bond
- Claim bond and rewards to the Rewards Address
- Cover locked bond
- Propose a new Manager Address
- Change the Rewards Address
- Configure rewards splits
- Update operator name and description

The Manager Address controls your entire operator setup. Using a multisig is strongly recommended.

## Rewards Address

**Rewards Address** is where your staking rewards are claimed. It has a narrower set of permissions than the Manager Address.

What the Rewards Address can do:

- Claim bond and rewards
- Top up bond
- Propose a new Rewards Address

## Rewards Claimer

**Rewards Claimer** is an optional address authorized to trigger reward claims on your behalf. Unlike the Rewards Address, it does not receive the funds. It only initiates the claim transaction.

This is useful for automating reward claims without giving the claiming script access to your Rewards or Manager Address wallet.

To set or unset the Rewards Claimer, go to Roles and use the Rewards Claimer section. No second-party confirmation is required.

## Rewards Splitter

![Rewards Splitter](/img/cm-guide/roles-splitter.png)

The **Rewards Splitter** lets you distribute your Node Operator rewards across up to 10 additional addresses. Each address receives a defined percentage of rewards **in stETH only.**

How it works:

- Split recipients receive their configured shares first.
- When the sub-NO claims rewards through the standard flow, the primary Rewards Address receives the remaining share after split recipients are paid.
- If the claim is executed permissionlessly, the remaining share is sent to the sub-NO's bond balance.
- Rewards Splitter addresses can only be set or changed when there are no claimable rewards.
- The initial split configuration can only be changed after the first reward distribution.
- Reward splits apply to Node Operator rewards only, not to bond rebase.

:::warning
Review split recipient addresses carefully before the first distribution. A misconfigured initial split can route rewards to the wrong addresses before the configuration can be changed.
:::
