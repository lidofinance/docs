# Subgraph

## Introduction

Lido has a Subgraph deployed on [The Graph Decentralized Network](https://thegraph.com/docs/about/introduction#what-the-graph-is) which indexes and organises data from the Lido smart contracts events, exposing a GraphQL endpoint for queries. Subgraph data is indexed and served by independent Indexers on the network.

## GraphQL Schema

The schema of GraphQL entities available is defined in [`/schema.graphql` ](https://github.com/lidofinance/lido-subgraph/blob/master/schema.graphql).

## Links

- [Explorer Page](https://thegraph.com/explorer/subgraph?id=HXfMc1jPHfFQoccWd7VMv66km75FoxVHDMvsJj5vG5vf&view=Overview)
- GraphQL Endpoint: `https://gateway.thegraph.com/api/[api-key]/subgraphs/id/HXfMc1jPHfFQoccWd7VMv66km75FoxVHDMvsJj5vG5vf`
- [Code Repo](https://github.com/lidofinance/lido-subgraph/)

## Query Examples

Below are some sample queries you can use to gather information from the Lido contracts.

You can build your own queries using [GraphQL Explorer](https://graphiql-online.com) to test it out and query exactly what you need.

### Rewards Distribution

Daily staking rewards data with calculated APR and fees distribution.

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

### Oracle Reports

Daily completed oracle reports.

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

### Transfers

stETH transfers between addresses.

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

### Submissions

stETH staking events.

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

### Node Operator Keys

Fetch validator keys of a node operator.

```graphql
{
  nodeOperatorSigningKeys(where: { operatorId: 0 }) {
    pubkey
  }
}
```

## Helpful Links

[Creating an API Key Video Tutorial](https://www.youtube.com/watch?v=UrfIpm-Vlgs)

[Managing your API Key & Setting your indexer preferences](https://thegraph.com/docs/en/studio/managing-api-keys/)

[Querying from an Application](https://thegraph.com/docs/en/developer/querying-from-your-app/)
