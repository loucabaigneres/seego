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

/** CSS font stacks for the web (weights and italics are handled by font-weight / font-style). */
export const webFonts = {
  display: "'Fraunces', Georgia, serif",
  sans: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif",
} as const;

/** Google Fonts stylesheet for the web apps: `index.html` of web and landing must use exactly this URL. */
export const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600;700;800;900&display=swap';

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
