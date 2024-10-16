# Emergency Brakes

## 1.1 GateSeal Committee

**Address:** [`0x8772E3a2D86B9347A2688f9bc1808A6d8917760C`](https://app.safe.global/transactions/queue?safe=eth:0x8772E3a2D86B9347A2688f9bc1808A6d8917760C)

**Purpose of the multisig:** The GateSeal Committee can trigger GateSeal to pause WithdrawalQueueERC721 (pausing users' withdrawal requests), ValidatorExitBusOracle (pausing NOs withdrawal requests) or both smart contracts for 6 days. The right to pause is one-use only and automatically expires on 1 April 2025.

**Quorum:** 3/6

**Forum topic:** [Lido V2 GateSeal Committee](https://research.lido.fi/t/lido-v2-gateseal-committee/4561)

**Snapshot:** [Voting for approval of new withdrawals mechanism and new modular architecture for Node Operators set](https://snapshot.org/#/lido-snapshot.eth/proposal/0x629b547c688dea536a4a5c5b42274894ac068df0b0278d173b4d7a68c8c4281d), [Voting for renewal GateSeal for the Withdrawal Queue and Validator Exit Bus Oracle](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa8ae592b09200c70629f3c5f4363d06dae9d8afb00c8910272319fc7fdb4e10a)

**Aragon:** [Vote #156](https://vote.lido.fi/vote/156), [Vote #174](https://vote.lido.fi/vote/174)

**Contracts and Roles:**

GateSeal [`0x1ad5cb2955940f998081c1ef5f5f00875431aa90`](https://etherscan.io/address/0x1ad5cb2955940f998081c1ef5f5f00875431aa90)

- Sealing Committee

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| ajbeal | 0x5a409567bCa7459b3aC7e6E5a3F1a3C278071b71 | Sig Hash: 0x848f5174e88b653e9353f5a46c8dec871b2395a06be8b0b29c221c1ab4f43a8b5fc913c091d0389382879c49ff96750a86efd5806f7223797c31ca01868ec23c01 | https://twitter.com/ajbeal/status/1655876306771365888?s=20 |
| eboadom | 0xA39a62304d8d43B35114ad7bd1258B0E50e139b3 | https://etherscan.io/verifySig/17877 | https://twitter.com/eboadom/status/1656002911854292993 |
| michwill | 0xFe45baf0F18c207152A807c1b05926583CFE2e4b | Sig Hash: 0x44fc2bce69486ea826e1aaeb40878f9a8b038d5f0c8bd0ea9038fee7fca553005adfcd9d64172cacd2e7f1c11dc7e9b36c0f18916ed731e56ffa89feb95c8ae500 | https://twitter.com/newmichwill/status/1656597340780625920?s=20 |
| thedzhon  | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/40382 | https://twitter.com/e330acid/status/1778451429172080726 |
| George | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/17866 | https://twitter.com/george_avs/status/1655919930749976578 |
| kadmil | 0x9A3f38AF97b791C85c043D46a64f56f87E0283D4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1655865828544266242 |

## 1.2 Emergency Brakes: Ethereum

**Address:** [`0x73b047fe6337183A454c5217241D780a932777bD`](https://app.safe.global/transactions/queue?safe=eth:0x73b047fe6337183A454c5217241D780a932777bD)

**Purpose of the multisig:** The multisig is used to disable deposits & withdrawals for wstETH bridging to other chains (Arbitrum, Optimism, Base, Scroll, Mantle, ZKSync, Binance Smart Chain, Mode) in case of an emergency on Ethereum mainnet or the counterpart chain, and can pause Easy Track pipeline.

**Quorum:** 3/5

**Forum topics:** [Emergency Brakes MS for Easy Tracks](https://research.lido.fi/t/lip-3-easy-track-release/1406), [Emergency Brakes MS for L2 (Upgrade)](https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608)

**Snapshots: [](https://snapshot.org/#/lido-snapshot.eth/proposal/0x2b368b535b2024394daff218d222e260dbc4543b6d4e49aa4700cc0a9233e86a)**[Release Easy Track](https://snapshot.org/#/lido-snapshot.eth/proposal/0x6f3b01ce0573545987665eaafe9b3410402d7d0be03ad7bf8ccc926307ae578b), [Emergency Brakes multisig upgrade](https://snapshot.org/#/lido-snapshot.eth/proposal/0x2b368b535b2024394daff218d222e260dbc4543b6d4e49aa4700cc0a9233e86a)

**Contracts and Roles**:

###### Easy Track [`0xF0211b7660680B49De1A7E9f25C65660F0a13Fea`](https://etherscan.io/address/0xF0211b7660680B49De1A7E9f25C65660F0a13Fea)
* PAUSE_ROLE

###### Arbitrum L1 ERC20 Token Gateway [`0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a`](https://etherscan.io/address/0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a)
* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE.

###### Optimism L1 ERC20 Token Bridge [`0x76943C0D61395d8F2edF9060e1533529cAe05dE6`](https://etherscan.io/address/0x76943C0D61395d8F2edF9060e1533529cAe05dE6)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### Base L1 ERC20 Token Bridge [`0x9de443AdC5A411E83F1878Ef24C3F52C61571e72`](https://etherscan.io/address/0x9de443AdC5A411E83F1878Ef24C3F52C61571e72)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### Mantle L1 ERC20 TokenBridge [`0x2D001d79E5aF5F65a939781FE228B267a8Ed468B`](https://etherscan.io/address/0x2D001d79E5aF5F65a939781FE228B267a8Ed468B)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### ZKSync L1 ERC20 TokenBridge [`0x41527B2d03844dB6b0945f25702cB958b6d55989`](https://etherscan.io/address/0x41527B2d03844dB6b0945f25702cB958b6d55989)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### Scroll L1 ERC20 TokenBridge [`0x6625c6332c9f91f2d27c304e729b86db87a3f504`](https://etherscan.io/address/0x6625c6332c9f91f2d27c304e729b86db87a3f504)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### Mode L1 ERC20 Token Bridge [`0xD0DeA0a3bd8E4D55170943129c025d3fe0493F2A`](https://etherscan.io/address/0xD0DeA0a3bd8E4D55170943129c025d3fe0493F2A)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

###### BSC L1 Token Bridge:
    1. NTTManager: [`0xb948a93827d68a82F6513Ad178964Da487fe2BD9`](https://etherscan.io/address/0xb948a93827d68a82F6513Ad178964Da487fe2BD9)

        - pause capability

    2. Wormhole Transceiver: [`0xA1ACC1e6edaB281Febd91E3515093F1DE81F25c0`](https://etherscan.io/address/0xA1ACC1e6edaB281Febd91E3515093F1DE81F25c0)

        - pause capability

    3. Axelar Transceiver: [`0x723AEAD29acee7E9281C32D11eA4ed0070c41B13`](https://etherscan.io/address/0x723AEAD29acee7E9281C32D11eA4ed0070c41B13)

        - pause capability


###### Zircuit Token Bridge: [`0x912C7271a6A3622dfb8B218eb46a6122aB046C79`](https://etherscan.io/address/0x912C7271a6A3622dfb8B218eb46a6122aB046C79)

* WITHDRAWALS_DISABLER_ROLE,
* DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.3 Emergency Brakes: Optimism

**Address:** oeth:[`0x4Cf8fE0A4c2539F7EFDD2047d8A5D46F14613088`](https://app.safe.global/settings/setup?safe=oeth:0x4Cf8fE0A4c2539F7EFDD2047d8A5D46F14613088)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Optimism side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [Emergency Brakes MS for L2 (Upgrade)](https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608), [First launches of Lido on L2](https://research.lido.fi/t/lido-on-l2-first-launches/2786)

**Snapshot:** [Emergency Brakes multi-sig upgrade](https://snapshot.org/#/lido-snapshot.eth/proposal/0x2b368b535b2024394daff218d222e260dbc4543b6d4e49aa4700cc0a9233e86a)

**Contracts and Roles:**

L2 ERC20 Token Bridge oeth:[`0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957`](https://optimistic.etherscan.io/address/0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957)

- WITHDRAWALS_DISABLE_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.4 Emergency Brakes: Arbitrum

**Address:** arb1: [`0xfDCf209A213a0b3C403d543F87E74FCbcA11de34`](https://app.safe.global/settings/setup?safe=arb1:0xfDCf209A213a0b3C403d543F87E74FCbcA11de34)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Arbitrum side in case of an emergency.

**Quorum:** 3/5

**Forum topic:** [First launches of Lido on L2](https://research.lido.fi/t/lido-on-l2-first-launches/2786)

**Snapshot:** [Emergency Brakes multisig upgrade](https://snapshot.org/#/lido-snapshot.eth/proposal/0x2b368b535b2024394daff218d222e260dbc4543b6d4e49aa4700cc0a9233e86a)

**Contracts and Roles:**

L2 ERC20 Token Gateway arb1: [`0x07D4692291B9E30E326fd31706f686f83f331B82`](https://arbiscan.io/address/0x07D4692291B9E30E326fd31706f686f83f331B82)

- WITHDRAWALS_DISABLE_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.5 Emergency Brakes: Base

**Address:** base: [`0x0F9A0e7071B7B21bc7a8514DA2cd251bc1FF0725`](https://app.safe.global/home?safe=base:0x0F9A0e7071B7B21bc7a8514DA2cd251bc1FF0725)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Base side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment to Base and Ownership Acceptance by Lido DAO](https://research.lido.fi/t/wsteth-deployment-to-base-and-ownership-acceptance-by-lido-dao/5668)

**Snapshot:** [wstETH Deployment to Base and Ownership Acceptance by Lido DAO](https://snapshot.org/#/lido-snapshot.eth/proposal/0x8b35f64fffe67f67d4aeb2de2f3351404c54cd75a08277c035fa77065b6792f4)

**Contracts and Roles:**

L2ERC20TokenBridge: base:[`0xac9D11cD4D7eF6e54F14643a393F68Ca014287AB`](https://basescan.org/address/0xac9D11cD4D7eF6e54F14643a393F68Ca014287AB)

- WITHDRAWALS_DISABLE_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.6 Emergency Brakes: Mantle

**Address:** mantle: [`0xa8579D42E34398267dE16e6eeeCdb7ED0EFF953C`](https://multisig.mantle.xyz/home?safe=mantle:0xa8579D42E34398267dE16e6eeeCdb7ED0EFF953C)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Mantle side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment on Mantle](https://research.lido.fi/t/wsteth-deployment-on-mantle/5991)

**Snapshot:** [wstETH Deployment on Mantle](https://snapshot.org/#/lido-snapshot.eth/proposal/0x349fa7409a99683405e71ddebaf5068f3dee7d4e6c9e4375198c4dc10c899bb9)

**Contracts and Roles:**

L2ERC20TokenBridge: mantle:[`0x9c46560D6209743968cC24150893631A39AfDe4d`](https://explorer.mantle.xyz/address/0x9c46560D6209743968cC24150893631A39AfDe4d)

- WITHDRAWALS_DISABLER_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.7 Emergency Brakes: ZKSync

**Address:** zksync: [`0x0D7F0A811978B3B62CbfF4EF6149B5909EAcfE94`](https://app.safe.global/home?safe=zksync:0x0D7F0A811978B3B62CbfF4EF6149B5909EAcfE94)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on zkSync side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment on zkSync](https://research.lido.fi/t/wsteth-deployment-on-zksync/5701)

**Snapshot:** [wstETH Deployment on zkSync](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd6c4a71c36bef27c4b5997223bd8612fe19177b46b238e78802a4a27fd5cdc9e)

**Contracts and Roles:**

L2ERC20TokenBridge: zksync:[`0xE1D6A50E7101c8f8db77352897Ee3f1AC53f782B`](https://explorer.zksync.io/address/0xE1D6A50E7101c8f8db77352897Ee3f1AC53f782B)

- WITHDRAWALS_DISABLER_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.8 Emergency Brakes: Scroll

**Address:** Scroll: [`0xF580753E334687C0d6b88EF563a258f048384Ee6`](https://safe.scroll.xyz/home?safe=scr:0xF580753E334687C0d6b88EF563a258f048384Ee6)

**Purpose of the multisig:** The multisig is used to disable deposits and/or withdrawals for wstETH token bridge on Scroll side in case of an emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment on Scroll](https://research.lido.fi/t/wsteth-deployment-on-scroll/6603)

**Snapshot:** [Should the Lido DAO recognize the wstETH Bridge Endpoints on Scroll as canonical?](https://snapshot.org/#/lido-snapshot.eth/proposal/0xcdb7d84ea80d914a4abffd689ecf9bdc4bb05d47f1fdbdda8793d555381a0493)

**Contracts and Roles:**

L2 Lido Gateway: Scroll:[`0x8aE8f22226B9d789A36AC81474e633f8bE2856c9`](https://scrollscan.com/address/0x8aE8f22226B9d789A36AC81474e633f8bE2856c9)

- WITHDRAWALS_DISABLER_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.9 Emergency Brakes: Mode

**Address:** Mode: [`0x244912352A639001ceCFa208cDaa7CB474c9eadE`](https://safe.optimism.io/home?safe=mode:0x244912352A639001ceCFa208cDaa7CB474c9eadE)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Mode side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment on Mode](https://research.lido.fi/t/wsteth-deployment-on-mode/7365)

**Snapshot:** [Should the Lido DAO recognize the wstETH Bridge Endpoints on Mode as canonical?](https://snapshot.org/#/lido-snapshot.eth/proposal/0x6bc51c2b07a9345a03a0bc0acb72ccc9f63879c981f3a6954164d110c5d330b2)

**Contracts and Roles:**

L2ERC20TokenBridge: Mode:[`0xb8161F28a5a38cE58f155D9A96bDAc0104985FAc`](https://explorer.mode.network/address/0xb8161F28a5a38cE58f155D9A96bDAc0104985FAc)

- WITHDRAWALS_DISABLER_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.10 Emergency Brakes: Binance Smart Chain (BSC)

**Address:** BSC: [`0xC2b778fCc3FF311Cf1abBF4E53880277bfD14C8f`](https://app.safe.global/home?safe=bnb:0xC2b778fCc3FF311Cf1abBF4E53880277bfD14C8f)

**Purpose of the multisig:** The multisig is used to pause deposits and withdrawals for wstETH token bridge on BSC side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [Wormhole x Axelar | Lido Bridge: Implementation for wstETH on Binance Smart Chain](https://research.lido.fi/t/wormhole-x-axelar-lido-bridge-implementation-for-wsteth-on-bnb-chain/6012)

**Snapshot:** [Should the Lido DAO recognize the wstETH Bridge Endpoints on Binance Smart Chain as canonical?](https://snapshot.org/#/lido-snapshot.eth/proposal/0xcc52cdc83273b42a056cfc632889355595821a2cc9a59ba8adff66b30e9718f9)

**Contracts and Roles:**

1. NTTManager: BSC:[`0x6981F5621691CBfE3DdD524dE71076b79F0A0278`](https://bscscan.com/address/0x6981F5621691CBfE3DdD524dE71076b79F0A0278)

    - pause capability

2. Wormhole Transceiver: BSC:[`0xbe3F7e06872E0dF6CD7FF35B7aa4Bb1446DC9986`](https://bscscan.com/address/0xbe3F7e06872E0dF6CD7FF35B7aa4Bb1446DC9986)

    - pause capability

3. Axelar Transceiver: BSC:[`0x723AEAD29acee7E9281C32D11eA4ed0070c41B13`](https://bscscan.com/address/0x723AEAD29acee7E9281C32D11eA4ed0070c41B13)

    - pause capability

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |

## 1.11 Emergency Brakes: Zircuit

**Address:** Zircuit: [`0x9Bff79BF7226cB5C16d0Cca9c1dc60450feE560d`](https://safe.zircuit.com/settings/setup?safe=zircuit-mainnet:0x9Bff79BF7226cB5C16d0Cca9c1dc60450feE560d)

**Purpose of the multisig:** The multisig is used to disable deposits or withdrawals or both deposits and withdrawals for wstETH token bridge on Zircuit side in case of emergency.

**Quorum:** 3/5

**Forum topics:** [wstETH Deployment on Zircuit](https://research.lido.fi/t/wsteth-deployment-to-zircuit-and-ownership-acceptance-by-lido-dao/8602)

**Snapshot:** TBA

**Contracts and Roles:**

L2ERC20TokenBridge: Zircuit:[`0xF4DC271cA48446a5d2b97Ff41D39918DF8A4Eb0e`](https://explorer.zircuit.com/address/0xF4DC271cA48446a5d2b97Ff41D39918DF8A4Eb0e)

- WITHDRAWALS_DISABLER_ROLE
- DEPOSITS_DISABLER_ROLE

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [psirex](https://research.lido.fi/u/psirex) | 0x2a61d3ba5030Ef471C74f612962c7367ECa3a62d | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [TheDZhon](https://research.lido.fi/u/thedzhon/) | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/23795 | https://research.lido.fi/t/emergency-brakes-signer-rotation/5286/2 |
| [kadmil](https://research.lido.fi/u/kadmil) | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [ujenjt](https://research.lido.fi/u/ujenjt) | 0xdd19274b614b5ecAcf493Bc43C380ef6B8dfB56c | - | https://research.lido.fi/t/emergency-brakes-multi-sig-upgrade/2608 |
| [folkyatina](https://research.lido.fi/u/folkyatina) | 0xCFfE0F3B089e46D8212408Ba061c425776E64322| - | https://twitter.com/folkyatina/status/1550112058003169284?s=20&t=9RHqr47D6r_5Vin6SrU5Qw |
