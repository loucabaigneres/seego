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
      <div className="flex items-center justify-between gap-4 rounded-[28px] border border-[#eee] bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">Partir à plusieurs ?</h3>
          <p className="mt-0.5 text-xs text-[#888]">
            Connecte-toi pour transformer ce voyage en groupe et inviter tes amis.
          </p>
        </div>
        <Link
          to="/login"
          search={{ redirect: `/trip/${tripId}` }}
          className="shrink-0 rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-xs font-bold text-[#1a1a1a] transition hover:border-[#1a1a1a] active:scale-95"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  if (isAlreadyGroup || inviteCode) {
    return (
      <div className="rounded-[28px] border border-[#eee] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Voyage de groupe actif
            </span>
            <p className="mt-1 text-sm font-bold text-[#1a1a1a]">
              Code d'invitation (24 h) : <span className="font-mono text-[#FF4D4D]">{inviteCode}</span>
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              disabled={isRegenerating}
              onClick={() => regenerateCode({ tripId })}
              className="cursor-pointer text-[11px] font-semibold text-[#888] underline hover:text-[#1a1a1a]"
            >
              {isRegenerating ? 'Régénération…' : '↻ Nouveau code'}
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-[#888]">
          Partage ce lien avec tes amis pour qu'ils rejoignent cet itinéraire :
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 rounded-xl border border-[#ddd] bg-[#F2EDE8] px-3.5 py-2 text-xs text-[#1a1a1a] outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="cursor-pointer rounded-xl bg-[#FF4D4D] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-red-500/20 transition hover:brightness-105 active:scale-95"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[28px] border border-[#eee] bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-[#1a1a1a]">Partir à plusieurs ?</h3>
        <p className="mt-0.5 text-xs text-[#888]">
          Transforme cet itinéraire en voyage de groupe et invite tes amis.
        </p>
      </div>
      <button
        type="button"
        disabled={isCreating}
        onClick={() => createOrConvert({ tripId, destination: destination ?? undefined })}
        className="shrink-0 cursor-pointer rounded-full bg-[#1a1a1a] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black active:scale-95 disabled:opacity-50"
      >
        {isCreating ? 'Création…' : 'Inviter des amis'}
      </button>
    </div>
  )
}
