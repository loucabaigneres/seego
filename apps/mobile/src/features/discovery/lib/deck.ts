import type { RouterInputs } from '@/lib/trpc';

import { interleaveByCityRank, type CityRank } from './city-ranking';
import type { DiscoveryPlace } from './discovery-place';

/** One decision on a card, in the shape every `discovery.*` procedure expects. */
export type Swipe = RouterInputs['discovery']['recommendation']['swipes'][number];

/** Likes needed before the destination is worth computing. */
export const LIKE_GOAL = 10;
/** Swipes after which the cards still to come are reordered by the cities the user likes. */
export const EXPLORATION_SIZE = 10;
/** Cards rendered on top of each other. Reordering never touches them: nothing moves under the finger. */
const STACK_SIZE = 3;

export interface DeckState {
  /** The whole feed, to start over. */
  places: DiscoveryPlace[];
  /** Places not swiped yet, in the order they will be shown. */
  queue: DiscoveryPlace[];
  swipes: Swipe[];
}

export type DeckAction =
  | { type: 'swiped'; swipe: Swipe }
  | { type: 'citiesRanked'; ranks: CityRank[] }
  | { type: 'restarted' };

export function startDeck(places: DiscoveryPlace[]): DeckState {
  return { places, queue: places, swipes: [] };
}

export function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case 'swiped': {
      const { swipe } = action;
      if (!state.queue.some((place) => place.id === swipe.id)) return state;
      return {
        ...state,
        queue: state.queue.filter((place) => place.id !== swipe.id),
        swipes: [...state.swipes, swipe],
      };
    }
    case 'citiesRanked':
      return {
        ...state,
        queue: [
          ...state.queue.slice(0, STACK_SIZE),
          ...interleaveByCityRank(state.queue.slice(STACK_SIZE), action.ranks),
        ],
      };
    case 'restarted':
      return startDeck(state.places);
  }
}

/** The cards on screen, top card first. */
export function visibleCards(state: DeckState): DiscoveryPlace[] {
  return state.queue.slice(0, STACK_SIZE);
}

export function likeCount(swipes: readonly Swipe[]): number {
  return swipes.filter((swipe) => swipe.liked).length;
}
