import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useGroupTripMutations } from '../hooks/useGroupTripMutations'
import { authClient } from '@/lib/auth-client'

interface GroupTripInviteCardProps {
  tripId: string
  destination?: string | null
  isAlreadyGroup: boolean
  initialInviteCode?: string | null
  isOwner: boolean
}

export function GroupTripInviteCard({
  tripId,
  destination,
  isAlreadyGroup,
  initialInviteCode,
  isOwner,
}: GroupTripInviteCardProps) {
  const { data: session } = authClient.useSession()
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(initialInviteCode ?? null)

  const { createOrConvert, isCreating, regenerateCode, isRegenerating } = useGroupTripMutations({
    onCreated: (data) => setInviteCode(data.inviteCode),
    onCodeRegenerated: (data) => setInviteCode(data.inviteCode),
  })

  const inviteUrl = inviteCode ? `${window.location.origin}/join/${inviteCode}` : ''

  const handleCopy = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!session?.user && !isAlreadyGroup && !inviteCode) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-card border border-brand/15 bg-surface p-5">
        <div>
          <h3 className="text-sm font-bold text-ink">Partir à plusieurs ?</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Connecte-toi pour transformer ce voyage en groupe et inviter tes amis.
          </p>
        </div>
        <Link
          to="/login"
          search={{ redirect: `/trip/${tripId}` }}
          className="shrink-0 rounded-full border border-line-strong bg-surface px-4 py-2.5 text-xs font-bold text-ink transition hover:border-ink active:scale-95"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  if (isAlreadyGroup || inviteCode) {
    return (
      <div className="rounded-card border border-brand/15 bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success-text">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Voyage de groupe actif
            </span>
            <p className="mt-1 text-sm font-bold text-ink">
              Code d'invitation (24 h) : <span className="tabular-nums text-brand">{inviteCode}</span>
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              disabled={isRegenerating}
              onClick={() => regenerateCode({ tripId })}
              className="cursor-pointer text-[11px] font-semibold text-ink-muted underline hover:text-ink"
            >
              {isRegenerating ? 'Régénération…' : '↻ Nouveau code'}
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-ink-muted">
          Partage ce lien avec tes amis pour qu'ils rejoignent cet itinéraire :
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 rounded-xl border border-line-strong bg-background px-3 py-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="cursor-pointer rounded-xl bg-brand px-4 py-2 text-xs font-bold text-accent shadow-sm shadow-brand/20 transition hover:brightness-105 active:scale-95"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-brand/15 bg-surface p-5">
      <div>
        <h3 className="text-sm font-bold text-ink">Partir à plusieurs ?</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Transforme cet itinéraire en voyage de groupe et invite tes amis.
        </p>
      </div>
      <button
        type="button"
        disabled={isCreating}
        onClick={() => createOrConvert({ tripId, destination: destination ?? undefined })}
        className="shrink-0 cursor-pointer rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-ink-inverse transition hover:bg-ink active:scale-95 disabled:opacity-50"
      >
        {isCreating ? 'Création…' : 'Inviter des amis'}
      </button>
    </div>
  )
}
