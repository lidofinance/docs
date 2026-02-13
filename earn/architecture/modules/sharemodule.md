# ShareModule

## Purpose

`ShareModule` is a core module responsible for managing user interactions with a vault through structured deposit and redeem queues. It provides governance over queue creation, hook configurations, oracle-driven settlement, and fee accounting.

## Key Responsibilities

- Tracks and validates all deposit and redeem queue operations.
- Coordinates price reporting with the oracle.
- Facilitates dynamic queue configuration and lifecycle.
- Integrates hooks for deposit and redeem processing customization.
- Acts as the central hub for protocol and performance fee minting, share claim logic, and report handling.

## Roles

- `SET_HOOK_ROLE`: Grants the ability to modify per-queue and default hook addresses.
- `CREATE_QUEUE_ROLE`: Allows creation of new deposit and redeem queues.
- `SET_QUEUE_STATUS_ROLE`: Permits pausing and unpausing individual queues.
- `SET_QUEUE_LIMIT_ROLE`: Enables setting the max number of total queues.
- `REMOVE_QUEUE_ROLE`: Allows safe removal of queues with `canBeRemoved()` check.

## Core Storage Layout (`ShareModuleStorage`)

- `shareManager`: Reference to contract handling share minting and burning.
- `feeManager`: Reference to contract that calculates fees and stores fee-related data.
- `oracle`: Oracle contract providing price data and asset support status.
- `defaultDepositHook` and `defaultRedeemHook`: Global fallback hooks used when custom hooks are not defined.
- `customHooks`: Per-queue override for custom hook logic.
- `queueCount`: Total existing queues.
- `queueLimit`: Global max limit for queues.
- `isDepositQueue`: Distinguishes deposit queues from redeem ones.
- `isPausedQueue`: Tracks paused queues.
- `queues`: Asset to queues mapping.
- `assets`: Registry of all assets with registered queues.

## View Functions

- `shareManager()`: Returns the `IShareManager` instance.
- `feeManager()`: Returns the `IFeeManager` instance.
- `oracle()`: Returns the `IOracle` instance.
- `depositQueueFactory()` and `redeemQueueFactory()`: Queue factory contracts.
- `queueLimit()`: Max allowed queues.
- `claimableSharesOf(account)`: Sum of claimable shares across all deposit queues for the account.
- `getLiquidAssets()`: Called by redeem queues to determine liquidity available for handling redemptions.
- `defaultDepositHook()` and `defaultRedeemHook()`: Global default hooks.
- `getHook(queue)`: Resolves hook for queue (custom or default fallback).
- `getAssetCount()`: Returns the number of assets registered.
- `assetAt(index)`: Returns the asset at index.
- `hasAsset(asset)`: Returns whether the asset is registered.
- `hasQueue(queue)`: Returns whether the queue exists.
- `isDepositQueue(queue)`: Returns whether the queue is a deposit queue.
- `isPausedQueue(queue)`: Returns whether the queue is paused.
- `getQueueCount()`: Returns total queue count.
- `getQueueCount(asset)`: Returns queue count for an asset.
- `queueAt(asset, index)`: Returns a queue by asset and index.

## Mutable Functions

- `claimShares(account)`: Claims all claimable shares from deposit queues for the specific account.
- `callHook(assets)`: Calls the queue's associated hook and transfers assets to the queue if redeem.
- `setCustomHook(queue, hook)`: Assigns per-queue hook.
- `setDefaultDepositHook(hook)` and `setDefaultRedeemHook(hook)`: Sets global hooks.
- `setQueueLimit(limit)`: Updates global queue cap.
- `setQueueStatus(queue, isPaused)`: Pauses or unpauses a queue.
- `createQueue(version, isDeposit, owner, asset, data)`: Deploys a new queue for an asset.
- `removeQueue(queue)`: Removes a queue that passed `canBeRemoved()`.
- `handleReport(asset, priceD18, depositTimestamp, redeemTimestamp)`: Called by the oracle, distributes protocol fees, and propagates the price report to all queues and calls hooks.

## Events

- `SharesClaimed(account)`
- `CustomHookSet(queue, hook)`
- `QueueCreated(queue, asset, isDepositQueue)`
- `QueueRemoved(queue, asset)`
- `HookCalled(queue, asset, assets, hook)`
- `QueueLimitSet(limit)`
- `SetQueueStatus(queue, isPaused)`
- `DefaultHookSet(hook, isDepositHook)`
- `ReportHandled(asset, priceD18, depositTimestamp, redeemTimestamp, fees)`
