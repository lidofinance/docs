---
sidebar_position: 1
title: Subgraph Data Introduction
---

# Lido Subgraph Introduction

Lido has a GraphQL API Endpoint hosted by [The Graph](https://thegraph.com/docs/about/introduction#what-the-graph-is) called a subgraph for indexing and organizing data from the Lido smart contracts.

This subgraph is can be used to query Lido data.

## GraphQL Schema

The schema of GraphQL elements available is defined in [`/schema.graphql` ](https://github.com/lidofinance/lido-subgraph/blob/master/schema.graphql)

Subgraph information is serviced by a decentralized group of server operators called Indexers.

## Ethereum Mainnet

[Creating an API Key Video Tutorial](https://www.youtube.com/watch?v=UrfIpm-Vlgs)

- [Explorer Page](https://thegraph.com/hosted-service/subgraph/lidofinance/lido)
- Graphql Endpoint: https://gateway.thegraph.com/api/[api-key]/subgraphs/id/HXfMc1jPHfFQoccWd7VMv66km75FoxVHDMvsJj5vG5vf
- [Code Repo](https://github.com/lidofinance/lido-subgraph/)

## Helpful Links

[Querying from an Application](https://thegraph.com/docs/en/developer/querying-from-your-app/)

[Managing your API Key & Setting your indexer preferences](https://thegraph.com/docs/en/studio/managing-api-keys/)

<br />
<br />

# Query Examples

Below are some sample queries you can use to gather information from the Lido contracts.

You can build your own queries using a [GraphQL Explorer](https://graphiql-online.com/graphiql) and enter your endpoint to limit the data to exactly what you need.

## Rewards Distribution

Query description: gather the total rewards.

```graphql
{
  totalRewards(first: 100, orderBy: block, orderDirection: desc) {
    id
    totalRewards
    totalRewardsWithFees
    insuranceFee
    treasuryFee
    totalFee
    dust
    nodeOperatorFees {
      address
      fee
    }
    nodeOperatorsShares {
      address
      shares
    }
    shares2mint
    sharesToInsuranceFund
    sharesToOperators
    sharesToTreasury
    totalPooledEtherBefore
    totalPooledEtherAfter
    totalSharesBefore
    totalSharesAfter
    apr
    aprBeforeFees
    aprRaw
    preTotalPooledEther
    postTotalPooledEther
    timeElapsed
    block
    blockTime
    transactionIndex
  }
}
```

## Transfers

Query description: gather the transfer information

```graphql
{
  lidoTransfers(first: 50) {
    from
    to
    value
    block
    blockTime
    transactionHash
  }
}
```

## Oracle Reports

Query description: obtain oracle reports

```graphql
{
  oracleCompleteds(first: 500, orderBy: blockTime, orderDirection: desc) {
    epochId
    beaconBalance
    beaconValidators
    block
    blockTime
  }
}
```

## Submissions

Query description: obtain submission of the first 50

```graphql
{
  lidoSubmissions(first: 50) {
    sender
    amount
    block
    blockTime
    transactionHash
  }
}
```

## Obtain keys of node operator

Query description: obtain keys of node operator

```graphql
{
  nodeOperatorSigningKeys(where: { operatorId: 0 }) {
    pubkey
  }
}
```
