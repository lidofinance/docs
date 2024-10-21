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
  const pdfLinkRegex = /(\[.*?\]\()(?!http|https|#|\/|mailto:)([^)]+\.pdf)(\))/g;

  // Replace function
  const processedContent = content.replace(pdfLinkRegex, (match, p1, p2, p3) => {
    const newUrl = urlPrefix + p2;
    return p1 + newUrl + p3;
  });

  return processedContent;
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
    // Preprocess the markdown content
    const processedContent = preprocessMarkdown(data);

    // Write the processed content to the local file
    fs.writeFile(localPath, processedContent, (err) => {
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
