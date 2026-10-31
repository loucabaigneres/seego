import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TripForm } from '@/features/trip/components/TripForm'
import { useConfigureTrip } from '@/features/trip/hooks/useConfigureTrip'

export const Route = createFileRoute('/trip/configure')({
  validateSearch: z.object({
    tripId: z.uuid().optional(),
  }),
  component: TripConfigurePage,
})

function TripConfigurePage() {
  const { tripId } = Route.useSearch()
  const configure = useConfigureTrip(tripId)

  if (configure.isLoadingTrip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EDE8]">
        <p className="text-[#888]">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2EDE8] px-4 py-8">
      <TripForm
        initialDestination={configure.initialDestination}
        onSubmit={configure.submit}
        isLoading={configure.isSubmitting}
      />
    </div>
  )
}
