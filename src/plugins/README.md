# Plugins

Custom Docusaurus plugins that produce AI-friendly artifacts at build time. Both plugins run in the `postBuild` hook, so they execute after Docusaurus finishes generating the HTML site and never block or alter the regular build.

| Plugin | Output | Purpose |
|---|---|---|
| [`llms-txt`](./llms-txt) | `build/llms.txt`, `build/llms-full.txt` | Site-level discovery for AI agents (llmstxt.org spec) |
| [`markdown-source`](./markdown-source) | `build/<page>.md` for every doc | Per-page raw markdown endpoints |
| [`_shared`](./_shared) | — | Shared markdown utilities used by both plugins |

Both plugins are registered in [`docusaurus.config.js`](../../docusaurus.config.js) and receive identical `collections` config — the list of doc directories with their `routeBasePath`.

---

## `llms-txt`

Generates two files at the site root that follow the [llmstxt.org](https://llmstxt.org) specification.

### Outputs

**`/llms.txt`** — compact index (~65 KB on this site). Format:

```markdown
# Lido Documentation

> Documentation for the Lido liquid staking protocol on Ethereum and L2s...

## Main Docs

- [Introduction](https://docs.lido.fi/index.md): This documentation is intended to introduce...
- [Accounting](https://docs.lido.fi/contracts/accounting.md): Handles oracle reports...
- ...

## Run on Lido
- ...

## Earn
- ...
```

Designed to fit comfortably in a single LLM call. Each entry is `[title](raw_markdown_url): short_description`. Title comes from frontmatter `title` or first `# H1` (with anchor suffixes like `{#mainnet}` and leading emoji stripped). Description comes from frontmatter `description`, falling back to the first meaningful paragraph (skips headings, lists, blockquotes, JSX blocks).

**`/llms-full.txt`** — full corpus (~2.2 MB). Format:

```markdown
# Lido Documentation - Full Content

> ...

---
## Section: Main Docs

---
<!-- source: https://docs.lido.fi/contracts/lido -->

# Lido

... full page markdown ...

---
<!-- source: https://docs.lido.fi/contracts/burner -->

# Burner
...
```

Each page is preceded by a `<!-- source: ... -->` comment so an LLM can cite back to the canonical URL.

### Config

```js
[
  require.resolve('./src/plugins/llms-txt'),
  {
    siteTitle: 'Lido Documentation',
    siteDescription: 'Documentation for the Lido liquid staking protocol...',
    collections: [
      { path: 'docs', routeBasePath: '/', label: 'Main Docs' },
      { path: 'run-on-lido', routeBasePath: 'run-on-lido', label: 'Run on Lido' },
      { path: 'earn', routeBasePath: 'earn', label: 'Earn' },
    ],
    indexFilename: 'llms.txt',     // optional, default 'llms.txt'
    fullFilename: 'llms-full.txt', // optional, default 'llms-full.txt'
  },
],
```

| Option | Required | Description |
|---|---|---|
| `siteTitle` | yes | Used as the H1 in both files |
| `siteDescription` | no | Rendered as a blockquote summary under the H1 |
| `collections` | yes | List of `{ path, routeBasePath, label }`. `path` is relative to the project root; `routeBasePath` matches the corresponding `@docusaurus/plugin-content-docs` setting; `label` is the H2 section heading in `llms.txt` |
| `indexFilename` | no | Filename for the index file (default `llms.txt`) |
| `fullFilename` | no | Filename for the full corpus (default `llms-full.txt`) |

### Behavior

- Pages with frontmatter `draft: true` or `unlisted: true` are excluded
- Files starting with `_` and dotfiles are skipped (treated as partials/private)
- MDX is sanitized (see [_shared](#shared)) — JSX components and attributes are stripped
- Pages are sorted alphabetically by permalink within each section
- Build log: `[llms-txt] generated llms.txt and llms-full.txt (266 docs across 3 collections)`

---

## `markdown-source`

For each doc page, writes the raw markdown source to `build/<page-path>.md`. An AI agent (or anyone) can fetch only the page they need without loading the whole corpus.

### Outputs

Examples of the URL mapping:

| Doc page URL | Raw markdown URL | File written |
|---|---|---|
| `https://docs.lido.fi/` | `https://docs.lido.fi/index.md` | `build/index.md` |
| `https://docs.lido.fi/contracts/lido` | `https://docs.lido.fi/contracts/lido.md` | `build/contracts/lido.md` |
| `https://docs.lido.fi/run-on-lido/intro` | `https://docs.lido.fi/run-on-lido/intro.md` | `build/run-on-lido/intro.md` |
| `https://docs.lido.fi/earn` | `https://docs.lido.fi/earn.md` | `build/earn.md` |

Each file starts with a canonical comment that points back to the HTML page:

```markdown
<!-- canonical: https://docs.lido.fi/contracts/lido -->

# Lido

- [Source code](https://github.com/lidofinance/core/blob/v3.1.0/contracts/0.4.24/Lido.sol)
- [Deployed contract](https://etherscan.io/address/0xae7ab9...)

Liquid staking pool and a related ERC-20 rebasing token (`stETH`)

## What is Lido?
...
```

If the body already starts with an H1 (or contains an H1 matching the page title in the first 20 lines), no duplicate title is inserted.

### Config

```js
[
  require.resolve('./src/plugins/markdown-source'),
  {
    collections: [
      { path: 'docs', routeBasePath: '/' },
      { path: 'run-on-lido', routeBasePath: 'run-on-lido' },
      { path: 'earn', routeBasePath: 'earn' },
    ],
  },
],
```

| Option | Required | Description |
|---|---|---|
| `collections` | yes | Same `{ path, routeBasePath }` shape as `llms-txt`. `label` is ignored here |

### Behavior

- One `.md` file per source `.md`/`.mdx` (266 on this site)
- Permalink comes from frontmatter `slug` if set, otherwise from filesystem path (with `index.md` collapsing to the parent directory)
- Pages with `draft: true` are skipped
- MDX is sanitized (see [_shared](#shared))
- Robots: `static/robots.txt` blocks crawlers from indexing these URLs via `Disallow: /*.md$` — only matches URLs ending in `.md`, so regular HTML pages (which have no extension in their URL) are unaffected
- Build log: `[markdown-source] generated 266 raw .md files`

### Content type

On GitHub Pages, `.md` files are served with `Content-Type: text/markdown; charset=utf-8` by default. The local `docusaurus serve` command does not set this header — verify against production after the first deploy:

```bash
curl -I https://docs.lido.fi/contracts/lido.md
```

---

## `_shared`

Internal module with the parsing and sanitization logic used by both plugins. Not registered in `docusaurus.config.js`.

### Exports (`_shared/markdown-utils.js`)

| Function | What it does |
|---|---|
| `walkMarkdownFiles(rootDir)` | Recursively lists `.md`/`.mdx` files under a collection, skipping dotfiles, `_partials`, and directories |
| `loadDoc(absPath, collectionPath, routeBasePath)` | Reads a file, parses frontmatter via `gray-matter`, returns `{ permalink, title, description, body, frontmatter, ... }` |
| `buildPermalink(absPath, collectionPath, routeBasePath, frontmatter)` | Computes the URL path. Respects frontmatter `slug:`. Collapses `index.md` to its parent. Honors `routeBasePath` prefix |
| `extractTitle(fm, body)` | Frontmatter `title` → first `# H1` → fallback to filename. Strips `{#anchor}` suffixes and emoji |
| `extractDescription(fm, body)` | Frontmatter `description` → first meaningful paragraph (skips headings, lists, blockquotes, JSX, code). Truncates at 200 chars |
| `sanitizeMdx(content)` | The MDX-to-plain-markdown stripper (details below) |
| `escapeMarkdown(text)` | Inlines a string for use inside list-item descriptions (collapses newlines) |

### MDX sanitization rules

`sanitizeMdx` runs the body through a sequence of regex transforms:

1. Remove `import ... from '...'` and `export ...` lines
2. Replace known components:
   - `<PdfViewer pdfUrl="..." />` → `[PDF](url)`
   - `<Link to="..."> text </Link>` → `[text](url)`
3. Strip JSX-only attributes: `className=`, `style={...}`, `onClick={...}`, and any `attribute={...}` expression
4. Remove uppercase-name JSX components: self-closing `<Foo ... />` and paired `<Foo>...</Foo>` (keeps children)
5. Convert HTML headings `<h1>...</h1>` ... `<h6>...</h6>` to markdown `#` ... `######`
6. Strip layout containers `<div>`, `<span>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>` (keeps inner text)
7. Convert `<br>` to newline
8. Remove MDX comments `{/* ... */}`
9. Collapse runs of 3+ newlines to 2

Inline HTML that markdown understands natively (`<strong>`, `<em>`, `<sub>`, `<code>`, etc.) is left untouched.

### Adding support for a new MDX component

If you introduce a new custom component used in docs, add a dedicated replacement rule inside `sanitizeMdx`. Example for a hypothetical `<Tabs>` component:

```js
out = out.replace(/<Tabs\b[^>]*>([\s\S]*?)<\/Tabs>/g, '$1')
```

Without an explicit rule, the generic uppercase-tag stripper (rule 4) will still remove the tags but may produce messier output for complex cases.

---

## Development tips

**Iterating on a plugin without a full rebuild:**

```bash
rm -rf build && npm run build
```

The plugins only emit files at the very end. Look for the `[llms-txt]` and `[markdown-source]` lines near the end of build output.

**Inspecting output:**

```bash
head -50 build/llms.txt
grep -c "^<!-- source:" build/llms-full.txt   # should equal number of docs
find build -name "*.md" | wc -l               # should equal number of docs
```

**Testing locally:**

```bash
npm run serve
curl -I http://localhost:3000/contracts/lido.md
curl http://localhost:3000/llms.txt | head
```

**Resetting a stuck build cache:**

```bash
npm run clear && npm run build
```

---

## Why custom plugins

Existing community plugins (`docusaurus-plugin-llms`, `docusaurus-markdown-source-plugin`) were considered. They were rejected because:

- Neither supports multiple doc collections in one config call — this site has three (`docs`, `run-on-lido`, `earn`) with different `routeBasePath` values
- Both are young single-maintainer projects (bus factor = 1)
- The logic needed here is ~300 lines total and gives us full control over MDX edge cases specific to this codebase (e.g. the V3 whitepaper's hero JSX block)

The trade-off is owning the parsing code. Markdown structure on this site is stable enough that this is a one-time cost.
