import { describe, expect, it } from 'vitest';

import { colors } from './colors';
import { AA, contrastRatio } from './contrast';

const { background, surface, ink, brand, accent, cta, line } = colors;
const success = colors.success.text;

/** [foreground, background, label] pairs the apps rely on for body-size text. */
const TEXT_PAIRS: [string, string, string][] = [
  [ink.DEFAULT, background, 'ink on background'],
  [ink.DEFAULT, surface, 'ink on surface'],
  [ink.secondary, background, 'ink-secondary on background'],
  [ink.secondary, surface, 'ink-secondary on surface'],
  [ink.muted, background, 'ink-muted on background'],
  [ink.muted, surface, 'ink-muted on surface'],
  [brand, background, 'brand text on background'],
  [brand, surface, 'brand text on surface'],
  [brand, accent, 'brand text on accent (badges)'],
  [success, background, 'success text on background'],
  [success, surface, 'success text on surface'],
  [success, '#E8E3D7', 'success text on success/10 tint'],
  [ink.inverse, brand, 'crema on vino (like heart, labels)'],
  [accent, brand, 'pesca on vino (buttons)'],
  [cta, brand, 'albicocca on vino'],
  [ink.DEFAULT, cta, 'notte on albicocca (CTA button)'],
  [accent, ink.DEFAULT, 'pesca on notte'],
  [ink.inverse, ink.DEFAULT, 'crema on notte'],
];

/** Non-text parts that carry information (WCAG 1.4.11, 3:1). */
const UI_PAIRS: [string, string, string][] = [
  [colors.line.strong, background, 'field outline on background'],
  [brand, background, 'brand outline on background'],
  [ink.inverse, brand, 'icon crema on vino'],
];

describe('WCAG AA contrast', () => {
  it.each(TEXT_PAIRS)('text %s / %s', (fg, bg, label) => {
    expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(AA.text);
  });

  it.each(UI_PAIRS)('ui %s / %s', (fg, bg, label) => {
    expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(AA.ui);
  });

  it('keeps the decorative separator subtle (not used to carry information)', () => {
    expect(contrastRatio(line.DEFAULT, background)).toBeLessThan(AA.ui);
  });

  /**
   * Known, documented exception: albicocca is a decorative accent (progress fills, wordmark dot)
   * and is below 3:1 on crema/travertino. It never carries information alone: progress is always
   * paired with a text label ("Étape 2 sur 4", "%").
   */
  it('documents the albicocca exception on light backgrounds', () => {
    expect(contrastRatio(cta, background)).toBeLessThan(AA.ui);
  });
});
