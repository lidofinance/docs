# Lido Council Daemon

[Lido Council Daemon](https://github.com/lidofinance/lido-council-daemon) is the off-chain service run by every member of the Deposit Security Committee (DSC). It monitors validator public keys in the `DepositContract` and across all Lido staking modules, signs `(depositRoot, keysOpIndex)` messages with the guardian's EOA key to permit deposits, and — if a malicious pre-deposit is detected — broadcasts a `pause` message that any single guardian can use to halt deposits, providing one-honest-participant safety against supermajority collusion.

For the full description of the threat model, daemon configuration and on-chain interactions, see the [Deposit Security Committee manual](/guides/deposit-security-manual) and the [`DepositSecurityModule`](/contracts/deposit-security-module) contract reference.

The committee was originally formed as part of [LIP-5: Mitigations for deposit front-running vulnerability](https://research.lido.fi/t/mitigations-for-deposit-front-running-vulnerability/1239); funding for guardian infrastructure is tracked in the [Council Daemons Funding](https://research.lido.fi/t/council-daemons-funding/8526) thread.

## Mainnet members

| Operator           | Address                                                                                                                 | Announcement                                                            |
|--------------------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Blockscape         | [`0x7912Fa976BcDe9c2cf728e213e892AD7588E6AaF`](https://etherscan.io/address/0x7912Fa976BcDe9c2cf728e213e892AD7588E6AaF) | [post on x.com](https://x.com/BlockscapeLab/status/1452902878885068803) |
| Kiln               | [`0x6d22aE126eB2c37F67a1391B37FF4f2863e61389`](https://etherscan.io/address/0x6d22aE126eB2c37F67a1391B37FF4f2863e61389) | [post on x.com](https://x.com/SkillZBlock/status/1452918366960750595)   |
| Staking Facilities | [`0xf82D88217C249297C6037BA77CE34b3d8a90ab43`](https://etherscan.io/address/0xf82D88217C249297C6037BA77CE34b3d8a90ab43) | [post on x.com](https://x.com/StakingFac/status/1452656210927394818)    |
| Lido dev team      | [`0x5fd0dDbC3351d009eb3f88DE7Cd081a614C519F1`](https://etherscan.io/address/0x5fd0dDbC3351d009eb3f88DE7Cd081a614C519F1) | [post on x.com](https://x.com/LidoFinance/status/1452973085557149709)   |
| P2P                | [`0xa56b128Ea2Ea237052b0fA2a96a387C0E43157d8`](https://etherscan.io/address/0xa56b128Ea2Ea237052b0fA2a96a387C0E43157d8) | [post on x.com](https://x.com/P2Pvalidator/status/1452970276480819208)  |
| Stakefish          | [`0x4B87F16B8d32cb5a859a4C48a88edB5adBe3498E`](https://etherscan.io/address/0x4B87F16B8d32cb5a859a4C48a88edB5adBe3498E) | [post on x.com](https://x.com/stakefish/status/1452971049889374209)     |

**Signing quorum:**

- **Deposit intent** — 4 out of 6 guardian signatures are required to permit a deposit. The current value is enforced on-chain and is readable via [`getGuardianQuorum()`](/contracts/deposit-security-module#getguardianquorum) on the [`DepositSecurityModule`](/contracts/deposit-security-module).
- **Pause** — a single guardian signature is sufficient to pause deposits via [`pauseDeposits()`](/contracts/deposit-security-module#pausedeposits). This gives any one honest member the ability to halt further deposits even if the rest of the committee colludes.
