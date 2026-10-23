interface AuthFieldProps {
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
}

export function AuthField({ label, type, value, onChange }: AuthFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-[#888] mb-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#ddd] p-3 rounded-xl bg-white focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 outline-none transition text-[#1a1a1a]"
      />
    </div>
  )
}
