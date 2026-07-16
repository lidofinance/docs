# Permissions in CSM

CSM combines caller-specific permissions for Node Operator management, permissionless proof-based operations, and role-based controls for protocol administration. Role assignments can be changed by governance, so the [deployed contracts and their on-chain role membership](/deployed-contracts/#community-staking-module) are the source of truth.

## Node Operator permissions

Node Operators retain custody of their validator private keys. CSM stores validator public keys and deposit signatures but does not control the corresponding private keys.

Node Operators can:

- Join permissionlessly through [`PermissionlessGate`](./contracts/PermissionlessGate.md) or, when eligible, through [`VettedGate`](./contracts/VettedGate.md).
- Add validator keys up to the configured `keysLimit` and remove keys that have not been deposited. A configurable `keyRemovalCharge` applies to each removed key.
- Top up their bond independently of adding validator keys, and claim published rewards or available excess bond.
- Manage their manager and reward addresses and configure reward splits. The exact controls depend on whether extended manager permissions were enabled when the Node Operator was created.
- Exit validators through a standard voluntary exit or request an EIP-7002 exit through [`Ejector`](./contracts/Ejector.md). After a withdrawal is reported, any bond that is no longer required can be claimed.
- Compensate an active [general delayed penalty](./penalties.md#immediate-and-delayed) from available excess bond.

See [Operator Roles](/run-on-lido/csm/lido-csm-widget/operator-roles) for the detailed manager and reward address permissions.

## CSM Committee permissions

The [CSM Committee](https://research.lido.fi/t/community-staking-module-committee/8333) has narrowly scoped operational permissions:

- Report and cancel general delayed penalties for protocol rule violations, such as EL rewards stealing.
- Assign or reset an existing bond curve for a Node Operator.
- Manage the default and per-curve key-removal charges and general delayed-penalty additional fines.
- Initiate approved CSM Easy Track flows. The Easy Track executor holds the on-chain roles used to settle general delayed penalties, report slashed withdrawals, and update vetted-gate Merkle trees.
- Trigger emergency pauses for designated CSM contracts through [CircuitBreaker](/deployed-contracts/#circuit-breaker).

The committee cannot upgrade contracts, grant itself additional roles, or resume paused contracts through these operational roles.

## Lido DAO governance permissions

Lido DAO governance acts through the Aragon Agent, which holds `DEFAULT_ADMIN_ROLE` on the main CSM contracts and is the proxy admin for upgradeable CSM components. Through governance, it can:

- Upgrade proxy-based contracts or change their proxy administration.
- Pause and resume module contracts, effectively stopping or resuming the creation of new Node Operators, validator key uploads, and claims of rewards and excess bond.
- Grant and revoke contract roles, including operational roles that are unassigned by default.
- Use the emergency `OPERATOR_ADDRESSES_ADMIN_ROLE` to forcibly reset a Node Operator's manager and reward addresses.
- Create and modify bond curves and configure Node Operator type parameters.
- Manage Performance Oracle committee membership and quorum.
- Change administrative settings such as the bond-lock period, charge recipient, reward-rebate recipient, and the `Ejector` used by `ValidatorStrikes`.

Holding `DEFAULT_ADMIN_ROLE` does not automatically grant each operational role. In the configured deployment, routine reporting, settlement, oracle, and emergency actions are delegated to specialized actors.
