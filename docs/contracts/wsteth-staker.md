# wstETHReferralStaker

- [Source code](https://github.com/lidofinance/si-lidity/blob/41dc3c24b9e4f882789e4c0f7c63f2f5ca56d391/si-contracts/0.8.25/wsteth-staker/WstethStaker.sol)
- [Deployed Contract](https://etherscan.io/address/0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d)
- [Security audit](https://github.com/lidofinance/audits/blob/main/MixBytes%20WstETH%20Staker%20Security%20Audit%20Report%2009-2025.pdf)

## What is wstETH Referral Staker

**WstETHReferralStaker** is a utility contract that allows callers to stake ETH into the Lido protocol with a referral address, automatically wrap the received stETH into wstETH, and receive the wstETH in a single transaction.

## Upgradability

This contract is **non-upgradable**, **immutable** and **permissionless**.

## How to use this contract?

:::warning
Do not send Ether or any tokens directly to this contract address. No funds can be rescued from this contract.
:::

Call the `stakeETH(address _referral)` method on the `wstETHReferralStaker` contract with `value` equal to the amount of ETH you want to stake and `_referral` set to the preferred referral address (which can be the zero address). The minted wstETH is transferred to `msg.sender`; there is no separate recipient parameter. For more information, see [`stETH.submit(address _referral)`](/contracts/lido#submit).

## Methods

Stake ETH directly into wstETH with a `referral` address.

:::note
To preview the amount of wstETH, use the `eth_call` RPC method with the intended sender and the same `msg.value`. The method has no minimum-output parameter, so reconcile its return value or the caller's wstETH balance change when the transaction executes.
:::

```solidity
function stakeETH(address _referral) external payable returns (uint256)
```

**Parameters**

| Parameter Name | Type      | Description                       |
| -------------- | --------- | --------------------------------- |
| `msg.value`    | `uint256` | ETH value attached to transaction |
| `_referral`    | `address` | Referral address                  |

**Returns**

Amount of wstETH caller receives after wrap.
