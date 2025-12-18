---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Basic stVault with optional liquidity

## Intro

This guide is aimed at helping Node Operators, Builders, Protocols, and Liquidity Providers create and operate an stVault with optional liquidity.

### Product value proposition

Competitive offering to native staking — users stake with the same Node Operator and get optional liquidity through stETH.

### The vault strategy

ETH is deposited to validators and generates staking rewards; stETH is minted on demand by the Vault Owner.

## Environments

### Testnet

- UI: https://stvaults-hoodi.testnet.fi/
- CLI: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration
- Contracts: https://docs.lido.fi/deployed-contracts/hoodi/
- Etherscan: https://hoodi.etherscan.io/

### Mainnet

- UI: https://stvaults.lido.fi/ (will be available on [Phase 2 of the Rollout plan](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665/8))
- CLI: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration
- Contracts: https://docs.lido.fi/deployed-contracts/
- Etherscan: https://etherscan.io/

## Steps

### Create an stVault

Creating an stVault is permissionless. There are two main ways to do it:

1. Two-step process (recommended): initiated by the Node Operator and completed by the Vault Owner.
2. One-step process (for experienced Vault Owners / Stakers): create the stVault and supply 1 ETH in a single transaction.

#### Parameters needed to create an stVault:

1. **Node Operator address** — a unique, immutable identifier of the Node Operator within stVaults, used in protocol logic such as calculating per-operator stETH minting terms and limits. It designates the Node Operator that provides validation services for the stVault and also manages ETH deposits from the stVault balance to validators, as well as handling validator exits when required.
2. **Node Operator Manager address**. One of the two administrative roles in an stVault. From the Node Operator perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
3. **Vault Owner address**. One of the two administrative roles in an stVault. From the Vault Owner (Staker) perspective, this role manages permissions and can update key vault parameters. Multiple addresses are supported.
4. **Node Operator Fee**. The share of gross staking rewards that the Node Operator charges for providing validation services. Expressed in basis points [0 (0%) .. 10,000 (100%)].
5. **Confirmation Lifetime**. The key parameter of the multi-role confirmation mechanism. It defines the maximum time interval between proposal and confirmation. This mechanism is used to update certain stVault parameters by requiring consensus between the two stVault representatives: the Vault Owner and the Node Operator Manager. Measured in seconds [86,400 sec (24 hours) .. 25,920,000 sec (30 days)]. For security reasons, it is strongly recommended to keep it as short as possible, ideally the minimum 86,400 sec.

#### 1. Two-step process (recommended)

This approach enables a Node Operator to create an stVault without providing their own ETH. It is recommended because it prevents ETH commingling and streamlines the experience for Stakers and Vault Owners.

##### 1.1. **Node Operator** creates an stVault that is not yet connected to Lido Core.

Creating an stVault is a permissionless operation, but in this two-step process it is usually performed by the Node Operator.

<details>
  <summary>by Command-line Interface</summary>
      ```bash
      yarn start vo w create-vault create-without-connecting --defaultAdmin <VaultOwnerAddress> --nodeOperator <NodeOperatorAddress> --nodeOperatorManager <NodeOperatorManagerAddress> --confirmExpiry <TimeInSeconds> --nodeOperatorFeeRate <NodeOperatorFeeInBasisPoints> 1
      ```
      Note down the addresses of the created **Vault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>
<details>
  <summary>using Etherscan UI</summary>
       1. Open **Etherscan** and navigate to the **VaultFactory** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Go to the **Contract** tab → **Write Contract**.
      3. Click **Connect to Web3** and connect your wallet in the dialog window.
      4. Find the method `createVaultWithDashboardWithoutConnectingToVaultHub` in the list, fill out the fields, and click **Write**.
         - You can leave `_roleAssignments = []`.
      5. Sign the transaction in your wallet.
      6. Click **View your transaction** and wait for it to be executed.
      7. Open the **Logs** tab, scroll to the **DashboardCreated** event, and note down the addresses of the created **Vault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>

##### 1.2. When an stVault is created, the Node Operator may optionally propose a tier with more favorable stETH minting terms than the Default tier.

To perform this step, the Node Operator of the newly created vault must already have individual tiers assigned. Otherwise, the stVault will remain limited to the Default tier option `(tierID = 0)`.

**Parameters needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit.

<details>
  <summary>by Command-line Interface</summary>
   ```bash
   yarn start contracts operator-grid w ct <VaultAddress> <TierID> <RequestedShareLimit>
   ```
</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **Operator Grid** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `changeTier` method in the list, fill out the fields, and click **Write**.
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.
</details>

##### 1.3. After that, the **Vault Owner**, in one transaction, accepts the stETH minting parameters and fees (by accepting the tier), supplies 1 ETH as collateral for connection to Lido Core, and initiates the connection to Lido Core.

This is a permissioned operation. By default, this permission belongs to the Vault Owner, who can delegate it to other addresses (multiple supported, including the Vault Owner’s own address). [Read more about roles](../roles-and-permissions).

**Parameters and addresses needed for this step:**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit.
- `payableAmount`: the amount of ETH to supply in the same transaction; minimum is **1 ETH**.
- `currentSettledGrowth` the amount of unaccounted growth accrued on the vault while it was disconnected. 0 for newly created vaults via create without connecting method. Settled growth is the part of the total growth that has already been charged by the node operator or is not subject to fee (exempted), such as unguaranteed or side deposits, and consolidations accrued while the vault was disconnected.


<details>
  <summary>using stVaults Web UI</summary>
      1. Open the stVaults mainpage (see [#Environments](#environments))

      2. Connect wallet on the "My Vaults" page.

      3. Open an stVault overview page by the URL ```https://<domain>/vaults/<StakingVault_address>```
      
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
      1. Open **Etherscan** and navigate to the **Dashboard** contract by its address (provided in the results of stVault creation, see step 1.1).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `connectAndAcceptTier` method in the list, fill out the fields, and click **Write**.
         -  fill out the `payableAmount` field with '1' to supply `1 ETH` in the same transaction.
         -  set the `_currentSettledGrowth` field to '0' for newly created vault like in this scenario (if the stVault is newly created but had side deposits before connecting, settled growth must be set accordingly before the connection).
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.
</details>

#### 2. One-step process (for experienced Vault Owners / Stakers)

In this approach, the Vault Owner creates an stVault that automatically connects to Lido Core, enabling stETH minting. This requires supplying 1 ETH, which will be locked as collateral for the connection to Lido Core. All completed in a single transaction, so despite being a permissionless operation, it is usually performed by the Vault Owner of the future stVault.

<details>
  <summary>using stVaults Web UI</summary>
      1. Open the stVaults mainpage (see [#Environments](#environments))
      2. Connect wallet on the "My Vaults" page.
      3. Click "Create vault".

      ![Create vault](/img/stvaults/guide-basic-stvault/guide_1_scr_9.png)

      4. Fill out the form and click "Continue".
      5. Sign transaction in the wallet.
</details>
<details>
  <summary>by Command-line Interface</summary>
      ```bash
      yarn start vo w create-vault create --defaultAdmin <VaultOwnerAddress> --nodeOperator <NodeOperatorAddress> --nodeOperatorManager <NodeOperatorManagerAddress> --confirmExpiry <TimeInSeconds> --nodeOperatorFeeRate <NodeOperatorFeeInBasisPoints> 1
      ```
</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **VaultFactory** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Go to the **Contract** tab → **Write Contract**.
      3. Click **Connect to Web3** and connect your wallet in the dialog window.
      4. Find the method `createVaultWithDashboard` in the list, fill out the fields, and click **Write**.
         - `_payableAmount (ether)` must be at least **1 ETH**.
         - You can leave `_roleAssignments = []`.
      5. Sign the transaction in your wallet.
      6. Click **View your transaction** and wait for it to be executed.
      7. Open the **Logs** tab, scroll to the **DashboardCreated** event, and note down the addresses of the created **Vault** and **Dashboard** contracts — these are the key contracts of your newly created stVault.
</details>

### Adjust stETH minting parameters

By default, a newly created stVault is connected to the Default tier with a Reserve Ratio of 50%. If the Node Operator has passed identification and been granted individual tiers, the stVault can be moved from the Default tier to one of the Node Operator’s tiers to access better stETH minting conditions.

When using vault creation method #1 ("Two-step process"), the Node Operator and Vault Owner can set up the stVault with the desired stETH minting parameters from the start. Otherwise, the tier can be changed afterwards.

Tier changes are performed via a multi-role confirmation mechanism, where the Node Operator and Vault Owner act as contracting parties. One party proposes the change, and the other party accepts it. Technically, both requests are made through the same method: `changeTier(tierId, requestedShareLimit)`.

Both parties must submit the request with identical parameters within the confirmation lifetime of 24 hours for the change to take effect.

Addresses performing this operation must have the following roles ([Read more about roles](../roles-and-permissions)):

- From the Vault Owner: Vault Owner (Admin DEFAULT_ADMIN_ROLE, or delegated VAULT_CONFIGURATION_ROLE).
- From the Node Operator: Node Operator (registered in the `OperatorGrid` contract).

:::info
Confirming tier change request requires applying fresh report to vault.
:::

**Parameters and addresses needed for this step (for CLI and Smart contracts):**

- `VaultAddress`: the address of the `Vault` contract.
- `TierID`: the ID of the tier to which the stVault will be connected.
- `RequestedShareLimit`: the requested absolute stETH minting limit for the stVault, expressed in shares. This value cannot exceed the tier’s stETH limit.

<details>
  <summary>using stVaults Web UI</summary>
      1. On behalf of the first contracting party, open 'Settings > Tiers', and click the tier selector:

      ![Settings > Tiers](/img/stvaults/guide-basic-stvault/guide_1_scr_1.png)

      2. Select the desired tier from the list:

      ![Selecting Tier](/img/stvaults/guide-basic-stvault/guide_1_scr_2.png)

      3. Review how the stVault metrics will change after moving to the new tier, then submit your request/proposal.

      ![Review settings](/img/stvaults/guide-basic-stvault/guide_1_scr_3.png)

      4. On behalf of the another contracting party open 'Settings > Tiers'.

      ![Open proposal](/img/stvaults/guide-basic-stvault/guide_1_scr_4.png)

      5. Open the request details, review the projected changes to the stVault metrics, and submit approval.

      ![Review settings](/img/stvaults/guide-basic-stvault/guide_1_scr_5.png)

</details>

<details>
  <summary>by Command-line Interface</summary>

      On behalf of the Vault Owner ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations/#change-tier-ct)):

      ```bash
      yarn start vo w change-tier -v <vaultAddress> -r <requestedShareLimit> <tierId>
      ```

      On behalf of the Node Operator ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations/#change-tier-by-no-ct-no))::

      ```bash
      yarn start vo w change-tier-by-no -v <vaultAddress> -r <requestedShareLimit> <tierId>
      ```

</details>
<details>
  <summary>using Etherscan UI</summary>

      The Node Operator and Vault Owner use same-named methods in different contracts to perform this change.

      **Node Operator:**
      1. Open **Etherscan** and navigate to the **Operator Grid** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `changeTier` method in the list, fill out the fields, and click **Write**.
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.

      **Vault Owner:**
      1. Open **Etherscan** and navigate to the **Dashboard** contract by its address (provided in the results of stVault creation, see step 1.1).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the `changeTier` method in the list, fill out the fields, and click **Write**.
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.

</details>

### Supply and withdraw ETH

Supply and Withdraw ETH are permissioned operations. By default, these permissions belong to the Vault Owner, who can delegate them to other addresses (multiple are supported, including the Vault Owner’s own address). [Read more about roles](../roles-and-permissions).

<details>
  <summary>using stVaults Web UI</summary>

      Supply / Withdraw section:
      ![Supply and Withdraw](/img/stvaults/guide-basic-stvault/guide_1_scr_6.png)
      When supplying, you can mint all amount of available stETH immediately by selecting the checkbox.
      When withdrawing, you can specify a destination address for the withdrawal. You can also choose which token to supply or withdraw: ETH or wETH.

</details>
<details>
  <summary>by Command-line Interface</summary>

Supply (fund) ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/supply-withdrawal#fund-vault)):

```bash
yarn start vo w fund <amount>
```

Withdraw ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/supply-withdrawal#withdraw-from-vault)):

```bash
yarn start vo w withdraw <amount>
```

</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **Dashboard** contract by its address (provided in the results of stVault creation, see step 1.1).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the required method in the list, fill out the fields, and click **Write**:
         - `fund` to supply (fund) ETH into the stVault; 
         - `withdraw` to withdraw ETH from the stVault balance. (accepts wei for amount)
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.
</details>

:::info
Withdrawable ETH is defined by:

- stVault Balance - ETH that is not staked on validators.
- Total lock — collateral reserved for stETH liability, the mandatory 1 ETH minimal reserve for connecting the stVault to Lido Core, and protocol and Node Operator fee obligations.

[Read more about stVaults metrics](../parameters-and-metrics)
:::

### Mint and repay stETH

When ETH is supplied to an stVault, the Vault Owner can mint stETH on demand.
Unlike Lido Core, stVaults allow stETH minting only within the defined [stETH minting capacity](../parameters-and-metrics#total-steth-minting-capacity).

Mint and Repay stETH are permissioned operations. By default, these permissions belong to the Vault Owner, who can delegate them to other addresses (multiple supported, including the Vault Owner’s own address). [Read more about roles](../roles-and-permissions).

<details>
  <summary>using stVaults Web UI</summary>

      Mint / Repay section:
      ![Mint and Repay](/img/stvaults/guide-basic-stvault/guide_1_scr_7.png)
      When minting stETH, you can specify an address to receive it. You can also choose which token to mint or repay: stETH or wstETH.

</details>
<details>
  <summary>by Command-line Interface</summary>

Mint ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/mint-burn#mint-operations)):

- Mint Shares `yarn start vo w mint-shares <amount>`
- Mint stETH tokens (rebasing): `yarn start vo w mint-steth <amount>`
- Mint wrapped stETH tokens (non-rebasing): `yarn start vo w mint-wsteth <amount>`

Repay (burn) ([details and examples](https://lidofinance.github.io/lido-staking-vault-cli/get-started/mint-burn#burn-operations)):

- Repay (burn) vault shares: `yarn start vo w burn <amount>`
- Repay (burn) stETH tokens: `yarn start vo w burn-steth <amount>`
- Repay (burn) wrapped stETH tokens: `yarn start vo w burn-wsteth <amount>`

</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **Dashboard** contract by its address (provided in the results of stVault creation, see step 1.1).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Write as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the required method in the list, fill out the fields, and click **Write**:
         - `mintShares` to mint shares;
         - `mintStETH` to mint stETH token (rebasing);
         - `mintWstETH` to mint the wrapped token wstETH (non-rebasing);
         - `burnShares` to repay (burn) shares;
         - `burnStETH` to repay (burn) stETH token;
         - `burnWstETH` to repay (burn) the wrapped token wstETH;
      6. Sign the transaction in your wallet.
      7. Click **View your transaction** and wait for it to be executed.

      To repay (burn) shares, stETH or wstETH you must first grant approval to the vault's Dashboard contract. Go to the stETH or wstETH token contract and execute the `approve()` method for the amount (in wei) you want to set as allowance. Only after the approval is confirmed you can proceed with the repay (burn) operation. Please also note that if you are trying to mint shares (instead of stETH or wstETH), in that case you may need to approve slightly different amount of stETH then you are trying to mint. Please find the contracts' addresses on the **Contracts** page in accordance with your [environment](#environments).

</details>

:::info
After stETH is repaid, the corresponding ETH is unlocked once the upcoming Oracle report confirms the repaid amount.
:::

### Deposit ETH to validators

Supplying ETH to the stVault increases its balance. The Node Operator can then deposit ETH from this balance into validators.

**The Predeposit Guarantee (PDG)** contract, as part of the stVaults platform, helps prevent deposit frontrunning caused by the vulnerabilities described in [LIP-5](https://research.lido.fi/t/lip-5-mitigations-for-deposit-front-running-vulnerability/1269). PDG secures the Vault Owner’s ETH deposits to validators from being front-run by the Node Operator.

:::warning
According to the [updated V3 rollout plan](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665/8), the Predeposit Guarantee (PDG) contract is now paused on the Hoodi Testnet and will also be paused on Mainnet during the soft-launch in late December 2025.

Phase 2 (Full Launch Mode), including the fully functional PDG, is expected in late January 2026.
:::


One of the key benefits of using PDG is the avoidance of commingling: it keeps the finances of the Vault Owner and the Node Operator strictly separated.

PDG enables three main use cases:

- **Full-cycle proof of validators.** Enables a non-custodial deposit mechanism by using guarantee ETH as collateral. [Follow the main guide](../pdg/#full-cycle-trustless-path-through-pdg).
- **PDG shortcut.** Allows skipping the pre-deposit steps and depositing directly to a validator without using PDG initially. The validator can later be associated with the vault by proving it through PDG. This path is applicable when there is unconditional trust between the Node Operator and the Vault Owner. [Follow the shortcut guide](../pdg/#pdg-shortcut).
- **Adding existing validators.** Lets you connect an existing validator from external staking infrastructure to an stVault as an advanced integration use case.

Read more: [Technical details](https://hackmd.io/@lido/stVaults-design#315-Essentials-PredepositGuarantee); [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol).

### Monitor stVault health and rebalance

The key stVault metrics that the Vault Owner should monitor and control are:

- **Utilization ratio** -- the share of the stETH minting capacity currently used by the Vault Owner. [Learn more](../parameters-and-metrics)
- **Health Factor** -- a metric that reflects the economic state of the vault. It shows how the stETH liability is collateralized by the Total Value. A Health Factor of 100% corresponds to the Forced Rebalance Threshold, meaning that if the Health Factor falls below 100%, the stVault becomes subject to forced rebalancing. [Learn more](../parameters-and-metrics)

Read more: 
- [Health Monitoring Guide](../health-monitoring-guide.md)
- [Health Emergency Guide](../health-emergency-guide.md)

The Health Factor metric may decrease as a result of validator underperformance, penalties, or a slashing event.

If this happens, there are three main options available:

- Supply ETH to increase Total Value.
- Repay stETH to reduce stETH liability.
- Rebalance ETH (optionally combined with a supply in a single transaction).

**Rebalancing** involves transferring available ETH from the stVault balance to Lido Core, receiving stETH at a 1:1 ratio, and repaying it back to the stVault. This reduces stETH Liability and thereby increases the Health Factor.

Rebalancing is performed in one transaction.

The amount of ETH required for rebalancing to bring the Utilization Ratio to 100% depends on the current Health Factor and Reserve Ratio. It can be pre-calculated manually using the formula, or via the built-in methods.

<details>
  <summary>by Formula</summary>

      ETH for rebalance = (stETH Liability − (1 − Reserve Ratio) × Total Value) / Reserve Ratio

</details>
<details>
  <summary>by Command-line Interface</summary>

      See the [CLI documentation](https://lidofinance.github.io/lido-staking-vault-cli/) for rebalance commands.

</details>
<details>
  <summary>using Etherscan UI</summary>
      1. Open **Etherscan** and navigate to the **VaultHub** contract by its address (available in the stVaults contract addresses list, see [#Environments](#environments)).
      2. Since this contract is a proxy, complete the verification steps once (if not done before):
         - Go to **Contract → Code**.
         - Click **More options**.
         - Select **Is this a proxy?**.
         - Click **Verify** in the dialog.
         - Return to the contract details page.
      3. Open the **Contract** tab → **Read as Proxy**.
      4. Click **Connect to Web3** and connect your wallet in the dialog window.
      5. Find the method `healthShortfallShares` in the list, fill out the input with the `vault` contract address, and click **Query**.
      6. Receive the result right under the submit button.
</details>

## Useful links

- [stVaults Roles](../roles-and-permissions)
- [stVaults Metrics](../parameters-and-metrics)
- [Health Monitoring Guide](../health-monitoring-guide.md)
- [Health Emergency Guide](../health-emergency-guide.md)