---
title: Governance
description: Who controls Lido Lend, from the Lido DAO with Dual Governance to the Lend committees, Easy Track and the guardians, and the limits of each.
---

# Governance

The Lido DAO governs Lido Lend. Three Lend committees and the guardians operate it day to day, within limits that the contracts enforce. The sections below go from the most power to the least.

## Lido DAO and Dual Governance: full power

The Lido DAO holds every power that it does not delegate. With an LDO vote, it can:

- upgrade a Lido Lend contract behind a proxy until that proxy is ossified. An upgrade can change any rule. Contracts without a proxy, such as the rate-curve configs of a market, cannot be upgraded;
- grant and revoke every role, including the roles of the committees. The Lend Operational Committee is fixed in the Easy Track factories, so the Lido DAO changes it by replacing the factories;
- move a live market to a different interest rate model, and set the recipient of the market fees.

Lido DAO votes go through [Dual Governance](/guides/dg-guide) where applicable. The exception is the Easy Track factories: Aragon Voting registers and removes them directly, so the vote that sets the Lend Operational Committee's powers does not go through Dual Governance. stETH holders who oppose a decision can lock their stETH to delay it. With enough support, they can leave the protocol before the decision takes effect. Dual Governance can also keep a paused Lido Lend market paused during a governance emergency. The Lido DAO is the final trust assumption. Ossifying a proxy fixes its code, and the DAO continues to administer the roles.

## Lend Operational Committee and Easy Track: routine changes

The Lend Operational Committee does routine configuration through [Easy Track](/guides/easy-track-guide) motions. A motion can be enacted after 72 hours, unless LDO holders with at least 0.5% of the total LDO supply object to it. Through motions, the committee:

- activates markets;
- changes the supply cap, the collateral activation config, the settlement config, the fee (at most 25%) and the interest rate config of a market;
- appoints and removes market stewards;
- registers and removes the Circuit Breaker pauser, and sets the pause duration and heartbeat interval;
- grants instant activation;
- unfreezes markets, unbans accounts, changes the guardian set, and sets the guardian quorum and suspect window.

Each Easy Track factory fixes the contracts and functions that its motion can call. The committee chooses only the values. The factories are listed on [Deployed contracts](./deployed-contracts#easy-track-factories).

## Lend Risk Steward Committee: instant tightening

In the markets where it is the appointed steward, the Lend Risk Steward Committee acts without a motion, but only to reduce risk. It can freeze a market, increase the activation delays and the activation lock, raise the minimum deposit, and revoke the instant activation of an integration. It cannot loosen a setting or unfreeze a market.

## Lend Emergency Brakes Committee: one pause

The Lend Emergency Brakes Committee can pause one market controller for a fixed time, 21 days in the initial configuration. It can do this once per registration. The pause stops almost every action in the market, and it ends on its own. See [Freeze and pause](./architecture#freeze-and-pause).

## Guardian Security Council: screening new collateral

The guardians of a market screen new collateral before it can support new borrowing. They can delay collateral activation, and flags from a quorum of guardians ban an account from borrowing in the market. They cannot move funds or change settings.

## More details

- [Committees](./committees): the powers of each committee, the contracts it acts through, its Safe and signers, and what it cannot do;
- [Architecture](./architecture#freeze-and-pause): what freeze and pause do to a position;
- [Risks](./risks#governance-and-committee-actions): the governance risks and how they are limited.
