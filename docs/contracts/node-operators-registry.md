# NodeOperatorsRegistry

Node Operators act as validators on the Beacon chain for the benefit of the protocol. The DAO selects node operators and adds their addresses to the NodeOperatorsRegistry contract. Authorized operators have to generate a set of keys for the validation and also provide them with the smart contract. As Ether is received from users, it is distributed in chunks of 32 Ether between all active Node Operators. The contract contains a list of operators, their keys, and the logic for distributing rewards between them. The DAO can deactivate misbehaving operators.

The source code can be found on [Github here](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol).