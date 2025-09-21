# Intro

:::tip
If you're looking for a practical guide to run CSM on your setup, please follow the CSM guide [here](/run-on-lido/csm/).
:::
:::info
Terms `validator`, `key`, `validator key`, and `deposit data` have the same meaning within the document.
:::

## ∑ TL;DR
Community Staking Module (CSM) is a permissionless staking module aimed at attracting community stakers to participate in Lido on Ethereum protocol as Node Operators. The only requirement to join CSM as a Node Operator is to be able to run validators (according to the Lido on Ethereum Standard Node Operator Protocols, aka SNOPs) and supply a [bond](./join-csm#bond). The stake is allocated to the validator keys in the order in which the keys are provided and with respect to the queue [priority](join-csm.md#priority-queues), given that the keys are valid. The [bond](./join-csm#bond) is not directly associated with the actual validator's stake but instead treated as security collateral. The [bond](./join-csm#bond) is a characteristic of a Node Operator; hence, it is collateral for all Node Operator's validators. This allows for the variable [bond](./join-csm#bond) amounts required for the validators, depending on their index in the Node Operator's keys storage. Typically, the rule is: the more validators the Node Operator has, the less the [bond](./join-csm#bond) for one validator. Node Operators get their rewards from the [bond](./join-csm#bond) rebase and from the [Node Operator's portion](./rewards.md) of the staking rewards. Node Operator's portion of the staking rewards is socialized (averaged) if the validators perform above the [threshold](./rewards.md#performance-oracle). Accumulated CL penalties resulting in a balance reduction below the deposit balance and stolen EL rewards are confiscated from the Node Operator's [bond](./join-csm#bond). Node Operators should perform validator exits upon protocol request to avoid force ejection (via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)). Also, Node Operators can voluntarily exit or eject (via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)) their validators.

## 📓 Glossary
- The [**staking router**](/contracts/staking-router.md) (SR) is a smart contract within the Lido on Ethereum protocol that facilitates stake allocation and rewards distribution across different modules;
- A **staking module** (SM) is a smart contract or a set of smart contracts connected to the staking router, which:
    - maintains the underlying operator and validator sets,
    - is responsible for on/off-boarding operators,
    - maintains validator deposits, withdrawals, and exits,
    - maintains fee structure and distribution for the module and participants, etc,
    - conforms to the IStakingModule interface;
- **[Bond](./join-csm#bond)** - a security collateral that Node Operators must submit before uploading validator keys into CSM. This collateral covers possible losses caused by inappropriate actions on the Node Operator's side. Once the validator exits from the Beacon chain and all losses that occurred are covered, the collateral can be claimed or reused to upload new validator keys.
- The **Lido DAO** is a Decentralized Autonomous Organization that decides on the critical parameters of controlled liquid staking protocols through the voting power of governance token (LDO).
- A **Node Operator** (NO) is a person or entity that runs validators;
- [`Lido`](/contracts/lido.md) is a core contract of the Lido on Ethereum protocol that stores the protocol state, accepts user submissions, and includes the stETH token;
- **stETH** is an ERC-20 token minted by [`Lido`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) smart contract and representing a share of the [`totalPooledEther`](/contracts/lido.md#rebase);
- **Deposit data** refers to a structure consisting of the validator’s public key and deposit signature submitted to `DepositContract`. This term can also be referred to as `keys` in the text. Validator private keys are created, stored, and managed by Node Operators exclusively;
- `DepositContract` is the official Ethereum deposit contract for validator deposits;
- `DepositSecurityModule` or [**DSM**](/guides/deposit-security-manual.md) is a set of smart contract and off-chain parts mitigating the [deposit front-run vulnerability](/guides/deposit-security-manual.md#the-vulnerability);
- A validator is considered to be [**“unbonded”**](/staking-modules/csm/join-csm.md#unbonded-validators) when the current Node Operator [bond](./join-csm#bond) is not sufficient to cover this validator;
- The **Curated module** is the first Lido staking module previously referred to as [Node Operators Registry](/contracts/node-operators-registry);
- **Easy Track** is a suite of smart contracts and an alternative veto-based voting model that streamlines routine DAO operations;
- [**Accounting Oracle**](/contracts/accounting-oracle.md) is a contract which collects information submitted by the off-chain oracles about state of the Lido-participating validators and their balances, the amount of funds accumulated on the protocol vaults (i.e., withdrawal and execution layer rewards vaults), the number of exited validators, the number of withdrawal requests the protocol can process and distributes node-operator rewards and performs `stETH` token rebase;
- [**VEBO**](/contracts/validators-exit-bus-oracle.md) or Validators Exit Bus Oracle is a contract that implements an on-chain "source of truth" message bus between the protocol's off-chain oracle and off-chain observers, with the main goal of delivering validator exit requests to the Lido-participating Node Operators.

## 🌎 General info
CSM is a staking module offering permissionless entry with a [bond](./join-csm#bond). This module provides a clear pathway for independent [community stakers](https://research.lido.fi/t/lido-on-ethereum-community-validation-manifesto/3331#lido-on-ethereum-community-validation-manifesto-1) (solo or home stakers) to enter the Lido on Ethereum protocol (LoE) node operator set. The [bond](./join-csm#bond) requirement is an essential security and alignment tool that makes permissionless entry possible without compromising the security or reliability of the underlying staking protocol (LoE).

## 🤓 Module specifics
All staking modules should conform to the same [IStakingModule](https://github.com/lidofinance/core/blob/aada42242e893ea2726e629c135cd375d30575fc/contracts/0.8.9/interfaces/IStakingModule.sol) interface. That inevitably results in modules having a lot of common or similar components and logic. CSM is no exception here. For example, key storage components are based on the existing [Curated module](/contracts/node-operators-registry.md). However, several aspects are different and worth a separate mention.

### Exited and Withdrawn
The [Curated module](/contracts/node-operators-registry.md) uses the "exited" statuses of the validator (both [Slashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#44-Step-4-Slashed-and-Exited) and [Unslashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#45-Step-5-Unslashed-and-Exited)) as the last meaningful status in accounting since, after this status, the validator is no longer responsible for any duties on the Beacon chain (except for the rare cases of the delayed sync committee participation). CSM, in turn, needs to know about each validator's exact withdrawal balance to decide on [bond](./join-csm#bond) penalization. Hence, the module uses the "exited" counter reported by the accounting oracle only to return a correct number of "active" keys to the staking router and implements permissionless reporting methods to report the validator's withdrawal balance once the validator is [withdrawn](https://consensys.io/shanghai-capella-upgrade#:~:text=Finally%2C%20the%20withdrawable%20validator%20is%20subject%20to%20the%20same%2C%20automated%20%E2%80%9Csweep%E2%80%9D%20that%20processes%20partial%20withdrawals%2C%20and%20its%20balance%20is%20withdrawn).

### Stake distribution queue
A Node Operator must supply a [bond](./join-csm#bond) to upload a new validator key to CSM. It is reasonable to allocate a stake in an order similar to the [bond](./join-csm#bond) submission order. For this purpose, a FIFO (first in, first out) [stake allocation queue](/staking-modules/csm/join-csm.md#stake-allocation-queue) is utilized. Once the Staking Router requests keys to make a deposit, the next `X` keys from the queue are returned, preserving the [bond](./join-csm#bond) submission order. CSM v2 features a [priority queues](/staking-modules/csm/join-csm.md#priority-queue) that allow certain Node Operator types to get a limited amount of seats in the priority queue. Priority queues are separate from the default one and are used to determine the order of keys in the stake allocation queue.

### Node Operator structure
The Node Operator data structure in CSM is similar to that of the [Curated module](/contracts/node-operators-registry.md), with several minor differences:
- The `name` property is omitted as redundant for the permissionless module;
- The `rewardAddress` is used as a recipient of rewards and excess [bond](./join-csm#bond) claims;
- A new property, `managerAddress`, is introduced. The Node Operator should perform method calls from this address;
- A new property, `extendedManagerPermissions`, is introduced. This option indicates whether the Node Operator's `managerAddress` has extended permissions to perform certain actions, such as changing the Node Operator's `rewardAddress`. This is useful for Node Operators utilizing a smart contract as a `rewardAddress`;
- A new property, `totalWithdrawnKeys`, is introduced to count the total number of the withdrawn keys per Node Operator;
- A new property, `depositableValidatorsCount`, is introduced to count the current deposit data eligible for deposits;
- A new property, `enqueuedCount`, is introduced to keep track of the depositable keys that are in the queue. Also useful to determine depositable keys that are not in the queue at the moment;
