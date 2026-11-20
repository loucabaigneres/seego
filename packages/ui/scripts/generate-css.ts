import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { buildThemeCss } from '../src/css';

const target = fileURLToPath(new URL('../src/theme.css', import.meta.url));
writeFileSync(target, buildThemeCss());
process.stdout.write(`Wrote ${target}\n`);
