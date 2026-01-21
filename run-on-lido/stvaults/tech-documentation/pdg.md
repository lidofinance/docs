---
sidebar_position: 4
---

# 🛡️ Predeposit Guarantee

This user guide explains how to use the Predeposit Guarantee contract as part of the stVaults staking infrastructure.

The Predeposit Guarantee (PDG) contract mitigates deposit frontrunning vulnerabilities outlined in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It disincentivizes frontrunning by having the Node Operator post an economic guarantee of honest behavior, which is proven/disproven via [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788). This mechanism is distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) used by Lido Core.

The PDG enables Node Operators to deposit validators using vault funds in a trustless manner.

:::info
stVaults are using [`0x02-type`](https://eips.ethereum.org/EIPS/eip-7251) withdrawal credentials for deposits.
Therefore stVaults can utilize large validators (depositing up to 2048 ETH per single validator without losing efficiency).
:::

## Resources

- [Technical details](https://hackmd.io/@lido/stVaults-design#36-PredepositGuarantee)
- [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol)

## Deposit Data Generation

Node Operators should generate deposit data with the following specifications for stVaults:

- **Withdrawal credentials**: `0x02-type` format pointing to the stVault address (`0x02` + 30 bytes of zeros + stVault address)
- **Amount for predeposit**: 1 ETH (for the initial predeposit phase)

Additional deposits may be made in any amount up to the validator’s remaining balance. Deposit data is only necessary for validator proof and is not needed for subsequent top-ups.

:::tip **For Hoodi testnet only**
You can use this tool for generating deposit data: [Depositor](https://github.com/tamtamchik/depositor)
:::

## PDG Flows

### Full-cycle trustless path through PDG

Advantages:

- **Non-custodial depositing mechanism** using the Node Operator’s (or guarantor’s) provided ether guarantee as collateral.
- **Separation of ETH funds** between the Vault Owner and the Node Operator.
- A depositing mechanism **that does not affect key stVaults metrics** — Total Value, stETH minting capacity, or Health Factor. This means ETH can be deposited to validators through PDG even when the stETH minting capacity is fully utilized.

Use cases enabled by the full-cycle trustless path through PDG:

- Direct top-ups of proved validators with ETH from the stVault Balance.
- Keys rotation even when the stETH minting capacity utilization is close to 100%.
- Leveraged staking through lending markets using a flash loan.

![Full-cycle trustless](/img/stvaults/pdg_main_flow.png)

Steps:

1. The Vault Owner supplies 2048 ETH (minimum 32 ETH required to activate a validator) to the vault.
   - Method called: `Dashboard.fund()` with ETH transfer (`payable`).
   - Caller must have the `FUND_ROLE` role.
2. **(Optional)** The Node Operator assigns a `Guarantor` address that will provide a 1 ETH guarantee. _This allows the Node Operator to delegate guarantees to an arbitrary hot account while keeping the Node Operator private key safe in cold storage._
   - The default `Guarantor` is the Node Operator.
   - Method called: `PredepositGuarantee.setNodeOperatorGuarantor(newGuarantor)`.
   - Caller must be the `StakingVault.nodeOperator` address.
3. **(Optional)** The Node Operator assigns a `Depositor` address that will deposit and top up validators with ETH from the stVault balance. _This allows the Node Operator to delegate deposits to an arbitrary hot account while keeping the Node Operator private key safe in cold storage._
   - The default `Depositor` is the Node Operator.
   - Method called: `PredepositGuarantee.setNodeOperatorDepositor(newDepositor)`.
   - Caller must be the `StakingVault.nodeOperator` address.
4. The `Guarantor` tops up 1 ETH to the PDG contract, specifying the Node Operator's address. This serves as the predeposit guarantee collateral.
   - Method called: `PredepositGuarantee.topUpNodeOperatorBalance(nodeOperator)` with ETH transfer.
   - Caller must be specified as the `Guarantor` in the PredepositGuarantee contract.
5. The `Depositor` generates validator keys and predeposit data.
6. The `Depositor` predeposits 1 ETH from the vault balance to the validator via the PDG contract.

   - Method called: `PredepositGuarantee.predeposit(stakingVault, deposits, depositsY)`.
   - Caller must be the `Depositor` in the PredepositGuarantee contract.

   As a result:

   - 6.1. The PDG locks 1 ETH from the Node Operator's guarantee collateral in the PDG.
   - 6.2. 31 ETH on the stVault balance is staged as Activation Deposit (expecting to be deposited to the validator later).
   - 6.3. 1 ETH is deposited to validator.

7. The `Depositor` proves the validator's appearance on the Consensus Layer to the PDG contract with the withdrawal credentials corresponding to the stVault's address, activates the validator, and (optionally) performs an extra top-up.

   - Method called: `PredepositGuarantee.proveWCActivateAndTopUpValidators(witness, amounts)`.
   - Caller must be the `Depositor` in the PredepositGuarantee contract.

   As a result:

   - 7.1. Upon successful verification, 1 ETH of the Node Operator's guarantee collateral is unlocked from the PDG balance — making it available for withdrawal or reuse for the next validator predeposit.
   - 7.2. 31 ETH is deposited to validator from the amount that was Staged on the stVault balance.
   - 7.3 (Optional) extra ETH is deposited on validator, if extra top up was selected.

8. **(Optional)** The `Guarantor` withdraws the 1 ETH from the PDG contract or retains it for reuse with future validators.
   Method called: `PredepositGuarantee.withdrawNodeOperatorBalance(nodeOperator, amount, recipient)`.
   - Caller must be the `Guarantor` in the PredepositGuarantee contract.
9. The `Depositor` makes a top-up deposit of the remaining 2016 ETH from the vault balance to the validator through the PDG.

   - Method called: `PredepositGuarantee.topUpExistingValidators(Array topUps)`.
   - Caller must be the `Depositor` in the PredepositGuarantee contract.

   As a result:

   - 9.1. 2016 ETH is deposited on validator.

### PDG shortcut

This mechanism allows one to bypass the predeposit step, enabling a one-transaction direct deposit of up to 2048 ETH (as per [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251)) to the validator without using PDG. The validator can be linked to the vault after the deposit by submitting proof through the PDG contract.

Advantages:

- Fewer actions, lower gas fees. It's possible to deposit 2048 ETH in one transaction.
- No mandatory requirement to prove validators if there are no plans to use top-up further.

Cons:

- This approach requires mutual off-chain trust between the Node Operator and the Vault Owner.
- This mechanism reduces stVault Total Value until validator activation **as reported by the oracle**.
- Requires unlocked ETH on the stVault Balance to deposit (i.e. not possible when utilization ratio is close to 100%).

![Shortcut-pdg](/img/stvaults/pdg-shortcut.png)

Steps:

1. The Vault Owner supplies ETH to the vault but does not mint against it.

   - Method called: `Dashboard.fund()` with ETH transfer (`payable`).
   - Caller must have the `FUND_ROLE` role (or be its admin).

2. The Vault Owner gives the Node Operator an explicit permission to bypass PDG by setting the appropriate PDG policy.

   - Method called: `Dashboard.setPDGPolicy(PDGPolicy)`.
   - Caller must have the `DEFAULT_ADMIN_ROLE` role (or be its admin).

   PDG Policies:

   - `STRICT` (Default): deposits require the full PDG process.
   - `ALLOW_PROVE`: allows proving unknown validators to PDG (but not unguaranteed deposits).
   - `ALLOW_DEPOSIT_AND_PROVE`: allows both unguaranteed deposits (bypassing the predeposit requirement) and proving unknown validators.

3. **(Optional)** The Node Operator Manager grants the necessary roles to the address that will perform unguaranteed deposits and proving. By default, the Node Operator Manager can perform unguaranteed deposits. In this guide, we assume both roles are granted to the same address referred to as `Depositor`.

   - Method called: `Dashboard.grantRole(role, account)` for each role.
   - Caller must have the `NODE_OPERATOR_MANAGER_ROLE` role.
   - Roles to grant:
     - `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` — allows calling `unguaranteedDepositToBeaconChain()`
     - `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` — allows calling `proveUnknownValidatorsToPDG()`

4. **(Optional)** The Node Operator assigns a `Depositor` address in the PDG contract that will be authorized to top up validators via PDG after they are proven. By default, the Node Operator is the `Depositor`.

   - Method called: `PredepositGuarantee.setNodeOperatorDepositor(newDepositor)`.
   - Caller must be the Node Operator address (as registered in the StakingVault via `nodeOperator()`).

5. The `Depositor` generates validator keys and deposit data with:

   - Withdrawal credentials in `0x02-type` format pointing to the stVault address (`StakingVault.withdrawalCredentials()`).
   - Deposit amount must not bring the validator balance over 2048 ETH.

6. The `Depositor` performs a deposit in the specified amount from the vault balance to the validator via the Dashboard contract.

   - Method called: `Dashboard.unguaranteedDepositToBeaconChain(deposits)`.
   - Caller must have the `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` role (or be its admin).

   As a result:

   - 6.1. ETH is withdrawn from the stVault's withdrawable balance.
   - 6.2. stVault Total Value is reduced by the deposit amount until the validator appears in the Beacon Chain state AND is included in a subsequent Oracle report.
   - 6.3. ETH is deposited to the validator via the Ethereum Deposit Contract.

7. The Oracle report includes the new validator's balance; stVault Total Value increases by the deposit amount.

8. **(Optional)** The `Depositor` proves the validator's appearance on the Consensus Layer to enable future top-ups via PDG. If the validator has max effective balance (2048 ETH), there is no need to prove it, as it cannot be topped up further.

   - Method called: `Dashboard.proveUnknownValidatorsToPDG(witnesses)`.
   - Caller must have the `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` role (or be its admin).

   As a result:

   - 8.1. The validator transitions from `NONE` to `ACTIVATED` stage in PDG.
   - 8.2. The validator is now registered in PDG and can receive top-ups via `topUpExistingValidators()`.

9. **(Optional)** The `Depositor` makes a top-up deposit from the vault balance to the validator through PDG.

   - Method called: `PredepositGuarantee.topUpExistingValidators(topUps)`.
   - Caller must be the address set as `Depositor` in the PDG contract.
   - Top-up amount must not bring the validator balance over 2048 ETH.

   As a result:

   - 9.1. The specified ETH amount is deposited to the validator from the stVault balance.

:::tip 📣 **Leave feedback**
Feel free to drop your thoughts about PDG and Lido V3 through **[this simple form](https://tally.so/r/3X9vYe)**.
:::
