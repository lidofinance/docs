# OssifiableProxy

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/proxy/OssifiableProxy.sol)
- [Source code of `WithdrawalsManagerProxy`](https://github.com/lidofinance/withdrawals-manager-stub/blob/main/contracts/WithdrawalsManagerProxy.sol)

Deployed instances:

- [LidoLocator](/contracts/lido-locator)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [WithdrawalVault](/contracts/withdrawal-vault) (uses `WithdrawalsManagerProxy`)
- [AccountingOracle](/contracts/accounting-oracle)
- [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle)

A common proxy contract that used for Lido non-Aragon upgradable contract deployments.
Follows the [ERC1967](https://eips.ethereum.org/EIPS/eip-1967) proxy standard and allows ossification
(set proxy owner to zero address) for the final implementation version.
