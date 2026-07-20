# Security

## Core Protocol Audits

Full security reviews of the Mellow MetaVaults core architecture, including Vault, Subvault, queues, Oracle, Verifier, ShareManager, FeeManager, and RiskManager.

| Report | Auditor | Date | Scope | Commit |
| ------ | ------- | ---- | ----- | ------ |
| [Mellow Core Vaults](https://github.com/lidofinance/audits/blob/main/earn/2025-07-28_Sherlock_Mellow-Core-Vaults.pdf) | Sherlock | 2025-07-28 | Modular vault infrastructure for institutional-grade asset management on EVM chains | [`c2d66f3`](https://github.com/mellow-finance/flexible-vaults/commit/c2d66f36333d9f29457399fa54ddc68079d7b0a9) |
| [Mellow Core Vaults](https://github.com/lidofinance/audits/blob/main/earn/2025-09-03_Nethermind_Mellow-Core-Vaults.pdf) | Nethermind | 2025-09-03 | Core protocol contracts: Vault, Subvault, queues, Oracle, Verifier, and managers | [`69413d5`](https://github.com/mellow-finance/flexible-vaults/commit/69413d545f788c0ad4ff7fe08085fb55589c5c61) |

## Module and Incremental Audits

Focused reviews of individual modules and contract updates.

| Report | Auditor | Date | Scope | Commit |
| ------ | ------- | ---- | ----- | ------ |
| [NM-0703 Oracle Submitter](https://github.com/lidofinance/audits/blob/main/earn/2025-11-17_Nethermind_NM-0703_Mellow.pdf) | Nethermind | 2025-11-17 | OracleSubmitter — Chainlink-compatible price feed adapter for oracle price reports | [`d3bf393`](https://github.com/mellow-finance/flexible-vaults/commit/d3bf393) |
| [NM-0735 Swap Module](https://github.com/lidofinance/audits/blob/main/earn/2025-11-19_Nethermind_NM-0735_Mellow.pdf) | Nethermind | 2025-11-19 | SwapModule for permissioned token swaps via DEX aggregators and CoW Protocol | [`688382e`](https://github.com/mellow-finance/flexible-vaults/commit/688382e) |
| [NM-0758 SyncDepositQueue](https://github.com/lidofinance/audits/blob/main/earn/2025-12-09_Nethermind_NM-0758_Mellow.pdf) | Nethermind | 2025-12-09 | SyncDepositQueue for instant synchronous deposits with oracle-price-based adjustment | [`f4c311b`](https://github.com/mellow-finance/flexible-vaults/commit/f4c311b73c3b2eaae01e8e668f6df2fef6aee048) |
| [NM-0798 BurnableTokenizedShareManager](https://github.com/lidofinance/audits/blob/main/earn/2026-01-07_Nethermind_NM-0798_Mellow.pdf) | Nethermind | 2026-01-07 | BurnableTokenizedShareManager enabling public ERC20 burn/burnFrom for vault shares | [`09d8155`](https://github.com/mellow-finance/flexible-vaults/commit/09d81553d719f38ace8a646551d6b043c345df8a) |
| [NM-0812 Redeem Queue Fee Fix](https://github.com/lidofinance/audits/blob/main/earn/2026-01-21_Nethermind_NM-0812_Mellow.pdf) | Nethermind | 2026-01-21 | Fee transfer fix from ShareManager to feeRecipient via burn and mint | [`685be83`](https://github.com/mellow-finance/flexible-vaults/commit/685be83) |
| [NM-0758 SyncDepositQueue](https://github.com/lidofinance/audits/blob/main/earn/2026-03-02_Nethermind_NM-0758_Mellow.pdf) | Nethermind | 2026-03-02 | Updated review of SyncDepositQueue reflecting a fix identified on Feb 27, 2026 | [`c9c7181`](https://github.com/mellow-finance/flexible-vaults/commit/c9c71818f0a8bead183f9860db3b8bbceb7b8f37) |
| [NM-0891 PermissionedChainlinkOracle](https://github.com/lidofinance/audits/blob/main/earn/2026-04-13_Nethermind_NM-0891_Mellow.pdf) | Nethermind | 2026-04-13 | PermissionedChainlinkOracle — administrative Chainlink-compatible price feed for exotic assets without native oracle support | [`bcf37ae`](https://github.com/mellow-finance/flexible-vaults/commit/bcf37aef95cefc45be9c4b8988126c5f7d3d6788) |
| [MixBytes SyncRedeemQueue](https://github.com/lidofinance/audits/blob/main/earn/2026-07-15_MixBytes_Mellow-SyncRedeemQueue.pdf) | MixBytes | 2026-07-15 | SyncRedeemQueue for instant synchronous redemptions priced against the latest oracle report | [`69bbaf1`](https://github.com/mellow-finance/flexible-vaults/commit/69bbaf17530dc5127ecf9049cceaab141f516a1e) |

## Utility Contract Audits

Reviews of one-off helper contracts: migrators and swap utilities.

| Report | Auditor | Date | Scope | Commit |
| ------ | ------- | ---- | ----- | ------ |
| [NM-0682 Migrator](https://github.com/lidofinance/audits/blob/main/earn/2025-10-15_Nethermind_NM-0682_Mellow.pdf) | Nethermind | 2025-10-15 | Migrator contract for migrating MultiVault instances into new core vaults | [`a04e285`](https://github.com/mellow-finance/flexible-vaults/commit/a04e285fe859dcd720e8b827628a98d0cc46c02c) |
| [MixBytes ATokenWstETHSwap](https://github.com/lidofinance/audits/blob/main/earn/2026-04-21_MixBytes_Lido-ATokenWstETHSwap.pdf) | MixBytes | 2026-04-21 | ATokenWstETHSwap contract for exchanging Aave aTokens for wstETH | [`00432c9`](https://github.com/lidofinance/atoken-wsteth-swap/commit/00432c9a76049dfd9ab0804dfa892ff3ea4b89af) |
| [MixBytes GGV Migrator](https://github.com/lidofinance/audits/blob/main/earn/2026-04-24_MixBytes_Lido-GGV-Migrator.pdf) | MixBytes | 2026-04-24 | Migrator contract for migrating GGV positions into Earn vaults | [`da93276`](https://github.com/mellow-finance/flexible-vaults/commit/da932764a3e9fbc71127f39aa1006a2ddf73d46c) |
| [MixBytes GGV Migrator V2](https://github.com/lidofinance/audits/blob/main/earn/2026-05-27_MixBytes_Lido-GGV-Migrator-V2.pdf) | MixBytes | 2026-05-27 | Updated review of the GGV Migrator contract | [`07adcc0`](https://github.com/mellow-finance/flexible-vaults/commit/07adcc04ecc3279edb9de0b67194ab0a91dbe025) |
| [MixBytes AAVE Migrator](https://github.com/lidofinance/audits/blob/main/earn/2026-06-08_MixBytes_Lido-AAVE-Migrator.pdf) | MixBytes | 2026-06-08 | AaveMigrator contract for migrating Aave positions into Earn vaults | [`82b1849`](https://github.com/mellow-finance/flexible-vaults/commit/82b1849c30f26f0c2a7940feb28bc6c5937ca791) |

## Bug Bounty

[Mellow Core Vaults Bug Bounty](https://audits.sherlock.xyz/bug-bounties/125) is a live bug bounty on the Sherlock platform, inviting security researchers to find and report vulnerabilities in the Mellow Core Vaults system. The program offers up to 100,000 USDC in rewards for valid findings and is part of Sherlock's ongoing post-deployment security incentives.
