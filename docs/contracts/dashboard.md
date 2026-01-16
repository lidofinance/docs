# Dashboard

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/dashboard/Dashboard.sol)
- [Deployed contract](https://etherscan.io/address/0x294825c2764c7D412dc32d87E2242c4f1D989AF3)

Management contract for stVaults. Provides role-based control for vault operations and convenience wrappers for minting/burning stETH and wstETH.

## What is Dashboard?

Dashboard is the default control surface for stVaults:

- owns the `StakingVault` on deployment
- exposes role-based permissioning for vault actions
- routes mint/burn and funding operations to VaultHub
- manages PDG policy and unguaranteed deposits

Dashboard is technically optional - advanced users can interact with `StakingVault` and `VaultHub` directly, but Dashboard provides a convenient interface with granular permission controls.

## Roles and permissions

Dashboard uses OpenZeppelin's `AccessControl` with a two-admin model: **Vault Owner** and **Node Operator Manager**. Each can delegate specific sub-roles to other addresses.

### Admin roles

| Role | Description |
|------|-------------|
| `DEFAULT_ADMIN_ROLE` | Vault Owner admin. Can grant/revoke any role, transfer vault ownership, and perform all owner operations. |
| `NODE_OPERATOR_MANAGER_ROLE` | Node Operator admin. Can grant/revoke node operator sub-roles and manage operator-specific settings. |

### Vault Owner delegatable roles

These roles can be granted by `DEFAULT_ADMIN_ROLE`:

| Role | Operations |
|------|------------|
| `FUND_ROLE` | Supply (fund) ETH to the stVault |
| `WITHDRAW_ROLE` | Withdraw ETH from the stVault balance |
| `MINT_ROLE` | Mint stETH within minting capacity |
| `BURN_ROLE` | Burn stETH to decrease liability |
| `REBALANCE_ROLE` | Perform voluntary rebalance |
| `PAUSE_BEACON_CHAIN_DEPOSITS_ROLE` | Pause ETH deposits to Beacon Chain |
| `RESUME_BEACON_CHAIN_DEPOSITS_ROLE` | Resume ETH deposits to Beacon Chain |
| `REQUEST_VALIDATOR_EXIT_ROLE` | Request validator exits |
| `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` | Force validator withdrawals via EIP-7002 |
| `VOLUNTARY_DISCONNECT_ROLE` | Disconnect from VaultHub |
| `VAULT_CONFIGURATION_ROLE` | Change tier, sync tier params, update share limit |
| `COLLECT_VAULT_ERC20_ROLE` | Recover ERC-20 tokens from vault |

### Node Operator Manager delegatable roles

These roles can be granted by `NODE_OPERATOR_MANAGER_ROLE`:

| Role | Operations |
|------|------------|
| `NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE` | Bypass PDG and deposit directly to validators |
| `NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE` | Prove unknown validators through PDG |
| `NODE_OPERATOR_FEE_EXEMPT_ROLE` | Add fee exemptions to exclude value from operator fee base |

## PDGPolicy

The `PDGPolicy` enum controls how deposits interact with the Predeposit Guarantee system:

```solidity
enum PDGPolicy {
    STRICT,              // All deposits require full PDG process (default)
    ALLOW_PROVE,         // Allows proving unknown validators but not unguaranteed deposits
    ALLOW_DEPOSIT_AND_PROVE  // Allows both unguaranteed deposits and proving unknown validators
}
```

| Policy | Unguaranteed Deposits | Prove Unknown Validators |
|--------|----------------------|--------------------------|
| `STRICT` | No | No |
| `ALLOW_PROVE` | No | Yes |
| `ALLOW_DEPOSIT_AND_PROVE` | Yes | Yes |

Set via `setPDGPolicy()` by the Vault Owner (`DEFAULT_ADMIN_ROLE`).

## View methods

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

Returns obligations for the vault.

### healthShortfallShares()

```solidity
function healthShortfallShares() external view returns (uint256)
```

Returns shares needed to restore health.

### obligationsShortfallValue()

```solidity
function obligationsShortfallValue() external view returns (uint256)
```

Returns ETH shortfall for obligations.

### minimalReserve()

```solidity
function minimalReserve() public view returns (uint256)
```

Returns minimum reserve amount.

### maxLockableValue()

```solidity
function maxLockableValue() external view returns (uint256)
```

Returns max lockable value.

### totalMintingCapacityShares()

```solidity
function totalMintingCapacityShares() external view returns (uint256)
```

Returns total minting capacity in shares.

### remainingMintingCapacityShares(uint256 _etherToFund)

```solidity
function remainingMintingCapacityShares(uint256 _etherToFund) public view returns (uint256)
```

Returns remaining minting capacity in shares for a funding amount.

### withdrawableValue()

```solidity
function withdrawableValue() public view returns (uint256)
```

Returns withdrawable ETH amount.

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

Initializes the dashboard.

### wrap(uint256 _stETHAmount)

```solidity
function wrap(uint256 _stETHAmount) external returns (uint256)
```

Wraps stETH into wstETH.

### unwrap(uint256 _wstETHAmount)

```solidity
function unwrap(uint256 _wstETHAmount) external returns (uint256)
```

Unwraps wstETH into stETH.

### transferVaultOwnership(address _newOwner)

```solidity
function transferVaultOwnership(address _newOwner) external returns (bool)
```

Transfers the vault to a new owner via VaultHub.

### voluntaryDisconnect()

```solidity
function voluntaryDisconnect() external
```

Disconnects the vault from VaultHub.

### recoverFeeLeftover()

```solidity
function recoverFeeLeftover() external
```

Recovers leftover fees to the fee recipient.

### abandonDashboard(address _newOwner)

```solidity
function abandonDashboard(address _newOwner) external
```

Transfers vault ownership and disables dashboard usage.

### reconnectToVaultHub()

```solidity
function reconnectToVaultHub() external
```

Reconnects an already created vault to VaultHub.

### connectToVaultHub()

```solidity
function connectToVaultHub() public payable
```

Connects the vault to VaultHub.

### connectAndAcceptTier(uint256 _tierId, uint256 _requestedShareLimit)

```solidity
function connectAndAcceptTier(uint256 _tierId, uint256 _requestedShareLimit) external payable
```

Connects to VaultHub and accepts a tier.

### fund()

```solidity
function fund() external payable
```

Funds the vault.

### withdraw(address _recipient, uint256 _ether)

```solidity
function withdraw(address _recipient, uint256 _ether) external
```

Withdraws ETH from the vault.

### mintShares(address _recipient, uint256 _amountOfShares)

```solidity
function mintShares(address _recipient, uint256 _amountOfShares) external payable fundable
```

Mints stETH shares.

### mintStETH(address _recipient, uint256 _amountOfStETH)

```solidity
function mintStETH(address _recipient, uint256 _amountOfStETH) external payable fundable
```

Mints stETH.

### mintWstETH(address _recipient, uint256 _amountOfWstETH)

```solidity
function mintWstETH(address _recipient, uint256 _amountOfWstETH) external payable fundable
```

Mints wstETH.

### burnShares(uint256 _amountOfShares)

```solidity
function burnShares(uint256 _amountOfShares) external
```

Burns stETH shares.

### burnStETH(uint256 _amountOfStETH)

```solidity
function burnStETH(uint256 _amountOfStETH) external
```

Burns stETH.

### burnWstETH(uint256 _amountOfWstETH)

```solidity
function burnWstETH(uint256 _amountOfWstETH) external
```

Burns wstETH.

### rebalanceVaultWithShares(uint256 _shares)

```solidity
function rebalanceVaultWithShares(uint256 _shares) external
```

Rebalances vault by burning shares.

### rebalanceVaultWithEther(uint256 _ether)

```solidity
function rebalanceVaultWithEther(uint256 _ether) external payable fundable
```

Rebalances vault with ETH top-up.

### setPDGPolicy(PDGPolicy _pdgPolicy)

```solidity
function setPDGPolicy(PDGPolicy _pdgPolicy) external onlyRoleMemberOrAdmin(DEFAULT_ADMIN_ROLE)
```

Sets PDG policy (strict or allow deposits/proofs).

### unguaranteedDepositToBeaconChain(IStakingVault.Deposit[] _deposits)

```solidity
function unguaranteedDepositToBeaconChain(
    IStakingVault.Deposit[] calldata _deposits
) external returns (uint256 totalAmount)
```

Performs direct deposits bypassing PDG.

### proveUnknownValidatorsToPDG(IPredepositGuarantee.ValidatorWitness[] _witnesses)

```solidity
function proveUnknownValidatorsToPDG(IPredepositGuarantee.ValidatorWitness[] calldata _witnesses) external
```

Proves validators for PDG after unguaranteed deposit.

### recoverERC20(address _token, address _recipient, uint256 _amount)

```solidity
function recoverERC20(
    address _token,
    address _recipient,
    uint256 _amount
) external onlyRoleMemberOrAdmin(DEFAULT_ADMIN_ROLE)
```

Recovers ERC-20 tokens from the dashboard.

### collectERC20FromVault(address _token, address _recipient, uint256 _amount)

```solidity
function collectERC20FromVault(
    address _token,
    address _recipient,
    uint256 _amount
) external onlyRoleMemberOrAdmin(COLLECT_VAULT_ERC20_ROLE)
```

Collects ERC-20 tokens from the vault.

### pauseBeaconChainDeposits()

```solidity
function pauseBeaconChainDeposits() external
```

Pauses vault deposits.

### resumeBeaconChainDeposits()

```solidity
function resumeBeaconChainDeposits() external
```

Resumes vault deposits.

### requestValidatorExit(bytes _pubkeys)

```solidity
function requestValidatorExit(bytes calldata _pubkeys) external
```

Requests validator exits.

### triggerValidatorWithdrawals(...)

```solidity
function triggerValidatorWithdrawals(
    bytes calldata _pubkeys,
    uint64[] calldata _amountsInGwei,
    address _refundRecipient
) external payable
```

Triggers validator withdrawals via EIP-7002.

### changeTier(uint256 _tierId, uint256 _requestedShareLimit)

```solidity
function changeTier(uint256 _tierId, uint256 _requestedShareLimit) external returns (bool)
```

Requests a tier change.

### syncTier()

```solidity
function syncTier() external returns (bool)
```

Applies pending tier changes.

### updateShareLimit(uint256 _requestedShareLimit)

```solidity
function updateShareLimit(uint256 _requestedShareLimit) external returns (bool)
```

Requests a share limit change.

## Related

- [StakingVault](/contracts/staking-vault)
- [VaultHub](/contracts/vault-hub)
- [OperatorGrid](/contracts/operator-grid)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [stVaults Integration Overview](/run-on-lido/stvaults/tech-documentation/integration-overview)
