---
sidebar_position: 1
---

# 🔑 Generating Validator Keys

Before you can run validators in the Community Staking Module, you need to generate your validator keys. Each key secures a deposit of 32 ETH and is tasked with signing attestations and proposing blocks, so generating it properly and securely is a must. For 0x01 CSM keys, that 32 ETH is also the validator's maximum balance; for 0x02 CSM keys, the validator can later grow up to 2,048 ETH through top-ups.

In this section, we’ll guide you through the process of generating validator keys, with options depending on whether you’re deploying on testnet or mainnet.

:::info Choose the right credential type
Generate `0x01` keys for 0x01 CSM (Mainnet and Hoodi), or `0x02` keys for 0x02 CSM (Hoodi only). Double-check the credential type before uploading keys.
:::

---

## Choose your path

[**Key generation for Testnet →**](./key-generation-for-testnet)

[**Key generation for Mainnet →**](./key-generation-for-mainnet/)

:::tip
We strongly recommend testing your setup on a testnet first, especially if this is your first time operating a validator or using a new stack.
:::
