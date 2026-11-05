import {
  MAX_ALTERNATIVE_HOTELS,
  MIN_ALTERNATIVE_SEPARATION_KM,
  REUSE_COOLDOWN_DAYS,
} from './constants.js';
import { bearing, centroid, geoDistItem, haversine } from './geo.js';
import { byScore } from './scoring.js';
import type { GeoPoint, ItinItem, ScoreContext } from './types.js';

// ─── Reuse policy ─────────────────────────────────────────────────────────────

/**
 * Picks places while avoiding repetition as long as possible.
 *
 * Destination pools are small (a city holds ~15 activities and ~10 restaurants)
 * so a two-week trip cannot be filled with unique places. Rather than leaving
 * days empty, a place may come back once it has been off the planning for
 * `REUSE_COOLDOWN_DAYS`.
 */
export function createPicker(pool: ItinItem[], ctx: ScoreContext) {
  const lastUsedDay = new Map<string, number>();

  const markUsed = (item: ItinItem, dayIndex: number) => {
    lastUsedDay.set(item.activityId, dayIndex);
  };

  /** @param exclude ids already placed in the day being built. */
  const pick = (
    anchor: GeoPoint,
    dayIndex: number,
    exclude: Set<string> = new Set(),
  ): ItinItem | undefined => {
    const candidates = byScore(
      pool.filter((i) => !exclude.has(i.activityId)),
      anchor,
      ctx,
    );
    if (candidates.length === 0) return undefined;

    const chosen =
      candidates.find((i) => !lastUsedDay.has(i.activityId)) ??
      candidates.find((i) => dayIndex - lastUsedDay.get(i.activityId)! >= REUSE_COOLDOWN_DAYS) ??
      candidates[0]!;

    markUsed(chosen, dayIndex);
    return chosen;
  };

  return { pick, markUsed };
}

// ─── Hotel selection ──────────────────────────────────────────────────────────

/**
 * One hotel for the whole stay — a trip targets a single city, so moving hotels
 * every few days would be noise. A few alternatives are offered alongside it.
 */
export function selectHotels(
  hotels: ItinItem[],
  focus: GeoPoint,
  ctx: ScoreContext,
): { mainHotel: ItinItem | null; alternativeHotels: ItinItem[] } {
  const ranked = byScore(hotels, focus, ctx);
  const mainHotel = ranked[0] ?? null;
  if (!mainHotel) return { mainHotel: null, alternativeHotels: [] };

  const alternativeHotels: ItinItem[] = [];
  for (const candidate of ranked.slice(1)) {
    if (alternativeHotels.length >= MAX_ALTERNATIVE_HOTELS) break;
    // Skip hotels sitting on top of the main one or of an alternative already
    // kept: three offers on the same street are one offer.
    const tooClose = [mainHotel, ...alternativeHotels].some((kept) => {
      if (candidate.lat == null || candidate.lng == null || kept.lat == null || kept.lng == null) {
        return false;
      }
      return (
        haversine(candidate.lat, candidate.lng, kept.lat, kept.lng) < MIN_ALTERNATIVE_SEPARATION_KM
      );
    });
    if (!tooClose) alternativeHotels.push(candidate);
  }

  return { mainHotel, alternativeHotels };
}

// ─── Day building ─────────────────────────────────────────────────────────────

/**
 * Splits activities into `numDays` geographic sectors around the anchor.
 *
 * Sorting by bearing then slicing keeps each day inside one angular wedge of
 * the city, which reads as a neighbourhood walk instead of a back-and-forth
 * across town. Sectors are then interleaved near/far so the trip does not end
 * on a run of remote days.
 */
export function groupIntoSectors(
  items: ItinItem[],
  anchor: GeoPoint,
  numDays: number,
): ItinItem[][] {
  const sectors: ItinItem[][] = Array.from({ length: numDays }, () => []);
  if (items.length === 0) return sectors;

  const byBearing = [...items].sort(
    (a, b) =>
      bearing(anchor.lat, anchor.lng, a.lat ?? anchor.lat, a.lng ?? anchor.lng) -
      bearing(anchor.lat, anchor.lng, b.lat ?? anchor.lat, b.lng ?? anchor.lng),
  );

  // Spread as evenly as possible: the first `remainder` sectors take one extra.
  const base = Math.floor(byBearing.length / numDays);
  const remainder = byBearing.length % numDays;
  const filled: ItinItem[][] = [];
  let cursor = 0;
  for (let i = 0; i < numDays; i++) {
    const size = base + (i < remainder ? 1 : 0);
    filled.push(byBearing.slice(cursor, cursor + size));
    cursor += size;
  }

  // Interleave from both ends of the near→far ordering.
  const sortedByDistance = filled
    .map((sector, index) => ({
      sector,
      index,
      dist: geoDistItem(centroid(sector, anchor), anchor),
    }))
    .sort((a, b) => a.dist - b.dist || a.index - b.index);

  let near = 0;
  let far = sortedByDistance.length - 1;
  for (let day = 0; day < numDays; day++) {
    sectors[day] =
      day % 2 === 0 ? sortedByDistance[near++]!.sector : sortedByDistance[far--]!.sector;
  }
  return sectors;
}

/** Orders a day's activities as a route: nearest-neighbour chain from the hotel. */
export function chainFromAnchor(items: ItinItem[], anchor: GeoPoint): ItinItem[] {
  const remaining = [...items];
  const route: ItinItem[] = [];
  let current = anchor;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = geoDistItem(remaining[i]!, current);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    const next = remaining.splice(bestIndex, 1)[0]!;
    route.push(next);
    if (next.lat != null && next.lng != null) current = { lat: next.lat, lng: next.lng };
  }

  return route;
}
