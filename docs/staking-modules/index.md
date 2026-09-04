# Staking Modules

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

Lido on Ethereum runs three staking modules based on the [CSM v3 codebase](https://github.com/lidofinance/staking-modules). This section describes their mechanics and contracts.

## ∑ TL;DR {#tldr}

All three modules require a Node Operator to run validators according to the Lido on Ethereum [Standard Node Operator Protocols](https://github.com/lidofinance/documents-and-policies) (SNOPs) and to supply a [bond](/staking-modules/node-operators#bond).

The bond is not directly associated with the actual validator's stake but instead treated as security collateral, and it is what makes permissionless entry possible without compromising the security of the underlying protocol. The bond is a characteristic of a Node Operator; hence, it is collateral for all of that operator's validators, and the amount required for each key follows a curve set by the operator's type.

Node Operators get their rewards from the bond rebase and from their [portion of the staking rewards](/staking-modules/rewards). Accumulated CL penalties resulting in a balance reduction below the deposit balance and stolen EL rewards are confiscated from the bond. Node Operators should perform validator exits upon protocol request to avoid force ejection (via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)), and can also voluntarily [exit or eject](/staking-modules/validator-exits) their validators.

## 🧩 The modules {#the-modules}

**Curated Module v2 (CMv2)** serves a curated operator set. An eligible address joins through the gate for its assigned operator type, and the Curated Module Committee then assigns it to an operator group, which determines how much stake the operator receives.

The **[Community Staking Module (CSM)](https://lido.fi/csm)** offers permissionless entry, giving independent community stakers a pathway into the Lido on Ethereum node operator set. It is deployed as two separate modules, one serving `0x01` validators and one serving `0x02` validators.

| Module | Entry | Credentials | Stake allocation | Availability |
| --- | --- | --- | --- | --- |
| **CMv2** | Curated | `0x02` | Weighted allocation by operator group | Phase 1 live on Mainnet |
| **0x01 CSM** | Permissionless | `0x01` | FIFO queue with priority seats | Live on Mainnet |
| **0x02 CSM** | Permissionless | `0x02` | Initial `32 ETH` through the FIFO queue, then a dedicated top-up queue | Live on the Hoodi testnet |

## 📓 Glossary {#glossary}
- The [**staking router**](/contracts/staking-router) (SR) is a smart contract within the Lido on Ethereum protocol that facilitates stake allocation and rewards distribution across different modules;
- A **staking module** (SM) is a smart contract or a set of smart contracts connected to the staking router, which:
    - maintains the underlying operator and validator sets,
    - is responsible for on/off-boarding operators,
    - maintains validator deposits, withdrawals, and exits,
    - maintains fee structure and distribution for the module and participants, etc,
    - conforms to the [`IStakingModule`](https://github.com/lidofinance/core/blob/af095e48bbc1c3841c2c9936219c8461af01056b/contracts/common/interfaces/IStakingModule.sol) and optionally to [`IStakingModuleV2`](https://github.com/lidofinance/core/blob/af095e48bbc1c3841c2c9936219c8461af01056b/contracts/common/interfaces/IStakingModuleV2.sol) interfaces;
- **[Bond](/staking-modules/node-operators#bond)** - a security collateral that Node Operators must submit before uploading validator keys into the module. This collateral covers possible losses caused by inappropriate actions on the Node Operator's side. Once the validator exits from the Beacon chain and all losses that occurred are covered, the collateral can be claimed or reused to upload new validator keys.
- The **Lido DAO** is a Decentralized Autonomous Organization that decides on the critical parameters of controlled liquid staking protocols through the voting power of governance token (LDO).
- A **Node Operator** (NO) is a person or entity that runs validators;
- [`Lido`](/contracts/lido) is a core contract of the Lido on Ethereum protocol that stores the protocol state, accepts user submissions, and includes the stETH token;
- **stETH** is an ERC-20 token minted by [`Lido`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) smart contract and representing a share of the [`totalPooledEther`](/contracts/lido#rebase);
- **Deposit data** refers to a structure consisting of the validator's public key and deposit signature submitted to `DepositContract`. This term can also be referred to as `keys` in the text. Validator private keys are created, stored, and managed by Node Operators exclusively;
- `DepositContract` is the official Ethereum deposit contract for validator deposits;
- `DepositSecurityModule` or [**DSM**](/guides/deposit-security-manual) is a set of smart contract and off-chain parts mitigating the [deposit front-run vulnerability](/guides/deposit-security-manual#the-vulnerability);
- A validator is considered to be [**"unbonded"**](/staking-modules/node-operators#unbonded-validators) when the current Node Operator [bond](/staking-modules/node-operators#bond) is not sufficient to cover this validator;
- The **Curated module** is the first Lido staking module previously referred to as [Node Operators Registry](/contracts/node-operators-registry);
- **Easy Track** is a suite of smart contracts and an alternative veto-based voting model that streamlines routine DAO operations;
- [**Accounting Oracle**](/contracts/accounting-oracle) is a contract which collects information submitted by the off-chain oracles about state of the Lido-participating validators and their balances, the amount of funds accumulated on the protocol vaults (i.e., withdrawal and execution layer rewards vaults), the number of exited validators, the number of withdrawal requests the protocol can process and distributes node-operator rewards and performs `stETH` token rebase;
- [**VEBO**](/contracts/validators-exit-bus-oracle) or Validators Exit Bus Oracle is a contract that implements an on-chain "source of truth" message bus between the protocol's off-chain oracle and off-chain observers, with the main goal of delivering validator exit requests to the Lido-participating Node Operators.

## 🤓 Module specifics {#module-specifics}

All staking modules conform to the same [`IStakingModule`](https://github.com/lidofinance/core/blob/af095e48bbc1c3841c2c9936219c8461af01056b/contracts/common/interfaces/IStakingModule.sol) interface, so they share a lot of logic with the legacy [Curated module](/contracts/node-operators-registry), including its key storage components. These are the parts that work differently, and where each one is documented.

- **Bond, keys and stake allocation.** CMv2 allocates stake by operator weight, aiming to keep each operator close to its target share, whereas CSM serves keys from a FIFO queue in which some operator types hold priority seats. Wherever `0x02` credentials are used, validators are funded in two phases, starting with an initial `32 ETH` deposit and then topped up towards `2048 ETH`. See [Node Operators](/staking-modules/node-operators).
- **Node Operator structure.** These modules introduce a separate `managerAddress` alongside the `rewardAddress`, plus properties to track withdrawn, depositable and enqueued keys. See [Node Operators](/staking-modules/node-operators#node-operator-structure).
- **Rewards.** Node Operator rewards are allocated by a Performance Oracle over per-module frames (14 days in CMv2 and 28 days in CSM) and published in a cumulative Merkle tree, on top of the bond rebase. See [Rewards](/staking-modules/rewards).
- **Exits, withdrawals and balance tracking.** These modules need each validator's exact withdrawal balance to decide on bond penalization, so they track a confirmed balance per key and accept permissionless withdrawal reports. See [Validator exits](/staking-modules/validator-exits).
- **Permissions.** Node Operator, committee and DAO governance permissions, including which roles are assigned to whom in each deployment. See [Permissions](/staking-modules/permissions).
