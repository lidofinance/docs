# Pre-deposit Guarantee

This user guide explains how to use the Pre-deposit Guarantee contract as part of the stVaults staking infrastructure.

The Pre-deposit Guarantee (PDG) contract mitigates deposit frontrunning vulnerabilities outlined in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It employs Merkle proof based mechanism distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) used by Lido Core.

The PDG enables Node Operators to deposit validators using vault funds in a trustless manner.

:::info
stVaults are using [`0x02-type`](https://eips.ethereum.org/EIPS/eip-7251) withdrawal credentials for deposits.
:::

## Resources

- [Technical details](https://hackmd.io/@lido/stVaults-design?stext=5138%3A160%3A0%3A1744277214%3A66cxZj)
- [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol)

## Use cases

### Full-cycle trustless path through PDG

The PDG enables a **non-custodial depositing mechanism** by using a Node Operator's (or its guarantor’s) provided ether guarantee as collateral.

One of its key advantages is the **separation of ether funds** between the vault owner and the Node Operator.

![Full-cycle trustless](/img/stvaults/full-proof-pdg.png)

Steps:

1. The stVault's owner supplies 32 ETH to the vault.
Method called: `fund()` with ETH transfer (`payable`).
2. The Node Operator *optionally* assigns a guarantor address that will further provide a 1 ETH guarantee bond. *(This guarantor can be the Node Operator, Vault Owner, or a third party.)*
Method called: `setNodeOperatorGuarantor(newGuarantor)`.
3. The Node Operator’s guarantor tops up 1 ETH to the PDG contract, specifying the Node Operator’s address. This serves as the pre-deposit guarantee collateral.
Method called: `topUpNodeOperatorBalance(nodeOperator)` with ETH transfer.
4. The Node Operator generates validator keys and pre-deposit data.
5. The Node Operator pre-deposits 1 ETH from the vault balance to the validator via the PDG contract.
Method called: `predeposit(stakingVault, deposits, depositsY)`, same time the PDG locks 1 ETH from the Node Operator’s gurantee collateral in the PDG.
6. Anyone (permissionless) submits a Merkle proof of the validator’s appearing on the Consensus Layer to the PDG contract with the withdrawal credentials corresponding to the stVault's address.
Method called: `proveValidatorWC(witness)`.
6.1. Upon successful verification, 1 ETH of the Node Operator’s guarantee collateral is unlocked from the  PDG balance — making it available for withdrawal or reuse for the next validator pre-deposit.
7. The Node Operator’s guarantor withdraws the 1 ETH from the PDG contract or retains it for reuse with future validators.
Method called: `withdrawNodeOperatorBalance(nodeOperator, amount, recipient)`.
8. The Node Operator makes a top-up deposit of the remaining 31+ ETH from the vault balance to the validator through the PDG.
Method called: `depositToBeaconChain(stakingVault, deposits)`.

### PDG shortcut

This mechanism allows one to bypass the pre-deposit process, enabling a direct deposit to the validator without using PDG initially.

The validator can then be linked to the vault retroactively by submitting proof through the PDG contract.

This approach is useful when there is a mutual off-chain trust between the Node Operator and the stVault's owner.

![Shortcut-pdg](/img/stvaults/shortcut-pdg.png)

Steps:

1. The stVault's owner supplies 100 ETH to the vault.
Method called: `fund()` with ETH transfer (`payable`).
2. The Node Operator generates validator keys and pre-deposit data.
3. The Node Operator shares the validator keys and pre-deposit data with the stVault's owner.
4. The stVault's owner deposits 1 ETH from the vault balance directly to the validator, bypassing the PDG. Method called: `unguaranteedDepositToBeaconChain(deposits)`.
4.1. As a result, the stVault’s total value is temporarily reduced by 1 ETH until the next oracle report delivered.
5. The stVault's owner submits a Merkle proof of the validator’s appearing on the Consensus Layer to the `Dashboard` contract. Method called: `proveUnknownValidatorsToPDG(witness)`.
6. The Oracle report confirms the validator’s balance (1 ETH). The stVault’s total value is then increased by 1 ETH accordingly.
7. The Node Operator deposits the remaining 99 ETH from the vault balance to the validator through the PDG. Method called: `depositToBeaconChain(stakingVault, deposits)`.
