import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

/** Exact lookup of the account to promote, run only when the admin submits an e-mail. */
export function useAdminCandidate() {
  const [email, setEmail] = useState<string | null>(null);
  const query = useQuery({
    ...trpc.admin.admins.lookup.queryOptions({ email: email ?? '' }),
    enabled: email !== null,
    // Always re-read the account: its verification status may have just changed.
    staleTime: 0,
    gcTime: 0,
  });

  return { email, search: setEmail, reset: () => setEmail(null), query };
}
