# Permissions in Curated Module v2

Curated Module v2 (CM v2) combines caller-specific permissions for Node Operator management, committee-operated flows, Easy Track actions, and role-based controls for protocol administration. Role assignments can be changed by governance.

## Node Operator permissions

Node Operators retain custody of their validator private keys. CM v2 stores validator public keys and deposit signatures but does not control the corresponding private keys.

Node Operators can:

- Join through an eligible [`CuratedGate`](./contracts/CuratedGate.md). Each gate represents a Node Operator type and requires a valid Merkle proof; an eligible address can use a given gate only once.
- Add validator keys up to the configured `keysLimit` and remove keys that have not been deposited. CM v2 does not charge for key removal.
- Top up their bond independently of adding validator keys, and claim published rewards or available excess bond.
- Manage their manager and reward addresses, update their name and description, and configure reward splits. Extended manager permissions are always enabled, so the manager is the Node Operator owner.
- Exit validators through a standard voluntary exit or request an EIP-7002 exit through [`Ejector`](./contracts/Ejector.md). After a withdrawal is reported, any bond that is no longer required can be claimed.
- Compensate an active general delayed penalty from available excess bond.

Creating a Node Operator does not make it eligible for deposits. The Curated Module Committee must add it to an operator group through Easy Track before it receives a stake allocation weight.

See [Roles](/run-on-lido/cm-v2/roles) for the detailed manager and reward address permissions.

## Curated Module Committee permissions

The [Curated Module Committee (CMC)](/multisigs/committees#220-curated-module-committee-cmc) has narrowly scoped operational permissions:

- Report and cancel general delayed penalties for protocol rule violations and manage the associated additional fines.
- Update Node Operator names and descriptions and restrict further metadata edits by the Node Operator owner.
- Initiate approved Easy Track flows used to settle general delayed penalties, report slashed withdrawals and their losses, create or update operator groups and allocation shares, and update Curated Gate Merkle trees.
- Pause an individual Curated Gate to stop new Node Operator creation for that type.
- Trigger emergency pauses for designated CM v2 contracts through [CircuitBreaker](/deployed-contracts/#circuit-breaker).

The CMC cannot directly change an existing Node Operator's bond curve, reset its manager or reward address, upgrade contracts, grant itself additional roles, or resume paused contracts through these operational roles.

## Lido DAO governance permissions

Lido DAO governance acts through the Aragon Agent, which holds `DEFAULT_ADMIN_ROLE` on the main CM v2 contracts and is the proxy admin for upgradeable components. Through governance, it can:

- Upgrade proxy-based contracts or change their proxy administration.
- Pause and resume module contracts, effectively stopping or resuming Node Operator creation, validator key uploads, and claims of rewards and excess bond.
- Grant and revoke contract roles, including roles used for emergency Node Operator address changes and bond-curve management.
- Create and modify bond curves, change the curve assigned to an existing Node Operator, and configure Node Operator type parameters and allocation weights.
- Change the module's stake-share limit and other configuration in the Staking Router.
- Manage Performance Oracle committee membership and quorum.
- Change administrative settings such as the bond-lock period, charge recipient, reward-rebate recipient, and the `Ejector` used by `ValidatorStrikes`.

Holding `DEFAULT_ADMIN_ROLE` does not automatically grant each operational role. In the configured deployment, routine reporting, settlement, group management, oracle, and emergency actions are delegated to specialized actors.
