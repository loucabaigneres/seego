interface DeckEndProps {
  canShowResult: boolean
  onShowResult: () => void
  onRestart: () => void
}

/** Shown once every card of the feed has been swiped. */
export function DeckEnd({ canShowResult, onShowResult, onRestart }: DeckEndProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[28px] border border-[#eee] bg-white px-8 text-center shadow-sm">
      <span className="text-5xl" aria-hidden>🗺️</span>
      <p className="text-lg font-bold text-[#1a1a1a]">Tu as parcouru tous les lieux !</p>
      <p className="text-sm text-[#888]">Découvre la destination qui te correspond, ou recommence pour affiner tes goûts.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onShowResult}
          disabled={!canShowResult}
          className="rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition active:scale-95 disabled:opacity-40"
        >
          Voir ma destination
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-[#ddd] bg-white px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] active:scale-95"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}
