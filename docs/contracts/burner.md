# Burner

- [Source Code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/Burner.sol)
- [Deployed Contract](https://etherscan.io/address/0xD15a672319Cf0352560eE76d9e89eAB0889046D3)

The contract provides a way for Lido protocol to burn stETH token shares as a means to finalize withdrawals,
penalize untimely exiting node operators, and, possibly, cover losses in staking.

It relies on the [rebasing](/contracts/lido#rebasing) nature of stETH. The `Lido` contract calculates
user balance using the following equation:
`balanceOf(account) = shares[account] * totalPooledEther / totalShares`.
Therefore, burning shares (e.g. decreasing the `totalShares` amount) increases stETH holders' balances.

It's presumed that actual shares burning happens inside the `Lido` contract as a part of the `AccountingOracleReport`.
`Burner` provides a safe and deterministic way to incur a positive stETH token rebase by gradually
decreasing `totalShares` that can be correctly handled by 3rd party protocols integrated with stETH.

`Burner` accepts burning requests by the following two ways:

- Locking pre-approved stETH tokens by the caller with an assigned role.
- Locking caller-provided stETH tokens.

Those burn requests are initially set by the contract to a pending state.
Actual burning happens as part of an oracle (`AccountinOracle`) report handling by `Lido` to prevent
additional fluctuations of the existing stETH token rebase period (~24h).

We also distinguish two types of shares burn requests:
* request to **cover** a slashing event (e.g. decreasing of the total pooled ETH amount
between the two consecutive oracle reports);
* request to burn shares for any other cases (**non-cover**).

The contract has two separate counters for the burnt shares: cover and non-cover ones. The contract is
exclusive responsible for the stETH shares burning via by `Lido` and burning allowed only from the contract's
own balance only.

## Shares burnt counters

The contract keeps count of all shares ever burned by way of maintaining two internal counters:
`totalCoverSharesBurnt` and `totalNonCoverSharesBurnt` for cover and non-cover burns respectively.
These counters are increased when actual stETH burn is performed as part of the Lido Oracle report.

This makes it possible to split any stETH rebase into two sub-components: the rewards-induced rebase
and cover application-induced rebase, which can be done as follows:

1. Before the rebase, store the previous values of both counters, as well as the value of stETH share price:
   ```sol
   prevCoverSharesBurnt = Burner.totalCoverSharesBurnt()
   prevSharePrice = stETH.totalSupply() / stETH.getTotalShares()
   ```
2. After the rebase, perform the following calculations:
   ```sol
   sharesBurntFromOldToNew = Burner.totalCoverSharesBurnt() - prevCoverSharesBurnt;
   newSharePriceAfterCov = stETH.totalSupply() / (stETH.getTotalShares() + sharesBurntFromOldToNew);
   newSharePrice = stETH.totalSupply() / stETH.getTotalShares();

   // rewards-induced share price increase
   rewardPerShare = newSharePriceAfterCov - prevSharePrice;

   // cover-induced share price increase
   nonRewardSharePriceIncrease = newSharePrice - prevSharePrice - rewardPerShare;
   ```

## View methods

### Function: getCoverSharesBurnt

Returns the total cover shares ever burnt.

```sol
function getCoverSharesBurnt() external view returns (uint256)
```

### Function: getNonCoverSharesBurnt

Returns the total non-cover shares ever burnt.

```sol
function getNonCoverSharesBurnt() external view returns (uint256)
```

### function getExcessStETH

Returns the stETH amount belonging to the burner contract address but not marked for burning.

```sol
function getExcessStETH() external view return (uint256)
```

## Methods

### Function: requestBurnMyStETHForCover

Transfers stETH tokens from the message sender and irreversibly locks these on the burner contract address.
Internally converts tokens amount into underlying shares amount and marks the converted shares amount
for cover-backed burning by increasing the internal `coverSharesBurnRequested` counter.

```sol
function requestBurnMyStETHForCover(uint256 _stETH2Burn) external
```

:::note
Reverts if any of the following is true:
* `msg.sender` is not equal to the set upon construction `voting` address;
* no stETH provided (`_stETH2Burn == 0`);
* no stETH transferred (allowance exceeded).
:::

#### Parameters:

| Name          | Type      | Description                                     |
| ------------- | --------- | ----------------------------------------------- |
| `_stETH2Burn` | `uint256` | stETH tokens amount (not shares amount) to burn |

### Function: requestBurnMyStETH

Transfers stETH tokens from the message sender and irreversibly locks these on the burner contract address.
Internally converts tokens amount into underlying shares amount and marks the converted amount for
non-cover-backed burning by increasing the internal `nonCoverSharesBurnRequested` counter.

:::note
Reverts if any of the following is true:
* `msg.sender` is not equal to the set upon construction `voting` address;
* no stETH provided (`_stETH2Burn == 0`);
* no stETH transferred (allowance exceeded).
:::

#### Parameters:

| Name          | Type      | Description                                     |
| ------------- | --------- | ----------------------------------------------- |
| `_stETH2Burn` | `uint256` | stETH tokens amount (not shares amount) to burn |

### function recoverExcessStETH

Transfers the excess stETH amount (e.g. belonging to the burner contract address but not marked for burning)
to the Lido treasury address (the `DAO Agent` contract) set upon the contract construction.

Does nothing if the `getExcessStETH` view func returns 0 (zero), e.g. there is no excess stETH
on the contract's balance.

```sol
function recoverExcessStETH() external
```

### Function: recoverERC20

Transfers a given amount of an ERC20-token (defined by the provided contract address) belonging
to the burner contract address to the Lido treasury (the `DAO Agent` contract) address.

```sol
function recoverERC20(address _token, uint256 _amount) external
```
:::note
Reverts if any of the following is true:
* `_amount` value is 0 (zero);
* `_token` address is 0 (zero);
* `_token` address is equal to the `stETH` address (use `recoverExcessStETH` instead).
:::

#### Parameters:

| Name      | Type      | Description                                 |
| --------- | --------- | ------------------------------------------- |
| `_token`  | `address` | ERC20-compatible token address to recover   |
| `_amount` | `uint256` | Amount to recover                           |

### Function: recoverERC721

Transfers a given ERC721-compatible NFT (defined by the contract address) belonging to the burner contract address
to the Lido treasury (the `DAO Agent`) address.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

:::note
Reverts if `_token` address is 0 (zero).
:::

| Name       | Type      | Description                                 |
| ---------- | --------- | ------------------------------------------- |
| `_token`   | `address` | ERC721-compatible token address to recover  |
| `_tokenId` | `uint256` | Token id to recover                         |
