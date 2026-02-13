# TokenizedShareManager

## Overview

- This module extends `ShareManager` and `ERC20Upgradeable`, making vault shares externally transferable and fully compliant with the ERC20 standard.
- It is intended for vaults that require tokenized shares usable across external protocols, wallets, or DeFi integrations.
- Core share logic (minting, burning, whitelisting, lockups) is delegated to the inherited `ShareManager`, preserving consistent permission enforcement.
- Whitelist enforcement, lockup mechanics, and share claim logic are integrated into the overridden `_update` hook, which ensures all token transfers pass necessary checks and call `claimShares` for non-zero actors.
- Suitable for use cases where share liquidity, composability, or token standard compatibility (for example ERC20 or ERC4626 wrappers) is required.
