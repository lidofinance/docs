# Committees

## 2.1 LEGO Committee

**Address:** [`0x12a43b049A7D330cB8aEAB5113032D18AE9a9030`](https://app.safe.global/settings/setup?safe=eth:0x12a43b049A7D330cB8aEAB5113032D18AE9a9030)

**Purpose of the multisig:**
The LEGO Committee utilizes this multisig to make grants: sending dedicated grants directly to recipients & funding committee members’ personal grant allowances. 
Multisig enables the reception of LDO and stablecoins (listed in the AllowedTokensRegistry, use [getAllowedTokens](https://etherscan.io/address/0x4ac40c34f8992bb1e5e856a448792158022551ca#readContract#F6) to see the list) from the Lido DAO Treasury by Easy Track.

**Forum topics:**\
[Project: Lido Ecosystem Grants Organization](https://research.lido.fi/t/project-lido-ecosystem-grants-organization/406)\
[Proposal to continue LEGO for Q1 2022](https://research.lido.fi/t/lego-a-proposal-to-continue-lego-for-q1-2022/1568/)

**Snapshots:**\
[Continue LEGO for year 2](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd9d13bb5c9a2be4a17d75b007a16ae3f1b799af4b33717e646a8aa11da19992e)\
[Proposal to Diversify LEGO budget for Q4 22 and moving further (restart)](https://snapshot.org/#/lido-snapshot.eth/proposal/0xeeadc3b5bfb4565cca611499c2c39e37e84bab8ad63b4f6a74d73b4151b0e791)\
[LEGO: Proposal to replace Tim Beiko with Eric Siu and update council members rotation rules](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x2acd7e052fc5ac2513509f5023975451f69fd488628577fedf369c3da97bef6a)

**Aragon:**\
[Omnibus vote #147 (items 4,5)](https://vote.lido.fi/vote/147)

**Quorum:** 4/8

**Easy Track contracts and roles:**

| Factory          | Contract name           | Contract address | Multisig role |
|------------------|-------------------------|-----------------|---------------|
| LEGO LDO         | TopUpAllowedRecipients  | [`0x00caAeF11EC545B192f16313F53912E453c91458`](https://etherscan.io/address/0x00caAeF11EC545B192f16313F53912E453c91458)| trustedcaller |
| LEGO Stablecoins | TopUpAllowedRecipients  | [`0x6AB39a8Be67D9305799c3F8FdFc95Caf3150d17c`](https://etherscan.io/address/0x6AB39a8Be67D9305799c3F8FdFc95Caf3150d17c)| trustedcaller |

The full list of related contracts is available [here](https://docs.lido.fi/deployed-contracts/#easy-track-factories-for-token-transfers).

**List of signers:**

| Name | Address | Verification | Public verification | Adding proposal |
| --- | --- | -- | -- | --- |
| Alex L | 0x3786C091Ed68d5B58EFAE5193e54c043Bde3b8f6 | Sig hash: 0xea1fb76e4b10d2700d3ff1cb2d8f2c672107abdf6e667f47a2095cbcce5b132138eaa9506b7ec97d203236f44b074fcbef7d4f2d5a6a87faf472ad6f85b17c3800 | https://twitter.com/Al_lykov/status/1557051652322037760?s=20&t=uzuxoMRgLwWuZLDKItN0vw | https://research.lido.fi/t/lego-expand-lego-council-by-adding-alex-lykov/2754 |
| Izzy | 0x783EA934d543CD1ccfd920639A7539a0BD3895e2 | https://etherscan.io/verifySig/12775 | https://twitter.com/IsdrsP/status/1602973286534680577 | https://research.lido.fi/t/lego-expand-lego-council-by-adding-isidoros-passadis/2127 |
| kadmil | 0x6f5c9B92DC47C89155930E708fBc305b55A5519A | - | - | https://research.lido.fi/t/lego-proposal-members-open-initiatives-cont/476 |
| skozin | 0x2CAE3a4D4c513026Ecc6af94A4BA89Df31c8cEA3 | https://etherscan.io/verifySig/17853 | https://twitter.com/_skozin/status/1655873413833998336 | https://research.lido.fi/t/lego-proposal-members-open-initiatives-cont/476 |
| Florian | 0xb3F9998BD84cE884CaFF8f0D803c0EDbb6fEC37C | - | - | https://research.lido.fi/t/lego-a-proposal-to-continue-lego-for-q1-2022/1568/2 |
| kethfinex | 0x639e084095020E1E85a857eb12b2219292a5B979 | https://etherscan.io/verifySig/11702 | - | https://research.lido.fi/t/lego-proposal-members-open-initiatives-cont/476 |
| vshvsh | 0x4A7489a3e94eFc8f4C4ee266ED297d3031f123A7 | - | - | https://research.lido.fi/t/lego-proposal-members-open-initiatives-cont/476 |
| Eric Siu  | 0xA47aE447A2A0487C228de1ac7fDA83030d4cF2C5 | https://etherscan.io/verifySig/265363 | https://warpcast.com/randomishwalk/0x7b35f539 | https://research.lido.fi/t/lego-proposal-to-replace-tim-beiko-with-eric-siu/9327/2 |

## 2.2 Rewards Share Committee (prev. Referral Program Committee)

**Address:** [`0xe2A682A9722354D825d1BbDF372cC86B2ea82c8C`](https://app.safe.global/settings/setup?safe=eth:0xe2A682A9722354D825d1BbDF372cC86B2ea82c8C)

**Purpose of the multisig:** Multisig is used for signing off on the Rewards Share Program, allowing functions such as adding and removing participants to whitelist, and distributing funds (stETH) allocated for Rewards Share Program according to budget proposal and calculated based on Rewards Share Program Policy through the Easy Track.

**Quorum:** 4/8

**Forum topics:**\
[Proposal to form Referral Program Committee and setup a multisig](https://research.lido.fi/t/setup-lido-referral-program-committee-and-use-easy-track-for-the-payouts-ethereum/1808)\
[Rewards-Share Program 2024](https://research.lido.fi/t/rewards-share-program-2024/6812)

**Snapshot:**\
[Proposal to adopt Rewards-Share Program 2024](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd326ac1c7f4317b370e794a3e57d342f8c9dd8c4f517b2632f835a93585fb0f3)

**Aragon:**\
[Omnibus vote #162](https://vote.lido.fi/vote/162)

**Easy Track contracts and roles:**

| Factory | Contract name        | Contract address                                                                                                        | Multisig role |
|---------|----------------------|-------------------------------------------------------------------------------------------------------------------------|---------------|
| Rewards Share stETH | AddAllowedRecipient  | [`0x1F809D2cb72a5Ab13778811742050eDa876129b6`](https://etherscan.io/address/0x1F809D2cb72a5Ab13778811742050eDa876129b6) | trustedcaller |
| Rewards Share stETH | RemoveAllowedRecipient | [`0xd30Dc38EdEfc21875257e8A3123503075226E14B`](https://etherscan.io/address/0xd30Dc38EdEfc21875257e8A3123503075226E14B) | trustedcaller |
| Rewards Share stETH | TopUpAllowedRecipients | [`0xbD08f9D6BF1D25Cc7407E4855dF1d46C2043B3Ea`](https://etherscan.io/address/0xbD08f9D6BF1D25Cc7407E4855dF1d46C2043B3Ea) | trustedcaller |

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| K_G | 0xC0DB9e34A47Ba42B6C17E6adae8f07d1Cb37C3d5 | https://etherscan.io/verifySig/255465 | https://x.com/Kean_Gilbert/status/1829481809970594270 |
| robingop | 0xf2374BCb265505002055942D070459a4d2011012 | Sig hash: 0x89523e02d087de609003a33b091bde12e6f1b733336d4f1ea2e5de7a7faf990b39f593dd46cf993f4b5d5d2185ae00c19ff65013da549914d9445b432582393701 | https://twitter.com/robingop/status/1750498068976291883|
| Alex_L | 0xb339918e75664a07bb650513427559920c0a0f6c | https://etherscan.io/verifySig/34671 | https://x.com/Al_lykov/status/1829368876699681203 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/254203 | https://x.com/adcv_/status/1815411719952621755 |
| zuzu_eeka | 0x004812da927b5DCd07e7329609eDD75E25d2d295 | Sig hash: 0x180f82306e49719efa8d599f0ec46f2373157ae369d90c544ce64ab2f5dafe0260ed220bf3d52d8e6165cd9bf2378920c805acad9a144dc7619fe04ae298cfc101 | https://twitter.com/zuzu_eeka/status/1516028538863992834?t=_MujKbaavo1NXvjWr9iiqw&s=09 |
| Pipistrella | 0x5da409e1cbDABeC67471dB01Ff956f804bb8879f | https://etherscan.io/verifySig/17027 | https://twitter.com/ppclunghe/status/1672510820025073666?t=UYIyPA1_TfgNO323Q82mIQ&s=03 |
| skelneko | 0x75D95fF8D48E2Ca5c4235322A8AC8e52A76124cD | https://etherscan.io/verifySig/274493 | https://x.com/skelneko/status/1930219472591434005 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

## 2.3 Relay Maintenance Committee

**Address:** [`0x98be4a407Bff0c125e25fBE9Eb1165504349c37d`](https://app.safe.global/settings/setup?safe=eth:0x98be4a407Bff0c125e25fBE9Eb1165504349c37d)

**Purpose of the multisig:** The multisig signs off the [MEV Boost Relay Allowed List smart contract](https://etherscan.io/address/0xf95f069f9ad107938f6ba802a3da87892298610e) in order to introduce changes to the list of relays proposed to be used by the Lido on Ethereum Node Operators

**Quorum:** 5/7

**Forum topic:** [Identify and constitute Relay Maintenance Committee](https://research.lido.fi/t/lido-on-ethereum-identify-and-constitute-relay-maintenance-committee/3386)

**Snapshot:** [Lido on Ethereum Block Proposer Rewards Policy 2.0 and Relay Maintenance Committee](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)

**Aragon:** [Omnibus vote #149 (item 6)](https://vote.lido.fi/vote/149)

**Contracts and roles:**

| Contract name           | Contract address | Multisig role |
|-------------------------|-----------------|---------------|
| MEVBoostRelayAllowedList  | [`0xF95f069F9AD107938F6ba802a3da87892298610E`](https://etherscan.io/address/0xF95f069F9AD107938F6ba802a3da87892298610E) | manager |

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| George | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/17866 | https://twitter.com/george_avs/status/1602229253696790528 |
| eliasimos | 0x4981a4775983e947b12d0982021bea8697175f4a | Sig hash: 0x67291ff9224b8ebfd217ff00d5f1eefceacdd1fe2916b0b1a2157169d813ac9c099ce5d926c2b16252abc89fc7df21d1efa07e1e0b1d7497f454ff340920d23e01 | https://twitter.com/eliasimos/status/1602924642645282816?s=20&t=_dSkjtTQhkyjM2kVdpEZbA |
| michaelsprou | 0x6B29132ea388a308578c1d3Be068D0e4fc9915a2 | https://gist.github.com/michaelsproul/677cf9abb2789e61973662868f8bd29d | https://twitter.com/sproulM_/status/1602519592026382337 |
| philknows | 0x0ef5c6Ab0C44b2b042606215530437809eFE54c8 | https://etherscan.io/verifySig/12760 | https://twitter.com/philngo_/status/1602781428114411520?s=20&t=Q2XjlHIwayyTdVNoKQshig |
| Dharmendra | 0x2d0669db84f11a9ead41e57ce2f242d92111a58f | https://etherscan.io/verifySig/17652 | https://twitter.com/DharmendraKari3/status/1653844633921916931?s=20 |
| Sven | 0x215b5f40b6507d8398a23af4d92a1aeeb6457901 | https://etherscan.io/verifySig/279163 | https://x.com/SvenBrekelmans/status/1961034505671561229 |
| Mario | 0xBC621E0fAd141CD1b14f34f7954695E6C3322472 | https://etherscan.io/verifySig/279564 | https://x.com/Mario782674/status/1963207911531843615 |

## 2.4 Token Reward Program (TRP) Association Multisig

**Address:** [`0x834560F580764Bc2e0B16925F8bF229bb00cB759`](https://app.safe.global/settings/setup?safe=eth:0x834560F580764Bc2e0B16925F8bF229bb00cB759)

**Purpose of the multisig:** TRP Multisig performs operations around TRP: receives LDOs for TRP allocations, creates new TRP distribution vaults, revokes the allowances from the no longer required existing TRP vault, grants direct TRP payments if operationally necessary & gets funded from the DAO Treasury through ET motions.

**Quorum:** 4/7

**Forum topics:**\
[Lido DAO Token Rewards Plan (TRP)](https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833)\
[Transfer TRP to Lido Labs Foundation and Amend TRP Terms](https://research.lido.fi/t/transfer-trp-to-lido-labs-foundation-and-amend-trp-terms/10647)

**Snapshots:**\
[Proposal to form TRP Committee](https://snapshot.org/#/lido-snapshot.eth/proposal/0xc00b48275e268f26b6cebf82322f281a44acaf679f6381dd612e278174671daf)\
[Transfer TRP to Lido Labs Foundation and Amend TRP Terms](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x16ecb51631d67213d44629444fcc6275bc2abe4d7e955bebaf15c60a42cba471)

**Aragon:** [Omnibus vote #152 to set up LDO Easy Track](https://vote.lido.fi/vote/152)

**Contracts and roles:**

| Contract name                     | Contract address | Multisig role |
|-----------------------------------|-----------------|---------------|
| TRP VestingEscrowFactory          | [`0xDA1DF6442aFD2EC36aBEa91029794B9b2156ADD0`](https://etherscan.io/address/0xDA1DF6442aFD2EC36aBEa91029794B9b2156ADD0) | manager |
| Easy Track TopUpAllowedRecipients | [`0xBd2b6dC189EefD51B273F5cb2d99BA1ce565fb8C`](https://etherscan.io/address/0xBd2b6dC189EefD51B273F5cb2d99BA1ce565fb8C) | trustedcaller |

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Alex_L | 0xF3d5Fdb50154B1b3047F311485780Baa1D770492 | https://etherscan.io/verifySig/14259 | https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833/9 |
| adcv | 0x5157CeE5ee585A8331C936e838591FaeBf9123D4 | https://etherscan.io/verifySig/14301 | https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833/13 |
| irina | 0x8CeD94df9ddba8E38b6cb36639B6635F19Eb25C6 | https://etherscan.io/verifySig/14300 | https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833/12 |
| dgusakov | 0x806cAC2126F2a74ba04D712bA64Bd0792FE811d5 | https://etherscan.io/verifySig/14263 | https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833/10 |
| George | 0xAF0e81325a05a9F123907983F3F1a48864947127 | https://etherscan.io/verifySig/14296 | https://research.lido.fi/t/request-to-authorise-a-22m-ldo-ceiling-for-a-four-year-contributor-token-reward-plan-trp/3833/11 |
| Angelina_L | 0x30ce91eb74e56d0df97c78774b3aca2144f6ad32 | https://etherscan.io/verifySig/296198 | https://x.com/helterswellter/status/1989274615194227170 |
| Elena_S | 0xB95fdA03A90290Bd5853C79796a768E37130d193 | https://etherscan.io/verifySig/296381 | https://x.com/Elen0sh/status/1989387508875219258 |

## 2.5 Treasury Management Committee

**Address:** [`0xa02FC823cCE0D016bD7e17ac684c9abAb2d6D647`](https://app.safe.global/settings/setup?safe=eth:0xa02FC823cCE0D016bD7e17ac684c9abAb2d6D647)

**Purpose of the multisig:** The multisig is intended for treasury management committee operations. Multisig will strictly never take custody of Aragon funds and will use a suitable technical solution for executing any swaps permissionlessly.

**Quorum:** 4/7

**Forum topics:**\
[Proposal to approve Lido DAO Treasury Management Principles and authorize the formation of a Treasury Management Committee](https://research.lido.fi/t/proposal-to-approve-lido-dao-treasury-management-principles-and-authorize-the-formation-of-a-treasury-management-committee/4279/40)\
[Stonks: Treasury Swaps via Optimistic Governance](https://research.lido.fi/t/lido-stonks-treasury-swaps-via-optimistic-governance/6860)

**Snapshot:**\
[Voting for the approval of the creation of Treasury Committee](https://snapshot.org/#/lido-snapshot.eth/proposal/0xac31f800288c68e32d1eb3cea7a525022faae3eb3bf805d1b3d248cda5375a13)

**Aragon:**\
[Omnibus vote #173](https://vote.lido.fi/vote/173)

**Easy Track contracts and roles:**

| Factory | Type of swap | Contract name          | Contract address | Multisig role |
|---------|--------------|------------------------|------------------|---------------|
| Stonks stETH | stETH to stablecoin | TopUpAllowedRecipients | [`0x6e04aED774B7c89BB43721AcDD7D03C872a51B69`](https://etherscan.io/address/0x6e04aED774B7c89BB43721AcDD7D03C872a51B69) | trustedcaller |
| Stonks stablecoins | stablecoin to stablecoin | TopUpAllowedRecipients | [`0x0d2aefA542aFa8d9D1Ec35376068B88042FEF5f6`](https://etherscan.io/address/0x0d2aefA542aFa8d9D1Ec35376068B88042FEF5f6) | trustedcaller |

The complete list of Lido Stonks contracts is available [here](https://docs.lido.fi/deployed-contracts/#lido-stonks-contracts).

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| karpatkey | 0x7d4FDba7d1b22834eA75B5E45e4110Bf56E690f1 | https://etherscan.io/tx/0x675609e65d19fe0e18d340381e5203d2744607ff0646ef24a81653d1403eb9ab | https://twitter.com/karpatkey/status/1648722691862429699 |
| marcbcs | 0x98308b6dA79B47D15e9438CB66831563649Dbd94 | https://etherscan.io/verifySig/17088 | https://twitter.com/silhcet/status/1648638734294994946?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/11698 | https://twitter.com/adcv_/status/1587404360476237829 |
| pipistrella | 0x5da409e1cbDABeC67471dB01Ff956f804bb8879f | https://etherscan.io/verifySig/17027 | https://twitter.com/ppclunghe/status/1648050514372841474?t=rKXVpeW-RC4f4uBV-eB07w&s=03 |
| sabrychiaa | 0x83a8b5c6990cbc78ffc45cbbfe5748b895973623 | https://etherscan.io/verifySig/17026 | https://twitter.com/sabrychiaa/status/1648049357608960000 |
| Mol_Eliza | 0x620bD63538Bf10a87214b6187f5bc85926C2971f | https://etherscan.io/verifySig/17085 | https://twitter.com/MaxMolEliza/status/1648959823260659714?s=20 |
| kadmil | 0x9a3f38af97b791c85c043d46a64f56f87e0283d4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1647996307942899713 |

## 2.6 Gas Supply Committee (prev. Depositor bot gas funding)

**Address:** [`0x5181d5D56Af4f823b96FE05f062D7a09761a5a53`](https://app.safe.global/settings/setup?safe=eth:0x5181d5D56Af4f823b96FE05f062D7a09761a5a53)

**Purpose of the multisig:** Multisig operationally funds the gas rebates for some operations in Lido on X protocols under the specified [budget of 1000 stETH per year](https://research.lido.fi/t/nominate-the-gas-supply-committee-as-a-supervisor-for-gas-expenditure/4724/4).

**Quorum:** 3/5

**Forum topics:**\
[Depositor bot gas funding](https://research.lido.fi/t/proposal-to-fund-the-depositor-bot-in-ethereum/1881)\
[Gas Supply Committee](https://research.lido.fi/t/nominate-the-gas-supply-committee-as-a-supervisor-for-gas-expenditure/4724)

**Snapshot:**\
[Nominate the Gas Supply Committee as a supervisor for gas expenditure](https://snapshot.org/#/lido-snapshot.eth/proposal/0xbfecc75c45bca53d3c5786f099d46559ac597bc3fae802d5f599b60f10b4bd4a)

**Aragon:**\
[Omnibus vote #156](https://vote.lido.fi/vote/156)\
[Omnibus vote #160 (items 6-8)](https://vote.lido.fi/vote/160)

**Easy Track contracts and roles:**

| Factory | Contract name | Contract address | Multisig role |
|---------|---------------|------------------|---------------|
| Gas Supply stETH | AddAllowedRecipient | [`0x48c135Ff690C2Aa7F5B11C539104B5855A4f9252`](https://etherscan.io/address/0x48c135Ff690C2Aa7F5B11C539104B5855A4f9252) | trustedcaller |
| Gas Supply stETH | RemoveAllowedRecipient | [`0x7E8eFfAb3083fB26aCE6832bFcA4C377905F97d7`](https://etherscan.io/address/0x7E8eFfAb3083fB26aCE6832bFcA4C377905F97d7) | trustedcaller |
| Gas Supply stETH | TopUpAllowedRecipients | [`0x200dA0b6a9905A377CF8D469664C65dB267009d1`](https://etherscan.io/address/0x200dA0b6a9905A377CF8D469664C65dB267009d1) | trustedcaller |

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| zuzu_eeka | 0x004812da927b5DCd07e7329609eDD75E25d2d295 | https://etherscan.io/verifySig/14255 | https://twitter.com/zuzu_eeka/status/1625030303453442049 |
| Raman | 0x56aAaF3e07507C3f2554c4087b0f3ECC61F78a9e | Sig hash: 0x8555fbae4fee1b4adedc05d20525c097c29d75df13470a5f4cd0e2db98575b5e5a89d7b477e43d7ee5315448ab73861b4b87c61cd46e1e77e404bc8e105a5fa100 | https://twitter.com/RSiamionau/status/1623708249236156417?s=20&t=y-o2_ey7po8qeejNd2KmBQ |
| skozin | 0x2CAE3a4D4c513026Ecc6af94A4BA89Df31c8cEA3 | https://etherscan.io/verifySig/17853 | https://twitter.com/_skozin/status/1655873413833998336 |
| George | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/17866 | https://twitter.com/george_avs/status/1587788184410267649 |
| kadmil | 0x9A3f38AF97b791C85c043D46a64f56f87E0283D4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1655865828544266242 |

## 2.7 Simple DVT Module Committee

**Address:** [`0x08637515E85A4633E23dfc7861e2A9f53af640f7`](https://app.safe.global/settings/setup?safe=eth:0x08637515E85A4633E23dfc7861e2A9f53af640f7)

**Purpose of the multisig:** The Simple DVT Module Committee uses this multisig to perform operations: create new clusters, activate and deactivate existing clusters, raise and lower cluster key limits, and change cluster manager and reward addresses via Easy Track.

**Quorum:** 4/7

**Forum topics:**\
[Simple DVT Module Committee Multisig](https://research.lido.fi/t/simple-dvt-module-committee-multisig/6520)\
[Simple DVT release](https://research.lido.fi/t/simple-dvt-release/6613)

**Snapshot:**\
[Staking Router Module Proposal: Simple DVT](https://snapshot.org/#/lido-snapshot.eth/proposal/0xf3ac657484444f0b54eba2c251135c47f875e3d1821496247d11bdd7fab0f291)

**Aragon:**\
[Omnibus vote #172 (items 7-18)](https://vote.lido.fi/vote/172)

**Easy Track Simple DVT staking module contracts and roles:**

| Contract name          | Contract address | Multisig role |
|------------------------|-----------------|---------------|
| AddNodeOperators | [`0xcAa3AF7460E83E665EEFeC73a7a542E5005C9639`](https://etherscan.io/address/0xcAa3AF7460E83E665EEFeC73a7a542E5005C9639) | trustedcaller |
| ActivateNodeOperators | [`0xCBb418F6f9BFd3525CE6aADe8F74ECFEfe2DB5C8`](https://etherscan.io/address/0xCBb418F6f9BFd3525CE6aADe8F74ECFEfe2DB5C8) | trustedcaller |
| DeactivateNodeOperators | [`0x8B82C1546D47330335a48406cc3a50Da732672E7`](https://etherscan.io/address/0x8B82C1546D47330335a48406cc3a50Da732672E7) | trustedcaller |
| SetVettedValidatorsLimits | [`0xD75778b855886Fc5e1eA7D6bFADA9EB68b35C19D`](https://etherscan.io/address/0xD75778b855886Fc5e1eA7D6bFADA9EB68b35C19D) | trustedcaller |
| SetNodeOperatorNames | [`0x7d509BFF310d9460b1F613e4e40d342201a83Ae4`](https://etherscan.io/address/0x7d509BFF310d9460b1F613e4e40d342201a83Ae4) | trustedcaller |
| SetNodeOperatorRewardAddresses | [`0x589e298964b9181D9938B84bB034C3BB9024E2C0`](https://etherscan.io/address/0x589e298964b9181D9938B84bB034C3BB9024E2C0) | trustedcaller |
| UpdateTargetValidatorLimits | [`0x161a4552a625844c822954c5acbac928ee0f399b`](https://etherscan.io/address/0x161a4552a625844c822954c5acbac928ee0f399b) | trustedcaller |
| ChangeNodeOperatorManager | [`0xE31A0599A6772BCf9b2bFc9e25cf941e793c9a7D`](https://etherscan.io/address/0xE31A0599A6772BCf9b2bFc9e25cf941e793c9a7D) | trustedcaller |

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| syncnode | 0x19aC7c69e5F1AC95b8d49b30Cbb79e81f1ab0dba | https://etherscan.io/verifySig/35529| https://twitter.com/syncn0de/status/1752374013119049981 |
| Andrew | 0xBc1cFd2BeC23a0cDc555AE8D31EEa06BE3B5186A | https://etherscan.io/verifySig/35236| https://twitter.com/KukisGlobal/status/1752363059308302687 |
| Francesco| 0x62CeDec8B7c81bEe91d97725c9a14dC23C3227E2 | https://etherscan.io/verifySig/35234|https://twitter.com/cremonafran/status/1752369978257322020|
| Thomas | 0x7962cFa46B15BAb1aE798d927FAE83CC73a0E64D | https://etherscan.io/verifySig/35235 | https://twitter.com/_Cryptoma/status/1752592959533400257|
| Eridian | 0xE3e34FA93575AF41BEF3476236E1A3CDb3F60B85 | https://etherscan.io/verifySig/35148 | https://twitter.com/EridianAlpha/status/1752363981409288478|
| George A | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/35156 | https://twitter.com/george_avs/status/1752380380282314889|
| Will | 0xfAd931F268dc5f8E5cdc3000baAaC0cbdb4E0a9C | https://etherscan.io/verifySig/35157| https://twitter.com/KimonSh/status/1752382287721927062 |

## 2.8 Liquidity Observation Lab (LOL) Multisigs (prev. reWARDS)

### 2.8.1 Liquidity Observation Lab Committee (Ethereum)

**Address:** [`0x87D93d9B2C672bf9c9642d853a8682546a5012B5`](https://app.safe.global/settings/setup?safe=eth:0x87D93d9B2C672bf9c9642d853a8682546a5012B5)

**Purpose of the multisig:** The multisig used by the Liquidity Observation Lab (LOL) Committee for signing off, and perform LOL operations of allocating grants across DeFI & is funded through Easy Track motions.

This Multisig is allowed to [hold stETH](https://research.lido.fi/t/rewards-january-22-upgrade-proposal/1532) for operations (sending grants) wherever they deem useful on Ethereum, L2s, and other blockchains.

**Quorum:** 5/9

**Forum topics:**\
[Proposal to form reWARDS Committee](https://research.lido.fi/t/proposal-to-form-rewards-committee/1447)\
[Proposal to relaunch the reWARDS Committee as the Liquidity Observation Lab (LOL)](https://research.lido.fi/t/liquidity-observation-lab-lol-liquidity-strategy-and-application-to-curve-steth-eth-pool/5335)

**Snapshots:**\
[Proposal to form reWARDS Committee](https://snapshot.org/#/lido-snapshot.eth/proposal/0xe565ad27e1beaacbe0e68bec59bd3d86a80d669ca80022b76dc31be697f6e078)\
[Vote to move from LDO, DAI to stETH](https://snapshot.org/#/lido-snapshot.eth/proposal/0xdf57d5600ca8c0485a17de035afffe3b918e6059a6ba10bec71fb04f4041b41d)

**Aragon:**\
[Omnibus vote #160 (items 9-14)](https://vote.lido.fi/vote/160)

**Easy Track contracts and roles:**

|  Factory                                       | Contract name          | Contract address | Multisig role |
|----------------------------------------------------------|------------------------|----------------|---------------|
| LOL stETH | AddAllowedRecipient | [`0x935cb3366Faf2cFC415B2099d1F974Fd27202b77`](https://etherscan.io/address/0x935cb3366Faf2cFC415B2099d1F974Fd27202b77) | trustedcaller |
| LOL stETH | RemoveAllowedRecipient | [`0x22010d1747CaFc370b1f1FBBa61022A313c5693b`](https://etherscan.io/address/0x22010d1747CaFc370b1f1FBBa61022A313c5693b) | trustedcaller |
| LOL  stETH | TopUpAllowedRecipients | [`0x1F2b79FE297B7098875930bBA6dd17068103897E`](https://etherscan.io/address/0x1F2b79FE297B7098875930bBA6dd17068103897E) | trustedcaller |

**List of signers:**

| Name       | Address | Verification | Public verification |
|------------| --- | --- | --- |
| shardyaco  | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| McNut      | 0xc7a8DE05264442A318189f2bd160d2830902C8CD | Sig hash: 0xcb4ea5657307ca2a22b8ec283f6c83c33b1c4b09108a3ae0f3718cdac819adfe3ff003f583d51f89e495055517ed084f9b9ec3740cac0ba5407888d91374bb951c | https://twitter.com/damcnuta/status/1641086452812349441?s=20 |
| adcv       | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/11698 | https://twitter.com/adcv_/status/1587404360476237829 |
| Alex_L     | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| Olga_K     | 0x397ee87383787812fe0828ead2bcada6ae8fac6f | https://etherscan.io/verifySig/273368 | https://x.com/itmamuramgk28/status/1925113854834381180 |
| Marin      | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| skelneko | 0x75D95fF8D48E2Ca5c4235322A8AC8e52A76124cD | https://etherscan.io/verifySig/274493 | https://x.com/skelneko/status/1930219472591434005 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

### 2.8.2 - 2.8.9 Liquidity Observation Lab Committee Assets Distribution Multisigs

**Addresses:**

| № | Name | Address |
| --- | --- | --- |
| 2.8.2 | Optimism | oeth:[`0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61`](https://app.safe.global/home?safe=oeth:0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61)|
| 2.8.3 | Arbitrum | arb1:[`0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61`](https://app.safe.global/home?safe=arb1:0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61)|
| 2.8.4 | Base | base:[`0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61`](https://app.safe.global/home?safe=base:0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61) |
| 2.8.5 | ZKSync | zksync:[`0x65B05f4fCa066316383b0FE196C76C873a4dFD02`](https://app.safe.global/home?safe=zksync:0x65B05f4fCa066316383b0FE196C76C873a4dFD02) |
| 2.8.6 | Binance Smart Chain (BSC) | bnb:[`0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61`](https://app.safe.global/home?safe=bnb:0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61) |
| 2.8.7 | Linea | linea:[`0xA8ef4Db842D95DE72433a8b5b8FF40CB7C74C1b6`](https://app.safe.global/home?safe=linea:0xA8ef4Db842D95DE72433a8b5b8FF40CB7C74C1b6) |
| 2.8.8 | Mantle | mantle:[`0x6Ef6cd595b775B9752df83C8b1700235b21FE2f6`](https://app.safe.global/home?safe=mnt:0x6Ef6cd595b775B9752df83C8b1700235b21FE2f6) |
| 2.8.9 | Scroll | scroll:[`0x7bA516FB4512877C016907D6e70FAE96fbbdf8cD`](https://app.safe.global/home?safe=scr:0x7bA516FB4512877C016907D6e70FAE96fbbdf8cD) |

**Purpose of the multisigs:** The multisigs are set up to receive assets from the Liquidity Observation Lab Committee multisig on Ethereum and distribute them among approved recipients.

**Quorum:** 3/6

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| Alex_L | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/11698 | https://twitter.com/adcv_/status/1587404360476237829 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

### 2.8.10 Liquidity Observation Lab Committee (Polygon)

**Address:** matic:[`0x87D93d9B2C672bf9c9642d853a8682546a5012B5`](https://app.safe.global/settings/setup?safe=matic:0x87D93d9B2C672bf9c9642d853a8682546a5012B5)

**Purpose of the multisig:** The multisig is set up to receive assets from the Liquidity Observation Lab Committee multisig on Ethereum and distribute them among approved recipients.

**Forum topic:** [Launch of LIDO on Polygon](https://research.lido.fi/t/lido-on-l2-third-edition-polygon/4068)

**Quorum:** 2/3

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| kadmil | 0x9A3f38AF97b791C85c043D46a64f56f87E0283D4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1655865828544266242 |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/13838 | https://twitter.com/tvrmarin/status/1619812143326720000 |

### 2.8.11 Liquidity Observation Lab Committee multisigs for incentives on AAVE

**Addresses:**\
`0xC18F11735C6a1941431cCC5BcF13AF0a052A5022` - [Ethereum](https://app.safe.global/home?safe=eth:0xC18F11735C6a1941431cCC5BcF13AF0a052A5022), [Arbitrum](https://app.safe.global/home?safe=arb1:0xC18F11735C6a1941431cCC5BcF13AF0a052A5022), [BNB](https://app.safe.global/home?safe=bnb:0xC18F11735C6a1941431cCC5BcF13AF0a052A5022), [Polygon](https://app.safe.global/home?safe=matic:0xC18F11735C6a1941431cCC5BcF13AF0a052A5022), [Scroll](https://app.safe.global/home?safe=scr:0xC18F11735C6a1941431cCC5BcF13AF0a052A5022)\
`0x4f793e5d1d71dbbcEE34E39A5aD3c6bA5b11e935` - [Base](https://app.safe.global/home?safe=base:0x4f793e5d1d71dbbcEE34E39A5aD3c6bA5b11e935)\
`0x75483CE83100890c6bf1718c26052cE44e0F2839` - [Optimism](https://app.safe.global/home?safe=oeth:0x75483CE83100890c6bf1718c26052cE44e0F2839)\
`0xADB90Cfb3d5ebbaB8eeE7DA10B4DB215A7d50BeE` - [zksync](https://app.safe.global/home?safe=zksync:0xADB90Cfb3d5ebbaB8eeE7DA10B4DB215A7d50BeE)

**Purpose of the multisig:** A family of multisigs on L2 networks is set up to receive assets from the Liquidity Observation Lab Committee multisigs on respective networks and distribute them among approved recipients.

**Quorum:** 3/6

**List of signers (same on every network):**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| Alex_L | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/11698 | https://twitter.com/adcv_/status/1587404360476237829 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

### 2.8.12 Liquidity Observation Lab Committee OP Token Multisig

**Address:** oeth:[`0x91cE2F083d59B832f95f90aA0997168ae051a98A`](https://app.safe.global/settings/setup?safe=oeth:0x91cE2F083d59B832f95f90aA0997168ae051a98A)

**Purpose of the multisig:** Accept OP tokens provided to Lido DAO by airdrop or any other way on Optimism.

**Quorum:** 4/8

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Alex_L | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| McNut | 0xc7a8de05264442a318189f2bd160d2830902c8cd | Sig hash: 0xcb4ea5657307ca2a22b8ec283f6c83c33b1c4b09108a3ae0f3718cdac819adfe3ff003f583d51f89e495055517ed084f9b9ec3740cac0ba5407888d91374bb951c | https://twitter.com/damcnuta/status/1641086451478585353?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://etherscan.io/verifySig/11698 | https://twitter.com/adcv_/status/1587404360476237829 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| skelneko | 0x75D95fF8D48E2Ca5c4235322A8AC8e52A76124cD | https://etherscan.io/verifySig/274493 | https://x.com/skelneko/status/1930219472591434005 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |


### 2.8.13 Liquidity Observation Lab Committee ARB Token Multisig

**Address:** arb1:[`0x1840c4D81d2C50B603da5391b6A24c1cD62D0B56`](https://app.safe.global/settings/setup?safe=arb1:0x1840c4D81d2C50B603da5391b6A24c1cD62D0B56)

**Purpose of the multisig:** Accept ARB tokens provided to Lido DAO by airdrop or any other way on Arbitrum.

**Forum topic:** [Nominating reWARDS committee as a Lido DAO representative for airdrops](https://research.lido.fi/t/arbitrum-arb-token-airdrop-acceptance/4393)

**Snapshot:** [Nominating reWARDS committee as a Lido DAO representative for airdrops](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd460ea50072deb6bc428064a118dfd499714d4a7865552b4047eba3199663596)

**Quorum:** 4/8

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Alex_L | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| McNut | 0xc7a8de05264442a318189f2bd160d2830902c8cd | Sig hash: 0xcb4ea5657307ca2a22b8ec283f6c83c33b1c4b09108a3ae0f3718cdac819adfe3ff003f583d51f89e495055517ed084f9b9ec3740cac0ba5407888d91374bb951c | https://twitter.com/damcnuta/status/1641086451478585353?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://t.co/jCurYA9chd | https://twitter.com/adcv_/status/1587404360476237829 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| skelneko | 0x75D95fF8D48E2Ca5c4235322A8AC8e52A76124cD | https://etherscan.io/verifySig/274493 | https://x.com/skelneko/status/1930219472591434005 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

### 2.8.14 Liquidity Observation Lab Committee Arbitrum LTIPP Grant Token Multisig

**Address:** arb1:[`0xD97221065E826167A2cFE3307972c0D42200fDB4`](https://app.safe.global/home?safe=arb1:0xD97221065E826167A2cFE3307972c0D42200fDB4)

**Purpose of the multisig:** Accept ARB tokens provided to Lido DAO under the Arbitrum LTIPP grant.

**Forum topic:** [Liquidity Observation Lab (LOL): Liquidity Strategy and application to Curve stETH:ETH Pool](https://research.lido.fi/t/liquidity-observation-lab-lol-liquidity-strategy-and-application-to-curve-steth-eth-pool/5335/15)

**Snapshot:** [Nominating reWARDS committee as a Lido DAO representative for airdrops](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd460ea50072deb6bc428064a118dfd499714d4a7865552b4047eba3199663596)

**Quorum:** 3/5

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| McNut | 0xc7a8de05264442a318189f2bd160d2830902c8cd | Sig hash: 0xcb4ea5657307ca2a22b8ec283f6c83c33b1c4b09108a3ae0f3718cdac819adfe3ff003f583d51f89e495055517ed084f9b9ec3740cac0ba5407888d91374bb951c | https://twitter.com/damcnuta/status/1641086451478585353?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://t.co/jCurYA9chd | https://twitter.com/adcv_/status/1587404360476237829 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |

### 2.8.15 Liquidity Observation Lab Committee ZK Token Multisig

**Address:** zksync:[`0xf7169E14CDEF99403BE9114c9303887f760B1913`](https://app.safe.global/settings/setup?safe=zksync:0xf7169E14CDEF99403BE9114c9303887f760B1913)

**Purpose of the multisig:** Accept ZK tokens provided to Lido DAO by airdrop or any other way on ZKSync.

**Forum topic:** [Lido DAO ZKSync ZK Token Airdrop Acceptance](https://research.lido.fi/t/lido-dao-zksync-zk-token-airdrop-acceptance)

**Snapshot:** [Nominating reWARDS committee as a Lido DAO representative for airdrops](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd460ea50072deb6bc428064a118dfd499714d4a7865552b4047eba3199663596)

**Quorum:** 4/8

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Alex_L | 0xB339918e75664a07BB650513427559920C0A0F6C | https://etherscan.io/verifySig/20179 | https://twitter.com/Al_lykov/status/1668625635810615297?s=20 |
| GrStepanov | 0x8D0855047b59a5f11262f095ee724b5A59a89710 | https://etherscan.io/verifySig/34273 | https://twitter.com/grstepanov/status/1468933222923116550 |
| shardyaco | 0x59d07dc34B135B17b87840a86BFF7302039E7EDf | https://etherscan.io/verifySig/11733 | https://twitter.com/defiyaco/status/1587222297936633857?s=61&t=zNY2z0koPK_WF8W9MSgaww |
| McNut | 0xc7a8de05264442a318189f2bd160d2830902c8cd | Sig hash: 0xcb4ea5657307ca2a22b8ec283f6c83c33b1c4b09108a3ae0f3718cdac819adfe3ff003f583d51f89e495055517ed084f9b9ec3740cac0ba5407888d91374bb951c | https://twitter.com/damcnuta/status/1641086451478585353?s=20 |
| adcv | 0xcC692077C65dd464cAA7e7ae614328914f8469b3 | https://t.co/jCurYA9chd | https://twitter.com/adcv_/status/1587404360476237829 |
| Marin | 0x04e7C0350241b818eE5c92cc260008C9898F41cf | https://etherscan.io/verifySig/274497 | https://x.com/penzjun/status/1930225234981835172 |
| skelneko | 0x75D95fF8D48E2Ca5c4235322A8AC8e52A76124cD | https://etherscan.io/verifySig/274493 | https://x.com/skelneko/status/1930219472591434005 |
| Angelina_L | 0x70d80eb5390C7872233D4a9B0b0d74Ea749294c1 | https://etherscan.io/verifySig/274395 | https://x.com/helterswellter/status/1929818306233414023 |


## 2.9 Community Staking Module Committee

**Address:** [`0xC52fC3081123073078698F1EAc2f1Dc7Bd71880f`](https://app.safe.global/settings/setup?safe=eth:0xC52fC3081123073078698F1EAc2f1Dc7Bd71880f)

**Purpose of the multisig:** The Community Staking Module Committee uses this multisig to perform operations: report facts of MEV stealing committed by CSM Node Operators,
cancel MEV stealing penalty if needed, start EasyTracks to settle MEV stealing penalty, switch the bond curve for the particular Node Operator or reset it to the default one,
pause CSModule, CSAccounting, and CSFeeOracle in case of emergency via CS GateSeal.

**Quorum:** 4/6

**Forum topics:**\
[Community Staking Module Committee](https://research.lido.fi/t/csm-committee-creation/8333)\
[Community Staking Module](https://research.lido.fi/t/community-staking-module/5917)

**Snapshot:**\
[Lido Community Staking Module Mainnet Release Setup](https://snapshot.org/#/lido-snapshot.eth/proposal/0xd0d7bfd68f2241524dbb14ae6fe0e8414b9fe3e0dcfc50641a8d28f0067d6693)\
[CSM v2 Final Rollout](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xc3f92bcdf8926cfa7528ca6a979c0fdce1e4d0cfaaa72dd6410a76a2e1e55766)

**Aragon:**\
[Omnibus vote #180 (items 20-26)](https://vote.lido.fi/vote/180) (CSM was added to the Lido on Ethereum protocol)\
[Omnibus vote #192 (items 1.34-1.59)](https://vote.lido.fi/vote/192) (upgrade to CSM v2)

**Roles** (corresponding roles were assigned to the MS during CSM deployment transactions):
- `REPORT_EL_REWARDS_STEALING_PENALTY_ROLE`: [0x79d54166a3df5ac9a73a053c043de0f6dd8ff7a0df2967c01be837925761c29d](https://etherscan.io/tx/0x79d54166a3df5ac9a73a053c043de0f6dd8ff7a0df2967c01be837925761c29d)
- `SET_BOND_CURVE_ROLE`: [0x7ddfa518a16581cb317fadd7da5bafe864bc3665c1a5f9a0a2ca8c183d71b565](https://etherscan.io/tx/0x7ddfa518a16581cb317fadd7da5bafe864bc3665c1a5f9a0a2ca8c183d71b565)
- `RESET_BOND_CURVE_ROLE`: [0xa8a3699744cb35895dae32d4810b1fb709f490e01448d3bba9c56ccfbc66eb8b](https://etherscan.io/tx/0xa8a3699744cb35895dae32d4810b1fb709f490e01448d3bba9c56ccfbc66eb8b)
- GateSeal sealing committee: [0x4baee8cc782ca8ca90729ca3f3af45f2fe9ed6c207358d0b3186552f43f4d679](https://etherscan.io/tx/0x4baee8cc782ca8ca90729ca3f3af45f2fe9ed6c207358d0b3186552f43f4d679)

**List of related contracts and roles:**

| Contract name                         | Contract address                                                                                                        | Multisig role |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------|---------------|
| Easy Track CSMSettleElStealingPenalty | [`0xF6B6E7997338C48Ea3a8BCfa4BB64a315fDa76f4`](https://etherscan.io/address/0xF6B6E7997338C48Ea3a8BCfa4BB64a315fDa76f4) | trustedcaller |
| CS GateSeal                           | [`0xE1686C2E90eb41a48356c1cC7FaA17629af3ADB3`](https://etherscan.io/address/0xE1686C2E90eb41a48356c1cC7FaA17629af3ADB3) | sealing_committee |


**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| madlabman | 0xdac96e602fbb38De089DaB03f7a37B70C4234221 | https://etherscan.io/verifySig/257503 | https://x.com/chtotonet/status/1841049313574531238 |
| Remus | 0x83eeccaf434ac9da6132ab1124afb755a2ea9266 | https://etherscan.io/verifySig/257515 | https://x.com/nameisremus/status/1840671350014218291 |
| enti| 0xfcfbafa0d5f5512c65dbb4c073fe4ee6dc3c4779 | https://etherscan.io/verifySig/257511| https://x.com/entigdd/status/1840691285180449003 |
| lanski | 0x6ac2df117c82f51bfdef1a249672b9a9ca6b3d86 | https://etherscan.io/verifySig/257500 | https://x.com/Pol_Lanski/status/1840659602083324379 |
| Eridian | 0x7afd3c7f16fdbb3adf331fcc20a585d768ecf60d | https://etherscan.io/verifySig/257510| https://x.com/EridianAlpha/status/1840661871516332220 |
| POSTHUMAN | 0xcbc39c37ee315e4a504cc1ad0d7956a76e20d90d | https://etherscan.io/verifySig/257507 | https://x.com/ponimajushij/status/1833486702062493757 |

## 2.10 Delegate Oversight Committee

**Address:** [`0x13600b9AEE86f8254969918B1E9ae6ea091b8727`](https://app.safe.global/home?safe=eth:0x13600b9AEE86f8254969918B1E9ae6ea091b8727)

**Purpose of the multisig:** This multisig receives and distributes grants from the LEGO Committee multisig within the Delegate Incentivization Program.

**Quorum:** 3/5

**Forum topic:** [Establish a Public Delegate Platform and Delegate Incentivization Program](https://research.lido.fi/t/establish-a-public-delegate-platform-and-delegate-incentivization-program/7858)

**Snapshot:** [Establish a Public Delegate Platform and Delegate Incentivization Program](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xa502cf80451192672313911ce558e74799626da3b3b66130e21c6cd19707e584)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| JanyaK | 0x30E317df005B5599e372400bf360895A027120dc | https://etherscan.io/verifySig/262371 | https://x.com/tariquin/status/1867250911367901391?s=46&t=7kM2xidXSXA93Mqt0Ezzmg |
| Olga K | 0xcb408B2c5e45E43DF0F3B2d665873F805D435598 | https://etherscan.io/verifySig/262614 | https://x.com/itmamuramgk28/status/1868670001957548046 |
| Marcela| 0x55a38242cc8d3E1a2276585146f036b64CBC4A45 | https://etherscan.io/verifySig/262716| https://x.com/0xMarcela/status/1869171438630174818 |
| kadmil | 0x9a3f38af97b791c85c043d46a64f56f87e0283d4 | https://etherscan.io/verifySig/262920 | https://x.com/kadmil_eth/status/1870068912122966385 |
| Charlie | 0x9f89273A038c2B134713dE41b1947217a8d21464 |https://etherscan.io/verifySig/263010 | https://x.com/charliecfeng/status/1870966714353271036 |

## 2.11 Network Expansion Committee

A Committee without multisig.

**Purpose of the Committee:** Network Expansion Committee is assigned to formally recognize (w)stETH token bridging endpoints and denominations on new networks as canonical, acting on behalf of Lido DAO. NEC decisions require the unanimous support of committee members. Once the decision has been made, it must be announced on the forum by a committee member, along with the reasons for the decision and any supporting materials (audits, deployment reviews, and so on). The prerequisite for committee voting is having a reputable third party to evaluate the on-chain deployment matching the audited codebase along with QA tests for the entire user flow. NEC decisions are put on hold for 5 days after forum posting. If there are no objections, the decision stands. If objected to within this time, the decision is disregarded and a snapshot vote follows.

**Quorum:** 4/4

**Forum topics:**\
[Establishing the Network Expansion Committee](https://research.lido.fi/t/establishing-the-network-expansion-committee/8788)\
[Empowering Lido Ecosystem Foundation to Lead Bridge-Related Partnerships](https://research.lido.fi/t/empowering-lido-ecosystem-foundation-to-lead-bridge-related-partnerships/10794)

**Snapshot:**\
[Establish the Network Expansion Committee (NEC)](https://snapshot.org/#/s:lido-snapshot.eth/proposal/0x7cdf1af7cfeb472ae202c45fb6d7e952bb34bfcbc82113549986b2bc2d5f54c5)\
[Empowering Lido Ecosystem Foundation to Lead Bridge-Related Partnerships](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xf842517c2ffba082efac87ec43365e86548adb38e24d1446d850c7d7b979c423)

**List of committee members:**

| Name | Role |
| --- | --- |
| vtrush | QA |
| arwer13 | Tech |
| Mariya_Muzyko | Product |
| nikita.p | DAO Ops |

## 2.12 Lido Labs BORG Foundation

**Address:** [`0x95B521B4F55a447DB89f6a27f951713fC2035f3F`](https://app.safe.global/settings/setup?safe=eth:0x95B521B4F55a447DB89f6a27f951713fC2035f3F)

**Purpose of the multisig:** The Lido Labs BORG Foundation utilizes this multisig to hold and manage the Lido Labs BORG’s operational budget. 
Multisig enables the reception of stablecoins (listed in the AllowedTokensRegistry, use [getAllowedTokens](https://etherscan.io/address/0x4ac40c34f8992bb1e5e856a448792158022551ca#readContract#F6) to see the list) from the Lido DAO Treasury by Easy Track.

**Quorum:** 5/9

**Forum topics:**\
[Establishment of Lido Labs BORG Foundation as a Lido-DAO-Adjacent Foundation](https://research.lido.fi/t/establishment-of-lido-labs-borg-foundation-as-a-lido-dao-adjacent-foundation/9344)\
[[EGG] Lido Labs BORG Foundation Grant Funding Request](https://research.lido.fi/t/egg-lido-labs-borg-foundation-grant-funding-request/9708)

**Snapshots:**\
[Establishment of Lido Labs BORG Foundation as a Lido-DAO-Adjacent Foundation](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xdf648307e68415e7b5cf96c6afbabd696c1731839f4b4a7cf5cb7efbc44ee9d6)\
[[EGG] Lido Labs BORG Foundation Grant Funding Request (Apr-Dec 2025)](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xb58527a05581849b3890ff226fa30f2b5e19f7742fe8f4f94e6c953fe0055c0e)

**Aragon:**\
[Omnibus vote #184, item 2](https://vote.lido.fi/vote/184)

**Easy Track contracts and roles:**

| Factory | Contract name           | Contract address | Multisig role |
|-------------------|-------------------------|-----------------|---------------|
| Labs BORG Foundation operational funds stablecoins | TopUpAllowedRecipients  | [`0xE1f6BaBb445F809B97e3505Ea91749461050F780`](https://etherscan.io/address/0xE1f6BaBb445F809B97e3505Ea91749461050F780)| trustedcaller |

The full list of related contracts is available [here](https://docs.lido.fi/deployed-contracts/#easy-track-factories-for-token-transfers).

**List of signers:**

| Name | Address | Verification | Public verification                                    |
| --- | --- | -- |--------------------------------------------------------|
| Olga_K | 0xcb408B2c5e45E43DF0F3B2d665873F805D435598 | https://etherscan.io/verifySig/266532 | https://x.com/itmamuramgk28/status/1886706479673065738 |
| Angelina_L | 0x30ce91eb74e56d0df97c78774b3aca2144f6ad32 | https://etherscan.io/verifySig/266535 | https://x.com/helterswellter/status/1886725128693731410  |
| dgusakov | 0x992ce4eec8288274f60880c7770dda265fcce610 | https://etherscan.io/verifySig/266612 | https://x.com/d_gusakov/status/1887037067001020872         |
| Juan | 0xB8Dcad009E533066F12e408075E10E3a30F1f15A | https://etherscan.io/verifySig/266672 | https://x.com/juanbugeth/status/1887267565807845481       |
| krogla | 0x000000dfe832ccd7a4011a1fca34602c9a598353 | https://etherscan.io/verifySig/267077 | https://x.com/_krogla/status/1890331086091141171 |
| Alex_L | 0xE61F7F15f91cdb58008cAeaea46E2d3f2BaFF68c | https://etherscan.io/verifySig/267399 | https://x.com/Al_lykov/status/1892928521825059308 |
| UniteTheClans | 0x81ca68f085282434d15c09619360d6513710a979 | https://etherscan.io/verifySig/274605 | https://x.com/0xeferium_m8/status/1930605132573515936 |
| GrStepanov | 0xf15f39f29b2C57Ab77745E73FD92f33aDA024791 | https://etherscan.io/verifySig/278586 |  https://x.com/shalfeyshur/status/1957736329296437494 |
| Elena_S | 0xb95fda03a90290bd5853c79796a768e37130d193 | https://etherscan.io/verifySig/279001 | https://x.com/Elen0sh/status/1960254652479414583 |

**Original List of Signers:**\
https://lido.mypinata.cloud/ipfs/bafkreie5dqoxz4yuknlv3y3bnudtje5c5g655z7732xl6lsqyxjkg7hvii

**Lido Labs BORG Foundation Key Documents:**

* [Bylaws - describes operational processes](https://lido.mypinata.cloud/ipfs/bafybeiai3w76yf2mzswnt3azpwvpwhjqjnrukzo4qs43qoca5czzlfn4mm);
* [Memorandum and Articles of Association](https://ipfs.io/ipfs/bafybeibx47kkyzi56fojbhbndppbqmn6gwtrgcyynj2dy4tocgufkazqxq);
* [Multisignature Participation Agreement](https://ipfs.io/ipfs/bafybeidurwhooxckhgkiuf7z2at6l26yvdidnarbgk3jtcsyxywmwzxixy).


## 2.13 Lido Ecosystem BORG Foundation

**Address:** [`0x55897893c19e4B0c52731a3b7C689eC417005Ad6`](https://app.safe.global/settings/setup?safe=eth:0x55897893c19e4B0c52731a3b7C689eC417005Ad6)

**Purpose of the multisig:** The Lido Ecosystem BORG Foundation utilizes this multisig to hold and manage the Lido Ecosystem BORG’s operational budget. 
Multisig enables the reception of stablecoins (listed in the AllowedTokensRegistry, use [getAllowedTokens](https://etherscan.io/address/0x4ac40c34f8992bb1e5e856a448792158022551ca#readContract#F6) to see the list) from the Lido DAO Treasury by Easy Track.

**Quorum:** 4/7

**Forum topics:**\
[Establishment of Lido Ecosystem BORG Foundation as a Lido-DAO-Adjacent Foundation](https://research.lido.fi/t/establishment-of-lido-ecosystem-borg-foundation-as-a-lido-dao-adjacent-foundation/9345)\
[[EGG] Lido Ecosystem BORG Foundation Grant Funding Request](https://research.lido.fi/t/egg-lido-ecosystem-borg-foundation-grant-funding-request/9706)

**Snapshots:**\
[Establishment of Lido Ecosystem BORG Foundation as a Lido-DAO-Adjacent Foundation](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x7f72f12d72643c20cd0455c603d344050248e75ed1074c8391fae4c30f09ca15)\
[[EGG] Lido Ecosystem BORG Foundation Grant Funding Request (Apr-Dec 2025)](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x90e2f9926e37867d2ef319a8ef7a0257bb5695086b64b88b43b43f00959a0047)

**Aragon:**\
[Omnibus vote #184, item 2](https://vote.lido.fi/vote/184)

**Easy Track contracts and roles:**

| Factory | Contract name           | Contract address | Multisig role |
|-------------------|-------------------------|-----------------|---------------|
| Ecosystem BORG Foundation operational funds stablecoins | TopUpAllowedRecipients  | [`0xf2476f967C826722F5505eDfc4b2561A34033477`](https://etherscan.io/address/0xf2476f967C826722F5505eDfc4b2561A34033477)| trustedcaller |

The full list of related contracts is available [here](https://docs.lido.fi/deployed-contracts/#easy-track-factories-for-token-transfers).

**Current List of signers:**

| Name | Address | Verification | Public verification                                    |
| --- | --- | -- |--------------------------------------------------------|
| Olga_K | 0x85029FB6393416c54ea8Fb04f2bf2BBe3cA16E23 | https://etherscan.io/verifySig/266533 | https://x.com/itmamuramgk28/status/1886711010263749099 |
| Elena_S | 0x07Bd812CF9c70538d78Cd4faaBbb5C1d8688d173 | https://etherscan.io/verifySig/266617 | https://x.com/Elen0sh/status/1887061240549126642  |
| Mol_Eliza | 0x21b82AA7149c8Fd0562E78b740937442FfD43094 | https://etherscan.io/verifySig/266655 | https://x.com/MaxMolEliza/status/1887170206675468338        |
| pipistrella | 0x5da409e1cbDABeC67471dB01Ff956f804bb8879f | https://etherscan.io/verifySig/266776 | https://x.com/ppclunghe/status/1887785137024176411       |
| zuzu_eeka | 0x004812da927b5DCd07e7329609eDD75E25d2d295 | https://etherscan.io/verifySig/266954 | https://x.com/zuzu_eeka/status/1889316339350659472 |
| Susanna_MV | 0x27a3fc3d99eace1fdca71900a72079f6c3a4b4f8 | https://etherscan.io/verifySig/267541 | https://x.com/MamenSusan87135/status/1894315942991335668 |
| adcv | 0xcc692077c65dd464caa7e7ae614328914f8469b3 | https://etherscan.io/verifySig/268854 | https://x.com/adcv_/status/1901924468043260399 |

**Original List of Signers:**\
https://lido.mypinata.cloud/ipfs/bafkreigan3ankyy6cfzbpakpiitjnmh6jw3lhtomb4zjm27wcgjdhdtvci

**Lido Ecosystem BORG Foundation Key Documents:**

* [Bylaws - describes operational processes](https://ipfs.io/ipfs/bafybeih22pbr7joo7br2q5ygdg52uvy45dpo5knae5kg5qqfhsxllboenm);
* [Memorandum and Articles of Association](https://ipfs.io/ipfs/bafybeihry3mfaxirlzrbnnwzk3vfo25hetlgcoyllnc3jstgtwru3l6lbq);
* [Multisignature Participation Agreement](https://ipfs.io/ipfs/bafybeieoowqqkwomdtcjaneyofxgib5qmbag7g4asdnkolvjecdu3uba6q).

## 2.14 Auxiliary Proposer Mechanisms Committee

A Committee without multisig.

**Purpose of the Committee:**\
The Auxiliary Proposer Mechanisms (APM) Committee is responsible for reviewing, approving, and maintaining the list of approved APMs that Lido Node Operators can use. The committee ensures that only proposer-layer mechanisms aligned with Ethereum’s roadmap, Lido’s values, and robust security standards are allowed, and defines the principles for their fair and appropriate use.\
The committee operates on an ad-hoc basis and follows transparent, publicly accessible documentation and procedures. Decisions with significant strategic or financial implications are escalated to the DAO for further consideration.\
Each committee decision is publicly disclosed on the Lido Research Forum, along with the underlying rationale. Upon publication, a mandatory 7-calendar-day review period begins. If no objections are raised during this time, the decision is considered ratified. If some objections are submitted, the decision is paused, and the involved parties are expected to engage and resolve them. If no resolution is achieved within an additional 7-calendar-day period, the decision is considered rejected by default.

**Quorum:** 5/6

**Forum topics:**\
[Introducing the APM Framework: Mechanisms, Protocols, and Sidecars](https://research.lido.fi/t/introducing-the-apm-framework-mechanisms-protocols-and-sidecars/9884)\
[Establishing the APM Committee](https://research.lido.fi/t/establishing-the-apm-committee/9998)

**Snapshot:**\
[Establishment of the Auxiliary Proposer Mechanisms Committee](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xf7630cd2bfe47e892f8293cd68be277fefc33ba19f43c756747fe1113456ac4b)

**List of committee members:**

| Name               | Role                                        |
|--------------------|---------------------------------------------|
| Gabriella Sofia	   | Lido NOM contributor                        |
| Ivan Metrikin      | Lido Tech contributor                       |
| Drew Van der Werff | Commit-Boost and Fabric steward             |
| Fredrik Svantes    | security expert                             |
| Sébastien Rannou   | representing Kiln, Lido Node Operator       |
| Kam Benbrik        | representing Chorus One, Lido Node Operator |

Additionally, the committee also includes consulting participant, which abstain from voting:
- Justin Traglia - Ethereum Foundation

## 2.15 Dual Governance Committees

### 2.15.1 Dual Governance Emergency Activation Committee: Ethereum

**Address:** [`0x8B7854488Fde088d686Ea672B6ba1A5242515f45`](https://app.safe.global/home?safe=eth:0x8B7854488Fde088d686Ea672B6ba1A5242515f45)

**Purpose of the multisig:** This committee has the one-off and time-limited right to activate an adversarial emergency mode if they see a scheduled proposal that was created or altered due to a vulnerability in the DG contracts or if governance execution is prevented by such a vulnerability. Active until emergency protection end date of `EmergencyProtectedTimelock` contract

**Quorum:** 4/7

**Forum topic:** [Lido Dual Governance Emergency Committee](https://research.lido.fi/t/lido-dual-governance-emergency-committee/10049)

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**Contracts and Roles:**

###### EmergencyProtectedTimelock :[`0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316`](https://etherscan.io/address/0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316)
* EmergencyActivationCommiittee

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [isaacpatka](https://research.lido.fi/u/isaacpatka) | 0xA032E9E70c6200b7e51fCdeF15B611fC38833Cc1 | https://etherscan.io/verifySig/273322 | https://x.com/isaacpatka/status/1923044395802148945 |
| [Shelly](https://research.lido.fi/u/shelly/) | 0x8f929Defb7638B5ee6390bdd3bf87B266Df5EDf4 | https://etherscan.io/verifySig/273321 | https://x.com/ShellyGr15/status/1923086313152004562 |
| [DZahar0v](https://research.lido.fi/u/dzahar0v) | 0x237Cddf3aA765260cf6b60E064065Da7c3Aa1559 | https://etherscan.io/verifySig/273320 | https://x.com/Dmitriy17042471/status/1923087348683636922 |
| [tamtamchik](https://research.lido.fi/u/tamtamchik) | 0xcfc7834eb929e7E621F0Ba71d421A27Eddf6DDA1 | https://etherscan.io/verifySig/273164 | https://x.com/tamtamchik/status/1923100439433650454 |
| [Josef_Ackee](https://research.lido.fi/u/josef_ackee) | 0x9bdFf3B294400A6a5D56647872d4035C944C10ce | https://etherscan.io/verifySig/273318 | https://x.com/jgattermayer/status/1923112937771675893 |
| [alex_t](https://research.lido.fi/u/alexander_tarelkin) | 0x62c89F5768D0FeC0915fb614C5eDd9fdeaA2A3fd | https://etherscan.io/verifySig/273317 | https://x.com/bulbozaur42/status/1923430375830815188 |
| [infloop](https://research.lido.fi/u/infloop) | 0xAe0E06b1B5ecB80f157A7DB8A7c9E83fC1720711 | https://etherscan.io/verifySig/273328 | https://x.com/Infinitum_loop/status/1924481479691608353 |

### 2.15.2 Dual Governance Emergency Execution Committee: Ethereum

**Address:** [`0xC7792b3F2B399bB0EdF53fECDceCeB97FBEB18AF`](https://app.safe.global/home?safe=eth:0xC7792b3F2B399bB0EdF53fECDceCeB97FBEB18AF)

**Purpose of the multisig:** This committee has the exclusive right to execute scheduled proposals while emergency mode is active and the one-off and time-limited right to reset the governance of `EmergencyProtectedTimelock` to emegency governance while emergency mode is active.

This committee has the same list of participants as Dual Governance Emergency Activation Committee, but the quorum is stricted to 5 of 7

**Quorum:** 5/7

**Forum topic:** [Lido Dual Governance Emergency Committee](https://research.lido.fi/t/lido-dual-governance-emergency-committee/10049)

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**Contracts and Roles:**

###### EmergencyProtectedTimelock :[`0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316`](https://etherscan.io/address/0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316)
* EmergencyExecutionCommiittee

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| [isaacpatka](https://research.lido.fi/u/isaacpatka) | 0xA032E9E70c6200b7e51fCdeF15B611fC38833Cc1 | https://etherscan.io/verifySig/273322 | https://x.com/isaacpatka/status/1923044395802148945 |
| [Shelly](https://research.lido.fi/u/shelly/) | 0x8f929Defb7638B5ee6390bdd3bf87B266Df5EDf4 | https://etherscan.io/verifySig/273321 | https://x.com/ShellyGr15/status/1923086313152004562 |
| [DZahar0v](https://research.lido.fi/u/dzahar0v) | 0x237Cddf3aA765260cf6b60E064065Da7c3Aa1559 | https://etherscan.io/verifySig/273320 | https://x.com/Dmitriy17042471/status/1923087348683636922 |
| [tamtamchik](https://research.lido.fi/u/tamtamchik) | 0xcfc7834eb929e7E621F0Ba71d421A27Eddf6DDA1 | https://etherscan.io/verifySig/273164 | https://x.com/tamtamchik/status/1923100439433650454 |
| [Josef_Ackee](https://research.lido.fi/u/josef_ackee) | 0x9bdFf3B294400A6a5D56647872d4035C944C10ce | https://etherscan.io/verifySig/273318 | https://x.com/jgattermayer/status/1923112937771675893 |
| [alex_t](https://research.lido.fi/u/alexander_tarelkin) | 0x62c89F5768D0FeC0915fb614C5eDd9fdeaA2A3fd | https://etherscan.io/verifySig/273317 | https://x.com/bulbozaur42/status/1923430375830815188 |
| [infloop](https://research.lido.fi/u/infloop) | 0xAe0E06b1B5ecB80f157A7DB8A7c9E83fC1720711 | https://etherscan.io/verifySig/273328 | https://x.com/Infinitum_loop/status/1924481479691608353 |

### 2.15.3 Dual Governance Reseal Committee: Ethereum

**Address:** [`0xFFe21561251c49AdccFad065C94Fb4931dF49081`](https://app.safe.global/home?safe=eth:0xFFe21561251c49AdccFad065C94Fb4931dF49081)

**Purpose of the multisig:** This committee has the right to extend temporarily paused contracts into a permanent pause or resume them if the following conditions are met:

- The contracts are paused for a limited duration, not indefinitely.
- The Dual Governance system is not in the Normal state.

**Quorum:** 5/6

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**Contracts and Roles:**

###### Dual Governance :[`0xcdF49b058D606AD34c5789FD8c3BF8B3E54bA2db`](https://etherscan.io/address/0xcdF49b058D606AD34c5789FD8c3BF8B3E54bA2db)
* resealCommittee

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| ajbeal | 0x5a409567bCa7459b3aC7e6E5a3F1a3C278071b71 | Sig Hash: 0x848f5174e88b653e9353f5a46c8dec871b2395a06be8b0b29c221c1ab4f43a8b5fc913c091d0389382879c49ff96750a86efd5806f7223797c31ca01868ec23c01 | https://twitter.com/ajbeal/status/1655876306771365888?s=20 |
| eboadom | 0xA39a62304d8d43B35114ad7bd1258B0E50e139b3 | https://etherscan.io/verifySig/17877 | https://twitter.com/eboadom/status/1656002911854292993 |
| michwill | 0xFe45baf0F18c207152A807c1b05926583CFE2e4b | Sig Hash: 0x44fc2bce69486ea826e1aaeb40878f9a8b038d5f0c8bd0ea9038fee7fca553005adfcd9d64172cacd2e7f1c11dc7e9b36c0f18916ed731e56ffa89feb95c8ae500 | https://twitter.com/newmichwill/status/1656597340780625920?s=20 |
| thedzhon  | 0x59f8d74fe49d5ebeac069e3baf07eb4b614bd5a7 | https://etherscan.io/verifySig/40382 | https://twitter.com/e330acid/status/1778451429172080726 |
| George | 0x912e21CdA3D7012146da4Df33309d860a9eb0bEb | https://etherscan.io/verifySig/17866 | https://twitter.com/george_avs/status/1655919930749976578 |
| kadmil | 0x9A3f38AF97b791C85c043D46a64f56f87E0283D4 | https://etherscan.io/verifySig/17851 | https://twitter.com/kadmil_eth/status/1655865828544266242 |

### 2.15.4 Dual Governance Tiebreaker Committees: Ethereum

**Address:** [`0xf65614d73952Be91ce0aE7Dd9cFf25Ba15bEE2f5`](https://etherscan.io/address/0xf65614d73952Be91ce0aE7Dd9cFf25Ba15bEE2f5)

The Tiebreaker Committee includes three subcommittees covering different interest groups within the Ethereum community. The approval from a supermajority of sub-committees is required to execute a pending proposal. The approval by each subcommittee requires the majority support within the subcommittee.

The committee gains its power only under the specific conditions of the deadlock (see below), and can only perform the following actions:

 - Execute any pending proposal submitted by the DAO to DG (i.e. bypass the DG dynamic timelock).
 - Unpause any of the paused protocol contracts.

The Tiebreaker committee can perform the above actions, subject to a timelock of TiebreakerExecutionTimelock days, if any of the following two conditions is true:

Tiebreaker Condition A: Governance state is Rage Quit
and protocol withdrawals are paused for a duration exceeding TiebreakerActivationTimeout.
Tiebreaker Condition B: the last time governance exited Normal or Veto Cooldown state was more than TiebreakerActivationTimeout days ago.

**Contracts and Roles:**

###### Dual Governance :[`0xC1db28B3301331277e307FDCfF8DE28242A4486E`](https://etherscan.io/address/0xC1db28B3301331277e307FDCfF8DE28242A4486E)
* tiebreakerCommittee

### 2.15.4.1 Dual Governance Tiebreaker Committees. Ethereum Ecosystem Subcommittee: Ethereum

**Address:** [`0xBF048f2111497B6Df5E062811f5fC422804D4baE`](https://etherscan.io/address/0xBF048f2111497B6Df5E062811f5fC422804D4baE)

**Purpose of the multisig:** This committee is part of Dual Governance Tibreaker Committee. It could vote for Core Tiebreaker committee action as participant 

**Quorum:** 3/5

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Jorge of Nethermind | 0x80B2D9FA613c35Ec52B0dA5D84e6A819bcc5e369 | https://etherscan.io/verifySig/273436 | https://x.com/0xjorgeth/status/1925082175931593179 |
| Sigma Prime | 0xEC7ABf73f339361ecCA951E1746C90a3e6205BFC | https://etherscan.io/verifySig/273315 | https://x.com/sigp_io/status/1924440542076883107 |
| mteam | 0xb04b6fb471e766d7f21a6aa0e4e25b2aea0a75ab | https://etherscan.io/verifySig/273429 | https://x.com/mteamisloading/status/1925023188481646982 |
| Michael_Ippolito  | 0x60BDa95a40d5536303BFcf84D679ca461A23398d | sigHash: 0x55228d86025525135644be0b1fb9ba06db7a665a0be7c2a35a1129b031086d1d37a24d59ab71ede3f0a0d98f9770eca6acc2904f3cda4d3b0f4e5f923dd9e45e1c |  |
| polar | 0x5d60F5d653Cc318d1f0ABacd83eD4feeAa6e5804 | https://etherscan.io/verifySig/273447 | https://farcaster.xyz/polar/0x663dcaad |

### 2.15.4.2 Dual Governance Tiebreaker Committees. Builders Subcommittee: Ethereum

**Address:** [`0x3D3ba54D54bbFF40F2Dfa2A8e27bD4dE3dab2951`](https://etherscan.io/address/0x3D3ba54D54bbFF40F2Dfa2A8e27bD4dE3dab2951)

**Purpose of the multisig:** This committee is part of Dual Governance Tibreaker Committee. It could vote for Core Tiebreaker committee action as participant 

**Quorum:** 3/5

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| andy_koz | 0x805fa0f79dc0ddcd73dcbc23487d2d5bd77de598 | sigHash: 778925c21cea7d3fda14bdc7cb68a67cfc7317ed1223f4782707a6c6b8f4a4e004ca4bf55c482a511414597a1e483f07d6c9d2942d5b9c8fe43bcbf180ae88ad1c | https://x.com/andy_koz/status/1923300897746030788 |
| dennisonbertram | 0x49769c3443c74f144991ca560ba5f635581b8176 | sigHash: c074644bac4f5335441618c3f77b868c505e032baf172d8c24f373e48c4d575e37523bfa79406724315a26dd31a9ada7e630729cf3cc9207e09086b925bfe3631b |  |
| koeppelmann | 0x9A921867EbB579D137184b397E7D087f1ae716fd | sigHash: 000b2074661792990ca4b7c3b17b5b5e70660f883d3a1e723334d1d29cf658866cbab193707f2cecb3e0913efb523fc5bc08800877e8ef349868cb6c15d0881a1b | https://x.com/koeppelmann/status/1924570381181989239 |
| BogdanHabic  | 0x81000e270B4f66B8666544E8FEc073e0a23FFf00 | sigHash: f70a5b5d9029475464b35ff4b9b9c25102e1055c3a4660cd9b866df9ae1e44172fa2f67b86aa39a4e29f30e1a16deeb6044e77827ec859d995748f8861e4c8441c | https://x.com/BogdanHabic/status/1924586022974722286 |
| Leuts | 0xD8a9072D82a28307279aC0aD3c97Cb61bEe67952 | https://etherscan.io/verifySig/273483 | https://x.com/A_Leutenegger/status/1924882733014110396 |

### 2.15.4.3 Dual Governance Tiebreaker Committees. Node Operators Subcommittee: Ethereum

**Address:** [`0xDBfa0B8A15a503f25224fcA5F84a3853230A715C`](https://etherscan.io/address/0xDBfa0B8A15a503f25224fcA5F84a3853230A715C)

**Purpose of the multisig:** This committee is part of Dual Governance Tibreaker Committee. It could vote for Core Tiebreaker committee action as participant 

**Quorum:** 5/7

**Snapshot:** [LIP-28: Dual Governance — Implementation, Parameters, Committees](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x26a66c9b91ff46aeac74b6f6714467993edc6840a8f292fb5c1366fc44dec2a6)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Launchnodes | 0x9837b0Db0b733DED04D96a0A25Ba1E414A6C4c08 | https://etherscan.io/verifySig/273475 | https://x.com/launchnodes/status/1923359338384547912 |
| Florian Staking Facilities | 0xDBD124e898839ec8C829d806C0328f069d1bB810 | https://etherscan.io/verifySig/273214 | https://x.com/MangoLissBNassi/status/1923378667930943609 |
| linuxcity Gateway.fm | 0xf8Bfa395744Cb25fa4368Ffe2344Dc35546092d9 | https://etherscan.io/tx/0xb9e18899b57134cd8eca6c4d733112f9ef5fe30390b330e2f9f10fa178044157 | https://x.com/linuxcity/status/1924185313766781084 |
| Chorus One  | 0x8103E9eDC04d87F6DA24A3a0c7778daE689E9D63 | https://etherscan.io/verifySig/273414 | https://x.com/ChorusOne/status/1924905920963785171 |
| Morten Nansen | 0xfcd02c040cea45dc6cec3e24f1d3946fce7077b0 | https://etherscan.io/verifySig/273439 | https://x.com/mrfylkesnes/status/1925095334797308243 |
| DSRV | 0xD7cABE01709c7E36e9D1fb3248A19b525578a1Fc | https://etherscan.io/verifySig/273446 | https://x.com/hyungkyu_hqueue/status/1925152842907807861 |
| P2P | 0x8ed4dfd3A610CCF1FB45e797bf5D8e0f93084F22 | https://etherscan.io/verifySig/273444 | https://x.com/P2Pvalidator/status/1925197289389261218 |

## 2.16 stVaults Committee

**Address:** [`0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF`](https://app.safe.global/settings/setup?safe=eth:0x18A1065c81b0Cc356F1b1C843ddd5E14e4AefffF)

**Purpose of the multisig:** The committee is established to ensure protocol security and resilience, and enable stake growth and DAO fee efficiency under the stVault risk framework.
Committee's multisig is designated to configure stVaults and/or Node Operator Tiers, within the confines of the Easy Track optimistic governance process: set the reserve ratio for specific tiers or vaults, define the default and custom tier grids for node operators, set DAO fee values for specific vaults and for tiers within a given node operator’s grid, manage bad debt compensation  between vaults/tiers in complex cases like mass slashing.

**Quorum:** 3/5

**Snapshot:** [Establish the stVaults Committee](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x0e8b53944051321d2cedf8881b546427bc6a22c9fe16f7d150af62fd837ff7da)

**List of signers:**

| Name | Address | Verification | Public verification |
| --- | --- | --- | --- |
| Mol_Eliza | 0x21b82aa7149c8fd0562e78b740937442ffd43094 | https://etherscan.io/verifySig/280352 | - |
| mikgur | 0xcD0cDa37f68a6758f86a4e2910E60174af1190B5 | https://etherscan.io/verifySig/280076 | - |
| Marin | 0x04e7c0350241b818ee5c92cc260008c9898f41cf | https://etherscan.io/verifySig/274497 | - |
| KimonSh | 0xDbB7D7941d1340CB3ba862dF3A0f18084b5a69Ad | https://etherscan.io/verifySig/280390 | - |
| dmitrii_v | 0x512B58efaef534Af685F7638c177B927650eF995 | https://etherscan.io/verifySig/280008 | - |

## 2.17 Bridging Security Committee

A Committee without multisig.

**Purpose of the Committee:** The committee is established to act as a counterbalance and a safeguard on behalf of the DAO, ensuring that bridge-related agreements protect the long-term integrity of the protocol.

**Quorum:** 4/4

**Forum topics:**\
[Empowering Lido Ecosystem Foundation to Lead Bridge-Related Partnerships](https://research.lido.fi/t/empowering-lido-ecosystem-foundation-to-lead-bridge-related-partnerships/10794)

**Snapshot:**\
[Empowering Lido Ecosystem Foundation to Lead Bridge-Related Partnerships](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xf842517c2ffba082efac87ec43365e86548adb38e24d1446d850c7d7b979c423)

**List of committee members:**

| Name | Role |
| --- | --- |
| TheDZhon | Tech |
| tamtamchik | Tech |
| psirex | Tech |
| zuzu_eeka | DAO Ops |
