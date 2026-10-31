import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

interface AuthFetchOptions {
  onSuccess: () => void;
  onError: (ctx: { error: { message: string; code?: string } }) => void | Promise<void>;
}

/**
 * Shared submit flow of the auth forms: tracks loading and error state, then sends the user
 * to `redirect` (or home) once authenticated. A form can override `onSuccess` / `onError`
 * (e.g. to open the e-mail verification modal) and reuse `goNext`, `fail` and `stopLoading`.
 */
export function useAuthSubmit(redirect: string | undefined) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    if (redirect) {
      window.location.href = redirect;
    } else {
      navigate({ to: '/' });
    }
  };

  const fail = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const submit = async (
    call: (fetchOptions: AuthFetchOptions) => Promise<unknown>,
    handlers: Partial<AuthFetchOptions> = {},
  ) => {
    setLoading(true);
    setError(null);

    await call({
      onSuccess: handlers.onSuccess ?? goNext,
      onError: handlers.onError ?? ((ctx) => fail(ctx.error.message)),
    });
  };

  return {
    submit,
    goNext,
    fail,
    stopLoading: () => setLoading(false),
    setError,
    error,
    loading,
  };
}
