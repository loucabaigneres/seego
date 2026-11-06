/**
 * Serif = emotion (titles, key figures), sans = action (buttons, fields, info).
 * React Native needs one family name per weight. Each name is the file name (without `.ttf`) in
 * `fonts/native`, which the `expo-font` config plugin (apps/mobile/app.json) embeds in the app:
 * Android uses the file name as the family, iOS the PostScript name, and they are identical.
 */
export const fonts = {
  display: 'Fraunces-Regular',
  'display-italic': 'Fraunces-Italic',
  sans: 'HankenGrotesk-Regular',
  'sans-medium': 'HankenGrotesk-Medium',
  'sans-semibold': 'HankenGrotesk-SemiBold',
  'sans-bold': 'HankenGrotesk-Bold',
} as const;

/** CSS font stacks for the web (weights and italics are handled by font-weight / font-style). */
export const webFonts = {
  display: "'Fraunces', Georgia, serif",
  sans: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif",
} as const;

/** [fontSize, lineHeight] in px, from the charte's type scale. */
export const typeScale = {
  display: [72, 72],
  title: [38, 40],
  section: [26, 30],
  label: [17, 22],
  body: [16, 24],
  /** Chips and compact controls. */
  control: [15, 20],
  caption: [14, 20],
  overline: [12, 16],
} as const;
