import { Image } from 'expo-image';
import { useEffect, useImperativeHandle, useState, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { categoryMeta, cleanDescription, placePhotos } from '@/domain/place';
import { colors } from '@/theme/tokens';
import { Badge, cn, PhotoScrim, Tag, Text } from '@/ui';
import { ImageIcon, MapPinIcon } from '@/ui/icons';

import { placeCategory, placeSubcategories, type DiscoveryPlace } from '../lib/discovery-place';
import { photoTapTarget, swipeOutcome } from '../lib/swipe-gesture';

export interface SwipeCardHandle {
  /** Throws the card off screen, then calls `onDone`. */
  flyOut: (direction: 'like' | 'skip', onDone: () => void) => void;
}

// Values taken from the web deck.
/** Vertical offset and scale step between stacked cards. */
const STACK_OFFSET = 10;
const STACK_SCALE_STEP = 0.04;
const STACK_TIMING = { duration: 300, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };
const FLY_OUT_TIMING = { duration: 320, easing: Easing.in(Easing.ease) };
/** The card tilts 0.05° per dragged pixel, up to 20° when it flies out. */
const MAX_TILT = 20;
const TILT_DISTANCE = MAX_TILT / 0.05;
/** The card follows the finger fully on x, loosely on y. */
const VERTICAL_FOLLOW = 0.3;
/** Movement, in px, before a touch becomes a drag rather than a tap. */
const DRAG_START = 6;

const ACCESSIBILITY_ACTIONS = [
  { name: 'like', label: 'J’adore' },
  { name: 'skip', label: 'Passer' },
];

export interface SwipeCardProps {
  place: DiscoveryPlace;
  /** 0 for the top card, then 1 and 2 behind it. */
  position: number;
  /** True while a card flies out: gestures wait for it to finish. */
  isLeaving: boolean;
  /** Horizontal drag of the top card, shared with the action buttons. */
  dragX: SharedValue<number>;
  onDecide: (liked: boolean) => void;
  ref?: Ref<SwipeCardHandle>;
}

export function SwipeCard({ place, position, isLeaving, dragX, onDecide, ref }: SwipeCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  // Each card owns its motion: the card that leaves is unmounted, nothing has to be reset.
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const stackPosition = useSharedValue(position);

  const isTop = position === 0;
  const photos = placePhotos(place);
  const category = placeCategory(place);
  const tags = placeSubcategories(place).slice(0, 3);
  const description = cleanDescription(place.description);
  const location = [place.city, place.country].filter(Boolean).join(', ');

  useEffect(() => {
    stackPosition.set(withTiming(position, STACK_TIMING));
  }, [position, stackPosition]);

  // The other photos only show on tap: load them as soon as the card reaches the top.
  useEffect(() => {
    const otherPhotos = placePhotos(place).slice(1);
    if (isTop && otherPhotos.length > 0) Image.prefetch(otherPhotos);
  }, [isTop, place]);

  useImperativeHandle(ref, () => ({
    flyOut: (direction, onDone) => {
      const sign = direction === 'like' ? 1 : -1;
      opacity.set(withTiming(0, FLY_OUT_TIMING));
      translateX.set(
        withTiming(sign * screenWidth * 1.5, FLY_OUT_TIMING, (finished) => {
          if (finished) scheduleOnRN(onDone);
        }),
      );
    },
  }));

  const pan = Gesture.Pan()
    .enabled(isTop && !isLeaving)
    .minDistance(DRAG_START)
    .onUpdate((event) => {
      translateX.set(event.translationX);
      translateY.set(event.translationY);
      dragX.set(event.translationX);
    })
    .onEnd((event) => {
      const outcome = swipeOutcome(event.translationX, event.velocityX);
      if (outcome) {
        scheduleOnRN(onDecide, outcome === 'like');
        return;
      }
      translateX.set(withSpring(0));
      translateY.set(withSpring(0));
      dragX.set(withSpring(0));
    });

  const tap = Gesture.Tap()
    .enabled(isTop && !isLeaving)
    .maxDistance(DRAG_START)
    .runOnJS(true)
    .onEnd((event, success) => {
      if (!success || cardWidth === 0) return;
      const target = photoTapTarget(event.x / cardWidth, photos.length);
      if (target === 'previous') setPhotoIndex((index) => Math.max(0, index - 1));
      if (target === 'next') setPhotoIndex((index) => Math.min(photos.length - 1, index + 1));
    });

  const animatedStyle = useAnimatedStyle(() => {
    const x = translateX.get();
    const stack = stackPosition.get();
    const tilt = interpolate(
      x,
      [-TILT_DISTANCE, TILT_DISTANCE],
      [-MAX_TILT, MAX_TILT],
      Extrapolation.CLAMP,
    );
    return {
      opacity: opacity.get(),
      transform: [
        { translateX: x },
        { translateY: stack * STACK_OFFSET + translateY.get() * VERTICAL_FOLLOW },
        { rotate: `${tilt}deg` },
        { scale: 1 - stack * STACK_SCALE_STEP },
      ],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View
        onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}
        accessible={isTop}
        aria-hidden={!isTop}
        aria-label={place.locationName ?? 'Lieu'}
        accessibilityActions={isTop ? ACCESSIBILITY_ACTIONS : undefined}
        onAccessibilityAction={({ nativeEvent: { actionName } }) => {
          if (actionName === 'like' || actionName === 'skip') onDecide(actionName === 'like');
        }}
        // Motion only: on web, Reanimated's prebuilt views ignore `className`.
        style={[StyleSheet.absoluteFill, animatedStyle]}
      >
        <View className="flex-1 overflow-hidden rounded-card bg-ink">
          {/* Shows through when the photo is missing or fails to load. */}
          <View className="absolute inset-0 items-center justify-center">
            <ImageIcon size={64} color={colors.ink.muted} />
          </View>
          <Image
            source={photos[Math.min(photoIndex, photos.length - 1)]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
            priority={isTop ? 'high' : 'normal'}
            accessibilityIgnoresInvertColors
          />
          <PhotoScrim edge="top" className="h-28" />
          <PhotoScrim edge="bottom" className="h-3/5" />

          <View className="absolute inset-x-0 top-0 gap-2.5 p-3">
            {photos.length > 1 && (
              <View className="flex-row gap-1">
                {photos.map((url, index) => (
                  <View
                    key={url}
                    className={cn(
                      'h-1 flex-1 rounded-full',
                      index === photoIndex ? 'bg-ink-inverse' : 'bg-ink-inverse/35',
                    )}
                  />
                ))}
              </View>
            )}
            {category && <Badge label={categoryMeta(category).label} tone="accent" />}
          </View>

          <View className="absolute inset-x-0 bottom-0 gap-2 p-5">
            {location ? (
              <View className="flex-row items-center gap-1.5">
                <MapPinIcon size={16} weight="fill" color={colors.accent} />
                <Text variant="caption" tone="inverse" numberOfLines={1} className="flex-1">
                  {location}
                </Text>
              </View>
            ) : null}
            <Text variant="section" tone="inverse" numberOfLines={2}>
              {place.locationName}
            </Text>
            {description ? (
              <Text tone="inverse" numberOfLines={2} className="opacity-80">
                {description}
              </Text>
            ) : null}
            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Tag key={tag} label={tag} tone="photo" />
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
