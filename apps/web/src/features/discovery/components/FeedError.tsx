export function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-card border border-brand/15 bg-surface px-8 text-center">
      <span className="text-4xl" aria-hidden>📡</span>
      <p className="text-sm font-semibold text-ink">Impossible de charger les lieux.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-line-strong bg-surface px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-brand active:scale-95"
      >
        Réessayer
      </button>
    </div>
  )
}
