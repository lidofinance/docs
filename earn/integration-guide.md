---
description: Integration guidance for the earnETH and earnUSD Lido Earn vault-share tokens.
---

# earnETH and earnUSD integration guide

This guide covers direct integration of the Ethereum `earnETH` and `earnUSD` tokens into smart contracts, wallets, custody systems, exchanges, APIs, and portfolio trackers.

Read the [Earn introduction](/earn/), [deployments](/earn/deployment-contracts), [architecture](/earn/architecture/), and [audits](/earn/audits) before accepting funds. Lido Earn uses third-party Vault infrastructure and strategy integrations whose risks and operational state differ from Lido on Ethereum staking.

## Token identity

The ERC-20 token is the Vault's **TokenizedShareManager** proxy. The Vault is a separate contract that registers the ShareManager, oracle, fees, assets, and queues.

| Product | Token symbol | Token / ShareManager                                                                                                    | Vault                                                                                                                   | Decimals |
| ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| EarnETH | `earnETH`    | [`0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4`](https://etherscan.io/address/0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4) | [`0x6a37725ca7f4CE81c004c955f7280d5C704a249e`](https://etherscan.io/address/0x6a37725ca7f4CE81c004c955f7280d5C704a249e) | 18       |
| EarnUSD | `earnUSD`    | [`0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981`](https://etherscan.io/address/0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981) | [`0x014e6DA8F283C4aF65B2AA0f201438680A004452`](https://etherscan.io/address/0x014e6DA8F283C4aF65B2AA0f201438680A004452) | 18       |

Identify each token by chain ID and full ShareManager address. Do not use the Vault address as the ERC-20 address and do not send assets directly to either address. Use a queue registered by the Vault.

Verify both directions before enabling an integration:

```sh
cast call 0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4 \
  'vault()(address)' --rpc-url "$ETH_RPC_URL"
cast call 0x6a37725ca7f4CE81c004c955f7280d5C704a249e \
  'shareManager()(address)' --rpc-url "$ETH_RPC_URL"
```

Pin a finalized block when saving evidence. Because these contracts are upgradeable, verify the proxy, implementation, admin, Vault relationship, and current configuration.

## Accounting and valuation

earnETH and earnUSD are non-rebasing Vault shares. A holder's active ERC-20 balance normally changes only through minting, burning, or transfer. Rewards, losses, and fees affect the amount of a supported asset represented by each share; they do not create a positive-balance guarantee.

Each Vault Oracle reports an asset-specific `priceD18` in the **shares-per-asset** direction:

```text
shares = assets * priceD18 / 1e18
assets = shares * 1e18 / priceD18
```

`assets` is expressed in the asset's smallest unit. The report therefore incorporates differences such as 6-decimal USDC versus 18-decimal earnUSD. Do not invert the rate twice, reuse one asset's report for another asset, or calculate with floating-point arithmetic.

Before using a report, read `Oracle.getReport(asset)` and check that:

- the asset is supported by that exact Vault;
- `priceD18` is nonzero;
- `isSuspicious` is false;
- its timestamp satisfies the integration's freshness limit;
- the report direction and asset decimals are handled correctly.

An oracle report is an accounting input, not proof of a liquid secondary-market price. A lending or liquidation integration needs a separately justified market-price design and failure policy.

### Active and pending shares

The ShareManager exposes more than the ERC-20 balance:

| View                                             | Meaning                                                      |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `balanceOf(account)` / `activeSharesOf(account)` | Active, transferable ERC-20 shares                           |
| `claimableSharesOf(account)`                     | Shares allocated by asynchronous deposits but not yet minted |
| `sharesOf(account)`                              | Active plus claimable shares                                 |
| `totalSupply()` / `activeShares()`               | Active token supply                                          |
| `allocatedShares()`                              | Shares reserved for later minting                            |
| `totalShares()`                                  | Active plus allocated shares                                 |

An ERC-20 indexer can reconstruct active balances from `Transfer` events. It must separately index deposit requests and claims if pending balances matter. A transfer invokes share claiming for the sender and recipient before the transfer, so a transaction can mint previously claimable shares and then move active shares.

## Interface assumptions

- The ShareManagers implement ERC-20 transfers and allowances, plus public `burn` and `burnFrom` functions.
- They do **not** implement ERC-4626. Deposits, previews, and redemptions belong to queue and helper contracts.
- They do **not** implement EIP-2612 permit. Use ERC-20 allowance unless a future verified deployment explicitly adds permit.
- Calling `burn` or `burnFrom` destroys shares without returning an asset. It is not a withdrawal method.
- Minting, burning, transfers, deposit access, transfer access, and a global lockup are configurable. Read `flags()` and relevant account state instead of assuming shares are always transferable.

The implementation behavior is documented in [`TokenizedShareManager`](https://github.com/mellow-finance/flexible-vaults/blob/1314cba3b0333d3224d037e281e04b80403d5460/src/managers/TokenizedShareManager.sol) and [`BurnableTokenizedShareManager`](https://github.com/mellow-finance/flexible-vaults/blob/1314cba3b0333d3224d037e281e04b80403d5460/src/managers/BurnableTokenizedShareManager.sol).

## Discover registered assets and queues

Supported assets and execution routes are on-chain configuration. Enumerate them from the Vault rather than copying a product announcement:

1. Read `getAssetCount()` and `assetAt(index)`.
2. For each asset, read `getQueueCount(asset)` and `queueAt(asset, index)`.
3. Confirm `hasQueue(queue)`, `isDepositQueue(queue)`, and `isPausedQueue(queue)`.
4. On the queue, verify `vault()`, `asset()`, proxy implementation, and ABI.
5. Confirm the asset is supported by the Vault Oracle and has a usable report.

The current addresses are also collected in [Earn deployments](/earn/deployment-contracts). Treat the registry as discovery input and the Vault configuration as execution state.

## Deposits

### Synchronous deposits

A `SyncDepositQueue` can receive the configured asset and mint active shares in the same transaction. Before quoting or submitting:

- check that the queue is registered and not paused;
- read `syncDepositParams()` for its penalty and maximum report age;
- verify the current Oracle report;
- check deposit whitelist requirements and the user's proof;
- calculate shares with the current report and fee configuration;
- set allowance only for the exact ERC-20 queue and amount, or send the exact native-ETH value for an ETH queue.

The queue can still revert between quote and execution because its report, flags, fees, risk limits, hooks, or pause state can change. See the [`SyncDepositQueue` implementation](https://github.com/mellow-finance/flexible-vaults/blob/1314cba3b0333d3224d037e281e04b80403d5460/src/queues/SyncDepositQueue.sol).

### Asynchronous deposits

An asynchronous `DepositQueue` records a request. A later eligible Oracle report allocates shares, after which the user or another caller claims them for the account.

- An account can have only one pending request per queue.
- A request may be canceled only before it becomes claimable.
- `balanceOf` does not include the resulting shares until they are claimed and minted.
- Store the queue and source asset with the request; do not aggregate requests by token symbol alone.

Use `requestOf`, `claimableOf`, `cancelDepositRequest`, and `claim` from the verified queue ABI. Do not promise a fixed processing time: eligibility and completion depend on the configured interval and a valid report.

## Redemptions

The primary product routes currently redeem earnETH into wstETH and earnUSD into USDC. Other registered queues may exist, so integrations must declare the exact exit asset and route they support.

### Synchronous redemptions

A `SyncRedeemQueue` burns active shares and transfers the configured exit asset in the same transaction, but only when all checks pass:

- the queue is registered and unpaused;
- the Oracle report is valid, not suspicious, and within `maxAge`;
- sufficient Vault liquid assets are available;
- the requested shares fit within `remainingDailyLimit()`;
- the resulting asset amount is nonzero after penalties and fees.

Read `syncRedeemParams()`, `remainingDailyLimit()`, and `getLiquidAssets()` immediately before execution and still handle a revert. The capacity uses a linearly refilling bucket, not a guaranteed rolling-day quota. See the [`SyncRedeemQueue` implementation](https://github.com/mellow-finance/flexible-vaults/blob/1314cba3b0333d3224d037e281e04b80403d5460/src/queues/SyncRedeemQueue.sol).

### Asynchronous redemptions

An asynchronous `RedeemQueue` locks the requested shares. A later eligible Oracle report burns those locked shares and prices the request; after asset liquidity is assigned, the exit asset can be claimed.

- Requests are not cancellable.
- Multiple requests can exist for one account and are distinguished by timestamp.
- A priced request is not necessarily funded or claimable yet.
- The final asset amount can differ from a quote because it uses the applicable report and fees.

Index `RedeemRequested`, report and batch handling, and `RedeemRequestClaimed`. Reconcile pending shares, priced assets, funded batches, and claimed assets as separate states.

The [production Earn withdrawal flow](https://github.com/lidofinance/ethereum-staking-widget/blob/d8a69337f9e5f928533ec28d0b371b3ce30de146/modules/mellow-meta-vaults/hooks/use-withdraw.ts) checks synchronous capacity and liquid assets, then selects the asynchronous queue when the instant route is unavailable. An integration should implement its own deterministic routing and user disclosure rather than assuming the front end will remain unchanged.

## Fees and previews

Deposit, redeem, performance, and protocol fee parameters are mutable. Read the current FeeManager and include fee-share minting in previews and reconciliation. Strategy layers can also charge fees that are reflected in reported share value.

Do not copy a fee, APY, TVL, token price, or waiting time from a product page into application logic. State the block, asset, route, report, and fee configuration used for every quote. APY is historical performance and is not a promised return.

## Integration checklists

### Wallets and portfolio trackers

- Display the ERC-20 ShareManager address, not the Vault address, as the token identity.
- Keep active balance, pending deposits, claimable shares, pending redemptions, and claimable exit assets separate.
- Value active shares with the intended asset's current report and show that asset explicitly.
- Treat a Vault strategy-position view as backing information, not the user's redeemable balance.
- Refresh after Oracle reports, queue claims, transfers, and configuration changes.

### Smart contracts and DeFi protocols

- Do not call ERC-4626 or permit methods that the token does not implement.
- Validate `flags()` and account restrictions before assuming transferability or composability.
- Separate accounting value, market price, and liquidation price.
- Model the Vault, Oracle, FeeManager, RiskManager, queues, hooks, subvaults, strategies, proxies, and administrative roles.
- Test losses, suspicious and stale reports, paused queues, depleted liquidity, exhausted synchronous capacity, fee changes, and implementation upgrades.

### Exchanges and custodians

- Credit only confirmed active shares to the liquid token ledger.
- Track asynchronous deposits and redemptions as separate pending liabilities.
- Define the supported exit asset and whether the service waits for asynchronous claims.
- Reconcile custody against active token supply and queue state, not a portfolio API alone.
- Do not enable deposits from token metadata coverage or a symbol match.

### APIs and researchers

- Return chain ID, ShareManager, Vault, queue, source or exit asset, block, report timestamp, and decimals.
- Expose both share quantity and asset value; label the report direction.
- Keep reported Vault value, secondary-market price, and historical performance separate.
- Date integrations, strategy allocations, fees, liquidity, and product availability.

## Market and integration availability

As checked on **2026-08-20**, the [Lido Earn interface](https://stake.lido.fi/earn) was the maintained primary product surface. CoinGecko mapped [`lido-earn-eth`](https://api.coingecko.com/api/v3/coins/lido-earn-eth) and [`lido-earnusd`](https://api.coingecko.com/api/v3/coins/lido-earnusd) to the canonical ShareManager addresses. The product also linked Vault strategy views for [earnETH](https://debank.com/bundles/221533/accounts) and [earnUSD](https://debank.com/bundles/221534/accounts).

Metadata, a Vault strategy view, or a generic ERC-20 balance does not prove a liquid market, correct share valuation, deposit or redemption support, or external-protocol acceptance. Verify every wallet, protocol, exchange, custodian, API, and portfolio integration from its own current registry and operational state.

## Monitoring and risks

Monitor at least:

- proxy implementations, admins, roles, and timelocks;
- ShareManager flags, account restrictions, and supply changes;
- registered assets, queue additions or removals, and pause state;
- Oracle report price, timestamp, suspicious state, supported assets, and security parameters;
- FeeManager and RiskManager configuration;
- synchronous redemption capacity and liquid assets;
- asynchronous request, report, batch, and claim progress;
- subvault, curator, strategy, and external-protocol status;
- source-asset and exit-asset market, depeg, liquidity, and custody risk.

Review the maintained [Earn audits](/earn/audits) and the product's [risk disclosures](https://lido.fi/earn/risk-disclosures). The [EarnETH incident review](https://research.lido.fi/t/kelp-incident-review-earneth-exposure-response-and-risk-framework-changes/11579) is a concrete integration case for testing dependency contagion, liquidity stress, paused flows, valuation uncertainty, and unwind procedures. Define pause, recovery, reconciliation, and asset-removal procedures before accepting user funds.
