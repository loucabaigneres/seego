import { colors } from './colors';
import { radii } from './layout';
import { typeScale, webFonts } from './typography';

type ColorTree = { readonly [key: string]: string | ColorTree };

function flattenColors(tree: ColorTree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
    return typeof value === 'string'
      ? [[name, value] as [string, string]]
      : flattenColors(value, name);
  });
}

/** Builds the Tailwind v4 `@theme` block from the shared tokens. */
export function buildThemeCss(): string {
  const lines: string[] = [];
  for (const [name, value] of flattenColors(colors)) lines.push(`  --color-${name}: ${value};`);
  lines.push('');
  for (const [name, value] of Object.entries(radii)) lines.push(`  --radius-${name}: ${value}px;`);
  lines.push('');
  for (const [name, value] of Object.entries(webFonts)) lines.push(`  --font-${name}: ${value};`);
  lines.push('');
  for (const [name, [size, lineHeight]] of Object.entries(typeScale)) {
    lines.push(`  --text-${name}: ${size}px;`);
    lines.push(`  --text-${name}--line-height: ${lineHeight}px;`);
  }
  return [
    '/* AUTO-GENERATED from packages/ui/src — run `pnpm --filter @seego/ui generate:css`. Do not edit. */',
    '@theme {',
    ...lines,
    '}',
    '',
  ].join('\n');
}
