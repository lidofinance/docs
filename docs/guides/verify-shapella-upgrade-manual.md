# Shapella mainnet parameters

## Mainnet addresses

```python
lidoLocator = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
legacyOracle = 0x442af784A788A5bd6F42A01Ebe9F287a871243fb  # was `LidoOracle` before

# See https://docs.lido.fi/deployed-contracts/
# Old implementation was `Withdrawals Manager Stub`
withdrawalsVault = 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f

# Same as withdrawalsVault with 0x01 type prefix
# also see https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F23
withdrawalsCredentials = 0x010000000000000000000000b9d7934878b5fb9610b3fe8a5e441e8fad7e293f
```

## NodeOperatorsRegistry

```python
# See https://research.lido.fi/t/lido-validator-exits-policy-draft-for-discussion/3864/5
stuckPenaltyDelay = 432000  # 5 days as seconds
```

## OracleDaemonConfig

```python
# See https://research.lido.fi/t/withdrawals-for-lido-on-ethereum-bunker-mode-design-and-implementation/3890
# BASE_REWARD_FACTOR: https://ethereum.github.io/consensus-specs/specs/phase0/beacon-chain/#rewards-and-penalties
NORMALIZED_CL_REWARD_PER_EPOCH=64
NORMALIZED_CL_REWARD_MISTAKE_RATE_BP=1000  # 10%
REBASE_CHECK_NEAREST_EPOCH_DISTANCE=1
REBASE_CHECK_DISTANT_EPOCH_DISTANCE=23  # 10% of AO 225 epochs frame

# See https://research.lido.fi/t/lido-validator-exits-policy-draft-for-discussion/3864/6
VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS=7200  # 1 day
VALIDATOR_DELINQUENT_TIMEOUT_IN_SLOTS=28800  # 4 days
NODE_OPERATOR_NETWORK_PENETRATION_THRESHOLD_BP=100  # 1% network penetration for a single NO

# Time period of historical observations used for prediction of the rewards amount 
PREDICTION_DURATION_IN_SLOTS=50400  # 7 days

# Max period of delay for requests finalization in case of bunker due to negative rebase
FINALIZATION_MAX_NEGATIVE_REBASE_EPOCH_SHIFT=1350  # 6 days (twice min governance response time - 3 days voting duration)
```

## OracleReportSanityChecker

```python
# # Sanity limit on the number of deposits: not more than ~half of the current DSM deposits capacity (43200 it is)
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L221-L232
churnValidatorsPerDayLimit = 20000

# Taken from current oracle limit https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F8
# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L47-L50
oneOffCLBalanceDecreaseBPLimit = 500  # 5%

# See https://research.lido.fi/t/increasing-max-apr-sanity-check-for-oracle-lido-report/3205
annualBalanceIncreaseBPLimit = 1000  # 10%

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L647-L672
simulatedShareRateDeviationBPLimit = 50

# Same as the current churn limit in Ethereum (8 validators per epoch)
maxValidatorExitRequestsPerReport = 600

# Number of currently possible extra data list items types
maxAccountingExtraDataListItemsCount = 2

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L69-L71
# and https://github.com/lidofinance/lido-dao/blob/e45c4d6fb8120fd29426b8d969c19d8a798ca974/contracts/0.8.9/oracle/AccountingOracle.sol#L302-L306
maxNodeOperatorsPerExtraDataItemCount = 100

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L73-L75
requestTimestampMargin = 7680  # 2 hours rounded to epoch length

# 27% yearly, in 1e9 so that it multiplied on 365 (link to code)
# see https://research.lido.fi/t/increasing-max-apr-sanity-check-for-oracle-lido-report/3205
# and https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L77-L79
maxPositiveTokenRebase = 750000
```

## Burner

```python
# See https://vote.lido.fi/vote/106
# and https://etherscan.io/address/0xB280E33812c0B09353180e92e27b8AD399B07f26#readContract#F7
totalNonCoverSharesBurnt = 32145684728326685744
totalCoverSharesBurnt = 0

# See https://docs.lido.fi/deployed-contracts/
_admin = 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c  # Agent
_treasury = 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c  # Agent
_stETH = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
```

## DepositSecurityModule

```python
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F10
maxDepositsPerBlock = 150
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F11
minDepositBlockDistance = 25
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F14
pauseIntentValidityPeriodBlocks = 6646
```

## AccountingOracle
And its corresponding `HashConsensus`.

```python
# Same as for current Oracle see https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F30
epochsPerFrame = 225  # once per day
# So, the AccountingOracle expected report time would be ~12:00 UTC

# Number of slots dedicated for delay during oracles rotation including finalization time
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/HashConsensus.sol#L370-L398
fastLaneLengthSlots = 100

# See https://docs.lido.fi/deployed-contracts/
lidoLocator = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
lido = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
legacyOracle = 0x442af784A788A5bd6F42A01Ebe9F287a871243fb
```

## ValidatorsExitBusOracle
And its corresponding `HashConsensus`.

```python
epochsPerFrame = 75  # thrice per day
# So, the ValidatorsExitBusOracle expected report time would be 
# ~4:00 UTC, ~12:00 UTC, ~20:00 UTC

# Number of slots dedicated for delay during oracles rotation
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/HashConsensus.sol#L370-L398
fastLaneLengthSlots = 30

lidoLocator = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
```

## AccountingOracle and ValidatorsExitBusOracle

```python
secondsPerSlot = 12

# See https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21 and  https://github.com/ethereum/consensus-specs/blob/dev/configs/mainnet.yaml#L28 
# Also its as it is in the current oracle https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F30
genesisTime = 1606824023
```

## WithdrawalQueueERC712

```python
_wstETH = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0
_name = "Lido: stETH Withdrawal NFT"
_symbol = "unstETH"
_tokenURI = "https://wq-api.lido.fi/v1/nft"
```

## WithdrawalsVault

```python
_lido = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 
_treasury = 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c  # Agent
```

## EIP712StETH

```python
_stETH = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
```

## StakingRouter

```python
# See https://ethereum.org/en/staking/deposit-contract/
_depositContract = 0x00000000219ab540356cBB839Cbe05303d7705Fa
```

## GateSeal

```python
seal_duration = 518400  # 6 days as seconds (2 x governance response time - vote duration is 3 days)
expiry_timestamp = 1714521600  # 2024-05-01 00:00 UTC
```

## Roles setup

Contracts ACL denotion:
- mark "*Aragon app*" means the contract is Aragon app which uses [Aragon ACL model](https://hack.aragon.org/developers/tools/aragonos/reference-documentation)
- mark "*OZ*" means the contract uses [OpenZeppelin ACL model](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
- mark "*Proxy*" means the contract is deployed behind a proxy so has an additional [ACL model related to the proxy](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/proxy/OssifiableProxy.sol)

### **Lido**
*Aragon app*

**New**
- `UNSAFE_CHANGE_DEPOSITED_VALIDATORS_ROLE`
    - None

**Kept**
- `PAUSE_ROLE`
    - Voting
- `RESUME_ROLE`
    - Voting
- `STAKING_PAUSE_ROLE`
    - Voting
- `STAKING_CONTROL_ROLE`
    - Voting

**Obsolete**
*To be revoked at voting.*
- `MANAGE_FEE`
- `MANAGE_WITHDRAWAL_KEY`
- `MANAGE_PROTOCOL_CONTRACTS_ROLE`
- `BURN_ROLE`
- `DEPOSIT_ROLE`
- `SET_EL_REWARDS_VAULT_ROLE`
- `SET_EL_REWARDS_WITHDRAWAL_LIMIT_ROLE`

### **NodeOperatorsRegistry**
*Aragon app*

**New**
- `STAKING_ROUTER_ROLE`
    - StakingRouter (set in voting script)
      *To be granted at voting.*
- `MANAGE_NODE_OPERATOR_ROLE`
    - None

**Kept**
- `MANAGE_SIGNING_KEYS`
	- Voting
- `SET_NODE_OPERATOR_LIMIT_ROLE`
	- Voting
	- Easytrack EVMScriptExecutor

**Obsolete**
*To be revoked at voting.*
- `ADD_NODE_OPERATOR_ROLE`
- `SET_NODE_OPERATOR_ACTIVE_ROLE`
- `SET_NODE_OPERATOR_NAME_ROLE`
- `SET_NODE_OPERATOR_ADDRESS_ROLE`
- `REPORT_STOPPED_VALIDATORS_ROLE`

### **LegacyOracle (former LidoOracle)**
*Aragon app*

**New**
None

**Kept**
None

**Obsolete**
*To be revoked at voting.*
- `MANAGE_MEMBERS`
- `MANAGE_QUORUM`
- `SET_BEACON_SPEC`
- `SET_REPORT_BOUNDARIES`
- `SET_BEACON_REPORT_RECEIVER`

### **AccountingOracle**
*OZ, Proxy*

- PROXY ADMIN
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - None
    - After enactment:
	    - Agent
- `SUBMIT_DATA_ROLE`
    - None
- `MANAGE_CONSENSUS_CONTRACT_ROLE`
    - None
- `MANAGE_CONSENSUS_VERSION_ROLE`
    - None

### **Burner**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
        - Template
    - After enactment:
        - Agent
- `REQUEST_BURN_SHARES_ROLE`
    - Before vote start:
        - Lido (set in Burner constructor)
    - After enactment:
        - Lido (set in Burner constructor)
        - NodeOperatorsRegistry
- `REQUEST_BURN_MY_STETH_ROLE`
    - None
- `RECOVER_ASSETS_ROLE`
    - None

### **LidoLocator**
*OZ, Proxy*

- PROXY ADMIN
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent

### **StakingRouter**
*OZ, Proxy*

- PROXY ADMIN
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - None
    - After enactment:
	    - Agent
- `MANAGE_WITHDRAWAL_CREDENTIALS_ROLE`
    - None
- `STAKING_MODULE_PAUSE_ROLE`
    - DepositSecurityModule
- `STAKING_MODULE_RESUME_ROLE`
    - DepositSecurityModule
- `STAKING_MODULE_MANAGE_ROLE`
    - None
- `REPORT_EXITED_VALIDATORS_ROLE`
    - AccountingOracle
- `UNSAFE_SET_EXITED_VALIDATORS_ROLE`
    - None
- `REPORT_REWARDS_MINTED_ROLE`
    - Lido

### **HashConsensus for AccountingOracle**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `MANAGE_MEMBERS_AND_QUORUM_ROLE`
    - None
- `DISABLE_CONSENSUS_ROLE`
    - None
- `MANAGE_FRAME_CONFIG_ROLE`
    - None
- `MANAGE_FAST_LANE_CONFIG_ROLE`
    - None
- `MANAGE_REPORT_PROCESSOR_ROLE`
    - None
- `address[] _memberAddresses`
	- Before vote start:
	    - None
	- After enactment:
	    - Current LidoOracle Committee
	       See https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28

### **DepositSecurityModule**
*Plain Owner, No Proxy*

- owner
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- guardians
	- Before vote start:
	    - None
	- After enactment:
	    - Current DSM guardians committee
	       See https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F8

### **HashConsensus for ValidatorExitBusOracle**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `MANAGE_MEMBERS_AND_QUORUM_ROLE`
    - None
- `DISABLE_CONSENSUS_ROLE`
    - None
- `MANAGE_FRAME_CONFIG_ROLE`
    - None
- `MANAGE_FAST_LANE_CONFIG_ROLE`
    - None
- `MANAGE_REPORT_PROCESSOR_ROLE`
    - None
- `address[] _memberAddresses`
	- Before vote start:
		- None
	- After enactment:
		- Current LidoOracle Committee
		  See https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28

### **OracleDaemonConfig**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
    - Agent
- `CONFIG_MANAGER_ROLE`
    - None

### **OracleReportSanityChecker**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE` (set in constructor)
    - Agent
- `ALL_LIMITS_MANAGER_ROLE`
- `CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE`
- `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE`
- `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE`
- `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE`
- `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE`
- `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE`
- `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE`
- `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE`
- `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE`
    - None for all roles listed above

### **ValidatorExitBusOracle**
*OZ, Proxy*

- PROXY ADMIN
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - None
    - After enactment:
	    - Agent
- `PAUSE_ROLE` (in initializer)
	- Before vote start:
	    - None
	- After enactment:
	    - Gate Seal
- `RESUME_ROLE` (in initialize)
    - None
- `SUBMIT_DATA_ROLE`
    - None
- `MANAGE_CONSENSUS_CONTRACT_ROLE`
    - None
- `MANAGE_CONSENSUS_VERSION_ROLE`
    - None

### **WithdrawalQueueERC721**
*OZ, Proxy*

- PROXY ADMIN
    - Before vote start:
	    - Template
    - After enactment:
	    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Before vote start:
	    - None
    - After enactment:
	    - Agent
- `PAUSE_ROLE`
	- Before vote start:
		- None
	- After enactment:
	    - Gate Seal
- `RESUME_ROLE`
    - None
- `FINALIZE_ROLE`
    - Before vote start:
	    - None
    - After enactment:
	    - Lido
- `ORACLE_ROLE`
    - Before vote start:
	    - None
     - After enactment
	    - AccountingOracle
- `MANAGE_TOKEN_URI_ROLE`
    - None

### **WithdrawalVault**
*No access control, Proxy*

- PROXY ADMIN
    - Agent
