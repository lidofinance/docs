# Lido tokens integration guide

This guide is for developers integrating Lido ecosystem tokens on Ethereum into smart contracts, wallets, exchanges, custody systems, data services, and portfolio trackers.

For JavaScript and TypeScript staking applications, consider the [Lido Ethereum SDK](/integrations/sdk#lido-ethereum-sdk). Direct Lido Earn integrations should use the registered Vault queues and their verified ABIs. On-chain integrations should use the contracts and interfaces linked from this guide.

## Before integrating

Token symbols are not identities. Resolve every token by chain ID and full contract address, then verify the deployment before enabling deposits or signing transactions.

Use these maintained sources:

- [Deployed contracts](/deployed-contracts) for Lido contract and token addresses.
- [Lido Earn deployments](/earn/deployment-contracts) for Earn Vault, token, queue, oracle, and manager addresses.
- [Lido Ecosystem](https://lido.fi/lido-ecosystem) for current integration discovery.
- [Lido Multichain](https://lido.fi/how-lido-works/lido-multichain) for networks that currently have canonical recognition.
- The [wstETH liquidity dashboard](https://dune.com/lido/wsteth-liquidity) for current market data.
- The integrating protocol's own contracts, registry, documentation, and status page for its current configuration.

Do not treat an old announcement, a token price page, or deployed bytecode by itself as proof that deposits, withdrawals, trading, bridging, or rebase accounting remain supported.

For example, verify the Ethereum token relationship with Foundry before using an address from configuration:

```sh
cast code 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 --rpc-url "$ETH_RPC_URL"
cast code 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0 --rpc-url "$ETH_RPC_URL"
cast call 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0 \
  'stETH()(address)' --rpc-url "$ETH_RPC_URL"
```

Pin a finalized block when recording verification evidence. For upgradeable deployments, verify the proxy, implementation, admin, and bridge configuration, not only the proxy bytecode.

## Lido tokens

### stTokens: stETH and wstETH

[stETH](#steth) is the rebasing token for Lido on Ethereum. Its balances are derived from holder shares and protocol accounting. [wstETH](#wsteth) is a non-rebasing wrapper whose balance stays constant unless the holder transfers, wraps, or unwraps tokens.

The same canonical stETH can be minted through Lido Core and against [Lido V3 stVaults](/run-on-lido/stvaults/). Integrators that accept stETH or wstETH therefore accept fungible tokens backed by more than one protocol path. Review the [stVault integration overview](/run-on-lido/stvaults/tech-documentation/integration-overview) if backing attribution or vault-specific risk matters to the product.

The canonical Ethereum addresses are:

| Token  | Address                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------- |
| stETH  | [`0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) |
| wstETH | [`0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`](https://etherscan.io/address/0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0) |

### Lido Earn vault-share tokens

`earnETH` and `earnUSD` are transferable, non-rebasing ERC-20 share tokens for Lido Earn Vaults. Their token quantities represent Vault shares; strategy performance, losses, and fees are reflected through the asset value of each share rather than a rebase.

The token contract is the Vault's **ShareManager**, not the Vault itself:

| Token   | Token / ShareManager                                                                                                    | Vault                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| earnETH | [`0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4`](https://etherscan.io/address/0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4) | [`0x6a37725ca7f4CE81c004c955f7280d5C704a249e`](https://etherscan.io/address/0x6a37725ca7f4CE81c004c955f7280d5C704a249e) |
| earnUSD | [`0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981`](https://etherscan.io/address/0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981) | [`0x014e6DA8F283C4aF65B2AA0f201438680A004452`](https://etherscan.io/address/0x014e6DA8F283C4aF65B2AA0f201438680A004452) |

Do not send deposit assets to the token or Vault address. Deposits and redemptions use registered, asset-specific queue contracts and can be synchronous or asynchronous. Do not assume ERC-4626, EIP-2612 permit, unrestricted transfers, a fixed exchange rate, or guaranteed instant liquidity. See the [Lido Earn integration guide](/earn/integration-guide).

### Current integration availability

Integration availability changes faster than token mechanics. The following evidence was checked on **2026-08-20** and is not an exhaustive compatibility list.

| Surface               | Verified examples and discovery source                                                                                                                                                                                                                                                                                                                                            | What the evidence establishes                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DeFi                  | Current Aave address-book entries include wstETH in Aave V3 on Ethereum, Arbitrum, Base, and Optimism, and in Aave V4 on Ethereum. The Curve stETH/ETH and Uniswap v3 wstETH/WETH pools also had on-chain liquidity. Use the [Lido Ecosystem](https://lido.fi/lido-ecosystem) and [liquidity dashboard](https://dune.com/lido/wsteth-liquidity) to discover other current venues. | The named contracts or reserves existed and were active when checked. It does not guarantee future liquidity, risk parameters, or front-end availability.               |
| Lido Earn             | The [Lido Earn interface](https://stake.lido.fi/earn) supports earnETH and earnUSD deposits and redemptions through registered Vault queues. The [Earn deployment registry](/earn/deployment-contracts) lists the underlying contracts.                                                                                                                                           | This establishes the primary product integration. It does not prove a secondary market, external-protocol acceptance, or instant redemption capacity.                   |
| Wallets               | [MetaMask documents Lido liquid staking](https://support.metamask.io/manage-crypto/earn/stake/liquid-staking/what-are-lido-steth-and-stmatic) and [Lido withdrawal NFT handling](https://support.metamask.io/trade/earn/stake/liquid-staking/how-do-i-withdraw-my-stake-and-rewards/). The Lido Ecosystem lists other wallet integrations.                                        | The named wallet documented staking and withdrawal flows. Generic ERC-20 display support does not prove correct rebase or withdrawal-NFT handling.                      |
| Centralized exchanges | Public spot-instrument APIs for [OKX](https://www.okx.com/api/v5/public/instruments?instType=SPOT), [Bybit](https://api.bybit.com/v5/market/instruments-info?category=spot&limit=1000), [Gate.io](https://api.gateio.ws/api/v4/spot/currency_pairs), and [Bitget](https://api.bitget.com/api/v2/spot/public/symbols) reported live or tradable stETH markets.                     | This proves only that a spot instrument was reported. It does not prove regional access, deposit or withdrawal status, supported networks, or correct rebase crediting. |
| Lido APIs             | The maintained [Lido APIs](/integrations/api), [Lido Ethereum SDK](/integrations/sdk), and [Lido Subgraph](/integrations/subgraph) expose protocol, reward, withdrawal, and event data.                                                                                                                                                                                           | These are integration surfaces, not substitutes for on-chain state in security-critical decisions.                                                                      |
| Market-data APIs      | CoinGecko exposes the [`staked-ether`](https://api.coingecko.com/api/v3/coins/staked-ether), [`wrapped-steth`](https://api.coingecko.com/api/v3/coins/wrapped-steth), [`lido-earn-eth`](https://api.coingecko.com/api/v3/coins/lido-earn-eth), and [`lido-earnusd`](https://api.coingecko.com/api/v3/coins/lido-earnusd) identifiers mapped to the canonical Ethereum addresses.  | This establishes current metadata coverage. It does not prove a liquid market or that the provider's value is suitable for settlement.                                  |
| Portfolio trackers    | The [Lido Ecosystem](https://lido.fi/lido-ecosystem) lists current analytics and portfolio products. The Earn interface links strategy-position views for [earnETH](https://debank.com/bundles/221533/accounts) and [earnUSD](https://debank.com/bundles/221534/accounts).                                                                                                        | A Vault strategy view is not a user ledger. Test rebase, active and pending shares, protocol positions, NFTs, and historical-cost behavior independently.               |

Availability is often regional, account-specific, network-specific, or temporarily paused. A production integration should monitor the upstream source it depends on and define a removal or disablement procedure.

#### Integration utilities: rate and price feeds

The wstETH/stETH exchange rate, the stETH/ETH market price, and a liquidation price are different values with different risk properties.

- On Ethereum, obtain the protocol exchange rate directly from `wstETH.stEthPerToken()` or `wstETH.getStETHByWstETH(10 ** decimals)`.
- On other networks, use the rate mechanism documented for that canonical deployment. Current Chainlink-compatible rate-feed and wrapper addresses are listed under [deployed contract price feeds](/deployed-contracts/#price-feeds).
- For fiat or other quote currencies, choose a market-aware feed or a composed adapter that matches the integration's risk model. Do not assume that the market price of 1 stETH is always exactly 1 ETH.

A lending protocol, exchange, or vault should document whether it needs the protocol exchange rate, a secondary-market price, or a bounded combination. For background, see the [Aave price-feed design](https://github.com/bgd-labs/aave-proposals/blob/main/src/AaveV2-V3PriceFeedsUpdate_20230613/PRICE-FEEDS-UPDATE-20230613.md) and the [LST oracle discussion](https://www.comp.xyz/t/franklin-dao-request-for-comment-on-market-pricing-vs-exchange-rate-pricing-for-lsts-and-potential-oracle-implementations/5130).

For every external feed:

1. Verify the chain, proxy address, implementation, description, and decimals.
2. Check that the answer is positive and that `updatedAt` satisfies the integration's freshness requirement.
3. Handle a reverted call, stale answer, paused feed, and L2 sequencer outage.
4. Do not assume that every Chainlink-compatible adapter implements every aggregator method. Use its verified ABI.
5. Test the economic response to a stETH market discount, a negative rebase, delayed rate propagation, and bridge failure.

### LDO

[LDO](#ldo-1) is the governance token used by Lido DAO. It is a MiniMe-derived token with historical balance queries. LDO is not a receipt for staked ETH and does not share stETH or wstETH accounting.

### unstETH

[unstETH](#withdrawals-unsteth) is the ERC-721 token minted for a Lido withdrawal request. Ownership of the NFT controls the right to claim the finalized request.

## stETH vs. wstETH

Choose the token from the accounting behavior the integration can support:

| Requirement                   | stETH                                                         | wstETH                                                                             |
| ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Holder balance                | Changes when shares move and when protocol accounting changes | Changes only on transfer, wrap, and unwrap                                         |
| Reward representation         | Token balance changes                                         | stETH value per token changes                                                      |
| Transfer-log-only indexing    | Unsafe                                                        | Standard ERC-20 indexing is possible, but valuation still needs the current rate   |
| Fixed-balance DeFi accounting | Requires explicit share and rebase support                    | Usually the simpler choice                                                         |
| Native Ethereum wrap/unwrap   | Wrap into wstETH                                              | Unwrap into stETH                                                                  |
| Typical bridge format         | Do not use a generic ERC-20 bridge                            | Preferred format unless the canonical deployment explicitly supports bridged stETH |

Integrate stETH when the application intentionally supports share-based, rebasing accounting. Prefer wstETH when internal balances must change only through explicit token operations.

### Aave V2 integration lesson

Aave V2 integrated rebasable stETH through a [custom AStETH implementation](https://etherscan.io/address/0xbd233D4ffdAA9B7d1d3E6b18CCcb8D091142893a#code). It combined Aave's liquidity index with stETH's share-based accounting and needed a [dedicated audit](https://github.com/lidofinance/audits/blob/main/MixBytes%20AAVE%20stETH%20integration%20Security%20Audit%20Report%2002-22.pdf). Nominal stETH and aSTETH amounts could differ at wei precision because of integer rounding.

The lesson is not that stETH is non-composable. It is that an accounting system designed for fixed balances needs an explicit rebase adapter. Current Aave deployments use wstETH to avoid that extra accounting layer; verify the current reserve and collateral configuration in the [Aave address book](https://github.com/bgd-labs/aave-address-book).

## stETH

### What is stETH

stETH is a share-based, rebasing token for ETH staked through Lido. A holder's token balance is derived from the holder's shares and the protocol's pooled-ether accounting. Oracle reports can increase or decrease the amount of stETH represented by the same number of shares.

Direct staking, wrapping, swaps, and withdrawals are separate execution paths. Do not describe an exchange quote or a finalized withdrawal amount as a guaranteed 1:1 conversion.

### ERC-20 integration note

stETH implements the common ERC-20 interface, but a rebase changes balances without emitting a `Transfer` event for every holder. An indexer that derives balances only from `Transfer` events will become incorrect.

Wallets and portfolio systems should either read `balanceOf` at the required block or maintain share balances and process protocol accounting events. Use the [`TokenRebased` event and current APR algorithm](/integrations/api#last-lido-apr-for-steth) when calculating period returns.

### Accounting oracle

The accounting oracle normally reports once per day. A report can be delayed, skipped, positive, or negative. Integrations must not assume a rebase occurs at an exact wall-clock time or that it is always positive.

Oracle membership, quorum, and sanity limits are on-chain configuration. Read them instead of copying values into application code:

```sh
cast call 0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288 \
  'getMembers()(address[])' --rpc-url "$ETH_RPC_URL"
cast call 0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288 \
  'getQuorum()(uint256)' --rpc-url "$ETH_RPC_URL"
```

The current contract addresses are maintained in [deployed contracts](/deployed-contracts/#oracle-contracts). The [Accounting Oracle contract documentation](/contracts/accounting-oracle) describes report contents and processing.

### stETH internals: share mechanics

A share represents a holder's fraction of the protocol-accounted pooled ether. Token balances are calculated with integer arithmetic:

```text
stETH balance = shares[account] * totalPooledEther / totalShares
shares = stETH amount * totalShares / totalPooledEther
```

Use `getSharesByPooledEth(uint256)` and `getPooledEthByShares(uint256)` for conversion. Both conversions round according to the contract implementation. Do not reproduce them with floating-point arithmetic.

#### 1-2 wei corner case

An ERC-20 `transfer` specifies a stETH amount, which the contract converts to shares with integer division. The token amount represented by the transferred shares can be slightly smaller than the requested amount. The difference historically appears as 1–2 wei and can grow as the share rate changes.

Do not require exact equality between requested and observed token amounts unless the flow explicitly accounts for rounding. For exact share movement, use `transferShares` or `transferSharesFrom`. Note that `transferSharesFrom` receives a share amount but consumes token-denominated allowance, as shown in the [v4.0.0 stETH implementation](https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.4.24/StETH.sol#L372-L396) and the [stETH contract documentation](/contracts/lido).

### Bookkeeping shares

For an integration that holds stETH over time:

1. Store shares as the stable accounting unit where the product model permits it.
2. Convert user-facing amounts with the on-chain conversion functions at the block used for the operation.
3. Specify rounding direction for deposits, withdrawals, fees, debt, and liquidation.
4. Re-read the conversion rate before settlement; a quote from an earlier block is not an execution guarantee.
5. Test positive and negative rebases, a skipped report, and multiple operations in the same block.

If the application cannot implement these requirements, integrate wstETH instead.

### Transfer shares functions

[`transferShares`](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-11.md) moves the caller's shares. `transferSharesFrom` moves another account's shares subject to its token-denominated allowance. Both return the corresponding stETH token amount and emit share and token transfer events.

### Fees and APR

Protocol fees and their distribution can change. Do not hard-code a fee or assume a fixed split between staking modules and the treasury. Read the current aggregate through `StakingRouter.getStakingFeeAggregateDistribution()` using the current [Staking Router address](/deployed-contracts/#core-protocol).

For display and analytics, use the maintained [Lido APR API and calculation](/integrations/api#lido-apr). APR is historical and variable, not a guaranteed return.

stETH rewards compound through the share-rate accounting as protocol-controlled rewards are reflected in later oracle reports. Withdrawals, fees, penalties, and other protocol accounting can affect a report, so do not derive rewards from total supply changes alone.

## wstETH

### What is wstETH

wstETH wraps stETH shares into an ERC-20 balance that does not rebase. On Ethereum, one wei of wstETH corresponds to one stETH share held by the wrapper. The amount of stETH represented by one wstETH changes with protocol accounting.

Read the current rate with `stEthPerToken()`, `tokensPerStEth()`, `getStETHByWstETH(uint256)`, or `getWstETHByStETH(uint256)`. Use the contract functions rather than a copied rate.

### Wrap and unwrap

`wrap(uint256)` transfers stETH to the wrapper and mints wstETH. `unwrap(uint256)` burns wstETH and transfers the corresponding stETH. Both conversions are subject to integer rounding.

The Ethereum wstETH contract also accepts ETH through its payable shortcut and stakes it before minting wstETH. Direct staking remains subject to the [staking rate limit](#staking-rate-limits).

#### `wstETHReferralStaker`

The permissionless [`wstETHReferralStaker`](https://etherscan.io/address/0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d) at `0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d` stakes ETH, passes the supplied referral to `stETH.submit(address)`, wraps the resulting stETH, and transfers the minted wstETH to the caller in one transaction. This avoids the caller receiving intermediate stETH and submitting separate approval and wrap transactions. By contrast, sending ETH directly to the wstETH contract uses the zero referral address.

Call the helper's payable `stakeETH(address _referral)` method. The caller is always the wstETH recipient: there is no separate recipient argument. A contract that calls the helper receives the wstETH itself and must implement any onward transfer. The helper also has no minimum-output argument; preview with `eth_call` using the intended sender and `msg.value`, then reconcile the returned amount or wstETH balance change at execution.

Because the helper calls `stETH.submit`, the stETH `Submitted` event identifies the helper as `sender` and records the supplied address as `referral`; it does not identify the end user as the event sender. The helper remains subject to Lido staking pause and [rate-limit conditions](#staking-rate-limits).

:::warning
Do not send ETH or tokens directly to `wstETHReferralStaker`: its plain ETH receiver reverts and it has no rescue function. See the [`wstETHReferralStaker` documentation](/contracts/wsteth-staker) and [pinned source](https://github.com/lidofinance/si-lidity/blob/41dc3c24b9e4f882789e4c0f7c63f2f5ca56d391/si-contracts/0.8.25/wsteth-staker/WstethStaker.sol).
:::

### Hoodi wstETH for testing

Hoodi is the active Lido testnet. Use the [Hoodi deployed contracts](/deployed-contracts/hoodi) and test the same wrap, unwrap, share, permit, withdrawal, and failure cases used in production. Sepolia Lido token deployments are legacy and should not be used for new integration testing.

### Lido Multichain

#### wstETH

As of 2026-08-20, canonical wstETH recognition remains on Arbitrum, Optimism, Base, Linea, BNB Chain, and Unichain. Obtain current addresses from [deployed contracts](/deployed-contracts/#lido-multichain) and confirm current recognition on [Lido Multichain](https://lido.fi/how-lido-works/lido-multichain).

The existence of an older wstETH contract does not mean its bridge remains recognized or actively supported. In June 2026, canonical recognition was revoked for zkSync Era, Mode, Scroll, Mantle, Swell, Zircuit, Soneium, Polygon PoS, and Lisk. Existing contracts and holdings were not disabled by that decision. See [Lido Multichain network support changes](https://blog.lido.fi/lido-multichain-update-june-2026/).

On a network where only wstETH exists, it cannot be unwrapped locally into canonical Ethereum stETH. Use the canonical bridge or a market route whose token identity and risks have been verified.

#### stETH on OP Stack networks

Optimism and Unichain also have bridged stETH implementations based on [LIP-22](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-22.md). Their balances depend on a rate delivered from Ethereum. Integrations must monitor rate freshness and use the exact token and `TokenRateOracle` addresses listed in [deployed contracts](/deployed-contracts/#lido-multichain).

## LDO

### What is LDO

LDO is the governance token used in Lido DAO voting. Its MiniMe-derived implementation exposes `balanceOfAt` and `totalSupplyAt` for historical snapshots.

LDO `transfer` and `transferFrom` can return `false` instead of reverting on some failure paths. Integrations must check the returned boolean as required by [ERC-20](https://eips.ethereum.org/EIPS/eip-20#methods). Use the current [LDO address from deployed contracts](/deployed-contracts/#dao-contracts).

## ERC20Permit

Ethereum stETH and wstETH implement [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612) permit. stETH signature validation also supports smart-contract wallets through [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271).

The deployed earnETH and earnUSD ShareManagers do not implement EIP-2612. Use ERC-20 allowance and do not call a permit selector solely because another Lido token supports it.

An integration must bind the signature to the expected chain, token, owner, spender, value, nonce, and deadline. Treat a permit as public transaction input: another account can submit it before the intended transaction.

If a combined permit-and-action call can be front-run only to consume the permit, retry the action through the allowance path after checking the resulting allowance. The [Lido withdrawal flow](https://github.com/lidofinance/ethereum-staking-widget/blob/d8a69337f9e5f928533ec28d0b371b3ce30de146/features/withdrawals/hooks/contract/useRequest.ts#L64-L188) implements this fallback. Do not retry blindly or increase the approved amount without user authorization.

## Integration checklists

### Smart contracts and DeFi protocols

- Select stETH or wstETH from the accounting model, not from token popularity.
- Use full-precision integer math and specify rounding direction at every conversion boundary.
- Do not infer stETH balances only from ERC-20 transfer events.
- Separate protocol exchange rate, market price, and liquidation price.
- Validate oracle freshness, decimals, sequencer state, and failure behavior.
- Test positive and negative rebases, skipped reports, paused staking, exhausted rate limits, and withdrawal delays.
- Model wrapper, bridge, oracle, proxy, governance, and external-protocol risks separately.
- For Earn tokens, validate the exact queue, asset, oracle report, fee configuration, transfer flags, and synchronous redemption capacity at execution time.

### Wallets and portfolio trackers

- Identify every asset by chain ID and full address. Reject symbol-only token discovery.
- Refresh stETH from current state or maintain shares plus rebase events.
- Show wstETH quantity separately from its current stETH or fiat value.
- Index unstETH ownership and `BatchMetadataUpdate` events so finalized withdrawal NFTs update correctly.
- Distinguish staking rewards from transfers, wrapping, swaps, fees, and withdrawal finalization.
- Show the network and canonical-recognition status for bridged assets.
- Show Earn active token balances separately from pending deposits, claimable shares, and pending redemption assets; value shares with the relevant Vault report.

### Exchanges, custodians, and other CeFi systems

- Decide whether the internal ledger holds stETH units, stETH shares, or wstETH units.
- Reconcile custody balances across rebases and define when users become eligible for each accounting update.
- Test deposits and withdrawals across a rebase boundary and account for transfer rounding.
- Publish the exact supported token address and network. Trading support does not imply deposit or withdrawal support.
- Define how negative rebases, paused withdrawals, bridge incidents, and token migrations affect customer balances.
- Reconcile on-chain custody independently from the trading ledger and portfolio valuation feed.
- For Earn tokens, maintain separate ledgers for active shares, claimable deposit shares, locked redemption shares, and claimable exit assets.

### APIs and data providers

- Return chain ID and contract address with every token identifier.
- State the block, timestamp, source, decimals, and freshness of balances and rates.
- Do not calculate stETH history from `Transfer` events alone.
- Keep protocol APR separate from market price performance and third-party incentives.
- Treat off-chain APIs as read-only convenience layers; use on-chain state for settlement and security decisions.
- For Earn tokens, return the source asset and oracle report used for share valuation; do not present Vault strategy positions as the holder's redeemable balance.

### Cross-chain bridges

Most generic ERC-20 bridges do not propagate stETH rebases. Locking stETH in such a bridge can leave the rebase on the origin-chain escrow rather than delivering it to destination-chain holders.

Use wstETH by default for a new bridge unless the design explicitly implements rebasable stETH. Follow the [cross-chain token guide](/token-guides/cross-chain-tokens-guide) for endpoint, governance, pause, rate-delivery, and verification requirements.

## Staking rate limits

Direct ETH staking is subject to an on-chain sliding-window limit and can also be paused. Read `getCurrentStakeLimit()` or `getStakeLimitFullInfo()` immediately before preparing the transaction, but still handle a revert because the limit can change before execution.

If the requested amount exceeds the current limit, the user can wait or obtain stETH or wstETH through a secondary market. A secondary-market route has different price, liquidity, slippage, MEV, and smart-contract risks and is not equivalent to direct staking.

## Withdrawals (unstETH)

Lido protocol withdrawals are asynchronous. A request locks stETH or wstETH in the [Withdrawal Queue](/contracts/withdrawal-queue-erc721), mints an unstETH NFT, waits for finalization, and then burns the NFT when ETH is claimed.

Each request must be at least 100 wei of stETH and no more than 1000 stETH. Larger withdrawals can be split and submitted in a batch. Read the constants and current queue state from the deployed contract before relying on these bounds.

The main request methods are:

- `requestWithdrawals` and `requestWithdrawalsWithPermit` for stETH.
- `requestWithdrawalsWstETH` and `requestWithdrawalsWstETHWithPermit` for wstETH.

The request owner can transfer the unstETH NFT. The current NFT owner has the claim right after finalization. Integrations can read `getWithdrawalRequests`, `getWithdrawalStatus`, `getClaimableEther`, and checkpoint hints, then call `claimWithdrawal` or `claimWithdrawals`.

The claimable ETH amount is fixed during finalization. It cannot exceed the nominal stETH amount represented when the request was created and can be lower after protocol losses. A request cannot be canceled.

Use the [Withdrawal Queue contract documentation](/contracts/withdrawal-queue-erc721) for the current ABI and the [Withdrawals API](/integrations/api#withdrawals-api) only for estimates. An estimate is not a finalization guarantee.

## Risks

Read the maintained [Public Risk Disclosure](/prd) before shipping an integration. At minimum, review:

- smart-contract, proxy, and governance risk;
- validator penalty and slashing risk;
- positive and negative rebase behavior;
- stETH and wstETH market-price deviation from protocol exchange value;
- oracle delay, stale data, and incorrect-data risk;
- withdrawal queue, finalization, and liquidity risk;
- bridge, destination-network, and rate-propagation risk;
- third-party protocol, custody, exchange, and API risk.
- Lido Earn strategy, curator, Vault, subvault, queue, fee, access-control, and instant-liquidity risk.

An integration should define monitoring, pause, recovery, and asset-removal procedures before accepting user funds.
