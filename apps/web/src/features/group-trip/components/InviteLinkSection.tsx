/** Invite link of the active group trip, with copy and (owner only) regenerate actions. */
export function InviteLinkSection({
  inviteCode,
  inviteUrl,
  isExpired,
  isOwner,
  copied,
  isRegenerating,
  onCopy,
  onRegenerate,
}: {
  inviteCode: string | null
  inviteUrl: string
  isExpired: boolean
  isOwner: boolean
  copied: boolean
  isRegenerating: boolean
  onCopy: () => void
  onRegenerate: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-semibold text-ink-muted">
          Lien d'invitation ({inviteCode})
        </label>
        <span className={`text-[10px] font-bold ${isExpired ? 'text-brand' : 'text-success-text'}`}>
          {isExpired ? 'Expiré' : 'Valide 24 h'}
        </span>
      </div>

      {!isExpired ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 rounded-xl border border-line-strong bg-background px-3 py-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 select-all"
          />
          <button
            type="button"
            onClick={onCopy}
            className="cursor-pointer rounded-xl bg-brand px-3 py-2 text-xs font-bold text-accent transition hover:brightness-105 active:scale-95"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-surface p-2 text-center text-xs text-brand border border-brand/20">
          Ce code a expiré.
        </div>
      )}

      {isOwner && (
        <button
          type="button"
          disabled={isRegenerating}
          onClick={onRegenerate}
          className="mt-1.5 cursor-pointer text-[10px] font-bold text-ink-muted underline hover:text-ink"
        >
          {isRegenerating ? 'Régénération…' : '↻ Régénérer un nouveau code'}
        </button>
      )}
    </div>
  )
}
