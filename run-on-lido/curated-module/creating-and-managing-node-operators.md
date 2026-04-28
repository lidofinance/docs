---
sidebar_position: 5
---

# ⚙️ Creating & Managing Node Operators

This page covers how to create a Node Operator, what happens immediately after creation, and how to use the operator dashboard day-to-day. It also covers what is fixed at creation and cannot be changed later.

## Node Operator creation

### Creating a Node Operator

![Confirm NO creation](/img/cm-guide/no-create-confirm.png)

You create NOs through the CM staking widget. Each one has a type assigned at creation which can only be changed via a full on-chain vote. It affects your bond requirement, reward share, and stake allocation weight.

The creation flow has four steps:

1. **Select your NO type.** Choose from the list of NO types previously set by the CMC. See [Node Operator Types](./node-operator-types) for details on each type.
2. **Set a Manager Address and a Rewards Address.** These are separate addresses. The manager address handles key uploads, operational actions, and can change rewards address. The rewards address receives your earned rewards.

:::warning
We recommend both Manager and Rewards Addresses to be highly secure, and preferably multi-signature wallets. Compromise of either address can result in loss of funds and, in the case of the Manager Address, loss of operational control over the Node Operator.
:::

3. **Add a name and description.** The name identifies your sNO in the dashboard and in the Operator Group view. These can be edited later.
4. **Review and confirm.** Check all details before submitting.

### After creation

After your transaction is confirmed, the CMC adds your NO to an Operator Group via an Easy Track motion, which can take up to 3 days to be enacted if there are no objections, and assigns a share allocation weight within the group.

Your operator type is set at creation and can only be changed through a DAO vote. The type is written into the on-chain record at the moment the CuratedGate transaction is submitted.

## Node Operator management

### The dashboard

Once your NO is active, you manage it through the operator dashboard. The dashboard is organized into tabs in the left sidebar, each covering a different area of your operator.

![CM dashboard](/img/cm-guide/no-dashboard.png)

The sidebar tabs are:

- **Dashboard**: overview of your NO with stake & key information (active, depositable and potential capacity), bond balance, claimable rewards, role addresses, and links to external monitoring tools.
- **[Keys](./bond-and-key-management)**: upload new deposit data and view the current status of all your keys.
- **Monitoring**: links to external monitoring tools.
- **[Bond & Rewards](./rewards)**: detailed view of your bond balance, claimable rewards, rewards splitter and claim history.
- **[Roles](./roles)**: update your manager address, rewards address, rewards claimer, and survey submitter.
- **Surveys**: periodic infrastructure setup & configuration surveys. Responses are used in the [VaNOM reports](https://app.hex.tech/8dedcd99-17f4-49d8-944e-4857a355b90a/app/VaNOM-Lido-on-Ethereum-Validator-Node-metrics-1vnpSDa7PtbyA6HX0bVNj1/latest).

### Managing multiple sub-NOs

If you operate more than one NO using the same address, you can switch between them using the Switch Node Operator dropdown in the top right of the dashboard.

Each NO has its own keys, bond balance, and role addresses.

<div style={{textAlign: 'center'}}>
  <img src="/img/cm-guide/no-switch-dropdown.png" alt="Switch Node Operator dropdown" width="480" />
</div>

### Operator Group view

The Operator Group view shows all NOs in the group, their types, their share allocation, and their current key stats.

![Operator Group view](/img/cm-guide/no-operator-group-view.png)
