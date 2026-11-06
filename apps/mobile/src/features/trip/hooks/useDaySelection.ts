import { useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

import type { TripDay } from './useTrip';

/** Picker value that shows every day, one after the other. */
export const ALL_DAYS = 'all';

/** The itinerary days on screen, picked from the sticky day picker (the whole trip by default). */
export function useDaySelection(days: TripDay[]) {
  const [selectedId, setSelectedId] = useState<string>(ALL_DAYS);
  // Which way the picker moved on the last pick, so the new day can slide in from that side.
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  // Where the picker sits, i.e. below the hero: the picker's own onLayout reports y = 0 once
  // ScrollView wraps it as a sticky header.
  const pickerY = useRef(0);

  const showAll = selectedId === ALL_DAYS;
  const selectedDay = days.find((day) => day.id === selectedId) ?? days[0];

  /** A day id, or `ALL_DAYS`. */
  const select = (id: string) => {
    if (id === selectedId) return;
    // Picker order: "Tous" (-1) first, then the days.
    const position = (dayId: string) => days.findIndex((day) => day.id === dayId);
    setDirection(position(id) >= position(selectedId) ? 'forward' : 'backward');
    setSelectedId(id);
    // Picker stuck at the top: show the new day from its first step, not from the old scroll depth.
    if (scrollY.current > pickerY.current) {
      scrollRef.current?.scrollTo({ y: pickerY.current, animated: false });
    }
  };

  return {
    selectedId: showAll ? ALL_DAYS : selectedDay?.id,
    shownDays: showAll ? days : selectedDay ? [selectedDay] : [],
    direction,
    select,
    scrollRef,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = event.nativeEvent.contentOffset.y;
    },
    onHeroLayout: (event: LayoutChangeEvent) => {
      pickerY.current = event.nativeEvent.layout.y + event.nativeEvent.layout.height;
    },
  };
}
