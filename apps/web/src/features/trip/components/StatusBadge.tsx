export function StatusBadge({ status }: { status: string | null }) {
  const dots: Record<string, string> = {
    draft:     'bg-white/70',
    finalized: 'bg-[#2ecc71]',
    archived:  'bg-[#FF4D4D]',
  }
  const labels: Record<string, string> = { draft: 'Brouillon', finalized: 'Finalisé', archived: 'Archivé' }
  const s = status ?? 'draft'
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
      <span className={`h-1.5 w-1.5 rounded-full ${dots[s] ?? dots['draft']}`} aria-hidden />
      {labels[s] ?? s}
    </span>
  )
}
