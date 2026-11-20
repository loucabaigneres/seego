import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@seego/ui';

import { cn } from './cn';
import type { AppIcon } from './icons';
import { Text } from './Text';

// Our Text keeps its classes on web, where Animated.Text would drop them.
const AnimatedText = Animated.createAnimatedComponent(Text);

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: AppIcon;
}

export interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `tabs` switches views; `radio` picks a form value. */
  kind?: 'tabs' | 'radio';
  /** `brand`: vino pill on crema; `soft`: crema pill on travertino, for a view switch. */
  variant?: keyof typeof VARIANTS;
  className?: string;
}

const VARIANTS = {
  brand: {
    track: 'border border-line-strong bg-background',
    pill: 'bg-brand',
    on: colors.accent,
    off: colors.ink.secondary,
  },
  soft: { track: 'bg-surface', pill: 'bg-background', on: colors.brand, off: colors.ink.muted },
} as const;

const ROLES = {
  tabs: { group: 'tablist', item: 'tab' },
  radio: { group: 'radiogroup', item: 'radio' },
} as const;

const SLIDE_TIMING = { duration: 240, easing: Easing.out(Easing.cubic) };

/** Switches between sibling views of one screen (tabs, not navigation), or picks one value. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  kind = 'tabs',
  variant = 'brand',
  className,
}: SegmentedControlProps<T>) {
  const styles = VARIANTS[variant];
  const selectedIndex = segments.findIndex((segment) => segment.value === value);
  /** Index the pill sits on, fractional while it slides. */
  const position = useSharedValue(selectedIndex);
  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth = trackWidth / segments.length;

  useEffect(() => {
    position.set(withTiming(selectedIndex, SLIDE_TIMING));
  }, [selectedIndex, position]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.get() * segmentWidth }],
  }));

  return (
    <View role={ROLES[kind].group} className={cn('rounded-full p-1', styles.track, className)}>
      <View
        className="flex-row"
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        {trackWidth > 0 && (
          // On web, Animated components drop className: the pill is drawn by a plain View inside.
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: segmentWidth }, pillStyle]}>
            <View className={cn('flex-1 rounded-full', styles.pill)} />
          </Animated.View>
        )}
        {segments.map((segment, index) => {
          const selected = index === selectedIndex;
          return (
            <Pressable
              key={segment.value}
              role={ROLES[kind].item}
              aria-selected={kind === 'tabs' ? selected : undefined}
              aria-checked={kind === 'radio' ? selected : undefined}
              onPress={() => onChange(segment.value)}
              className={cn(
                'min-h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-4 active:opacity-80',
                // Until the track is measured, the pill can't be placed: the segment paints it.
                selected && !trackWidth && styles.pill,
              )}
            >
              {segment.icon && (
                <segment.icon size={16} color={selected ? styles.on : styles.off} />
              )}
              <SegmentLabel
                label={segment.label}
                index={index}
                position={position}
                on={styles.on}
                off={styles.off}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface SegmentLabelProps {
  label: string;
  index: number;
  position: SharedValue<number>;
  on: string;
  off: string;
}

/** Turns light as the pill slides under it, so it never reads light on the track. */
function SegmentLabel({ label, index, position, on, off }: SegmentLabelProps) {
  const style = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.abs(position.get() - index),
      [0, 1],
      [on, off],
    ),
  }));

  return (
    <AnimatedText className="font-sans-semibold text-control" style={style}>
      {label}
    </AnimatedText>
  );
}
