import { PDFDownloadLink } from '@react-pdf/renderer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { GroupTripInviteCard } from '../components/GroupTripInviteCard'
import { ReplacePlaceModal } from '../components/ReplacePlaceModal'
import { TripMap } from '../components/TripMap'
import { TripPdfDocument } from '../components/TripPdf'
import { DayCard } from '../components/trip/DayCard'
import { EditActionBar } from '../components/trip/EditActionBar'
import { GenerateItineraryCard } from '../components/trip/GenerateItineraryCard'
import { SaveTripSection } from '../components/trip/SaveTripSection'
import { TripHero } from '../components/trip/TripHero'
import type { Activity, Day } from '../components/trip/types'
import { authClient } from '../lib/auth-client'
import { moveToDay, moveWithinDay, removeFromDay } from '../lib/draftPlanning'
import { trpc } from '../lib/trpc.js'

export const Route = createFileRoute('/trip/$tripId')({ component: TripPage })

function TripPage() {
  const { tripId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const [showSavedBanner, setShowSavedBanner] = useState(false)

  const tripQuery = useQuery(trpc.discovery.getTrip.queryOptions({ tripId }))

  const generateMutation = useMutation(
    trpc.discovery.generateItinerary.mutationOptions({
      onSuccess: () => tripQuery.refetch(),
    }),
  )

  /** Place whose replacement pop-up is open. */
  const [replacing, setReplacing] = useState<Activity | null>(null)
  const closeReplace = useCallback(() => setReplacing(null), [])
  const { refetch: refetchTrip } = tripQuery
  const handleReplaced = useCallback(() => {
    setReplacing(null)
    refetchTrip()
  }, [refetchTrip])

  /** Planning being edited; `null` outside edit mode. */
  const [draft, setDraft] = useState<Day[] | null>(null)

  const updatePlanningMutation = useMutation(
    trpc.discovery.updatePlanning.mutationOptions({
      onSuccess: async () => {
        await tripQuery.refetch()
        setDraft(null)
      },
    }),
  )

  const { mutate: saveToProfile, isPending: isSavingTrip } = useMutation(
    trpc.user.saveTripToAccount.mutationOptions({
      onSuccess: () => {
        tripQuery.refetch()
        queryClient.invalidateQueries(trpc.user.getProfile.queryFilter())
        queryClient.invalidateQueries(trpc.user.getTrips.queryFilter())
        setShowSavedBanner(true)
        setTimeout(() => setShowSavedBanner(false), 5000)
      },
    }),
  )

  const renameMutation = useMutation(
    trpc.user.renameTrip.mutationOptions({
      // Awaited so the editor closes on the new title, not the stale one.
      onSuccess: async () => {
        queryClient.invalidateQueries(trpc.user.getTrips.queryFilter())
        await tripQuery.refetch()
      },
    }),
  )

  useEffect(() => {
    if (
      session?.user &&
      tripQuery.data?.trip &&
      tripQuery.data.trip.userId !== session.user.id &&
      !isSavingTrip
    ) {
      saveToProfile({ tripId })
    }
  }, [session?.user, tripQuery.data?.trip, tripId, saveToProfile, isSavingTrip])

  if (tripQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EDE8] px-4">
        <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-[28px] border border-[#eee] bg-white px-8 py-14 text-center shadow-sm">
          <span className="animate-pulse text-4xl" aria-hidden>🧭</span>
          <p className="text-sm font-semibold text-[#888]">Chargement de ton voyage…</p>
        </div>
      </div>
    )
  }

  if (tripQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EDE8] px-4">
        <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-[28px] border border-[#eee] bg-white px-8 py-14 text-center shadow-sm">
          <span className="text-4xl" aria-hidden>🧳</span>
          <p className="text-sm font-semibold text-[#1a1a1a]">Voyage introuvable.</p>
          <Link
            to="/discovery"
            className="mt-1 rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
          >
            Retour à la découverte
          </Link>
        </div>
      </div>
    )
  }

  const { trip, days, isGenerated } = tripQuery.data
  const isOwner = session?.user && trip.userId === session.user.id
  const isFinalized = trip.status === 'finalized'

  const handleSaveTrip = () => {
    if (!session?.user) {
      navigate({
        to: '/login',
        search: { redirect: `/trip/${tripId}` },
      })
      return
    }
    saveToProfile({ tripId })
  }

  // Day 0 holds the places liked while swiping and day -1 the alternative
  // hotels; neither belongs in the day-by-day planning.
  const itineraryDays = days.filter((d) => d.dayIndex > 0)
  const likedDay = days.find((d) => d.dayIndex === 0)
  const isEditing = draft !== null
  const shownDays = draft ?? itineraryDays

  const startEditing = () => {
    updatePlanningMutation.reset()
    setDraft(
      itineraryDays.map((d) => ({
        ...d,
        activities: [...d.activities].sort((a, b) => a.orderIndex - b.orderIndex),
      })),
    )
  }

  const saveDraft = () => {
    if (!draft) return
    updatePlanningMutation.mutate({
      tripId,
      days: draft.map((d) => ({ dayId: d.id, activityIds: d.activities.map((a) => a.id) })),
    })
  }

  const plannedCount = itineraryDays.reduce((total, day) => total + day.activities.length, 0)
  // Cover photo: first itinerary place that has one, else a liked place.
  const heroImage =
    itineraryDays.flatMap((d) => d.activities).find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    likedDay?.activities.find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    null

  return (
    <div className="min-h-screen bg-[#F2EDE8] text-[#1a1a1a]">
      <div className="mx-auto w-full max-w-130 px-4 pb-12 pt-3 md:pt-5">
        <TripHero
          trip={trip}
          heroImage={heroImage}
          plannedCount={plannedCount}
          rename={
            isOwner
              ? {
                  isPending: renameMutation.isPending,
                  onSubmit: (title) => renameMutation.mutateAsync({ tripId, title }),
                }
              : undefined
          }
        />

        <SaveTripSection
          tripId={tripId}
          isLoggedIn={Boolean(session?.user)}
          isSaved={isFinalized && Boolean(isOwner)}
          isSaving={isSavingTrip}
          showSavedBanner={showSavedBanner}
          onSave={handleSaveTrip}
          onCloseBanner={() => setShowSavedBanner(false)}
        />

        {/* ── Voyage de groupe (Invitation / Conversion) ── */}
        <div className="mt-4">
          <GroupTripInviteCard
            tripId={tripId}
            destination={trip.destination}
            isAlreadyGroup={Boolean(trip.isGroup)}
            initialInviteCode={trip.inviteCode}
            isOwner={Boolean(isOwner)}
          />
        </div>

        {/* ── Génération ── */}
        {!isGenerated && (
          <GenerateItineraryCard
            likedDay={likedDay}
            isPending={generateMutation.isPending}
            errorMessage={
              generateMutation.isError
                ? ((generateMutation.error as { message?: string })?.message ??
                  'Erreur lors de la génération.')
                : null
            }
            onGenerate={() => generateMutation.mutate({ tripId })}
          />
        )}

        {/* ── Itinéraire ── */}
        {isGenerated && (
          <>
            <div className="mt-6 flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#888]">
                Jour par jour
              </h2>
              {!isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.2 5.2 3.6 3.6M4 20l4.2-.9L19.4 7.9a1.8 1.8 0 0 0 0-2.6l-.7-.7a1.8 1.8 0 0 0-2.6 0L4.9 15.8 4 20Z" />
                    </svg>
                    Modifier le planning
                  </button>
                  <PDFDownloadLink
                    document={<TripPdfDocument trip={trip} days={days} />}
                    fileName={`${trip.destination ?? 'voyage'}-itineraire.pdf`}
                  >
                    {({ loading }) => (
                      <button
                        type="button"
                        disabled={loading}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95 disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
                        </svg>
                        {loading ? 'Préparation…' : 'PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
              )}
            </div>

            {isEditing && (
              <p className="mt-3 rounded-2xl border border-[rgba(255,77,77,.25)] bg-[rgba(255,77,77,.08)] px-4 py-3 text-xs leading-relaxed text-[#555]">
                Réordonne, déplace ou supprime des lieux, puis enregistre. L'hébergement est commun
                à tout le séjour : utilise « Changer » hors édition pour le remplacer.
              </p>
            )}

            <div className="mt-3">
              <TripMap days={shownDays} />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {shownDays.map((day) => (
                <DayCard
                  key={day.id}
                  day={day}
                  onReplace={isEditing ? undefined : setReplacing}
                  edit={
                    draft
                      ? {
                          days: draft,
                          onMove: (activityId, offset) =>
                            setDraft((d) => d && moveWithinDay(d, day.id, activityId, offset)),
                          onMoveToDay: (activityId, targetDayId) =>
                            setDraft((d) => d && moveToDay(d, day.id, activityId, targetDayId)),
                          onRemove: (activityId) =>
                            setDraft((d) => d && removeFromDay(d, day.id, activityId)),
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            {isEditing && (
              <EditActionBar
                isPending={updatePlanningMutation.isPending}
                error={
                  updatePlanningMutation.isError
                    ? updatePlanningMutation.error.message || "Impossible d'enregistrer le planning."
                    : null
                }
                onCancel={() => setDraft(null)}
                onSave={saveDraft}
              />
            )}
          </>
        )}

        {generateMutation.isPending && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-[28px] border border-[#eee] bg-white px-8 py-10 text-center shadow-sm">
            <span className="animate-pulse text-4xl" aria-hidden>✨</span>
            <p className="text-sm font-semibold text-[#888]">
              Analyse de tes préférences et optimisation géographique…
            </p>
          </div>
        )}
      </div>

      {replacing && (
        <ReplacePlaceModal
          tripId={tripId}
          place={replacing}
          onClose={closeReplace}
          onReplaced={handleReplaced}
        />
      )}
    </div>
  )
}
