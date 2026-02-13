# stETH on Optimism Parameters Validation

## Deployment scope

The full list of the contracts in scope is provided in the Lido Multichain section for [Optimism](https://docs.lido.fi/deployed-contracts/#optimism).

:::note
Levers and access control lists for L1 and L2 bridge endpoints stay the same and correspond to the [reference architecture and permissions setup](/token-guides/cross-chain-tokens-guide.md#reference-wsteth-rollup-architecture-and-permissions-setup).

This document covers incremental changes proposed with the stETH on Optimism deployment.
:::

## Ethereum part

### LidoLocator

:::info
A new implementation containing the address of a new `TokenRateNotifier` instance for [`postTokenRebaseReceiver`](https://docs.lido.fi/contracts/lido-locator#posttokenrebasereceiver)
:::

### TokenRateNotifier

:::info
A standalone (non-proxy) contract proposed to plug to the protocol as a new [token rebase receiver](/contracts/lido-locator#posttokenrebasereceiver).

The contract maintains token rate observers that needs to be notified about token rate changes.

With the current setup the only single observer is connected upfront: the `OpStackTokenRatePusher` contract instance
for pushing the token rate to Optimism.
:::

```bash
# Account that is allowed to add or remove pushers.
# set to the be the Lido DAO Agent governance contract
owner=0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c

# Address of Lido Core protocol contract
# corresponds to the stETH token address on Mainnet
LIDO=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84

# Max amount of token rate observers that can be added inside this pusher
MAX_OBSERVERS_COUNT=32

# Current length of observers
observersLength=1

# The initially added `OpStackTokenRatePusher` observer for Optimism
# see https://docs.lido.fi/deployed-contracts/#optimism
observers[0]=0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE
```

### OpStackTokenRatePusher

:::info
A standalone (non-proxy) contract to be a receiver for the `TokenRateNotifier` contract above, and allowing to push an up-to-date wstETH/stETH [token rate](/contracts/wsteth#stethpertoken) as a part of the `AccountingOracle` report [processing](/contracts/accounting-oracle#report-processing).

The rate gets pushed to an `TokenRateOracle` instance on Optimism.
:::

```bash
# Address of the non-rebasable token (wstETH) on L1 to deploy the bridge/gateway for.
WSTETH=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Precision for sending stETH / wstETH token rate
# i.e.: `wsteth.getStETHByWstETH(10 ** TOKEN_RATE_DECIMALS)`
TOKEN_RATE_DECIMALS=27

# The address of the `TokenRateOracle` contract on Optimism
L2_TOKEN_RATE_ORACLE=0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0

# Beacon Chain (Consensus Layer) genesis timestamp
GENESIS_TIME=1606824023

# Seconds per a single slot according to the Ethereum CL spec
SECONDS_PER_SLOT=12

# Address of the AccountingOracle of the Lido protocol.
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

:::

```bash
# Address of the L2 token bridge counterpart proxy endpoint for stETH and wstETH.
l2TokenBridge=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# Address of the non-rebasable token (L1 wstETH) to deploy the bridge/gateway for.
L1_TOKEN_NON_REBASABLE=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of L1 wstETH (the same as L1_NON_REBASABLE_TOKEN)
WSTETH=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of the rebasable token (L1 stETH) to deploy the bridge/gateway for.
L1_TOKEN_REBASABLE=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84

# Address of the L2 non-rebasable token (L2 wstETH) proxy on L2.
L2_TOKEN_NON_REBASABLE=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb

# Address of the L2 rebasable token (L2 stETH) proxy on L2.
L2_TOKEN_REBASABLE=0x76A50b8c7349cCDDb7578c6627e79b5d99D24138

# Optimism messenger contract `L1CrossDomainMessengerProxy`
# https://docs.optimism.io/chain/addresses#ethereum-l1
MESSENGER=0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1

# Precision for sending stETH / wstETH token rate
# i.e.: `wsteth.getStETHByWstETH(10 ** TOKEN_RATE_DECIMALS)`
TOKEN_RATE_DECIMALS=27

# Beacon Chain (Consensus Layer) genesis timestamp
GENESIS_TIME=1606824023

# Seconds per a single slot according to the Ethereum CL spec
SECONDS_PER_SLOT=12

# Address of the AccountingOracle of Core Lido protocol.
ACCOUNTING_ORACLE=0x852deD011285fe67063a08005c71a85690503Cee
```

## Optimism part

### TokenRateOracle

:::info
A source of truth contract (proxy and implementation) for wstETH/stETH token rate on the Optimism side. Used for `wrap` and `unwrap` on Optimism side, including wstETH internal bookkeeping when bridging stETH back and forth.

:::

```bash
# Precision for receiving and storing stETH / wstETH token rate
DECIMALS=27

# Address of the L1 token rate pusher (OpStackTokenRatePusher) instance
L1_TOKEN_RATE_PUSHER=0xd54c1c6413caac3477AC14b2a80D5398E3c32FfE

# Address of L2 token bridge proxy.
L2_ERC20_TOKEN_BRIDGE=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# Optimism messenger contract `L2CrossDomainMessenger`
# https://docs.optimism.io/chain/addresses#op-mainnet-l2
MESSENGER=0x4200000000000000000000000000000000000007

# A time period when token rate can be considered outdated.
TOKEN_RATE_OUTDATED_DELAY=86400 # 1 day due to the regular stETH token rebase cadence

# A time difference between received l1Timestamp and L2 block.timestamp when token rate can be considered outdated.
MAX_ALLOWED_L2_TO_L1_CLOCK_LAG=86400 # 1 day

# Allowed token rate deviation per day in basis points.
MAX_ALLOWED_TOKEN_RATE_DEVIATION_PER_DAY_BP=500 # 500 BP = 5%

# The maximum allowed time difference between the current time and the last received
# token rate update that can be set during a pause. This is required to limit the pause role
# and mitigate potential economic attacks.
OLDEST_RATE_ALLOWED_IN_PAUSE_TIME_SPAN=86400 # 1 day

# The maximum delta time that is allowed between two L1 timestamps of token rate updates.
MIN_TIME_BETWEEN_TOKEN_RATE_UPDATES=3600 # 1 hour

# Minimal sane token rate to accept (sanity check)
MIN_SANE_TOKEN_RATE=10000000000000000000000000 # 0.01 * 10^27

# Maximal sane token rate to accept (sanity check)
MAX_SANE_TOKEN_RATE=100000000000000000000000000000 # 100 * 10^27

# Enable token rate oracle updates
TOKEN_RATE_UPDATE_ENABLED=true

# Roles granting the permission to resume updating rate.
# Optimism Governance Bridge Executor
TOKEN_RATE_UPDATE_ENABLERS=["0xefa0db536d2c8089685630fafe88cf7805966fc3"]

# Roles granting the permission to pause updating rate.
# Optimism Governance Bridge Executor
# Emergency brakes committee
TOKEN_RATE_UPDATE_DISABLERS=["0xefa0db536d2c8089685630fafe88cf7805966fc3", "0x4Cf8fE0A4c2539F7EFDD2047d8A5D46F14613088"]

# Address of the account to grant the DEFAULT_ADMIN_ROLE
# Optimism Governance Bridge Executor
TOKEN_RATE_ORACLE_ADMIN=0xefa0db536d2c8089685630fafe88cf7805966fc3

```

### ERC20BridgedPermit for wstETH

:::info
A new implementation for the wstETH (non-rebasable) token deployed on Optimism.

Provides a way to seamlessly wrap/unwrap to stETH and implements new permit signature standards (ERC-2612 and ERC-1271).

:::

```bash
# Bridge address that can mint/burn wstETH on L2
bridge=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# Token name for wstETH on Optimism
name="Wrapped liquid staked Ether 2.0"

# Token symbol for wstETH on Optimism
symbol="wstETH"

# Token decimals
decimals=18
```

### ERC20RebasableBridgedPermit for stETH

:::info
An ERC-20 compatible contract (proxy and implementation) for the rebasable stETH token deployed on Optimism.

Provides a way to seamlessly wrap/unwrap from wstETH and implements permit signature standards (ERC-2612 and ERC-1271).

:::

```bash
# Bridge address that can mint/burn wstETH on L2
L2_ERC20_TOKEN_BRIDGE=0x8E01013243a96601a86eb3153F0d9Fa4fbFb6957

# Token rate oracle on Optimism for wstETH/stETH token rate retrieval upon wrap and unwrap
TOKEN_RATE_ORACLE=0x294ED1f214F4e0ecAE31C3Eae4F04EBB3b36C9d0

# Token rate decimals precision used by the token rate oracle on Optimism
TOKEN_RATE_ORACLE_DECIMALS=27

# wstETH on Optimism address
# stETH on Optimism is 'wrapped' wstETH technically
TOKEN_TO_WRAP_FROM=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb

# Token name for stETH on Optimism
name="Liquid staked Ether 2.0"

# Token symbol for stETH on Optimism
symbol="stETH"

# Token decimals
decimals=18
```

### L2ERC20ExtendedTokensBridge

:::info
A new implementation for the previously deployed `L2ERC20TokenBridge` L2 endpoint proxy contract to be compatible with both wstETH and stETH tokens bridging flows, mints and burns wstETH on the Optimism side.

:::

```bash
# Address of L1 token bridge proxy.
l1TokenBridge=0x76943C0D61395d8F2edF9060e1533529cAe05dE6

# Address of the non-rebasable token (L1 wstETH) to deploy the bridge/gateway for.
L1_TOKEN_NON_REBASABLE=0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0

# Address of the rebasable token (L1 stETH) to deploy the bridge/gateway for.
L1_TOKEN_REBASABLE=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84

# Address of the L2 non-rebasable token (L2 wstETH) proxy on L2.
L2_TOKEN_NON_REBASABLE=0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb

# Address of the L2 rebasable token (L2 stETH) proxy on L2.
L2_TOKEN_REBASABLE=0x76A50b8c7349cCDDb7578c6627e79b5d99D24138

# Optimism messenger contract `L2CrossDomainMessenger`
# https://docs.optimism.io/chain/addresses#op-mainnet-l2
MESSENGER=0x4200000000000000000000000000000000000007
```
