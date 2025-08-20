# Predeposit Guarantee

This user guide explains how to use the Predeposit Guarantee contract as part of the stVaults staking infrastructure.

The Predeposit Guarantee (PDG) contract mitigates deposit frontrunning vulnerabilities outlined in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It employs Merkle proof based mechanism distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) used by Lido Core.

The PDG enables Node Operators to deposit validators using vault funds in a trustless manner.

:::info
stVaults are using [`0x02-type`](https://eips.ethereum.org/EIPS/eip-7251) withdrawal credentials for deposits.
Therefore stVaults can utilize large validators (depositing up to 2048 ETH per a single validator not losing efficiency).
:::

## Resources

- [Technical details](https://hackmd.io/@lido/stVaults-design?stext=5138%3A160%3A0%3A1744277214%3A66cxZj)
- [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol)

## Deposit Data Generation

Node Operators should generate deposit data with the following specifications for stVaults:

- **Withdrawal credentials**: `0x02-type` format pointing to the stVault address (`0x02` + 30 bytes of zeros + stVault address)
- **Amount for predeposit**: 1 ETH (for the initial predeposit phase)

Subsequent deposits can be made for any amount up to the remaining validator balance.

:::tip **For Hoodi testnet only**
You can use this tool for generating deposit data: [Depositor](https://github.com/tamtamchik/depositor)
:::

## Use cases

### Full-cycle trustless path through PDG

The PDG enables a **non-custodial depositing mechanism** by using a Node Operator's (or its guarantor's) provided ether guarantee as collateral.

One of its key advantages is the **separation of ether funds** between the vault owner and the Node Operator.

![Full-cycle trustless](/img/stvaults/full-proof-pdg.png)

Steps:

1. The stVault's owner supplies 100 ETH to the vault.  
   Method called: `Dashboard.fund()` with ETH transfer (`payable`).
2. The Node Operator _optionally_ assigns a guarantor address that will further provide a 1 ETH guarantee. _(This guarantor can be the Node Operator, Vault Owner, or a third party.)_  
   Method called: `PredepositGuarantee.setNodeOperatorGuarantor(newGuarantor)`.
3. The Node Operator's guarantor tops up 1 ETH to the PDG contract, specifying the Node Operator's address. This serves as the predeposit guarantee collateral.  
   Method called: `PredepositGuarantee.topUpNodeOperatorBalance(nodeOperator)` with ETH transfer.
4. The Node Operator generates validator keys and predeposit data.
5. The Node Operator predeposits 1 ETH from the vault balance to the validator via the PDG contract.  
   Method called: `PredepositGuarantee.predeposit(stakingVault, deposits, depositsY)`, same time the PDG locks 1 ETH from the Node Operator's guarantee collateral in the PDG.
6. Anyone (permissionless) submits a Merkle proof of the validator's appearing on the Consensus Layer to the PDG contract with the withdrawal credentials corresponding to the stVault's address.  
   Method called: `PredepositGuarantee.proveValidatorWC(witness)`.  
   6.1. Upon successful verification, 1 ETH of the Node Operator's guarantee collateral is unlocked from the PDG balance — making it available for withdrawal or reuse for the next validator predeposit.
7. The Node Operator's guarantor withdraws the 1 ETH from the PDG contract or retains it for reuse with future validators.  
   Method called: `PredepositGuarantee.withdrawNodeOperatorBalance(nodeOperator, amount, recipient)`.
8. The Node Operator makes a top-up deposit of the remaining 99 ETH from the vault balance to the validator through the PDG.  
   Method called: `PredepositGuarantee.depositToBeaconChain(stakingVault, deposits)`.

### PDG shortcut

This mechanism allows one to bypass the predeposit process, enabling a direct deposit to the validator without using PDG initially.

The validator can then be linked to the vault retroactively by submitting proof through the PDG contract.

This approach is useful when there is a mutual off-chain trust between the Node Operator and the stVault's owner.

![Shortcut-pdg](/img/stvaults/shortcut-pdg.png)

Steps:

1. The stVault's owner supplies 100 ETH to the vault.  
   Method called: `Dashboard.fund()` with ETH transfer (`payable`).
2. The Node Operator generates validator keys and deposit data.
3. The Node Operator shares the deposit data with the stVault's owner.
4. The stVault's owner deposits 1 ETH from the vault balance directly to the validator, bypassing the PDG.  
   Method called: `Dashboard.unguaranteedDepositToBeaconChain(deposits)`.  
   4.1. As a result, the stVault's total value is temporarily reduced by 1 ETH until the next oracle report delivered containing the appeared validator's balance.
5. The stVault's owner submits a Merkle proof of the validator's appearing on the Consensus Layer to the `Dashboard` contract.  
   Method called: `Dashboard.proveUnknownValidatorsToPDG(witness)`.
6. The Oracle report confirms the validator's balance (1 ETH). The stVault's total value is then increased by 1 ETH accordingly.
7. The Node Operator deposits the remaining 99 ETH from the vault balance to the validator through the PDG.  
   Method called: `PredepositGuarantee.depositToBeaconChain(stakingVault, deposits)`.

—

:::tip 📣 **Leave feedback**
Feel free to drop your thoughts about PDG and Lido V3 through **[this simple form](https://tally.so/r/3X9vYe)**.
:::
