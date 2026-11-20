/**
 * Itinerary planner.
 *
 * Pure, framework-agnostic and fully deterministic: the same input always
 * produces the same planning. Given the trip preferences and the pools of
 * hotels / activities / restaurants available in the destination city, it
 * lays out one day plan per day of the trip.
 *
 * Planning pipeline:
 * 1. A single main hotel is chosen for the whole stay, close to where the
 *    user will actually spend their days, plus a few alternatives.
 * 2. The best activities are picked, then grouped into geographic sectors
 *    around the hotel so each day is a walk in one neighbourhood.
 * 3. Days are ordered as a real route (nearest-neighbour chain from the hotel).
 * 4. Lunch and dinner are slotted into that route.
 *
 * All scores are expressed in kilometre-equivalents and lower is better, so
 * distance, budget fit and interest match can be summed on the same scale.
 */

import { INTENSITY_ACTS_PER_DAY, PRICE_TARGET_RANK } from './constants.js';
import { centroid } from './geo.js';
import { byScore } from './scoring.js';
import { chainFromAnchor, createPicker, groupIntoSectors, selectHotels } from './selection.js';
import type { AveragePrice, GeoPoint, Intensity, ItinItem, ScoreContext } from './types.js';

export type { AveragePrice, GeoPoint, Intensity, ItinItem } from './types.js';
export { geoDistItem, parseWkt } from './geo.js';
export { rankReplacements } from './replacements.js';

export interface PlannerInput {
  numDays: number;
  intensity: Intensity | null;
  averagePrice: AveragePrice | null;
  interests: string[];
  /** Fallback anchor used before a hotel is known, and when no hotel is found. */
  center: GeoPoint;
  hotels: ItinItem[];
  activities: ItinItem[];
  restaurants: ItinItem[];
}

export interface PlannerOutput {
  /** One entry per day, already ordered; `days[0]` is day 1. */
  days: ItinItem[][];
  mainHotel: ItinItem | null;
  alternativeHotels: ItinItem[];
}

/** Clamps a trip to a supported length; defaults to 3 days when unknown. */
export function calcNumDays(durationDays: number | null): number {
  if (!durationDays) return 3;
  return Math.max(1, Math.min(durationDays, 14));
}

export function planItinerary(input: PlannerInput): PlannerOutput {
  const { numDays, center, hotels, activities, restaurants, interests } = input;
  const ctx: ScoreContext = {
    targetPriceRank: PRICE_TARGET_RANK[input.averagePrice ?? 'mid'],
    interests,
  };
  const actsPerDay = INTENSITY_ACTS_PER_DAY[input.intensity ?? 'balanced'];
  const totalActivitySlots = numDays * actsPerDay;

  // 1. Anchor the hotel on where the days will actually happen, not on the
  //    geometric centre of the catalog.
  const focus = centroid(byScore(activities, center, ctx).slice(0, totalActivitySlots), center);
  const { mainHotel, alternativeHotels } = selectHotels(hotels, focus, ctx);
  const anchor: GeoPoint =
    mainHotel?.lat != null && mainHotel.lng != null
      ? { lat: mainHotel.lat, lng: mainHotel.lng }
      : center;

  // 2. Re-rank around the chosen hotel, then carve the selection into sectors.
  const selected = byScore(activities, anchor, ctx).slice(0, totalActivitySlots);
  const sectors = groupIntoSectors(selected, anchor, numDays);

  const activityPicker = createPicker(activities, ctx);
  const restaurantPicker = createPicker(restaurants, ctx);

  const days: ItinItem[][] = [];
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    const dayActivities = [...sectors[dayIndex]!];
    for (const item of dayActivities) activityPicker.markUsed(item, dayIndex);

    // A sector can come up short when the pool is thinner than the pace asks
    // for; top it up rather than shipping a half-empty day.
    const inDay = new Set(dayActivities.map((i) => i.activityId));
    while (dayActivities.length < actsPerDay) {
      const extra = activityPicker.pick(anchor, dayIndex, inDay);
      if (!extra) break;
      dayActivities.push(extra);
      inDay.add(extra.activityId);
    }

    const route = chainFromAnchor(dayActivities, anchor);
    const dayCentre = centroid(route, anchor);

    // Lunch out where the day happens, dinner back near the hotel.
    const lunch = restaurantPicker.pick(dayCentre, dayIndex);
    const dinner = restaurantPicker.pick(
      anchor,
      dayIndex,
      new Set(lunch ? [lunch.activityId] : []),
    );

    const midpoint = Math.ceil(route.length / 2);
    const plan: ItinItem[] = [
      ...(mainHotel ? [mainHotel] : []),
      ...route.slice(0, midpoint),
      ...(lunch ? [lunch] : []),
      ...route.slice(midpoint),
      ...(dinner ? [dinner] : []),
    ];
    days.push(plan);
  }

  return { days, mainHotel, alternativeHotels };
}
