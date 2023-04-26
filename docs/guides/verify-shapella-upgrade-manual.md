# Shapella mainnet parameters

## Mainnet addresses

```python
lidoLocator = "0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb"
```

## NodeOperatorsRegistry

```python
stuckPenaltyDelay = 432000  # 5 days as seconds
```

## OracleDaemonConfig

```python
NORMALIZED_CL_REWARD_PER_EPOCH=64
NORMALIZED_CL_REWARD_MISTAKE_RATE_BP=1000
REBASE_CHECK_NEAREST_EPOCH_DISTANCE=1
REBASE_CHECK_DISTANT_EPOCH_DISTANCE=23  # 10% of AO 255 epochs frame
VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS=7200 # 1 day
VALIDATOR_DELINQUENT_TIMEOUT_IN_SLOTS=28800 # 4 days
PREDICTION_DURATION_IN_SLOTS=50400
FINALIZATION_MAX_NEGATIVE_REBASE_EPOCH_SHIFT=1350  # 6 days
NODE_OPERATOR_NETWORK_PENETRATION_THRESHOLD_BP=100 # 1% network penetration for a single NO
```

## NodeOperatorsRegistry

```python
churnValidatorsPerDayLimit = 40000
oneOffCLBalanceDecreaseBPLimit = 500
annualBalanceIncreaseBPLimit = 1000
simulatedShareRateDeviationBPLimit = 50
maxValidatorExitRequestsPerReport = 500
maxAccountingExtraDataListItemsCount = 500
maxNodeOperatorsPerExtraDataItemCount = 100
requestTimestampMargin = 7680
maxPositiveTokenRebase = 750000
```

## Burner

```python
# proofs:
# - https://vote.lido.fi/vote/106
# - https://etherscan.io/address/0xB280E33812c0B09353180e92e27b8AD399B07f26#readContract#F7
totalNonCoverSharesBurnt = 32145684728326685744
```

## AccountingOracle

```python
epochsPerFrame = 225  # once per day
# So, the AccountingOracle expected report time would be 12:00 UTC

fastLaneLengthSlots = 10
```

## ValidatorsExitBusOracle

```python
epochsPerFrame = 75  # thrice per day
# So, the ValidatorsExitBusOracle expected report time would be 
# 4:00 UTC, 12:00 UTC, 20:00 UTC

fastLaneLengthSlots = 10
```

## GateSeal

```python
seal_duration = 518400  # 6 days as seconds (2 x gov time)
expiry_timestamp = 1714521600  # 2024-05-01 00:00 UTC
```

## Roles setup

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
- `MANAGE_FEE` `[MN, GL]`
- `MANAGE_WITHDRAWAL_KEY` `[MN, GL]`
- `MANAGE_PROTOCOL_CONTRACTS_ROLE` `[MN, GL]`
- `BURN_ROLE` `[MN, GL]`
- `DEPOSIT_ROLE` `[MN, GL]`
- `SET_EL_REWARDS_VAULT_ROLE` `[MN, GL]`
- `SET_EL_REWARDS_WITHDRAWAL_LIMIT_ROLE` `[MN,GL]`

### **NodeOperatorsRegistry**
*Aragon app*

**New**
- `STAKING_ROUTER_ROLE`
    - StakingRouter (set in voting script)
- `MANAGE_NODE_OPERATOR_ROLE`
    - None (maybe Voting once upgrade applied?)

**Kept**
- `MANAGE_SIGNING_KEYS`
- `SET_NODE_OPERATOR_LIMIT_ROLE`

**Obsolete**
- `ADD_NODE_OPERATOR_ROLE` `[MN, GL]`
- `SET_NODE_OPERATOR_ACTIVE_ROLE` `[MN, GL]`
- `SET_NODE_OPERATOR_NAME_ROLE` `[MN, GL]`
- `SET_NODE_OPERATOR_ADDRESS_ROLE` `[MN, GL]`
- `REPORT_STOPPED_VALIDATORS_ROLE` `[MN, GL]`

### **LegacyOracle (former LidoOracle)**
*Aragon app*

**New**
None

**Kept**
None

**Obsolete**
- `MANAGE_MEMBERS` `[MN, GL]`
- `MANAGE_QUORUM` `[MN, GL]`
- `SET_BEACON_SPEC` `[MN, GL]`
- `SET_REPORT_BOUNDARIES` `[MN, GL]`
- `SET_BEACON_REPORT_RECEIVER` `[MN, GL]`

### **AccountingOracle (OZ)**
*OZ, Proxy*

- PROXY ADMIN
    - Agent
- `DEFAULT_ADMIN_ROLE`
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
    - Agent
- `REQUEST_BURN_SHARES_ROLE`
    - granted to Lido in Burner constructor
    - NodeOperatorsRegistry
- `REQUEST_BURN_MY_STETH_ROLE`
    - None
- `RECOVER_ASSETS_ROLE`
    - None

### **LidoLocator (OZ)**
*OZ, Proxy*

- PROXY ADMIN
    - Agent

### **StakingRouter (OZ)**
*OZ, Proxy*

- PROXY ADMIN
    - Agent
- `DEFAULT_ADMIN_ROLE`
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

### **HashConsensus for AccountingOracle (OZ)**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
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
    - Current LidoOracle Committee (migrated in UpgradeTemplate)

### **DepositSecurityModule**
*Plain Owner, No Proxy*

- owner
    - Agent
- guardians
    - ?

### **HashConsensus for ValidatorExitBusOracle (OZ)**
*OZ, No Proxy*

- `DEFAULT_ADMIN_ROLE`
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
    - Current LidoOracle Committee (migrated in UpgradeTemplate)

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
- `CHURN_VALIDATORS_PER_DAY_LIMIT_MANGER_ROLE`
- `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE`
- `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE`
- `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE`
- `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE`
- `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE`
- `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE`
- `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE`
- `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE`
    - None for all roles listed above

### **ValidatorExitBusOracle (OZ)**
*OZ, Proxy*

- PROXY ADMIN
    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Agent
- `PAUSE_ROLE` (in initializer)
    - Gate Seal
- `RESUME_ROLE` (in initialize)
    - None
- `SUBMIT_DATA_ROLE`
    - Current LidoOracle Committee (migrated in UpgradeTemplate)
- `MANAGE_CONSENSUS_CONTRACT_ROLE`
    - None
- `MANAGE_CONSENSUS_VERSION_ROLE`
    - None

### **WithdrawalQueueERC721 (OZ)**
*OZ, Proxy*

- PROXY ADMIN
    - Agent
- `DEFAULT_ADMIN_ROLE`
    - Agent
- `PAUSE_ROLE`
    - Gate Seal
- `RESUME_ROLE`
    - None
- `FINALIZE_ROLE`
    - Lido
- `ORACLE_ROLE`
    - AccountingOracle
- `MANAGE_TOKEN_URI_ROLE`
    - None

### **WithdrawalVault**
*No access control, Proxy*

- PROXY ADMIN
    - Agent
