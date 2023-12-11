# Tooling Setup & Configuration

## Keys API (KAPI)

[Dedicated Setup Guide](https://hackmd.io/@lido/S1Li-wXl3)

[GitHub Repo](https://github.com/lidofinance/lido-keys-api)

## Validator Ejector (Ejector)

[Dedicated Setup Guide](https://hackmd.io/@lido/BJvy7eWln)

[GitHub Repo](https://github.com/lidofinance/validator-ejector)

## Required Infra for New Tooling

In order for the new tooling to read Lido contracts and validator information, tooling needs access to an Execution Node (full node to be exact) and a Consensus Node.

A dedicated CL+EL setup is recommended.

:::info
Although the Ejector has [security protections](https://github.com/lidofinance/validator-ejector#safety-features), using hosted RPC providers (Infura, Alchemy, etc) is discouraged.
:::

:::info
It's also advised to have secure Ejector->Nodes and KAPI->Nodes communication, for example via a private network.
:::

## Common Configuration Options

### Operator ID

You can find it on the Operators Dashboard (`#123` on the operator card): [Goerli](https://operators.testnet.fi), [Mainnet](https://operators.lido.fi)

### Staking Router Module ID:

ID of the [StakingRouter](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol) contract module.

Currently, it has only one module ([NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)), it's id is `1`.

### Oracle Allowlist
The oracle members are retrievable from the HashConsensus (for the Validator Exit Bus Oracle ) contract on-chain, using the Aragon App or directly from the contract using etherscan.
| network | Aragon App | Contract Call |
| -------- | -------- | -------- |
| Mainnet | [Aragon](https://mainnet.lido.fi/#/lido-dao/0xae7ab96520de3a18e5e111b5eaab095312d7fe84/) | [getMembers()](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a#readContract#F16) |
| Goerli | [Aragon](https://testnet.testnet.fi/#/lido-testnet-prater/0x24d8451bc07e7af4ba94f69acdd9ad3c6579d9fb/) | [getMembers()](https://goerli.etherscan.io/address/0x8374B4aC337D7e367Ea1eF54bB29880C3f036A51#readContract#F16) |
| Holesky | n/a | [getMembers()](https://holesky.etherscan.io/address/0xe77Cf1A027d7C10Ee6bb7Ede5E922a181FF40E8f#readContract#F16) |

## Example Infra Setup

Lido DevOps team prepared an easy way to get the recommended tooling and its dependencies up and running using [Ansible](https://github.com/ansible/ansible). This is a great way to get familiar with the new tooling. This is an example implementation, and still requires security and hardening by the NO; it can be found on [GitHub](https://github.com/lidofinance/node-operators-setup).

It sets up 3 hosts:

- Execution Layer + Consensus Layer nodes ([Geth](https://github.com/ethereum/go-ethereum) + [Lighthouse](https://github.com/sigp/lighthouse))
- KAPI & Ejector
- Monitoring

Monitoring consists of:

- [Prometheus](https://github.com/prometheus/prometheus) for metrics
- [Alertmanager](https://github.com/prometheus/alertmanager) for alerts
- [Loki](https://github.com/grafana/loki) for logs
- [Grafana](https://github.com/grafana/grafana) for dashboards
