---
sidebar_position: 1
title: 'Basic Isolated Staking Setup'
---

# Basic Isolated Staking Setup

## Product value proposition
Competitive offering to native staking — users stake with the same Node Operator and get optional liquidity through stETH.

## Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | 1 (Isolated staking setup) |
| stETH minting capability | Yes, on demand |

## Building blocks
| Building block | Solution | Implementation |
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| User Interface | stVault Web UI | Out-of-the-box |


## Economy model and calculator
The vault strategy - ETH is deposited to validators and generates staking rewards; stETH is minted on demand by the Vault Owner.

<details>
  <summary>Economy calculation example</summary>

<img src="/img/stvaults/economy-examples/insti-scheme.svg" style={{width: '100%', marginBottom: '2rem'}} />

  As an example, we consider a personalized staking setup with a single Node Operator, and full utilization of available
  stETH Minting Capacity.

  ### Annualized Economics Breakdown

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>Staking Rewards</h4>

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Gross Staking Rewards</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>3.2 ETH</strong></span>
  </div>

  Validators generate staking rewards on top of the 100 ETH deposited to the Beacon Chain.
  e.g., 3.2% Staking APR.

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Node Operator Fee</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>- 0.096 ETH</strong></span>
  </div>
  Set per stVault through consensus between the Vault Owner and the Node Operator.
  e.g., 3% out of Gross Staking Rewards earned.

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Lido Fee</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>- 0.1728 ETH</strong></span>
  </div>
  In this example, the annual Lido Fee approximately equals 6% of the Lido Core Gross APR and can be calculated by
  the equation:
  Lido Fee = 6% * 3.2% Lido Core Gross APR * 90 stETH = 0.1728 ETH;
  e.g., Lido Core Gross APR ~ 3.2%.

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>stETH Liability
    Growth</h4>

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Minted stETH Rebase</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>2.592 stETH</strong></span>
  </div>
  The stVault’s liquidity is provided in stETH, a rebasing token — its balance updates daily to reflect accrued staking
  rewards.
  To ensure the Vault Owner’s repayment amount is always accurately represented, the minted stETH liability adjusts daily in
  line with stETH’s rebasing mechanics.
  This is primarily a technical adjustment, as the liability increase is offset by the rewards the Vault Owner earns as a
  holder of stETH.
  e.g., stETH APR ~ 2.88%.

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>stVault Bottom
    Line</h4>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>stVault Bottom Line</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>+ 0.3392 ETH</strong></span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>stVault Efficiency</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>0.3392%</strong></span>
  </div>
  A positive stVault Efficiency indicates that the Node Operator’s performance is sufficient to cover the growth of the
  stETH Liability.


  ### stETH Usage Outside the stVault

  The Vault Owner generates primary profit via higher validation performance than Lido Core APR plus rewards received as
  a stETH holder.
  - **+ 0.3392%** — stVault Efficiency upside
  - **+ 2.592%** — minted stETH APR (normalized to stVault Total Value 100 ETH)

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Total APR</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>2.9312%</strong></span>
  </div>

  <br/>


</details>

## Architecture

![Basic Isolated Staking Setup by stVault](/img/stvaults/builders/architecture_basic.jpg)

## Creating new stVault

➡️ URLs and Smart Contract addresses are listed on [Environments](../../concepts-and-reference/architecture-overview#environments)

Creating an stVault is permissionless. There are two main ways to do it:

1. Two-step process (recommended): initiated by the Node Operator and completed by the Vault Owner.
2. One-step process: create stVault and supply 1 ETH of the Connection Deposit in a single transaction.

### Parameters needed to create an stVault:

1. **Node Operator address** — a unique, immutable identifier of the Node Operator within stVaults, used in protocol logic such as calculating per-operator stETH minting terms and limits. It designates the Node Operator that provides validation services for the stVault and also manages ETH deposits from the stVault balance to validators, as well as handling validator exits when required.
2. **Node Operator Manager address**. One of the two administrative roles in an stVault. From the Node Operator perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
3. **Vault Owner address**. One of the two administrative roles in an stVault. From the Vault Owner (Staker) perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
4. **Node Operator Fee**. The share of gross staking rewards that the Node Operator charges for providing validation services. Expressed in basis points [0 (0%) .. 10,000 (100%)].
5. **Confirmation Lifetime**. The key parameter of the multi-role confirmation mechanism. It defines the maximum time interval between proposal and confirmation. This mechanism is used to update certain stVault parameters by requiring consensus between the two stVault representatives: the Vault Owner and the Node Operator Manager. Measured in seconds [86,400 sec (24 hours) .. 2,592,000 sec (30 days)]. For security reasons, it is strongly recommended to keep it as short as possible, ideally the minimum 86,400 sec.

### 1. Two-step process (recommended)

This approach enables a Node Operator to create an stVault without providing their own ETH. It is recommended because it prevents ETH commingling and streamlines the experience for Stakers and Vault Owners.

#### 1.1. **Node Operator** creates an stVault that is not yet connected to Lido Core.

Creating an stVault is a permissionless operation, but in this two-step process it is usually performed by the Node Operator.

<details>
  <summary>by Command-line Interface</summary>
      ```bash
      yarn start vo w create-vault create-without-connecting --defaultAdmin <VaultOwnerAddress> --nodeOperator <NodeOperatorAddress> --nodeOperatorManager <NodeOperatorManagerAddress> --confirmExpiry <TimeInSeconds> --nodeOperatorFeeRateBP <NodeOperatorFeeInBasisPoints> 1
      ```
      Note down the addresses of the created **Vault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **VaultFactory** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview.md#environments) page.
2. Call `createVaultWithDashboardWithoutConnectingToVaultHub`. You can leave `_roleAssignments = []`.
3. Sign the transaction in your wallet.
4. Click **View your transaction** and wait for it to be executed.
5. Open the **Logs** tab, scroll to the **DashboardCreated** event, and note down the addresses of the created **StakingVault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>

#### 1.2. When an stVault is created, the Node Operator may optionally propose a tier with more favorable stETH minting terms than the Default tier.

To perform this step, the Node Operator of the newly created vault must already have individual tiers assigned. Otherwise, the stVault will remain limited to the Default tier option `(tierID = 0)`.

**Parameters needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit. [Learn more about shares and stETH / wstETH tokens](/guides/lido-tokens-integration-guide#steth-internals-share-mechanics).

<details>
  <summary>by Command-line Interface</summary>
   ```bash
   yarn start contracts operator-grid w ct <VaultAddress> <TierID> <RequestedShareLimit>
   ```
</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **OperatorGrid** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview.md#environments) page.
2. Call `changeTier`.
</details>

#### 1.3. After that, the **Vault Owner**, in one transaction, accepts the stETH minting parameters and fees (by accepting the tier), supplies 1 ETH as the Connection Deposit for the VaultHub connection, and initiates the connection to VaultHub.

The 1 ETH Connection Deposit becomes part of the stVault Total Value, can be used as collateral for minting stETH, and can be deposited to validators to earn validation rewards. It can be withdrawn after [disconnecting the stVault from VaultHub](../../vault-owners-curators-and-stakers/basic-stvaults/disconnection.md).

This is a permissioned operation. By default, this permission belongs to the Vault Owner, who can delegate it to other addresses (multiple supported, including the Vault Owner’s own address). [Read more about roles](../../concepts-and-reference/roles-and-permissions.md).

**Parameters and addresses needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit. [Learn more about shares and stETH / wstETH tokens](/guides/lido-tokens-integration-guide#steth-internals-share-mechanics).
- `payableAmount`: the amount of ETH to supply in the same transaction; minimum is **1 ETH**.
- `currentSettledGrowth`: the amount of unaccounted growth accrued on the vault while it was disconnected; 0 for newly created vaults via the create-without-connecting method. Settled growth is the part of the total growth that has already been charged by the node operator or is not subject to fee (exempted), such as unguaranteed or side deposits, and consolidations accrued while the vault was disconnected.

<details>
  <summary>using stVaults Web UI</summary>
      1. Open the stVaults Web UI (see [Environments](../../concepts-and-reference/architecture-overview#environments))

      2. Connect wallet on the "My Vaults" page.

      3. Open an stVault overview page at `https://<domain>/vaults/<StakingVaultAddress>`

      ![Connect and accept tier](/img/stvaults/guide-basic-stvault/guide_1_scr_8.png)

      4. Review parameters and click "Approve and supply 1 ETH".

      5. Sign transaction in the wallet.

</details>
<details>
  <summary>by Command-line Interface</summary>
      ```bash
      yarn start contracts dashboard w connect-and-accept-tier -f <DashboardAddress> <TierID> <RequestedShareLimit>
      ```
</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **Dashboard** contract — find its address on the [Per-setup addresses](../../concepts-and-reference/architecture-overview.md#per-setup-addresses) page.
2. Call `connectAndAcceptTier`:
    - fill out the `payableAmount` field with '1' to supply `1 ETH` in the same transaction.
    - set the `_currentSettledGrowth` field to '0' for a newly created vault like in this scenario (if the stVault is newly created but had side deposits before connecting, settled growth must be set accordingly before the connection).

</details>

### 2. One-step process

In this approach, the Vault Owner creates an stVault that is automatically connected to Lido Core, enabling stETH minting. This requires supplying 1 ETH, which is locked as the Connection Deposit for the VaultHub connection. The entire process is completed in a single transaction. While stVault creation is permissionless, this approach is typically performed by the intended Vault Owner of the new stVault.

The 1 ETH Connection Deposit becomes part of the stVault Total Value, can be used as collateral for minting stETH, and can be deposited to validators to earn validation rewards. It can be withdrawn after [disconnecting the stVault from VaultHub](../../vault-owners-curators-and-stakers/basic-stvaults/disconnection.md).

<details>
  <summary>using stVaults Web UI</summary>
      1. Open the stVaults Web UI (see [Environments](../../concepts-and-reference/architecture-overview#environments))
      2. Connect wallet on the "My Vaults" page.
      3. Click "Create vault".

      ![Create vault](/img/stvaults/guide-basic-stvault/guide_1_scr_9.png)

      4. Fill out the form and click "Continue".
      5. Sign transaction in the wallet.

</details>
<details>
  <summary>by Command-line Interface</summary>
      ```bash
      yarn start vo w create-vault create --defaultAdmin <VaultOwnerAddress> --nodeOperator <NodeOperatorAddress> --nodeOperatorManager <NodeOperatorManagerAddress> --confirmExpiry <TimeInSeconds> --nodeOperatorFeeRateBP <NodeOperatorFeeInBasisPoints> 1
      ```
</details>
<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **VaultFactory** contract — find its address on the [Environments](../../concepts-and-reference/architecture-overview.md#environments) page.
2. Call `createVaultWithDashboard`:
   - `_payableAmount (ether)` must be at least **1 ETH**.
   - You can leave `_roleAssignments = []`.
3. Sign the transaction in your wallet.
4. Click **View your transaction** and wait for it to be executed.
5. Open the **Logs** tab, scroll to the **DashboardCreated** event, and note down the addresses of the created **Vault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>


## Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed [identification](../../node-operators/basic-stvaults/node-operator-identification-guide.md) and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

For more information about how this process, please follow [Adjust stETH minting parameters](../../node-operators/basic-stvaults/stvault-tier-and-steth-minting-limit.md).


## Useful links

- [Supply/Withdraw ETH, Mint/Repay stETH](../../vault-owners-curators-and-stakers/basic-stvaults/supply-withdraw-mint-repay.md)
- [Control validators by the Vault Owner](../../vault-owners-curators-and-stakers/basic-stvaults/control-validators.md)
- [Rebalance](../../vault-owners-curators-and-stakers/basic-stvaults/rebalance.md)
- [Health Monitoring Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-monitoring-guide.md)
- [Health Emergency Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-emergency-guide.md)
- [Applying Oracle Reports](../../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md)
