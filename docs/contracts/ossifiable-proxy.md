# OssifiableProxy

`OssifiableProxy` is an ERC-1967 proxy used for non-Aragon upgradeable contract deployments. Its admin can permanently disable upgrades by setting the proxy admin to the zero address.

There are several slightly different variants of the `OssifiableProxy` contract. They use different versions of the OpenZeppelin libraries, resulting in slightly different interfaces, but their core functionality remains the same.

## Core contracts

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

- [CSModule](/staking-modules/csm/contracts/CSModule)
- [Accounting](/staking-modules/csm/contracts/Accounting)
- [ParametersRegistry](/staking-modules/csm/contracts/ParametersRegistry)
- [FeeDistributor](/staking-modules/csm/contracts/FeeDistributor)
- [FeeOracle](/staking-modules/csm/contracts/FeeOracle)
- [ValidatorStrikes](/staking-modules/csm/contracts/ValidatorStrikes)
- [ExitPenalties](/staking-modules/csm/contracts/ExitPenalties)

#### Gates

- [Identified Community Stakers Gate](/staking-modules/csm/contracts/VettedGate)
- [Identified DVT Cluster Gate](/staking-modules/csm/contracts/VettedGate)

### Curated Module v2

- [CuratedModule](/staking-modules/cm-v2/contracts/CuratedModule)
- [MetaRegistry](/staking-modules/cm-v2/contracts/MetaRegistry)
- [Accounting](/staking-modules/cm-v2/contracts/Accounting)
- [ParametersRegistry](/staking-modules/cm-v2/contracts/ParametersRegistry)
- [FeeDistributor](/staking-modules/cm-v2/contracts/FeeDistributor)
- [FeeOracle](/staking-modules/cm-v2/contracts/FeeOracle)
- [ValidatorStrikes](/staking-modules/cm-v2/contracts/ValidatorStrikes)
- [ExitPenalties](/staking-modules/cm-v2/contracts/ExitPenalties)

#### Gates

- [Professional Operator Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Professional Trusted Operator Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Public Good Operator Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Decentralization Operator Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Extra Effort Operator Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Intra-Operator DVT Cluster Gate](/staking-modules/cm-v2/contracts/CuratedGate)
- [Intra-Operator DVT Cluster Plus Gate](/staking-modules/cm-v2/contracts/CuratedGate)
