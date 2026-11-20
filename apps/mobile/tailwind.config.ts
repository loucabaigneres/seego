import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';

import { tailwindTheme } from '@seego/ui/tailwind';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [nativewindPreset],
  // The app is light-only (app.json `userInterfaceStyle`); `media` would crash when Expo forces the scheme.
  darkMode: 'class',
  theme: {
    extend: tailwindTheme(),
  },
  plugins: [],
} satisfies Config;
