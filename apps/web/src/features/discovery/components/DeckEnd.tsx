interface DeckEndProps {
  canShowResult: boolean
  onShowResult: () => void
  onRestart: () => void
}

/** Shown once every card of the feed has been swiped. */
export function DeckEnd({ canShowResult, onShowResult, onRestart }: DeckEndProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-card border border-brand/15 bg-surface px-8 text-center">
      <span className="text-5xl" aria-hidden>🗺️</span>
      <p className="text-lg font-bold text-ink">Tu as parcouru tous les lieux !</p>
      <p className="text-sm text-ink-muted">Découvre la destination qui te correspond, ou recommence pour affiner tes goûts.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onShowResult}
          disabled={!canShowResult}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-accent shadow-lg shadow-brand/25 transition active:scale-95 disabled:opacity-40"
        >
          Voir ma destination
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand active:scale-95"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}
