---
sidebar_position: 2
---

# 🏗️ Technical Design and Architecture

## 1. Abstract

Lido Staking Vaults (stVaults) are modular primitives that connect stakers, node operators, and protocols — enabling them to define custom fee structures, tailor validator configurations, and fine-tune risk/reward. This flexibility is achieved without compromising decentralization, security, or access to stETH liquidity.

## 2. Design

### 2.1 Goals

StVaults are designed to:

1. Enable customizable risk-reward profiles for liquid staking while preserving stETH's stability and fungibility.
2. Improve alignment with node operators who wish to onboard clients and actively participate in the Lido protocol.
3. Support the development of structured staking products and deeper protocol integrations.

These goals are built on the vision outlined in [Hasu's 2nd GOOSE voted-in proposal](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xeedef9fea3d782f192410768cabaf6974da40ef36e1d22c7f8fff5fd4cfc7a59), establishing a foundational layer for diverse staking product lines.

### 2.2 Principles

The introduction of stVaults brings major changes to the existing Lido core pool protocol contracts (hereafter referred to as **Lido Core**). To ensure protocol stability, it's essential to define the foundational constraints that remain unchanged:

1. StVaults users do not negatively affect stETH users:
   - StVaults do not negatively affect stETH users' APR
   - Slashing risk consequences are contained within the node operator group of staking vaults up to the level agreed by the DAO
2. StVaults have a set reserve ratio that determines the quantity of stETH that can be minted based on ETH provided, and can only be changed by the DAO
3. The impact of possible reallocation of stake between Lido Core and stVaults is contained and manageable
4. StETH solvency - all existing stETH can be converted into ETH at a 1:1 ratio

So, it remains the key priority to maintain the stability and security of the Lido Core and the whole Lido staking infrastructure.

## 3. Architecture

The Lido Vaults platform comprises the following contracts:

- **StakingVault**: Manages individual staking positions and holds assets for validators.
- **VaultHub**: Serves as the central registry and coordination point between the vaults platform and Lido Core.
- **LazyOracle**: Verifies reports from the oracle network and forwards individual vault updates to VaultHub.
- **OperatorGrid**: Maintains a node operator registry and manages vaults' minting parameters.
- **PredepositGuarantee**: Ensures validator deposit security.
- **VaultFactory**: Deploys verified (allowed to be connected to VaultHub) vault instances.
- **Dashboard**: An optional contract that provides node operator fee accounting and a UX-friendly interface for a StakingVault.

See the [stVaults contracts reference](/contracts/vault-hub) for per-contract APIs.


### 3.1 StakingVault

The StakingVault contract is a 0x02-type withdrawal credentials target and a fundamental building block of the Lido Vaults platform. It represents an isolated staking position managed by a single **owner** and serviced by a single **node operator**. When connected to Lido, the vault can be used as collateral for minting stETH.

With a StakingVault, the owner can:

- Stake their funds directly with their preferred node operator without giving up custody;
- Tap into various block proposing and validation flavors;
- Mint stETH backed by the StakingVault's total value; and
- Build structured products by integrating protocols and risk curators.

:::important
A staking vault is a valid **0x02-type** withdrawal credentials target and supports [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251). Any **0x01-** or **0x02-type** validator can have its balance transferred to a vault validator via the execution-layer consolidation request. A **0x00-type** validator will first have to migrate to **0x01-type** credentials.
:::

![Primer diagram](/img/stvaults/tech-design/primer-diagram.png)

#### Vault Entities

##### Owner

The owner is the administrative account with the most power in the vault. The owner can:

- fund ETH to the vault,
- withdraw ETH from the vault,
- pause and resume beacon-chain deposits,
- request validator exits,
- trigger [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) validator withdrawals,
- change the depositor,
- irreversibly ossify the vault implementation to opt out of proxy upgrades,
- transfer the ownership to another account via the [2-step ownership model](https://docs.openzeppelin.com/contracts/5.x/api/access#Ownable2Step).

When a vault connects to the Lido protocol, VaultHub is set as the vault’s technical owner, serving as an intermediate layer that enforces collateral locks to protect the stETH minted against the vault. The vault’s factual owner is recorded inside VaultHub. Once the vault disconnects from the protocol, VaultHub releases control and restores ownership to that recorded owner, preserving the non-custodial nature.

##### Node operator

The node operator address represents the party that runs the validators associated with the vault. This address is set upon initialization of the vault and cannot be changed.

:::important
It is strongly recommended to use a multisignature account (e.g., Gnosis Safe) to avoid losing access to this account.
:::

Because validator withdrawal credentials are hard-coded to the vault (0x02-type pointing back to the contract), all consensus rewards and exited balances flow into the StakingVault automatically; the operator never takes custody of ETH.

The node operator:

- is expected to perform voluntary exits of the validators as signalled by the owner.
- can forcefully eject vault-associated validators via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002).

##### Depositor

The depositor address is the only party allowed to perform deposits to the beacon chain consuming staged balance resident in the vault. Due to the frontrunning vulnerability (see [3.6: PredepositGuarantee](#36-predepositguarantee)), this responsibility is extracted into a separate role controlled by the vault owner. When connected to the Lido protocol, the depositor must be set to PredepositGuarantee, a specialized contract that mitigates deposit frontrunning.

#### Staged balance

:::note
Staged balance is a mechanism **only** used as part of the PredepositGuarantee contract's predeposit-based deposit process.
:::

The vault depositor controls the vault's **staged balance** counter that reserves ETH for validator activations and cannot be withdrawn. Unstaging ETH makes this ETH available for withdrawal again. This staging mechanism ensures the vault's commitment to activating the validator. Staging enforces a strict invariant: every predeposit of 1 ETH must be paired with 31 ETH staged for activation. This guarantees that the validator can always be topped up to the required 32 ETH, the minimal balance for validator activation. Without this rule, a vault could spawn many 1-ETH validators that never activate, leaving funds locked on the beacon chain that cannot be withdrawn for protocol obligations.

**StakingVault source code**: https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/StakingVault.sol

### 3.2 VaultHub

VaultHub is the central coordination contract of the Lido Vaults platform. It maintains the registry of connected **StakingVaults**, enforces collateralization constraints, mints and burns stETH against per-vault total values, and tracks vault obligations.

When a StakingVault is connected to VaultHub, the latter:

- assumes technical ownership of that vault (via the 2-step pattern) and escrows the **CONNECT_DEPOSIT** (1 ETH);
- records static connection parameters (share limit, reserve ratio, fees) supplied by **OperatorGrid**;
- tracks dynamic state (total value, locked ETH, liability shares, obligations—fee accrued and redemptions if applicable) using reports from **LazyOracle**; and
- exposes a control surface for the vault owner to fund, withdraw, mint, burn, rebalance, pause beacon-chain deposits, request validator exits, and settle obligations.

The **vault owner**:
- retains ownership of the underlying StakingVault through VaultHub;
- is authorized to fund, withdraw, mint, burn, manage validators, and settle obligations;
- may transfer factual ownership to another owner without disconnecting the vault.

_Diagram. VaultHub interactions_
![Simplified contract structure](/img/stvaults/tech-design/simplified-contract-structure.png)

**VaultHub source code:** https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/VaultHub.sol

#### Vault accounting

Each StakingVault has two important parameters that define its state: **total value** and **locked**.

- **total value**: The estimated total of all the vault's validator balances plus any ETH held by the vault contract itself.
- **locked**: The amount of ETH on this vault that is _blocked_ from withdrawal. This amount backs the stETH tokens minted via this stVault.

To control stETH minting, VaultHub tracks these parameters for each stVault:

- **Liability**: The amount of stETH shares minted against the vault (as in, liability towards Lido Core).
- **Reserve ratio (RR)**: A portion of the vault's total value locked as an additional reserve (safety buffer) for minted stETH (e.g., if reserve ratio is 30%, with a total value of 100 ETH, 30 ETH must be reserved, which means the vault can mint 70 stETH max). The maximum possible reserve ratio is 99.99%.
- **Force rebalance threshold (FRT)**: When the reserve drops below this threshold, the vault is considered unhealthy and is subject to **force-rebalancing**. FRT must be at least 0.1% lower than RR, e.g. if RR is 30%, FRT must be 29.9% or smaller.
- **Share limit**: The absolute flat cap on stETH shares that a stVault can mint.
- **Obligations**: the health obligation, stETH redemption requests, and Lido fees.

If the vault's locked amount breaches FRT, the vault is considered unhealthy and:

- cannot mint stETH
- cannot withdraw ETH
- cannot deposit new validators
- is limited to full validator withdrawals only
- and is subject to permissionless force-rebalancing.

:::important
Thanks to [Pectra's EIP-6110](https://eips.ethereum.org/EIPS/eip-6110) and PredepositGuarantee, valid pending deposits contribute to `totalValue`, which allows seamless minting without waiting for the entry queue to clear the deposit.
:::

_Diagram. Vault totalValue breakdown_
![Vault totalValue breakdown](/img/stvaults/tech-design/vault-totalvalue-breakdown.png)

#### Liquidity

Unlike Lido Core, which mints stETH at a 1:1 ratio to supplied ether, Lido Vaults mints stETH at a more conservative ratio. A lower ratio effectively means that the StakingVault must maintain a reserve margin (**Reserve Ratio** or **RR**) determined by risk parameters and limits.

Upon minting stETH, the corresponding amount of ether (plus some reserve due to RR) is **locked** as collateral on the StakingVault, i.e. cannot be withdrawn. The system tracks [stETH shares](https://docs.lido.fi/guides/lido-tokens-integration-guide#steth-internals-share-mechanics) (**liabilityShares**) minted for each StakingVault and updates the **locked** amount (denominated in ether) on the StakingVault according to the stETH rebase. To unlock ether for withdrawal, the StakingVault must burn the outstanding amount of stETH (i.e., repay stETH).

##### Example

Given:

- **Reserve Ratio**: 20% (2000 BP)
- **Force Rebalance Threshold**: 15% (1500 BP)

**Stage 1 - Initial State (Healthy):**

- Total value: **100 ETH**
- Liability: **0 stETH**
- Reserve: **100 ETH** (100% of total value reserved > FRT 15%)
- Status: Can mint

**Stage 2 - Minted StETH (Healthy):**

- Total value: **100 ETH**
- Liability: **80 stETH**
- Reserve: **20 ETH** (20% of total value reserved > FRT 15%)
- Status: Healthy but can't mint anymore

**Stage 3 - Slashing:**

- Total value drops to: **90 ETH**
- Liability: **80 ETH**
- Reserve: **10 ETH** (11.1% of total value reserved < FRT 15%)
- Status: Unhealthy, subject to force rebalance

#### Locked

The locked amount is the total ETH in a vault that cannot be withdrawn. It represents the collateral backing the vault's stETH liability plus reserve. This locked amount ensures the vault remains overcollateralized and can absorb penalties without immediately creating bad debt. The locked amount consists of **stETH liability** and **reserve**, i.e., `locked = liability + reserve`. The reserve itself is derived as the greater of the reserve calculated from the Reserve Ratio and the minimal reserve.

The minimal reserve is the absolute floor for how much collateral must stay locked in a vault, regardless of how much liability exists. The minimal reserve is calculated as the greater of the **connect deposit** and **slashing reserve**.

- **1 ETH Connect Deposit**. Vault creation requires at least 1 ETH to be in the connecting vault. This mandatory connect deposit acts as an anti-sybil mechanism that prevents the creation of spam vaults that would burden the oracle network. The VaultHub verifies that sufficient ETH is present on the vault's balance before proceeding with vault connection, locks this deposit during setup, and keeps it locked for the duration of the vault's connection to VaultHub; it may be used to pay out Lido fees. The connect deposit cannot be used to mint stETH against.
- **Slashing reserve**. Applicable for vaults of a node operator with validators undergoing slashing - an extra chunk of ETH that must remain locked in the event of slashing until the oracle proves that the vault's validators are no longer at risk of being additionally penalized due to the beacon chain's [associated slashing mechanism](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/rewards-and-penalties/). The oracles calculate the reserve off-chain (based on the validator set, time-at-risk, and any slashable offenses it detects) and publish the figure in every report. When the report is applied, VaultHub locks at least this reserve on the vault until the validators are cleared and no additional correlation penalties have been applied.

So the final calculation for **locked** is as follows:
$$
locked = liability + \max(calculatedReserveFromRR, \max(connectDeposit, slashingReserve))
$$

_Diagram. Locked amount breakdown_
![StakingVaults Diagrams](/img/stvaults/tech-design/stakingvaults-diagrams.png)

#### Vault obligations

Obligations are the record of everything a StakingVault _owes_ to the Lido protocol and thus impose a block on the vault balance equal to the pending obligations. VaultHub tracks three types of obligations.

##### 1. Health obligation

Nominated in stETH shares, the health obligation is the amount of liability shares that must be force-rebalanced to restore the vault's health. The health obligation arises automatically when collateralization drops below the health threshold as a result of validator penalties, slashing, or underperformance compared to stETH APR. The health obligation has the **highest settlement priority** over the rest of the obligations.

:::warning
Force-rebalancing is a **punishing** operation, so it is strongly recommended to restore health in more efficient ways like repaying stETH or funding the vault when approaching FRT.
:::

##### 2. Redemptions

Nominated in stETH shares, redemptions represent the amount of liability that must be rebalanced or burned to support Lido Core withdrawals. In a rare scenario where the Lido Core pool is depleted and needs liquidity for its withdrawal queue, the protocol retains the right to issue a redemption obligation to an eligible vault, which ought to be settled by rebalancing or burning shares. Redemption settlement writes off the corresponding liability amount from the vault and supplies the Core pool with ETH to process withdrawals. Redemptions have the **second priority**, meaning the protocol first restores health of the vault and only then settles any redemptions.

:::important
Issued redemptions **do not increase** the vault's liability. Redemptions can be thought of as a portion of the vault's existing liability that must be burned or rebalanced, i.e. if the vault does not have any liability, the protocol cannot issue a redemption against the vault.
:::

##### 3. Lido fees

Nominated in ETH, **Lido fees** - the combined **infra**-, **liquidity**- and **reservation**-fees - are the Lido protocol service fees. These fees accrue continuously on each oracle report, which supplies an updated cumulative-fee counter. VaultHub tracks the settled-fees counter; thus, the delta between cumulative fees and settled fees is considered **unsettled fees**. Lido fees have the **lowest priority**, i.e., are settled only if the vault is healthy and has no redemptions assigned. Lido fees are settled permissionlessly via a dedicated function in VaultHub.

Any outstanding obligations on a vault:

- limit withdrawals from the vault by the amount required to cover obligations;
- reduce minting capacity by the amount required to cover obligations;
- pause beacon chain deposits while the vault is unhealthy, has redemptions to cover, or has unsettled fees greater than 1 ETH. This pause prevents the vault from continuously depositing ETH to the consensus layer and avoiding obligation settlement;
- reject attempts to disconnect from VaultHub.

_Obligations cheatsheet_

| Obligation  | Priority | Nominated in | Description                                          | Accrual                                                    | Settlement                                                                                                              |
| ----------- | -------- | ------------ | ---------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Health      | 1        | stETH shares | Liability to reduce to restore the vault's health    | Arise automatically when health drops                      | Rebalancing. Highly advised to burn stETH or fund the vault before approaching FRT to avoid punishing force-rebalancing |
| Redemptions | 2        | stETH shares | Liability to reduce to service Lido Core withdrawals | Assigned by DAO under extreme Lido Core liquidity shortage | Rebalancing or burning shares                                                                                           |
| Lido fees   | 3        | ETH          | Lido protocol service fees                           | Accrue continuously on each report                         | Manually permissionlessly, automatically on disconnect                                                                  |

#### Bad debt

The reserve ratio ensures that stETH minted by a vault is overcollateralized. When a vault drops below the force rebalance threshold, it should be rebalanced to restore the collateralization ratio. However, in severe mass-slashing events, vault total value can drop below 1:1 ratio, meaning the vault's total value cannot fully cover outstanding stETH liability. This is bad debt.

Bad debt is resolved through an escalation path:

1. **Vault replenishment**: Voluntary deposit of additional funds to cover the debt
2. **Bad debt socialization**: DAO-initiated shifting of uncovered liability to other vaults operated by the same node operator. The accepting vault must have sufficient capacity to absorb the extra liability without breaching its own health threshold. This keeps the operator responsible for all their vaults rather than isolating losses
3. **Self-coverage application**: DAO-initiated insurance or coverage application mechanisms
4. **Bad debt internalization**: As a last resort, Lido DAO is able to write off the vault's remaining bad debt and accept losses to the protocol by decreasing stETH token rebase.

### 3.3 LazyOracle

LazyOracle is a contract that handles accounting reports for Lido vaults. LazyOracle receives a daily snapshot from the AccountingOracle (which reports for the entire Lido protocol). This "lazy oracle" mechanism efficiently handles state updates across potentially thousands of individual vaults. Rather than updating each vault's state in a single transaction—which would be prohibitively expensive in terms of gas costs—the system uses a Merkle tree-based approach where only the root hash representing the global state is stored and updated daily by the AccountingOracle as part of the main accounting protocol report.

Individual vault updates happen on-demand by providing Merkle proofs verifying a specific vault's data against the stored root. When a vault's data needs updating, anyone can submit the proof along with the vault's latest data. The system verifies this data against the Merkle root and, if valid, updates the vault's state and forwards the relevant information to the StakingVault contract.

#### Report Freshness

Each vault operation that relies on the accuracy of the vault's total value is gated by a freshness check. An individual vault report is deemed **fresh** only when its timestamp matches the latest global report checkpoint published by LazyOracle **and** when less than **two days** have elapsed since that checkpoint. If this is not true, the vault is considered stale. With a stale report, the vault owner cannot:

- withdraw ETH from the vault,
- mint stETH against the vault,
- rebalance the vault,
- deposit to beacon chain, or
- disconnect from the VaultHub.

Staleness therefore seals the vault in a conservative state until a fresh report is submitted, ensuring that collateral calculations never proceed on outdated data.

#### Quarantine

A quarantine is a timelock LazyOracle places on any sudden jump in a vault's reported value that it cannot immediately confirm on-chain. If the reported total value exceeds normal routine EL/CL rewards, the excess is not reflected in the total value straight away. Instead, the excess is pushed into a quarantine buffer and ignored for a predefined period; only after that delay is the quarantined value released into VaultHub's total value. If another jump occurs during the quarantine period, the initial amount is released at the end of the current quarantine, and the cumulative amount of the new excesses enters a new quarantine period starting right after the first one ends.

This timelock mechanism gives the protocol the time to inspect a sudden growth and raise alarm if necessary.

Normal top-ups—where the owner funds ether to the vault contract first—never go through quarantine. Because this ether is visible on the vault’s balance, the increase is verifiable on-chain and therefore treated as safe. In practice, this means direct funding is reflected in total value immediately.

:::warning
Aside from some sanity checks, the quarantine operates in relative terms, so a sudden jump in total value might be quarantined in a small vault but the same amount of growth may not be subject to quarantine in a vault with a large total value.
:::

**LazyOracle source code:** https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/LazyOracle.sol

### 3.4 OperatorGrid

The OperatorGrid contract controls mint parameters of vaults connected to the Lido protocol. Its primary purpose is to organize vaults into groups of tiers with specific stETH minting limits while ensuring no single node operator can service a disproportionate amount of stETH.

A **group** represents a node operator. Each group has a total shareLimit that caps the total stETH shares that can be minted across all of the operator's vaults. A group contains one or more tiers. Groups track their liability shares (total shares minted by all vaults in the group).

:::important
The node operator address in OperatorGrid is the same address set as the node operator in the StakingVault contract. This address has critical permissions. Losing access to this address means losing the ability to manage vault configurations and coordinate with vault owners on parameter changes. So it is highly advised that node operators should use multisig accounts.
:::

A **tier** represents a set of minting parameters. Each tier belongs to a specific node operator group (except the default tier). Each tier has its share limit, reserve ratio, forced rebalance threshold, and Lido fee. Tiers track their liability shares (minted by vaults in that tier).

OperatorGrid source code: https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/OperatorGrid.sol

#### Default Tier

All vaults start in the default tier. The default tier has no specific node operator group. It has its stETH minting limits defined at initialization. Vaults in the default tier don't contribute to any operator group's liability. When a vault moves from the default tier to an operator tier, its shares are added to that operator's group liability.

A new vault is placed in the default tier even if the vault node operator has a registered group. The vault can change its tier, which must be confirmed by both the vault owner and the node operator. Upon disconnection, the vault drops back to the default tier.

#### Tier Parameters

Each tier defines critical parameters that control a vault's stETH minting capacity:

- **share limit**: the number of stETH shares that can be minted by all vaults in this tier,
- **reserve ratio**: how much ETH must be reserved for each stETH minted,
- **forced rebalance threshold**: a threshold for forced rebalancing,
- **Lido fee**: the fee percentage charged to the Lido treasury.

These parameters are propagated to VaultHub when a vault connects or changes tier.

Diagram. An example group with a 100k limit and three tiers
![An example group with 100k limit and 3 tiers](/img/stvaults/tech-design/operatorgrid-group-3-tiers.png)

#### Tier change flow

A tier change is performed via a multi-confirmed action (see Dashboard, Multi-confirmation): both the vault owner and the corresponding node operator must independently submit matching tier changes within a set timeframe of each other but regardless of order. Each confirmation is stored on-chain, expires automatically if not completed in time, and can be resubmitted without side effects. Once the second transaction arrives, the contract reallocates the vault’s liability from the old tier to the new one, updates the group and tier share counters, and—if the vault is already connected—pushes the new mint parameters straight to VaultHub.

#### Lido fees

The OperatorGrid configures three types of Lido fees (nominated in basis points): **infrastructure fee** (compensates for protocol operational costs), **liquidity fee** (charged for stETH liquidity), and **reservation fee** (covers the on-demand liquidity). Fees are set at the tier level when tiers are created and can be updated by DAO either globally for entire tiers or individually for specific vaults.

#### Individual vault parameters

A vault can have individual parameters different from its tier:

- Share limit: the vault owner and node operator can jointly adjust the vault's share limit independently of the tier's share limit (but not exceeding),
- Lido fees: the DAO can update individual vault fees (infrastructure, liquidity, reservation) to differ from tier rates.

These parameters can be restored by mutual confirmation from both the owner and the node operator via the sync tier method.

#### Jail

OperatorGrid can **jail** a vault as a protective measure. The main purpose of the jailing mechanism is to prevent further minting of a problematic vault.

- While jailed, a vault **cannot mint** new stETH shares.
- Jailing **does not** affect burning or other administrative operations;
- Jailing can be **set or cleared** by DAO.
- Unjailing restores normal minting subject to the usual tier and group limits.

**OperatorGrid source code:** https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/OperatorGrid.sol

### 3.5 VaultFactory

The VaultFactory contract offers a smooth, one-transaction approach to creating and configuring a StakingVault with Dashboard. Crucially, VaultHub accepts only those vaults deployed by the factory. A vault deployed by any other means is rejected. This ensures that the vault contract code is verified and its storage has not been maliciously tampered with.

The factory performs the following operations:

- deploys a StakingVault,
- deploys a Dashboard,
- initializes both contracts with the specified parameters,
- optionally configures initial permissions for Dashboard,
- and, in the owner-initiated flow, connects the vault to VaultHub after funding the connect deposit.

The factory supports two ways to create a StakingVault:

1. **Vault owner–initiated flow** creates the vault and dashboard, automatically funds the **1 ETH connect deposit** and connects to VaultHub. The function accepts an optional list of role assignments for the vault owner's subroles.
2. **Node operator–initiated flow** creates the vault and dashboard and optionally assigns operator-managed subroles, but **does not connect** to VaultHub. The vault owner later funds the connect deposit and connects to VaultHub.

**VaultFactory source code:** https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/VaultFactory.sol

### 3.6 PredepositGuarantee

To prevent the [deposit frontrunning exploit](https://medium.com/immunefi/rocketpool-lido-frontrunning-bug-fix-postmortem-e701f26d7971), the StakingVault enforces a predeposit-and-verify mechanism. Node operators cannot directly deposit locked assets backing stETH into the beacon chain. Instead, they must use the `PredepositGuarantee` (PDG) contract, which requires node operators to post a matching guarantee amount.

Through PDG, node operators make 1 ETH predeposits and lock an equivalent guarantee. At the same time, the PDG (as the vault's depositor) stages 31 ETH per validator on the vault, reserving the activation ETH. To verify the validator, a proof of correct withdrawal credentials using [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) beacon block roots must be provided. A positive proof (the validator WC matches the vault) unlocks the guarantee. Only after verification can the validator be fully activated using the staged funds. A negative proof seizes the node operator guarantee in favor of the vault as compensation.

:::note
For unlocked ETH not backing any stETH, vault owners can opt for a simplified "PDG shortcut" flow that bypasses the guarantee requirement. This easier method assumes trust between the vault owner and node operator (potentially backed by off-chain agreements). In this flow, PDG can directly prove and activate validators, but any malicious frontrunning would impact only the vault owner.
:::

_Diagram. Node operator deposit happy path_
![Node operator deposit happy path](/img/stvaults/tech-design/node-operator-deposit-happy-path.png)

The complete flow of the stVault’s validator deposit is as follows:

1. The node operator locks 1 ETH guarantee in the PDG contract.
2. The node operator submits a deposit of 1 ETH from the vault via PDG. At the same time, PDG stages 31 ETH for activation.
3. Once the validator appears on the beacon chain, the node operator proves valid withdrawal credentials via PDG. This unlocks the 1 ETH guarantee.
4. The staged 31 ETH plus optional additional amount is deposited to activate the validator.
5. If a validator’s withdrawal credentials are proven invalid, PDG compensates the vault with 1 ETH taken from the operator's guarantee and releases the staged 31 ETH back into the vault’s available balance.

_Diagram. Proven validator deposit flow_
![Deposit flow](/img/stvaults/tech-design/deposit-flow.png)

:::important
- Node operator guarantee can come from a dedicated guarantor account (which trusts the operator).
- The **1 ETH guarantee** always stays in PDG; **only vault ETH** is ever sent to the beacon deposit contract.
- On connection, VaultHub enforces all predeposits in the vault have sufficient staged balance on the vault.
- StakingVaults support [Pectra's EIP-7251](https://eips.ethereum.org/EIPS/eip-7251), so predeposit + activation flows work for both 32 ETH and multi-ETH (up to 2048) validators.
- Most steps in PDG can be batched, including a fast path that proves, activates, and tops up multiple validators in a single call.
- A node operator can attach their PDG balance during predeposit.
- As soon as a validator predeposit is sent, it appears in the beacon deposit queue. Proof of withdrawal credentials can only be generated once the validator is finalized in consensus state.
:::

##### Node Operator’s Depositor

For operational flexibility, a node operator can designate a dedicated _depositor_ address (not to be confused with StakingVault.depositor) authorized to perform deposits (including predeposits and activations) through PDG on behalf of that operator. The depositor role is replaceable at any time by the operator without affecting existing balances or guarantees. If unassigned, the depositor defaults to the operator address.

It is important to note that VaultHub enforces that every connected vault sets PDG as the **depositor** in the vault, while PDG itself verifies that the caller matches the operator-specified depositor. This separation allows secure validator signing operations while keeping administrative keys offline.

##### Onchain BLS12-381 signature verification

The predeposit operation must include a valid BLS12-381 signature to pass on-chain verification using the precompiles introduced in [EIP-2537](https://eips.ethereum.org/EIPS/eip-2537). This is why the transaction must also carry the necessary signature transformation data. Signature verification is essential—it ensures that the predeposit is a legitimate deposit and a validator with the specified pubkey will eventually appear on the consensus layer. This will make it possible to generate the presence proof for the validator and its withdrawal credentials.

:::note
Proven validator top-ups do not require a valid BLS signature, only predeposits.
:::

##### Proving unknown validators

The Lido protocol supports direct deposits to the deposit contract and validator consolidations targeting vault-associated validators. To handle such cases, PDG includes a special method for proving the withdrawal credentials of _side_ or _consolidated_ validators—those that either bypassed the standard predeposit flow or were later merged into a vault's validator set.

This method allows these validators to be cleared in PDG without going through the predeposit process. However, the balance of such validators is excluded from the vault's `totalValue` until it is acknowledged via the oracle report.

:::important
Only validators that have been activated on the beacon chain can be proven to PDG. Pending validators are rejected because they are not yet eligible for EIP-7002 withdrawal and cannot be force-exited until they activate.
:::

_Diagram. Proving unknown validator to PDG_
![image](/img/stvaults/tech-design/proving-unknown-validator.png)

**PredepositGuarantee source code**: https://github.com/lidofinance/core/blob/predeposit-guardian/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol

### 3.7 Dashboard

Dashboard is a utility extension for StakingVault and deals with:

- Granular role-based access control to the StakingVault operations,
- Management and disbursement of the node operator fee,
- PDG predeposit bypass,
- UX-friendly methods and various token helpers.

:::note
While technically optional, Dashboard is highly recommended for easier operational management of StakingVaults. Without Dashboard, Lido's web interface and CLI utilities **will not function**. Vault owners who choose to operate without Dashboard should possess strong technical knowledge of the underlying contracts and be prepared to manage their vault through raw transaction calls. For most users, Dashboard provides essential quality-of-life improvements that significantly reduce operational complexity when managing validators and stETH minting operations.
:::

#### Architecture

StakingVault is a minimal staking primitive that manages only immediate staking operations and tracks its totalValue and locked ETH. It implements a simple single-owner model. Dashboard is optional and operates on top of VaultHub, i.e., it is recorded as the owner of the vault in VaultHub while the actual vault owner becomes the admin of the `Dashboard` contract.

_Diagram. Dashboard access control model_

![Dashboard access control model](/img/stvaults/tech-design/dashboard-access-control-model.png)

#### Roles

With Dashboard, every operation in the StakingVault requires the respective role. For example, funding the StakingVault requires that the sender has the `FUND_ROLE`. All of these roles have their [role admin](https://docs.openzeppelin.com/contracts/5.x/api/access#AccessControl-_setRoleAdmin-bytes32-bytes32-).

_Diagram. Role-restricted operations_

![Role-restricted operations](/img/stvaults/tech-design/role-restricted-operations.png)

:::important
- The `Dashboard` contract includes functions for batch-granting and batch-revoking roles;
- Some operations (like rebalance) can be pre-funded if ether is attached to the transaction and the sender has `FUND_ROLE`.
:::

#### Multi-role confirmation

The multi-role confirmation mechanism restricts some administrative actions, thus preventing unilateral decisions. This means that a member of each of the required roles must send the transaction with the same parameters within a configurable duration (lifetime).

_Diagram. Example of a multi-role confirmation process_

![image](/img/stvaults/tech-design/multi-role-confirmation.png)

#### Node operator fee

The StakingVault intentionally does not include any accounting for extraneous fees (e.g., node operator, reward share) to allow for flexibility in different setups. Instead, this logic was implemented in `Dashboard` with room for configuration. Dashboard includes the node-operator manager role, which is granted to an address representing the node operator's interests and can differ from the node operator address set in the vault.

The fee accounting uses a high-water mark approach and is calculated as follows:

- Define **growth** as the component of the vault’s total value that is _not_ from explicit funding:
  $$
  growth = totalValue - inOutDelta
  $$
- Maintain **settled growth** as the high-water mark for the portion of growth that has either:
  - already been charged to the operator (paid out), or
  - is explicitly exempt (e.g., unguaranteed/side deposits, consolidations).

So the fee base is:
$$
unsettled = \max(growth - settledGrowth, 0)
$$

The fee is:
$$
fee = unsettled * feeRate
$$

If unsettled is zero or negative, the settled growth remains the same and no fee accrues.

##### Fee disbursement

The fee is disbursed permissionlessly (with an exception for abnormally high fees). The disbursement process:

1. Reads the latest vault report,
2. Computes `unsettled` growth and the fee,
3. Updates **settled growth** to the current growth (so the same amount won’t be charged again),
4. Pays the fee to the configured recipient from the vault’s available balance.

On a voluntary disconnect, the fee is disbursed automatically first, then disconnect proceeds.

##### Abnormally high fee

To protect against misconfigured/outdated settled growth that would result in excessive payouts, Dashboard enforces an **abnormally high fee threshold**.

- If the fee exceeds **1% of the vault’s total value**, normal permissionless disbursement is blocked.
- In that case, only the vault owner (`DEFAULT_ADMIN_ROLE`) may execute a separate admin function for disbursement.
- This requires the admin to explicitly verify that settled growth is correct before allowing the payment.

The 1% threshold is highly conservative: with an APR of ~5% and even a 10% operator fee, the vault would take ~2 years to hit the threshold if fees were never disbursed.

##### Fee change

Changing the fee rate requires dual confirmation (admin + node-operator manager) and several safety checks:

- The latest report must be fresh (so accounting is up to date),
- Any recent exemptions/corrections to settled growth must have been recorded _before_ that report (prevents retroactive charging),
- The vault must not be under quarantine (ensures that reported total value is not reduced and fully reflects any exemptions).

#### PDG policy

Dashboard enforces a **PDG policy** configured by the admin:

- **STRICT**
  All validator funding must go through the full predeposit-and-prove flow.
- **ALLOW_PROVE**
  Node operator can prove validators that did not come through the standard flow (e.g., side deposits), so they become eligible for future top-ups via PDG.
- **ALLOW_DEPOSIT_AND_PROVE**
  Node operator can (a) perform **unguaranteed deposits**—withdrawing ETH from the vault and depositing to the beacon contract directly, bypassing the guarantee/signature checks—and (b) later **prove** those validators to PDG. This shortcut assumes trust between the vault owner and operator.

##### Unguaranteed deposits

The Dashboard contract provides a shortcut flow for node operators, allowing them to perform deposits that bypass the standard PDG predeposit process—specifically, skipping the 1 ETH guarantee requirement and BLS signature verification. This path is intended for situations where the vault owner trusts the node operator not to frontrun deposits, or where a formal legal agreement governs the arrangement.

These _unguaranteed deposits_ are executed by withdrawing ETH from the vault (excluding the locked portion) and making the deposits to the Ethereum deposit contract directly, without routing the transaction through PDG. As a result, the vault's `totalValue` is reduced by the deposit amount, and the protocol assumes no risk associated with the deposit.

This shortcut flow automatically adjusts the vault's node operator fee accounting by updating the settled growth. The associated validator is excluded from reward calculations, so the node operator only receives rewards actually earned—not a share of the full validator balance. Once the validator becomes active, its withdrawal credentials can be proven using PDG's "unknown validator" proving method. After being proven, the validator can receive top-up deposits through the standard PDG flow.

_Diagram. PDG shortcut_
![image](/img/stvaults/tech-design/pdg-shortcut-flow.png)

Other scenarios—such as validator consolidation or direct deposits made to the deposit contract without passing through the vault—can also result in vault-affiliated validators receiving new stake. To ensure accurate reward attribution in these cases, the node operator can manually add a fee exemption in the Dashboard contract that increases the settled growth.

**Dashboard source code:** https://github.com/lidofinance/core/blob/master/contracts/0.8.25/vaults/dashboard/Dashboard.sol

## 4. Flows

#### Staking and Unstaking

![Staking and unstaking flow](/img/stvaults/tech-design/staking-unstaking-flow.png)

1. **Funding**

   - The _vault owner_ calls `fund()` on VaultHub to send ETH to the stVault.
   - Increases the vault's `totalValue`.

2. **Depositing Validators**

   - The _node operator_ sends deposits via _predeposit guarantee_ to create or top up a validator.
   - Can be done in batches.
   - Uses `0x02` withdrawal credentials pointing to the vault's address.
   - Does not change `totalValue`.
   - Reverts if `locked > totalValue`.

3. **Receiving EL and CL validation rewards**

   - Validator fee recipient can be set to the vault address.
   - Although the increase in the vault's balance is not reflected in `totalValue` until updated with a report.

4. **Exiting Validators**

   - The _vault owner_ can call `requestValidatorExits()` to ask for a voluntary exit.
   - The _node operator_, _vault owner_, or `VaultHub` (under extreme conditions) can call `triggerValidatorWithdrawal()` to perform [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) "triggerable withdrawal".
   - Once exited, the validator's balance is transferred to the vault.
   - Partial withdrawals may be requested only when the vault is healthy.

5. **Withdrawing**
   - The _vault owner_ calls `withdraw()` on VaultHub to take out any amount of **unlocked** ETH (i.e., `totalValue - locked`) from the vault's balance.
   - Exiting validators or partial withdrawals are necessary to withdraw staked ETH.

#### Accessing stETH

1. **Minting**

![Minting flow](/img/stvaults/tech-design/minting-flow.png)

- The _vault owner_ calls `mint()` on the `VaultHub` to mint stETH up to the amount coverable by the locked ether (including RR).
- Increases the vault's `liabilityShares`.
- The minting capacity is limited by current `totalValue`, `liabilityShares`, `shareLimit`, and `reserveRatio`.

:::note
Minting against a stVault is subject to the protocol-wide minting [rate limits](https://docs.lido.fi/guides/lido-tokens-integration-guide#staking-rate-limits).
:::

2. **Burning**

![Burning flow](/img/stvaults/tech-design/burning-flow.png)

- The _vault owner_ calls `burn()` on the `VaultHub` to burn stETH on behalf of the vault.
- Decreases the vault's `liabilityShares`.
- The `locked` amount gets reduced with the next proven update.

3. **Rebalancing**
   ![Rebalancing flow](/img/stvaults/tech-design/rebalancing-flow.png)

- The _vault owner_ calls `rebalance()` on the `VaultHub` to rebalance ETH out of the vault.
- Reduces both `liabilityShares` and `totalValue` simultaneously by taking ETH from the vault, submitting it 1:1 for stETH via Lido Core, and then burning it on behalf of the vault.
- Improves vault health at the cost of reducing its totalValue.
- Requires validators to be exited or partially withdrawn if staked ETH is intended to be used.
- Can be performed by the _vault owner_ or executed permissionlessly if the vault's `forcedRebalanceThreshold` is breached.

#### Connecting and Disconnecting

Each staking vault can operate independently as a basic delegated staking setup. However, to enable stETH minting, it must be connected to the Lido VaultHub, a central contract that manages vault registry and controls minting.

**Connection Process:**

1. **Fund the vault**: The vault must have at least 1 ETH (connect deposit) on its balance.
2. **Set the depositor:** The depositor in the vault must reference the Predeposit Guarantee contract.
3. **Transfer ownership to VaultHub:** The vault transfers ownership to VaultHub, thus signaling consent to join. This prevents VaultHub from forcefully connecting vaults.
4. **Connect**: call the connect function on VaultHub, which creates the vault record with default minting parameters retrieved from OperatorGrid.

**Disconnection Process:**

1. **Burn Outstanding stETH:** The vault owner must fully burn any stETH still backed by the vault.
2. **Settle any outstanding obligations**. The vault owner must fully repay any existing redemptions and repay Lido fees.
3. **Request Disconnection:** The owner calls the disconnect function on VaultHub, flagging the vault for removal.
4. **Report Confirmation:** The disconnection is finalized during the next VaultHub report; the vault is removed from the records and ownership is transferred back. The vault is removed from its tier in OperatorGrid. If it chooses to connect again, it is placed in the default tier. If any of the vault validators are reported as slashed, the disconnection is aborted.

#### Vault Ossification

Staking vaults are deployed using a custom BeaconProxy pattern. Disconnecting a vault from the VaultHub does **not** prevent it from receiving future upgrades via the beacon controlled by the Lido DAO.

To permanently freeze the vault's logic and reject any future upgrades, the vault owner can _ossify_ it—by pinning the current implementation address in the proxy. This ossification can only be performed **after** the vault has been fully disconnected from VaultHub.

#### Forced rebalancing

A cornerstone principle of stVaults design is:

> **stETH solvency** - all existing stETH can be converted into ETH at a **1:1** ratio

Thus, each vault must remain solvent, preventing any vault-specific losses from spilling over to stETH holders. The mechanism to enforce this is called _forced rebalancing_:

- Triggered when the vault's _reserve_ for minted stETH falls below its force-rebalance threshold (e.g., due to slashing or prolonged penalties).

- Comprises two parts:

  1. **Forced Validator Withdrawals** (permissionless, via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)).
  2. **Forced Rebalance** (permissionless rebalancing using available vault unstaked ETH).

- Once triggered, no further deposits or withdrawals are allowed until the vault's health is restored.

- Force-rebalancing restores the collateralization ratio up to Reserve Ratio.

- The maximum rebalancing amount `X` satisfies:
  $$
     \frac{(mintedShares - X)}{(totalValue - X)} = 1 - RR
  $$

## 5. Risks

Stakers and ecosystem participants are advised to carefully consider these risks and conduct their own research before participating in stVaults.

### 5.1 Ecosystem risks

1. Stake concentration: Mitigated through stVault permissionless creation, risk parameters, and limits, balancing for diverse node operator participation.
2. Token insolvency: Addressed via risk parameters to maintain a reasonable reserve margin for minted stETH alongside local and global limits for the maximum mintable stETH through the stVaults.

### 5.2 Risks for stVaults stakers

1. Deposit Frontrunning: Mitigated through the PredepositGuarantee module.
2. Forced rebalancing: Managed with deterministic rules, policies, and continuous monitoring.
3. Slashing Risk: While mitigated through careful node operator selection and monitoring, the possibility of intentional misbehavior or technical issues remains.
4. Liquidity Risk: Potential challenges in converting large amounts of stETH to ETH quickly for Lido Core, especially during market stress, would require stETH redemptions through stVaults.
5. Interoperability risks: Integration with other DeFi protocols may introduce additional complexities and potential vulnerabilities.

### 5.3 Inherited Risks

1. Ethereum Risks: Issues with the Ethereum network, such as consensus failures or major protocol changes, could impact stVault operations.
2. Lido Infrastructure Risks:
   - stETH Market Price: Stakers risk an exchange price of stETH lower than the inherent value due to prolonged withdrawal times that delay validator exits and make arbitrage and risk-free market-making impossible.
   - Smart Contract Security: There is an inherent risk that Lido could contain a smart contract vulnerability or bug; to minimize this risk, the Lido protocol codebase remains open-source, reviewed, audited, rolled out on testnets, and covered by extensive tests and a bug bounty program.
   - Oracle failures and data manipulation: The oracle may affect the protocol's accounting state by providing malformed data; the risk is mitigated with consensus mechanisms for the oracle committee and smart contract safety nets.
   - Correlated in-protocol mass-slashing: In case of mass-slashing events in Lido Core, the bunker mode activates to socialize conversion rate losses among stETH holders.
   - Governance risks: The protocol is maintained and upgraded by the LDO tokenholders. The mitigation of governance risks includes a two-phase voting system, a public delegate voting platform, and an anticipated 2025 H1 Dual Governance activation.

## 6. Useful Links

- [Hasu's 2nd GOOSE voted-in proposal](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xeedef9fea3d782f192410768cabaf6974da40ef36e1d22c7f8fff5fd4cfc7a59)
- [EIP-7002 "Triggerable Withdrawals"](https://eips.ethereum.org/EIPS/eip-7002)
- [EIP-7251 "Increase the MAX_EFFECTIVE_BALANCE"](https://eips.ethereum.org/EIPS/eip-7251)
- [EIP-6110: Supply validator deposits on chain](https://eips.ethereum.org/EIPS/eip-6110)
- [LIP-5 "Mitigations for deposit frontrunning vulnerability"](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md)
- [LIP-31 "Expanding stETH liquidity layer with over-collateralized minting"](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-31.md)
- [LIP-32 "Sanity Checks for stVaults"](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-32.md)
