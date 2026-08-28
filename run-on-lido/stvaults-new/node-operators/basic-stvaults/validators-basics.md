---
sidebar_position: 9
---

# Validators Basics

Running validators for an stVault is ordinary Ethereum validation with a few constraints that come from the stVault: where the withdrawal credentials point, where the execution-layer rewards land, and who is expected to act on an exit request. This page covers those constraints.

Everything else — key generation, node setup, client choice, monitoring — is the same craft as any other Lido module. The [CSM guide](../../../csm/index.md) covers it in depth and applies here too.

## Withdrawal credentials

A validator belongs to an stVault through its **withdrawal credentials**: the `0x02` type, pointing at the stVault address (`0x02` + 11 zero bytes + the 20-byte stVault address). Read the exact value from `StakingVault.withdrawalCredentials()` rather than assembling it by hand — a wrong value means the deposit is unrecoverable.

The `0x02` type also sets the balance ceiling: a validator compounds up to 2048 ETH ([EIP-7251](https://eips.ethereum.org/EIPS/eip-7251)) instead of the 32 ETH of `0x01` validators.

:::danger
Withdrawal credentials cannot be changed after a validator is created. A validator built with the wrong ones can never be attached to the stVault; the ETH is only recoverable by exiting it to whatever address the credentials do point at.
:::

For validators that already exist elsewhere, [consolidation](./consolidations.md) migrates them into an stVault instead of exiting and redepositing.

## Where the rewards go

The two reward streams behave differently, and only one of them is automatic.

**Consensus-layer rewards** follow the withdrawal credentials, so they reach the stVault without any configuration. They accumulate on the validator balance until it reaches 2048 ETH; anything above that is swept to the stVault automatically.

**Execution-layer rewards** — priority fees and MEV — go wherever the validator client's fee recipient points. That address has nothing to do with the withdrawal credentials.

:::warning
Set the fee recipient to the stVault address. If it points anywhere else, every priority fee and MEV payment the validator earns stays outside the stVault: it is not part of Total Value, does not count towards the Vault Owner's rewards, and does not appear in any stVault metric.
:::

This is the single easiest thing to get wrong, and nothing on-chain will complain about it. Verify it on the validator client, not only in the configuration file — a fee recipient can also be overridden per-client or by a relay.

## Watching for what the Vault Owner asks

Validators do not leave on their own, and the protocol does not force the Node Operator's hand in the normal case.

When the Vault Owner wants ETH back, they call `requestValidatorExit`, which **only emits a `ValidatorExitRequested` event per public key**. Nothing else happens. If no one is watching for that event, the request is invisible and the exit never occurs.

## Exit validators

A Node Operator has two ways to take a validator out, and neither of them is partial.

**A voluntary exit from the validator client** is the ordinary consensus-layer route, signed with the validator key. It costs nothing on the execution layer and needs no on-chain transaction.

**`StakingVault.ejectValidators`** sends an EIP-7002 triggerable withdrawal on-chain. It exists for the case the validator key cannot be used — the Node Operator cannot guarantee that every validator pointing at the stVault is under its control, so the contract gives it a way to remove one regardless.

The call compares the sender against the Node Operator address stored in the stVault and reverts with `SenderNotNodeOperator` otherwise. Unlike the Vault Owner's permissions, it is not a Dashboard role and cannot be delegated.

:::info
`ejectValidators` takes public keys and a refund recipient, but no amounts: it always issues full withdrawal requests.
:::

The exited ETH returns to the stVault balance, because that is where the withdrawal credentials point.

### The fee

Each key in the request costs an EIP-7002 fee, paid as the value of the same transaction:

- estimate it with `calculateValidatorWithdrawalFee(numberOfKeys)` on the `StakingVault` contract;
- the fee is set by the network and changes from block to block, so an estimate is only accurate for the block it was made in;
- the exact amount is charged and the excess is refunded to the refund recipient, or to the sender when that address is zero.

The fee rises steeply while the withdrawal queue is congested. Sending a surplus protects against a revert, but it also raises the ceiling of what can be charged, so keep it modest.

<details>
  <summary>using Command-line Interface</summary>

```bash
yarn start contracts vault write eject-validators \
  <vault_address> <pubkeys> <amounts> <refund_recipient>
```

Public keys are a comma-separated list. The CLI reads the current fee itself and attaches it to the transaction, then asks for confirmation before sending.

</details>

<details>
  <summary>using Etherscan UI</summary>

1. Open **Etherscan** and navigate to the **StakingVault** contract by its address.
2. Call `calculateValidatorWithdrawalFee`, passing the number of keys, to estimate the fee.
3. Call `ejectValidators`, passing the concatenated public keys and the refund recipient address. Attach the fee, with a surplus, as the payable value.

</details>

## Off-chain monitoring tools

### **Ethereum Validators Monitoring (EVM)**

**Where**: [GitHub Repository](https://github.com/lidofinance/ethereum-validators-monitoring)

**Goal**: Off-chain track the status and performance of Ethereum validators used in stVaults. It helps detect inactivity, monitor effectiveness, and identify anomalies in validator operations.

**How to use:**

- Clone the repository from GitHub.
- Install dependencies and set up the environment.
- Run the monitoring tool to get validator status.
- Integrate the output with alerting or dashboards.

### **Ethereum Head Watcher**

**Where**: [GitHub Repository](https://github.com/lidofinance/ethereum-head-watcher)

**Goal**: Off-chain monitor Ethereum chain head updates to detect delays, stalls, or reorgs. It is used to ensure timely block processing and head finality, which are critical for the stability of services like stVaults.

**How to use:**

- Clone the repository from GitHub.
- Install dependencies and configure environment variables.
- Run the watcher to observe head progression.
- Connect it to alerting or monitoring systems if needed.


## Related

- [Predeposit Guarantee](./pdg.md) — how deposits actually reach validators
- [Consolidations](./consolidations.md) — migrating existing validators into an stVault
- [CSM guide: generating validator keys](../../../csm/generating-validator-keys/index.md)
- [CSM guide: node setup](../../../csm/node-setup/index.md)
- [CSM guide: alerts and monitoring](../../../csm/alerts-and-monitoring/index.md)
- [CSM guide: best practices](../../../csm/best-practices/index.md)
