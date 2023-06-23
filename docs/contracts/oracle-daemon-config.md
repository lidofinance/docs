# OracleDaemonConfig

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/OracleDaemonConfig.sol)
- [Deployed contract](https://etherscan.io/address/0xbf05A929c3D7885a6aeAd833a992dA6E5ac23b09)

OracleDaemonConfig acts as a parameters registry for the Lido oracle daemon.
The full list of params are provided in the Lido V2 mainnet parameters [guide](/guides/verify-lido-v2-upgrade-manual#oracledaemonconfig).

:::note
In contrast to [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker), the stored values aren't enforced by the protocol on-chain code.
:::

## View methods

### get(string calldata _key)

Retrieves the value corresponding to the provided key.

```solidity
function get(string calldata _key) external view returns (bytes memory)
```

:::note
Reverts if value is missing.
:::

### getList(string[] calldata _keys)

Retrieves a list of values corresponding to the provided keys.

```solidity
function getList(string[] calldata _keys) external view returns (bytes[] memory)
```

:::note
Reverts if any value for a specific key is missing.
:::

## Methods

### set(string calldata _key, bytes calldata _value)

Sets the value for the provided key. Can only be called by users with `CONFIG_MANAGER_ROLE`.

```solidity
function set(string calldata _key, bytes calldata _value) external
```

:::note
Reverts if any of the following is true:
- value with provided key already exists
- value is empty
- called by someone who doesn't have `CONFIG_MANAGER_ROLE` role
:::

### update(string calldata _key, bytes calldata _value)

Updates the value for the provided key. Can only be called by users with `CONFIG_MANAGER_ROLE`.

```solidity
function update(string calldata _key, bytes calldata _value) external
```

:::note
Reverts if any of the following is true:
- value with provided key doesn't exist
- value is the same with the one already set
- value is empty
- called by someone who doesn't have `CONFIG_MANAGER_ROLE` role
:::

### unset(string calldata _key)

Removes the value of the provided key. Can only be called by users with `CONFIG_MANAGER_ROLE`.

```solidity
function unset(string calldata _key) external
```

:::note
Reverts if any of the following is true:
- value with provided key doesn't exist
- called by someone who doesn't have `CONFIG_MANAGER_ROLE` role
:::

## Events

### ConfigValueSet

Emitted when a new key-value pair is set.

```solidity
event ConfigValueSet(string indexed key, bytes value)
```

### ConfigValueUpdated

Emitted when a key-value pair is updated.

```solidity
event ConfigValueUpdated(string indexed key, bytes value)
```

### ConfigValueUnset

Emitted when a key-value pair is unset.

```solidity
event ConfigValueUnset(string indexed key)
```