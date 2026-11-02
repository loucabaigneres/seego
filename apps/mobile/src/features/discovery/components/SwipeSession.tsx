import { EmptyState } from '@/ui';
import { MapTrifoldIcon } from '@/ui/icons';

import { useDestinationResult } from '../hooks/useDestinationResult';
import { useSwipeDeck } from '../hooks/useSwipeDeck';
import type { DiscoveryPlace } from '../lib/discovery-place';
import { DeckHeader } from './DeckHeader';
import { ResultSheet } from './ResultSheet';
import { SwipeActions } from './SwipeActions';
import { SwipeDeck } from './SwipeDeck';

/** The deck once the feed is loaded: the session starts with these places. */
export function SwipeSession({ tripId, places }: { tripId: string; places: DiscoveryPlace[] }) {
  // The deck opens the result on its 10th like, and the result reads the deck's swipes.
  const openResult = () => result.open();
  const deck = useSwipeDeck(places, { onLikeGoal: openResult });
  const result = useDestinationResult(tripId, deck.swipes);

  const restart = () => {
    deck.restart();
    result.reset();
  };

  return (
    <>
      <DeckHeader likeCount={deck.likeCount} onShowResult={result.open} />

      {deck.isFinished ? (
        <EmptyState
          className="rounded-card bg-surface"
          icon={MapTrifoldIcon}
          title="Tu as parcouru tous les lieux !"
          description="Découvre la destination qui te correspond, ou recommence pour affiner tes goûts."
          action={
            deck.likeCount > 0
              ? { label: 'Voir ma destination', onPress: result.open }
              : { label: 'Recommencer', onPress: restart }
          }
        />
      ) : (
        <SwipeDeck
          cards={deck.cards}
          topCardRef={deck.topCardRef}
          dragX={deck.dragX}
          isLeaving={deck.isLeaving}
          onDecide={deck.decide}
        />
      )}

      <SwipeActions
        onSkip={deck.skip}
        onLike={deck.like}
        onDetails={deck.toggleDetails}
        disabled={deck.isFinished || deck.isLeaving}
        dragX={deck.dragX}
      />

      <ResultSheet
        result={result}
        likeCount={deck.likeCount}
        seenCount={deck.swipes.length}
        onRestart={restart}
      />
    </>
  );
}
