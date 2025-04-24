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

You can find it on the Operators Dashboard (`#123` on the operator card): [Hoodi](https://operators-hoodi.testnet.fi), [Mainnet](https://operators.lido.fi)

### Staking Router Module ID:

ID of the [StakingRouter](https://github.com/lidofinance/core/blob/master/contracts/0.8.9/StakingRouter.sol) contract module.

Currently, it has only one module ([NodeOperatorsRegistry](https://github.com/lidofinance/core/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)), it's id is `1`.

### Oracle Allowlist
The oracle members are retrievable from the HashConsensus (for the Validator Exit Bus Oracle ) contract on-chain, directly from the contract using Etherscan.
| network  | Contract Call |
| -------- | ------------- |
| Mainnet  | [getMembers()](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a#readContract#F16) |
| Hoodi    | [getMembers()](https://hoodi.etherscan.io/address/0x30308CD8844fb2DB3ec4D056F1d475a802DCA07c#readContract#F16) |

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
