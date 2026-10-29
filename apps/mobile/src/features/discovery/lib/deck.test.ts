import type { CityRank } from './city-ranking';
import {
  deckReducer,
  LIKE_GOAL,
  likeCount,
  reachedLikeGoal,
  startDeck,
  visibleCards,
  type DeckState,
} from './deck';
import type { DiscoveryPlace } from './discovery-place';

const place = (id: string, city: string): DiscoveryPlace => ({
  id,
  city,
  locationName: id,
  url: `https://example.com/${id}`,
  mainMediaUrl: `https://example.com/${id}.jpg`,
  carousselUrls: null,
  description: null,
  country: 'Italie',
  coordinates: null,
  tags: null,
});

const ids = (places: DiscoveryPlace[]) => places.map((p) => p.id);

const feed = [
  place('a', 'Lyon'),
  place('b', 'Lyon'),
  place('c', 'Lyon'),
  place('d', 'Lyon'),
  place('e', 'Rome'),
  place('f', 'Rome'),
];

describe('deckReducer', () => {
  it('starts with the whole feed and no swipe', () => {
    const deck = startDeck(feed);
    expect(ids(visibleCards(deck))).toEqual(['a', 'b', 'c']);
    expect(deck.swipes).toEqual([]);
  });

  it('removes the swiped card and records the swipe', () => {
    const deck = deckReducer(startDeck(feed), {
      type: 'swiped',
      swipe: { id: 'a', liked: true, viewDurationMs: 1200 },
    });

    expect(ids(visibleCards(deck))).toEqual(['b', 'c', 'd']);
    expect(deck.swipes).toEqual([{ id: 'a', liked: true, viewDurationMs: 1200 }]);
  });

  it('ignores a second swipe on a card already swiped', () => {
    const swiped = deckReducer(startDeck(feed), {
      type: 'swiped',
      swipe: { id: 'a', liked: true, viewDurationMs: 1200 },
    });
    expect(
      deckReducer(swiped, { type: 'swiped', swipe: { id: 'a', liked: false, viewDurationMs: 5 } }),
    ).toBe(swiped);
  });

  it('reorders only the cards behind the visible stack when cities are ranked', () => {
    const ranks: CityRank[] = [{ city: 'Rome', score: 4, vetoed: false }];
    const deck = deckReducer(startDeck(feed), { type: 'citiesRanked', ranks });

    expect(ids(deck.queue)).toEqual(['a', 'b', 'c', 'e', 'f', 'd']);
  });

  it('never brings back a swiped card, even after a ranking', () => {
    let deck: DeckState = startDeck(feed);
    for (const id of ['a', 'e']) {
      deck = deckReducer(deck, { type: 'swiped', swipe: { id, liked: true, viewDurationMs: 10 } });
    }
    deck = deckReducer(deck, {
      type: 'citiesRanked',
      ranks: [{ city: 'Rome', score: 4, vetoed: false }],
    });

    expect(ids(deck.queue)).not.toContain('a');
    expect(ids(deck.queue)).not.toContain('e');
    expect(deck.queue).toHaveLength(4);
  });

  it('starts over with the whole feed', () => {
    const swiped = deckReducer(startDeck(feed), {
      type: 'swiped',
      swipe: { id: 'a', liked: true, viewDurationMs: 10 },
    });
    expect(deckReducer(swiped, { type: 'restarted' })).toEqual(startDeck(feed));
  });
});

describe('likeCount', () => {
  it('counts only the likes', () => {
    expect(
      likeCount([
        { id: 'a', liked: true, viewDurationMs: 10 },
        { id: 'b', liked: false, viewDurationMs: 10 },
        { id: 'c', liked: true, viewDurationMs: 10 },
      ]),
    ).toBe(2);
  });
});

describe('reachedLikeGoal', () => {
  const likes = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ id: `l${i}`, liked: true, viewDurationMs: 10 }));
  const skip = { id: 's', liked: false, viewDurationMs: 10 };

  it('is true on the like that reaches the goal', () => {
    expect(reachedLikeGoal(likes(LIKE_GOAL))).toBe(true);
  });

  it('is false before the goal, on a later skip and on later likes', () => {
    expect(reachedLikeGoal(likes(LIKE_GOAL - 1))).toBe(false);
    expect(reachedLikeGoal([...likes(LIKE_GOAL), skip])).toBe(false);
    expect(reachedLikeGoal(likes(LIKE_GOAL + 1))).toBe(false);
  });
});
