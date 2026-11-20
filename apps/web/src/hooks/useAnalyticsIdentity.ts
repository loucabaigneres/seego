import { identifyUser, useConsent } from '@/lib/analytics';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

/** Ties analytics to the signed-in account (the guest history before sign-in is merged in). */
export function useAnalyticsIdentity() {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const createdAt = session?.user.createdAt;
  // Re-runs once the visitor accepts tracking: identify is ignored while opted out.
  const consent = useConsent();

  useEffect(() => {
    if (!userId || consent !== 'granted') return;
    identifyUser(userId, {
      created_at: createdAt ? new Date(createdAt).toISOString() : undefined,
    });
  }, [userId, createdAt, consent]);
}
