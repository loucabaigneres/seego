import {
  INTEREST_BONUS,
  INTEREST_KEYWORDS,
  LIKED_BONUS,
  MAX_COUNTED_INTERESTS,
  PRICE_PENALTY_PER_TIER,
} from './constants.js';
import { geoDistItem } from './geo.js';
import type { GeoPoint, ItinItem, ScoreContext } from './types.js';

// ─── Budget ───────────────────────────────────────────────────────────────────

/** `""`, `"$"`, `"$$"`, ... -> 0, 1, 2, ... Missing price data is treated as neutral. */
export function priceRank(price: string | null): number | null {
  if (!price) return null;
  return price.length;
}

export function pricePenalty(price: string | null, targetRank: number): number {
  const rank = priceRank(price);
  if (rank == null) return 0;
  return Math.abs(rank - targetRank) * PRICE_PENALTY_PER_TIER;
}

// ─── Interest matching ────────────────────────────────────────────────────────

/** Lowercase and strip diacritics so "musée" and "musee" match the same keyword. */
function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

/** Texte normalisé (titre, lieu, description, sous-catégories) où l'on cherche les mots-clés d'intérêt. */
function haystack(item: ItinItem): string {
  return normalize(
    [item.title, item.locationName, item.description, ...(item.subcategory ?? [])]
      .filter(Boolean)
      .join(' '),
  );
}

/**
 * Km-equivalent bonus for how well an item matches the user's interests.
 * A bonus, never a filter: a thin pool can still fill the planning.
 */
export function interestBonus(item: ItinItem, interests: string[]): number {
  if (interests.length === 0) return 0;
  const text = haystack(item);
  let matches = 0;
  for (const interest of interests) {
    const keywords = INTEREST_KEYWORDS[interest.toLowerCase()];
    if (!keywords) continue;
    if (keywords.some((k) => text.includes(k))) matches += 1;
  }
  return Math.min(matches, MAX_COUNTED_INTERESTS) * INTEREST_BONUS;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/** Distance, corrected by budget fit, interest match and explicit likes. Lower is better. */
function scoreItem(item: ItinItem, anchor: GeoPoint, ctx: ScoreContext): number {
  return (
    geoDistItem(item, anchor) +
    pricePenalty(item.price, ctx.targetPriceRank) -
    interestBonus(item, ctx.interests) -
    (item.liked ? LIKED_BONUS : 0)
  );
}

/** `Array.prototype.sort` is stable, so equal scores keep pool order — deterministic. */
export function byScore(pool: ItinItem[], anchor: GeoPoint, ctx: ScoreContext): ItinItem[] {
  return [...pool].sort((a, b) => scoreItem(a, anchor, ctx) - scoreItem(b, anchor, ctx));
}
