# API

:::info
Lido APIs are strictly for read-only access
:::

Here you can find various Lido APIs which you can integrate in your app or website:

## Lido APR

API provides Ethereum and Lido staking APR, which include:

### Simple Moving Average Lido APR for 7 last days:

This APR value is based on Simple Moving Average of APR values over a period of 7 days.

```
https://eth-api.lido.fi/v1/protocol/steth/apr/sma
```

Response schema and examples are available in the [Swagger API documentation](https://eth-api.lido.fi/api/#/APR%20for%20Eth%20and%20stEth/ProtocolController_findSmaAPRforSTETH)

### Hoodi

```
https://eth-api-hoodi.testnet.fi/v1/protocol/steth/apr/sma
```

### Last Lido APR for stETH

The latest staking APR value. For legacy deployments, APR values were collected by periodically fetching oracle report events. For Lido V2+ the value is calculated based on [rebase events](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.4.24/Lido.sol#L163-L171) using the following algorithm:

```solidity
// Emits when token rebased (total supply and/or total shares were changed)
event TokenRebased(
    uint256 indexed reportTimestamp,
    uint256 timeElapsed,
    uint256 preTotalShares,
    uint256 preTotalEther, /* preTotalPooledEther */
    uint256 postTotalShares,
    uint256 postTotalEther, /* postTotalPooledEther */
    uint256 sharesMintedAsFees /* fee part included in `postTotalShares` */
);

preShareRate = preTotalEther * 1e27 / preTotalShares
postShareRate = postTotalEther * 1e27 / postTotalShares

userAPR =
    secondsInYear * (
        (postShareRate - preShareRate) / preShareRate
    ) / timeElapsed
```

```
https://eth-api.lido.fi/v1/protocol/steth/apr/last
```

Response schema and examples are available in the [Swagger API documentation](https://eth-api.lido.fi/api/#/APR%20for%20Eth%20and%20stEth/ProtocolController_findLastAPRforSTETH)

#### Hoodi

```
https://eth-api-hoodi.testnet.fi/v1/protocol/steth/apr/last
```

## Lido Reward History

Reward History Backend provides an API which returns all stETH interactions by an address and calculates its daily stETH rewards.

Currently, there's just one endpoint (`/`):

```
https://reward-history-backend.lido.fi/?address=0x12345
```

Response schema and examples are available in the [Swagger API documentation](https://reward-history-backend.lido.fi/api)

### Parameters

The only required query parameter is `address`.

Optional Parameters:

- `currency`: USD/EUR/GBP - Fiat currency in which to display stETH denominated in fiat. **USD** by default.
- `archiveRate`: true/false - Use an exchange rate close to the transaction time when calculating currency values instead of the current one. **true** by default.
- `onlyRewards`: true/false - Include only rewards without transfers or stakings. **false** by default.
- `sort`: asc/desc - Sort of transactions by blockTime. **desc** by default.
- `skip`: number - Amount of data items to skip.
- `limit`: number - Maximum amount of data items to respond with.

`skip` and `limit` params are used for pagination, e.g.:

```
skip: 0, limit: 100 = 1 page
skip: 100, limit: 100 = 2 page
skip: 200, limit: 100 = 3 page
```

### Hoodi

Reward History Backend is also available on Holešky:

```
http://reward-history-backend-hoodi.testnet.fi/?address=0x12345
```

Response schema and examples are available in the [Swagger API documentation](https://reward-history-backend-hoodi.testnet.fi/api)

## Withdrawals API

The Withdrawals API service offers an utility for estimating the waiting time for [withdrawals](https://docs.lido.fi/contracts/withdrawal-queue-erc721) within the Lido on Ethereum protocol.
The service is helpful for stakers, providing insights from the moment of withdrawal request placement to its finalization when the request becomes claimable.

See the [detailed explanation](https://github.com/lidofinance/withdrawals-api/blob/develop/how-estimation-works.md).

### Use Cases

- Estimation before request: users can estimate the waiting time before placing a withdrawal request.
- Tracking the existing request: users can track the estimated waiting time for the already placed request.

### Calculates time to withdrawals requests:

```
https://wq-api.lido.fi/v2/request-time?ids=1&ids=2
```

Response schema and examples are available in the [Swagger API documentation](https://wq-api.lido.fi/api#/Request%20Time/RequestTimeController_requestsTime)

### Calculate time to withdrawal current queue:

```
https://wq-api.lido.fi/v2/request-time/calculate
```

### Calculates time to withdrawal amount of stETH:

```
https://wq-api.lido.fi/v2/request-time/calculate?amount=32
```

Response schema and examples are available in the [Swagger API documentation](https://wq-api.lido.fi/api#/Request%20Time/RequestTimeController_calculateTime)

### Hoodi

```
https://wq-api-hoodi.testnet.fi/v2/request-time?ids=1&ids=2
```

Response schema and examples are available in the [Swagger API documentation](https://wq-api-hoodi.testnet.fi/api#/Request%20Time/RequestTimeController_requestsTime)
