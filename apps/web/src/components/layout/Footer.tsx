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
        <p className="text-xs text-ink-muted">© {year} Seego. Fait pour les voyageurs.</p>
      </div>
    </footer>
  );
}
