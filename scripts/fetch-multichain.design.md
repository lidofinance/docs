# Design plan: fetching multichain addresses from `lidofinance/multichain`

Status: **V1 implemented** — `scripts/fetch-multichain.js` (564 lines incl. comments),
`scripts/multichain-map.js` (112 lines), `npm run fetch-multichain`. Uncommitted; nothing in `docs/`
was modified. §10 records the verification runs. Sections below describe what the code does; where
implementing changed a rule, the rule was corrected here rather than left aspirational.
Reasoning frame: FPF — A.7 (strict distinction), A.6.B (L/A/D/E claim square), A.10 (evidence
provenance), C.11 (local decisions), G.11 (refresh), C.2.P (precision on "source of truth").

Revision: measured against `feat/diffyscan-validation` at commit **`a5b9d23`** (175 rows,
`updatedAt 2026-08-14`), which adds the 35 CCIP Direct Staking rows and `publicRefs` docs.lido.fi
anchors on 144 rows. Those anchors replace the HTML region markers and the hand-declared region map
an earlier draft required — see §4.2. `main` is still 140 rows / `2026-08-07`; V1 therefore needs
`--ref` from day one.

**The edition pin is the commit, not the branch name and not `updatedAt`.** The first draft measured
`4ce1c1f`; upstream then shipped `a5b9d23`, which rewrote 35 rows' `source` and one `knownGaps` entry
while leaving `updatedAt` at `2026-08-14`. Every number in this document was re-run against `a5b9d23`
on 2026-08-17 and all of them hold; the one claim that decayed is recorded in §2 rather than deleted,
and the refresh consequence is §7's last failure row and §8's Refresh line.

---

## TL;DR

One script, `scripts/fetch-multichain.js`, fetches `ledger.json` from `lidofinance/multichain` and
checks it against the docs **using the ledger's own `publicRefs` anchors as the map**: each row says
which `docs.lido.fi` section publishes it, so the script resolves anchor → heading → section span and
asserts the address is inside it, linked to that network's explorer (or Safe app). No markers added to
the markdown, no hand-written region map, no writes in V1.

Why this works: of 175 rows, 144 carry a docs anchor and **144/144 resolve to a real heading and have
their address inside exactly that section**. Zero broken anchors, zero misplacements — measured, not
assumed. Of those 144, **141** are also linked to their own network's explorer or a Safe front-end; the
3 failures are genuine (Swellchain's addresses are published as bare code spans).

- **Authority split:** the ledger is the checked upstream for `(contractId, networkId, kind) → address`;
  the docs own labels, ordering, grouping, annotations, link style, and section structure (§4.1).
- **Regions come from the ledger, not from us:** `publicRefs` anchors, verified against the heading
  tree in the markdown (§4.2). Docusaurus already fails the build on a broken anchor.
- **Identity is `(networkId, address)`, never a bare hex** (§4.3) — the branch's own `knownGaps` says
  it: *"an address-only comparison against this ledger will produce false matches."* True here:
  `0x328de900…` is Optimism's L1 adapter, Arbitrum's `PriceOracle`, and the `CustomSenderReferral`
  proxy on three chains; `0x301cBCDA…` is a `LidoCustomReceiver` impl on L1 and a `PriceOracle` on three L2s.
- **Docs-side config the ledger has no field for:** explorer bases + Safe short names per network,
  route→file mapping, the sections to scan for doc-only addresses, third-party address allowlist (§6).
- **Drift is detected, not repaired, in V1:** a changed upstream address surfaces as an `absent` row
  plus an unclaimed hex in the same section. Auto-rewriting needs a label→`contractId` map, which is V2 (§8).
- **~150 LOC + ~40-line config, ~0.3 day.** Smaller than the marker-based draft and it covers 144 rows
  instead of 52.

### Current gaps, both directions (branch ledger vs today's docs)

**ledger → docs — 6 addresses in the ledger, in no docs page** (all implementations):

- `linea-ethereum-l1-token-bridge` impl `0xF0e003F0…` · `linea-linea-l2-token-bridge` impl `0x4a496167…`
- `bsc-ethereum-wsteth-wormhole-transceiver` impl `0x3CE1230F…` ·
  `bsc-ethereum-wsteth-axelar-transceiver` impl `0x87fc4B27…` ·
  `bsc-bsc-wsteth-axelar-transceiver` impl `0xA1eBb6A4…`
- `hoodi-hoodi-steth-token-archive` impl `0x87836090…`

**ledger → docs — 31 rows carry no docs anchor**, so nothing links them to a page: the whole BSC/NTT
family (8 on `eip155:1`, 10 on `eip155:56`), Linea's bridge admins and archives (6), Scroll (4),
Polygon (2), one hoodi archive. Their addresses *are* in the docs (except the 6 above) — the refs are
simply missing, which is the one thing holding V1's checkable coverage at 144/175.

**docs → ledger — addresses the docs publish with no ledger row** (**54 = 40 reported + 14
allowlisted**, counting display positions in the `gapScan` scopes; the same count against `main` is
86 = 72 + 14):

- § Lido Multichain live chains — **none left.** Of the 16 chain blocks the report scans (the 6 live
  chains, § Ethereum (common) CCIP DS, and the 9 § Legacy chain trees), **7 are now clean**:
  Arbitrum, Optimism, Base, Linea, BSC, Unichain and § Ethereum (common) CCIP DS. Against `main`
  only BSC and Unichain were.
- **§ Legacy chains, 40 bullets, `index.md` L812–889** — the ledger carries each chain's L2 token
  (+ admin) and governance executor, but no L1↔L2 bridge or gateway:
  - zkSync Era L812–819 (6): `L1Executor` proxy+impl, `L1ERC20Bridge` proxy+impl, `L2ERC20Bridge` proxy+impl
  - Scroll L832–837 (5): `L1LidoGateway` proxy+impl, its `ProxyAdmin`, `L2LidoGateway` proxy+impl
  - Soneium L866–876 (7): `OpStackTokenRatePusher`, `L1LidoTokensBridge` proxy+impl, `TokenRateOracle`
    proxy+impl, `L2ERC20ExtendedTokensBridge` proxy+impl
  - Mode L824–829 · Mantle L842–847 · Swellchain L850–855 · Zircuit L858–863 · Lisk L884–889 (4 each):
    `L1ERC20TokenBridge` proxy+impl, `L2ERC20TokenBridge` proxy+impl
  - Polygon PoS L879–880 (2): `ERC20Predicate` proxy+impl
- **Not Lido deployments** (14 allowlisted, never reported as gaps): 8 third-party Chainlink feeds under
  § Price Feeds L284–292, and 6 pool addresses under § Lido Multichain Liquidity pools L739–747.
  The 4 `PriceOracle` wrappers in that same § Price Feeds block *are* ledger rows.

**docs → ledger — 3 addresses published unlinked:** Swellchain wstETH proxy/impl and its executor
(L852–856) are bare code spans with no explorer link. V1's link check catches these.

---

## 1. What this is for

`lidofinance/multichain` publishes [`ledger.json`](https://github.com/lidofinance/multichain/blob/main/ledger.json):
a machine-readable catalogue of Lido deployments across networks. This repo publishes the same
addresses by hand in `docs/deployed-contracts/index.md` (§ Lido Multichain, § Legacy Contracts,
§ Price Feeds, § Core Protocol), `docs/deployed-contracts/hoodi.md` and `docs/multisigs/emergency-brakes.md`.

Since the `feat/diffyscan-validation` branch, most ledger rows also carry a `publicRefs` pointer at the
exact docs anchor that publishes them. That makes a **bidirectional integrity check** possible with
almost no configuration: the ledger says where each address should appear; the script verifies it does,
in that section, under the right link. V1 is that check. It is closer in spirit to
`fetch-msig-quorums.js` (walk the markdown, compare against an external record, report per line) than
to `fetch-audits.js` (regenerate a whole page), but unlike either it writes nothing.

## 2. Upstream shape (`feat/diffyscan-validation` @ `a5b9d23`, `updatedAt 2026-08-14`, `schemaVersion 0.2.0`)

| | |
| --- | --- |
| `deployments` | 175 entries (main: 140), flat array; one entry = one address on one network |
| `networks` | 17, keyed CAIP-2 (`eip155:1`, `eip155:42161`, …) with `networkName`/`chainFamily`/`environment` |
| identity | `deploymentId` = `networkId:address`; `contractId` = protocol role (shared by proxy+impl); `-archive` for superseded roles; admins get their own `contractId` with `-admin` + `deploymentKind: proxy-admin` |
| per entry | `deploymentKind` ∈ {proxy, implementation, standalone, proxy-admin, library}, `contractName` (Solidity name, *not* a docs label), `source` {repositoryUrl, commit?, path?}, `auditReportRefs`, optional `proxy.{proxyKind, implementationDeploymentId}`, `publicRefs` (144 rows) |
| upstream invariants we lean on | one live entry per `(contractId, networkId, deploymentKind)`; `deploymentId` = `networkId:address`; address unique per network — all enforced by their validator |
| absent from upstream | explorer URLs, Safe short names, docs prose labels, lifecycle/sunset status |

**The `publicRefs` measurement** (the load-bearing number for §4.2). 144 rows carry a `docs.lido.fi`
ref. Resolving route → repo file, anchor → heading, heading → section span (to the next same-or-higher
heading):

| result | rows |
| --- | --- |
| address present inside the section its anchor names | **144** |
| ├ linked to that network's own block explorer | 126 |
| ├ linked via a Safe URL carrying `safe=<shortName>:<address>` | 15 |
| └ address present but **unlinked** — Swellchain wstETH proxy/impl + executor | 3 |
| anchor does not resolve to a heading | 0 |
| address in the file but outside the named section | 0 |
| address absent from the file | 0 |
| no `docs.lido.fi` ref at all (cannot be checked) | 31 |

Anchor granularity is uneven but harmless: some rows point at a chain heading (`#arbitrum`, 7 rows),
others at a part heading (`#arbitrum-part`, 6), and 25 rows share the coarse `#legacy-contracts`.
Coarser anchors weaken localisation, not correctness — the check is "inside this span".

One trap found while measuring, which fixes the rule in L-2: inside a coarse section the same hex can
appear once per network — § Price Feeds lists `PriceOracle` `0x301cBCDA…` on Optimism, Base *and* Linea
— so "the first line holding this address" resolves to the wrong network's bullet and reports a false
mismatch. The check must be "**there exists** a link in the section whose target holds this address and
whose host is *this row's* network explorer". Under the naive rule, Base and Linea rows appeared to link
to `optimistic.etherscan.io`; under the correct rule all three pass.

Relevant to us from the branch's `knownGaps`: `source.repositoryUrl` follows two different rules
across the ledger without marking which. V1 therefore publishes nothing from `source` (§7).

That non-goal originally rested on two grounds, and one has lapsed — recorded here rather than
deleted, because the lapse is the evidence that a branch name is not an edition. At `4ce1c1f` no CCIP
Direct Staking row recorded a `source.commit` (third-party fork pinned by branch, not revision); at
`a5b9d23` **every one of them does**, Diffyscan-confirmed across 15 cohorts, and the `knownGaps` entry
was rewritten to say so. The non-goal now stands on the `repositoryUrl` ground alone, which is
unchanged.

## 3. FPF frame

**A.7 (strict distinction).** Three different things, never collapsed:

| A.7 position | here |
| --- | --- |
| EntityOfConcern | the deployed contract at an address on a network (on-chain) |
| Description episteme | the ledger record about it (`contractId`, kind, source, audit refs) |
| Publication carrier | `ledger.json` upstream; `index.md` here; the rendered page |

The script compares **carriers**. It performs no chain read, so it establishes nothing about the
deployment itself (contrast `fetch-msig-quorums.js`, which does read chain state via `eth_call`). Per
A.7:5.5 provenance addresses carriers, so every statement the run makes has the form "this section
agrees / disagrees with ledger snapshot `<edition>`" — never "verified".

**C.2.P (precision).** "Source of truth" appears nowhere in the tool, its output, or the docs. The
upstream README states its own non-goals: a deployment catalogue with source pointers, not a
truth-producing registry. A `publicRefs` pointer likewise establishes *where a claim is published*,
not that it is correct.

**A.10 (evidence provenance).** Each run prints the A.10:4.4 fields it can fill: source carrier
(`raw.githubusercontent.com/lidofinance/multichain/<ref>/ledger.json`), edition (`ref` + resolved
commit SHA when the API answers), source currentness (`updatedAt`, `schemaVersion`), the dated fetch
occurrence, and the bounded use (which sections were compared). Per A.10:4.6, availability and
currentness are separate fields and only the edition is recoverable by us: `updatedAt` is upstream's
own currentness assertion, and §7 records a case where it did not move while the document did.

**Reliance disposition (A.10:4.5) → report buckets.** `pass` = address present, section and link
agree; `reopen` = present but link/host wrong, or hex found outside its named section; `evidence-needed`
= row has no anchor, or a section holds an address no row claims; `blocked-current-use` = gate failure
(schema bump, unmapped route, unresolvable anchor).

## 4. Decisions (C.11)

### 4.1 Authority split — who owns what

Options: (a) ledger authors the whole § Lido Multichain section; (b) ledger authors marked regions;
(c) ledger only verifies, humans edit.

**Chosen: (c) for V1; (b) reachable in V3.** Grounds: the docs carry content the ledger structurally
cannot — prose labels (≠ `contractName`), the live-vs-§ Legacy split (no lifecycle field upstream),
`[proposed]` / `[proposed to remove]` annotations, "Canonical Bridge" notes, Safe-app link style,
third-party pool and feed bullets, and section anchors other pages link to. (a) would delete
information: 40 § Legacy bullets have no ledger row. (b) was the earlier draft's answer and is now
*possible* for the six live chains — they reached full coverage in this branch — but it buys nothing
until a lifecycle field exists, and it costs per-bullet label templates for irregular forms like
`- ProxyAdmin [0x…](…) for CrossChainController`.

### 4.2 How a ledger row is located in the docs

Options: (a) invented region ids + `<!-- ledger:region … -->` markers in the markdown, plus a
hand-declared row→region map; (b) the ledger's own `publicRefs` anchors, resolved against the heading
tree; (c) whole-file search for the hex.

**Chosen: (b).** Grounds: it is already true and machine-checkable — 144/144 anchored rows land inside
the section they name, with no broken anchors. (b) removes an entire class of maintenance (no markup in
the docs, no map to keep in sync, no region ids to invent) and it makes the docs' own heading structure
the boundary, which reviewers already understand. It also inverts the maintenance burden helpfully:
when a row lacks an anchor, that is an upstream gap the report names (31 today), not a local mapping
chore. (a) duplicates upstream data locally and would drift; (c) cannot distinguish sections and so
cannot detect misplacement, and Docusaurus anchors make (b)'s failure mode loud anyway
(`onBrokenAnchors: 'throw'`).

Consequence to accept: coverage is bounded by upstream `publicRefs` (144/175 today). That is visible in
the report and actionable upstream, rather than silently patched here.

### 4.3 Identity key

Options: (a) bare address match; (b) `(networkId, address)` = `deploymentId`, with the section as context.

**Chosen: (b).** Grounds: (a) is provably wrong on this data — `0xb948a938…` is an NTT-manager proxy on
`eip155:1` and a Wormhole-transceiver implementation on `eip155:56`; `0x328de900…` and `0x301cBCDA…`
each carry two or three different roles across networks. The branch's `knownGaps` states the same
conclusion. The section a row's anchor names supplies the network context, so a hex that repeats across
chains is checked once per network, in the right place.

### 4.4 Write scope

Options: (a) rewrite a drifted address in place; (b) report only.

**Chosen: (b) for V1.** Grounds: locating *which bullet* holds a stale address needs a label→`contractId`
map — the one piece of hand-maintained mapping (b) avoids. Detection does not: a changed upstream
address shows up as an `absent` row plus an unclaimed hex in the same section, which is enough for a
human to fix in one edit. V2 adds the label map and `--write` once the check has run for a while and the
label set has proved stable.

## 5. Tool contract as atomic claims (A.6.B)

`L` definitions/invariants, `A` gates, `D` duties, `E` work-effects.

| ID | Claim |
| --- | --- |
| L-1 | A *target section* is the span from the heading whose id equals a `publicRefs` anchor to the next heading of the same or higher level, in the repo file mapped from that ref's route. |
| L-2 | A row is *published as expected* iff its target section contains **some** link whose target holds the row's `address` and whose host is that `networkId`'s configured explorer host — or, for a Safe row, some link carrying `safe=<that network's shortName>:<address>` on any host (Safe front-ends differ per chain: `app.safe.global`, `safe.optimism.io`, `multisig.mantle.xyz`, `safe.scroll.xyz`, `safe.zircuit.com`). Existential, not first-match: one section can hold the same hex once per network. |
| L-2a | A row carrying several docs refs agrees only if **every** one of them agrees; its reported verdict is the worst of them. 12 rows carry more than one docs ref today: 11 are Safe rows listed both on `/deployed-contracts/` and on `/multisigs/emergency-brakes/` (10 emergency-brakes + `circuit-breaker-committee-ethereum`), and the 12th is `optimism-ethereum-token-rate-notifier-archive`, whose two anchors are both on `/deployed-contracts/` (`#ethereum-part-optimism` and `#post-token-rebase-receiver`). All 12 satisfy every ref. |
| L-2b | A row whose address is not in its target section is *misplaced* if the address appears in display position elsewhere in the same file, and *absent* otherwise. An address surviving only inside a link URL is not published text, so it counts as absent. |
| L-3 | Identity of a deployment is `deploymentId` = `networkId:address`. A bare hex is not an identity, and the same hex may be a different contract on another network. |
| L-4 | A *doc-only* address is one in **display position** — inside a `` `code span` `` — within a `gapScan` scope, claimed by no ledger row **on any network**, and absent from the `thirdParty` allowlist. Display position, not raw hex scanning: every linked bullet repeats its address in the URL, and a Balancer pool id is 32 bytes whose first 40 hex characters look exactly like an address. Loose scanning counts 110 where there are 54. |
| L-4a | The "claimed by no row" test is against every network, not against the networks the section's own rows use. Scroll's four rows are real ledger entries that simply carry no anchor; a per-network test would report their addresses as gaps. The cost is that cross-network mislabelling — a `eip155:1` row's address published as chain B's contract — is outside V1's reach. Stated, not hidden. |
| A-1 | The run aborts unless the fetched document has `schemaVersion === "0.2.0"` and matches the pinned root shape. A model bump is a code change here, never a silent parse. |
| A-2 | The run aborts unless every `publicRefs` route resolves to a configured repo file, and every network referenced by a checked row exists in both the ledger's `networks` and the local network config. |
| A-3 | The run aborts if an anchor names no heading in its file — the ledger and the page have diverged structurally, and no per-row result from that file is trustworthy. |
| D-1 | The tool never edits, never deletes, and never invents: V1's whole output is a report and an exit code. |
| D-2 | The tool never fabricates a link for a network with no configured explorer; it reports the gap. |
| D-3 | Rows without a `docs.lido.fi` ref are reported as unverifiable, never silently skipped, and never counted as passing. |
| D-4 | `thirdParty` allowlist entries are listed in the report footer, so an allowlist can never quietly hide a real gap. |
| E-1 | A run produces per-section rows in six buckets (ok / link-mismatch / misplaced / absent / no-anchor / doc-only) plus a provenance stamp, and exits 0 only when link-mismatch, misplaced and absent are empty. |
| E-2 | `no-anchor` and `doc-only` counts are reported with an exit code of 0 by default and 1 under `--strict`, because both are upstream-facing gaps rather than local errors. |

## 6. Design

```
scripts/
  fetch-multichain.js     # fetch → gate → resolve anchors → check → report
  multichain-map.js       # routes, network link policy, gapScan sections, thirdParty allowlist
```

Nothing is added to the docs. `multichain-map.js` is the only hand-maintained file, and it holds only
what the ledger has no field for:

```js
module.exports = {
  // docs.lido.fi route → repo file (publicRefs use routes, we read files)
  routes: {
    '/deployed-contracts/':         'docs/deployed-contracts/index.md',
    '/deployed-contracts/hoodi':    'docs/deployed-contracts/hoodi.md',
    '/multisigs/emergency-brakes/': 'docs/multisigs/emergency-brakes.md',
  },
  // Explorer host per network. 16 of 17 are the host the docs already use (measured);
  // eip155:1923 has no linked example yet — the three Swellchain rows are unlinked, so
  // this value is a proposal to confirm with the deployment, not an observation.
  // Safe rows are matched by `safe=<shortName>:<address>` on any host, not by host (L-2).
  networks: {
    'eip155:1':    { label: 'Ethereum',   explorer: 'etherscan.io',             safeShortName: 'eth' },
    'eip155:56':   { label: 'BSC',        explorer: 'bscscan.com',              safeShortName: 'bnb' },
    'eip155:1923': { label: 'Swellchain', explorer: 'explorer.swellnetwork.io', safeShortName: 'swell-l2' },
    // …17 networks
  },
  safeRows: ['emergency-brakes-*', 'circuit-breaker-committee-*'], // checked as Safe URLs, not explorer links
  // Sections scanned for addresses no ledger row claims (L-4). Chain sections are listed
  // at chain level: a span runs to the next same-or-higher heading, so #arbitrum already
  // covers #ethereum-part-arbitrum and #arbitrum-part.
  gapScan: [
    { ref: '/deployed-contracts/#ethereum-common-ccip-ds' },
    { ref: '/deployed-contracts/#arbitrum' },
    { ref: '/deployed-contracts/#price-feeds' },
    // …9 whole-section entries, plus one that needs sub-scoping:
    //
    // #legacy-contracts mixes the nine sunset chains with legacy DAO contracts (Finance
    // Ops, AnchorVault, Easy Track factories) that are out of this ledger's remit and are
    // not gaps. Scanning named bullet trees keeps the scope explainable — no thresholds,
    // no sampling — and a tree that stops matching is reported, not silently skipped.
    {
      ref: '/deployed-contracts/#legacy-contracts',
      bulletTrees: ['zkSync Era', 'Mode', 'Scroll', 'Mantle', 'Swellchain', 'Zircuit', 'Soneium', 'Polygon PoS', 'Lisk'],
    },
  ],
  // not Lido deployments; reported in the footer so the allowlist stays visible (D-4)
  thirdParty: [
    ['0x8b6851156023f4f5a66f68bea80851c3d905ac93', 'Chainlink wstETH/USD feed'],
    ['0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c', 'Balancer wstETH/WETH pool (Arbitrum)'],
    // …
  ],
};
```

**Data flow.** fetch `raw.githubusercontent.com/lidofinance/multichain/refs/heads/<ref>/ledger.json`
(`--ref`, default `main`; `MULTICHAIN_LEDGER_PATH` for offline/CI) → gate A-1 → group rows by
`publicRefs` ref → gate A-2/A-3 → per section: parse the span once, check every row's address and link
(L-2), then collect hexes no row claims (L-4) → print report + provenance stamp → exit per E-1/E-2.

**Report** — real output, trimmed (`✗` `!` rows fail the run; `?` rows fail only under `--strict`):

```
ledger  ref=feat/diffyscan-validation  commit=a5b9d23  schemaVersion=0.2.0
        updatedAt=2026-08-14  fetched=2026-08-17T08:20:01Z  175 rows, 144 anchored
        carrier=https://raw.githubusercontent.com/lidofinance/multichain/refs/heads/feat/diffyscan-validation/ledger.json

docs/deployed-contracts/index.md#binance-smart-chain-bsc  (L668–714, eip155:1 + eip155:56)
  ✓ 15 rows agree

docs/deployed-contracts/index.md#unichain  (L715–734, eip155:1 + eip155:130)
  ✓ 12 rows agree

docs/deployed-contracts/index.md#legacy-contracts  (L753–891, eip155:1135 + eip155:1868 + eip155:1923 + eip155:324 +3 more)
  ✓ 22 rows agree
  ✗ L852  swellchain-swellchain-wsteth-token/proxy               0x7c98E077…  address unlinked, expected explorer.swellnetwork.io
  ✗ L853  swellchain-swellchain-wsteth-token/implementation      0xa1A32578…  address unlinked, expected explorer.swellnetwork.io
  ✗ L856  swellchain-…-governance-bridge-executor/standalone     0xFF22ea46…  address unlinked, expected explorer.swellnetwork.io
  ? L812  0xFf7F4d05…  L1Executor (proxy)                     claimed by no ledger row · zkSync Era
  ? L824  0xD0DeA0a3…  L1ERC20TokenBridge (proxy)             claimed by no ledger row · Mode

not checkable — no docs.lido.fi publicRef (31 rows)
  ? eip155:56     bsc-bsc-wsteth-token/proxy                     0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C
  …

144 rows checked: 141 agree · 3 link-mismatch · 0 misplaced · 0 absent | 31 no-anchor · 40 doc-only
checkable coverage 144/175 rows (82%) — bounded by upstream publicRefs, not by this script
allowlisted as not-a-Lido-deployment: 14 addresses in scanned sections
compares carriers only: no chain state was read, so an agreeing row means it matches this ledger snapshot.
no-anchor and doc-only are upstream-facing gaps; run with --strict to fail on them.
```

The 54 unclaimed code-span addresses in scanned scopes split into **40 reported** and 14 allowlisted
(8 Chainlink feeds, 6 pool addresses). Sections whose rows all sit in subsections print nothing rather
than an empty block, and the run's last line restates the A.7 boundary in the output itself, where a
reader who never opens this document will still see it.

**Coverage metric** (C.16, defined so it cannot flatter us): *checkable coverage* = rows carrying a
resolvable docs anchor ÷ all rows = 144/175 = 82% today; the missing 18% is exactly the 31 rows without
a `publicRefs` anchor. Reported beside it, never merged into it: 141 of those 144 also pass the link
check. Neither number is a quality score — a page can be complete and correct at lower coverage, since
the ledger deliberately carries rows these docs publish elsewhere or not at all.

**CLI.** `node scripts/fetch-multichain.js [--ref=<git-ref>] [--strict] [--json] [--section=<substr>]`.
Exit 0 = pass · 1 = mismatch (or any gap under `--strict`) · 2 = gate abort. An unrecognised flag is a
gate abort, not a silently ignored typo. `--section` matches a substring of `<route>#<anchor>` and
withholds the coverage line, because a filtered denominator would flatter or damn the run at random.
`MULTICHAIN_LEDGER_PATH` checks a local file instead of fetching.

Wired as `npm run fetch-multichain`. Deliberately not added to `fetch-external.js`: that chain
regenerates whole pages, this one only reports. Until the branch merges, run
`npm run fetch-multichain -- --ref=feat/diffyscan-validation`; against `main` today only 15 rows carry
anchors and the Direct Staking addresses correctly report as `doc-only` (72 of them, versus 40 on the
branch).

## 7. Non-goals and failure modes

Non-goals: no chain reads; no writes (V1); no lifecycle/sunset inference (no upstream field — the live
vs § Legacy split stays editorial); nothing published from `source`/`commit` (upstream `knownGaps`
records that the repository-URL rule is inconsistent — see §2); no new page
or MDX component; no touching § Emergency Brakes quorums (`fetch-msig-quorums.js` owns those); no link
fabrication for unconfigured networks.

| failure | handling |
| --- | --- |
| upstream `schemaVersion` bumped | abort, exit 2, name both versions (A-1) |
| a heading is renamed in the docs | that file's anchors stop resolving → abort, exit 2 (A-3); Docusaurus would also throw on the stale in-repo links |
| a `publicRefs` anchor is wrong upstream | same abort, with the row and anchor named — an upstream fix, and the report is the evidence |
| upstream renames a `contractId` | invisible to V1: the check is per address per section, so no local key breaks |
| upstream drops `publicRefs` from a row | that row moves to `no-anchor`; coverage falls visibly; nothing silently passes (D-3) |
| a new route appears in `publicRefs` | abort, exit 2 (A-2) — one line of config to add |
| offline / rate-limited | `MULTICHAIN_LEDGER_PATH` local file; no silent partial run |
| a 40-hex prefix that is not an address (Balancer pool id, tx hash) | never counted: doc-side addresses are read from code spans only (L-4) |
| **upstream edits `ledger.json` without bumping `updatedAt`** | happened: `4ce1c1f` → `a5b9d23` changed 35 rows and a `knownGaps` entry at an unchanged `updatedAt`. The resolved commit SHA in the provenance stamp is what catches this, so `updatedAt` is recorded but never relied on as the currentness signal (§8 Refresh) |

Residual risk: V1 can confirm that an address is published in the right section under the right link,
and nothing more. It cannot tell you the address is the right one — that is a chain read (V3 at the
earliest) or a Diffyscan run upstream. The report wording must not imply otherwise (§3).

## 8. Phasing

- **V1 — done.** Anchor-driven check, six buckets, provenance stamp, `--ref` / `--strict` / `--json` /
  `--section`, `npm run fetch-multichain`, manual runs. 564 lines of script (roughly a third of it
  comments) and a 112-line config — more than the 150 lines estimated, mostly report formatting, the
  bullet-tree sub-scoping and the JSON face.
- **V2**: label→`contractId` map for the sections that matter, and `--write` to rewrite a drifted
  address in place (code span + URL on the same line, nothing else); CI job on PRs touching
  `docs/deployed-contracts/**` — non-blocking first, then required; `--json`.
- **V3** (gated on an upstream lifecycle field): generate whole sections for the six live chains, which
  reached full ledger coverage in this branch; optionally emit `static/multichain-addresses.json` for
  integrators.

Refresh (G.11): the **resolved commit SHA is the currentness signal**, not `updatedAt` — `updatedAt`
is upstream's self-report and has already failed to move across a content change (§7), so the stamp
records it without relying on it. One caveat this makes load-bearing: `resolveCommit()` is
best-effort, and an unauthenticated GitHub rate limit drops `commit=` from the stamp rather than
failing the run, leaving a branch name as the only edition marker for that run. Re-run, or pass a
tag/SHA to `--ref`, before treating such a run as a pinned edition. The check is section-scoped — no
global rebuild; V2's CI job is the sentinel.

## 9. Upstream asks for `lidofinance/multichain`

1. **Add `publicRefs` docs anchors to the 31 rows that lack them** — the whole BSC/NTT family, Linea's
   admins and archives, Scroll, Polygon, one hoodi archive. This is the single change that raises V1
   coverage from 82% to ~100%, and it costs one line per row.
2. **The 6 rows whose address is in no docs page** (2 Linea impls, 3 BSC/NTT impls, 1 hoodi archive
   impl) — either the docs should publish them or the rows are stale; the first-run report is the evidence.
3. **The other diff direction:** 40 addresses these docs publish have no ledger row — every L1↔L2
   bridge and gateway on the nine § Legacy chains (TL;DR outline). Intentional coverage boundary (then
   `coverage.notes` / `knownGaps` should say so) or not yet collected?
4. **A lifecycle/status field** (`live` / `sunset` / `archive`), so the live-vs-§ Legacy split stops
   being purely editorial. This is what blocks V3 generation.
5. Optional per-network `explorerUrl` + Safe short name in `networks`, so 17 rows of link policy do not
   have to be duplicated in every consumer.
6. **Tagged releases (or a stable per-snapshot permalink) so consumers can pin an edition instead of
   tracking a branch — and bump `updatedAt` whenever `ledger.json` changes.** Now evidenced rather
   than hypothetical: `4ce1c1f` → `a5b9d23` rewrote 35 rows' `source` and one `knownGaps` entry at an
   unchanged `updatedAt 2026-08-14`, so neither the branch name nor the ledger's own currentness field
   distinguishes the two snapshots. Only the commit SHA does, and consumers should not have to reach
   for git plumbing to identify what they read.

## 10. Verification of V1 — runs performed

Every row below was executed against this tree, first at ledger edition `4ce1c1f` and **re-run in
full at `a5b9d23` on 2026-08-17 with identical results** — the 35 changed `source` fields touch
nothing V1 reads. Doc mutations were made in the working tree and reverted; `git status docs/` is
empty and no file under `docs/` was changed.

| # | run | expected | observed |
| --- | --- | --- | --- |
| 1 | `--ref=feat/diffyscan-validation` (network) | the measured baseline | 144 rows checked · **141 agree** · 3 link-mismatch · 0 misplaced · 0 absent · 31 no-anchor · 40 doc-only · coverage 82% · exit **1** ✓ |
| 2 | L-2 existential guard: the three `PriceOracle` rows sharing `0x301cBCDA…` on Optimism, Base, Linea | all agree | all three agree; a first-match rule would have failed two of them ✓ |
| 3 | `--ref=main` (network) | Direct Staking rows absent upstream ⇒ their addresses report doc-only | 15 rows checked (only 15 anchored on `main`), 125 no-anchor, **72** doc-only = the 40 § Legacy + 32 Direct Staking · exit 0 ✓ |
| 4 | simulated upstream drift: rewrite `0xc02fE731…` (Unichain wstETH proxy) in `index.md`, then run `--section=unichain` | stale row `absent`, doc's hex `doc-only`, same line | `! — unichain-unichain-wsteth-token/proxy … not published`; `? L725 0x1111… WstETH ERC20BridgedPermit (proxy) claimed by no ledger row` — one edit fixes both ✓ |
| 5 | rename `{#unichain}` → `{#unichain-v2}` | exit 2 naming file + anchor (A-3) | `aborted: … anchor docs/deployed-contracts/index.md#unichain resolves to no heading (row eip155:1:0x3F96…)`, 12 rows named · exit **2** ✓ |
| 6 | fixture: `schemaVersion: 0.3.0` | exit 2 (A-1) | `aborted: ledger schemaVersion is 0.3.0, this script is written for 0.2.0` · exit **2** ✓ |
| 7 | fixture: a `publicRefs` route the config lacks | exit 2 (A-2) | `aborted: … unmapped docs route "/some-new-page/"` · exit **2** ✓ |
| 8 | fixture: `deploymentId` ≠ `networkId:address` | exit 2 (A-1 shape) | `aborted: ledger failed shape checks (1)` · exit **2** ✓ |
| 9 | fixture: a row anchored to a section that does not publish it | `misplaced`, not `absent` (L-2b) | `! L725 unichain-unichain-wsteth-token/proxy … published at L725, outside #arbitrum` ✓ |
| 10 | `--strict` on the branch baseline | exit 1 on gaps alone | exit **1** ✓ (plain run also exits 1 here, from the 3 link-mismatches) |
| 11 | `--json` | machine face agrees with the text face | `summary {rowsChecked:144, ok:141, link-mismatch:3, misplaced:0, absent:0, noAnchor:31, docOnly:40}`, 156 result entries (144 rows, 12 with two refs) ✓ |
| 12 | `--nope` | unrecognised flags abort | `aborted: unrecognised option: --nope` · exit 2 ✓ |
| 13 | read-only claim (D-1) | no write calls in the source | `grep` for `writeFile`/`appendFile`/`createWriteStream`/`rmSync`/`.write(` returns nothing ✓ (`unlink` is not a usable probe: it matches the message string `address unlinked` at `fetch-multichain.js:289`) |

Not verified, and worth stating: nothing here confirms an address is *correct*. That needs a chain read
or a Diffyscan run upstream (§7).
