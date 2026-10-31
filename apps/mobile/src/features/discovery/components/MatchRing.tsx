import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/tokens';
import { Text } from '@/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 64;
const STROKE = 6;
const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Confidence ring: fills up to `percent` when it appears, like the web's `MatchSummary`. */
export function MatchRing({ percent }: { percent: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(percent / 100, { duration: 1000 }));
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.get()),
  }));

  return (
    <View
      role="img"
      aria-label={`Fiabilité ${percent} %`}
      className="size-16 items-center justify-center"
    >
      <Svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.background}
          strokeWidth={STROKE}
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.brand}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text variant="label">{percent}%</Text>
    </View>
  );
}
