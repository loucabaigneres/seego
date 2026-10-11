import { EmptyState } from '@/ui';
import { MapTrifoldIcon } from '@/ui/icons';

import { useSwipeDeck } from '../hooks/useSwipeDeck';
import type { DiscoveryPlace } from '../lib/discovery-place';
import { DeckHeader } from './DeckHeader';
import { SwipeActions } from './SwipeActions';
import { SwipeDeck } from './SwipeDeck';

/** The deck once the feed is loaded: the session starts with these places. */
export function SwipeSession({ places }: { places: DiscoveryPlace[] }) {
  const deck = useSwipeDeck(places);

  return (
    <>
      <DeckHeader likeCount={deck.likeCount} />

      {deck.isFinished ? (
        <EmptyState
          className="rounded-card bg-surface"
          icon={MapTrifoldIcon}
          title="Tu as parcouru tous les lieux !"
          description="Recommence pour affiner tes goûts."
          action={{ label: 'Recommencer', onPress: deck.restart }}
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
        disabled={deck.isFinished || deck.isLeaving}
        dragX={deck.dragX}
      />
    </>
  );
}
