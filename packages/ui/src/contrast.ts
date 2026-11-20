/** WCAG 2.x contrast helpers (https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio). */

export type Rgba = readonly [r: number, g: number, b: number, a: number];

export function parseColor(value: string): Rgba {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1) as unknown as Rgba;
  }
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgba)
    return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] ? Number(rgba[4]) : 1];
  throw new Error(`Unsupported colour: ${value}`);
}

/** Composites `fg` (possibly translucent) over an opaque `bg`. */
export function blend(fg: string, bg: string): Rgba {
  const [fr, fgc, fb, fa] = parseColor(fg);
  const [br, bgc, bb] = parseColor(bg);
  const mix = (f: number, b: number) => Math.round(f * fa + b * (1 - fa));
  return [mix(fr, br), mix(fgc, bgc), mix(fb, bb), 1];
}

function luminance([r, g, b]: Rgba): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** Contrast ratio between two colours; translucent `fg` is composited over `bg` first. */
export function contrastRatio(fg: string | Rgba, bg: string): number {
  const front = typeof fg === 'string' ? blend(fg, bg) : fg;
  const [a, b] = [luminance(front), luminance(parseColor(bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** WCAG AA thresholds. */
export const AA = { text: 4.5, largeText: 3, ui: 3 } as const;
