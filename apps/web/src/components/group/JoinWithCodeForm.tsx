import type { FormEvent } from 'react'

/** Input + submit used to join a group trip with an 8-character invite code. */
export function JoinWithCodeForm({
  variant,
  value,
  onChange,
  onSubmit,
  isJoining,
  error,
}: {
  /** `full` is the empty-state layout (label, longer button); `compact` sits under the trip details. */
  variant: 'full' | 'compact'
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isJoining: boolean
  error: string | null
}) {
  const isFull = variant === 'full'

  return (
    <form onSubmit={onSubmit} className="border-t border-[#eee] pt-3">
      {isFull && (
        <label className="block text-[11px] font-semibold text-[#888] mb-1">
          Rejoindre avec un code (8 caractères)
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={8}
          placeholder={isFull ? 'Ex: aB3_9-Q1' : 'Code à 8 caractères…'}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          className={`flex-1 rounded-xl border border-[#ddd] bg-[#F2EDE8] px-3 ${isFull ? 'py-2' : 'py-1.5'} text-xs font-mono text-[#1A1A1A] outline-none focus:border-[#FF4D4D]`}
        />
        <button
          type="submit"
          disabled={isJoining}
          className={`cursor-pointer rounded-xl bg-[#1A1A1A] ${isFull ? 'px-3.5 py-2' : 'px-3 py-1.5'} text-xs font-bold text-white transition hover:bg-black disabled:opacity-50`}
        >
          {isJoining ? '…' : isFull ? 'Rejoindre' : 'OK'}
        </button>
      </div>
      {error && <p className="mt-1 text-[11px] text-[#FF4D4D]">{error}</p>}
    </form>
  )
}
