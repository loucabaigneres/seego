interface SwipeActionsProps {
  disabled: boolean
  /** 0..1 — how far the card is dragged towards skip / like, to grow the matching button. */
  skipStamp: number
  likeStamp: number
  onSkip: () => void
  onDetails: () => void
  onLike: () => void
}

export function SwipeActions({ disabled, skipStamp, likeStamp, onSkip, onDetails, onLike }: SwipeActionsProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-5 pt-5">
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          aria-label="Passer"
          title="Passer (←)"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ddd] bg-white text-[#888] shadow-md transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-90 disabled:opacity-40"
          style={{ transform: `scale(${1 + skipStamp * 0.12})` }}
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onDetails}
          disabled={disabled}
          aria-label="Voir les détails"
          title="Voir les détails"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ddd] bg-white text-[#1a1a1a] shadow-sm transition hover:border-[#1a1a1a] active:scale-90 disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onLike}
          disabled={disabled}
          aria-label="J'adore"
          title="J'adore (→)"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4D4D] text-white shadow-lg shadow-red-500/30 transition hover:brightness-105 active:scale-90 disabled:opacity-40"
          style={{ transform: `scale(${1 + likeStamp * 0.12})` }}
        >
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
      <p className="mt-3 hidden text-center text-xs text-[#888] md:block">
        ← Passer · → J'adore · Espace : ma destination
      </p>
    </>
  )
}
