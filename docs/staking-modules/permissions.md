# Permissions

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

These modules combine caller-specific permissions for Node Operator management, committee-operated flows, Easy Track actions, and role-based controls for protocol administration.

Role assignments can be changed by governance, so the deployed contracts and their on-chain role membership are the source of truth. See the deployed addresses for [CMv2](/deployed-contracts/#curated-module-v2) and [CSM](/deployed-contracts/#community-staking-module).

## Node Operator permissions

Each Node Operator acts through two addresses set at creation, a manager address and a reward address. These actions are available in all of these modules:

- Add validator keys up to the configured `keysLimit` and remove keys that have not been deposited.
- Top up their bond independently of adding validator keys, and claim published rewards or available excess bond.
- Manage their manager and reward addresses and configure reward splits.
- Exit validators through a standard voluntary exit or request an EIP-7002 exit through [`Ejector`](/staking-modules/contracts/Ejector). After a withdrawal is reported, any bond that is no longer required can be claimed.
- Compensate an active [general delayed penalty](/run-on-lido/csm/penalties#how-penalties-and-charges-are-applied) from available excess bond.

Where they differ:

| | CMv2 | CSM |
| --- | --- | --- |
| Joining | Through the [`CuratedGate`](/staking-modules/contracts/CuratedGate) for the [operator type](/run-on-lido/cm-v2/node-operator-types), with a valid Merkle proof. Each eligible address can use a given gate only once | Permissionlessly through [`PermissionlessGate`](/staking-modules/contracts/PermissionlessGate), or through [`VettedGate`](/staking-modules/contracts/VettedGate) for the [ICS and IDVTC profiles](/run-on-lido/csm/context-and-background#operator-profiles-and-economics) |
| Key removal | No charge for key removal | A configurable `keyRemovalCharge` applies to each removed key |
| Manager permissions | Always enabled, so the manager is the Node Operator owner | Depend on whether extended manager permissions were enabled at creation |
| Name and description | Stored in [`MetaRegistry`](/staking-modules/contracts/MetaRegistry) and updatable, unless metadata edits have been restricted | Not stored by the module |

In CMv2, creating a Node Operator does not make it eligible for deposits. The Curated Module Committee must add it to an operator group through Easy Track before it receives a stake allocation weight.

For the detailed manager and reward address permissions, see [Roles](/run-on-lido/cm-v2/roles) for CMv2 and [Operator Roles](/run-on-lido/csm/lido-csm-widget/operator-roles) for CSM.

:::note
None of these permissions reach the validator private keys, which are created and held by the Node Operator alone. The modules store validator public keys and deposit signatures only.
:::

## Committee permissions

Each module has a committee with narrowly scoped operational permissions. These are the [Curated Module Committee (CMC)](/multisigs/committees#220-curated-module-committee-cmc) and the [Community Staking Module Committee](/multisigs/committees#29-community-staking-module-committee).

Both committees can:

- Report and cancel general delayed penalties for protocol rule violations, and manage the associated additional fines.
- Initiate approved Easy Track flows, which are used to settle general delayed penalties, report slashed withdrawals, and update gate Merkle trees.
- Trigger emergency pauses for designated module contracts through [CircuitBreaker](/deployed-contracts/#circuit-breaker).

In addition:

- **The CMC** can update Node Operator names and descriptions and restrict further metadata edits by the Node Operator owner, create or update operator groups and allocation shares, and pause an individual Curated Gate to stop new Node Operator creation for that type.
- **The CSM Committee** can assign or reset an existing bond curve for a Node Operator, and manage the default and per-curve key-removal charges.

Neither committee can upgrade contracts, grant itself additional roles, or resume paused contracts through these operational roles. The CMC additionally cannot change an existing Node Operator's bond curve or reset its manager or reward address.

## Lido DAO governance permissions

Lido DAO governance acts through the Aragon Agent, which holds `DEFAULT_ADMIN_ROLE` on the main module contracts and is the proxy admin for upgradeable components. Through governance, it can:

- Upgrade proxy-based contracts or change their proxy administration.
- Pause and resume module contracts, effectively stopping or resuming the creation of new Node Operators, validator key uploads, and claims of rewards and excess bond.
- Grant and revoke contract roles, including operational roles that are unassigned by default.
- Use the emergency `OPERATOR_ADDRESSES_ADMIN_ROLE` to forcibly reset a Node Operator's manager and reward addresses.
- Create and modify bond curves, change the curve assigned to an existing Node Operator, and configure Node Operator type parameters. **In CMv2 this also covers allocation weights.**
- Change the module's stake-share limit and other configuration in the Staking Router.
- Manage Performance Oracle committee membership and quorum.
- Change administrative settings such as the bond-lock period, charge recipient, reward-rebate recipient, and the `Ejector` used by `ValidatorStrikes`.

Holding `DEFAULT_ADMIN_ROLE` does not automatically grant each operational role. In the configured deployments, routine reporting, settlement, group management, oracle, and emergency actions are delegated to specialized actors.
