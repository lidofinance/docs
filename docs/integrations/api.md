# API

Here you can find various Lido APIs which you can integrate in your app or website:

## Lido APR

API provides Ethereum and Lido staking APR, which include:

### Last Lido APR for stETH

The latest staking APR value that is retrieved from our database. For Lido V1, we collected APR values by periodically fetching [oracle report events](https://docs.lido.fi/contracts/lido-oracle#receiver-function-to-be-invoked-on-report-pushes). For the V2 version, the value is calculated based on [rebase events](https://github.com/lidofinance/lido-dao/blob/e9509d77f010fec76899e25ccde785c8de47bd42/contracts/0.4.24/Lido.sol#L232).


V1 APR calculation: 

```
protocolAPR = (postTotalPooledEther - preTotalPooledEther) * secondsInYear / (preTotalPooledEther * timeElapsed)
lidoFeeAsFraction = lidoFee / basisPoint
userAPR = protocolAPR * (1 - lidoFeeAsFraction)
```

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

https://eth-api.lido.fi/v1/protocol/steth/apr/last

Response body:

```json
{
  "data": {
    // Block timestamp in seconds
    "timeUnix": 1682425475,
    // APR value
    "apr": 4.77
  },
  // token details
  "meta": {
    "symbol": "stETH",
    "address": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    "chainId": 1
  }
}
```

### **Simple Moving Average Lido APR for 7 last days:**

This APR value is based on Simple Moving Average of APR values from our database over a period of 7 days.

https://eth-api.lido.fi/v1/protocol/steth/apr/sma 
	
Response body:

```json
{
  "data": {
    // Array of APRs over a period of 7 days
    "aprs": [ 
      {
        "timeUnix": 1681820735,
        "apr": 4.86
      },
      ...
    ],
    "smaApr": 5.0962499999999995 // Simple Moving Average APR
  },
  "meta": {
    "symbol": "stETH", // Token symbol
    "address": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // Token address
    "chainId": 1 // Chain id: 1 - mainnet
  }
}
```

### **Last Lido APR for ETH**

We collect APR values for Ethereum blocks at regular intervals. This endpoint provides the latest ethereum staking APR that is retrieved from our database.

https://eth-api.lido.fi/v1/protocol/eth/apr/last
	
Response body:

```json
{
  "data": {
    // Block timestamp in seconds
    "timeUnix": 1682500931,
    // APR value
    "apr": 3.5
  },
  "meta": {
    "symbol": "ETH",
    "address": "0x000000000000000000000000000000000000",
    "chainId": 1
  }
}
```

## Curve APR

API also provide endpoints for curve ETH/STETH pool APR, which include:

**Last APR for STETH/ETH Curve pool based on data collected in our database:**

https://eth-api.lido.fi/v1/pool/curve/steth-eth/apr/last

Response body:

```json
{
  "data": {
    "timeUnix": 1682502335,
    "totalApr": 3.36918934128414,
    "totalApy": 3.369240594695853,
    // List of incentives to calculate total APR
    "incentives": [
      // crv token reward
      {
        "id": 1,
        "type": "rewards",
        "active": true,
        "apr": 0.0012885397
      },
      // ldo token reward
      {
        "id": 2,
        "type": "rewards",
        "active": true,
        "apr": 0.8050288541999999
      },
      // trading fee
      {
        "id": 3,
        "type": "fees",
        "active": true,
        "apr": 0.10136759570414
      },
      // ethereum staking rewards
      {
        "id": 4,
        "type": "steth",
        "active": true,
        "apr": 2.46150435168
      }
    ],
    "totalValueLockedInUsd": 1390636570,
    "dayTradingVolumeInUsd": 19309351,
    "dayTradingVolumeInEth": 10235
  },
  "meta": {
    // token descriptions
    "pool": {
      "address": "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
      "lpToken": {
        "symbol": "steCRV",
        "address": "0x06325440D014e39736583c165C2963BA99fAf14E"
      },
      "tokens": [
        {
          "symbol": "ETH",
          "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        },
        {
          "symbol": "stETH",
          "address": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
        }
      ]
    },
    "incentives": {
      "1": {
        "token": {
          "symbol": "CRV",
          "address": "0xD533a949740bb3306d119CC777fa900bA034cd52"
        }
      },
      "2": {
        "token": {
          "symbol": "LDO",
          "address": "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
        }
      }
    }
  }
}
```

**Simple Moving Average APR/APY for 7 last days:**

https://eth-api.lido.fi/v1/pool/curve/steth-eth/apr/sma
	
Response body:

```json
{
  "data": {
    "timeUnix": 1682502335,
    "apr": 3.501685499868247,
    "apy": 3.5017689216288614
  },
  "meta": {
    "pool": {
      "address": "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
      "lpToken": {
        "symbol": "steCRV",
        "address": "0x06325440D014e39736583c165C2963BA99fAf14E"
      },
      "tokens": [
        {
          "symbol": "ETH",
          "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        },
        {
          "symbol": "stETH",
          "address": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
        }
      ]
    },
    "incentives": {
      "1": {
        "token": {
          "symbol": "CRV",
          "address": "0xD533a949740bb3306d119CC777fa900bA034cd52"
        }
      },
      "2": {
        "token": {
          "symbol": "LDO",
          "address": "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
        }
      }
    }
  }
}
```

### Balancer APR

Endpoints for balancer WETH/wstETH pool APR, which include:

**Last APR based on data collected in our database:**

https://eth-api.lido.fi/v1/pool/balancer/wsteth-weth/apr/last

Response body:

```json
{
  "data": {
    "timeUnix": 1682502515,
    "totalApr": 2.7280001511007983,
    "totalApy": 2.728037969870859,
    // incentives included in total APR
    "incentives": [
      {
        "id": 1,
        "type": "rewards",
        "active": true,
        "apr": 1.396448198248068
      },
      {
        "id": 2,
        "type": "rewards",
        "active": true,
        "apr": 0
      },
      {
        "id": 3,
        "type": "fees",
        "active": true,
        "apr": 0.08707665948221001
      },
      {
        "id": 4,
        "type": "steth",
        "active": true,
        "apr": 1.2444752933705203
      }
    ],
    "totalValueLockedInUsd": 196087544,
    "dayTradingVolumeInUsd": 2336754,
    "dayTradingVolumeInEth": 1239
  },
  "meta": {
    // pool token descriptions
    "pool": {
      "address": "0x32296969Ef14EB0c6d29669C550D4a0449130230",
      "lpToken": {
        "symbol": "B-stETH-STABLE",
        "address": "0x32296969Ef14EB0c6d29669C550D4a0449130230"
      },
      "tokens": [
        {
          "symbol": "WETH",
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        },
        {
          "symbol": "wstETH",
          "address": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
        }
      ]
    },
    // incentives token descriptions
    "incentives": {
      "1": {
        "token": {
          "symbol": "BAL",
          "address": "0xba100000625a3754423978a60c9317c58a424e3D"
        }
      },
      "2": {
        "token": {
          "symbol": "LDO",
          "address": "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
        }
      }
    }
  }
}
```

**Simple Moving Average APR/APY for 7 last days:**

https://eth-api.lido.fi/v1/pool/balancer/wsteth-weth/apr/sma

Response body:

```json
{
  "data": {
    "timeUnix": 1682502515,
    "apr": 2.6080224025399583,
    "apy": 2.608090821628247
  },
  "meta": {
    "pool": {
      "address": "0x32296969Ef14EB0c6d29669C550D4a0449130230",
      "lpToken": {
        "symbol": "B-stETH-STABLE",
        "address": "0x32296969Ef14EB0c6d29669C550D4a0449130230"
      },
      "tokens": [
        {
          "symbol": "WETH",
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        },
        {
          "symbol": "wstETH",
          "address": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
        }
      ]
    },
    "incentives": {
      "1": {
        "token": {
          "symbol": "BAL",
          "address": "0xba100000625a3754423978a60c9317c58a424e3D"
        }
      },
      "2": {
        "token": {
          "symbol": "LDO",
          "address": "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
        }
      }
    }
  }
}
```

## Lido Reward History

Reward History Backend provides an API which returns all stETH interactions by an address and calculates its daily stETH rewards.

Currently, there's just one endpoint (`/`):

```
https://reward-history-backend.lido.fi/?address=0x12345
```

### Parameters

The only required query parameter is `address`.

Optional Parameters:

- `currency`: USD/EUR/GBP - Fiat currency in which to display rewards in addition to stETH. **USD** by default.
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

### Responses

Response body:

```json
{
  "events": [],
  "totals": {
    "ethRewards": "12345",
    "currencyRewards": "1.2345"
  },
  "averageApr": "4.9123",
  "ethToStEthRatio": 1.0041070589388954,
  "stETHCurrencyPrice": {
    "eth": 0.99590974,
    "usd": 1876.31
  },
  "totalItems": 500
}
```

Event types:

- Staking
- Transfer
- Reward

Staking event example:

```json
{
  "sender": "0x123",
  "amount": "12345",
  "shares": "12345",
  "sharesBefore": "0",
  "sharesAfter": "12345",
  "totalPooledEtherBefore": "12345",
  "totalPooledEtherAfter": "12345",
  "totalSharesBefore": "12345",
  "totalSharesAfter": "12345",
  "balanceAfter": "12345",
  "block": "12345",
  "blockTime": "12345",
  "transactionHash": "0x12345",
  "transactionIndex": "1",
  "logIndex": "1",
  "transactionLogIndex": "1",
  "type": "staking",
  "balance": "12345",
  "change": "12345",
  "currencyChange": "20.12345",
  "epochDays": "12345.12345",
  "epochFullDays": "12345"
}
```

Transfer event example:

```json
{
  "from": "0x12345",
  "to": "0x12345",
  "value": "12345",
  "shares": "12345",
  "sharesBeforeDecrease": "12345",
  "sharesAfterDecrease": "12345",
  "sharesBeforeIncrease": "12345",
  "sharesAfterIncrease": "12345",
  "totalPooledEther": "12345",
  "totalShares": "12345",
  "balanceAfterDecrease": "1",
  "balanceAfterIncrease": "1",
  "mintWithoutSubmission": false,
  "block": "12345",
  "blockTime": "12345",
  "transactionHash": "0x12345",
  "transactionIndex": "1",
  "logIndex": "1",
  "transactionLogIndex": "1",
  "type": "transfer",
  "direction": "in",
  "balance": "12345",
  "change": "12345",
  "currencyChange": "0.0000000000000012345",
  "epochDays": "12345.12345",
  "epochFullDays": "12345"
}
```

Reward event example:

```json
{
  "id": "0x12345",
  "totalPooledEtherBefore": "12345",
  "totalPooledEtherAfter": "12345",
  "totalSharesBefore": "12345",
  "totalSharesAfter": "12345",
  "block": "12345",
  "blockTime": "12345",
  "logIndex": "1",
  "type": "reward",
  "reportShares": "12345",
  "balance": "12345",
  "rewards": "12345",
  "change": "12345",
  "currencyChange": "0.12345",
  "epochDays": "12345.12345",
  "epochFullDays": "12345",
  "apr": "4.12345"
}
```

### Status Codes

- 200 - Success.
- 400 - Invalid request parameters eg invalid address provided.
- 500 - Internal error, for example Subgraph limits were hit while loading data.
- 503 - Service temporarily unavailable - Subgraph ran into a fatal error.

### Playground

You can test requests to the API on its playground:

https://reward-history-backend.lido.fi/api

### Goerli

Reward History Backend is also available on Goerli, however it's currently unable to handle requests until a limits issue is fixed.

```
http://reward-history-backend.testnet.fi/?address=0x12345
```