# DelegationFactory

- [Source Code](https://github.com/lidofinance/execution-delegation-framework/blob/main/src/DelegationFactory.sol)
- [Deployed Contract](https://etherscan.io/address/0xD990770eB2B4b6062EDdB06892fF179C693b46e6)

`DelegationFactory` deploys [`DelegationContract`](/contracts/delegation-contract) instances for the [Execution Delegation Framework (EDF)](/guides/edf/edf-operator-guide). Anyone can call `deploy()`. The parameters of the new contract cannot be changed after deployment.

Only contracts deployed from this factory are accepted for Lido Oracle and Deposit Security Committee seats. Factory addresses per network are listed on the [deployed contracts](/deployed-contracts/#execution-delegation-framework) page.

## Methods

### deploy()

Deploys a new `DelegationContract`.

```solidity
function deploy(address owner, address delegate, uint256 cooldown) external returns (address instance);
```

:::note
Reverts if any of the following is true:

- `owner` is zero address;
- `delegate` is equal to `owner`.
:::

#### Parameters

| Name       | Type      | Description                                                                                                                                                   |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`    | `address` | Owner of the new contract. Cannot be changed later.                                                                                                           |
| `delegate` | `address` | Initial delegate, active immediately. Zero address deploys the contract without a delegate.                                                                   |
| `cooldown` | `uint256` | Seconds between a nomination and the moment the new delegate becomes active. Cannot be changed later. The [custody policy](/guides/edf/key-custody-policy-for-edf-operators#3-owner-key-custody) requires at least 172800 (48 hours). |

#### Returns

| Name       | Type      | Description                             |
| ---------- | --------- | --------------------------------------- |
| `instance` | `address` | Address of the new `DelegationContract` |

## Events

### DelegationContractDeployed()

Emitted for each deployed `DelegationContract`.

```solidity
event DelegationContractDeployed(
    address indexed instance,
    address indexed owner,
    address indexed delegate,
    uint256 cooldown
);
```
