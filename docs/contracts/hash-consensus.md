# HashConsensus

- [Source code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/oracle/HashConsensus.sol)
- [Deployed instance for AccountingOracle](https://etherscan.io/address/0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288)
- [Deployed instance for ValidatorsExitBusOracle](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a)

HashConsensus is a contract that gets consensus reports (i.e. hashes) pushed to and processes them asynchronously.

HashConsensus doesn't expect any specific behavior from a report processor, and guarantees the following:

1. HashConsensus won't submit reports via `IReportAsyncProcessor.submitConsensusReport` or ask to discard
reports via `IReportAsyncProcessor.discardConsensusReport` for any slot up to (and including)
the slot returned from `IReportAsyncProcessor.getLastProcessingRefSlot`.

2. HashConsensus won't accept member reports (and thus won't include such reports in calculating the consensus)
that have `consensusVersion` argument of the `HashConsensus.submitReport` call holding a diff.
value than the one returned from `IReportAsyncProcessor.getConsensusVersion()`
at the moment of the `HashConsensus.submitReport` call.
