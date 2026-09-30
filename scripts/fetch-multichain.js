#!/usr/bin/env node
// Checks the addresses these docs publish against the lidofinance/multichain deployment
// ledger, using the ledger's own `publicRefs` anchors as the map: each row names the
// docs.lido.fi section that publishes it, so this script resolves anchor → heading →
// section span and asserts the address is in that span, in a code span, linked to that
// network's block explorer (or, for Safe rows, to a Safe URL bearing the chain prefix).
//
// What a pass means: the section agrees with the fetched ledger snapshot. This script
// reads no chain state — it compares two carriers, ledger.json and the markdown — so it
// establishes nothing about the deployments themselves. Contrast fetch-msig-quorums.js,
// which does read chain state via eth_call.
//
//   node scripts/fetch-multichain.js [--ref=<git-ref>] [--strict] [--json] [--section=<substr>]
//
// Exit codes: 0 agrees · 1 disagreement (or any gap under --strict) · 2 aborted at a gate.
//
// Set MULTICHAIN_LEDGER_PATH to check against a local ledger.json instead of fetching.

const fs = require('fs');
const path = require('path');
const MAP = require('./multichain-map.js');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const LEDGER_REPO = 'lidofinance/multichain';
const LEDGER_FILE = 'ledger.json';
// Pinned: a data-model bump is a code change here, never a silent parse. The upstream
// schema pins this value with `const`, so a mismatch means the model moved under us.
const EXPECTED_SCHEMA_VERSION = '0.2.0';
const FETCH_TIMEOUT_MS = 15_000;
const DOCS_HOST = 'docs.lido.fi';

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const CODE_SPAN_ADDRESS_RE = /`(0x[0-9a-fA-F]{40})`/g;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const EXPLICIT_ID_RE = /\{#([^}]+)\}\s*$/;
// A top-level list item, used to bound a bullet tree inside a section (see gapScan).
const TOP_BULLET_RE = /^-\s+(.*)$/;

const SYMBOL = { ok: '✓', 'link-mismatch': '✗', misplaced: '!', absent: '!', 'no-anchor': '?', 'doc-only': '?' };
// Worst-first, so a row with several refs reports its worst outcome.
const SEVERITY = ['absent', 'misplaced', 'link-mismatch', 'ok'];

// A gate failure means no per-row result from this run can be trusted — exit 2, never 1.
class GateError extends Error {}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = { ref: 'main', strict: false, json: false, section: null };
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)(?:=(.*))?$/);
    if (!m) throw new GateError(`unrecognised argument: ${arg}`);
    const [, name, value] = m;
    if (name === 'ref') opts.ref = value || 'main';
    else if (name === 'section') opts.section = value || '';
    else if (name === 'strict') opts.strict = true;
    else if (name === 'json') opts.json = true;
    else throw new GateError(`unrecognised option: --${name}`);
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Fetch + provenance (A.10: name the carrier, its edition, and the fetch occurrence)
// ---------------------------------------------------------------------------
async function loadLedger(ref) {
  const local = process.env.MULTICHAIN_LEDGER_PATH;
  if (local) {
    const carrier = path.resolve(local);
    return { ledger: JSON.parse(fs.readFileSync(carrier, 'utf8')), carrier, edition: 'local file', commit: null };
  }
  // `refs/heads/<ref>` is unambiguous for branch names containing a slash; the bare form
  // covers tags and commit SHAs.
  const candidates = [
    `https://raw.githubusercontent.com/${LEDGER_REPO}/refs/heads/${ref}/${LEDGER_FILE}`,
    `https://raw.githubusercontent.com/${LEDGER_REPO}/${ref}/${LEDGER_FILE}`,
  ];
  let lastErr;
  for (const url of candidates) {
    try {
      const ledger = await fetchJson(url);
      return { ledger, carrier: url, edition: ref, commit: await resolveCommit(ref) };
    } catch (err) {
      lastErr = err;
    }
  }
  throw new GateError(`could not fetch ${LEDGER_FILE} at ref "${ref}": ${lastErr.message}`);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'lido-docs-fetch-multichain' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// The SHA is the edition: a branch name is a moving pointer, and upstream has already
// rewritten ledger.json without bumping `updatedAt`, so neither identifies a snapshot.
// Still best-effort — an unauthenticated rate limit must not fail the run — which means
// a stamp without `commit=` is not a pinned edition. Re-run or pass a tag/SHA to --ref.
async function resolveCommit(ref) {
  try {
    const url = `https://api.github.com/repos/${LEDGER_REPO}/commits?sha=${encodeURIComponent(ref)}&path=${LEDGER_FILE}&per_page=1`;
    const commits = await fetchJson(url);
    return Array.isArray(commits) && commits[0] ? commits[0].sha.slice(0, 7) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------
function gateShape(ledger) {
  if (!ledger || typeof ledger !== 'object') throw new GateError('ledger is not an object');
  if (ledger.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    throw new GateError(
      `ledger schemaVersion is ${ledger.schemaVersion}, this script is written for ${EXPECTED_SCHEMA_VERSION}. ` +
        'Read the upstream data-model change before bumping EXPECTED_SCHEMA_VERSION.',
    );
  }
  if (!ledger.networks || typeof ledger.networks !== 'object') throw new GateError('ledger.networks is missing');
  if (!Array.isArray(ledger.deployments) || ledger.deployments.length === 0) {
    throw new GateError('ledger.deployments is missing or empty');
  }

  const problems = [];
  for (const [i, d] of ledger.deployments.entries()) {
    const where = d.deploymentId || `deployments[${i}]`;
    for (const key of ['deploymentId', 'contractId', 'deploymentKind', 'contractName', 'address', 'networkId']) {
      if (typeof d[key] !== 'string' || !d[key]) problems.push(`${where}: ${key} missing`);
    }
    if (typeof d.address === 'string' && !ADDRESS_RE.test(d.address)) problems.push(`${where}: malformed address`);
    if (d.deploymentId !== `${d.networkId}:${d.address}`) problems.push(`${where}: deploymentId ≠ networkId:address`);
    if (d.networkId && !ledger.networks[d.networkId]) problems.push(`${where}: networkId absent from ledger.networks`);
  }
  if (problems.length) {
    throw new GateError(`ledger failed shape checks (${problems.length}):\n  ${problems.slice(0, 10).join('\n  ')}`);
  }
}

// A publicRefs route we cannot map, or a network with no link policy, would silently drop
// rows from the check. Abort instead.
function gateTargets(targets) {
  const problems = [];
  for (const t of targets) {
    if (!t.rel) problems.push(`unmapped docs route "${t.route}" (add it to multichain-map.js routes)`);
    if (!MAP.networks[t.row.networkId]) problems.push(`no link policy for ${t.row.networkId} (add it to multichain-map.js networks)`);
    if (t.rel && !t.span) problems.push(`anchor ${t.rel}#${t.anchor} resolves to no heading (row ${t.row.deploymentId})`);
  }
  if (problems.length) {
    const unique = [...new Set(problems)];
    throw new GateError(`ledger and docs have diverged structurally (${unique.length}):\n  ${unique.slice(0, 10).join('\n  ')}`);
  }
}

// ---------------------------------------------------------------------------
// Markdown: headings, section spans, addresses in display position
// ---------------------------------------------------------------------------
const fileCache = new Map();
function loadDoc(rel) {
  if (!fileCache.has(rel)) fileCache.set(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n'));
  return fileCache.get(rel);
}

// Docusaurus honours an explicit `{#id}`; otherwise it slugs the heading text. Emoji and
// punctuation drop out, so "## 1.1 CircuitBreaker Committee" → "11-circuitbreaker-committee".
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headingsOf(rel) {
  const lines = loadDoc(rel);
  const out = [];
  lines.forEach((line, i) => {
    const m = line.match(HEADING_RE);
    if (!m) return;
    const explicit = m[2].match(EXPLICIT_ID_RE);
    const text = m[2].replace(EXPLICIT_ID_RE, '').trim();
    out.push({ level: m[1].length, line: i, id: explicit ? explicit[1] : slugify(text), text });
  });
  return out;
}

const spanCache = new Map();
// A section runs from its heading to the next heading of the same or higher level, so a
// chain heading already contains its "Ethereum part" / "<Chain> part" subheadings.
function sectionSpan(rel, anchor) {
  const key = `${rel}#${anchor}`;
  if (!spanCache.has(key)) {
    const hs = headingsOf(rel);
    const idx = hs.findIndex((h) => h.id === anchor);
    if (idx === -1) spanCache.set(key, null);
    else {
      const next = hs.slice(idx + 1).find((h) => h.level <= hs[idx].level);
      const lines = loadDoc(rel);
      spanCache.set(key, { rel, anchor, from: hs[idx].line, to: next ? next.line : lines.length, heading: hs[idx] });
    }
  }
  return spanCache.get(key);
}

// Addresses in *display* position only. Every linked bullet repeats its address inside the
// URL, and a Balancer pool id's first 40 hex characters look exactly like an address — a
// loose hex scan counts both.
function displayAddresses(rel, from, to) {
  const lines = loadDoc(rel);
  const out = [];
  for (let i = from; i < to; i++) {
    for (const m of lines[i].matchAll(CODE_SPAN_ADDRESS_RE)) out.push({ line: i, address: m[1], text: lines[i] });
  }
  return out;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sameAddress = (a, b) => a.toLowerCase() === b.toLowerCase();

function linkedTo(text, host, address) {
  return new RegExp(`\\]\\(https?://${escape(host)}[^)]*${escape(address)}`, 'i').test(text);
}

function safeLinked(text, shortName, address) {
  return new RegExp(`safe=${escape(shortName)}:${escape(address)}`, 'i').test(text);
}

function linkHostsOn(text) {
  return [...text.matchAll(/\]\((https?:\/\/([^/)]+))/g)].map((m) => m[2]);
}

const matchesPattern = (value, pattern) =>
  pattern.endsWith('*') ? value.startsWith(pattern.slice(0, -1)) : value === pattern;

const isSafeRow = (contractId) => MAP.safeRows.some((p) => matchesPattern(contractId, p));

// ---------------------------------------------------------------------------
// Row check
// ---------------------------------------------------------------------------
function docsTargets(row) {
  return (row.publicRefs || [])
    .filter((ref) => ref.includes(DOCS_HOST))
    .map((ref) => {
      const url = new URL(ref);
      const rel = MAP.routes[url.pathname] || null;
      const anchor = url.hash.replace(/^#/, '');
      return { row, ref, route: url.pathname, rel, anchor, span: rel ? sectionSpan(rel, anchor) : null };
    });
}

// L-2, existential: one section can hold the same hex once per network — § Price Feeds
// lists PriceOracle 0x301cBCDA… on Optimism, Base and Linea — so "the first line holding
// this address" would resolve to the wrong network's bullet and report a false mismatch.
function checkTarget(target) {
  const { row, rel, anchor, span } = target;
  const net = MAP.networks[row.networkId];
  const occurrences = displayAddresses(rel, span.from, span.to).filter((o) => sameAddress(o.address, row.address));

  if (occurrences.length === 0) {
    // "Elsewhere in the file" means elsewhere in display position. An address that survives
    // only inside a link URL is not published text, so it counts as absent, not misplaced.
    const elsewhere = displayAddresses(rel, 0, loadDoc(rel).length).find((o) => sameAddress(o.address, row.address));
    return {
      ...target,
      verdict: elsewhere ? 'misplaced' : 'absent',
      line: elsewhere ? elsewhere.line : null,
      reason: elsewhere ? `published at L${elsewhere.line + 1}, outside #${anchor}` : `not published in ${rel}`,
    };
  }

  const wantsSafe = isSafeRow(row.contractId);
  const good = occurrences.find((o) =>
    wantsSafe ? safeLinked(o.text, net.safeShortName, row.address) : linkedTo(o.text, net.explorer, row.address),
  );
  if (good) return { ...target, verdict: 'ok', line: good.line, reason: null };

  const hosts = [...new Set(occurrences.flatMap((o) => linkHostsOn(o.text)))];
  const expected = wantsSafe ? `a safe=${net.safeShortName}: link` : net.explorer;
  return {
    ...target,
    verdict: 'link-mismatch',
    line: occurrences[0].line,
    reason: hosts.length ? `linked to ${hosts.join(', ')}, expected ${expected}` : `address unlinked, expected ${expected}`,
  };
}

const worst = (verdicts) => SEVERITY.find((v) => verdicts.includes(v)) || 'ok';

// ---------------------------------------------------------------------------
// Doc-only scan (docs → ledger)
//
// "Claimed by no ledger row" is tested against every network, not against the networks
// the section's own rows use: Scroll's four rows are real ledger entries that simply carry
// no publicRefs anchor, and a per-network test would report their addresses as gaps.
// Cross-network mislabelling is therefore out of V1's reach — stated, not hidden.
// ---------------------------------------------------------------------------
function bulletTreeScopes(span, labels) {
  const lines = loadDoc(span.rel);
  const wanted = new Set(labels);
  const scopes = [];
  let open = null;
  for (let i = span.from; i < span.to; i++) {
    const m = lines[i].match(TOP_BULLET_RE);
    if (!m) continue;
    if (open) {
      open.to = i;
      scopes.push(open);
      open = null;
    }
    const label = m[1].replace(/:\s*$/, '').trim();
    if (wanted.has(label)) open = { rel: span.rel, label, from: i, to: span.to };
  }
  if (open) scopes.push(open);
  return scopes;
}

function scanDocOnly(entry, ledgerAddresses, allowlist) {
  const [route, anchor] = entry.ref.split('#');
  const rel = MAP.routes[route];
  if (!rel) throw new GateError(`gapScan entry names unmapped route "${route}"`);
  const span = sectionSpan(rel, anchor);
  if (!span) throw new GateError(`gapScan entry names missing anchor ${rel}#${anchor}`);

  const scopes = entry.bulletTrees ? bulletTreeScopes(span, entry.bulletTrees) : [{ rel, label: null, from: span.from, to: span.to }];
  const missingTrees = entry.bulletTrees
    ? entry.bulletTrees.filter((l) => !scopes.some((s) => s.label === l))
    : [];

  const found = [];
  const allowed = [];
  const seen = new Set();
  for (const scope of scopes) {
    for (const occ of displayAddresses(rel, scope.from, scope.to)) {
      const key = occ.address.toLowerCase();
      if (ledgerAddresses.has(key) || seen.has(key)) continue;
      seen.add(key);
      if (allowlist.has(key)) allowed.push({ ...occ, note: allowlist.get(key) });
      else found.push({ ...occ, scope: scope.label });
    }
  }
  return { entry, rel, anchor, span, found, allowed, missingTrees };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function formatProvenance(p) {
  return [
    `ledger  ref=${p.edition}${p.commit ? `  commit=${p.commit}` : ''}  schemaVersion=${p.schemaVersion}`,
    `        updatedAt=${p.updatedAt}  fetched=${p.fetchedAt}  ${p.rows} rows, ${p.anchored} anchored`,
    `        carrier=${p.carrier}`,
  ].join('\n');
}

function printReport(state, opts) {
  const { provenance, results, docOnly, noAnchor, rowVerdicts } = state;

  console.log(formatProvenance(provenance));

  // Group per section, ordered by file then position.
  const sections = new Map();
  for (const r of results) {
    const key = `${r.rel}#${r.anchor}`;
    if (!sections.has(key)) sections.set(key, { ...r.span, results: [] });
    sections.get(key).results.push(r);
  }
  for (const d of docOnly) {
    const key = `${d.rel}#${d.anchor}`;
    if (!sections.has(key)) sections.set(key, { ...d.span, results: [] });
    sections.get(key).docOnly = d;
  }

  const ordered = [...sections.values()].sort((a, b) => a.rel.localeCompare(b.rel) || a.from - b.from);
  for (const s of ordered) {
    const oks = s.results.filter((r) => r.verdict === 'ok');
    const bad = s.results.filter((r) => r.verdict !== 'ok');
    const gaps = s.docOnly ? s.docOnly.found : [];
    const missingTrees = s.docOnly ? s.docOnly.missingTrees : [];
    // A section whose rows are all anchored to its subsections has nothing of its own to
    // say; printing an empty block would pad the report without adding a fact.
    if (!oks.length && !bad.length && !gaps.length && !missingTrees.length) continue;

    console.log(`\n${s.rel}#${s.anchor}  (L${s.from + 1}–${s.to}${formatNetworks(s.results)})`);
    if (oks.length) console.log(`  ${SYMBOL.ok} ${String(oks.length).padStart(2)} ${oks.length === 1 ? 'row agrees' : 'rows agree'}`);
    for (const r of bad) console.log(`  ${SYMBOL[r.verdict]} ${formatRow(r)}  ${r.reason}`);
    for (const g of gaps) {
      console.log(
        `  ${SYMBOL['doc-only']} ${`L${g.line + 1}`.padEnd(6)}${g.address}  ${bulletLabel(g.text).padEnd(38)} claimed by no ledger row${g.scope ? ` · ${g.scope}` : ''}`,
      );
    }
    if (missingTrees.length) {
      console.log(`  ${SYMBOL['doc-only']} configured bullet trees not found: ${missingTrees.join(', ')}`);
    }
  }

  if (noAnchor.length) {
    console.log(`\nnot checkable — no ${DOCS_HOST} publicRef (${noAnchor.length} rows)`);
    for (const row of noAnchor) {
      console.log(`  ${SYMBOL['no-anchor']} ${row.networkId.padEnd(13)} ${`${row.contractId}/${row.deploymentKind}`.padEnd(56)} ${row.address}`);
    }
  }

  const counts = { ok: 0, 'link-mismatch': 0, misplaced: 0, absent: 0 };
  for (const v of rowVerdicts.values()) counts[v]++;
  const checked = rowVerdicts.size;
  const gapCount = docOnly.reduce((n, d) => n + d.found.length, 0);
  const allowedCount = docOnly.reduce((n, d) => n + d.allowed.length, 0);

  console.log(
    `\n${checked} rows checked: ${counts.ok} agree · ${counts['link-mismatch']} link-mismatch · ` +
      `${counts.misplaced} misplaced · ${counts.absent} absent` +
      ` | ${noAnchor.length} no-anchor · ${gapCount} doc-only`,
  );
  // Coverage is only meaningful over the whole ledger; under --section the denominator
  // would flatter or damn the run at random, so it is withheld rather than qualified.
  if (opts.section === null) {
    console.log(
      `checkable coverage ${checked}/${provenance.rows} rows (${Math.round((checked / provenance.rows) * 100)}%)` +
        ` — bounded by upstream publicRefs, not by this script`,
    );
  } else {
    console.log(`filtered to sections matching "${opts.section}" — coverage withheld, this is a partial run`);
  }
  console.log(`allowlisted as not-a-Lido-deployment: ${allowedCount} addresses in scanned sections`);
  console.log(
    'compares carriers only: no chain state was read, so an agreeing row means it matches this ledger snapshot.',
  );
  if (!opts.strict && (noAnchor.length || gapCount)) {
    console.log('no-anchor and doc-only are upstream-facing gaps; run with --strict to fail on them.');
  }
}

const formatRow = (r) =>
  `${(r.line === null ? '—' : `L${r.line + 1}`).padEnd(6)}${`${r.row.contractId}/${r.row.deploymentKind}`.padEnd(54)} ${r.row.address}`;

// Networks touched by a section's rows, trimmed: § Emergency Brakes Multisigs alone spans 14.
function formatNetworks(results) {
  const nets = [...new Set(results.map((r) => r.row.networkId))].sort();
  if (!nets.length) return '';
  const shown = nets.slice(0, 4).join(' + ');
  return `, ${shown}${nets.length > 4 ? ` +${nets.length - 4} more` : ''}`;
}

// The docs label of a bullet, so a doc-only line says what the address is, not just where.
function bulletLabel(text) {
  const body = text.replace(/^\s*[-*]\s*/, '');
  const label = body.split(':')[0].replace(/[[\]`]/g, '').trim();
  const kind = body.match(/\((proxy|impl|implementation)\)/i);
  return kind ? `${label} (${/^proxy$/i.test(kind[1]) ? 'proxy' : 'impl'})` : label;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { ledger, carrier, edition, commit } = await loadLedger(opts.ref);
  gateShape(ledger);

  const rows = ledger.deployments;
  const hasDocsRef = (row) => (row.publicRefs || []).some((ref) => ref.includes(DOCS_HOST));
  const anchoredRows = rows.filter(hasDocsRef);
  const noAnchor = rows.filter((row) => !hasDocsRef(row));

  const targets = anchoredRows.flatMap(docsTargets);
  gateTargets(targets);

  const selected = opts.section === null ? targets : targets.filter((t) => `${t.route}#${t.anchor}`.includes(opts.section));
  const results = selected.map(checkTarget);

  // One row can carry several docs refs (12 do today); it agrees only if all of them do.
  const rowVerdicts = new Map();
  for (const r of results) {
    const prev = rowVerdicts.get(r.row.deploymentId);
    rowVerdicts.set(r.row.deploymentId, worst([...(prev ? [prev] : []), r.verdict]));
  }

  const ledgerAddresses = new Set(rows.map((d) => d.address.toLowerCase()));
  const allowlist = new Map(MAP.thirdParty.map(([addr, note]) => [addr.toLowerCase(), note]));
  const gapEntries = opts.section === null ? MAP.gapScan : MAP.gapScan.filter((e) => e.ref.includes(opts.section));
  const docOnly = gapEntries.map((entry) => scanDocOnly(entry, ledgerAddresses, allowlist));

  const provenance = {
    carrier,
    edition,
    commit,
    schemaVersion: ledger.schemaVersion,
    updatedAt: ledger.updatedAt,
    fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    rows: rows.length,
    anchored: anchoredRows.length,
  };

  const state = { provenance, results, docOnly, noAnchor: opts.section === null ? noAnchor : [], rowVerdicts };

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          provenance,
          // Row-level counts, matching the text report; `results` below is one entry per
          // (row, docs ref), and 12 rows carry more than one ref.
          summary: {
            rowsChecked: rowVerdicts.size,
            ...['ok', 'link-mismatch', 'misplaced', 'absent'].reduce(
              (acc, v) => ({ ...acc, [v]: [...rowVerdicts.values()].filter((x) => x === v).length }),
              {},
            ),
            noAnchor: state.noAnchor.length,
            docOnly: docOnly.reduce((n, d) => n + d.found.length, 0),
            filtered: opts.section !== null,
          },
          results: results.map((r) => ({
            deploymentId: r.row.deploymentId,
            contractId: r.row.contractId,
            deploymentKind: r.row.deploymentKind,
            networkId: r.row.networkId,
            ref: r.ref,
            file: r.rel,
            line: r.line === null ? null : r.line + 1,
            verdict: r.verdict,
            reason: r.reason,
          })),
          docOnly: docOnly.flatMap((d) =>
            d.found.map((f) => ({ file: d.rel, anchor: d.anchor, line: f.line + 1, address: f.address, scope: f.scope })),
          ),
          allowlisted: docOnly.reduce((n, d) => n + d.allowed.length, 0),
          noAnchor: state.noAnchor.map((row) => ({
            deploymentId: row.deploymentId,
            contractId: row.contractId,
            deploymentKind: row.deploymentKind,
          })),
        },
        null,
        2,
      ),
    );
  } else {
    printReport(state, opts);
  }

  const disagreements = [...rowVerdicts.values()].filter((v) => v !== 'ok').length;
  const gaps = state.noAnchor.length + docOnly.reduce((n, d) => n + d.found.length + d.missingTrees.length, 0);
  return disagreements > 0 || (opts.strict && gaps > 0) ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err instanceof GateError) {
      console.error(`aborted: ${err.message}`);
      process.exit(2);
    }
    console.error(err);
    process.exit(2);
  });
