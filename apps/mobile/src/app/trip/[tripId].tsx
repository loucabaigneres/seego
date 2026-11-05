import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInLeft, FadeInRight, LayoutAnimationConfig } from 'react-native-reanimated';

import { plannedCount, tripCoverImage } from '@/domain/trip';
import { DayPicker } from '@/features/trip/components/DayPicker';
import { DayTimeline } from '@/features/trip/components/DayTimeline';
import { GenerateItineraryCard } from '@/features/trip/components/GenerateItineraryCard';
import { TripHero } from '@/features/trip/components/TripHero';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/ui';
import { SuitcaseRollingIcon } from '@/ui/icons';

export default function TripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  if (!tripId) return <Redirect href="/" />;
  return <TripPage tripId={tripId} />;
}

function TripPage({ tripId }: { tripId: string }) {
  const { isLoading, notFound, loadFailed, retry, trip, days, selection, isGenerated, generate } =
    useTrip(tripId);

  if (!trip) {
    return (
      <Screen>
        {isLoading ? (
          <LoadingState label="Chargement de ton voyage…" />
        ) : notFound || !loadFailed ? (
          <EmptyState
            icon={SuitcaseRollingIcon}
            title="Voyage introuvable"
            description="Ce lien ne mène à aucun voyage."
            action={{ label: 'Retour à l’accueil', onPress: () => router.replace('/') }}
          />
        ) : (
          <ErrorState title="Impossible de charger ton voyage" onRetry={retry} />
        )}
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentClassName="gap-4"
      // Child 1 is the day picker: it stays reachable on long days.
      stickyHeaderIndices={isGenerated ? [1] : undefined}
      scrollRef={selection.scrollRef}
      onScroll={selection.onScroll}
    >
      <TripHero
        trip={trip}
        coverImage={tripCoverImage(days.itinerary, days.likedPlaces)}
        plannedCount={plannedCount(days.itinerary)}
        onLayout={selection.onHeroLayout}
      />

      {isGenerated && (
        <DayPicker
          days={days.itinerary}
          selectedId={selection.selectedId}
          onSelect={selection.select}
        />
      )}
      {isGenerated ? (
        // No slide on first display: only a pick in the day picker animates.
        <LayoutAnimationConfig skipEntering>
          <Animated.View
            key={selection.selectedId}
            entering={(selection.direction === 'forward' ? FadeInRight : FadeInLeft).duration(220)}
            className="gap-10"
          >
            {selection.shownDays.map((day) => (
              <DayTimeline key={day.id} day={day} />
            ))}
          </Animated.View>
        </LayoutAnimationConfig>
      ) : (
        <GenerateItineraryCard
          likedPlaces={days.likedPlaces?.activities ?? []}
          isPending={generate.isPending}
          failed={generate.failed}
          onGenerate={generate.run}
        />
      )}
    </Screen>
  );
}
