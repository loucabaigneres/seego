import { analyticsEnabled, resetConsent } from '../lib/analytics';
import { ROUTES } from '../lib/legal';

const linkClass = 'text-xs text-muted underline-offset-2 transition hover:text-ink hover:underline';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/60 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
        <a href="/#top" className="group flex items-center gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-ink">Seego</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent transition group-hover:scale-125" />
        </a>

        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p className="text-xs text-muted">© {year} Seego. Fait avec ❤ pour les voyageurs.</p>
          <nav aria-label="Informations légales" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href={ROUTES.legalNotice} className={linkClass}>
              Mentions légales
            </a>
            <a href={ROUTES.privacy} className={linkClass}>
              Confidentialité
            </a>
            {analyticsEnabled && (
              <button type="button" onClick={resetConsent} className={`cursor-pointer ${linkClass}`}>
                Gérer mes cookies
              </button>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
