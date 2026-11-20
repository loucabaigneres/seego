import type { SelectHTMLAttributes } from 'react';
import { FIELD_CLASS } from './formStyles';

/** Select in the form style, with a vino chevron instead of the browser's arrow. */
export function SelectField({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${FIELD_CLASS} cursor-pointer appearance-none pr-10 ${className}`}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
