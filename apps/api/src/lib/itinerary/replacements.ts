import { DEFAULT_REPLACEMENT_LIMIT, PRICE_TARGET_RANK } from './constants.js';
import { centroid, haversine } from './geo.js';
import { byScore } from './scoring.js';
import type { AveragePrice, GeoPoint, ItinItem, ScoreContext } from './types.js';

export interface ReplacementOptions {
  averagePrice: AveragePrice | null;
  interests: string[];
  /** Used as the anchor when the replaced place has no coordinates. */
  fallback?: GeoPoint;
  limit?: number;
}

/**
 * Ranks the places that could stand in for `current` once the planning exists.
 *
 * Candidates are scored around the replaced place rather than the hotel, so
 * the swap keeps the day's route intact. Liked candidates (the hotel
 * alternatives kept at generation time) float to the top.
 */
export function rankReplacements(
  current: ItinItem,
  candidates: ItinItem[],
  opts: ReplacementOptions,
): Array<ItinItem & { distanceKm: number | null }> {
  const ctx: ScoreContext = {
    targetPriceRank: PRICE_TARGET_RANK[opts.averagePrice ?? 'mid'],
    interests: opts.interests,
  };
  const anchor: GeoPoint =
    current.lat != null && current.lng != null
      ? { lat: current.lat, lng: current.lng }
      : (opts.fallback ?? centroid(candidates, { lat: 0, lng: 0 }));
  const hasAnchor = (current.lat != null && current.lng != null) || opts.fallback != null;

  const seen = new Set<string>();
  const pool = candidates.filter((c) => {
    const key = c.discoveryContentId ?? c.activityId;
    if (key === (current.discoveryContentId ?? current.activityId) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return byScore(pool, anchor, ctx)
    .slice(0, opts.limit ?? DEFAULT_REPLACEMENT_LIMIT)
    .map((c) => ({
      ...c,
      distanceKm:
        hasAnchor && c.lat != null && c.lng != null
          ? haversine(c.lat, c.lng, anchor.lat, anchor.lng)
          : null,
    }));
}
