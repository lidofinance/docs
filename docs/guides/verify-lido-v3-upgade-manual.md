---
title: Verify Lido V3 Upgrade (Mainnet)
sidebar_label: Verify Lido V3 Upgrade
description: Guide for verifying Lido V3 deployments, state transitions, and vote execution on Ethereum mainnet using diffyscan, state-mate, and fork testing.
---

# Verify Lido V3 Upgrade (Mainnet)

This guide provides a comprehensive walkthrough for verifying the Lido V3 upgrade on Ethereum mainnet. It is intended as a continuation of the [Lido V3 Deployment](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665/5) announcement and serves security researchers, auditors, LDO tokenholders, and community members who wish to independently verify the upgrade.

## Overview

The verification process covers three main areas:

1. **Source code and bytecode verification** — Ensuring deployed contracts match the audited source code
2. **State verification** — Confirming pre-vote and post-vote contract states are correct
3. **Fork testing** — Simulating the vote execution and validating post-upgrade behavior

## Prerequisites

Before starting, ensure you have:

- Git
- Node.js ≥ 20
- Python ≥ 3.10
- Poetry
- An Ethereum RPC endpoint (Infura, Alchemy, or similar)
- An Etherscan API key

## 1. Source Code and Bytecode Verification with Diffyscan

[Diffyscan](https://github.com/lidofinance/diffyscan) is a tool for comparing deployed contract bytecode against source code. It verifies that deployed contracts match the audited commit and that constructor arguments are correctly encoded.

### 1.1 Setup

```bash
git clone https://github.com/lidofinance/diffyscan.git
cd diffyscan
git checkout main

# Install dependencies
poetry install
npm install
```

### 1.2 Configuration Files

Diffyscan uses JSON configuration files that specify:

- The source repository and commit to verify against
- Contract addresses and their constructor arguments
- External dependencies (OpenZeppelin, Aragon, etc.)

Review the Lido V3 verification configs located at:

```
diffyscan/config_samples/ethereum/mainnet/vaults/
├── vaults_config.json                # Core protocol contracts
├── vaults_voting_config.json         # Voting contracts
└── vaults_easy_track_config.json     # Easy Track factory contracts
```

#### `vaults_voting_config.json` — Voting contracts

The config pins the core repository at:
- **Deploy commit**: [`bb8f7391048cdb69f04c1c52e2610544d9769bb1`](https://github.com/lidofinance/core/commit/bb8f7391048cdb69f04c1c52e2610544d9769bb1)

This config covers verification of:

| Contract | Proxy Address | Implementation |
|----------|---------------|----------------|
| V3Template | ∅ | `0x34E01ecFebd403370b0879C628f8A5319dDb8507` |
| V3VoteScript | ∅ | `0xa47Ca1d2029D8e735237ea4E74c607426d4aA07e` |
| V3TemporaryAdmin | ∅ | `0xf738A2C7d69694B618dbB547C1c5A152D7958f06` |

> **Note**: The deploy commit contains updates to tests, scripts, and voting contracts only. Core protocol contracts have identical bytecode to the audited commit. [View diff](https://github.com/lidofinance/core/compare/b98371488eb9479cf072bd6c2b682a59c5dd71d8...bb8f7391048cdb69f04c1c52e2610544d9769bb1).

#### `vaults_config.json` — Core Protocol Contracts

This config covers verification of:

| Contract | Proxy Address | Implementation |
|----------|---------------|----------------|
| Lido (stETH) | `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84` | `0x6ca84080381E43938476814be61B779A8bB6a600` |
| LidoLocator | `0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb` | `0x2f8779042EFaEd4c53db2Ce293eB6B3f7096C72d` |
| AccountingOracle | `0x852deD011285fe67063a08005c71a85690503Cee` | `0x1455B96780A93e08abFE41243Db92E2fCbb0141c` |
| Burner | `0xE76c52750019b80B43E36DF30bf4060EB73F573a` | `0xEe1E3B4f047122650086985f794f0dB5f10Ae49D` |
| VaultHub | `0x1d201BE093d847f6446530Efb0E8Fb426d176709` | `0x7c7d957D0752AB732E73400624C4a1eb1cb6CF50` |
| PredepositGuarantee | `0xF4bF42c6D6A0E38825785048124DBAD6c9eaaac3` | `0xCC08C36BD5bb78FDcB10F35B404ada6Ffc71a023` |
| OperatorGrid | `0xC69685E89Cefc327b43B7234AC646451B27c544d` | `0xA612E30D71d7D54aEaf4e5A21023F3F270932C2C` |
| Accounting | `0x23ED611be0e1a820978875C0122F92260804cdDf` | `0xd43a3E984071F40d5d840f60708Af0e9526785df` |
| LazyOracle | `0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c` | `0x47f3a6b1E70F7Ec7dBC3CB510B1fdB948C863a5B` |
| V3Template | ∅ | `0x34E01ecFebd403370b0879C628f8A5319dDb8507` |
| V3VoteScript | ∅ | `0xa47Ca1d2029D8e735237ea4E74c607426d4aA07e` |
| V3TemporaryAdmin | ∅ | `0xf738A2C7d69694B618dbB547C1c5A152D7958f06` |
| VaultFactory | ∅ | `0x02Ca7772FF14a9F6c1a08aF385aA96bb1b34175A` |
| UpgradeableBeacon | ∅ | `0x5FbE8cEf9CCc56ad245736D3C5bAf82ad54Ca789` |
| StakingVault (impl) | ∅ | `0x06A56487494aa080deC7Bf69128EdA9225784553` |
| Dashboard (impl) | ∅ | `0x294825c2764c7D412dc32d87E2242c4f1D989AF3` |
| GateSeal (VaultHub and PDG) | ∅ | `0x881dAd714679A6FeaA636446A0499101375A365c` |

The config pins the core repository at:
- **Audited commit**: [`b98371488eb9479cf072bd6c2b682a59c5dd71d8`](https://github.com/lidofinance/core/commit/b98371488eb9479cf072bd6c2b682a59c5dd71d8)

#### `vaults_easy_track_config.json` — Easy Track Factories

This config verifies the stVaults Committee Easy Track factories:

| Factory | Address | Purpose | Phase |
|---------|---------|---------|-------|
| RegisterGroupsInOperatorGrid | `0x194A46DA1947E98c9D79af13E06Cfbee0D8610cC` | Register operator groups | Phase 1 (50k max) |
| RegisterGroupsInOperatorGrid | `0xE73842AEbEC99Dacf2aAEec61409fD01A033f478` | Register operator groups | Phase 2/3 (1M max) |
| UpdateGroupsShareLimitInOperatorGrid | `0x8Bdc726a3147D8187820391D7c6F9F942606aEe6` | Update group limits | Phase 1 (50k max) |
| UpdateGroupsShareLimitInOperatorGrid | `0xf23559De8ab37fF7a154384B0822dA867Cfa7Eac` | Update group limits | Phase 2/3 (1M max) |
| RegisterTiersInOperatorGrid | `0x5292A1284e4695B95C0840CF8ea25A818751C17F` | Register risk tiers | All phases |
| AlterTiersInOperatorGrid | `0xa29173C7BCf39dA48D5E404146A652d7464aee14` | Modify tier params | Phase 1 (0 default) |
| AlterTiersInOperatorGrid | `0x73f80240ad9363d5d3C5C3626953C351cA36Bfe9` | Modify tier params | Phase 2/3 (1M default) |
| SetJailStatusInOperatorGrid | `0x93F1DEE4473Ee9F42c8257C201e33a6Da30E5d67` | Jail/unjail vaults | All phases |
| UpdateVaultsFeesInOperatorGrid | `0x5C3bDFa3E7f312d8cf72F56F2b797b026f6B471c` | Update vault fees | All phases |
| ForceValidatorExitsInVaultHub | `0x6C968cD89CA358fbAf57B18e77a8973Fa869a6aA` | Force validator exits | All phases |
| SocializeBadDebtInVaultHub | `0x1dF50522A1D868C12bF71747Bb6F24A18Fe6d32C` | Socialize bad debt | All phases |
| VaultsAdapter | `0xe2DE6d2DefF15588a71849c0429101F8ca9FB14D` | Easy Track helper | All phases |

The config pins the Easy Track repository at:
- **Audited commit**: [`c64468ca5126237c33e17b71d9307a6aea0ee5cc`](https://github.com/lidofinance/easy-track/commit/c64468ca5126237c33e17b71d9307a6aea0ee5cc)

### 1.3 Running Diffyscan

Set your environment variables:

```bash
export ETHERSCAN_API_KEY=<your_etherscan_api_key>
export ETH_RPC_URL=<your_ethereum_rpc_url>
```

Run bytecode verification for core contracts:

```bash
poetry run diffyscan -- config_samples/ethereum/mainnet/vaults/vaults_config.json --hardhat-path hardhat_configs/mainnet_hardhat_config.ts -Y -E -G
```

Run bytecode verification for voting contracts:

```bash
poetry run diffyscan -- config_samples/ethereum/mainnet/vaults/vaults_voting_config.json --hardhat-path hardhat_configs/mainnet_hardhat_config.ts -Y -E -G
```

Run bytecode verification for Easy Track factories:

```bash
poetry run diffyscan -- config_samples/ethereum/mainnet/vaults/vaults_easy_track_config.json --hardhat-path hardhat_configs/mainnet_hardhat_config.ts -Y -E -G
```

### 1.4 Interpreting Results

An expected run will show for the core contracts:
```
 🔵 [INFO] ================================================================================
 🔵 [INFO] FINAL SUMMARY
 🔵 [INFO] ================================================================================
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] SOURCE CODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 22
 🟢 [OKAY] Contracts with non-zero source diffs: 0
 🟢 [OKAY] Total files with non-zero diffs: 0
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] BYTECODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 22
 🟢 [OKAY] Contracts with non-zero bytecode diffs: 0
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] ================================================================================
 🟢 [OKAY] Done in 207.239s ✨
```

An expected run will show for the voting contracts:
```
  ...
 🔵 [INFO] ================================================================================
 🔵 [INFO] FINAL SUMMARY
 🔵 [INFO] ================================================================================
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] SOURCE CODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 3
 🟢 [OKAY] Contracts with non-zero source diffs: 0
 🟢 [OKAY] Total files with non-zero diffs: 0
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] BYTECODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 3
 🟢 [OKAY] Contracts with non-zero bytecode diffs: 0
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] ================================================================================
 🟢 [OKAY] Done in 98.873s ✨ 
 ```

An expected run will show for the ET factory contracts:

```
  ...
 🔵 [INFO] ================================================================================
 🔵 [INFO] FINAL SUMMARY
 🔵 [INFO] ================================================================================
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] SOURCE CODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 13
 🟢 [OKAY] Contracts with non-zero source diffs: 13
 🟢 [OKAY] Total files with non-zero diffs: 13
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] Contracts with source code differences:
 🟠 [WARN]   • RegisterGroupsInOperatorGrid (0x194A46DA1947E98c9D79af13E06Cfbee0D8610cC): 1 file(s) with diffs out of 6
 🟠 [WARN]   • RegisterGroupsInOperatorGrid (0xE73842AEbEC99Dacf2aAEec61409fD01A033f478): 1 file(s) with diffs out of 6
 🟠 [WARN]   • UpdateGroupsShareLimitInOperatorGrid (0x8Bdc726a3147D8187820391D7c6F9F942606aEe6): 1 file(s) with diffs out of 6
 🟠 [WARN]   • UpdateGroupsShareLimitInOperatorGrid (0xf23559De8ab37fF7a154384B0822dA867Cfa7Eac): 1 file(s) with diffs out of 6
 🟠 [WARN]   • AlterTiersInOperatorGrid (0xa29173C7BCf39dA48D5E404146A652d7464aee14): 1 file(s) with diffs out of 6
 🟠 [WARN]   • AlterTiersInOperatorGrid (0x73f80240ad9363d5d3C5C3626953C351cA36Bfe9): 1 file(s) with diffs out of 6
 🟠 [WARN]   • RegisterTiersInOperatorGrid (0x5292A1284e4695B95C0840CF8ea25A818751C17F): 1 file(s) with diffs out of 6
 🟠 [WARN]   • VaultsAdapter (0xe2DE6d2DefF15588a71849c0429101F8ca9FB14D): 1 file(s) with diffs out of 5
 🟠 [WARN]   • SetJailStatusInOperatorGrid (0x93F1DEE4473Ee9F42c8257C201e33a6Da30E5d67): 1 file(s) with diffs out of 6
 🟠 [WARN]   • UpdateVaultsFeesInOperatorGrid (0x5C3bDFa3E7f312d8cf72F56F2b797b026f6B471c): 1 file(s) with diffs out of 7
 🟠 [WARN]   • ForceValidatorExitsInVaultHub (0x6C968cD89CA358fbAf57B18e77a8973Fa869a6aA): 1 file(s) with diffs out of 5
 🟠 [WARN]   • SocializeBadDebtInVaultHub (0x1dF50522A1D868C12bF71747Bb6F24A18Fe6d32C): 1 file(s) with diffs out of 6
 🟠 [WARN]   • SetLiabilitySharesTargetInVaultHub (0x4E5Cc771c7b77f1417fa6BA9262d83C6CCc1e969): 1 file(s) with diffs out of 5
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] BYTECODE COMPARISON SUMMARY:
 🟢 [OKAY] Total contracts analyzed: 13
 🟢 [OKAY] Contracts with non-zero bytecode diffs: 0
 - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - + - +
 🔵 [INFO] ================================================================================
 🟢 [OKAY] Done in 24.733s ✨                                                                                                    
 🔴 [ERROR] Exiting with non-zero code due to unallowed diffs: source=13, bytecode=0
```

> Note:
> Easy Track factories verified with `brownie` have the altered import schemes resulting in the source code diffs. 

---

## 2. State Verification with state-mate

[State-mate](https://github.com/lidofinance/state-mate) is a tool for verifying on-chain contract state against expected values. It's used to ensure contracts are initialized correctly and that the upgrade properly transitions all state variables.

### 2.1 Setup

```bash
git clone https://github.com/lidofinance/state-mate.git
cd state-mate

# Install dependencies
corepack enable
yarn install
```

### 2.2 Configuration Files

State-mate uses YAML configuration files that define expected contract states. The Lido V3 configs are located at:

```
state-mate/configs/lidov3/mainnet/
├── lidov3-core-pre-vote.yaml      # Core contracts state before vote
├── lidov3-core-post-vote.yaml     # Core contracts state after vote
├── lidov3-et-pre-vote.yml         # Easy Track state before vote
├── lidov3-et-post-vote.yml        # Easy Track state after vote
└── lidov3-et-pre-vote-phase-2.yml # Easy Track state for Phase 2/3
```

#### Pre-Vote Core State (`lidov3-core-pre-vote.yaml`)

Verifies the deployed contracts before the vote executes:

- **Proxy admins** — All proxies (VaultHub, Burner, OperatorGrid, etc.) have `proxy__getAdmin()` returning the Agent address
- **Proxies not ossified** — `proxy__getIsOssified()` returns `false` for all upgradeable proxies
- **ACL holders** — Correct role assignments for Aragon apps, VaultHub, PredepositGuarantee, etc.
- **Chain constants** — `CHAIN_ID`, `GENESIS_TIME`, `SLOTS_PER_EPOCH` match expected values
- **Protocol NOT upgraded yet** — Old LidoLocator implementation is in place
- **Upgrade template state** — `V3Template.upgradeStarted()` returns `false`

Key assertions:

```yaml
# V3Template not started
- contract: V3Template
  address: "0x34E01ecFebd403370b0879C628f8A5319dDb8507"
  checks:
    - method: upgradeStarted
      expected: false
    - method: upgradeFinished
      expected: false
    - method: expireSinceInclusive
      expected: 1768435200  # Jan 15, 2026

# LidoLocator still on old implementation
- contract: LidoLocator
  address: "0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb"
  checks:
    - method: proxy__getImplementation
      expected: "0x1D920..."  # Old implementation
```

#### Post-Vote Core State (`lidov3-core-post-vote.yaml`)

Verifies the state after vote execution:

- **New implementations** — All proxies point to new V3 implementations
- **Contract versions** — `Lido.getContractVersion() == 3`, `AccountingOracle.getContractVersion() == 4`
- **Consensus version** — `AccountingOracle.getConsensusVersion() == 5`
- **Upgrade complete** — `V3Template.upgradeFinished() == true`
- **Burner migration** — `isMigrationAllowed() == false`, balances transferred
- **Role transfers** — `REPORT_REWARDS_MINTED_ROLE` moved from Lido to Accounting

Key post-vote assertions:

```yaml
# Contract versions upgraded
- contract: Lido
  address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
  checks:
    - method: getContractVersion
      expected: 3

- contract: AccountingOracle
  address: "0x852deD011285fe67063a08005c71a85690503Cee"
  checks:
    - method: getContractVersion
      expected: 4
    - method: getConsensusVersion
      expected: 5

# New burner migration complete
- contract: Burner
  address: "0xE76c52750019b80B43E36DF30bf4060EB73F573a"
  checks:
    - method: isMigrationAllowed
      expected: false
```

#### Pre-Vote Easy Track State (`lidov3-et-pre-vote.yml`)

Verifies Easy Track configuration before factories are connected:

- **Trusted caller** — stVaults Committee multisig: `0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF`
- **EVMScript executor** — `0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977`
- **Factories NOT registered** — New stVaults factories not yet in `getEVMScriptFactories()`
- **Parameter limits** — `maxGroupShareLimit`, `initialValidatorExitFeeLimit`, etc.

```yaml
# Easy Track base configuration
- contract: EasyTrack
  address: "0xF0211b7660680B49De1A7E9f25C65660F0a13Fea"
  checks:
    - method: evmScriptExecutor
      expected: "0xFE5986E06210aC1eCC1aDCafc0cc7f8D63B3F977"

# VaultsAdapter configuration
- contract: VaultsAdapter
  address: "0xe2DE6d2DefF15588a71849c0429101F8ca9FB14D"
  checks:
    - method: trustedCaller
      expected: "0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF"
    - method: maxGroupShareLimit
      expected: 50000000000000000000000  # 50,000 stETH
    - method: initialValidatorExitFeeLimit
      expected: 100000000000000000       # 0.1 ETH
```

#### Post-Vote Easy Track State (`lidov3-et-post-vote.yml`)

Verifies all nine stVaults factories are properly registered:

- **Factories registered** — All factories appear in `getEVMScriptFactories()`
- **Permission bytes** — Each factory has correct `bytes20(target) ++ selector` permissions
- **Factory-specific limits** — Phase-appropriate share limits and fee bounds

#### Phase 2 Easy Track State (`lidov3-et-pre-vote-phase-2.yml`)

Verifies configuration changes for Phase 2 transition:

- **Increased limits** — `maxGroupShareLimit` raised to 1,000,000 stETH
- **Default tier changes** — `maxDefaultTierShareLimit` updated for permissionless minting preparation

### 2.3 Running State-mate

Set your environment:

```bash
export ETH_RPC_URL=<your_ethereum_rpc_url>
```

Run pre-vote verification:

```bash
# Core contracts
python state_mate.py configs/lidov3/mainnet/lidov3-core-pre-vote.yaml

# Easy Track
python state_mate.py configs/lidov3/mainnet/lidov3-et-pre-vote.yml
```

Run post-vote verification (after vote execution or on fork):

```bash
# Core contracts
python state_mate.py configs/lidov3/mainnet/lidov3-core-post-vote.yaml

# Easy Track
python state_mate.py configs/lidov3/mainnet/lidov3-et-post-vote.yml
```

### 2.4 Interpreting Results

Successful output:

```
✓ V3Template.upgradeStarted() == false
✓ V3Template.upgradeFinished() == false
✓ LidoLocator.proxy__getAdmin() == 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c
...
All 127 checks passed
```

Failed checks indicate state mismatches requiring investigation.

---

## 3. Post-Vote Fork Testing with Lido Scripts

For comprehensive post-vote validation, use the [lidofinance/scripts](https://github.com/lidofinance/scripts) repository to simulate the vote on a mainnet fork.

### 3.1 Setup

```bash
git clone https://github.com/lidofinance/scripts.git
cd scripts

# Checkout the V3 vote branch
git checkout feat/v3-vote

# Install dependencies
poetry install
npm install
```

### 3.2 Environment Configuration

Create a `.env` file or export the following:

```bash
export WEB3_INFURA_PROJECT_ID=<infura_api_key>
export ETH_RPC_URL=<ethereum_rpc_url>
export ETHERSCAN_TOKEN=<etherscan_api_key>

# Optional: Skip event decoding for faster runs
export OMNIBUS_BYPASS_EVENTS_DECODING=1
```

### 3.3 Using Docker (Recommended)

The scripts repository provides a Dockerized environment:

```bash
# Pull the latest image
docker pull ghcr.io/lidofinance/scripts:v20

# Run the container
docker run -it --rm \
  -e WEB3_INFURA_PROJECT_ID \
  -e ETH_RPC_URL \
  -e ETHERSCAN_TOKEN \
  ghcr.io/lidofinance/scripts:v20 \
  /bin/bash
```

### 3.4 Running Fork Tests

Start a local Hardhat fork:

```bash
npx hardhat node --fork $ETH_RPC_URL
```

In another terminal, run the vote script and tests:

```bash
# Activate poetry environment
poetry shell

# Run all V3 vote tests
brownie test tests/vote_v3*.py -s --network mainnet-fork

# Or run specific acceptance tests
brownie test tests/acceptance/ -s --network mainnet-fork
```

### 3.5 Enacting the Vote on Fork

To simulate vote creation and enactment:

```bash
# Create and enact the vote on fork
make enact-fork vote=scripts/vote_v3_upgrade.py
```

This will:
1. Create the Aragon vote
2. Fast-forward time to pass voting period
3. Execute the vote
4. Run post-execution assertions

### 3.6 Running State-mate on Fork

After enacting the vote on the fork, run state-mate against the forked state:

```bash
# In state-mate directory, point to fork RPC
export ETH_RPC_URL=http://localhost:8545

# Run post-vote checks
python state_mate.py configs/lidov3/mainnet/lidov3-core-post-vote.yaml
python state_mate.py configs/lidov3/mainnet/lidov3-et-post-vote.yml
```

### 3.7 Key Test Scenarios

The fork tests validate:

| Test Category | What It Checks |
|---------------|----------------|
| **Upgrade flow** | `startUpgrade()` → actions → `finishUpgrade()` in single tx |
| **Time constraints** | Execution only within 14:00–23:00 UTC window |
| **Expiry check** | Vote cannot execute after `expireSinceInclusive` (Jan 15, 2026) |
| **Supply invariants** | `getTotalShares()` and `getTotalPooledEther()` unchanged |
| **Burner migration** | Balances, allowances, and counters transferred correctly |
| **Role transfers** | `REPORT_REWARDS_MINTED_ROLE` moved to Accounting |
| **Easy Track factories** | All 9 factories registered with correct permissions |
| **GateSeal** | Pause/resume roles correctly assigned |

---

## 4. Audit Reports

Lido V3 has undergone extensive security audits by multiple independent firms. All reports are published in the [Lido Audits Repository](https://github.com/lidofinance/audits) and indexed at [docs.lido.fi/security/audits](https://docs.lido.fi/security/audits).

### 4.1 Lido V3 Core Audits

| Auditor | Scope | Report |
|---------|-------|--------|
| **Certora** | Formal verification + on/off-chain audit | [Certora Lido V3](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3) |
| **Certora** | Formal verification (FV) | [Certora Lido V3 FV](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3-fv) |
| **Certora** | Off-chain Oracle audit | [Certora Oracle V7](https://docs.lido.fi/security/audits/#10-2025-certora-lido-v3-oracle) |
| **ConsenSys Diligence** | On-chain review + invariant fuzzing | [ConsenSys Diligence V3](https://docs.lido.fi/security/audits/#10-2025-consensys-dilligence-lido-v3) |
| **Composable Security** | Oracle/infra, threat models | [Composable Security Oracle V7](https://docs.lido.fi/security/audits/#10-2025-composable-security-oracle-v7) |
| **MixBytes** | Vault logic, global accounting, governance | [MixBytes Lido V3](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3) |
| **MixBytes** | Easy Track factories | [MixBytes Easy Track V3](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3-easy-track) |

### 4.2 Deployment Verification

| Auditor | Scope | Report |
|---------|-------|--------|
| **MixBytes** | Deployment verification | [MixBytes Deployment Verification](https://docs.lido.fi/security/audits/#10-2025-mixbytes-lido-v3-deployment) |

The deployment verification report confirms:
- Bytecode matches the audited commit
- Constructor parameters are correct
- Access control is properly configured
- State initialization is valid

### 4.3 Bug Bounty

The [Immunefi Bug Bounty Program](https://immunefi.com/bug-bounty/lido/) covers Lido V3 contracts. Additionally, a dedicated [Lido V3 Bug Bounty Competition](https://immunefi.com/audit-competition/lido-v3-bug-bounty-competition/information/) with boosted rewards ran during the audit period.

### 4.4 Safe Harbor

Lido has adopted the [SEAL Safe Harbor Agreement](https://research.lido.fi/t/proposal-adopt-the-seal-safe-harbor-agreement/10940) providing legal protection for security researchers who responsibly disclose vulnerabilities.

---

## 5. Manual Verification Examples

For additional spot checks beyond automated tools, use `cast` or similar utilities:

### 5.1 Contract Versions

```bash
# Lido contract version (expect 3 post-upgrade)
cast call 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 "getContractVersion()(uint256)"

# AccountingOracle contract version (expect 4 post-upgrade)
cast call 0x852deD011285fe67063a08005c71a85690503Cee "getContractVersion()(uint256)"

# AccountingOracle consensus version (expect 5 post-upgrade)
cast call 0x852deD011285fe67063a08005c71a85690503Cee "getConsensusVersion()(uint256)"
```

### 5.2 Proxy Implementations

```bash
# LidoLocator implementation
cast call 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb "proxy__getImplementation()(address)"

# VaultHub implementation
cast call 0x1d201BE093d847f6446530Efb0E8Fb426d176709 "proxy__getImplementation()(address)"

# Proxy admin (should be Agent)
cast call 0x1d201BE093d847f6446530Efb0E8Fb426d176709 "proxy__getAdmin()(address)"
```

### 5.3 GateSeal Configuration

```bash
# Sealing committee
cast call 0x881dAd714679A6FeaA636446A0499101375A365c "get_sealing_committee()(address)"

# Sealable contracts (VaultHub + PDG)
cast call 0x881dAd714679A6FeaA636446A0499101375A365c "get_sealables()(address[])"

# Seal duration (14 days = 1209600 seconds)
cast call 0x881dAd714679A6FeaA636446A0499101375A365c "get_seal_duration_seconds()(uint256)"
```

### 5.4 VaultHub Parameters

```bash
# Max relative share limit (10% = 1000 BP)
cast call 0x1d201BE093d847f6446530Efb0E8Fb426d176709 "MAX_RELATIVE_SHARE_LIMIT_BP()(uint256)"

# Pause role holders
PAUSE_ROLE=$(cast call 0x1d201BE093d847f6446530Efb0E8Fb426d176709 "PAUSE_ROLE()(bytes32)")
cast call 0x1d201BE093d847f6446530Efb0E8Fb426d176709 "getRoleMemberCount(bytes32)(uint256)" $PAUSE_ROLE
```

### 5.5 OperatorGrid Default Tier

```bash
# Default tier parameters
cast call 0xC69685E89Cefc327b43B7234AC646451B27c544d "getDefaultTier()((uint256,uint256,uint256,uint256,uint256,uint256))"

# Expected: (0, 5000, 4975, 100, 650, 0)
# shareLimitInEther=0, reserveRatioBP=5000, forcedRebalanceThresholdBP=4975,
# infraFeeBP=100, liquidityFeeBP=650, reservationFeeBP=0
```

### 5.6 LazyOracle Sanity Limits

```bash
# Quarantine period (3 days = 259200 seconds)
cast call 0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c "quarantinePeriod()(uint256)"

# Max reward ratio (350 BP = 3.5%)
cast call 0x5DB427080200c235F2Ae8Cd17A7be87921f7AD6c "maxRewardRatioBP()(uint256)"
```

### 5.7 Easy Track Factories

```bash
# List all registered factories
cast call 0xF0211b7660680B49De1A7E9f25C65660F0a13Fea "getEVMScriptFactories()(address[])"

# Check if specific factory is registered
cast call 0xF0211b7660680B49De1A7E9f25C65660F0a13Fea "isEVMScriptFactory(address)(bool)" 0x194A46DA1947E98c9D79af13E06Cfbee0D8610cC
```

### 5.8 Burner Migration Status

```bash
# Old burner balance (should be 0 post-migration)
cast call 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 "balanceOf(address)(uint256)" 0xD15a672319Cf0352560eE76d9e89eAB0889046D3

# New burner migration status (should be false post-migration)
cast call 0xE76c52750019b80B43E36DF30bf4060EB73F573a "isMigrationAllowed()(bool)"

# Cover shares burnt (should match between old and new)
cast call 0xD15a672319Cf0352560eE76d9e89eAB0889046D3 "getCoverSharesBurnt()(uint256)"
cast call 0xE76c52750019b80B43E36DF30bf4060EB73F573a "getCoverSharesBurnt()(uint256)"
```

---

## 6. Verification Checklist

Use this checklist to track your verification progress:

### Pre-Vote Verification
- [ ] Diffyscan: Core contracts bytecode matches audited commit
- [ ] Diffyscan: Easy Track factories bytecode matches audited commit
- [ ] State-mate: `lidov3-core-pre-vote.yaml` all checks pass
- [ ] State-mate: `lidov3-et-pre-vote.yml` all checks pass
- [ ] V3Template not started (`upgradeStarted() == false`)
- [ ] All audit reports reviewed

### Fork Testing
- [ ] Vote script executes successfully on fork
- [ ] Time constraint check passes (14:00–23:00 UTC)
- [ ] Supply invariants maintained post-upgrade
- [ ] Burner migration completes correctly
- [ ] All 9 Easy Track factories registered

### Post-Vote Verification
- [ ] State-mate: `lidov3-core-post-vote.yaml` all checks pass
- [ ] State-mate: `lidov3-et-post-vote.yml` all checks pass
- [ ] Contract versions correct (Lido=3, AO=4, consensus=5)
- [ ] GateSeal pause roles correctly assigned
- [ ] Role transfers complete (REPORT_REWARDS_MINTED_ROLE)

---

## 7. Additional Resources

- **Source Code**: [github.com/lidofinance/core](https://github.com/lidofinance/core)
- **Audit Reports**: [docs.lido.fi/security/audits](https://docs.lido.fi/security/audits)
- **Diffyscan Tool**: [github.com/lidofinance/diffyscan](https://github.com/lidofinance/diffyscan)
- **State-mate Tool**: [github.com/lidofinance/state-mate](https://github.com/lidofinance/state-mate)
- **Scripts Repository**: [github.com/lidofinance/scripts](https://github.com/lidofinance/scripts)
- **Risk Assessment Framework**: [research.lido.fi/t/risk-assessment-framework-for-stvaults/9978](https://research.lido.fi/t/risk-assessment-framework-for-stvaults/9978)
- **Lido V3 Whitepaper**: [hackmd.io/@lido/S1-r1Cdexl](https://hackmd.io/@lido/S1-r1Cdexl)
- **stVaults Design**: [hackmd.io/@lido/stVaults-design](https://hackmd.io/@lido/stVaults-design)

---

## 8. Getting Help

If you encounter issues or have questions about the verification process:

1. **GitHub Issues**: Open an issue in the relevant repository
2. **Discord**: Join the [Lido Discord](https://discord.gg/lido) `#dev` channel
3. **Research Forum**: Post on [research.lido.fi](https://research.lido.fi)

For security-related findings, please follow the [responsible disclosure process](https://docs.lido.fi/security/bugbounty) or contact security@lido.fi.
