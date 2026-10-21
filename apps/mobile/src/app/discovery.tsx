import { Redirect, useLocalSearchParams } from 'expo-router';

import { DeckHeader } from '@/features/discovery/components/DeckHeader';
import { SkeletonCard } from '@/features/discovery/components/SkeletonCard';
import { SwipeActions } from '@/features/discovery/components/SwipeActions';
import { SwipeSession } from '@/features/discovery/components/SwipeSession';
import { useDiscoveryFeed } from '@/features/discovery/hooks/useDiscoveryFeed';
import { ErrorState, Screen } from '@/ui';

export default function DiscoveryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  // Same guard as the web's `beforeLoad`: the deck always belongs to a trip.
  // The deck is a child so its feed query only starts once the guard has passed.
  if (!tripId) return <Redirect href="/onboarding" />;
  return <DiscoveryDeck />;
}

function DiscoveryDeck() {
  const feed = useDiscoveryFeed();

  return (
    <Screen contentClassName="gap-5 pt-3 pb-4">
      {feed.places ? (
        <SwipeSession places={feed.places} />
      ) : (
        <>
          <DeckHeader likeCount={0} />
          {feed.hasFailed ? (
            <ErrorState
              className="rounded-card bg-surface"
              title="Impossible de charger les lieux"
              onRetry={feed.retry}
            />
          ) : (
            <SkeletonCard />
          )}
          <SwipeActions disabled />
        </>
      )}
    </Screen>
  );
}
