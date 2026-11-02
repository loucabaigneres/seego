import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme/tokens';

import { cn } from './cn';

/** Notte opacity from the photo edge (offset 0) towards its centre (offset 1). */
const STOPS = {
  /** Behind a title and its details: dense enough for crema text (charte: notte ≥ 55 %). */
  bottom: [
    { offset: 0, opacity: 0.85 },
    { offset: 0.5, opacity: 0.4 },
    { offset: 1, opacity: 0 },
  ],
  /** Behind small overlays such as photo indicators or a badge. */
  top: [
    { offset: 0, opacity: 0.45 },
    { offset: 1, opacity: 0 },
  ],
} as const;

export interface PhotoScrimProps {
  /** Edge of the photo the veil starts from. */
  edge: keyof typeof STOPS;
  /** Height of the veil, e.g. `h-28` or `h-3/5`. */
  className?: string;
}

/** Gradient veil that keeps text readable on top of a photo. */
export function PhotoScrim({ edge, className }: PhotoScrimProps) {
  // `url(#…)` only accepts plain identifiers, and `useId` may contain other characters.
  const gradientId = `scrim${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View
      className={cn(
        'pointer-events-none absolute inset-x-0',
        edge === 'bottom' ? 'bottom-0' : 'top-0',
        className,
      )}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0"
            x2="0"
            y1={edge === 'bottom' ? '1' : '0'}
            y2={edge === 'bottom' ? '0' : '1'}
          >
            {STOPS[edge].map(({ offset, opacity }) => (
              <Stop
                key={offset}
                offset={offset}
                stopColor={colors.ink.DEFAULT}
                stopOpacity={opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
