# Public Risk Disclosure (PRD)

**Last updated:** 20 February 2026

This Public Risk Disclosure (“PRD”) is published and maintained to provide users, integrators, and stakeholders with a consolidated overview of key risks associated with the Lido protocol and liquid staking tokens. Where this PRD refers to actions or outcomes (e.g., “Lido protocol uses…”, “assets may be…”), such statements describe how the protocol is programmed to function and what may occur when users and other participants interact with it. The Lido protocol is decentralized infrastructure and does not have independent agency.

This document is intended to support transparency and informed decision-making. It does **not** constitute investment advice, financial advice, legal advice, or tax advice.

## 1\. Regulatory and Legal Risks

### 1.1 Regulatory Variability & Uncertainty

The legal and regulatory treatment of digital assets, staking, liquid staking, and derivative or representative tokens varies significantly by jurisdiction and is evolving. Activities involving Lido may be restricted, require licensing, or be subject to regulatory enforcement in certain jurisdictions.

Users and integrators are solely responsible for determining whether their use of the Lido protocol and related tools complies with applicable laws, regulations, and regulatory guidance.

### 1.2 No Regulatory Approval

The Lido protocol and related liquid staking tokens (including stETH and wstETH) do not benefit from any general, protocol-level regulatory approval, authorization, or endorsement by governmental or regulatory authorities. Regulatory treatment of protocols, tokens, and activities involving liquid staking varies by jurisdiction and use case, and may change over time.

Users should not assume that the Lido protocol or related liquid staking tokens are approved, licensed, or supervised for any particular purpose in any jurisdiction, and are responsible for assessing applicable legal and regulatory requirements. 

## 2\. No Investment, Legal, or Tax Advice

All information provided by the Foundation, including documentation, interfaces, and this PRD, is for informational purposes only. Nothing herein constitutes: 

* investment or financial advice;   
* legal advice;   
* tax or accounting advice; or   
* a recommendation to buy, sell, or hold any digital asset.

Users should seek independent professional advice before engaging in staking or liquid staking activities.

## 3\. Rewards, APR, and APY Risks

### 3.1 Indicative and Variable Returns

Any displayed APR or APY figures are estimates based on historical data and current network conditions. They are **not guaranteed** and may fluctuate due to factors including validator performance, network conditions, protocol changes, slashing events, and fees.

Any displayed APR or APY figures are estimates based on historical data, current network conditions, and prevailing market conditions. They are not guaranteed and may fluctuate due to factors including validator performance, network and market conditions, protocol changes, slashing events, fees, and vault-specific dynamics.

### 3.2 No Guarantee of Rewards; Risk of Loss

Staking rewards are variable and may be lower than expected or zero. In addition, users may experience losses, including loss of staked assets or loss of value of liquid staking tokens under extreme network slashing or penalties conditions on Ethereum network involving Lido-participating validators 

## 4\. Protocol and Smart Contract Risks

### 4.1 Smart Contract Vulnerabilities

The Lido protocol is implemented through smart contracts deployed on the Ethereum blockchain together with certain off-chain components that support protocol operations and integrations, operated in a decentralized manner by independent participants. Smart contracts may contain bugs, vulnerabilities, or design limitations that could result in loss of funds or unexpected behavior. While parallel independent audits, formal verification, extensive testing and security reviews are conducted, no smart contract system is entirely risk-free.

### 4.2 Dependency Risk

The Lido protocol is deployed on Ethereum and therefore depends on the security, liveness, and correct operation of the Ethereum network (including consensus, execution, network propagation, and client implementations).  
If Ethereum experiences congestion, reorgs, forks, client bugs, consensus failures, or other adverse events, users may experience degraded functionality, delays, or loss.

### 4.3 Governance and Upgrade Risk

Protocol upgrades, parameter changes, or governance decisions may alter protocol behavior, reward mechanics, or token functionality. Such changes may occur with limited notice but are always a subject of the DAO on-chain vote, having duration of 9 days from the vote start until it’s executed with exceptions on non-severe parameters changes as a part of shortened vote (5 days) or Easy Track system (3 days).

## 5\. Validator, Slashing, and Network Risks

### 5.1 Validator Performance and Slashing

Assets staked through the Lido protocol are programmatically delegated to independent node operators running validators on Ethereum. Node operators who utilize the Lido protocol to run validators may access the protocol in a permissioned or permissionless manner, depending on the design and configuration of the corresponding Lido protocol staking module and the mechanisms afforded by the underlying blockchain network. Validator performance is subject to operational, technical, and human risks. Validators may incur penalties, including slashing or inactivity penalties, due to causes such as misconfiguration, software bugs, hardware failure, network outages, power loss, operator error, or malicious behavior.

Slashing events may result in a reduction of the total staked assets and/or accrued rewards. In severe cases, slashing penalties may exceed earned rewards, resulting in a net loss of staked assets. While the Lido DAO utilizes node operator selection processes, monitoring systems, and risk mitigation mechanisms (the scope and design of which vary across staking modules) including operator diversification, Distributed Validator Technology, and bonding mechanisms where applicable, these measures do not eliminate the risk of slashing or underperformance.

The Lido protocol may operate multiple staking modules, each with distinct operator admission criteria, bonding requirements, and risk mitigation designs. The risk profile of stake allocated across modules may vary \- for example, modules relying on economic bonding mechanisms provide direct financial accountability for operator performance, while modules relying solely on permissioned selection processes depend on reputational and governance-based safeguards. Users should be aware that risk characteristics, including the nature and magnitude of potential losses, may differ across modules.

Slashing or sustained validator downtime may negatively affect the aggregate staking rewards (or penalties) accruing to liquid staking token holders and may lead to deviations between expected and realized rewards.

### 5.2 Correlated Validator Risks

Although Lido distributes stake across multiple independent node operators, certain risks may be correlated across validators. These include shared client software vulnerabilities, common infrastructure location or providers, shared jurisdictional exposure, coordinated network attacks, or systemic bugs affecting a large portion of validators simultaneously.

Correlated failures may lead to multiple validators being penalized or slashed within a short period of time, amplifying losses beyond what would be expected from isolated incidents.

### 5.3 Client, Software, and Upgrade Risk

All Ethereum validators rely on consensus-layer and execution-layer client software, which may contain undiscovered bugs, vulnerabilities, or implementation inconsistencies. Client upgrades, hard forks, or emergency patches may introduce unforeseen behavior, require rapid operator action, or result in validator downtime if not executed correctly or promptly.

In some cases, divergent client behavior or faulty upgrades may lead to chain splits, consensus instability, validator downtime, or slashing events. The timing and coordination of upgrades across the network are outside the control of the Lido protocol.

Certain validators may operate using Distributed Validator Technology, wherein validator signing keys are split across either multiple independent participants or a single participant’s nodes. While DVT is intended to improve resilience and reduce single points of failure, it introduces additional risks including coordination latency, key-share management complexity and dependency on DVT middleware (such as Obol or SSV network infrastructure). Failures in DVT coordination or middleware may result in missed attestations, missed proposals, or in certain edge cases, slashing.

Validators participating in the Lido protocol may utilize MEV-Boost or similar middleware to source blocks from external block builders via relay infrastructure. This introduces additional dependencies on third-party relays and builders, which may fail, deliver invalid blocks, censor transactions, or expose validators to regulatory risk. Relay outages or misbehavior may result in missed proposals or reduced rewards. 

### 5.4 Network Events

Certain slashing or penalty events may arise from network-wide conditions rather than individual validator misconduct. These include consensus failures, chain reorganizations, mass client failures, or protocol-level bugs. Such events may impact large numbers of validators simultaneously and may result in unexpected losses or prolonged disruptions to staking operations.

The Lido protocol does not control the underlying blockchain’s consensus rules, slashing conditions, or recovery processes. Changes to these rules may be implemented through network governance or protocol upgrades.

## 6\. Liquidity, Market, and Token Risks

### 6.1 Liquidity Risk

Users typically have two main pathways to obtain ETH when holding liquid staking tokens (stETH and wstETH): (i) protocol-level withdrawals (where supported) and (ii) secondary-market transactions (e.g., trading via third-party venues), which occur outside the Lido protocol’s infrastructure. The first is the so-called primary redemption mechanism, wherein stETH or wstETH can be redeemed for ETH through the Lido smart contracts; this flow ultimately depends on Ethereum’s validator withdrawal and exit mechanisms, and may be subject to protocol-defined queues, limits, and timing conditions at the upstream Ethereum layer. The other is secondary trading, wherein stETH or wstETH are swapped \- outside of the Lido smart contracts \- directly for ETH or any other asset on either a centralized or decentralized trading venue. 

Risk profile differs by pathway:

* **Protocol-level withdrawal flow**: Users may face timing risks, including queues, limits, and delays at the Ethereum layer. The amount of ETH ultimately received is based on the protocol’s accounting of underlying staked ETH and may be affected in adverse scenarios (e.g., slashing events), but otherwise does not depend on secondary-market liquidity.  
* **Secondary-market trading**: Users may face price and liquidity risks, including price deviations from ETH, slippage, widening spreads, liquidity fragmentation, and adverse execution during periods of market stress or large swaps.In stressed conditions, secondary markets may trade at a discount (or premium) relative to ETH, and users may receive materially less ETH than expected when exchanging stETH/wstETH via third-party venues.

Users, or agents acting on behalf of users, seeking to redeem ETH through the Lido smart contracts may face periods of illiquidity, for instance, when the overall Ethereum validator queue is long. Specifically, when many staking users (independently of the Lido protocol) are looking to unstake (and receive ETH) are seeking to exit staking and receive withdrawn ETH, the time it takes to execute the withdrawal increases because the network’s allowed throughput of unstaking acts as a bottleneck. This can create temporary periods of illiquidity which may have repercussions depending on a user’s liquidity preference and may impact the secondary trading price for both the liquid staking token and its underlying asset.

Users, or agents acting on behalf of users, seeking to swap or trade liquid staking tokens for ETH or other assets on secondary trading venues are subject to the prevailing market conditions on the venue they select and are responsible for seeking best execution. Trading conditions are affected, not just by order book depth in the liquid staking token itself, but also by trading conditions in the underlying asset as well as the liquidity situation of the primary redemption window. If the primary redemption window is ‘congested’, or faces long delays for redemption, market participants may be unable to arbitrage price dislocations in times of market stress and users seeking to trade through secondary trading venues may face price quotes for their liquid staking tokens at meaningful deviations from par. 

### 6.2 Market Volatility

Digital asset markets are inherently volatile, with token prices susceptible to significant and rapid fluctuation, often independent of the protocol's underlying fundamentals or operational performance. Market volatility is influenced by a range of external and internal factors, including but not limited to, macroeconomic shifts, global regulatory news, general sentiment toward the crypto market, activity of large holders, and speculative trading.

Rapid price movements can lead to unexpected losses for users. For those using liquid staking tokens (like stETH and wstETH) as collateral in decentralized finance protocols, sudden drops in the token's value can trigger cascading liquidations, further exacerbating price pressure and market stress.

While stETH and wstETH are designed to track the value of the underlying ETH, extreme market volatility can cause the liquid staking token's price to deviate significantly from par on secondary markets. This deviation can persist until arbitrage opportunities can be executed, which may be constrained by withdrawal queue times.

### 6.3 Accounting and Oracle Risk

Token balances, exchange rates, and accounting assumptions may rely on protocol-defined calculations or oracle data. Incorrect, delayed, or manipulated data may result in inaccurate representations of value.

Certain functions of the Lido protocol use decentralized oracle subsystems to relay important data (including Consensus Layer state) to the Lido smart contracts. These oracle subsystems are operated by multiple independent participants and require a quorum of matching reports to be accepted on-chain (for example, a 5-of-9 threshold, depending on the oracle subsystem and configuration). As a result, it is not sufficient for a single oracle operator or a single instance of oracle software to be compromised, offline, or faulty for incorrect data to be accepted by the protocol. The relevant risks are more likely to materialize in the highly unlikely event where a quorum of oracle operators is compromised, colludes, is unavailable, or if a shared software defect affects a quorum such that identical incorrect reports are produced.

If incorrect or stale data is accepted by quorum, it may lead to inaccurate accounting updates (including reward accrual and exchange-rate calculations), delays in accounting finality, or other unintended protocol behavior. Protocol safeguards exist which apply on-chain validity and sanity checks designed to constrain the magnitude and/or rate of certain accounting changes, which may mitigate—but do not eliminate—the risk of adverse outcomes.

Token accounting, particularly the tracking of rewards and the resulting exchange rates for liquid staking tokens, is based on complex, protocol-defined formulas. While open source, transparent and based on extensively audited smart contracts, these formulas may yet contain implementation bugs or design flaws (including newly appeared as a result of the Ethereum network specification upgrade implemented as a network “hardfork”) that lead to incorrect balances or value representation over time.

Any failure in these systems means the representation of token balances or exchange rates to  be inaccurate.

## 7\. Wrapping, Withdrawal, and Bridging Risks

### 7.1 Wrapping and Unwrapping

Wrapping (e.g., stETH to wstETH) and unwrapping transactions depend on smart contracts and on-chain mechanisms. Errors or failures may result in loss of funds.

### 7.2 Withdrawal Queues and Delays

Withdrawals from staking may be subject to Ethereum staking protocol-defined queues, limits, delays and other conditions. Users may not be able to exit positions immediately.

### 7.3 Bridging and Cross-Chain Risk

Bridging assets across blockchains introduces additional risks, including bridge smart contract vulnerabilities, off-chain tooling failures, reliance on third-party operators, chain-specific failures, and inconsistent regulatory treatment across jurisdictions.

### 7.4 Bridging Withdrawal Queues and Delays

Bridging assets across blockchains introduces additional risks beyond Ethereum. Movements of assets between Ethereum and L2s or other networks may be subject to (i) the relevant network’s protocol rules and conditions (including finality requirements, challenge periods, rate limits, queues, or other withdrawal conditions), and (ii) additional limits, delays, fees, operational constraints, or failure modes imposed by the particular cross-chain bridge or messaging system used.

Bridges and related infrastructure are typically operated by independent third parties; neither the Lido protocol nor the Foundation operates or controls such bridges. Bridge-related incidents (including smart-contract vulnerabilities, compromised validators/relayers, oracle issues, governance attacks, or chain reorgs) may result in delayed transfers, incorrect transfers, or loss of funds.

Users and integrators should review bridge-specific documentation and risk disclosures, and apply best practices appropriate to the selected bridge and destination network.

## 8\. Integration and Developer Risks

### 8.1 Integration Errors

Integrators interacting directly with Lido smart contracts, SDKs, or APIs assume responsibility for correct implementation. Incorrect integrations, misconfigured parameters, or misuse of token standards may result in irreversible loss of funds.

### 8.2 Irreversibility of On-Chain Actions

Blockchain transactions are generally irreversible. Errors cannot be undone once confirmed on-chain.

### 8.3 Composability and DeFi Risk

Use of Lido tokens within DeFi protocols introduces additional layers of risk, including liquidation risk, cascading failures, and reliance on third-party protocol security and governance.

## 9\. Institutional and Custodial Considerations

### 9.1 No Custody, AML/KYC or Fiduciary Role

The Foundation does not act as a custodian, broker, or fiduciary. Institutional users retain responsibility for custody, accounting, reporting, and regulatory compliance.

### 9.2 Operational and Compliance Risk

Operational, custody, cybersecurity, and compliance risks related to holding, reconciling, and reporting Lido-related positions are managed at the level of the institution and its chosen custodians or service providers, not by the Lido protocol. Institutional users must independently assess these operational and compliance risks, and ensure that their custodians, brokers, and other vendors have appropriate controls, incident-response processes, and regulatory compliance frameworks in place for any use of Lido-related products.

## 10\. User Responsibility and Acknowledgement

By accessing or using the Lido protocol, tokens, interfaces, or documentation, users and integrators acknowledge that they: 

* understand and accept the risks described in this PRD;   
* assume full responsibility for regulatory compliance and risk management;   
* use the protocol at their own risk.

## 11\. Updates and Maintenance

This PRD may be updated from time to time to reflect protocol changes, regulatory developments, or evolving risk factors. Users are encouraged to review the latest version at: https://docs.lido.fi/prd
