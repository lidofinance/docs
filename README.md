# Lido Docs

Lido documentation is built using [Docusaurus 3](https://docusaurus.io/). The resulting version of documentation hosted via GitHub Pages from the `gh-pages` branch of this repository..

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

Additional information about sidebar and ways to modify it can be found [here](https://docusaurus.io/docs/sidebar)

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

## Fetch and refresh external content

Fetch external markdown files to build an up-to-date version.

```console
npm run fetch-external
```

## Ask Docs Feature Setup

1. Add your OpenAI API token to the `.env` file ([platform.openai.com/api-keys](https://platform.openai.com/api-keys)):

   ```bash
   cp .env.example .env
   ```

   ```bash
   OPENAI_API_KEY=sk-...
   ```

2. Generate embeddings if they don't exist (this may take some time):

   ```bash
   npm run chat:generate-embeddings
   ```

3. Start the questions processing server:

   ```bash
   npm run chat:start-server
   ```

4. Launch the application by running `npm start` and click the "Ask Docs" button in the menu

5. Start asking questions about the documentation!

> **Note**: This is an MVP implementation intended for local testing only. For production use, several improvements are needed:
>
> - Replace JSON-based embeddings storage with a proper vector database
> - Optimize embeddings generation and management for better resource utilization
> - Refactor the state management (currently using Zustand for quick prototyping)
> - Restructure the Q&A server architecture
