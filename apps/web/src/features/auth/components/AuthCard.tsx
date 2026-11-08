import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  error?: string | null;
  footer?: ReactNode;
  children: ReactNode;
}

/** Centered card shared by the auth pages (login, register, password reset). */
export function AuthCard({ title, subtitle, error, footer, children }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md rounded-card bg-surface p-8 border border-brand/15">
        <h1 className="text-2xl font-display font-normal text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}

        {error && (
          <div className="mt-4 rounded-xl bg-surface p-3 text-xs font-semibold text-brand border border-brand/20">
            {error}
          </div>
        )}

        {children}

        {footer && <p className="mt-6 text-center text-xs text-ink-muted">{footer}</p>}
      </div>
    </div>
  );
}
