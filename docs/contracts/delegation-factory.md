# DelegationFactory

- [Source Code](https://github.com/lidofinance/execution-delegation-framework/blob/main/src/DelegationFactory.sol)
- [Deployed Contract](https://etherscan.io/address/0xD990770eB2B4b6062EDdB06892fF179C693b46e6)

`DelegationFactory` deploys [`DelegationContract`](/contracts/delegation-contract) instances for the [Execution Delegation Framework (EDF)](/guides/edf/edf-operator-guide). It is a stateless, permissionless factory: anyone can call `deploy()`. All constructor parameters of the new contract are fixed at deployment and cannot be changed later.

Only contracts deployed from the official factory are accepted for Lido Oracle and Deposit Security Committee seats. The factory address for each network is listed on the [deployed contracts](/deployed-contracts/#execution-delegation-framework) page.

## Methods

### deploy()

Deploys a new `DelegationContract` and emits `DelegationContractDeployed`.

```solidity
function deploy(address owner, address delegate, uint256 cooldown) external returns (address instance);
```

:::note
Reverts if any of the following is true:

- `owner` is zero address;
- `delegate` is equal to `owner`.
:::

#### Parameters

| Name       | Type      | Description                                                                                                                                        |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`    | `address` | Owner of the new contract. Fixed for the lifetime of the contract.                                                                                 |
| `delegate` | `address` | Initial delegate, effective immediately. Pass zero address to deploy without a delegate.                                                            |
| `cooldown` | `uint256` | Seconds a nominated delegate waits before it becomes effective. Fixed for the lifetime of the contract. The [custody policy](/guides/edf/key-custody-policy-for-edf-operators#3-owner-key-custody) requires at least 172800 (48 hours). |

#### Returns

| Name       | Type      | Description                             |
| ---------- | --------- | --------------------------------------- |
| `instance` | `address` | Address of the new `DelegationContract` |

## Events

### DelegationContractDeployed()

Emitted for each `DelegationContract` deployed by the factory.

```solidity
event DelegationContractDeployed(
    address indexed instance,
    address indexed owner,
    address indexed delegate,
    uint256 cooldown
);
```
