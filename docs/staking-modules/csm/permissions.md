# Permissions in CSM
CSM contracts are designed to ensure appropriate permissions for validator operation, [bond](./join-csm#bond) and key management, and module management.

## Node Operator permissions
CSM Node Operators have the following permissions and controls:

- Node Operator is **the ultimate owner** of the validators' private keys;
- Node Operator can join CSM permissionlessly;
- Node Operator can have up to `kaysLimit` validator public keys. `kaysLimit` is set by the Lido DAO and typically is unlimited;
- Node Operator can delete uploaded validator public keys that are not deposited by the Lido on Ethereum protocol yet. A service `keyDeletionFee` is taken for each deleted key to cover associated maintenance costs incurred by the protocol;
- Node Operator can claim excess [bond](./join-csm#bond) tokens and rewards at any moment;
- Node Operator can upload additional [bond](./join-csm#bond) tokens at any moment without uploading new validator public keys;
- Node Operator can exit validators from the Consensus Layer at any moment and claim back [bond](./join-csm#bond) tokens once validator withdrawal is reported to the module using a [permissionless method](../../staking-modules/csm/contracts/CSVerifier.md#processwithdrawalproof);
- Node Operator can change `managerAddress` and `rewardAddress` at any time;
- Node Operator can compensate for the reported EL rewards stealing penalty to avoid benefits reset and validator exit requests for the unbonded validators;

## Lido DAO permissions
Lido DAO has the following permissions and controls via on-chain Aragon voting:

- Lido DAO can update the module contracts code;
- Lido DAO can pause and unpause module contracts, effectively stopping or resuming the creation of the new Node Operator, the uploading of the new validator public keys, the claim of the rewards, and excess [bond](./join-csm#bond) tokens;
- Lido DAO can penalize Node Operator's [bond](./join-csm#bond) tokens in case of protocol rules violations;
- Lido DAO can add and modify [bond](./join-csm#bond) curves;
- Lido DAO can set configurable parameters of the module contracts;
- Lido DAO can change role members for the module contracts;

## CSM Committee permissions
[CSM Committee](https://research.lido.fi/t/csm-committee-creation/8333) has the following permissions and controls:

- Report facts of MEV and EL rewards stealing committed by CSM Node Operators;
- Cancel MEV stealing penalty if needed;
- Start EasyTracks to settle MEV stealing penalty;
- Switch the [bond](./join-csm#bond) curve for the particular Node Operator;
- Pausing CSM in case of emergency via GateSeal;
