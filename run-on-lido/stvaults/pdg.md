---
sidebar_position: 5
---

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

Additional deposits may be made in any amount up to the validator’s remaining balance. Deposit data is only necessary for validator proof and is not needed for subsequent top-ups.

:::tip **For Hoodi testnet only**
You can use this tool for generating deposit data: [Depositor](https://github.com/tamtamchik/depositor)
:::

## Use cases

### Full-cycle trustless path through PDG

Advantages:
- The PDG enables a **non-custodial depositing mechanism** by using a Node Operator's (or its guarantor's) provided ether guarantee as collateral.
- **Separation of ether funds** between the vault owner and the Node Operator.
- This way enables to spawn validators without impact on key stVautls metrics: Total Value, stETH minting capacity, Heath Factor, etc.

![Full-cycle trustless](/img/stvaults/pdg_main_flow.png)

Steps:

1. The Vault Owner supplies 2048 ETH (required minimum is 32 ETH to activate a validator) to the vault.  
   - Method called: `Dashboard.fund()` with ETH transfer (`payable`).
   - Caller must have the `FUND_ROLE` role.
2. The Node Operator _optionally_ assigns a `Guarantor` address that will further provide a 1 ETH guarantee. _(This Guarantor can be the Node Operator, Vault Owner, or a third party.)_ 
   - Method called: `PredepositGuarantee.setNodeOperatorGuarantor(newGuarantor)`.
   - Caller must have the `NODE_OPERATOR_ROLE` role.
3. The Node Operator _optionally_ assigns a `Depositor` address that will further deposit and top up validators with ether from the stVault balance. 
   - Method called: `PredepositGuarantee.setNodeOperatorDepositor(newDepositor)`.
   - Caller must have the `NODE_OPERATOR_ROLE` role.
4. The `Guarantor` tops up 1 ETH to the PDG contract, specifying the Node Operator's address. This serves as the predeposit guarantee collateral.
   - Method called: `PredepositGuarantee.topUpNodeOperatorBalance(nodeOperator)` with ETH transfer.
   - Caller must be specified as the `Guarantor` in the PredepositGuarantee contract.
5. The `Depositor` generates validator keys and predeposit data.
6. The `Depositor` predeposits 1 ETH from the vault balance to the validator via the PDG contract.
   - Method called: `PredepositGuarantee.predeposit(stakingVault, deposits, depositsY)`.
   - Caller must be specified as the `Depositor` in the PredepositGuarantee contract.
   
   As a result:
   - 6.1. The PDG locks 1 ETH from the Node Operator's guarantee collateral in the PDG.
   - 6.2. 31 ETH on the stVault balance is staged as Activation Deposit (expecting to be deposited to the validator later).
   - 6.3. 1 ETH is deposited to validator.

7. The `Depositor` proves the validator's appearing on the Consensus Layer to the PDG contract with the withdrawal credentials corresponding to the stVault's address, activates validator and (optional) extra tops up it.
   - Method called: `PredepositGuarantee.proveWCActivateAndTopUpValidators(witness, amounts)`.
   - Caller must be specified as the `Depositor` in the PredepositGuarantee contract.
   
   As a result:
   -  7.1. Upon successful verification, 1 ETH of the Node Operator's guarantee collateral is unlocked from the PDG balance — making it available for withdrawal or reuse for the next validator predeposit.
   - 7.2. 31 ETH is deposited to validator from the amount that was Staged on the stVault balance.
   - 7.3 (Optional) extra ETH is deposited on validator, if extra top up was selected.
8. (Optional) The `Garantor` withdraws the 1 ETH from the PDG contract or retains it for reuse with future validators.  
   Method called: `PredepositGuarantee.withdrawNodeOperatorBalance(nodeOperator, amount, recipient)`.
   - Caller must be specified as the `Guarantor` in the PredepositGuarantee contract.
9. The `Depositor` makes a top-up deposit of the remaining 2016 ETH from the vault balance to the validator through the PDG.
   - Method called: `PredepositGuarantee.topUpExistingValidators(Array topUps)`.
   - Caller must be specified as the `Depositor` in the PredepositGuarantee contract.

   As a result:
   - 9.1. 2016 ETH is deposited on validator.


### PDG shortcut

This mechanism allows one to bypass the predeposit process, enabling a direct deposit to the validator without using PDG initially.

The validator can be linked to the vault retroactively by submitting proof through the PDG contract.

Advantages:
- Less actions, less gas fees. It's possible to deposit 2048 ETH in one transaction.
- No mandatory requirement of proof validators if there is no plans to use topup further.

Cons: 
- This approach is useful when there is a mutual off-chain trust between the Node Operator and the stVault's owner.
- This mechanism drops stVault Total Value until validator activation.
- Need to have 32+ unlocked ETH on the stVault Balance to deposit (so it's impossible when utilization ratio is close to 100%).

![Shortcut-pdg](/img/stvaults/pdg-shortcut.png)

Steps:

1. The stVault's owner supplies 100 ETH to the vault.  
   - Method called: `Dashboard.fund()` with ETH transfer (`payable`).
   - Caller must have the `FUND_ROLE` role.
2. The stVault's owner allows `Depositor` bypassing PDG.
   - Method called: `Dashboard.setPDGPolicy(PDGPolicy)`.
   - Caller must have the `DEFAULT_ADMIN_ROLE` role.

   PDG Policies:
      - `STRICT` (Default): deposits require the full PDG process.
      - `ALLOW_PROVE`: allows the node operator to prove unknown validators to PDG.
      - `ALLOW_DEPOSIT_AND_PROVE`: allows the node operator to perform unguaranteed deposits (bypassing the predeposit requirement) and proving unknown validators.

3. The Node Operator assigns roles `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` and `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE`. In the current guide, the Node Operator assigns these roles to the same address as `Depositor`, but this is unnecessary.

4. The Node Operator _optionally_ assigns a `Depositor` address that will further deposit and top up validators with ether from the stVault balance. 
   - Method called: `PredepositGuarantee.setNodeOperatorDepositor(newDepositor)`.
   - Caller must have the `NODE_OPERATOR_ROLE` role.
5. The `Depositor` generates validator keys and predeposit data.
6. The `Depositor` deposits 32 ETH (minimum 32 ETH) from the vault balance to the validator via the Dashboard contract.
   - Method called: `Dashboard.unguaranteedDepositToBeaconChain(deposits)`.
   - Caller must have the `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` role.
   - Caller doesn't have to be specified as the `Depositor` in the PredepositGuarantee contract.

   As a result:
   - 6.1. 32 ETH is withdrawn from the stVault balance.
   - 6.2. stVault Total Value is deducted by 32 ETH until activation queue resolves AND upcoming Oracle report after that.
   - 6.3. 32 ETH is deposited on validator.

7. Oracle reports includes new validator's balance 32 ETH, stVault Total Value increased by 32 ETH.
8. The `Depositor` proves the validator's appearing on the Consensus Layer to the PDG contract with the withdrawal credentials corresponding to the stVault's address, activates validator and (optional) extra tops up it.
   - Method called: `PredepositGuarantee.proveUnknownValidator(ValidatorWitness, IStakingVault)`.
   - Caller must have the `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` role.
   
9. The `Depositor` makes a top-up deposit of the remaining 2016 ETH from the vault balance to the validator through the PDG.
   - Method called: `PredepositGuarantee.topUpExistingValidators(Array topUps)`.
   - Caller must be specified as the `Depositor` in the PredepositGuarantee contract.

   As a result:
   - 9.1. 2016 ETH is deposited on validator.


:::tip 📣 **Leave feedback**
Feel free to drop your thoughts about PDG and Lido V3 through **[this simple form](https://tally.so/r/3X9vYe)**.
:::
