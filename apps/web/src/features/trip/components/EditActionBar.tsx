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
    <div className="sticky bottom-3 z-1100 mt-4 rounded-3xl border border-line bg-background/95 p-3 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.35)] backdrop-blur-md">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full border border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-ink active:scale-[0.98] disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full bg-brand px-4 py-3 text-sm font-bold text-accent shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center text-xs font-medium text-brand">{error}</p>
      )}
    </div>
  )
}
