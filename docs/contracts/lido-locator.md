# LidoLocator

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.9/LidoLocator.sol)
- [Deployed contract](https://etherscan.io/address/0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb)

LidoLocator is the universal address book for the Lido protocol.
It follows the well-known [service locator](https://en.wikipedia.org/wiki/Service_locator_pattern) pattern.

## Upgradability

The contract uses [OssifiableProxy](/contracts/ossifiable-proxy) for upgradability and
does not use storage for the address book. Instead, all addresses are embedded into
the implementation's bytecode as immutables for gas efficiency, allowing one to
update them along with a proxy implementation.

## Methods

### accountingOracle()

Returns an address of the [AccountingOracle contract](/contracts/accounting-oracle)

```sol
function accountingOracle() view returns(address);
```

### accounting()

Returns an address of the [Accounting contract](/contracts/accounting).

```sol
function accounting() view returns(address);
```

### depositSecurityModule()

Returns an address of the [DepositSecurityModule contract](/contracts/deposit-security-module)

```sol
function depositSecurityModule() view returns(address);
```

### elRewardsVault()

Returns an address of the [LidoExecutionLayerRewardsVault contract](/contracts/lido-execution-layer-rewards-vault)

```sol
function elRewardsVault() view returns(address);
```

### lido()

Returns an address of the [Lido contract](/contracts/lido)

```sol
function lido() external view returns(address);
```

### oracleReportSanityChecker()

Returns an address of the [OracleReportSanityChecker contract](/contracts/oracle-report-sanity-checker)

```sol
function oracleReportSanityChecker() view returns(address);
```

### burner()

Returns an address of the [Burner contract](/contracts/burner)

```sol
function burner() view returns(address);
```

### stakingRouter()

Returns an address of the [StakingRouter contract](/contracts/staking-router)

```sol
function stakingRouter() view returns(address);
```

### treasury()

Returns an address of the treasury

```sol
function treasury() view returns(address);
```

### validatorsExitBusOracle()

Returns an address of the [ValidatorsExitBusOracle contract](/contracts/validators-exit-bus-oracle)

```sol
function validatorsExitBusOracle() external view returns(address);
```

### withdrawalQueue()

Returns an address of the [WithdrawalQueueERC721 contract](/contracts/withdrawal-queue-erc721)

```sol
function withdrawalQueue() view returns(address);
```

### withdrawalVault()

Returns an address of the [WithdrawalVault contract](/contracts/withdrawal-vault)

```sol
function withdrawalVault() view returns(address);
```

### postTokenRebaseReceiver()

Returns an address of the contract following the `IPostTokenRebaseReceiver`
interface described inside `Lido`.

```sol
function postTokenRebaseReceiver() view returns(address);
```

### oracleDaemonConfig()

Returns an address of the [OracleDaemonConfig contract](/contracts/oracle-daemon-config)

```sol
function oracleDaemonConfig() view returns(address);
```

### triggerableWithdrawalsGateway()

Returns an address of the [TriggerableWithdrawalsGateway contract](/contracts/triggerable-withdrawals-gateway)

```sol
function triggerableWithdrawalsGateway() view returns(address);
```

### validatorExitDelayVerifier()

Returns an address of the [ValidatorExitDelayVerifier contract](/contracts/validator-exit-delay-verifier)

```sol
function validatorExitDelayVerifier() view returns(address);
```

### predepositGuarantee()

Returns an address of the [PredepositGuarantee contract](/contracts/predeposit-guarantee)

```sol
function predepositGuarantee() view returns(address);
```

### wstETH()

Returns an address of the [wstETH contract](/contracts/wsteth)

```sol
function wstETH() view returns(address);
```

### vaultHub()

Returns an address of the [VaultHub contract](/contracts/vault-hub)

```sol
function vaultHub() view returns(address);
```

### vaultFactory()

Returns an address of the [VaultFactory contract](/contracts/staking-vault-factory)

```sol
function vaultFactory() view returns(address);
```

### lazyOracle()

Returns an address of the [LazyOracle contract](/contracts/lazy-oracle)

```sol
function lazyOracle() view returns(address);
```

### operatorGrid()

Returns an address of the [OperatorGrid contract](/contracts/operator-grid)

```sol
function operatorGrid() view returns(address);
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
);
```

### oracleReportComponents()

Returns a batch of addresses that is used specifically during oracle report
handling in the Lido contract.

It's just a more gas-efficient way of calling several public getters at once.

```sol
function oracleReportComponents() view returns(
    address accountingOracle,
    address oracleReportSanityChecker,
    address burner,
    address withdrawalQueue,
    address postTokenRebaseReceiver,
    address stakingRouter,
    address vaultHub
);
```
