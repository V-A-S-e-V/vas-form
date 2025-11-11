// Node script to download SVG flags for African countries from Rest Countries
// Usage: node scripts/download_flags.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Download flags for all countries
const API = 'https://restcountries.com/v3.1/all?fields=cca2,flags';
const OUT_DIR = path.join(__dirname, '..', 'flags');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to download ${url} (${res.statusCode})`));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  try {
    console.log('Fetching country list...');
    const data = await fetchJson(API);
    if (!Array.isArray(data)) throw new Error('Unexpected API response');

    mkdirp(OUT_DIR);

    // download each svg
    for (const c of data) {
      const code = (c.cca2 || '').toLowerCase();
      const svgUrl = c.flags && (c.flags.svg || c.flags.png);
      if (!code || !svgUrl) {
        console.warn('Skipping country with missing code or flag', c);
        continue;
      }

      const dest = path.join(OUT_DIR, `${code}.svg`);
      try {
        console.log(`Downloading ${code} -> ${dest}`);
        await downloadFile(svgUrl, dest);
      } catch (err) {
        console.error(`Failed to download ${svgUrl}:`, err.message);
      }
    }

    console.log('Done. Flags saved to', OUT_DIR);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
