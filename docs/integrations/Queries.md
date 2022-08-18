---
sidebar_position: 3
title: Sample Queries
---

## Sample Queries

Below are some sample queries you can use to gather information from the Connext contracts.

You can build your own queries using a [GraphQL Explorer](https://graphiql-online.com/graphiql) and enter your endpoint to limit the data to exactly what you need.

### Get Asset Balances for Router

Query Description: Gather the asset balances for a router.

```graphql
query getAssetBalancesQuery(
  $router: String = "0xa9bfe31527e8e0845cf345549f68828e6775f8c0"
) {
  assetBalances(where: { router: $router }) {
    amount
    id
    assetId
  }
}
```

### Get Account's Most Recent Prepared Transaction

Query Description: Gather the most recent prepared transaction for an address

```graphql
query AccountLatest(
  $address: String! = "0x000000000008e4db6a6194c6957df47e30970dc2"
) {
  user(id: $address) {
    transactions(first: 1, orderBy: preparedTimestamp, orderDirection: desc) {
      amount
      bidSignature
      callData
      callDataHash
      callTo
      cancelCaller
      cancelMeta
      cancelTimestamp
      cancelTransactionHash
      chainId
      encodedBid
      encryptedCallData
      expiry
      externalCallIsContract
      externalCallReturnData
      externalCallSuccess
      fulfillCaller
      fulfillMeta
      fulfillTimestamp
      fulfillTransactionHash
      id
      initiator
      prepareCaller
      prepareMeta
      prepareTransactionHash
      preparedBlockNumber
      preparedTimestamp
      receivingAddress
      receivingAssetId
      receivingChainId
      receivingChainTxManagerAddress
      relayerFee
      sendingAssetId
      sendingChainFallback
      sendingChainId
      signature
      status
      transactionId
    }
    id
  }
}
```
