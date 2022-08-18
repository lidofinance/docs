sidebar_position: 1
title: Endpoints
---

Juicebox has a GraphQL API Endpoint hosted by [The Graph](https://thegraph.com/docs/about/introduction#what-the-graph-is) called a subgraph for indexing and organizing data from the Juicebox smart contracts. The code repository for our subgraph can be found [here](https://github.com/jbx-protocol/juice-subgraph).

| Chain     | Explorer page                                                                                  | API endpoint                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Ethereum  | [Page](https://thegraph.com/explorer/subgraph?id=A5XzhYZ4muyRegVTYmwWbCbKWvD4LTWqac43CEGTEGdK) | [Endpoint](https://gateway.thegraph.com/api/[api-key]/subgraphs/id/A5XzhYZ4muyRegVTYmwWbCbKWvD4LTWqac43CEGTEGdK)\* |
| Optimism  | [Page](https://thegraph.com/hosted-service/subgraph/sablierhq/sablier-optimism)                | [Endpoint](https://api.thegraph.com/subgraphs/name/sablierhq/sablier-optimism)                                     |
| Arbitrum  | [Page](https://thegraph.com/hosted-service/subgraph/sablierhq/sablier-arbitrum)                | [Endpoint](https://api.thegraph.com/subgraphs/name/sablierhq/sablier-arbitrum)                                     |
| Polygon   | [Page](https://thegraph.com/hosted-service/subgraph/sablierhq/sablier-matic)                   | [Endpoint](https://api.thegraph.com/subgraphs/name/sablierhq/sablier-matic)                                        |
| Avalanche | [Page](https://thegraph.com/hosted-service/subgraph/sablierhq/sablier-avalanche)               | [Endpoint](https://api.thegraph.com/subgraphs/name/sablierhq/sablier-avalanche)                                    |
| BSC       | [Page](https://thegraph.com/hosted-service/subgraph/sablierhq/sablier-bsc)                     | [Endpoint](https://api.thegraph.com/subgraphs/name/sablierhq/sablier-bsc)                                          |

\* An [API key](https://thegraph.com/docs/en/querying/managing-api-keys/) needed is needed to query our Ethereum subgraph, as it's based on [The Graph](https://thegraph.com)'s decentralized network. Replace `[api-key]` with your API key in the API endpoint. [Here](https://thegraph.com/docs/en/studio/managing-api-keys/) is a good guide on how to manage your API keys and set indexer preferences.
