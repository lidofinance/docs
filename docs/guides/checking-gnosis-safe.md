# How to verify the multisig is a Gnosis one

Gnosis multisig contracts are usually deployed from the Gnosis factory contracts. Gnosis has the list of `proxy_factory` contracts addresses deployed to different networks — https://github.com/safe-global/safe-deployments/tree/main/src/assets

## How to verify my multisig is deployed from Gnosis factory

1. Pick the contract version in gnosis UI (settings->safe details) — those usually are `1.0.0`, `1.1.1`, `1.2.0` or `1.3.0`.
2. Open the safe address in network explorer
3. Find the safe creation tx (should be the oldest one in "Internal Transactions" tab & have "Contract Creation" note)
4. Get the address the safe creation tx went to — should be a factory contract
5. Open the corresponding version's folder on github https://github.com/safe-global/safe-deployments/tree/main/src/assets, open `proxy_factory.json` file & find the address in the list of deployed addresses