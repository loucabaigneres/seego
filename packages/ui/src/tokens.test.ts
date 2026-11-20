import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { buildThemeCss } from './css';
import { colors, fonts, palette, radii, SCREEN_MARGIN, typeScale, webFonts } from './index';
import { tailwindTheme } from './tailwind';

describe('tokens', () => {
  it('exposes the charte palette', () => {
    expect(Object.keys(palette)).toEqual([
      'vino',
      'albicocca',
      'pesca',
      'crema',
      'travertino',
      'notte',
      'oliva',
    ]);
    expect(colors.background).toBe(palette.crema);
  });

  it('has no corallo left', () => {
    expect(JSON.stringify({ palette, colors })).not.toMatch(/corallo|#E5553B/i);
  });

  it('keeps the charte radii and margin', () => {
    expect(radii).toMatchObject({ button: 28, card: 20, field: 16 });
    expect(SCREEN_MARGIN).toBe(24);
  });

  it('never sets a line height below its font size', () => {
    for (const [size, lineHeight] of Object.values(typeScale))
      expect(lineHeight).toBeGreaterThanOrEqual(size);
  });
});

describe('tailwind v3 theme', () => {
  it('maps radii and type scale to px strings', () => {
    const theme = tailwindTheme();
    expect(theme.borderRadius.card).toBe('20px');
    expect(theme.fontSize.title).toEqual(['38px', { lineHeight: '40px' }]);
    expect(theme.colors).toBe(colors);
  });
});

describe('tailwind v4 @theme css', () => {
  const css = buildThemeCss();

  it('flattens nested colors', () => {
    expect(css).toContain(`--color-brand: ${colors.brand};`);
    expect(css).toContain(`--color-ink-muted: ${colors.ink.muted};`);
    expect(css).toContain(`--color-surface: ${colors.surface};`);
  });

  it('is in sync with the committed theme.css', () => {
    const committed = readFileSync(fileURLToPath(new URL('./theme.css', import.meta.url)), 'utf8');
    expect(committed).toBe(css);
  });
});

describe('self-hosted fonts', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const css = readFileSync(`${root}src/fonts.css`, 'utf8');

  it('ships every file declared in fonts.css', () => {
    const urls = [...css.matchAll(/url\('\.\.\/(fonts\/web\/[^']+)'\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(existsSync(`${root}${url}`), url).toBe(true);
  });

  it('declares the families of the typography tokens', () => {
    for (const family of ['Fraunces', 'Hanken Grotesk'])
      expect(css).toContain(`font-family: '${family}'`);
    expect(webFonts.display).toContain("'Fraunces'");
    expect(webFonts.sans).toContain("'Hanken Grotesk'");
  });

  it('ships a static file for every React Native family name', () => {
    for (const family of Object.values(fonts)) {
      expect(existsSync(`${root}fonts/native/${family}.ttf`), family).toBe(true);
    }
  });
});
