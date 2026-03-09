---
sidebar_position: 3
---

# Exit Validators

Different stVault participants have specific permissions to initiate validator exits or withdrawals from the Consensus Layer.

## Node Operator

A Node Operator can directly perform validator operations:

- Exit a validator.
- Perform a **partial ETH withdrawal** from the validator.

## Vault Owner

A Vault Owner can do direct and indirect withdrawals:

- Request a **validator exit** (the exit transaction is performed by the Node Operator)
- Trigger a **partial or full forced ETH withdrawal** from the validator:
  - **0 ETH** — triggers a full validator exit.
  - **Any positive amount** — keeps at least **32 ETH** on the validator balance.

## stVaults Committee

The stVaults Committee can trigger a **forced validator exit**, but only if the vault has outstanding **Obligations**:

- **Health Factor < 100%**.
- **Unsettled Lido fees ≥ 1 ETH**.
- **Redemptions** (currently deactivated on Mainnet).

## Lido DAO

The DAO can also trigger a **forced validator exit**, but only if the vault has obligations:

- **Health Factor < 100%**.
- **Unsettled Lido fees ≥ 1 ETH**.
- **Redemptions** — currently deactivated on Mainnet, but can be activated within the same DAO vote.