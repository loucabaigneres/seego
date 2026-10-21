import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

/** Returns the current session and sends signed-out visitors to the login page. */
export function useRequireSession() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({ to: '/login' });
    }
  }, [session, isPending, navigate]);

  return { session, isPending };
}
