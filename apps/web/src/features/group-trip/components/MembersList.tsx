interface Member {
  id: string
  name?: string | null
  email: string
  role: string
}

/** Participants of the active group trip; the owner can ask to remove other members. */
export function MembersList({
  members,
  isLoading,
  isOwner,
  onRequestRemove,
}: {
  members: Member[] | undefined
  isLoading: boolean
  isOwner: boolean
  onRequestRemove: (member: { id: string; name: string }) => void
}) {
  const count = members?.length ?? 1

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#888]">Participants</span>
        <span className="text-[11px] font-bold text-[#1A1A1A]">
          {count} membre{count > 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="h-8 animate-pulse rounded-xl bg-[#F2EDE8]" />
        ) : (
          members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl bg-[#F2EDE8]/60 px-3 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold uppercase text-white">
                  {member.name?.[0] || member.email[0]}
                </div>
                <span className="truncate font-medium text-[#1A1A1A]">
                  {member.name || member.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {member.role === 'owner' ? (
                  <span className="rounded-full bg-[#FF4D4D]/15 px-2 py-0.5 text-[10px] font-bold text-[#FF4D4D]">
                    Hôte
                  </span>
                ) : isOwner ? (
                  <button
                    type="button"
                    title="Retirer du groupe"
                    onClick={() =>
                      onRequestRemove({ id: member.id, name: member.name || member.email })
                    }
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#888] transition hover:bg-red-100 hover:text-[#FF4D4D]"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <span className="text-[10px] text-[#888]">Membre</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
