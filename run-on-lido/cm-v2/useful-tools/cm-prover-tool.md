---
sidebar_position: 1
---

# 🔧 CM Prover Tool

The [CSM prover tool](https://github.com/lidofinance/csm-prover-tool) is a daemon application for the Curated Module v2 and CSM-like modules. It listens to the Consensus Layer and Execution Layer and reports module events such as withdrawals, slashings, consolidations, and balance-related changes.

Lido contributors are running an instance of the prover-tool that serves all CMv2 Node Operators. However, Node Operators can run their own instance of the prover-tool, which will serve their Node Operator IDs exclusively, ensuring that all critical information is delivered to CMv2 contracts in a timely manner. Please refer to the README file in the repo for the configuration details.

A good example here is the requirement to prove the validator's withdrawal before the bond is released and becomes claimable. If the Lido-owned instance is not functioning correctly for any reason, an instance hosted by Node Operators can serve as a fallback.
