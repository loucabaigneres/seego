import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TripForm } from '@/features/trip/components/TripForm'
import { useConfigureTrip } from '@/features/trip/hooks/useConfigureTrip'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/trip/configure')({
  head: () => seo({ title: 'Configurer mon voyage', path: '/trip/configure' }),
  validateSearch: z.object({
    tripId: z.uuid().optional(),
    /** Step to open the form on (used when coming back from the trip page). */
    step: z.number().int().min(1).max(3).optional(),
  }),
  component: TripConfigurePage,
})

function TripConfigurePage() {
  const { tripId, step } = Route.useSearch()
  const configure = useConfigureTrip(tripId)

  if (configure.isLoadingTrip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-ink-muted">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <TripForm
        initialValues={configure.initialValues}
        initialStep={step}
        onSubmit={configure.submit}
        isLoading={configure.isSubmitting}
      />
    </div>
  )
}
