# StakingVault

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/StakingVault.sol)
- [Deployed contract](https://etherscan.io/address/0x06A56487494aa080deC7Bf69128EdA9225784553)

Isolated staking position with 0x02 withdrawal credentials. Holds validator funds and supports minting stETH through VaultHub while preserving non-custodial ownership.

## What is StakingVault?

A StakingVault is the core stVault primitive:

- holds ETH and validator balances tied to its withdrawal credentials
- exposes owner and node operator controls
- supports PDG-driven and direct deposits
- integrates with VaultHub for minting, burn, and health constraints

Vaults are deployed via `VaultFactory` as beacon proxies. The deployed contract above is the implementation used by the beacon.

## How it works

- The vault owner controls funding, withdrawals, and exit requests.
- The node operator manages validator keys and can trigger exits (EIP-7002).
- The depositor role performs beacon chain deposits and staging.
- When connected to VaultHub, deposits and withdrawals are gated by collateral rules.

## View methods

### getInitializedVersion()

```solidity
function getInitializedVersion() external view returns (uint64)
```

Returns initialization version.

### version()

```solidity
function version() external pure returns (uint64)
```

Returns contract version constant.

### owner()

```solidity
function owner() public view returns (address)
```

Returns vault owner.

### pendingOwner()

```solidity
function pendingOwner() public view returns (address)
```

Returns pending owner for 2-step ownership transfer.

### nodeOperator()

```solidity
function nodeOperator() public view returns (address)
```

Returns node operator address.

### depositor()

```solidity
function depositor() public view returns (address)
```

Returns depositor address.

### withdrawalCredentials()

```solidity
function withdrawalCredentials() public view returns (bytes32)
```

Returns vault withdrawal credentials (0x02 type).

### calculateValidatorWithdrawalFee(uint256 _numberOfKeys)

```solidity
function calculateValidatorWithdrawalFee(uint256 _numberOfKeys) external view returns (uint256)
```

Returns fee for validator withdrawals.

### availableBalance()

```solidity
function availableBalance() public view returns (uint256)
```

Returns ETH currently available for withdrawal.

### stagedBalance()

```solidity
function stagedBalance() external view returns (uint256)
```

Returns ETH staged for validator activation.

### beaconChainDepositsPaused()

```solidity
function beaconChainDepositsPaused() external view returns (bool)
```

Returns whether deposits are paused.

## Methods

### initialize(address _owner, address _nodeOperator, address _depositor)

```solidity
function initialize(address _owner, address _nodeOperator, address _depositor) external initializer
```

Initializes the vault with roles.

### fund()

```solidity
function fund() external payable onlyOwner
```

Adds ETH to the vault.

### withdraw(address _recipient, uint256 _ether)

```solidity
function withdraw(address _recipient, uint256 _ether) external onlyOwner
```

Withdraws ETH to a recipient.

### pauseBeaconChainDeposits()

```solidity
function pauseBeaconChainDeposits() external onlyOwner
```

Pauses beacon chain deposits.

### resumeBeaconChainDeposits()

```solidity
function resumeBeaconChainDeposits() external onlyOwner
```

Resumes beacon chain deposits.

### depositToBeaconChain(Deposit _deposit)

```solidity
function depositToBeaconChain(Deposit calldata _deposit) external onlyDepositor whenDepositsNotPaused
```

Deposits validator data directly.

### stage(uint256 _ether)

```solidity
function stage(uint256 _ether) external onlyDepositor whenDepositsNotPaused
```

Stages ETH for validator activation.

### unstage(uint256 _ether)

```solidity
function unstage(uint256 _ether) public onlyDepositor
```

Unstages ETH to make it withdrawable again.

### depositFromStaged(Deposit _deposit, uint256 _additionalAmount)

```solidity
function depositFromStaged(Deposit calldata _deposit, uint256 _additionalAmount) external onlyDepositor
```

Deposits using staged balance plus optional top-up.

### requestValidatorExit(bytes _pubkeys)

```solidity
function requestValidatorExit(bytes calldata _pubkeys) external onlyOwner
```

Requests validator exits.

### triggerValidatorWithdrawals(...)

```solidity
function triggerValidatorWithdrawals(
    bytes calldata _pubkeys,
    uint64[] calldata _amountsInGwei,
    address _excessRefundRecipient
) external payable onlyOwner
```

Triggers EL withdrawals via EIP-7002.

### ejectValidators(bytes _pubkeys, address _refundRecipient)

```solidity
function ejectValidators(bytes calldata _pubkeys, address _refundRecipient) external payable
```

Allows node operator to force eject validators.

### acceptOwnership()

```solidity
function acceptOwnership() public
```

Accepts a pending ownership transfer.

### transferOwnership(address _newOwner)

```solidity
function transferOwnership(address _newOwner) public
```

Initiates ownership transfer.

### renounceOwnership()

```solidity
function renounceOwnership() public view onlyOwner
```

Disables ownership (blocked by design; callable but reverts).

### setDepositor(address _depositor)

```solidity
function setDepositor(address _depositor) external onlyOwner
```

Updates depositor address.

### ossify()

```solidity
function ossify() external onlyOwner
```

Pins the implementation for this vault (no upgrades).

### collectERC20(address _token, address _recipient, uint256 _amount)

```solidity
function collectERC20(address _token, address _recipient, uint256 _amount) external onlyOwner
```

Recovers ERC-20 tokens from the vault.

## Related

- [VaultHub](/contracts/vault-hub)
- [PredepositGuarantee](/contracts/predeposit-guarantee)
- [Staking Vault Beacon](/contracts/staking-vault-beacon)
- [Staking Vault Factory](/contracts/staking-vault-factory)
- [stVaults Technical Design](/run-on-lido/stvaults/tech-documentation/tech-design)
