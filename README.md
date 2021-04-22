# Lido Docs

Lido documentation is built using [Docusaurus 2](https://docusaurus.io/). The resulting version of documentation hosted via Github Pages from branch `gh-pages` of this repository.

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Documentation Pages

Documentation pages stored in `/docs` folder. By default files with `.md` and `.mdx` extensions are treated as documentation pages. Every document has a unique `id`. By default, a document `id` is the name of the document (without the extension) relative to the root docs directory.

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

The appereance of sidebar controlled manually via `sidebars.js` file. This file is used to:

- Group multiple related documents
- Display a sidebar on each of those documents
- Provide a paginated navigation, with next/previous button

By default new added pages don't added to sidebar automatically. For example to add new page `faq.md` as the last item of sidebar we need modify `sidebar.js` next way:

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
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Build and deploy happens automatically when pull request is merged to `main `branch or someone pushes to `main` branch directly.

To build documentation locally and push builded version to the `gh-pages` branch use next command:

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```
