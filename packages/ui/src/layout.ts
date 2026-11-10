export const radii = {
  /** Bottom sheets. */
  sheet: 28,
  button: 28,
  card: 20,
  field: 16,
} as const;

/** Spacing base is 4 (Tailwind's default scale). */
export const SPACING_BASE = 4;

/** Screens keep a 24px margin. */
export const SCREEN_MARGIN = 24;

/** Minimum touch target (WCAG 2.2 AA, as required by the charte). */
export const MIN_TOUCH_TARGET = 44;
