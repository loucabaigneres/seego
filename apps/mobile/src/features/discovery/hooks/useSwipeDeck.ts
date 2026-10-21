import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { trpc } from '@/lib/trpc';

import type { SwipeCardHandle } from '../components/SwipeCard';
import {
  deckReducer,
  EXPLORATION_SIZE,
  likeCount,
  startDeck,
  visibleCards,
  type Swipe,
} from '../lib/deck';
import type { DiscoveryPlace } from '../lib/discovery-place';

/** One swipe session over the feed: card order, decisions, and the animation that ends each one. */
export function useSwipeDeck(places: DiscoveryPlace[]) {
  const [deck, dispatch] = useReducer(deckReducer, places, startDeck);
  const queryClient = useQueryClient();
  const topCardRef = useRef<SwipeCardHandle>(null);
  /** Horizontal drag of the top card, read by the action buttons. */
  const dragX = useSharedValue(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const shownAt = useRef(0);
  const latestRanking = useRef(0);

  const cards = visibleCards(deck);
  const topCard = cards.at(0);
  const topCardId = topCard?.id;

  // Times how long the top card stays on screen (`viewDurationMs`, used by the ranking).
  useEffect(() => {
    shownAt.current = Date.now();
  }, [topCardId]);

  const reorderUpcomingCards = (swipes: Swipe[]) => {
    const request = ++latestRanking.current;
    queryClient
      .fetchQuery(trpc.discovery.rankCities.queryOptions({ swipes }))
      .then((ranks) => {
        // Answers can cross on a slow network: only the latest ranking counts.
        if (request === latestRanking.current) dispatch({ type: 'citiesRanked', ranks });
      })
      // Without a ranking the deck simply keeps its current order.
      .catch(() => {});
  };

  /** Single entry point for a decision: drag, buttons and screen reader actions all end here. */
  const decide = (liked: boolean) => {
    const card = topCardRef.current;
    if (!topCard || !card || isLeaving) return;

    const swipe: Swipe = { id: topCard.id, liked, viewDurationMs: Date.now() - shownAt.current };
    setIsLeaving(true);
    card.flyOut(liked ? 'like' : 'skip', () => {
      dragX.set(0);
      setIsLeaving(false);
      dispatch({ type: 'swiped', swipe });

      const swipes = [...deck.swipes, swipe];
      if (swipes.length >= EXPLORATION_SIZE) reorderUpcomingCards(swipes);
    });
  };

  const restart = () => {
    // A ranking still on its way belongs to the previous session.
    latestRanking.current++;
    dispatch({ type: 'restarted' });
  };

  return {
    cards,
    likeCount: likeCount(deck.swipes),
    isFinished: deck.queue.length === 0,
    isLeaving,
    topCardRef,
    dragX,
    decide,
    like: () => decide(true),
    skip: () => decide(false),
    toggleDetails: () => topCardRef.current?.toggleDetails(),
    restart,
  };
}
