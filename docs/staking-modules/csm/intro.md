# Intro

> Terms validator, key, validator key, and deposit data meanings are the same within the document

## ∑ TL;DR
Community Staking Module (CSM) is a permissionless staking module aimed at attracting community stakers to participate in Lido on Ethereum protocol as Node Operators. The only requirement to join CSM as a Node Operator is to be able to run validators and supply a bond. The stake is allocated to the validator keys in the order in which the keys are provided, given the keys are valid. The bond is not directly associated with the actual validator's stake but instead treated as a security collateral. The bond is a characteristic of a Node Operator; hence, it is collateral for all Node Operator's validators. This allows for the bond reduction. The more validators the Node Operator has, the less the bond for one validator. Node Operators get their rewards from the bond rebase and from the Node Operator's portion of the staking rewards. Node Operator's portion of the staking rewards is socialized (averaged) if the validators perform above the threshold. Accumulated CL penalties resulting in a balance reduction below the deposit balance and stolen EL rewards are confiscated from the Node Operator's bond. Node Operators should perform validator exits upon protocol request or can exit voluntarily.

## 📓 Glossary
- The **staking router** (SR) is a smart contract within the Lido on Ethereum protocol that facilitates stake allocation and rewards distribution across different modules;
- A **staking module** (SM) is a smart contract or a set of smart contracts connected to the staking router, which:
    - maintains the underlying operator and validator sets,
    - is responsible for on/off-boarding operators,
    - maintains validator deposits, withdrawals, and exits,
    - maintains fee structure and distribution for the module and participants, etc;
- A **bond** is ETH or stETH put out by a Node Operator as collateral for bad behavior or poor performance;
- The **Lido DAO** is a Decentralized Autonomous Organization that decides on the critical parameters of controlled liquid staking protocols through the voting power of governance token (LDO).
- A **Node Operator** (NO) is a person or entity that runs validators;
- `Lido` is a core contract of the Lido on Ethereum protocol that stores the protocol state, accepts user submissions, and includes the stETH token;
- **stETH** is an ERC-20 token minted by `Lido` and representing a share of the [`totalPooledEther`](https://docs.lido.fi/contracts/lido/#rebase);
- **Deposit data** refers to a structure consisting of the validator’s public key and deposit signature submitted to `DepositContract`. This term can also be referred to as `keys` in the text. Validator private keys are created, stored, and managed by Node Operators exclusively;
- `DepositContract` is the official contract for validator deposits;
- `DepositSecurityModule` or [**DSM**](https://docs.lido.fi/contracts/deposit-security-module) is a set of smart contract and off-chain parts mitigating the [vulnerability](https://docs.lido.fi/guides/deposit-security-manual#the-vulnerability);
- A validator is considered to be **“unbonded”** when the current Node Operator bond is not sufficient to cover this validator;
- A validator is considered to be ["**stuck**"](https://docs.lido.fi/contracts/staking-router#exited-and-stuck-validators) if it has not been exited timely following an exit signal from the protocol;
- The **Curated module** is the first Lido staking module previously referred to as [Node Operators Registry](https://docs.lido.fi/contracts/node-operators-registry);
- **EasyTrack** is a suite of smart contracts and an alternative veto-based voting model that streamlines routine DAO operations;
- **AccountingOracle** is a contract which collects information submitted by the off-chain oracles about state of the Lido-participating validators and their balances, the amount of funds accumulated on the protocol vaults (i.e., withdrawal and execution layer rewards vaults), the number of exited and stuck validators, the number of withdrawal requests the protocol can process and distributes node-operator rewards;

## 🌎 General info
CSM is a staking module offering permissionless entry with a bond. This module aims to become a clear pathway for independent [community stakers](https://research.lido.fi/t/lido-on-ethereum-community-validation-manifesto/3331#lido-on-ethereum-community-validation-manifesto-1) (solo stakers or home stakers) to enter the Lido on Ethereum protocol (LoE) node operator set. The bond requirement is an essential security and alignment tool that makes permissionless entry possible without compromising the security or reliability of the underlying staking protocol (LoE).

## 🤓 Module specifics
All staking modules should conform to the same [IStakingModule](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol) interface. That inevitably results in modules having a lot of common or similar components and logic. CSM is no exception here. For example, key storage components are based on the existing Curated module. However, several aspects are different and worth a separate mention.

### Exited and Withdrawn
The [Curated module](../../contracts/node-operators-registry.md) uses the "exited" statuses of the validator (both [Slashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#44-Step-4-Slashed-and-Exited) and [Unslashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#45-Step-5-Unslashed-and-Exited)) as the last meaningful status in accounting since, after this status, the validator is no longer responsible for any duties on the Beacon chain (except for the rare cases of the delayed sync committee participation). CSM, in turn, needs to know about each validator's exact withdrawal balance to decide on bond penalization. Hence, the module uses the "exited" counter reported by the accounting oracle only to return a correct number of "active" keys to the staking router and implements permissionless reporting methods to report the validator's withdrawal balance once the validator is in the [Withdrawable](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#46-Step-6-Withdrawable) status (actual reporting happens once validator is withdrawn).

### Stake distribution queue
A Node Operator must supply a bond to upload a new validator key to CSM. It is reasonable to allocate a stake in an order similar to the bond submission order. For this purpose, a FIFO (first in, first out) [stake allocation queue](join-csm.md) is utilized. Once the Staking Router requests keys to make a deposit, the next `X` keys from the queue are returned, preserving the bond submit order.

### Alternative measures for "stuck" keys
The presence of "stuck" keys for the Node Operator indicates the [Lido exit policy](https://docs.lido.fi/guides/node-operators/general-overview/#validator-exits-policy-penalties-and-recovering) violation. In this case, a module should apply measures for the policy-violating Node Operator. CSM uses measures that are different from those of the curated module. The measures are described in the corresponding [section](validator-exits.md).

### Node Operator structure
The Node Operator data structure in CSM is similar to that of the Curated module, with several minor differences:
- The `name` property is omitted as redundant for the permissionless module;
- The `rewardAddress` is used only as a recipient of rewards and excess bond claims;
- A new property, `managerAddress`, is introduced. The Node Operator should perform method calls from this address;
- A new property, `totalWithdrawnKeys`, is introduced to count the total count of the withdrawn keys per Node Operator;
- A new property, `depositableValidatorsCount`, is introduced to count the current deposit data eligible for deposits;
- A new property, `enqueuedCount`, is introduced to keep track of the unqueued keys;

## Further reading

- [Join CSM](join-csm.md)
- [Rewards](rewards.md)
- [Penalties](penalties.md)
- [Validator exits](validator-exits.md)
