import { Image } from 'expo-image';
import { useEffect, useImperativeHandle, useState, type Ref } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { categoryMeta, cleanDescription, placePhotos } from '@/domain/place';
import { useHardwareBack } from '@/hooks/useHardwareBack';
import { colors } from '@/theme/tokens';
import { Badge, cn, PhotoScrim, Tag, Text } from '@/ui';
import { ImageIcon, MapPinIcon, XIcon } from '@/ui/icons';

import { placeCategory, placeSubcategories, type DiscoveryPlace } from '../lib/discovery-place';
import { dragIntent, photoTapTarget, settlesExpanded, swipeOutcome } from '../lib/swipe-gesture';
import { PlaceDetails } from './PlaceDetails';

export interface SwipeCardHandle {
  /** Throws the card off screen, then calls `onDone`. */
  flyOut: (direction: 'like' | 'skip', onDone: () => void) => void;
  /** Opens the details under the photo, or closes them. */
  toggleDetails: () => void;
}

/** How far, in px, each card behind peeks out under the one before it. */
const STACK_PEEK = 10;
const STACK_SCALE_STEP = 0.04;
const STACK_TIMING = { duration: 300, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };
/** The card that reaches the top grows past full size (scale 1.02), then settles. */
const POP_OVERSHOOT = -0.5;
const POP_TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };
const FLY_OUT_TIMING = { duration: 320, easing: Easing.in(Easing.ease) };
/** The card tilts 0.05° per dragged pixel, up to 20° when it flies out. */
const MAX_TILT = 20;
const TILT_DISTANCE = MAX_TILT / 0.05;
/** The card follows the finger fully on x, loosely on y. */
const VERTICAL_FOLLOW = 0.3;
/** Movement, in px, before a touch becomes a drag rather than a tap. */
const DRAG_START = 6;

/** Share of the card the photo keeps once the details are open. */
const EXPANDED_PHOTO_RATIO = 0.42;
/** Finishes a details drag (or a tap on ⓘ) smoothly, without bouncing. */
const SETTLE_TIMING = { duration: 320, easing: Easing.out(Easing.cubic) };
/** The title and tags printed on the photo are gone by this point of the opening. */
const OVERLAY_FADE_END = 0.4;

const ACCESSIBILITY_ACTIONS = [
  { name: 'like', label: 'J’adore' },
  { name: 'skip', label: 'Passer' },
  { name: 'details', label: 'Voir les détails' },
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
  const [isExpanded, setIsExpanded] = useState(false);
  // Each card owns its motion: the card that leaves is unmounted, nothing has to be reset.
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const stackPosition = useSharedValue(position);
  const cardHeight = useSharedValue(0);
  /** 0 = photo only, 1 = photo on top and details under it. Follows the finger. */
  const expansion = useSharedValue(0);
  const expansionAtStart = useSharedValue(0);
  /** Decided on the first move of each drag. */
  const intent = useSharedValue<'pending' | 'swipe' | 'expand'>('pending');

  const isTop = position === 0;
  const photos = placePhotos(place);
  const category = placeCategory(place);
  const tags = placeSubcategories(place).slice(0, 3);
  const description = cleanDescription(place.description);
  const location = [place.city, place.country].filter(Boolean).join(', ');

  useEffect(() => {
    stackPosition.set(
      position === 0
        ? withSequence(withTiming(POP_OVERSHOOT, POP_TIMING), withSpring(0))
        : withTiming(position, STACK_TIMING),
    );
  }, [position, stackPosition]);

  // The other photos only show on tap: load them as soon as the card reaches the top.
  useEffect(() => {
    const otherPhotos = placePhotos(place).slice(1);
    if (isTop && otherPhotos.length > 0) Image.prefetch(otherPhotos);
  }, [isTop, place]);

  const settleDetails = (expanded: boolean) => {
    expansion.set(withTiming(expanded ? 1 : 0, SETTLE_TIMING));
    setIsExpanded(expanded);
  };

  useHardwareBack(() => {
    if (!isTop || !isExpanded) return false;
    settleDetails(false);
    return true;
  });

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
    toggleDetails: () => settleDetails(!isExpanded),
  }));

  // One pan for the photo and one for the details handle: a gesture object can't be shared.
  const createPan = () =>
    Gesture.Pan()
      .enabled(isTop && !isLeaving)
      .minDistance(DRAG_START)
      .onStart(() => {
        intent.set('pending');
        expansionAtStart.set(expansion.get());
      })
      .onUpdate((event) => {
        // Not in `onStart`: its translation can still be 0, which would always read as a swipe.
        if (intent.get() === 'pending') {
          if (event.translationX === 0 && event.translationY === 0) return;
          intent.set(dragIntent(event.translationX, event.translationY, isExpanded));
        }
        if (intent.get() === 'expand') {
          // The edge between photo and details stays under the finger.
          const travel = cardHeight.get() * (1 - EXPANDED_PHOTO_RATIO);
          if (travel > 0) {
            expansion.set(clamp(expansionAtStart.get() - event.translationY / travel, 0, 1));
          }
          return;
        }
        translateX.set(event.translationX);
        translateY.set(event.translationY);
        dragX.set(event.translationX);
      })
      .onEnd((event) => {
        if (intent.get() === 'expand') {
          const expanded = settlesExpanded(expansion.get(), event.velocityY);
          expansion.set(withTiming(expanded ? 1 : 0, SETTLE_TIMING));
          scheduleOnRN(setIsExpanded, expanded);
          return;
        }
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
        {
          // The scale lifts the bottom edge by half the height lost: move down that much more.
          translateY:
            stack * (STACK_PEEK + (cardHeight.get() * STACK_SCALE_STEP) / 2) +
            translateY.get() * VERTICAL_FOLLOW,
        },
        { rotate: `${tilt}deg` },
        { scale: 1 - stack * STACK_SCALE_STEP },
      ],
    };
  });

  // The photo shrinks from the bottom while the details rise into the space it frees.
  const photoStyle = useAnimatedStyle(() => ({
    bottom: expansion.get() * cardHeight.get() * (1 - EXPANDED_PHOTO_RATIO),
  }));
  const detailsStyle = useAnimatedStyle(() => {
    const height = cardHeight.get() * (1 - EXPANDED_PHOTO_RATIO);
    return { height, transform: [{ translateY: (1 - expansion.get()) * height }] };
  });
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.get(), [0, OVERLAY_FADE_END], [1, 0], Extrapolation.CLAMP),
  }));
  const closeStyle = useAnimatedStyle(() => ({ opacity: expansion.get() }));

  return (
    <Animated.View
      onLayout={(event) => {
        setCardWidth(event.nativeEvent.layout.width);
        cardHeight.set(event.nativeEvent.layout.height);
      }}
      // Expanded, the details' own controls must be reachable one by one.
      accessible={isTop && !isExpanded}
      aria-hidden={!isTop}
      aria-label={place.locationName ?? 'Lieu'}
      accessibilityActions={isTop ? ACCESSIBILITY_ACTIONS : undefined}
      onAccessibilityAction={({ nativeEvent: { actionName } }) => {
        if (actionName === 'like' || actionName === 'skip') onDecide(actionName === 'like');
        if (actionName === 'details') settleDetails(!isExpanded);
      }}
      // Motion only: on web, Reanimated's prebuilt views ignore `className`.
      style={[StyleSheet.absoluteFill, animatedStyle]}
    >
      {/* The border keeps the crema details apart from the crema screen. */}
      <View className="flex-1 overflow-hidden rounded-card border border-line bg-ink">
        <GestureDetector gesture={Gesture.Race(createPan(), tap)}>
          <Animated.View style={[styles.photo, photoStyle]}>
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

            <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} pointerEvents="none">
              <PhotoScrim edge="bottom" className="h-3/5" />
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
            </Animated.View>

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
          </Animated.View>
        </GestureDetector>

        <Animated.View
          style={[styles.details, detailsStyle]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <View className="flex-1 bg-background">
            {/* Dragging the handle down closes the details, like the photo does. */}
            <GestureDetector gesture={createPan()}>
              <View className="items-center py-3">
                <View className="h-1.5 w-10 rounded-full bg-surface" />
              </View>
            </GestureDetector>
            {/* Only the top card can open: the cards behind skip this content. */}
            {isTop && (
              <ScrollView
                contentContainerClassName="px-5 pb-6"
                showsVerticalScrollIndicator={false}
              >
                <PlaceDetails place={place} />
              </ScrollView>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.close, closeStyle]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <Pressable
            role="button"
            aria-label="Fermer les détails"
            onPress={() => settleDetails(false)}
            className="size-11 items-center justify-center rounded-full bg-scrim active:opacity-80"
          >
            <XIcon size={20} color={colors.ink.inverse} />
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  details: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  // Under the photo progress bars.
  close: { position: 'absolute', top: 24, right: 12 },
});
