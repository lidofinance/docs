# Flow Examples

## With Lido Tooling (KAPI + Ejector)

[![](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)

Using the recommended tooling, the flow looks like this:

1. Get a list of validators for which to generate and sign exit messages - KAPI
2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Encrypt the message files using the Ejector encryptor script
4. Add files to the Ejector
5. Wait until valid Ejector messages are running out
6. Repeat

## Ejector Only

[![](https://hackmd.io/_uploads/H1_Z4Creh.jpg)](https://hackmd.io/_uploads/H1_Z4Creh.jpg)

1. Get a list of validators for which to generate and sign exit messages:

- By the order keys are stored in (eg choose oldest)
- Query [NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol) contract to get all your keys, sort by index, start with the lowest indexes. Each batch, either track the last pre-signed index or query validator status on the Consensus Node to ignore exiting and already exited validators.

2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Encrypt the message files using the Ejector encryptor script
4. Add files to the Ejector
5. Wait until valid Ejector messages are running out
6. Repeat

## Without Lido Tooling

[![](https://hackmd.io/_uploads/rJZ5TBme3.jpg)](https://hackmd.io/_uploads/rJZ5TBme3.jpg)

1. Monitor `ValidatorExitRequest` events of the [`ValidatorsExitBusOracle`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol)
2. Generate and sign exit messages:

- keystores - ethdo
- dirk - ethdo
- web3signer or a proprietary signer - custom script/tooling

3. Submit the messages:

- ethdo can do it straight away in the previous step by leaving out `--json` argument
- Submit it manually to the Consensus Node: [API Docs](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolVoluntaryExit)
