import type { CityRank, DiscoveryItem } from '../types';

export const LIKE_GOAL = 10;
/** After this many swipes the algorithm re-ranks remaining cards by preference. */
export const EXPLORATION_SIZE = 10;
/** Personalized cards shown in a row before a discovery card. */
const PERSONALIZED_RUN = 2;

/** Number of upcoming cards (the visible stack) whose order is never changed by a re-rank. */
export const PINNED_COUNT = 3;

/**
 * Builds the effective feed: exploration order for the first EXPLORATION_SIZE cards,
 * then personalized cards interleaved with occasional discovery cards (every 3rd).
 *
 * The result is `[seen (in swipe order), pinned, ...re-ranked rest]`. Seen cards keep
 * their swipe order so the deck index never shifts, and `pinned` (the cards already on
 * screen behind the top card) keep their place, so a re-rank never swaps a card the user
 * can see.
 */
export function buildEffectiveFeed(
  feed: DiscoveryItem[],
  cityRanks: CityRank[] | undefined,
  swipedIds: string[],
  pinnedIds: string[] = [],
): DiscoveryItem[] {
  const byId = new Map(feed.map((item) => [item.id, item]));
  const seenSet = new Set(swipedIds);
  const alreadySeen = swipedIds.flatMap((id) => byId.get(id) ?? []);
  const pinned = pinnedIds.flatMap((id) => (seenSet.has(id) ? [] : (byId.get(id) ?? [])));
  const pinnedSet = new Set(pinned.map((item) => item.id));

  if (!cityRanks) {
    const rest = feed.filter((item) => !seenSet.has(item.id) && !pinnedSet.has(item.id));
    return [...alreadySeen, ...pinned, ...rest];
  }

  const scoreOf = Object.fromEntries(cityRanks.map((r) => [r.city, r.score]));
  const vetoed = new Set(cityRanks.filter((r) => r.vetoed).map((r) => r.city));

  const unseen = feed.filter((item) => !seenSet.has(item.id) && !pinnedSet.has(item.id));

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

  return [...alreadySeen, ...pinned, ...remaining];
}
