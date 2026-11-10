import type { ReactNode } from 'react'

/** Full-popover confirmation panel (destructive actions). */
export function ConfirmOverlay({
  iconPath,
  title,
  message,
  confirmLabel,
  pendingLabel,
  isPending,
  onCancel,
  onConfirm,
}: {
  /** SVG path of the icon shown above the title. */
  iconPath: string
  title: string
  message: ReactNode
  confirmLabel: string
  pendingLabel: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between bg-surface p-6">
      <div className="my-auto text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-brand">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-ink">{title}</h4>
        <p className="mt-1.5 text-xs text-ink-muted">{message}</p>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-xl border border-line-strong bg-background py-2.5 text-xs font-semibold text-ink transition hover:bg-ink/5"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onConfirm}
          className="flex-1 cursor-pointer rounded-xl bg-brand py-2.5 text-xs font-bold text-accent shadow-sm shadow-brand/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </div>
  )
}
