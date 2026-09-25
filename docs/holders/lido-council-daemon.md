# Lido Council Daemon

[Lido Council Daemon](https://github.com/lidofinance/lido-council-daemon) is the off-chain service run by every member of the Deposit Security Committee (DSC). It monitors validator public keys in the `DepositContract` and across all Lido staking modules, signs `(depositRoot, keysOpIndex)` messages with the guardian's EOA key to permit deposits, and — if a malicious pre-deposit is detected — broadcasts a `pause` message that any single guardian can use to halt deposits, providing one-honest-participant safety against supermajority collusion.

For the full description of the threat model, daemon configuration and on-chain interactions, see the [Deposit Security Committee manual](/guides/deposit-security-manual) and the [`DepositSecurityModule`](/contracts/deposit-security-module) contract reference.

The committee was originally formed as part of [LIP-5: Mitigations for deposit front-running vulnerability](https://research.lido.fi/t/mitigations-for-deposit-front-running-vulnerability/1239); funding for guardian infrastructure is tracked in the [Council Daemons Funding](https://research.lido.fi/t/council-daemons-funding/8526) thread.

## Mainnet members

Current members use EDF DelegationContracts (LIP-37). Stakely replaced Kiln in the committee, see the [Kiln exit request](https://research.lido.fi/t/kiln-requesting-to-exit-the-lido-deposit-security-committee/11813):

| Operator           | Address                                                                                                                 | Announcement                                                                                            |
|--------------------|-------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Blockscape         | [`0xDc1579636686C082fc3b00B9EB25259A110D0C44`](https://etherscan.io/address/0xDc1579636686C082fc3b00B9EB25259A110D0C44) | [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/11) |
| Stakely            | [`0x6A22d74a816662078f2371A7138E7614874cd61d`](https://etherscan.io/address/0x6A22d74a816662078f2371A7138E7614874cd61d) | [replacing Kiln](https://research.lido.fi/t/kiln-requesting-to-exit-the-lido-deposit-security-committee/11813/3), [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/12) |
| Staking Facilities | [`0x35506190Ca6df385aA6Bc4a970646dd4f49426c1`](https://etherscan.io/address/0x35506190Ca6df385aA6Bc4a970646dd4f49426c1) | [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/13) |
| Lido dev team      | [`0x915F0Fa50E1af761B113b41c79ab33Bf4734C36E`](https://etherscan.io/address/0x915F0Fa50E1af761B113b41c79ab33Bf4734C36E) | [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/21) |
| P2P                | [`0xe387Ba1d5C9f6306eCe9ac949C7fB6233dD5411E`](https://etherscan.io/address/0xe387Ba1d5C9f6306eCe9ac949C7fB6233dD5411E) | [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/16) |
| Stakefish          | [`0x031E597BcF680f1f2293b119b4b2B14096B15497`](https://etherscan.io/address/0x031E597BcF680f1f2293b119b4b2B14096B15497) | [EDF DelegationContract](https://research.lido.fi/t/lip-37-execution-delegation-framework-edf/11746/15) |

**Signing quorum:**

- **Deposit intent** — 4 out of 6 guardian signatures are required to permit a deposit. The current value is enforced on-chain and is readable via [`getGuardianQuorum()`](/contracts/deposit-security-module#getguardianquorum) on the [`DepositSecurityModule`](/contracts/deposit-security-module).
- **Pause** — a single guardian signature is sufficient to pause deposits via [`pauseDeposits()`](/contracts/deposit-security-module#pausedeposits). This gives any one honest member the ability to halt further deposits even if the rest of the committee colludes.
