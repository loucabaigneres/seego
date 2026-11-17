import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { trpc } from '@/lib/trpc';

/** Adds the places of one inspiration to a trip the user picks (the most recent by default). */
export function useAddToTrip(inspirationId: string | null) {
  const queryClient = useQueryClient();
  const trips = useQuery({ ...trpc.user.getTrips.queryOptions(), enabled: !!inspirationId });
  const [pickedTripId, setPickedTripId] = useState<string | null>(null);
  const tripId = pickedTripId ?? trips.data?.[0]?.id ?? null;

  const mutation = useMutation(
    trpc.inspiration.addToTrip.mutationOptions({
      onSuccess: (data) =>
        queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId: data.tripId }),
        }),
    }),
  );

  return {
    trips: trips.data ?? [],
    isLoading: !!inspirationId && trips.isPending,
    hasFailed: trips.isError,
    retry: () => trips.refetch(),
    tripId,
    pickTrip: setPickedTripId,
    add: () => {
      if (inspirationId && tripId) mutation.mutate({ tripId, inspirationIds: [inspirationId] });
    },
    isAdding: mutation.isPending,
    addFailed: mutation.isError,
    added: mutation.data ? { tripId: mutation.data.tripId, count: mutation.data.added } : null,
    reset: () => {
      mutation.reset();
      setPickedTripId(null);
    },
  };
}
