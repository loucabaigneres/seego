import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { offerHost, placePhotos } from '@/domain/place';
import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { ArrowSquareOutIcon } from '@/ui/icons';

import { useDestinationResult } from '../hooks/useDestinationResult';
import { useSwipeDeck } from '../hooks/useSwipeDeck';
import type { DiscoveryPlace } from '../lib/discovery-place';
import { DeckFinished } from './DeckFinished';
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
  const detailsOpen = deck.detailsOpen;
  const offerUrl = detailsOpen ? (deck.cards.at(0)?.url ?? null) : null;
  const host = offerHost(offerUrl);
  const photos = places.slice(0, 2).flatMap((place) => placePhotos(place).slice(0, 1));

  const restart = () => {
    deck.restart();
    result.reset();
  };

  return (
    <>
      <DeckHeader likeCount={deck.progressCount} onShowResult={result.open} />

      {deck.isFinished ? (
        <DeckFinished
          seenCount={deck.swipes.length}
          likeCount={deck.likeCount}
          photos={photos}
          onShowResult={result.open}
          onRestart={restart}
        />
      ) : (
        <SwipeDeck
          cards={deck.cards}
          topCardRef={deck.topCardRef}
          dragX={deck.dragX}
          isLeaving={deck.isLeaving}
          onDecide={deck.decide}
          detailsOpen={detailsOpen}
          onDetailsChange={deck.setDetailsOpen}
        />
      )}

      {!deck.isFinished && (
        <SwipeActions
          onSkip={deck.skip}
          onLike={deck.like}
          onDetails={deck.toggleDetails}
          disabled={deck.isLeaving}
          detailsOpen={detailsOpen}
          dragX={deck.dragX}
        />
      )}

      {!deck.isFinished && (
        // Fixed height: the deck keeps its size when the hint turns into the offer link.
        <View className="h-11 items-center justify-center">
          {offerUrl ? (
            <Pressable
              role="link"
              onPress={() => WebBrowser.openBrowserAsync(offerUrl)}
              hitSlop={8}
              className="flex-row items-center gap-1.5 active:opacity-80"
            >
              <Text variant="label" tone="brand" className="text-control" numberOfLines={1}>
                {host ? `Voir l’offre sur ${host}` : 'Voir l’offre'}
              </Text>
              <ArrowSquareOutIcon size={16} color={colors.brand} />
            </Pressable>
          ) : (
            !detailsOpen && (
              <Text variant="caption">Glisse la photo vers le haut pour les détails</Text>
            )
          )}
        </View>
      )}

      <ResultSheet
        result={result}
        likeCount={deck.likeCount}
        seenCount={deck.swipes.length}
        onRestart={restart}
      />
    </>
  );
}
