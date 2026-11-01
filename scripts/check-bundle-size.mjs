/**
 * @fileoverview Verifies that the gzipped production entry chunk is under 130 kB and contains no bundled secrets.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist', 'assets');
const htmlFile = path.resolve(process.cwd(), 'dist', 'index.html');
const MAX_GZIP_BYTES = 130 * 1024; // 130 kB

if (!fs.existsSync(distDir) || !fs.existsSync(htmlFile)) {
  console.error(`Error: dist directory or index.html does not exist. Run build first.`);
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
const entryMatch = htmlContent.match(/<script[^>]+src=["'](?:\/assets\/|assets\/)?([^"']+\.js)["']/i);
const entryFilename = entryMatch ? entryMatch[1] : null;

if (!entryFilename) {
  console.error('Error: Could not identify entry script in dist/index.html');
  process.exit(1);
}

const files = fs.readdirSync(distDir);
const jsFiles = files.filter((f) => f.endsWith('.js'));

if (jsFiles.length === 0) {
  console.error('Error: No JS chunks found in dist/assets.');
  process.exit(1);
}

let hasOversizeChunk = false;
let hasSecretLeak = false;

for (const file of jsFiles) {
  const filePath = path.join(distDir, file);
  const content = fs.readFileSync(filePath);
  const textContent = content.toString('utf-8');

  // Check for hardcoded API keys
  if (/AIzaSy[0-9A-Za-z-_]{33}/.test(textContent)) {
    console.error(`FAILED: ${file} contains bundled API key pattern!`);
    hasSecretLeak = true;
  }

  const gzipped = zlib.gzipSync(content);
  const sizeKb = (gzipped.length / 1024).toFixed(2);
  const isEntry = file === entryFilename;
  const label = isEntry ? '[ENTRY] ' : '';

  console.log(`${label}Bundle chunk ${file}: raw ${content.length} B, gzip ${sizeKb} kB`);

  if (gzipped.length > MAX_GZIP_BYTES) {
    console.error(`FAILED: ${file} gzip size (${sizeKb} kB) exceeds 130 kB budget!`);
    hasOversizeChunk = true;
  }
}

if (hasOversizeChunk || hasSecretLeak) {
  process.exit(1);
}

console.log('SUCCESS: All production chunks are strictly within 130 kB gzipped budget and clean of secrets.');
process.exit(0);
