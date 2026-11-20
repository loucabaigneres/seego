/**
 * Scans the apps' source for class strings that pair a `bg-*` and a `text-*` token and
 * reports the pairs below WCAG AA. Usage: `pnpm --filter @seego/ui audit:contrast`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { colors } from '../src/colors';
import { AA, blend, contrastRatio } from '../src/contrast';

type Tree = { readonly [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'string') out[name] = value;
    else Object.assign(out, flatten(value, name));
  }
  return out;
}

const TOKENS = flatten(colors);
const PAGE = colors.background;
const root = fileURLToPath(new URL('../../../', import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : files(path);
    return /\.tsx$/.test(name) ? [path] : [];
  });
}

const CLASS = /^((?:[a-z-]+:)*)(bg|text)-([a-z-]+?)(?:\/(\d+))?$/;
const LARGE =
  /(^|\s)(?:[a-z-]+:)*text-(?:\[?(?:2xl|3xl|4xl|5xl|6xl|display|title|section)\]?)(\s|$)/;

interface Failure {
  file: string;
  line: number;
  variant: string;
  fg: string;
  bg: string;
  ratio: number;
  need: number;
}
const failures: Failure[] = [];
let checked = 0;

for (const app of ['apps/web/src', 'apps/mobile/src', 'apps/landing-page/src']) {
  for (const file of files(join(root, app))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/gs)) {
      const literal = match[2];
      const byVariant = new Map<string, { bg?: string; text?: string }>();
      for (const cls of literal.split(/\s+/)) {
        const m = CLASS.exec(cls);
        if (!m || !(m[3] in TOKENS)) continue;
        const [, variant, kind, token, alpha] = m;
        const entry = byVariant.get(variant) ?? {};
        let value = TOKENS[token];
        if (alpha) {
          const base = kind === 'bg' ? PAGE : (entry.bg ?? PAGE);
          const [r, g, b] = blend(`rgba(${parseColor(value)},${Number(alpha) / 100})`, base);
          value = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        }
        entry[kind === 'bg' ? 'bg' : 'text'] = value;
        byVariant.set(variant, entry);
      }
      // Translucent chips over photos: the real background is unknown, so enforce the charte's
      // minimum veil (notte >= 55 %) instead of a ratio.
      for (const m of literal.matchAll(/(?<![\w:-])bg-ink\/(\d+)/g)) {
        if (/text-(?:ink-inverse|accent)/.test(literal) && Number(m[1]) < 55) {
          failures.push({
            file: relative(root, file),
            line: source.slice(0, match.index ?? 0).split('\n').length,
            variant: 'photo-scrim',
            fg: 'text',
            bg: `bg-ink/${m[1]}`,
            ratio: Number(m[1]) / 100,
            need: 0.55,
          });
        }
      }
      const base = byVariant.get('') ?? {};
      for (const [variant, entry] of byVariant) {
        const bg = entry.bg ?? base.bg;
        const text = entry.text ?? base.text;
        if (!bg || !text) continue;
        // Only evaluate variants that actually change one side (or the base itself).
        if (variant && !entry.bg && !entry.text) continue;
        // Translucent backgrounds sit over photos or unknown surfaces: handled by the scrim rule.
        if (/bg-(?:ink|surface-raised|brand)\/\d+/.test(literal) && /backdrop-blur/.test(literal))
          continue;
        checked += 1;
        const need = LARGE.test(literal) ? AA.largeText : AA.text;
        const ratio = contrastRatio(text, bg);
        if (ratio < need) {
          const index = (match.index ?? 0) + (match[0].indexOf(literal) >= 0 ? 0 : 0);
          failures.push({
            file: relative(root, file),
            line: source.slice(0, index).split('\n').length,
            variant: variant || 'base',
            fg: text,
            bg,
            ratio,
            need,
          });
        }
      }
    }
  }
}

function parseColor(hex: string): string {
  const h = hex.replace('#', '');
  if (h.startsWith('rgba') || hex.startsWith('rgba')) return '0,0,0';
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
}

process.stdout.write(`Checked ${checked} bg/text pairs.\n`);
for (const f of failures) {
  process.stdout.write(
    `FAIL ${f.file}:${f.line} [${f.variant}] ${f.fg} on ${f.bg} = ${f.ratio.toFixed(2)} (< ${f.need})\n`,
  );
}
process.exitCode = failures.length ? 1 : 0;
