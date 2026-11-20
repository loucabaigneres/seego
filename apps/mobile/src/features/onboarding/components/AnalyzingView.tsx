import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/ui';

/** Decorative only: the real candidates are only known once the answers are saved. */
const CITIES = [
  { name: 'Lisbonne', lat: '38.72° N' },
  { name: 'Séville', lat: '37.39° N' },
  { name: 'Naples', lat: '40.85° N' },
  { name: 'Rome', lat: '41.90° N' },
  { name: 'Porto', lat: '41.15° N' },
  { name: 'Split', lat: '43.51° N' },
  { name: 'Valence', lat: '39.47° N' },
  { name: 'Athènes', lat: '37.98° N' },
  { name: 'Marseille', lat: '43.30° N' },
] as const;
/** The names go round the cylinder twice, so its face is wide enough for ~7 visible rows. */
const SLOTS = [...CITIES, ...CITIES];
const ROW_HEIGHT = 58;
/** Angle between two rows on the cylinder. */
const STEP_DEG = 360 / SLOTS.length;
/** Radius that puts two neighbouring rows exactly one row height apart at the front. */
const RADIUS = ROW_HEIGHT / (2 * Math.sin(((STEP_DEG / 2) * Math.PI) / 180));
const DRUM_HEIGHT = 2 * RADIUS;
const TICK_MS = 700;
/** Each turn to the next name eases in and out, then the drum rests briefly. */
const ROLL_TIMING = { duration: 520, easing: Easing.inOut(Easing.cubic) };
/** The bar creeps towards this share: the real duration is unknown. */
const MAX_PROGRESS = 0.9;
const FILL_TRANSITION = { transitionProperty: 'transform', transitionDuration: TICK_MS } as const;

export interface AnalyzingViewProps {
  /** Short labels of the answers ("Littoral", "En couple"…). */
  answers: string[];
}

/** Shown while the answers are saved and the deck is prepared. */
export function AnalyzingView({ answers }: AnalyzingViewProps) {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  /** Turns of the drum, in rows; the front row is `roll`. Starts on Rome. */
  const roll = useSharedValue(3);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!reduceMotion) roll.set(withTiming(3 + tick, ROLL_TIMING));
  }, [tick, reduceMotion, roll]);

  const progress = MAX_PROGRESS * (1 - 0.85 ** (tick + 1));

  return (
    <SafeAreaView className="flex-1 bg-brand px-6 pb-14 pt-6" aria-live="polite">
      <StatusBar style="light" />

      <View aria-hidden importantForAccessibility="no-hide-descendants">
        <Text variant="overline" className="pb-2 text-accent/70">
          Destinations en lice
        </Text>
        <View style={{ height: DRUM_HEIGHT }} className="overflow-hidden">
          {/* The window the front row passes through. */}
          <View
            style={{ top: (DRUM_HEIGHT - ROW_HEIGHT) / 2, height: ROW_HEIGHT }}
            className="absolute inset-x-0 border-y border-accent"
          />
          {SLOTS.map((city, index) => (
            <DrumRow key={index} index={index} roll={roll} name={city.name} lat={city.lat} />
          ))}
        </View>
      </View>

      <View className="mt-auto gap-3">
        <Text role="heading" className="font-display text-[44px] leading-[46px] text-ink-inverse">
          {'On analyse\ntes envies…'}
        </Text>
        <Text className="font-sans text-body text-ink-inverse/80">
          On sélectionne les destinations et les lieux qui te ressemblent.
        </Text>
        {answers.length > 0 && (
          <View className="flex-row flex-wrap gap-2 pt-2">
            {answers.map((answer) => (
              <View
                key={answer}
                className="h-[30px] justify-center rounded-full border border-accent/45 px-3"
              >
                <Text variant="caption" className="font-sans-medium text-[13px] text-accent">
                  {answer}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        role="progressbar"
        aria-label="Analyse en cours"
        className="mt-10 h-0.5 overflow-hidden rounded-full bg-accent/20"
      >
        <Animated.View
          className="h-full w-full rounded-full bg-accent"
          style={{ transform: [{ translateX: `${(progress - 1) * 100}%` }], ...FILL_TRANSITION }}
        />
      </View>
    </SafeAreaView>
  );
}

interface DrumRowProps {
  index: number;
  roll: SharedValue<number>;
  name: string;
  lat: string;
}

/** One name printed on the drum: its place on the circle comes from `roll`, on the UI thread. */
function DrumRow({ index, roll, name, lat }: DrumRowProps) {
  /** Angle from the front, in degrees: negative above, positive below. */
  const angle = () => {
    'worklet';
    const half = SLOTS.length / 2;
    const offset =
      ((((index - roll.get()) % SLOTS.length) + SLOTS.length + half) % SLOTS.length) - half;
    return offset * STEP_DEG;
  };

  const rowStyle = useAnimatedStyle(() => {
    const deg = angle();
    const rad = (deg * Math.PI) / 180;
    return {
      // The back of the drum is hidden.
      opacity: interpolate(Math.abs(deg), [0, 80, 90], [1, 0.12, 0], Extrapolation.CLAMP),
      transform: [
        { perspective: 900 },
        { translateY: RADIUS * Math.sin(rad) },
        { rotateX: `${-deg}deg` },
      ],
    };
  });
  // The pesca copy fades in over the crema one as the row reaches the front.
  const focusStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(angle()), [0, STEP_DEG * 0.6], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: (DRUM_HEIGHT - ROW_HEIGHT) / 2,
          height: ROW_HEIGHT,
        },
        rowStyle,
      ]}
    >
      <RowText name={name} lat={lat} focus={false} />
      <Animated.View style={[{ position: 'absolute', inset: 0 }, focusStyle]}>
        <RowText name={name} lat={lat} focus />
      </Animated.View>
    </Animated.View>
  );
}

function RowText({ name, lat, focus }: { name: string; lat: string; focus: boolean }) {
  return (
    <View className="h-full flex-row items-center justify-between">
      <Text
        className={`font-display text-[34px] leading-[38px] ${focus ? 'text-accent' : 'text-ink-inverse'}`}
      >
        {name}
      </Text>
      <Text
        variant="overline"
        className={`tracking-[1.4px] ${focus ? 'text-ink-inverse' : 'text-accent'}`}
      >
        {lat}
      </Text>
    </View>
  );
}
