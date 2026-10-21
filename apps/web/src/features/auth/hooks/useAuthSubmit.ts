import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

interface AuthFetchOptions {
  onSuccess: () => void;
  onError: (ctx: { error: { message: string } }) => void;
}

/**
 * Shared submit flow of the login/register forms: tracks loading and error state,
 * then sends the user to `redirect` (or home) once authenticated.
 */
export function useAuthSubmit(redirect: string | undefined) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (call: (fetchOptions: AuthFetchOptions) => Promise<unknown>) => {
    setLoading(true);
    setError(null);

    await call({
      onSuccess: () => {
        if (redirect) {
          window.location.href = redirect;
        } else {
          navigate({ to: '/' });
        }
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setLoading(false);
      },
    });
  };

  return { submit, error, loading };
}
