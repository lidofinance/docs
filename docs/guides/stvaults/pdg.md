# Pre-deposit Guarantee

This user guide explains how to use the Pre-Deposit Guarantee contract as part of the stVaults staking infrastructure.

The Pre-Deposit Guarantee (PDG) contract mitigates deposit frontrunning vulnerabilities outlined in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It employs a mechanism distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) used by Lido Core.

The PDG enables Node Operators to deposit validators using vault funds in a trustless manner.

## Resources

- [Technical details](https://hackmd.io/@lido/stVaults-design?stext=5138%3A160%3A0%3A1744277214%3A66cxZj)
- [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol)

## Use cases

### Full-cycle proof of validators through PDG

The PDG enables a **non-custodial depositing mechanism** by using a guarantor’s bond as collateral.

One of its key advantages is the **separation of financial responsibility** between the vault owner and the Node Operator.

![Screenshot 2025-04-16 at 19.03.23](https://hackmd.io/_uploads/r12gu8T0ke.png)

Steps:
1. The Vault Owner supplies 32 ETH to the vault.
Method called: `fund()` with ETH transfer.
2. The Node Operator assigns a guarantor address that will further provide a 1 ETH guarantee bond. *(This guarantor can be the Node Operator, Vault Owner, or a third party.)*
Method called: `setNodeOperatorGuarantor(newGuarantor)`.
3. The Node Operator’s Guarantor tops up 1 ETH to the PDG contract, specifying the Node Operator’s address. This serves as the bond.
Method called: `topUpNodeOperatorBalance(nodeOperator)` with ETH transfer.
4. The Node Operator generates validator keys and pre-deposit data.
5. The Node Operator pre-deposits 1 ETH from the vault balance to the validator via the PDG contract.
Method called: `predeposit(stakingVault, deposits, depositsY)`.
5.1. The PDG locks 1 ETH from the Node Operator’s bond in the PDG.
6. Anyone (permissionless) submits a Merkle proof of the validator’s existence on the Consensus Layer to the PDG contract.
Method called: `proveValidatorWC(witness)`.
6.1. Upon successful verification, 1 ETH of the Node Operator’s bond is unlocked from the  PDG balance — making it available for withdrawal or reuse for the next validator pre-deposits.
7. The Node Operator’s Guarantor withdraws the 1 ETH bond from the PDG contract or retains it for reuse with future validators.
Method called: `withdrawNodeOperatorBalance(nodeOperator, amount, recipient)`.
8. The Node Operator deposits the remaining 31 ETH from the vault balance to the validator through the PDG.
Method called: `depositToBeaconChain(stakingVault, deposits)`.

### PDG shortcut

This mechanism allows the system to bypass the pre-deposit process, enabling a direct deposit to the validator without using PDG initially.

The validator can then be linked to the vault retroactively by submitting proof through the PDG contract.

This approach is applicable when there is unconditional trust between the Node Operator and the Vault Owner.

![Screenshot 2025-04-16 at 19.03.36](https://hackmd.io/_uploads/H1q-_860kx.png)

Steps:

1. The Vault Owner supplies 32 ETH to the vault.
Method called: `fund()` with ETH transfer.
2. The Node Operator generates validator keys and pre-deposit data.
3. The Node Operator shares the validator keys and pre-deposit data with the Vault Owner.
4. The Vault Owner deposits 32 ETH from the vault balance directly to the validator, bypassing the PDG.
Method called: `unguaranteedDepositToBeaconChain(deposits)`.
4.1. As a result, the stVault’s Total Value is temporarily reduced by 32 ETH until the next Oracle report.
5. Anyone (permissionless) submits a Merkle proof of the validator’s existence on the Consensus Layer to the PDG contract.
Method called: `proveValidatorWC(witness)`.
6. The Oracle report confirms the validator’s balance (32 ETH). The stVault’s Total Value is then increased by 32 ETH accordingly.
