import { ActivityIndicator } from 'react-native';

import { colors } from '@seego/ui';

const SPINNER_COLORS = {
  brand: colors.brand,
  inverse: colors.ink.inverse,
  accent: colors.accent,
  ink: colors.ink.DEFAULT,
} as const;

export function Spinner({
  size = 'small',
  tone = 'brand',
}: {
  size?: 'small' | 'large';
  tone?: 'brand' | 'inverse' | 'accent' | 'ink';
}) {
  return <ActivityIndicator size={size} color={SPINNER_COLORS[tone]} />;
}
