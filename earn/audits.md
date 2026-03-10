# Security

## Core Protocol Audits

Full security reviews of the Mellow MetaVaults core architecture, including Vault, Subvault, queues, Oracle, Verifier, ShareManager, FeeManager, and RiskManager.

| Report | Auditor | Date | Scope | Commit |
| ------ | ------- | ---- | ----- | ------ |
| [Mellow Core Vaults](/audits/mellow/2025-07-28_Sherlock_Mellow-Core-Vaults.pdf) | Sherlock | 2025-07-28 | Modular vault infrastructure for institutional-grade asset management on EVM chains | [`c2d66f3`](https://github.com/mellow-finance/flexible-vaults/commit/c2d66f36333d9f29457399fa54ddc68079d7b0a9) |
| [Mellow Core Vaults](/audits/mellow/2025-09-03_Nethermind_Mellow-Core-Vaults.pdf) | Nethermind | 2025-09-03 | Core protocol contracts: Vault, Subvault, queues, Oracle, Verifier, and managers | [`69413d5`](https://github.com/mellow-finance/flexible-vaults/commit/69413d545f788c0ad4ff7fe08085fb55589c5c61) |

## Module and Incremental Audits

Focused reviews of individual modules and contract updates.

| Report | Auditor | Date | Scope | Commit |
| ------ | ------- | ---- | ----- | ------ |
| [NM-0682 Migrator](/audits/mellow/2025-10-15_Nethermind_NM-0682_Mellow.pdf) | Nethermind | 2025-10-15 | Migrator contract for migrating MultiVault instances into new core vaults | [`a04e285`](https://github.com/mellow-finance/flexible-vaults/commit/a04e285fe859dcd720e8b827628a98d0cc46c02c) |
| [NM-0703 Oracle Submitter](/audits/mellow/2025-11-17_Nethermind_NM-0703_Mellow.pdf) | Nethermind | 2025-11-17 | OracleSubmitter — Chainlink-compatible price feed adapter for oracle price reports | [`d3bf393`](https://github.com/mellow-finance/flexible-vaults/commit/d3bf393) |
| [NM-0735 Swap Module](/audits/mellow/2025-11-19_Nethermind_NM-0735_Mellow.pdf) | Nethermind | 2025-11-19 | SwapModule for permissioned token swaps via DEX aggregators and CoW Protocol | [`688382e`](https://github.com/mellow-finance/flexible-vaults/commit/688382e) |
| [NM-0758 SyncDepositQueue](/audits/mellow/2025-12-09_Nethermind_NM-0758_Mellow.pdf) | Nethermind | 2025-12-09 | SyncDepositQueue for instant synchronous deposits with oracle-price-based adjustment | [`f4c311b`](https://github.com/mellow-finance/flexible-vaults/commit/f4c311b73c3b2eaae01e8e668f6df2fef6aee048) |
| [NM-0798 BurnableTokenizedShareManager](/audits/mellow/2026-01-07_Nethermind_NM-0798_Mellow.pdf) | Nethermind | 2026-01-07 | BurnableTokenizedShareManager enabling public ERC20 burn/burnFrom for vault shares | [`09d8155`](https://github.com/mellow-finance/flexible-vaults/commit/09d81553d719f38ace8a646551d6b043c345df8a) |
| [NM-0812 Redeem Queue Fee Fix](/audits/mellow/2026-01-21_Nethermind_NM-0812_Mellow.pdf) | Nethermind | 2026-01-21 | Fee transfer fix from ShareManager to feeRecipient via burn and mint | [`685be83`](https://github.com/mellow-finance/flexible-vaults/commit/685be83) |
| [NM-0758 SyncDepositQueue](/audits/mellow/2026-03-02_Nethermind_NM-0758_Mellow.pdf) | Nethermind | 2026-03-02 | Updated review of SyncDepositQueue reflecting a fix identified on Feb 27, 2026 | [`c9c7181`](https://github.com/mellow-finance/flexible-vaults/commit/c9c71818f0a8bead183f9860db3b8bbceb7b8f37) |

## Bug Bounty

[Mellow Core Vaults Bug Bounty](https://audits.sherlock.xyz/bug-bounties/125) is a live bug bounty on the Sherlock platform, inviting security researchers to find and report vulnerabilities in the Mellow Core Vaults system. The program offers up to 100,000 USDC in rewards for valid findings and is part of Sherlock's ongoing post-deployment security incentives.
