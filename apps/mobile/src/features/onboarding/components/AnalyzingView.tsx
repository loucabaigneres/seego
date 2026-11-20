import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn, Text } from '@/ui';

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
/** Rows shown; the highlighted one sits at `FOCUS`. */
const VISIBLE = 6;
const FOCUS = 3;
const OPACITY_BY_DISTANCE = ['opacity-100', 'opacity-60', 'opacity-40', 'opacity-20'] as const;
const TICK_MS = 700;
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

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const offset = reduceMotion ? 0 : tick;
  const rows = Array.from({ length: VISIBLE }, (_, i) => CITIES[(i + offset) % CITIES.length]);
  const progress = MAX_PROGRESS * (1 - 0.85 ** (tick + 1));

  return (
    <SafeAreaView className="flex-1 bg-brand px-6 pb-14 pt-6" aria-live="polite">
      <StatusBar style="light" />

      <View aria-hidden importantForAccessibility="no-hide-descendants">
        <Text variant="overline" className="pb-2 text-accent/70">
          Destinations en lice
        </Text>
        {rows.map((city, i) => {
          const isFocus = i === FOCUS;
          return (
            <View
              key={i}
              className={cn(
                'flex-row items-baseline justify-between border-b py-2.5',
                OPACITY_BY_DISTANCE[Math.min(Math.abs(i - FOCUS), 3)],
                isFocus ? 'border-accent' : 'border-accent/15',
                i === VISIBLE - 1 && 'border-b-0',
              )}
            >
              <Text
                className={cn(
                  'font-display text-[34px] leading-[38px]',
                  isFocus ? 'text-accent' : 'text-ink-inverse',
                )}
              >
                {city.name}
              </Text>
              <Text
                variant="overline"
                className={cn('tracking-[1.4px]', isFocus ? 'text-ink-inverse' : 'text-accent')}
              >
                {city.lat}
              </Text>
            </View>
          );
        })}
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
