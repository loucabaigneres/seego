import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

/** Apple's logo, white on the black button as its guidelines require. */
function AppleLogo() {
  return (
    <svg viewBox="0 0 17 20" width="16" height="19" aria-hidden fill="currentColor">
      <path d="M14.2 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.7 4.8 2 5.8 1.1 7.4c-1.9 3.3-.5 8.1 1.3 10.8.9 1.3 1.9 2.7 3.3 2.7 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.8 1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.8-1.1-2.9-4.6zM11.6 3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

/** Where Better Auth sends the browser back: absolute, or the API resolves it against its own URL. */
const toWebURL = (path: string) => new URL(path, window.location.origin).toString();

/**
 * "Continue with Apple" (redirect flow): the browser goes to Apple, Apple posts back to the API,
 * which sets the session cookie and returns here. Signs in and signs up alike, and reaches the
 * same account as the iOS app (same Apple ID).
 */
export function AppleSignIn({ redirect }: { redirect: string | undefined }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    const errorSearch = new URLSearchParams({ error: 'apple' });
    if (redirect) errorSearch.set('redirect', redirect);

    const result = await authClient.signIn.social({
      provider: 'apple',
      callbackURL: toWebURL(redirect ?? '/'),
      errorCallbackURL: toWebURL(`/login?${errorSearch.toString()}`),
    });
    // On success the page is already leaving for Apple: keep the loading state.
    if (result.error) {
      setError('Connexion avec Apple indisponible pour le moment. Réessaie plus tard.');
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-brand/15" />
        <span className="text-xs text-ink-muted">ou</span>
        <div className="h-px flex-1 bg-brand/15" />
      </div>

      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        aria-busy={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-sm font-bold text-white hover:bg-black/85 active:scale-95 disabled:opacity-50 transition cursor-pointer"
      >
        <AppleLogo />
        {loading ? 'Redirection vers Apple…' : 'Continuer avec Apple'}
      </button>

      {error && <p className="text-center text-xs font-semibold text-brand">{error}</p>}
    </div>
  );
}
