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
        <label className="text-[11px] font-semibold text-[#888]">
          Lien d'invitation ({inviteCode})
        </label>
        <span className={`text-[10px] font-bold ${isExpired ? 'text-[#FF4D4D]' : 'text-emerald-600'}`}>
          {isExpired ? 'Expiré' : 'Valide 24 h'}
        </span>
      </div>

      {!isExpired ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 rounded-xl border border-[#ddd] bg-[#F2EDE8] px-3 py-2 text-xs text-[#1A1A1A] outline-none select-all"
          />
          <button
            type="button"
            onClick={onCopy}
            className="cursor-pointer rounded-xl bg-[#FF4D4D] px-3 py-2 text-xs font-bold text-white transition hover:brightness-105 active:scale-95"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 p-2 text-center text-xs text-[#FF4D4D] border border-red-100">
          Ce code a expiré.
        </div>
      )}

      {isOwner && (
        <button
          type="button"
          disabled={isRegenerating}
          onClick={onRegenerate}
          className="mt-1.5 cursor-pointer text-[10px] font-bold text-[#888] underline hover:text-[#1A1A1A]"
        >
          {isRegenerating ? 'Régénération…' : '↻ Régénérer un nouveau code'}
        </button>
      )}
    </div>
  )
}
