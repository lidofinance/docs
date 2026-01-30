# Dashboard

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/dashboard/Dashboard.sol)
- [Implementation](https://etherscan.io/address/0x294825c2764c7D412dc32d87E2242c4f1D989AF3)

Management contract for stVaults. Provides role-based control for vault operations and convenience wrappers for minting/burning stETH and wstETH. Individual Dashboard instances are deployed as proxies by [VaultFactory](/contracts/staking-vault-factory).

## What is Dashboard?

Dashboard is the default control surface for stVaults:

- owns the `StakingVault` on deployment
- exposes role-based permissioning for vault actions
- routes mint/burn and funding operations to VaultHub
- manages PDG policy and unguaranteed deposits
- handles node operator fee accounting and disbursement

Dashboard is technically optional - advanced users can interact with `StakingVault` and `VaultHub` directly, but Dashboard provides a convenient interface with granular permission controls.

## Roles and permissions

Dashboard uses OpenZeppelin's `AccessControl` with a two-admin model: **Vault Owner** and **Node Operator Manager**. Each can delegate specific sub-roles to other addresses.

### Admin roles

| Role                         | Description                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`         | Vault Owner admin. Can grant/revoke any role, transfer vault ownership, and perform all owner operations. |
| `NODE_OPERATOR_MANAGER_ROLE` | Node Operator admin. Can grant/revoke node operator sub-roles and manage operator-specific settings.      |

### Vault Owner delegatable roles

These roles can be granted by `DEFAULT_ADMIN_ROLE`:

| Role                                | Operations                                        |
| ----------------------------------- | ------------------------------------------------- |
| `FUND_ROLE`                         | Supply (fund) ETH to the stVault                  |
| `WITHDRAW_ROLE`                     | Withdraw ETH from the stVault balance             |
| `MINT_ROLE`                         | Mint stETH within minting capacity                |
| `BURN_ROLE`                         | Burn stETH to decrease liability                  |
| `REBALANCE_ROLE`                    | Perform voluntary rebalance                       |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE`  | Pause ETH deposits to Beacon Chain                |
| `RESUME_BEACON_CHAIN_DEPOSITS_ROLE` | Resume ETH deposits to Beacon Chain               |
| `REQUEST_VALIDATOR_EXIT_ROLE`       | Request validator exits                           |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Force validator withdrawals via EIP-7002          |
| `VOLUNTARY_DISCONNECT_ROLE`         | Disconnect from VaultHub                          |
| `VAULT_CONFIGURATION_ROLE`          | Change tier, sync tier params, update share limit |
| `COLLECT_VAULT_ERC20_ROLE`          | Recover ERC-20 tokens from vault                  |

### Node Operator Manager delegatable roles

These roles can be granted by `NODE_OPERATOR_MANAGER_ROLE`:

| Role                                         | Operations                                                 |
| -------------------------------------------- | ---------------------------------------------------------- |
| `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE`    | Bypass PDG and deposit directly to validators              |
| `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` | Prove unknown validators through PDG                       |
| `NODE_OPERATOR_FEE_EXEMPT_ROLE`              | Add fee exemptions to exclude value from operator fee base |

## PDGPolicy

The `PDGPolicy` enum controls how deposits interact with the Predeposit Guarantee system:

```solidity
enum PDGPolicy {
    STRICT,              // All deposits require full PDG process (default)
    ALLOW_PROVE,         // Allows proving unknown validators but not unguaranteed deposits
    ALLOW_DEPOSIT_AND_PROVE  // Allows both unguaranteed deposits and proving unknown validators
}
```

| Policy                    | Unguaranteed Deposits | Prove Unknown Validators |
| ------------------------- | --------------------- | ------------------------ |
| `STRICT`                  | No                    | No                       |
| `ALLOW_PROVE`             | No                    | Yes                      |
| `ALLOW_DEPOSIT_AND_PROVE` | Yes                   | Yes                      |

Set via `setPDGPolicy()` by the Vault Owner (`DEFAULT_ADMIN_ROLE`).

## Node operator fee accounting

Dashboard implements a **high-water mark** approach for node operator fees based on vault growth:

1. **Growth calculation**: Growth is the difference between `totalValue` and `inOutDelta`, representing value that was not directly funded to the vault.
2. **Settled growth**: The portion of growth that fees have already been calculated on or that is exempt from fees.
3. **Fee calculation**: `fee = max(growth - settledGrowth, 0) * feeRate / 10000`
4. **Only positive growth**: Fees are only charged on new growth above the settled growth marker. If the vault value decreases (e.g., due to slashing), no fees accrue until growth exceeds the previous settled level.
5. **Quarantine inclusion**: Fee calculations include quarantined value from the LazyOracle.

### Safety threshold

An **abnormally high fee threshold** (1% of total value, defined as `ABNORMALLY_HIGH_FEE_THRESHOLD_BP = 100`) exists as a safety mechanism. If calculated fees exceed this threshold, fee disbursement requires explicit action via `disburseAbnormallyHighFee()` by `DEFAULT_ADMIN_ROLE` rather than permissionless `disburseFee()`.

### Fee leftover on disconnect

When a vault is voluntarily disconnected, accrued fees are collected to the Dashboard as `feeLeftover` rather than sent to `feeRecipient`. This prevents reverts from blocking disconnection. The leftover can be recovered later via `recoverFeeLeftover()`.

### Dual confirmation for critical operations

The following operations require confirmation from both `DEFAULT_ADMIN_ROLE` and `NODE_OPERATOR_MANAGER_ROLE`:

- `setFeeRate()` - Changing the fee rate
- `correctSettledGrowth()` - Correcting the settled growth baseline
- `setConfirmExpiry()` - Changing the confirmation expiry period
- `transferVaultOwnership()` - Transferring vault ownership

## State variables

| Variable                    | Type        | Description                                           |
| --------------------------- | ----------- | ----------------------------------------------------- |
| `feeRecipient`              | `address`   | Address that receives node operator fee disbursements |
| `feeRate`                   | `uint16`    | Node operator fee rate in basis points (max 10000)    |
| `settledGrowth`             | `int128`    | Growth not subject to fees (high-water mark)          |
| `latestCorrectionTimestamp` | `uint64`    | Timestamp of most recent settled growth correction    |
| `feeLeftover`               | `uint128`   | Fees collected on disconnect, awaiting recovery       |
| `pdgPolicy`                 | `PDGPolicy` | Current PDG policy (default: STRICT)                  |

## View methods

### stakingVault()

```solidity
function stakingVault() external view returns (IStakingVault)
```

Returns the address of the underlying StakingVault.

### vaultConnection()

```solidity
function vaultConnection() public view returns (VaultHub.VaultConnection memory)
```

Returns current VaultHub connection parameters.

### liabilityShares()

```solidity
function liabilityShares() public view returns (uint256)
```

Returns current liability shares.

### totalValue()

```solidity
function totalValue() external view returns (uint256)
```

Returns vault total value.

### locked()

```solidity
function locked() external view returns (uint256)
```

Returns locked collateral amount.

### obligations()

```solidity
function obligations() external view returns (uint256 sharesToBurn, uint256 feesToSettle)
```

Returns obligations for the vault (shares to burn/rebalance and Lido fees to settle).

### healthShortfallShares()

```solidity
function healthShortfallShares() external view returns (uint256)
```

Returns shares needed to restore health. Returns `UINT256_MAX` if impossible to make vault healthy using rebalance.

### obligationsShortfallValue()

```solidity
function obligationsShortfallValue() external view returns (uint256)
```

Returns ETH shortfall for obligations. Returns `UINT256_MAX` if impossible to cover.

### minimalReserve()

```solidity
function minimalReserve() public view returns (uint256)
```

Returns minimum reserve amount: `max(CONNECT_DEPOSIT, slashingReserve)`. This is the amount of ether locked on the vault that cannot be used for minting stETH.

### maxLockableValue()

```solidity
function maxLockableValue() external view returns (uint256)
```

Returns max lockable value minus accrued node operator fee.

### totalMintingCapacityShares()

```solidity
function totalMintingCapacityShares() external view returns (uint256)
```

Returns total minting capacity in shares (accounting for accrued fee).

### remainingMintingCapacityShares(uint256 \_etherToFund)

```solidity
function remainingMintingCapacityShares(uint256 _etherToFund) public view returns (uint256)
```

Returns remaining minting capacity in shares for a given funding amount.

### withdrawableValue()

```solidity
function withdrawableValue() public view returns (uint256)
```

Returns withdrawable ETH amount minus accrued node operator fee.

### latestReport()

```solidity
function latestReport() public view returns (VaultHub.Report memory)
```

Returns the latest vault report containing `totalValue`, `inOutDelta`, and `timestamp`.

### accruedFee()

```solidity
function accruedFee() public view returns (uint256 fee)
```

Returns the current node operator fee amount in ETH.

### confirmingRoles()

```solidity
function confirmingRoles() public pure returns (bytes32[] memory roles)
```

Returns the roles that must confirm critical parameter changes (`DEFAULT_ADMIN_ROLE` and `NODE_OPERATOR_MANAGER_ROLE`).

## Methods

### initialize(...)

```solidity
function initialize(
    address _defaultAdmin,
    address _nodeOperatorManager,
    address _nodeOperatorFeeRecipient,
    uint256 _nodeOperatorFeeBP,
    uint256 _confirmExpiry
) external
```

Initializes the dashboard with admin roles, fee settings, and confirmation expiry.

### wrap(uint256 \_stETHAmount)

```solidity
function wrap(uint256 _stETHAmount) external returns (uint256)
```

Wraps stETH into wstETH.

### unwrap(uint256 \_wstETHAmount)

```solidity
function unwrap(uint256 _wstETHAmount) external returns (uint256)
```

Unwraps wstETH into stETH.

### transferVaultOwnership(address \_newOwner)

```solidity
function transferVaultOwnership(address _newOwner) external returns (bool)
```

Transfers the vault to a new owner via VaultHub. Requires dual confirmation. Stops fee accrual after transfer.

### voluntaryDisconnect()

```solidity
function voluntaryDisconnect() external
```

Disconnects the vault from VaultHub. Collects fees as `feeLeftover` and stops fee accrual.

### recoverFeeLeftover()

```solidity
function recoverFeeLeftover() external
```

Recovers previously collected fee leftover to the `feeRecipient` address.

### abandonDashboard(address \_newOwner)

```solidity
function abandonDashboard(address _newOwner) external
```

Accepts ownership from VaultHub (after disconnect) and transfers to a new owner. Requires vault to be disconnected.

### reconnectToVaultHub()

```solidity
function reconnectToVaultHub() external
```

Accepts ownership and reconnects to VaultHub. Requires `settledGrowth` to be corrected first if fee rate is non-zero.

### connectToVaultHub()

```solidity
function connectToVaultHub() public payable
```

Connects the vault to VaultHub. Reverts if `settledGrowth` is not set when fee rate is non-zero.

### connectAndAcceptTier(uint256 \_tierId, uint256 \_requestedShareLimit)

```solidity
function connectAndAcceptTier(uint256 _tierId, uint256 _requestedShareLimit) external payable
```

Connects to VaultHub and accepts a tier in one transaction.

### fund()

```solidity
function fund() external payable
```

Funds the vault with sent ETH.

### withdraw(address \_recipient, uint256 \_ether)

```solidity
function withdraw(address _recipient, uint256 _ether) external
```

Withdraws ETH from the vault. Limited by `withdrawableValue()`.

### mintShares(address \_recipient, uint256 \_amountOfShares)

```solidity
function mintShares(address _recipient, uint256 _amountOfShares) external payable
```

Mints stETH shares. Can include ETH funding in same call.

### mintStETH(address \_recipient, uint256 \_amountOfStETH)

```solidity
function mintStETH(address _recipient, uint256 _amountOfStETH) external payable
```

Mints stETH. Reverts if amount is less than 1 share.

### mintWstETH(address \_recipient, uint256 \_amountOfWstETH)

```solidity
function mintWstETH(address _recipient, uint256 _amountOfWstETH) external payable
```

Mints wstETH by minting stETH and wrapping it.

### burnShares(uint256 \_amountOfShares)

```solidity
function burnShares(uint256 _amountOfShares) external
```

Burns stETH shares. Requires approval.

### burnStETH(uint256 \_amountOfStETH)

```solidity
function burnStETH(uint256 _amountOfStETH) external
```

Burns stETH. Requires approval. Reverts if amount is less than 1 share.

### burnWstETH(uint256 \_amountOfWstETH)

```solidity
function burnWstETH(uint256 _amountOfWstETH) external
```

Burns wstETH by unwrapping and burning. Requires approval.

### rebalanceVaultWithShares(uint256 \_shares)

```solidity
function rebalanceVaultWithShares(uint256 _shares) external
```

Rebalances vault by burning the specified number of shares.

### rebalanceVaultWithEther(uint256 \_ether)

```solidity
function rebalanceVaultWithEther(uint256 _ether) external payable
```

Rebalances vault with ETH. Converts to shares internally.

### disburseFee()

```solidity
function disburseFee() public
```

Disburses node operator fees permissionlessly. Reverts if fee exceeds abnormally high threshold.

### disburseAbnormallyHighFee()

```solidity
function disburseAbnormallyHighFee() external
```

Disburses an abnormally high fee. Requires `DEFAULT_ADMIN_ROLE`.

### setFeeRate(uint256 \_newFeeRate)

```solidity
function setFeeRate(uint256 _newFeeRate) external returns (bool)
```

Updates the fee rate. Requires dual confirmation, fresh report, and no corrections after latest report. Disburses outstanding fees before changing rate.

### correctSettledGrowth(int256 \_newSettledGrowth, int256 \_expectedSettledGrowth)

```solidity
function correctSettledGrowth(int256 _newSettledGrowth, int256 _expectedSettledGrowth) external returns (bool)
```

Manually corrects the settled growth baseline. Requires dual confirmation. Used to enable fee accrual after reconnection.

### addFeeExemption(uint256 \_exemptedAmount)

```solidity
function addFeeExemption(uint256 _exemptedAmount) external
```

Adds a fee exemption to exclude value from fee calculations. Requires `NODE_OPERATOR_FEE_EXEMPT_ROLE`.

### setConfirmExpiry(uint256 \_newConfirmExpiry)

```solidity
function setConfirmExpiry(uint256 _newConfirmExpiry) external returns (bool)
```

Sets the confirmation expiry period. Requires dual confirmation.

### setFeeRecipient(address \_newFeeRecipient)

```solidity
function setFeeRecipient(address _newFeeRecipient) external
```

Sets the fee recipient address. Requires `NODE_OPERATOR_MANAGER_ROLE`.

### setPDGPolicy(PDGPolicy \_pdgPolicy)

```solidity
function setPDGPolicy(PDGPolicy _pdgPolicy) external
```

Sets PDG policy (strict or allow deposits/proofs). Requires `DEFAULT_ADMIN_ROLE`.

### unguaranteedDepositToBeaconChain(IStakingVault.Deposit[] \_deposits)

```solidity
function unguaranteedDepositToBeaconChain(
    IStakingVault.Deposit[] calldata _deposits
) external returns (uint256 totalAmount)
```

Performs direct deposits bypassing PDG. Requires `ALLOW_DEPOSIT_AND_PROVE` policy and `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE`. Adds fee exemption for deposited amount.

### proveUnknownValidatorsToPDG(IPredepositGuarantee.ValidatorWitness[] \_witnesses)

```solidity
function proveUnknownValidatorsToPDG(IPredepositGuarantee.ValidatorWitness[] calldata _witnesses) external
```

Proves validators for PDG after unguaranteed deposit. Requires `ALLOW_PROVE` or `ALLOW_DEPOSIT_AND_PROVE` policy and `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE`.

### recoverERC20(address \_token, address \_recipient, uint256 \_amount)

```solidity
function recoverERC20(
    address _token,
    address _recipient,
    uint256 _amount
) external
```

Recovers ERC-20 tokens or ETH (using EIP-7528 address `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`) from the dashboard. Requires `DEFAULT_ADMIN_ROLE`. ETH recovery excludes `feeLeftover`.

### collectERC20FromVault(address \_token, address \_recipient, uint256 \_amount)

```solidity
function collectERC20FromVault(
    address _token,
    address _recipient,
    uint256 _amount
) external
```

Collects ERC-20 tokens from the vault. Requires `COLLECT_VAULT_ERC20_ROLE`. Does not support ETH.

### pauseBeaconChainDeposits()

```solidity
function pauseBeaconChainDeposits() external
```

Pauses vault deposits. Requires `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE`.

### resumeBeaconChainDeposits()

```solidity
function resumeBeaconChainDeposits() external
```

Resumes vault deposits. Requires `RESUME_BEACON_CHAIN_DEPOSITS_ROLE`.

### requestValidatorExit(bytes \_pubkeys)

```solidity
function requestValidatorExit(bytes calldata _pubkeys) external
```

Requests validator exits (voluntary signal to node operators). Requires `REQUEST_VALIDATOR_EXIT_ROLE`.

### triggerValidatorWithdrawals(...)

```solidity
function triggerValidatorWithdrawals(
    bytes calldata _pubkeys,
    uint64[] calldata _amountsInGwei,
    address _refundRecipient
) external payable
```

Triggers validator withdrawals via EIP-7002. Requires `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` and withdrawal fee via `msg.value`.

### changeTier(uint256 \_tierId, uint256 \_requestedShareLimit)

```solidity
function changeTier(uint256 _tierId, uint256 _requestedShareLimit) external returns (bool)
```

Requests a tier change. Requires `VAULT_CONFIGURATION_ROLE` and node operator confirmation via OperatorGrid.

### syncTier()

```solidity
function syncTier() external returns (bool)
```

Applies pending tier changes. Requires `VAULT_CONFIGURATION_ROLE` and node operator confirmation.

### updateShareLimit(uint256 \_requestedShareLimit)

```solidity
function updateShareLimit(uint256 _requestedShareLimit) external returns (bool)
```

Requests a share limit change. Requires `VAULT_CONFIGURATION_ROLE` and node operator confirmation.

### grantRoles(RoleAssignment[] \_assignments)

```solidity
function grantRoles(RoleAssignment[] calldata _assignments) external
```

Mass-grants multiple roles. Each assignment specifies an account and role.

### revokeRoles(RoleAssignment[] \_assignments)

```solidity
function revokeRoles(RoleAssignment[] calldata _assignments) external
```

Mass-revokes multiple roles.

## Related

- [StakingVault](/contracts/staking-vault)
- [VaultHub](/contracts/vault-hub)
- [OperatorGrid](/contracts/operator-grid)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [stVaults Integration Overview](/run-on-lido/stvaults/tech-documentation/integration-overview)
