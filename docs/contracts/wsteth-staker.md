# WstETHReferralStaker

- [Source code](https://github.com/lidofinance/si-lidity/blob/develop/si-contracts/0.8.25/WstETHReferralStaker.sol)
- [Deployed Contract](https://etherscan.io/address/0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d)

## What is wstETH Referral Staker

**WstETHReferralStaker** is a utility contract that allows users to stake ETH into the Lido protocol with referral address, then automatically wrap the received stETH into wstETH and transfer it back to the user in a single transaction.

## Upgradability

This contract is **not upgradable**, **ossified** and **permissionaless**.

## How to use this contract?

:::warning
Do not send Ether or any tokens directly to this contract address. No funds can be rescued from this contract.
:::

Call `stakeETH(address _referral)` method on the `WstETHReferralStaker` contract with `value` equal to amount of ETH you want to stake with `_referral` address set to preferred referral address(could be zero address). For more information see [`stETH.submit(address _referral)`](<./lido.md#submit()>)

## Methods

Stake ETH directly into wstETH with `referral` address.

:::note
With correct parameters `eth_call` RPC method can be used to preview total amount of wstETH caller will receive from transaction.
:::

```solidity
function stakeETH(address _referral) external payable returns (uint256)
```

**Parameters**

| Parameter Name | Type      | Description                                   |
| -------------- | --------- | --------------------------------------------- |
| `value`        | `uint256` | ETH value attached to                         |
| `_referral`    | `address` | Referral address for Lido's referral program. |

**Returns**

Amount of wstETH caller receives after wrap.
