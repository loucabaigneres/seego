import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { trpc } from '@/lib/trpc';

import type { TripListItem } from '../lib/merge-trips';

/** Deletes one of the user's trips, once confirmed in the delete sheet. */
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  /** The trip the sheet asks about; `null` while it is closed. */
  const [pending, setPending] = useState<TripListItem | null>(null);
  const mutation = useMutation(
    trpc.user.deleteTrip.mutationOptions({
      onSuccess: (_data, { tripId }) => {
        setPending(null);
        queryClient.removeQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) });
        // The list and the profile's trip count.
        return queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() });
      },
    }),
  );

  return {
    pending,
    open: (trip: TripListItem) => {
      mutation.reset();
      setPending(trip);
    },
    close: () => setPending(null),
    confirm: () => pending && mutation.mutate({ tripId: pending.id }),
    isDeleting: mutation.isPending,
    deletingId: mutation.isPending ? mutation.variables?.tripId : undefined,
    failed: mutation.isError,
  };
}
