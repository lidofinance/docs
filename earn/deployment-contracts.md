---
# Limit TOC to h2 only — prevents repetitive "Actors" / "Addresses" h3 headings
# inside <details> blocks from cluttering the right-side navigation menu
toc_max_heading_level: 2
---

# Deployments

Earn Vaults: user-facing

<details>

<summary>earnETH - EarnETH</summary>

Smart contracts of earnETH

| Component                  | Address                                    |
| -------------------------- | ------------------------------------------ |
| Vault                      | 0x6a37725ca7f4CE81c004c955f7280d5C704a249e |
| DepositQueue (ETH)         | 0x1db7094Ef0D994B0b62f6Cd67dB801ad194999A8 |
| SyncDepositQueue (ETH)     | 0x4a1d5dd96d6AA2Ba82e748E941d4425cb117dE84 |
| DepositQueue (WETH)        | 0x3Fc48660d02e59fBedD0a5Cc18a5580D1f8dD6A4 |
| SyncDepositQueue (WETH)    | 0x3B374Be4c02D7367a1fDDCcDbc2EAA708BB220a0 |
| DepositQueue (wstETH)      | 0xe39EED9A454C4918F8d0682062777cB251cd513F |
| SyncDepositQueue (wstETH)  | 0xD39ceac8EAfc9c8dBf52319B900CA6623730d4BA |
| RedeemQueue (wstETH)       | 0x095bFAca9f1c6F2B063Cd67C6d6bfcd0c3aaB7b4 |
| DepositQueue (GG)          | 0x411172F1E5310d03b38128F2a294F2e33c691B30 |
| SyncDepositQueue (GG)      | 0xDc6D33047F57fCb54A6944889c5A2779EAB355a2 |
| DepositQueue (strETH)      | 0x268ea1cc674cdaE200c4609E7b09d03Dc618E663 |
| SyncDepositQueue (strETH)  | 0x2161D9e85C73e7753f6Be8d0D5afBEAf416A8C58 |
| DepositQueue (DVstETH)     | 0x4bDd2Ea1E20acb13f2758190c92a84175107A86f |
| SyncDepositQueue (DVstETH) | 0x07d82e01c73494F9b7965ED12eBDbF58E1057fBb |
| Oracle                     | 0xAda1f4c24603aB2fe5aBd35BCD12370e98A20358 |
| ShareManager               | 0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4 |
| FeeManager                 | 0xed4Fac879eE86F3aB0101993A3713e7cAA0488E1 |
| RiskManager                | 0xa2a4C4ecE27229aF51c546844AB752824Ccb557e |
| Subvault 0                 | 0xC5901C2481ca9C26398A9Da258b13717894bfebF |
| Verifier 0                 | 0xBc46B79d79fCac1F4232D4Da1BA31aCED0AABFE0 |
| Subvault 1                 | 0x7F515C80fA4C1FCFF34F0329141A9C3b20468FE5 |
| Verifier 1                 | 0xc0FC0B74923A80Af21B1E49633cAA309f432140F |
| Timelock controller        | 0x363Ba8843d06BA5968f55C26aB055162eDd62189 |
| OracleSubmitter            | 0xFbD83f7C531D35D99392a5A20bb5F1e75E97076e |

</details>

<details>

<summary>earnUSD - EarnUSD</summary>

Smart contracts of earnUSD

| Component               | Address                                    |
| ----------------------- | ------------------------------------------ |
| Vault                   | 0x8FFa4D9FBa523044429D2E51aC055726959942d8 |
| DepositQueue (USDC)     | 0xC6Ff9F9E3Fd2eBDD57EEA6f9300b6391185e92AA |
| SyncDepositQueue (USDC) | 0xC3EB084401c566ac20962A4f390F575F1D51e50A |
| RedeemQueue (USDC)      | 0xD574c925bc7B5281Be0e4EE432DC7e822214F6E9 |
| DepositQueue (USDT)     | 0x85Bf9D7d1Bbb747C797F45cB4d0f7Db49277ea97 |
| SyncDepositQueue (USDT) | 0x47c2d9732cF3cAE5B07A86927c305effb17829e1 |
| Oracle                  | 0x2e82daAacB1F56D1880b6c7c2a55a76fEa30b1B2 |
| ShareManager            | 0x974D2CD0584b22650B1C9617bb209c5196652c1A |
| FeeManager              | 0x5c07011BeD7e946a98787541E50581f424B8aea1 |
| RiskManager             | 0xCEFFe01b3e6e98d201EE00397Aa11225024a44fb |
| Subvault 0              | 0x0428130A1A62F007e2673486bFF52F529221b57A |
| Verifier 0              | 0x9a6302614aF86e92133192667bAa34E5244bF544 |
| Subvault 1              | 0xfd4667E97887473f8cD917Cf0eC4B29cEdDD75ce |
| Verifier 1              | 0xAC18cD2c0e02E15b3CFe6681352737CcDa4b19C1 |
| Timelock Controller     | 0xB72aaB45C796f6dc7f72Eda6Ba7F1111f12884CE |
| OracleSubmitter         | 0xEF3C091458fc6C9B979fF856aA1c93EAbF6467eE |

</details>

earnUSDc Vaults: operational

<details>

<summary>earnUSDc Ethereum - Conservative earnUSD Ethereum</summary>

### Actors

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0xD3CB3Bb74C23B09509102B91C95A076dd3694533 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Component             | Address                                    |
| --------------------- | ------------------------------------------ |
| SwapModule 0          | 0x53E137244d97C8262e0c307363860947623a2237 |
| Subvault 0            | 0xCFdE79D2fcCBaC4E9917B902272520868a2Ca914 |
| Verifier 0            | 0xAF8a14D83ea4cc213e4CA67fAaDaF65515e491a2 |
| Subvault 1            | 0x492fd2a675F9D8363B9E9314Dc957E4bBf94457c |
| Verifier 1            | 0xe265aAD364ba552011A8092c0D56dd8c45626ea9 |
| Vault                 | 0xbF9f76bA554eA5DAfBf736320792D87C1eE362aB |
| SyncDepositQueue USDC | 0x0A6861655e833502AEA0a682456132A7BD1C5031 |
| RedeemQueue USDC      | 0x6aAFF1f0e803baDEfb0E001c2EA4ED94baF5D589 |
| SyncDepositQueue USDT | 0x456Df89c181be1E94ded372BC83e3E2F5a30A82C |
| Oracle                | 0xae57a94f678823C4124c175376B4b3664c3D8FaD |
| ShareManager          | 0x7B5890a68b07d5089E817fD1D710804377E110a5 |
| FeeManager            | 0x2bf76Fcf9060feB355Dc0Cf9bEF69e340Ead338C |
| RiskManager           | 0x793858a7cEFc693643b57BF3F3F58Ec692d46774 |
| Timelock Controller   | 0x50Ea394B8836A21b92287d743FA2428C24163e32 |
| OracleSubmitter       | 0xcc1A2373c443670f14D703c8Df20D7AF778cAf9b |

</details>

<details>

<summary>earnUSDc Monad - Conservative earnUSD Monad</summary>

### **Actors**

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0xf168327c812343B5B05F93b5CFbdF36cb644a605 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### **Addresses**

| Component        | Address                                    |
| ---------------- | ------------------------------------------ |
| SwapModule 0     | 0x6558eCF6d19e84A3Ec03da36460d647c22236aA1 |
| Subvault 0       | 0x161761C4B0ffF56a81c200f4abBbD1A91abC7485 |
| Verifier 0       | 0x3F2148414A789e2B08dE2cE6e3B0FD739CE1B750 |
| Subvault 1       | 0x2c09A36C56884E7D159003c96c6163FFC5acC6A4 |
| Verifier 1       | 0x06e80eDeeEeA12f848722843F5209561DFAFff71 |
| Vault            | 0x01344cF9B0159E7b809Ce4c80B6A7ea64a23cd87 |
| Oracle           | 0xA309c6fbf70905C5eB0B285a505e74366a54441F |
| ShareManager     | 0x8e8cE03d7e24ba66498BCC6Fbf0d70165f096996 |
| FeeManager       | 0x959Da166E90517c1F839B6f8386b2bAFEB29f783 |
| RiskManager      | 0x29fD357b3f1285d2F0cbCdaBA7C4257CE5530711 |
| Timelock Control | 0xEcAb48A4970E514a02117189526cF46eFA66018d |
| OracleSubmitter  | 0x32501D9403fC0F4dDB4C0A42Bf9B9846225489be |

</details>

<details>

<summary>earnUSDc Base - Conservative earnUSD Base</summary>

### Actors

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0x158A4f139803CA7B2A1074ffc6dC1a7987E566D8 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Component           | Address                                    |
| ------------------- | ------------------------------------------ |
| Subvault 0          | 0x09fb07e46b7817950F0c15De539A8Fd16447709D |
| Verifier 0          | 0x2907D930181eaC9bBe24112b0c6D76d01c56d351 |
| Subvault 1          | 0x483177Ffa69433BB04c385248C53B47f426b9e9A |
| Verifier 1          | 0xAefa478c80C9163034F325f29dfE054bFA21148d |
| Vault               | 0xE3E95F153356d0C16C1F263BF039e82C6cdcfA28 |
| Oracle              | 0x79DcdcE2504301Ab8a1C0FF7de6FEC44B3B637eE |
| ShareManager        | 0x7c704172F3f28E0093b65390eDf0E480768A830b |
| FeeManager          | 0x4FD8e72bEA84dc3B947672E49734e457a196bbdb |
| RiskManager         | 0x6B2EaDFD25947b6eD2657f9DCb5bf4413113cc9E |
| Timelock Controller | 0x8849015861B1E54a0FD9E73956CD837540a51B7C |
| OracleSubmitter     | 0x94a110b121D2D277DE7e4AbB097C5E1476dc5d70 |

</details>

<details>

<summary>earnUSDc Hyper - Conservative earnUSD Hyper</summary>

### Actors&#x20;

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0xa72C923278529fc331c1A8542e2502F9bf92a5b1 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Name                | Address                                    |
| ------------------- | ------------------------------------------ |
| Subvault 0          | 0x84d85B50f872D1C0F237c6cbAE6FE04121c5c7b7 |
| Verifier 0          | 0xa90A9E9ff45b51589f69e47510b5e81DE186B14d |
| Subvault 1          | 0x3f3AA0A87B3F17976E942695e4E950f1778D9EC9 |
| Verifier 1 (old)    | 0xa90A9E9ff45b51589f69e47510b5e81DE186B14d |
| Verifier 1 (new)    | 0xfB9e94362164eDcD066EE0565779fFAD3bd1E762 |
| Vault               | 0x965e679672D7201C0702F81736AFF27FD0A8D766 |
| Oracle              | 0xCac3682271987A19Dc472d0a00512365130d9E7E |
| ShareManager        | 0x0A04FAE9E51E0f45B3274707DcbF1ec3a5B95bA7 |
| FeeManager          | 0x45DE33e0f59FfA6606B158EB7205F59341D8019E |
| RiskManager         | 0x97790068a7ae48bE6Ce043c4653A1e69b805Fa8A |
| Timelock Controller | 0xbaEe3d9435D7AD34d17e6CD0D3B0e75356E754Fd |
| OracleSubmitter     | 0x3169036c3F79c03C14a7496DD2016f5B059e17D8 |

</details>

earnUSDe Vaults: operational

<details>

<summary>earnUSDe Ethereum - Experimental earnUSD Ethereum</summary>

### Actors

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0x46137B2cE78FD950800b74408E6d0f8139145C19 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Component             | Address                                    |
| --------------------- | ------------------------------------------ |
| SwapModule 0          | 0x82419c84fd5E4ae074b798b65f33ed99AaE637b7 |
| Subvault 0            | 0x0D18b333A11DeD583537eAa9b447A3127A773049 |
| Verifier 0            | 0x71998AaAaFB62fE9028206915e765C289bEDd9A5 |
| Subvault 1            | 0x0e5f73fBaE6800e4b6E7fCEB77Ab514e3cA3379a |
| Verifier 1            | 0xb224bAf45430E4f7232f8f0EF1D303ad4F964Af0 |
| Subvault 2            | 0x019852c3f94327E5744d67B1cB55B65648DAF3ff |
| Verifier 2            | 0xd2Ba8e477EA06c75Fdf35A3D64cD97b50019E31a |
| Vault                 | 0xB6DB39C23158fE36B963d606daA0f59508566DC9 |
| SyncDepositQueue USDC | 0x308256117928D9bDc874385D5e648494B0e41db5 |
| RedeemQueue USDC      | 0xf77093771a42F7079206bFb6f803c293856cF961 |
| SyncDepositQueue USDT | 0xD6451570af3D2936cEDE82139a963b18d7484beD |
| Oracle                | 0x6e1B7c2472a9696C31C7be488A9ECA298943d39C |
| ShareManager          | 0x850CAFf16081d666194dc74A6E838F47102B3DcE |
| FeeManager            | 0x2Fe25F82f7d6C927132574c707641C7896Cf609D |
| RiskManager           | 0xfcB5C1BEbFf52B0CA5F5693e4EdBecEF6Ecf76c6 |
| Timelock Controller   | 0x5AAC597e074C449F9F8D75CB53193a796A09e92E |
| OracleSubmitter       | 0x6952F3E2561f661c09a05E59A001F6e86B62f62F |

</details>

<details>

<summary>earnUSDe Plasma  - Experimental earnUSD Plasma</summary>

### **Actors**

| Name                        | Address                                    |
| --------------------------- | ------------------------------------------ |
| ProxyAdmin                  | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin                   | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin                 | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator                     | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 for Curator | 0xDB79E77E950Fe04fa92aEaB9da0d3ea894C2209E |
| OracleUpdater               | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter              | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury                    | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser                  | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser                | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser               | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### **Addresses**

| Component           | Address                                    |
| ------------------- | ------------------------------------------ |
| SwapModule 0        | 0xB50666e75FEb36BaC195feF1C123eB0605425293 |
| Subvault 0          | 0x4E2126de8129f5cb650D86C3E730FEF29D794644 |
| Verifier 0          | 0xeE48C95a7d19185c710cb43879E98184027614d2 |
| Subvault 1          | 0xde803287368e47D2aF700Db27afF61a8DeC89cE1 |
| Verifier 1          | 0xeE48C95a7d19185c710cb43879E98184027614d2 |
| Subvault 2          | 0x343A2d6fCEF788596Cb67c8687f1d14Ef6F4664A |
| Verifier 2          | 0xeE48C95a7d19185c710cb43879E98184027614d2 |
| Vault               | 0x071537fdED831729ccDF16cAF48d035aBE12EB0c |
| Oracle              | 0x4e99C13937d1445BeD50dD428aA57eFaa23b0374 |
| ShareManager        | 0x89255737cb35150e32fD8238Abf1D15E6d3646Ee |
| FeeManager          | 0x58976822Eef32134E3B17939cB5200730513315F |
| RiskManager         | 0x3ABEB4b2743420ca139C71BA6dE565BB8Ff57406 |
| Timelock Controller | 0x15E8F39858662Ba404bA62ffec7A3243A7Dee067 |
| OracleSubmitter     | 0x28f3de77266A67eF19F33DFa6118D11A7682D3DC |

</details>

<details>

<summary>earnUSDe Monad - Experimental earnUSD Monad</summary>

### Actors

| Role            | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0x2d947C132E8f36cFDe1eb14bcDd692cA3d14A58C |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Component          | Address                                    |
| ------------------ | ------------------------------------------ |
| SwapModule 0       | 0x26F68ca6c6e462c44B3142aB4C6402c35Ac9EeDd |
| Subvault 0         | 0xD65C52Ef0ABB63EA1415759CE1db8534D635d441 |
| Verifier 0         | 0x1b7a3291ae04d2C534f8A0Ad7b3621a07dd10330 |
| Subvault 1         | 0x7E767B87E18E0978d33Be607844DAf8d55648066 |
| Verifier 1         | 0x7BA4080F69842029C1921e7498E035676612B708 |
| Vault              | 0x29C70eC3e16b71aD7a6077d70b854E5E5e800704 |
| Oracle             | 0x8eD45638A543CE0c367d44e33aFaD2A54d418DB1 |
| ShareManager       | 0xaD26b9b0b34465D55160318228C7EFF02F85Ad79 |
| FeeManager         | 0x603B6490460f5bA129221705b3D0f6CdE8be5668 |
| RiskManager        | 0x08E223Bb2a9Fca4296079aD237d4c143bEF57024 |
| TimelockController | 0x18A56b1551bEC0FB08E15024Dd7f457305385a65 |
| OracleSubmitter    | 0xb2693cc11f10755b6f3b9fb35cA5b0b06Ab37919 |

</details>

<details>

<summary>earnUSDe Hyper - Experimental earnUSD Hyper</summary>

### Actors

| Actor           | Address                                    |
| --------------- | ------------------------------------------ |
| ProxyAdmin      | 0x81698f87C6482bF1ce9bFcfC0F103C4A0Adf0Af0 |
| LazyAdmin       | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| ActiveAdmin     | 0x5037B1A8Fd9aB941d57fbfc4435148C3C9b48b14 |
| Curator         | 0x3236FdfE07f2886Af61c0A559aFc2c5869D06009 |
| MellowAccountV1 | 0x0E1661C48246c9E21ec4063B72D683c09757e777 |
| OracleUpdater   | 0x317838e80ca05a29DE3a9bbB1596047F45ceaD72 |
| OracleAccepter  | 0x0Dd73341d6158a72b4D224541f1094188f57076E |
| Treasury        | 0xcCf2daba8Bb04a232a2fDA0D01010D4EF6C69B85 |
| LidoPauser      | 0xA916fD5252160A7E56A6405741De76dc0Da5A0Cd |
| MellowPauser    | 0x6E887aF318c6b29CEE42Ea28953Bd0BAdb3cE638 |
| CuratorPauser   | 0x306D9086Aff2a55F2990882bA8685112FEe332d3 |

### Addresses

| Name                | Address                                    |
| ------------------- | ------------------------------------------ |
| Subvault 0          | 0xfE9A7df88be49Bca543665e17b05D268781c700f |
| Verifier 0          | 0xe7226CD260Dc4e3F8a7edE3Ae3b35F334f462Ea9 |
| Subvault 1          | 0x6754E55170bfe9Fd8ca88620c66e7F0f70C0e401 |
| Verifier 1          | 0xa4578F342B4dd964AE1bbCfF96CE4Ce9aECD42d1 |
| Vault               | 0x25eb235e86814775De245fab4a3752a44a0dfc30 |
| Oracle              | 0xA4D708c0513f306535fd47dD22A105adfC839858 |
| ShareManager        | 0x3B786362BDA9f3F057A1069D1F0c1cD2DfD18BD2 |
| FeeManager          | 0xE88984b71F1aEa02E3B2293a044C24c18a0bd4eC |
| RiskManager         | 0x7740B4eB4aa66F5f4B1A2192477123849505316b |
| Timelock Controller | 0x302F7129f7f4a5b25B5b96F12175cb05c3A3119D |
| OracleSubmitter     | 0x2a0f4530CE90160B13fB14c0a503Cb43Efb6b621 |

</details>
