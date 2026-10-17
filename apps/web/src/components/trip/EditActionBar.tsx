export function EditActionBar({
  isPending,
  error,
  onCancel,
  onSave,
}: {
  isPending: boolean
  error: string | null
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="sticky bottom-3 z-1100 mt-4 rounded-3xl border border-[#eee] bg-white/95 p-3 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.35)] backdrop-blur-md">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full border border-[#ddd] bg-white px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition hover:border-[#1a1a1a] active:scale-[0.98] disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full bg-[#FF4D4D] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center text-xs font-medium text-[#FF4D4D]">{error}</p>
      )}
    </div>
  )
}
