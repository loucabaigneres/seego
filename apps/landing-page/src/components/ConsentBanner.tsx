import { acceptAnalytics, analyticsEnabled, refuseAnalytics, useConsent } from '../lib/analytics';

/** Asks once for permission to measure the audience. Accepting and refusing are equally easy. */
export function ConsentBanner() {
  const consent = useConsent();

  if (!analyticsEnabled || consent !== 'pending') return null;

  return (
    <div
      role="dialog"
      aria-label="Mesure d'audience"
      className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-line bg-white p-4 shadow-xl shadow-black/10 sm:right-auto sm:max-w-sm"
    >
      <p className="text-sm font-bold text-ink">On mesure l'audience, mais seulement si tu veux</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Seego utilise PostHog pour comprendre comment cette page est utilisée et l'améliorer.
        Rien n'est enregistré sans ton accord, et tu peux changer d'avis à tout moment.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={refuseAnalytics}
          className="h-10 cursor-pointer rounded-xl border border-line bg-white text-xs font-bold text-ink transition hover:bg-sand focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none active:scale-95"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={acceptAnalytics}
          className="h-10 cursor-pointer rounded-xl bg-accent text-xs font-bold text-white transition hover:brightness-105 focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none active:scale-95"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
