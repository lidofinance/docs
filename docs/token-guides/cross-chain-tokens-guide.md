# Lido cross-chain tokens adoption guide

:::warning Disclaimer
This guide provides recommendations supplied by the [Network Expansion Committee (NEC)](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7cdf1af7cfeb472ae202c45fb6d7e952bb34bfcbc82113549986b2bc2d5f54c5). Following these recommendations increases the likelihood of recognition by the Committee, but does not guarantee it. Moreover, the Lido DAO vote, with a quorum established, can override any NEC decision at any time, even if it has already been implemented and released. Therefore, NEC makes no warranties, express or implied, and disclaims all implied warranties, including any warranty of the likelihood of the recognition or rejection by the Lido DAO.
:::

## TL;DR

If you are looking for a typical copy-paste solution, refer to the suitable subsection below if any fits your case.
Follow the [General Scenario Towards Recognition](#general-scenario-towards-the-recognition).

### Ethereum L2 built on OP-Stack, wstETH + stETH

Use [multichain-automaton](https://github.com/lidofinance/multichain-automaton) for automated deployment of the wstETH + stETH setup. This tool will automatically deploy the default wstETH + stETH setup, which satisfies the required [Recommendations](#recommendations).

Please follow recommendation R-9, which is specific to stETH bridging.

### Ethereum L2, wstETH

Deploy the wstETH setup from the [lido-l2](https://github.com/lidofinance/lido-l2) repository. This repository allows you to deploy the default wstETH setup on OP-Stack and Arbitrum networks. The setup satisfies the required [Recommendations](#recommendations).

If your stack requires a modification of the default setup, please consider examples of how it is done for:

- [zkSync Era](https://github.com/lidofinance/lido-l2/pull/62)
- [Scroll](https://github.com/scroll-tech/scroll/pull/988)
- [Mantle](https://github.com/lidofinance/lido-l2/pull/63)

For the governance forwarding setup, use the [Governance Bridge Executor](https://github.com/lidofinance/governance-crosschain-bridges) repository.

### alt-L1 network or L2 with non-native canonical ecosystem-wide bridges, wstETH

#### Bridge early without NEC endorsement

It is acceptable to start with a simpler opening transient bridging implementation while obtaining liquidity. In this case, recommendations R-1 to R-4 and "transient" recommendations R-5-transient and R-6-transient are **required** for the possibility of future endorsement.

While in transient state, it is already possible to receive all support from Lido contributors (and committees).

Getting endorsement from the NEC will require fulfilling recommendations from R-1 to R-8 (for example
[Wormhole x Axelar | Lido Bridge: Implementation for wstETH on BNB Chain](https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012/3)).
The NEC is working to provide a seamless solution for fulfilling those requirements instead of handling every expansion on the case by case basis. If you are in the transient state, please reach out to one of the NEC members for coordination.

The NEC endorsement is a requirement for listing on [Lido Multichain](https://lido.fi/lido-multichain).

## General scenario towards the recognition

This section describes an approximate path to bridging Lido tokens to a network. The order of the steps is not strict but follows the general flow.

🐾 Study the bridging guide, starting from the TL;DR section.

🐾 Fill in the [Architecture Checklist](#architecture-checklist) about your setup. Send it to the NEC. Get the deployment green light.

🐾 Deploy the contracts to testnet and/or mainnet. Follow the [Deployment and Verification Checklist](#deployment-and-verification-checklist).

🐾 Make a proposal on the forum, outlining the details and technical plan. Consider:

- Target one network per proposal to make the discussion more focused, the proposal should request recognition by NEC (not DAO as it was before).
- The post should be published in advance to allow time for discussion and verification of the proposal.
- If the proposed solution does not fulfill some of the recommendations, consider including the roadmap and committing to deliver it.
- Examples:
  - [wstETH to Base](https://research.lido.fi/t/wsteth-deployment-to-base-and-ownership-acceptance-by-lido-dao/5668)
  - [wstETH to ZKSync](https://research.lido.fi/t/wsteth-deployment-on-zksync/5701)
  - [wstETH to Scroll](https://research.lido.fi/t/wsteth-deployment-on-scroll/6603)
  - [wstETH and stETH to Soneium](https://research.lido.fi/t/steth-wsteth-deployment-on-soneium/9389/2)
  - [wstETH and stETH to Unichain](https://research.lido.fi/t/steth-wsteth-deployment-on-unichain/9553)
  - [wstETH to BSC by Wormhole x Axelar](https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012)

🐾 Get transient/pre-endorsement approval of the setup from the NEC.

:::info
It is fine to have the contracts in a pre-NEC-approved state in an unpaused state. Nevertheless, consider the risks of liquidity fragmentation in case the currently deployed setup is not approved or recognized, but liquidity has already been deposited.
:::

🐾 [Optional, if going from the transient state] Transition the setup to the pre-endorsement state according to the [Recommendations](#recommendations). Express this in the forum post and get NEC approval.

🐾 [If not done yet] Pass ownership of the bridging endpoints to the Lido DAO.

🐾 Get the setup final verification by an external security group (possibly with the help of the NEC).

🐾 Get the endorsement by the NEC expressed in the forum post.

:::warning
Ensure that the official bridging UI utilizes the customized bridge endpoint contract. Using the default bridge contract in the past caused problems, leading to deposited funds becoming locked within the contract.
:::

## Motivation of this guide

This document is intended for developers representing network/rollup foundations, bridge infrastructure providers, and DAOs looking to establish Lido tokens (wstETH, stETH) bridged representations outside the Ethereum Mainnet.

This guide covers the recommendations, provides general guidelines, and reveals the logic behind them to smooth the process. **It's essential to understand that conforming to or diverging from these guidelines won't ensure the recognition or rejection of a specific proposal by the Lido DAO, which can override any NEC decision at any time, even if it has already been implemented and released.** Nonetheless, adhering to these guidelines substantially increases the likelihood of gaining support from the Network Expansion Committee (NEC) and the community.

While technically feasible, bridging the wstETH/stETH token as any other standard non-upgradable ERC-20 compatible token might not align with the long-term vision of the Lido DAO, nor support the stETH rebasable nature, nor lay out the foundation for future cross-chain interoperability considerations.

:::info
Please note that bridging the rebasable stETH token in a regular way might cause a loss of user assets due to the rewards accrued being stuck on an L1 bridge. For non-OP Stack networks, consider wstETH to be the default way to go.
:::

To close the gaps, this guide proposes implementing a more complex solution.

The solution involves deploying dedicated bridge endpoint contracts behind a proxy on L1 and the target network, and an upgradable token on the target network, all governed by the Lido DAO on L1 ([Aragon Agent contract](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c)) via a dedicated governance executor contract on the target network. This architecture is proposed to provide the following capabilities:

1. Passing arbitrary data. For example, it allows delivering the wstETH/stETH rate to the target network or implementing any potential sophisticated interoperability-enabled messaging.
2. Revamping the token logic, as stETH is not a general-purpose token but an asset built on top of a living liquid-staking middleware.
3. Future-proofing the token, for example, to avoid high-cost liquidity migration as Ethereum continues evolving and new standards like [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612)/[ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) are adopted.
4. Pausing and resuming bridging in an emergency or during upgrades.

The wstETH and stETH tokens design follows the [LIP-22](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-22.md) architecture approach.

See the [lido-l2-with-steth](https://github.com/lidofinance/lido-l2-with-steth/) repository for more details.

## Recommendations

This section enumerates design and security recommendations for a Lido tokens bridging solution.

### R-1: Audited code and verifiable deployment

The entire on-chain codebase (rollup, bridge, token) must be audited by a third party. Please contact the NEC to check the temperature if the audit provider isn't familiar with the Lido protocol codebase (see the providers here: https://github.com/lidofinance/audits/).

The deployment must be verifiable:

- all code accessible and the final deployed smart contracts' commit **strictly** corresponds to the audit report;
- source code verified on the explorer;
- verifiable bytecode (e.g. via the explorer or RPC calls);
- correct levers setup.

For submitting sources for verification on explorer, please use standard JSON input - not flattened.

To speed up the process and make it more robust, please provide the artifacts (i.e., open Pull Requests) for the automated tools:

- verify the sources via [diffyscan](https://github.com/lidofinance/diffyscan), examples:
  - [wstETH on Scroll](https://github.com/lidofinance/diffyscan/pull/35)
  - [wstETH on Linea](https://github.com/lidofinance/diffyscan/pull/29)
  - [wstETH on Mode](https://github.com/lidofinance/diffyscan/pull/41)

- verify the configuration and storage state via [state-mate](https://github.com/lidofinance/state-mate), examples:
  - [wstETH on Mantle](https://github.com/lidofinance/state-mate/tree/main/configs/mantle)
  - [a.DI on Binance Smart Chain (BSC)](https://github.com/lidofinance/state-mate/tree/main/configs/bsc)

### R-2: "Lock and mint" bridge mechanics

Use the lock-and-mint bridging mechanism.

The general security approach here is to isolate L2/cross-chain risks, ensuring no additional risks are imposed on the Lido protocol on Ethereum or to other L2s and alt L1s with already bridged wstETH. This is almost unachievable with a 'burn-and-mint' architecture.

### R-3: L2 wstETH token upgradable

The bridged token contract should be deployed behind a proxy with the ability to set the proxy admin on a case-by-case basis (or even eventually ossify). This allows the token to be future-proof (support of new standards, passing additional data, etc.) and provides a foundation for potential stETH bridging without incurring liquidity fragmentation.

If a dedicated bridge endpoint contract is not deployed behind a proxy (R-4), it must provide the capability to set/change the bridge contract instance used.

### R-4: Dedicated upgradable bridge instances

Deploy dedicated instances of bridge contracts on L1 and L2. The contract instances should be deployed behind a proxy with the ability to set the proxy admin on a case-by-case basis (or even eventually ossify). This allows laying the foundation for the emergency capabilities (R-7) and for possible bridging of rebasable stETH. For more details on why, see the section [Motivation of this guide](#motivation-of-this-guide). For the architecture outline, see the section [Reference wstETH architecture and permissions setup](#reference-wsteth-rollup-architecture-and-permissions-setup).

### R-5: Robust token bridging provider

There are two main options:

1. Usage of the native bridge as a token bridging provider
2. 2/X aggregation of X bridge providers, where X >= 2, in case the native bridge is not available

As a reference implementation of aggregations consider
[Wormhole x Axelar | Lido Bridge: Implementation for wstETH on BNB Chain](https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012/3).
For the deployed addresses see [this](https://docs.lido.fi/deployed-contracts/#binance-smart-chain-bsc).

### R-5-transient: Pre robust token bridging provider

If the native bridge does not exist or a fast bridging implementation is required,
as a transient state it is possible to use 1 arbitrary bridge provider with a framework to add/change to a solution following R-5.

### R-6: Bridging L1 Lido DAO decisions

A dedicated governance executor contract should be set as an admin of the target network endpoint contracts.

Rollup examples:

- [`OptimismBridgeExecutor`](https://optimistic.etherscan.io/address/0xefa0db536d2c8089685630fafe88cf7805966fc3)
- [Bridge executor on Base](https://basescan.org/address/0x0E37599436974a25dDeEdF795C848d30Af46eaCF) - reused `OptimismBridgeExecutor` contract
- [`ZkSyncBridgeExecutor`](https://explorer.zksync.io/address/0x13f46b59067f064c634fb17e207ed203916dccc8#contract)
- [`LineaBridgeExecutor`](https://lineascan.build/address/0x74Be82F00CC867614803ffd7f36A2a4aF0405670)
- [`ScrollBridgeExecutor`](https://scrollscan.com/address/0x0c67D8D067E349669dfEAB132A7c03A90594eE09)

Non-rollup examples:

- [CrossChainExecutor](https://bscscan.com/address/0x8E5175D17f74d1D512de59b2f5d5A5d8177A123d) from a.DI (see R-6)

[a.DI (Aave Delivery Infrastructure)](https://github.com/lidofinance/aave-delivery-infrastructure). It was used to bridge governance to Binance Smart Chain (BSC).
See forum post [Wormhole x Axelar | Lido Bridge: Implementation for wstETH on BNB Chain](https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012/3) for more details.

For more rollup examples, see Governance Bridge Executors at https://docs.lido.fi/deployed-contracts/#lido-multichain. The contracts originate from [Aave Governance Cross-Chain Bridges](https://github.com/aave/governance-crosschain-bridges) and can be found at https://github.com/lidofinance/governance-crosschain-bridges and [PRs](https://github.com/lidofinance/governance-crosschain-bridges/pulls).

### R-6-transient: Pre bridging L1 Lido DAO decisions

For the transient state, one of the following options is applicable:

- the bridging provider used can upgrade the bridge endpoint contract and wstETH token
- the target network onchain representative can upgrade the bridge endpoint contract and wstETH token

There must be a capability to transition to the R-6 state.

### R-7: Pausable deposits and withdrawals

To provide the capability to react fast and reduce losses in case of a security contingency, depositing and withdrawing should be pausable. Namely:

- L1 bridge endpoint has pausable and resumable deposits;
- L2 bridge endpoint has pausable and resumable withdrawals.

The bridge endpoint contracts should have the ability to set the resume and pause roles holders on a case-by-case basis. For the pause role, there should be at least two holders possible to be able to assign the dedicated Emergency Multisig which is [ratified by the Lido DAO](https://snapshot.org/#/lido-snapshot.eth/proposal/0xfe2a6a6506a642b616118363bc29aa83dd9ef2ec80447bb607a8f52c0a96aed0) as the second role holder.

To curb the multisig's power, it is proposed to use the "Gate Seals" mechanic. The mechanic limits the pause duration and restricts the capability to pause to a single use. To grant the capability repeatedly, the Lido DAO vote is required. The mechanic has been implemented, e.g., for withdrawals in the Lido protocol on Ethereum in two parts:
- one-time disposable pauser contact [Gate Seals](https://github.com/lidofinance/gate-seals);
- [PausableUntil](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/utils/PausableUntil.sol) contract (inherited by [WithdrawalQueue](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/WithdrawalQueue.sol)).

### R-8: The contracts state

There are three contract states to consider: transient, pre-endorsement, and endorsement.

The transient state is applicable for the transient setup when not all the minimal recommendations are followed yet.
This state is mostly referred to [alt-L1 network or L2 with non-native canonical ecosystem-wide bridges, wstETH](#alt-l1-network-or-l2-with-non-native-canonical-ecosystem-wide-bridges-wsteth).

The pre-endorsement state is applicable for the setup when all the minimal recommendations are followed
possibly except for the bridging endpoint ownership passed to the Lido DAO.
This state is aimed for the pre-endorsement evaluation of the setup by the NEC.

The endorsement state is the state ready for the final NEC and external security assessment and subsequent recognition.

For example, in the endorsement state of the reference wstETH setup from
[lido-l2](https://github.com/lidofinance/lido-l2) repository, the permissions must be set as per
[Reference wstETH rollup architecture and permissions setup](#reference-wsteth-rollup-architecture-and-permissions-setup).

In the transient or pre-endorsement state, the owners of the endpoint contracts might be set to the representatives of the target network / bridging provider, to allow for amending the setup in case of any issues.

### R-9: stETH rate pushing

_Applicable only for the setup with stETH token._

The correct rate of the rebasable stETH token on the target network depends
on the timely rate update provided for the contract TokenRateOracle (see [example of it on Optimism](https://optimistic.etherscan.io/address/0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0)).

Token rate update happens when:

1. wstETH or stETH is bridged in a regular way;
2. `pushTokenRate` of L1 contract `OpStackTokenRatePusher` is called (see [example on Optimism](https://etherscan.io/address/0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE#writeContract#F1)).

The tokens might not get bridged by users for periods of time, that is why a mechanism to call `pushTokenRate` timely is required.
It should be called either periodically or occasionally when the rate is not updated for some time.
Which option to choose is up to the user of this guide.
The goal is not to let the rate get outdated for longer than 2 days.
The last updated timestamp is retrievable from the `TokenRateOracle` contract by call of `latestRoundData` function (see field `updatedAt_`).

### R-10: No same contract addresses

Please avoid deploying contracts to the same addresses on L1 and L2 and/or testnets, as this might occur when deploying from a single EOA to multiple networks. Following this recommendation helps to avoid potential confusion in the future.

### R-11: Support of ERC-2612 permit enhanced with EIP-1271

The bridged wstETH should support [EIP-2612 permit ERC-20 token extension](https://eips.ethereum.org/EIPS/eip-2612) with [EIP-1271 standard signature validation method for contracts](https://eip1271.io/). The latter paves the way to Account Abstraction adoption, see https://eip1271.io/.

Please take into account that the [OpenZeppelin ERC20 with permit (EIP-2612) implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Permit.sol) does not support smart contract signatures validation EIP-1271 and thus shouldn't be used as it is. Please consider extending ERC20Permit using [OpenZeppelin SignatureChecker util](https://docs.openzeppelin.com/contracts/4.x/api/utils#SignatureChecker) or [stETHPermit contract](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/StETHPermit.sol) as a reference implementation. NB, that the wstETH token itself on Ethereum doesn't support this due to non-upgradability.

### R-12: Upgradability mechanics

- The regular (`ERC1967Proxy`) proxy pattern is good enough; the transparent proxy pattern might be an unnecessary complication.
- Use ossifiable proxies when possible. For example, consider [OssifiableProxy](https://github.com/lidofinance/lido-l2/blob/main/contracts/proxy/OssifiableProxy.sol), which is used in the Lido protocol on Ethereum.

Please have the implementations petrified with dummy values. It helps to reduce confusion, like taking the implementation address instead of the proxy address. For example, see [zkSync Era ERC20BridgedUpgradeable implementation](https://explorer.zksync.io/address/0xc7a0daa1b8fea68532b6425d0e156088b0d2ab2c#contract) (bridge, decimals, name, symbol views).

### R-13: Use AccessControlEnumerable for ACL

For access control, please prefer the standard OpenZeppelin ACL contract and its [enumerable version](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlEnumerable) over non-enumerable versions. It allows full on-chain permissions verification — no need to analyze events or transactions as in non-enumerable implementations. For example, see [Lido ValidatorsExitBusOracle contract](https://etherscan.io/address/0xa89ea51fdde660f67d1850e03c9c9862d33bc42c#code).

## Questionnaire

### Deployment and verification checklist

- [ ] Audited by a third party (see R-1)
- [ ] Deployed code matches the commit in the audit report precisely (see R-1)
- [ ] Sources verified on block explorers without flattening (see R-1)
- [ ] PR with config for Diffyscan (see R-1)
- [ ] PR with config for StateMate (see R-1)
- [ ] Correct contracts state before endorsement (see R-8)
- [ ] Official bridging UI utilizes the customized bridge endpoint contract (see warning in [General scenario](#general-scenario-towards-the-recognition))

### Architecture checklist

If non-reference architecture is used
nor [Ethereum L2 built on OP-Stack, wstETH + stETH](#ethereum-l2-built-on-op-stack-wsteth--steth),
nor [Ethereum L2, wstETH](#ethereum-l2-wsteth))
please fill out the list, providing the details if needed.

- [ ] Lock and mint bridge mechanics (see R-2)
- [ ] Robust bridging provider (one of) (see R-5)
  - [ ] Canonical bridge
  - [ ] Aggregation 2/X
  - [ ] 1 bridge provider with framework to add/change at least 2
- [ ] Dedicated governance contract on target network for bridging L1 Lido DAO decisions (see R-6)
- [ ] Governance bridging (one of) (see R-6)
  - [ ] Canonical bridge
  - [ ] Aggregation with a.DI with 2/2, 3/4 or 3/5
- [ ] Dedicated upgradable L1 bridge instance (see R-4)
- [ ] Dedicated upgradable target network bridge instance (see R-4)
- [ ] L2 wstETH token upgradable (see R-3)
- [ ] Pausable deposits (see R-7)
- [ ] Pausable withdrawals (see R-7)
- [ ] Support of ERC-2612 permit enhanced with EIP-1271 (see R-11)
- [ ] (if applicable) stETH rate is pushed timely (see R-9). Please provide the implementation details.
- [ ] No same contract addresses (see R-10)
- [ ] AccessControlEnumerable is used for ACL (see R-13)

## Reference wstETH rollup architecture and permissions setup

This section describes a kind of minimal bridging contracts setup and its configuration. This setup is a recommendation and might not be the best for a specific network — it serves as a suggestion for the main functional parts and their interconnections.

Notation used:

- `Lido Agent` - Lido DAO [Aragon Agent](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c) on L1;
- `Emergency Brakes L1 Multisig` - Emergency Multisig on L1 (ratified by the Lido DAO). See https://research.lido.fi/t/emergency-brakes-signer-rotation/5286;
- `Emergency Brakes L2 Multisig` - Emergency Multisig on L2 (the same participants but using the L2 Safe instance).

**L1 Custom Bridge Endpoint**
- Upgradeable
	- Proxy admin is `Lido Agent`
- Admin is `Lido Agent`
- Deposits pausable by
	- `Lido Agent`
	- `Emergency Brakes Multisig`
- Deposits resumable by
	- `Lido Agent`
- Withdrawals pausable by
	- `Lido Agent`
	- `Emergency Brakes Multisig`
- Withdrawals resumable by
	- `Lido Agent`

**L2 Governance Executor**

- The only allow-listed L1 execution sender is `Lido Agent`

**L2 Custom Bridge Endpoint**
- Upgradeable
	- Proxy admin is `L2 Governance Executor`
- Admin is `L2 Governance Executor`
- Deposits pausable by
	- `L2 Governance Executor`
	- `Emergency Brakes Multisig`
- Deposits resumable by
	- `L2 Governance Executor`
- Withdrawals pausable by
	- `L2 Governance Executor`
	- `Emergency Brakes Multisig`
- Withdrawals resumable by
	- `L2 Governance Executor`

**L2 Token Bridged**
- Upgradeable
	- Proxy admin is `L2 Governance Executor`
- Mint is allowed only by `L2 Custom Bridge`
- Optionally applicable (if `L2 Custom Bridge` doesn't support these)
  - Admin is `L2 Governance Executor`
  - Withdrawals pausable by
      - `L2 Governance Executor`
      - `Emergency Brakes Multisig`
  - Withdrawals resumable by
      - `L2 Governance Executor`
  - Deposits pausable by
      - `L2 Governance Executor`
      - `Emergency Brakes Multisig`
  - Deposits resumable by
      - `L2 Governance Executor`

### Mainnet proposed configuration

- `wstETH` - the wstETH token on L1
	- `0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0`
- `Lido Agent` - Lido DAO Aragon Agent
	- `0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`
- `Emergency Brakes L1 Multisig`
	- `0x73b047fe6337183A454c5217241D780a932777bD`
- `Emergency Brakes L2 Multisig`
	- ask the NEC for the address (the deployed Safe instance would be needed)

### Testnet Holesky proposed configuration

:::info
Please, deploy to Holešky if possible because it has better long-term exposure and more robust Lido protocol deployment.
:::

- `wstETH` - the wstETH token on L1
	- `0x8d09a4502Cc8Cf1547aD300E066060D043f6982D`
- `Lido Agent` - Lido DAO Aragon Agent
	- `0xE92329EC7ddB11D25e25b3c21eeBf11f15eB325d`
- `Emergency Brakes L1 Multisig`
	- `0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1` (EOA)
- `Emergency Brakes L2 Multisig`
	- `0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1` (EOA)

### Testnet Sepolia proposed configuration

- `wstETH` - the wstETH token on L1
	- `0xB82381A3fBD3FaFA77B3a7bE693342618240067b`
- `Lido Agent` - Lido DAO Aragon Agent
	- `0x32A0E5828B62AAb932362a4816ae03b860b65e83`
- `Emergency Brakes L1 Multisig`
	- `0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1` (EOA)
- `Emergency Brakes L2 Multisig`
	- `0xa5F1d7D49F581136Cf6e58B32cBE9a2039C48bA1` (EOA)

### Other questions

1. Bridges are complicated in that the transaction can succeed on one side and fail on the other. What's the handling mechanism for this issue

## FAQ

### What is the bridging endpoints recognition?

Previously, the Lido DAO recognized the bridging endpoints by means of a signalling snapshot. For example, it happened for
[Base](https://snapshot.org/#/lido-snapshot.eth/proposal/0x8b35f64fffe67f67d4aeb2de2f3351404c54cd75a08277c035fa77065b6792f4).
Now, after establishing the [NEC](https://snapshot.org/#/s:lido-snapshot.eth/proposal/0x7cdf1af7cfeb472ae202c45fb6d7e952bb34bfcbc82113549986b2bc2d5f54c5), the bridged endpoints get recognized by NEC decision (yet Lido DAO has the overruling power).

If the bridged token endpoints are recognized, in general, it means:

- the integration is highlighted on the frontend pages: [landing](https://lido.fi/lido-multichain), [widget](https://stake.lido.fi/), and [ecosystem pages](https://lido.fi/lido-ecosystem);
- the newly appeared integration announcement is published in the Lido's [blog](https://blog.lido.fi/category/l2/) and [twitter](https://twitter.com/LidoFinance);
- the endpoint contracts get monitored by means of [Lido alerting system](https://github.com/lidofinance/alerting-forta/);
- the opportunity for obtaining extra support, potentially from [LEGO](https://lido.fi/lego) or [Liquidity observation Labs](https://lido.fi/governance#liquidity-observation-labs), becomes available. For the details one should [reach out to ProRel](https://tally.so/r/waeRLX).
- the endpoint contracts are under the Lido's [bug bounty program](https://immunefi.com/bug-bounty/lido/);
- when/if the dedicated bridging Lido UI is implemented, the network will be included;

### Our network is Y-compatible, how about reusing the solution present on Y?

Yes, sure. For example, [OptimismBridgeExecutor](https://github.com/lidofinance/governance-crosschain-bridges/blob/master/contracts/bridges/OptimismBridgeExecutor.sol) has been [reused](https://basescan.org/address/0x0E37599436974a25dDeEdF795C848d30Af46eaCF#code) on Base network.
If so, please don't alter the contract's code and use the same names. It allows to keep the audit valid and track origins.

To speed up the process, you might perform a deployment verification against the bytecode already used for another network and configuration/storage state comparison to be 1:1 except only for the network specific configuration changes needed.
Follow the case of [`wstETH on Mode`](https://research.lido.fi/t/wsteth-deployment-on-mode/7365) for the reference.

### What if wstETH is already bridged?

Here is a rough decision tree to guide you through this scenario:

```mermaid
graph TD;
  A("Is wstETH already bridged and has got adoption?")
  B("Is the bridged token deployed behind a proxy (follows R-4)?")
  C("Follow the general scenario <br> towards DAO recognition")
  D("Consider migrating liquidity and redeploying, <br> following the general scenario towards <br> DAO recognition")
  F["Consider delivering and/or committing <br> to deliver the missing parts.<br>Contact NEC for the best way forward"]

  A-- Yes -->B
  B-- Yes -->F
  A-- No -->C
  B-- No -->D
```



## References

- Deployed contracts addresses https://docs.lido.fi/deployed-contracts/#lido-multichain
- LOL (Liquidity Observation Labs) https://research.lido.fi/t/liquidity-observation-lab-lol-liquidity-strategy-and-application-to-curve-steth-eth-pool/5335
- Lido L2 reference bridging contracts (Arbitrum and Optimism) https://github.com/lidofinance/lido-l2
- Unofficial guidelines (like the 1st iteration of the guide) https://research.lido.fi/t/unofficial-guidelines-for-bridging-solutions-network-expansion-workgroup/5790
- Lido emergency multisig https://research.lido.fi/t/emergency-brakes-signer-rotation/5286
- Lido DAO recognition proposal for wstETH on Base https://research.lido.fi/t/wsteth-deployment-to-base-and-ownership-acceptance-by-lido-dao/5668
- Lido DAO recognition proposal for wstETH on zkSync Era https://research.lido.fi/t/wsteth-deployment-on-zksync/5701
- Lido DAO recognition proposal for wstETH on Mantle https://research.lido.fi/t/wsteth-deployment-on-mantle/5991
- Lido DAO recognition proposal for wstETH on Linea https://research.lido.fi/t/wsteth-on-linea-ownership-acceptance-by-lido-dao/5961
- Lido DAO recognition proposal for wstETH on Scroll https://research.lido.fi/t/wsteth-deployment-on-scroll/6603
- Lido DAO recognition proposal for wstETH on Mode https://research.lido.fi/t/wsteth-deployment-on-mode/7365
- Wormhole x Axelar | Lido Bridge: Implementation for wstETH on BNB Chain https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012/3
