const fs = require('fs');
const https = require('https');
const path = require('path');

// Source & dest ------------------------------------------------------------
const fileUrl =
  'https://raw.githubusercontent.com/lidofinance/audits/refs/heads/main/README.md';
const localPath = path.join(__dirname, '../docs/security/audits.md');

/* ------------------------------ helpers --------------------------------- */
function preprocessMarkdown(md) {
  const urlPrefix =
    'https://github.com/lidofinance/audits/blob/main/';
  const pdfRe = /(\[.*?\]\()(?!http|https|#|\/|mailto:)([^)]+\.pdf)(\))/g;
  return md.replace(pdfRe, (_, p1, rel, p3) => p1 + urlPrefix + rel + p3);
}

function sortAuditsAndCount(md) {
  const lines = md.split('\n');
  const out = [];
  let curH2 = null;
  let buf = [];
  let inH2 = false;
  const counts = {}; // { heading: nReports }

  function flushSection() {
    if (!inH2) return;
    const { heading, body, nReports } = processSection(curH2, buf);
    counts[stripCount(heading)] = nReports;
    out.push(...body);
    buf = [];
  }

  function stripCount(h) {
    return h.replace(/\s*\(\d+\s+reports?\)$/i, '').trim();
  }

  function processSection(headingLine, buffer) {
    const auditBlocks = [];
    const preamble = [];
    let cur = null;

    for (const ln of buffer) {
      if (ln.startsWith('### ')) {
        if (cur) auditBlocks.push(cur);
        cur = { header: ln, lines: [] };
      } else {
        (cur ? cur.lines : preamble).push(ln);
      }
    }
    if (cur) auditBlocks.push(cur);

    auditBlocks.sort((a, b) => {
      const r = /^###\s+(\d{1,2})-(\d{4})/;
      const A = a.header.match(r);
      const B = b.header.match(r);
      const vA = A ? +A[2] * 12 + +A[1] : 0;
      const vB = B ? +B[2] * 12 + +B[1] : 0;
      return vB - vA;
    });

    const hClean = stripCount(headingLine);
    const headingWithCount = `${hClean} (${auditBlocks.length} reports)`;

    const sectionLines = [headingWithCount, ...preamble];
    for (const blk of auditBlocks) {
      sectionLines.push(blk.header, ...blk.lines);
    }
    return {
      heading: hClean,
      nReports: auditBlocks.length,
      body: sectionLines,
    };
  }

  for (const ln of lines) {
    if (ln.startsWith('## ')) {
      flushSection();
      curH2 = ln;
      inH2 = true;
    } else if (inH2) {
      buf.push(ln);
    } else {
      out.push(ln);
    }
  }
  flushSection();
  return { content: out.join('\n'), counts };
}

/* ---------------------------- fetch & write ----------------------------- */
https
  .get(fileUrl, (res) => {
    if (res.statusCode !== 200) {
      console.error('Failed to fetch audits README –', res.statusCode);
      process.exit(1);
    }
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      const pre = preprocessMarkdown(data);
      const { content, counts } = sortAuditsAndCount(pre);

      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, content, 'utf8');

      // Pretty-print counts summary
      console.log('\nCategory counts:');
      for (const [cat, n] of Object.entries(counts)) {
        console.log(`  • ${cat}: ${n}`);
      }

      console.log('\n👌 Audits list written →', localPath);
    });
  })
  .on('error', (e) => {
    console.error('Network error:', e.message);
    process.exit(1);
  });
