import { useState } from 'react'
import { PinIcon } from './PinIcon'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../lib/tripUtils'
import type { Trip } from '../types'

const TITLE_MAX_LENGTH = 80

/** Title editing, only provided when the viewer owns the trip. */
type RenameControls = {
  isPending: boolean
  /** Resolves once the new title is saved; rejects on failure. */
  onSubmit: (title: string) => Promise<unknown>
}

export function TripHero({
  trip,
  heroImage,
  plannedCount,
  rename,
}: {
  trip: Trip
  heroImage: string | null
  plannedCount: number
  rename?: RenameControls
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)

  const startEditingTitle = () => {
    setTitleDraft(trip.title ?? '')
    setTitleError(null)
    setIsEditingTitle(true)
  }

  const submitTitle = () => {
    const title = titleDraft.trim()
    if (!rename || !title) return
    if (title === trip.title) {
      setIsEditingTitle(false)
      return
    }
    rename
      .onSubmit(title)
      .then(() => setIsEditingTitle(false))
      .catch((err: { message?: string }) =>
        setTitleError(err.message || "Impossible d'enregistrer le titre."),
      )
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-ink shadow-[0_24px_50px_-24px_rgba(26,26,26,0.55)]">
      <div className="relative h-65 w-full">
        {heroImage ? (
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-inverse/15">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75 3.75 9v10.5L9 17.25m0-10.5 6 2.5m-6-2.5v10.5m6-8 5.25-2.25V15L15 17.25m0-10.5v10.5m0 0-6-2.5" />
            </svg>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-ink/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-ink/85 via-ink/40 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-ink/55 px-3.5 text-xs font-semibold text-ink-inverse backdrop-blur-md transition hover:bg-ink/70 active:scale-95"
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
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink-inverse/85">
              <PinIcon className="h-4 w-4 shrink-0 text-brand" />
              <span className="truncate">{trip.destination}</span>
            </p>
          )}
          {rename && isEditingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitTitle()
              }}
              className="mt-1 flex items-center gap-2"
            >
              <input
                autoFocus
                value={titleDraft}
                maxLength={TITLE_MAX_LENGTH}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditingTitle(false)
                }}
                aria-label="Titre du voyage"
                className="min-w-0 flex-1 rounded-xl border border-background/30 bg-ink/55 px-3 py-1.5 text-[22px] font-bold leading-[1.15] text-ink-inverse outline-none backdrop-blur-md focus:border-background/70"
              />
              <button
                type="submit"
                disabled={rename.isPending || !titleDraft.trim()}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full bg-brand px-3.5 text-xs font-semibold text-accent transition hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {rename.isPending ? '…' : 'OK'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full bg-ink/55 px-3.5 text-xs font-semibold text-ink-inverse backdrop-blur-md transition hover:bg-ink/70 active:scale-95"
              >
                Annuler
              </button>
            </form>
          ) : (
            <div className="mt-1 flex items-start gap-2">
              <h1 className="line-clamp-2 text-[28px] font-display font-normal leading-[1.15] text-ink-inverse">
                {trip.title ?? 'Mon voyage'}
              </h1>
              {rename && (
                <button
                  type="button"
                  onClick={startEditingTitle}
                  aria-label="Modifier le titre"
                  className="mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink/55 text-ink-inverse backdrop-blur-md transition hover:bg-ink/70 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.2 5.2 3.6 3.6M4 20l4.2-.9L19.4 7.9a1.8 1.8 0 0 0 0-2.6l-.7-.7a1.8 1.8 0 0 0-2.6 0L4.9 15.8 4 20Z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {titleError && isEditingTitle && (
            <p className="mt-1.5 text-xs font-medium text-brand">{titleError}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {trip.startDate && (
              <span className="rounded-full bg-ink/55 px-2.5 py-1 text-xs font-medium text-ink-inverse backdrop-blur-md">
                {formatDate(trip.startDate)}
              </span>
            )}
            {trip.durationDays ? (
              <span className="rounded-full bg-ink/55 px-2.5 py-1 text-xs font-medium text-ink-inverse backdrop-blur-md">
                {trip.durationDays} jour{trip.durationDays > 1 ? 's' : ''}
              </span>
            ) : null}
            {plannedCount > 0 && (
              <span className="rounded-full bg-ink/55 px-2.5 py-1 text-xs font-medium text-ink-inverse backdrop-blur-md">
                {plannedCount} étape{plannedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
