---
title: Audits
description: Security reviews of the Lido Lend contracts and their dependencies.
---

# Audits

This page lists the security reviews that cover the Lido Lend contracts, and the components they depend on. It also explains how the deployed code is matched to the audited code. For addresses, see [Deployed contracts](./deployed-contracts).

The main review is the Cyfrin Lido Lend audit, dated 2026-10-26. It covers 53 files in `lend-markets`, `lend` and `lend-irm`. The final audited public commits are `4d55f1d` in `lend`, `97af4c3` in `lend-irm` and `23416c4` in `lend-markets`. The deployment uses `lend` at `422d589` and `lend-irm` at `566d31f`, earlier commits of the same repositories. Cyfrin recomputed the digests of all 53 files at the deployment checkout and confirmed that they match. See [Deployment verification](#deployment-verification).

The report lists 62 findings: no critical or high severity, 8 medium, 27 low, 21 informational and 6 gas optimizations. Of these, 30 are resolved, 1 is partially resolved and 31 are acknowledged.

## Lido Lend protocol audits

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [Lido Lend](https://github.com/lidofinance/audits/blob/main/lend/2026-10-26_Cyfrin_Lido-Lend.pdf) | Cyfrin | 2026-10-26 | Lido Lend contracts in `lend-markets` (`src/`), the `lend` core and the `lend-irm` interest-rate contracts: 53 files | `lend` [`4d55f1d`](https://github.com/lidofinance/lend/tree/4d55f1dd98a0f7712543965c66e03c963a004263), `lend-irm` [`97af4c3`](https://github.com/lidofinance/lend-irm/tree/97af4c39c51f1e023d8025319f34a1658036066c), `lend-markets` [`23416c4`](https://github.com/lidofinance/lend-markets/tree/23416c43c4038ea3c00a13d6203949c8f88905cc) |

:::danger[Pending: lidofinance/audits#218]
The report links on this page point to `lidofinance/audits` and work after [lidofinance/audits#218](https://github.com/lidofinance/audits/pull/218) is merged.
:::

## Off-chain components (Guardian daemon)

The Guardian daemon SDK ([`lidofinance/lend-guardian-daemon`](https://github.com/lidofinance/lend-guardian-daemon)) is the TypeScript reference implementation of the Guardian off-chain logic for `GuardianSignals`. See [Guardian operator guide](./guides/guardian-operator).

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [Lido Lend Guardian Daemon SDK](https://github.com/lidofinance/audits/blob/main/lend/2026-11-9-mixbytes-lido-lend-guardian-daemon-sdk.pdf) | MixBytes | 2026-11-09 | Guardian daemon SDK | [`b566e01`](https://github.com/lidofinance/lend-guardian-daemon/tree/b566e019684568e1d505ff25f77b3da4e61fe095) |

The report lists 16 findings: 1 high, 8 medium and 7 low. Of these, 12 are fixed and 4 are acknowledged.

## Dependencies

### Circuit Breaker

Lido Lend uses `CircuitBreaker` from [`lidofinance/circuit-breaker`](https://github.com/lidofinance/circuit-breaker) at tag `1.0.0` (commit `6829a5a`). The audited commit is `b4b2fbc`. Nothing under `src/` changed between the audited commit and tag `1.0.0`.

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [CircuitBreaker Audit Report](https://github.com/lidofinance/audits/blob/main/Cyfrin%20CircuitBreaker%20Audit%20Report%2004-2026.pdf) | Cyfrin | 04-2026 | `CircuitBreaker` | `b4b2fbc` |
| [CircuitBreaker Formal Verification Report](https://github.com/lidofinance/audits/blob/main/Cyfrin%20CircuitBreaker%20Formal%20Verification%20Report%2004-2026.pdf) | Cyfrin | 04-2026 | `CircuitBreaker`, formal verification | See report |
| [CircuitBreaker Audit Report](https://github.com/lidofinance/audits/blob/main/MixBytes%20CircuitBreaker%20Audit%20Report%2004-2026.pdf) | MixBytes | 04-2026 | `CircuitBreaker` | `b4b2fbc` |

### Bundler3

Lido Lend uses Morpho Bundler3 from [`morpho-org/bundler3`](https://github.com/morpho-org/bundler3). It is deployed from commit `9afc2f4`. The final audited commit is `263f75d`. Between the two commits, only these files under `src/` changed:

- `adapters/ERC20WrapperAdapter.sol`, which Lido Lend does not use;
- `interfaces/IAaveV3Optimizer.sol`, which Lido Lend does not use;
- `interfaces/IBundler3.sol`, NatSpec comments only.

Every Bundler3 file that Lido Lend imports is unchanged.

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [Bundler3](https://github.com/morpho-org/bundler3/blob/9afc2f4ea32c9dbeba2205a485731b8a98f7ae4c/audits/2025-01-02-bundler3-spearbit.pdf) | Spearbit | 2025-01-02 | Bundler3 | See report |
| [Bundler3 update](https://github.com/morpho-org/bundler3/blob/9afc2f4ea32c9dbeba2205a485731b8a98f7ae4c/audits/2025-02-17-bundler3-update-spearbit.pdf) | Spearbit | 2025-02-17 | Bundler3 update | See report |
| [Bundler3 with update](https://github.com/morpho-org/bundler3/blob/9afc2f4ea32c9dbeba2205a485731b8a98f7ae4c/audits/2025-02-18-bundler3-with-update-open-zeppelin.pdf) | OpenZeppelin | 2025-02-18 | Bundler3 with update | See report |

### Easy Track factories

The Lido Lend Easy Track factories and `LidoLendPreseeder` are in [`lidofinance/easy-track`](https://github.com/lidofinance/easy-track/tree/4caa9117435631ef352d263c901fa9e26cfccfb4/contracts/EVMScriptFactories/lidoLendFactories) (PR #142). The MixBytes report also verifies their mainnet deployments against the audited commit.

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [Lido Lend Easy Track Factories](https://github.com/lidofinance/audits/blob/main/lend/2026-11-10-mixbytes-lido-lend-easy-track-factories-audit-report.pdf) | MixBytes | 2026-11-11 | Lido Lend Easy Track factories and `LidoLendPreseeder`, with mainnet deployment verification | [`4caa911`](https://github.com/lidofinance/easy-track/tree/4caa9117435631ef352d263c901fa9e26cfccfb4) |

The report lists 11 low-severity findings. Of these, 1 is fixed and 10 are acknowledged.

### Morpho Blue fork

The `lend` core is a fork of [Morpho Blue](https://github.com/morpho-org/morpho-blue), and `lend-irm` is a fork of [Morpho Blue IRM](https://github.com/morpho-org/morpho-blue-irm). The upstream Morpho audit reports kept in the `audits/` directory of both repositories cover only the upstream code, not the Lido changes. The Lido Lend code in `lend` and `lend-irm` is in the scope of the Cyfrin audit above. For the changes, see [`FORK_NOTES.md`](https://github.com/lidofinance/lend/blob/422d589f9d098124249b54b55306884165833207/FORK_NOTES.md) in `lend` and the [audit boundary](https://github.com/lidofinance/lend-irm/blob/566d31f7dfdf83d07a6593f641f7474c263a7f89/FORK_NOTES.md#audit-boundary) in `lend-irm`.

## Deployment verification

The deployed `lend-markets` code is matched to the Cyfrin audit by file digests. The audit report lists a keccak256 digest for each of the 53 in-scope files and an aggregate root. The deploy commit contains the digest tooling in [`script/config/mainnet/scripts/`](https://github.com/lidofinance/lend-markets/tree/538a0ec9e3ede626481d4b738b23d72e167bdc3d/script/config/mainnet/scripts):

- `extract-digests.py` extracts the digests from the report PDF into `digests.txt`;
- `digests.txt` lists the 53 digests with their file paths;
- `verify-digests.sh` checks the aggregate root, every audited file, the submodule pins and the deployed sources outside the audited set.

The keccak256 of the committed `digests.txt` equals the aggregate root in the audit report. Each of the 53 files at the deploy commit `538a0ec`, with `lend` at `422d589` and `lend-irm` at `566d31f`, matches its digest. The [GitHub comparison](https://github.com/lidofinance/lend-markets/compare/23416c43c4038ea3c00a13d6203949c8f88905cc..538a0ec9e3ede626481d4b738b23d72e167bdc3d) between the public commit `23416c4` and the deploy commit `538a0ec` shows no change to any file under `src/`. Both commits pin the same `lend` and `lend-irm` submodule commits.

The source code of the deployed mainnet contracts is verified on Etherscan.

### Deployment verification reports

| Report | Auditor | Date | Scope | Commit |
| --- | --- | --- | --- | --- |
| [Lido Lend Core Deployment Verification, Stage 1](https://github.com/lidofinance/audits/blob/main/lend/2026-11-11-cyfrin-lido-lend-core-deployment-verification.pdf) | Cyfrin | 2026-11-11 | Runtime bytecode, constructor arguments and immutables of the [Protocol](./deployed-contracts#protocol) contracts and the two Bundler3 adapters, and the `LidoLend` and `IrmRouter` proxies. As a supplementary check, the bytecode of `Bundler3` and the Lido Lend `CircuitBreaker` instance | `lend-markets` [`9c0ba34`](https://github.com/lidofinance/lend-markets/tree/9c0ba34580ab5cff4354be8cb701419fb02b65d5) |
| [Lido Lend Easy Track Factories](https://github.com/lidofinance/audits/blob/main/lend/2026-11-10-mixbytes-lido-lend-easy-track-factories-audit-report.pdf) | MixBytes | 2026-11-11 | Mainnet deployments of the Lido Lend Easy Track factories and `LidoLendPreseeder` | [`4caa911`](https://github.com/lidofinance/easy-track/tree/4caa9117435631ef352d263c901fa9e26cfccfb4) |

The Cyfrin verification commit `9c0ba34` follows the deploy commit `538a0ec` with one commit that changes deployment scripts and docs only; `src/` is the same. Stage 2, the verification of market deployments, is pending. The verification of each market deployment is listed on the market page.
