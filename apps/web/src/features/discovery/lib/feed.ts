import type { CityRank, DiscoveryItem } from '../types';

export const LIKE_GOAL = 10;
/** After this many swipes the algorithm re-ranks remaining cards by preference. */
export const EXPLORATION_SIZE = 10;
/** Personalized cards shown in a row before a discovery card. */
const PERSONALIZED_RUN = 2;

/**
 * Builds the effective feed: exploration order for the first EXPLORATION_SIZE cards,
 * then personalized cards interleaved with occasional discovery cards (every 3rd).
 */
export function buildEffectiveFeed(
  feed: DiscoveryItem[],
  cityRanks: CityRank[] | undefined,
  swipedIds: Set<string>,
): DiscoveryItem[] {
  if (!cityRanks) return feed;

  const scoreOf = Object.fromEntries(cityRanks.map((r) => [r.city, r.score]));
  const vetoed = new Set(cityRanks.filter((r) => r.vetoed).map((r) => r.city));

  const alreadySeen = feed.filter((item) => swipedIds.has(item.id));
  const unseen = feed.filter((item) => !swipedIds.has(item.id));

  // Cards matching revealed preferences (positive score, not vetoed).
  const personalized = unseen
    .filter((item) => !vetoed.has(item.city ?? '') && (scoreOf[item.city ?? ''] ?? 0) > 0)
    .sort((a, b) => (scoreOf[b.city ?? ''] ?? 0) - (scoreOf[a.city ?? ''] ?? 0));

  // Everything else — kept to avoid a pure filter bubble.
  const surprise = unseen.filter(
    (item) => vetoed.has(item.city ?? '') || (scoreOf[item.city ?? ''] ?? 0) <= 0,
  );

  // Interleave: 2 personalized → 1 discovery → repeat.
  const remaining: DiscoveryItem[] = [];
  const pPool = [...personalized];
  const sPool = [...surprise];
  let pStreak = 0;

  while (pPool.length > 0 || sPool.length > 0) {
    if (pPool.length > 0 && (pStreak < PERSONALIZED_RUN || sPool.length === 0)) {
      remaining.push(pPool.shift()!);
      pStreak++;
    } else {
      remaining.push(sPool.shift()!);
      pStreak = 0;
    }
  }

  return [...alreadySeen, ...remaining];
}
