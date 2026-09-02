---
sidebar_position: 3
---

# How to Update Strategy Implementation

The strategy contract sits behind an `OssifiableProxy` whose admin is the pool's Timelock Controller, so its implementation can be replaced. The usual reason to replace it is a constructor flag that no transaction can change — most often `ALLOW_LIST_ENABLED`, which decides whether anyone may supply through the strategy or only the addresses on its list. Opening a private strategy pool to the public means deploying a fresh implementation with that flag off and pointing the proxy at it.

An immutable like `ALLOW_LIST_ENABLED` lives in the implementation's bytecode rather than in storage, which is why swapping the implementation changes it. Storage stays with the proxy, so roles, forwarders and open positions carry over untouched.

The same two steps apply to any strategy upgrade: deploy the implementation, then move the proxy to it through the timelock.

Everything below uses the Lido EarnETH strategy and its factory as the example. A custom strategy takes the same two steps, but its factory may expect different deployment arguments and its implementation may carry different immutables — check its own code before starting.

## Which allowlist an upgrade changes

A strategy pool has two.

| Allowlist | Where | What it does |
| --- | --- | --- |
| Pool allowlist | `StvPool` / `StvStETHPool` | Always on for a strategy pool, and holds the strategy alone. Keeps every deposit routed through the strategy. |
| Strategy allowlist | the strategy | Gates who may call `supply`. Set by `--allowList` at [deployment](../../builders/defi-wrapper/multi-user-staking-with-earn-eth.md#deployment-of-stvstrategypool-with-the-lido-earn-eth-strategy) and immutable afterwards. |

An upgrade turns off the second one. The pool allowlist stays as it is.

Read the current state with:

```bash
yarn start dw uc wo r allow-list <strategyAddress>
```

With the allowlist enabled the command prints the `ALLOW_LIST_MANAGER_ROLE` holders and the listed addresses; with it disabled it says so and prints nothing further.

## Step 1 — Deploy the new implementation

Deploy from the **same factory** the original implementation came from, so the bytecode is identical and only the constructor argument differs. The call is `deploy(address pool, bytes deployBytes)`:

- `pool` — the pool proxy the strategy belongs to, and it has to be the same pool. The strategy stores it as an immutable, so a different address here produces an implementation the proxy cannot use.
- `deployBytes` — for `MellowStrategyFactory`, an ABI-encoded `bool` that becomes `ALLOW_LIST_ENABLED`. `false` is 32 zero bytes: `0x0000000000000000000000000000000000000000000000000000000000000000`.

The call is permissionless and only creates a contract, so any wallet can send it. There is no CLI command for it; use Etherscan's *Write Contract* tab or `cast`:

```bash
# simulate first: deploy() returns the address the implementation will get
cast call <strategyFactoryAddress> "deploy(address,bytes)(address)" \
  <poolAddress> 0x0000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url <rpcUrl>

cast send <strategyFactoryAddress> "deploy(address,bytes)" \
  <poolAddress> 0x0000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url <rpcUrl> --interactive
```

:::note
The implementation is created inside the transaction rather than by it, so the receipt's `contractAddress` field stays empty. Take the address from the `cast call` simulation above, or find it on Etherscan under the transaction's *Internal Txns* tab.
:::

Check the new implementation:

```bash
cast call <newImplementationAddress> "ALLOW_LIST_ENABLED()(bool)" --rpc-url <rpcUrl>  # false
cast call <newImplementationAddress> "POOL()(address)" --rpc-url <rpcUrl>            # your pool
```

Each factory decides what `deployBytes` means. `MellowStrategyFactory` decodes it as that single bool; a custom factory defines its own encoding — see [custom strategies](../../builders/defi-wrapper/multi-user-staking-with-custom-strategy.md).

## Step 2 — Upgrade the proxy through the timelock

The strategy proxy's admin is the Timelock Controller, so the upgrade is an ordinary proposal: propose, wait out the delay, execute with the **same salt**. Generate a fresh 32-byte salt for this operation rather than reusing one from an earlier proposal:

```bash
openssl rand -hex 32
```

Confirm the admin:

```bash
yarn start dw uc tg proxy r get-admin <strategyProxyAddress>
```

Then propose:

```bash
yarn start dw uc tg proxy w propose-upgrade-to \
  <timelockAddress> <strategyProxyAddress> <newImplementationAddress> --salt <salt>
```

Sign and send it from the proposer, wait for the delay to pass, and execute from the executor:

```bash
yarn start dw uc tg proxy w execute-upgrade-to \
  <timelockAddress> <strategyProxyAddress> <newImplementationAddress> --salt <salt>
```

Verify the proxy points at the new implementation:

```bash
yarn start dw uc tg proxy r get-implementation <strategyProxyAddress>
```

Both commands encode the same `proxy__upgradeTo` call, so a mismatch in address or salt between the two means the execute finds no scheduled operation. Governance mechanics are covered in [Governance, upgrades and pausing](../../concepts-and-reference/defi-wrapper-technical-design.md#38-governance-upgrades-and-pausing).

## After the upgrade

The strategy is public from the moment the execute lands: any address can supply through it, and the strategy's `ALLOW_LIST_MANAGER_ROLE` no longer affects who may do so.

If the pool was started with a [PDG shortcut bootstrap](./pdg-shortcut-bootstrap-guide.md), do the upgrade **first** and the bootstrap cleanup after. Nobody outside the list can deposit while the strategy allowlist is on, so until the upgrade is done the pool cannot collect the ETH that finalizing the operator's withdrawal request needs.
