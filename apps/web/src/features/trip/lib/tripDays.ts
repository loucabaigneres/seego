import type { Day } from '../types';

/**
 * Day 0 holds the places liked while swiping and day -1 the alternative
 * hotels; neither belongs in the day-by-day planning.
 */
export function splitTripDays(days: Day[]) {
  return {
    itineraryDays: days.filter((d) => d.dayIndex > 0),
    likedDay: days.find((d) => d.dayIndex === 0),
  };
}

/** Itinerary days with their places in planning order, ready to be edited. */
export function toDraft(itineraryDays: Day[]): Day[] {
  return itineraryDays.map((d) => ({
    ...d,
    activities: [...d.activities].sort((a, b) => a.orderIndex - b.orderIndex),
  }));
}

export function plannedCount(itineraryDays: Day[]): number {
  return itineraryDays.reduce((total, day) => total + day.activities.length, 0);
}

/** Cover photo: first itinerary place that has one, else a liked place. */
export function heroImageOf(itineraryDays: Day[], likedDay: Day | undefined): string | null {
  return (
    itineraryDays.flatMap((d) => d.activities).find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    likedDay?.activities.find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    null
  );
}
