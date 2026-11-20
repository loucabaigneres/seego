/** Raw palette from the charte. Use the semantic `colors` below in components. */
export const palette = {
  vino: '#5C1426',
  albicocca: '#F08A5D',
  pesca: '#F5C6A8',
  crema: '#F7F0E8',
  travertino: '#EADBCB',
  notte: '#22090F',
  oliva: '#5F6B3A',
} as const;

/**
 * Two families, each with its companion:
 *  - crema (background) pairs with travertino (surfaces, separators);
 *  - vino (brand, actions) pairs with pesca (accents and text on vino).
 * Notte is the ink, oliva the validation tone.
 * Albicocca (`cta`) is the secondary accent: the highlighted action, progress and the wordmark dot.
 */
export const colors = {
  /** Main background. */
  background: palette.crema,
  /** Cards, tiles, chips and panels — separated from the background by colour, never by shadow. */
  surface: palette.travertino,
  ink: {
    /** Body text, titles, photo overlays. */
    DEFAULT: palette.notte,
    /** Secondary body text. */
    secondary: '#3A2227',
    /** "Gris": captions, hints — 6.4:1 on crema, 5.4:1 on travertino. */
    muted: '#6A5055',
    /** Text on vino, notte or photos. */
    inverse: palette.crema,
  },
  /** Brand: every action (buttons, links, active states, errors). Text on it is crema or pesca. */
  brand: palette.vino,
  /** Companion of vino: accents, badges and secondary text on vino or notte. */
  accent: palette.pesca,
  success: {
    /** Validation, weather: fills and icons. */
    DEFAULT: palette.oliva,
    /** Success as text: a darker oliva, 5.3:1 on travertino (oliva itself is 4.2:1). */
    text: '#505C2F',
  },
  line: {
    /** Decorative separators. */
    DEFAULT: 'rgba(34,9,15,0.12)',
    /** Outlines of fields, chips and controls — must stay ≥ 3:1. */
    strong: '#9C8474',
  },
  /**
   * Highlight: the one "go" action of a screen (generate, save, sign in, like).
   * Soft apricot. Text on it is always notte (7.6:1). Used sparingly: one highlighted action,
   * progress fills, the wordmark dot.
   */
  cta: palette.albicocca,
  /** Veil under text on photos: notte ≥ 55 %. Also the modal backdrop. */
  scrim: 'rgba(34,9,15,0.55)',
} as const;

/** Category palette shared by badges, map pins and the PDF. To validate with design. */
export const categoryColors = {
  hotel: { fill: palette.vino, ink: palette.crema },
  activity: { fill: palette.oliva, ink: palette.crema },
  restaurant: { fill: palette.pesca, ink: palette.vino },
  other: { fill: palette.travertino, ink: palette.notte },
} as const;
