import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { authClient } from '../lib/auth-client';
import { trpc } from '../lib/trpc.js';
import { GUEST_ID_KEY } from './useGuestId';

/** Once logged in, moves the trips created as a guest on this device to the account. */
export function useClaimGuestTrips() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  // Avoids a second claim for the same user (StrictMode, session refetches)
  const claimedFor = useRef<string | null>(null);

  const { mutate } = useMutation(
    trpc.user.claimGuestTrips.mutationOptions({
      onSuccess: ({ claimedTripsCount }) => {
        // A new guest id will be generated if the user logs out and creates a trip again
        localStorage.removeItem(GUEST_ID_KEY);
        if (claimedTripsCount > 0) queryClient.invalidateQueries();
      },
    }),
  );

  useEffect(() => {
    if (!userId || claimedFor.current === userId) return;

    const guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) return;

    claimedFor.current = userId;
    mutate({ guestId });
  }, [userId, mutate]);
}
