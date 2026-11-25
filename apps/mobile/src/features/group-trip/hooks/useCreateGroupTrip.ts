import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { trpc } from '@/lib/trpc';

/**
 * Starts a group trip: a new one (name, optional destination), or one of the user's solo trips
 * opened to friends. Then opens it, replacing the creation screen.
 */
export function useCreateGroupTrip() {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.group.createOrConvertGroupTrip.mutationOptions({
      onSuccess: ({ tripId }) => {
        void queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() });
        void queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        router.replace({ pathname: '/trip/[tripId]', params: { tripId } });
      },
    }),
  );

  return {
    create: (input: { title: string; destination?: string }) =>
      mutation.mutate({
        title: input.title.trim(),
        destination: input.destination?.trim() || undefined,
      }),
    convert: (tripId: string) => mutation.mutate({ tripId }),
    isCreating: mutation.isPending,
    failed: mutation.isError,
  };
}

/** The user's trips that are not group trips yet: the ones "Un voyage existant" can open. */
export function useSoloTrips() {
  const owned = useQuery(trpc.user.getTrips.queryOptions());
  const groups = useQuery(trpc.group.getMyGroupTrips.queryOptions());
  const groupIds = new Set((groups.data ?? []).map((trip) => trip.id));

  return {
    trips: (owned.data ?? []).filter((trip) => !groupIds.has(trip.id)),
    isLoading: owned.isPending || groups.isPending,
    hasFailed: owned.isError || groups.isError,
    retry: () => Promise.all([owned.refetch(), groups.refetch()]),
  };
}
