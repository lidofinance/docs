---
sidebar_position: 2
---

# Integration overview

stVaults are Lido staking building blocks that allows the creating of custom staking solutions still accessing unmatched stETH liquidity. The stVaults User Guide provides instructions for **managing** and **integrating** Staking Vaults (stVaults). This guide covers various interaction levels, from direct contract calls to using CLI tools and web interfaces, depending on requirements and preferred methods of fine-grained control.

For a deeper technical dive, you can check out the [stVaults Technical Design and Architecture](https://hackmd.io/@lido/stVaults-design).

:::tip 📣 **Leave feedback**
Trying to integrate with Lido V3 and stVaults?
Please share your thoughts through **[the short form](https://tally.so/r/3X9vYe)**.
:::

## Architecture Overview

![integration-overview](/img/stvaults/integration-overview.png)

stVaults consist of the following components:

- **[stVaults Web UI](#web-ui)**: A web interface interacting directly with the `Dashboard` contract and other stVaults-related contracts, providing a user-friendly experience for managing vaults and monitoring metrics.
- **[CLI (Command Line Interface)](#command-line-interface)**: A command-line tool interacting directly with the `Dashboard` contract and other stVaults-related contracts offering advanced management capabilities (deposits, generating proofs, per-vault oracle reports, etc.). ([GitHub Repository](https://github.com/lidofinance/lido-staking-vault-cli), [Documentation](https://lidofinance.github.io/lido-staking-vault-cli/))
- **[Dashboard contract](#dashboard-contract)**: A management contract deployed together with the `StakingVault` contract, and is assigned as the owner of the `StakingVault` contract by default. It provides granular management capabilities and introduces roles and permissions, allowing different actions to be managed by distinct roles. It also provides utility functions for minting/burning, performing deposits, collecting node operator fees.
- **[StakingVault Contract](#stakingvault-contract)**: The core primitive contract representing the staking vault. Advanced use cases might include direct interaction with the `StakingVault` contract, which requires transferring ownership from the `Dashboard` contract.
- **[Predeposit Guarantee (PDG)](#predeposit-guarantee-pdg)**: The contract that mitigates deposit frontrunning vulnerabilities described in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). It uses a mechanism distinct from the [Deposit Security Module](https://docs.lido.fi/contracts/deposit-security-module) adopted by **Lido Core**. It allows stVault's owner and Node Operators to deposit validators with the vault's funds in trustless manner.
- **Off-chain monitoring tools (can be used by the Node Operator):**
  - **[Ethereum Validators Monitoring (EVM)](#ethereum-validators-monitoring-evm)**: Consensus layer validators monitoring bot that fetches Lido or Custom Users Node Operators keys from the Execution layer and checks their performance on the Consensus layer by the balance delta, attestations, proposes, sync committee participation.
  - **[Ethereum Head Watcher](#ethereum-head-watcher)**: Bot that watches Ethereum head block, handles validator-related "events", and sends notifications through Alertmanager to a Discord channel.

## Integration and interacting layers

### Web UI

:::info
The Web UI covers nearly all routine stVault tasks for [Lido V3 testnet on Hoodi](https://docs.lido.fi/deployed-contracts/hoodi/).
For advanced or low-level features that haven’t yet been exposed in the interface, use the [CLI](#command-line-interface).
:::

**URL**: Testnet on Hoodi: https://stvaults-hoodi.testnet.fi/

**Goal**: Provide an easy-to-use interface for managing and monitoring stVaults via the Vault UI.

**Steps**:

1. Access the Vault Web UI and connect the wallet.
2. Create a vault and set up roles and permissions.
3. Supply/withdraw ETH, mint/repay stETH.
4. Control stVault Health factor and corresponding metrics, configure stVault settings.

**Use case example**:

- Individual and institutional stakers using the Web UI to perform operations, exploring vault performance, economy, fees, and efficiency.
- Prospecting vault owners examining node operator performance and vault efficiency before creating their own stVault.
- Anyone using the Web UI as an educational and analytical tool for understanding stVaults mechanics and economy.

### Command-line interface

**URL**: [GitHub Repository](https://github.com/lidofinance/lido-staking-vault-cli), [Documentation](https://lidofinance.github.io/lido-staking-vault-cli/)

**Goal**: Manage stVaults via CLI for day-to-day and advanced operations as well as automation (deposits, generating/submitting proofs, per-vault oracle reports, etc.).

**Steps**:

1. Clone the GitHub repository and configure it according to the [CLI User Guide](https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration).
2. Deploy, configure vaults, assign roles, and manage staking operations.
3. Utilize commands for advanced maintenance.
4. Check-up the vault state via data provided by CLI.

**Use case examples**:

- Institutional integrator requiring automated and scriptable staking management.
- Node Operator using the CLI to initiate staking operations and monitor staking performance, as well as predeposit, prove and top-up deposit validators via Predeposit Guarantee (PDG).
  - Protocols integrating with stVaults and running in the integration on testnet.

### Dashboard contract

**URL**: [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/dashboard/Dashboard.sol)

**Goal**: Provide a feature-rich straightforward UX layer for staking vault and `VaultHub` and additional accounting for Node Operator fee.

**Steps**:

1. Call `VaultFactory` to create a `StakingVault` contract and a `Dashboard` contract assigned as an owner of the Vault contract.
2. Define roles and permissions on the `StakingVault` creating, or later via the `Dashboard` contract.
3. Interact with the `Dashboard` contract for high-level operations.
4. Use role-specific methods via the `Dashboard` contract to interact with the `StakingVault` contract.

**Use case example**:

- Granular permissions for staking vault operations and Node Operator fee claiming.
- Structured product integrating stVaults for staking operations with granular control.

### StakingVault contract

**URL**: [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/StakingVault.sol)

**Goal**: Directly manage a `StakingVault` contract by transferring its ownership from the `Dashboard` contract to reduce operations gas costs (**advanced integrations**).

> If vault ownership is changed to interact with the vault directly, it’s no longer possible to use other Lido stVaults infrastructure mechanisms to manage the vault. In this case, direct interaction with Lido core protocol via the Vault Hub contract is required.

**Steps**:

1. Call `VaultFactory` to create a `StakingVault` contract and a `Dashboard` contract.
2. Transfer ownership from the `Dashboard` contract to the desired address.
3. Use smart contract calls to configure, supply, withdraw, and manage other operations.
4. Monitor contract status directly via blockchain explorers or custom tools.

**Use case example**:

- Institutional users with a dedicated infrastructure for contract interaction who require maximum control over staking operations.
- Structured product integrating `StakingVault` directly to reduce operations gas costs and use own infrastructure.

### Predeposit Guarantee (PDG)

**URL**: [Technical details](https://hackmd.io/@lido/stVaults-design?stext=5138%3A160%3A0%3A1744277214%3A66cxZj); [GitHub Repository](https://github.com/lidofinance/core/blob/feat/vaults/contracts/0.8.25/vaults/predeposit_guarantee/PredepositGuarantee.sol), [PDG user guide](./pdg)

**Goal**: Prevent deposit frontrunning enabled by vulnerabilities described in [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). PDG secures the vault owner’s ether depositing to the validator from front-running by the node operator or third parties. One of the key advantages is a separating finances of the vault owner and the node operator.

**How to use:**

1. Create and configure a vault through any convenient interface (contracts, CLI, or UI).
2. Predeposit guarantee contract enables three main use cases:
   1. Full-cycle proof of validators through PDG to enable non-custodial depositing mechanism, using the guarantee ether as a collateral ([read more](./pdg#full-cycle-trustless-path-through-pdg)).
   2. PDG shortcut that allows to skip the predepositing steps and deposit to validator up to 2048 ETH in one transaction, later on optional associating the validator with the vault by proving it through PDG. Applicable in unconditional trust between the node operator and the vault owner ([read more](./pdg#pdg-shortcut)).
   3. Adding existing validator to Vault from external staking infrastructure as an advanced integration use-case.

### Off-chain monitoring tools

#### **Ethereum Validators Monitoring (EVM)**

**Where**: [GitHub Repository](https://github.com/lidofinance/ethereum-validators-monitoring)

**Goal**: Off-chain track the status and performance of Ethereum validators used in stVaults. It helps detect inactivity, monitor effectiveness, and identify anomalies in validator operations.

**How to use:**

- Clone the repository from GitHub.
- Install dependencies and set up the environment.
- Run the monitoring tool to get validator status.
- Integrate the output with alerting or dashboards.

#### **Ethereum Head Watcher**

**Where**: [GitHub Repository](https://github.com/lidofinance/ethereum-head-watcher)

**Goal**: Off-chain monitor Ethereum chain head updates to detect delays, stalls, or reorgs. It is used to ensure timely block processing and head finality, which are critical for the stability of services like stVaults.

**How to use:**

- Clone the repository from GitHub.
- Install dependencies and configure environment variables.
- Run the watcher to observe head progression.
- Connect it to alerting or monitoring systems if needed.
