# Lido DAO

The Lido DAO is a Decentralized Autonomous Organization that manages the liquid staking protocol by deciding on key parameters (e.g., setting fees, assigning node operators and oracles, etc.) through the voting power of governance token (DPG) holders.

Also, the DAO will accumulate service fees and spend them on insurance, research, development, and protocol upgrades. Initial DAO members will take part in the threshold signature for Ethereum 2.0 by making BLS threshold signatures.

Since WithdrawalsManagerStub contract has been deployed, new validators withdrawal credentials point to WithdrawalsManagerStub contract controlled by Lido DAO.
Validators before that deployment have withdrawal credentials pointing to mulsig wallet.

The Lido DAO is an [Aragon organization](https://aragon.org/dao). Since Aragon provides a full end-to-end framework to build DAOs, we use its standard tools. The protocol smart contracts extend AragonApp base contract and can be managed by the DAO.

- [Lido DAO Mainnet](https://mainnet.lido.fi/#/lido-dao/)
- [Lido DAO Prater Testnet](https://testnet.lido.fi/#/lido-testnet-prater/)

## LDO Token

LDO is a [MiniMeToken](https://github.com/Giveth/minime) granting governance rights in the Lido DAO. By holding the LDO token, one is granted voting rights within the Lido DAO. The more LDO locked in a user’s voting contract, the greater the decision-making power the voter gets.
