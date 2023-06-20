# ValidatorsExitBusOracle

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)

A contract implementing a message bus between the on-chain protocol and off-chain observers
delivering validator exit requests to the Lido-participating node operators.

The requests should be processed timely according to the ratified [Lido on Ethereum Validator Exits Policy V1.0](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330).
