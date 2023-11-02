# Lido on X

## 3.1 Lido on Polygon

Address: [`0xd65Fa54F8DF43064dfd8dDF223A446fc638800A9`](https://app.safe.global/settings/setup?safe=0xd65Fa54F8DF43064dfd8dDF223A446fc638800A9)

**Purpose of the multisig:** The multisig instance is used for signing off on upgrades and the introduction of parameter changes to the Lido on Polygon instance.

**Quorum:** 3/5

**Forum topic:** [Lido on Polygon V2 upgrade](https://research.lido.fi/t/lido-on-polygon-protocol-upgrade/3213/)
**Snapshot:** [Lido on Polygon V2 upgrade](https://snapshot.org/#/lido-snapshot.eth/proposal/0x32f6f095dc4f7b97665b560781d6e6795da11f9c8218936a505575040038d70f)

**Contracts and Roles:**

stMatic token:[`0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599`](https://etherscan.io/address/0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599)
- DAO_ROLE, 
- PAUSE_ROLE, 
- UNPAUSE_ROLE 

Lido on Polygon NO Registry [`0x216B8b78e0632138dc38907dd089aAB601ED6EDC`](https://etherscan.io/address/0x216B8b78e0632138dc38907dd089aAB601ED6EDC)
- DAO_ROLE, 
- PAUSE_ROLE, 
- UNPAUSE_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
|: --- |: --- |: --- |: --- |
| Jakov | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| vsh | 0x6E83d6f57012D74e0F131753f8B5Ab557824507D |  |  |
| kadmil | 0x9A3f38AF97b791C85c043D46a64f56f87E0283D4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1655865828544266242 |
| Hamzah | 0xF20825cab04cc430Fe941eaa9C2Ae6b9DA9bc3B5 |  |  |
| Aishwary | 0xc156C57231a9302D9f5C7b5eF22871cC25F40736 |  |  |

## 3.1 Lido on Solana

**Blockchain:** Ethereum

**Address:** 
[Serum Multisig Program](https://github.com/coral-xyz/multisig):
`"multisig_program_id": "AAHT26ecV3FEeFmL2gDZW6FfEqjPkghHbAkNZGqwT8Ww",`
`"multisig_address": "3cXyJbjoAUNLpQsFrFJTTTp8GD3uPeabYbsCVobkQpD1"`

[Lido on Solana docs](https://docs.solana.lido.fi/administration)

**Purpose of the multisig:** The multisig instance is used for signing off on upgrades and the introduction of parameter changes to Solido instance.

**Quorum:** 4/7

**List of signers:**


| Name | Address |
| --- | --- |
| P2P | Cv6GM219kzMrdUUdgDGVJUPW6fGosvrhsFrvmEhz3Mc6 |
| Staking Facilities | ENH1xvwjinUWkwEgw1hKduyAg7CrJMiKvr9nAS7wLHrp |
| Figment | 6CawqfAJDviZGfUpHFJgeauq6H9vhKuivMMZULZeGnPw |
| ChainLayer | AnoVUukL1fMAwEp4y2rrZV45BNHLes8ZwWsCRgEwhGH4 |
| Chorus One | 6S21QCmpAadEhHj3pY2RMbPMGwgYNvS4Pd7zUXoRDMdK |
| Mercurial | DHLXnJdACTY83yKwnUkeoDjqi4QBbsYGa1v8tJL76ViX |
| Solana Foundation | 8Lep9addZWUWqBNj3igx4QoHe43GBfvLhGJy18jJgWQa |

- Lido on Solana team reached out to all participants, and verified their identities on Telegram and GitHub.
- Participants shared their public keys on GitHub.
- Lido on Solana team deployed the Serum Multisig program and created an instance that has the 7 public keys as owners. The upgrade authority of the multisig program was set to the multisig instance itself.
- Participants verified that they could [reproduce](https://blog.lido.fi/lido-dao-treasury-fund/) the program and that the list of public keys matched the keys shared earlier on GitHub.