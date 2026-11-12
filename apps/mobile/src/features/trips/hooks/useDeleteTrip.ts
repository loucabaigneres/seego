import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc';
import { confirmDestructive } from '@/ui/confirm';

/** Deletes one of the user's trips, after a confirmation. */
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.user.deleteTrip.mutationOptions({
      onSuccess: (_data, { tripId }) => {
        queryClient.removeQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) });
        // The list and the profile's trip count.
        return queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() });
      },
    }),
  );

  return {
    remove: (tripId: string, title: string) =>
      confirmDestructive({
        title: 'Supprimer ce voyage ?',
        message: `« ${title} » et son itinéraire disparaîtront de ton compte.`,
        confirmLabel: 'Supprimer',
        onConfirm: () => mutation.mutate({ tripId }),
      }),
    deletingId: mutation.isPending ? mutation.variables?.tripId : undefined,
    failed: mutation.isError,
  };
}
