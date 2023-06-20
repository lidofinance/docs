# OracleReportSanityChecker

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol)
- [Deployed contract](https://etherscan.io/address/0x9305c1Dbfe22c12c66339184C0025d7006f0f1cC)

OracleReportSanityChecker contains view methods to perform sanity checks of the Lido's oracle report and lever methods for granular
tuning of the params of the checks. The contract limits the impact of incorrectly reported oracle data:
if the report violates the restrictions enforced by the sanity checks, then the report tx reverts.
