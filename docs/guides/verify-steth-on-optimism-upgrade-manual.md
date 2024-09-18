# stETH on Optimism parameters for Mainnet

## Deployment scope

The full list of the contracts in scope is provided in the Lido Multichain section for [Optimism](https://docs.lido.fi/deployed-contracts/#optimism).

## Ethereum part

### TokenRateNotifier

:::info
A standalone (non-proxy) contract proposed to plug to the protocol as a new [token rebase receiver](/contracts/lido-locator#posttokenrebasereceiver).

Deployed address: [`0xe6793B9e4FbA7DE0ee833F9D02bba7DB5EB27823`](https://etherscan.io/address/0xe6793B9e4FbA7DE0ee833F9D02bba7DB5EB27823)
:::

```bash
# Account that is allowed to add or remove pushers.
TOKEN_RATE_NOTIFIER_OWNER=0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c

# Address of Lido Core protocol contract
LIDO=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
```

### OpStackTokenRatePusher

:::info
A standalone (non-proxy) contract to be a receiver for the `TokenRateNotifier` contract above, and allowing to push an up-to-date wstETH/stETH [token rate](/contracts/wsteth#stethpertoken) as a part of the `AccountingOracle` report [processing](/contracts/accounting-oracle#report-processing).

Deployed address: [`0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE`](https://etherscan.io/address/0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE)
:::

```bash
# Address of the non-rebasable token (wstETH) to deploy the bridge/gateway for.
L1_NON_REBASABLE_TOKEN=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of the AccountingOracle of Core Lido protocol.
ACCOUNTING_ORACLE=0x852deD011285fe67063a08005c71a85690503Cee

# @notice Gas limit for L2 required to finish pushing token rate on L2 side.
# Client pays for gas on L2 by burning it on L1.
# Depends linearly on deposit data length and gas used for finalizing deposit on L2.
# Formula to find value:
# (gas cost of `L2Bridge.finalizeDeposit() + OptimismPortal.minimumGasLimit(depositData.length)) * 1.5`
L2_GAS_LIMIT_FOR_PUSHING_TOKEN_RATE=300000
```

### L1LidoTokensBridge

:::info
A new implementation for the previously deployed `L1ERC20TokenBridge` L1 endpoint proxy contract to be compatible with both wstETH and stETH tokens bridging flows, escrows wstETH on the Ethereum side.

- Deployed `L1LidoTokensBridge` address: [`0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE`](https://etherscan.io/address/0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE)
- Proxy address: [`0x76943C0D61395d8F2edF9060e1533529cAe05dE6`](https://etherscan.io/address/0x76943C0D61395d8F2edF9060e1533529cAe05dE6)
- Current (wstETH-only) `L1ERC20TokenBridge` implementation: [`0x29C5c51A031165CE62F964966A6399b81165EFA4`](https://etherscan.io/address/0x29C5c51A031165CE62F964966A6399b81165EFA4)

:::

```bash
# Address of L2 token bridge proxy. Should be provided only for upgrade.
L2_TOKEN_BRIDGE=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# Address of the non-rebasable token (wstETH) to deploy the bridge/gateway for.
L1_NON_REBASABLE_TOKEN=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of the rebasable token (stETH) to deploy the bridge/gateway for.
L1_REBASABLE_TOKEN=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84

# Address of the L2 non-rebasable token (L2 wstETH) proxy on L2.
L2_TOKEN_NON_REBASABLE=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb

# Address of the AccountingOracle of Core Lido protocol.
ACCOUNTING_ORACLE=0x852deD011285fe67063a08005c71a85690503Cee
```

## Optimism part

### TokenRateOracle

:::info
A source of truth contract (proxy and implementation) for wstETH/stETH token rate on the Optimism side. Used for `wrap` and `unwrap` on Optimism side, including wstETH internal bookkeeping when bridging stETH back and forth.

- Deployed proxy address: [`0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0`](https://optimistic.etherscan.io/address/0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0)
- Deployed implementation address: [`0x4bF0d419793d8722b8391efaD4c9cE78F460CEd3`](https://optimistic.etherscan.io/address/0x4bF0d419793d8722b8391efaD4c9cE78F460CEd3)

:::

```bash
# Address of L2 token bridge proxy. Should be provided only for upgrade.
L2_TOKEN_BRIDGE=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# A time period when token rate can be considered outdated.
TOKEN_RATE_OUTDATED_DELAY=86400

# A time difference between received l1Timestamp and L2 block.timestamp when token rate can be considered outdated.
MAX_ALLOWED_L2_TO_L1_CLOCK_LAG=172800

# Allowed token rate deviation per day in basic points.
MAX_ALLOWED_TOKEN_RATE_DEVIATION_PER_DAY_BP=500

# The maximum allowed time difference between the current time and the last received
# token rate update that can be set during a pause. This is required to limit the pause role
# and mitigate potential economic attacks.
OLDEST_RATE_ALLOWED_IN_PAUSE_TIME_SPAN=86400

# The maximum delta time that is allowed between two L1 timestamps of token rate updates.
MIN_TIME_BETWEEN_TOKEN_RATE_UPDATES=3600

# Enable token rate oracle updates
TOKEN_RATE_UPDATE_ENABLED=true

# Roles granting the permission to resume updating rate.
TOKEN_RATE_UPDATE_ENABLERS=["0xefa0db536d2c8089685630fafe88cf7805966fc3"]

# Roles granting the permission to pause updating rate.
TOKEN_RATE_UPDATE_DISABLERS=["0xefa0db536d2c8089685630fafe88cf7805966fc3", "0x4Cf8fE0A4c2539F7EFDD2047d8A5D46F14613088"]

# Address of the account to grant the DEFAULT_ADMIN_ROLE
TOKEN_RATE_ORACLE_ADMIN=0xefa0db536d2c8089685630fafe88cf7805966fc3

# Initial wstETH/stETH token rate, uses 10**27 precision.
INITIAL_TOKEN_RATE_VALUE=1000000000000000000000000000

# Initial L1 time when rate was updated on L1 side.
INITIAL_TOKEN_RATE_L1_TIMESTAMP=1719765972
```

### ERC20BridgedPermit for wstETH

:::info
A new implementation for the wstETH (non-rebasable) token deployed on Optimism.

Provides a way to seamlessly wrap/unwrap to stETH and implements new permit signature standards (ERC-2612 and ERC-1271).

- Deployed `ERC20BridgedPermit` address: [`0xFe57042De76c8D6B1DF0E9E2047329fd3e2B7334`](https://optimistic.etherscan.io/address/0xFe57042De76c8D6B1DF0E9E2047329fd3e2B7334)
- Proxy address: [`0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb`](https://optimistic.etherscan.io/address/0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb)
- Current `ERC20Bridged` implementation for wstETH: [`0x92834c37dF982A13bb0f8C3F6608E26F0546538e`](https://optimistic.etherscan.io/address/0x92834c37dF982A13bb0f8C3F6608E26F0546538e)

:::

```bash
# Address of the L2 non-rebasable token (L2 wstETH) proxy on L2.
L2_TOKEN_NON_REBASABLE=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb
L2_TOKEN_NON_REBASABLE_VERSION=1
```

### ERC20RebasableBridgedPermit for stETH

:::info
An ERC-20 compatible contract (proxy and implementation) for the rebasable stETH token deployed on Optimism.

Compatible with a seamlessly wrap/unwrap with wstETH and implements permit signature standards (ERC-2612 and ERC-1271).

- Deployed proxy address: [`0x76A50b8c7349cCDDb7578c6627e79b5d99D24138`](https://optimistic.etherscan.io/address/0x76A50b8c7349cCDDb7578c6627e79b5d99D24138)
- Deployed implementation address: [`0xe9b65dA5DcBe92f1b397991C464FF568Dc98D761`](https://optimistic.etherscan.io/address/0xe9b65dA5DcBe92f1b397991C464FF568Dc98D761)

:::

```bash
L2_TOKEN_REBASABLE_VERSION=1
```

### L2ERC20ExtendedTokensBridge

:::info
A new implementation for the previously deployed `L2ERC20TokenBridge` L2 endpoint proxy contract to be compatible with both wstETH and stETH tokens bridging flows, mints and burns wstETH on the Optimism side.

- Deployed `L2ERC20ExtendedTokensBridge` address: [`0x2734602C0CEbbA68662552CacD5553370B283E2E`](https://optimistic.etherscan.io/address/0x2734602C0CEbbA68662552CacD5553370B283E2E)
- Proxy address: [`0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957`](https://optimistic.etherscan.io/address/0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957)
- Current (wstETH-only) `L2ERC20TokenBridge` implementation: [`0x23B96aDD54c479C6784Dd504670B5376B808f4C7`](https://optimistic.etherscan.io/address/0x23B96aDD54c479C6784Dd504670B5376B808f4C7)

:::

```bash
# Address of L1 token bridge proxy.
L1_TOKEN_BRIDGE=0x76943C0D61395d8F2edF9060e1533529cAe05dE6

# Address of the non-rebasable token (wstETH) to deploy the bridge/gateway for.
L1_NON_REBASABLE_TOKEN=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of the rebasable token (stETH) to deploy the bridge/gateway for.
L1_REBASABLE_TOKEN=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84

# Address of the L2 non-rebasable token (L2 wstETH) proxy on L2.
L2_TOKEN_NON_REBASABLE=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb
```
