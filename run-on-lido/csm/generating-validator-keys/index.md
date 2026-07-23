---
sidebar_position: 1
---

# 🔑 Generating Validator Keys

:::warning Generate 0x01 keys
The CSM deployments currently available on Mainnet and Hoodi accept **0x01 validator keys only**, with deposit data set to 32 ETH. 0x02 CSM has been approved but is not live yet. Do not generate or upload `0x02` keys until its dedicated testnet or Mainnet deployment is announced.
:::

Before you can run validators in the Community Staking Module, you need to generate your validator keys. These keys secure 32 ETH each and are tasked with signing attestations and proposing blocks, so generating them properly and securely is a must.

In this section, we’ll guide you through the process of generating validator keys, with options depending on whether you’re deploying on testnet or mainnet.

---

## Choose your path

[**Key generation for Testnet →**](./key-generation-for-testnet)

[**Key generation for Mainnet →**](./key-generation-for-mainnet/)

:::tip
We strongly recommend testing your setup on a testnet first, especially if this is your first time operating a validator or using a new stack.
:::
