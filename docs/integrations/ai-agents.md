---
description: Rules of engagement for AI agents that integrate Lido tokens or execute transactions against Lido contracts — address resolution, live-state discipline, and transaction safety rails.
---

# AI agents

This page defines how an AI agent should consume Lido documentation and interact with Lido contracts. It complements the [Lido tokens integration guide](/guides/lido-tokens-integration-guide) and the [Earn integration guide](/earn/integration-guide); it does not replace them.

## Machine-readable surfaces

- [`/llms.txt`](https://docs.lido.fi/llms.txt) — an index of every documentation page with descriptions.
- [`/llms-full.txt`](https://docs.lido.fi/llms-full.txt) — the full documentation content in one file.
- Every page is mirrored as raw markdown at its own path with a `.md` suffix, for example [`/guides/lido-tokens-integration-guide.md`](https://docs.lido.fi/guides/lido-tokens-integration-guide.md).
- [`/tokens.json`](https://docs.lido.fi/tokens.json) — a machine-readable token manifest with addresses, interface support, quirks, and verification probes. The [deployed contracts](/deployed-contracts) and [Earn deployment](/earn/deployment-contracts) pages are the source of truth; the manifest is validated against them on every build.

## Address resolution

1. Never use a contract address from model memory or training data. Resolve addresses only from [deployed contracts](/deployed-contracts), [Earn deployments](/earn/deployment-contracts), or [`/tokens.json`](https://docs.lido.fi/tokens.json).
2. Verify a resolved address on-chain before use: run the verification probes from the manifest or the guides, and record the block number and hash of the check.
3. Identify every token by chain ID plus full contract address. Never resolve a token by symbol.
4. Check canonical recognition on [Lido Multichain](https://lido.fi/how-lido-works/lido-multichain) before using a non-Ethereum deployment. A deployed contract is not proof of current recognition or bridge support.

## Live-state discipline

- Read every operational value from the chain at use time: fees, staking rate limits, oracle membership, queue registration and pause state, synchronous capacity, and liquid assets. The documentation intentionally does not carry these values.
- A dated statement in the documentation records when evidence was checked; it is not a guarantee that the fact still holds. The older the date, the more verification it needs.
- Do not assume interfaces. Consult the [token capabilities table](/guides/lido-tokens-integration-guide#token-capabilities) or probe the contract: the Earn tokens implement neither ERC-4626 nor EIP-2612 permit, and LDO transfers can return `false` instead of reverting.

## Transaction safety rails

An agent constructing or executing transactions must:

1. Simulate first. Run `eth_call` and estimate gas with the intended sender, value, and calldata before submitting anything.
2. Approve exact amounts to exact contracts. Never grant unlimited allowance, and never increase an allowance as an automatic retry.
3. Re-read quotes and limits at the execution block. Staking rate limits, oracle reports, queue capacity, and fee configuration change between blocks; an earlier quote is not an execution guarantee.
4. Handle reverts explicitly. Expected causes include an exhausted staking limit, paused staking or queues, a stale or suspicious oracle report, exhausted synchronous redemption capacity, and insufficient liquid assets.
5. Respect irreversibility. Lido withdrawal requests cannot be canceled. Earn asynchronous redemption requests cannot be canceled. Calling `burn` on an Earn token destroys shares without returning assets.
6. Follow the permit fallback pattern. If a permit-based transaction fails, check the resulting allowance and retry through the allowance path; do not resubmit signatures or escalate approvals.
7. Account for rounding. stETH transfers can move 1–2 wei less than requested, and all share conversions use integer division with contract-defined rounding.
8. Send funds only to documented entry points. Direct transfers to the wstETH referral staker, an Earn token, or an Earn Vault revert or strand funds; Earn deposits and redemptions go through registered queue contracts.

## Verification discipline

Record the block number, block hash, and RPC source of every verification. Re-verify after implementation upgrades, before increasing exposure, and whenever a documented date is older than the integration's freshness policy. Report what was actually checked; a successful read of one deployment does not verify another.
