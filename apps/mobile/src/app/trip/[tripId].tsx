import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, LayoutAnimationConfig } from 'react-native-reanimated';

import { plannedCount, tripCoverImage } from '@/domain/trip';
import { tripDisplayTitle } from '@/domain/trip-summary';
import { GroupTripCard } from '@/features/group-trip/components/GroupTripCard';
import { GroupTripSheet } from '@/features/group-trip/components/GroupTripSheet';
import { useGroupTrip } from '@/features/group-trip/hooks/useGroupTrip';
import { DayTimeline } from '@/features/trip/components/DayTimeline';
import { EditPlanningBar } from '@/features/trip/components/EditPlanningBar';
import { GenerateItineraryCard } from '@/features/trip/components/GenerateItineraryCard';
import { ItineraryToolbar } from '@/features/trip/components/ItineraryToolbar';
import { MoveToDaySheet } from '@/features/trip/components/MoveToDaySheet';
import { PdfActionsSheet } from '@/features/trip/components/PdfActionsSheet';
import { PlanningEditHeader } from '@/features/trip/components/PlanningEditHeader';
import { RenameTripSheet } from '@/features/trip/components/RenameTripSheet';
import { ReplacePlaceSheet } from '@/features/trip/components/ReplacePlaceSheet';
import { SaveTripCard } from '@/features/trip/components/SaveTripCard';
import { TripHero } from '@/features/trip/components/TripHero';
import { TripMap } from '@/features/trip/components/TripMap';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { EmptyState, ErrorState, LoadingState, Notice, Screen } from '@/ui';
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
    pdf,
    save,
    rename,
    selection,
    itineraryView,
    edit,
    replace,
    isGenerated,
    generate,
  } = useTrip(tripId);
  const group = useGroupTrip(tripId, trip);
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
        // Child 2 is the toolbar (after the hero and the save card): the day picker stays
        // reachable on long days. Keep both rendered (even empty) so the index holds.
        stickyHeaderIndices={isGenerated ? [2] : undefined}
        scrollRef={selection.scrollRef}
        onScroll={selection.onScroll}
        // The map takes the drags; switching back to the itinerary gives them to the page again.
        scrollEnabled={!showMap}
        footer={
          edit.isEditing && (
            <EditPlanningBar
              isSaving={edit.isSaving}
              isDirty={edit.isDirty}
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
          onRename={rename.canRename && !edit.isEditing ? rename.open : undefined}
          pdf={
            isGenerated && !edit.isEditing
              ? { onExport: pdf.choose, isExporting: pdf.isExporting }
              : undefined
          }
        />
        {/* Its bottom is where the sticky day picker starts. One child, so the toolbar stays child 2. */}
        <View onLayout={selection.onHeroLayout} className="gap-4">
          {pdf.errorMessage && <Notice message={pdf.errorMessage} />}
          {pdf.savedMessage && <Notice tone="success" message={pdf.savedMessage} />}
          {/* Before generation, saving comes after the planning, under "Générer". */}
          {isGenerated && !edit.isEditing && <SaveTripCard save={save} />}
          {!edit.isEditing && <GroupTripCard group={group} />}
        </View>

        {isGenerated && (
          <ItineraryToolbar
            days={edit.draft ?? days.itinerary}
            stepCounts={edit.isEditing}
            selectedId={selection.selectedId}
            onSelect={selection.select}
            view={itineraryView.view}
            onViewChange={itineraryView.setView}
            onLayout={itineraryView.onToolbarLayout}
            canSwitchView={!edit.isEditing}
          />
        )}
        {edit.isEditing && <PlanningEditHeader tripTitle={tripDisplayTitle(trip)} />}
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
              {selection.shownDays.map((day, index) => (
                <DayTimeline
                  key={day.id}
                  day={day}
                  edit={
                    edit.draft
                      ? {
                          day: edit.editDay(day.id),
                          canChangeDay: edit.draft.length > 1,
                          changedIds: edit.changedIds,
                        }
                      : undefined
                  }
                  onReplace={edit.isEditing ? undefined : replace.open}
                  // Edits cover the whole planning: one "Modifier", on the first day shown.
                  onEdit={!edit.isEditing && index === 0 ? edit.start : undefined}
                />
              ))}
            </Animated.View>
          </LayoutAnimationConfig>
        ) : (
          <View className="gap-2.5">
            <GenerateItineraryCard
              likedPlaces={days.likedPlaces?.activities ?? []}
              isPending={generate.isPending}
              failed={generate.failed}
              onGenerate={generate.run}
              onPickPlaces={() => router.push({ pathname: '/discovery', params: { tripId } })}
            />
            <SaveTripCard save={save} />
          </View>
        )}
      </Screen>

      <ReplacePlaceSheet replace={replace} />
      <RenameTripSheet rename={rename} />
      <GroupTripSheet group={group} />
      <PdfActionsSheet visible={pdf.isChoosing} onPick={pdf.run} onClose={pdf.dismiss} />
      <MoveToDaySheet
        targets={edit.moveTargets}
        onPick={edit.moveTo}
        onClose={edit.closeMoveToDay}
      />
    </>
  );
}
