# Lido DAO

The Lido DAO is a Decentralised Autonomous Organisation that manages the liquid staking protocols by deciding on key parameters (e.g., setting fees, assigning node operators and oracles, etc.) through the voting power of governance token (`LDO`) holders. Also, the DAO will accumulate service fees and spend them on research, development, liquidity mining and protocol upgrades. 

## Why DAO?

The DAO is the logical compromise between full centralization and decentralisation, which allows the deployment of competitive products without full centralization and custody on the exchanges. We do not believe that it is possible to make a liquid staking protocol that is completely trustless. A DAO is an optimal structure for launching Lido as:

- Lido is highly dependent on the design and restrictions of staking implementations on different chains; 
- Staking protocols may change and therefore Lido should be upgradable; 
- DAO governance is better than one person or a developer's team for making decisions about changes in Lido; 
- DAO will be able to cover the costs of developing and upgrading the protocol from the DAO token treasury. 
- Only DAO can make decisions regarding self-cover ([more](https://blog.lido.fi/offline-slashing-risks-are-self-cover-options-enough/) in blog);

The DAO will accumulate service fees from Lido, which can be funnelled into the insurance and development funds, distributed by the DAO.

## Functions

Lido is managed by the Lido DAO. The DAO members govern Lido to ensure its efficiency and stability. The Lido DAO should do the following:
- Build, deploy update and decide on key parameters of liquid staking protocols, appprove incentives for parties that contribute towards DAO’s goals
- Node operators management. Assign initial DAO-vetted node operators, scout and qualify new node operators and penalise the existing ones slashed by chains rules
- Approve LEGO grants to support different research and so initiatives protocol guilds
- Payments to full-time contributors and other operational duties
- Security, bug bounty program, respond to emergency
- Accumulation of service fees from Lido, which can be funnelled into the insurance and development funds, distributed by the DAO.


## Governance

The `LDO` token governs all Lido DAO governance and network decisions to ensure its prolonged stability and decentralised decision-making to facilitate the growth of fair, trustless, and transparent liquid staking.  The `LDO` contract address - `0x5a98fcbea516cf06857215779fd812ca3bef1b32`.

> 📝 For the more detailed information about governance, please, check out [governance](https://lido.fi/governance) page. 

Generally speaking, the `LDO` governance token is allowing to distribute all decision-making to create a governance minimised staking service built around community-growth and self-sustainability. To have a vote in the Lido DAO, and to contribute to the determination of any of the topics outlined above, one must hold the `LDO` governance token. Holding `LDO` gives DAO members a vote in the future of Lido, allowing each DAO member to have a personal say in the community. `LDO` voting weight is proportional to the amount of `LDO` a voter stakes in the voting contract. The more LDO in a user’s voting contract, the greater the decision-making power the voter gets. The exact mechanism of `LDO` voting can be upgraded just like the other DAO applications.

> 📝 If you have any initiatives you think will benefit the Lido protocol, share your thoughts in our [governance forum](https://research.lido.fi).

## Software

The Lido DAO is an [Aragon](https://aragon.org/dao) organization. Since Aragon provides a full end-to-end framework to build DAOs, we use its standard tools.

> 📝 The governance process only takes place within the Ethereum network. For other networks, this process is implemented through committee and multisig (we need a multisig list).

While the Aragon application is a powerful tool for DAO governance due to the fact that it is both transparent and reliable, it is ill-suited to manage routine operations that either have strong token-holder support and/or are only relevant to a subsection of the DAO (e.g. the financial operations team). For that reason, [Easy Track](https://easytrack.lido.fi/) was developed as an efficient mechanism to assist with routine and uncontentious governance proposals for the Lido DAO. Importantly, security, flexibility, and scalability were all paramount concerns throughout the development of Easy Track, with extensive measures taken to ensure that safety has not been compromised for convenience.

The novel Easy Track motions will not only reduce voter fatigue and on-chain gas costs for token-holders, but will also facilitate the growth of the DAO by providing greater autonomy to the sub-committees and node operators within the organisation.
