// Points the Vercel rewrites (API proxy) at the API of the target environment.
// The committed vercel.json targets staging; the CD runs this with the production URL on `main`.
// Usage: node scripts/set-api-proxy.mjs https://voyagr-api.onrender.com
import { readFileSync, writeFileSync } from 'node:fs';

const STAGING_API = 'https://voyagr-api-stg.onrender.com';
const target = process.argv[2]?.replace(/\/$/, '');

if (!target || !/^https:\/\//.test(target)) {
  console.error('Usage: node scripts/set-api-proxy.mjs <https://api-url>');
  process.exit(1);
}

const path = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(path, 'utf8'));

for (const rewrite of config.rewrites) {
  rewrite.destination = rewrite.destination.replace(STAGING_API, target);
}

writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
console.warn(`Vercel API proxy -> ${target}`);
