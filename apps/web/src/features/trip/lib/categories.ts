import { categoryColors, colors, palette } from '@seego/ui';

/**
 * Mirrors `CATEGORY_META` on the planning page: a pale `tint` behind `ink.secondary`
 * text for badges, the saturated `fill` reserved for the selected state. `ink`
 * is the same hue pushed dark enough to stay legible on a white pin.
 */
export const CAT_STYLE: Record<string, { fill: string; ink: string; tint: string }> = {
  hotel: {
    fill: categoryColors.hotel.fill,
    ink: palette.vino,
    tint: `${categoryColors.hotel.fill}1f`,
  },
  activité: {
    fill: categoryColors.activity.fill,
    ink: palette.oliva,
    tint: `${categoryColors.activity.fill}1f`,
  },
  restaurant: {
    fill: categoryColors.restaurant.fill,
    ink: palette.vino,
    tint: `${categoryColors.restaurant.fill}38`,
  },
};

const DEFAULT_STYLE = { fill: colors.ink.muted, ink: colors.ink.secondary, tint: colors.surface };

export function catStyle(category: string | null) {
  return CAT_STYLE[category ?? ''] ?? DEFAULT_STYLE;
}

export const CAT_LABEL: Record<string, string> = {
  hotel: 'Hébergement',
  activité: 'Activité',
  restaurant: 'Restaurant',
};

export const CAT_EMOJI: Record<string, string> = {
  hotel: '🏨',
  activité: '🗺️',
  restaurant: '🍽️',
};
