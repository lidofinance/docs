---
sidebar_position: 3
---

# 💸 Withdrawals operations

This page explains how to operate withdrawals for a pooled staking product (DeFi Wrapper): how to monitor the Withdrawal Queue, ensure enough liquidity is available, and finalize requests.

## How withdrawals work (high level)

1. **Users place requests** (via the Pool UI / Pool contract).
2. Requests are subject to a **minimum delay** before they can be finalized.
3. **Node Operator monitors the queue** and ensures enough ETH liquidity is available on the vault balance by returning ETH from validators (e.g., exiting / triggering withdrawals) for the required amount.
4. A finalizer calls `WithdrawalQueue.finalize()` to **lock ETH** for claimable requests (and optionally rebalance stETH shares).
5. Users (or anyone on their behalf) call `claimWithdrawal()` to transfer locked ETH to the recipient.

## Monitor the Withdrawal Queue

### Quick queue snapshot

```bash
# Base info (includes addresses, flags, and parameters)
yarn start defi-wrapper contracts wq r info <withdrawalQueue>

# How many requests are not finalized yet
yarn start defi-wrapper contracts wq r unfinalizedRequestsNumber <withdrawalQueue>

# Total ETH amount in the queue that is still not finalized
yarn start defi-wrapper contracts wq r unfinal-assets <withdrawalQueue>

# Optional: amounts expressed in STV / stETH shares
yarn start defi-wrapper contracts wq r unfinal-stv <withdrawalQueue>
yarn start defi-wrapper contracts wq r unfinalizedStethShares <withdrawalQueue>
```

### Identify the “backlog” range

```bash
# Last request ever created
yarn start defi-wrapper contracts wq r last-request-id <withdrawalQueue>

# Last request already finalized
yarn start defi-wrapper contracts wq r last-finalized-request-id <withdrawalQueue>
```

The unfinalized request IDs are typically in the range:

- `lastFinalizedRequestId + 1 ... lastRequestId`

### Inspect a specific request

```bash
# Status for a single request id
yarn start defi-wrapper contracts wq r w-status <withdrawalQueue> <requestId>

# How much ETH is claimable for a request (if finalized)
yarn start defi-wrapper contracts wq r get-claimable-ether <withdrawalQueue> <requestId>
```

## Ensure there is enough liquidity to finalize

Finalization requires enough ETH to be available for withdrawals (and for gas cost coverage, see below). If `finalize` reverts, the usual cause is **insufficient available balance** on the underlying staking vault.

### Check available vault balance

```bash
# ETH that is available for withdrawal (excludes staged balances for activations)
yarn start contracts vault r available-balance <vault>

# How much ETH is staged for validator activations
yarn start contracts vault r staged-balance <vault>
```

### If liquidity is not enough: return ETH from validators

Operationally, to satisfy withdrawals you need ETH back on the vault balance. Depending on your setup, this may involve:

- **Triggering validator withdrawals** (with `TRIGGER_VALIDATOR_WITHDRAWAL_ROLE` - not assigned by default)
- **Exiting validators**

CLI has Vault-level helpers for these operations:

```bash
# Ask the node operator to exit validators (request is emitted; actual exits must be handled by the NO)
yarn start contracts vault w no-val-exit <vault> <validatorPublicKeys>

# Trigger EIP-7002 exits by the node operator
yarn start contracts vault w eject-validators <vault> <pubkeys> <refundRecipient>

# Trigger validator withdrawals
yarn start contracts vault w trigger-v-w <vault> <pubkeys> <amounts> <refundRecipient>
```

For role/permission boundaries between Vault Owner vs Node Operator actions, see [stVaults Roles and permissions](../../features-and-mechanics/roles-and-permissions).

## Finalize requests

Finalization is performed by an account with `FINALIZE_ROLE` on the Withdrawal Queue (in DeFi Wrapper deployments, this is typically the `nodeOperator`).

```bash
yarn start defi-wrapper contracts wq w finalize <withdrawalQueue> <maxRequests> <gasCostCoverageRecipient>
```

- `maxRequests`: finalize up to N requests in one transaction (the function stops earlier if it hits a limiting condition).
- `gasCostCoverageRecipient`: where the gas cost coverage (if any) is paid; if you pass `0x000...0`, the contract uses `msg.sender`.

## What is `gasCostCoverage`

`gasCostCoverage` is a per-request ETH amount that can be paid out during finalization to compensate the finalizer for gas costs (bounded by the on-chain constant `MAX_GAS_COST_COVERAGE`).

You can inspect the configuration via CLI:

```bash
# Current configured per-request gas coverage (wei)
yarn start defi-wrapper contracts wq r getFinalizationGasCostCoverage <withdrawalQueue>

# Maximum allowed coverage (wei)
yarn start defi-wrapper contracts wq r MAX_GAS_COST_COVERAGE <withdrawalQueue>
```

**How it’s applied**

- During `finalize`, the contract accumulates total coverage across finalized requests and transfers it to `gasCostCoverageRecipient`.
- This coverage is accounted for when checking available balances, so higher coverage increases the ETH required to finalize the same set of requests.

**How to change it**

The on-chain method is `setFinalizationGasCostCoverage(uint256)`, which requires `FINALIZE_ROLE`.

