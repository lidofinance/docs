# Gnosis Multisig Verification

Gnosis multisig contracts are usually deployed from the Gnosis factory contracts. Gnosis has the list of `proxy_factory` contracts addresses deployed to different networks — https://github.com/safe-global/safe-deployments/tree/main/src/assets

## How to verify my multisig is deployed from the Gnosis factory

1. Pick the contract version in gnosis UI (settings → safe details) — those usually are `1.0.0`, `1.1.1`, `1.2.0`, or `1.3.0`.
2. Open the safe address in Network Explorer
3. Find the safe creation transaction (should be the oldest one in the "Internal Transactions" tab and have "Contract Creation" note)
4. Get the address that the safe creation transaction went to — should be a factory contract
5. Open the corresponding version's folder on GitHub https://github.com/safe-global/safe-deployments/tree/main/src/assets, open the `proxy_factory.json` file, and find the address in the list of deployed addresses
