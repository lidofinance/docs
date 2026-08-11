---
name: security-triage
description: Walk every open Dependabot security alert on this repository, prepare the fixes that are safe to prepare, and explain the ones deliberately left alone. Groups the alerts, fans out subagents for the judgement calls, edits the manifest, verifies against a baseline, isolates and reverts whatever breaks, and writes a report. Use when asked to handle Dependabot alerts, security advisories, or the weekly vulnerability pass.
---

# Dependabot triage

One pass over every open alert. You collect them, decide what happens to each package, make the
changes, prove the site still builds, and write up what is left.

Read `policy.md` next to this file before anything else. It holds the standing decisions — what is
never upgraded, what is not reachable in this deployment, which files may be edited — and you hand it
to every subagent you spawn.

**Nothing is staged, committed or pushed, and nothing is written back to GitHub.** Dismissals come
out as text the developer pastes into the Dependabot UI themselves.

---

## 0. Before starting

```bash
gh auth status                  # must be logged in and able to read security alerts
git status --porcelain          # must be empty
node -v && npm -v               # node >= 20.18.1, npm >= 10.x (see engines / packageManager)
```

**A clean tree is load-bearing, not politeness.** Isolating a broken bump means `git checkout --`
over `package.json` and `package-lock.json`, which would silently swallow uncommitted edits in the
same files. If the tree is dirty, stop and say so.

```bash
git checkout main && git pull --ff-only
git checkout -b chore/dependabot-$(date +%Y-%m-%d)
```

`main` is the branch that deploys to docs.lido.fi, so that is what a fix branches from. Keep a
scratch directory for this run — baseline output, verdicts, notes. Use your scratchpad, not the
repository.

## 1. Collect the alerts

```bash
gh api --paginate '/repos/lidofinance/docs/dependabot/alerts?state=open&per_page=100' \
  --jq '.[] | {n: .number, url: .html_url, pkg: .dependency.package.name,
               manifest: .dependency.manifest_path, scope: .dependency.scope,
               sev: .security_advisory.severity, ghsa: .security_advisory.ghsa_id,
               summary: .security_advisory.summary,
               range: .security_vulnerability.vulnerable_version_range,
               patched: .security_vulnerability.first_patched_version.identifier}'
```

Use `--jq` rather than piping raw JSON: `--paginate` concatenates one array per page, and advisory
descriptions are full of brackets, so parsing the raw stream by eye goes wrong.

**Group by `pkg`.** There is one manifest here and every alert points at `package-lock.json`, so the
package name is the whole grouping key. Forty-odd alerts usually collapse into fifteen or so groups,
and a group is one unit of work — one decision, one edit, one verdict. Sort by highest severity
first, and note that a single package often carries several alerts with different patched versions;
the group targets the highest of them.

**Ignore the `scope` field.** Every alert on this repository reads `runtime` because it comes from
the lockfile, including packages that only ever run inside webpack. It carries no information here.
What matters is whether the package ends up in the browser bundle, and `policy.md` says how to
establish that.

Settle two kinds of group immediately, without a subagent:

- The package is on the **never-upgrade** list in `policy.md` → dismissal, no edit, no prompt.
- The installed version is **already at or above** the published patch → nothing to do; the alert
  closes on its own when GitHub rescans.

An alert whose `manifest` is not `package.json` or `package-lock.json` goes in the report as
uncovered — do not guess at it.

## 2. Baseline

The production build is the gate on this repository, and it is a real one: `onBrokenLinks`,
`onBrokenAnchors` and `onBrokenMarkdownLinks` are all set to `throw`, so a dependency that changes
how Markdown or MDX is parsed fails the build loudly. Record what it does *before* you touch
anything, because a failure that was already there is not yours.

```bash
npm ci
npm run build              > $SCRATCH/base-build.txt    2>&1
npx prettier --check docs/ > $SCRATCH/base-prettier.txt  2>&1
```

`npm ci`, not `npm install` — the baseline has to be the versions the lockfile actually pins. The
build takes a couple of minutes on a warm cache, and it is the expensive part of every later cycle;
budget for that rather than running it more often than the run needs.

The build passes on `main` today, and it still prints things that look like problems: a Browserslist
staleness notice, a Docusaurus update banner, and a webpack "Critical dependency" warning out of
`vscode-languageserver-types`. All three are already there. When comparing later, **normalise before
diffing**: strip timings, byte sizes and the progress lines, so an unrelated rebuild does not read as
a change. What counts as a regression is a new error, not a different number of milliseconds.

The prettier baseline only matters if the fix wave ends up editing source. It is cheap, so take it
anyway — and it is already red on dozens of content files, so compare it against the baseline rather
than expecting it to pass.

If `npm ci` or the baseline build fails, stop. Without a working baseline there is nothing to compare
against, and waving every change through on that technicality is worse than doing nothing.

## 3. Gather the facts, then triage

For each group that needs a decision, collect what can be established rather than guessed:

```bash
npm ls <pkg> --all              # every installed copy and who pulls it in
grep -n '"<pkg>"' package.json  # declared directly? already in overrides?
npm view <pkg> versions --json  # the version you plan to target must exist
```

Note whether the package is declared directly, whether an `overrides` entry already exists, and
whether **more than one major line is installed** — that last one is the trap `policy.md` warns
about, and npm handles it differently from Yarn.

Then launch one `security-triage-decide` subagent per group, **all in one message** so they run
concurrently. They are read-only, so parallelism is safe. Give each one the group's facts, the
alerts, and the path to `policy.md`.

Check every verdict that comes back against the floors in `policy.md` — published patch, installed
version, registry existence, never-upgrade list. A verdict that fails one of those is not applied;
it becomes an open question with the reason recorded. A verdict with no real reasoning behind it is
the same: for a no-action group that text *is* the dismissal comment, so an empty one is worse than
no verdict at all.

## 4. Apply, then isolate

Make **every** version change first, then verify once:

```bash
npm install                     # regenerates package-lock.json from the edited manifest
npm run build
```

`npm install` here, not `npm ci` — the lockfile is out of step with the manifest you just edited, and
`npm ci` refuses to run in that state. Read what the install prints: npm rejects an override that
contradicts a direct dependency, and it will tell you so instead of applying it silently.

Compare the build against the baseline. Clean → done, and that is the common case for one cycle.

Dirty → find the culprit by halving, not by inspection:

```bash
git checkout -- package.json package-lock.json
# re-apply half the changes, npm install, build again, repeat
```

Reset both files **every time** before applying a subset. Skipping that once gives a wrong answer
silently — the tree still holds the previous attempt's edits.

Keep the loop mechanical. It is boring on purpose, and the boredom is what makes it correct.

## 5. The fix wave

Two kinds of group are left: a version change the build rejected, and a group no plain bump could
close. Both need edit access and both are handled the same way.

Before each one, **record what every already-modified file holds** — copy them into your scratch
directory. That copy is the only thing a revert can work from, and it has to be the exact bytes, not
a memory of what changed.

Then run `security-triage-fix` subagents **one at a time** — they share a working tree, so parallel
runs would race. Give each the group's facts, the failure output where there is one, and
`policy.md`.

Verify the **whole wave at once**, not after each edit. A cycle here is an install plus a full
Docusaurus build, which is the slowest thing in the run; checking after every edit costs one of those
per group for no extra information.

If the wave comes back dirty, revert edits **newest first**, re-checking after each: a later edit may
only break because of an earlier one, and undoing them in the other order blames the wrong change.

An agent that reports a fix but changed no file did not fix anything. Check the tree, not the claim.

## 6. Check what actually closed

A change can land cleanly and still leave a vulnerable copy behind. npm hoists what it can and nests
the rest, so one package name routinely resolves to two different versions in the same tree — an
override that covers one branch leaves the other exactly where it was.

After the final install, re-read the installed versions and, **per alert**, check whether any
surviving copy still falls inside that alert's vulnerable range:

```bash
npm ls <pkg> --all
```

Saying "closes #302" in one section and "#302 stays open" in another is worse than either alone. If a
copy survived, say which alerts stay open and what pulls the old copy in.

## 7. Browser smoke, if it is worth it

Only when something that ships to the browser was changed and the build is clean. Serve the build
you just produced and look at it:

```bash
npm run serve                   # serves ./build on http://localhost:3000
```

Open the affected pages with Playwright MCP and read the console. Which pages depends on what moved,
and `policy.md` lists the ones that exercise each client-side library — a Mermaid page for diagrams,
a stVaults page for KaTeX, the search box for the local search index.

**This is a smoke check** — did the page come up, did the diagram or formula render, is the console
clean. No screenshots, no clicking through flows, no responsive sweep, no Figma comparison. A handful
of pages at most. Skip it entirely if Playwright MCP is unavailable and put the pages in the report
instead.

Nothing that only runs at build time needs this. A webpack or Babel advisory has already been
exercised by the build itself.

## 8. Report

Write `.security-triage/report-<date>.md`:

- **Summary** — alerts open, groups triaged, fixes prepared and how many alerts they close, ready to
  dismiss, waiting on a human, already satisfied.
- **Applied** — every edit with file, from, to. For each group: which alerts it closes, and where a
  vulnerable copy survived, which alerts **stay open** and why.
- **Check by hand** — numbered *actions*, in the order worth doing them. Only things that could not
  be done for the developer: open a specific page at a specific URL, run a command that rewrites
  files (with the cleanup command), eyeball some output. **Never** an install, a lockfile
  regeneration, a prettier run or a build — those already happened. Never "keep the override and the
  direct declaration in sync" — that is done in the same edit.
- **Dismiss in the Dependabot UI** — per group: alert links, reason, comment, ready to paste.
- **Needs a human** — no fix exists, or the call is a product decision. Say what has to be decided.
- **Verification** — the baseline build result, the final one, what regressed, what was already
  failing beforehand, what was skipped and why.
- **Changed files.**

Then tell the developer plainly: nothing was staged or committed, review the diff, and how to get
back to the branch they started on.

---

## Rules

> **Never commit, stage or push.** No `git add`, no `git commit`. The developer reviews the
> changeset. If asked for a commit message, write it out as text.

> **Never write back to GitHub.** `gh` is used to read alerts and nothing else. Dismissals are pasted
> by a human.

> **Never hand-edit `package-lock.json`.** It follows from `package.json` when the install runs.

> **Never run `npm audit fix`.** `--force` walks direct dependencies across majors with no regard for
> what this site needs, and even without it the rewrite is unreviewable. Dependabot alerts are the
> source of truth; `npm audit` is fine to *read*.

> **Never edit documentation content to accommodate a dependency.** Markdown and MDX under `docs/`,
> `run-on-lido/` and `earn/` is the product. A bump that only builds after the content is reworded is
> a bump that needs a human.

> **Never silence a failure.** Loosening `onBrokenLinks`, dropping a plugin, deleting a page or
> commenting out a diagram until the build goes green moves a real failure past a gate that exists to
> catch it. If that is the only way through, the fix was not made.

- Stop and ask when a fix would need a product decision, or when the working tree is not clean.
- If you are interrupted mid-run, say where you stopped and how to get the tree back:
  `git checkout -- . && git clean -fd` returns to the branch head.
- `node_modules` is reinstalled several times over a run, so hand-patched packages and `npm link`
  will not survive one. Say so if the developer has either.
