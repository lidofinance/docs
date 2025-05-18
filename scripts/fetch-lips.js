// scripts/fetch-lips.js

const fs = require("fs");
const https = require("https");
const path = require("path");

// Path to the lido improvement proposals repo API
const API_URL =
  "https://api.github.com/repos/lidofinance/lido-improvement-proposals/contents/LIPS?ref=develop";
// Raw path base dir
const RAW_BASE =
  "https://raw.githubusercontent.com/lidofinance/lido-improvement-proposals/develop/LIPS/";
// Where to put the file generate
const localPath = path.join(__dirname, "../docs/lips.md");

/* Canonical list & order of statuses we display */
const STATUSES = [
  "WIP",
  "Proposed",
  "Approved",
  "Implemented",
  "Rejected",
  "Withdrawn",
  "Deferred",
  "Moribund",
];

/* Mapping of raw → canonical */
const STATUS_MAP = {
  draft: "WIP",
  wip: "WIP",
  proposed: "Proposed",
  discussion: "Proposed",
  review: "Proposed",
  approved: "Approved",
  voted: "Approved",
  implemented: "Implemented",
  accepted: "Implemented",
  final: "Implemented",
  rejected: "Rejected",
  declined: "Rejected",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
  moribund: "Moribund",
  deprecated: "Moribund",
};

function getFromGitHub(url, json = false) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "node/fetch-lips",
            Accept: json ? "application/vnd.github+json" : "*/*",
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} → ${url}`));
            res.resume();
            return;
          }
          const bufs = [];
          res.on("data", (d) => bufs.push(d));
          res.on("end", () => {
            const txt = Buffer.concat(bufs).toString("utf8");
            resolve(json ? JSON.parse(txt) : txt);
          });
        }
      )
      .on("error", reject);
  });
}

function parseYamlFrontMatter(md) {
  const m = md.match(/^---[\r\n]+([\s\S]*?)^---/m);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([^:]+):\s*(.*)$/);
    if (kv) meta[kv[1].trim().toLowerCase()] = kv[2].trim();
  }
  return meta;
}

function parseMarkdownTableHeader(md) {
  const block = md.match(/^(?:\s*\|.*\n){3}/m);
  if (!block) return null;
  const [hdr, sep, vals] = block[0].trim().split(/\r?\n/);
  const keys = hdr
    .split("|")
    .map((s) => s.trim().replace(/:$/, "").toLowerCase())
    .filter(Boolean);
  const fields = vals
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!keys.includes("lip")) return null;
  const meta = {};
  for (let i = 0; i < keys.length; i++) meta[keys[i]] = fields[i] || "";
  return meta;
}

function parseMetadata(md) {
  return parseYamlFrontMatter(md) || parseMarkdownTableHeader(md) || {};
}

function normalizeLip(raw) {
  const m = String(raw || "").match(/(\d+)/);
  const num = m ? parseInt(m[1], 10) : NaN;
  return { num, str: num ? String(num) : String(raw) };
}

function canonicalStatus(raw = "") {
  return STATUS_MAP[raw.toLowerCase()] || "WIP";
}

function esc(str = "") {
  return str.replace(/\|/g, "&#124;").replace(/\n/g, " ");
}

function renderDiscussion(val) {
  if (!val || /^(none|null)$/i.test(val)) return "None";
  const urls = val.split(/[,\s]+/).filter(Boolean);
  return urls
    .map((u, idx) => `[Link${urls.length > 1 ? " " + (idx + 1) : ""}](${u})`)
    .join(", ");
}

function renderTable(rows) {
  const header =
    "| LIP&nbsp;# | Title | Author | Discussions&#8209;to |\n|------------|-------|--------|----------------|";
  const body = rows
    .map(
      (r) =>
        `| [${r.num}](${r.link}) | ${esc(r.title)} | ${esc(r.author)} | ${renderDiscussion(
          r.discussion
        )} |`
    )
    .join("\n");
  return `${header}\n${body}`;
}

async function main() {
  const listing = await getFromGitHub(API_URL, true);
  const files = listing.filter((f) => f.name.endsWith(".md"));

  const buckets = Object.fromEntries(STATUSES.map((s) => [s, []]));

  for (const f of files) {
    const rawMd = await getFromGitHub(RAW_BASE + f.name);
    const meta = parseMetadata(rawMd);
    const { num } = normalizeLip(meta.lip);

    if (isNaN(num)) {
      console.warn("⚠️  skipping malformed:", f.name);
      continue;
    }

    const entry = {
      num,
      title: meta.title || "",
      author: meta.author || "",
      discussion: meta["discussions-to"] || meta.discussion || "",
      link: `https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-${num}.md`,
    };

    buckets[canonicalStatus(meta.status)].push(entry);
  }

  for (const arr of Object.values(buckets)) arr.sort((a, b) => b.num - a.num);

  const out = [
    "# Lido Improvement Proposals\n",
    "Lido Improvement Proposals (LIPs) describe standards for the Lido platform, including core protocol specifications, client APIs, and contract standards.\n",
    "More details on the contribution process and LIPs statuses can be found [here](https://github.com/lidofinance/lido-improvement-proposals).\n",
  ];


  // Pretty-print counts summary
  console.log('\nCategory counts:');

  for (const sec of STATUSES) {
    if (!buckets[sec].length) continue;

    console.log(`  • ${sec}: ${buckets[sec].length}`);

    out.push(`## ${sec}\n`);
    out.push(renderTable(buckets[sec]));
    out.push("");
  }

  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, out.join("\n"), "utf8");

  console.log("\n👌 Lido improvement proposals fetched and summary written →", localPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
