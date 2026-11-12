import { colors } from './colors';
import { radii } from './layout';
import { fonts, typeScale } from './typography';

const px = (value: number) => `${value}px`;

/** `theme.extend` for Tailwind v3 configs (NativeWind / mobile). */
export function tailwindTheme() {
  return {
    colors,
    borderRadius: Object.fromEntries(Object.entries(radii).map(([key, value]) => [key, px(value)])),
    fontFamily: Object.fromEntries(Object.entries(fonts).map(([key, value]) => [key, [value]])),
    fontSize: Object.fromEntries(
      Object.entries(typeScale).map(([key, [size, lineHeight]]) => [
        key,
        [px(size), { lineHeight: px(lineHeight) }] as [string, { lineHeight: string }],
      ]),
    ),
  };
}
