## Search Rules

### Rule 1: A match in the page title outranks a match in the category name

**In plain terms:** If a user searches for "ipfs", a page titled "About IPFS" should rank higher than a page titled "Security" that merely belongs to the IPFS category. The page title is the most precise relevance indicator.

**Configuration:** `searchableAttributes` — move `hierarchy.lvl1` (page title) to the FIRST position, above `hierarchy.lvl0` (category).

**Where:** Algolia Dashboard → Configuration → Searchable attributes

**Why it works:** The `attribute` ranking criterion compares which attribute the match occurred in. The attribute listed higher in `searchableAttributes` wins. "About IPFS" matches in lvl1 (position 0), "Security" matches only in lvl0 (position 1).

---

### Rule 2: Singular and plural forms return the same results

**In plain terms:** Searching "contract" and "contracts" should return the same results in the same order. No category should dominate just because its name happens to match the exact plural form.

**Configuration:** `exactOnSingleWordQuery` = `"none"` + `ignorePlurals` = `true` + `queryLanguages` = `["en"]`

**Where:** `docusaurus.config.js` → `searchParameters`

**Why it works:** `exactOnSingleWordQuery: "none"` disables the exact-match bonus for single-word queries. Without this, the `exact` ranking criterion gave a disproportionate boost to records where the query matched the FULL attribute value (e.g., "contracts" exactly matched category `"Contracts"`, pushing all other categories out of sight). With `"none"`, single-word ranking relies on the remaining criteria: `words → typo → attribute → proximity → custom`. `ignorePlurals: true` with `queryLanguages: ["en"]` normalizes English plural/singular forms so both return identical results.

---

### Rule 3: Records matching more query words always come first

**In plain terms:** If a user searches for "staking router", records containing BOTH words always beat records containing only one of them. The number of matched words is the most important criterion.

**Configuration:** The `words` criterion is FIRST in `ranking`.

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting

---

### Rule 4: Exact spelling beats typos

**In plain terms:** A search for "lido" should show exact matches before "lado" or "lid". However, typo-tolerant results should still be found.

**Configuration:** The `typo` criterion is third in `ranking` (after words and filters). Typo-tolerance is enabled with defaults: 1 typo for words of 4+ characters, 2 typos for words of 8+ characters.

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting + Typo-tolerance

---

### Rule 5: A match in a higher hierarchy level wins

**In plain terms:** If a word is found in the page title, that is more important than finding it in an h2 subheading. An h2 is more important than h3. An h3 is more important than regular paragraph text.

**Configuration:** The order of attributes in `searchableAttributes` + the `attribute` criterion in ranking.

**Where:** Algolia Dashboard → Configuration → Searchable attributes

**Order:**
```
hierarchy.lvl1 (unordered)  — page title (h1)
hierarchy.lvl0 (unordered)  — category
hierarchy.lvl2 (unordered)  — h2 subheading
hierarchy.lvl3 (unordered)  — h3 subheading
hierarchy.lvl4 (unordered)
hierarchy.lvl5 (unordered)
hierarchy.lvl6 (unordered)
content (unordered)          — paragraph text
```

---

### Rule 6: Words close together beat words spread apart

**In plain terms:** If a user searches for "staking router", a record where "staking router" appears together in a single sentence should rank higher than a record where "staking" is in one paragraph and "router" is in another.

**Configuration:** The `proximity` criterion in `ranking`.

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting

---

### Rule 7: Top-level pages outrank deeply nested ones (within the same content type)

**In plain terms:** Within the same content type (e.g., two guide pages or two contract pages), a shallower page outranks a deeper one. `/contracts/lido` (depth 2) ranks higher than `/contracts/staking-router` (depth 2, same) or a deeper contract page. Cross-type ranking is handled by Rule 15.

**Configuration:** `customRanking` includes `customRank_pageRank` (desc). Formula in the script: `pageRank = max(0, 10 - depth * 2)`.

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting → Custom Ranking

---

### Rule 8: Page and section headings outrank plain text (at equal relevance)

**In plain terms:** All else being equal, a record of type "page title" (h1) is more important than a "section heading" (h2), and h2 is more important than a "content paragraph". The user is more likely looking for a page or section than a specific paragraph.

**Configuration:** `customRanking` includes `customRank_level` (desc). Values: lvl1=100, lvl2=90, lvl3=80, content=70.

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting → Custom Ranking

---

### Rule 9: Deduplication in modal and on /search page

**In plain terms:** In the search modal (Ctrl+K), if the "Staking Router" page has 50 places where the search term appears, we show at most 3 records from that page (title + 2 sections). On the `/search` page, results are deduplicated by URL (including anchor): multiple records from the same heading are collapsed into a single result, keeping the highest-ranked one. Different sections of the same page (different anchors) still appear separately.

**Configuration:**
- Modal: `distinct` = `3` in `docusaurus.config.js` → `searchParameters`. In the Dashboard, `distinct` remains `false` (do NOT change).
- /search page: Client-side URL dedup in swizzled `src/theme/SearchPage/index.tsx` (reducer `update` case).

**Where:** `docusaurus.config.js` → `searchParameters` (modal) + `src/theme/SearchPage/index.tsx` (/search page)

---

### Rule 10: Within a page, results follow document order

**In plain terms:** If a single page has multiple matches, those appearing earlier in the document are more important than those appearing later. A section heading "Overview" (at the top) ranks above "Appendix" (at the bottom).

**Configuration:** `customRanking` includes `customRank_position` (asc).

**Where:** Algolia Dashboard → Configuration → Ranking and Sorting → Custom Ranking

---

### Rule 11: When there are zero results, make words optional

**In plain terms:** If a user enters a long query and nothing is found, it is better to show partial matches than an empty page. Algolia should automatically drop words from the query, starting from the last one.

**Configuration:** `removeWordsIfNoResults` = `"lastWords"`

**Where:** Algolia Dashboard → Configuration → No results behavior **AND** `docusaurus.config.js` → `searchParameters`

---

### Rule 12: Support for exact phrases in quotes and exclusions

**In plain terms:** A user can search for `"staking router"` in quotes for an exact phrase, or `staking -router` to exclude a word. This is standard for technical documentation.

**Configuration:** `advancedSyntax` = `true`

**Where:** Algolia Dashboard → Configuration → Advanced syntax

---

### Rule 13: Ranking is identical in the modal and on /search (except for distinct)

**In plain terms:** The order of results in the search modal (Ctrl+K) and on the /search page should be consistent. The only difference: the modal deduplicates (max 3 from one page), /search shows everything.

**Configuration:** Ranking parameters (`searchableAttributes`, `removeWordsIfNoResults`, `advancedSyntax`) are set at the index level (Dashboard). `exactOnSingleWordQuery`, `ignorePlurals`, and `queryLanguages` are set in `docusaurus.config.js` → `searchParameters` (modal only; SearchPage does NOT use them). `distinct` is only in code (modal only).

**Where:** Algolia Dashboard (ranking) + `docusaurus.config.js` (distinct + duplicate for modal)

---

### Rule 14: Pages higher in the sidebar menu are shown first (at equal relevance)

**In plain terms:** If two pages from the same documentation section match a search query equally well, the one positioned higher in the sidebar menu should appear first. The sidebar order reflects the logical structure of the documentation — introductory pages come first, specialized ones come later.

**Configuration:** `customRanking` includes `customRank_sidebarPosition` (asc). Value = the ordinal position of the page in sidebar navigation. Generated in `scripts/generate-algolia-records.js` from `.docusaurus/` metadata by traversing the `previous`/`next` chain.

**Where:** `scripts/generate-algolia-records.js` (field generation) + Algolia Dashboard → Custom Ranking (position 3)

**Why it works:** When two pages match the query in the same attribute, have the same `pageRank` and `level`, `customRank_sidebarPosition` becomes the tiebreaker. "About IPFS" (sidebar pos N) beats "Lido IPFS applications" (sidebar pos N+4). "Building Guides" (pos M) beats "Operational and Management Guides" (pos M+K).

---

### Rule 15: User-facing guides outrank contract API references (at equal relevance)

**In plain terms:** If a user searches for "PDG" or "Predeposit Guarantee", the stVaults guide page should appear before the contract API reference page. Guides explain how to USE a feature; contract pages document the CODE. Most users need the guide.

**Configuration:** `customRanking` includes `customRank_contentType` (desc) as the FIRST custom ranking field. Values assigned automatically by URL segment patterns in `scripts/generate-algolia-records.js`:
- `/run-on-lido/*` = 200 (operator guides — entire second docs plugin)
- Any URL with a segment containing `guide` = 180 (catches `/guides/*`, `/token-guides/*`, and any future `*guide*` section)
- Default = 100 (general docs)
- Any URL with a segment exactly `contracts` = 50 (catches `/contracts/*`, `/staking-modules/csm/contracts/*`, and any future `*/contracts/*`)

**Where:** `scripts/generate-algolia-records.js` (field generation) + Algolia Dashboard → Custom Ranking (position 1, desc)

**Why it works:** When two pages match the same query in the same attribute with equal typo/proximity, `customRank_contentType` is the first tiebreaker. A guide (200) always outranks a contract reference (50). This does NOT affect queries where pages are differentiated by standard criteria (words, typo, attribute, proximity, exact). New sections are auto-classified by naming convention — no manual code changes needed.

---

### Rule 16: Context-aware query persistence in the search modal

**In plain terms:** The search modal restores the previous query ONLY in these cases:
1. User navigated to a search result (via mouse click or keyboard arrow+Enter) → reopens modal on the result page.
2. User navigated to a search result → went back to the original page → reopens modal.
3. User is on the `/search` page → modal prefills with the current search page query.

If the user navigates anywhere else (menu, internal link, etc.), the query is NOT restored. Clicking the clear button (X) in the modal also clears the stored query permanently.

**Configuration:** `src/clientModules/searchQueryPersist.js` saves the query and navigation context (`{ resultUrl, originUrl }`) to `sessionStorage`. Two code paths handle this:
- **Mouse click**: a `click` event listener on `.DocSearch-Hit a` saves the context.
- **Keyboard Enter**: a `keydown` handler saves the context when `userNavigated` is true, reading the selected result URL from `.DocSearch-Hit[aria-selected="true"] a`.

The `onRouteDidUpdate` lifecycle hook clears storage when the user navigates away from allowed pages. On modal open, the query is restored from the URL `?q=` param (on `/search` page) or from sessionStorage (if context is valid).

**Where:** `src/clientModules/searchQueryPersist.js` + `docusaurus.config.js` → `clientModules`

---

### Rule 17: CamelCase contract names are searchable as separate words

**In plain terms:** A search for "staking router" (two words) should match the page titled "StakingRouter" (one camelCase word). Without this, content paragraphs containing "staking" and "router" as separate words would outrank the actual page title.

**Configuration:** `camelCaseAttributes` in Algolia Dashboard:
```
hierarchy.lvl0, hierarchy.lvl1, hierarchy.lvl2, hierarchy.lvl3
```

**Where:** Algolia Dashboard → Index Configuration → Language → camelCaseAttributes

**Why it works:** Algolia splits camelCase tokens into component words at indexing time. "StakingRouter" becomes searchable as "Staking" + "Router" while keeping the original display. The `attribute` ranking criterion then correctly identifies the title record as matching in lvl1 (highest priority).

---

### Rule 18: Enter in search modal opens the search page

**In plain terms:** When typing in the search modal, pressing Enter navigates to the `/search?q=...` page (like Google). If the user first selects a specific result using arrow keys, Tab, or mouse hover, then Enter navigates to that result instead. The first ArrowDown/ArrowUp/Tab press highlights the first result without skipping to the second.

**Configuration:** `src/clientModules/searchQueryPersist.js` intercepts `keydown` events in capture phase. Three flags manage the behavior:
- `userNavigated` — tracks whether the user explicitly selected a result (via arrows, Tab, or mouse hover). When `false`, Enter redirects to `/search?q=...`. When `true`, Enter lets DocSearch navigate to the selected result.
- `firstArrowHandled` — ensures the first arrow/Tab press reveals the highlight on the first result (index 0) without advancing to the second. DocSearch internally sets `defaultActiveItemId: 0`, so item 0 is always "active" but visually hidden by the `.no-initial-selection` CSS class. The first press suppresses the event (`preventDefault`) so autocomplete-core doesn't advance from 0 to 1, while removing the CSS class to reveal the highlight. Subsequent presses propagate normally.
- CSS class `.no-initial-selection` on `.DocSearch-Modal` suppresses the visual highlight on the auto-selected first result until the user explicitly navigates.

**Where:** `src/clientModules/searchQueryPersist.js` (JS behavior) + `src/css/custom.css` (visual suppression)

---

### Rule 19: Search term highlighting on target page

**In plain terms:** After navigating to a search result (via mouse click or keyboard Enter, from either the DocSearch modal or the `/search` page), matching search terms are highlighted with a yellow background on the target page. The page scrolls to the first match. Highlights fade out after 5 seconds and are removed entirely after 6 seconds.

**Configuration:** `src/clientModules/searchHighlight.js` receives the search query from two sources:
- **DocSearch modal (mouse)**: a `click` event listener on `.DocSearch-Hit a` saves the query to `sessionStorage['search-highlight-query']`.
- **DocSearch modal (keyboard)**: the `keydown` handler in `searchQueryPersist.js` saves the same key when `userNavigated` is true and Enter is pressed.
- **`/search` page**: on route change, reads the query from the previous location's `?q=` URL param.

On route change (`onRouteDidUpdate`), the module walks `<article>` text nodes with `TreeWalker`, wraps case-insensitive matches in `<mark class="search-highlight">` elements. Skips `pre`, `code`, `.search-highlight`, and `nav` elements. Scrolls to the first match unless the URL has a hash anchor (in which case the anchor takes priority). After 5 seconds, adds `.search-highlight--fade` (CSS transition to transparent), then after 1 more second removes `<mark>` elements entirely.

**Where:** `src/clientModules/searchHighlight.js` + `src/css/custom.css` (`.search-highlight`, `.search-highlight--fade`)

---

## Verification Queries

Test queries to verify each rule works correctly after changes. Run in both the Ctrl+K modal and on the `/search` page unless stated otherwise.

### Rule 1: Title > category

**Query:** `ipfs`
**Check:** Page "About IPFS" (`/ipfs/about`, title match in lvl1) ranks above pages that only belong to the IPFS category but don't have "ipfs" in their title (e.g. "Hash Verification").

### Rule 2: Plural normalization

**Query 1:** `contracts`
**Check:** Results from BOTH "Contracts" and "Deployed Contracts" categories appear (not just "Contracts"). Behavior is consistent with searching `contract` (singular).

**Query 2:** `guides`
**Check:** Pages from the "Guides" category still rank above pages from "Token Guides" category (differentiated by sidebarPosition and other custom ranking criteria).

### Rule 3: More matched words first

**Query:** `staking router`
**Check:** "StakingRouter" page (`/contracts/staking-router`, matches BOTH words) ranks above pages matching only "staking" or only "router".

### Rule 4: Exact spelling > typos

**Query:** `lido`
**Check:** Exact matches appear first. Any typo-tolerant results (if present) appear lower.

### Rule 5: Higher hierarchy level wins

**Query:** `HashConsensus`
**Check:** Page titled "HashConsensus" (title match in lvl1) ranks above pages where "HashConsensus" only appears in paragraph text (content field). Single word — no proximity ambiguity, isolates the attribute criterion.

### Rule 6: Proximity

**Query:** `staking router`
**Check:** After enabling `camelCaseAttributes` (Rule 17): page title "StakingRouter" (words adjacent) ranks above pages where "staking" and "router" appear in different paragraphs.

### Rule 7: Shallower pages outrank deeper (same content type)

**Query:** `systemd`
**Check:** All results are within run-on-lido (contentType=200). Shallower CSM pages (depth 4) rank above deeper systemd-specific pages (depth 6), isolating the pageRank criterion.

### Rule 8: Headings > plain text

**Query:** `bunker mode`
**Check:** Records where "bunker mode" appears in a heading (lvl2/lvl3, level=90/80) rank above records where it only appears in paragraph text (content, level=70) within the same contentType group.

### Rule 9: Deduplication

**Query:** `cou` (in Ctrl+K modal and on /search page)
**Check (modal):** At most 3 results from any single page (e.g. AccountingOracle shows title + max 2 sections).
**Check (/search):** No duplicate entries with the same title and breadcrumbs. Each unique URL (including anchor) appears only once.

### Rule 10: Document order within page

**Query:** `requestWithdrawals`
**Check:** Within the WithdrawalQueueERC721 page results, sections appearing earlier in the document come first.

### Rule 11: Optional words on zero results

**Query:** `validator ejector bunker mode configuration settings advanced`
**Check:** Results are shown (Algolia drops trailing words) rather than an empty page.

### Rule 12: Advanced syntax

**Query 1:** `"staking router"` (with quotes)
**Check:** Only pages containing the exact phrase appear.

**Query 2:** `oracle -accounting`
**Check:** Oracle-related pages appear, AccountingOracle page is excluded.

### Rule 13: Modal = /search ranking

**Query:** `PDG` (compare both)
**Check:** Same result order in modal and on `/search`. Only difference: modal groups max 3 per page (Rule 9).

### Rule 14: Sidebar position

**Query:** `oracle` (look at contract pages)
**Check:** "AccountingOracle" (earlier in sidebar) appears before "ValidatorsExitBusOracle" (later in sidebar) when other criteria tie.

### Rule 15: Guides > contracts (contentType)

**Query 1:** `PDG`
**Check:** Guide "Predeposit Guarantee" (`/run-on-lido/stvaults/tech-documentation/pdg`, contentType=200) appears above contract "PredepositGuarantee" (`/contracts/predeposit-guarantee`, contentType=50).

**Query 2:** `CSModule`
**Check:** Run-on-Lido CSM guide pages (contentType=200) appear above contract reference `/staking-modules/csm/contracts/CSModule` (contentType=50).

**Query 3:** `validator ejector guide`
**Check:** "Validator Ejector Guide" from `/guides/` (contentType=180) ranks above contract pages mentioning ejector (contentType=50).

### Rule 16: Context-aware query persistence

**Action 1 (result page):** Search "PDG" → click a result → navigate to target page → open Ctrl+K.
**Check:** "PDG" is still in the input on the result page.

**Action 2 (back to origin):** Search "PDG" → click a result → press browser Back → open Ctrl+K.
**Check:** "PDG" is still in the input on the original page.

**Action 3 (navigate away):** Search "PDG" → click a result → click any menu link → open Ctrl+K.
**Check:** Input is EMPTY — query was cleared on unrelated navigation.

**Action 4 (clear button):** Open Ctrl+K → type "PDG" → click X (clear) → close modal → reopen.
**Check:** Input is EMPTY — clear button permanently removes stored query.

**Action 5 (search page sync):** Navigate to /search → type "oracle" → open Ctrl+K modal.
**Check:** "oracle" is prefilled in the modal input.

**Action 6 (keyboard navigation):** Open Ctrl+K → type "PDG" → press ArrowDown → press Enter → navigate to target page → open Ctrl+K.
**Check:** "PDG" is still in the input.

### Rule 17: CamelCase search

**Query:** `staking router`
**Check:** Page titled "StakingRouter" appears as first result (requires `camelCaseAttributes` enabled in Dashboard).

### Rule 18: Enter in search modal opens search page

**Action 1 (Enter → search page):** Open Ctrl+K → type "staking" → press Enter.
**Check:** Navigates to `/search?q=staking`.

**Action 2 (arrow + Enter → result):** Open Ctrl+K → type "staking" → press ArrowDown → press Enter.
**Check:** Navigates to the selected search result, NOT the search page.

**Action 3 (no initial highlight):** Open Ctrl+K → type "staking" → look at results.
**Check:** First result is NOT visually highlighted until user presses arrow keys or hovers.

**Action 4 (first arrow → first result):** Open Ctrl+K → type "staking" → press ArrowDown once.
**Check:** The FIRST result is highlighted, not the second.

### Rule 19: Search term highlighting

**Action 1 (mouse click):** Search "PDG" in modal → click a result.
**Check:** Matching "PDG" terms are highlighted in yellow on the target page, then fade out after 5 seconds.

**Action 2 (keyboard Enter):** Search "PDG" in modal → press ArrowDown → press Enter.
**Check:** Same yellow highlights appear on the target page.

**Action 3 (from /search page):** Go to /search?q=PDG → click a result.
**Check:** Same yellow highlights appear on the target page.

**Action 4 (hash anchor):** Search a term → click a result that links to a specific heading (#anchor).
**Check:** Page scrolls to the anchor, NOT to the first highlight. Highlights still appear but don't override the anchor scroll.

---

### Cross-rule integration tests

**Test A — contentType vs pageRank:**
Query `predeposit guarantee`. Guide page wins despite deeper URL (contentType 200 > 50 outweighs pageRank difference). Verifies Rules 3, 6, 15.

**Test B — Multi-category query:**
Query `CSM`. Results from "Community Staking Module" category (guides, contentType=200) appear above "Staking Modules" category (contracts, contentType=50). Within each group, title matches outrank content matches. Verifies Rules 1, 5, 15.

**Test C — Exact phrase across content types:**
Query `"hash consensus"` (with quotes). Page "HashConsensus" (title match) ranks first even though it's a contract page (contentType=50) — standard criteria (attribute) outweigh custom ranking. Verifies Rules 5, 8, 12.

**Test D — Deep page with unique term:**
Query `MinFirstAllocationStrategy`. StakingRouter contract page appears — very specific term, one or very few results. Verifies Rules 4, 7, 8.

**Test E — Highlight after search (Rule 19):**
Search "PDG" in modal → click a result. On the target page, matching terms are highlighted in yellow, then fade out after 5 seconds. Repeat with keyboard: ArrowDown → Enter. Same highlights should appear. Verifies Rule 19.

**Test F — Keyboard full flow (Rules 16, 18, 19):**
Open Ctrl+K → type "PDG" → press ArrowDown (first result highlights, not second) → press Enter → target page shows yellow highlights → press Ctrl+K → "PDG" is still in the input. Verifies Rules 16, 18, 19 together for the keyboard path.
