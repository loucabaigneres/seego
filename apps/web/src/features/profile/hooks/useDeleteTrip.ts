import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

/** Deletes one of the user's trips and refreshes the trips list and profile stats. */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.user.deleteTrip.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.user.getTrips.queryFilter());
        queryClient.invalidateQueries(trpc.user.getProfile.queryFilter());
        queryClient.invalidateQueries({ queryKey: trpc.group.getMyGroupTrips.queryKey() });
      },
    }),
  );

  return {
    deleteTrip: (tripId: string, options?: { onSuccess?: () => void }) =>
      mutation.mutate({ tripId }, options),
    deletingTripId: mutation.isPending ? mutation.variables?.tripId : undefined,
    error: mutation.error?.message,
  };
}
