# SelfOwnedStETHBurner

- [Source Code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/SelfOwnedStETHBurner.sol)
- [Deployed Contract](https://etherscan.io/address/0xB280E33812c0B09353180e92e27b8AD399B07f26)

The contract provides a way for Lido governance to burn stETH token shares as a means to cover losses in staking.

It relies on the [rebasing](/contracts/lido#rebasing) nature of stETH. The `Lido` contract calculates user balance using the following equation,
`balanceOf(account) = shares[account] * totalPooledEther / totalShares`.
Therefore, burning shares (e.g. decreasing the `totalShares` amount) increases stETH holders' balances.

The contract doesn’t implement any auto-cover mechanism. There are no presumptions and prerequisites for
when and how exactly loss compensation happens. `SelfOwnedStETHBurner` provides a safe and deterministic way
to incur a positive stETH token rebase by gradually decreasing `totalShares` that can be correctly handled
by 3rd party protocols (e.g. Anchor Protocol) integrated with stETH.

`SelfOwnedStETHBurner` accepts burning requests by locking caller-provided stETH tokens. Those burn requests
are initially set by the contract to a pending state. Actual burning happens as part of an oracle (LidoOracle)
beacon report to prevent additional fluctuations of the existing stETH token rebase period (~24h).

We also distinguish two types of shares burn requests:
* request to **cover** a slashing event (e.g. decreasing of the total pooled ETH amount
between the two consecutive oracle reports);
* request to burn shares for any other cases (**non-cover**).

The contract has two separate counters for the burnt shares: cover and non-cover ones. The contract has
exclusive access to the stETH shares burning via constrained [`BURN_ROLE`](/token-guides/steth-superuser-functions#superuser-roles):
burning allowed only from the contract's own balance only.

To prevent overly large rebasing events entailing unfair coverage distribution via front-running techniques,
the contract has a limit on burnable shares per single beacon report. Thus, burning requests
can be executed in more than one pass.

The full formal spec is provided with
[LIP-6](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-6.md).

## Cover application workflow

1. The contract accepts burn requests only from the `Aragon Voting` contract by transferring stETH.
2. The transfer is performed by `requestBurnMyStETHForCover` func call which requires explicit `approve` beforehand.
3. Cover application is performed as a part of oracle reports and rate-limited to prevent sandwiching.

NB: daily burn quota is set to 4BP of TVL, consider to tune it if needed (overall token rebase should stay less than 7.5BP).

## Shares burnt counters

The contract keeps count of all shares ever burned by way of maintaining two internal counters: `totalCoverSharesBurnt` and `totalNonCoverSharesBurnt` for cover and non-cover burns respectively. These counters are increased when actual stETH burn is performed as part of the Lido Oracle report.

This makes it possible to split any stETH rebase into two sub-components: the rewards-induced rebase
and cover application-induced rebase, which can be done as follows:

1. Before the rebase, store the previous values of both counters, as well as the value of stETH share price:
   ```sol
   prevCoverSharesBurnt = SelfOwnedStETHBurner.totalCoverSharesBurnt()
   prevSharePrice = stETH.totalSupply() / stETH.getTotalShares()
   ```
2. After the rebase, perform the following calculations:
   ```sol
   sharesBurntFromOldToNew = SelfOwnedStETHBurner.totalCoverSharesBurnt() - prevCoverSharesBurnt;
   newSharePriceAfterCov = stETH.totalSupply() / (stETH.getTotalShares() + sharesBurntFromOldToNew);
   newSharePrice = stETH.totalSupply() / stETH.getTotalShares();

   // rewards-induced share price increase
   rewardPerShare = newSharePriceAfterCov - prevSharePrice;

   // cover-induced share price increase
   nonRewardSharePriceIncrease = newSharePrice - prevSharePrice - rewardPerShare;
   ```

The Anchor Protocol integration (bETH token) already has the calculations proposed above implemented using a plug-in
adapter [`InsuranceConnector`](https://github.com/lidofinance/anchor-collateral-steth/blob/feature/lip-6/contracts/InsuranceConnector.vy)
for retrieving the total number of shares burnt for cover purposes.
See [`AnchorVault.collect_rewards#442`](https://github.com/lidofinance/anchor-collateral-steth/blob/e0e23e63ad24d44c2ffc0799cc701dbe71a578ed/contracts/AnchorVault.vy#L442)
for the possible sketch of usage with similar integrations.

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

### Function: getBurnAmountPerRunQuota

Returns the maximum amount of shares allowed to burn per single run.
Expressed in basis points as ratio of shares to burn to the total shares in existence.

:::note
10000 basis points (BP) corresponds to 100%.
:::

```sol
function getBurnAmountPerRunQuota() external view returns (uint256)
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

### Function: setBurnAmountPerRunQuota

Sets the amount of shares allowed to burn per single run.
Expressed in basis points as ratio of shares to burn to the total shares in existence.

```sol
function setBurnAmountPerRunQuota(uint256 _maxBurnAmountPerRunBasisPoints) external
```

:::note
Reverts if any of the following is true:
* `_maxBurnAmountPerRunBasisPoints` is zero;
* `_maxBurnAmountPerRunBasisPoints` exceeds `10000`;
* `msg.sender` is not equal to the set upon construction `voting` address;
:::

#### Parameters:

| Name                              | Type      | Description           |
| --------------------------------- | --------- | --------------------- |
| `_maxBurnAmountPerRunBasisPoints` | `uint256` | new quota value, BP   |

### Function: processLidoOracleReport

Enacts cover/non-cover burning requests and logs cover/non-cover shares amount just burnt.
Increments public `totalCoverSharesBurnt` and `totalNonCoverSharesBurnt` counters.
Decrements internal `coverSharesBurnRequested` and `nonCoverSharesBurnRequested` counters.

Does nothing if there are no pending burning requests.
Could be called as part of an oracle quorum report only.

```sol
function: processLidoOracleReport(uint256, uint256, uint256) external override
```

:::note
The burning requests could be executed partially per single run due to the `maxBurnAmountPerRunBasisPoints` limit.
The cover reasoned burning requests have a higher priority of execution.

Reverts if there are pending burning requests and the `msg.sender` is not of one
of the `LidoOracle` or `LidoOracle.getBeaconReportReceiver()`.

Input parameters are needed only for the ABI compatibility, the values are always ignored.

See also:
[`IBeaconReportReceiver.processLidoOracleReport`](/contracts/lido-oracle#receiver-function-to-be-invoked-on-report-pushes).
:::

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
