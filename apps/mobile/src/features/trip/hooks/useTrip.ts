import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { splitTripDays } from '@/domain/trip';
import { trpc, type RouterOutputs } from '@/lib/trpc';

import { useDaySelection } from './useDaySelection';

export type TripDay = RouterOutputs['discovery']['getTrip']['days'][number];
export type TripActivity = TripDay['activities'][number];

/** A trip and its days, the day on screen, and the generation of its itinerary when it has none yet. */
export function useTrip(tripId: string) {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.discovery.getTrip.queryOptions({ tripId }));

  const generation = useMutation(
    trpc.discovery.generateItinerary.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) });
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
      },
    }),
  );

  const days = splitTripDays(query.data?.days ?? []);
  const selection = useDaySelection(days.itinerary);
  const errorCode = query.error?.data?.code;

  return {
    isLoading: query.isPending,
    // BAD_REQUEST: a deep link whose id is not a uuid. Retrying would not help either way.
    notFound: errorCode === 'NOT_FOUND' || errorCode === 'BAD_REQUEST',
    loadFailed: query.isError,
    retry: () => query.refetch(),
    trip: query.data?.trip ?? null,
    days,
    selection,
    isGenerated: query.data?.isGenerated ?? false,
    generate: {
      run: () => generation.mutate({ tripId }),
      isPending: generation.isPending,
      failed: generation.isError,
    },
  };
}
