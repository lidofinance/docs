---
sidebar_position: -1
---

# 📖 Context & Background

## What is CSM
The **Community Staking Module (CSM)** is a family of two staking modules in Lido with permissionless entry, allowing any operator to run validators with less ETH and improved capital efficiency compared to solo staking.

It is designed to make participation as a Node Operator accessible to independent operators.

:::info
0x02 CSM is live on the Hoodi testnet, with an expected Mainnet release in Q4 2026.

Access 0x01 CSM at [csm.lido.fi](https://csm.lido.fi/) (Mainnet) and both at [csm.testnet.fi](https://csm.testnet.fi/) (Hoodi).
:::

---

## Why there are two CSM modules

Until now, CSM has worked exclusively with `0x01` validators, which have a maximum effective balance of 32 ETH. With the introduction of `0x02` credentials, CSM now has an opportunity to support compounding validators with balances of up to 2,048 ETH.

Supporting wider `0x02` adoption is important for Ethereum. Larger validators can compound rewards and consolidate stake into fewer validators, reducing consensus-layer overhead and helping prepare Ethereum for future improvements such as faster finality.

Technical limitations make it difficult to support both credential types within a single CSM module. They also prevent CSM from capping `0x02` validators at different balances, which would be needed to offer a wider range of bond amounts. For this reason, 0x02 CSM is a separate module built on the same CSM v3 codebase.

## How the modules work together

Both modules are accessed and managed through the same CSM interface, and joining one does not require choosing between them. An operator can run a 0x01 CSM operator and a 0x02 CSM operator side by side.

See [Managing 0x01 and 0x02 Operators](/run-on-lido/csm/lido-csm-widget/managing-0x01-and-0x02-operators) for how to create, switch between, and monitor operators across both modules.

## 0x01 CSM vs 0x02 CSM

| Dimension | 0x01 CSM | 0x02 CSM |
| --- | --- | --- |
| Availability | Live on Mainnet | Live on Hoodi testnet; [Mainnet expected Q4 2026](https://research.lido.fi/t/0x02-csm-landscape/11697) |
| Withdrawal credentials | `0x01` | `0x02` |
| Maximum Effective Balance | 32 ETH | 2,048 ETH |
| Stake allocation | FIFO queue | [Initial 32 ETH deposit followed by top-ups](/run-on-lido/csm/lido-csm-widget/upload-remove-view-validator-keys#deposit-queue) |
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

CSM uses the bond to cover losses and charges caused by operator actions. Amounts vary by operator profile and module (0x01 vs 0x02).

See [Penalties](/run-on-lido/csm/penalties#parameters-by-operator-profile) for the list of parameters, how each penalty is applied, and what to do in case of a penalty.

## Where to go next

- [Choose a node setup](/run-on-lido/csm/node-setup) based on your experience and preferred tooling.
- [Generate validator keys](/run-on-lido/csm/generating-validator-keys) using the withdrawal credentials for the module you are joining.
- [Use the CSM Widget](/run-on-lido/csm/lido-csm-widget) to create or manage your operator, provide bond, and upload keys.
- Independent operators can [apply for ICS](https://csm.lido.fi/type/ics-apply). DVT clusters can [apply for IDVTC](https://csm.lido.fi/type/idvtc-apply). 0x02 CSM, like Default, can be joined directly, with no application step.
