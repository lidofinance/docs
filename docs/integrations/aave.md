---
title: Legacy Aave V2 stETH integration
description: The direct stETH integration with Aave V2 is deprecated; current Aave versions integrate wstETH.
---

# Legacy Aave V2 stETH integration

:::warning V2 only
This notice applies only to Aave V2's direct integration with rebasable stETH. Do not use that legacy market for new positions or integrations.
:::

Aave V3 and Aave V4 integrate wstETH as collateral. Aave V3 includes a [dedicated Lido market](https://aave.com/blog/lido-aave-case-study), and Aave V4 includes wstETH in its [main and dedicated Lido configurations](https://governance.aave.com/t/arfc-aave-v4-activation-on-ethereum-mainnet/24293). These wstETH integrations are separate from the deprecated V2 stETH integration and are not deprecated by this notice.

Aave moved V2 out of its main interface while preserving a [legacy V2 interface](https://v2-market.aave.com/) for users with existing positions to repay, withdraw, or migrate. See [Aave's V2 interface deprecation notice](https://governance.aave.com/t/aave-v2-interface-deprecation/23335) for details.

The operational documentation is retired, but the integration's durable design lesson remains documented in [stETH vs. wstETH](/guides/lido-tokens-integration-guide#aave-v2-integration-lesson).

For current integrations, use [wstETH on Aave](/guides/lido-tokens-integration-guide#sttokens-steth-and-wsteth). Historical Aave V2 contract addresses remain available in [deployed contracts](/deployed-contracts/#aave-v2-integration).
