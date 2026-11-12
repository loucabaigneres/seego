import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInLeft, FadeInRight, LayoutAnimationConfig } from 'react-native-reanimated';

import { plannedCount, tripCoverImage } from '@/domain/trip';
import { DayTimeline } from '@/features/trip/components/DayTimeline';
import { EditPlanningBar } from '@/features/trip/components/EditPlanningBar';
import { GenerateItineraryCard } from '@/features/trip/components/GenerateItineraryCard';
import { ItineraryToolbar } from '@/features/trip/components/ItineraryToolbar';
import { MoveToDaySheet } from '@/features/trip/components/MoveToDaySheet';
import { PlanningEditHeader } from '@/features/trip/components/PlanningEditHeader';
import { ReplacePlaceSheet } from '@/features/trip/components/ReplacePlaceSheet';
import { TripHero } from '@/features/trip/components/TripHero';
import { TripMap } from '@/features/trip/components/TripMap';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/ui';
import { SuitcaseRollingIcon } from '@/ui/icons';

export default function TripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  if (!tripId) return <Redirect href="/" />;
  return <TripPage tripId={tripId} />;
}

function TripPage({ tripId }: { tripId: string }) {
  const {
    isLoading,
    notFound,
    loadFailed,
    retry,
    trip,
    days,
    selection,
    itineraryView,
    edit,
    replace,
    isGenerated,
    generate,
  } = useTrip(tripId);
  const showMap = isGenerated && itineraryView.view === 'map';

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
    <>
      <Screen
        scroll
        contentClassName="gap-4"
        // Child 1 is the toolbar: the day picker stays reachable on long days.
        stickyHeaderIndices={isGenerated ? [1] : undefined}
        scrollRef={selection.scrollRef}
        onScroll={selection.onScroll}
        // The map takes the drags; switching back to the itinerary gives them to the page again.
        scrollEnabled={!showMap}
        footer={
          edit.isEditing && (
            <EditPlanningBar
              isSaving={edit.isSaving}
              errorMessage={edit.errorMessage}
              onCancel={edit.cancel}
              onSave={edit.save}
            />
          )
        }
      >
        <TripHero
          trip={trip}
          coverImage={tripCoverImage(days.itinerary, days.likedPlaces)}
          plannedCount={plannedCount(days.itinerary)}
          onLayout={selection.onHeroLayout}
        />

        {isGenerated && (
          <ItineraryToolbar
            days={days.itinerary}
            selectedId={selection.selectedId}
            onSelect={selection.select}
            view={itineraryView.view}
            onViewChange={itineraryView.setView}
            onLayout={itineraryView.onToolbarLayout}
            canSwitchView={!edit.isEditing}
          />
        )}
        {isGenerated && !showMap && (
          <PlanningEditHeader isEditing={edit.isEditing} onStart={edit.start} />
        )}
        {showMap ? (
          <TripMap days={selection.shownDays} height={itineraryView.mapHeight} />
        ) : isGenerated ? (
          // No slide on first display: only a pick in the day picker animates.
          <LayoutAnimationConfig skipEntering>
            <Animated.View
              key={selection.selectedId}
              entering={(selection.direction === 'forward' ? FadeInRight : FadeInLeft).duration(
                220,
              )}
              className="gap-10"
            >
              {selection.shownDays.map((day) => (
                <DayTimeline
                  key={day.id}
                  day={day}
                  edit={
                    edit.draft
                      ? { day: edit.editDay(day.id), canChangeDay: edit.draft.length > 1 }
                      : undefined
                  }
                  onReplace={edit.isEditing ? undefined : replace.open}
                />
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

      <ReplacePlaceSheet replace={replace} />
      <MoveToDaySheet
        targets={edit.moveTargets}
        onPick={edit.moveTo}
        onClose={edit.closeMoveToDay}
      />
    </>
  );
}
