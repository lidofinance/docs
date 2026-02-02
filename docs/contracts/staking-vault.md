# StakingVault

- [Source code](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/vaults/StakingVault.sol)
- [Implementation](https://etherscan.io/address/0x06A56487494aa080deC7Bf69128EdA9225784553)
- [Beacon](https://etherscan.io/address/0x5FbE8cEf9CCc56ad245736D3C5bAf82ad54Ca789)

Isolated staking position with 0x02 withdrawal credentials. Holds validator funds and supports minting stETH through VaultHub while preserving non-custodial ownership. Individual vaults are deployed as beacon proxies by [VaultFactory](/contracts/staking-vault-factory).

## What is StakingVault?

A StakingVault is the core stVault primitive:

- holds ETH and validator balances tied to its withdrawal credentials
- exposes owner and node operator controls
- supports PDG-driven and direct deposits
- integrates with VaultHub for minting, burn, and health constraints

Vaults are deployed via `VaultFactory` as beacon proxies. The deployed contract above is the implementation used by the beacon.

## How it works

- The **vault owner** controls funding, withdrawals, exit requests, and administrative functions.
- The **node operator** can force-eject validators via EIP-7002 (does not require owner cooperation).
- The **depositor** role performs beacon chain deposits and staging operations.
- When connected to VaultHub, deposits and withdrawals are gated by collateral rules.

The vault is a **PinnedBeaconProxy** instance, meaning it can be ossified (pinned)
to prevent future upgrades once disconnected from VaultHub.

## Constants

| Constant            | Value         | Description                             |
| ------------------- | ------------- | --------------------------------------- |
| `_VERSION`          | 1             | Contract version on implementation      |
| `WC_0X02_PREFIX`    | `0x02 << 248` | Withdrawal credentials type prefix      |
| `PUBLIC_KEY_LENGTH` | 48            | Length of validator public key in bytes |

## Immutable variables

| Variable           | Description                               |
| ------------------ | ----------------------------------------- |
| `DEPOSIT_CONTRACT` | Address of the BeaconChainDepositContract |

## Storage

```solidity
struct Storage {
    address nodeOperator;           // Node operator address (slot 1)
    address depositor;              // Depositor address (slot 2)
    bool beaconChainDepositsPaused; // Whether deposits are paused (slot 2)
    uint256 stagedBalance;          // ETH staged for activation (slot 3)
}
```

## Staged balance

Staged balance is ETH reserved for validator activations. This mechanism supports the Predeposit Guarantee (PDG) flow:

1. **Staging**: When preparing validators via PDG, the depositor calls `stage()` to reserve 31 ETH per validator (the remaining 1 ETH comes from the predeposit).
2. **Staged funds are locked**: Staged ETH cannot be withdrawn via `withdraw()` - only `availableBalance()` (unstaged funds) can be withdrawn.
3. **Activation**: When a validator is activated via `depositFromStaged()`, the staged ETH is consumed for the beacon chain deposit.
4. **Unstaging**: If a predeposit fails or is cancelled, `unstage()` releases the ETH back to available balance.

The invariant is: every 1 ETH predeposit in PDG must be paired with 31 ETH staged in the vault for the full 32 ETH validator activation.

```
Total vault balance = availableBalance() + stagedBalance()
availableBalance() = address(this).balance - stagedBalance
```

## Structs

### Deposit

Validator deposit data for beacon chain deposits:

```solidity
struct Deposit {
    bytes pubkey;             // Validator public key (48 bytes)
    bytes signature;          // BLS signature (96 bytes)
    uint256 amount;           // Deposit amount in wei
    bytes32 depositDataRoot;  // Deposit data root for verification
}
```

## View methods

### getInitializedVersion()

```solidity
function getInitializedVersion() external view returns (uint64)
```

Returns the highest version that has been initialized.

### version()

```solidity
function version() external pure returns (uint64)
```

Returns contract version constant (1).

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

Returns vault withdrawal credentials (0x02 type). Computed as `0x02 << 248 | address(this)`.

### calculateValidatorWithdrawalFee(uint256 \_numberOfKeys)

```solidity
function calculateValidatorWithdrawalFee(uint256 _numberOfKeys) external view returns (uint256)
```

Returns fee for validator withdrawals via EIP-7002. Note: fee may change block to block.

### availableBalance()

```solidity
function availableBalance() public view returns (uint256)
```

Returns ETH currently available for withdrawal (total balance minus staged balance).

### stagedBalance()

```solidity
function stagedBalance() external view returns (uint256)
```

Returns ETH staged for validator activation.

### beaconChainDepositsPaused()

```solidity
function beaconChainDepositsPaused() external view returns (bool)
```

Returns whether beacon chain deposits are paused.

## Methods

### initialize(address \_owner, address \_nodeOperator, address \_depositor)

```solidity
function initialize(address _owner, address _nodeOperator, address _depositor) external initializer
```

Initializes the vault with owner, node operator, and depositor roles.

### fund()

```solidity
function fund() external payable onlyOwner
```

Adds ETH to the vault. Reverts if `msg.value` is zero.

### withdraw(address \_recipient, uint256 \_ether)

```solidity
function withdraw(address _recipient, uint256 _ether) external onlyOwner
```

Withdraws ETH to a recipient. Only withdraws from `availableBalance()` (staged funds are protected).

### pauseBeaconChainDeposits()

```solidity
function pauseBeaconChainDeposits() external onlyOwner
```

Pauses beacon chain deposits. Reverts if already paused.

### resumeBeaconChainDeposits()

```solidity
function resumeBeaconChainDeposits() external onlyOwner
```

Resumes beacon chain deposits. Reverts if already resumed.

### depositToBeaconChain(Deposit \_deposit)

```solidity
function depositToBeaconChain(Deposit calldata _deposit) external onlyDepositor whenDepositsNotPaused
```

Deposits validator data directly to beacon chain from available balance.

### stage(uint256 \_ether)

```solidity
function stage(uint256 _ether) external onlyDepositor whenDepositsNotPaused
```

Stages ETH for validator activation. Moves funds from available to staged balance.

### unstage(uint256 \_ether)

```solidity
function unstage(uint256 _ether) public onlyDepositor
```

Unstages ETH to make it withdrawable again. Not affected by deposit pause.

### depositFromStaged(Deposit \_deposit, uint256 \_additionalAmount)

```solidity
function depositFromStaged(Deposit calldata _deposit, uint256 _additionalAmount) external onlyDepositor
```

Deposits using staged balance plus optional top-up from available balance.

**Note:** If `_additionalAmount` is zero, this operation is **not** affected by deposit pause - only the staged portion is used.

### requestValidatorExit(bytes \_pubkeys)

```solidity
function requestValidatorExit(bytes calldata _pubkeys) external onlyOwner
```

Requests validator exits by emitting events. Does not directly trigger exits - node operators must monitor for `ValidatorExitRequested` events.

### triggerValidatorWithdrawals(...)

```solidity
function triggerValidatorWithdrawals(
    bytes calldata _pubkeys,
    uint64[] calldata _amountsInGwei,
    address _excessRefundRecipient
) external payable onlyOwner
```

Triggers validator withdrawals via EIP-7002. Requires `msg.value` to cover fees.

- If `_amountsInGwei` is empty, triggers **full withdrawals**
- Otherwise triggers partial withdrawals with specified amounts
- Excess fee is refunded to `_excessRefundRecipient`

### ejectValidators(bytes \_pubkeys, address \_refundRecipient)

```solidity
function ejectValidators(bytes calldata _pubkeys, address _refundRecipient) external payable
```

**Only callable by node operator** (not owner). Triggers full validator exits via EIP-7002 without requiring owner cooperation. This allows node operators to force-exit validators if needed.

- If `_refundRecipient` is zero, excess fee refunds go to `msg.sender`
- Always triggers full withdrawals

### acceptOwnership()

```solidity
function acceptOwnership() public
```

Accepts a pending ownership transfer. Only callable by pending owner.

### transferOwnership(address \_newOwner)

```solidity
function transferOwnership(address _newOwner) public onlyOwner
```

Initiates 2-step ownership transfer.

### renounceOwnership()

```solidity
function renounceOwnership() public view onlyOwner
```

Blocked by design - always reverts with `RenouncementNotAllowed()`.

### setDepositor(address \_depositor)

```solidity
function setDepositor(address _depositor) external onlyOwner
```

Updates depositor address. Reverts if same as current depositor.

### ossify()

```solidity
function ossify() external onlyOwner
```

Pins the implementation for this vault (prevents future upgrades). **Warning:** This operation is irreversible. Vault cannot be connected to VaultHub after ossification.

### collectERC20(address \_token, address \_recipient, uint256 \_amount)

```solidity
function collectERC20(address _token, address _recipient, uint256 _amount) external onlyOwner
```

Recovers ERC-20 tokens sent to the vault.

**Note:** Does not support ETH recovery (reverts with `EthCollectionNotAllowed` if EIP-7528 ETH address is passed). Use `withdraw()` for ETH.

## Receiving ETH

The contract has a `receive()` function allowing direct ETH transfers, but the preferred method is `fund()` which emits proper events.

## Related

- [VaultHub](/contracts/vault-hub.md)
- [PredepositGuarantee](/contracts/predeposit-guarantee.md)
- [Staking Vault Beacon](/contracts/staking-vault-beacon.md)
- [Staking Vault Factory](/contracts/staking-vault-factory.md)
- [stVaults Technical Design](/run-on-lido/stvaults/tech-documentation/tech-design)
