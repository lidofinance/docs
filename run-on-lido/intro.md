---
sidebar_position: 0
---

# Run on Lido

Run on Lido covers how to run validators on Lido, whether a Node Operator or Vault owner, with links to each product’s setup guide.

:::tip Not looking to run validators?
Stake via Lido Core at [stake.lido.fi](https://stake.lido.fi) and receive stETH 1:1. Your ETH is spread across Lido's Node Operators and earns from the next daily rebase, without having to run infrastructure.

Institutions can start with [Lido Institutional](https://lido.fi/institutional).
:::

## Your options

| Option | Who runs the validators | Access | What you put in | Rewards vs solo staking |
| --- | --- | --- | --- | --- |
| **Lido Core staking** | Lido's Node Operators | Open | Any amount of ETH | ~0.9x |
| **Curated Module v2** | You | Permissioned | Bond, by operator type | Depends on operator type |
| **0x01 CSM** | You | Open; ICS and IDVTC need verification | 0.5 to 2.4 ETH bond per 32 ETH validator | Up to ~1.8x Default, ~2.4x ICS, ~3.1x IDVTC |
| **0x02 CSM** | You | Open | 30 to 32 ETH bond per 2,048 ETH validator | Up to ~2.3x once topped up |
| **stVaults** | You, or a Node Operator you choose | Open | Your own ETH, in an isolated vault | ~1x |

With Lido Core staking you receive stETH 1:1 and earn through the daily rebase. In CMv2 and CSM you earn Node Operator rewards plus the staking rewards on your bond. In stVaults you earn the staking rewards minus fees, and can mint stETH against your vault.

## How to choose

### Don’t want to run validators

- **You hold ETH and want staking rewards with no setup:** Lido Core staking. Stake any amount and hold liquid stETH.
- **You want your stake segregated, with a Node Operator you choose:** stVaults. Common for institutions and custodians. Your ETH stays in your own vault, and you can mint stETH when you need liquidity.

### Running validators

- **You're a solo or home staker, or a small team:** 0x01 CSM. Lido allocates 32 ETH per validator against a first bond of 2.4 ETH, or 1.5 ETH as a verified ICS or IDVTC operator.
- **You have larger capital to bond and a long horizon:** 0x02 CSM. Each 30–32 ETH of bond can back up to 2,048 ETH of stake. Allocation grows in steps, so plan to scale gradually.
- **You want to run validators on your own ETH:** stVaults. No Lido allocation queue, full control over your setup, and stETH liquidity for your own strategies.
- **You're a professional staking provider:** Curated Module v2. It is permissioned, operators can only join through onboarding rounds approved by the Lido DAO.

## Useful links

- **Lido Core staking:** [stake.lido.fi](https://stake.lido.fi) · [Lido Institutional](https://lido.fi/institutional)
- **0x01 and 0x02 CSM:** [CSM Guide](/run-on-lido/csm/)
- **stVaults:** [stVaults Documentation](/run-on-lido/stvaults/)
- **Curated Module v2:** [CMv2 Guide](/run-on-lido/cm-v2/)
- **Questions and support:** [Discord](https://discord.com/invite/lido)
