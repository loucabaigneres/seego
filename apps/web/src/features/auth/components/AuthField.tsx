import type { ReactNode } from 'react';
import { PasswordInput } from '@/components/PasswordInput';

interface AuthFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  /** Extra content under the input (e.g. a "forgot password" link). */
  hint?: ReactNode;
}

export function AuthField({ label, type, value, onChange, minLength, hint }: AuthFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-[#888] mb-1">{label}</label>
      {type === 'password' ? (
        <PasswordInput
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#ddd] p-3 rounded-xl bg-white focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 outline-none transition text-[#1a1a1a]"
        />
      )}
      {hint}
    </div>
  );
}
