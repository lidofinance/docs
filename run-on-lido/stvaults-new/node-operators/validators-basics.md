---
sidebar_position: 9
---

# Validators Basics

Running validators for an stVault is ordinary Ethereum validation with a few constraints that come from the stVault: where the withdrawal credentials point, where the execution-layer rewards land, and who is expected to act on an exit request. This page covers those constraints.

Everything else — key generation, node setup, client choice, monitoring — is the same craft as any other Lido module. The [CSM guide](../../csm/index.md) covers it in depth and applies here too.

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

The Node Operator has its own instrument for acting on the request: `StakingVault.ejectValidators` performs an EIP-7002 withdrawal directly. It is checked against the Node Operator address and cannot be delegated.

<details>
<summary>Ejecting validators with the CLI</summary>

```bash
yarn start contracts vault write eject-validators <vault_address> <pubkeys> <amounts> <refund_recipient>
```

The CLI reads the EIP-7002 fee from `calculateValidatorWithdrawalFee` and asks for confirmation before sending. If `<refund_recipient>` is the zero address, the fee refund goes to the sender.

</details>

Two paths bypass the Node Operator entirely:

- The Vault Owner can trigger withdrawals themselves through EIP-7002 — see [Control validators and withdraw from the Beacon Chain](../vault-owners-curators-and-stakers/basic-stvaults/control-validators.md).
- The protocol can force full exits when the stVault has an obligations shortfall.

Monitoring exit requests is therefore not only a courtesy: acting on them keeps the stVault out of the state where exits happen without the operator's involvement.

## Exit validators

TODO

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
- [CSM guide: generating validator keys](../../csm/generating-validator-keys/index.md)
- [CSM guide: node setup](../../csm/node-setup/index.md)
- [CSM guide: alerts and monitoring](../../csm/alerts-and-monitoring/index.md)
- [CSM guide: best practices](../../csm/best-practices/index.md)
