import { useState } from 'react';

import { filterPins, pinCategories, regionFor, tripPins } from '../lib/map-pins';
import type { TripActivity, TripDay } from './useTrip';

/** Pins of the days on screen, the category filter and the place opened from its pin. */
export function useTripMap(days: TripDay[]) {
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pins = tripPins<TripActivity>(days);
  const visiblePins = filterPins(pins, category);

  return {
    hasPins: pins.length > 0,
    categories: pinCategories(pins),
    category,
    visiblePins,
    // Derived, not stored: a pin hidden by a filter closes its card on its own.
    selectedPin: visiblePins.find((pin) => pin.id === selectedId) ?? null,
    region: regionFor(visiblePins.map((pin) => pin.coordinate)),
    toggleCategory: (value: string) => setCategory((current) => (current === value ? null : value)),
    select: (id: string) => setSelectedId((current) => (current === id ? null : id)),
    clearSelection: () => setSelectedId(null),
  };
}
