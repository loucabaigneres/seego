import { forwardRef, useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { className = '', value, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  const hasText = String(value ?? '').length > 0;
  const showText = visible && hasText;

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        value={value}
        type={showText ? 'text' : 'password'}
        className={`w-full border border-[#ddd] p-3 pr-12 rounded-xl bg-white focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 outline-none transition text-[#1a1a1a] ${className}`}
      />
      {hasText && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={showText ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-[#888] hover:text-[#1a1a1a] transition cursor-pointer"
        >
          {showText ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
});
