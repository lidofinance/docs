# AccountingOracle

- [Source code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/oracle/AccountingOracle.sol)
- [Deployed contract](https://etherscan.io/address/0x852deD011285fe67063a08005c71a85690503Cee)

LegacyOracle is a contract where oracles send addresses' balances controlled by the DAO on the Consensus Layer side.
The balances can go up because of reward accumulation and can go down due to slashing and staking penalties.
Oracles are assigned by the DAO.

Oracle daemons push their reports every frame (225 epochs currently, equal to one day) and when the
number of the same reports reaches the ['quorum'](#getquorum) value, the report is pushed to the
[Lido contract][1].

:::note
However, daily oracle reports shouldn't be taken for granted.
Oracle daemons could stop pushing their reports for extended periods of time in case of no
[finality](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/#finality) on Consensus Layer.
This would ultimately result in no oracle reports and no stETH rebases for this whole period.
:::

[1]: /contracts/lido
