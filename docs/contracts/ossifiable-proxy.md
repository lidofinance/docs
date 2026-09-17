# OssifiableProxy

`OssifiableProxy` is an ERC-1967 proxy used for non-Aragon upgradeable contract deployments. Its admin can permanently disable upgrades by setting the proxy admin to the zero address.

There are several slightly different variants of the `OssifiableProxy` contract. They use different versions of the OpenZeppelin libraries, resulting in slightly different interfaces, but their core functionality remains the same. Every contract listed on this page is deployed behind one of the Lido variants described below; none of them use the vanilla OpenZeppelin `ERC1967Proxy` directly.

## Proxy variants

### Core variant

- [Source code](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/proxy/OssifiableProxy.sol)

Defined in the [core](https://github.com/lidofinance/core) repository. Written in Solidity 0.8.9 on top of the OpenZeppelin v4.4 `ERC1967Proxy`. The upgrade-and-call function takes three arguments: `proxy__upgradeToAndCall(address newImplementation_, bytes setupCalldata_, bool forceCall_)`.

### Staking modules variant

- [Source code](https://github.com/lidofinance/staking-modules/blob/v3.0/src/lib/proxy/OssifiableProxy.sol)

Defined in the [staking-modules](https://github.com/lidofinance/staking-modules) repository. Written in Solidity 0.8.33 on top of the OpenZeppelin v5 `ERC1967Proxy`. Following the OpenZeppelin v5 interface changes, the upgrade-and-call function takes two arguments — `proxy__upgradeToAndCall(address newImplementation_, bytes setupCalldata_)`.

## Core contracts

All core protocol contracts are deployed behind the [core variant](#core-variant):

- [LidoLocator](/contracts/lido-locator)
- [Accounting](/contracts/accounting)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [Burner](/contracts/burner)
- [TopUpGateway](https://etherscan.io/address/0x3FC2C71579D80790Aaa3fc7Be8B66ac39dC57374)
- [VaultHub](/contracts/vault-hub)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [OperatorGrid](/contracts/operator-grid)
- [ConsolidationMigrator](https://etherscan.io/address/0x9Dc70b5A4f4F5E4AF9058C983D560564F031f1D7)
- [ConsolidationBus](https://etherscan.io/address/0xd907CE33B4Be423823d1CFFe80BD147E8b8554C8)
- [AccountingOracle](/contracts/accounting-oracle)
- [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle)
- [LazyOracle](/contracts/lazy-oracle)

## Staking module contracts

### Community Staking Module

The following contracts are deployed behind the [staking modules variant](#staking-modules-variant):

- [CSModule](/staking-modules/contracts/CSModule)
- [Accounting](/staking-modules/contracts/Accounting)
- [ParametersRegistry](/staking-modules/contracts/ParametersRegistry)
- [FeeDistributor](/staking-modules/contracts/FeeDistributor)
- [FeeOracle](/staking-modules/contracts/FeeOracle)
- [ValidatorStrikes](/staking-modules/contracts/ValidatorStrikes)
- [ExitPenalties](/staking-modules/contracts/ExitPenalties)

#### Gates

- [Identified Community Stakers Gate](/staking-modules/contracts/VettedGate) — [staking modules variant](#staking-modules-variant)
- [Identified DVT Cluster Gate](/staking-modules/contracts/VettedGate) — [staking modules variant](#staking-modules-variant), as it was deployed later than the other CSM proxies

### Curated Module v2

All Curated Module v2 contracts, including the gates, are deployed behind the [staking modules variant](#staking-modules-variant):

- [CuratedModule](/staking-modules/contracts/CuratedModule)
- [MetaRegistry](/staking-modules/contracts/MetaRegistry)
- [Accounting](/staking-modules/contracts/Accounting)
- [ParametersRegistry](/staking-modules/contracts/ParametersRegistry)
- [FeeDistributor](/staking-modules/contracts/FeeDistributor)
- [FeeOracle](/staking-modules/contracts/FeeOracle)
- [ValidatorStrikes](/staking-modules/contracts/ValidatorStrikes)
- [ExitPenalties](/staking-modules/contracts/ExitPenalties)

#### Gates

- [Professional Operator Gate](/staking-modules/contracts/CuratedGate)
- [Professional Trusted Operator Gate](/staking-modules/contracts/CuratedGate)
- [Public Good Operator Gate](/staking-modules/contracts/CuratedGate)
- [Decentralization Operator Gate](/staking-modules/contracts/CuratedGate)
- [Extra Effort Operator Gate](/staking-modules/contracts/CuratedGate)
- [Intra-Operator DVT Cluster Gate](/staking-modules/contracts/CuratedGate)
- [Intra-Operator DVT Cluster Plus Gate](/staking-modules/contracts/CuratedGate)
