# StakingRouter

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/StakingRouter.sol)
- [Deployed contract](https://etherscan.io/address/0xFdDf38947aFB03C621C71b06C9C70bce73f12999)

StakingRouter acts primarily as a registry for staking modules, each encapsulating a certain validator subset,
e.g. Lido DAO-curated staking module [previously known as a node operators registry](/contracts/node-operators-registry).
The contract manages stake allocations and fee distribution and track important statistics about the modules.

## What Was It Necessary?

Lido's overarching aim is to maintain a robust and diverse validator set. The previous monolithic architecture made it challenging to incorporate new mechanisms and test different validator approaches. To enhance flexibility and accelerate the protocol's evolution, StakingRouter was introduced.

StakingRouter simplified the Lido protocol validator set scalability by replacing the monolithic registry with modular components. Each of these modules is responsible for managing their specific validator subsets, i.e. staking modules.

## What Does It Do?

StakingRouter performs a number of functionalities: staking module registry and management, tracking module statistics, stake allocation and fee distribution.

### Staking Module Management

Staking modules can be added and updated, allowing for changes in target share, module fees, and treasury fees. Staking module control and status are managed through the contract, allowing for the setting of participation status, pausing and resuming of deposits, and checking the current status of staking modules.

### Staking Module Statistics

The contract provides summary and digest information, offering an overview of validators within staking modules and detailed summaries for individual node operators. These summaries include relevant statistics such as the number of exited validators, total deposited validators, and depositable validators count. The contract keeps track of the total number of exited validators for each staking module and allows for the reporting and updating of stuck and exited validator counts for node operators within a staking module.

### Stake Allocation

As the name suggests, the contract routes incoming stake to staking modules based on the module capacity, depositable validators and DAO-imposed target share. The allocation algorithm follows the min-first strategy where the module with the least stake take priority and when two or more modules are at the same level, the stake is split equally between them.

### Fee Distribution

StakingRouter also keeps track the protocol rewards based on the module and treasury shares. On each Oracle report, the Lido contract distributes rewards by minting shares to staking modules and treasury based on the data provided by StakingRouter.

See also:

- [LIP-20. Staking Router](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-20.md)
- [Staking Router Explained](https://twitter.com/LidoFinance/status/1624071971011977219?s=20) (twitter thread)
