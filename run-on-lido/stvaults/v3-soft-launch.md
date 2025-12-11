---
sidebar_position: 6
---
# V3 soft launch with paused PDG
Lido V3 is [launching in phases](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665#p-22926-rollout-plan-9).

[Phase 1 evolves into Soft-Launch Mode](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665/8) for early adopters and builders to enable building and testing on Mainnet.

## Soft launch limitations

Soft launch will not enable PredepositGuarantee (PDG) contract. 

:::tip
**The Predeposit Guarantee (PDG)** contract mitigates deposit frontrunning vulnerabilities outlined in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It employs a Merkle proof based mechanism distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) used by Lido Core.

The PDG enables Node Operators to deposit validators using vault funds in a trustless manner.

The full-cycle trustless path through PDG enables depositing ETH from an stVault's Balance to validators on BeaconChain without impact on key stVault metrics: Total Value, stETH minting capacity, Health Factor, etc. It means that the Vault Owner can fully utilize stETH minting capacity right after supplying ETH to the stVault, and enables the Node Operator to separately manage the depositing of ETH from the stVault Balance to validators.
:::

Because PDG will not be enabled during soft launch, deposits from stVault Balance to validators will reduce the Total Value of the vault temporarily until the deposit is verified, meaning that:

1. Leveraged staking through lending markets is only possible via repeating loops multiple times. Leveraged staking using flash-loans will be utilizable on Phase 2 of the rollout plan, once PDG is enabled.
2. Key rotation is not possible when stETH Utilization ratio is close to 100%.
3. Direct top-ups to validators from the stVault Balance are not yet supported.

The general recommendation for Phase 1 is not to utilize the entire stETH Minting Capacity and to keep at least 1 ETH of Total Value unlocked, which will enable withdrawal and depositing of it to validators without PDG usage.

## Deposit of new stake to validators during soft launch

:::warning

All these options require a mutual off-chain trust between the Node Operator and the Vault Owner.

:::

1. **Option 1: Unguaranteed Deposit method (suggested)**, i.e. withdraw ETH from the stVault to deposit it without PDG checks under an on-chain consent from a vault owner to a Node Operator.
    1. Supply ETH into stVaults:
        - Method called: `Dashboard.fund()` with ETH transfer (`payable`).
        - Caller must have the `FUND_ROLE` role.
    2. The stVault's owner allows Depositor bypassing PDG.
        - Method called: `Dashboard.setPDGPolicy(PDGPolicy)`.
        - PDG Policy to set up: `ALLOW_DEPOSIT_AND_PROVE`.
        - Caller must have the `DEFAULT_ADMIN_ROLE` role.
    3. The Node Operator Manager assigns role `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` to the address that will make deposits (Depositor).
    4. Depositor deposits from the stvault Balance to Validator BeaconChain using Unguaranteed Deposit method:
        - Method called: `Dashboard.unguaranteedDepositToBeaconChain(deposits)`.
        - Caller must have the `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` role.
2. **Option 2: Side-deposit**, i.e. deposit ETH right to validators on BeaconChain without supplying it to the stVault before.
    1. Side-deposit (Deposit to Validator on BeaconChain that are mapped to stVault by withdrawal credentials)
    2. Adjust increased amount of ETH on Validator as part of Total Value, not as rewards, to avoid calculation Node Operator fees based on this amount:
        1. Method called `Dashboard.addFeeExemption(uint256 _exemptedAmount)`.
        2. Caller must have the `NODE_OPERATOR_MANAGER_ROLE`, or delegated `NODE_OPERATOR_FEE_EXEMPT_ROLE` role.
3. **Option 3**: Consolidation of validators to validators with mapped to stVault by withdrawal credentials (see [Consolidation guide](https://docs.lido.fi/run-on-lido/stvaults/consolidation)), i.e. migrate existing external stake without exits and re-entering:
    1. Launch “recipient” validators according to options 1 or 2.
    2. Consolidate other “external” validators into stVault associated validators (created on the prev step) after they become active on the beacon chain.

## Capabilities that will be enabled later with the full launch

In Phase 2, according to the [updated V3 rollout plan](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665/8), the Predeposit Guarantee (PDG) contract will enable the following capabilities:

- **Non-custodial depositing mechanism** using the Node Operator’s (or guarantor’s) provided ether guarantee as collateral.
- **Separation of ETH funds** between the Vault Owner and the Node Operator.
- A depositing mechanism **that does not affect key stVaults metrics** — Total Value, stETH minting capacity, or Health Factor. This means ETH can be deposited to validators through PDG even when the stETH minting capacity is fully utilized.

Use cases enabled by PDG at full launch:

- Leveraged staking through lending markets using a flash loan.
- Direct top-ups of proved validators with ETH from the stVault Balance.
- Key rotation even when the stETH minting capacity utilization is close to 100%.