import { Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import { cn } from '@/ui';
import { HeartIcon, InfoIcon, XIcon } from '@/ui/icons';

import { SWIPE_THRESHOLD } from '../lib/swipe-gesture';

/** Drag, in px, before the matching button starts to grow. */
const GROWTH_START = 20;
/** Extra scale of the button once the drag reaches the swipe threshold. */
const MAX_GROWTH = 0.12;

/** The button on the side the card is dragged to grows, as a preview of the decision. */
function growthScale(distance: number): number {
  'worklet';
  return (
    1 +
    MAX_GROWTH * interpolate(distance, [GROWTH_START, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP)
  );
}

export interface SwipeActionsProps {
  onSkip?: () => void;
  onLike?: () => void;
  onDetails?: () => void;
  disabled?: boolean;
  /** Horizontal drag of the top card. */
  dragX?: SharedValue<number>;
}

export function SwipeActions({
  onSkip,
  onLike,
  onDetails,
  disabled = false,
  dragX,
}: SwipeActionsProps) {
  const skipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: growthScale(-(dragX?.get() ?? 0)) }],
  }));
  const likeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: growthScale(dragX?.get() ?? 0) }],
  }));

  return (
    <View className="flex-row items-center justify-center gap-6">
      <Animated.View style={skipStyle}>
        <Pressable
          role="button"
          aria-label="Passer"
          aria-disabled={disabled}
          disabled={disabled}
          onPress={onSkip}
          className={cn(
            'size-16 items-center justify-center rounded-full border border-brand active:opacity-80',
            disabled && 'opacity-50',
          )}
        >
          <XIcon size={28} color={colors.brand} />
        </Pressable>
      </Animated.View>

      <Pressable
        role="button"
        aria-label="Voir les détails"
        aria-disabled={disabled}
        disabled={disabled}
        onPress={onDetails}
        className={cn(
          'size-12 items-center justify-center rounded-full border border-brand active:opacity-80',
          disabled && 'opacity-50',
        )}
      >
        <InfoIcon size={24} color={colors.brand} />
      </Pressable>

      <Animated.View style={likeStyle}>
        <Pressable
          role="button"
          aria-label="J’adore"
          aria-disabled={disabled}
          disabled={disabled}
          onPress={onLike}
          className={cn(
            'size-16 items-center justify-center rounded-full bg-brand active:opacity-80',
            disabled && 'opacity-50',
          )}
        >
          <HeartIcon size={28} weight="fill" color={colors.ink.inverse} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
