import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { trpc } from '@/lib/trpc';

/** A new, empty group trip: friends can be invited before the host swipes its places. */
export function useCreateGroupTrip() {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.group.createOrConvertGroupTrip.mutationOptions({
      onSuccess: ({ tripId }) => {
        void queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() });
        router.push({ pathname: '/trip/[tripId]', params: { tripId } });
      },
    }),
  );

  return {
    create: () => mutation.mutate({}),
    isCreating: mutation.isPending,
    failed: mutation.isError,
  };
}
