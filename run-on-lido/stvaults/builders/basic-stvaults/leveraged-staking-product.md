---
sidebar_position: 3
title: 'Leveraged Staking Product with 3rd-Party Infrastructure'
---

# Leveraged Staking Product with 3rd-Party Infrastructure

## Product value proposition
Staking rewards through a chosen Node Operator, full utilization of the available stETH Minting Capacity, and recursive leverage through external lending markets to increase validation rewards.

## Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Multiple |
| stETH minting capability | Yes, as collateral for borrowing ETH in recursive loops |

## Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | Custom | Custom |
| Leveraged staking strategy | Custom | Custom |
| User Interface | Custom | Custom |

## Economy model and calculator
The vault strategy - ETH is deposited to validators and generates staking rewards; stETH is minted on demand by the Vault Owner.

<details>
  <summary>Economy calculation example</summary>

<img src="/img/stvaults/economy-examples/leverage-scheme.svg" style={{width: '100%', marginBottom: '2rem'}} />

  As an example, we consider a personalized staking setup involving a single Node Operator,
  full utilization of the available stETH minting capacity, and recursive leverage through external lending markets.

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>In our example</h4>

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">Leverage multiplier:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">~9×;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">tVault — Total Value:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">894.85 ETH;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">stVault — Total stETH Minting Capacity:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">850.11 stETH;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">stVault — stETH Liability:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">850.11 stETH;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">Lending Market — stETH Used as Collateral:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">850.11 stETH;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label">Lending Market — ETH Borrowed:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">794.85 ETH;</span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0 1rem'}}>
    <span className="label">Vault Owner's Principal ETH:</span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value">only the initial 100 ETH.</span>
  </div>

  ### Annualized Economics Breakdown

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>Staking Rewards</h4>

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Gross Staking Rewards</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>30.4251 ETH</strong></span>
  </div>

  Validators generate staking rewards on top of the 100 ETH deposited to the Beacon Chain.
  e.g., 3.4% Staking APR.

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Node Operator Fee</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>- 1.217 ETH</strong></span>
  </div>
  Set per stVault through consensus between the Vault Owner and the Node Operator.
  e.g., 4% out of Gross Staking Rewards earned.

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Lido Fee</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>- 1.6322 ETH</strong></span>
  </div>
  In this example, the annual Lido Fee approximately equals 6% of the Lido Core Gross APR and can be calculated by
  the equation:
  Lido Fee = 6% * 3.2% Lido Core Gross APR * 850.11 stETH = 1.6322 ETH;
  e.g., Lido Core Gross APR ~ 3.2%.

  <h4 style={{fontSize: '1.1rem', lineHeight: 1.45, margin: '0.75rem 0 0.25rem', fontWeight: 700}}>stETH Liability
    Growth</h4>

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Minted stETH Rebase</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>24.4832 stETH</strong></span>
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
    <span className="value"><strong>+ 3.0926 ETH</strong></span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>stVault Efficiency</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>3.0926%</strong></span>
  </div>
  A positive stVault Efficiency indicates that the Node Operator’s performance is sufficient to cover the growth of the
  stETH Liability.

  ### stETH Usage Outside the stVault

  The Vault Owner used the minted stETH to loop through a lending market in order to amplify staking rewards.
  Additional income and expenses from the lending market:
  - **+ 24.4832 stETH** — rebase rewards from stETH used as collateral on the lending market
  - **+ 2.5503 stETH** — supply-side rewards from the lending market
  - **- 21.1431 ETH** — interest paid on borrowed ETH

  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0'}}>
    <span className="label"><strong>Total rewards</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>8.983 ETH</strong></span>
  </div>
  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.25rem 0 1rem'}}>
    <span className="label"><strong>Total APR</strong></span>
    <span style={{flex: '1 1 auto', borderBottom: '1px dotted currentColor', opacity: 0.5, margin: '0 0.5rem'}}/>
    <span className="value"><strong>8.983%</strong></span>
  </div>

  Total APR is normalized to the Vault Owner’s initial 100 ETH.

  (!) Note: All lending market parameters are illustrative. Actual values depend on the specific product and prevailing
  market conditions. (!)

</details>

## Architecture

![Leveraged Staking Product with 3rd-Party Infrastructure](/img/stvaults/builders/architecture_lsp.jpg)

## Leveraged Staking Strategy

There are several ways to build a leveraged staking strategy with stVaults: implement the solution in-house or use existing infrastructure developed by stVaults builders, such as Gauntlet or RockSolid.

This guide explains how to create the stVault itself. Once the stVault is deployed, you can [configure roles and permissions](../../concepts-and-reference/roles-and-permissions.md) by assigning them to the corresponding smart contracts of the selected solution. Please confirm the required contract addresses with the respective builder.

## Parameters needed to create an stVault

Creating an stVault is permissionless.

1. **Node Operator address** — a unique, immutable identifier of the Node Operator within stVaults, used in protocol logic such as calculating per-operator stETH minting terms and limits. It designates the Node Operator that provides validation services for the stVault and also manages ETH deposits from the stVault balance to validators, as well as handling validator exits when required.
2. **Node Operator Manager address**. One of the two administrative roles in an stVault. From the Node Operator perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
3. **Vault Owner address**. One of the two administrative roles in an stVault. From the Vault Owner (Staker) perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
4. **Node Operator Fee**. The share of gross staking rewards that the Node Operator charges for providing validation services. Expressed in basis points [0 (0%) .. 10,000 (100%)].
5. **Confirmation Lifetime**. The key parameter of the multi-role confirmation mechanism. It defines the maximum time interval between proposal and confirmation. This mechanism is used to update certain stVault parameters by requiring consensus between the two stVault representatives: the Vault Owner and the Node Operator Manager. Measured in seconds [86,400 sec (24 hours) .. 25,920,000 sec (30 days)]. For security reasons, it is strongly recommended to keep it as short as possible, ideally the minimum 86,400 sec.

## Creating new stVault

➡️ URLs and Smart Contract addresses are listed on [Environments](../../concepts-and-reference/architecture-overview#environments)

The Vault Owner creates an stVault that is automatically connected to Lido Core, enabling stETH minting. This requires supplying 1 ETH, which is locked as the Connection Deposit for the VaultHub connection. The entire process is completed in a single transaction. While stVault creation is permissionless, this approach is typically performed by the intended Vault Owner of the new stVault.

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

- [Roles and Permissions](../../concepts-and-reference/roles-and-permissions.md)
- [Control validators by the Vault Owner](../../vault-owners-curators-and-stakers/basic-stvaults/control-validators.md)
- [Rebalance](../../vault-owners-curators-and-stakers/basic-stvaults/rebalance.md)
- [Health Monitoring Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-monitoring-guide.md)
- [Health Emergency Guide](../../vault-owners-curators-and-stakers/basic-stvaults/health-emergency-guide.md)
- [Applying Oracle Reports](../../vault-owners-curators-and-stakers/basic-stvaults/apply-oracle-reports.md)
