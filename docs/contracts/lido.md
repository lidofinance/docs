# Lido

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/Lido.sol)
- [Deployed contract](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84)

Lido is the core contract which acts as a liquid staking pool. The contract is responsible for Ether deposits and withdrawals, minting and burning liquid tokens, delegating funds to node operators, applying fees, and accepting updates from the oracle contract. Node Operators' logic is extracted to a separate contract, NodeOperatorsRegistry.

Lido also acts as an ERC20 token which represents staked ether, stETH. Tokens are minted upon deposit and burned when redeemed. stETH tokens are pegged 1:1 to the Ethers that are held by Lido. stETH token’s balances are updated when the oracle reports change in total stake every day.

## Rebasing

When a rebase occurs the supply of the token is increased or decreased algorithmically, based on the staking rewards(or slashing penalties) in the Eth2 chain. Rebase happens when oracles report beacon stats.

Rebasing mechanism implemented via "shares". Instead of storing map with account balances, Lido stores which share owned by account in the total amount of Ether controlled by the protocol.

Balance of account calculated next way:

```
balanceOf(account) = shares[account] * totalPooledEther / totalShares
```

- `shares` - map of user account shares. Every time user deposit ether, it converted to shares and added to current user shares.

- `totalShares` sum of shares of all account in `shares` map

- `totalPooledEther` is a sum of three types of ether owned by protocol:

  - buffered balance - ether stored on contract and haven't deposited to official Deposit contract yet.
  - transient balance - ether submitted to the official Deposit contract but not yet visible in the beacon state.
  - beacon balance - total amount of ether on validator accounts. This value reported by oracles and makes strongest impact to stETH total supply change.

For example, assume that we have:

```
totalShares = 500
totalPooledEther = 10 ETH
sharesOf(Alice) -> 100
sharesOf(Bob) -> 400
```

Therefore:

```
balanceOf(Alice) -> 2 tokens which corresponds 2 ETH
balanceOf(Bob) -> 8 tokens which corresponds 8 ETH
```

## Beacon Stats Reporting

One of the most important parts of protocol, it's precise and steady reported data about current balances of validators. Such reports happen once at defined period of time, called frame. Frame duration set by DAO, current value is 24 hours.

To update stats on main Lido contract oracle demands quorum to be reached.
Quorum - is a necessary amount of reports with equal stats from offchain oracle daemons run by protocol participants.
Quorum size and members controlled by DAO.
If quorum wasn't reached next report can happen only at the first epoch of next frame (after 24 hours).

Report consists of count of validators participated in protocol - beacon validators and total amount of ether on validator accounts - beacon balance. Typically beacon balance growth from report to report, but in exceptional cases it also can drops, because of slashing.

- When beacon balance grown between reports, protocol register profit and distribute reward of fresh minting stETH tokens between stETH holders, node operators, insurance fund and treasury. Fee distribution for node operators, insurance fund and treasury can be set by DAO.
- When frame was ended with slashing and new beacon balance less than previous one total supply of stETH becomes less than in previous report and no rewards distributed.

## View Methods

### name()

Returns the name of the token

```sol
function name() returns (string)
```

### symbol()

Returns the symbol of the token, usually a shorter version of the name

```sol
function symbol() returns (string)
```

### decimals()

Returns the number of decimals for getting user representation of a token amount.

```sol
function decimals() returns (uint8)
```

### totalSupply()

Returns the amount of tokens in existence.

```sol
function totalSupply() returns (uint256)
```

:::note
Always equals to `getTotalPooledEther()` since token amount
is pegged to the total amount of Ether controlled by the protocol.
:::

### getTotalPooledEther()

Returns the entire amount of Ether controlled by the protocol

```sol
function getTotalPooledEther() returns (uint256)
```

:::note
The sum of all ETH balances in the protocol, equals to the total supply of stETH.
:::

### balanceOf()

Returns the amount of tokens owned by the `_account`

```sol
function balanceOf(address _account) returns (uint256)
```

:::note
Balances are dynamic and equal the `_account`'s share in the amount of the
total Ether controlled by the protocol. See `sharesOf`.
:::

### getTotalShares()

Returns the total amount of shares in existence.

```sol
function getTotalShares() returns (uint256)
```

### sharesOf()

Returns the amount of shares owned by `_account`

```sol
function sharesOf(address _account) returns (uint256)
```

### getSharesByPooledEth()

Returns the amount of shares that corresponds to `_ethAmount` protocol-controlled Ether

```sol
function getSharesByPooledEth(uint256 _ethAmount) returns (uint256)
```

### getPooledEthByShares()

Returns the amount of Ether that corresponds to `_sharesAmount` token shares

```sol
function getPooledEthByShares(uint256 _sharesAmount) returns (uint256)
```

### getFee()

Returns staking rewards fee rate

```sol
function getFee() returns (uint16)
```

#### Returns:

Fee in basis points. 10000 BP corresponding to 100%.

### getFeeDistribution()

Returns fee distribution proportion

```sol
function getFeeDistribution() returns (
  uint16 treasuryFeeBasisPoints,
  uint16 insuranceFeeBasisPoints,
  uint16 operatorsFeeBasisPoints
)
```

#### Returns:

| Name                      | Type     | Description                                                                            |
| ------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `treasuryFeeBasisPoints`  | `uint16` | Fee for the treasury. Expressed in basis points, 10000 BP corresponding to 100%.       |
| `insuranceFeeBasisPoints` | `uint16` | Fee for the insurance fund. Expressed in basis points, 10000 BP corresponding to 100%. |
| `operatorsFeeBasisPoints` | `uint16` | Fee for the node operators. Expressed in basis points, 10000 BP corresponding to 100%. |

### getWithdrawalCredentials()

Returns current credentials to withdraw ETH on ETH 2.0 side after the phase 2 is launched

```sol
function getWithdrawalCredentials() returns (bytes32)
```

### getBufferedEther()

Get the amount of Ether temporary buffered on this contract balance

:::note

Buffered balance is kept on the contract from the moment the funds are received from user
until the moment they are actually sent to the official Deposit contract.

:::

```sol
function getBufferedEther()  returns (uint256)
```

#### Returns:

Amount of buffered funds in wei

### getDepositContract()

Gets deposit contract handle

```sol
function getDepositContract() public view returns (IDepositContract)
```

#### Returns:

Address of deposit contract

### getOracle()

Returns authorized oracle address

```sol
function getOracle() returns (address)
```

### getOperators()

Gets node operators registry interface handle

```sol
function getOperators() returns (INodeOperatorsRegistry)
```

#### Returns:

Address of NodeOperatorsRegistry contract

### getTreasury()

Returns the treasury address

```sol
function getTreasury() returns (address)
```

### getInsuranceFund()

Returns the insurance fund address

```sol
function getInsuranceFund() returns (address)
```

### getBeaconStat()

Returns the key values related to Beacon-side

```sol
function getBeaconStat() returns (
  uint256 depositedValidators,
  uint256 beaconValidators,
  uint256 beaconBalance
)
```

#### Returns:

| Name                  | Type      | Description                                                                    |
| --------------------- | --------- | ------------------------------------------------------------------------------ |
| `depositedValidators` | `uint256` | Number of deposited validators                                                 |
| `beaconValidators`    | `uint256` | Number of Lido's validators visible in the Beacon state, reported by oracles   |
| `beaconBalance`       | `uint256` | Total amount of Beacon-side Ether (sum of all the balances of Lido validators) |

## Methods

### transfer()

Moves `_amount` tokens from the caller's account to the `_recipient` account.

```sol
function transfer(address _recipient, uint256 _amount) returns (bool)
```

:::note
Requirements:

- `_recipient` cannot be the zero address.
- the caller must have a balance of at least `_amount`.
- the contract must not be paused.

:::

#### Parameters:

| Name         | Type      | Description                  |
| ------------ | --------- | ---------------------------- |
| `_recipient` | `address` | Address of tokens recipient  |
| `_amount`    | `uint256` | Amount of tokens to transfer |

#### Returns:

A boolean value indicating whether the operation succeeded.

### allowance()

Returns the remaining number of tokens that `_spender` is allowed to spend
on behalf of `_owner` through `transferFrom`. This is zero by default.

```sol
function allowance(address _owner, address _spender) returns (uint256)
```

:::note
This value changes when `approve` or `transferFrom` is called.
:::

#### Parameters:

| Name       | Type      | Description        |
| ---------- | --------- | ------------------ |
| `_owner`   | `address` | Address of owner   |
| `_spender` | `address` | Address of spender |

### approve()

Sets `_amount` as the allowance of `_spender` over the caller's tokens

```sol
function approve(address _spender, uint256 _amount) returns (bool)
```

:::note
Requirements:

- `_spender` cannot be the zero address.
- the contract must not be paused.

:::

#### Parameters:

| Name       | Type      | Description        |
| ---------- | --------- | ------------------ |
| `_spender` | `address` | Address of spender |
| `_amount`  | `uint256` | Amount of tokens   |

#### Returns:

A boolean value indicating whether the operation succeeded

### transferFrom()

Moves `_amount` tokens from `_sender` to `_recipient` using the
allowance mechanism. `_amount` is then deducted from the caller's
allowance.

```sol
function transferFrom(
  address _sender,
  address _recipient,
  uint256 _amount
) returns (bool)
```

:::note

Requirements:

- `_sender` and `_recipient` cannot be the zero addresses.
- `_sender` must have a balance of at least `_amount`.
- the caller must have allowance for `_sender`'s tokens of at least `_amount`.
- the contract must not be paused.

:::

#### Parameters:

| Name         | Type      | Description          |
| ------------ | --------- | -------------------- |
| `_sender`    | `address` | Address of spender   |
| `_recipient` | `address` | Address of recipient |
| `_amount`    | `uint256` | Amount of tokens     |

#### Returns:

A boolean value indicating whether the operation succeeded

### increaseAllowance()

Atomically increases the allowance granted to `_spender` by the caller by `_addedValue`

This is an alternative to `approve` that can be used as a mitigation for problems described [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L42)

```sol
function increaseAllowance(address _spender, uint256 _addedValue) returns (bool)
```

:::note

Requirements:

- `_spender` cannot be the the zero address.
- the contract must not be paused.

:::

#### Parameters:

| Name          | Type      | Description                            |
| ------------- | --------- | -------------------------------------- |
| `_sender`     | `address` | Address of spender                     |
| `_addedValue` | `uint256` | Amount of tokens to increase allowance |

#### Returns:

Returns a boolean value indicating whether the operation succeeded

### decreaseAllowance()

Atomically decreases the allowance granted to `_spender` by the caller by `_subtractedValue`

This is an alternative to `approve` that can be used as a mitigation for
problems described [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L42)

```sol
function decreaseAllowance(address _spender, uint256 _subtractedValue) returns (bool)
```

:::note
Requirements:

- `_spender` cannot be the zero address.
- `_spender` must have allowance for the caller of at least `_subtractedValue`.
- the contract must not be paused.

:::

#### Parameters:

| Name               | Type      | Description                            |
| ------------------ | --------- | -------------------------------------- |
| `_sender`          | `address` | Address of spender                     |
| `_subtractedValue` | `uint256` | Amount of tokens to decrease allowance |

#### Returns:

Returns a boolean value indicating whether the operation succeeded

### submit()

Send funds to the pool with optional \_referral parameter

```sol
function submit(address _referral) returns (uint256)
```

#### Parameters:

| Name        | Type      | Description               |
| ----------- | --------- | ------------------------- |
| `_referral` | `address` | Optional referral address |

#### Returns:

Amount of StETH shares generated

### depositBufferedEther()

Deposits buffered ethers to the official DepositContract. If `_maxDeposits` provided makes no more than `_maxDeposits` deposit calls

```sol
function depositBufferedEther()
function depositBufferedEther(uint256 _maxDeposits)
```

#### Parameters:

| Name           | Type      | Description                 |
| -------------- | --------- | --------------------------- |
| `_maxDeposits` | `uint256` | Number of max deposit calls |

### burnShares()

Destroys `_sharesAmount` shares from `_account`'s holdings, decreasing the total amount of shares.

```sol
function burnShares(
  address _account,
  uint256 _sharesAmount
) returns (uint256 newTotalShares)
```

:::note
This doesn't decrease the token total supply.

Requirements:

- `_account` cannot be the zero address.
- `_account` must hold at least `_sharesAmount` shares.
- the contract must not be paused.

:::

#### Parameters

| Name            | Type      | Description                         |
| --------------- | --------- | ----------------------------------- |
| `_account`      | `address` | Address where shares will be burned |
| `_sharesAmount` | `uint256` | Amount of shares to burn            |

#### Returns

Amount of totalShares after tokens burning

### stop()

Stop pool routine operations

```sol
function stop()
```

### resume()

Resume pool routine operations

```sol
function resume()
```

### setFee()

Set fee rate to `_feeBasisPoints` basis points. The fees are accrued when oracles report staking results

```sol
function setFee(uint16 _feeBasisPoints)
```

#### Parameters

| Name              | Type     | Description                                                    |
| ----------------- | -------- | -------------------------------------------------------------- |
| `_feeBasisPoints` | `uint16` | Fee expressed in basis points, 10000 BP corresponding to 100%. |

### setFeeDistribution()

Set fee distribution: `_treasuryFeeBasisPoints` basis points go to the treasury,
`_insuranceFeeBasisPoints` basis points go to the insurance fund,
`_operatorsFeeBasisPoints` basis points go to node operators.
The sum has to be 10 000.

```sol
function setFeeDistribution(
  uint16 _treasuryFeeBasisPoints,
  uint16 _insuranceFeeBasisPoints,
  uint16 _operatorsFeeBasisPoints
)
```

#### Parameters

| Name                       | Type     | Description                                                                            |
| -------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `_treasuryFeeBasisPoints`  | `uint16` | Fee for the treasury. Expressed in basis points, 10000 BP corresponding to 100%.       |
| `_insuranceFeeBasisPoints` | `uint16` | Fee for the insurance fund. Expressed in basis points, 10000 BP corresponding to 100%. |
| `_operatorsFeeBasisPoints` | `uint16` | Fee for the node operators. Expressed in basis points, 10000 BP corresponding to 100%. |

### setOracle()

Set authorized oracle contract address to `_oracle`

```sol
function setOracle(address _oracle)
```

#### Parameters

| Name      | Type      | Description                |
| --------- | --------- | -------------------------- |
| `_oracle` | `address` | Address of oracle contract |

### setTreasury()

Set treasury contract address to `_treasury`. This contract is used to accumulate the protocol treasury fee

```sol
function setTreasury(address _treasury)
```

#### Parameters

| Name        | Type      | Description                                        |
| ----------- | --------- | -------------------------------------------------- |
| `_treasury` | `address` | Address of contract which accumulates treasury fee |

### setInsuranceFund()

Set insuranceFund contract address to `_insuranceFund`.
This contract is used to accumulate the protocol insurance fee

```sol
function setInsuranceFund(address _insuranceFund)
```

#### Parameters

| Name             | Type      | Description                                         |
| ---------------- | --------- | --------------------------------------------------- |
| `_insuranceFund` | `address` | Address of contract which accumulates insurance fee |

### setWithdrawalCredentials()

Set credentials to withdraw ETH on ETH 2.0 side after the phase 2 is launched to `_withdrawalCredentials`

```sol
function setWithdrawalCredentials(bytes32 _withdrawalCredentials)
```

:::note
Note that `setWithdrawalCredentials` discards all unused signing keys as the signatures are invalidated.
:::

#### Parameters

| Name                     | Type      | Description                                                                                 |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------- |
| `_withdrawalCredentials` | `bytes32` | Hash of withdrawal multisignature key as accepted by the deposit_contract.deposit functione |

### withdraw()

Issues withdrawal request. **Not implemented.**

```sol
function withdraw(uint256 _amount, bytes32 _pubkeyHash)
```

:::note
Will be upgraded to an actual implementation when withdrawals are enabled (Phase 1.5 or 2 of Eth2 launch, likely late 2021 or 2022). At the moment withdrawals are not possible in the beacon chain and there's no workaround
:::

#### Parameters

| Name          | Type      | Description                 |
| ------------- | --------- | --------------------------- |
| `_amount`     | `uint256` | Amount of StETH to withdraw |
| `_pubkeyHash` | `bytes32` | Receiving address           |

### pushBeacon()

Updates the number of Lido-controlled keys in the beacon validators set and their total balance.

```sol
function pushBeacon(uint256 _beaconValidators, uint256 _beaconBalance)
```

#### Parameters

| Name                | Type      | Description                                       |
| ------------------- | --------- | ------------------------------------------------- |
| `_beaconValidators` | `uint256` | Number of Lido's keys in the beacon state         |
| `_beaconBalance`    | `uint256` | Summarized balance of Lido-controlled keys in wei |

### transferToVault()

Send funds to recovery Vault. Overrides default AragonApp behaviour.

```sol
function transferToVault(address _token)
```

#### Parameters

| Name     | Type      | Description                        |
| -------- | --------- | ---------------------------------- |
| `_token` | `address` | Token to be sent to recovery vault |
