---
sidebar_position: -1
---

# 📖 Context & Background

## What is CSM
The **Community Staking Module (CSM)** is a family of two staking modules in Lido with permissionless entry, allowing any operator to run validators with less ETH and improved capital efficiency compared to solo staking.

It is designed to make participation as a Node Operator accessible to independent operators.

CSM originally supported a single module for `0x01` validators, but it is now evolving into a family of two complementary modules: **0x01 CSM** and **0x02 CSM**.

:::info
**0x01 CSM is live on Ethereum Mainnet.** The launch of 0x02 CSM [has been approved by the DAO](https://research.lido.fi/t/0x02-csm-landscape/11697), with an expected mainnet release in Q4 2026.

Unless a page explicitly says otherwise, the operational guides in this section currently apply to **0x01 CSM** only.
:::

---

## Why there are two CSM modules

Until now, CSM has worked exclusively with `0x01` validators, which have a maximum effective balance of 32 ETH. With the introduction of `0x02` credentials, CSM now has an opportunity to support compounding validators with balances of up to 2,048 ETH.

Supporting wider `0x02` adoption is important for Ethereum. Larger validators can compound rewards and consolidate stake into fewer validators, reducing consensus-layer overhead and helping prepare Ethereum for future improvements such as faster finality.

However, technical limitations make it difficult to support both credential types within a single CSM module. They also prevent CSM from capping `0x02` validators at different balances, which would be needed to offer a wider range of bond amounts. For this reason, 0x02 CSM will be introduced as a separate module built on the same CSM v3 codebase.

## How the modules work together

Node Operators will be able to access and manage both modules through the same CSM interface. From an operator's perspective, selecting 0x01 CSM or 0x02 CSM will feel similar to selecting an operator type like ICS or IDVTC, even though they are separate modules under the hood.

The modules can be used in parallel. Operating in one does not prevent an operator from joining the other, but keys, bond, rewards, and allocation remain specific to the selected module.

Because they are separate modules, each one has its own stake share limit, with their limits adjusted over time within the overall capacity allocated to CSM via governance. Please note that these limits affect how much stake each module can receive, but they do not guarantee when a specific key will be deposited.

## 0x01 CSM vs 0x02 CSM

| Dimension | 0x01 CSM | 0x02 CSM |
| --- | --- | --- |
| Availability | Live on Mainnet | [Approved](https://research.lido.fi/t/0x02-csm-landscape/11697); not yet deployed |
| Withdrawal credentials | `0x01` | `0x02` |
| Maximum Effective Balance | 32 ETH | 2,048 ETH |
| Stake allocation | FIFO queue | Initial 32 ETH deposit followed by top-ups |
| Node Operator profiles | Default, ICS, and IDVTC | Single permissionless profile |

## Operator profiles and economics

0x01 CSM provides different profiles for permissionless operators, verified independent operators, and verified DVT clusters. 0x02 CSM uses a single permissionless profile.

| Module | Profile | Who it is for | Bond | NO reward | DAO fee |
| --- | --- | --- | --- | --- | --- |
| `0x01` | Default | Any operator | First key: 2.4 ETH<br />Subsequent keys: 1.3 ETH | 3.5% | 6.5% |
| `0x01` | ICS | Verified Independent Community Stakers | First key: 1.5 ETH<br />Subsequent keys: 1.3 ETH | 6% first 16 keys;<br />3.5% after | 4% first 16 keys;<br />6.5% after |
| `0x01` | IDVTC | Verified DVT clusters of Independent Community Stakers | First key: 1.5 ETH<br />Subsequent keys: 0.5 ETH | 3.5% first 64 keys;<br />2% after | 6.5% first 64 keys;<br />8% after |
| `0x02` | Default | Any operator | First key: 32 ETH<br />Subsequent keys: 30 ETH | 2% | 8% |

## Basic penalties and charges

CSM uses the bond to cover losses and charges caused by operator actions. The values below come from the [0x01 CSM v3 Mainnet configuration](https://github.com/lidofinance/community-staking-module/blob/4d3de6658499e1c1774951780a97d7ae25ca18b8/script/csm/DeployMainnet.s.sol) and the approved [0x02 CSM proposal](https://research.lido.fi/t/0x02-csm-landscape/11697).

| Parameter | 0x01 Default | 0x01 ICS | 0x01 IDVTC | 0x02 Default|
| --- | --- | --- | --- | --- |
| Key removal charge | 0.02 ETH | 0.01 ETH | 0.01 ETH | 0.02 ETH |
| Performance leeway | 3% | 5% for the first 150 keys;<br />3% after | 3% | 3% |
| Strikes before ejection | 3 within 6 frames | 4 within 6 frames | 3 within 6 frames | 3 within 6 frames |
| Bad performance ejection penalty | 0.258 ETH | 0.172 ETH | 0.258 ETH | 0.258 ETH per 32 ETH of validator balance;<br />up to 16.512 ETH |
| Time to process a requested exit | 4 days | 5 days | 5 days | 4 days |
| Exit delay charge | 0.1 ETH | 0.05 ETH | 0.05 ETH | 0.1 ETH |
| General Delayed Penalty additional fine | 0.1 ETH | 0.05 ETH | 0.05 ETH | 0.1 ETH |

- Performance is assessed over 28-day frames. A strike is a warning rather than an immediate bond penalty, but reaching the applicable threshold can lead to validator ejection and a Bad performance ejection penalty.
- Slashing and protocol violations are loss-based. If a penalty leaves the operator without enough bond, rewards replenish it first and unbonded validators may be requested to exit.

See [Penalties](/run-on-lido/csm/penalties) for a simple overview of the mechanics and what operators should do.

## Where to go next

- [Choose a node setup](/run-on-lido/csm/node-setup) based on your experience and preferred tooling.
- [Generate validator keys](/run-on-lido/csm/generating-validator-keys) using the withdrawal credentials for the module you are joining.
- [Use the CSM Widget](/run-on-lido/csm/lido-csm-widget) to create or manage your operator, provide bond, and upload keys.
- Independent operators can [apply for ICS](https://csm.lido.fi/type/ics-apply). DVT clusters can [apply for IDVTC](https://csm.lido.fi/type/idvtc-apply).
