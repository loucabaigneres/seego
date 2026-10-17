import { PinIcon } from './PinIcon'
import { StatusBadge } from './StatusBadge'
import { formatDate } from './tripUtils'
import type { Trip } from './types'

export function TripHero({
  trip,
  heroImage,
  plannedCount,
}: {
  trip: Trip
  heroImage: string | null
  plannedCount: number
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#1a1a1a] shadow-[0_24px_50px_-24px_rgba(26,26,26,0.55)]">
      <div className="relative h-65 w-full">
        {heroImage ? (
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75 3.75 9v10.5L9 17.25m0-10.5 6 2.5m-6-2.5v10.5m6-8 5.25-2.25V15L15 17.25m0-10.5v10.5m0 0-6-2.5" />
            </svg>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-black/35 px-3.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <StatusBadge status={trip.status} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          {trip.destination && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-white/85">
              <PinIcon className="h-4 w-4 shrink-0 text-[#FF4D4D]" />
              <span className="truncate">{trip.destination}</span>
            </p>
          )}
          <h1 className="mt-1 line-clamp-2 text-[28px] font-bold leading-[1.15] text-white">
            {trip.title ?? 'Mon voyage'}
          </h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {trip.startDate && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                {formatDate(trip.startDate)}
              </span>
            )}
            {trip.durationDays ? (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                {trip.durationDays} jour{trip.durationDays > 1 ? 's' : ''}
              </span>
            ) : null}
            {plannedCount > 0 && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                {plannedCount} étape{plannedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
