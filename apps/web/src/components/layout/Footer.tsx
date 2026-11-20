import { analyticsEnabled, resetConsent } from '@/lib/analytics';
import { Link } from '@tanstack/react-router';

/** Site footer. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-ink">Seego</span>
          <span className="h-1.5 w-1.5 rounded-full bg-cta transition group-hover:scale-125" />
        </Link>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p className="text-xs text-ink-muted">© {year} Seego. Fait pour les voyageurs.</p>
          {analyticsEnabled && (
            <button
              type="button"
              onClick={resetConsent}
              className="cursor-pointer text-xs text-ink-muted underline-offset-2 transition hover:text-ink hover:underline"
            >
              Gérer mes cookies
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
