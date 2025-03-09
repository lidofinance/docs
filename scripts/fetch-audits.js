// scripts/fetch-audits.js

const fs = require('fs');
const https = require('https');
const path = require('path');

// Path to the README.md file inside the audits repo to fetch
const fileUrl = 'https://raw.githubusercontent.com/lidofinance/audits/refs/heads/main/README.md';
// Where to put the file downloaded
const localPath = path.join(__dirname, '../docs/security/audits.md');

function preprocessMarkdown(content) {
  // base URL for the audits repo
  const urlPrefix = 'https://github.com/lidofinance/audits/blob/main/';

  // Regular expression to find relative links to PDF files in markdown preserving absolute ones
  const pdfLinkRegex = /(\[.*?\]\()(?!https?|#|\/|mailto:)([^)]+\.pdf)(\))/g;

  // Replace function
  const processedContent = content.replace(pdfLinkRegex, (match, p1, p2, p3) => {
    const newUrl = urlPrefix + p2;
    return p1 + newUrl + p3;
  });

  return processedContent;
}

/**
 * Sort audit blocks (h3 sections) within each h2 section.
 *
 * This function assumes that:
 * - h2 sections are marked by lines starting with "## "
 * - Each audit (h3) header starts with "### " followed by a date in MM-YYYY format.
 *
 * Audit blocks are sorted so that the most recent audits (i.e. higher year/month) come first.
 * Any text (preamble) before the first h3 within an h2 section is preserved.
 */
function sortAudits(content) {
  const lines = content.split('\n');
  const output = [];
  let inH2Section = false;
  let currentH2Heading = null;
  let h2Buffer = [];

  // Process one h2 section: sort its h3 audit blocks by date (MM-YYYY)
  function processH2Section(heading, buffer) {
    const preamble = [];
    const auditBlocks = [];
    let currentBlock = null;

    for (const line of buffer) {
      if (line.startsWith('### ')) {
        // When a new audit block is encountered, push the previous one (if any)
        if (currentBlock) {
          auditBlocks.push(currentBlock);
        }
        currentBlock = { header: line, content: [] };
      } else {
        // Lines belong to the current audit block or the preamble if no audit block has started yet
        if (currentBlock) {
          currentBlock.content.push(line);
        } else {
          preamble.push(line);
        }
      }
    }
    if (currentBlock) {
      auditBlocks.push(currentBlock);
    }

    // Sort audit blocks in descending order using the MM-YYYY date at the start of each header
    auditBlocks.sort((a, b) => {
      // Regex to capture month and year from headers like: "### 12-2020 Sigma Prime Security Assessment"
      const regex = /^###\s+(\d{1,2})-(\d{4})/;
      const mA = a.header.match(regex);
      const mB = b.header.match(regex);

      // If no date is found, use 0 (so it sorts last)
      const valueA = mA ? (parseInt(mA[2], 10) * 12 + parseInt(mA[1], 10)) : 0;
      const valueB = mB ? (parseInt(mB[2], 10) * 12 + parseInt(mB[1], 10)) : 0;
      return valueB - valueA;
    });

    // Reassemble the section with the original h2 heading, any preamble, and the sorted audit blocks.
    const sectionLines = [];
    sectionLines.push(heading);
    sectionLines.push(...preamble);
    for (const block of auditBlocks) {
      sectionLines.push(block.header);
      sectionLines.push(...block.content);
    }
    return sectionLines;
  }

  // Process the file line by line
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Start of a new h2 section: process any previous h2 section
      if (inH2Section) {
        const processedSection = processH2Section(currentH2Heading, h2Buffer);
        output.push(...processedSection);
        h2Buffer = [];
      }
      currentH2Heading = line;
      inH2Section = true;
    } else {
      if (inH2Section) {
        h2Buffer.push(line);
      } else {
        // Lines outside any h2 section are passed through unchanged.
        output.push(line);
      }
    }
  }

  // Process the last h2 section if there is one.
  if (inH2Section) {
    const processedSection = processH2Section(currentH2Heading, h2Buffer);
    output.push(...processedSection);
  }

  return output.join('\n');
}

// Fetcher
https.get(fileUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to fetch the file. Status code: ${response.statusCode}`);
    process.exit(1);
  }

  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    // 1) Preprocess links
    const processedContent = preprocessMarkdown(data);
    // 2) Reorder the H3 headings for each H2
    const sortedContent = sortAudits(processedContent);

    // Write the processed content to the local file
    fs.writeFile(localPath, sortedContent, (err) => {
      if (err) {
        console.error('Error writing the file:', err.message);
        process.exit(1);
      } else {
        console.log('External doc fetched and processed successfully.');
      }
    });
  });
}).on('error', (err) => {
  console.error('Error fetching the file:', err.message);
  process.exit(1);
});
