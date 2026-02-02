# UpgradeableBeacon

- [Source code](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.2.0/contracts/proxy/beacon/UpgradeableBeacon.sol)
- [Deployed contract](https://etherscan.io/address/0x5FbE8cEf9CCc56ad245736D3C5bAf82ad54Ca789)

OpenZeppelin UpgradeableBeacon used as the StakingVault beacon. It stores the current StakingVault implementation for all beacon proxies.

## What is UpgradeableBeacon?

UpgradeableBeacon is a beacon proxy controller:

- holds the current implementation address
- allows the Lido DAO to upgrade the implementation if vaults are not ossified
- is referenced by all `PinnedBeaconProxy` vaults created by `VaultFactory`

## Ownership and upgrades

The beacon is owned by the **Lido DAO** (via the Agent/Aragon governance). This means:

- Only Lido DAO governance can upgrade the StakingVault implementation
- All beacon proxy vaults automatically use the new implementation after an upgrade
- Upgrades affect all vaults simultaneously unless they have been ossified

### Ossification

Individual vaults can opt out of future upgrades by calling `ossify()` on their `StakingVault`. This "pins" the vault to its current implementation, making it immune to beacon upgrades. Ossification is:

- **Irreversible**: Once ossified, a vault cannot be un-ossified
- **Only available after disconnect**: Vaults must disconnect from VaultHub before ossifying
- **Owner-controlled**: Only the vault owner can ossify their vault

## View methods

### implementation()

```solidity
function implementation() public view returns (address)
```

Returns the current implementation address.

### owner()

```solidity
function owner() public view returns (address)
```

Returns the beacon owner.

## Methods

### upgradeTo(address newImplementation)

```solidity
function upgradeTo(address newImplementation) public onlyOwner
```

Upgrades the implementation used by the beacon.

### transferOwnership(address newOwner)

```solidity
function transferOwnership(address newOwner) public onlyOwner
```

Transfers beacon ownership.

### renounceOwnership()

```solidity
function renounceOwnership() public onlyOwner
```

Renounces ownership of the beacon.

## Related

- [StakingVault](/contracts/staking-vault)
- [Staking Vault Factory](/contracts/staking-vault-factory)
