import { isPlaceCategory, parseWktPoint, type LatLng, type PlaceCategory } from '@/domain/place';
import { inPlanningOrder } from '@/domain/trip';

interface PinnableActivity {
  id: string;
  orderIndex: number;
  category: string | null;
  coordinates: string | null;
}

interface PinnableDay<Activity> {
  dayIndex: number;
  activities: Activity[];
}

/** A place that can be drawn on the map: it has coordinates. */
export interface TripPin<Activity> {
  id: string;
  activity: Activity;
  dayIndex: number;
  category: string | null;
  coordinate: LatLng;
}

/** Same shape as react-native-maps' `Region`, kept here so this file stays free of native code. */
export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Pins of the given days, in planning order; places without coordinates are left out. */
export function tripPins<Activity extends PinnableActivity>(
  days: PinnableDay<Activity>[],
): TripPin<Activity>[] {
  return days.flatMap((day) =>
    inPlanningOrder(day.activities).flatMap((activity) => {
      const coordinate = parseWktPoint(activity.coordinates);
      if (!coordinate) return [];
      return [
        {
          id: activity.id,
          activity,
          dayIndex: day.dayIndex,
          category: activity.category,
          coordinate,
        },
      ];
    }),
  );
}

const CATEGORY_ORDER: PlaceCategory[] = ['hotel', 'activité', 'restaurant'];

/** Categories present among the pins: hotel, activity, restaurant first, unknown ones after. */
export function pinCategories(pins: { category: string | null }[]): string[] {
  const present = new Set(pins.map((pin) => pin.category).filter((c): c is string => !!c));
  const known = CATEGORY_ORDER.filter((category) => present.has(category));
  const unknown = [...present].filter((category) => !isPlaceCategory(category));
  return [...known, ...unknown];
}

/** Pins of one category, or all of them when `category` is null. */
export function filterPins<Pin extends { category: string | null }>(
  pins: Pin[],
  category: string | null,
): Pin[] {
  return category === null ? pins : pins.filter((pin) => pin.category === category);
}

/** Room left around the outermost pins, as a factor of the span they cover. */
const REGION_PADDING = 1.4;
/** About 1 km: keeps a lone pin, or pins on the same street, from zooming in to the max. */
const MIN_REGION_DELTA = 0.01;

/** Region framing every coordinate, or null when there is none. */
export function regionFor(coordinates: LatLng[]): MapRegion | null {
  if (coordinates.length === 0) return null;

  const latitudes = coordinates.map((c) => c.latitude);
  const longitudes = coordinates.map((c) => c.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * REGION_PADDING, MIN_REGION_DELTA),
    longitudeDelta: Math.max((maxLng - minLng) * REGION_PADDING, MIN_REGION_DELTA),
  };
}
