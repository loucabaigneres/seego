import type { Day } from '../types'
import { categoryMeta } from '../lib/tripUtils'

export function GenerateItineraryCard({
  likedDay,
  isPending,
  errorMessage,
  onGenerate,
}: {
  likedDay: Day | undefined
  isPending: boolean
  errorMessage: string | null
  onGenerate: () => void
}) {
  return (
    <div className="mt-5 rounded-card border border-brand/15 bg-surface p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Ton planning</h2>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-secondary">
        Organise tes lieux likés en un planning cohérent jour par jour.
      </p>

      {likedDay && likedDay.activities.length > 0 && (
        <>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-ink-muted">
            {likedDay.activities.length} lieu{likedDay.activities.length > 1 ? 'x' : ''} liké{likedDay.activities.length > 1 ? 's' : ''}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {likedDay.activities.map((act) => (
              <span
                key={act.id}
                className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink"
              >
                <span aria-hidden>{categoryMeta(act.category).emoji}</span> {act.title}
              </span>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => onGenerate()}
        disabled={isPending}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-bold text-ink shadow-lg shadow-cta/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinejoin="round" d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </svg>
        {isPending ? 'Génération en cours…' : 'Générer mon itinéraire'}
      </button>

      {errorMessage && (
        <p className="mt-2.5 text-center text-xs font-medium text-brand">{errorMessage}</p>
      )}
    </div>
  )
}
