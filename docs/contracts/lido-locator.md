# LidoLocator

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/LidoLocator.sol)
- [Deployed contract](https://etherscan.io/address/0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb)

LidoLocator is the universal address book for the Lido protocol.
It follows the well-known [service locator](https://en.wikipedia.org/wiki/Service_locator_pattern) pattern.

## Upgradability

The contract uses [OssifiableProxy](./ossifiable-proxy.md) for upgradability and
does not use storage for the address book. Instead, all addresses are embedded into
the implementation's bytecode as immutables for gas efficiency, allowing one to
update them along with a proxy implementation.

## Methods

### accountingOracle()

Returns an address of the [AccountingOracle contract](./accounting-oracle.md)

```sol
function accountingOracle() view returns(address);
```

### depositSecurityModule()

Returns an address of the [DepositSecurityModule contract](./deposit-security-module.md)

```sol
function depositSecurityModule() view returns(address)
```

### elRewardsVault()

Returns an address of the [LidoExecutionLayerRewardsVault contract](./lido-execution-layer-rewards-vault.md)

```sol
function elRewardsVault() view returns(address)
```

### legacyOracle()

Returns an address of the [LegacyOracle contract](./legacy-oracle.md)

```sol
function legacyOracle() external view returns(address)
```

### lido()

Returns an address of the [Lido contract](./lido.md)

```sol
function lido() external view returns(address)
```

### oracleReportSanityChecker()

Returns an address of the [OracleReportSanityChecker contract](./oracle-report-sanity-checker.md)

```sol
function oracleReportSanityChecker() view returns(address)
```

### burner()

Returns an address of the [Burner contract](./burner.md)

```sol
function burner() view returns(address)
```

### stakingRouter()

Returns an address of the [StakingRouter contract](./staking-router.md)

```sol
function stakingRouter() view returns(address)
```

### treasury()

Returns an address of the treasury

```sol
function treasury() view returns(address)
```

### validatorsExitBusOracle()

Returns an address of the [ValidatorsExitBusOracle contract](./validators-exit-bus-oracle.md)

```sol
function validatorsExitBusOracle() external view returns(address)
```

### withdrawalQueue()

Returns an address of the [WithdrawalQueueERC721 contract](./withdrawal-queue-erc721.md)

```sol
function withdrawalQueue() view returns(address)
```

### withdrawalVault()

Returns an address of the [WithdrawalVault contract](./withdrawal-vault.md)

```sol
function withdrawalVault() view returns(address)
```

### postTokenRebaseReceiver()

Returns an address of the contract following the [`IPostTokenRebaseReceiver`](https://github.com/lidofinance/lido-dao/blob/cadffa46a2b8ed6cfa1127fca2468bae1a82d6bf/contracts/0.4.24/Lido.sol#L20-L30) interface described inside `Lido`.
Right now it returns the [LegacyOracle](./legacy-oracle.md) address.

```sol
function postTokenRebaseReceiver() view returns(address);
```

### oracleDaemonConfig()

Returns an address of the [OracleDaemonConfig contract](./oracle-daemon-config.md)

```sol
function oracleDaemonConfig() view returns(address)
```

### coreComponents()

Returns a batch of core components addresses at once.

It's just a more gas-efficient way of calling several public getters at once.

```sol
function coreComponents() view returns(
    address elRewardsVault,
    address oracleReportSanityChecker,
    address stakingRouter,
    address treasury,
    address withdrawalQueue,
    address withdrawalVault
)
```

### oracleReportComponentsForLido()

Returns a batch of addresses that is used specifically during oracle report
handling in the Lido contract.

It's just a more gas-efficient way of calling several public getters at once.

```sol
function oracleReportComponentsForLido() view returns(
    address accountingOracle,
    address elRewardsVault,
    address oracleReportSanityChecker,
    address burner,
    address withdrawalQueue,
    address withdrawalVault,
    address postTokenRebaseReceiver
)
```
