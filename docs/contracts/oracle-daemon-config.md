# OracleDaemonConfig

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/OracleDaemonConfig.sol)
- [Deployed contract](https://etherscan.io/address/0xbf05A929c3D7885a6aeAd833a992dA6E5ac23b09)

OracleDaemonConfig acts as a parameters registry for the Lido oracle daemon.
The full list of params are provided in the Lido V2 mainnet parameters [guide](/guides/verify-lido-v2-upgrade-manual#oracledaemonconfig).

:::note
In contrast to [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker), the stored values aren't enforced by the protocol on-chain code.
:::
