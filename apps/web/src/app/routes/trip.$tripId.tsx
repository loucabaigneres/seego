import { createFileRoute } from '@tanstack/react-router'
import { GroupTripInviteCard } from '@/features/group-trip/components/GroupTripInviteCard'
import { DayCard } from '@/features/trip/components/DayCard'
import { EditActionBar } from '@/features/trip/components/EditActionBar'
import { GenerateItineraryCard } from '@/features/trip/components/GenerateItineraryCard'
import { ItineraryHeader } from '@/features/trip/components/ItineraryHeader'
import { ReplacePlaceModal } from '@/features/trip/components/ReplacePlaceModal'
import { SaveTripSection } from '@/features/trip/components/SaveTripSection'
import { TripHero } from '@/features/trip/components/TripHero'
import { TripMap } from '@/features/trip/components/TripMap'
import { GeneratingCard, TripLoading, TripNotFound } from '@/features/trip/components/TripStatusCard'
import { useTrip } from '@/features/trip/hooks/useTrip'
import { heroImageOf, plannedCount, splitTripDays } from '@/features/trip/lib/tripDays'

export const Route = createFileRoute('/trip/$tripId')({ component: TripPage })

function TripPage() {
  const { tripId } = Route.useParams()
  const { query, isLoggedIn, isOwner, save, generate, replace, edit } = useTrip(tripId)

  if (query.isPending) return <TripLoading />
  if (query.isError) return <TripNotFound />

  const { trip, days, isGenerated } = query.data
  const { itineraryDays, likedDay } = splitTripDays(days)
  const isEditing = edit.draft !== null
  const shownDays = edit.draft ?? itineraryDays

  return (
    <div className="min-h-screen bg-[#F2EDE8] text-[#1a1a1a]">
      <div className="mx-auto w-full max-w-130 px-4 pb-12 pt-3 md:pt-5">
        <TripHero
          trip={trip}
          heroImage={heroImageOf(itineraryDays, likedDay)}
          plannedCount={plannedCount(itineraryDays)}
        />

        <SaveTripSection
          tripId={tripId}
          isLoggedIn={isLoggedIn}
          isSaved={trip.status === 'finalized' && isOwner}
          isSaving={save.isPending}
          showSavedBanner={save.showBanner}
          onSave={save.run}
          onCloseBanner={save.closeBanner}
        />

        {/* ── Voyage de groupe (Invitation / Conversion) ── */}
        <div className="mt-4">
          <GroupTripInviteCard
            tripId={tripId}
            destination={trip.destination}
            isAlreadyGroup={Boolean(trip.isGroup)}
            initialInviteCode={trip.inviteCode}
            isOwner={isOwner}
          />
        </div>

        {/* ── Génération ── */}
        {!isGenerated && (
          <GenerateItineraryCard
            likedDay={likedDay}
            isPending={generate.isPending}
            errorMessage={generate.errorMessage}
            onGenerate={generate.run}
          />
        )}

        {/* ── Itinéraire ── */}
        {isGenerated && (
          <>
            <ItineraryHeader trip={trip} days={days} isEditing={isEditing} onStartEditing={edit.start} />

            <div className="mt-3">
              <TripMap days={shownDays} />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {shownDays.map((day) => (
                <DayCard
                  key={day.id}
                  day={day}
                  onReplace={isEditing ? undefined : replace.open}
                  edit={edit.draft ? { days: edit.draft, ...edit.editDay(day.id) } : undefined}
                />
              ))}
            </div>

            {isEditing && (
              <EditActionBar
                isPending={edit.isPending}
                error={edit.errorMessage}
                onCancel={edit.cancel}
                onSave={edit.save}
              />
            )}
          </>
        )}

        {generate.isPending && <GeneratingCard />}
      </div>

      {replace.place && (
        <ReplacePlaceModal
          tripId={tripId}
          place={replace.place}
          onClose={replace.close}
          onReplaced={replace.onReplaced}
        />
      )}
    </div>
  )
}
