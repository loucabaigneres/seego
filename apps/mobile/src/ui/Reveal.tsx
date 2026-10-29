import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STAGGER_MS = 90;
const DURATION_MS = 450;

export interface RevealProps {
  children: ReactNode;
  order?: number;
  className?: string;
}

export function Reveal({ children, order = 0, className }: RevealProps) {
  return (
    <Animated.View entering={FadeInDown.duration(DURATION_MS).delay(order * STAGGER_MS)}>
      {/* On web, the entering animation drops the className styles: they live on an inner View. */}
      <View className={className}>{children}</View>
    </Animated.View>
  );
}
