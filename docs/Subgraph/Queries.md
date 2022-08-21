---
sidebar_position: 3
title: Sample Queries
---

## Sample Queries

Below are some sample queries you can use to gather information from the Lido contracts.

You can build your own queries using a [GraphQL Explorer](https://graphiql-online.com/graphiql) and enter your endpoint to limit the data to exactly what you need.

## Rewards Distribution

Query Description: Gather the total rewards.

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

Query Description: Gather the transfer information

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

## Rewards Distribution

Query Description: Gather the total rewards information

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
