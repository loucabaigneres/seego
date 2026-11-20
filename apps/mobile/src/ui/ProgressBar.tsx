import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from './cn';

export interface ProgressBarProps {
  value: number;
  className?: string;
}

/**
 * Reanimated CSS transition on a translation, not on `width`: it runs on the UI thread without
 * a layout pass per frame, so it stays smooth while the swipe deck animates.
 */
const FILL_TRANSITION = { transitionProperty: 'transform', transitionDuration: 300 } as const;

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);

  return (
    <View className={cn('h-1 overflow-hidden rounded-full bg-surface', className)}>
      <Animated.View
        className="h-full w-full rounded-full bg-cta"
        style={{ transform: [{ translateX: `${(clamped - 1) * 100}%` }], ...FILL_TRANSITION }}
      />
    </View>
  );
}
