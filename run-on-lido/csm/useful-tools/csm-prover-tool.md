---
sidebar_position: 5
---

# 🔧 CSM Prover Tool

The [CSM prover tool](https://github.com/lidofinance/csm-prover-tool) is a daemon application that listens to the Consensus Layer and Execution Layer and reports module events such as withdrawals, slashings, and balance-related changes to CSM contracts.

Lido contributors are running an instance of the prover tool that serves all CSM Node Operators. However, Node Operators can run their own instance, which will serve their Node Operator IDs exclusively, ensuring that all critical information is delivered to CSM contracts in a timely manner. Please refer to the README file in the repo for the configuration details.

A good example here is the requirement to prove the validator's withdrawal before the bond is released and becomes claimable. If the Lido-owned instance is not functioning correctly for any reason, an instance hosted by Node Operators can serve as a fallback.
