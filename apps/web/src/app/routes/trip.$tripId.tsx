import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { GroupTripInviteCard } from '@/features/group-trip/components/GroupTripInviteCard'
import { DayCard } from '@/features/trip/components/DayCard'
import { EditActionBar } from '@/features/trip/components/EditActionBar'
import { GenerateItineraryCard } from '@/features/trip/components/GenerateItineraryCard'
import { ItineraryHeader } from '@/features/trip/components/ItineraryHeader'
import { ReplacePlaceModal } from '@/features/trip/components/ReplacePlaceModal'
import { SaveTripSection } from '@/features/trip/components/SaveTripSection'
import { TripHero } from '@/features/trip/components/TripHero'
import { TripFilters } from '@/features/trip/components/TripFilters'
import { TripMap } from '@/features/trip/components/TripMap'
import { GeneratingCard, TripLoading, TripNotFound } from '@/features/trip/components/TripStatusCard'
import { useTrip } from '@/features/trip/hooks/useTrip'
import { filterDays } from '@/features/trip/lib/filterDays'
import { heroImageOf, plannedCount, splitTripDays } from '@/features/trip/lib/tripDays'

const tripSearchSchema = z.object({
  // Set when "Sauvegarder" sent a guest to the login page: the save is replayed once back here
  save: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/trip/$tripId')({
  validateSearch: (search) => tripSearchSchema.parse(search),
  component: TripPage,
})

function TripPage() {
  const { tripId } = Route.useParams()
  const { save: pendingSave } = Route.useSearch()
  const { query, isLoggedIn, isOwner, save, rename, generate, replace, edit } = useTrip(
    tripId,
    pendingSave,
  )

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (query.isPending) return <TripLoading />
  if (query.isError) return <TripNotFound />

  const { trip, days, isGenerated } = query.data
  const { itineraryDays, likedDay } = splitTripDays(days)
  const isEditing = edit.draft !== null
  const shownDays = edit.draft ?? itineraryDays
  // While editing, the whole itinerary stays visible so no place is hidden mid-edit.
  const listedDays = isEditing ? shownDays : filterDays(shownDays, selectedDay, selectedCategory)
  const dayIndexes = [...new Set(shownDays.map((d) => d.dayIndex))].sort((a, b) => a - b)
  const categories = [
    ...new Set(shownDays.flatMap((d) => d.activities.map((a) => a.category)).filter(Boolean) as string[]),
  ]

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* Phones: one column (header, map, days). Large screens: the map on one side, everything
          else — filters and day-by-day — on the other. */}
      <div
        className={`mx-auto w-full px-4 pb-12 pt-3 md:pt-5 ${
          isGenerated
            ? 'max-w-130 lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1fr)_32.5rem] lg:gap-x-8 lg:gap-y-0'
            : 'max-w-130'
        }`}
      >
        <div className="lg:col-start-2 lg:row-start-1">
          <TripHero
            trip={trip}
            heroImage={heroImageOf(itineraryDays, likedDay)}
            plannedCount={plannedCount(itineraryDays)}
            rename={isOwner ? { isPending: rename.isPending, onSubmit: rename.run } : undefined}
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

          {isGenerated && (
            <ItineraryHeader trip={trip} days={days} isEditing={isEditing} onStartEditing={edit.start} />
          )}
        </div>

        {isGenerated && (
          <>
            {/* ── Carte ── */}
            <div className="mt-3 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-start lg:sticky lg:top-20">
              <TripMap
                days={shownDays}
                selectedDay={selectedDay}
                selectedCategory={selectedCategory}
                heightClass="h-100 lg:h-[calc(100vh-7rem)]"
              />
            </div>

            {/* ── Filtres + jours ── */}
            <div className="lg:col-start-2 lg:row-start-2">
              <div className="mt-3">
                <TripFilters
                  dayIndexes={dayIndexes}
                  categories={categories}
                  selectedDay={selectedDay}
                  selectedCategory={selectedCategory}
                  onDayChange={setSelectedDay}
                  onCategoryChange={setSelectedCategory}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {listedDays.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    onReplace={isEditing ? undefined : replace.open}
                    edit={edit.draft ? { days: edit.draft, ...edit.editDay(day.id) } : undefined}
                  />
                ))}
                {listedDays.length === 0 && (
                  <p className="rounded-card border border-brand/15 bg-surface p-6 text-center text-sm text-ink-muted">
                    Aucun lieu ne correspond à ces filtres.
                  </p>
                )}
              </div>

              {isEditing && (
                <EditActionBar
                  isPending={edit.isPending}
                  error={edit.errorMessage}
                  onCancel={edit.cancel}
                  onSave={edit.save}
                />
              )}
            </div>
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
