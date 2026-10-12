import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { ConfirmOverlay } from './group/ConfirmOverlay'
import { InviteLinkSection } from './group/InviteLinkSection'
import { JoinWithCodeForm } from './group/JoinWithCodeForm'
import { MembersList } from './group/MembersList'
import { useGroupTripMutations } from '../hooks/useGroupTripMutations'
import { authClient } from '../lib/auth-client'
import { trpc } from '../lib/trpc'

export function GroupTripPopover() {
  const { data: session } = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [codeToJoin, setCodeToJoin] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  // États pour les confirmations
  const [showDeleteTripConfirm, setShowDeleteTripConfirm] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)

  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowDeleteTripConfirm(false)
        setMemberToRemove(null)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Liste des voyages de groupe
  const { data: trips, isLoading: isLoadingTrips } = useQuery({
    ...trpc.group.getMyGroupTrips.queryOptions(),
    enabled: isOpen && !!session?.user,
  })

  const activeTrip = trips?.find((t) => t.id === selectedTripId) ?? trips?.[0] ?? null

  // Membres
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    ...trpc.group.getGroupMembers.queryOptions({ tripId: activeTrip?.id ?? '' }),
    enabled: isOpen && !!activeTrip?.id,
  })

  const {
    createOrConvert: createGroup,
    isCreating,
    regenerateCode,
    isRegenerating,
    joinWithCode,
    isJoining,
    removeMember,
    isRemovingMember,
    deleteTrip,
    isDeletingTrip,
  } = useGroupTripMutations({
    onCreated: (data) => setSelectedTripId(data.tripId),
    onJoined: (data) => {
      setCodeToJoin('')
      setJoinError(null)
      setSelectedTripId(data.tripId)
    },
    onJoinError: setJoinError,
    onMemberRemoved: () => setMemberToRemove(null),
    onTripDeleted: () => {
      setShowDeleteTripConfirm(false)
      setSelectedTripId(null)
    },
  })

  const isOwner = activeTrip?.role === 'owner'
  const isExpired = activeTrip?.inviteCodeExpiresAt
    ? new Date(activeTrip.inviteCodeExpiresAt) < new Date()
    : false

  const inviteUrl = activeTrip?.inviteCode
    ? `${window.location.origin}/join/${activeTrip.inviteCode}`
    : ''

  const handleCopy = () => {
    if (!inviteUrl || isExpired) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeToJoin.trim()) return
    joinWithCode({ inviteCode: codeToJoin.trim() })
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
          isOpen
            ? 'border-[#FF4D4D] bg-[#FF4D4D] text-white'
            : 'border-[#ded7cb] bg-white/70 text-[#1A1A1A] hover:bg-white'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.999-3.199a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
          />
        </svg>
        <span className="hidden sm:inline">Groupes</span>
        {trips && trips.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">
            {trips.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-[#ded7cb] bg-white p-5 shadow-2xl sm:w-96 overflow-hidden">
          {/* ── Confirmation : Retrait d'un membre ── */}
          {memberToRemove && activeTrip && (
            <ConfirmOverlay
              iconPath="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              title="Retirer ce membre ?"
              message={
                <>
                  Veux-tu vraiment retirer{' '}
                  <span className="font-semibold text-[#1a1a1a]">{memberToRemove.name}</span> de ce voyage de groupe ?
                </>
              }
              confirmLabel="Retirer"
              pendingLabel="Suppression…"
              isPending={isRemovingMember}
              onCancel={() => setMemberToRemove(null)}
              onConfirm={() => removeMember({ tripId: activeTrip.id, userId: memberToRemove.id })}
            />
          )}

          {/* ── Confirmation : Suppression du voyage ── */}
          {showDeleteTripConfirm && activeTrip && (
            <ConfirmOverlay
              iconPath="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              title="Supprimer ce voyage ?"
              message="Cette action est irréversible. L'itinéraire et les accès pour tous les membres seront définitivement supprimés."
              confirmLabel="Supprimer"
              pendingLabel="Suppression…"
              isPending={isDeletingTrip}
              onCancel={() => setShowDeleteTripConfirm(false)}
              onConfirm={() => deleteTrip({ tripId: activeTrip.id })}
            />
          )}

          {isLoadingTrips ? (
            <div className="space-y-3 py-6 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#FF4D4D] border-t-transparent" />
              <p className="text-xs text-[#888]">Chargement…</p>
            </div>
          ) : !trips || trips.length === 0 ? (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <h3 className="text-sm font-black text-[#1A1A1A]">Voyages de groupe</h3>
                <p className="mt-1 text-xs text-[#777]">
                  Crée un groupe ou rejoins un voyage existant avec un code d'invitation.
                </p>
              </div>

              <button
                type="button"
                disabled={isCreating}
                onClick={() => createGroup({})}
                className="w-full cursor-pointer rounded-2xl bg-[#FF4D4D] py-3 text-xs font-bold text-white shadow-md shadow-red-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {isCreating ? 'Création en cours…' : '+ Créer un voyage de groupe'}
              </button>

              <JoinWithCodeForm
                variant="full"
                value={codeToJoin}
                onChange={setCodeToJoin}
                onSubmit={handleJoinSubmit}
                isJoining={isJoining}
                error={joinError}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {trips.length > 1 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#888] mb-1">
                    Sélectionner un voyage
                  </label>
                  <select
                    value={activeTrip?.id}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full rounded-xl border border-[#ddd] bg-[#F2EDE8] px-3 py-2 text-xs font-semibold text-[#1A1A1A] outline-none"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.destination ?? 'Destination à définir'} ({t.role === 'owner' ? 'Hôte' : 'Membre'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTrip && (
                <>
                  <div className="border-b border-[#eee] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                      {activeTrip.role === 'owner' ? '★ Hôte' : 'Membre'}
                    </span>
                    <p className="text-sm font-black text-[#1A1A1A]">
                      {activeTrip.destination ?? 'Destination à définir'}
                    </p>
                  </div>

                  <InviteLinkSection
                    inviteCode={activeTrip.inviteCode}
                    inviteUrl={inviteUrl}
                    isExpired={isExpired}
                    isOwner={isOwner}
                    copied={copied}
                    isRegenerating={isRegenerating}
                    onCopy={handleCopy}
                    onRegenerate={() => regenerateCode({ tripId: activeTrip.id })}
                  />

                  <MembersList
                    members={members}
                    isLoading={isLoadingMembers}
                    isOwner={isOwner}
                    onRequestRemove={setMemberToRemove}
                  />
                </>
              )}

              <JoinWithCodeForm
                variant="compact"
                value={codeToJoin}
                onChange={setCodeToJoin}
                onSubmit={handleJoinSubmit}
                isJoining={isJoining}
                error={joinError}
              />

              {/* Actions de bas de popover */}
              <div className="space-y-2 border-t border-[#eee] pt-2 text-center">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => createGroup({})}
                  className="cursor-pointer text-[11px] font-semibold text-[#888] transition hover:text-[#FF4D4D]"
                >
                  {isCreating ? 'Création…' : '+ Nouveau voyage de groupe'}
                </button>

                {isOwner && activeTrip && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteTripConfirm(true)}
                      className="cursor-pointer text-[10px] font-semibold text-red-500 hover:text-red-700 transition"
                    >
                      Supprimer ce voyage de groupe
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}