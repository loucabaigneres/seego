export function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-[#eee] bg-white px-8 text-center">
      <span className="text-4xl" aria-hidden>📡</span>
      <p className="text-sm font-semibold text-[#1a1a1a]">Impossible de charger les lieux.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-[#ddd] bg-white px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] active:scale-95"
      >
        Réessayer
      </button>
    </div>
  )
}
