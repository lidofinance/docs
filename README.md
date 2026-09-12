# Lido Docs

Lido documentation is built using [Docusaurus 3](https://docusaurus.io/). The resulting version of documentation hosted via GitHub Pages from the `gh-pages` branch of this repository.

## Installation

```console
npm install
```

## Local Development

```console
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Documentation Pages

Documentation pages are stored in the `/docs` folder. By default files with `.md` and `.mdx` extensions are treated as documentation pages. Every document has a unique `id`. By default, a document `id` is the name of the document (without the extension) relative to the root docs directory.

For example, `greeting.md` id is `greeting` and `guide/hello.md` id is `guide/hello`.

```
website # Root directory of your site
└── docs
   ├── greeting.md
   └── guide
      └── hello.md
```

However, the last part of the id can be defined by user in the front matter. For example, if guide/hello.md's content is defined as below, its final id is `guide/part1`.

```
---
id: part1
---
Lorem ipsum
```

If you want more control over the last part of the document URL, it is possible to add a slug (defaults to the id).

```
---
id: part1
slug: part1.html
---
Lorem ipsum
```

More information about document metadata fields available [there](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-frontmatter)

### Documentation Sidebar

The appearance of the sidebar is controlled manually via the `sidebars.js` file. This file is used to:

- Group multiple related documents
- Display a sidebar on each of those documents
- Provide a paginated navigation, with next/previous button

By default, newly added pages are not added to the sidebar automatically. For example, to add a new page `faq.md` as the last item of the sidebar, we need to modify `sidebar.js` in the following way:

```js
module.exports = {
  docs: [
    // Above sections
    // ...
    'faq',
  ],
}
```

Additional information about the sidebar and ways to modify it can be found [here](https://docusaurus.io/docs/sidebar)

## Build

```console
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Build and deployment happen automatically when a pull request is merged to the `main` branch or someone pushes to the `main` branch directly.

To build the documentation locally and push the built version to the `gh-pages` branch, use the following command:

```console
GIT_USER=<Your GitHub username> USE_SSH=true npm run deploy
```

## AI-friendly outputs

The build produces three artifacts for AI agents and assistants:

- `/llms.txt` — a [llmstxt.org](https://llmstxt.org)-compliant index of every doc page across `docs/`, `run-on-lido/`, and `earn/` with short descriptions
- `/llms-full.txt` — concatenated markdown of the entire documentation, ready to drop into an LLM context window
- `/<page-path>.md` — every doc page is also available as a raw markdown URL (append `.md` to any docs URL, e.g. `https://docs.lido.fi/contracts/lido.md`)

Generation lives in [`src/plugins`](src/plugins/README.md) — see that README for plugin details, config, and customization.

## Fetch and refresh external content

Fetch external markdown files to build an up-to-date version.

```console
npm run fetch
```

This refreshes the audit and LIP indexes, then checks documented Safe multisig quorums against public chain RPC endpoints. Use `npm run fetch-audits`, `npm run fetch-lips`, or `npm run fetch-msig-quorums` to run one task.

### Review disclosure candidates

Run the separate manual collector to compare likely security disclosures on the [Lido Research Forum](https://research.lido.fi) with `docs/security/disclosures.md`:

```console
npm run fetch-disclosures
npm run fetch-disclosures -- --since 2026-03-23 --until 2026-09-11
```

The default window starts at the latest publication date in the local ledger and ends today, inclusive in UTC. Use an earlier `--since` for a historical sweep. The collector follows the [Discourse API](https://docs.discourse.org/) latest-topic pagination and fetches the complete post stream of every keyword-matched topic, including additional post batches. It uses the shared HTTP and task helpers. `--max-pages N` defaults to 50; reaching that limit without exhausting the window, invalid data, or a failed request produces an incomplete report and a nonzero exit status.

Reports are written to timestamped JSON files in the already-ignored `.security-triage/` directory. They contain numeric ids, source links, dates, content hashes, candidates, already-listed topics, routing exclusions, and coverage errors. Titles, post bodies, and author identities are not saved. Compare ledger links by topic id, so links to individual replies do not create duplicate candidates.

Selection uses title terms such as security disclosure, security bulletin, incident, post-mortem, and vulnerability. Node-operator-category topics and topics mentioning Lido Earn/earnETH/earnUSD in their title or opening post are routed to exclusions for human review. Other product incidents must also be excluded during review. These are heuristics: a complete collection means pagination and selected post streams succeeded, not that every disclosure was discovered. Unbumped edits and disclosures without matching title terms can be missed; use overlapping windows and inspect exclusions before publishing.

This command produces review candidates only. A maintainer chooses the scope, publication date, type, severity, and wording before manually editing the ledger. It does not run through `npm run fetch` or fetch live forum data during tests, builds, or deployment.
