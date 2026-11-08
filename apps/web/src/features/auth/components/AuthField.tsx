import type { ReactNode } from 'react';
import { FIELD_CLASS } from '@/components/formStyles';
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
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
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
          className={FIELD_CLASS}
        />
      )}
      {hint}
    </div>
  );
}
