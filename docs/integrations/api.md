# API

Here you can find various Lido APIs which you can integrate in your app or website:

## Lido APR

API provides Ethereum and Lido staking APR, which include:

### **Simple Moving Average Lido APR for 7 last days:**

This APR value is based on Simple Moving Average of APR values over a period of 7 days.

```
https://eth-api.lido.fi/v1/protocol/steth/apr/sma
```

Response schema and examples are available in the [Swagger API documentation](https://eth-api.lido.fi/api/static/index.html#/APR%20for%20Eth%20and%20stEth/ProtocolController_findSmaAPRforSTETH)

#### Goerli

```
https://eth-api.testnet.fi/v1/protocol/steth/apr/sma
```

### **Last Lido APR for stETH**

The latest staking APR value. For Lido V1, we collected APR values by periodically fetching [oracle report events](../contracts/legacy-oracle#posttotalshares). For the V2 version, the value is calculated based on [rebase events](https://github.com/lidofinance/lido-dao/blob/e45c4d6/contracts/0.4.24/Lido.sol#L232).

V2 APR calculation:

```
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

Response schema and examples are available in the [Swagger API documentation](https://eth-api.lido.fi/api/static/index.html#/APR%20for%20Eth%20and%20stEth/ProtocolController_findLastAPRforSTETH)

#### Goerli

```
https://eth-api.testnet.fi/v1/protocol/steth/apr/last
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

`skip` and `limit` params are used for pagination eg:

```
skip: 0, limit: 100 = 1 page
skip: 100, limit: 100 = 2 page
skip: 200, limit: 100 = 3 page
```

### Goerli

Reward History Backend is also available on Goerli:

```
http://reward-history-backend.testnet.fi/?address=0x12345
```

Response schema and examples are available in the [Swagger API documentation](https://reward-history-backend.testnet.fi/api)
