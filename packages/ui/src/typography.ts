/**
 * Serif = emotion (titles, key figures), sans = action (buttons, fields, info).
 * React Native needs one family name per weight; these match the loaded font files.
 */
export const fonts = {
  display: 'Fraunces_400Regular',
  'display-italic': 'Fraunces_400Regular_Italic',
  sans: 'HankenGrotesk_400Regular',
  'sans-medium': 'HankenGrotesk_500Medium',
  'sans-semibold': 'HankenGrotesk_600SemiBold',
  'sans-bold': 'HankenGrotesk_700Bold',
} as const;

/** Static files (in `fonts/native`) behind each React Native family name above. */
export const NATIVE_FONT_FILES = {
  Fraunces_400Regular: 'Fraunces-Regular.ttf',
  Fraunces_400Regular_Italic: 'Fraunces-Italic.ttf',
  HankenGrotesk_400Regular: 'HankenGrotesk-Regular.ttf',
  HankenGrotesk_500Medium: 'HankenGrotesk-Medium.ttf',
  HankenGrotesk_600SemiBold: 'HankenGrotesk-SemiBold.ttf',
  HankenGrotesk_700Bold: 'HankenGrotesk-Bold.ttf',
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
