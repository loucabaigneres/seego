import { pluralize } from './date';

/**
 * `trip_day.dayIndex` conventions shared with the API:
 * - 0  → places liked while swiping (before the itinerary exists)
 * - -1 → alternative hotels proposed alongside the itinerary
 * - >0 → the itinerary itself, day 1 onwards
 */
export const LIKED_PLACES_DAY_INDEX = 0;
export const ALTERNATIVE_HOTELS_DAY_INDEX = -1;

export function splitTripDays<Day extends { dayIndex: number }>(days: Day[]) {
  return {
    likedPlaces: days.find((day) => day.dayIndex === LIKED_PLACES_DAY_INDEX) ?? null,
    alternativeHotels: days.find((day) => day.dayIndex === ALTERNATIVE_HOTELS_DAY_INDEX) ?? null,
    itinerary: days
      .filter((day) => day.dayIndex > LIKED_PLACES_DAY_INDEX)
      .sort((a, b) => a.dayIndex - b.dayIndex),
  };
}

/** "2 activités · 1 restaurant" — empty string when the day has neither. */
export function daySummary(activities: { category: string | null }[]): string {
  const count = (category: string) => activities.filter((a) => a.category === category).length;
  const activityCount = count('activité');
  const restaurantCount = count('restaurant');
  return [
    activityCount > 0 && pluralize(activityCount, 'activité'),
    restaurantCount > 0 && pluralize(restaurantCount, 'restaurant'),
  ]
    .filter(Boolean)
    .join(' · ');
}

interface DayActivities<Activity> {
  activities: Activity[];
}

/** Number of places planned across the itinerary ("12 étapes"). */
export function plannedCount(itinerary: DayActivities<unknown>[]): number {
  return itinerary.reduce((total, day) => total + day.activities.length, 0);
}

/** Cover photo: the first itinerary place that has one, else a liked place, else null. */
export function tripCoverImage(
  itinerary: DayActivities<{ mainMediaUrl: string | null }>[],
  likedPlaces: DayActivities<{ mainMediaUrl: string | null }> | null,
): string | null {
  const places = [
    ...itinerary.flatMap((day) => day.activities),
    ...(likedPlaces?.activities ?? []),
  ];
  return places.find((place) => place.mainMediaUrl)?.mainMediaUrl ?? null;
}

/** The planner emits each day as a route (hotel → morning → lunch → afternoon → dinner). */
export function inPlanningOrder<Activity extends { orderIndex: number }>(
  activities: Activity[],
): Activity[] {
  return [...activities].sort((a, b) => a.orderIndex - b.orderIndex);
}
